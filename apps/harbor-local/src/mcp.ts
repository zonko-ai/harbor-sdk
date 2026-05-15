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

interface LocalReefTool extends McpToolDefinition {
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

function reefText(value: unknown, ok = true): {
  readonly content: readonly [{ readonly type: "text"; readonly text: string }]
  readonly isError: boolean
} {
  return {
    content: [{
      type: "text",
      text: `ok: ${ok ? "true" : "false"}\nresult:\n${JSON.stringify(value, null, 2)}`,
    }],
    isError: !ok,
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

function quotedArg(code: string): string | undefined {
  return /["']([^"']+)["']/.exec(code)?.[1]
}

function fieldString(code: string, key: string): string | undefined {
  return new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`).exec(code)?.[1]
}

function fieldNumber(code: string, key: string): number | undefined {
  const raw = new RegExp(`${key}\\s*:\\s*(\\d+)`).exec(code)?.[1]
  return raw ? Number(raw) : undefined
}

function fieldBoolean(code: string, key: string): boolean | undefined {
  const raw = new RegExp(`${key}\\s*:\\s*(true|false)`).exec(code)?.[1]
  return raw === undefined ? undefined : raw === "true"
}

async function inspectLocalHarbor(harbor: HarborLocalRuntime, code: string): Promise<unknown> {
  if (/hrbr\.sources\.list\s*\(/.test(code)) {
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
  }

  if (/hrbr\.sources\.refresh\s*\(/.test(code)) {
    const sourceId = fieldString(code, "sourceId") ?? fieldString(code, "source") ?? fieldString(code, "namespace") ?? quotedArg(code)
    if (!sourceId) throw new Error("hrbr.sources.refresh requires sourceId, source, namespace, or a quoted source id.")
    return harbor.sources.refreshMcp(sourceId)
  }

  if (/hrbr\.tools\.search\s*\(/.test(code)) {
    const query = fieldString(code, "query") ?? quotedArg(code) ?? ""
    const namespace = fieldString(code, "namespace") ?? fieldString(code, "source")
    const limit = fieldNumber(code, "limit")
    const describe = fieldBoolean(code, "describe") === true
    const result = await harbor.tools.search({ query, namespace, limit })
    if (!describe) return result
    return {
      tools: await Promise.all(result.map(async (hit) => ({
        ...hit,
        schema: await harbor.tools.schema(hit.toolId),
      }))),
    }
  }

  if (/hrbr\.tools\.schema\s*\(/.test(code)) {
    const toolId = fieldString(code, "toolId") ?? quotedArg(code)
    if (!toolId) throw new Error("hrbr.tools.schema requires a quoted tool id or { toolId }.")
    return harbor.tools.schema(toolId)
  }

  if (/hrbr\.exec\.toolGuide\s*\(|hrbr\.tools\.guide\s*\(/.test(code)) {
    return harbor.exec.toolGuide()
  }

  if (/hrbr\.invocations\.list\s*\(|hrbr\.traces\.list\s*\(/.test(code)) {
    return harbor.invocations.list({
      namespace: fieldString(code, "namespace") ?? fieldString(code, "source"),
      toolId: fieldString(code, "toolId"),
      limit: fieldNumber(code, "limit"),
    })
  }

  if (/hrbr\.runtime\.status\s*\(|hrbr\.auth\.status\s*\(|hrbr\.workspace\.current\s*\(/.test(code)) {
    const sources = await harbor.sources.listMcp()
    const invocations = await harbor.invocations.list({ limit: 5 })
    return {
      runtime: "local",
      workspace: "local",
      sourceCount: sources.length,
      recentInvocationCount: invocations.length,
      availableInspectCalls: [
        "hrbr.sources.list()",
        "hrbr.sources.refresh({ sourceId })",
        "hrbr.tools.search({ query, namespace?, source?, limit?, describe? })",
        "hrbr.tools.schema({ toolId })",
        "hrbr.exec.toolGuide()",
        "hrbr.invocations.list({ namespace?, toolId?, limit? })",
      ],
    }
  }

  throw new Error("Unsupported inspect code. Use hrbr.sources.list(), hrbr.tools.search(...), hrbr.tools.schema(...), hrbr.exec.toolGuide(), or hrbr.invocations.list(...).")
}

const tools: readonly LocalReefTool[] = [
  {
    name: "inspect",
    description: "Inspect local Harbor state for planning. Use hrbr.sources.list(), hrbr.tools.search(...), hrbr.tools.schema(...), hrbr.exec.toolGuide(), or hrbr.invocations.list(...).",
    inputSchema: schema({
      code: { type: "string", description: "Reef inspect JavaScript using the hrbr control-plane global." },
      timeout_ms: { type: "number", description: "Accepted for Reef compatibility; local inspect calls are bounded by their SDK calls." },
    }, ["code"]),
    handler: (harbor, input) => inspectLocalHarbor(harbor, stringParam(input, "code") ?? ""),
  },
  {
    name: "exec",
    description: "Run JavaScript in the Harbor local QuickJS runtime. Installed MCP plugin namespaces are resolved by the SDK backend and plugin calls are traced.",
    inputSchema: schema({
      code: { type: "string", description: "JavaScript body to run inside an async QuickJS wrapper. Use namespace globals discovered through inspect: hrbr.exec.toolGuide()." },
      input: { description: "Optional JSON value exposed to the script as input." },
      timeout_ms: { type: "number", description: "Optional execution timeout in milliseconds." },
      confirm_writes: { type: "boolean", description: "Set true to allow write tools. Defaults to false." },
    }, ["code"]),
    handler: (harbor, input) => harbor.exec.run(
      stringParam(input, "code") ?? "",
      {
        input: input.input,
        timeoutMs: numberParam(input, "timeout_ms"),
        confirmWrites: input.confirm_writes === true,
      }
    ),
  },
]

const toolByName = new Map(tools.map((tool) => [tool.name, tool]))

export async function handleLocalHarborMcpRequest(
  input: HarborLocalServerInput,
  request: Request
): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Local Reef MCP endpoint expects POST JSON-RPC requests.", { status: 405 })
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
        name: "reef",
        version: "0.1.0-local",
      },
      instructions: "Use Reef with exactly two tools: inspect for local Harbor discovery and exec for local QuickJS execution through installed MCP plugins.",
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
    if (!tool) return jsonRpcError(rpc.id, -32602, `Unknown Reef MCP tool "${name ?? ""}".`)
    try {
      const result = await tool.handler(runtime(input), objectParams(params.arguments))
      return jsonRpc(rpc.id, reefText(result))
    } catch (error) {
      return jsonRpc(rpc.id, reefText({
        error: error instanceof Error ? error.message : String(error),
      }, false))
    }
  }

  return jsonRpcError(rpc.id, -32601, `Unknown MCP method ${rpc.method}`)
}
