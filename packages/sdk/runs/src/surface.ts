import type { Run, Span } from "./index"

export interface CompactRunView {
  readonly run_id: string
  readonly status: string
  readonly source: string
  readonly trigger: string | null
  readonly duration_ms: number | null
  readonly artifact_count: number
  readonly sources: readonly string[]
  readonly error: string | null
  readonly created_at: string
  readonly finished_at: string | null
}

export interface CompactSpanView {
  readonly span_id: string
  readonly kind: string
  readonly status: string
  readonly title: string | null
  readonly source_namespace: string | null
  readonly tool_id: string | null
  readonly duration_ms: number | null
  readonly error: string | null
  readonly started_offset_ms: number
}

export function compactRunView(run: Run): CompactRunView {
  return {
    run_id: run.id,
    status: run.status,
    source: run.source,
    trigger: run.trigger,
    duration_ms: run.duration_ms,
    artifact_count: run.artifact_count,
    sources: run.sources ?? [],
    error: run.error_message ?? run.error_code ?? null,
    created_at: run.created_at,
    finished_at: run.finished_at,
  }
}

export function compactSpanView(span: Span): CompactSpanView {
  return {
    span_id: span.id,
    kind: span.kind,
    status: span.status,
    title: span.title,
    source_namespace: span.source_namespace,
    tool_id: span.tool_id,
    duration_ms: span.duration_ms,
    error: span.error?.message ?? null,
    started_offset_ms: span.started_offset_ms,
  }
}

export function runListRow(run: Run) {
  return {
    id: run.id,
    trigger: run.trigger,
    status: run.status,
    started_at: run.started_at,
    duration_ms: run.duration_ms ?? null,
  }
}
