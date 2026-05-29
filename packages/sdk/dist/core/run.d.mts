import { Schema } from "effect";

//#region ../core-effect/src/run.d.ts
declare const RunStatus: Schema.Literals<readonly ["queued", "running", "completed", "failed", "cancelled"]>;
type RunStatus = typeof RunStatus.Type;
declare function isTerminalRunStatus(status: RunStatus | null | undefined): boolean;
declare const RunSource: Schema.Literals<readonly ["api", "cli", "worker"]>;
type RunSource = typeof RunSource.Type;
declare const SpanStatus: Schema.Literals<readonly ["pending", "success", "error", "warning"]>;
type SpanStatus = typeof SpanStatus.Type;
declare const SpanKind: Schema.Literals<readonly ["run", "mcp.tool_call", "mcp.prompts_get", "mcp.resources_read", "mcp.notification", "mcp.reconnect", "api.request", "api.graphql", "cli.command", "orbit.storage", "orbit.cache", "orbit.ai", "orbit.db", "orbit.fetch", "orbit.job_invoke", "secret.resolve", "retry", "agent.step", "workflow.step", "workflow.sleep", "workflow.wait_event", "log"]>;
type SpanKind = typeof SpanKind.Type;
declare const SpanError: Schema.Struct<{
  readonly message: Schema.String;
  readonly code: Schema.optional<Schema.Union<readonly [Schema.String, Schema.Number]>>;
  readonly data: Schema.optional<Schema.Unknown>;
}>;
type SpanError = typeof SpanError.Type;
declare const Span: Schema.Struct<{
  readonly id: Schema.String;
  readonly run_id: Schema.String;
  readonly parent_id: Schema.NullOr<Schema.String>;
  readonly agent_id: Schema.NullOr<Schema.String>;
  readonly kind: Schema.Literals<readonly ["run", "mcp.tool_call", "mcp.prompts_get", "mcp.resources_read", "mcp.notification", "mcp.reconnect", "api.request", "api.graphql", "cli.command", "orbit.storage", "orbit.cache", "orbit.ai", "orbit.db", "orbit.fetch", "orbit.job_invoke", "secret.resolve", "retry", "agent.step", "workflow.step", "workflow.sleep", "workflow.wait_event", "log"]>;
  readonly status: Schema.Literals<readonly ["pending", "success", "error", "warning"]>;
  readonly title: Schema.NullOr<Schema.String>;
  readonly source_id: Schema.NullOr<Schema.String>;
  readonly source_namespace: Schema.NullOr<Schema.String>;
  readonly source_display_name: Schema.NullOr<Schema.String>;
  readonly source_icon_url: Schema.NullOr<Schema.String>;
  readonly tool_id: Schema.NullOr<Schema.String>;
  readonly tool_name: Schema.NullOr<Schema.String>;
  readonly tool_display_name: Schema.NullOr<Schema.String>;
  readonly tool_description: Schema.NullOr<Schema.String>;
  readonly tool_icons: Schema.optional<Schema.Unknown>;
  readonly input_schema: Schema.optional<Schema.Unknown>;
  readonly output_schema: Schema.optional<Schema.Unknown>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly content_type: Schema.NullOr<Schema.String>;
  readonly upstream_status: Schema.NullOr<Schema.Number>;
  readonly error: Schema.NullOr<Schema.Struct<{
    readonly message: Schema.String;
    readonly code: Schema.optional<Schema.Union<readonly [Schema.String, Schema.Number]>>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>>;
  readonly tokens_in: Schema.NullOr<Schema.Number>;
  readonly tokens_out: Schema.NullOr<Schema.Number>;
  readonly cost_usd: Schema.NullOr<Schema.Number>;
  readonly started_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly started_offset_ms: Schema.Number;
  readonly metadata: Schema.Unknown;
}>;
type Span = typeof Span.Type;
type SpanMetadataMcpToolCall = {
  mcp_session_id?: string;
  protocol_version?: string;
  content_blocks?: Array<{
    type: 'text';
    text: string;
  } | {
    type: 'image';
    mime_type: string;
    data: string;
  } | {
    type: 'audio';
    mime_type: string;
    data: string;
  } | {
    type: 'resource';
    uri: string;
    mime_type?: string;
    text?: string;
    blob?: string;
  }>;
  server_logs?: Array<{
    level: string;
    logger?: string;
    data: unknown;
    at?: string;
  }>;
  structured_content?: unknown;
};
type SpanMetadataCliCommand = {
  resolved_argv: string[];
  launcher: string;
  runtime?: string;
  cwd?: string;
  stdin?: {
    mode: 'text' | 'json';
    content: string;
  };
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  sealed_env_keys?: Array<{
    env: string;
    source_namespace: string;
    ref_id?: string;
  }>;
  result_mode?: 'raw' | 'json_stdout';
};
type SpanMetadataApiRequest = {
  method: string;
  url: string;
  request_headers?: Record<string, string>;
  response_headers?: Record<string, string>;
};
type SpanMetadataOrbit = {
  operation: string;
  key?: string;
  model?: string;
  size_bytes?: number;
};
type SpanMetadataRetry = {
  attempt: number;
  reason: '401_refresh' | '404_reinit' | string;
  caused_by_span_id: string;
  delta_ms?: number;
};
type SpanMetadataMcpReconnect = {
  protocol_version: string;
  session_id: string;
  server_info?: {
    name: string;
    version: string;
  };
  capabilities?: Record<string, unknown>;
  instructions?: string;
};
type SpanMetadataMcpNotification = {
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency' | string;
  logger?: string;
  data: unknown;
};
type SpanMetadataSecretResolve = {
  resolved: Array<{
    env: string;
    source_namespace: string;
    ref_id: string;
  }>;
};
type SpanMetadataRun = {
  code?: string;
  language?: string;
  sources?: string[];
  mode?: 'codemode' | string;
  logs?: Array<{
    level?: string;
    message: string;
    at?: string;
  }>;
};
declare const Run: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
  readonly status: Schema.Literals<readonly ["queued", "running", "completed", "failed", "cancelled"]>;
  readonly source: Schema.Literals<readonly ["api", "cli", "worker"]>;
  readonly trigger: Schema.NullOr<Schema.String>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly error_code: Schema.NullOr<Schema.String>;
  readonly exit_code: Schema.NullOr<Schema.Number>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly artifact_count: Schema.Number;
  readonly workflow_instance_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly started_at: Schema.NullOr<Schema.String>;
  readonly finished_at: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly sources: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type Run = typeof Run.Type;
declare const Artifact: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly mime_type: Schema.String;
  readonly size_bytes: Schema.Number;
  readonly storage_key: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
}>;
type Artifact = typeof Artifact.Type;
declare const RunSummary: Schema.Struct<{
  readonly span_count: Schema.Number;
  readonly error_count: Schema.Number;
  readonly retry_count: Schema.Number;
  readonly total_tokens_in: Schema.NullOr<Schema.Number>;
  readonly total_tokens_out: Schema.NullOr<Schema.Number>;
  readonly total_cost_usd: Schema.NullOr<Schema.Number>;
}>;
type RunSummary = typeof RunSummary.Type;
declare const RunGraph: Schema.Struct<{
  readonly run: Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly agent_id: Schema.String;
    readonly status: Schema.Literals<readonly ["queued", "running", "completed", "failed", "cancelled"]>;
    readonly source: Schema.Literals<readonly ["api", "cli", "worker"]>;
    readonly trigger: Schema.NullOr<Schema.String>;
    readonly input: Schema.optional<Schema.Unknown>;
    readonly output: Schema.optional<Schema.Unknown>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly error_code: Schema.NullOr<Schema.String>;
    readonly exit_code: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly artifact_count: Schema.Number;
    readonly workflow_instance_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly started_at: Schema.NullOr<Schema.String>;
    readonly finished_at: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly sources: Schema.optional<Schema.$Array<Schema.String>>;
  }>;
  readonly spans: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly run_id: Schema.String;
    readonly parent_id: Schema.NullOr<Schema.String>;
    readonly agent_id: Schema.NullOr<Schema.String>;
    readonly kind: Schema.Literals<readonly ["run", "mcp.tool_call", "mcp.prompts_get", "mcp.resources_read", "mcp.notification", "mcp.reconnect", "api.request", "api.graphql", "cli.command", "orbit.storage", "orbit.cache", "orbit.ai", "orbit.db", "orbit.fetch", "orbit.job_invoke", "secret.resolve", "retry", "agent.step", "workflow.step", "workflow.sleep", "workflow.wait_event", "log"]>;
    readonly status: Schema.Literals<readonly ["pending", "success", "error", "warning"]>;
    readonly title: Schema.NullOr<Schema.String>;
    readonly source_id: Schema.NullOr<Schema.String>;
    readonly source_namespace: Schema.NullOr<Schema.String>;
    readonly source_display_name: Schema.NullOr<Schema.String>;
    readonly source_icon_url: Schema.NullOr<Schema.String>;
    readonly tool_id: Schema.NullOr<Schema.String>;
    readonly tool_name: Schema.NullOr<Schema.String>;
    readonly tool_display_name: Schema.NullOr<Schema.String>;
    readonly tool_description: Schema.NullOr<Schema.String>;
    readonly tool_icons: Schema.optional<Schema.Unknown>;
    readonly input_schema: Schema.optional<Schema.Unknown>;
    readonly output_schema: Schema.optional<Schema.Unknown>;
    readonly input: Schema.optional<Schema.Unknown>;
    readonly output: Schema.optional<Schema.Unknown>;
    readonly content_type: Schema.NullOr<Schema.String>;
    readonly upstream_status: Schema.NullOr<Schema.Number>;
    readonly error: Schema.NullOr<Schema.Struct<{
      readonly message: Schema.String;
      readonly code: Schema.optional<Schema.Union<readonly [Schema.String, Schema.Number]>>;
      readonly data: Schema.optional<Schema.Unknown>;
    }>>;
    readonly tokens_in: Schema.NullOr<Schema.Number>;
    readonly tokens_out: Schema.NullOr<Schema.Number>;
    readonly cost_usd: Schema.NullOr<Schema.Number>;
    readonly started_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly started_offset_ms: Schema.Number;
    readonly metadata: Schema.Unknown;
  }>>;
  readonly next_cursor: Schema.NullOr<Schema.String>;
  readonly summary: Schema.Struct<{
    readonly span_count: Schema.Number;
    readonly error_count: Schema.Number;
    readonly retry_count: Schema.Number;
    readonly total_tokens_in: Schema.NullOr<Schema.Number>;
    readonly total_tokens_out: Schema.NullOr<Schema.Number>;
    readonly total_cost_usd: Schema.NullOr<Schema.Number>;
  }>;
}>;
type RunGraph = typeof RunGraph.Type;
declare const RunIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.String;
}>;
type RunIdBody = typeof RunIdBody.Type;
declare const RunGraphBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.String;
  readonly cursor: Schema.optional<Schema.String>;
  readonly since_offset_ms: Schema.optional<Schema.Number>;
}>;
type RunGraphBody = typeof RunGraphBody.Type;
declare const ListRunsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.optional<Schema.String>;
  readonly source: Schema.optional<Schema.String>;
  readonly created_after: Schema.optional<Schema.String>;
  readonly created_before: Schema.optional<Schema.String>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
type ListRunsBody = typeof ListRunsBody.Type;
declare const ListRunsResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly agent_id: Schema.String;
    readonly status: Schema.Literals<readonly ["queued", "running", "completed", "failed", "cancelled"]>;
    readonly source: Schema.Literals<readonly ["api", "cli", "worker"]>;
    readonly trigger: Schema.NullOr<Schema.String>;
    readonly input: Schema.optional<Schema.Unknown>;
    readonly output: Schema.optional<Schema.Unknown>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly error_code: Schema.NullOr<Schema.String>;
    readonly exit_code: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly artifact_count: Schema.Number;
    readonly workflow_instance_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly started_at: Schema.NullOr<Schema.String>;
    readonly finished_at: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly sources: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly source_options: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type ListRunsResult = typeof ListRunsResult.Type;
declare const CreateRunBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.optional<Schema.String>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly trigger: Schema.optional<Schema.String>;
}>;
type CreateRunBody = typeof CreateRunBody.Type;
//#endregion
export { Artifact, CreateRunBody, ListRunsBody, ListRunsResult, Run, RunGraph, RunGraphBody, RunIdBody, RunSource, RunStatus, RunSummary, Span, SpanError, SpanKind, SpanMetadataApiRequest, SpanMetadataCliCommand, SpanMetadataMcpNotification, SpanMetadataMcpReconnect, SpanMetadataMcpToolCall, SpanMetadataOrbit, SpanMetadataRetry, SpanMetadataRun, SpanMetadataSecretResolve, SpanStatus, isTerminalRunStatus };
//# sourceMappingURL=run.d.mts.map