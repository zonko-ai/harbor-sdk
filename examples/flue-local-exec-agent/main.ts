import type { FlueContext } from "@flue/runtime"
import { createHarbor } from "@hrbr/sdk/local"
import * as v from "valibot"

export const triggers = { webhook: true }

const codeResult = v.object({ code: v.string() })
const summaryResult = v.object({ answer: v.string() })

function promptFrom(payload: unknown): string {
  return payload && typeof payload === "object" && typeof (payload as { prompt?: unknown }).prompt === "string"
    ? String((payload as { prompt: string }).prompt)
    : "Get latest Linear issues from Harbor Alpha and latest relevant Notion docs/pages, then summarize current project status."
}

function envFrom(env: unknown): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(env && typeof env === "object" ? env : {})
    .filter((entry): entry is [string, string] => typeof entry[1] === "string"))
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

export default async function ({ init, payload, env }: FlueContext) {
  const prompt = promptFrom(payload)
  const runtimeEnv = envFrom(env)
  const allowLocalNetwork = Boolean(runtimeEnv.HARBOR_LINEAR_MCP_ENDPOINT || runtimeEnv.HARBOR_NOTION_MCP_ENDPOINT)
  const harbor = createHarbor({ projectRoot: process.cwd(), env: runtimeEnv, allowLocalNetwork })
  const setup = await harbor.sources.ensureMcpSources({
    sources: mcpSourcesFrom(runtimeEnv),
    connect: true,
    refresh: true,
    onStatus: (event) => console.log(`[harbor] ${event.message}`),
    onAuthorizationUrl: ({ sourceId, authorizationUrl }) => console.log(`Open this URL to connect ${sourceId}:\n${authorizationUrl}\n`),
  })
  if (!setup.ready) return { answer: `Sources are not ready: ${JSON.stringify(setup.sources)}` }

  const session = await (await init({ model: "anthropic/claude-sonnet-4-6" })).session()
  const bindings = await harbor.exec.bindings()
  const toolCallGuide = toolCallGuideFrom(setup)
  const { data: generated } = await session.prompt(codePrompt(prompt, bindings, toolCallGuide), {
    result: codeResult,
  })
  console.log(["[harbor] Generated local exec code:", generated.code].join("\n"))
  const data = await harbor.exec.run(generated.code, { timeoutMs: 120_000 })
  if (!data.ok) return { answer: `Local exec failed: ${data.error?.message ?? "unknown error"}`, exec: data }
  const { data: summary } = await session.prompt([
    "Summarize the Harbor Alpha project status from this read-only Linear and Notion data.",
    "Include active work, context, risks, and next actions. Do not claim any writes were made.",
    `User request: ${prompt}`,
    `Exec result: ${JSON.stringify(data.value, null, 2)}`,
  ].join("\n"), {
    result: summaryResult,
  })
  return { answer: summary.answer, exec: data }
}
