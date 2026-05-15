import { REGISTRY_LOCAL_MCP_CATALOG_ENTRIES } from "@hrbr/registry-catalog"
import { createHarbor, type HarborLocalRuntime } from "@hrbr/sdk/local"
import type { HarborLocalServerInput } from "./server"

interface JsonRpcRequest {
  readonly jsonrpc?: string | undefined
  readonly id?: number | string | null | undefined
  readonly method?: string | undefined
  readonly params?: unknown
}

interface McpToolDefinition {
  readonly name: string
  readonly description: string
  readonly inputSchema: Record<string, unknown>
}

type McpToolHandler = (
  runtime: HarborLocalRuntime,
  input: Record<string, unknown>
) => Promise<unknown>

interface LocalHarborMcpTool extends McpToolDefinition {
  readonly handler: McpToolHandler
}

function jsonRpc(id: JsonRpcRequest["id"], result: unknown): Response {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result })
}

function jsonRpcError(id: JsonRpcRequest["id"], code: number, message: string, data?: unknown): Response {
  return Response.json({
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
      ...(data !== undefined ? { data } : {}),
    },
  })
}

function objectParams(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function stringParam(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
}

function numberParam(input: Record<string, unknown>, key: string): number | undefined {
  const value = input[key]
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function schema(properties: Record<string, unknown>, required: readonly string[] = []): Record<string, unknown> {
  return {
    type: "object",
    properties,
    additionalProperties: false,
    ...(required.length > 0 ? { required: [...required] } : {}),
  }
}

function mcpText(value: unknown): { readonly content: readonly [{ readonly type: "text"; readonly text: string }]; readonly structuredContent: unknown } {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  }
}

function runtime(input: HarborLocalServerInput): HarborLocalRuntime {
  const env = {
    ...process.env,
    ...(input.env.credentialKey ? { HARBOR_LOCAL_CREDENTIAL_KEY: input.env.credentialKey } : {}),
    ...(input.env.oauthPort !== undefined ? { HARBOR_LOCAL_OAUTH_PORT: String(input.env.oauthPort) } : {}),
  }
  return createHarbor({
    projectRoot: input.env.projectRoot,
    env,
    allowLocalNetwork: true,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  })
}

const tools: readonly LocalHarborMcpTool[] = [
  {
    name: "harbor_catalog_list",
    description: "List the local Harbor MCP catalog seed. Use this to find MCP plugins that can be installed through the local UI.",
    inputSchema: schema({
      query: { type: "string", description: "Optional case-insensitive text filter over slug, name, namespace, category, endpoint, and description." },
      limit: { type: "number", description: "Maximum entries to return. Defaults to 25 and caps at 100." },
    }),
    handler: async (_runtime, input) => {
      const query = stringParam(input, "query")?.toLowerCase()
      const limit = Math.max(1, Math.min(numberParam(input, "limit") ?? 25, 100))
      const entries = REGISTRY_LOCAL_MCP_CATALOG_ENTRIES
        .filter((entry) => !query || [
          entry.slug,
          entry.displayName,
          entry.defaultNamespace,
          entry.category,
          entry.endpoint,
          entry.description,
        ].some((value) => String(value ?? "").toLowerCase().includes(query)))
        .slice(0, limit)
      return { entries, total: entries.length }
    },
  },
  {
    name: "harbor_sources_list",
    description: "List MCP sources installed in the local Harbor runtime with OAuth status redacted to status metadata only.",
    inputSchema: schema({}),
    handler: async (harbor) => {
      const sources = await harbor.sources.listMcp()
      return {
        sources: await Promise.all(sources.map(async (source) => ({
          ...source,
          oauth: source.auth.kind === "oauth2"
            ? await harbor.sources.oauthStatus(source.id)
            : { sourceRefId: source.id, status: "not_required" },
        }))),
        total: sources.length,
      }
    },
  },
  {
    name: "harbor_source_refresh",
    description: "Refresh one installed MCP source and re-index its tools in local Harbor.",
    inputSchema: schema({
      sourceId: { type: "string", description: "Installed source id or namespace, for example linear-mcp." },
    }, ["sourceId"]),
    handler: (harbor, input) => harbor.sources.refreshMcp(stringParam(input, "sourceId") ?? ""),
  },
  {
    name: "harbor_tools_search",
    description: "Search local Harbor's indexed MCP tools with lexical scoring. Use namespace to scope to one installed plugin.",
    inputSchema: schema({
      query: { type: "string", description: "Tool search query." },
      namespace: { type: "string", description: "Optional installed source namespace to scope results." },
      limit: { type: "number", description: "Maximum hits. Defaults to 10 and caps at 50." },
    }, ["query"]),
    handler: (harbor, input) => harbor.tools.search({
      query: stringParam(input, "query") ?? "",
      namespace: stringParam(input, "namespace"),
      limit: numberParam(input, "limit"),
    }),
  },
  {
    name: "harbor_tool_schema",
    description: "Return the input and output schema metadata for one indexed local Harbor MCP tool.",
    inputSchema: schema({
      toolId: { type: "string", description: "Fully qualified local tool id, for example linear-mcp.list_issues." },
    }, ["toolId"]),
    handler: (harbor, input) => harbor.tools.schema(stringParam(input, "toolId") ?? ""),
  },
  {
    name: "harbor_tool_invoke",
    description: "Invoke one indexed local Harbor MCP tool through the local runtime. Tool output is returned without provider-specific parsing.",
    inputSchema: schema({
      toolId: { type: "string", description: "Fully qualified local tool id." },
      input: { type: "object", description: "JSON input passed to the MCP tool.", additionalProperties: true },
    }, ["toolId"]),
    handler: (harbor, input) => harbor.tools.invoke(
      stringParam(input, "toolId") ?? "",
      input.input ?? {},
      { confirmWrites: true }
    ),
  },
  {
    name: "harbor_exec_run",
    description: "Run JavaScript in the Harbor local QuickJS runtime. Installed MCP plugin namespaces are resolved by the SDK backend and plugin calls are traced.",
    inputSchema: schema({
      code: { type: "string", description: "JavaScript body to run inside an async QuickJS wrapper. Use namespace globals from harbor_exec_tool_guide." },
      input: { description: "Optional JSON value exposed to the script as input." },
      timeoutMs: { type: "number", description: "Optional execution timeout in milliseconds." },
      confirmWrites: { type: "boolean", description: "Set true to allow write tools. Defaults to false." },
    }, ["code"]),
    handler: (harbor, input) => harbor.exec.run(
      stringParam(input, "code") ?? "",
      {
        input: input.input,
        timeoutMs: numberParam(input, "timeoutMs"),
        confirmWrites: input.confirmWrites === true,
      }
    ),
  },
  {
    name: "harbor_exec_tool_guide",
    description: "List JavaScript namespace globals and callable methods available to Harbor local QuickJS exec.",
    inputSchema: schema({}),
    handler: (harbor) => harbor.exec.toolGuide(),
  },
  {
    name: "harbor_invocations_list",
    description: "List recent local Harbor tool invocation history without exposing credentials.",
    inputSchema: schema({
      namespace: { type: "string", description: "Optional namespace filter." },
      toolId: { type: "string", description: "Optional fully qualified tool id filter." },
      limit: { type: "number", description: "Maximum rows. Defaults to 50." },
    }),
    handler: (harbor, input) => harbor.invocations.list({
      namespace: stringParam(input, "namespace"),
      toolId: stringParam(input, "toolId"),
      limit: numberParam(input, "limit"),
    }),
  },
]

const toolByName = new Map(tools.map((tool) => [tool.name, tool]))

export async function handleLocalHarborMcpRequest(
  input: HarborLocalServerInput,
  request: Request
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Local Harbor MCP endpoint expects POST JSON-RPC requests.", { status: 405 })
  }

  let rpc: JsonRpcRequest
  try {
    rpc = await request.json() as JsonRpcRequest
  } catch {
    return jsonRpcError(null, -32700, "Parse error")
  }

  if (rpc.method === "notifications/initialized") return new Response(null, { status: 202 })
  if (!rpc.method) return jsonRpcError(rpc.id, -32600, "Invalid request")

  if (rpc.method === "initialize") {
    return jsonRpc(rpc.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: {
        name: "harbor-local",
        version: "0.1.0",
      },
      instructions: "Use this local Harbor MCP server to search and invoke MCP plugin tools already connected through the local Harbor UI.",
    })
  }

  if (rpc.method === "tools/list") {
    return jsonRpc(rpc.id, {
      tools: tools.map(({ handler: _handler, ...tool }) => tool),
    })
  }

  if (rpc.method === "tools/call") {
    const params = objectParams(rpc.params)
    const name = stringParam(params, "name")
    const tool = name ? toolByName.get(name) : undefined
    if (!tool) return jsonRpcError(rpc.id, -32602, `Unknown local Harbor MCP tool "${name ?? ""}".`)
    try {
      const result = await tool.handler(runtime(input), objectParams(params.arguments))
      return jsonRpc(rpc.id, mcpText(result))
    } catch (error) {
      return jsonRpc(rpc.id, {
        isError: true,
        content: [{
          type: "text",
          text: error instanceof Error ? error.message : String(error),
        }],
      })
    }
  }

  return jsonRpcError(rpc.id, -32601, `Unknown MCP method ${rpc.method}`)
}
