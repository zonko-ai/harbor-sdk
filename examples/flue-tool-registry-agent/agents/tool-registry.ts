import { execFileSync } from "node:child_process"
import type { FlueContext } from "@flue/runtime"
import * as v from "valibot"

export const triggers = { webhook: true }

const agentResult = v.object({
  answer: v.string(),
  selectedToolId: v.nullable(v.string()),
  localRegistryCall: v.unknown(),
})

const nextAction = v.object({
  action: v.picklist(["search", "schema", "invoke", "final"]),
  query: v.optional(v.string()),
  namespace: v.optional(v.string()),
  limit: v.optional(v.number()),
  toolId: v.optional(v.string()),
  input: v.optional(v.unknown()),
  answer: v.optional(v.string()),
  selectedToolId: v.optional(v.nullable(v.string())),
  localRegistryCall: v.optional(v.unknown()),
})

type NextAction = v.InferOutput<typeof nextAction>

function payloadPrompt(payload: unknown): string {
  if (payload && typeof payload === "object" && "prompt" in payload) {
    const prompt = (payload as { prompt?: unknown }).prompt
    if (typeof prompt === "string" && prompt.trim()) return prompt
  }
  return "Find my Linear issues or search Notion using the local Harbor tool registry."
}

function envString(env: unknown, key: string): string | undefined {
  if (!env || typeof env !== "object") return undefined
  const value = (env as Record<string, unknown>)[key]
  return typeof value === "string" && value.trim() ? value : undefined
}

function envRecord(env: unknown): Readonly<Record<string, string | undefined>> {
  if (!env || typeof env !== "object") return {}
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    if (typeof value === "string") out[key] = value
  }
  return out
}

function registryActionFromNext(next: NextAction): Record<string, unknown> {
  if (next.action === "search") {
    if (!next.query) throw new Error("Model selected search without query.")
    return {
      kind: "search",
      query: next.query,
      ...(next.namespace ? { namespace: next.namespace } : {}),
      ...(typeof next.limit === "number" ? { limit: next.limit } : {}),
    }
  }
  if (next.action === "schema") {
    if (!next.toolId) throw new Error("Model selected schema without toolId.")
    return { kind: "schema", toolId: next.toolId }
  }
  if (next.action === "invoke") {
    if (!next.toolId) throw new Error("Model selected invoke without toolId.")
    return { kind: "invoke", toolId: next.toolId, input: next.input ?? {} }
  }
  throw new Error(`Action ${next.action} is not a registry action.`)
}

function runRegistryAction(input: {
  readonly next: NextAction
  readonly confirmWrites: boolean
  readonly env: Readonly<Record<string, string | undefined>>
}): unknown {
  const projectRoot = process.cwd()
  const output = execFileSync("bun", ["run", "src/run-registry-action.ts"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ...input.env,
      HARBOR_REGISTRY_ACTION_INPUT: JSON.stringify({
        action: registryActionFromNext(input.next),
        confirmWrites: input.confirmWrites,
        projectRoot,
      }),
    },
  })
  return JSON.parse(output)
}

function systemPrompt(input: { readonly prompt: string; readonly confirmWrites: boolean; readonly observations: readonly unknown[] }): string {
  return [
    "You are driving the Harbor SDK local MCP tool registry.",
    "You must decide the next action. Available actions:",
    "- search: find tools. Provide query, optional namespace, optional limit.",
    "- schema: inspect a tool schema. Provide toolId.",
    "- invoke: call a tool. Provide toolId and input matching its schema.",
    "- final: return the final answer, selectedToolId, and a compact localRegistryCall summary.",
    "",
    "Important rules:",
    "- Treat MCP outputs as opaque observations. Do not expect the host code to parse them for you.",
    "- You are responsible for reading observations, choosing follow-up tools, and building valid tool inputs from schemas.",
    "- Use search before relying on a tool name unless the exact tool appeared in prior search results.",
    "- Use schema before invoke when building non-trivial inputs.",
    "- Notion write tools are gated by confirmation. Confirmation is currently " + (input.confirmWrites ? "enabled." : "disabled."),
    "- For Notion page creation, first find or choose a parent page/database with Notion tools, then create content using the create-page schema.",
    "- If no Linear issues match the requested time window, say that clearly. Do not invent issues.",
    "",
    `User request: ${input.prompt}`,
    "",
    `Observations so far: ${JSON.stringify(input.observations, null, 2)}`,
  ].join("\n")
}

export default async function ({ init, payload, env }: FlueContext) {
  const prompt = payloadPrompt(payload)
  const confirmWrites = envString(env, "HARBOR_CONFIRM_NOTION_WRITE") === "1"
  const registryEnv = envRecord(env)
  const observations: unknown[] = []

  const harness = await init({ model: "anthropic/claude-sonnet-4-6" })
  const session = await harness.session()

  for (let step = 0; step < 12; step++) {
    const { data: next } = await session.prompt(systemPrompt({ prompt, confirmWrites, observations }), {
      role: "tool-registry",
      result: nextAction,
    })

    if (next.action === "final") {
      return {
        answer: next.answer ?? "Completed.",
        selectedToolId: next.selectedToolId ?? null,
        localRegistryCall: next.localRegistryCall ?? observations,
      }
    }

    try {
      const result = runRegistryAction({ next, confirmWrites, env: registryEnv })
      observations.push({ step: step + 1, request: next, result })
    } catch (error) {
      observations.push({
        step: step + 1,
        request: next,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const { data } = await session.prompt([
    "Return the best final answer from the observations. The action loop reached its step limit.",
    `User request: ${prompt}`,
    `Observations: ${JSON.stringify(observations, null, 2)}`,
  ].join("\n"), {
    role: "tool-registry",
    result: agentResult,
  })
  return data
}
