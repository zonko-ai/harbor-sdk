// @hrbr/runs — Run lifecycle + trace span schemas.
//
// Single canonical wire shape — no v2 suffix, no legacy shim. Pairs with
// migration 0051 and the rewritten `/runs/*` routes. See
// docs/architecture/trace-redesign/trace-schema-sdk-pr.md for rationale.

import { Schema } from "effect"

// ─────────── Run lifecycle enums ───────────────────────────────────────────

export const RunStatus = Schema.Literals(["queued", "running", "completed", "failed", "cancelled"])
export type RunStatus = typeof RunStatus.Type

export const RunSource = Schema.Literals(["api", "cli", "worker"])
export type RunSource = typeof RunSource.Type

// ─────────── Span enums ────────────────────────────────────────────────────

export const SpanStatus = Schema.Literals(["pending", "success", "error", "warning"])
export type SpanStatus = typeof SpanStatus.Type

export const SpanKind = Schema.Literals([
  "run",
  "mcp.tool_call", "mcp.prompts_get", "mcp.resources_read",
  "mcp.notification", "mcp.reconnect",
  "api.request", "api.graphql",
  "cli.command",
  "orbit.storage", "orbit.cache", "orbit.ai", "orbit.db", "orbit.fetch",
  "orbit.job_invoke",
  "secret.resolve",
  "retry",
  "agent.step",
  // Workflow step boundaries emitted by HarborExecWorkflow.run when
  // user code calls step.do / step.sleep / step.sleepUntil /
  // step.waitForEvent. Parent rows in the trace; inner tool spans
  // hang under each one ordered by started_offset_ms.
  "workflow.step",
  "workflow.sleep",
  "workflow.wait_event",
  "log",
])
export type SpanKind = typeof SpanKind.Type

export const SpanError = Schema.Struct({
  message: Schema.String,
  code: Schema.optional(Schema.Union([Schema.String, Schema.Number])),
  data: Schema.optional(Schema.Unknown),
})
export type SpanError = typeof SpanError.Type

// ─────────── Span row ──────────────────────────────────────────────────────

export const Span = Schema.Struct({
  id: Schema.String,
  run_id: Schema.String,
  parent_id: Schema.NullOr(Schema.String),
  agent_id: Schema.NullOr(Schema.String),
  kind: SpanKind,
  status: SpanStatus,
  title: Schema.NullOr(Schema.String),
  // Tool linkage — only populated for tool kinds.
  source_id: Schema.NullOr(Schema.String),
  source_namespace: Schema.NullOr(Schema.String),
  source_display_name: Schema.NullOr(Schema.String),
  source_icon_url: Schema.NullOr(Schema.String),
  tool_id: Schema.NullOr(Schema.String),
  tool_name: Schema.NullOr(Schema.String),
  tool_display_name: Schema.NullOr(Schema.String),
  tool_description: Schema.NullOr(Schema.String),
  tool_icons: Schema.optional(Schema.Unknown),
  // Schema awareness — populated when plugin_tools has a declared schema.
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  // Payload.
  input: Schema.optional(Schema.Unknown),
  output: Schema.optional(Schema.Unknown),
  content_type: Schema.NullOr(Schema.String),
  upstream_status: Schema.NullOr(Schema.Number),
  error: Schema.NullOr(SpanError),
  // Cost / observability.
  tokens_in: Schema.NullOr(Schema.Number),
  tokens_out: Schema.NullOr(Schema.Number),
  cost_usd: Schema.NullOr(Schema.Number),
  // Timing.
  started_at: Schema.String,
  finished_at: Schema.NullOr(Schema.String),
  duration_ms: Schema.NullOr(Schema.Number),
  started_offset_ms: Schema.Number,
  // Per-kind envelope. Documented by SpanMetadata* aliases below.
  metadata: Schema.Unknown,
})
export type Span = typeof Span.Type

// ─────────── Per-kind metadata aliases (no runtime check) ──────────────────
// These document the contract the writers fill in `Span.metadata`. Renderers
// in apps/web cast as needed.

export type SpanMetadataMcpToolCall = {
  mcp_session_id?: string
  protocol_version?: string
  content_blocks?: Array<
    | { type: "text"; text: string }
    | { type: "image"; mime_type: string; data: string }
    | { type: "audio"; mime_type: string; data: string }
    | { type: "resource"; uri: string; mime_type?: string; text?: string; blob?: string }
  >
  server_logs?: Array<{ level: string; logger?: string; data: unknown; at?: string }>
  structured_content?: unknown
}

export type SpanMetadataCliCommand = {
  resolved_argv: string[]
  launcher: string
  runtime?: string
  cwd?: string
  stdin?: { mode: "text" | "json"; content: string }
  stdout?: string
  stderr?: string
  exit_code?: number
  sealed_env_keys?: Array<{ env: string; source_namespace: string; ref_id?: string }>
  result_mode?: "raw" | "json_stdout"
}

export type SpanMetadataApiRequest = {
  method: string
  url: string
  request_headers?: Record<string, string>
  response_headers?: Record<string, string>
}

export type SpanMetadataOrbit = {
  operation: string
  key?: string
  model?: string
  size_bytes?: number
}

export type SpanMetadataRetry = {
  attempt: number
  reason: "401_refresh" | "404_reinit" | string
  caused_by_span_id: string
  delta_ms?: number
}

export type SpanMetadataMcpReconnect = {
  protocol_version: string
  session_id: string
  server_info?: { name: string; version: string }
  capabilities?: Record<string, unknown>
  instructions?: string
}

export type SpanMetadataMcpNotification = {
  level: "debug" | "info" | "notice" | "warning" | "error" | "critical" | "alert" | "emergency" | string
  logger?: string
  data: unknown
}

export type SpanMetadataSecretResolve = {
  resolved: Array<{ env: string; source_namespace: string; ref_id: string }>
}

export type SpanMetadataRun = {
  code?: string
  language?: string
  sources?: string[]
  mode?: "codemode" | string
  logs?: Array<{ level?: string; message: string; at?: string }>
}

// ─────────── Run row ───────────────────────────────────────────────────────

export const Run = Schema.Struct({
  id: Schema.String,
  workspace_id: Schema.String,
  agent_id: Schema.String,                       // NOT NULL since migration 0050
  status: RunStatus,
  source: RunSource,
  trigger: Schema.NullOr(Schema.String),
  input: Schema.optional(Schema.Unknown),
  output: Schema.optional(Schema.Unknown),
  error_message: Schema.NullOr(Schema.String),
  error_code: Schema.NullOr(Schema.String),
  exit_code: Schema.NullOr(Schema.Number),
  duration_ms: Schema.NullOr(Schema.Number),
  artifact_count: Schema.Number,
  // Cloudflare Workflows instance id when the run was dispatched
  // through HARBOR_EXEC_WORKFLOW (mode=workflow). Null on synchronous
  // exec runs.
  workflow_instance_id: Schema.optional(Schema.NullOr(Schema.String)),
  started_at: Schema.NullOr(Schema.String),
  finished_at: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  // Computed at /runs/list — distinct source namespaces touched by the run.
  sources: Schema.optional(Schema.Array(Schema.String)),
})
export type Run = typeof Run.Type

// ─────────── Artifact (promoted from page-local) ───────────────────────────

export const Artifact = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  mime_type: Schema.String,
  size_bytes: Schema.Number,
  storage_key: Schema.NullOr(Schema.String),
  created_at: Schema.String,
})
export type Artifact = typeof Artifact.Type

// ─────────── Run summary aggregate ─────────────────────────────────────────

export const RunSummary = Schema.Struct({
  span_count: Schema.Number,
  error_count: Schema.Number,
  retry_count: Schema.Number,
  total_tokens_in: Schema.NullOr(Schema.Number),
  total_tokens_out: Schema.NullOr(Schema.Number),
  total_cost_usd: Schema.NullOr(Schema.Number),
})
export type RunSummary = typeof RunSummary.Type

// ─────────── Run graph ─────────────────────────────────────────────────────

export const RunGraph = Schema.Struct({
  run: Run,
  spans: Schema.Array(Span),
  next_cursor: Schema.NullOr(Schema.String),
  // Server-driven aggregates the UI shows in the header strip.
  summary: RunSummary,
})
export type RunGraph = typeof RunGraph.Type

export {
  compactRunView,
  compactSpanView,
  runListRow,
  type CompactRunView,
  type CompactSpanView,
} from "./surface"

// ─────────── Bodies ────────────────────────────────────────────────────────

export const RunIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  run_id: Schema.String.check(Schema.isUUID()),
})
export type RunIdBody = typeof RunIdBody.Type

export const RunGraphBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  run_id: Schema.String.check(Schema.isUUID()),
  cursor: Schema.optional(Schema.String),
  // Polling-cursor live-tail: when set, only return spans started at or
  // after this offset within the run.
  since_offset_ms: Schema.optional(Schema.Number),
})
export type RunGraphBody = typeof RunGraphBody.Type

export const ListRunsBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  source: Schema.optional(Schema.String),
  created_after: Schema.optional(Schema.String),
  created_before: Schema.optional(Schema.String),
  offset: Schema.optional(Schema.Number),
  limit: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
})
export type ListRunsBody = typeof ListRunsBody.Type

export const ListRunsResult = Schema.Struct({
  data: Schema.Array(Run),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
  source_options: Schema.optional(Schema.Array(Schema.String)),
})
export type ListRunsResult = typeof ListRunsResult.Type

export interface RunListInput {
  readonly agentId?: string | undefined
  readonly source?: string | undefined
  readonly createdAfter?: string | undefined
  readonly createdBefore?: string | undefined
  readonly offset?: number | undefined
  readonly limit?: number | undefined
  readonly cursor?: string | undefined
  readonly includeTotal?: boolean | undefined
}

export interface RunGetInput {
  readonly runId: string
}

export interface RunGraphInput {
  readonly runId: string
  readonly cursor?: string | undefined
  readonly sinceOffsetMs?: number | undefined
}

export interface RunReader {
  readonly list: (input?: RunListInput) => Promise<ListRunsResult>
  readonly get: (input: RunGetInput) => Promise<Run>
  readonly graph: (input: RunGraphInput) => Promise<RunGraph>
}

export interface TraceStartRunInput {
  readonly workspaceId?: string | undefined
  readonly agentId?: string | undefined
  readonly trigger?: string | null | undefined
  readonly input?: unknown
}

export interface TraceStartSpanInput {
  readonly runId: string
  readonly parentId?: string | null | undefined
  readonly agentId?: string | null | undefined
  readonly kind: SpanKind
  readonly title?: string | null | undefined
  readonly sourceId?: string | null | undefined
  readonly sourceNamespace?: string | null | undefined
  readonly sourceDisplayName?: string | null | undefined
  readonly toolId?: string | null | undefined
  readonly toolName?: string | null | undefined
  readonly toolDisplayName?: string | null | undefined
  readonly toolDescription?: string | null | undefined
  readonly input?: unknown
  readonly metadata?: unknown
}

export interface TraceFinishSpanInput {
  readonly spanId: string
  readonly status: SpanStatus
  readonly output?: unknown
  readonly error?: SpanError | null | undefined
}

export interface TraceFinishRunInput {
  readonly runId: string
  readonly status: RunStatus
  readonly output?: unknown
  readonly error?: SpanError | null | undefined
}

export interface TraceWriter {
  readonly startRun: (input?: TraceStartRunInput) => Promise<Run>
  readonly finishRun: (input: TraceFinishRunInput) => Promise<Run>
  readonly startSpan: (input: TraceStartSpanInput) => Promise<Span>
  readonly finishSpan: (input: TraceFinishSpanInput) => Promise<Span>
  readonly graph: (runId: string) => Promise<RunGraph>
}

export interface CreateMemoryTraceWriterInput {
  readonly workspaceId?: string | undefined
  readonly agentId?: string | undefined
  readonly now?: (() => Date) | undefined
  readonly id?: (() => string) | undefined
}

function defaultTraceId(): string {
  const crypto = (globalThis as { readonly crypto?: { readonly randomUUID?: () => string } }).crypto
  return crypto?.randomUUID?.() ?? `trace_${Math.random().toString(36).slice(2)}`
}

function iso(date: Date): string {
  return date.toISOString()
}

function spanErrorMessage(error: SpanError | null | undefined): string | null {
  return error?.message ?? null
}

function summarizeRun(run: Run, spans: readonly Span[]): RunSummary {
  let errorCount = 0
  let retryCount = 0
  let tokensIn = 0
  let tokensOut = 0
  let costUsd = 0
  let hasTokensIn = false
  let hasTokensOut = false
  let hasCost = false
  for (const span of spans) {
    if (span.status === "error") errorCount++
    if (span.kind === "retry") retryCount++
    if (typeof span.tokens_in === "number") {
      tokensIn += span.tokens_in
      hasTokensIn = true
    }
    if (typeof span.tokens_out === "number") {
      tokensOut += span.tokens_out
      hasTokensOut = true
    }
    if (typeof span.cost_usd === "number") {
      costUsd += span.cost_usd
      hasCost = true
    }
  }
  return {
    span_count: spans.length,
    error_count: run.status === "failed" && errorCount === 0 ? 1 : errorCount,
    retry_count: retryCount,
    total_tokens_in: hasTokensIn ? tokensIn : null,
    total_tokens_out: hasTokensOut ? tokensOut : null,
    total_cost_usd: hasCost ? costUsd : null,
  }
}

export function createMemoryTraceWriter(input: CreateMemoryTraceWriterInput = {}): TraceWriter {
  const now = input.now ?? (() => new Date())
  const id = input.id ?? defaultTraceId
  const runs = new Map<string, Run>()
  const spans = new Map<string, Span>()
  const runStartedAt = new Map<string, number>()

  return {
    startRun: async (runInput = {}) => {
      const at = now()
      const runId = id()
      runStartedAt.set(runId, at.getTime())
      const run: Run = {
        id: runId,
        workspace_id: runInput.workspaceId ?? input.workspaceId ?? "local",
        agent_id: runInput.agentId ?? input.agentId ?? "local-agent",
        status: "running",
        source: "api",
        trigger: runInput.trigger ?? null,
        ...(runInput.input !== undefined ? { input: runInput.input } : {}),
        error_message: null,
        error_code: null,
        exit_code: null,
        duration_ms: null,
        artifact_count: 0,
        started_at: iso(at),
        finished_at: null,
        created_at: iso(at),
      }
      runs.set(runId, run)
      return run
    },
    finishRun: async (finishInput) => {
      const existing = runs.get(finishInput.runId)
      if (!existing) throw new Error(`Run "${finishInput.runId}" is not registered.`)
      const finishedAt = now()
      const startedAt = existing.started_at ? Date.parse(existing.started_at) : finishedAt.getTime()
      const run: Run = {
        ...existing,
        status: finishInput.status,
        ...(finishInput.output !== undefined ? { output: finishInput.output } : {}),
        error_message: spanErrorMessage(finishInput.error),
        error_code: finishInput.error?.code === undefined ? null : String(finishInput.error.code),
        duration_ms: Math.max(0, finishedAt.getTime() - startedAt),
        finished_at: iso(finishedAt),
      }
      runs.set(run.id, run)
      return run
    },
    startSpan: async (spanInput) => {
      const startedAt = now()
      const runStart = runStartedAt.get(spanInput.runId) ?? startedAt.getTime()
      const span: Span = {
        id: id(),
        run_id: spanInput.runId,
        parent_id: spanInput.parentId ?? null,
        agent_id: spanInput.agentId ?? null,
        kind: spanInput.kind,
        status: "pending",
        title: spanInput.title ?? null,
        source_id: spanInput.sourceId ?? null,
        source_namespace: spanInput.sourceNamespace ?? null,
        source_display_name: spanInput.sourceDisplayName ?? null,
        source_icon_url: null,
        tool_id: spanInput.toolId ?? null,
        tool_name: spanInput.toolName ?? null,
        tool_display_name: spanInput.toolDisplayName ?? null,
        tool_description: spanInput.toolDescription ?? null,
        ...(spanInput.input !== undefined ? { input: spanInput.input } : {}),
        content_type: null,
        upstream_status: null,
        error: null,
        tokens_in: null,
        tokens_out: null,
        cost_usd: null,
        started_at: iso(startedAt),
        finished_at: null,
        duration_ms: null,
        started_offset_ms: Math.max(0, startedAt.getTime() - runStart),
        metadata: spanInput.metadata ?? {},
      }
      spans.set(span.id, span)
      return span
    },
    finishSpan: async (finishInput) => {
      const existing = spans.get(finishInput.spanId)
      if (!existing) throw new Error(`Span "${finishInput.spanId}" is not registered.`)
      const finishedAt = now()
      const startedAt = Date.parse(existing.started_at)
      const span: Span = {
        ...existing,
        status: finishInput.status,
        ...(finishInput.output !== undefined ? { output: finishInput.output } : {}),
        error: finishInput.error ?? null,
        finished_at: iso(finishedAt),
        duration_ms: Number.isNaN(startedAt) ? null : Math.max(0, finishedAt.getTime() - startedAt),
      }
      spans.set(span.id, span)
      return span
    },
    graph: async (runId) => {
      const run = runs.get(runId)
      if (!run) throw new Error(`Run "${runId}" is not registered.`)
      const runSpans = [...spans.values()]
        .filter((span) => span.run_id === runId)
        .sort((a, b) => a.started_offset_ms - b.started_offset_ms || a.id.localeCompare(b.id))
      return {
        run,
        spans: runSpans,
        next_cursor: null,
        summary: summarizeRun(run, runSpans),
      }
    },
  }
}

export const CreateRunBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  input: Schema.optional(Schema.Unknown),
  trigger: Schema.optional(Schema.String),
})
export type CreateRunBody = typeof CreateRunBody.Type
