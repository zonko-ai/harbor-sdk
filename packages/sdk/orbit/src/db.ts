// orbit.db.* dashboard introspection contracts. These are read-only
// endpoints intended for the Harbor dashboard to peek at the workspace
// D1 binding (the same DB exposed to jobs as `__HRBR_WORKSPACE_DB`).
//
// They are deliberately separate from the in-sandbox `orbit.db.query` /
// `orbit.db.exec` operations consumed by job code — those run via the
// host-call bridge and are scoped to the running deployment.

import { Schema } from "effect"
import { OrbitWorkspaceId } from "./common"

// ── Identity ────────────────────────────────────────────────────────

// SQLite identifiers in user space. We never echo back arbitrary names
// from sqlite_master into a query string; the API enforces this regex
// before touching D1, so the dashboard can rely on the same shape.
export const OrbitDbTableName = Schema.NonEmptyString.check(
  Schema.isMaxLength(128),
  Schema.isPattern(/^[a-zA-Z_][a-zA-Z0-9_-]{0,127}$/),
)
export type OrbitDbTableName = typeof OrbitDbTableName.Type

// ── Tables list ─────────────────────────────────────────────────────

export const OrbitDbTableSummary = Schema.Struct({
  name: OrbitDbTableName,
  type: Schema.Union([Schema.Literal("table"), Schema.Literal("view")]),
  // Approximate row count via `SELECT COUNT(*) FROM "<name>"`. May be
  // expensive on large tables; the API caps the per-table count query
  // with a hard timeout and returns null when the count is skipped.
  row_count: Schema.NullOr(Schema.Number),
  // Column names + declared types straight out of `PRAGMA table_info`.
  columns: Schema.Array(
    Schema.Struct({
      name: Schema.String,
      type: Schema.String,
      notnull: Schema.Boolean,
      pk: Schema.Boolean,
    }),
  ),
})
export type OrbitDbTableSummary = typeof OrbitDbTableSummary.Type

export const OrbitDbTablesBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
})
export type OrbitDbTablesBody = typeof OrbitDbTablesBody.Type

export const OrbitDbTablesResponse = Schema.Struct({
  workspace_database_id: Schema.NullOr(Schema.String),
  workspace_database_name: Schema.NullOr(Schema.String),
  status: Schema.Union([
    Schema.Literal("ready"),
    Schema.Literal("creating"),
    Schema.Literal("failed"),
    Schema.Literal("disabled"),
  ]),
  tables: Schema.Array(OrbitDbTableSummary),
})
export type OrbitDbTablesResponse = typeof OrbitDbTablesResponse.Type

// ── Peek (read N rows) ──────────────────────────────────────────────

export const OrbitDbPeekBody = Schema.Struct({
  workspace_id: OrbitWorkspaceId,
  table: OrbitDbTableName,
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
})
export type OrbitDbPeekBody = typeof OrbitDbPeekBody.Type

export const OrbitDbPeekResponse = Schema.Struct({
  table: OrbitDbTableName,
  columns: Schema.Array(Schema.String),
  rows: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
  truncated: Schema.Boolean,
  total_rows: Schema.NullOr(Schema.Number),
})
export type OrbitDbPeekResponse = typeof OrbitDbPeekResponse.Type
