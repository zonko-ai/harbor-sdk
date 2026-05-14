import { execFileSync } from "node:child_process"
import type { FlueContext } from "@flue/runtime"
import * as v from "valibot"

export const triggers = { webhook: true }

const agentResult = v.object({
  answer: v.string(),
  selectedToolId: v.nullable(v.string()),
  localRegistryCall: v.unknown(),
})

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

function envRecord(env: unknown): Readonly<Record<string, string | undefined>> | undefined {
  if (!env || typeof env !== "object") return undefined
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(env as Record<string, unknown>)) {
    if (typeof value === "string") out[key] = value
  }
  return out
}

function runLocalRegistry(input: {
  readonly prompt: string
  readonly confirmNotionWrite: boolean
  readonly env: Readonly<Record<string, string | undefined>>
}): unknown {
  const projectRoot = process.cwd()
  const output = execFileSync("bun", ["run", "src/run-e2e.ts"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      ...input.env,
      HARBOR_FLUE_E2E_INPUT: JSON.stringify({
        prompt: input.prompt,
        confirmNotionWrite: input.confirmNotionWrite,
        projectRoot,
      }),
    },
  })
  return JSON.parse(output)
}

export default async function ({ init, payload, env }: FlueContext) {
  const prompt = payloadPrompt(payload)
  const preview = runLocalRegistry({
    prompt,
    confirmNotionWrite: envString(env, "HARBOR_CONFIRM_NOTION_WRITE") === "1",
    env: envRecord(env) ?? {},
  })

  const harness = await init({ model: "anthropic/claude-sonnet-4-6" })
  const session = await harness.session()
  const { data } = await session.prompt(
    [
      "Use the Harbor SDK local runtime registry result below to answer the user.",
      "Do not invent Linear or Notion tools. Refer to selected local tool IDs exactly.",
      "",
      `User request: ${prompt}`,
      "",
      `Local registry preview: ${JSON.stringify(preview, null, 2)}`,
    ].join("\n"),
    { role: "tool-registry", result: agentResult }
  )
  return data
}
