import { Schema } from "effect";

//#region ../core-effect/src/activity.d.ts
type WorkspaceActivityTopic = 'plugin_source.changed' | 'plugin_source.import_started' | 'plugin_source.import_progress' | 'plugin_source.import_finished' | 'plugin_source.import_failed' | 'plugin_tools.index_finished' | 'orbit_readiness.changed' | 'orbit_job.health_changed' | 'orbit_app.health_changed' | 'plugin_tool.health_changed';
declare const WorkspaceActivitySinceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly after: Schema.optional<Schema.Number>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
}>;
type WorkspaceActivitySinceBody = typeof WorkspaceActivitySinceBody.Type;
declare const WorkspaceActivityHeadBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type WorkspaceActivityHeadBody = typeof WorkspaceActivityHeadBody.Type;
declare const WorkspaceActivityEvent: Schema.Struct<{
  readonly version: Schema.Number;
  readonly topic: Schema.String;
  readonly payload: Schema.Unknown;
  readonly created_at: Schema.String;
}>;
interface WorkspaceActivityEvent {
  readonly version: number;
  readonly topic: WorkspaceActivityTopic | string;
  readonly payload: unknown;
  readonly created_at: string;
}
interface WorkspaceActivityInvalidates {
  readonly sources?: boolean;
  readonly registry?: boolean;
  readonly home_summary?: boolean;
  readonly install_jobs?: boolean;
  readonly tools_source_ids?: readonly string[];
  readonly credentials_source_ids?: readonly string[];
  readonly install_job_ids?: readonly string[];
}
interface WorkspaceActivityInvalidationPayload {
  readonly invalidates?: WorkspaceActivityInvalidates;
}
interface WorkspaceActivityNotification {
  readonly kind: 'loading' | 'success' | 'info' | 'warning' | 'error';
  readonly title: string;
  readonly description?: string | undefined;
  readonly dedupe_key?: string | undefined;
}
interface WorkspaceActivityPayload extends WorkspaceActivityInvalidationPayload {
  readonly schema_version?: 1 | undefined;
  readonly entity?: string | null | undefined;
  readonly action?: string | null | undefined;
  readonly status?: string | null | undefined;
  readonly source_id?: string | null | undefined;
  readonly registry_slug?: string | null | undefined;
  readonly notification?: WorkspaceActivityNotification | undefined;
  readonly [key: string]: unknown;
}
declare const WorkspaceActivitySinceResult: Schema.Struct<{
  readonly version: Schema.Number;
  readonly events: Schema.$Array<Schema.Struct<{
    readonly version: Schema.Number;
    readonly topic: Schema.String;
    readonly payload: Schema.Unknown;
    readonly created_at: Schema.String;
  }>>;
  readonly timed_out: Schema.Boolean;
  readonly truncated: Schema.Boolean;
}>;
interface WorkspaceActivitySinceResult {
  readonly version: number;
  readonly events: WorkspaceActivityEvent[];
  readonly timed_out: boolean;
  readonly truncated: boolean;
}
declare const WorkspaceActivityHeadResult: Schema.Struct<{
  readonly version: Schema.Number;
}>;
interface WorkspaceActivityHeadResult {
  readonly version: number;
}
declare const WorkspaceNotification: Schema.Struct<{
  readonly id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly version: Schema.Number;
  readonly topic: Schema.String;
  readonly payload: Schema.Unknown;
  readonly created_at: Schema.String;
  readonly read_at: Schema.NullOr<Schema.String>;
}>;
interface WorkspaceNotification {
  readonly id: string;
  readonly workspace_id: string;
  readonly version: number;
  readonly topic: WorkspaceActivityTopic | string;
  readonly payload: unknown;
  readonly created_at: string;
  readonly read_at: string | null;
}
declare const WorkspaceNotificationsListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type WorkspaceNotificationsListBody = typeof WorkspaceNotificationsListBody.Type;
declare const WorkspaceNotificationsListResult: Schema.Struct<{
  readonly notifications: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly version: Schema.Number;
    readonly topic: Schema.String;
    readonly payload: Schema.Unknown;
    readonly created_at: Schema.String;
    readonly read_at: Schema.NullOr<Schema.String>;
  }>>;
  readonly unread_count: Schema.Number;
}>;
interface WorkspaceNotificationsListResult {
  readonly notifications: WorkspaceNotification[];
  readonly unread_count: number;
}
declare const WorkspaceNotificationMarkReadBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly notification_id: Schema.String;
}>;
type WorkspaceNotificationMarkReadBody = typeof WorkspaceNotificationMarkReadBody.Type;
declare const WorkspaceNotificationMarkAllReadBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type WorkspaceNotificationMarkAllReadBody = typeof WorkspaceNotificationMarkAllReadBody.Type;
declare const WorkspaceNotificationMarkReadResult: Schema.Struct<{
  readonly marked: Schema.Number;
}>;
interface WorkspaceNotificationMarkReadResult {
  readonly marked: number;
}
//#endregion
export { WorkspaceActivityEvent, WorkspaceActivityHeadBody, WorkspaceActivityHeadResult, WorkspaceActivityInvalidates, WorkspaceActivityInvalidationPayload, WorkspaceActivityNotification, WorkspaceActivityPayload, WorkspaceActivitySinceBody, WorkspaceActivitySinceResult, WorkspaceActivityTopic, WorkspaceNotification, WorkspaceNotificationMarkAllReadBody, WorkspaceNotificationMarkReadBody, WorkspaceNotificationMarkReadResult, WorkspaceNotificationsListBody, WorkspaceNotificationsListResult };
//# sourceMappingURL=activity.d.mts.map