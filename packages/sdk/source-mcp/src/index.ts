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
  readonly protocolVersions?: readonly string[] | undefined
  readonly clientInfo?:
    | {
        readonly name: string
        readonly version?: string | undefined
      }
    | undefined
}

export type McpHttpProbeStatus =
  | 'ready'
  | 'auth_required'
  | 'blocked'
  | 'http_error'
  | 'invalid_response'
  | 'mcp_error'
  | 'network_error'

export interface McpHttpProbeResult {
  readonly ok: boolean
  readonly status: McpHttpProbeStatus
  readonly endpoint: string
  readonly namespace: string
  readonly message: string
  readonly method?: string | undefined
  readonly statusCode?: number | undefined
  readonly code?: number | undefined
  readonly dataShape?: unknown
  readonly protocolVersion?: string | undefined
  readonly serverInfo?: unknown
  readonly capabilities?: unknown
  readonly instructions?: string | undefined
  readonly sessionId?: string | undefined
}

export interface McpHttpProbeInput extends McpSourceAdapterInput {
  readonly credentials?: SourceAdapterCredentials | undefined
  readonly signal?: AbortSignal | undefined
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

interface McpPromptArgument {
  readonly name: string
  readonly description?: string | undefined
  readonly required?: boolean | undefined
}

interface McpPrompt {
  readonly name: string
  readonly description?: string | undefined
  readonly arguments?: readonly McpPromptArgument[] | undefined
}

interface McpPromptsListResult {
  readonly prompts?: readonly McpPrompt[] | undefined
  readonly nextCursor?: string | undefined
}

interface McpResource {
  readonly uri: string
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly mimeType?: string | undefined
}

interface McpResourcesListResult {
  readonly resources?: readonly McpResource[] | undefined
  readonly nextCursor?: string | undefined
}

interface McpResourceTemplate {
  readonly uriTemplate: string
  readonly name?: string | undefined
  readonly description?: string | undefined
  readonly mimeType?: string | undefined
}

interface McpResourceTemplatesListResult {
  readonly resourceTemplates?: readonly McpResourceTemplate[] | undefined
  readonly nextCursor?: string | undefined
}

interface McpInitializeResult {
  readonly protocolVersion?: string | undefined
  readonly serverInfo?: unknown
  readonly capabilities?: unknown
  readonly instructions?: string | undefined
}

interface McpListedDefinition {
  readonly definition: SourceToolDefinition
  readonly invoke:
    | { readonly kind: 'tool'; readonly name: string }
    | { readonly kind: 'prompt'; readonly name: string }
    | { readonly kind: 'resource'; readonly uri: string }
    | { readonly kind: 'resource_template'; readonly uriTemplate: string }
}

interface McpHttpSessionState {
  nextId: number
  sessionId: string | undefined
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
const DEFAULT_PROTOCOL_VERSIONS = [
  '2025-11-25',
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
  '2024-10-07',
] as const

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

function validateTimeoutMs(input: McpSourceAdapterInput): number {
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new McpSourceError({
      method: 'configure',
      message: `MCP source "${input.namespace}" timeoutMs must be a positive number.`,
    })
  }
  return timeoutMs
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

async function requestHeaders(
  input: McpSourceAdapterInput,
  sessionId: string | undefined,
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

async function sendRpc<T>(
  input: McpSourceAdapterInput,
  state: McpHttpSessionState,
  method: string,
  params: unknown,
  ctx: McpSourceHeaderContext,
  options?: { readonly notification?: boolean | undefined; readonly signal?: AbortSignal | undefined }
): Promise<T> {
  const fetchImpl = input.fetch ?? globalThis.fetch
  const abort = composeAbortSignal(options?.signal, validateTimeoutMs(input))
  try {
    const response = await fetchImpl(input.endpoint, {
      method: 'POST',
      redirect: 'error',
      headers: await requestHeaders(input, state.sessionId, ctx, method),
      signal: abort.signal,
      body: JSON.stringify({
        jsonrpc: '2.0',
        ...(options?.notification ? {} : { id: state.nextId++ }),
        method,
        ...(params === undefined ? {} : { params }),
      } satisfies JsonRpcRequest),
    })
    state.sessionId = response.headers.get('mcp-session-id') ?? state.sessionId
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

function dataShape(value: unknown): unknown {
  if (Array.isArray(value)) return { type: 'array', length: value.length }
  if (isRecord(value)) return { type: 'object', keys: Object.keys(value).slice(0, 12) }
  if (value === null) return { type: 'null' }
  return { type: typeof value }
}

function probeError(input: McpSourceAdapterInput, error: unknown): McpHttpProbeResult {
  if (error instanceof McpSourceError) {
    const status: McpHttpProbeStatus =
      error.method === 'configure'
        ? 'blocked'
        : error.status === 401 || error.status === 403
          ? 'auth_required'
          : error.status !== undefined
            ? 'http_error'
            : error.code !== undefined
              ? 'mcp_error'
              : /not valid JSON|not a JSON object|response/i.test(error.message)
                ? 'invalid_response'
                : 'network_error'
    return {
      ok: false,
      status,
      endpoint: input.endpoint,
      namespace: input.namespace,
      message: error.message,
      method: error.method,
      ...(error.status !== undefined ? { statusCode: error.status } : {}),
      ...(error.code !== undefined ? { code: error.code } : {}),
      ...(error.data !== undefined ? { dataShape: dataShape(error.data) } : {}),
    }
  }
  return {
    ok: false,
    status: 'network_error',
    endpoint: input.endpoint,
    namespace: input.namespace,
    message: error instanceof Error ? error.message : String(error),
  }
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

function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '_') || 'mcp'
}

function humanize(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

function promptDefinition(prompt: McpPrompt): McpListedDefinition {
  const properties: Record<string, unknown> = {}
  const required: string[] = []
  for (const arg of prompt.arguments ?? []) {
    properties[arg.name] = {
      type: 'string',
      ...(arg.description !== undefined ? { description: arg.description } : {}),
    }
    if (arg.required) required.push(arg.name)
  }
  return {
    definition: {
      name: `prompt_${sanitizeName(prompt.name)}`,
      displayName: prompt.description ?? humanize(prompt.name),
      ...(prompt.description !== undefined ? { description: prompt.description } : {}),
      inputSchema: {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
      },
      annotations: { readOnlyHint: true, harborMcpBinding: { kind: 'prompt', name: prompt.name } },
      tags: ['prompt', 'read_only'],
      kind: 'mcp',
    },
    invoke: { kind: 'prompt', name: prompt.name },
  }
}

function resourceDefinition(resource: McpResource): McpListedDefinition {
  const label = resource.name ?? resource.uri
  return {
    definition: {
      name: `resource_${sanitizeName(resource.name ?? resource.uri.split('/').pop() ?? 'read')}`,
      displayName: label,
      description: resource.description ?? `Read MCP resource: ${resource.uri}`,
      inputSchema: {
        type: 'object',
        properties: {
          uri: { type: 'string', const: resource.uri },
        },
      },
      annotations: { readOnlyHint: true, harborMcpBinding: { kind: 'resource', uri: resource.uri } },
      tags: ['resource', 'read_only'],
      kind: 'mcp',
    },
    invoke: { kind: 'resource', uri: resource.uri },
  }
}

function resourceTemplateDefinition(template: McpResourceTemplate): McpListedDefinition {
  const params = (template.uriTemplate.match(/\{([^}]+)\}/g) ?? []).map((param) => param.slice(1, -1))
  const properties: Record<string, unknown> = {}
  for (const param of params) {
    properties[param] = { type: 'string', description: `Template parameter: ${param}` }
  }
  return {
    definition: {
      name: `resource_template_${sanitizeName(template.name ?? template.uriTemplate.split('/').pop() ?? 'read')}`,
      displayName: template.name ?? template.uriTemplate,
      description: template.description ?? `Read MCP resource template: ${template.uriTemplate}`,
      inputSchema: {
        type: 'object',
        properties,
        ...(params.length > 0 ? { required: params } : {}),
      },
      annotations: {
        readOnlyHint: true,
        harborMcpBinding: { kind: 'resource_template', uriTemplate: template.uriTemplate },
      },
      tags: ['resource', 'template', 'read_only'],
      kind: 'mcp',
    },
    invoke: { kind: 'resource_template', uriTemplate: template.uriTemplate },
  }
}

function protocolVersions(input: McpSourceAdapterInput): readonly string[] {
  if (input.protocolVersions?.length) return [...input.protocolVersions]
  if (input.protocolVersion) return [input.protocolVersion]
  return DEFAULT_PROTOCOL_VERSIONS
}

async function initializeSession(input: McpSourceAdapterInput, send: <T>(
  method: string,
  params: unknown,
  ctx: McpSourceHeaderContext,
  options?: { readonly notification?: boolean | undefined; readonly signal?: AbortSignal | undefined }
) => Promise<T>, ctx: McpSourceHeaderContext & { readonly signal?: AbortSignal | undefined }): Promise<McpInitializeResult> {
  let lastError: unknown
  for (const version of protocolVersions(input)) {
    try {
      const result = await send<McpInitializeResult>(
        'initialize',
        {
          protocolVersion: version,
          capabilities: {},
          clientInfo: input.clientInfo ?? { name: '@hrbr/source-mcp', version: '0.0.0' },
        },
        ctx,
        { signal: ctx.signal }
      )
      await send('notifications/initialized', undefined, ctx, { notification: true, signal: ctx.signal })
      return result
    } catch (error) {
      lastError = error
      if (input.protocolVersion || (error instanceof McpSourceError && error.status !== undefined)) break
    }
  }
  throw lastError
}

export function createMcpHttpSourceAdapter(input: McpSourceAdapterInput): SourceAdapter {
  validateEndpointUrl(input)
  validateTimeoutMs(input)
  let initialized = false
  let listedDefinitions: readonly McpListedDefinition[] | null = null
  const state: McpHttpSessionState = { nextId: 1, sessionId: undefined }

  async function send<T>(
    method: string,
    params: unknown,
    ctx: McpSourceHeaderContext,
    options?: { readonly notification?: boolean | undefined; readonly signal?: AbortSignal | undefined }
  ): Promise<T> {
    return sendRpc(input, state, method, params, ctx, options)
  }

  async function initialize(ctx: McpSourceHeaderContext & { readonly signal?: AbortSignal | undefined }): Promise<void> {
    if (initialized) return
    await initializeSession(input, send, ctx)
    initialized = true
  }

  async function listOptional<T>(
    method: string,
    key: string,
    ctx: SourceAdapterListContext | undefined,
    mapItem: (item: T) => McpListedDefinition
  ): Promise<readonly McpListedDefinition[]> {
    const items: McpListedDefinition[] = []
    let cursor: string | undefined
    do {
      const result = await send<Record<string, unknown>>(
        method,
        cursor === undefined ? {} : { cursor },
        { credentials: ctx?.credentials },
        { signal: ctx?.signal }
      )
      const page = result[key]
      if (Array.isArray(page)) items.push(...(page as T[]).map(mapItem))
      cursor = typeof result.nextCursor === 'string' ? result.nextCursor : undefined
    } while (cursor !== undefined)
    return items
  }

  async function listDefinitions(
    ctx?: SourceAdapterListContext
  ): Promise<readonly McpListedDefinition[]> {
    await initialize({ credentials: ctx?.credentials, signal: ctx?.signal })
    if (listedDefinitions) return listedDefinitions
    const definitions: McpListedDefinition[] = []
    let cursor: string | undefined
    do {
      const result = await send<McpToolsListResult>(
        'tools/list',
        cursor === undefined ? {} : { cursor },
        { credentials: ctx?.credentials },
        { signal: ctx?.signal }
      )
      definitions.push(...(result.tools ?? []).map((tool) => ({
        definition: toolDefinition(tool),
        invoke: { kind: 'tool', name: tool.name } as const,
      })))
      cursor = result.nextCursor
    } while (cursor !== undefined)

    const optional = await Promise.all([
      listOptional<McpPrompt>('prompts/list', 'prompts', ctx, promptDefinition).catch(() => []),
      listOptional<McpResource>('resources/list', 'resources', ctx, resourceDefinition).catch(() => []),
      listOptional<McpResourceTemplate>('resources/templates/list', 'resourceTemplates', ctx, resourceTemplateDefinition).catch(() => []),
    ])
    definitions.push(...optional.flat())
    listedDefinitions = definitions
    return definitions
  }

  async function listTools(
    ctx?: SourceAdapterListContext
  ): Promise<readonly SourceToolDefinition[]> {
    return (await listDefinitions(ctx)).map((item) => item.definition)
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
      const binding = (await listDefinitions(ctx)).find((item) => item.definition.name === name)?.invoke ?? { kind: 'tool' as const, name }
      if (binding.kind === 'prompt') {
        return send(
          'prompts/get',
          { name: binding.name, arguments: toolInput },
          { credentials: ctx?.credentials },
          { signal: ctx?.signal }
        )
      }
      if (binding.kind === 'resource') {
        return send(
          'resources/read',
          { uri: binding.uri },
          { credentials: ctx?.credentials },
          { signal: ctx?.signal }
        )
      }
      if (binding.kind === 'resource_template') {
        let uri = binding.uriTemplate
        const templateInput = isRecord(toolInput) ? toolInput : {}
        for (const [key, value] of Object.entries(templateInput)) {
          uri = uri.replace(`{${key}}`, encodeURIComponent(String(value)))
        }
        return send(
          'resources/read',
          { uri },
          { credentials: ctx?.credentials },
          { signal: ctx?.signal }
        )
      }
      return send(
        'tools/call',
        {
          name: binding.name,
          arguments: toolInput,
        },
        { credentials: ctx?.credentials },
        { signal: ctx?.signal }
      )
    },
  })
}

export async function probeMcpHttpSource(input: McpHttpProbeInput): Promise<McpHttpProbeResult> {
  try {
    validateEndpointUrl(input)
    validateTimeoutMs(input)
    const state: McpHttpSessionState = { nextId: 1, sessionId: undefined }
    const result = await initializeSession(input, (method, params, ctx, options) =>
      sendRpc(input, state, method, params, ctx, options), {
        credentials: input.credentials,
        signal: input.signal,
      })
    if (!isRecord(result)) {
      return {
        ok: false,
        status: 'invalid_response',
        endpoint: input.endpoint,
        namespace: input.namespace,
        message: 'MCP initialize result was not a JSON object.',
        method: 'initialize',
        dataShape: dataShape(result),
        ...(state.sessionId !== undefined ? { sessionId: state.sessionId } : {}),
      }
    }
    const initialize = result as McpInitializeResult
    return {
      ok: true,
      status: 'ready',
      endpoint: input.endpoint,
      namespace: input.namespace,
      message: `MCP source "${input.namespace}" handshake completed.`,
      method: 'initialize',
      ...(typeof initialize.protocolVersion === 'string' ? { protocolVersion: initialize.protocolVersion } : {}),
      ...(initialize.serverInfo !== undefined ? { serverInfo: initialize.serverInfo } : {}),
      ...(initialize.capabilities !== undefined ? { capabilities: initialize.capabilities } : {}),
      ...(typeof initialize.instructions === 'string' ? { instructions: initialize.instructions } : {}),
      ...(state.sessionId !== undefined ? { sessionId: state.sessionId } : {}),
    }
  } catch (error) {
    return probeError(input, error)
  }
}
