import { Schema } from "effect"

export const WorkflowUserSummarySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  avatar_url: Schema.optional(Schema.NullOr(Schema.String)),
})
export type WorkflowUserSummaryWire = typeof WorkflowUserSummarySchema.Type

export const WorkflowListEntrySchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  category: Schema.optional(Schema.String),
  content_hash: Schema.String,
  workflow_scope: Schema.optional(Schema.Literals(["native", "workspace", "personal"])),
  owner_kind: Schema.optional(Schema.Literals(["system", "user", "workspace"])),
  owner_id: Schema.optional(Schema.NullOr(Schema.String)),
  owner_user: Schema.optional(Schema.NullOr(WorkflowUserSummarySchema)),
  updated_by_user: Schema.optional(Schema.NullOr(WorkflowUserSummarySchema)),
  version_name: Schema.optional(Schema.NullOr(Schema.String)),
  version_number: Schema.optional(Schema.NullOr(Schema.Number)),
  access_request_status: Schema.optional(Schema.NullOr(Schema.String)),
  redacted: Schema.optional(Schema.Boolean),
  runnable: Schema.optional(Schema.Boolean),
  updated_at: Schema.optional(Schema.String),
  default_tools: Schema.Array(Schema.Unknown),
  or_groups: Schema.Array(Schema.Unknown),
  optional_tools: Schema.Array(Schema.Unknown),
})
export type WorkflowListEntryWire = typeof WorkflowListEntrySchema.Type

export const WorkflowListResponseSchema = Schema.Struct({
  workflows: Schema.Array(WorkflowListEntrySchema),
})
export type WorkflowListResponseWire = typeof WorkflowListResponseSchema.Type

export const WorkflowGetResponseSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  category: Schema.optional(Schema.String),
  body_markdown: Schema.optional(Schema.String),
  content_hash: Schema.String,
  workflow_scope: Schema.optional(Schema.Literals(["native", "workspace", "personal"])),
  owner_kind: Schema.optional(Schema.Literals(["system", "user", "workspace"])),
  owner_id: Schema.optional(Schema.NullOr(Schema.String)),
  owner_user: Schema.optional(Schema.NullOr(WorkflowUserSummarySchema)),
  updated_by_user: Schema.optional(Schema.NullOr(WorkflowUserSummarySchema)),
  version_name: Schema.optional(Schema.NullOr(Schema.String)),
  version_number: Schema.optional(Schema.NullOr(Schema.Number)),
  access_request_status: Schema.optional(Schema.NullOr(Schema.String)),
  redacted: Schema.optional(Schema.Boolean),
  runnable: Schema.optional(Schema.Boolean),
  updated_at: Schema.optional(Schema.String),
  default_tools: Schema.Array(Schema.Unknown),
  or_groups: Schema.Array(Schema.Unknown),
  optional_tools: Schema.Array(Schema.Unknown),
})
export type WorkflowGetResponseWire = typeof WorkflowGetResponseSchema.Type

export type WorkflowScopeFilter = "all" | "native" | "workspace" | "personal"

export function workflowScopeRequest(
  scope: WorkflowScopeFilter | undefined,
): { readonly workflow_scope?: "native" | "workspace" | "personal" } {
  return !scope || scope === "all" ? {} : { workflow_scope: scope }
}
