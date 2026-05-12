import { describe, expect, it } from "bun:test"
import { defineSourceAdapter } from "@hrbr/source-core"
import { createCredentialResolver, createMemoryCredentialStore } from "@hrbr/source-credentials"
import { ToolPolicyDeniedError, createToolPolicy } from "@hrbr/source-policy"
import { createMemoryTraceWriter } from "@hrbr/runs"
import { createToolRegistry } from "../src/index"
import type {
  ToolClient,
  ToolRegistryReader,
  ToolsSearchResponse,
} from "../src/index"

describe("@hrbr/tools contracts", () => {
  it("allows platform and client implementations to share the same reader shape", async () => {
    const reader: ToolRegistryReader = {
      list: async () => ({ data: [], limit: 50, offset: 0, hasMore: false }),
      search: async () => ({ hits: [] }),
      describe: async ({ toolId }) => ({
        tool_id: toolId,
        name: "search",
        namespace: "exa-mcp",
        js_var: "exa_mcp",
        display_name: "Search",
        signature: "exa_mcp.search(args)",
        call_example: "await exa_mcp.search({ query: \"...\" })",
        kind: "mcp",
      }),
      schema: async ({ toolId }) => ({ tool_id: toolId }),
      schemas: async ({ toolIds }) => toolIds.map((tool_id) => ({ tool_id })),
    }

    await expect(reader.search({ query: "search docs" })).resolves.toEqual({ hits: [] })
    await expect(reader.schema({ toolId: "exa-mcp.search" })).resolves.toEqual({
      tool_id: "exa-mcp.search",
    })
  })

  it("uses the product tool search response as the SDK read contract", () => {
    const response = {
      hits: [
        {
          tool_id: "sentry-mcp.search_issues",
          name: "search_issues",
          namespace: "sentry-mcp",
          js_var: "sentryMcp",
          display_name: "Search Issues",
          description: "Search Sentry issues.",
          signature: "sentryMcp.searchIssues(query?: string): Promise<unknown>",
          score: 81,
          kind: "mcp",
        },
      ],
    } satisfies ToolsSearchResponse

    expect(response.hits[0]?.tool_id).toBe("sentry-mcp.search_issues")
  })

  it("allows invocation and execution implementations to share the same tool client shape", async () => {
    const client: ToolClient = {
      list: async () => ({ data: [], limit: 50, offset: 0, hasMore: false }),
      search: async () => ({ hits: [] }),
      describe: async ({ toolId }) => ({
        tool_id: toolId,
        name: "search",
        namespace: "exa-mcp",
        js_var: "exa_mcp",
        display_name: "Search",
        signature: "exa_mcp.search(args)",
        call_example: "await exa_mcp.search({ query: \"...\" })",
        kind: "mcp",
      }),
      schema: async ({ toolId }) => ({ tool_id: toolId }),
      schemas: async ({ toolIds }) => toolIds.map((tool_id) => ({ tool_id })),
      invoke: async () => ({
        result: { ok: true },
        content_type: "application/json",
        duration_ms: 8,
        invocation_id: "invoke-1",
      }),
      execute: async () => ({
        result: { ok: true },
        mode: "dynamic_worker",
        run_id: "11111111-1111-4111-8111-111111111111",
      }),
    }

    await expect(client.invoke({ toolId: "exa-mcp.search", input: { query: "docs" } })).resolves.toMatchObject({
      content_type: "application/json",
      invocation_id: "invoke-1",
    })
    await expect(client.execute({ code: "return { ok: true }" })).resolves.toMatchObject({
      mode: "dynamic_worker",
    })
  })

  it("builds an in-process registry from custom source adapters", async () => {
    const registry = createToolRegistry({
      sources: [
        defineSourceAdapter({
          namespace: "acme",
          displayName: "Acme internal tools",
          listTools: async () => [
            {
              name: "create_ticket",
              displayName: "Create ticket",
              description: "Create an internal support ticket",
              inputSchema: {
                type: "object",
                required: ["title"],
                properties: { title: { type: "string" } },
              },
              outputSchema: {
                type: "object",
                properties: { id: { type: "string" } },
              },
              kind: "custom",
            },
          ],
          invokeTool: async (name, input) => ({
            name,
            id: "ticket-1",
            title: input["title"],
          }),
        }),
      ],
    })

    await expect(registry.search({ query: "support ticket" })).resolves.toMatchObject({
      hits: [{ tool_id: "acme.create_ticket", namespace: "acme" }],
    })
    await expect(registry.describe({ toolId: "acme.create_ticket" })).resolves.toMatchObject({
      signature: "acme.create_ticket(input)",
      call_example: 'await registry.call("acme.create_ticket", input)',
    })
    await expect(registry.call("acme.create_ticket", { title: "Login broken" })).resolves.toMatchObject({
      result: { name: "create_ticket", id: "ticket-1", title: "Login broken" },
      content_type: "application/json",
    })
  })

  it("lets host runtimes provide registry metadata without forking", async () => {
    const registry = createToolRegistry({
      workspaceId: "workspace-acme",
      now: () => new Date("2026-01-02T03:04:05.000Z"),
      callExample: ({ namespace, name }) => `await tools.${namespace}.${name}({})`,
      invocationId: ({ toolId }) => `invoke:${toolId}`,
      sources: [
        defineSourceAdapter({
          namespace: "acme",
          displayName: "Acme",
          listTools: async () => [{ name: "ping" }],
          invokeTool: async () => ({ ok: true }),
        }),
      ],
    })

    await expect(registry.list()).resolves.toMatchObject({
      data: [{
        workspace_id: "workspace-acme",
        created_at: "2026-01-02T03:04:05.000Z",
      }],
    })
    await expect(registry.describe({ toolId: "acme.ping" })).resolves.toMatchObject({
      call_example: "await tools.acme.ping({})",
    })
    await expect(registry.call("acme.ping")).resolves.toMatchObject({
      invocation_id: "invoke:acme.ping",
    })
  })

  it("passes resolved credentials to custom source invocations", async () => {
    const registry = createToolRegistry({
      workspaceId: "workspace-1",
      credentials: createCredentialResolver({
        store: createMemoryCredentialStore({ secrets: { "secret-1": "sk_live" } }),
        bindings: [{
          workspace_id: "workspace-1",
          source_id: "secure",
          slot: "api_key",
          scope: "workspace",
          value: { kind: "secret", secret_id: "secret-1" },
          status: "active",
        }],
      }),
      sources: [
        defineSourceAdapter({
          id: "secure",
          namespace: "secure",
          displayName: "Secure tools",
          listTools: async () => [{ name: "whoami" }],
          invokeTool: async (_name, _input, ctx) => ({
            authenticated: ctx?.credentials?.require("api_key") === "sk_live",
          }),
        }),
      ],
    })

    await expect(registry.call("secure.whoami")).resolves.toMatchObject({
      result: { authenticated: true },
    })
  })

  it("evaluates policy before invoking custom source tools", async () => {
    let invoked = false
    const registry = createToolRegistry({
      policy: createToolPolicy({
        rules: [
          { match: "tickets.delete", decision: { kind: "block", reason: "Deletion requires review" } },
        ],
      }),
      sources: [
        defineSourceAdapter({
          namespace: "tickets",
          displayName: "Tickets",
          listTools: async () => [{ name: "delete" }],
          invokeTool: async () => {
            invoked = true
            return { ok: true }
          },
        }),
      ],
    })

    await expect(registry.call("tickets.delete", { id: "ticket-1" })).rejects.toBeInstanceOf(ToolPolicyDeniedError)
    expect(invoked).toBe(false)
  })

  it("writes trace evidence around custom source calls", async () => {
    let tick = 0
    const traces = createMemoryTraceWriter({
      id: () => `trace-${++tick}`,
      now: () => new Date(`2026-01-01T00:00:0${Math.min(tick, 9)}.000Z`),
    })
    const registry = createToolRegistry({
      traces,
      sources: [
        defineSourceAdapter({
          namespace: "demo",
          displayName: "Demo",
          listTools: async () => [{ name: "echo", displayName: "Echo" }],
          invokeTool: async (_name, input) => input,
        }),
      ],
    })

    const result = await registry.call("demo.echo", { value: 1 })
    expect(result.run_id).toBe("trace-1")

    await expect(traces.graph("trace-1")).resolves.toMatchObject({
      run: { id: "trace-1", status: "completed" },
      spans: [{ id: "trace-2", status: "success", tool_id: "demo.echo" }],
      summary: { span_count: 1, error_count: 0 },
    })
  })
})
