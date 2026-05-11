import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"
import { OrbitJobName, OrbitJobVersion, OrbitJsonSchema } from "./jobs"

// Schema-first support for jobless static Orbit App routes. Wave B must teach
// apps/api/src/orbit/apps/wfp.ts and apps/api/src/orbit/apps/runner.ts to honor
// route.static_html before this can deploy through the runtime path.

export const OrbitAppName = Schema.NonEmptyString.check(
  Schema.isMaxLength(128),
  Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/),
)
export type OrbitAppName = typeof OrbitAppName.Type

export const OrbitAppVersion = Schema.NonEmptyString.check(
  Schema.isMaxLength(32),
  Schema.isPattern(/^v[1-9][0-9]*$/),
)
export type OrbitAppVersion = typeof OrbitAppVersion.Type

export const OrbitAppStatus = Schema.Union([
  Schema.Literal("ready"),
  Schema.Literal("disabled"),
  Schema.Literal("failed"),
])
export type OrbitAppStatus = typeof OrbitAppStatus.Type

export const OrbitAppVersionStatus = Schema.Union([
  Schema.Literal("validating"),
  Schema.Literal("ready"),
  Schema.Literal("failed"),
  Schema.Literal("disabled"),
])
export type OrbitAppVersionStatus = typeof OrbitAppVersionStatus.Type

export const OrbitAppRouteMethod = Schema.Union([
  Schema.Literal("GET"),
  Schema.Literal("POST"),
  Schema.Literal("PUT"),
  Schema.Literal("PATCH"),
  Schema.Literal("DELETE"),
  Schema.Literal("OPTIONS"),
])
export type OrbitAppRouteMethod = typeof OrbitAppRouteMethod.Type

export const OrbitAppRouteAuth = Schema.Union([
  Schema.Literal("public"),
  Schema.Literal("workspace_member"),
  Schema.Literal("signed_link"),
  Schema.Literal("service"),
])
export type OrbitAppRouteAuth = typeof OrbitAppRouteAuth.Type

export const OrbitAppAccess = Schema.Union([
  Schema.Literal("public"),
  Schema.Literal("workspace_member"),
])
export type OrbitAppAccess = typeof OrbitAppAccess.Type

export const OrbitAppInputAdapter = Schema.Union([
  Schema.Literal("none"),
  Schema.Literal("query"),
  Schema.Literal("json"),
  Schema.Literal("form"),
  Schema.Literal("raw"),
])
export type OrbitAppInputAdapter = typeof OrbitAppInputAdapter.Type

export const OrbitAppOutputAdapter = Schema.Union([
  Schema.Literal("html"),
  Schema.Literal("json"),
  Schema.Literal("text"),
  Schema.Literal("redirect"),
  Schema.Literal("passthrough"),
])
export type OrbitAppOutputAdapter = typeof OrbitAppOutputAdapter.Type

export const OrbitAppRoutePermission = Schema.Struct({
  action: Schema.String,
  resource: Schema.optional(Schema.String),
})
export type OrbitAppRoutePermission = typeof OrbitAppRoutePermission.Type

export const OrbitAppTransform = Schema.Struct({
  kind: Schema.Union([
    Schema.Literal("none"),
    Schema.Literal("template"),
    Schema.Literal("jsonpath"),
  ]),
  value: Schema.optional(Schema.String),
})
export type OrbitAppTransform = typeof OrbitAppTransform.Type

export const OrbitAppRateLimit = Schema.Struct({
  window_seconds: Schema.Number,
  max: Schema.Number,
})
export type OrbitAppRateLimit = typeof OrbitAppRateLimit.Type

export const OrbitAppJobRef = Schema.Struct({
  name: OrbitJobName,
  version: Schema.optional(OrbitJobVersion),
  input_schema: Schema.optional(OrbitJsonSchema),
  output_schema: Schema.optional(OrbitJsonSchema),
  description: Schema.optional(Schema.String),
})
export type OrbitAppJobRef = typeof OrbitAppJobRef.Type

// A route MUST declare either `job` or `static_html`, not both. Runtime support
// for `static_html` lands separately in Wave B; this schema change only unlocks
// type-checked authoring of jobless static app routes.
export const OrbitAppRoute = Schema.Struct({
  method: OrbitAppRouteMethod,
  path: Schema.NonEmptyString,
  id: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  tags: Schema.optional(Schema.Array(Schema.String)),
  auth: OrbitAppRouteAuth,
  permissions: Schema.optional(Schema.Array(OrbitAppRoutePermission)),
  input: OrbitAppInputAdapter,
  output: OrbitAppOutputAdapter,
  input_transform: Schema.optional(OrbitAppTransform),
  output_transform: Schema.optional(OrbitAppTransform),
  job: Schema.optional(Schema.NonEmptyString),
  static_html: Schema.optional(Schema.NonEmptyString),
  rate_limit: Schema.optional(OrbitAppRateLimit),
})
export type OrbitAppRoute = typeof OrbitAppRoute.Type

export const OrbitAppTheme = Schema.Struct({
  title: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  accent: Schema.optional(Schema.String),
})
export type OrbitAppTheme = typeof OrbitAppTheme.Type

export const OrbitAppPublishRuntime = Schema.Union([
  Schema.Literal("classic"),
  Schema.Literal("bundled"),
])
export type OrbitAppPublishRuntime = typeof OrbitAppPublishRuntime.Type

export const OrbitAppPublishBundle = Schema.Struct({
  code: Schema.NonEmptyString,
  sourcemap: Schema.optional(Schema.String),
  hash: Schema.NonEmptyString,
  bytes: Schema.Number,
})
export type OrbitAppPublishBundle = typeof OrbitAppPublishBundle.Type

export const OrbitAppSummary = Schema.Struct({
  name: OrbitAppName,
  description: Schema.NullOr(Schema.String),
  latest_version: Schema.NullOr(OrbitAppVersion),
  status: OrbitAppStatus,
  url: Schema.NullOr(Schema.String),
  access: OrbitAppAccess,
})
export type OrbitAppSummary = typeof OrbitAppSummary.Type

export const OrbitAppVersionRecord = Schema.Struct({
  version: OrbitAppVersion,
  status: OrbitAppVersionStatus,
  route_count: Schema.Number,
  job_count: Schema.Number,
  created_at: Schema.String,
  error_message: Schema.NullOr(Schema.String),
})
export type OrbitAppVersionRecord = typeof OrbitAppVersionRecord.Type

export const OrbitAppDetail = Schema.Struct({
  name: OrbitAppName,
  description: Schema.NullOr(Schema.String),
  latest_version: Schema.NullOr(OrbitAppVersion),
  status: OrbitAppStatus,
  url: Schema.NullOr(Schema.String),
  access: OrbitAppAccess,
  routes: Schema.Array(OrbitAppRoute),
  jobs: Schema.Record(Schema.String, OrbitAppJobRef),
  versions: Schema.Array(OrbitAppVersionRecord),
})
export type OrbitAppDetail = typeof OrbitAppDetail.Type

export const OrbitAppListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
})
export type OrbitAppListBody = typeof OrbitAppListBody.Type

export const OrbitAppListResponse = Schema.Struct({
  apps: Schema.Array(OrbitAppSummary),
  count: Schema.Number,
})
export type OrbitAppListResponse = typeof OrbitAppListResponse.Type

export const OrbitAppInspectBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  version: Schema.optional(OrbitAppVersion),
})
export type OrbitAppInspectBody = typeof OrbitAppInspectBody.Type

export const OrbitAppInspectResponse = Schema.Struct({
  app: OrbitAppDetail,
})
export type OrbitAppInspectResponse = typeof OrbitAppInspectResponse.Type

export const OrbitAppPublishBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  description: Schema.optional(Schema.String),
  code: Schema.NonEmptyString,
  runtime: Schema.optional(OrbitAppPublishRuntime),
  bundle: Schema.optional(OrbitAppPublishBundle),
  routes: Schema.Array(OrbitAppRoute),
  jobs: Schema.Record(Schema.String, OrbitAppJobRef),
  theme: Schema.optional(OrbitAppTheme),
  allowed_origins: Schema.optional(Schema.Array(Schema.String)),
  idempotency_key: Schema.optional(Schema.String),
})
export type OrbitAppPublishBody = typeof OrbitAppPublishBody.Type

export const OrbitAppPublishResponse = Schema.Struct({
  app: Schema.Struct({
    name: OrbitAppName,
    version: OrbitAppVersion,
    status: OrbitAppVersionStatus,
    url: Schema.String,
  }),
})
export type OrbitAppPublishResponse = typeof OrbitAppPublishResponse.Type

export const OrbitAppDisableBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  version: Schema.optional(OrbitAppVersion),
})
export type OrbitAppDisableBody = typeof OrbitAppDisableBody.Type

export const OrbitAppDisableResponse = Schema.Struct({
  name: OrbitAppName,
  version: Schema.NullOr(OrbitAppVersion),
  disabled: Schema.Boolean,
})
export type OrbitAppDisableResponse = typeof OrbitAppDisableResponse.Type

export const OrbitAppAccessUpdateBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  access: OrbitAppAccess,
})
export type OrbitAppAccessUpdateBody = typeof OrbitAppAccessUpdateBody.Type

export const OrbitAppAccessUpdateResponse = Schema.Struct({
  name: OrbitAppName,
  access: OrbitAppAccess,
  routes_updated: Schema.Number,
})
export type OrbitAppAccessUpdateResponse = typeof OrbitAppAccessUpdateResponse.Type

export const OrbitAppOpenBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  path: Schema.optional(Schema.String),
})
export type OrbitAppOpenBody = typeof OrbitAppOpenBody.Type

export const OrbitAppOpenResponse = Schema.Struct({
  name: OrbitAppName,
  url: Schema.String,
})
export type OrbitAppOpenResponse = typeof OrbitAppOpenResponse.Type

// ---------------------------------------------------------------------------
// Invocation history
// ---------------------------------------------------------------------------

export const OrbitAppInvocationStatus = Schema.Union([
  Schema.Literal("running"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
  Schema.Literal("denied"),
  Schema.Literal("rate_limited"),
])
export type OrbitAppInvocationStatus = typeof OrbitAppInvocationStatus.Type

export const OrbitAppActorKind = Schema.Union([
  Schema.Literal("anonymous"),
  Schema.Literal("workspace_user"),
  Schema.Literal("signed_link"),
  Schema.Literal("service"),
])
export type OrbitAppActorKind = typeof OrbitAppActorKind.Type

export const OrbitAppJobCallStatus = Schema.Union([
  Schema.Literal("running"),
  Schema.Literal("completed"),
  Schema.Literal("failed"),
])
export type OrbitAppJobCallStatus = typeof OrbitAppJobCallStatus.Type

export const OrbitAppInvocationSummary = Schema.Struct({
  id: Schema.String,
  app: OrbitAppName,
  version: OrbitAppVersion,
  deployment_id: Schema.NullOr(Schema.String),
  method: Schema.String,
  path: Schema.String,
  route_job: Schema.NullOr(Schema.String),
  actor_kind: OrbitAppActorKind,
  actor_id: Schema.NullOr(Schema.String),
  status: OrbitAppInvocationStatus,
  status_code: Schema.NullOr(Schema.Number),
  duration_ms: Schema.NullOr(Schema.Number),
  error_message: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  finished_at: Schema.NullOr(Schema.String),
  // Pre-aggregated rollup of linked orbit_app_job_calls. Keeps the list call
  // O(1) without a per-row roundtrip; full job-call list lives on `get`.
  job_call_count: Schema.Number,
})
export type OrbitAppInvocationSummary = typeof OrbitAppInvocationSummary.Type

// Per-row job dispatch chained from one app invocation. Carries the bridge
// to job-side history (job_invocation_id) and to the underlying run when
// reachable (run_id, populated via JOIN to orbit_job_invocations on get).
export const OrbitAppJobCallSummary = Schema.Struct({
  id: Schema.String,
  job_invocation_id: Schema.NullOr(Schema.String),
  job_name: Schema.String,
  job_version: Schema.NullOr(Schema.String),
  route_job: Schema.NullOr(Schema.String),
  status: OrbitAppJobCallStatus,
  error_message: Schema.NullOr(Schema.String),
  duration_ms: Schema.NullOr(Schema.Number),
  run_id: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  finished_at: Schema.NullOr(Schema.String),
})
export type OrbitAppJobCallSummary = typeof OrbitAppJobCallSummary.Type

export const OrbitAppInvocationListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  // Optional name filter — when omitted, returns workspace-wide app
  // invocations (requires the workspace_id+created_at index; migration 0076).
  name: Schema.optional(OrbitAppName),
  version: Schema.optional(OrbitAppVersion),
  route_job: Schema.optional(Schema.String),
  status: Schema.optional(OrbitAppInvocationStatus),
  actor_kind: Schema.optional(OrbitAppActorKind),
  since: Schema.optional(Schema.String),
  before: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
})
export type OrbitAppInvocationListBody = typeof OrbitAppInvocationListBody.Type

export const OrbitAppInvocationListResponse = Schema.Struct({
  invocations: Schema.Array(OrbitAppInvocationSummary),
  next_cursor: Schema.NullOr(Schema.String),
})
export type OrbitAppInvocationListResponse = typeof OrbitAppInvocationListResponse.Type

export const OrbitAppInvocationGetBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  invocation_id: Schema.NonEmptyString,
})
export type OrbitAppInvocationGetBody = typeof OrbitAppInvocationGetBody.Type

export const OrbitAppInvocationGetResponse = Schema.Struct({
  invocation: OrbitAppInvocationSummary,
  job_calls: Schema.Array(OrbitAppJobCallSummary),
})
export type OrbitAppInvocationGetResponse = typeof OrbitAppInvocationGetResponse.Type

// ---------------------------------------------------------------------------
// Activity history
// ---------------------------------------------------------------------------

export const OrbitAppActivityKind = Schema.Union([
  Schema.Literal("invocation"),
  Schema.Literal("version_change"),
  Schema.Literal("admin_change"),
])
export type OrbitAppActivityKind = typeof OrbitAppActivityKind.Type

export const OrbitAppActivityRow = Schema.Struct({
  id: Schema.String,
  kind: OrbitAppActivityKind,
  type: Schema.String,
  activity: Schema.String,
  created_at: Schema.String,
})
export type OrbitAppActivityRow = typeof OrbitAppActivityRow.Type

export const OrbitAppActivityListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  name: OrbitAppName,
  limit: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
})
export type OrbitAppActivityListBody = typeof OrbitAppActivityListBody.Type

export const OrbitAppActivityListResponse = Schema.Struct({
  activity: Schema.Array(OrbitAppActivityRow),
  next_cursor: Schema.NullOr(Schema.String),
})
export type OrbitAppActivityListResponse = typeof OrbitAppActivityListResponse.Type

// ---------------------------------------------------------------------------
// Authoring helper
// ---------------------------------------------------------------------------
//
// Typed identity for app source authoring. The WFP wrapper injects the
// runtime app context; this helper exists only so `export default
// defineOrbitApp({ name: 'x', routes: [...] })` gets TS narrowing.

export const defineOrbitApp = <T>(definition: T): T => definition

