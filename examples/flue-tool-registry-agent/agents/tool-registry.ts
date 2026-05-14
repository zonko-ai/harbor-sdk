import type { FlueContext } from "@flue/runtime"
import * as v from "valibot"
import { loadLocalRegistryPreview } from "../src/local-registry"

export const triggers = { webhook: true }

const agentResult = v.object({
  answer: v.string(),
  selectedToolId: v.nullable(v.string()),
  localRegistryCall: v.object({
    toolId: v.string(),
    output: v.unknown(),
  }),
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

export default async function ({ init, payload, env }: FlueContext) {
  const prompt = payloadPrompt(payload)
  const preview = await loadLocalRegistryPreview({
    prompt,
    linearRoot: envString(env, "HARBOR_LINEAR_LOCAL_ROOT"),
    notionRoot: envString(env, "HARBOR_NOTION_LOCAL_ROOT"),
  })

  const harness = await init({ model: "openai/gpt-5.5" })
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
