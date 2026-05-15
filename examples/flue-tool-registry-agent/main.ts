import type { FlueContext } from "@flue/runtime"
import {
  createHarbor,
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryAgentStepSchema,
} from "@hrbr/sdk/local"
import * as v from "valibot"

export const triggers = { webhook: true }

const mcpSources = [
  { endpoint: "https://mcp.linear.app/mcp" },
  { endpoint: "https://mcp.notion.com/mcp" },
] as const

const result = v.object({
  answer: v.string(),
  selectedToolId: v.nullable(v.string()),
  localRegistryCall: v.unknown(),
})

function promptFrom(payload: unknown): string {
  return payload && typeof payload === "object" && typeof (payload as { prompt?: unknown }).prompt === "string"
    ? String((payload as { prompt: string }).prompt)
    : "Find my Linear issues or search Notion using the local Harbor tool registry."
}

function envFrom(env: unknown): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(env && typeof env === "object" ? env : {})
    .filter((entry): entry is [string, string] => typeof entry[1] === "string"))
}

function systemPrompt(prompt: string, confirmWrites: boolean, observations: readonly unknown[]): string {
  return [
    "Drive the Harbor local MCP registry. Choose exactly one action: search, schema, invoke, or final.",
    "Use search before unknown tools, schema before non-trivial invoke inputs, and treat MCP outputs as opaque observations.",
    "If source setup reports a missing, pending, or failed MCP source, explain that status instead of inventing tool results.",
    `Write confirmation is ${confirmWrites ? "enabled" : "disabled"}. Do not invent missing Linear or Notion data.`,
    `User request: ${prompt}`,
    `Observations: ${JSON.stringify(observations, null, 2)}`,
  ].join("\n")
}

export default async function ({ init, payload, env }: FlueContext) {
  const prompt = promptFrom(payload)
  const registryEnv = envFrom(env)
  const confirmWrites = registryEnv.HARBOR_CONFIRM_NOTION_WRITE === "1"
  const observations: unknown[] = []
  const harbor = createHarbor({ projectRoot: process.cwd(), env: registryEnv })
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
  const session = await (await init({ model: "anthropic/claude-sonnet-4-6" })).session()

  for (let step = 0; step < 12; step++) {
    const { data: next } = await session.prompt(systemPrompt(prompt, confirmWrites, observations), {
      role: "tool-registry",
      result: harborLocalRegistryAgentStepSchema,
    })
    if (next.action === "final") return {
      answer: next.answer ?? "Completed.",
      selectedToolId: next.selectedToolId ?? null,
      localRegistryCall: next.localRegistryCall ?? observations,
    }
    try {
      const result = await harbor.tools.runAction(harborLocalRegistryActionFromAgentStep(next), { confirmWrites })
      observations.push({ step: step + 1, request: next, result })
    } catch (error) {
      observations.push({ step: step + 1, request: next, error: error instanceof Error ? error.message : String(error) })
    }
  }

  return (await session.prompt(`Return a final answer from these observations:\n${JSON.stringify(observations, null, 2)}`, {
    role: "tool-registry",
    result,
  })).data
}
