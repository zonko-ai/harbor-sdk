import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
const SourceId = Schema.NonEmptyString;
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
const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
const SecretName = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/source.ts
const SourceKind = Schema.Literals([
	"mcp",
	"cli",
	"api",
	"composio"
]);
const SourceAuthMode = Schema.Literals([
	"none",
	"bearer",
	"api_key",
	"oauth2"
]);
const AuthKind = Schema.Literals([
	"none",
	"static_secret",
	"native_oauth",
	"global_confidential_oauth",
	"manual_client_oauth",
	"managed_account"
]);
const InstallFlow = Schema.Literals([
	"direct",
	"discover",
	"discover_then_auth",
	"manual_credentials",
	"managed_provider",
	"queued_import"
]);
const CredentialSlotKind = Schema.Literals([
	"oauth_token",
	"api_key",
	"client_id",
	"client_secret",
	"managed_account",
	"webhook_secret",
	"env_secret"
]);
const CredentialSlotScope = Schema.Literals([
	"workspace",
	"caller",
	"source",
	"machine"
]);
const CredentialSlot = Schema.Struct({
	slot: Schema.NonEmptyString,
	kind: CredentialSlotKind,
	label: Schema.NonEmptyString,
	optional: Schema.optional(Schema.Boolean),
	scope: Schema.optional(CredentialSlotScope)
});
const CredentialBindingValue = Schema.Union([
	Schema.Struct({
		kind: Schema.Literal("secret"),
		secret_id: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("connection"),
		connection_id: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("managed_account"),
		account_id: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("env"),
		env: SecretName
	})
]);
Schema.Struct({
	workspace_id: Schema.NonEmptyString,
	source_id: SourceId,
	slot: Schema.NonEmptyString,
	scope: CredentialSlotScope,
	principal_id: Schema.optional(Schema.NonEmptyString),
	value: CredentialBindingValue,
	status: Schema.Literals([
		"active",
		"missing",
		"invalid",
		"reconnect_required"
	])
});
const SourceStatus = Schema.Literals([
	"pending",
	"discovering",
	"ready",
	"needs_credentials",
	"credentials_error",
	"mcp_disconnected",
	"spec_error",
	"refreshing",
	"requires_oauth",
	"reconnect_required",
	"no_tools",
	"verification_required",
	"verification_failed"
]);
Schema.Literals(["personal", "workspace"]);
Schema.Literals([
	"pending",
	"verified",
	"failed"
]);
const SourceIdentity = Schema.Struct({
	slug: RegistrySlug,
	kind: SourceKind,
	default_namespace: SourceNamespace,
	display_name: Schema.NonEmptyString
});
const ToolBindingKind = Schema.Literals([
	"mcp",
	"mcp_prompt",
	"mcp_resource_read",
	"mcp_resource_template",
	"cli_command",
	"api_request",
	"api_graphql",
	"composio"
]);
const SourceRuntimeTransport = Schema.Literals([
	"mcp_http",
	"mcp_sse",
	"cli",
	"api_http",
	"api_graphql",
	"composio"
]);
const SourceAvailabilityCode = Schema.Literals([
	"sse_only",
	"manual_oauth_setup",
	"requires_client_secret",
	"install_verification_pending",
	"known_broken",
	"superseded_by_kind"
]);
const SourceExposure = Schema.Struct({
	status: Schema.Literals(["active", "coming_soon"]),
	selectable: Schema.Boolean,
	hidden_in_onboarding: Schema.Boolean,
	label: Schema.optional(Schema.String),
	reason: Schema.optional(Schema.String),
	code: Schema.optional(SourceAvailabilityCode),
	superseded_by: Schema.optional(Schema.String)
});
const SourcePolicyDiagnostic = Schema.Struct({
	phase: Schema.Literals([
		"catalog",
		"curation",
		"deploy",
		"workspace",
		"runtime"
	]),
	modifier_id: Schema.NonEmptyString,
	message: Schema.String
});
Schema.Struct({
	identity: SourceIdentity,
	exposure: SourceExposure,
	setup: Schema.Struct({
		install_flow: InstallFlow,
		auth_kind: AuthKind,
		credential_slots: Schema.Array(CredentialSlot)
	}),
	runtime: Schema.Struct({
		transport: SourceRuntimeTransport,
		tool_binding_kinds: Schema.Array(ToolBindingKind)
	}),
	agent: Schema.Struct({ capabilities: Schema.Array(Schema.String) }),
	adapters: Schema.Record(Schema.String, Schema.String),
	diagnostics: Schema.Array(SourcePolicyDiagnostic)
});
const OAuthDiscovery = Schema.Struct({
	authorization_server: Schema.String,
	authorization_endpoint: Schema.String,
	token_endpoint: Schema.String,
	registration_endpoint: Schema.optional(Schema.String),
	scopes_supported: Schema.Array(Schema.String),
	has_dynamic_registration: Schema.Boolean,
	service_documentation: Schema.optional(Schema.String),
	op_policy_uri: Schema.optional(Schema.String),
	op_tos_uri: Schema.optional(Schema.String),
	token_endpoint_auth_methods_supported: Schema.optional(Schema.Array(Schema.String)),
	resource: Schema.optional(Schema.String),
	resource_documentation: Schema.optional(Schema.String),
	revocation_endpoint: Schema.optional(Schema.String)
});
const OAuthClientConfig = Schema.Struct({
	client_id: Schema.optional(Schema.String),
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
Schema.Struct({
	method: Schema.Literals([
		"none",
		"header",
		"bearer",
		"query",
		"basic"
	]),
	required: Schema.optional(Schema.Boolean),
	env: Schema.optional(SecretName),
	secret_name: Schema.optional(Schema.NonEmptyString),
	header_name: Schema.optional(Schema.String),
	query_param: Schema.optional(Schema.String),
	prefix: Schema.optional(Schema.String),
	username_env: Schema.optional(SecretName),
	username_secret_name: Schema.optional(Schema.NonEmptyString),
	password_env: Schema.optional(SecretName),
	password_secret_name: Schema.optional(Schema.NonEmptyString)
});
const McpSourceConfig = Schema.Struct({
	kind: Schema.Literal("mcp"),
	endpoint: Schema.NonEmptyString,
	transport: Schema.Literals([
		"http",
		"sse",
		"auto"
	]),
	auth_mode: Schema.optional(SourceAuthMode),
	oauth_redirect_url: Schema.optional(Schema.String),
	oauth_scopes: Schema.optional(Schema.Array(Schema.String)),
	oauth_discovery: Schema.optional(OAuthDiscovery),
	oauth_client_config: Schema.optional(OAuthClientConfig),
	default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String))
});
const CliSourceConfig = Schema.Struct({
	kind: Schema.Literal("cli"),
	namespace: SourceNamespace,
	launcher: Schema.Literals([
		"binary",
		"npx",
		"uvx",
		"bunx"
	]),
	command: Schema.NonEmptyString,
	args: Schema.optional(Schema.Array(Schema.String)),
	required_secrets: Schema.optional(Schema.Array(SecretName))
});
const ApiSourceConfig = Schema.Struct({
	kind: Schema.Literal("api"),
	namespace: SourceNamespace,
	base_url: Schema.NonEmptyString,
	auth_mode: Schema.optional(SourceAuthMode),
	required_secrets: Schema.optional(Schema.Array(SecretName))
});
const SourceConfig = Schema.Union([
	McpSourceConfig,
	CliSourceConfig,
	ApiSourceConfig
]);
Schema.Struct({
	id: SourceId,
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	slug: Schema.optional(RegistrySlug),
	kind: SourceKind,
	status: SourceStatus,
	config: SourceConfig,
	created_at: Timestamp,
	updated_at: Timestamp
});
//#endregion
//#region ../core-effect/src/workflow.ts
const WorkflowId = Schema.NonEmptyString;
const WorkflowSlotKind = Schema.Literals(["tool", "input"]);
const WorkflowToolSlot = Schema.Struct({
	kind: Schema.Literal("tool"),
	slug: Schema.String
});
const WorkflowInputSlot = Schema.Struct({
	kind: Schema.Literal("input"),
	slug: Schema.String
});
const WorkflowSlot = Schema.Union([WorkflowToolSlot, WorkflowInputSlot]);
const WorkflowOrGroup = Schema.Array(WorkflowSlot);
const Workflow = Schema.Struct({
	id: WorkflowId,
	title: Schema.String,
	description: Schema.String,
	category: Schema.String,
	defaultTools: Schema.Array(WorkflowToolSlot),
	orGroups: Schema.Array(WorkflowOrGroup),
	optionalTools: Schema.Array(WorkflowToolSlot),
	bodyMarkdown: Schema.String,
	contentHash: Schema.String
});
const WorkflowOwnerKind = Schema.Literals(["system", "workspace"]);
const WorkflowUserSummary = Schema.Struct({
	id: Schema.String,
	name: Schema.NullOr(Schema.String),
	email: Schema.NullOr(Schema.String),
	avatar_url: Schema.NullOr(Schema.String)
});
const WorkflowUserSummarySchema = Schema.Struct({
	id: Schema.String,
	name: Schema.optional(Schema.NullOr(Schema.String)),
	email: Schema.optional(Schema.NullOr(Schema.String)),
	avatar_url: Schema.optional(Schema.NullOr(Schema.String))
});
const WorkflowPluginRequirement = Schema.Struct({
	slug: Schema.String,
	kind: Schema.optional(SourceKind),
	optional: Schema.optional(Schema.Boolean)
});
const WorkflowSourceBinding = Schema.Struct({
	slug: Schema.optional(Schema.String),
	namespace: Schema.optional(Schema.String),
	source_id: Schema.optional(Schema.String)
});
const WorkflowEntryShape = {
	id: Schema.String,
	title: Schema.String,
	description: Schema.String,
	category: Schema.optional(Schema.String),
	content_hash: Schema.String,
	owner_kind: WorkflowOwnerKind,
	workspace_id: Schema.NullOr(Schema.String),
	updated_by_user: Schema.NullOr(WorkflowUserSummarySchema),
	version_name: Schema.NullOr(Schema.String),
	version_number: Schema.NullOr(Schema.Number),
	updated_at: Schema.optional(Schema.String),
	default_tools: Schema.Array(Schema.Unknown),
	or_groups: Schema.Array(Schema.Unknown),
	optional_tools: Schema.Array(Schema.Unknown)
};
const WorkflowListEntrySchema = Schema.Struct(WorkflowEntryShape);
const WorkflowListResponseSchema = Schema.Struct({ workflows: Schema.Array(WorkflowListEntrySchema) });
const WorkflowGetResponseSchema = Schema.Struct({
	...WorkflowEntryShape,
	body_markdown: Schema.optional(Schema.String)
});
const WorkflowListBodySchema = Schema.Struct({ workspace_id: WorkspaceId });
const WorkflowGetBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowAddBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowRemoveBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowCatalogEntry = Schema.Struct({
	id: Schema.String,
	title: Schema.String,
	description: Schema.String,
	category: Schema.String,
	content_hash: Schema.String,
	owner_kind: WorkflowOwnerKind,
	workspace_id: Schema.NullOr(Schema.String),
	updated_by_user: Schema.NullOr(WorkflowUserSummary),
	latest_version_id: Schema.NullOr(Schema.String),
	version_name: Schema.NullOr(Schema.String),
	version_number: Schema.NullOr(Schema.Number),
	version_sequence: Schema.Number,
	last_published_at: Schema.NullOr(Schema.String),
	last_published_by: Schema.NullOr(Schema.String),
	created_by: Schema.NullOr(Schema.String),
	updated_by: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String,
	plugin_requirements: Schema.Array(WorkflowPluginRequirement),
	source_bindings: Schema.Array(WorkflowSourceBinding),
	default_tools: Schema.Array(WorkflowToolSlot),
	or_groups: Schema.Array(WorkflowOrGroup),
	optional_tools: Schema.Array(WorkflowToolSlot)
});
const WorkflowListResponse = Schema.Struct({ workflows: Schema.Array(WorkflowCatalogEntry) });
const WorkflowGetResponse = Schema.Struct({
	...WorkflowCatalogEntry.fields,
	body_markdown: Schema.String
});
function workflowOwnerLabel(entry) {
	return entry.owner_kind === "system" ? "Harbor" : "Workspace";
}
function workflowUpdatedByLabel(entry) {
	return entry.updated_by_user?.name ?? entry.updated_by_user?.email ?? "-";
}
function workflowVersionLabel(entry) {
	return entry.version_name ?? (entry.version_number ? `v${entry.version_number}` : "-");
}
function workflowSkillListRow(entry) {
	return {
		id: entry.id,
		title: entry.title,
		owner: workflowOwnerLabel(entry),
		owner_kind: entry.owner_kind,
		updated_at: entry.updated_at ?? "-",
		description: entry.description,
		updated_by: workflowUpdatedByLabel(entry),
		version: workflowVersionLabel(entry)
	};
}
function workflowSkillDetail(entry) {
	return {
		id: entry.id,
		title: entry.title,
		description: entry.description,
		owner: workflowOwnerLabel(entry),
		owner_kind: entry.owner_kind,
		updated_by: workflowUpdatedByLabel(entry),
		updated_at: entry.updated_at ?? null,
		version: workflowVersionLabel(entry),
		body_markdown: entry.body_markdown,
		content_hash: entry.content_hash,
		default_tools: entry.default_tools,
		or_groups: entry.or_groups,
		optional_tools: entry.optional_tools
	};
}
function workflowToolSlotName(value) {
	if (typeof value === "string") return value;
	if (typeof value !== "object" || value === null) return String(value);
	const record = value;
	const slug = record.slug ?? record.id ?? record.name;
	const kind = record.kind;
	if (typeof slug === "string" && typeof kind === "string" && kind !== "tool") return `${kind}:${slug}`;
	if (typeof slug === "string") return slug;
	return JSON.stringify(value);
}
function workflowToolRequirementsToon(entry) {
	const lines = [];
	if (entry.default_tools.length > 0) {
		lines.push("required_tools:");
		for (const tool of entry.default_tools) lines.push(`  - ${workflowToolSlotName(tool)}`);
	}
	if (entry.or_groups.length > 0) {
		lines.push("one_of_groups:");
		entry.or_groups.forEach((group, index) => {
			const choices = Array.isArray(group) ? group.map(workflowToolSlotName).join(" | ") : workflowToolSlotName(group);
			lines.push(`  ${index + 1}: ${choices}`);
		});
	}
	if (entry.optional_tools.length > 0) {
		lines.push("optional_tools:");
		for (const tool of entry.optional_tools) lines.push(`  - ${workflowToolSlotName(tool)}`);
	}
	return lines.join("\n");
}
function workflowCatalogMap(entries) {
	return new Map(entries.map((entry) => [entry.id, {
		slug: entry.id,
		content_hash: entry.content_hash,
		owner_kind: entry.owner_kind
	}]));
}
function workflowIsToolSlug(slug) {
	return slug.endsWith("-mcp") || slug.endsWith("-cli") || slug.endsWith("-api");
}
function workflowIsInputSlug(slug) {
	return !workflowIsToolSlug(slug);
}
//#endregion
export { Workflow, WorkflowAddBodySchema, WorkflowCatalogEntry, WorkflowGetBodySchema, WorkflowGetResponse, WorkflowGetResponseSchema, WorkflowId, WorkflowInputSlot, WorkflowListBodySchema, WorkflowListEntrySchema, WorkflowListResponse, WorkflowListResponseSchema, WorkflowOrGroup, WorkflowOwnerKind, WorkflowPluginRequirement, WorkflowRemoveBodySchema, WorkflowSlot, WorkflowSlotKind, WorkflowSourceBinding, WorkflowToolSlot, WorkflowUserSummary, WorkflowUserSummarySchema, workflowCatalogMap, workflowIsInputSlug, workflowIsToolSlug, workflowOwnerLabel, workflowSkillDetail, workflowSkillListRow, workflowToolRequirementsToon, workflowUpdatedByLabel, workflowVersionLabel };

//# sourceMappingURL=workflow.mjs.map