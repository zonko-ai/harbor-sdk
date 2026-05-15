import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "bun:test"
import { createHarbor } from "@hrbr/sdk/local"
import { serveLinearNotionReadonlyFixtureServers } from "./fixtures"

async function withTempProject<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "hrbr-ai-sdk-local-exec-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("AI SDK local exec read-only summary example", () => {
  it("composes Linear and Notion reads through one backend-resolved exec run", async () => {
    await withTempProject(async (projectRoot) => {
      const servers = await serveLinearNotionReadonlyFixtureServers()
      try {
        const harbor = createHarbor({
          projectRoot,
          env: { HARBOR_LOCAL_CREDENTIAL_KEY: "fixture-key" },
          allowLocalNetwork: true,
        })
        const setup = await harbor.sources.ensureMcpSources({
          sources: [
            { endpoint: servers.linear.url, name: "Linear MCP", namespace: "linear-mcp", auth: "none" },
            { endpoint: servers.notion.url, name: "Notion MCP", namespace: "notion-mcp", auth: "none" },
          ],
          refresh: true,
        })
        expect(setup.ready).toBe(true)
        await expect(harbor.exec.bindings()).resolves.toEqual([
          { namespace: "linear-mcp", aliases: ["linear_mcp", "linearMcp"], toolCount: 1 },
          { namespace: "notion-mcp", aliases: ["notion_mcp", "notionMcp"], toolCount: 1 },
        ])

        const result = await harbor.exec.run(`
          const [linear, notion] = await Promise.all([
            linearMcp.listIssues({ query: "Harbor Alpha", limit: 50 }),
            notionMcp.notionSearch({ query: "Harbor Alpha" }),
          ]);
          console.log("summary-input", linear.structuredContent.issues.length, notion.structuredContent.results.length);
          return {
            linearIssues: linear.structuredContent.issues,
            notionResults: notion.structuredContent.results,
            summaryInput: {
              issueCount: linear.structuredContent.issues.length,
              notionContextCount: notion.structuredContent.results.length,
            },
          };
        `)

        expect(result).toMatchObject({
          ok: true,
          namespaces: ["linear-mcp", "notion-mcp"],
          logs: [{ level: "log", args: ["summary-input", 2, 1] }],
          value: {
            summaryInput: { issueCount: 2, notionContextCount: 1 },
          },
        })
        expect(JSON.stringify(result.value)).toContain("Ship local exec namespace resolver")
        expect(JSON.stringify(result.value)).toContain("Harbor Alpha launch plan")
      } finally {
        await servers.close()
      }
    })
  })
})
