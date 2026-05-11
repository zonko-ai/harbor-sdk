import { describe, expect, it } from "bun:test"
import { defineSourceAdapter, type SourceAdapter } from "../src/index"

describe("@hrbr/source-core", () => {
  it("keeps custom source adapters structural and runtime-free", async () => {
    const adapter = defineSourceAdapter({
      namespace: "local",
      displayName: "Local tools",
      listTools: async () => [{ name: "echo", description: "Echo input" }],
      invokeTool: async (_name, input) => input,
    } satisfies SourceAdapter)

    await expect(adapter.listTools()).resolves.toEqual([
      { name: "echo", description: "Echo input" },
    ])
    await expect(adapter.invokeTool("echo", { ok: true })).resolves.toEqual({ ok: true })
  })
})
