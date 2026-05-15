import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { createAnthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import {
  createHarbor,
  harborLocalRegistryActionFromAgentStep,
} from "@hrbr/sdk/local"
import { z } from "zod"

const mcpSources = [
  { endpoint: "https://mcp.linear.app/mcp" },
  { endpoint: "https://mcp.notion.com/mcp" },
] as const

const registryStepSchema = z.object({
  action: z.enum(["search", "schema", "invoke", "final"]),
  query: z.string().optional(),
  namespace: z.string().optional(),
  limit: z.number().optional(),
  toolId: z.string().optional(),
  input: z.string().optional(),
  answer: z.string().optional(),
  selectedToolId: z.string().nullable().optional(),
  localRegistryCall: z.string().optional(),
})

const finalResultSchema = z.object({
  answer: z.string(),
  selectedToolId: z.string().nullable(),
  localRegistryCall: z.string(),
})

function promptFromArgv(argv: readonly string[]): string {
  const prompt = argv.join(" ").trim()
  return prompt || "Find my Linear issues or search Notion using the local Harbor tool registry."
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
  const candidate = resolve(process.cwd(), "../flue-tool-registry-agent")
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
    "Create examples/ai-sdk-tool-registry-agent/.env, export it in your shell, or reuse the authenticated Flue example with:",
    "HARBOR_LOCAL_PROJECT_ROOT=../flue-tool-registry-agent",
  ].join("\n"))
}

function systemPrompt(prompt: string, confirmWrites: boolean, observations: readonly unknown[]): string {
  return [
    "Drive the Harbor local MCP registry. Choose exactly one action: search, schema, invoke, or final.",
    "Use search before unknown tools, schema before non-trivial invoke inputs, and treat MCP outputs as opaque observations.",
    "When invoking a tool, put the JSON input object in the input field as a JSON string.",
    "When returning final, put any supporting observation details in localRegistryCall as a JSON string.",
    "If source setup reports a missing, pending, or failed MCP source, explain that status instead of inventing tool results.",
    `Write confirmation is ${confirmWrites ? "enabled" : "disabled"}. Do not invent missing Linear or Notion data.`,
    `User request: ${prompt}`,
    `Observations: ${JSON.stringify(observations, null, 2)}`,
  ].join("\n")
}

export async function runAiSdkToolRegistryAgent(input: {
  readonly prompt?: string | undefined
  readonly projectRoot?: string | undefined
  readonly env?: Record<string, string | undefined> | undefined
} = {}) {
  const prompt = input.prompt ?? promptFromArgv(process.argv.slice(2))
  const registryEnv = input.env ?? envFromProcess()
  requireLocalCredentialKey(registryEnv)
  const confirmWrites = registryEnv.HARBOR_CONFIRM_NOTION_WRITE === "1"
  const observations: unknown[] = []
  const harbor = createHarbor({ projectRoot: input.projectRoot ?? projectRootFrom(registryEnv, process.cwd()), env: registryEnv })
  const sourceSetup = await harbor.sources.ensureMcpSources({
    sources: mcpSources,
    connect: true,
    refresh: true,
    onStatus: (event) => console.log(`[harbor] ${event.message}`),
    onAuthorizationUrl: ({ sourceId, authorizationUrl }) => {
      console.log(`Open this URL to connect ${sourceId}:\n${authorizationUrl}\n`)
    },
  })
  console.log(`[harbor] Source setup complete: ${sourceSetup.ready ? "ready" : "not ready"}`)
  const sourceProbes = sourceSetup.ready
    ? await Promise.all(sourceSetup.sources.map((source) => harbor.sources.probeMcp(source.source.id)))
    : []
  observations.push({ kind: "mcp_source_setup", result: sourceSetup, probes: sourceProbes })

  const model = anthropicModelFrom(registryEnv)
  for (let step = 0; step < 12; step++) {
    const { object: next } = await generateObject({
      model,
      schema: registryStepSchema,
      prompt: systemPrompt(prompt, confirmWrites, observations),
    })
    if (next.action === "final") return {
      answer: next.answer ?? "Completed.",
      selectedToolId: next.selectedToolId ?? null,
      localRegistryCall: next.localRegistryCall ?? JSON.stringify(observations, null, 2),
    }
    try {
      const result = await harbor.tools.runAction(harborLocalRegistryActionFromAgentStep(next), { confirmWrites })
      observations.push({ step: step + 1, request: next, result })
    } catch (error) {
      observations.push({ step: step + 1, request: next, error: error instanceof Error ? error.message : String(error) })
    }
  }

  return (await generateObject({
    model,
    schema: finalResultSchema,
    prompt: `Return a final answer from these observations:\n${JSON.stringify(observations, null, 2)}`,
  })).object
}

if (import.meta.main) {
  const result = await runAiSdkToolRegistryAgent()
  console.log(JSON.stringify(result, null, 2))
}
