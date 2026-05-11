// orbit.jobs.* contracts: workspace-scoped named functions, not raw workers.
import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitJobName = Schema.NonEmptyString.check(
  Schema.isMaxLength(128),
  Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/),
)
export type OrbitJobName = typeof OrbitJobName.Type

export const OrbitJobVersion = Schema.NonEmptyString.check(
  Schema.isMaxLength(32),
  Schema.isPattern(/^v[1-9][0-9]*$/),
)
export type OrbitJobVersion = typeof OrbitJobVersion.Type

export const OrbitJobStatus = Schema.Union([
  Schema.Literal("ready"),
  Schema.Literal("disabled"),
  Schema.Literal("failed"),
])
export type OrbitJobStatus = typeof OrbitJobStatus.Type

export const OrbitJobVersionStatus = Schema.Union([
  Schema.Literal("validating"),
  Schema.Literal("ready"),
  Schema.Literal("failed"),
  Schema.Literal("disabled"),
])
export type OrbitJobVersionStatus = typeof OrbitJobVersionStatus.Type

export const OrbitJobExecutionLane = Schema.Union([
  Schema.Literal("dynamic_worker"),
  Schema.Literal("worker_platform"),
  Schema.Literal("container"),
  Schema.Literal("local_host"),
])
export type OrbitJobExecutionLane = typeof OrbitJobExecutionLane.Type

export const OrbitJobCapability = Schema.Union([
  Schema.Literal("storage"),
  Schema.Literal("cache"),
  Schema.Literal("ai"),
  Schema.Literal("plugins"),
  Schema.Literal("memory"),
  Schema.Literal("data"),
  Schema.Literal("workflow"),
  Schema.Literal("sessions"),
  Schema.Literal("socket"),
])
export type OrbitJobCapability = typeof OrbitJobCapability.Type

export const OrbitJobKind = Schema.Union([
  Schema.Literal("query"),
  Schema.Literal("mutation"),
  Schema.Literal("task"),
])
export type OrbitJobKind = typeof OrbitJobKind.Type

export const OrbitJobIdempotency = Schema.Struct({
  required: Schema.optional(Schema.Boolean),
  key: Schema.optional(Schema.Union([Schema.String, Schema.Array(Schema.String)])),
  ttl_seconds: Schema.optional(Schema.Number),
})
export type OrbitJobIdempotency = typeof OrbitJobIdempotency.Type

export const OrbitJobRetryPolicy = Schema.Struct({
  max_attempts: Schema.optional(Schema.Number),
  backoff: Schema.optional(Schema.Union([
    Schema.Literal("none"),
    Schema.Literal("fixed"),
    Schema.Literal("exponential"),
  ])),
})
export type OrbitJobRetryPolicy = typeof OrbitJobRetryPolicy.Type

export const OrbitJobRetentionPolicy = Schema.Struct({
  run_ttl_seconds: Schema.optional(Schema.Number),
  artifact_ttl_seconds: Schema.optional(Schema.Number),
})
export type OrbitJobRetentionPolicy = typeof OrbitJobRetentionPolicy.Type

export const OrbitJobPublishRuntime = Schema.Union([
  Schema.Literal("classic"),
  Schema.Literal("bundled"),
])
export type OrbitJobPublishRuntime = typeof OrbitJobPublishRuntime.Type

export const OrbitJobPublishBundle = Schema.Struct({
  code: Schema.NonEmptyString,
  sourcemap: Schema.optional(Schema.String),
  hash: Schema.NonEmptyString,
  bytes: Schema.Number,
})
export type OrbitJobPublishBundle = typeof OrbitJobPublishBundle.Type

export const OrbitJsonSchema = Schema.Record(Schema.String, Schema.Unknown)
export type OrbitJsonSchema = typeof OrbitJsonSchema.Type

export const OrbitJobArtifactRef = Schema.Struct({
  id: Schema.String,
  kind: Schema.String,
  url: Schema.optional(Schema.String),
})
export type OrbitJobArtifactRef = typeof OrbitJobArtifactRef.Type

export const OrbitJobSummary = Schema.Struct({
  name: OrbitJobName,
  description: Schema.NullOr(Schema.String),
  latest_version: Schema.NullOr(OrbitJobVersion),
  status: OrbitJobStatus,
  kind: Schema.optional(OrbitJobKind),
  tags: Schema.optional(Schema.Array(Schema.String)),
  capabilities: Schema.Array(OrbitJobCapability),
})
export type OrbitJobSummary = typeof OrbitJobSummary.Type

export const OrbitJobVersionRecord = Schema.Struct({
  version: OrbitJobVersion,
  status: OrbitJobVersionStatus,
  lane: OrbitJobExecutionLane,
  capabilities: Schema.Array(OrbitJobCapability),
  created_at: Schema.String,
  error_message: Schema.NullOr(Schema.String),
})
export type OrbitJobVersionRecord = typeof OrbitJobVersionRecord.Type

export const OrbitJobDetail = Schema.Struct({
  name: OrbitJobName,
  description: Schema.NullOr(Schema.String),
  latest_version: Schema.NullOr(OrbitJobVersion),
  status: OrbitJobStatus,
  kind: Schema.optional(OrbitJobKind),
  tags: Schema.optional(Schema.Array(Schema.String)),
  capabilities: Schema.Array(OrbitJobCapability),
  input_schema: Schema.NullOr(OrbitJsonSchema),
  output_schema: Schema.NullOr(OrbitJsonSchema),
  versions: Schema.Array(OrbitJobVersionRecord),
})
export type OrbitJobDetail = typeof OrbitJobDetail.Type

export const OrbitJobListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
})
export type OrbitJobListBody = typeof OrbitJobListBody.Type

export const OrbitJobListResponse = Schema.Struct({
  jobs: Schema.Array(OrbitJobSummary),
  count: Schema.Number,
})
export type OrbitJobListResponse = typeof OrbitJobListResponse.Type

export const OrbitJobInspectBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitJobName,
  version: Schema.optional(OrbitJobVersion),
})
export type OrbitJobInspectBody = typeof OrbitJobInspectBody.Type

export const OrbitJobInspectResponse = Schema.Struct({
  job: OrbitJobDetail,
})
export type OrbitJobInspectResponse = typeof OrbitJobInspectResponse.Type

export const OrbitJobPublishBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitJobName,
  description: Schema.optional(Schema.String),
  kind: Schema.optional(OrbitJobKind),
  tags: Schema.optional(Schema.Array(Schema.String)),
  input_binding: Schema.optional(Schema.String),
  input_schema: Schema.optional(OrbitJsonSchema),
  output_schema: Schema.optional(OrbitJsonSchema),
  capabilities: Schema.optional(Schema.Array(OrbitJobCapability)),
  timeout_ms: Schema.optional(Schema.Number),
  idempotency: Schema.optional(OrbitJobIdempotency),
  retry: Schema.optional(OrbitJobRetryPolicy),
  retention: Schema.optional(OrbitJobRetentionPolicy),
  compatibility_date: Schema.optional(Schema.String),
  code: Schema.NonEmptyString,
  runtime: Schema.optional(OrbitJobPublishRuntime),
  bundle: Schema.optional(OrbitJobPublishBundle),
  idempotency_key: Schema.optional(Schema.String),
  allow_generic_schema: Schema.optional(Schema.Boolean),
})
export type OrbitJobPublishBody = typeof OrbitJobPublishBody.Type

export const OrbitJobPublishResponse = Schema.Struct({
  job: Schema.Struct({
    name: OrbitJobName,
    version: OrbitJobVersion,
    status: OrbitJobVersionStatus,
    lane: Schema.optional(OrbitJobExecutionLane),
    deployment_id: Schema.optional(Schema.String),
    capabilities: Schema.Array(OrbitJobCapability),
  }),
})
export type OrbitJobPublishResponse = typeof OrbitJobPublishResponse.Type

export const OrbitJobRunBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitJobName,
  version: Schema.optional(OrbitJobVersion),
  input: Schema.optional(Schema.Unknown),
  timeout_ms: Schema.optional(Schema.Number),
  lane: Schema.optional(OrbitJobExecutionLane),
  idempotency_key: Schema.optional(Schema.String),
})
export type OrbitJobRunBody = typeof OrbitJobRunBody.Type

export const OrbitJobRunResponse = Schema.Struct({
  ok: Schema.Boolean,
  job: OrbitJobName,
  version: OrbitJobVersion,
  run_id: Schema.String,
  duration_ms: Schema.Number,
  output: Schema.Unknown,
  artifacts: Schema.Array(OrbitJobArtifactRef),
  lane_used: Schema.optional(OrbitJobExecutionLane),
  deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
})
export type OrbitJobRunResponse = typeof OrbitJobRunResponse.Type

export const OrbitJobVersionsBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitJobName,
})
export type OrbitJobVersionsBody = typeof OrbitJobVersionsBody.Type

export const OrbitJobVersionsResponse = Schema.Struct({
  name: OrbitJobName,
  versions: Schema.Array(OrbitJobVersionRecord),
})
export type OrbitJobVersionsResponse = typeof OrbitJobVersionsResponse.Type

export const OrbitJobDisableBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitJobName,
  version: Schema.optional(OrbitJobVersion),
})
export type OrbitJobDisableBody = typeof OrbitJobDisableBody.Type

export const OrbitJobDisableResponse = Schema.Struct({
  name: OrbitJobName,
  version: Schema.NullOr(OrbitJobVersion),
  disabled: Schema.Boolean,
})
export type OrbitJobDisableResponse = typeof OrbitJobDisableResponse.Type

// ---------------------------------------------------------------------------
// Invocation history
// ---------------------------------------------------------------------------

export const OrbitJobInvocationStatus = Schema.Union([
  Schema.Literal("running"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
  Schema.Literal("cancelled"),
])
export type OrbitJobInvocationStatus = typeof OrbitJobInvocationStatus.Type

export const OrbitJobCallerKind = Schema.Union([
  Schema.Literal("user"),
  Schema.Literal("agent"),
  Schema.Literal("workflow"),
  Schema.Literal("system"),
])
export type OrbitJobCallerKind = typeof OrbitJobCallerKind.Type

// Summary row: cheap list payload, omits raw input/output. Use `get` for those.
export const OrbitJobInvocationSummary = Schema.Struct({
  id: Schema.String,
  job: OrbitJobName,
  version: OrbitJobVersion,
  status: OrbitJobInvocationStatus,
  caller_kind: OrbitJobCallerKind,
  caller_id: Schema.NullOr(Schema.String),
  lane_used: Schema.NullOr(OrbitJobExecutionLane),
  deployment_id: Schema.NullOr(Schema.String),
  run_id: Schema.NullOr(Schema.String),
  duration_ms: Schema.NullOr(Schema.Number),
  error_code: Schema.NullOr(Schema.String),
  error_message: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  finished_at: Schema.NullOr(Schema.String),
})
export type OrbitJobInvocationSummary = typeof OrbitJobInvocationSummary.Type

// Detail row: includes raw input/output payloads (or output_ref for large rows).
export const OrbitJobInvocationDetail = Schema.Struct({
  id: Schema.String,
  job: OrbitJobName,
  version: OrbitJobVersion,
  status: OrbitJobInvocationStatus,
  caller_kind: OrbitJobCallerKind,
  caller_id: Schema.NullOr(Schema.String),
  lane_used: Schema.NullOr(OrbitJobExecutionLane),
  deployment_id: Schema.NullOr(Schema.String),
  run_id: Schema.NullOr(Schema.String),
  duration_ms: Schema.NullOr(Schema.Number),
  error_code: Schema.NullOr(Schema.String),
  error_message: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  finished_at: Schema.NullOr(Schema.String),
  input: Schema.Unknown,
  output: Schema.Unknown,
  output_ref: Schema.NullOr(Schema.String),
})
export type OrbitJobInvocationDetail = typeof OrbitJobInvocationDetail.Type

export const OrbitJobInvocationListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  // Optional name filter — when omitted, returns workspace-wide invocations
  // (requires the workspace_id+created_at index; see migration 0076).
  name: Schema.optional(OrbitJobName),
  version: Schema.optional(OrbitJobVersion),
  status: Schema.optional(OrbitJobInvocationStatus),
  caller_kind: Schema.optional(OrbitJobCallerKind),
  since: Schema.optional(Schema.String),
  before: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
})
export type OrbitJobInvocationListBody = typeof OrbitJobInvocationListBody.Type

export const OrbitJobInvocationListResponse = Schema.Struct({
  invocations: Schema.Array(OrbitJobInvocationSummary),
  next_cursor: Schema.NullOr(Schema.String),
})
export type OrbitJobInvocationListResponse = typeof OrbitJobInvocationListResponse.Type

export const OrbitJobInvocationGetBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  invocation_id: Schema.NonEmptyString,
})
export type OrbitJobInvocationGetBody = typeof OrbitJobInvocationGetBody.Type

export const OrbitJobInvocationGetResponse = Schema.Struct({
  invocation: OrbitJobInvocationDetail,
})
export type OrbitJobInvocationGetResponse = typeof OrbitJobInvocationGetResponse.Type

// ---------------------------------------------------------------------------
// Authoring helper
// ---------------------------------------------------------------------------
//
// `defineOrbitJob` is a typed identity used by job authors. The runtime
// itself doesn't need it (the WFP wrapper injects job context dynamically)
// — it exists purely so authors can write
//   export default defineOrbitJob({ name: 'x', handler() { ... } })
// and get TypeScript narrowing on the definition shape. Mirrors the
// `defineOrbitApp` and `defineOrbitJob` identities in @hrbr/orbit/app-ui.

export const defineOrbitJob = <T>(definition: T): T => definition
