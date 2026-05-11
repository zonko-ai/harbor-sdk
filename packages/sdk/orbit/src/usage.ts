// Orbit usage contracts: audited execution-layer primitive activity.
import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitUsageQueryBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  run_id: Schema.optional(Schema.String),
  operation: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
})
export type OrbitUsageQueryBody = typeof OrbitUsageQueryBody.Type

export const OrbitUsageRow = Schema.Struct({
  id: Schema.String,
  run_id: Schema.NullOr(Schema.String),
  workspace_id: OrbitWorkspaceId,
  operation: Schema.String,
  key: Schema.NullOr(Schema.String),
  model: Schema.NullOr(Schema.String),
  size_bytes: Schema.NullOr(Schema.Number),
  duration_ms: Schema.NullOr(Schema.Number),
  error: Schema.NullOr(Schema.String),
  created_at: Schema.String,
})
export type OrbitUsageRow = typeof OrbitUsageRow.Type

export const OrbitUsageQueryResponse = Schema.Struct({
  data: Schema.Array(OrbitUsageRow),
  limit: Schema.Number,
  offset: Schema.Number,
})
export type OrbitUsageQueryResponse = typeof OrbitUsageQueryResponse.Type
