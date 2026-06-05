import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
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
/**
* A request-body namespace field that **sanitizes on decode** rather than
* rejecting non-slug input. Any input string is run through
* {@link sanitizeNamespace}; if that yields an empty string (input had no
* usable alphanumerics) it falls back to `'source'`, matching the frontend
* `nextFreeNamespace` default. The decoded value always satisfies
* {@link SourceNamespace}. Encoding is identity.
*/
const NormalizedSourceNamespace = Schema.String.pipe(Schema.decodeTo(SourceNamespace, {
	decode: SchemaGetter.transform((s) => sanitizeNamespace(s) || "source"),
	encode: SchemaGetter.passthrough()
}));
const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
const ToolId = Schema.NonEmptyString;
const ToolName = Schema.NonEmptyString;
const SecretName = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
const RegistryToolIdentifier = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/sandbox.ts
const SandUuid = Schema.String.check(Schema.isUUID());
const SandRuntimeOS = Schema.Literals([
	"darwin",
	"linux",
	"windows"
]);
const SandRuntimeArch = Schema.Literals(["arm64", "x64"]);
const SandRuntimeConstraints = Schema.Struct({
	os: Schema.optional(Schema.Array(SandRuntimeOS)),
	arch: Schema.optional(Schema.Array(SandRuntimeArch)),
	requires_sandbox_runtime: Schema.optional(Schema.Boolean)
});
const SandIsolationFilesystemMode = Schema.Literals([
	"workspace",
	"cwd",
	"custom",
	"none"
]);
const SandIsolationNetworkMode = Schema.Literals([
	"inherit",
	"deny",
	"allowlist"
]);
const SandIsolationPolicy = Schema.Struct({
	filesystem: Schema.optional(SandIsolationFilesystemMode),
	network: Schema.optional(SandIsolationNetworkMode),
	readable_paths: Schema.optional(Schema.Array(Schema.String)),
	writable_paths: Schema.optional(Schema.Array(Schema.String)),
	allowed_hosts: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	secret_name: Schema.NonEmptyString,
	env: Schema.NonEmptyString,
	required: Schema.optional(Schema.Boolean)
});
const SandSealingAlgorithm = Schema.Literal("rsa-oaep-256+jwk-v1");
const SandMachinePublicKey = Schema.Struct({
	key_id: Schema.NonEmptyString,
	algorithm: SandSealingAlgorithm,
	public_key_jwk: Schema.Record(Schema.String, Schema.Unknown)
});
const SandSealedSecret = Schema.Struct({
	env: Schema.NonEmptyString,
	key_id: Schema.NonEmptyString,
	algorithm: SandSealingAlgorithm,
	ciphertext_b64: Schema.optional(Schema.NonEmptyString)
});
const SandSecretRef = Schema.Struct({ __hrbr_secret_ref: Schema.NonEmptyString });
const SandResultMode = Schema.Literals([
	"json_stdout",
	"stdout_text",
	"binary_base64",
	"exit_code_only"
]);
const SandStdinMode = Schema.Literals([
	"none",
	"json",
	"text"
]);
const SandCallOptions = Schema.Struct({
	env: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	secret_env: Schema.optional(Schema.Record(Schema.String, SandSecretRef)),
	cwd: Schema.optional(Schema.String),
	timeout_ms: Schema.optional(Schema.Number)
});
const SandLauncher = Schema.Literals([
	"binary",
	"npx",
	"uvx",
	"bunx"
]);
const SandEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
const SandRuntimeArtifactId = Schema.String.check(Schema.isPattern(/^[a-z][a-z0-9_]*$/));
const SandRuntimeTempDirArtifact = Schema.Struct({
	id: SandRuntimeArtifactId,
	kind: Schema.Literal("temp_dir"),
	prefix: Schema.NonEmptyString
});
const SandRuntimeTempFileArtifact = Schema.Struct({
	id: SandRuntimeArtifactId,
	kind: Schema.Literal("temp_file"),
	filename: Schema.NonEmptyString,
	prefix: Schema.optional(Schema.NonEmptyString),
	parent_artifact_id: Schema.optional(SandRuntimeArtifactId),
	contents: Schema.optional(Schema.String)
});
const SandRuntimeArtifact = Schema.Union([SandRuntimeTempDirArtifact, SandRuntimeTempFileArtifact]);
const SandRuntimeValueLiteral = Schema.Struct({
	kind: Schema.Literal("literal"),
	value: Schema.String
});
const SandRuntimeValueArtifactPath = Schema.Struct({
	kind: Schema.Literal("artifact_path"),
	artifact_id: SandRuntimeArtifactId
});
const SandRuntimeValueSecretEnv = Schema.Struct({
	kind: Schema.Literal("secret_env"),
	env: SandEnvKey
});
const SandRuntimeValue = Schema.Union([
	SandRuntimeValueLiteral,
	SandRuntimeValueArtifactPath,
	SandRuntimeValueSecretEnv
]);
const SandRuntimeEnvBinding = Schema.Struct({
	env: SandEnvKey,
	value: SandRuntimeValue
});
const SandRuntimeSpec = Schema.Struct({
	artifacts: Schema.optional(Schema.Array(SandRuntimeArtifact)),
	env: Schema.optional(Schema.Array(SandRuntimeEnvBinding)),
	args: Schema.optional(Schema.Array(SandRuntimeValue))
});
const SandCommandSpec = Schema.Struct({
	launcher: SandLauncher,
	command: Schema.NonEmptyString,
	args: Schema.Array(Schema.String),
	stdin_mode: SandStdinMode,
	result_mode: SandResultMode,
	timeout_ms: Schema.optional(Schema.Number),
	cwd: Schema.optional(Schema.String),
	stdin: Schema.optional(Schema.String),
	sandbox_policy: Schema.optional(SandIsolationPolicy),
	runtime: Schema.optional(SandRuntimeSpec),
	runtime_constraints: Schema.optional(SandRuntimeConstraints)
});
const SandMachineCapabilities = Schema.Struct({
	sandbox_runtime_available: Schema.Boolean,
	sandbox_runtime_version: Schema.optional(Schema.String),
	runtime_constraints: Schema.optional(SandRuntimeConstraints),
	cli_sources: Schema.optional(Schema.Array(Schema.String))
});
const SandSessionStatus = Schema.Literals([
	"created",
	"active",
	"closing",
	"closed",
	"expired"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: SandUuid,
	machine_id: Schema.NonEmptyString,
	run_id: Schema.optional(RunId),
	capabilities: Schema.optional(SandMachineCapabilities),
	machine_public_key: Schema.optional(SandMachinePublicKey)
});
Schema.Struct({
	session_id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	agent_id: SandUuid,
	machine_id: Schema.NonEmptyString,
	status: SandSessionStatus,
	expires_at: Schema.String,
	heartbeat_interval_ms: Schema.optional(Schema.Number),
	machine_public_key_registered: Schema.optional(Schema.Boolean),
	sealing_key_id: Schema.optional(Schema.NonEmptyString)
});
Schema.Struct({
	session_id: Schema.String.check(Schema.isUUID()),
	reason: Schema.optional(Schema.String)
});
const SandDispatchRequest = Schema.Struct({
	source_namespace: Schema.NonEmptyString,
	tool_name: Schema.NonEmptyString,
	input: Schema.Record(Schema.String, Schema.Unknown),
	options: Schema.optional(SandCallOptions)
});
const SandInvocationEnvelope = Schema.Struct({
	invocation_id: Schema.String.check(Schema.isUUID()),
	session_id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	agent_id: SandUuid,
	machine_id: Schema.NonEmptyString,
	run_id: Schema.optional(RunId),
	source_id: Schema.optional(SandUuid),
	source_namespace: Schema.NonEmptyString,
	tool_id: Schema.NonEmptyString,
	tool_name: Schema.NonEmptyString,
	timeout_ms: Schema.optional(Schema.Number),
	request: SandDispatchRequest,
	command: SandCommandSpec,
	sealed_secrets: Schema.optional(Schema.Array(SandSealedSecret)),
	env_keys: Schema.optional(Schema.Array(Schema.String)),
	requested_at: Schema.String,
	expires_at: Schema.String
});
Schema.Struct({
	session_id: Schema.String.check(Schema.isUUID()),
	invocation_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: SandUuid,
	result: Schema.Unknown
});
const SandInvocationResultStatus = Schema.Literals([
	"ok",
	"error",
	"cancelled"
]);
const SandInvocationResult = Schema.Struct({
	invocation_id: Schema.String.check(Schema.isUUID()),
	session_id: Schema.String.check(Schema.isUUID()),
	status: SandInvocationResultStatus,
	exit_code: Schema.optional(Schema.Number),
	stdout: Schema.optional(Schema.String),
	stderr: Schema.optional(Schema.String),
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	duration_ms: Schema.Number,
	completed_at: Schema.String
});
const SandHeartbeatFrame = Schema.Struct({
	type: Schema.Literal("heartbeat"),
	session_id: Schema.String.check(Schema.isUUID()),
	sent_at: Schema.String
});
const SandInvocationFrame = Schema.Struct({
	type: Schema.Literal("invoke"),
	session_id: Schema.String.check(Schema.isUUID()),
	invocation: SandInvocationEnvelope
});
const SandResultFrame = Schema.Struct({
	type: Schema.Literal("result"),
	session_id: Schema.String.check(Schema.isUUID()),
	result: SandInvocationResult
});
const SandErrorFrame = Schema.Struct({
	type: Schema.Literal("error"),
	session_id: Schema.String.check(Schema.isUUID()),
	invocation_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	code: Schema.optional(Schema.String),
	error: Schema.String
});
Schema.Union([
	SandHeartbeatFrame,
	SandInvocationFrame,
	SandResultFrame,
	SandErrorFrame
]);
const SandboxRuntime = Schema.Literals([
	"codemode",
	"node",
	"bun"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	runtime: SandboxRuntime,
	entrypoint: Schema.NonEmptyString,
	files: Schema.Record(Schema.String, Schema.String),
	env: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	secrets: Schema.optional(Schema.Array(SecretName)),
	timeout_ms: Schema.optional(Schema.Number)
});
Schema.Struct({
	ok: Schema.Boolean,
	stdout: Schema.String,
	stderr: Schema.String,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String)
});
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
const ToolBindingKind$1 = Schema.Literals([
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
		tool_binding_kinds: Schema.Array(ToolBindingKind$1)
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
//#region ../core-effect/src/plugin.ts
const TOOL_BINDING_KINDS = [
	"mcp",
	"mcp_prompt",
	"mcp_resource_read",
	"mcp_resource_template",
	"cli_command",
	"api_request",
	"api_graphql",
	"composio"
];
const ToolBindingKind = Schema.Literals(TOOL_BINDING_KINDS);
const ToolBinding = Schema.Struct({
	kind: ToolBindingKind,
	source_id: SourceId,
	namespace: SourceNamespace,
	external_name: ToolName,
	json_schema: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const PluginTool = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	source_id: Schema.String,
	tool_id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	display_name: Schema.NonEmptyString,
	description: Schema.optional(Schema.NullOr(Schema.String)),
	title: Schema.optional(Schema.NullOr(Schema.String)),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	shared_defs: Schema.optional(Schema.Unknown),
	input_type: Schema.optional(Schema.String),
	output_type: Schema.optional(Schema.String),
	type_definitions: Schema.optional(Schema.String),
	annotations: Schema.optional(Schema.Unknown),
	icons: Schema.optional(Schema.Unknown),
	binding: Schema.Unknown,
	tags: Schema.optional(Schema.NullOr(Schema.Array(Schema.NonEmptyString))),
	types: Schema.optional(Schema.String),
	created_at: Schema.String,
	namespace: Schema.optional(Schema.String),
	js_var: Schema.optional(Schema.String),
	signature: Schema.optional(Schema.String)
});
const ToolSearchBody = Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.String,
	source: Schema.optional(SourceNamespace),
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 50
	})))
});
const InvokeToolBody = Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String,
	input: Schema.Record(Schema.String, Schema.Unknown),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	run_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const ToolInvocationResult = Schema.Struct({
	tool_id: ToolId,
	ok: Schema.Boolean,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String)
});
const AuthTemplate = Schema.Union([
	Schema.Struct({
		kind: Schema.Literal("header"),
		header_name: Schema.NonEmptyString,
		value_template: Schema.NonEmptyString,
		secret_slot: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("query"),
		query_param: Schema.NonEmptyString,
		value_template: Schema.NonEmptyString,
		secret_slot: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("basic"),
		username_slot: Schema.NonEmptyString,
		password_slot: Schema.NonEmptyString
	}),
	Schema.Struct({
		kind: Schema.Literal("oauth_grant"),
		header_name: Schema.optional(Schema.String),
		value_template: Schema.optional(Schema.String)
	}),
	Schema.Struct({ kind: Schema.Literal("none") })
]);
const SourceLink = Schema.Struct({
	label: Schema.String,
	url: Schema.String,
	kind: Schema.Literals([
		"docs",
		"dashboard",
		"api"
	])
});
const ComposioStaticAuthScheme = Schema.Literals([
	"API_KEY",
	"BEARER_TOKEN",
	"BASIC"
]);
const ComposioStaticAuthConfig = Schema.Struct({
	auth_scheme: ComposioStaticAuthScheme,
	credential_map: Schema.Record(Schema.NonEmptyString, SecretName),
	validate_credentials: Schema.optional(Schema.Boolean)
});
const SourceVerificationSummary = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus,
	verified: Schema.Boolean,
	checked_at: Schema.String,
	error: Schema.optional(Schema.String)
});
const SourceVerification = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus,
	verified: Schema.Boolean,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown),
	checked_at: Schema.String,
	created_by: Schema.optional(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String
});
const PluginSourceCreator = Schema.Struct({
	id: Schema.String,
	name: Schema.optional(Schema.NullOr(Schema.String)),
	email: Schema.optional(Schema.NullOr(Schema.String)),
	avatar_url: Schema.optional(Schema.NullOr(Schema.String))
});
const McpServerInfo = Schema.Struct({
	name: Schema.String,
	version: Schema.optional(Schema.String)
});
const McpIcon = Schema.Struct({
	src: Schema.String,
	mimeType: Schema.optional(Schema.String),
	sizes: Schema.optional(Schema.String)
});
const McpAnnotations = Schema.Struct({
	title: Schema.optional(Schema.String),
	readOnlyHint: Schema.optional(Schema.Boolean),
	destructiveHint: Schema.optional(Schema.Boolean),
	idempotentHint: Schema.optional(Schema.Boolean),
	openWorldHint: Schema.optional(Schema.Boolean)
});
const PluginSource = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	kind: SourceKind,
	namespace: Schema.String,
	display_name: Schema.String,
	description: Schema.optional(Schema.NullOr(Schema.String)),
	config: Schema.Unknown,
	auth_config: Schema.Unknown,
	status: SourceStatus,
	install_status: Schema.optional(SourceStatus),
	effective_status: Schema.optional(SourceStatus),
	runnable: Schema.optional(Schema.Boolean),
	redacted: Schema.optional(Schema.Boolean),
	non_runnable_reason: Schema.optional(Schema.String),
	tool_count: Schema.Number,
	last_synced_at: Schema.optional(Schema.NullOr(Schema.String)),
	error: Schema.optional(Schema.NullOr(Schema.String)),
	verified: Schema.optional(Schema.Boolean),
	last_verified_at: Schema.optional(Schema.NullOr(Schema.String)),
	last_verify_error: Schema.optional(Schema.NullOr(Schema.String)),
	latest_verification: Schema.optional(SourceVerificationSummary),
	sand_missing_required_secret_envs: Schema.optional(Schema.Array(Schema.String)),
	category: Schema.optional(Schema.NullOr(Schema.String)),
	links: Schema.optional(Schema.NullOr(Schema.Array(SourceLink))),
	icon_url: Schema.optional(Schema.NullOr(Schema.String)),
	shared_defs: Schema.optional(Schema.NullOr(Schema.Unknown)),
	registry_slug: Schema.optional(Schema.NullOr(Schema.String)),
	mcp_protocol_version: Schema.optional(Schema.NullOr(Schema.String)),
	mcp_server_info: Schema.optional(Schema.Unknown),
	mcp_capabilities: Schema.optional(Schema.Unknown),
	mcp_instructions: Schema.optional(Schema.NullOr(Schema.String)),
	mcp_prompt_count: Schema.optional(Schema.Number),
	mcp_resource_count: Schema.optional(Schema.Number),
	mcp_resource_template_count: Schema.optional(Schema.Number),
	generated_types: Schema.optional(Schema.NullOr(Schema.String)),
	/**
	* Composio connected account id (`ca_...`) persisted after the
	* managed-account OAuth flow. Reused by SDK-native `kind:'composio'`
	* execution so tool calls run against the already-authorized account.
	*/
	composio_connected_account_id: Schema.optional(Schema.NullOr(Schema.String)),
	created_by: Schema.optional(Schema.NullOr(Schema.String)),
	created_by_user: Schema.optional(Schema.NullOr(PluginSourceCreator)),
	source_visibility: Schema.optional(SourceVisibility),
	caller_status: Schema.optional(SourceStatus),
	created_at: Schema.String,
	updated_at: Schema.String
});
function effectivePluginSourceStatus(source) {
	return source.effective_status ?? source.caller_status ?? source.status;
}
function isPluginSourceRunnable(source) {
	return source.runnable ?? (effectivePluginSourceStatus(source) === "ready" && source.tool_count > 0);
}
function displayPluginSourceStatus(source) {
	const status = effectivePluginSourceStatus(source);
	return status === "ready" && source.tool_count <= 0 ? "no_tools" : status;
}
const AWAITING_OAUTH_SOURCE_STATUSES = new Set(["requires_oauth", "reconnect_required"]);
function isPluginSourceAwaitingOauth(source) {
	const callerStatus = source.caller_status;
	if (callerStatus && AWAITING_OAUTH_SOURCE_STATUSES.has(callerStatus)) return true;
	return AWAITING_OAUTH_SOURCE_STATUSES.has(effectivePluginSourceStatus(source));
}
function pluginSourceDomainView(source) {
	const awaitingOauth = isPluginSourceAwaitingOauth(source);
	const runnable = !awaitingOauth && isPluginSourceRunnable(source);
	const status = awaitingOauth ? "awaiting_oauth" : displayPluginSourceStatus(source);
	return {
		status,
		effective_status: status,
		caller_runnable: runnable,
		runnable,
		tool_count: runnable ? source.tool_count : 0
	};
}
function pluginSourceNextAction(source) {
	return isPluginSourceAwaitingOauth(source) ? {
		kind: "connect",
		namespace: source.namespace
	} : {
		kind: "list_tools",
		namespace: source.namespace
	};
}
const MCPToolBinding = Schema.Struct({
	kind: Schema.Literal("mcp"),
	tool_name: Schema.String,
	cached_input_schema: Schema.optional(Schema.Unknown),
	cached_output_schema: Schema.optional(Schema.Unknown)
});
const MCPPromptBinding = Schema.Struct({
	kind: Schema.Literal("mcp_prompt"),
	prompt_name: Schema.String
});
const MCPResourceReadBinding = Schema.Struct({
	kind: Schema.Literal("mcp_resource_read"),
	uri: Schema.String
});
const MCPResourceTemplateBinding = Schema.Struct({
	kind: Schema.Literal("mcp_resource_template"),
	uri_template: Schema.String
});
const ApiRequestBinding = Schema.Struct({
	kind: Schema.Literal("api_request"),
	method: Schema.Literals([
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"HEAD"
	]),
	path: Schema.NonEmptyString,
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	query: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	body_template: Schema.optional(Schema.Unknown),
	timeout_ms: Schema.optional(Schema.Number),
	auth: Schema.optional(ApiAuthConfig)
});
const ApiGraphqlBinding = Schema.Struct({
	kind: Schema.Literal("api_graphql"),
	path: Schema.optional(Schema.NonEmptyString),
	document: Schema.NonEmptyString,
	operation_name: Schema.optional(Schema.NonEmptyString),
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	variables_template: Schema.optional(Schema.Unknown),
	timeout_ms: Schema.optional(Schema.Number),
	auth: Schema.optional(ApiAuthConfig)
});
const CliArgTemplateLiteral = Schema.Struct({
	kind: Schema.Literal("literal"),
	value: Schema.String
});
const CliArgTemplateInput = Schema.Struct({
	kind: Schema.Literal("input"),
	path: Schema.NonEmptyString
});
const CliArgTemplateOption = Schema.Struct({
	kind: Schema.Literal("option"),
	flag: Schema.NonEmptyString,
	path: Schema.NonEmptyString,
	omit_if_empty: Schema.optional(Schema.Boolean)
});
const CliArgTemplateFlag = Schema.Struct({
	kind: Schema.Literal("flag"),
	flag: Schema.NonEmptyString,
	path: Schema.NonEmptyString
});
const CliArgTemplatePart = Schema.Union([
	CliArgTemplateLiteral,
	CliArgTemplateInput,
	CliArgTemplateOption,
	CliArgTemplateFlag
]);
const CliLauncher = Schema.Literals([
	"binary",
	"npx",
	"uvx",
	"bunx"
]);
const CliCwdPolicy = Schema.Literals([
	"workspace",
	"configured",
	"call"
]);
const CliSandResultDefaults = Schema.Struct({
	sand_stdin_mode: Schema.optional(SandStdinMode),
	sand_result_mode: SandResultMode,
	streaming: Schema.optional(Schema.Boolean),
	timeout_ms: Schema.optional(Schema.Number)
});
const CliCommandBinding = Schema.Struct({
	kind: Schema.Literal("cli_command"),
	tool_name: Schema.String,
	argv_template: Schema.Array(CliArgTemplatePart),
	sand_stdin_mode: SandStdinMode,
	sand_result_mode: SandResultMode,
	timeout_ms: Schema.optional(Schema.Number),
	streaming: Schema.optional(Schema.Boolean)
});
const ComposioToolBinding = Schema.Struct({
	kind: Schema.Literal("composio"),
	/** Composio tool slug, e.g. `GMAIL_SEND_EMAIL`. The execute call targets this. */
	tool_slug: Schema.NonEmptyString,
	/** Owning toolkit slug, e.g. `gmail`. Informational; mirrors the source config. */
	toolkit_slug: Schema.optional(Schema.NonEmptyString),
	/** Pinned Composio tool version. Forwarded to the execute call when set. */
	version: Schema.optional(Schema.NonEmptyString)
});
const ProviderToolBinding = Schema.Union([
	MCPToolBinding,
	MCPPromptBinding,
	MCPResourceReadBinding,
	MCPResourceTemplateBinding,
	ApiRequestBinding,
	ApiGraphqlBinding,
	CliCommandBinding,
	ComposioToolBinding
]);
const InvokeResultContent = Schema.Struct({
	type: Schema.Literals([
		"text",
		"image",
		"binary"
	]),
	mime_type: Schema.optional(Schema.String),
	data: Schema.String
});
const InvokeResult = Schema.Struct({
	result: Schema.Unknown,
	upstream_status: Schema.optional(Schema.Number),
	content_type: Schema.String,
	content: Schema.optional(Schema.Array(InvokeResultContent)),
	duration_ms: Schema.Number,
	invocation_id: Schema.String,
	run_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const ExecuteResultTextContent = Schema.Struct({
	type: Schema.Literal("text"),
	mime_type: Schema.optional(Schema.String),
	text: Schema.String
});
const ExecuteResultJsonContent = Schema.Struct({
	type: Schema.Literal("json"),
	mime_type: Schema.optional(Schema.String),
	json: Schema.Unknown
});
const ExecuteSkillBundleFile = Schema.Struct({
	relative_path: Schema.String,
	content_base64: Schema.String,
	content_hash: Schema.String
});
const ExecuteSkillBundle = Schema.Struct({
	slug: Schema.String,
	name: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	content: Schema.String,
	content_hash: Schema.String,
	source_commit: Schema.optional(Schema.String),
	files: Schema.optional(Schema.Array(ExecuteSkillBundleFile))
});
const ExecuteResultSkillBundleContent = Schema.Struct({
	type: Schema.Literal("skill_bundle"),
	skill: ExecuteSkillBundle
});
const ExecuteResultContent = Schema.Union([
	ExecuteResultTextContent,
	ExecuteResultJsonContent,
	ExecuteResultSkillBundleContent
]);
const ExecuteResult = Schema.Struct({
	result: Schema.Unknown,
	error: Schema.optional(Schema.String),
	logs: Schema.optional(Schema.Unknown),
	mode: Schema.Union([Schema.Literal("dynamic_worker"), Schema.Literal("workflow")]),
	content: Schema.optional(Schema.Array(ExecuteResultContent)),
	warnings: Schema.optional(Schema.Array(Schema.Struct({
		namespace: Schema.String,
		tool: Schema.String,
		message: Schema.String
	}))),
	run_id: Schema.String.check(Schema.isUUID()),
	workflow_instance_id: Schema.optional(Schema.String)
});
const ToolSearchKind = Schema.Literals([
	"mcp",
	"cli_command",
	"composio",
	"api_request",
	"api_graphql"
]);
const ToolSearchResult = Schema.Struct({
	tool_id: Schema.String,
	display_name: Schema.String,
	description: Schema.optional(Schema.String),
	source_namespace: Schema.String,
	source_display_name: Schema.String,
	score: Schema.Number,
	js_var: Schema.optional(Schema.String),
	signature: Schema.optional(Schema.String)
});
const ToolSignatureHit = Schema.Struct({
	tool_id: Schema.String,
	name: Schema.String,
	namespace: Schema.String,
	js_var: Schema.String,
	js_name: Schema.String,
	display_name: Schema.String,
	description: Schema.optional(Schema.String),
	signature: Schema.String,
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	shared_defs: Schema.optional(Schema.Unknown),
	input_type: Schema.optional(Schema.String),
	output_type: Schema.optional(Schema.String),
	type_definitions: Schema.optional(Schema.String),
	call_example: Schema.optional(Schema.String),
	call: Schema.optional(Schema.Struct({
		expression: Schema.String,
		example: Schema.String
	})),
	score: Schema.Number,
	kind: ToolSearchKind
});
const ToolsSearchResponse = Schema.Struct({
	hits: Schema.Array(ToolSignatureHit),
	results: Schema.Array(ToolSignatureHit),
	usage_hint: Schema.String
});
const ToolDescribeResponse = Schema.Struct({
	tool_id: Schema.String,
	name: Schema.String,
	namespace: Schema.String,
	js_var: Schema.String,
	js_name: Schema.String,
	display_name: Schema.String,
	description: Schema.optional(Schema.String),
	signature: Schema.String,
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	shared_defs: Schema.optional(Schema.Unknown),
	input_type: Schema.optional(Schema.String),
	output_type: Schema.optional(Schema.String),
	type_definitions: Schema.optional(Schema.String),
	call_example: Schema.String,
	call: Schema.Struct({
		expression: Schema.String,
		example: Schema.String
	}),
	kind: ToolSearchKind
});
const ToolSchemaResponse = Schema.Struct({
	tool_id: Schema.String,
	name: Schema.optional(Schema.String),
	display_name: Schema.optional(Schema.NullOr(Schema.String)),
	description: Schema.optional(Schema.NullOr(Schema.String)),
	title: Schema.optional(Schema.NullOr(Schema.String)),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	input_type: Schema.optional(Schema.String),
	output_type: Schema.optional(Schema.String),
	type_definitions: Schema.optional(Schema.String),
	shared_defs: Schema.optional(Schema.Unknown),
	namespace: Schema.optional(Schema.String),
	source_display_name: Schema.optional(Schema.NullOr(Schema.String))
});
const ToolSchemasResponse = Schema.Struct({ data: Schema.Array(ToolSchemaResponse) });
const ToolsListResult = Schema.Struct({
	data: Schema.Array(PluginTool),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const ToolsReindexResult = Schema.Struct({
	queued: Schema.Number,
	sources: Schema.Array(Schema.Struct({
		source_id: Schema.String.check(Schema.isUUID()),
		namespace: Schema.String
	}))
});
const AddToolResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	tool_id: RegistryToolIdentifier
});
const SourceSummary = Schema.Struct({
	namespace: Schema.String,
	display_name: Schema.String,
	kind: SourceKind,
	tool_count: Schema.Number,
	status: SourceStatus,
	category: Schema.optional(Schema.String)
});
const ResolvedAuth = Schema.Struct({
	method: Schema.Literals([
		"header",
		"bearer",
		"query",
		"none"
	]),
	header_name: Schema.optional(Schema.String),
	query_param: Schema.optional(Schema.String),
	prefix: Schema.optional(Schema.String),
	value: Schema.optional(Schema.String)
});
const CredentialKind = Schema.Literals([
	"api_key",
	"bearer_token",
	"oauth2_token",
	"custom"
]);
const PluginCredential = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	source_id: Schema.optional(Schema.NullOr(Schema.String)),
	name: Schema.String,
	display_name: Schema.String,
	kind: CredentialKind,
	status: Schema.Literals([
		"active",
		"expired",
		"revoked",
		"error"
	]),
	last_used_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_by: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	updated_at: Schema.String
});
const AuthConfig = Schema.Struct({
	method: Schema.Literals([
		"header",
		"bearer",
		"query",
		"basic",
		"none"
	]),
	header_name: Schema.optional(Schema.String),
	query_param: Schema.optional(Schema.String),
	prefix: Schema.optional(Schema.String),
	credential_id: Schema.optional(Schema.String),
	credential_value: Schema.optional(Schema.String)
});
const PersistedAuthConfig = Schema.Struct({
	method: Schema.Literals([
		"header",
		"bearer",
		"query",
		"basic",
		"none"
	]),
	header_name: Schema.optional(Schema.String),
	query_param: Schema.optional(Schema.String),
	prefix: Schema.optional(Schema.String),
	credential_id: Schema.optional(Schema.String)
});
const WorkspaceOAuthClient = Schema.Struct({
	registry_slug: Schema.String,
	client_id: Schema.String,
	has_client_secret: Schema.Boolean,
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String),
	created_by: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String
});
const WorkspaceOAuthClientListBody = Schema.Struct({ workspace_id: WorkspaceId });
const WorkspaceOAuthClientListResult = Schema.Struct({
	data: Schema.Array(WorkspaceOAuthClient),
	total: Schema.Number
});
const WorkspaceOAuthClientSetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	registry_slug: Schema.NonEmptyString,
	client_id: Schema.NonEmptyString,
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
const WorkspaceOAuthClientSetResult = Schema.Struct({
	ok: Schema.Literal(true),
	seeded_sources: Schema.Number
});
const WorkspaceOAuthClientDeleteBody = Schema.Struct({
	workspace_id: WorkspaceId,
	registry_slug: Schema.NonEmptyString
});
const WorkspaceOAuthClientDeleteResult = Schema.Struct({ ok: Schema.Literal(true) });
const OAuthCallbackUrlResult = Schema.Struct({ callback_url: Schema.String });
const SourceIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID())
});
const OAuthReconnectBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	grant_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const OAuthDisconnectResult = Schema.Struct({ ok: Schema.Literal(true) });
const OAuthConfigureBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	client_id: Schema.optional(Schema.String),
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
const OAuthConfigureResult = Schema.Struct({ ok: Schema.Literal(true) });
const OAuthSetupHintsBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	registry_slug: Schema.optional(RegistrySlug)
});
const OAuthSetupHintsRegisterUrlSource = Schema.Literals([
	"service_documentation",
	"resource_documentation",
	"authorization_server_origin",
	"none"
]);
const OAuthSetupHints = Schema.Struct({
	display_name: Schema.String,
	redirect_uri: Schema.String,
	register_url: Schema.NullOr(Schema.String),
	register_url_source: OAuthSetupHintsRegisterUrlSource,
	scopes_supported: Schema.Array(Schema.String),
	requires_client_secret: Schema.Boolean,
	has_dynamic_registration: Schema.Boolean,
	workspace_client_already_configured: Schema.Boolean,
	has_global_client: Schema.Boolean,
	authorization_server_host: Schema.NullOr(Schema.String)
});
const OAuthStartResult = Schema.Struct({
	authorization_url: Schema.String,
	state: Schema.optional(Schema.String)
});
const OAuthFlowStatusBody = Schema.Struct({
	workspace_id: WorkspaceId,
	state: Schema.NonEmptyString
});
const OAuthFlowStatusResult = Schema.Struct({
	state: Schema.String,
	source_id: Schema.String.check(Schema.isUUID()),
	purpose: Schema.Literals(["connect", "reconnect"]),
	grant_id: Schema.NullOr(Schema.String.check(Schema.isUUID())),
	status: Schema.Literals([
		"pending",
		"consumed",
		"expired",
		"superseded",
		"failed"
	]),
	error: Schema.NullOr(Schema.String),
	expires_at: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String,
	source_status: Schema.optional(Schema.NullOr(SourceStatus)),
	source_tool_count: Schema.optional(Schema.NullOr(Schema.Number)),
	source_error: Schema.optional(Schema.NullOr(Schema.String))
});
const SourceListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	registry_slug: Schema.optional(RegistrySlug),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean),
	machine_id: Schema.optional(Schema.NonEmptyString),
	agent_id: Schema.optional(Schema.NonEmptyString)
});
const SourceListResult = Schema.Struct({
	data: Schema.Array(PluginSource),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const SourceAuthTestBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.NonEmptyString,
	override_secrets: Schema.optional(Schema.Record(Schema.String, Schema.String))
});
const SourceAuthTestRedactedRequest = Schema.Struct({
	method: Schema.NonEmptyString,
	url: Schema.NonEmptyString,
	headers: Schema.Record(Schema.String, Schema.String),
	body_preview: Schema.optional(Schema.String)
});
const SourceAuthTestResult = Schema.Struct({
	ok: Schema.Boolean,
	http_status: Schema.NullOr(Schema.Number),
	latency_ms: Schema.Number,
	redacted_request: SourceAuthTestRedactedRequest,
	upstream_body_preview: Schema.String,
	provider_diagnosis: Schema.NonEmptyString,
	suggested_fix: Schema.optional(Schema.String)
});
const SourceAbandonResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	abandoned: Schema.Literal(true)
});
const SourceCleanupStaleResult = Schema.Struct({
	ok: Schema.Literal(true),
	ttl_minutes: Schema.Number
});
const SourceVisibilitySetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	source_visibility: SourceVisibility
});
const McpProbeBody = Schema.Struct({
	workspace_id: WorkspaceId,
	endpoint: Schema.NonEmptyString
});
const RefreshSourceBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.NonEmptyString)
});
const RefreshSourceResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus,
	source: PluginSource
});
const RegistryListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	slug: Schema.optional(RegistrySlug)
});
const ToolIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String
});
const AddSourceBody = Schema.Struct({
	workspace_id: WorkspaceId,
	kind: SourceKind,
	namespace: NormalizedSourceNamespace,
	display_name: Schema.NonEmptyString,
	config: Schema.Unknown,
	auth_config: Schema.optional(Schema.Unknown),
	description: Schema.optional(Schema.String),
	category: Schema.optional(Schema.String),
	icon_url: Schema.optional(Schema.String),
	links: Schema.optional(Schema.Array(SourceLink)),
	source_visibility: Schema.optional(SourceVisibility)
});
const AddSourceResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus,
	source: PluginSource
});
const RemoveSourceResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	removed: Schema.Literal(true)
});
const SourceVerificationSetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown),
	checked_at: Schema.optional(Schema.String)
});
const SourceVerificationGetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.optional(Schema.NonEmptyString),
	agent_id: Schema.optional(Schema.NonEmptyString)
});
const SourceVerificationGetResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	verification: Schema.NullOr(SourceVerification)
});
const SourceVerificationSetResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	verification: SourceVerification
});
const SourceVerificationProbeBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID())
});
const SourceVerificationProbeResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	status: SourceVerificationStatus,
	verified: Schema.Boolean,
	checked_at: Schema.String,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown)
});
const RegistryInstallBody = Schema.Struct({
	workspace_id: WorkspaceId,
	slug: RegistrySlug,
	namespace: Schema.optional(NormalizedSourceNamespace),
	source_visibility: Schema.optional(SourceVisibility),
	secrets_by_env: Schema.optional(Schema.Record(SecretName, Schema.NonEmptyString)),
	credential_value: Schema.optional(Schema.NonEmptyString)
});
const SubmitSourceRequestBody = Schema.Struct({
	workspace_id: WorkspaceId,
	name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(120)),
	description: Schema.optional(Schema.String.check(Schema.isTrimmed(), Schema.isMaxLength(2e3))),
	docs_url: Schema.optional(Schema.String.check(Schema.isTrimmed(), Schema.isPattern(/^https?:\/\/[^\s]+$/)))
});
const SubmitSourceRequestResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	created_at: Schema.Number
});
const PluginInstallJobStatus = Schema.Literals([
	"pending",
	"running",
	"succeeded",
	"failed",
	"cancelled"
]);
const PluginInstallJob = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	slug: RegistrySlug,
	namespace: SourceNamespace,
	status: PluginInstallJobStatus,
	error: Schema.optional(Schema.NullOr(Schema.String)),
	attempts: Schema.Number,
	payload_json: Schema.optional(Schema.NullOr(Schema.String)),
	created_by: Schema.optional(Schema.NullOr(Schema.String)),
	source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
	source_status: Schema.optional(Schema.NullOr(SourceStatus)),
	source_tool_count: Schema.optional(Schema.NullOr(Schema.Number)),
	source_error: Schema.optional(Schema.NullOr(Schema.String)),
	started_at: Schema.optional(Schema.NullOr(Schema.String)),
	finished_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	updated_at: Schema.String
});
const PluginInstallJobListResult = Schema.Struct({
	data: Schema.Array(PluginInstallJob),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const PluginInstallJobGetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	job_id: Schema.String.check(Schema.isUUID())
});
const PluginInstallJobListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	slug: Schema.optional(RegistrySlug),
	status: Schema.optional(PluginInstallJobStatus),
	active: Schema.optional(Schema.Boolean),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const RegistryInstallJobResult = Schema.Struct({
	job_id: Schema.String.check(Schema.isUUID()),
	status: PluginInstallJobStatus
});
const RegistryInstallSourceResult = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus
});
const RegistryInstallResult = Schema.Union([RegistryInstallJobResult, RegistryInstallSourceResult]);
const ToolsListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
const ToolIdsBody = Schema.Struct({ tool_ids: Schema.Array(Schema.NonEmptyString) });
const ToolsReindexBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.String),
	all: Schema.optional(Schema.Boolean)
});
const ToolSearchMode = Schema.Literals([
	"auto",
	"vector",
	"lexical"
]);
const ToolsSearchBody = Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	kind: Schema.optional(Schema.Array(ToolSearchKind)),
	verbose: Schema.optional(Schema.Boolean),
	mode: Schema.optional(ToolSearchMode)
});
const ToolDescribeBody = Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String
});
const AddToolBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	tool_id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	display_name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	title: Schema.optional(Schema.String),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	annotations: Schema.optional(Schema.Unknown),
	icons: Schema.optional(Schema.Unknown),
	binding: Schema.Unknown,
	tags: Schema.optional(Schema.Array(Schema.NonEmptyString))
});
const CredentialCreateBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.NonEmptyString,
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
const CredentialUpsertBody = Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.optional(Schema.String),
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
const CredentialCreateResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String
});
const CredentialUpsertResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String,
	created: Schema.Boolean
});
const CredentialsListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const CredentialListItem = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
	name: Schema.String,
	display_name: Schema.String,
	kind: CredentialKind,
	status: Schema.Literals([
		"active",
		"expired",
		"revoked",
		"error"
	]),
	masked_value: Schema.String,
	last_used_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_by: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	updated_at: Schema.String
});
const CredentialsListResult = Schema.Struct({
	data: Schema.Array(CredentialListItem),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
const CredentialIdBody = Schema.Struct({
	workspace_id: WorkspaceId,
	credential_id: Schema.String.check(Schema.isUUID())
});
const CredentialDeleteResult = Schema.Struct({ ok: Schema.Boolean });
const MetaSearchBody = Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number)
});
const ExtractedTool = Schema.Struct({
	tool_id: RegistryToolIdentifier,
	name: RegistryToolIdentifier,
	display_name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	title: Schema.optional(Schema.String),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	binding: Schema.Unknown,
	tags: Schema.optional(Schema.Array(Schema.NonEmptyString)),
	annotations: Schema.optional(Schema.Unknown),
	icons: Schema.optional(Schema.Array(McpIcon))
});
const DiscoverySourceMetadata = Schema.Struct({
	protocol_version: Schema.optional(Schema.String),
	server_info: Schema.optional(Schema.Unknown),
	capabilities: Schema.optional(Schema.Unknown),
	instructions: Schema.optional(Schema.String),
	icons: Schema.optional(Schema.Array(McpIcon)),
	prompt_count: Schema.optional(Schema.Number),
	resource_count: Schema.optional(Schema.Number),
	resource_template_count: Schema.optional(Schema.Number)
});
const DiscoveryResult = Schema.Struct({
	tools: Schema.Array(ExtractedTool),
	shared_defs: Schema.optional(Schema.Unknown),
	source_metadata: Schema.optional(DiscoverySourceMetadata)
});
const InvokerResult = Schema.Struct({
	result: Schema.Unknown,
	content_type: Schema.String,
	content: Schema.optional(Schema.Array(InvokeResultContent)),
	upstream_status: Schema.optional(Schema.Number),
	duration_ms: Schema.optional(Schema.Number),
	status: Schema.optional(Schema.Number)
});
const InvokerRuntimeConfig = Schema.Struct({
	base_url: Schema.optional(Schema.String),
	default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	encryption_key: Schema.optional(Schema.String)
});
const McpOAuthDiscoveryResult = Schema.Struct({
	authorization_server: Schema.String,
	authorization_endpoint: Schema.String,
	token_endpoint: Schema.String,
	registration_endpoint: Schema.NullOr(Schema.String),
	scopes_supported: Schema.Array(Schema.String),
	has_dynamic_registration: Schema.Boolean
});
const McpProbeResult = Schema.Struct({
	endpoint: Schema.String,
	connected: Schema.Boolean,
	requires_auth: Schema.Boolean,
	tool_count: Schema.Number,
	server_name: Schema.NullOr(Schema.String),
	oauth: Schema.NullOr(McpOAuthDiscoveryResult)
});
const JS_RESERVED = new Set([
	"abstract",
	"arguments",
	"await",
	"boolean",
	"break",
	"byte",
	"case",
	"catch",
	"char",
	"class",
	"const",
	"continue",
	"debugger",
	"default",
	"delete",
	"do",
	"double",
	"else",
	"enum",
	"eval",
	"export",
	"extends",
	"false",
	"final",
	"finally",
	"float",
	"for",
	"function",
	"goto",
	"if",
	"implements",
	"import",
	"in",
	"instanceof",
	"int",
	"interface",
	"let",
	"long",
	"native",
	"new",
	"null",
	"package",
	"private",
	"protected",
	"public",
	"return",
	"short",
	"static",
	"super",
	"switch",
	"synchronized",
	"this",
	"throw",
	"throws",
	"transient",
	"true",
	"try",
	"typeof",
	"undefined",
	"var",
	"void",
	"volatile",
	"while",
	"with",
	"yield"
]);
function toSafeIdentifier(name) {
	return `h_${Array.from(name).map((ch) => ch.codePointAt(0).toString(16).padStart(4, "0")).join("_")}`;
}
function toSanitizedIdentifier(name) {
	if (!name) return "_";
	let sanitized = name.replace(/[-.\s]/g, "_");
	sanitized = sanitized.replace(/[^a-zA-Z0-9_$]/g, "");
	if (!sanitized) return "_";
	if (/^[0-9]/.test(sanitized)) sanitized = `_${sanitized}`;
	if (JS_RESERVED.has(sanitized)) sanitized = `${sanitized}_`;
	return sanitized;
}
function toCamelCase(name) {
	if (!name) return name;
	const sentinel = String.fromCharCode(1);
	const tokens = name.replace(/([a-z0-9])([A-Z])/g, `$1${sentinel}$2`).split(new RegExp(`[-_.\\s${sentinel}]+`)).filter((token) => token.length > 0);
	if (tokens.length === 0) return name;
	return tokens[0].toLowerCase() + tokens.slice(1).map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase()).join("");
}
const JS_IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/;
function isLegalJsBinding(name) {
	return name.length > 0 && JS_IDENTIFIER_RE.test(name) && !JS_RESERVED.has(name);
}
function buildNamespaceAliases(namespaces) {
	const sanitizedCounts = /* @__PURE__ */ new Map();
	const camelCounts = /* @__PURE__ */ new Map();
	for (const namespace of namespaces) {
		const sanitized = toSanitizedIdentifier(namespace);
		const camel = toCamelCase(namespace);
		sanitizedCounts.set(sanitized, (sanitizedCounts.get(sanitized) ?? 0) + 1);
		camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1);
	}
	return new Map(namespaces.map((namespace) => {
		const encoded = toSafeIdentifier(namespace);
		const sanitized = toSanitizedIdentifier(namespace);
		const camel = toCamelCase(namespace);
		const aliases = [encoded];
		const seen = new Set([encoded]);
		if (!seen.has(sanitized) && sanitizedCounts.get(sanitized) === 1 && isLegalJsBinding(sanitized)) {
			aliases.push(sanitized);
			seen.add(sanitized);
		}
		if (!seen.has(camel) && camelCounts.get(camel) === 1 && isLegalJsBinding(camel)) {
			aliases.push(camel);
			seen.add(camel);
		}
		return [namespace, aliases];
	}));
}
function buildToolAliases(toolNames) {
	const rawNameSet = new Set(toolNames);
	const camelCounts = /* @__PURE__ */ new Map();
	for (const toolName of toolNames) {
		const camel = toCamelCase(toolName);
		if (camel !== toolName && !rawNameSet.has(camel)) camelCounts.set(camel, (camelCounts.get(camel) ?? 0) + 1);
	}
	return new Map(toolNames.map((toolName) => {
		const camel = toCamelCase(toolName);
		const aliases = [toolName];
		if (camel !== toolName && !rawNameSet.has(camel) && camelCounts.get(camel) === 1) aliases.push(camel);
		return [toolName, aliases];
	}));
}
function rankNearestMatches(needle, candidates, limit = 3) {
	if (!needle || candidates.length === 0 || limit <= 0) return [];
	const fold = (value) => value.toLowerCase().replace(/[-_.\s]/g, "");
	const target = fold(needle);
	if (!target) return [];
	const targetTokens = needle.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 0);
	const scored = [];
	for (const candidate of candidates) {
		const folded = fold(candidate);
		if (!folded) continue;
		let score = 0;
		if (folded === target) score = 1e4;
		else if (folded.startsWith(target)) score = 5e3 - folded.length;
		else if (folded.includes(target)) score = 2e3 - folded.length;
		else if (target.includes(folded)) score = 1e3 - folded.length;
		else if (targetTokens.length > 0) {
			const overlap = targetTokens.filter((token) => folded.includes(token)).length;
			if (overlap > 0) score = overlap * 100 - folded.length;
		}
		if (score > 0) scored.push({
			name: candidate,
			score
		});
	}
	scored.sort((a, b) => b.score - a.score || a.name.length - b.name.length);
	return scored.slice(0, limit).map((entry) => entry.name);
}
const MAX_FIELDS = 6;
const MAX_DEPTH = 2;
function namespaceToJsVar(namespace) {
	const camel = toCamelCase(namespace);
	if (isLegalJsBinding(camel)) return camel;
	return toSanitizedIdentifier(namespace);
}
function toolNameToJsName(name) {
	const camel = toCamelCase(name);
	if (camel.length > 0 && JS_IDENTIFIER_RE.test(camel)) return camel;
	return toSanitizedIdentifier(name);
}
function renderToolCallExpression(tool) {
	return `${namespaceToJsVar(tool.namespace)}.${toolNameToJsName(tool.name)}(${renderExampleObject(tool.input_schema)})`;
}
function renderToolSignature(tool) {
	return `${namespaceToJsVar(tool.namespace)}.${toolNameToJsName(tool.name)}(${renderParams(tool.input_schema)}): Promise<${renderSchemaType(tool.output_schema, 0)}>`;
}
function renderToolCallExample(tool, options = {}) {
	return `await ${namespaceToJsVar(tool.namespace)}.${toolNameToJsName(tool.name)}(${options.multiline ? renderExampleObjectMultiline(tool.input_schema, 0) : renderExampleObject(tool.input_schema)})`;
}
function renderParams(schema) {
	const record = asRecord(schema);
	if (!record) return "input: Record<string, unknown>";
	const properties = asRecord(record.properties) ?? void 0;
	if (!(record.type === "object" || properties !== void 0)) return `input: ${renderSchemaType(record, 0)}`;
	if (!properties || Object.keys(properties).length === 0) return "input: Record<string, unknown>";
	const required = new Set(Array.isArray(record.required) ? record.required.filter((item) => typeof item === "string") : []);
	const entries = Object.entries(properties);
	const visible = entries.slice(0, MAX_FIELDS).map(([key, value]) => {
		const optional = required.has(key) ? "" : "?";
		return `${formatPropertyName(key)}${optional}: ${renderSchemaType(value, 1)}`;
	});
	const remaining = entries.length - visible.length;
	if (remaining > 0) visible.push(`/* +${remaining} fields */`);
	return visible.join(", ");
}
function renderSchemaType(schema, depth) {
	const record = asRecord(schema);
	if (!record) return "unknown";
	if (Array.isArray(record.enum) && record.enum.length > 0 && record.enum.length <= 8) return record.enum.map(renderLiteral).join(" | ");
	if (Array.isArray(record.const)) return renderLiteral(record.const[0]);
	if ("const" in record) return renderLiteral(record.const);
	if (Array.isArray(record.oneOf)) return renderUnion(record.oneOf, depth);
	if (Array.isArray(record.anyOf)) return renderUnion(record.anyOf, depth);
	if (Array.isArray(record.allOf)) return renderIntersection(record.allOf, depth);
	const type = record.type;
	if (Array.isArray(type)) return type.filter((item) => item !== "null").map((item) => renderSchemaType({
		...record,
		type: item
	}, depth)).join(" | ") || "unknown";
	switch (type) {
		case "string": return "string";
		case "integer":
		case "number": return "number";
		case "boolean": return "boolean";
		case "null": return "null";
		case "array": {
			const itemType = renderSchemaType(record.items, depth + 1);
			return needsParens(itemType) ? `Array<${itemType}>` : `${itemType}[]`;
		}
		case "object": return renderObjectType(record, depth);
		default:
			if (record.properties && typeof record.properties === "object") return renderObjectType(record, depth);
			if (record.items) return `${renderSchemaType(record.items, depth + 1)}[]`;
			return "unknown";
	}
}
function renderObjectType(schema, depth) {
	if (depth >= MAX_DEPTH) return "Record<string, unknown>";
	const properties = asRecord(schema.properties) ?? void 0;
	if (!properties) return "Record<string, unknown>";
	const required = new Set(Array.isArray(schema.required) ? schema.required.filter((item) => typeof item === "string") : []);
	const entries = Object.entries(properties);
	const visible = entries.slice(0, MAX_FIELDS).map(([key, value]) => {
		const optional = required.has(key) ? "" : "?";
		return `${formatPropertyName(key)}${optional}: ${renderSchemaType(value, depth + 1)}`;
	});
	const remaining = entries.length - visible.length;
	if (remaining > 0) visible.push(`/* +${remaining} fields */`);
	return `{ ${visible.join("; ")} }`;
}
function renderUnion(schemas, depth) {
	const rendered = schemas.map((schema) => renderSchemaType(schema, depth + 1));
	return [...new Set(rendered)].slice(0, 6).join(" | ") || "unknown";
}
function renderIntersection(schemas, depth) {
	const rendered = schemas.map((schema) => renderSchemaType(schema, depth + 1));
	return [...new Set(rendered)].slice(0, 4).join(" & ") || "unknown";
}
function renderLiteral(value) {
	if (typeof value === "string") return JSON.stringify(value);
	if (typeof value === "number" || typeof value === "boolean" || value === null) return String(value);
	return "unknown";
}
function needsParens(type) {
	return type.includes(" | ") || type.includes(" & ");
}
function formatPropertyName(key) {
	return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}
function renderExampleObject(schema) {
	const record = asRecord(schema);
	if (!record) return "{}";
	const properties = asRecord(record.properties) ?? void 0;
	if (!properties) return "{}";
	return `{ ${(Array.isArray(record.required) ? record.required.filter((item) => typeof item === "string") : Object.keys(properties).slice(0, 2)).slice(0, 4).map((key) => `${formatPropertyName(key)}: ${renderExampleValue(properties[key])}`).join(", ")} }`;
}
function renderExampleObjectMultiline(schema, depth) {
	const record = asRecord(schema);
	if (!record) return "{}";
	const properties = asRecord(record.properties) ?? void 0;
	if (!properties) return "{}";
	const fields = (Array.isArray(record.required) ? record.required.filter((item) => typeof item === "string") : Object.keys(properties).slice(0, 2)).slice(0, 4);
	if (fields.length === 0) return "{}";
	const pad = "  ".repeat(depth);
	const childPad = "  ".repeat(depth + 1);
	return [
		"{",
		...fields.map((key) => `${childPad}${formatPropertyName(key)}: ${renderExampleValueMultiline(properties[key], depth + 1)},`),
		`${pad}}`
	].join("\n");
}
function renderExampleValueMultiline(schema, depth) {
	const record = asRecord(schema);
	if (!record) return "undefined";
	if (Array.isArray(record.enum) && record.enum.length > 0) return renderLiteral(record.enum[0]);
	if ("const" in record) return renderLiteral(record.const);
	if (Array.isArray(record.oneOf) && record.oneOf.length > 0) return renderExampleValueMultiline(record.oneOf[0], depth);
	if (Array.isArray(record.anyOf) && record.anyOf.length > 0) return renderExampleValueMultiline(record.anyOf[0], depth);
	if (Array.isArray(record.allOf) && record.allOf.length > 0) return renderExampleValueMultiline(record.allOf[0], depth);
	switch (Array.isArray(record.type) ? record.type.find((item) => item !== "null") : record.type) {
		case "string": return "\"...\"";
		case "integer":
		case "number": return "0";
		case "boolean": return "false";
		case "array": return "[]";
		case "object": return renderExampleObjectMultiline(record, depth);
		default:
			if (record.properties && typeof record.properties === "object") return renderExampleObjectMultiline(record, depth);
			return "undefined";
	}
}
function renderExampleValue(schema) {
	const record = asRecord(schema);
	if (!record) return "undefined";
	if (Array.isArray(record.enum) && record.enum.length > 0) return renderLiteral(record.enum[0]);
	if ("const" in record) return renderLiteral(record.const);
	if (Array.isArray(record.oneOf) && record.oneOf.length > 0) return renderExampleValue(record.oneOf[0]);
	if (Array.isArray(record.anyOf) && record.anyOf.length > 0) return renderExampleValue(record.anyOf[0]);
	if (Array.isArray(record.allOf) && record.allOf.length > 0) return renderExampleValue(record.allOf[0]);
	switch (Array.isArray(record.type) ? record.type.find((item) => item !== "null") : record.type) {
		case "string": return "\"...\"";
		case "integer":
		case "number": return "0";
		case "boolean": return "false";
		case "array": return "[]";
		case "object": return renderExampleObject(record);
		default:
			if (record.properties && typeof record.properties === "object") return renderExampleObject(record);
			return "undefined";
	}
}
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return Object.fromEntries(Object.entries(value));
}
//#endregion
export { AWAITING_OAUTH_SOURCE_STATUSES, AddSourceBody, AddSourceResult, AddToolBody, AddToolResult, ApiGraphqlBinding, ApiRequestBinding, AuthConfig, AuthTemplate, CliArgTemplateFlag, CliArgTemplateInput, CliArgTemplateLiteral, CliArgTemplateOption, CliArgTemplatePart, CliCommandBinding, CliCwdPolicy, CliLauncher, CliSandResultDefaults, ComposioStaticAuthConfig, ComposioStaticAuthScheme, ComposioToolBinding, CredentialCreateBody, CredentialCreateResult, CredentialDeleteResult, CredentialIdBody, CredentialKind, CredentialListItem, CredentialUpsertBody, CredentialUpsertResult, CredentialsListBody, CredentialsListResult, DiscoveryResult, DiscoverySourceMetadata, ExecuteResult, ExecuteResultContent, ExecuteResultJsonContent, ExecuteResultSkillBundleContent, ExecuteResultTextContent, ExecuteSkillBundle, ExecuteSkillBundleFile, ExtractedTool, InvokeResult, InvokeResultContent, InvokeToolBody, InvokerResult, InvokerRuntimeConfig, MCPPromptBinding, MCPResourceReadBinding, MCPResourceTemplateBinding, MCPToolBinding, McpAnnotations, McpIcon, McpOAuthDiscoveryResult, McpProbeBody, McpProbeResult, McpServerInfo, MetaSearchBody, OAuthCallbackUrlResult, OAuthConfigureBody, OAuthConfigureResult, OAuthDisconnectResult, OAuthFlowStatusBody, OAuthFlowStatusResult, OAuthReconnectBody, OAuthSetupHints, OAuthSetupHintsBody, OAuthSetupHintsRegisterUrlSource, OAuthStartResult, PersistedAuthConfig, PluginCredential, PluginInstallJob, PluginInstallJobGetBody, PluginInstallJobListBody, PluginInstallJobListResult, PluginInstallJobStatus, PluginSource, PluginSourceCreator, PluginTool, ProviderToolBinding, RefreshSourceBody, RefreshSourceResult, RegistryInstallBody, RegistryInstallJobResult, RegistryInstallResult, RegistryInstallSourceResult, RegistryListBody, RemoveSourceResult, ResolvedAuth, SourceAbandonResult, SourceAuthTestBody, SourceAuthTestRedactedRequest, SourceAuthTestResult, SourceCleanupStaleResult, SourceIdBody, SourceLink, SourceListBody, SourceListResult, SourceSummary, SourceVerification, SourceVerificationGetBody, SourceVerificationGetResult, SourceVerificationProbeBody, SourceVerificationProbeResult, SourceVerificationSetBody, SourceVerificationSetResult, SourceVerificationSummary, SourceVisibilitySetBody, SubmitSourceRequestBody, SubmitSourceRequestResult, TOOL_BINDING_KINDS, ToolBinding, ToolBindingKind, ToolDescribeBody, ToolDescribeResponse, ToolIdBody, ToolIdsBody, ToolInvocationResult, ToolSchemaResponse, ToolSchemasResponse, ToolSearchBody, ToolSearchKind, ToolSearchMode, ToolSearchResult, ToolSignatureHit, ToolsListBody, ToolsListResult, ToolsReindexBody, ToolsReindexResult, ToolsSearchBody, ToolsSearchResponse, WorkspaceOAuthClient, WorkspaceOAuthClientDeleteBody, WorkspaceOAuthClientDeleteResult, WorkspaceOAuthClientListBody, WorkspaceOAuthClientListResult, WorkspaceOAuthClientSetBody, WorkspaceOAuthClientSetResult, buildNamespaceAliases, buildToolAliases, displayPluginSourceStatus, effectivePluginSourceStatus, isPluginSourceAwaitingOauth, isPluginSourceRunnable, namespaceToJsVar, pluginSourceDomainView, pluginSourceNextAction, rankNearestMatches, renderToolCallExample, renderToolCallExpression, renderToolSignature, toCamelCase, toSafeIdentifier, toSanitizedIdentifier, toolNameToJsName };

//# sourceMappingURL=plugin.mjs.map