import { serveHarborMcpTestServer, type HarborMcpTestServerHandle } from "@hrbr/sdk/testing"
import { z } from "zod"

export interface LinearNotionReadonlyFixtureServers {
  readonly linear: HarborMcpTestServerHandle
  readonly notion: HarborMcpTestServerHandle
  readonly close: () => Promise<void>
}

export async function serveLinearNotionReadonlyFixtureServers(): Promise<LinearNotionReadonlyFixtureServers> {
  const linear = await serveHarborMcpTestServer({
    name: "linear-mcp-readonly-fixture",
    tools: [
      {
        name: "list_issues",
        description: "List Linear issues for a project",
        inputSchema: { query: z.string().optional(), limit: z.number().optional() },
        annotations: { readOnlyHint: true },
        handler: () => ({
          content: [{
            type: "text",
            text: JSON.stringify({
              issues: [
                {
                  id: "LIN-101",
                  title: "Ship local exec namespace resolver",
                  state: "In Progress",
                  creator: "Kushagra",
                  project: "Harbor Alpha",
                  updatedAt: "2026-05-14T09:00:00.000Z",
                },
                {
                  id: "LIN-102",
                  title: "Document read-only Flue example",
                  state: "Todo",
                  creator: "Codex",
                  project: "Harbor Alpha",
                  updatedAt: "2026-05-14T10:00:00.000Z",
                },
              ],
            }),
          }],
          structuredContent: {
            issues: [
              {
                id: "LIN-101",
                title: "Ship local exec namespace resolver",
                state: "In Progress",
                creator: "Kushagra",
                project: "Harbor Alpha",
                updatedAt: "2026-05-14T09:00:00.000Z",
              },
              {
                id: "LIN-102",
                title: "Document read-only Flue example",
                state: "Todo",
                creator: "Codex",
                project: "Harbor Alpha",
                updatedAt: "2026-05-14T10:00:00.000Z",
              },
            ],
          },
        }),
      },
    ],
  })

  const notion = await serveHarborMcpTestServer({
    name: "notion-mcp-readonly-fixture",
    tools: [
      {
        name: "notion-search",
        description: "Search Notion pages",
        inputSchema: { query: z.string().optional() },
        annotations: { readOnlyHint: true },
        handler: () => ({
          content: [{
            type: "text",
            text: JSON.stringify({
              results: [
                {
                  id: "notion-alpha-plan",
                  title: "Harbor Alpha launch plan",
                  summary: "Local exec should resolve namespace tools from SDK state and keep examples read-only first.",
                },
              ],
            }),
          }],
          structuredContent: {
            results: [
              {
                id: "notion-alpha-plan",
                title: "Harbor Alpha launch plan",
                summary: "Local exec should resolve namespace tools from SDK state and keep examples read-only first.",
              },
            ],
          },
        }),
      },
    ],
  })

  return {
    linear,
    notion,
    close: async () => {
      await Promise.all([linear.close(), notion.close()])
    },
  }
}
