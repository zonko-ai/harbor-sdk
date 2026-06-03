import { Schema } from "effect";

//#region ../core-effect/src/workspace.d.ts
declare const WorkspaceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type WorkspaceBody = typeof WorkspaceBody.Type;
declare const WorkspaceRole: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
type WorkspaceRole = typeof WorkspaceRole.Type;
declare const ROLES: readonly ["owner", "admin", "member", "viewer"];
type Role = (typeof ROLES)[number];
declare const Role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
declare const ASSIGNABLE_ROLES: readonly ["admin", "member", "viewer"];
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
declare const AssignableRole: Schema.Literals<readonly ["admin", "member", "viewer"]>;
declare function hasRole(actual: Role, required: Role): boolean;
declare function isRole(value: string): value is Role;
declare const WorkspaceSlug: Schema.String;
type WorkspaceSlug = typeof WorkspaceSlug.Type;
declare const Workspace: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly slug: Schema.String;
  readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
  readonly current_user_id: Schema.optional<Schema.String>;
  readonly current_user_email: Schema.optional<Schema.String>;
  readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.optional<Schema.String>;
  readonly updated_at: Schema.optional<Schema.String>;
}>;
type Workspace = typeof Workspace.Type;
declare const CreateWorkspaceBody: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly slug: Schema.String;
}>;
type CreateWorkspaceBody = typeof CreateWorkspaceBody.Type;
declare const UpdateWorkspaceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.optional<Schema.NonEmptyString>;
  readonly slug: Schema.optional<Schema.String>;
}>;
type UpdateWorkspaceBody = typeof UpdateWorkspaceBody.Type;
declare const ListWorkspacesBody: Schema.Struct<{
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
type ListWorkspacesBody = typeof ListWorkspacesBody.Type;
/**
 * Per-user onboarding state. Onboarding is a property of the human, not of
 * any single workspace membership, so it is exposed as a top-level block on
 * the workspaces listing rather than denormalized onto each workspace.
 */
declare const UserOnboarding: Schema.Struct<{
  readonly onboardedAt: Schema.NullOr<Schema.String>;
}>;
type UserOnboarding = typeof UserOnboarding.Type;
declare const ListWorkspacesResult: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly slug: Schema.String;
    readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
    readonly current_user_id: Schema.optional<Schema.String>;
    readonly current_user_email: Schema.optional<Schema.String>;
    readonly current_user_name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly current_user_avatar: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.optional<Schema.String>;
    readonly updated_at: Schema.optional<Schema.String>;
  }>>;
  readonly user: Schema.Struct<{
    readonly onboardedAt: Schema.NullOr<Schema.String>;
  }>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type ListWorkspacesResult = typeof ListWorkspacesResult.Type;
declare const WorkspaceMember: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly user_id: Schema.NonEmptyString;
  readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
  readonly created_at: Schema.String;
}>;
type WorkspaceMember = typeof WorkspaceMember.Type;
declare const MemberIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly member_id: Schema.String;
}>;
type MemberIdBody = typeof MemberIdBody.Type;
declare const UpdateMemberRoleBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly member_id: Schema.String;
  readonly role: Schema.Literals<readonly ["admin", "member", "viewer"]>;
}>;
type UpdateMemberRoleBody = typeof UpdateMemberRoleBody.Type;
declare const Member: Schema.Struct<{
  readonly id: Schema.String;
  readonly user_id: Schema.String;
  readonly name: Schema.NullOr<Schema.String>;
  readonly email: Schema.String;
  readonly avatar_url: Schema.NullOr<Schema.String>;
  readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
  readonly joined_at: Schema.String;
  readonly is_current_user: Schema.optional<Schema.Boolean>;
}>;
type Member = typeof Member.Type;
declare const InviteStatus: Schema.Literals<readonly ["pending", "accepted", "revoked"]>;
type InviteStatus = typeof InviteStatus.Type;
declare const InviteIdBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly invite_id: Schema.String;
}>;
type InviteIdBody = typeof InviteIdBody.Type;
declare const SendInviteBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly email: Schema.NonEmptyString;
  readonly role: Schema.Literals<readonly ["admin", "member", "viewer"]>;
}>;
type SendInviteBody = typeof SendInviteBody.Type;
declare const ResendInviteBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly invite_id: Schema.String;
}>;
type ResendInviteBody = typeof ResendInviteBody.Type;
declare const AcceptInviteBody: Schema.Struct<{
  readonly invite_token: Schema.NonEmptyString;
}>;
type AcceptInviteBody = typeof AcceptInviteBody.Type;
declare const Invite: Schema.Struct<{
  readonly id: Schema.String;
  readonly email: Schema.String;
  readonly role: Schema.Literals<readonly ["owner", "admin", "member", "viewer"]>;
  readonly invited_by_name: Schema.NullOr<Schema.String>;
  readonly status: Schema.Literals<readonly ["pending", "accepted", "revoked"]>;
  readonly expires_at: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly invite_token: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type Invite = typeof Invite.Type;
//#endregion
export { ASSIGNABLE_ROLES, AcceptInviteBody, AssignableRole, CreateWorkspaceBody, Invite, InviteIdBody, InviteStatus, ListWorkspacesBody, ListWorkspacesResult, Member, MemberIdBody, ROLES, ResendInviteBody, Role, SendInviteBody, UpdateMemberRoleBody, UpdateWorkspaceBody, UserOnboarding, Workspace, WorkspaceBody, WorkspaceMember, WorkspaceRole, WorkspaceSlug, hasRole, isRole };
//# sourceMappingURL=workspace.d.mts.map