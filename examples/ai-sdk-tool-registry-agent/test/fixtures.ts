import { serveHarborMcpTestServer, type HarborMcpTestServerHandle } from "@hrbr/sdk/testing"
import { z } from "zod"

export interface LinearNotionFixtureServers {
  readonly linear: HarborMcpTestServerHandle
  readonly notion: HarborMcpTestServerHandle
  readonly close: () => Promise<void>
}

export async function serveLinearNotionFixtureServers(): Promise<LinearNotionFixtureServers> {
  const linear = await serveHarborMcpTestServer({
    name: "linear-mcp-fixture",
    tools: [{
      name: "list_issues",
      description: "List Linear tickets and issues with optional team, assignee, state, and limit filters.",
      inputSchema: {
        team: z.string().optional(),
        assignee: z.string().optional(),
        state: z.string().optional(),
        limit: z.number().min(1).max(250).optional(),
      },
      annotations: { readOnlyHint: true },
      handler: (input) => ({
        content: [{ type: "text", text: "SDK-17 Add local Linear MCP plugin example" }],
        structuredContent: {
          issues: [{
            identifier: "SDK-17",
            title: "Add local Linear MCP plugin example",
            status: "In Progress",
            assignee: "SDK Team",
            url: "https://linear.app/example/issue/SDK-17",
          }].slice(0, Number(input["limit"] ?? 10)),
        },
      }),
    }],
  })

  const notion = await serveHarborMcpTestServer({
    name: "notion-mcp-fixture",
    tools: [
      {
        name: "notion-search",
        description: "Search Notion workspace content by query and optional filters.",
        inputSchema: {
          query: z.string(),
          filters: z.record(z.string(), z.unknown()),
        },
        annotations: { readOnlyHint: true },
        handler: () => ({
          structuredContent: {
            results: [{
              id: "notion-fixture-parent-page",
              title: "SDK plugin examples",
              url: "notion://page/sdk-plugin-examples",
              type: "page",
            }],
          },
        }),
      },
      {
        name: "notion-create-pages",
        description: "Create Notion pages or database records after caller-side confirmation.",
        inputSchema: {
          pages: z.array(z.unknown()),
          parent: z.record(z.string(), z.unknown()),
        },
        annotations: { destructiveHint: false, readOnlyHint: false },
        handler: (input) => ({
          structuredContent: {
            created: true,
            pageId: "notion://page/linear-ticket-summary",
            input,
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
