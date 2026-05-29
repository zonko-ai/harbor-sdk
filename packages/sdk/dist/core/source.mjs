import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
const SourceId = Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
const CatalogSlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
const AdapterId = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
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
	"api"
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
const CredentialBinding = Schema.Struct({
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
const SOURCE_STATUSES = [
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
];
const SourceStatus = Schema.Literals(SOURCE_STATUSES);
const SourceVisibility = Schema.Literals(["personal", "workspace"]);
const SourceVerificationStatus = Schema.Literals([
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
const TOOL_BINDING_KINDS = [
	"mcp",
	"mcp_prompt",
	"mcp_resource_read",
	"mcp_resource_template",
	"cli_command",
	"api_request",
	"api_graphql"
];
const ToolBindingKind = Schema.Literals(TOOL_BINDING_KINDS);
const SourceRuntimeTransport = Schema.Literals([
	"mcp_http",
	"mcp_sse",
	"cli",
	"api_http",
	"api_graphql"
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
const SourcePolicy = Schema.Struct({
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
const ApiAuthConfig = Schema.Struct({
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
const Source = Schema.Struct({
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
export { AdapterId, ApiAuthConfig, ApiSourceConfig, AuthKind, CatalogSlug, CliSourceConfig, CredentialBinding, CredentialBindingValue, CredentialSlot, CredentialSlotKind, CredentialSlotScope, InstallFlow, McpSourceConfig, OAuthClientConfig, OAuthDiscovery, SOURCE_STATUSES, Source, SourceAuthMode, SourceAvailabilityCode, SourceConfig, SourceExposure, SourceId, SourceIdentity, SourceKind, SourcePolicy, SourcePolicyDiagnostic, SourceRuntimeTransport, SourceStatus, SourceVerificationStatus, SourceVisibility, TOOL_BINDING_KINDS, ToolBindingKind, WorkspaceId };

//# sourceMappingURL=source.mjs.map