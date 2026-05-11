import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitReadinessSubjectKind = Schema.Union([
  Schema.Literal("orbit_job_version"),
  Schema.Literal("orbit_app_version"),
  Schema.Literal("plugin_tool"),
])
export type OrbitReadinessSubjectKind = typeof OrbitReadinessSubjectKind.Type

export const OrbitReadinessCheckKind = Schema.Union([
  Schema.Literal("deploy_ping"),
  Schema.Literal("schema"),
  Schema.Literal("risk"),
  Schema.Literal("quality"),
  Schema.Literal("smoke"),
])
export type OrbitReadinessCheckKind = typeof OrbitReadinessCheckKind.Type

export const OrbitReadinessStatus = Schema.Union([
  Schema.Literal("queued"),
  Schema.Literal("running"),
  Schema.Literal("healthy"),
  Schema.Literal("degraded"),
  Schema.Literal("broken"),
  Schema.Literal("skipped"),
])
export type OrbitReadinessStatus = typeof OrbitReadinessStatus.Type

export const OrbitReadinessSummary = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  subject_kind: OrbitReadinessSubjectKind,
  subject_id: Schema.String,
  status: OrbitReadinessStatus,
  summary: Schema.Record(Schema.String, Schema.Unknown),
  last_check_id: Schema.NullOr(Schema.String),
  checked_at: Schema.NullOr(Schema.String),
  changed_at: Schema.String,
  updated_at: Schema.String,
})
export type OrbitReadinessSummary = typeof OrbitReadinessSummary.Type
