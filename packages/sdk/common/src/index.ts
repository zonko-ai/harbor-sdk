// @hrbr/common — Shared API primitives used across all domain packages.
import { Schema } from 'effect'

// ── Response envelopes ───────────────────────────────────────────────

export const ApiResponse = <T extends Schema.Any>(data: T) =>
  Schema.Struct({
    success: Schema.Literal(true),
    data: data,
  })

export const ApiError = Schema.Struct({
  success: Schema.Literal(false),
  error: Schema.String,
  issues: Schema.optional(Schema.Array(Schema.String)),
})

export const PaginatedResponse = <T extends Schema.Any>(item: T) =>
  Schema.Struct({
    success: Schema.Literal(true),
    data: Schema.Array(item),
    total: Schema.optional(Schema.NullOr(Schema.Number)),
    limit: Schema.Number,
    offset: Schema.Number,
    hasMore: Schema.Boolean,
    nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
  })

// ── Request primitives ───────────────────────────────────────────────

export const PaginationParams = Schema.Struct({
  limit: Schema.optional(
    Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 200 }))
  ),
  offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0))),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
})

export const WorkspaceBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
})

// ── Scalar types ─────────────────────────────────────────────────────

export const Timestamp = Schema.NullOr(Schema.String)

// ── Audit ────────────────────────────────────────────────────────────

export const AuditEntry = Schema.Struct({
  id: Schema.String,
  action: Schema.String,
  resource_type: Schema.String,
  resource_id: Schema.NullOr(Schema.String),
  actor_id: Schema.String,
  actor_name: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.Unknown),
  created_at: Schema.String,
})
export type AuditEntry = typeof AuditEntry.Type

// ── Users ────────────────────────────────────────────────────────────

export const UpdateUserBody = Schema.Struct({
  name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(100)),
})
export type UpdateUserBody = typeof UpdateUserBody.Type

export const UserProfile = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  name: Schema.NullOr(Schema.String),
  avatar_url: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  default_workspace_id: Schema.NullOr(Schema.String),
})
export type UserProfile = typeof UserProfile.Type

export const UpdateUserResult = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
})
export type UpdateUserResult = typeof UpdateUserResult.Type

export const SetDefaultWorkspaceBody = Schema.Struct({
  workspace_id: Schema.NullOr(Schema.NonEmptyString),
})
export type SetDefaultWorkspaceBody = typeof SetDefaultWorkspaceBody.Type

export const SetDefaultWorkspaceResult = Schema.Struct({
  default_workspace_id: Schema.NullOr(Schema.String),
})
export type SetDefaultWorkspaceResult = typeof SetDefaultWorkspaceResult.Type

// ── Events ───────────────────────────────────────────────────────────

export const EventType = Schema.Literals([
  'run.started',
  'run.step',
  'run.tool_call',
  'run.tool_result',
  'run.output',
  'run.error',
  'run.completed',
  'run.failed',
])
export type EventType = typeof EventType.Type

export const EventItem = Schema.Struct({
  event_type: EventType,
  payload: Schema.optional(Schema.Unknown),
})
export type EventItem = typeof EventItem.Type

export const IngestEventsBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  run_id: Schema.String.check(Schema.isUUID()),
  events: Schema.Array(EventItem),
})
export type IngestEventsBody = typeof IngestEventsBody.Type

export const ListEventsBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  event_type: Schema.optional(EventType),
  limit: Schema.optional(
    Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 500 }))
  ),
})
export type ListEventsBody = typeof ListEventsBody.Type

export const RunEvent = Schema.Struct({
  id: Schema.String,
  run_id: Schema.String,
  workspace_id: Schema.String,
  event_type: Schema.String,
  payload: Schema.NullOr(Schema.Unknown),
  created_at: Schema.String,
})
export type RunEvent = typeof RunEvent.Type

// ── Workspace activity bus ─────────────────────────────────────────────

export type WorkspaceActivityTopic =
  | 'plugin_source.changed'
  | 'plugin_source.import_started'
  | 'plugin_source.import_progress'
  | 'plugin_source.import_finished'
  | 'plugin_source.import_failed'
  | 'plugin_tools.index_finished'
  | 'orbit_readiness.changed'
  | 'orbit_job.health_changed'
  | 'orbit_app.health_changed'
  | 'plugin_tool.health_changed'

export const WorkspaceActivitySinceBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  after: Schema.optional(Schema.Number),
  timeout_ms: Schema.optional(Schema.Number),
})
export type WorkspaceActivitySinceBody = typeof WorkspaceActivitySinceBody.Type

export const WorkspaceActivityHeadBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
})
export type WorkspaceActivityHeadBody = typeof WorkspaceActivityHeadBody.Type

export const WorkspaceActivityEvent = Schema.Struct({
  version: Schema.Number,
  topic: Schema.String,
  payload: Schema.Unknown,
  created_at: Schema.String,
})
export interface WorkspaceActivityEvent {
  readonly version: number
  readonly topic: WorkspaceActivityTopic | string
  readonly payload: unknown
  readonly created_at: string
}

export interface WorkspaceActivityInvalidates {
  readonly sources?: boolean
  readonly registry?: boolean
  readonly home_summary?: boolean
  readonly install_jobs?: boolean
  readonly tools_source_ids?: readonly string[]
  readonly credentials_source_ids?: readonly string[]
  readonly install_job_ids?: readonly string[]
}

export interface WorkspaceActivityInvalidationPayload {
  readonly invalidates?: WorkspaceActivityInvalidates
}

export interface WorkspaceActivityNotification {
  readonly kind: 'loading' | 'success' | 'info' | 'warning' | 'error'
  readonly title: string
  readonly description?: string | undefined
  readonly dedupe_key?: string | undefined
}

export interface WorkspaceActivityPayload extends WorkspaceActivityInvalidationPayload {
  readonly schema_version?: 1 | undefined
  readonly entity?: string | null | undefined
  readonly action?: string | null | undefined
  readonly status?: string | null | undefined
  readonly source_id?: string | null | undefined
  readonly registry_slug?: string | null | undefined
  readonly notification?: WorkspaceActivityNotification | undefined
  readonly [key: string]: unknown
}

export const WorkspaceActivitySinceResult = Schema.Struct({
  version: Schema.Number,
  events: Schema.Array(WorkspaceActivityEvent),
  timed_out: Schema.Boolean,
  truncated: Schema.Boolean,
})
export interface WorkspaceActivitySinceResult {
  readonly version: number
  readonly events: WorkspaceActivityEvent[]
  readonly timed_out: boolean
  readonly truncated: boolean
}

export const WorkspaceActivityHeadResult = Schema.Struct({
  version: Schema.Number,
})
export interface WorkspaceActivityHeadResult {
  readonly version: number
}

export const WorkspaceNotification = Schema.Struct({
  id: Schema.String,
  workspace_id: Schema.String,
  version: Schema.Number,
  topic: Schema.String,
  payload: Schema.Unknown,
  created_at: Schema.String,
  read_at: Schema.NullOr(Schema.String),
})
export interface WorkspaceNotification {
  readonly id: string
  readonly workspace_id: string
  readonly version: number
  readonly topic: WorkspaceActivityTopic | string
  readonly payload: unknown
  readonly created_at: string
  readonly read_at: string | null
}

export const WorkspaceNotificationsListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  limit: Schema.optional(
    Schema.Number.check(Schema.isInt(), Schema.isBetween({ minimum: 1, maximum: 100 }))
  ),
  offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0))),
})
export type WorkspaceNotificationsListBody = typeof WorkspaceNotificationsListBody.Type

export const WorkspaceNotificationsListResult = Schema.Struct({
  notifications: Schema.Array(WorkspaceNotification),
  unread_count: Schema.Number,
})
export interface WorkspaceNotificationsListResult {
  readonly notifications: WorkspaceNotification[]
  readonly unread_count: number
}

export const WorkspaceNotificationMarkReadBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  notification_id: Schema.String,
})
export type WorkspaceNotificationMarkReadBody = typeof WorkspaceNotificationMarkReadBody.Type

export const WorkspaceNotificationMarkAllReadBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
})
export type WorkspaceNotificationMarkAllReadBody = typeof WorkspaceNotificationMarkAllReadBody.Type

export const WorkspaceNotificationMarkReadResult = Schema.Struct({
  marked: Schema.Number,
})
export interface WorkspaceNotificationMarkReadResult {
  readonly marked: number
}

// ── Device auth ──────────────────────────────────────────────────────

export const DevicePollBody = Schema.Struct({
  device_code: Schema.NonEmptyString,
})
export type DevicePollBody = typeof DevicePollBody.Type
