// orbit.storage.* contracts: workspace-scoped execution storage, not raw R2.
import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

export const OrbitStorageKey = Schema.NonEmptyString.check(
  Schema.isMaxLength(512),
  Schema.isPattern(/^(?![\\/])(?!.*\.\.).+$/),
)
export type OrbitStorageKey = typeof OrbitStorageKey.Type

export const OrbitStorageEncoding = Schema.Union([
  Schema.Literal("auto"),
  Schema.Literal("metadata"),
  Schema.Literal("text"),
  Schema.Literal("json"),
  Schema.Literal("base64"),
])
export type OrbitStorageEncoding = typeof OrbitStorageEncoding.Type

export const OrbitStorageObject = Schema.Struct({
  key: OrbitStorageKey,
  size: Schema.Number,
  uploaded: Schema.String,
  content_type: Schema.String,
  download_url: Schema.String,
  expires_at: Schema.String,
  expires_in_seconds: Schema.Number,
})
export type OrbitStorageObject = typeof OrbitStorageObject.Type

export const OrbitStorageListBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  prefix: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
})
export type OrbitStorageListBody = typeof OrbitStorageListBody.Type

export const OrbitStorageListResponse = Schema.Struct({
  objects: Schema.Array(OrbitStorageObject),
  truncated: Schema.Boolean,
  cursor: Schema.optional(Schema.String),
})
export type OrbitStorageListResponse = typeof OrbitStorageListResponse.Type

export const OrbitStoragePutBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  key: OrbitStorageKey,
  data: Schema.Unknown,
  content_type: Schema.optional(Schema.String),
  encoding: Schema.optional(Schema.Union([
    Schema.Literal("text"),
    Schema.Literal("json"),
    Schema.Literal("base64"),
  ])),
})
export type OrbitStoragePutBody = typeof OrbitStoragePutBody.Type

export const OrbitStorageGetBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  key: OrbitStorageKey,
  encoding: Schema.optional(OrbitStorageEncoding),
})
export type OrbitStorageGetBody = typeof OrbitStorageGetBody.Type

export const OrbitStorageGetResponse = Schema.NullOr(Schema.Struct({
  ...OrbitStorageObject.fields,
  encoding: Schema.Union([
    Schema.Literal("metadata"),
    Schema.Literal("text"),
    Schema.Literal("json"),
    Schema.Literal("base64"),
  ]),
  data: Schema.optional(Schema.Unknown),
}))
export type OrbitStorageGetResponse = typeof OrbitStorageGetResponse.Type

export const OrbitStorageUrlBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  key: OrbitStorageKey,
})
export type OrbitStorageUrlBody = typeof OrbitStorageUrlBody.Type

export const OrbitStorageUrlResponse = Schema.Struct({
  key: OrbitStorageKey,
  download_url: Schema.String,
  expires_at: Schema.String,
  expires_in_seconds: Schema.Number,
})
export type OrbitStorageUrlResponse = typeof OrbitStorageUrlResponse.Type

export const OrbitStorageDeleteBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  key: OrbitStorageKey,
})
export type OrbitStorageDeleteBody = typeof OrbitStorageDeleteBody.Type

export const OrbitStorageDeleteResponse = Schema.Struct({
  deleted: Schema.Boolean,
  key: OrbitStorageKey,
})
export type OrbitStorageDeleteResponse = typeof OrbitStorageDeleteResponse.Type
