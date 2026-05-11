import { defineSourceAdapter } from '@hrbr/source-core'
import type {
  SourceAdapter,
  SourceAdapterCredentials,
  SourceAdapterInvokeContext,
  SourceAdapterListContext,
  SourceToolDefinition,
} from '@hrbr/source-core'

export type McpSourceFetch = (
  input: string | URL | Request,
  init?: RequestInit
) => Promise<Response>

export interface McpSourceHeaderContext {
  readonly credentials?: SourceAdapterCredentials | undefined
}

export interface McpSourceAdapterInput {
  readonly id?: string | undefined
  readonly namespace: string
  readonly displayName: string
  readonly endpoint: string
  readonly fetch?: McpSourceFetch | undefined
  readonly headers?:
    | Readonly<Record<string, string | undefined>>
    | ((
        ctx: McpSourceHeaderContext
      ) =>
        | Readonly<Record<string, string | undefined>>
        | Promise<Readonly<Record<string, string | undefined>>>)
    | undefined
  readonly bearerCredentialSlot?: string | undefined
  readonly protocolVersion?: string | undefined
  readonly clientInfo?:
    | {
        readonly name: string
        readonly version?: string | undefined
      }
    | undefined
}

interface JsonRpcRequest {
  readonly jsonrpc: '2.0'
  readonly id?: number | string | undefined
  readonly method: string
  readonly params?: unknown
}

interface JsonRpcResponse {
  readonly jsonrpc?: string | undefined
  readonly id?: number | string | null | undefined
  readonly result?: unknown
  readonly error?:
    | {
        readonly code?: number | undefined
        readonly message?: string | undefined
        readonly data?: unknown
      }
    | undefined
}

interface McpTool {
  readonly name: string
  readonly description?: string | undefined
  readonly inputSchema?: Readonly<Record<string, unknown>> | undefined
  readonly outputSchema?: Readonly<Record<string, unknown>> | undefined
  readonly annotations?: unknown
}

interface McpToolsListResult {
  readonly tools?: readonly McpTool[] | undefined
  readonly nextCursor?: string | undefined
}

export class McpSourceError extends Error {
  readonly method: string
  readonly status?: number | undefined
  readonly code?: number | undefined
  readonly data?: unknown

  constructor(input: {
    readonly method: string
    readonly message: string
    readonly status?: number | undefined
    readonly code?: number | undefined
    readonly data?: unknown
  }) {
    super(input.message)
    this.name = 'McpSourceError'
    this.method = input.method
    this.status = input.status
    this.code = input.code
    this.data = input.data
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function readRpcResponse(
  response: Response,
  method: string
): Promise<JsonRpcResponse | null> {
  const text = await response.text()
  if (!response.ok) {
    throw new McpSourceError({
      method,
      status: response.status,
      message: text.length > 0 ? text : `MCP request failed with status ${response.status}`,
    })
  }
  if (text.trim().length === 0) return null
  const contentType = response.headers.get('content-type') ?? ''
  const raw = contentType.includes('text/event-stream')
    ? readSseJson(text)
    : (JSON.parse(text) as unknown)
  if (!isRecord(raw))
    throw new McpSourceError({ method, message: 'MCP response was not a JSON object.' })
  return raw as JsonRpcResponse
}

function readSseJson(text: string): unknown {
  const data = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .find((line) => line.length > 0 && line !== '[DONE]')
  if (!data) return {}
  return JSON.parse(data) as unknown
}

function rpcResult<T>(response: JsonRpcResponse | null, method: string): T {
  if (response?.error) {
    throw new McpSourceError({
      method,
      code: response.error.code,
      data: response.error.data,
      message: response.error.message ?? `MCP ${method} failed.`,
    })
  }
  return response?.result as T
}

function toolDefinition(tool: McpTool): SourceToolDefinition {
  return {
    name: tool.name,
    ...(tool.description !== undefined ? { description: tool.description } : {}),
    ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
    ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema } : {}),
    ...(tool.annotations !== undefined ? { annotations: tool.annotations } : {}),
    kind: 'mcp',
  }
}

export function createMcpHttpSourceAdapter(input: McpSourceAdapterInput): SourceAdapter {
  const fetchImpl = input.fetch ?? globalThis.fetch
  let nextId = 1
  let initialized = false
  let sessionId: string | undefined

  async function headers(
    ctx: McpSourceHeaderContext,
    method: string
  ): Promise<Record<string, string>> {
    const resolved: Record<string, string> = {
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
    }
    if (sessionId !== undefined) resolved['mcp-session-id'] = sessionId
    if (input.bearerCredentialSlot !== undefined) {
      if (!ctx.credentials) {
        throw new McpSourceError({
          method,
          message: `MCP source "${input.namespace}" requires credential slot "${input.bearerCredentialSlot}".`,
        })
      }
      resolved.authorization = `Bearer ${ctx.credentials.require(input.bearerCredentialSlot)}`
    }
    const extra = typeof input.headers === 'function' ? await input.headers(ctx) : input.headers
    for (const [key, value] of Object.entries(extra ?? {})) {
      if (value !== undefined) resolved[key] = value
    }
    return resolved
  }

  async function send<T>(
    method: string,
    params: unknown,
    ctx: McpSourceHeaderContext,
    options?: { readonly notification?: boolean | undefined }
  ): Promise<T> {
    const response = await fetchImpl(input.endpoint, {
      method: 'POST',
      headers: await headers(ctx, method),
      body: JSON.stringify({
        jsonrpc: '2.0',
        ...(options?.notification ? {} : { id: nextId++ }),
        method,
        ...(params === undefined ? {} : { params }),
      } satisfies JsonRpcRequest),
    })
    sessionId = response.headers.get('mcp-session-id') ?? sessionId
    return rpcResult<T>(await readRpcResponse(response, method), method)
  }

  async function initialize(ctx: McpSourceHeaderContext): Promise<void> {
    if (initialized) return
    await send(
      'initialize',
      {
        protocolVersion: input.protocolVersion ?? '2025-03-26',
        capabilities: {},
        clientInfo: input.clientInfo ?? { name: '@hrbr/source-mcp' },
      },
      ctx
    )
    await send('notifications/initialized', undefined, ctx, { notification: true })
    initialized = true
  }

  async function listTools(
    ctx?: SourceAdapterListContext
  ): Promise<readonly SourceToolDefinition[]> {
    await initialize({ credentials: ctx?.credentials })
    const tools: SourceToolDefinition[] = []
    let cursor: string | undefined
    do {
      const result = await send<McpToolsListResult>(
        'tools/list',
        cursor === undefined ? {} : { cursor },
        { credentials: ctx?.credentials }
      )
      tools.push(...(result.tools ?? []).map(toolDefinition))
      cursor = result.nextCursor
    } while (cursor !== undefined)
    return tools
  }

  return defineSourceAdapter({
    id: input.id,
    namespace: input.namespace,
    displayName: input.displayName,
    kind: 'mcp',
    listTools,
    describeTool: async (name, ctx) => {
      const tools = await listTools(ctx)
      return tools.find((tool) => tool.name === name) ?? null
    },
    invokeTool: async (name, toolInput, ctx?: SourceAdapterInvokeContext) => {
      await initialize({ credentials: ctx?.credentials })
      return send(
        'tools/call',
        {
          name,
          arguments: toolInput,
        },
        { credentials: ctx?.credentials }
      )
    },
  })
}
