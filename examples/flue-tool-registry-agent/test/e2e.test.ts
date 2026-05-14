import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "bun:test"
import { createHarborLocalRuntime } from "@hrbr/runtime-local/promise"
import { setupFlueLinearNotionE2E } from "../src/setup-e2e"
import { serveLinearNotionFixtureServers } from "./fixtures"

async function withTempProject<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "hrbr-flue-e2e-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("flue Linear to Notion local E2E", () => {
  it("exposes search/schema/invoke actions and gates Notion writes without parsing MCP output", async () => {
    await withTempProject(async (projectRoot) => {
      const servers = await serveLinearNotionFixtureServers()
      const env = { HARBOR_LOCAL_CREDENTIAL_KEY: "vault-key" }
      try {
        const setup = await setupFlueLinearNotionE2E({
          projectRoot,
          env,
          endpoints: {
            "linear-mcp": servers.linear.url,
            "notion-mcp": servers.notion.url,
          },
        })
        expect(setup.mode).toBe("fixture")
        const harbor = createHarborLocalRuntime({ projectRoot, env, allowLocalNetwork: true })

        const linearSearch = await harbor.tools.runAction({ kind: "search", namespace: "linear-mcp", query: "linear tickets issues list" })
        expect(linearSearch).toMatchObject({
          kind: "search",
          hits: [expect.objectContaining({ toolId: "linear-mcp.list_issues" })],
        })

        await expect(harbor.tools.runAction({
          kind: "schema",
          toolId: "notion-mcp.notion-create-pages",
        })).resolves.toMatchObject({
          kind: "schema",
          schema: { toolId: "notion-mcp.notion-create-pages" },
        })

        await expect(harbor.tools.runAction({
          kind: "invoke",
          toolId: "notion-mcp.notion-create-pages",
          input: {
            parent: { page_id: "notion-fixture-parent-page" },
            pages: [{ properties: { title: "Linear summary" }, content: "No parsing in host code." }],
          },
        })).resolves.toMatchObject({
          kind: "invoke",
          blocked: true,
        })

        await expect(harbor.tools.runAction({
          kind: "invoke",
          toolId: "notion-mcp.notion-create-pages",
          input: {
            parent: { page_id: "notion-fixture-parent-page" },
            pages: [{ properties: { title: "Linear summary" }, content: "No parsing in host code." }],
          },
        }, { confirmWrites: true })).resolves.toMatchObject({
          kind: "invoke",
          blocked: false,
          result: {
            toolId: "notion-mcp.notion-create-pages",
            output: {
              structuredContent: {
                created: true,
                pageId: "notion://page/linear-ticket-summary",
              },
            },
          },
        })
      } finally {
        await servers.close()
      }
    })
  })
})
