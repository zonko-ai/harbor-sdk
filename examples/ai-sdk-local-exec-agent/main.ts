import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { createHarbor } from "@hrbr/sdk/local"
import { z } from "zod"

const codeResultSchema = z.object({ code: z.string() })
const summaryResultSchema = z.object({ answer: z.string() })

function promptFromArgv(argv: readonly string[]): string {
  const prompt = argv.join(" ").trim()
  return prompt || "Get latest Linear issues from Harbor Alpha and latest relevant Notion docs/pages, then summarize current project status."
}

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const entries: Record<string, string> = {}
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const index = trimmed.indexOf("=")
    if (index === -1) continue
    const key = trimmed.slice(0, index).trim()
    const raw = trimmed.slice(index + 1).trim()
    entries[key] = raw.replace(/^(["'])(.*)\1$/, "$2")
  }
  return entries
}

function defaultSharedProjectRoot(): string | undefined {
  const candidate = resolve(process.cwd(), "../flue-local-exec-agent")
  return existsSync(candidate) ? candidate : undefined
}

function envFromProcess(): Record<string, string | undefined> {
  const sharedProjectRoot = defaultSharedProjectRoot()
  const env = {
    ...(sharedProjectRoot ? parseEnvFile(resolve(sharedProjectRoot, ".env")) : {}),
    ...parseEnvFile(resolve(process.cwd(), ".env")),
    ...(process.env as Record<string, string | undefined>),
  }
  if (!env.HARBOR_LOCAL_PROJECT_ROOT && !env.HARBOR_PROJECT_ROOT && sharedProjectRoot && existsSync(resolve(sharedProjectRoot, ".harbor"))) {
    env.HARBOR_LOCAL_PROJECT_ROOT = sharedProjectRoot
  }
  return env
}

function projectRootFrom(env: Record<string, string | undefined>, fallback: string): string {
  const configured = env.HARBOR_LOCAL_PROJECT_ROOT ?? env.HARBOR_PROJECT_ROOT
  return configured ? resolve(fallback, configured) : fallback
}

function anthropicModelFrom(env: Record<string, string | undefined>) {
  const provider = env.ANTHROPIC_API_KEY
    ? createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
    : createAnthropic()
  return provider(env.AI_SDK_ANTHROPIC_MODEL ?? env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6")
}

function requireLocalCredentialKey(env: Record<string, string | undefined>): void {
  if (env.HARBOR_LOCAL_CREDENTIAL_KEY?.trim()) return
  throw new Error([
    "HARBOR_LOCAL_CREDENTIAL_KEY is required before installing or connecting MCP sources.",
    "Create examples/ai-sdk-local-exec-agent/.env, export it in your shell, or reuse the authenticated Flue example with:",
    "HARBOR_LOCAL_PROJECT_ROOT=../flue-local-exec-agent",
  ].join("\n"))
}

function mcpSourcesFrom(env: Record<string, string | undefined>) {
  const linearEndpoint = env.HARBOR_LINEAR_MCP_ENDPOINT ?? "https://mcp.linear.app/mcp"
  const notionEndpoint = env.HARBOR_NOTION_MCP_ENDPOINT ?? "https://mcp.notion.com/mcp"
  return [
    {
      endpoint: linearEndpoint,
      ...(env.HARBOR_LINEAR_MCP_ENDPOINT ? { name: "Linear MCP", namespace: "linear-mcp", auth: "none" as const } : {}),
    },
    {
      endpoint: notionEndpoint,
      ...(env.HARBOR_NOTION_MCP_ENDPOINT ? { name: "Notion MCP", namespace: "notion-mcp", auth: "none" as const } : {}),
    },
  ]
}

function namespaceVar(namespace: string): string {
  return namespace
    .split(/[^A-Za-z0-9_$]+/g)
    .filter(Boolean)
    .map((part, index) => index === 0
      ? part
      : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("")
}

function toolMethodName(toolName: string): string {
  return toolName
    .split(/[^A-Za-z0-9_$]+|_/g)
    .filter(Boolean)
    .map((part, index) => index === 0
      ? part
      : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("")
}

function toolCallGuideFrom(setup: Awaited<ReturnType<ReturnType<typeof createHarbor>["sources"]["ensureMcpSources"]>>) {
  return setup.sources.flatMap((source) =>
    source.refresh?.tools.map((tool) => ({
      namespace: source.source.namespace,
      global: namespaceVar(source.source.namespace),
      toolName: tool.toolName,
      method: toolMethodName(tool.toolName),
      call: `${namespaceVar(source.source.namespace)}.${toolMethodName(tool.toolName)}(input)`,
      description: tool.description ?? null,
      inputSchema: tool.inputSchema ?? null,
    })) ?? []
  )
}

function codePrompt(prompt: string, bindings: unknown, tools: unknown): string {
  return [
    "Write Harbor local exec JavaScript code only.",
    "Use installed namespace globals such as linearMcp and notionMcp directly with the exact methods listed below.",
    "Use top-level await and a top-level return statement; do not wrap the whole program in an async IIFE.",
    "Do not import modules, fetch URLs, read env, handle OAuth, or create/update/delete records.",
    "Read recent Linear project state and relevant Notion context, then return the raw MCP tool outputs plus a short metadata object.",
    "Do not over-normalize MCP results. Preserve fields such as structuredContent, content, results, issues, and pages so the next LLM step can interpret them.",
    `Available bindings: ${JSON.stringify(bindings, null, 2)}`,
    `Available tool calls: ${JSON.stringify(tools, null, 2)}`,
    `User request: ${prompt}`,
  ].join("\n")
}

export async function runAiSdkLocalExecAgent(input: {
  readonly prompt?: string | undefined
  readonly projectRoot?: string | undefined
  readonly env?: Record<string, string | undefined> | undefined
} = {}) {
  const prompt = input.prompt ?? promptFromArgv(process.argv.slice(2))
  const runtimeEnv = input.env ?? envFromProcess()
  requireLocalCredentialKey(runtimeEnv)
  const allowLocalNetwork = Boolean(runtimeEnv.HARBOR_LINEAR_MCP_ENDPOINT || runtimeEnv.HARBOR_NOTION_MCP_ENDPOINT)
  const harbor = createHarbor({ projectRoot: input.projectRoot ?? projectRootFrom(runtimeEnv, process.cwd()), env: runtimeEnv, allowLocalNetwork })
  const setup = await harbor.sources.ensureMcpSources({
    sources: mcpSourcesFrom(runtimeEnv),
    connect: true,
    refresh: true,
    onStatus: (event) => console.log(`[harbor] ${event.message}`),
    onAuthorizationUrl: ({ sourceId, authorizationUrl }) => console.log(`Open this URL to connect ${sourceId}:\n${authorizationUrl}\n`),
  })
  if (!setup.ready) return { answer: `Sources are not ready: ${JSON.stringify(setup.sources)}` }

  const model = anthropicModelFrom(runtimeEnv)
  const bindings = await harbor.exec.bindings()
  const toolCallGuide = toolCallGuideFrom(setup)
  const { object: generated } = await generateObject({
    model,
    schema: codeResultSchema,
    prompt: codePrompt(prompt, bindings, toolCallGuide),
  })
  console.log(["[harbor] Generated local exec code:", generated.code].join("\n"))
  const data = await harbor.exec.run(generated.code, { timeoutMs: 120_000 })
  if (!data.ok) return { answer: `Local exec failed: ${data.error?.message ?? "unknown error"}`, exec: data }
  const { object: summary } = await generateObject({
    model,
    schema: summaryResultSchema,
    prompt: [
      "Summarize the Harbor Alpha project status from this read-only Linear and Notion data.",
      "Include active work, context, risks, and next actions. Do not claim any writes were made.",
      `User request: ${prompt}`,
      `Exec result: ${JSON.stringify(data.value, null, 2)}`,
    ].join("\n"),
  })
  return { answer: summary.answer, exec: data }
}

if (import.meta.main) {
  const result = await runAiSdkLocalExecAgent()
  console.log(JSON.stringify(result, null, 2))
}
