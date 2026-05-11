import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitSocketChannel = Schema.NonEmptyString.check(
  Schema.isMaxLength(128),
  Schema.isPattern(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/),
)
export type OrbitSocketChannel = typeof OrbitSocketChannel.Type

export const OrbitSocketPermission = Schema.Union([
  Schema.Literal("receive"),
  Schema.Literal("send"),
])
export type OrbitSocketPermission = typeof OrbitSocketPermission.Type

export const OrbitSocketUrlBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  channel: OrbitSocketChannel,
  permissions: Schema.optional(Schema.Array(OrbitSocketPermission)),
  expires_in_seconds: Schema.optional(Schema.Number),
  allowed_origins: Schema.optional(Schema.Array(Schema.String)),
})
export type OrbitSocketUrlBody = typeof OrbitSocketUrlBody.Type

export const OrbitSocketUrlResponse = Schema.Struct({
  channel: OrbitSocketChannel,
  url: Schema.String,
  expires_at: Schema.String,
})
export type OrbitSocketUrlResponse = typeof OrbitSocketUrlResponse.Type

export const OrbitSocketBroadcastBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  channel: OrbitSocketChannel,
  event: Schema.Unknown,
})
export type OrbitSocketBroadcastBody = typeof OrbitSocketBroadcastBody.Type

export const OrbitSocketBroadcastResponse = Schema.Struct({
  channel: OrbitSocketChannel,
  delivered: Schema.Number,
})
export type OrbitSocketBroadcastResponse = typeof OrbitSocketBroadcastResponse.Type

export const OrbitSocketStatsBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  channel: OrbitSocketChannel,
})
export type OrbitSocketStatsBody = typeof OrbitSocketStatsBody.Type

export const OrbitSocketStatsResponse = Schema.Struct({
  channel: OrbitSocketChannel,
  connections: Schema.Number,
})
export type OrbitSocketStatsResponse = typeof OrbitSocketStatsResponse.Type
