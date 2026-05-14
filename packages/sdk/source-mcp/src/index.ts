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
  /**
   * Allow localhost and private-network endpoints. Defaults to false so hosted
   * SDK users do not accidentally create an SSRF path. Developer-owned local
   * runtimes can opt in explicitly for local MCP servers.
   */
  readonly allowLocalNetwork?: boolean | undefined
  /** Per-request timeout. Defaults to 30s. */
  readonly timeoutMs?: number | undefined
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

const DEFAULT_TIMEOUT_MS = 30_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseIpv4(hostname: string): readonly [number, number, number, number] | null {
  const parts = hostname.split('.')
  if (parts.length !== 4) return null
  const parsed = [Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3])] as const
  if (
    parsed.some((part, index) =>
      !/^\d+$/.test(parts[index] ?? '') ||
      !Number.isInteger(part) ||
      part < 0 ||
      part > 255
    )
  ) {
    return null
  }
  return parsed
}

function parseIpv4MappedIpv6(hostname: string): readonly [number, number, number, number] | null {
  const normalized = hostname.toLowerCase()
  if (!normalized.startsWith('::ffff:')) return null
  return parseIpv4(normalized.slice('::ffff:'.length))
}

function isPrivateIpv4([a, b]: readonly [number, number, number, number]): boolean {
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

function isLocalOrPrivateHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (normalized === 'localhost' || normalized.endsWith('.localhost')) return true
  const ipv4 = parseIpv4(normalized)
  if (ipv4) return isPrivateIpv4(ipv4)
  const mapped = parseIpv4MappedIpv6(normalized)
  if (mapped) return isPrivateIpv4(mapped)
  return (
    normalized === '::1' ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd')
  )
}

function validateEndpointUrl(input: McpSourceAdapterInput): void {
  let url: URL
  try {
    url = new URL(input.endpoint)
  } catch {
    throw new McpSourceError({
      method: 'configure',
      message: `MCP source "${input.namespace}" endpoint is not a valid URL.`,
    })
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new McpSourceError({
      method: 'configure',
      message: `MCP source "${input.namespace}" endpoint must use http or https.`,
    })
  }
  if (input.allowLocalNetwork !== true && isLocalOrPrivateHostname(url.hostname)) {
    throw new McpSourceError({
      method: 'configure',
      message: `MCP source "${input.namespace}" endpoint points to a local or private network host. Set allowLocalNetwork to opt in.`,
    })
  }
}

function composeAbortSignal(signal: AbortSignal | undefined, timeoutMs: number): {
  readonly signal: AbortSignal
  readonly dispose: () => void
} {
  const controller = new AbortController()
  const abort = () => controller.abort(signal?.reason)
  if (signal?.aborted) abort()
  else signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(() => controller.abort(new Error(`MCP request timed out after ${timeoutMs}ms`)), timeoutMs)
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    },
  }
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
  let raw: unknown
  try {
    raw = contentType.includes('text/event-stream')
      ? readSseJson(text)
      : (JSON.parse(text) as unknown)
  } catch (error) {
    throw new McpSourceError({
      method,
      message: `MCP ${method} response was not valid JSON.`,
      data: error instanceof Error ? error.message : String(error),
    })
  }
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
  validateEndpointUrl(input)
  const fetchImpl = input.fetch ?? globalThis.fetch
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new McpSourceError({
      method: 'configure',
      message: `MCP source "${input.namespace}" timeoutMs must be a positive number.`,
    })
  }
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
    options?: { readonly notification?: boolean | undefined; readonly signal?: AbortSignal | undefined }
  ): Promise<T> {
    const abort = composeAbortSignal(options?.signal, timeoutMs)
    try {
      const response = await fetchImpl(input.endpoint, {
        method: 'POST',
        redirect: 'error',
        headers: await headers(ctx, method),
        signal: abort.signal,
        body: JSON.stringify({
          jsonrpc: '2.0',
          ...(options?.notification ? {} : { id: nextId++ }),
          method,
          ...(params === undefined ? {} : { params }),
        } satisfies JsonRpcRequest),
      })
      sessionId = response.headers.get('mcp-session-id') ?? sessionId
      return rpcResult<T>(await readRpcResponse(response, method), method)
    } catch (error) {
      if (error instanceof McpSourceError) throw error
      throw new McpSourceError({
        method,
        message: error instanceof Error ? error.message : `MCP ${method} request failed.`,
        data: error,
      })
    } finally {
      abort.dispose()
    }
  }

  async function initialize(ctx: McpSourceHeaderContext & { readonly signal?: AbortSignal | undefined }): Promise<void> {
    if (initialized) return
    await send(
      'initialize',
      {
        protocolVersion: input.protocolVersion ?? '2025-03-26',
        capabilities: {},
        clientInfo: input.clientInfo ?? { name: '@hrbr/source-mcp', version: '0.0.0' },
      },
      ctx,
      { signal: ctx.signal }
    )
    await send('notifications/initialized', undefined, ctx, { notification: true, signal: ctx.signal })
    initialized = true
  }

  async function listTools(
    ctx?: SourceAdapterListContext
  ): Promise<readonly SourceToolDefinition[]> {
    await initialize({ credentials: ctx?.credentials, signal: ctx?.signal })
    const tools: SourceToolDefinition[] = []
    let cursor: string | undefined
    do {
      const result = await send<McpToolsListResult>(
        'tools/list',
        cursor === undefined ? {} : { cursor },
        { credentials: ctx?.credentials },
        { signal: ctx?.signal }
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
      await initialize({ credentials: ctx?.credentials, signal: ctx?.signal })
      return send(
        'tools/call',
        {
          name,
          arguments: toolInput,
        },
        { credentials: ctx?.credentials },
        { signal: ctx?.signal }
      )
    },
  })
}
