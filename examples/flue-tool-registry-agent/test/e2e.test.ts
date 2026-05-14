import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "bun:test"
import { flueLinearNotionFixtureFetch } from "../src/fixture-mcp"
import { runLinearToNotionE2E } from "../src/local-registry"
import { setupFlueLinearNotionE2E } from "../src/setup-e2e"

async function withTempProject<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "hrbr-flue-e2e-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("flue Linear to Notion local E2E", () => {
  it("searches MCP tools and requires confirmation before writing to Notion", async () => {
    await withTempProject(async (projectRoot) => {
      const env = { HARBOR_LOCAL_CREDENTIAL_KEY: "vault-key" }
      const setup = await setupFlueLinearNotionE2E({
        projectRoot,
        env,
      })
      expect(setup.mode).toBe("fixture")
      expect(setup.sources).toEqual([
        expect.objectContaining({ slug: "linear-mcp", refreshedToolCount: 1 }),
        expect.objectContaining({ slug: "notion-mcp", refreshedToolCount: 2 }),
      ])

      const blocked = await runLinearToNotionE2E({
        projectRoot,
        prompt: "get my Linear tickets and save them to Notion",
        env,
        fetch: flueLinearNotionFixtureFetch,
      })
      expect(blocked.linearRead.selected.hit.toolId).toBe("linear-mcp.list_issues")
      expect(blocked.notionWrite.selected.hit.toolId).toBe("notion-mcp.notion-create-pages")
      expect(blocked.notionWrite.confirmationRequired).toBe(true)
      expect(blocked.notionWrite.confirmed).toBe(false)
      expect(blocked.notionWrite.call).toBeNull()

      const confirmed = await runLinearToNotionE2E({
        projectRoot,
        prompt: "get my Linear tickets and save them to Notion",
        confirmNotionWrite: true,
        env,
        fetch: flueLinearNotionFixtureFetch,
      })
      expect(confirmed.notionWrite.call).toMatchObject({
        toolId: "notion-mcp.notion-create-pages",
        output: {
          structuredContent: {
            created: true,
            pageId: "notion://page/linear-ticket-summary",
          },
        },
      })
    })
  })
})
