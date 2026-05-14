import { createAnthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import {
  createHarborLocalRuntime,
  harborLocalRegistryActionFromAgentStep,
} from "@hrbr/runtime-local/promise"
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
  input: z.unknown().optional(),
  answer: z.string().optional(),
  selectedToolId: z.string().nullable().optional(),
  localRegistryCall: z.unknown().optional(),
})

const finalResultSchema = z.object({
  answer: z.string(),
  selectedToolId: z.string().nullable(),
  localRegistryCall: z.unknown(),
})

function promptFromArgv(argv: readonly string[]): string {
  const prompt = argv.join(" ").trim()
  return prompt || "Find my Linear issues or search Notion using the local Harbor tool registry."
}

function envFromProcess(): Record<string, string | undefined> {
  return process.env as Record<string, string | undefined>
}

function anthropicModelFrom(env: Record<string, string | undefined>) {
  const provider = env.ANTHROPIC_API_KEY
    ? createAnthropic({ apiKey: env.ANTHROPIC_API_KEY })
    : createAnthropic()
  return provider(env.AI_SDK_ANTHROPIC_MODEL ?? env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6")
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

export async function runAiSdkToolRegistryAgent(input: {
  readonly prompt?: string | undefined
  readonly projectRoot?: string | undefined
  readonly env?: Record<string, string | undefined> | undefined
} = {}) {
  const prompt = input.prompt ?? promptFromArgv(process.argv.slice(2))
  const registryEnv = input.env ?? envFromProcess()
  const confirmWrites = registryEnv.HARBOR_CONFIRM_NOTION_WRITE === "1"
  const observations: unknown[] = []
  const harbor = createHarborLocalRuntime({ projectRoot: input.projectRoot ?? process.cwd(), env: registryEnv })
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
  observations.push({ kind: "mcp_source_setup", result: sourceSetup })

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
      localRegistryCall: next.localRegistryCall ?? observations,
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
