import type { FlueContext } from "@flue/runtime"
import { createHarborLocalRuntime, type HarborLocalRegistryAction } from "@hrbr/runtime-local/promise"
import * as v from "valibot"

export const triggers = { webhook: true }

const action = v.object({
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

const result = v.object({
  answer: v.string(),
  selectedToolId: v.nullable(v.string()),
  localRegistryCall: v.unknown(),
})

type Action = v.InferOutput<typeof action>

function promptFrom(payload: unknown): string {
  return payload && typeof payload === "object" && typeof (payload as { prompt?: unknown }).prompt === "string"
    ? String((payload as { prompt: string }).prompt)
    : "Find my Linear issues or search Notion using the local Harbor tool registry."
}

function envFrom(env: unknown): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(env && typeof env === "object" ? env : {})
    .filter((entry): entry is [string, string] => typeof entry[1] === "string"))
}

function toRegistryAction(next: Action): HarborLocalRegistryAction {
  if (next.action === "search") return { kind: "search", query: next.query ?? "", namespace: next.namespace, limit: next.limit }
  if (next.action === "schema") return { kind: "schema", toolId: next.toolId ?? "" }
  if (next.action === "invoke") return { kind: "invoke", toolId: next.toolId ?? "", input: next.input ?? {} }
  throw new Error("Final actions are not registry calls.")
}

function systemPrompt(prompt: string, confirmWrites: boolean, observations: readonly unknown[]): string {
  return [
    "Drive the Harbor SDK local MCP registry. Choose exactly one action: search, schema, invoke, or final.",
    "Use search before unknown tools, schema before non-trivial invoke inputs, and treat MCP outputs as opaque observations.",
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
  const harbor = createHarborLocalRuntime({ projectRoot: process.cwd(), env: registryEnv })
  const session = await (await init({ model: "anthropic/claude-sonnet-4-6" })).session()

  for (let step = 0; step < 12; step++) {
    const { data: next } = await session.prompt(systemPrompt(prompt, confirmWrites, observations), {
      role: "tool-registry",
      result: action,
    })
    if (next.action === "final") return {
      answer: next.answer ?? "Completed.",
      selectedToolId: next.selectedToolId ?? null,
      localRegistryCall: next.localRegistryCall ?? observations,
    }
    try {
      const result = await harbor.tools.runAction(toRegistryAction(next), { confirmWrites })
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
