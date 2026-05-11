// @hrbr/workspaces — Workspace, member, and invite schemas.
import { Schema } from "effect"
import { AssignableRole, Role } from "@hrbr/roles"

// Re-export Role so consumers can get it from either package
export { AssignableRole, Role } from "@hrbr/roles"

// ── Workspaces ───────────────────────────────────────────────────────

// Effect v4-beta renamed the regex filter from `Schema.pattern` to
// `Schema.isPattern`, and the pipeline shape from `Schema.String.pipe(
// Schema.pattern(r))` to `Schema.String.check(Schema.isPattern(r))`.
// This SDK file still had the v3 syntax, which blew up at module-load
// time in any bundle built against effect@4 ("Schema9.pattern is not
// a function"). CI caught it.
export const WorkspaceSlug = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
)
export type WorkspaceSlug = typeof WorkspaceSlug.Type

export const Workspace = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  slug: WorkspaceSlug,
  role: Role,
  onboarded_at: Schema.NullOr(Schema.String),
  current_user_id: Schema.optional(Schema.String),
  current_user_email: Schema.optional(Schema.String),
  current_user_name: Schema.optional(Schema.NullOr(Schema.String)),
  current_user_avatar: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
})
export type Workspace = typeof Workspace.Type

export const CreateWorkspaceBody = Schema.Struct({
  name: Schema.NonEmptyString,
  slug: WorkspaceSlug,
})
export type CreateWorkspaceBody = typeof CreateWorkspaceBody.Type

export const UpdateWorkspaceBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  name: Schema.optional(Schema.NonEmptyString),
  slug: Schema.optional(WorkspaceSlug),
})
export type UpdateWorkspaceBody = typeof UpdateWorkspaceBody.Type

export const ListWorkspacesBody = Schema.Struct({
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
})
export type ListWorkspacesBody = typeof ListWorkspacesBody.Type

export const ListWorkspacesResult = Schema.Struct({
  data: Schema.Array(Workspace),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type ListWorkspacesResult = typeof ListWorkspacesResult.Type

export interface WorkspaceListInput {
  readonly limit?: number | undefined
  readonly offset?: number | undefined
  readonly cursor?: string | undefined
  readonly includeTotal?: boolean | undefined
}

export interface WorkspaceGetInput {
  readonly workspaceId: string
}

export interface WorkspaceReader {
  readonly list: (input?: WorkspaceListInput) => Promise<ListWorkspacesResult>
  readonly get: (input: WorkspaceGetInput) => Promise<Workspace>
}

// ── Members ──────────────────────────────────────────────────────────

export const MemberIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  member_id: Schema.String.check(Schema.isUUID()),
})
export type MemberIdBody = typeof MemberIdBody.Type

export const UpdateMemberRoleBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  member_id: Schema.String.check(Schema.isUUID()),
  role: AssignableRole,
})
export type UpdateMemberRoleBody = typeof UpdateMemberRoleBody.Type

export const Member = Schema.Struct({
  id: Schema.String,
  user_id: Schema.String,
  name: Schema.NullOr(Schema.String),
  email: Schema.String,
  avatar_url: Schema.NullOr(Schema.String),
  role: Role,
  joined_at: Schema.String,
  is_current_user: Schema.optional(Schema.Boolean),
})
export type Member = typeof Member.Type

// ── Invites ──────────────────────────────────────────────────────────

export const InviteStatus = Schema.Literals(["pending", "accepted", "revoked"])
export type InviteStatus = typeof InviteStatus.Type

export const InviteIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  invite_id: Schema.String.check(Schema.isUUID()),
})
export type InviteIdBody = typeof InviteIdBody.Type

export const SendInviteBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  email: Schema.NonEmptyString,
  role: AssignableRole,
})
export type SendInviteBody = typeof SendInviteBody.Type

export const ResendInviteBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  invite_id: Schema.String.check(Schema.isUUID()),
})
export type ResendInviteBody = typeof ResendInviteBody.Type

export const AcceptInviteBody = Schema.Struct({
  invite_token: Schema.NonEmptyString,
})
export type AcceptInviteBody = typeof AcceptInviteBody.Type

export const Invite = Schema.Struct({
  id: Schema.String,
  email: Schema.String,
  role: Role,
  invited_by_name: Schema.NullOr(Schema.String),
  status: InviteStatus,
  expires_at: Schema.NullOr(Schema.String),
  created_at: Schema.String,
  invite_token: Schema.optional(Schema.NullOr(Schema.String)),
})
export type Invite = typeof Invite.Type
