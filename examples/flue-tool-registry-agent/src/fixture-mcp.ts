interface McpRequestBody {
  readonly id?: number | string | undefined
  readonly method: string
  readonly params?: {
    readonly name?: string | undefined
    readonly arguments?: Record<string, unknown> | undefined
  } | undefined
}

function jsonRpc(id: number | string | undefined, result: unknown, sessionId: string): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "content-type": "application/json", "mcp-session-id": sessionId },
  })
}

function unauthorized(id: number | string | undefined): Response {
  return new Response(JSON.stringify({
    jsonrpc: "2.0",
    id,
    error: { code: 401, message: "Missing fixture OAuth bearer token" },
  }), { status: 401, headers: { "content-type": "application/json" } })
}

function linearFixture(body: McpRequestBody): Response {
  if (body.method === "initialize") {
    return jsonRpc(body.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "linear-mcp-fixture", version: "0.0.0-local" },
    }, "linear-local-fixture")
  }
  if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
  if (body.method === "tools/list") {
    return jsonRpc(body.id, {
      tools: [{
        name: "list_issues",
        description: "List Linear tickets and issues with optional team, assignee, state, and limit filters.",
        inputSchema: {
          type: "object",
          properties: {
            team: { type: "string" },
            assignee: { type: "string" },
            state: { type: "string" },
            limit: { type: "number", minimum: 1, maximum: 250 },
          },
        },
        annotations: { readOnlyHint: true },
      }],
    }, "linear-local-fixture")
  }
  if (body.method === "tools/call" && body.params?.name === "list_issues") {
    return jsonRpc(body.id, {
      content: [{ type: "text", text: "SDK-17 Add local Linear MCP plugin example" }],
      structuredContent: {
        issues: [{
          identifier: "SDK-17",
          title: "Add local Linear MCP plugin example",
          status: "In Progress",
          assignee: "SDK Team",
          url: "https://linear.app/example/issue/SDK-17",
        }].slice(0, Number(body.params.arguments?.["limit"] ?? 10)),
      },
    }, "linear-local-fixture")
  }
  return jsonRpc(body.id, { error: `Unknown Linear fixture method ${body.method}` }, "linear-local-fixture")
}

function notionFixture(body: McpRequestBody): Response {
  if (body.method === "initialize") {
    return jsonRpc(body.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "notion-mcp-fixture", version: "0.0.0-local" },
    }, "notion-local-fixture")
  }
  if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
  if (body.method === "tools/list") {
    return jsonRpc(body.id, {
      tools: [
        {
          name: "notion-search",
          description: "Search Notion workspace content by query and optional filters.",
          inputSchema: {
            type: "object",
            required: ["query", "filters"],
            properties: {
              query: { type: "string" },
              filters: { type: "object" },
            },
          },
          annotations: { readOnlyHint: true },
        },
        {
          name: "notion-create-pages",
          description: "Create Notion pages or database records after caller-side confirmation.",
          inputSchema: {
            type: "object",
            required: ["pages", "parent"],
            properties: {
              pages: { type: "array" },
              parent: { type: "object" },
            },
          },
          annotations: { destructiveHint: false, readOnlyHint: false },
        },
      ],
    }, "notion-local-fixture")
  }
  if (body.method === "tools/call" && body.params?.name === "notion-search") {
    return jsonRpc(body.id, {
      structuredContent: {
        results: [{
          title: "SDK plugin examples",
          url: "notion://page/sdk-plugin-examples",
        }],
      },
    }, "notion-local-fixture")
  }
  if (body.method === "tools/call" && body.params?.name === "notion-create-pages") {
    return jsonRpc(body.id, {
      structuredContent: {
        created: true,
        pageId: "notion://page/linear-ticket-summary",
        input: body.params.arguments,
      },
    }, "notion-local-fixture")
  }
  return jsonRpc(body.id, { error: `Unknown Notion fixture method ${body.method}` }, "notion-local-fixture")
}

export async function flueLinearNotionFixtureFetch(
  url: string | URL | Request,
  init?: RequestInit
): Promise<Response> {
  const endpoint = String(url)
  const body = JSON.parse(String(init?.body ?? "{}")) as McpRequestBody
  const authorization = new Headers(init?.headers).get("authorization")
  if (authorization !== "Bearer fixture-access-token") return unauthorized(body.id)
  if (endpoint.includes("linear.app")) return linearFixture(body)
  if (endpoint.includes("notion.com")) return notionFixture(body)
  throw new Error(`Unexpected fixture MCP endpoint ${endpoint}`)
}
