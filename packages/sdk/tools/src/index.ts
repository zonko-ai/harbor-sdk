export {
  ExecuteArtifact,
  ExecuteResult,
  InvokeResult,
  InvokeResultContent,
  InvokeToolBody,
  InvokerResult,
  InvokerRuntimeConfig,
  ToolDescribeBody,
  ToolDescribeResponse,
  ToolIdsBody,
  ToolSchemaResponse,
  ToolSchemasResponse,
  ToolsListBody,
  ToolsListResult,
  ToolSearchKind,
  ToolSearchMode,
  ToolSignatureHit,
  ToolsSearchBody,
  ToolsSearchResponse,
} from '@hrbr/plugins'

export type { ToolInvoker } from '@hrbr/plugins'
import type { SpanError, TraceWriter } from '@hrbr/runs'
import type { SourceAdapter, SourceToolDefinition, SourceToolKind } from '@hrbr/source-core'
import type { CredentialResolver, ResolvedCredentials } from '@hrbr/source-credentials'
import { ToolPolicyDeniedError, type ToolPolicy } from '@hrbr/source-policy'

/**
 * Input for listing known tools in a registry.
 *
 * Platform implementations may read from an in-memory registry, a Cloudflare
 * backed store, or a remote Harbor workspace. Hosted Harbor clients translate
 * this shape to the existing `/plugins/tools/list` route.
 */
export interface ToolListInput {
  readonly sourceId?: string | undefined
  readonly namespace?: string | undefined
  readonly limit?: number | undefined
  readonly offset?: number | undefined
  readonly cursor?: string | undefined
}

/**
 * Input for intent or keyword search over callable tools.
 */
export interface ToolSearchInput {
  readonly query: string
  readonly limit?: number | undefined
  readonly source?: string | undefined
  readonly kind?: readonly ToolKindFilter[] | undefined
  readonly verbose?: boolean | undefined
  readonly mode?: import('@hrbr/plugins').ToolSearchMode | undefined
}

export type ToolKindFilter = import('@hrbr/plugins').ToolSearchKind

/**
 * Input for fetching a human and machine readable tool description.
 */
export interface ToolDescribeInput {
  readonly toolId: string
}

/**
 * Input for fetching a single tool schema.
 */
export interface ToolSchemaInput {
  readonly toolId: string
}

/**
 * Input for fetching many tool schemas in one request.
 */
export interface ToolSchemasInput {
  readonly toolIds: readonly string[]
}

export interface ToolInvokeInput {
  readonly toolId: string
  readonly input?: Readonly<Record<string, unknown>> | undefined
  readonly agentId?: string | undefined
  readonly runId?: string | undefined
}

export interface ToolExecuteSourceRef {
  readonly namespace: string
}

export interface ToolExecuteIdentity {
  readonly machineId: string
  readonly agentFamily: string
  readonly agentId?: string | undefined
  readonly session?: string | undefined
}

export interface ToolExecuteInput {
  readonly code: string
  readonly mode?: 'exec' | 'workflow' | undefined
  readonly sources?: readonly ToolExecuteSourceRef[] | undefined
  readonly timeoutMs?: number | undefined
  readonly runId?: string | undefined
  readonly identity?: ToolExecuteIdentity | undefined
}

export type ToolListPage = import('@hrbr/plugins').ToolsListResult
export type ToolSearchPage = import('@hrbr/plugins').ToolsSearchResponse
export type ToolDescription = import('@hrbr/plugins').ToolDescribeResponse
export type ToolSchema = import('@hrbr/plugins').ToolSchemaResponse
export type ToolInvocation = import('@hrbr/plugins').InvokeResult
export type ToolExecution = import('@hrbr/plugins').ExecuteResult

/**
 * Read-only tool catalog contract.
 *
 * This is the first SDK contract shared by platform adapters and the hosted
 * Harbor client. It intentionally contains no route names and no SaaS-only
 * concepts, so later platform implementations can satisfy it without an API
 * wrapper layer.
 */
export interface ToolRegistryReader {
  readonly list: (input?: ToolListInput) => Promise<ToolListPage>
  readonly search: (input: ToolSearchInput) => Promise<ToolSearchPage>
  readonly describe: (input: ToolDescribeInput) => Promise<ToolDescription>
  readonly schema: (input: ToolSchemaInput) => Promise<ToolSchema>
  readonly schemas: (input: ToolSchemasInput) => Promise<readonly ToolSchema[]>
}

export interface ToolInvocationClient {
  readonly invoke: (input: ToolInvokeInput) => Promise<ToolInvocation>
}

export interface ToolExecutionClient {
  readonly execute: (input: ToolExecuteInput) => Promise<ToolExecution>
}

export interface ToolClient extends ToolRegistryReader, ToolInvocationClient, ToolExecutionClient {}

export interface ToolRegistry extends ToolRegistryReader, ToolInvocationClient {
  readonly call: (
    toolId: string,
    input?: Readonly<Record<string, unknown>>
  ) => Promise<ToolInvocation>
}

export interface CreateToolRegistryInput {
  readonly sources: readonly SourceAdapter[]
  readonly credentials?: CredentialResolver | undefined
  readonly policy?: ToolPolicy | undefined
  readonly traces?: TraceWriter | undefined
  readonly workspaceId?: string | undefined
  readonly principalId?: string | undefined
  readonly now?: (() => Date) | undefined
  readonly callExample?:
    | ((input: {
        readonly toolId: string
        readonly namespace: string
        readonly name: string
      }) => string)
    | undefined
  readonly invocationId?:
    | ((input: {
        readonly toolId: string
        readonly namespace: string
        readonly name: string
        readonly runId?: string | undefined
      }) => string)
    | undefined
}

interface IndexedTool {
  readonly source: SourceAdapter
  readonly definition: SourceToolDefinition
  readonly toolId: string
  readonly namespace: string
  readonly name: string
}

const LOCAL_WORKSPACE_ID = 'local'
const DEFAULT_PAGE_LIMIT = 50

function sourceId(source: SourceAdapter): string {
  return source.id ?? source.namespace
}

function jsVar(namespace: string): string {
  return namespace.replace(/[^a-zA-Z0-9_$]/g, '_')
}

function displayName(definition: SourceToolDefinition): string {
  return definition.displayName ?? definition.name
}

function kindForSource(kind: SourceToolKind | undefined): ToolKindFilter {
  if (kind === 'cli') return 'cli_command'
  if (kind === 'api' || kind === 'custom') return 'api_request'
  return 'mcp'
}

function signatureFor(tool: IndexedTool): string {
  return `${jsVar(tool.namespace)}.${tool.name}(input)`
}

function defaultCallExample(tool: IndexedTool): string {
  return `await registry.call("${tool.toolId}", input)`
}

function toPluginTool(
  tool: IndexedTool,
  input: Pick<CreateToolRegistryInput, 'workspaceId' | 'now'>
): ToolListPage['data'][number] {
  const now = input.now ?? (() => new Date())
  return {
    id: tool.toolId,
    workspace_id: input.workspaceId ?? LOCAL_WORKSPACE_ID,
    source_id: sourceId(tool.source),
    tool_id: tool.toolId,
    name: tool.name,
    display_name: displayName(tool.definition),
    ...(tool.definition.description !== undefined
      ? { description: tool.definition.description }
      : {}),
    ...(tool.definition.inputSchema !== undefined
      ? { input_schema: tool.definition.inputSchema }
      : {}),
    ...(tool.definition.outputSchema !== undefined
      ? { output_schema: tool.definition.outputSchema }
      : {}),
    ...(tool.definition.inputType !== undefined ? { input_type: tool.definition.inputType } : {}),
    ...(tool.definition.outputType !== undefined
      ? { output_type: tool.definition.outputType }
      : {}),
    ...(tool.definition.typeDefinitions !== undefined
      ? { type_definitions: tool.definition.typeDefinitions }
      : {}),
    ...(tool.definition.annotations !== undefined
      ? { annotations: tool.definition.annotations }
      : {}),
    binding: { kind: 'custom', source: tool.namespace, tool: tool.name },
    tags: tool.definition.tags ? [...tool.definition.tags] : null,
    created_at: now().toISOString(),
    namespace: tool.namespace,
    js_var: jsVar(tool.namespace),
    signature: signatureFor(tool),
  }
}

function toDescription(
  tool: IndexedTool,
  input: Pick<CreateToolRegistryInput, 'callExample'>
): ToolDescription {
  return {
    tool_id: tool.toolId,
    name: tool.name,
    namespace: tool.namespace,
    js_var: jsVar(tool.namespace),
    display_name: displayName(tool.definition),
    signature: signatureFor(tool),
    ...(tool.definition.description !== undefined
      ? { description: tool.definition.description }
      : {}),
    ...(tool.definition.inputSchema !== undefined
      ? { input_schema: tool.definition.inputSchema }
      : {}),
    ...(tool.definition.outputSchema !== undefined
      ? { output_schema: tool.definition.outputSchema }
      : {}),
    ...(tool.definition.inputType !== undefined ? { input_type: tool.definition.inputType } : {}),
    ...(tool.definition.outputType !== undefined
      ? { output_type: tool.definition.outputType }
      : {}),
    ...(tool.definition.typeDefinitions !== undefined
      ? { type_definitions: tool.definition.typeDefinitions }
      : {}),
    call_example: input.callExample?.({
      toolId: tool.toolId,
      namespace: tool.namespace,
      name: tool.name,
    }) ?? defaultCallExample(tool),
    kind: kindForSource(tool.definition.kind ?? tool.source.kind),
  }
}

function toSchema(tool: IndexedTool): ToolSchema {
  return {
    tool_id: tool.toolId,
    name: tool.name,
    display_name: displayName(tool.definition),
    ...(tool.definition.description !== undefined
      ? { description: tool.definition.description }
      : {}),
    ...(tool.definition.inputSchema !== undefined
      ? { input_schema: tool.definition.inputSchema }
      : {}),
    ...(tool.definition.outputSchema !== undefined
      ? { output_schema: tool.definition.outputSchema }
      : {}),
    ...(tool.definition.inputType !== undefined ? { input_type: tool.definition.inputType } : {}),
    ...(tool.definition.outputType !== undefined
      ? { output_type: tool.definition.outputType }
      : {}),
    ...(tool.definition.typeDefinitions !== undefined
      ? { type_definitions: tool.definition.typeDefinitions }
      : {}),
    namespace: tool.namespace,
    source_display_name: tool.source.displayName,
  }
}

function parseToolId(toolId: string): { namespace: string; name: string } {
  const dot = toolId.indexOf('.')
  if (dot <= 0 || dot === toolId.length - 1) {
    throw new Error(`Invalid tool id "${toolId}". Expected "<namespace>.<name>".`)
  }
  return { namespace: toolId.slice(0, dot), name: toolId.slice(dot + 1) }
}

function spanError(error: unknown): SpanError {
  if (error instanceof Error) return { message: error.message }
  return { message: String(error) }
}

function page<T>(
  rows: readonly T[],
  input?: Pick<ToolListInput, 'limit' | 'offset' | 'cursor'>
): {
  data: readonly T[]
  limit: number
  offset: number
  hasMore: boolean
  nextCursor: string | null
} {
  const limit = Math.max(1, Math.min(input?.limit ?? DEFAULT_PAGE_LIMIT, 200))
  const cursorOffset = input?.cursor ? Number(input.cursor) : undefined
  const offset = Number.isFinite(cursorOffset)
    ? Number(cursorOffset)
    : Math.max(0, input?.offset ?? 0)
  const slice = rows.slice(offset, offset + limit + 1)
  const hasMore = slice.length > limit
  return {
    data: hasMore ? slice.slice(0, limit) : slice,
    limit,
    offset,
    hasMore,
    nextCursor: hasMore ? String(offset + limit) : null,
  }
}

async function indexSources(
  sources: readonly SourceAdapter[],
  input: CreateToolRegistryInput
): Promise<readonly IndexedTool[]> {
  const chunks = await Promise.all(
    sources.map(async (source) => {
      const credentials = await resolveSourceCredentials(input, source)
      const definitions = await source.listTools({ credentials })
      return definitions.map((definition) => ({
        source,
        definition,
        toolId: `${source.namespace}.${definition.name}`,
        namespace: source.namespace,
        name: definition.name,
      }))
    })
  )
  return chunks.flat()
}

async function resolveSourceCredentials(
  input: CreateToolRegistryInput,
  source: SourceAdapter,
  principalId?: string | undefined
): Promise<ResolvedCredentials | undefined> {
  if (!input.credentials) return undefined
  return input.credentials.resolve({
    workspaceId: input.workspaceId ?? LOCAL_WORKSPACE_ID,
    sourceId: sourceId(source),
    principalId: principalId ?? input.principalId,
  })
}

function getSourceForToolId(sources: readonly SourceAdapter[], toolId: string): SourceAdapter {
  const { namespace } = parseToolId(toolId)
  const source = sources.find((candidate) => candidate.namespace === namespace)
  if (!source) throw new Error(`Source namespace "${namespace}" is not registered.`)
  return source
}

async function getIndexedTool(
  sources: readonly SourceAdapter[],
  toolId: string,
  credentials?: ResolvedCredentials | undefined
): Promise<IndexedTool> {
  const { namespace, name } = parseToolId(toolId)
  const source = sources.find((candidate) => candidate.namespace === namespace)
  if (!source) throw new Error(`Source namespace "${namespace}" is not registered.`)
  const described = await source.describeTool?.(name, { credentials })
  if (described) {
    return { source, definition: described, toolId, namespace, name: described.name }
  }
  const definition = (await source.listTools({ credentials })).find(
    (candidate) => candidate.name === name
  )
  if (!definition) throw new Error(`Tool "${toolId}" is not registered.`)
  return { source, definition, toolId, namespace, name }
}

export function createToolRegistry(input: CreateToolRegistryInput): ToolRegistry {
  const sources = [...input.sources]
  const workspaceId = input.workspaceId ?? LOCAL_WORKSPACE_ID

  const invoke = async (toolInput: ToolInvokeInput): Promise<ToolInvocation> => {
    const startedAt = performance.now()
    const { namespace, name } = parseToolId(toolInput.toolId)
    const source = sources.find((candidate) => candidate.namespace === namespace)
    if (!source) throw new Error(`Source namespace "${namespace}" is not registered.`)
    const ownsTraceRun = input.traces !== undefined && toolInput.runId === undefined
    const run =
      input.traces && toolInput.runId === undefined
        ? await input.traces.startRun({
            workspaceId,
            agentId: toolInput.agentId ?? input.principalId,
            trigger: 'tool.invoke',
            input: toolInput.input ?? {},
          })
        : toolInput.runId !== undefined
          ? { id: toolInput.runId }
          : null
    const span =
      input.traces && run
        ? await input.traces.startSpan({
            runId: run.id,
            kind: 'mcp.tool_call',
            title: `Call ${toolInput.toolId}`,
            sourceId: sourceId(source),
            sourceNamespace: namespace,
            sourceDisplayName: source.displayName,
            toolId: toolInput.toolId,
            toolName: name,
            input: toolInput.input ?? {},
          })
        : null
    if (input.policy) {
      const decision = await input.policy.evaluate({
        toolId: toolInput.toolId,
        namespace,
        toolName: name,
        input: toolInput.input ?? {},
        principalId: toolInput.agentId ?? input.principalId,
      })
      if (decision.kind !== 'allow') {
        const error = { message: decision.reason }
        if (input.traces && span)
          await input.traces.finishSpan({ spanId: span.id, status: 'warning', error })
        if (input.traces && run && ownsTraceRun)
          await input.traces.finishRun({ runId: run.id, status: 'failed', error })
        throw new ToolPolicyDeniedError(toolInput.toolId, decision)
      }
    }
    try {
      const credentials = await resolveSourceCredentials(input, source, toolInput.agentId)
      const result = await source.invokeTool(name, toolInput.input ?? {}, { credentials })
      if (input.traces && span)
        await input.traces.finishSpan({ spanId: span.id, status: 'success', output: result })
      if (input.traces && run && ownsTraceRun)
        await input.traces.finishRun({ runId: run.id, status: 'completed', output: result })
      const invocationRunId = run?.id ?? toolInput.runId
      return {
        result,
        content_type: 'application/json',
        duration_ms: Math.max(0, Math.round(performance.now() - startedAt)),
        invocation_id: input.invocationId?.({
          toolId: toolInput.toolId,
          namespace,
          name,
          ...(invocationRunId !== undefined ? { runId: invocationRunId } : {}),
        }) ?? `${workspaceId}:${toolInput.toolId}:${(input.now ?? (() => new Date()))().getTime()}`,
        ...(invocationRunId !== undefined ? { run_id: invocationRunId } : {}),
      }
    } catch (error) {
      const traceError = spanError(error)
      if (input.traces && span)
        await input.traces.finishSpan({ spanId: span.id, status: 'error', error: traceError })
      if (input.traces && run && ownsTraceRun)
        await input.traces.finishRun({ runId: run.id, status: 'failed', error: traceError })
      throw error
    }
  }

  return {
    list: async (listInput?: ToolListInput) => {
      const indexed = await indexSources(sources, input)
      const filtered = indexed.filter((tool) => {
        if (listInput?.sourceId && sourceId(tool.source) !== listInput.sourceId) return false
        if (listInput?.namespace && tool.namespace !== listInput.namespace) return false
        return true
      })
      const result = page(filtered.map((tool) => toPluginTool(tool, input)), listInput)
      return {
        data: [...result.data],
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      }
    },
    search: async (searchInput: ToolSearchInput) => {
      const query = searchInput.query.trim().toLowerCase()
      const indexed = await indexSources(sources, input)
      const hits = indexed
        .filter((tool) => {
          if (searchInput.source && tool.namespace !== searchInput.source) return false
          const kind = kindForSource(tool.definition.kind ?? tool.source.kind)
          if (searchInput.kind && !searchInput.kind.includes(kind)) return false
          const haystack = [
            tool.name,
            displayName(tool.definition),
            tool.definition.description ?? '',
            tool.namespace,
          ]
            .join(' ')
            .toLowerCase()
          return haystack.includes(query)
        })
        .slice(0, Math.max(1, searchInput.limit ?? 10))
        .map((tool, index) => ({
          tool_id: tool.toolId,
          name: tool.name,
          namespace: tool.namespace,
          js_var: jsVar(tool.namespace),
          display_name: displayName(tool.definition),
          signature: signatureFor(tool),
          score: indexed.length - index,
          kind: kindForSource(tool.definition.kind ?? tool.source.kind),
          ...(tool.definition.description !== undefined
            ? { description: tool.definition.description }
            : {}),
        }))
      return { hits }
    },
    describe: async (describeInput: ToolDescribeInput) =>
      toDescription(
        await getIndexedTool(
          sources,
          describeInput.toolId,
          await resolveSourceCredentials(input, getSourceForToolId(sources, describeInput.toolId))
        ),
        input,
      ),
    schema: async (schemaInput: ToolSchemaInput) =>
      toSchema(
        await getIndexedTool(
          sources,
          schemaInput.toolId,
          await resolveSourceCredentials(input, getSourceForToolId(sources, schemaInput.toolId))
        )
      ),
    schemas: async (schemasInput: ToolSchemasInput) =>
      Promise.all(
        schemasInput.toolIds.map(async (toolId) => {
          const { namespace } = parseToolId(toolId)
          const source = sources.find((candidate) => candidate.namespace === namespace)
          if (!source) throw new Error(`Source namespace "${namespace}" is not registered.`)
          return toSchema(
            await getIndexedTool(sources, toolId, await resolveSourceCredentials(input, source))
          )
        })
      ),
    invoke,
    call: (toolId, callInput) => invoke({ toolId, input: callInput }),
  }
}
