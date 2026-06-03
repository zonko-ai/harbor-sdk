import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
const UserId = Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
/**
* Normalize an arbitrary free-text string into the lowercase-safe namespace
* shape accepted by {@link SourceNamespace}: lowercase, non-alphanumerics
* collapsed to `-`, leading/trailing `-` trimmed, capped at 40 chars.
*
* This is the single source of truth for the namespace slugify algorithm. The
* frontend mirror lives in
* `apps/web/modules/plugin-registry/namespace-suffix.ts`; the two must stay in
* sync. Returns `''` for input that contains no alphanumerics — callers that
* need a non-empty result should fall back to a default (e.g. `'source'`),
* which is what {@link NormalizedSourceNamespace} does on decode.
*/
function sanitizeNamespace(input) {
	return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
Schema.String.pipe(Schema.decodeTo(SourceNamespace, {
	decode: SchemaGetter.transform((s) => sanitizeNamespace(s) || "source"),
	encode: SchemaGetter.passthrough()
}));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/workspace.ts
const WorkspaceBody = Schema.Struct({ workspace_id: WorkspaceId });
const WorkspaceRole = Schema.Literals([
	"owner",
	"admin",
	"member",
	"viewer"
]);
const ROLES = [
	"owner",
	"admin",
	"member",
	"viewer"
];
const Role = Schema.Literals(ROLES);
const ASSIGNABLE_ROLES = [
	"admin",
	"member",
	"viewer"
];
const AssignableRole = Schema.Literals(ASSIGNABLE_ROLES);
const ROLE_RANK = {
	owner: 0,
	admin: 1,
	member: 2,
	viewer: 3
};
const ROLE_SET = new Set(ROLES);
function hasRole(actual, required) {
	return ROLE_RANK[actual] <= ROLE_RANK[required];
}
function isRole(value) {
	return ROLE_SET.has(value);
}
const WorkspaceSlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
const Workspace = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	slug: WorkspaceSlug,
	role: Role,
	current_user_id: Schema.optional(Schema.String),
	current_user_email: Schema.optional(Schema.String),
	current_user_name: Schema.optional(Schema.NullOr(Schema.String)),
	current_user_avatar: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String)
});
const CreateWorkspaceBody = Schema.Struct({
	name: Schema.NonEmptyString,
	slug: WorkspaceSlug
});
const UpdateWorkspaceBody = Schema.Struct({
	workspace_id: WorkspaceId,
	name: Schema.optional(Schema.NonEmptyString),
	slug: Schema.optional(WorkspaceSlug)
});
const ListWorkspacesBody = Schema.Struct({
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
/**
* Per-user onboarding state. Onboarding is a property of the human, not of
* any single workspace membership, so it is exposed as a top-level block on
* the workspaces listing rather than denormalized onto each workspace.
*/
const UserOnboarding = Schema.Struct({ onboardedAt: Schema.NullOr(Schema.String) });
const ListWorkspacesResult = Schema.Struct({
	data: Schema.Array(Workspace),
	user: UserOnboarding,
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const WorkspaceMember = Schema.Struct({
	workspace_id: WorkspaceId,
	user_id: UserId,
	role: WorkspaceRole,
	created_at: Timestamp
});
const MemberIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	member_id: WorkspaceId
});
const UpdateMemberRoleBody = Schema.Struct({
	workspace_id: WorkspaceId,
	member_id: WorkspaceId,
	role: AssignableRole
});
const Member = Schema.Struct({
	id: Schema.String,
	user_id: Schema.String,
	name: Schema.NullOr(Schema.String),
	email: Schema.String,
	avatar_url: Schema.NullOr(Schema.String),
	role: Role,
	joined_at: Schema.String,
	is_current_user: Schema.optional(Schema.Boolean)
});
const InviteStatus = Schema.Literals([
	"pending",
	"accepted",
	"revoked"
]);
const InviteIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	invite_id: WorkspaceId
});
const SendInviteBody = Schema.Struct({
	workspace_id: WorkspaceId,
	email: Schema.NonEmptyString,
	role: AssignableRole
});
const ResendInviteBody = Schema.Struct({
	workspace_id: WorkspaceId,
	invite_id: WorkspaceId
});
const AcceptInviteBody = Schema.Struct({ invite_token: Schema.NonEmptyString });
const Invite = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	role: Role,
	invited_by_name: Schema.NullOr(Schema.String),
	status: InviteStatus,
	expires_at: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	invite_token: Schema.optional(Schema.NullOr(Schema.String))
});
//#endregion
export { ASSIGNABLE_ROLES, AcceptInviteBody, AssignableRole, CreateWorkspaceBody, Invite, InviteIdBody, InviteStatus, ListWorkspacesBody, ListWorkspacesResult, Member, MemberIdBody, ROLES, ResendInviteBody, Role, SendInviteBody, UpdateMemberRoleBody, UpdateWorkspaceBody, UserOnboarding, Workspace, WorkspaceBody, WorkspaceMember, WorkspaceRole, WorkspaceSlug, hasRole, isRole };

//# sourceMappingURL=workspace.mjs.map