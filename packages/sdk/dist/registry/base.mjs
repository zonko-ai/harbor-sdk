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
const RegistrySlug$1 = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
const ToolId = Schema.NonEmptyString;
const ToolName = Schema.NonEmptyString;
const SecretName = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
const RegistryToolIdentifier$1 = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
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
const SandSecretBinding = Schema.Struct({
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
	slug: RegistrySlug$1,
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
	slug: Schema.optional(RegistrySlug$1),
	kind: SourceKind,
	status: SourceStatus,
	config: SourceConfig,
	created_at: Timestamp,
	updated_at: Timestamp
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
Schema.Struct({
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
Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.String,
	source: Schema.optional(SourceNamespace),
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 50
	})))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String,
	input: Schema.Record(Schema.String, Schema.Unknown),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	run_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({
	name: Schema.String,
	version: Schema.optional(Schema.String)
});
const McpIcon = Schema.Struct({
	src: Schema.String,
	mimeType: Schema.optional(Schema.String),
	sizes: Schema.optional(Schema.String)
});
Schema.Struct({
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
Schema.Union([
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
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({
	hits: Schema.Array(ToolSignatureHit),
	results: Schema.Array(ToolSignatureHit),
	usage_hint: Schema.String
});
Schema.Struct({
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
Schema.Struct({ data: Schema.Array(ToolSchemaResponse) });
Schema.Struct({
	data: Schema.Array(PluginTool),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	queued: Schema.Number,
	sources: Schema.Array(Schema.Struct({
		source_id: Schema.String.check(Schema.isUUID()),
		namespace: Schema.String
	}))
});
Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	tool_id: RegistryToolIdentifier$1
});
Schema.Struct({
	namespace: Schema.String,
	display_name: Schema.String,
	kind: SourceKind,
	tool_count: Schema.Number,
	status: SourceStatus,
	category: Schema.optional(Schema.String)
});
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({
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
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({
	data: Schema.Array(WorkspaceOAuthClient),
	total: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	registry_slug: Schema.NonEmptyString,
	client_id: Schema.NonEmptyString,
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
Schema.Struct({
	ok: Schema.Literal(true),
	seeded_sources: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	registry_slug: Schema.NonEmptyString
});
Schema.Struct({ ok: Schema.Literal(true) });
Schema.Struct({ callback_url: Schema.String });
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	grant_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
Schema.Struct({ ok: Schema.Literal(true) });
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	client_id: Schema.optional(Schema.String),
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
Schema.Struct({ ok: Schema.Literal(true) });
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	registry_slug: Schema.optional(RegistrySlug$1)
});
const OAuthSetupHintsRegisterUrlSource = Schema.Literals([
	"service_documentation",
	"resource_documentation",
	"authorization_server_origin",
	"none"
]);
Schema.Struct({
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
Schema.Struct({
	authorization_url: Schema.String,
	state: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	state: Schema.NonEmptyString
});
Schema.Struct({
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
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	registry_slug: Schema.optional(RegistrySlug$1),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean),
	machine_id: Schema.optional(Schema.NonEmptyString),
	agent_id: Schema.optional(Schema.NonEmptyString)
});
Schema.Struct({
	data: Schema.Array(PluginSource),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
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
Schema.Struct({
	ok: Schema.Boolean,
	http_status: Schema.NullOr(Schema.Number),
	latency_ms: Schema.Number,
	redacted_request: SourceAuthTestRedactedRequest,
	upstream_body_preview: Schema.String,
	provider_diagnosis: Schema.NonEmptyString,
	suggested_fix: Schema.optional(Schema.String)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	abandoned: Schema.Literal(true)
});
Schema.Struct({
	ok: Schema.Literal(true),
	ttl_minutes: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	source_visibility: SourceVisibility
});
Schema.Struct({
	workspace_id: WorkspaceId,
	endpoint: Schema.NonEmptyString
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.NonEmptyString)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus,
	source: PluginSource
});
Schema.Struct({
	workspace_id: WorkspaceId,
	slug: Schema.optional(RegistrySlug$1)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String
});
Schema.Struct({
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
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus,
	source: PluginSource
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	removed: Schema.Literal(true)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown),
	checked_at: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.optional(Schema.NonEmptyString),
	agent_id: Schema.optional(Schema.NonEmptyString)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	verification: Schema.NullOr(SourceVerification)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	verification: SourceVerification
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	status: SourceVerificationStatus,
	verified: Schema.Boolean,
	checked_at: Schema.String,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	slug: RegistrySlug$1,
	namespace: Schema.optional(NormalizedSourceNamespace),
	source_visibility: Schema.optional(SourceVisibility),
	secrets_by_env: Schema.optional(Schema.Record(SecretName, Schema.NonEmptyString)),
	credential_value: Schema.optional(Schema.NonEmptyString)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(120)),
	description: Schema.optional(Schema.String.check(Schema.isTrimmed(), Schema.isMaxLength(2e3))),
	docs_url: Schema.optional(Schema.String.check(Schema.isTrimmed(), Schema.isPattern(/^https?:\/\/[^\s]+$/)))
});
Schema.Struct({
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
	slug: RegistrySlug$1,
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
Schema.Struct({
	data: Schema.Array(PluginInstallJob),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	job_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({
	workspace_id: WorkspaceId,
	slug: Schema.optional(RegistrySlug$1),
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
Schema.Union([RegistryInstallJobResult, RegistryInstallSourceResult]);
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({ tool_ids: Schema.Array(Schema.NonEmptyString) });
Schema.Struct({
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
Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	kind: Schema.optional(Schema.Array(ToolSearchKind)),
	verbose: Schema.optional(Schema.Boolean),
	mode: Schema.optional(ToolSearchMode)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String
});
Schema.Struct({
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
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.NonEmptyString,
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.optional(Schema.String),
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String
});
Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String,
	created: Schema.Boolean
});
Schema.Struct({
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
Schema.Struct({
	data: Schema.Array(CredentialListItem),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	credential_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({ ok: Schema.Boolean });
Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number)
});
const ExtractedTool = Schema.Struct({
	tool_id: RegistryToolIdentifier$1,
	name: RegistryToolIdentifier$1,
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
Schema.Struct({
	tools: Schema.Array(ExtractedTool),
	shared_defs: Schema.optional(Schema.Unknown),
	source_metadata: Schema.optional(DiscoverySourceMetadata)
});
Schema.Struct({
	result: Schema.Unknown,
	content_type: Schema.String,
	content: Schema.optional(Schema.Array(InvokeResultContent)),
	upstream_status: Schema.optional(Schema.Number),
	duration_ms: Schema.optional(Schema.Number),
	status: Schema.optional(Schema.Number)
});
Schema.Struct({
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
Schema.Struct({
	endpoint: Schema.String,
	connected: Schema.Boolean,
	requires_auth: Schema.Boolean,
	tool_count: Schema.Number,
	server_name: Schema.NullOr(Schema.String),
	oauth: Schema.NullOr(McpOAuthDiscoveryResult)
});
//#endregion
//#region ../registry/src/types.ts
const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
const RegistryNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
const RegistryToolIdentifier = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
const SecretEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
const SkillSlug = RegistrySlug;
const PluginCategory = Schema.Literals([
	"search",
	"ai",
	"comms",
	"dev",
	"data",
	"web",
	"media",
	"infra",
	"observability",
	"analytics",
	"storage",
	"other"
]);
const PluginRegistryManifestToolBinding = Schema.Union([
	MCPToolBinding,
	CliCommandBinding,
	ApiRequestBinding,
	ApiGraphqlBinding
]);
const PluginRegistryManifestTool = Schema.Struct({
	tool_id: RegistryToolIdentifier,
	name: RegistryToolIdentifier,
	display_name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	title: Schema.optional(Schema.String),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	annotations: Schema.optional(Schema.Unknown),
	icons: Schema.optional(Schema.Unknown),
	binding: PluginRegistryManifestToolBinding,
	tags: Schema.optional(Schema.Array(Schema.NonEmptyString))
});
const PluginRegistryManifest = Schema.Struct({
	tools: Schema.Array(PluginRegistryManifestTool),
	shared_defs: Schema.optional(Schema.Unknown)
});
const PluginRegistryCliSetupRequiredSecret = Schema.Struct({
	env: SecretEnvKey,
	display_name: Schema.NonEmptyString,
	description: Schema.NonEmptyString,
	required: Schema.Boolean
});
const PluginRegistryCliSetupRunnableRequirement = Schema.Struct({
	summary: Schema.NonEmptyString,
	required_programs: Schema.Array(Schema.NonEmptyString)
});
const PluginRegistryCliSetupVerifyProbe = Schema.Struct({
	args: Schema.Array(Schema.NonEmptyString),
	success_message: Schema.NonEmptyString
});
const PluginRegistryCliSetupFailureMatcher = Schema.Struct({
	kind: Schema.Literals(["substring", "regex"]),
	pattern: Schema.NonEmptyString,
	flags: Schema.optional(Schema.NonEmptyString)
});
const PluginRegistryCliSetupFailureHint = Schema.Struct({
	matchers: Schema.Array(PluginRegistryCliSetupFailureMatcher),
	message: Schema.NonEmptyString
});
const PluginRegistryCliSetup = Schema.Struct({
	links: Schema.Array(SourceLink),
	required_secrets: Schema.Array(PluginRegistryCliSetupRequiredSecret),
	runnable: PluginRegistryCliSetupRunnableRequirement,
	verify_probe: PluginRegistryCliSetupVerifyProbe,
	failure_hints: Schema.Array(PluginRegistryCliSetupFailureHint)
});
const PluginRegistryApiSetupVerifyProbe = Schema.Union([Schema.Struct({
	kind: Schema.Literal("request"),
	method: Schema.Literals([
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"HEAD"
	]),
	path: Schema.NonEmptyString,
	query: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	expected_status: Schema.optional(Schema.Number),
	success_message: Schema.NonEmptyString
}), Schema.Struct({
	kind: Schema.Literal("graphql"),
	method: Schema.Literal("POST"),
	path: Schema.NonEmptyString,
	document: Schema.NonEmptyString,
	operation_name: Schema.optional(Schema.NonEmptyString),
	variables_template: Schema.optional(Schema.Unknown),
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	expected_status: Schema.optional(Schema.Number),
	success_message: Schema.NonEmptyString
})]);
const PluginRegistryApiSetup = Schema.Struct({
	links: Schema.Array(SourceLink),
	base_url: Schema.NonEmptyString,
	auth_mode: Schema.Literals([
		"header",
		"bearer",
		"query",
		"none",
		"basic"
	]),
	required_secrets: Schema.Array(PluginRegistryCliSetupRequiredSecret),
	verify_probe: PluginRegistryApiSetupVerifyProbe,
	failure_hints: Schema.Array(PluginRegistryCliSetupFailureHint),
	spec_url: Schema.optional(Schema.NonEmptyString),
	graphql_endpoint: Schema.optional(Schema.NonEmptyString),
	graphql_schema_url: Schema.optional(Schema.NonEmptyString),
	default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	timeout_ms: Schema.optional(Schema.Number)
});
const PluginRegistryAuthTest = Schema.Struct({
	method: Schema.Literals([
		"GET",
		"POST",
		"PUT",
		"PATCH",
		"DELETE",
		"HEAD"
	]),
	url: Schema.optional(Schema.NonEmptyString),
	path: Schema.optional(Schema.NonEmptyString),
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	body: Schema.optional(Schema.Unknown),
	expected_status: Schema.optional(Schema.Number),
	auth_template: AuthTemplate
});
const PluginRegistryEntryFields = {
	slug: RegistrySlug,
	display_name: Schema.NonEmptyString,
	description: Schema.NonEmptyString,
	category: PluginCategory,
	auth: Schema.Struct({
		method: Schema.Literals([
			"header",
			"bearer",
			"query",
			"none",
			"basic"
		]),
		header_name: Schema.optional(Schema.NonEmptyString),
		query_param: Schema.optional(Schema.NonEmptyString),
		prefix: Schema.optional(Schema.String),
		required_secrets: Schema.Array(SecretEnvKey)
	}),
	/**
	* Pre-registered OAuth client seed (for providers that don't support
	* RFC 7591 dynamic registration but expose a public proxy client).
	* PostHog's remote MCP, for example, ships with a fixed public client_id
	* and a hardcoded redirect_uri.
	*/
	oauth_client: Schema.optional(Schema.Struct({
		client_id: Schema.optional(Schema.NonEmptyString),
		client_secret: Schema.optional(Schema.NonEmptyString),
		redirect_uri: Schema.optional(Schema.NonEmptyString),
		scope: Schema.optional(Schema.NonEmptyString)
	})),
	auth_test: Schema.optional(PluginRegistryAuthTest),
	links: Schema.optional(Schema.Array(SourceLink)),
	icon_url: Schema.optional(Schema.NonEmptyString),
	skill: Schema.optional(Schema.Struct({ slug: Schema.optional(SkillSlug) })),
	default_namespace: RegistryNamespace,
	/**
	* Hand-tuned popularity score used to rank the catalog in the dashboard.
	* Higher = more likely to be surfaced first. Values typically fall on a
	* 0..100 scale. Decorated by `listRegistryEntries()` from a central
	* POPULARITY map so the canonical catalog JSON stays free of churn.
	*
	* Will eventually be replaced / supplemented by a workspace-scoped
	* usage-metric popularity (live telemetry), but this hard-coded seed is
	* what the UI reads today.
	*/
	popularity: Schema.optional(Schema.Number),
	/**
	* Server-decorated: true when Harbor has a global OAuth client
	* configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
	* slug is eligible for global-client activation. SourcePolicy uses this
	* deploy fact to flip eligible confidential-client providers from
	* `coming_soon` to `active` without exposing the secret itself. The
	* client never sets this field — it is attached by `plugins/registry/list`
	* on the API.
	*/
	is_oauth_client_configured: Schema.optional(Schema.Boolean)
};
const PluginRegistryMcpConfig = Schema.Struct({
	mcp_endpoint: Schema.NonEmptyString,
	mcp_transport: Schema.Literals(["http", "sse"]),
	oauth_discovery: Schema.optional(OAuthDiscovery),
	mcp_default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	composio_auth_config_id: Schema.optional(Schema.NonEmptyString),
	composio_static_auth: Schema.optional(Schema.Struct({
		auth_scheme: ComposioStaticAuthScheme,
		credential_map: Schema.Record(Schema.NonEmptyString, SecretEnvKey),
		validate_credentials: Schema.optional(Schema.Boolean)
	}))
});
const PluginRegistryCliConfig = Schema.Struct({
	cli_launcher: CliLauncher,
	cli_command: Schema.NonEmptyString,
	cli_args: Schema.optional(Schema.Array(Schema.String)),
	cli_cwd_policy: CliCwdPolicy,
	cli_cwd: Schema.optional(Schema.String),
	cli_allowed_env_keys: Schema.optional(Schema.Array(SecretEnvKey)),
	sand_sandbox_policy: Schema.optional(SandIsolationPolicy),
	sand_secret_bindings: Schema.optional(Schema.Array(SandSecretBinding)),
	sand_runtime: Schema.optional(SandRuntimeSpec),
	cli_result_defaults: Schema.optional(CliSandResultDefaults),
	sand_runtime_constraints: Schema.optional(SandRuntimeConstraints)
});
const PluginRegistryComposioConfig = Schema.Struct({
	composio_auth_config_id: Schema.NonEmptyString,
	toolkit_slug: Schema.NonEmptyString,
	version: Schema.optional(Schema.NonEmptyString),
	allowed_tools: Schema.optional(Schema.Array(Schema.NonEmptyString))
});
const PluginRegistryApiConfig = Schema.Struct({
	api_protocol: Schema.optional(Schema.Literals([
		"openapi",
		"graphql",
		"http"
	])),
	api_base_url: Schema.NonEmptyString,
	api_allowed_hosts: Schema.optional(Schema.Array(Schema.NonEmptyString)),
	api_spec_url: Schema.optional(Schema.NonEmptyString),
	api_graphql_endpoint: Schema.optional(Schema.NonEmptyString),
	api_graphql_schema_url: Schema.optional(Schema.NonEmptyString),
	api_default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	api_timeout_ms: Schema.optional(Schema.Number),
	api_auth: Schema.optional(ApiAuthConfig)
});
const PluginRegistryEntry = Schema.Union([
	Schema.Struct({
		...PluginRegistryEntryFields,
		kind: Schema.Literal("mcp"),
		config: PluginRegistryMcpConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	}),
	Schema.Struct({
		...PluginRegistryEntryFields,
		kind: Schema.Literal("cli"),
		cli_setup: PluginRegistryCliSetup,
		config: PluginRegistryCliConfig,
		manifest: PluginRegistryManifest
	}),
	Schema.Struct({
		...PluginRegistryEntryFields,
		kind: Schema.Literal("api"),
		api_setup: PluginRegistryApiSetup,
		config: PluginRegistryApiConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	}),
	Schema.Struct({
		...PluginRegistryEntryFields,
		kind: Schema.Literal("composio"),
		config: PluginRegistryComposioConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	})
]);
const PluginRegistryEntryAvailability = Schema.Struct({
	status: Schema.Literals(["active", "coming_soon"]),
	selectable: Schema.Boolean,
	hiddenInOnboarding: Schema.Boolean,
	label: Schema.optional(Schema.String),
	reason: Schema.optional(Schema.String),
	code: Schema.optional(Schema.Literals([
		"sse_only",
		"manual_oauth_setup",
		"requires_client_secret",
		"install_verification_pending",
		"known_broken",
		"superseded_by_kind"
	]))
});
const PluginRegistryPublicEntryFields = {
	...PluginRegistryEntryFields,
	availability: PluginRegistryEntryAvailability
};
const PluginRegistryPublicEntry = Schema.Union([
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("mcp"),
		config: PluginRegistryMcpConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("cli"),
		cli_setup: PluginRegistryCliSetup,
		config: PluginRegistryCliConfig,
		manifest: PluginRegistryManifest
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("api"),
		api_setup: PluginRegistryApiSetup,
		config: PluginRegistryApiConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("composio"),
		config: PluginRegistryComposioConfig,
		manifest: Schema.optional(PluginRegistryManifest)
	})
]);
const PluginRegistryListResult = Schema.Struct({
	data: Schema.Array(PluginRegistryPublicEntry),
	total: Schema.Number,
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean
});
const PluginRegistryPublicEntryWithoutManifest = Schema.Union([
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("mcp"),
		config: PluginRegistryMcpConfig
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("cli"),
		cli_setup: PluginRegistryCliSetup,
		config: PluginRegistryCliConfig
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("api"),
		api_setup: PluginRegistryApiSetup,
		config: PluginRegistryApiConfig
	}),
	Schema.Struct({
		...PluginRegistryPublicEntryFields,
		kind: Schema.Literal("composio"),
		config: PluginRegistryComposioConfig
	})
]);
const PluginRegistryListResultWithoutManifest = Schema.Struct({
	data: Schema.Array(PluginRegistryPublicEntryWithoutManifest),
	total: Schema.Number,
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean
});
var entries$1 = [
	"git-cli",
	"echo-cli",
	"gh-cli",
	"vercel-cli",
	"modal-cli",
	"wrangler-cli",
	"aws-cli",
	"convex-cli",
	"glab-cli",
	"linear-graphql",
	"github-graphql",
	"github-rest-api",
	"discord-api",
	"cloudflare-api",
	"gitlab-rest-api",
	"deepwiki-mcp",
	"context7-mcp",
	"notion-mcp",
	"browserbase-mcp",
	"firecrawl-mcp",
	"linear-mcp",
	"sentry-mcp",
	"cloudflare-mcp",
	"neon-mcp",
	"stripe-mcp",
	"supabase-mcp",
	"posthog-mcp",
	"figma-mcp",
	"axiom-mcp",
	"monday-mcp",
	"miro-mcp",
	"calendly-mcp",
	"attio-mcp",
	"make-mcp",
	"pylon-mcp",
	"hex-mcp",
	"incidentio-mcp",
	"ahrefs-mcp",
	"bitly-mcp",
	"tavily-mcp",
	"replicate-mcp",
	"granola-mcp",
	"sanity-mcp",
	"amplitude-mcp",
	"mixpanel-mcp",
	"apify-mcp",
	"jina-mcp",
	"scrapingbee-mcp",
	"brightdata-mcp",
	"github-mcp",
	"atlassian-mcp",
	"vercel-mcp",
	"digitalocean-mcp",
	"digitalocean-api",
	"asana-api",
	"twilio-api",
	"axiom-api",
	"resend-api",
	"openrouter-api",
	"openai-api",
	"anthropic-api",
	"xai-api",
	"perplexity-api",
	"x-api",
	"open-meteo-api",
	"polymarket-gamma-api",
	"kalshi-api",
	"browser-use-api",
	"stripe-api",
	"vercel-api",
	"sentry-api",
	"figma-api",
	"supabase-api",
	"netlify-api",
	"sendgrid-api",
	"planetscale-mcp",
	"betterstack-mcp",
	"newrelic-mcp",
	"buildkite-mcp",
	"openai-mcp",
	"huggingface-mcp",
	"slack-mcp",
	"zoom-mcp",
	"asana-mcp",
	"clickup-mcp",
	"airtable-mcp",
	"close-mcp",
	"apollo-mcp",
	"intercom-mcp",
	"canva-mcp",
	"paypal-mcp",
	"square-mcp",
	"brevo-mcp",
	"hubspot-mcp",
	"clerk-mcp",
	"cloudinary-mcp",
	"mapbox-mcp",
	"google-maps-mcp",
	"gmail-mcp",
	"google-drive-mcp",
	"google-sheets-mcp",
	"google-docs-mcp",
	"google-calendar-mcp",
	"onedrive-mcp",
	"outlook-mcp",
	"microsoft-teams-mcp",
	"excel-mcp",
	"sharepoint-mcp",
	"semgrep-mcp",
	"shortcut-mcp",
	"plane-mcp",
	"typeform-mcp",
	"tally-mcp",
	"mercury-mcp",
	"webflow-mcp",
	"customerio-mcp",
	"tigris-mcp",
	"box-mcp",
	"dropbox-mcp",
	"instacart-mcp",
	"dodo-payments-mcp",
	"pagerduty-mcp",
	"fal-mcp",
	"exa-mcp",
	"parallel-search-mcp",
	"you-mcp",
	"render-mcp",
	"heroku-mcp",
	"wix-mcp",
	"plaid-mcp",
	"cypress-mcp",
	"azure-devops-mcp",
	"devrev-mcp",
	"globalping-mcp",
	"coingecko-mcp",
	"scraperapi-mcp",
	"mollie-mcp",
	"docusign-mcp",
	"buffer-mcp",
	"lambdatest-mcp",
	"freshdesk-mcp",
	"datadog-mcp",
	"stackoverflow-mcp",
	"prisma-mcp",
	"ramp-mcp",
	"stytch-mcp",
	"xero-mcp",
	"pinterest-mcp",
	"whoop-api"
];
//#endregion
//#region ../registry-catalog/data/v1/local-icons.json
var local_icons_default = {
	"ahrefs-mcp": {
		"kind": "single",
		"path": "/plugin-icons/ahrefs-mcp.svg",
		"style": "color"
	},
	"airtable-mcp": {
		"kind": "single",
		"path": "/plugin-icons/airtable-mcp.svg",
		"style": "color"
	},
	"amplitude-mcp": {
		"kind": "single",
		"path": "/plugin-icons/amplitude-mcp.png",
		"style": "color"
	},
	"apify-mcp": {
		"kind": "single",
		"path": "/plugin-icons/apify-mcp.svg",
		"style": "color"
	},
	"apollo-mcp": {
		"kind": "single",
		"path": "/plugin-icons/apollo-mcp.svg",
		"style": "mono"
	},
	"openai-api": {
		"kind": "single",
		"path": "/plugin-icons/openai-api.svg",
		"style": "mono"
	},
	"anthropic-api": {
		"kind": "single",
		"path": "/plugin-icons/anthropic-api.png",
		"style": "color"
	},
	"xai-api": {
		"kind": "single",
		"path": "/plugin-icons/xai-api.svg",
		"style": "mono"
	},
	"perplexity-api": {
		"kind": "single",
		"path": "/plugin-icons/perplexity-api.svg",
		"style": "mono"
	},
	"discord-api": {
		"kind": "single",
		"path": "/plugin-icons/discord-api.svg",
		"style": "color"
	},
	"linear-graphql": {
		"kind": "single",
		"path": "/plugin-icons/linear-mcp.svg",
		"style": "mono"
	},
	"github-graphql": {
		"kind": "single",
		"path": "/plugin-icons/github-mcp.svg",
		"style": "mono"
	},
	"github-rest-api": {
		"kind": "single",
		"path": "/plugin-icons/github-mcp.svg",
		"style": "mono"
	},
	"cloudflare-api": {
		"kind": "single",
		"path": "/plugin-icons/cloudflare-mcp.svg",
		"style": "color"
	},
	"gitlab-rest-api": {
		"kind": "single",
		"path": "/plugin-icons/gitlab-api.svg",
		"style": "color"
	},
	"digitalocean-api": {
		"kind": "single",
		"path": "/plugin-icons/digitalocean-mcp.svg",
		"style": "color"
	},
	"asana-api": {
		"kind": "single",
		"path": "/plugin-icons/asana-mcp.svg",
		"style": "color"
	},
	"twilio-api": {
		"kind": "single",
		"path": "/plugin-icons/twilio-api.svg",
		"style": "color"
	},
	"axiom-api": {
		"kind": "single",
		"path": "/plugin-icons/axiom-mcp.svg",
		"style": "mono"
	},
	"resend-api": {
		"kind": "single",
		"path": "/plugin-icons/resend-api.svg",
		"style": "mono"
	},
	"open-meteo-api": {
		"kind": "single",
		"path": "/plugin-icons/open-meteo-api.svg",
		"style": "color"
	},
	"polymarket-gamma-api": {
		"kind": "single",
		"path": "/plugin-icons/polymarket-gamma-api.svg",
		"style": "color"
	},
	"kalshi-api": {
		"kind": "single",
		"path": "/plugin-icons/kalshi-api.svg",
		"style": "mono"
	},
	"browser-use-api": {
		"kind": "single",
		"path": "/plugin-icons/browser-use-api.svg",
		"style": "mono"
	},
	"stripe-api": {
		"kind": "single",
		"path": "/plugin-icons/stripe-mcp.svg",
		"style": "color"
	},
	"vercel-api": {
		"kind": "single",
		"path": "/plugin-icons/vercel-mcp.svg",
		"style": "mono"
	},
	"sentry-api": {
		"kind": "single",
		"path": "/plugin-icons/sentry-mcp.svg",
		"style": "color"
	},
	"figma-api": {
		"kind": "single",
		"path": "/plugin-icons/figma-mcp.svg",
		"style": "color"
	},
	"supabase-api": {
		"kind": "single",
		"path": "/plugin-icons/supabase-mcp.svg",
		"style": "color"
	},
	"netlify-api": {
		"kind": "single",
		"path": "/plugin-icons/netlify-api.svg",
		"style": "color"
	},
	"sendgrid-api": {
		"kind": "single",
		"path": "/plugin-icons/sendgrid-api.svg",
		"style": "color"
	},
	"x-api": {
		"kind": "single",
		"path": "/plugin-icons/x-api.svg",
		"style": "mono"
	},
	"asana-mcp": {
		"kind": "single",
		"path": "/plugin-icons/asana-mcp.svg",
		"style": "color"
	},
	"atlassian-mcp": {
		"kind": "single",
		"path": "/plugin-icons/atlassian-mcp.svg",
		"style": "color"
	},
	"attio-mcp": {
		"kind": "single",
		"path": "/plugin-icons/attio-mcp.png",
		"style": "color"
	},
	"axiom-mcp": {
		"kind": "single",
		"path": "/plugin-icons/axiom-mcp.svg",
		"style": "mono"
	},
	"azure-devops-mcp": {
		"kind": "single",
		"path": "/plugin-icons/azure-devops-mcp.svg",
		"style": "color"
	},
	"betterstack-mcp": {
		"kind": "single",
		"path": "/plugin-icons/betterstack-mcp.svg",
		"style": "mono"
	},
	"bitly-mcp": {
		"kind": "single",
		"path": "/plugin-icons/bitly-mcp.svg",
		"style": "mono"
	},
	"box-mcp": {
		"kind": "single",
		"path": "/plugin-icons/box-mcp.svg",
		"style": "color"
	},
	"brevo-mcp": {
		"kind": "single",
		"path": "/plugin-icons/brevo-mcp.svg",
		"style": "color"
	},
	"brightdata-mcp": {
		"kind": "single",
		"path": "/plugin-icons/brightdata-mcp.svg",
		"style": "mono"
	},
	"browserbase-mcp": {
		"kind": "single",
		"path": "/plugin-icons/browserbase-mcp.svg",
		"style": "color"
	},
	"buffer-mcp": {
		"kind": "single",
		"path": "/plugin-icons/buffer-mcp.svg",
		"style": "mono"
	},
	"buildkite-mcp": {
		"kind": "single",
		"path": "/plugin-icons/buildkite-mcp.svg",
		"style": "color"
	},
	"calendly-mcp": {
		"kind": "single",
		"path": "/plugin-icons/calendly-mcp.svg",
		"style": "color"
	},
	"canva-mcp": {
		"kind": "single",
		"path": "/plugin-icons/canva-mcp.svg",
		"style": "color"
	},
	"clerk-mcp": {
		"kind": "single",
		"path": "/plugin-icons/clerk-mcp.svg",
		"style": "mono"
	},
	"clickup-mcp": {
		"kind": "single",
		"path": "/plugin-icons/clickup-mcp.svg",
		"style": "color"
	},
	"close-mcp": {
		"kind": "single",
		"path": "/plugin-icons/close-mcp.svg",
		"style": "color"
	},
	"cloudflare-mcp": {
		"kind": "single",
		"path": "/plugin-icons/cloudflare-mcp.svg",
		"style": "color"
	},
	"cloudinary-mcp": {
		"kind": "single",
		"path": "/plugin-icons/cloudinary-mcp.svg",
		"style": "mono"
	},
	"coingecko-mcp": {
		"kind": "single",
		"path": "/plugin-icons/coingecko-mcp.png",
		"style": "color"
	},
	"context7-mcp": {
		"kind": "single",
		"path": "/plugin-icons/context7-mcp.svg",
		"style": "color"
	},
	"customerio-mcp": {
		"kind": "single",
		"path": "/plugin-icons/customerio-mcp.png",
		"style": "color"
	},
	"cypress-mcp": {
		"kind": "single",
		"path": "/plugin-icons/cypress-mcp.svg",
		"style": "color"
	},
	"datadog-mcp": {
		"kind": "single",
		"path": "/plugin-icons/datadog-mcp.svg",
		"style": "color"
	},
	"deepwiki-mcp": {
		"kind": "single",
		"path": "/plugin-icons/deepwiki-mcp.png",
		"style": "color"
	},
	"devrev-mcp": {
		"kind": "single",
		"path": "/plugin-icons/devrev-mcp.png",
		"style": "color"
	},
	"digitalocean-mcp": {
		"kind": "single",
		"path": "/plugin-icons/digitalocean-mcp.svg",
		"style": "color"
	},
	"docusign-mcp": {
		"kind": "single",
		"path": "/plugin-icons/docusign-mcp.svg",
		"style": "color"
	},
	"dodo-payments-mcp": {
		"kind": "single",
		"path": "/plugin-icons/dodo-payments-mcp.svg",
		"style": "color"
	},
	"dropbox-mcp": {
		"kind": "single",
		"path": "/plugin-icons/dropbox-mcp.svg",
		"style": "color"
	},
	"exa-mcp": {
		"kind": "single",
		"path": "/plugin-icons/exa-mcp.svg",
		"style": "color"
	},
	"fal-mcp": {
		"kind": "single",
		"path": "/plugin-icons/fal-mcp.svg",
		"style": "color"
	},
	"figma-mcp": {
		"kind": "single",
		"path": "/plugin-icons/figma-mcp.svg",
		"style": "color"
	},
	"firecrawl-mcp": {
		"kind": "single",
		"path": "/plugin-icons/firecrawl-mcp.svg",
		"style": "mono"
	},
	"freshdesk-mcp": {
		"kind": "single",
		"path": "/plugin-icons/freshdesk-mcp.svg",
		"style": "color"
	},
	"github-mcp": {
		"kind": "single",
		"path": "/plugin-icons/github-mcp.svg",
		"style": "mono"
	},
	"globalping-mcp": {
		"kind": "single",
		"path": "/plugin-icons/globalping-mcp.svg",
		"style": "color"
	},
	"gh-cli": {
		"kind": "single",
		"path": "/plugin-icons/github-mcp.svg",
		"style": "mono"
	},
	"google-maps-mcp": {
		"kind": "single",
		"path": "/plugin-icons/google-maps-mcp.svg",
		"style": "color"
	},
	"granola-mcp": {
		"kind": "single",
		"path": "/plugin-icons/granola-mcp.png",
		"style": "color"
	},
	"heroku-mcp": {
		"kind": "single",
		"path": "/plugin-icons/heroku-mcp.svg",
		"style": "color"
	},
	"hex-mcp": {
		"kind": "single",
		"path": "/plugin-icons/hex-mcp.png",
		"style": "color"
	},
	"hubspot-mcp": {
		"kind": "single",
		"path": "/plugin-icons/hubspot-mcp.svg",
		"style": "color"
	},
	"huggingface-mcp": {
		"kind": "single",
		"path": "/plugin-icons/huggingface-mcp.png",
		"style": "color"
	},
	"incidentio-mcp": {
		"kind": "single",
		"path": "/plugin-icons/incidentio-mcp.png",
		"style": "color"
	},
	"instacart-mcp": {
		"kind": "single",
		"path": "/plugin-icons/instacart-mcp.svg",
		"style": "mono"
	},
	"intercom-mcp": {
		"kind": "single",
		"path": "/plugin-icons/intercom-mcp.svg",
		"style": "color"
	},
	"jina-mcp": {
		"kind": "single",
		"path": "/plugin-icons/jina-mcp.svg",
		"style": "color"
	},
	"lambdatest-mcp": {
		"kind": "single",
		"path": "/plugin-icons/lambdatest-mcp.png",
		"style": "color"
	},
	"linear-mcp": {
		"kind": "single",
		"path": "/plugin-icons/linear-mcp.svg",
		"style": "mono"
	},
	"make-mcp": {
		"kind": "single",
		"path": "/plugin-icons/make-mcp.svg",
		"style": "mono"
	},
	"mapbox-mcp": {
		"kind": "single",
		"path": "/plugin-icons/mapbox-mcp.svg",
		"style": "mono"
	},
	"mercury-mcp": {
		"kind": "single",
		"path": "/plugin-icons/mercury-mcp.svg",
		"style": "mono"
	},
	"miro-mcp": {
		"kind": "single",
		"path": "/plugin-icons/miro-mcp.svg",
		"style": "color"
	},
	"mixpanel-mcp": {
		"kind": "single",
		"path": "/plugin-icons/mixpanel-mcp.svg",
		"style": "mono"
	},
	"mollie-mcp": {
		"kind": "single",
		"path": "/plugin-icons/mollie-mcp.svg",
		"style": "mono"
	},
	"monday-mcp": {
		"kind": "single",
		"path": "/plugin-icons/monday-mcp.svg",
		"style": "color"
	},
	"neon-mcp": {
		"kind": "single",
		"path": "/plugin-icons/neon-mcp.svg",
		"style": "color"
	},
	"newrelic-mcp": {
		"kind": "single",
		"path": "/plugin-icons/newrelic-mcp.svg",
		"style": "mono"
	},
	"notion-mcp": {
		"kind": "single",
		"path": "/plugin-icons/notion-mcp.svg",
		"style": "mono"
	},
	"openai-mcp": {
		"kind": "single",
		"path": "/plugin-icons/openai-mcp.svg",
		"style": "mono"
	},
	"openrouter-api": {
		"kind": "single",
		"path": "/plugin-icons/openrouter-mcp.png",
		"style": "color"
	},
	"openrouter-mcp": {
		"kind": "single",
		"path": "/plugin-icons/openrouter-mcp.png",
		"style": "color"
	},
	"pagerduty-mcp": {
		"kind": "single",
		"path": "/plugin-icons/pagerduty-mcp.svg",
		"style": "color"
	},
	"parallel-search-mcp": {
		"kind": "single",
		"path": "/plugin-icons/parallel-search-mcp.svg",
		"style": "mono"
	},
	"paypal-mcp": {
		"kind": "single",
		"path": "/plugin-icons/paypal-mcp.svg",
		"style": "color"
	},
	"pinterest-mcp": {
		"kind": "single",
		"path": "/plugin-icons/pinterest-mcp.svg",
		"style": "color"
	},
	"plaid-mcp": {
		"kind": "single",
		"path": "/plugin-icons/plaid-mcp.png",
		"style": "color"
	},
	"plane-mcp": {
		"kind": "single",
		"path": "/plugin-icons/plane-mcp.png",
		"style": "color"
	},
	"planetscale-mcp": {
		"kind": "single",
		"path": "/plugin-icons/planetscale-mcp.svg",
		"style": "mono"
	},
	"posthog-mcp": {
		"kind": "single",
		"path": "/plugin-icons/posthog-mcp.svg",
		"style": "color"
	},
	"prisma-mcp": {
		"kind": "single",
		"path": "/plugin-icons/prisma-mcp.svg",
		"style": "mono"
	},
	"pylon-mcp": {
		"kind": "single",
		"path": "/plugin-icons/pylon-mcp.png",
		"style": "color"
	},
	"ramp-mcp": {
		"kind": "single",
		"path": "/plugin-icons/ramp-mcp.svg",
		"style": "color"
	},
	"render-mcp": {
		"kind": "single",
		"path": "/plugin-icons/render-mcp.svg",
		"style": "color"
	},
	"replicate-mcp": {
		"kind": "single",
		"path": "/plugin-icons/replicate-mcp.svg",
		"style": "mono"
	},
	"sanity-mcp": {
		"kind": "single",
		"path": "/plugin-icons/sanity-mcp.svg",
		"style": "color"
	},
	"scraperapi-mcp": {
		"kind": "single",
		"path": "/plugin-icons/scraperapi-mcp.svg",
		"style": "color"
	},
	"scrapingbee-mcp": {
		"kind": "single",
		"path": "/plugin-icons/scrapingbee-mcp.svg",
		"style": "color"
	},
	"semgrep-mcp": {
		"kind": "single",
		"path": "/plugin-icons/semgrep-mcp.svg",
		"style": "color"
	},
	"sentry-mcp": {
		"kind": "single",
		"path": "/plugin-icons/sentry-mcp.svg",
		"style": "color"
	},
	"shortcut-mcp": {
		"kind": "single",
		"path": "/plugin-icons/shortcut-mcp.svg",
		"style": "color"
	},
	"square-mcp": {
		"kind": "single",
		"path": "/plugin-icons/square-mcp.svg",
		"style": "mono"
	},
	"stackoverflow-mcp": {
		"kind": "single",
		"path": "/plugin-icons/stackoverflow-mcp.svg",
		"style": "color"
	},
	"stripe-mcp": {
		"kind": "single",
		"path": "/plugin-icons/stripe-mcp.svg",
		"style": "color"
	},
	"stytch-mcp": {
		"kind": "single",
		"path": "/plugin-icons/stytch-mcp.svg",
		"style": "mono"
	},
	"supabase-mcp": {
		"kind": "single",
		"path": "/plugin-icons/supabase-mcp.svg",
		"style": "color"
	},
	"tally-mcp": {
		"kind": "single",
		"path": "/plugin-icons/tally-mcp.svg",
		"style": "mono"
	},
	"tavily-mcp": {
		"kind": "single",
		"path": "/plugin-icons/tavily-mcp.svg",
		"style": "mono"
	},
	"tigris-mcp": {
		"kind": "single",
		"path": "/plugin-icons/tigris-mcp.png",
		"style": "color"
	},
	"typeform-mcp": {
		"kind": "single",
		"path": "/plugin-icons/typeform-mcp.svg",
		"style": "mono"
	},
	"vercel-cli": {
		"kind": "single",
		"path": "/plugin-icons/vercel-mcp.svg",
		"style": "mono"
	},
	"vercel-mcp": {
		"kind": "single",
		"path": "/plugin-icons/vercel-mcp.svg",
		"style": "mono"
	},
	"webflow-mcp": {
		"kind": "single",
		"path": "/plugin-icons/webflow-mcp.svg",
		"style": "color"
	},
	"wix-mcp": {
		"kind": "single",
		"path": "/plugin-icons/wix-mcp.svg",
		"style": "color"
	},
	"xero-mcp": {
		"kind": "single",
		"path": "/plugin-icons/xero-mcp.svg",
		"style": "color"
	},
	"you-mcp": {
		"kind": "single",
		"path": "/plugin-icons/you-mcp.png",
		"style": "color"
	},
	"zoom-mcp": {
		"kind": "single",
		"path": "/plugin-icons/zoom-mcp.svg",
		"style": "color"
	},
	"aws-cli": {
		"kind": "single",
		"path": "/plugin-icons/aws-cli.svg",
		"style": "mono"
	},
	"convex-cli": {
		"kind": "single",
		"path": "/plugin-icons/convex-cli.svg",
		"style": "color"
	},
	"modal-cli": {
		"kind": "single",
		"path": "/plugin-icons/modal-cli.svg",
		"style": "mono"
	},
	"wrangler-cli": {
		"kind": "single",
		"path": "/plugin-icons/wrangler-cli.svg",
		"style": "mono"
	},
	"gitlab-api": {
		"kind": "single",
		"path": "/plugin-icons/gitlab-api.svg",
		"style": "color"
	}
};
//#endregion
//#region ../registry-catalog/data/v1/icon-host-overrides.json
var icon_host_overrides_default = {
	"deepwiki-mcp": "deepwiki.com",
	"context7-mcp": "context7.com",
	"browserbase-mcp": "browserbase.com",
	"firecrawl-mcp": "firecrawl.dev",
	"neon-mcp": "neon.tech",
	"axiom-mcp": "axiom.co",
	"stripe-mcp": "stripe.com",
	"linear-mcp": "linear.app",
	"sentry-mcp": "sentry.io",
	"cloudflare-mcp": "cloudflare.com",
	"supabase-mcp": "supabase.com",
	"posthog-mcp": "posthog.com",
	"figma-mcp": "figma.com",
	"notion-mcp": "notion.so",
	"monday-mcp": "monday.com",
	"miro-mcp": "miro.com",
	"github-mcp": "github.com",
	"atlassian-mcp": "atlassian.com",
	"vercel-mcp": "vercel.com",
	"digitalocean-mcp": "digitalocean.com",
	"planetscale-mcp": "planetscale.com",
	"betterstack-mcp": "betterstack.com",
	"newrelic-mcp": "newrelic.com",
	"buildkite-mcp": "buildkite.com",
	"openai-mcp": "openai.com",
	"huggingface-mcp": "huggingface.co",
	"slack-mcp": "slack.com",
	"zoom-mcp": "zoom.us",
	"asana-mcp": "asana.com",
	"clickup-mcp": "clickup.com",
	"airtable-mcp": "airtable.com",
	"close-mcp": "close.com",
	"apollo-mcp": "apollo.io",
	"intercom-mcp": "intercom.com",
	"canva-mcp": "canva.com",
	"paypal-mcp": "paypal.com",
	"square-mcp": "squareup.com",
	"brevo-mcp": "brevo.com",
	"amplitude-mcp": "amplitude.com",
	"mixpanel-mcp": "mixpanel.com",
	"apify-mcp": "apify.com",
	"jina-mcp": "jina.ai",
	"scrapingbee-mcp": "scrapingbee.com",
	"brightdata-mcp": "brightdata.com",
	"hubspot-mcp": "hubspot.com",
	"clerk-mcp": "clerk.com",
	"cloudinary-mcp": "cloudinary.com",
	"mapbox-mcp": "mapbox.com",
	"google-maps-mcp": "google.com",
	"semgrep-mcp": "semgrep.ai",
	"shortcut-mcp": "shortcut.com",
	"plane-mcp": "plane.so",
	"typeform-mcp": "typeform.com",
	"tally-mcp": "tally.so",
	"mercury-mcp": "mercury.com",
	"webflow-mcp": "webflow.com",
	"customerio-mcp": "customer.io",
	"tigris-mcp": "tigrisdata.com",
	"box-mcp": "box.com",
	"dropbox-mcp": "dropbox.com",
	"instacart-mcp": "instacart.com",
	"dodo-payments-mcp": "dodopayments.com",
	"pagerduty-mcp": "pagerduty.com",
	"fal-mcp": "fal.ai",
	"exa-mcp": "exa.ai",
	"parallel-search-mcp": "parallel.ai",
	"you-mcp": "you.com",
	"render-mcp": "render.com",
	"heroku-mcp": "heroku.com",
	"wix-mcp": "wix.com",
	"plaid-mcp": "plaid.com",
	"cypress-mcp": "cypress.io",
	"azure-devops-mcp": "azure.com",
	"devrev-mcp": "devrev.ai",
	"globalping-mcp": "globalping.io",
	"scraperapi-mcp": "scraperapi.com",
	"coingecko-mcp": "coingecko.com",
	"mollie-mcp": "mollie.com",
	"docusign-mcp": "docusign.com",
	"buffer-mcp": "buffer.com",
	"lambdatest-mcp": "lambdatest.com",
	"freshdesk-mcp": "freshdesk.com",
	"datadog-mcp": "datadoghq.com",
	"stackoverflow-mcp": "stackoverflow.com",
	"prisma-mcp": "prisma.io",
	"ramp-mcp": "ramp.com",
	"stytch-mcp": "stytch.com",
	"xero-mcp": "xero.com",
	"pinterest-mcp": "pinterest.com"
};
//#endregion
//#region ../registry-catalog/data/v1/popularity.json
var popularity_default = {
	"default": 40,
	entries: {
		"github-mcp": 100,
		"linear-mcp": 98,
		"slack-mcp": 97,
		"notion-mcp": 96,
		"openai-api": 96,
		"stripe-mcp": 95,
		"stripe-api": 94.5,
		"figma-mcp": 94,
		"sentry-mcp": 93,
		"openrouter-api": 92,
		"supabase-mcp": 92,
		"vercel-cli": 91,
		"vercel-mcp": 91,
		"vercel-api": 90.5,
		"cloudflare-api": 90.25,
		"cloudflare-mcp": 90,
		"posthog-mcp": 89,
		"wrangler-cli": 89,
		"sentry-api": 88.5,
		"convex-cli": 88,
		"github-graphql": 88,
		"figma-api": 87.5,
		"github-rest-api": 87,
		"discord-api": 86.8,
		"supabase-api": 87,
		"aws-cli": 86,
		"perplexity-api": 86,
		"atlassian-mcp": 85,
		"gmail-mcp": 84.8,
		"google-drive-mcp": 84.6,
		"google-sheets-mcp": 84.4,
		"google-docs-mcp": 84.2,
		"google-calendar-mcp": 84,
		"linear-graphql": 84,
		"hubspot-mcp": 83,
		"monday-mcp": 82.5,
		"canva-mcp": 82,
		"zoom-mcp": 82,
		"asana-mcp": 81,
		"calendly-mcp": 80.8,
		"asana-api": 80.5,
		"attio-mcp": 80.2,
		"clickup-mcp": 80,
		"apollo-mcp": 79.8,
		"miro-mcp": 79.4,
		"airtable-mcp": 79,
		"make-mcp": 78.8,
		"twilio-api": 78.5,
		"datadog-mcp": 78,
		"close-mcp": 77.6,
		"prisma-mcp": 77,
		"customerio-mcp": 76.5,
		"cloudinary-mcp": 76.2,
		"intercom-mcp": 76,
		"semgrep-mcp": 75.5,
		"pagerduty-mcp": 75,
		"buildkite-mcp": 74.5,
		"newrelic-mcp": 74,
		"xai-api": 74,
		"x-api": 73.5,
		"betterstack-mcp": 73,
		"shortcut-mcp": 72.5,
		"mixpanel-mcp": 72,
		"plane-mcp": 72,
		"webflow-mcp": 71.5,
		"amplitude-mcp": 71,
		"typeform-mcp": 70.5,
		"planetscale-mcp": 70,
		"tally-mcp": 70,
		"box-mcp": 69.5,
		"dropbox-mcp": 69,
		"freshdesk-mcp": 68.5,
		"brevo-mcp": 68.2,
		"resend-api": 68,
		"stytch-mcp": 67.8,
		"ramp-mcp": 67.5,
		"xero-mcp": 67.2,
		"sendgrid-api": 67,
		"ahrefs-mcp": 66.5,
		"apify-mcp": 66.2,
		"netlify-api": 66,
		"brightdata-mcp": 65.8,
		"scrapingbee-mcp": 65.4,
		"exa-mcp": 65,
		"parallel-search-mcp": 65,
		"coingecko-mcp": 64.5,
		"modal-cli": 64,
		"tavily-mcp": 64,
		"cypress-mcp": 63.5,
		"azure-devops-mcp": 63,
		"jina-mcp": 63,
		"buffer-mcp": 62.5,
		"firecrawl-mcp": 62,
		"incidentio-mcp": 62,
		"hex-mcp": 61.5,
		"browserbase-mcp": 61,
		"pylon-mcp": 61,
		"bitly-mcp": 60.5,
		"axiom-api": 60,
		"mapbox-mcp": 60,
		"neon-mcp": 60,
		"google-maps-mcp": 59.5,
		"axiom-mcp": 59,
		"granola-mcp": 59,
		"devrev-mcp": 58.5,
		"globalping-mcp": 58,
		"heroku-mcp": 58,
		"open-meteo-api": 58,
		"browser-use-api": 57.5,
		"scraperapi-mcp": 57.2,
		"kalshi-api": 57,
		"render-mcp": 57,
		"mollie-mcp": 56.8,
		"digitalocean-api": 56.5,
		"mercury-mcp": 56.2,
		"digitalocean-mcp": 56,
		"polymarket-gamma-api": 56,
		"tigris-mcp": 55.8,
		"gitlab-rest-api": 55.5,
		"wix-mcp": 55.2,
		"paypal-mcp": 55,
		"you-mcp": 54.5,
		"lambdatest-mcp": 54,
		"square-mcp": 54,
		"dodo-payments-mcp": 53.5,
		"docusign-mcp": 53,
		"instacart-mcp": 53,
		"pinterest-mcp": 52.5,
		"sanity-mcp": 52,
		"whoop-api": 52,
		"clerk-mcp": 51,
		"huggingface-mcp": 50,
		"openai-mcp": 49,
		"replicate-mcp": 48,
		"fal-mcp": 47,
		"plaid-mcp": 46,
		"context7-mcp": 45,
		"deepwiki-mcp": 44,
		"stackoverflow-mcp": 43,
		"gh-cli": 42,
		"git-cli": 42,
		"glab-cli": 41,
		"echo-cli": 20
	}
};
//#endregion
//#region ../registry-catalog/data/v1/entries/git-cli.json
var git_cli_default = {
	slug: "git-cli",
	display_name: "Git CLI",
	description: "Local Git commands via sand on the originating machine",
	category: "dev",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "git",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": [],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [{
				"id": "git_config_home",
				"kind": "temp_dir",
				"prefix": "hrbr-sand-git-"
			}, {
				"id": "git_config_global",
				"kind": "temp_file",
				"parent_artifact_id": "git_config_home",
				"filename": "gitconfig",
				"contents": ""
			}],
			"env": [{
				"env": "XDG_CONFIG_HOME",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "git_config_home"
				}
			}, {
				"env": "GIT_CONFIG_GLOBAL",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "git_config_global"
				}
			}]
		},
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "Install Git",
			"url": "https://git-scm.com/downloads.html",
			"kind": "docs"
		}, {
			"label": "Git Docs",
			"url": "https://git-scm.com/docs",
			"kind": "docs"
		}],
		"required_secrets": [],
		"runnable": {
			"summary": "Requires `git` on the originating machine and a workspace checkout that is already a Git repository.",
			"required_programs": ["git"]
		},
		"verify_probe": {
			"args": ["rev-parse", "--is-inside-work-tree"],
			"success_message": "Prints `true` when Harbor is running inside a Git working tree."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install Git on the originating machine and make sure `git` is available in PATH for Harbor sand."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "not a git repository"
			}],
			"message": "Select a workspace checkout that already contains a `.git` directory before using the Git CLI source."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://git-scm.com/docs",
		"kind": "docs"
	}],
	default_namespace: "git",
	manifest: { "tools": [
		{
			"tool_id": "status",
			"name": "status",
			"display_name": "Git Status",
			"description": "Show the short working tree status for the current repository.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "status",
				"argv_template": [{
					"kind": "literal",
					"value": "status"
				}, {
					"kind": "literal",
					"value": "--short"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "branch_list",
			"name": "branch_list",
			"display_name": "List Branches",
			"description": "List local branches in the current repository.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "branch_list",
				"argv_template": [{
					"kind": "literal",
					"value": "branch"
				}, {
					"kind": "literal",
					"value": "--list"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "log",
			"name": "log",
			"display_name": "Git Log",
			"description": "Show recent commits in one-line format.",
			"input_schema": {
				"type": "object",
				"properties": { "limit": {
					"type": "string",
					"description": "Maximum number of commits to return."
				} },
				"required": ["limit"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "log",
				"argv_template": [
					{
						"kind": "literal",
						"value": "log"
					},
					{
						"kind": "literal",
						"value": "--oneline"
					},
					{
						"kind": "option",
						"flag": "-n",
						"path": "limit"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "head_sha",
			"name": "head_sha",
			"display_name": "HEAD SHA",
			"description": "Resolve the SHA for HEAD in the current repository.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "head_sha",
				"argv_template": [{
					"kind": "literal",
					"value": "rev-parse"
				}, {
					"kind": "literal",
					"value": "HEAD"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "git_show",
			"name": "show",
			"display_name": "Show",
			"description": "Show various types of objects",
			"input_schema": {
				"type": "object",
				"properties": {
					"revision_range": {
						"type": "string",
						"description": "Positional argument: revision-range"
					},
					"path": {
						"type": "string",
						"description": "Variadic positional argument: path"
					},
					"quiet": {
						"type": "boolean",
						"description": "suppress diff output"
					},
					"source": {
						"type": "boolean",
						"description": "show source"
					},
					"use_mailmap": {
						"type": "boolean",
						"description": "use mail map file"
					},
					"mailmap": {
						"type": "boolean",
						"description": "alias of --use-mailmap"
					},
					"clear_decorations": {
						"type": "boolean",
						"description": "clear all previously-defined decoration filters"
					},
					"decorate_refs": { "type": "string" },
					"decorate_refs_exclude": { "type": "string" },
					"decorate": { "type": "boolean" },
					"l": {
						"type": "string",
						"description": "trace the evolution of line range <start>,<end> or function :<funcname> in <file>"
					},
					"arg": {
						"type": "string",
						"description": "Positional argument: --"
					}
				},
				"required": ["revision_range", "path"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "show",
				"argv_template": [
					{
						"kind": "literal",
						"value": "show"
					},
					{
						"kind": "input",
						"path": "revision_range"
					},
					{
						"kind": "input",
						"path": "arg"
					},
					{
						"kind": "input",
						"path": "path"
					},
					{
						"kind": "flag",
						"flag": "--quiet",
						"path": "quiet"
					},
					{
						"kind": "flag",
						"flag": "--source",
						"path": "source"
					},
					{
						"kind": "flag",
						"flag": "--use-mailmap",
						"path": "use_mailmap"
					},
					{
						"kind": "flag",
						"flag": "--mailmap",
						"path": "mailmap"
					},
					{
						"kind": "flag",
						"flag": "--clear-decorations",
						"path": "clear_decorations"
					},
					{
						"kind": "option",
						"flag": "--decorate-refs",
						"path": "decorate_refs",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--decorate-refs-exclude",
						"path": "decorate_refs_exclude",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--decorate",
						"path": "decorate"
					},
					{
						"kind": "option",
						"flag": "--L",
						"path": "l",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "git_diff",
			"name": "diff",
			"display_name": "Diff",
			"description": "Show changes between commits, commit and working tree, etc",
			"input_schema": {
				"type": "object",
				"properties": {
					"commit": {
						"type": "string",
						"description": "Positional argument: commit"
					},
					"path": {
						"type": "string",
						"description": "Variadic positional argument: path"
					},
					"z": {
						"type": "boolean",
						"description": "output diff-raw with lines terminated with NUL."
					},
					"p": {
						"type": "boolean",
						"description": "output patch format."
					},
					"u": {
						"type": "boolean",
						"description": "synonym for -p."
					},
					"patch_with_raw": {
						"type": "boolean",
						"description": " output both a patch and the diff-raw format."
					},
					"stat": {
						"type": "boolean",
						"description": "show diffstat instead of patch."
					},
					"numstat": {
						"type": "boolean",
						"description": "show numeric diffstat instead of patch."
					},
					"patch_with_stat": {
						"type": "boolean",
						"description": " output a patch and prepend its diffstat."
					},
					"name_only": {
						"type": "boolean",
						"description": "show only names of changed files."
					},
					"name_status": { "type": "string" },
					"full_index": {
						"type": "boolean",
						"description": "show full object name on index lines."
					},
					"abbrev": {
						"type": "string",
						"description": "abbreviate object names in diff-tree header and diff-raw."
					},
					"r": {
						"type": "boolean",
						"description": "swap input file pairs."
					},
					"b": {
						"type": "boolean",
						"description": "detect complete rewrites."
					},
					"m": {
						"type": "boolean",
						"description": "detect renames."
					},
					"c": {
						"type": "boolean",
						"description": "detect copies."
					},
					"find_copies_harder": {
						"type": "boolean",
						"description": " try unchanged files as candidate for copy detection."
					},
					"l": {
						"type": "boolean",
						"description": "limit rename attempts up to <n> paths."
					},
					"o": {
						"type": "boolean",
						"description": "reorder diffs according to the <file>."
					},
					"s": {
						"type": "boolean",
						"description": "find filepair whose only one side contains the string."
					},
					"pickaxe_all": {
						"type": "boolean",
						"description": " show all files diff when -S is used and hit is found."
					},
					"a": {
						"type": "boolean",
						"description": "--text    treat all files as text."
					},
					"arg": {
						"type": "string",
						"description": "Positional argument: --"
					}
				},
				"required": ["commit", "path"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["inspection"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "diff",
				"argv_template": [
					{
						"kind": "literal",
						"value": "diff"
					},
					{
						"kind": "input",
						"path": "commit"
					},
					{
						"kind": "input",
						"path": "arg"
					},
					{
						"kind": "input",
						"path": "path"
					},
					{
						"kind": "flag",
						"flag": "--z",
						"path": "z"
					},
					{
						"kind": "flag",
						"flag": "--p",
						"path": "p"
					},
					{
						"kind": "flag",
						"flag": "--u",
						"path": "u"
					},
					{
						"kind": "flag",
						"flag": "--patch-with-raw",
						"path": "patch_with_raw"
					},
					{
						"kind": "flag",
						"flag": "--stat",
						"path": "stat"
					},
					{
						"kind": "flag",
						"flag": "--numstat",
						"path": "numstat"
					},
					{
						"kind": "flag",
						"flag": "--patch-with-stat",
						"path": "patch_with_stat"
					},
					{
						"kind": "flag",
						"flag": "--name-only",
						"path": "name_only"
					},
					{
						"kind": "option",
						"flag": "--name-status",
						"path": "name_status",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--full-index",
						"path": "full_index"
					},
					{
						"kind": "option",
						"flag": "--abbrev",
						"path": "abbrev",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--R",
						"path": "r"
					},
					{
						"kind": "flag",
						"flag": "--B",
						"path": "b"
					},
					{
						"kind": "flag",
						"flag": "--M",
						"path": "m"
					},
					{
						"kind": "flag",
						"flag": "--C",
						"path": "c"
					},
					{
						"kind": "flag",
						"flag": "--find-copies-harder",
						"path": "find_copies_harder"
					},
					{
						"kind": "flag",
						"flag": "--l",
						"path": "l"
					},
					{
						"kind": "flag",
						"flag": "--O",
						"path": "o"
					},
					{
						"kind": "flag",
						"flag": "--S",
						"path": "s"
					},
					{
						"kind": "flag",
						"flag": "--pickaxe-all",
						"path": "pickaxe_all"
					},
					{
						"kind": "flag",
						"flag": "--a",
						"path": "a"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "git_tag",
			"name": "tag",
			"display_name": "Tag",
			"description": "Create, list, delete or verify a tag object signed with GPG",
			"input_schema": {
				"type": "object",
				"properties": {
					"key_id": {
						"type": "string",
						"description": "Positional argument: key-id"
					},
					"f": {
						"type": "string",
						"description": "Positional argument: -f"
					},
					"msg": {
						"type": "string",
						"description": "Positional argument: msg"
					},
					"file": { "type": "string" },
					"e": {
						"type": "string",
						"description": "Positional argument: -e"
					},
					"list": {
						"type": "boolean",
						"description": "list tag names"
					},
					"n": {
						"type": "boolean",
						"description": "print <n> lines of each tag message"
					},
					"delete": {
						"type": "boolean",
						"description": "delete tags"
					},
					"verify": {
						"type": "boolean",
						"description": "verify tags"
					},
					"annotate": {
						"type": "boolean",
						"description": "annotated tag, needs a message"
					},
					"message": { "type": "string" },
					"trailer": {
						"type": "string",
						"description": "add custom trailer(s)"
					},
					"edit": {
						"type": "boolean",
						"description": "force edit of tag message"
					},
					"sign": {
						"type": "boolean",
						"description": "annotated and GPG-signed tag"
					},
					"cleanup": { "type": "string" },
					"local_user": { "type": "string" },
					"force": {
						"type": "boolean",
						"description": "replace the tag if exists"
					},
					"create_reflog": {
						"type": "boolean",
						"description": "create a reflog"
					},
					"column": { "type": "boolean" },
					"contains": {
						"type": "string",
						"description": "print only tags that contain the commit"
					},
					"no_contains": { "type": "string" },
					"merged": {
						"type": "string",
						"description": "print only tags that are merged"
					},
					"no_merged": {
						"type": "string",
						"description": "print only tags that are not merged"
					},
					"omit_empty": {
						"type": "boolean",
						"description": "do not output a newline after empty formatted refs"
					},
					"sort": {
						"type": "string",
						"description": "field name to sort on"
					},
					"points_at": { "type": "string" },
					"format": { "type": "string" },
					"color": { "type": "boolean" },
					"ignore_case": { "type": "boolean" }
				},
				"required": [
					"key_id",
					"msg",
					"file"
				],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["inspection"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "tag",
				"argv_template": [
					{
						"kind": "literal",
						"value": "tag"
					},
					{
						"kind": "input",
						"path": "key_id"
					},
					{
						"kind": "input",
						"path": "f"
					},
					{
						"kind": "input",
						"path": "msg"
					},
					{
						"kind": "input",
						"path": "file"
					},
					{
						"kind": "input",
						"path": "e"
					},
					{
						"kind": "flag",
						"flag": "--list",
						"path": "list"
					},
					{
						"kind": "flag",
						"flag": "--n",
						"path": "n"
					},
					{
						"kind": "flag",
						"flag": "--delete",
						"path": "delete"
					},
					{
						"kind": "flag",
						"flag": "--verify",
						"path": "verify"
					},
					{
						"kind": "flag",
						"flag": "--annotate",
						"path": "annotate"
					},
					{
						"kind": "option",
						"flag": "--message",
						"path": "message",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--file",
						"path": "file",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--trailer",
						"path": "trailer",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--edit",
						"path": "edit"
					},
					{
						"kind": "flag",
						"flag": "--sign",
						"path": "sign"
					},
					{
						"kind": "option",
						"flag": "--cleanup",
						"path": "cleanup",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--local-user",
						"path": "local_user",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--force",
						"path": "force"
					},
					{
						"kind": "flag",
						"flag": "--create-reflog",
						"path": "create_reflog"
					},
					{
						"kind": "flag",
						"flag": "--column",
						"path": "column"
					},
					{
						"kind": "option",
						"flag": "--contains",
						"path": "contains",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--no-contains",
						"path": "no_contains",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--merged",
						"path": "merged",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--no-merged",
						"path": "no_merged",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--omit-empty",
						"path": "omit_empty"
					},
					{
						"kind": "option",
						"flag": "--sort",
						"path": "sort",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--points-at",
						"path": "points_at",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--format",
						"path": "format",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--color",
						"path": "color"
					},
					{
						"kind": "flag",
						"flag": "--ignore-case",
						"path": "ignore_case"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "git_remote",
			"name": "remote",
			"display_name": "Remote",
			"description": "Run remote.",
			"input_schema": {
				"type": "object",
				"properties": { "verbose": {
					"type": "boolean",
					"description": " Be a little more verbose and show remote url after name. For promisor remotes, also show which filters (b\bbl\blo\bob\bb:\b:n\bno\bon\bne\be etc.) are configured. NOTE: This must be placed between r\bre\bem\bmo\bot\bte\be and subcommand. With no arguments, shows a list of existing remotes. Several subcommands are available to perform operations on the remotes. _\ba_\bd_\bd Add a remote named <name> for the repository at <URL>. The command g\bgi\bit\bt f\bfe\bet\btc\bch\bh _\b<_\bn_\ba_\bm_\be_\b> can then be used to create and update remote-tracking branches <name>/<branch>. With -\b-f\bf option, g\bgi\bit\bt f\bfe\bet\btc\bch\bh _\b<_\bn_\ba_\bm_\be_\b> is run immediately after the remote information is set up. With -\b--\b-t\bta\bag\bgs\bs option, g\bgi\bit\bt f\bfe\bet\btc\bch\bh _\b<_\bn_\ba_\bm_\be_\b> imports every tag from the remote repository. With -\b--\b-n\bno\bo-\b-t\bta\bag\bgs\bs option, g\bgi\bit\bt f\bfe\bet\btc\bch\bh _\b<_\bn_\ba_\bm_\be_\b> does not import tags from the remote repository. By default, only tags on fetched branches are imported (see g\bgi\bit\bt-\b- f\bfe\bet\btc\bch\bh(1)). With -\b-t\bt _\b<_\bb_\br_\ba_\bn_\bc_\bh_\b> option, instead of the default glob refspec for the remote to track all branches under the r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/ namespace, a refspec to track only _\b<_\bb_\br_\ba_\bn_\bc_\bh_\b> is created. You can give more than one -\b-t\bt _\b<_\bb_\br_\ba_\bn_\bc_\bh_\b> to track multiple branches without grabbing all branches. With -\b-m\bm _\b<_\bm_\ba_\bs_\bt_\be_\br_\b> option, a symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/H\bHE\bEA\bAD\bD is set up to point at remote’s _\b<_\bm_\ba_\bs_\bt_\be_\br_\b> branch. See also the set-head command. When a fetch mirror is created with -\b--\b-m\bmi\bir\brr\bro\bor\br=\b=f\bfe\bet\btc\bch\bh, the refs will not be stored in the _\br_\be_\bf_\bs_\b/_\br_\be_\bm_\bo_\bt_\be_\bs_\b/ namespace, but rather everything in _\br_\be_\bf_\bs_\b/ on the remote will be directly mirrored into _\br_\be_\bf_\bs_\b/ in the local repository. This option only makes sense in bare repositories, because a fetch would overwrite any local commits. When a push mirror is created with -\b--\b-m\bmi\bir\brr\bro\bor\br=\b=p\bpu\bus\bsh\bh, then g\bgi\bit\bt p\bpu\bus\bsh\bh will always behave as if -\b--\b-m\bmi\bir\brr\bro\bor\br was passed. _\br_\be_\bn_\ba_\bm_\be Rename the remote named <old> to <new>. All remote-tracking branches and configuration settings for the remote are updated. In case <old> and <new> are the same, and <old> is a file under $\b$G\bGI\bIT\bT_\b_D\bDI\bIR\bR/\b/r\bre\bem\bmo\bot\bte\bes\bs or $\b$G\bGI\bIT\bT_\b_D\bDI\bIR\bR/\b/b\bbr\bra\ban\bnc\bch\bhe\bes\bs, the remote is converted to the configuration file format. _\br_\be_\bm_\bo_\bv_\be, _\br_\bm Remove the remote named <name>. All remote-tracking branches and configuration settings for the remote are removed. _\bs_\be_\bt_\b-_\bh_\be_\ba_\bd Sets or deletes the default branch (i.e. the target of the symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/H\bHE\bEA\bAD\bD) for the named remote. Having a default branch for a remote is not required, but allows the name of the remote to be specified in lieu of a specific branch. For example, if the default branch for o\bor\bri\big\bgi\bin\bn is set to m\bma\bas\bst\bte\ber\br, then o\bor\bri\big\bgi\bin\bn may be specified wherever you would normally specify o\bor\bri\big\bgi\bin\bn/\b/m\bma\bas\bst\bte\ber\br. With -\b-d\bd or -\b--\b-d\bde\bel\ble\bet\bte\be, the symbolic ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/H\bHE\bEA\bAD\bD is deleted. With -\b-a\ba or -\b--\b-a\bau\but\bto\bo, the remote is queried to determine its H\bHE\bEA\bAD\bD, then the symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/H\bHE\bEA\bAD\bD is set to the same branch. e.g., if the remote H\bHE\bEA\bAD\bD is pointed at n\bne\bex\bxt\bt, g\bgi\bit\bt r\bre\bem\bmo\bot\bte\be s\bse\bet\bt-\b-h\bhe\bea\bad\bd o\bor\bri\big\bgi\bin\bn -\b-a\ba will set the symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/H\bHE\bEA\bAD\bD to r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/n\bne\bex\bxt\bt. This will only work if r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/n\bne\bex\bxt\bt already exists; if not it must be fetched first. Use _\b<_\bb_\br_\ba_\bn_\bc_\bh_\b> to set the symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/_\b<_\bn_\ba_\bm_\be_\b>/\b/H\bHE\bEA\bAD\bD explicitly. e.g., g\bgi\bit\bt r\bre\bem\bmo\bot\bte\be s\bse\bet\bt-\b-h\bhe\bea\bad\bd o\bor\bri\big\bgi\bin\bn m\bma\bas\bst\bte\ber\br will set the symbolic-ref r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/H\bHE\bEA\bAD\bD to r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/m\bma\bas\bst\bte\ber\br. This will only work if r\bre\bef\bfs\bs/\b/r\bre\bem\bmo\bot\bte\bes\bs/\b/o\bor\bri\big\bgi\bin\bn/\b/m\bma\bas\bst\bte\ber\br already exists; if not it must be fetched first. _\bs_\be_\bt_\b-_\bb_\br_\ba_\bn_\bc_\bh_\be_\bs Changes the list of branches tracked by the named remote. This can be used to track a subset of the available remote branches after the initial setup for a remote. The named branches will be interpreted as if specified with the -\b-t\bt option on the g\bgi\bit\bt r\bre\bem\bmo\bot\bte\be a\bad\bdd\bd command line. With -\b--\b-a\bad\bdd\bd, instead of replacing the list of currently tracked branches, adds to that list. _\bg_\be_\bt_\b-_\bu_\br_\bl Retrieves the URLs for a remote. Configurations for i\bin\bns\bst\bte\bea\bad\bdO\bOf\bf and p\bpu\bus\bsh\bhI\bIn\bns\bst\bte\bea\bad\bdO\bOf\bf are expanded here. By default, only the first URL is listed. With -\b--\b-p\bpu\bus\bsh\bh, push URLs are queried rather than fetch URLs. With -\b--\b-a\bal\bll\bl, all URLs for the remote will be listed. _\bs_\be_\bt_\b-_\bu_\br_\bl Changes URLs for the remote. Sets first URL for remote <name> that matches regex <oldurl> (first URL if no <oldurl> is given) to <newurl>. If <oldurl> doesn’t match any URL, an error occurs and nothing is changed. With -\b--\b-p\bpu\bus\bsh\bh, push URLs are manipulated instead of fetch URLs. With -\b--\b-a\bad\bdd\bd, instead of changing existing URLs, new URL is added. With -\b--\b-d\bde\bel\ble\bet\bte\be, instead of changing existing URLs, all URLs matching regex <URL> are deleted for remote <name>. Trying to delete all non-push URLs is an error. Note that the push URL and the fetch URL, even though they can be set differently, must still refer to the same place. What you pushed to the push URL should be what you would see if you immediately fetched from the fetch URL. If you are trying to fetch from one place (e.g. your upstream) and push to another (e.g. your publishing repository), use two separate remotes. _\bs_\bh_\bo_\bw Gives some information about the remote <name>. With -\b-n\bn option, the remote heads are not queried first with g\bgi\bit\bt l\bls\bs-\b-r\bre\bem\bmo\bot\bte\be _\b<_\bn_\ba_\bm_\be_\b>; cached information is used instead. _\bp_\br_\bu_\bn_\be Deletes stale references associated with <name>. By default, stale remote-tracking branches under <name> are deleted, but depending on global configuration and the configuration of the remote we might even prune local tags that haven’t been pushed there. Equivalent to g\bgi\bit\bt f\bfe\bet\btc\bch\bh -\b--\b-p\bpr\bru\bun\bne\be _\b<_\bn_\ba_\bm_\be_\b>, except that no new references will be fetched. See the PRUNING section of g\bgi\bit\bt-\b-f\bfe\bet\btc\bch\bh(1) for what it’ll prune depending on various configuration. With -\b--\b-d\bdr\bry\by-\b-r\bru\bun\bn option, report what branches would be pruned, but do not actually prune them. _\bu_\bp_\bd_\ba_\bt_\be Fetch updates for remotes or remote groups in the repository as defined by r\bre\bem\bmo\bot\bte\bes\bs.\b._\b<_\bg_\br_\bo_\bu_\bp_\b>. If neither group nor remote is specified on the command line, the configuration parameter remotes.default will be used; if remotes.default is not defined, all remotes which do not have the configuration parameter r\bre\bem\bmo\bot\bte\be.\b._\b<_\bn_\ba_\bm_\be_\b>.\b.s\bsk\bki\bip\bpD\bDe\bef\bfa\bau\bul\blt\btU\bUp\bpd\bda\bat\bte\be set to true will be updated. (See g\bgi\bit\bt-\b-c\bco\bon\bnf\bfi\big\bg(1)). With -\b--\b-p\bpr\bru\bun\bne\be option, run pruning against all the remotes that are updated. The remote configuration is achieved using the r\bre\bem\bmo\bot\bte\be.\b.o\bor\bri\big\bgi\bin\bn.\b.u\bur\brl\bl and r\bre\bem\bmo\bot\bte\be.\b.o\bor\bri\big\bgi\bin\bn.\b.f\bfe\bet\btc\bch\bh configuration variables. (See g\bgi\bit\bt-\b-c\bco\bon\bnf\bfi\big\bg(1)). On success, the exit status is 0\b0. When subcommands such as _\ba_\bd_\bd, _\br_\be_\bn_\ba_\bm_\be, and _\br_\be_\bm_\bo_\bv_\be can’t find the remote in question, the exit status is 2\b2. When the remote already exists, the exit status is 3\b3. On any other error, the exit status may be any other non-zero value. •   Add a new remote, fetch, and check out a branch from it $ git remote origin $ git branch -r origin/HEAD -> origin/master origin/master $ git remote add staging git://git.kernel.org/.../gregkh/staging.git $ git remote origin staging $ git fetch staging ... From git://git.kernel.org/pub/scm/linux/kernel/git/gregkh/staging * [new branch]      master     -> staging/master * [new branch]      staging-linus -> staging/staging-linus * [new branch]      staging-next -> staging/staging-next $ git branch -r origin/HEAD -> origin/master origin/master staging/master staging/staging-linus staging/staging-next $ git switch -c staging staging/master ... •   Imitate _\bg_\bi_\bt _\bc_\bl_\bo_\bn_\be but track only selected branches $ mkdir project.git $ cd project.git $ git init $ git remote add -f -t master -m master origin git://example.com/git.git/ $ git merge origin g\bgi\bit\bt-\b-f\bfe\bet\btc\bch\bh(1) g\bgi\bit\bt-\b-b\bbr\bra\ban\bnc\bch\bh(1) g\bgi\bit\bt-\b-c\bco\bon\bnf\bfi\big\bg(1) Part of the g\bgi\bit\bt(1) suite"
				} },
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["inspection"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "remote",
				"argv_template": [{
					"kind": "literal",
					"value": "remote"
				}, {
					"kind": "flag",
					"flag": "--verbose",
					"path": "verbose"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/echo-cli.json
var echo_cli_default = {
	slug: "echo-cli",
	display_name: "Echo CLI",
	description: "Local echo command for sand wiring and environment smoke tests",
	category: "dev",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "echo",
		"cli_args": [],
		"cli_cwd_policy": "call",
		"cli_allowed_env_keys": [],
		"sand_sandbox_policy": { "filesystem": "none" },
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "Echo Command Docs",
			"url": "https://www.gnu.org/software/coreutils/manual/html_node/echo-invocation.html",
			"kind": "docs"
		}],
		"required_secrets": [],
		"runnable": {
			"summary": "Requires a basic `echo` binary on the originating machine; Harbor uses it as a zero-secret sand smoke test.",
			"required_programs": ["echo"]
		},
		"verify_probe": {
			"args": ["harbor-cli-echo-ready"],
			"success_message": "Prints the probe token back verbatim on stdout."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "The originating machine must expose `echo` as an executable command for Harbor sand."
		}]
	},
	default_namespace: "echo",
	manifest: { "tools": [{
		"tool_id": "echo",
		"name": "echo",
		"display_name": "Echo",
		"description": "Echo back a provided message.",
		"input_schema": {
			"type": "object",
			"properties": { "message": { "type": "string" } },
			"required": ["message"],
			"additionalProperties": false
		},
		"output_schema": { "type": "string" },
		"binding": {
			"kind": "cli_command",
			"tool_name": "echo",
			"argv_template": [{
				"kind": "input",
				"path": "message"
			}],
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		}
	}] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/gh-cli.json
var gh_cli_default = {
	slug: "gh-cli",
	display_name: "GitHub CLI",
	description: "GitHub repository and pull-request workflows via local gh through sand",
	category: "dev",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "gh",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["GH_HOST"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [{
				"id": "gh_config_dir",
				"kind": "temp_dir",
				"prefix": "hrbr-sand-gh-"
			}],
			"env": [{
				"env": "GH_CONFIG_DIR",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "gh_config_dir"
				}
			}, {
				"env": "GH_PROMPT_DISABLED",
				"value": {
					"kind": "literal",
					"value": "1"
				}
			}]
		},
		"sand_secret_bindings": [{
			"secret_name": "gh_token",
			"env": "GH_TOKEN",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "GitHub CLI Auth Status",
			"url": "https://cli.github.com/manual/gh_auth_status",
			"kind": "docs"
		}, {
			"label": "Personal Access Tokens",
			"url": "https://docs.github.com/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens",
			"kind": "docs"
		}],
		"required_secrets": [{
			"env": "GH_TOKEN",
			"display_name": "GitHub token",
			"description": "Personal access token or app token with the repository access Harbor needs for `gh` commands.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `gh` on the originating machine plus `GH_TOKEN`; set `GH_HOST` separately when targeting GitHub Enterprise.",
			"required_programs": ["gh"]
		},
		"verify_probe": {
			"args": [
				"auth",
				"status",
				"--active"
			],
			"success_message": "Shows the active authenticated GitHub account for the current host."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install GitHub CLI on the originating machine and make sure `gh` is available in PATH for Harbor sand."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "authentication failed"
				},
				{
					"kind": "substring",
					"pattern": "Bad credentials"
				},
				{
					"kind": "substring",
					"pattern": "not logged into any GitHub hosts"
				},
				{
					"kind": "substring",
					"pattern": "GH_TOKEN"
				},
				{
					"kind": "substring",
					"pattern": "gh auth login"
				}
			],
			"message": "Set a valid `GH_TOKEN`; Harbor runs `gh` non-interactively and does not rely on an interactive `gh auth login` session."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://cli.github.com/manual/",
		"kind": "docs"
	}],
	default_namespace: "gh",
	manifest: { "tools": [
		{
			"tool_id": "gh_repo_view",
			"name": "repo_view",
			"display_name": "Repo View",
			"description": "View repository metadata by owner/repo slug.",
			"input_schema": {
				"type": "object",
				"properties": { "repo": {
					"type": "string",
					"description": "Repository slug, e.g. zonko/hbr3."
				} },
				"required": ["repo"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "repo_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "repo"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "input",
						"path": "repo"
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "name,description,url,defaultBranchRef,isPrivate"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_pr_list",
			"name": "pr_list",
			"display_name": "PR List",
			"description": "List pull requests for a repository.",
			"input_schema": {
				"type": "object",
				"properties": {
					"repo": { "type": "string" },
					"state": {
						"type": "string",
						"description": "open, closed, or merged"
					},
					"limit": { "type": "integer" }
				},
				"required": ["repo"],
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "pr_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pr"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo"
					},
					{
						"kind": "option",
						"flag": "--state",
						"path": "state",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "number,title,state,url,author"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_pr_view",
			"name": "pr_view",
			"display_name": "PR View",
			"description": "View a pull request by number for a repository.",
			"input_schema": {
				"type": "object",
				"properties": {
					"repo": { "type": "string" },
					"pr": {
						"type": "string",
						"description": "PR number or URL accepted by gh."
					}
				},
				"required": ["repo", "pr"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "pr_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pr"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "input",
						"path": "pr"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo"
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "number,title,state,url,author,body,headRefName,baseRefName,mergeStateStatus"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_pr_comment",
			"name": "pr_comment",
			"display_name": "PR Comment",
			"description": "Create a pull-request comment.",
			"input_schema": {
				"type": "object",
				"properties": {
					"repo": { "type": "string" },
					"pr": { "type": "string" },
					"body": { "type": "string" }
				},
				"required": [
					"repo",
					"pr",
					"body"
				],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "pr_comment",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pr"
					},
					{
						"kind": "literal",
						"value": "comment"
					},
					{
						"kind": "input",
						"path": "pr"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo"
					},
					{
						"kind": "option",
						"flag": "--body",
						"path": "body"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "gh_issue_list",
			"name": "issue_list",
			"display_name": "Issue List",
			"description": "Run issue list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"app": {
						"type": "string",
						"description": "Filter by GitHub App author"
					},
					"assignee": {
						"type": "string",
						"description": "Filter by assignee"
					},
					"author": {
						"type": "string",
						"description": "Filter by author"
					},
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"label": {
						"type": "string",
						"description": "Filter by label"
					},
					"limit": {
						"type": "string",
						"description": "Maximum number of issues to fetch (default 30)"
					},
					"mention": {
						"type": "string",
						"description": "Filter by mention"
					},
					"milestone": {
						"type": "string",
						"description": "Filter by milestone number or title"
					},
					"search": {
						"type": "string",
						"description": "Search issues with query"
					},
					"state": {
						"type": "string",
						"description": "Filter by state: {open|closed|all} (default \"open\")",
						"enum": [
							"open",
							"closed",
							"all"
						]
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"web": {
						"type": "boolean",
						"description": "List issues in the web browser"
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "issue_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "issue"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--app",
						"path": "app",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--assignee",
						"path": "assignee",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--author",
						"path": "author",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--label",
						"path": "label",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--mention",
						"path": "mention",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--milestone",
						"path": "milestone",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--search",
						"path": "search",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--state",
						"path": "state",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--web",
						"path": "web"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "number,title,state,url,author,labels,updatedAt"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_issue_view",
			"name": "issue_view",
			"display_name": "Issue View",
			"description": "Run issue view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"comments": {
						"type": "boolean",
						"description": "View issue comments"
					},
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"web": {
						"type": "boolean",
						"description": "Open an issue in the browser"
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "issue_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "issue"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "flag",
						"flag": "--comments",
						"path": "comments"
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--web",
						"path": "web"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "number,title,state,url,author,body,labels,comments"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_run_list",
			"name": "run_list",
			"display_name": "Run List",
			"description": "Run run list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"all": {
						"type": "boolean",
						"description": "Include disabled workflows"
					},
					"branch": {
						"type": "string",
						"description": "Filter runs by branch"
					},
					"commit": {
						"type": "string",
						"description": "Filter runs by the SHA of the commit"
					},
					"created": {
						"type": "string",
						"description": "Filter runs by the date it was created"
					},
					"event": {
						"type": "string",
						"description": "Filter runs by which event triggered the run"
					},
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"limit": {
						"type": "string",
						"description": "Maximum number of runs to fetch (default 20)"
					},
					"status": {
						"type": "string",
						"description": "Filter runs by status: {queued|completed|in_progress|requested|waiting|pending|action_required|cancelled|failure|neutral|skipped|stale|startup_failure|success|timed_out}",
						"enum": [
							"queued",
							"completed",
							"in_progress",
							"requested",
							"waiting",
							"pending",
							"action_required",
							"cancelled",
							"failure",
							"neutral",
							"skipped",
							"stale",
							"startup_failure",
							"success",
							"timed_out"
						]
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"user": {
						"type": "string",
						"description": "Filter runs by user who triggered the run"
					},
					"workflow": {
						"type": "string",
						"description": "Filter runs by workflow"
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "run_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "run"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--all",
						"path": "all"
					},
					{
						"kind": "option",
						"flag": "--branch",
						"path": "branch",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--commit",
						"path": "commit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--created",
						"path": "created",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--event",
						"path": "event",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--status",
						"path": "status",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--user",
						"path": "user",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--workflow",
						"path": "workflow",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "databaseId,name,status,conclusion,workflowName,displayTitle,createdAt,url"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_run_view",
			"name": "run_view",
			"display_name": "Run View",
			"description": "Run run view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"attempt": {
						"type": "string",
						"description": "The attempt number of the workflow run"
					},
					"exit_status": {
						"type": "boolean",
						"description": "Exit with non-zero status if run failed"
					},
					"job": {
						"type": "string",
						"description": "View a specific job ID from a run"
					},
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"log": {
						"type": "boolean",
						"description": "View full log for either a run or specific job"
					},
					"log_failed": {
						"type": "boolean",
						"description": "View the log for any failed steps in a run or specific job"
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"verbose": {
						"type": "boolean",
						"description": "Show job steps"
					},
					"web": {
						"type": "boolean",
						"description": "Open run in the browser"
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "run_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "run"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "option",
						"flag": "--attempt",
						"path": "attempt",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--exit-status",
						"path": "exit_status"
					},
					{
						"kind": "option",
						"flag": "--job",
						"path": "job",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--log",
						"path": "log"
					},
					{
						"kind": "flag",
						"flag": "--log-failed",
						"path": "log_failed"
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--verbose",
						"path": "verbose"
					},
					{
						"kind": "flag",
						"flag": "--web",
						"path": "web"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "databaseId,name,status,conclusion,workflowName,displayTitle,createdAt,url,jobs"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_release_list",
			"name": "release_list",
			"display_name": "Release List",
			"description": "Run release list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"exclude_drafts": {
						"type": "boolean",
						"description": "Exclude draft releases"
					},
					"exclude_pre_releases": {
						"type": "boolean",
						"description": "Exclude pre-releases"
					},
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"limit": {
						"type": "string",
						"description": "Maximum number of items to fetch (default 30)"
					},
					"order": {
						"type": "string",
						"description": "Order of releases returned: {asc|desc} (default \"desc\")",
						"enum": ["asc", "desc"]
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "release_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "release"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--exclude-drafts",
						"path": "exclude_drafts"
					},
					{
						"kind": "flag",
						"flag": "--exclude-pre-releases",
						"path": "exclude_pre_releases"
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--order",
						"path": "order",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "name,tagName,isDraft,isPrerelease,publishedAt,url"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "gh_release_view",
			"name": "release_view",
			"display_name": "Release View",
			"description": "Run release view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"jq": {
						"type": "string",
						"description": "Filter JSON output using a jq expression"
					},
					"json": {
						"type": "string",
						"description": "Output JSON with the specified fields"
					},
					"template": {
						"type": "string",
						"description": "Format JSON output using a Go template; see \"gh help formatting\""
					},
					"web": {
						"type": "boolean",
						"description": "Open the release in the browser"
					},
					"repo": {
						"type": "string",
						"description": "Select another repository using the [HOST/]OWNER/REPO format"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "release_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "release"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "option",
						"flag": "--jq",
						"path": "jq",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--json",
						"path": "json",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--template",
						"path": "template",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--web",
						"path": "web"
					},
					{
						"kind": "option",
						"flag": "--repo",
						"path": "repo",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					},
					{
						"kind": "literal",
						"value": "name,tagName,body,isDraft,isPrerelease,publishedAt,url"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/vercel-cli.json
var vercel_cli_default = {
	slug: "vercel-cli",
	display_name: "Vercel CLI",
	description: "Projects, env, and deploy workflows via local vercel through sand",
	category: "infra",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "vercel",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": [
			"VERCEL_ORG_ID",
			"VERCEL_PROJECT_ID",
			"VERCEL_SCOPE"
		],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [{
				"id": "vercel_config_dir",
				"kind": "temp_dir",
				"prefix": "hrbr-sand-vercel-"
			}],
			"env": [{
				"env": "VERCEL_TELEMETRY_DISABLED",
				"value": {
					"kind": "literal",
					"value": "1"
				}
			}],
			"args": [
				{
					"kind": "literal",
					"value": "--global-config"
				},
				{
					"kind": "artifact_path",
					"artifact_id": "vercel_config_dir"
				},
				{
					"kind": "literal",
					"value": "--token"
				},
				{
					"kind": "secret_env",
					"env": "VERCEL_TOKEN"
				}
			]
		},
		"sand_secret_bindings": [{
			"secret_name": "vercel_token",
			"env": "VERCEL_TOKEN",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "Vercel CLI Overview",
			"url": "https://vercel.com/docs/cli",
			"kind": "docs"
		}, {
			"label": "Vercel Access Tokens",
			"url": "https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token",
			"kind": "docs"
		}],
		"required_secrets": [{
			"env": "VERCEL_TOKEN",
			"display_name": "Vercel access token",
			"description": "Access token used by Harbor to authenticate `vercel` commands through the non-interactive `--token` path.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `vercel` on the originating machine plus `VERCEL_TOKEN`; `VERCEL_SCOPE`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` remain optional overrides.",
			"required_programs": ["vercel"]
		},
		"verify_probe": {
			"args": ["whoami"],
			"success_message": "Prints the authenticated Vercel account or team context."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install Vercel CLI on the originating machine and make sure `vercel` is available in PATH for Harbor sand."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "Invalid token"
				},
				{
					"kind": "substring",
					"pattern": "specified token is not valid"
				},
				{
					"kind": "substring",
					"pattern": "No existing credentials found"
				},
				{
					"kind": "substring",
					"pattern": "Not authenticated"
				}
			],
			"message": "Create a Vercel access token and store it as `VERCEL_TOKEN`; Harbor passes it through `--token` instead of using interactive login."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://vercel.com/docs/cli",
		"kind": "docs"
	}],
	default_namespace: "vercel",
	manifest: { "tools": [
		{
			"tool_id": "vercel_whoami",
			"name": "whoami",
			"display_name": "Who Am I",
			"description": "Return the authenticated Vercel account.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "whoami",
				"argv_template": [{
					"kind": "literal",
					"value": "whoami"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "vercel_project_list",
			"name": "project_list",
			"display_name": "Project List",
			"description": "List projects visible to the authenticated Vercel account.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "project_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "project"
					},
					{
						"kind": "literal",
						"value": "ls"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "vercel_env_list",
			"name": "env_list",
			"display_name": "Env List",
			"description": "List environment variables for a Vercel project.",
			"input_schema": {
				"type": "object",
				"properties": {
					"project": { "type": "string" },
					"environment": {
						"type": "string",
						"description": "production, preview, or development"
					}
				},
				"required": ["project"],
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "env_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "env"
					},
					{
						"kind": "literal",
						"value": "ls"
					},
					{
						"kind": "option",
						"flag": "--project",
						"path": "project"
					},
					{
						"kind": "option",
						"flag": "--environment",
						"path": "environment",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "vercel_deploy",
			"name": "deploy",
			"display_name": "Deploy",
			"description": "Deploy the current project with optional production mode.",
			"input_schema": {
				"type": "object",
				"properties": {
					"prod": { "type": "boolean" },
					"prebuilt": { "type": "boolean" },
					"target": { "type": "string" }
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "deploy",
				"argv_template": [
					{
						"kind": "literal",
						"value": "deploy"
					},
					{
						"kind": "literal",
						"value": "--yes"
					},
					{
						"kind": "flag",
						"flag": "--prod",
						"path": "prod"
					},
					{
						"kind": "flag",
						"flag": "--prebuilt",
						"path": "prebuilt"
					},
					{
						"kind": "option",
						"flag": "--target",
						"path": "target",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "vercel_list",
			"name": "list",
			"display_name": "List Deployments",
			"description": "List recent deployments for the active Vercel scope. Equivalent to `vercel ls`.",
			"input_schema": {
				"type": "object",
				"properties": {
					"app": {
						"type": "string",
						"description": "Project name to filter deployments by. Omit to list across the active scope."
					},
					"target": {
						"type": "string",
						"enum": ["production", "preview"],
						"description": "Filter to deployments built for the given target."
					},
					"scope": {
						"type": "string",
						"description": "Vercel scope (team slug or id) to query. Defaults to the user's personal scope."
					},
					"next": {
						"type": "string",
						"description": "Cursor (millisecond epoch) for the next page of results."
					}
				},
				"additionalProperties": false
			},
			"output_schema": {
				"type": "object",
				"description": "Object with `deployments` array; each deployment carries url, state, createdAt, target, source."
			},
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "input",
						"path": "app",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--target",
						"path": "target",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--scope",
						"path": "scope",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--next",
						"path": "next",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--yes"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "vercel_logs",
			"name": "logs",
			"display_name": "Deployment Logs",
			"description": "Fetch runtime logs for a deployment by its URL or deployment id.",
			"input_schema": {
				"type": "object",
				"required": ["deployment"],
				"properties": {
					"deployment": {
						"type": "string",
						"description": "Deployment URL (e.g. my-app-xxxxxxxxxx.vercel.app) or deployment ID (dpl_...)."
					},
					"scope": {
						"type": "string",
						"description": "Vercel scope (team slug or id) the deployment belongs to. Defaults to the user's personal scope."
					}
				},
				"additionalProperties": false
			},
			"output_schema": {
				"type": "string",
				"description": "Newline-delimited JSON log records (one log line per row) compatible with jq."
			},
			"tags": ["read", "logs"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "logs",
				"argv_template": [
					{
						"kind": "literal",
						"value": "logs"
					},
					{
						"kind": "input",
						"path": "deployment"
					},
					{
						"kind": "option",
						"flag": "--scope",
						"path": "scope",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--yes"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "vercel_domains_ls",
			"name": "domains_ls",
			"display_name": "List Domains",
			"description": "List domains attached to the active Vercel scope.",
			"input_schema": {
				"type": "object",
				"properties": {
					"scope": {
						"type": "string",
						"description": "Vercel scope (team slug or id) to query. Defaults to the user's personal scope."
					},
					"limit": {
						"type": "integer",
						"minimum": 1,
						"maximum": 100,
						"description": "Maximum number of domains to return."
					},
					"next": {
						"type": "string",
						"description": "Cursor (millisecond epoch) for the next page."
					}
				},
				"additionalProperties": false
			},
			"output_schema": {
				"type": "string",
				"description": "Tabular text listing of domains. Use `vercel domains inspect <domain>` for details."
			},
			"tags": ["inspection"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "domains_ls",
				"argv_template": [
					{
						"kind": "literal",
						"value": "domains"
					},
					{
						"kind": "literal",
						"value": "ls"
					},
					{
						"kind": "option",
						"flag": "--scope",
						"path": "scope",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--next",
						"path": "next",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--yes"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/modal-cli.json
var modal_cli_default = {
	slug: "modal-cli",
	display_name: "Modal CLI",
	description: "Modal app and deploy workflows via local modal through sand",
	category: "infra",
	kind: "cli",
	config: {
		"cli_launcher": "uvx",
		"cli_command": "modal",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["MODAL_ENVIRONMENT"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [
				{
					"id": "modal_config_dir",
					"kind": "temp_dir",
					"prefix": "hrbr-sand-modal-"
				},
				{
					"id": "modal_config_path",
					"kind": "temp_file",
					"parent_artifact_id": "modal_config_dir",
					"filename": ".modal.toml",
					"contents": ""
				},
				{
					"id": "uv_cache_dir",
					"kind": "temp_dir",
					"prefix": "hrbr-sand-uv-"
				}
			],
			"env": [{
				"env": "MODAL_CONFIG_PATH",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "modal_config_path"
				}
			}, {
				"env": "UV_CACHE_DIR",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "uv_cache_dir"
				}
			}]
		},
		"sand_secret_bindings": [{
			"secret_name": "modal_token_id",
			"env": "MODAL_TOKEN_ID",
			"required": true
		}, {
			"secret_name": "modal_token_secret",
			"env": "MODAL_TOKEN_SECRET",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "Modal Token CLI",
			"url": "https://modal.com/docs/reference/cli/token",
			"kind": "docs"
		}, {
			"label": "Modal Service Users",
			"url": "https://modal.com/docs/guide/service-users",
			"kind": "docs"
		}],
		"required_secrets": [{
			"env": "MODAL_TOKEN_ID",
			"display_name": "Modal token ID",
			"description": "Token identifier for the Modal workspace or service user Harbor should use.",
			"required": true
		}, {
			"env": "MODAL_TOKEN_SECRET",
			"display_name": "Modal token secret",
			"description": "Secret paired with `MODAL_TOKEN_ID`; Harbor injects both into an isolated Modal config path for the run.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `uvx` on the originating machine so Harbor can launch `modal`, plus `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET` for the target workspace.",
			"required_programs": ["uvx"]
		},
		"verify_probe": {
			"args": ["token", "info"],
			"success_message": "Prints the active Modal token metadata when the credentials are valid."
		},
		"failure_hints": [
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "ENOENT"
					},
					{
						"kind": "substring",
						"pattern": "command not found"
					},
					{
						"kind": "substring",
						"pattern": "No such file or directory"
					}
				],
				"message": "Install `uv` so Harbor can launch `modal` through `uvx` on the originating machine."
			},
			{
				"matchers": [
					{
						"kind": "regex",
						"pattern": "token (id|secret)",
						"flags": "i"
					},
					{
						"kind": "substring",
						"pattern": "Token ID is malformed"
					},
					{
						"kind": "substring",
						"pattern": "failed to authenticate"
					},
					{
						"kind": "substring",
						"pattern": "unauthenticated"
					}
				],
				"message": "Set both `MODAL_TOKEN_ID` and `MODAL_TOKEN_SECRET`; Harbor does not reuse an interactive Modal login."
			},
			{
				"matchers": [{
					"kind": "substring",
					"pattern": "multiple environments"
				}],
				"message": "Set `MODAL_ENVIRONMENT` when the Modal workspace exposes more than one environment."
			}
		]
	},
	links: [{
		"label": "Docs",
		"url": "https://modal.com/docs/reference/cli",
		"kind": "docs"
	}],
	default_namespace: "modal",
	manifest: { "tools": [
		{
			"tool_id": "modal_app_list",
			"name": "app_list",
			"display_name": "App List",
			"description": "List Modal apps.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "app_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "app"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "modal_app_history",
			"name": "app_history",
			"display_name": "App History",
			"description": "Show deployment history for a Modal app.",
			"input_schema": {
				"type": "object",
				"properties": { "app_id": { "type": "string" } },
				"required": ["app_id"],
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "app_history",
				"argv_template": [
					{
						"kind": "literal",
						"value": "app"
					},
					{
						"kind": "literal",
						"value": "history"
					},
					{
						"kind": "input",
						"path": "app_id"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "modal_app_logs",
			"name": "app_logs",
			"display_name": "App Logs",
			"description": "Stream or fetch logs for a Modal app.",
			"input_schema": {
				"type": "object",
				"properties": {
					"app_id": { "type": "string" },
					"tail": { "type": "integer" }
				},
				"required": ["app_id"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "app_logs",
				"argv_template": [
					{
						"kind": "literal",
						"value": "app"
					},
					{
						"kind": "literal",
						"value": "logs"
					},
					{
						"kind": "input",
						"path": "app_id"
					},
					{
						"kind": "option",
						"flag": "--tail",
						"path": "tail",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "modal_deploy",
			"name": "deploy",
			"display_name": "Deploy",
			"description": "Deploy a Modal entrypoint.",
			"input_schema": {
				"type": "object",
				"properties": {
					"entrypoint": {
						"type": "string",
						"description": "Python file/module accepted by modal deploy."
					},
					"name": { "type": "string" }
				},
				"required": ["entrypoint"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "deploy",
				"argv_template": [
					{
						"kind": "literal",
						"value": "deploy"
					},
					{
						"kind": "input",
						"path": "entrypoint"
					},
					{
						"kind": "option",
						"flag": "--name",
						"path": "name",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "modal_secret_list",
			"name": "secret_list",
			"display_name": "List Secrets",
			"description": "List published Modal secrets in the selected environment.",
			"input_schema": {
				"type": "object",
				"properties": { "env": {
					"type": "string",
					"description": "Modal environment to query. Defaults to MODAL_ENVIRONMENT or the workspace default."
				} },
				"additionalProperties": false
			},
			"output_schema": {
				"type": "object",
				"description": "Array of Modal secrets in the environment with name and metadata."
			},
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "secret_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "secret"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--env",
						"path": "env",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "modal_volume_list",
			"name": "volume_list",
			"display_name": "List Volumes",
			"description": "List Modal Volumes in the selected environment.",
			"input_schema": {
				"type": "object",
				"properties": { "env": {
					"type": "string",
					"description": "Modal environment to query. Defaults to MODAL_ENVIRONMENT or the workspace default."
				} },
				"additionalProperties": false
			},
			"output_schema": {
				"type": "object",
				"description": "Array of Modal Volume metadata: name, created_at, etc."
			},
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "volume_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "volume"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--env",
						"path": "env",
						"omit_if_empty": true
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/wrangler-cli.json
var wrangler_cli_default = {
	slug: "wrangler-cli",
	display_name: "Wrangler CLI",
	description: "Cloudflare Workers account and project inspection via local wrangler through sand",
	category: "infra",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "wrangler",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["CF_ACCOUNT_ID"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_secret_bindings": [{
			"secret_name": "cloudflare_api_token",
			"env": "CF_API_TOKEN",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "Wrangler Commands",
			"url": "https://developers.cloudflare.com/workers/wrangler/commands/",
			"kind": "docs"
		}, {
			"label": "Wrangler Authentication",
			"url": "https://developers.cloudflare.com/workers/wrangler/migration/v1-to-v2/wrangler-legacy/authentication/",
			"kind": "docs"
		}],
		"required_secrets": [{
			"env": "CF_API_TOKEN",
			"display_name": "Cloudflare API token",
			"description": "API token Harbor passes to Wrangler through `CF_API_TOKEN` for non-interactive Cloudflare auth.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `wrangler` on the originating machine plus `CF_API_TOKEN`; `CF_ACCOUNT_ID` is optional for account-scoped commands.",
			"required_programs": ["wrangler"]
		},
		"verify_probe": {
			"args": ["whoami", "--json"],
			"success_message": "Prints Wrangler auth details as JSON when the Cloudflare token is valid."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install Wrangler on the originating machine and make sure `wrangler` is available in PATH for Harbor sand."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "loggedIn\":false"
				},
				{
					"kind": "substring",
					"pattern": "not authenticated"
				},
				{
					"kind": "substring",
					"pattern": "Invalid API token"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "401"
				}
			],
			"message": "Set a valid `CF_API_TOKEN`; use `CF_ACCOUNT_ID` only when the Wrangler command needs a specific Cloudflare account."
		}]
	},
	links: [{
		"label": "Wrangler Commands",
		"url": "https://developers.cloudflare.com/workers/wrangler/commands/",
		"kind": "docs"
	}],
	default_namespace: "wrangler",
	manifest: { "tools": [
		{
			"tool_id": "wrangler_version",
			"name": "version",
			"display_name": "Version",
			"description": "Print the installed Wrangler version.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "version",
				"argv_template": [{
					"kind": "literal",
					"value": "--version"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "wrangler_whoami",
			"name": "whoami",
			"display_name": "Who Am I",
			"description": "Show the authenticated Cloudflare user and account context.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "whoami",
				"argv_template": [{
					"kind": "literal",
					"value": "whoami"
				}, {
					"kind": "literal",
					"value": "--json"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_deployments_list",
			"name": "deployments_list",
			"display_name": "Deployments List",
			"description": "Run deployments list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"config": {
						"type": "boolean",
						"description": "Path to Wrangler configuration file  [string]"
					},
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env": {
						"type": "boolean",
						"description": "Environment to use for operations, and for selecting .env and .dev.vars files  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					},
					"name": {
						"type": "boolean",
						"description": "Name of the Worker  [string]"
					},
					"json": {
						"type": "boolean",
						"description": "Display output as JSON  [boolean] [default: false]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "deployments_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "deployments"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--config",
						"path": "config"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env",
						"path": "env"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "flag",
						"flag": "--name",
						"path": "name"
					},
					{
						"kind": "flag",
						"flag": "--json",
						"path": "json"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_d1_list",
			"name": "d1_list",
			"display_name": "D1 List",
			"description": "Run d1 list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"config": {
						"type": "boolean",
						"description": "Path to Wrangler configuration file  [string]"
					},
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env": {
						"type": "boolean",
						"description": "Environment to use for operations, and for selecting .env and .dev.vars files  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					},
					"json": {
						"type": "boolean",
						"description": "Return output as JSON  [boolean] [default: false]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "d1_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "d1"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--config",
						"path": "config"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env",
						"path": "env"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "flag",
						"flag": "--json",
						"path": "json"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_kv_namespace_list",
			"name": "kv_namespace_list",
			"display_name": "Kv Namespace List",
			"description": "Run kv namespace list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"config": {
						"type": "boolean",
						"description": "Path to Wrangler configuration file  [string]"
					},
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env": {
						"type": "boolean",
						"description": "Environment to use for operations, and for selecting .env and .dev.vars files  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "kv_namespace_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "kv"
					},
					{
						"kind": "literal",
						"value": "namespace"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--config",
						"path": "config"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env",
						"path": "env"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_r2_bucket_list",
			"name": "r2_bucket_list",
			"display_name": "R2 Bucket List",
			"description": "Run r2 bucket list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"config": {
						"type": "boolean",
						"description": "Path to Wrangler configuration file  [string]"
					},
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env": {
						"type": "boolean",
						"description": "Environment to use for operations, and for selecting .env and .dev.vars files  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					},
					"jurisdiction": {
						"type": "boolean",
						"description": "The jurisdiction to list  [string]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "r2_bucket_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "r2"
					},
					{
						"kind": "literal",
						"value": "bucket"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--config",
						"path": "config"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env",
						"path": "env"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "flag",
						"flag": "--jurisdiction",
						"path": "jurisdiction"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_queues_list",
			"name": "queues_list",
			"display_name": "Queues List",
			"description": "Run queues list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"config": {
						"type": "boolean",
						"description": "Path to Wrangler configuration file  [string]"
					},
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env": {
						"type": "boolean",
						"description": "Environment to use for operations, and for selecting .env and .dev.vars files  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					},
					"page": {
						"type": "boolean",
						"description": "Page number for pagination  [number]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "queues_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "queues"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--config",
						"path": "config"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env",
						"path": "env"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "flag",
						"flag": "--page",
						"path": "page"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "wrangler_pages_project_list",
			"name": "pages_project_list",
			"display_name": "Pages Project List",
			"description": "Run pages project list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"cwd": {
						"type": "boolean",
						"description": "Run as if Wrangler was started in the specified directory instead of the current working directory  [string]"
					},
					"env_file": {
						"type": "boolean",
						"description": "Path to an .env file to load - can be specified multiple times - values from earlier files are overridden by values in later files  [array]"
					},
					"json": {
						"type": "boolean",
						"description": "Return output as JSON  [boolean] [default: false]"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "pages_project_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pages"
					},
					{
						"kind": "literal",
						"value": "project"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "flag",
						"flag": "--cwd",
						"path": "cwd"
					},
					{
						"kind": "flag",
						"flag": "--env-file",
						"path": "env_file"
					},
					{
						"kind": "flag",
						"flag": "--json",
						"path": "json"
					},
					{
						"kind": "literal",
						"value": "--json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/aws-cli.json
var aws_cli_default = {
	slug: "aws-cli",
	display_name: "AWS CLI",
	description: "AWS account and resource inspection via local aws through sand",
	category: "infra",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "aws",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["AWS_REGION", "AWS_PROFILE"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": { "env": [
			{
				"env": "AWS_PAGER",
				"value": {
					"kind": "literal",
					"value": ""
				}
			},
			{
				"env": "AWS_CLI_AUTO_PROMPT",
				"value": {
					"kind": "literal",
					"value": "off"
				}
			},
			{
				"env": "AWS_EC2_METADATA_DISABLED",
				"value": {
					"kind": "literal",
					"value": "true"
				}
			}
		] },
		"sand_secret_bindings": [
			{
				"secret_name": "aws_access_key_id",
				"env": "AWS_ACCESS_KEY_ID",
				"required": true
			},
			{
				"secret_name": "aws_secret_access_key",
				"env": "AWS_SECRET_ACCESS_KEY",
				"required": true
			},
			{
				"secret_name": "aws_session_token",
				"env": "AWS_SESSION_TOKEN",
				"required": false
			}
		],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [{
			"label": "AWS CLI Command Reference",
			"url": "https://docs.aws.amazon.com/cli/latest/reference/",
			"kind": "docs"
		}, {
			"label": "AWS CLI Environment Variables",
			"url": "https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html",
			"kind": "docs"
		}],
		"required_secrets": [
			{
				"env": "AWS_ACCESS_KEY_ID",
				"display_name": "AWS access key ID",
				"description": "Access key ID Harbor injects for non-interactive AWS CLI authentication.",
				"required": true
			},
			{
				"env": "AWS_SECRET_ACCESS_KEY",
				"display_name": "AWS secret access key",
				"description": "Secret access key paired with `AWS_ACCESS_KEY_ID` for Harbor AWS CLI runs.",
				"required": true
			},
			{
				"env": "AWS_SESSION_TOKEN",
				"display_name": "AWS session token",
				"description": "Optional token for temporary AWS credentials (for example from STS or IAM Identity Center flows).",
				"required": false
			}
		],
		"runnable": {
			"summary": "Requires `aws` on the originating machine plus `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; `AWS_SESSION_TOKEN` is optional and `AWS_REGION` / `AWS_PROFILE` can override context.",
			"required_programs": ["aws"]
		},
		"verify_probe": {
			"args": [
				"sts",
				"get-caller-identity",
				"--output",
				"json"
			],
			"success_message": "Returns the authenticated AWS account identity as JSON."
		},
		"failure_hints": [
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "ENOENT"
					},
					{
						"kind": "substring",
						"pattern": "command not found"
					},
					{
						"kind": "substring",
						"pattern": "No such file or directory"
					}
				],
				"message": "Install AWS CLI on the originating machine and make sure `aws` is available in PATH for Harbor sand."
			},
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "Unable to locate credentials"
					},
					{
						"kind": "substring",
						"pattern": "InvalidClientTokenId"
					},
					{
						"kind": "substring",
						"pattern": "The security token included in the request is invalid"
					},
					{
						"kind": "substring",
						"pattern": "SignatureDoesNotMatch"
					},
					{
						"kind": "substring",
						"pattern": "ExpiredToken"
					}
				],
				"message": "Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`; include `AWS_SESSION_TOKEN` when using temporary credentials."
			},
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "You must specify a region"
					},
					{
						"kind": "substring",
						"pattern": "Unable to parse config file"
					},
					{
						"kind": "substring",
						"pattern": "The config profile"
					}
				],
				"message": "Set `AWS_REGION` for region-scoped commands; use `AWS_PROFILE` only when that profile is available in the runtime environment."
			}
		]
	},
	links: [{
		"label": "AWS CLI Command Reference",
		"url": "https://docs.aws.amazon.com/cli/latest/reference/",
		"kind": "docs"
	}],
	default_namespace: "aws",
	manifest: { "tools": [
		{
			"tool_id": "aws_version",
			"name": "version",
			"display_name": "Version",
			"description": "Print the installed AWS CLI version.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "version",
				"argv_template": [{
					"kind": "literal",
					"value": "--version"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "aws_sts_get_caller_identity",
			"name": "sts_get_caller_identity",
			"display_name": "STS Caller Identity",
			"description": "Return the active AWS account identity from STS.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "sts_get_caller_identity",
				"argv_template": [
					{
						"kind": "literal",
						"value": "sts"
					},
					{
						"kind": "literal",
						"value": "get-caller-identity"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_region_list",
			"name": "region_list",
			"display_name": "Region List",
			"description": "List AWS regions visible to the current account.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "region_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "ec2"
					},
					{
						"kind": "literal",
						"value": "describe-regions"
					},
					{
						"kind": "literal",
						"value": "--all-regions"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_s3_bucket_list",
			"name": "s3_bucket_list",
			"display_name": "S3 Bucket List",
			"description": "List S3 buckets visible to the current account.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "s3_bucket_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "s3api"
					},
					{
						"kind": "literal",
						"value": "list-buckets"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_lambda_list_functions",
			"name": "lambda_list_functions",
			"display_name": "Lambda List Functions",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "lambda_list_functions",
				"argv_template": [
					{
						"kind": "literal",
						"value": "lambda"
					},
					{
						"kind": "literal",
						"value": "list-functions"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_cloudformation_list_stacks",
			"name": "cloudformation_list_stacks",
			"display_name": "Cloudformation List Stacks",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "cloudformation_list_stacks",
				"argv_template": [
					{
						"kind": "literal",
						"value": "cloudformation"
					},
					{
						"kind": "literal",
						"value": "list-stacks"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_logs_describe_log_groups",
			"name": "logs_describe_log_groups",
			"display_name": "Logs Describe Log Groups",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read", "logs"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "logs_describe_log_groups",
				"argv_template": [
					{
						"kind": "literal",
						"value": "logs"
					},
					{
						"kind": "literal",
						"value": "describe-log-groups"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_sqs_list_queues",
			"name": "sqs_list_queues",
			"display_name": "Sqs List Queues",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "sqs_list_queues",
				"argv_template": [
					{
						"kind": "literal",
						"value": "sqs"
					},
					{
						"kind": "literal",
						"value": "list-queues"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_dynamodb_list_tables",
			"name": "dynamodb_list_tables",
			"display_name": "Dynamodb List Tables",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "dynamodb_list_tables",
				"argv_template": [
					{
						"kind": "literal",
						"value": "dynamodb"
					},
					{
						"kind": "literal",
						"value": "list-tables"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "aws_ec2_describe_instances",
			"name": "ec2_describe_instances",
			"display_name": "Ec2 Describe Instances",
			"description": "To see help text, you can run: aws help aws <command> help aws <command> <subcommand> help Unknown options: --help",
			"input_schema": {
				"type": "object",
				"properties": {
					"subcommand": {
						"type": "string",
						"description": "Positional argument: subcommand"
					},
					"parameters": {
						"type": "string",
						"description": "Positional argument: parameters"
					}
				},
				"required": ["subcommand", "subcommand"],
				"additionalProperties": false
			},
			"output_schema": { "type": "object" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "ec2_describe_instances",
				"argv_template": [
					{
						"kind": "literal",
						"value": "ec2"
					},
					{
						"kind": "literal",
						"value": "describe-instances"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "subcommand"
					},
					{
						"kind": "input",
						"path": "parameters"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/convex-cli.json
var convex_cli_default = {
	slug: "convex-cli",
	display_name: "Convex CLI",
	description: "Convex deployment, data, and environment inspection via local convex through sand",
	category: "infra",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "convex",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["CONVEX_DEPLOYMENT"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [{
				"id": "convex_home",
				"kind": "temp_dir",
				"prefix": "hrbr-sand-convex-"
			}],
			"env": [{
				"env": "HOME",
				"value": {
					"kind": "artifact_path",
					"artifact_id": "convex_home"
				}
			}]
		},
		"sand_secret_bindings": [{
			"secret_name": "convex_deploy_key",
			"env": "CONVEX_DEPLOY_KEY",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [
			{
				"label": "Convex CLI",
				"url": "https://docs.convex.dev/cli",
				"kind": "docs"
			},
			{
				"label": "Convex Deploy Keys",
				"url": "https://docs.convex.dev/cli/deploy-key-types",
				"kind": "docs"
			},
			{
				"label": "Convex Environment Variables",
				"url": "https://docs.convex.dev/production/environment-variables",
				"kind": "docs"
			}
		],
		"required_secrets": [{
			"env": "CONVEX_DEPLOY_KEY",
			"display_name": "Convex deploy key",
			"description": "Deploy key Harbor passes to `convex` through `CONVEX_DEPLOY_KEY` for non-interactive deployment access.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `convex` on the originating machine plus `CONVEX_DEPLOY_KEY`; Harbor keeps the CLI non-interactive and can optionally honor `CONVEX_DEPLOYMENT`.",
			"required_programs": ["convex"]
		},
		"verify_probe": {
			"args": ["env", "list"],
			"success_message": "Lists environment variables for the selected Convex deployment."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install Convex CLI on the originating machine and make sure `convex` is available in PATH for Harbor sand."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "CONVEX_DEPLOY_KEY"
				},
				{
					"kind": "substring",
					"pattern": "not authenticated"
				},
				{
					"kind": "substring",
					"pattern": "login"
				},
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				}
			],
			"message": "Set a valid `CONVEX_DEPLOY_KEY`; Harbor runs `convex` non-interactively and does not rely on the browser login flow."
		}]
	},
	links: [{
		"label": "Convex CLI",
		"url": "https://docs.convex.dev/cli",
		"kind": "docs"
	}],
	default_namespace: "convex",
	manifest: { "tools": [
		{
			"tool_id": "convex_function_spec",
			"name": "function_spec",
			"display_name": "Function Spec",
			"description": "List metadata for every function (query, mutation, action) deployed to the selected Convex deployment, with arg/return schemas.",
			"input_schema": {
				"type": "object",
				"properties": {
					"prod": {
						"type": "boolean",
						"description": "Target the production deployment (requires a production deploy key)."
					},
					"preview_name": {
						"type": "string",
						"description": "Target a named preview deployment."
					},
					"deployment_name": {
						"type": "string",
						"description": "Target a specific named deployment (e.g. dev:astute-quail-495). Overrides --prod / --preview-name when set."
					}
				},
				"additionalProperties": false
			},
			"output_schema": {
				"type": "object",
				"description": "Object with `url` and `functions` array; each function carries identifier, type (query/mutation/action), args schema, returns schema, visibility."
			},
			"tags": ["read", "introspection"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "function_spec",
				"argv_template": [
					{
						"kind": "literal",
						"value": "function-spec"
					},
					{
						"kind": "flag",
						"flag": "--prod",
						"path": "prod"
					},
					{
						"kind": "option",
						"flag": "--preview-name",
						"path": "preview_name",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--deployment-name",
						"path": "deployment_name",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "convex_tables",
			"name": "tables",
			"display_name": "Tables",
			"description": "List the tables in the selected Convex deployment.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "tables",
				"argv_template": [{
					"kind": "literal",
					"value": "data"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "convex_data",
			"name": "data",
			"display_name": "Data",
			"description": "Read rows from a Convex table in the selected deployment.",
			"input_schema": {
				"type": "object",
				"properties": {
					"table": {
						"type": "string",
						"description": "Table name to inspect."
					},
					"limit": {
						"type": "string",
						"description": "Maximum number of rows to return."
					},
					"order": {
						"type": "string",
						"description": "Sort order for the returned rows."
					}
				},
				"required": ["table"],
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "data",
				"argv_template": [
					{
						"kind": "literal",
						"value": "data"
					},
					{
						"kind": "input",
						"path": "table"
					},
					{
						"kind": "option",
						"flag": "--limit",
						"path": "limit",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--order",
						"path": "order",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "convex_logs",
			"name": "logs",
			"display_name": "Logs",
			"description": "Watch logs from your deployment",
			"input_schema": {
				"type": "object",
				"properties": {
					"history": {
						"type": "string",
						"description": "Show `n` most recent logs. Defaults to showing all available logs."
					},
					"success": {
						"type": "boolean",
						"description": "Print a log line for every successful function execution (default: false)"
					},
					"jsonl": {
						"type": "boolean",
						"description": "Output raw log events as JSONL (default: false)"
					},
					"prod": {
						"type": "boolean",
						"description": "Watch logs from this project's default production deployment."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read", "logs"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "logs",
				"argv_template": [
					{
						"kind": "literal",
						"value": "logs"
					},
					{
						"kind": "option",
						"flag": "--history",
						"path": "history",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--success",
						"path": "success"
					},
					{
						"kind": "flag",
						"flag": "--jsonl",
						"path": "jsonl"
					},
					{
						"kind": "flag",
						"flag": "--prod",
						"path": "prod"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/glab-cli.json
var glab_cli_default = {
	slug: "glab-cli",
	display_name: "GitLab CLI",
	description: "GitLab authentication and repository inspection via local glab through sand",
	category: "dev",
	kind: "cli",
	config: {
		"cli_launcher": "binary",
		"cli_command": "glab",
		"cli_args": [],
		"cli_cwd_policy": "workspace",
		"cli_allowed_env_keys": ["GITLAB_HOST", "GL_HOST"],
		"sand_sandbox_policy": { "filesystem": "workspace" },
		"sand_runtime": {
			"artifacts": [{
				"id": "glab_config_dir",
				"kind": "temp_dir",
				"prefix": "hrbr-sand-glab-"
			}],
			"env": [
				{
					"env": "GLAB_CONFIG_DIR",
					"value": {
						"kind": "artifact_path",
						"artifact_id": "glab_config_dir"
					}
				},
				{
					"env": "GLAB_CHECK_UPDATE",
					"value": {
						"kind": "literal",
						"value": "false"
					}
				},
				{
					"env": "GLAB_SEND_TELEMETRY",
					"value": {
						"kind": "literal",
						"value": "false"
					}
				},
				{
					"env": "NO_PROMPT",
					"value": {
						"kind": "literal",
						"value": "1"
					}
				}
			]
		},
		"sand_secret_bindings": [{
			"secret_name": "gitlab_token",
			"env": "GITLAB_TOKEN",
			"required": true
		}],
		"cli_result_defaults": {
			"sand_stdin_mode": "none",
			"sand_result_mode": "stdout_text"
		},
		"sand_runtime_constraints": { "requires_sandbox_runtime": true }
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	cli_setup: {
		"links": [
			{
				"label": "GitLab CLI Docs",
				"url": "https://docs.gitlab.com/cli/",
				"kind": "docs"
			},
			{
				"label": "glab auth login",
				"url": "https://docs.gitlab.com/cli/auth/login/",
				"kind": "docs"
			},
			{
				"label": "glab auth status",
				"url": "https://docs.gitlab.com/cli/auth/status/",
				"kind": "docs"
			}
		],
		"required_secrets": [{
			"env": "GITLAB_TOKEN",
			"display_name": "GitLab token",
			"description": "Personal access token Harbor passes to `glab` through `GITLAB_TOKEN` instead of using interactive login.",
			"required": true
		}],
		"runnable": {
			"summary": "Requires `glab` on the originating machine plus `GITLAB_TOKEN`; `GITLAB_HOST` or `GL_HOST` override self-managed instances.",
			"required_programs": ["glab"]
		},
		"verify_probe": {
			"args": ["auth", "status"],
			"success_message": "Displays the GitLab authentication status for the configured host."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "ENOENT"
				},
				{
					"kind": "substring",
					"pattern": "command not found"
				},
				{
					"kind": "substring",
					"pattern": "No such file or directory"
				}
			],
			"message": "Install GitLab CLI on the originating machine and make sure `glab` is available in PATH for Harbor sand."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "not logged into any GitLab hosts"
				},
				{
					"kind": "substring",
					"pattern": "authentication failed"
				},
				{
					"kind": "substring",
					"pattern": "Bad credentials"
				},
				{
					"kind": "substring",
					"pattern": "GITLAB_TOKEN"
				},
				{
					"kind": "substring",
					"pattern": "401"
				}
			],
			"message": "Set a valid `GITLAB_TOKEN`; Harbor runs `glab` non-interactively and uses `GITLAB_HOST` or `GL_HOST` for self-managed instances."
		}]
	},
	links: [{
		"label": "GitLab CLI Docs",
		"url": "https://docs.gitlab.com/cli/",
		"kind": "docs"
	}],
	default_namespace: "glab",
	manifest: { "tools": [
		{
			"tool_id": "glab_version",
			"name": "version",
			"display_name": "Version",
			"description": "Print the installed glab version.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "version",
				"argv_template": [{
					"kind": "literal",
					"value": "version"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_auth_status",
			"name": "auth_status",
			"display_name": "Auth Status",
			"description": "Show the current GitLab authentication state.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "auth_status",
				"argv_template": [{
					"kind": "literal",
					"value": "auth"
				}, {
					"kind": "literal",
					"value": "status"
				}],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_repo_list",
			"name": "repo_list",
			"display_name": "Repo List",
			"description": "List repositories visible to the authenticated GitLab account.",
			"input_schema": {
				"type": "object",
				"properties": {},
				"additionalProperties": false
			},
			"output_schema": { "type": "array" },
			"binding": {
				"kind": "cli_command",
				"tool_name": "repo_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "repo"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "literal",
						"value": "--output"
					},
					{
						"kind": "literal",
						"value": "json"
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "json_stdout"
			}
		},
		{
			"tool_id": "glab_mr_list",
			"name": "mr_list",
			"display_name": "Mr List",
			"description": "Run mr list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"a": {
						"type": "string",
						"description": "Get only merge requests assigned to users. Multiple users can be comma-separated or specified by repeating the flag."
					},
					"author": {
						"type": "boolean",
						"description": "Filter merge request by author <username>."
					},
					"c": {
						"type": "string",
						"description": "Get only closed merge requests."
					},
					"created_after": {
						"type": "boolean",
						"description": "Filter merge requests created after a certain date (ISO 8601 format)."
					},
					"created_before": {
						"type": "boolean",
						"description": "Filter merge requests created before a certain date (ISO 8601 format)."
					},
					"deployed_after": {
						"type": "boolean",
						"description": "Filter merge requests deployed after a certain date (ISO 8601 format)."
					},
					"deployed_before": {
						"type": "boolean",
						"description": "Filter merge requests deployed before a certain date (ISO 8601 format)."
					},
					"d": {
						"type": "string",
						"description": "Filter by draft merge requests."
					},
					"environment": {
						"type": "boolean",
						"description": "Filter merge requests deployed to the given environment <name>."
					},
					"g": {
						"type": "string",
						"description": "Select a group/subgroup. This option is ignored if a repo argument is set."
					},
					"l": {
						"type": "string",
						"description": "Filter merge request by label <name>. Multiple labels can be comma-separated or specified by repeating the flag."
					},
					"m": {
						"type": "string",
						"description": "Filter merge request by milestone <id>."
					},
					"not_draft": {
						"type": "boolean",
						"description": "Filter by non-draft merge requests."
					},
					"not_label": {
						"type": "boolean",
						"description": "Filter merge requests by not having label <name>. Multiple labels can be comma-separated or specified by repeating the flag."
					},
					"o": {
						"type": "string",
						"description": "Order merge requests by <field>. Order options: created_at, updated_at, merged_at, title, priority, label_priority, milestone_due, and popularity."
					},
					"f": {
						"type": "string",
						"description": "Format output as: text, json. (text)"
					},
					"p": {
						"type": "string",
						"description": "Number of items to list per page. (30)"
					},
					"r": {
						"type": "string",
						"description": "Get only merge requests with users as reviewer. Multiple users can be comma-separated or specified by repeating the flag."
					},
					"search": {
						"type": "boolean",
						"description": "Filter by <string> in title and description."
					},
					"s": {
						"type": "string",
						"description": "Filter by source branch <name>."
					},
					"t": {
						"type": "string",
						"description": "Filter by target branch <name>."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "mr_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "mr"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--A",
						"path": "a",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--a",
						"path": "a",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--author",
						"path": "author"
					},
					{
						"kind": "option",
						"flag": "--c",
						"path": "c",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--created-after",
						"path": "created_after"
					},
					{
						"kind": "flag",
						"flag": "--created-before",
						"path": "created_before"
					},
					{
						"kind": "flag",
						"flag": "--deployed-after",
						"path": "deployed_after"
					},
					{
						"kind": "flag",
						"flag": "--deployed-before",
						"path": "deployed_before"
					},
					{
						"kind": "option",
						"flag": "--d",
						"path": "d",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--environment",
						"path": "environment"
					},
					{
						"kind": "option",
						"flag": "--g",
						"path": "g",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--l",
						"path": "l",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--M",
						"path": "m",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--m",
						"path": "m",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--not-draft",
						"path": "not_draft"
					},
					{
						"kind": "flag",
						"flag": "--not-label",
						"path": "not_label"
					},
					{
						"kind": "option",
						"flag": "--o",
						"path": "o",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--F",
						"path": "f",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--P",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--r",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--search",
						"path": "search"
					},
					{
						"kind": "option",
						"flag": "--S",
						"path": "s",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--s",
						"path": "s",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--t",
						"path": "t",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_mr_view",
			"name": "mr_view",
			"display_name": "Mr View",
			"description": "Run mr view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"c": {
						"type": "string",
						"description": "Show merge request comments and activities."
					},
					"f": {
						"type": "string",
						"description": "Format output as: text, json. (text)"
					},
					"p": {
						"type": "string",
						"description": "Number of items to list per page. (20)"
					},
					"r": {
						"type": "string",
						"description": "Select another repository. Can use either `OWNER/REPO` or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL."
					},
					"resolved": {
						"type": "boolean",
						"description": "Show only resolved discussions (implies --comments)."
					},
					"s": {
						"type": "string",
						"description": "Show system activities and logs."
					},
					"unresolved": {
						"type": "boolean",
						"description": "Show only unresolved discussions (implies --comments)."
					},
					"w": {
						"type": "string",
						"description": "Open merge request in a browser. Uses default browser or browser specified in BROWSER variable."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "mr_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "mr"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "option",
						"flag": "--c",
						"path": "c",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--F",
						"path": "f",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--P",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--resolved",
						"path": "resolved"
					},
					{
						"kind": "option",
						"flag": "--s",
						"path": "s",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--unresolved",
						"path": "unresolved"
					},
					{
						"kind": "option",
						"flag": "--w",
						"path": "w",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_issue_list",
			"name": "issue_list",
			"display_name": "Issue List",
			"description": "Run issue list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"a": {
						"type": "string",
						"description": "Filter issue by assignee <username>."
					},
					"author": {
						"type": "boolean",
						"description": "Filter issue by author <username>."
					},
					"c": {
						"type": "string",
						"description": "Filter by confidential issues."
					},
					"e": {
						"type": "string",
						"description": "List issues belonging to a given epic (requires --group, no pagination support)."
					},
					"g": {
						"type": "string",
						"description": "Select a group or subgroup. Ignored if a repo argument is set."
					},
					"in": {
						"type": "boolean",
						"description": "Search in: title, description. (title,description)"
					},
					"t": {
						"type": "string",
						"description": "Filter issue by its type. Options: issue, incident, test_case."
					},
					"i": {
						"type": "string",
						"description": "Filter issue by iteration <id>."
					},
					"l": {
						"type": "string",
						"description": "Filter issue by label <name>. Multiple labels can be comma-separated or specified by repeating the flag."
					},
					"m": {
						"type": "string",
						"description": "Filter issue by milestone <id>."
					},
					"not_assignee": {
						"type": "boolean",
						"description": "Filter issue by not being assigned to <username>."
					},
					"not_author": {
						"type": "boolean",
						"description": "Filter issue by not being by author(s) <username>."
					},
					"not_label": {
						"type": "boolean",
						"description": "Filter issue by lack of label <name>. Multiple labels can be comma-separated or specified by repeating the flag."
					},
					"order": {
						"type": "boolean",
						"description": "Order issue by <field>. Order options: created_at, updated_at, priority, due_date, relative_position, label_priority, milestone_due, popularity, weight. (created_at)"
					},
					"o": {
						"type": "string",
						"description": "Options: 'text' or 'json'. (text)"
					},
					"f": {
						"type": "string",
						"description": "Options: 'details', 'ids', 'urls'. (details)"
					},
					"p": {
						"type": "string",
						"description": "Number of items to list per page. (30)"
					},
					"r": {
						"type": "string",
						"description": "Select another repository. Can use either `OWNER/REPO` or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL."
					},
					"search": {
						"type": "boolean",
						"description": "Search <string> in the fields defined by '--in'."
					},
					"s": {
						"type": "string",
						"description": "Sort direction for --order field: asc or desc. (desc)"
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "issue_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "issue"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--A",
						"path": "a",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--a",
						"path": "a",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--author",
						"path": "author"
					},
					{
						"kind": "option",
						"flag": "--c",
						"path": "c",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--C",
						"path": "c",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--e",
						"path": "e",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--g",
						"path": "g",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--in",
						"path": "in"
					},
					{
						"kind": "option",
						"flag": "--t",
						"path": "t",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--i",
						"path": "i",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--l",
						"path": "l",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--m",
						"path": "m",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--not-assignee",
						"path": "not_assignee"
					},
					{
						"kind": "flag",
						"flag": "--not-author",
						"path": "not_author"
					},
					{
						"kind": "flag",
						"flag": "--not-label",
						"path": "not_label"
					},
					{
						"kind": "flag",
						"flag": "--order",
						"path": "order"
					},
					{
						"kind": "option",
						"flag": "--O",
						"path": "o",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--F",
						"path": "f",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--P",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--search",
						"path": "search"
					},
					{
						"kind": "option",
						"flag": "--s",
						"path": "s",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_issue_view",
			"name": "issue_view",
			"display_name": "Issue View",
			"description": "Run issue view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"c": {
						"type": "string",
						"description": "Show issue comments and activities."
					},
					"f": {
						"type": "string",
						"description": "Format output as: text, json. (text)"
					},
					"p": {
						"type": "string",
						"description": "Number of items to list per page. (20)"
					},
					"r": {
						"type": "string",
						"description": "Select another repository. Can use either `OWNER/REPO` or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL."
					},
					"s": {
						"type": "string",
						"description": "Show system activities and logs."
					},
					"w": {
						"type": "string",
						"description": "Open issue in a browser. Uses the default browser, or the browser specified in the $BROWSER variable."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "issue_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "issue"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "option",
						"flag": "--c",
						"path": "c",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--F",
						"path": "f",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--P",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--s",
						"path": "s",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--w",
						"path": "w",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_pipeline_list",
			"name": "pipeline_list",
			"display_name": "Pipeline List",
			"description": "Run pipeline list.",
			"input_schema": {
				"type": "object",
				"properties": {
					"n": {
						"type": "string",
						"description": "Return only pipelines with the given name."
					},
					"o": {
						"type": "string",
						"description": "Order pipelines by this field. Options: id, status, ref, updated_at, user_id. (id)"
					},
					"f": {
						"type": "string",
						"description": "Format output. Options: text, json. (text)"
					},
					"p": {
						"type": "string",
						"description": "Number of items to list per page. (30)"
					},
					"r": {
						"type": "string",
						"description": "Select another repository. Can use either `OWNER/REPO` or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL."
					},
					"scope": {
						"type": "boolean",
						"description": "Return only pipelines with the given scope: {running|pending|finished|branches|tags}",
						"enum": [
							"running",
							"pending",
							"finished",
							"branches",
							"tags"
						]
					},
					"sha": {
						"type": "boolean",
						"description": "Return only pipelines with the given SHA."
					},
					"sort": {
						"type": "boolean",
						"description": "Sort direction for --order field: asc or desc. (desc)"
					},
					"source": {
						"type": "boolean",
						"description": "Return only pipelines triggered via the given source. See https://docs.gitlab.com/ci/jobs/job_rules/#ci_pipeline_source-predefined-variable for full list. Commonly used options: {merge_request_event|parent_pipeline|pipeline|push|trigger}",
						"enum": [
							"merge_request_event",
							"parent_pipeline",
							"pipeline",
							"push",
							"trigger"
						]
					},
					"s": {
						"type": "string",
						"description": "Get pipeline with this status. Options: running, pending, success, failed, canceled, skipped, created, manual, waiting_for_resource, preparing, scheduled."
					},
					"a": {
						"type": "string",
						"description": "Return only pipelines updated after the specified date. Expected in ISO 8601 format (2019-03-15T08:00:00Z)."
					},
					"b": {
						"type": "string",
						"description": "Return only pipelines updated before the specified date. Expected in ISO 8601 format (2019-03-15T08:00:00Z)."
					},
					"u": {
						"type": "string",
						"description": "Return only pipelines triggered by the given username."
					},
					"y": {
						"type": "string",
						"description": "Return only pipelines with invalid configurations."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "pipeline_list",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pipeline"
					},
					{
						"kind": "literal",
						"value": "list"
					},
					{
						"kind": "option",
						"flag": "--n",
						"path": "n",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--o",
						"path": "o",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--F",
						"path": "f",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--P",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--r",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "flag",
						"flag": "--scope",
						"path": "scope"
					},
					{
						"kind": "flag",
						"flag": "--sha",
						"path": "sha"
					},
					{
						"kind": "flag",
						"flag": "--sort",
						"path": "sort"
					},
					{
						"kind": "flag",
						"flag": "--source",
						"path": "source"
					},
					{
						"kind": "option",
						"flag": "--s",
						"path": "s",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--a",
						"path": "a",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--b",
						"path": "b",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--u",
						"path": "u",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--y",
						"path": "y",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		},
		{
			"tool_id": "glab_pipeline_view",
			"name": "pipeline_view",
			"display_name": "Pipeline View",
			"description": "Run pipeline view.",
			"input_schema": {
				"type": "object",
				"properties": {
					"b": {
						"type": "string",
						"description": "Check pipeline status for a branch or tag. Defaults to the current branch."
					},
					"p": {
						"type": "string",
						"description": "Check pipeline status for a specific pipeline ID."
					},
					"r": {
						"type": "string",
						"description": "Select another repository. Can use either `OWNER/REPO` or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL."
					},
					"w": {
						"type": "string",
						"description": "Open pipeline in a browser. Uses default browser, or browser specified in BROWSER variable."
					}
				},
				"additionalProperties": false
			},
			"output_schema": { "type": "string" },
			"tags": ["read"],
			"binding": {
				"kind": "cli_command",
				"tool_name": "pipeline_view",
				"argv_template": [
					{
						"kind": "literal",
						"value": "pipeline"
					},
					{
						"kind": "literal",
						"value": "view"
					},
					{
						"kind": "option",
						"flag": "--b",
						"path": "b",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--p",
						"path": "p",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--R",
						"path": "r",
						"omit_if_empty": true
					},
					{
						"kind": "option",
						"flag": "--w",
						"path": "w",
						"omit_if_empty": true
					}
				],
				"sand_stdin_mode": "none",
				"sand_result_mode": "stdout_text"
			}
		}
	] }
};
//#endregion
//#region ../registry-catalog/data/v1/entries/linear-graphql.json
var linear_graphql_default = {
	slug: "linear-graphql",
	display_name: "Linear GraphQL",
	description: "Linear GraphQL API for issues, projects, and team state",
	category: "dev",
	kind: "api",
	config: {
		"api_protocol": "graphql",
		"api_base_url": "https://api.linear.app",
		"api_allowed_hosts": ["api.linear.app"],
		"api_graphql_endpoint": "https://api.linear.app/graphql",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "LINEAR_API_KEY",
			"secret_name": "linear_api_key",
			"prefix": ""
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "",
		"required_secrets": ["LINEAR_API_KEY"]
	},
	auth_test: {
		"method": "POST",
		"url": "https://api.linear.app/graphql",
		"headers": { "content-type": "application/json" },
		"body": {
			"query": "query Viewer { viewer { id } }",
			"operationName": "Viewer"
		},
		"expected_status": 200,
		"auth_template": {
			"kind": "header",
			"header_name": "Authorization",
			"value_template": "${secret}",
			"secret_slot": "LINEAR_API_KEY"
		}
	},
	api_setup: {
		"links": [{
			"label": "Docs",
			"url": "https://developers.linear.app/docs/graphql/working-with-the-graphql-api",
			"kind": "docs"
		}],
		"base_url": "https://api.linear.app",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "LINEAR_API_KEY",
			"display_name": "Linear API key",
			"description": "Personal Linear API key Harbor sends in the Authorization header without a Bearer prefix.",
			"required": true
		}],
		"graphql_endpoint": "https://api.linear.app/graphql",
		"verify_probe": {
			"kind": "graphql",
			"method": "POST",
			"path": "/graphql",
			"document": "query Viewer { viewer { id name email } }",
			"operation_name": "Viewer",
			"expected_status": 200,
			"success_message": "Returns the authenticated Linear viewer."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "invalid api key"
				}
			],
			"message": "Set a valid `LINEAR_API_KEY`; Harbor forwards it in the Authorization header without a Bearer prefix."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "forbidden"
			}],
			"message": "Make sure the Linear API key belongs to a workspace that can access GraphQL."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.linear.app/docs/graphql/working-with-the-graphql-api",
		"kind": "docs"
	}],
	default_namespace: "linear_graphql"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/github-graphql.json
var github_graphql_default = {
	slug: "github-graphql",
	display_name: "GitHub GraphQL",
	description: "GitHub GraphQL API for repository and org data",
	category: "dev",
	kind: "api",
	config: {
		"api_protocol": "graphql",
		"api_base_url": "https://api.github.com",
		"api_allowed_hosts": ["api.github.com"],
		"api_graphql_endpoint": "https://api.github.com/graphql",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "GITHUB_TOKEN",
			"secret_name": "github_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["GITHUB_TOKEN"]
	},
	auth_test: {
		"method": "POST",
		"url": "https://api.github.com/graphql",
		"headers": { "content-type": "application/json" },
		"body": {
			"query": "query Viewer { viewer { login } }",
			"operationName": "Viewer"
		},
		"expected_status": 200,
		"auth_template": {
			"kind": "header",
			"header_name": "Authorization",
			"value_template": "Bearer ${secret}",
			"secret_slot": "GITHUB_TOKEN"
		}
	},
	api_setup: {
		"links": [{
			"label": "Docs",
			"url": "https://docs.github.com/en/graphql",
			"kind": "docs"
		}],
		"base_url": "https://api.github.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "GITHUB_TOKEN",
			"display_name": "GitHub token",
			"description": "Personal access token Harbor sends as a Bearer token to GitHub GraphQL.",
			"required": true
		}],
		"graphql_endpoint": "https://api.github.com/graphql",
		"verify_probe": {
			"kind": "graphql",
			"method": "POST",
			"path": "/graphql",
			"document": "query Viewer { viewer { login name url } }",
			"operation_name": "Viewer",
			"expected_status": 200,
			"success_message": "Returns the authenticated GitHub viewer."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "Bad credentials"
				},
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "GITHUB_TOKEN"
				}
			],
			"message": "Set a valid `GITHUB_TOKEN`; Harbor forwards it as a Bearer token to GitHub GraphQL."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "forbidden"
			}],
			"message": "Make sure the token has access to the repositories or organization you are querying."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.github.com/en/graphql",
		"kind": "docs"
	}],
	default_namespace: "github_graphql"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/github-rest-api.json
var github_rest_api_default = {
	slug: "github-rest-api",
	display_name: "GitHub REST API",
	description: "GitHub REST API for account, repo, and search workflows",
	category: "dev",
	kind: "api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.github.com",
		"api_allowed_hosts": ["api.github.com"],
		"api_spec_url": "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
		"api_default_headers": {
			"Accept": "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28"
		},
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "GITHUB_TOKEN",
			"secret_name": "github_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["GITHUB_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "Docs",
			"url": "https://docs.github.com/en/rest",
			"kind": "docs"
		}],
		"base_url": "https://api.github.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "GITHUB_TOKEN",
			"display_name": "GitHub token",
			"description": "Personal access token Harbor sends as a Bearer token to GitHub REST.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
		"default_headers": {
			"Accept": "application/vnd.github+json",
			"X-GitHub-Api-Version": "2022-11-28"
		},
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/user",
			"expected_status": 200,
			"success_message": "Returns the authenticated GitHub user."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "Bad credentials"
				},
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "GITHUB_TOKEN"
				}
			],
			"message": "Set a valid `GITHUB_TOKEN`; Harbor forwards it as a Bearer token to GitHub REST."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "API rate limit exceeded"
			}],
			"message": "Retry after the GitHub rate limit window resets or use a token with a higher allowance."
		}]
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.github.com/en/rest",
		"kind": "docs"
	}],
	default_namespace: "github_rest"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/discord-api.json
var discord_api_default = {
	slug: "discord-api",
	display_name: "Discord API",
	description: "Discord HTTP API imported from Discord's official OpenAPI spec",
	category: "comms",
	icon_url: "/plugin-icons/discord-api.svg",
	kind: "api",
	skill: { "slug": "discord-api" },
	default_namespace: "discord_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://discord.com/api/v10",
		"api_allowed_hosts": ["discord.com"],
		"api_spec_url": "https://raw.githubusercontent.com/discord/discord-api-spec/refs/heads/main/specs/openapi.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "DISCORD_BOT_TOKEN",
			"secret_name": "discord_bot_token",
			"header_name": "Authorization",
			"prefix": "Bot "
		}
	},
	auth: {
		"method": "bearer",
		"header_name": "Authorization",
		"prefix": "Bot ",
		"required_secrets": ["DISCORD_BOT_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "Discord API docs",
			"url": "https://discord.com/developers/docs/intro",
			"kind": "docs"
		}, {
			"label": "Bot token setup",
			"url": "https://discord.com/developers/docs/getting-started",
			"kind": "docs"
		}],
		"base_url": "https://discord.com/api/v10",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "DISCORD_BOT_TOKEN",
			"display_name": "Discord Bot Token",
			"description": "Bot token from the Discord Developer Portal. Harbor sends it as Authorization: Bot <token>.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/discord/discord-api-spec/refs/heads/main/specs/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/users/@me",
			"expected_status": 200,
			"success_message": "Returns the bot user for the configured Discord bot token."
		},
		"failure_hints": [
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "401"
					},
					{
						"kind": "substring",
						"pattern": "Unauthorized"
					},
					{
						"kind": "substring",
						"pattern": "DISCORD_BOT_TOKEN"
					}
				],
				"message": "Set a valid Discord bot token. Harbor sends it as Authorization: Bot <token>, so do not include the Bot prefix in DISCORD_BOT_TOKEN."
			},
			{
				"matchers": [{
					"kind": "substring",
					"pattern": "403"
				}, {
					"kind": "substring",
					"pattern": "Missing Permissions"
				}],
				"message": "Invite the bot to the target server with the scopes and permissions required by the Discord endpoint being called."
			},
			{
				"matchers": [{
					"kind": "substring",
					"pattern": "429"
				}, {
					"kind": "substring",
					"pattern": "rate limit"
				}],
				"message": "Discord rate-limited the request. Retry after the response's retry window and avoid fan-out across guild/channel endpoints."
			}
		]
	},
	links: [{
		"label": "Discord API docs",
		"url": "https://discord.com/developers/docs/intro",
		"kind": "docs"
	}, {
		"label": "OpenAPI spec",
		"url": "https://raw.githubusercontent.com/discord/discord-api-spec/refs/heads/main/specs/openapi.json",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/cloudflare-api.json
var cloudflare_api_default = {
	slug: "cloudflare-api",
	display_name: "Cloudflare API",
	description: "Cloudflare API for token, user, and zone inspection",
	category: "infra",
	kind: "api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.cloudflare.com/client/v4",
		"api_spec_url": "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
		"api_allowed_hosts": ["api.cloudflare.com"],
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "CLOUDFLARE_API_TOKEN",
			"secret_name": "cloudflare_api_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["CLOUDFLARE_API_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API calls",
			"url": "https://developers.cloudflare.com/fundamentals/api/how-to/make-api-calls/",
			"kind": "docs"
		}, {
			"label": "Verify token",
			"url": "https://developers.cloudflare.com/api/resources/user/subresources/tokens/methods/verify/",
			"kind": "docs"
		}],
		"base_url": "https://api.cloudflare.com/client/v4",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "CLOUDFLARE_API_TOKEN",
			"display_name": "Cloudflare API token",
			"description": "Cloudflare API token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/user/tokens/verify",
			"expected_status": 200,
			"success_message": "Returns the current Cloudflare token status."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "authentication"
				}
			],
			"message": "Set a valid `CLOUDFLARE_API_TOKEN`; Harbor sends it as a Bearer token."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "Zone Zone Read"
			}, {
				"kind": "substring",
				"pattern": "permission"
			}],
			"message": "If zone listing fails, add Zone Zone Read permission to the token."
		}]
	},
	links: [{
		"label": "API calls",
		"url": "https://developers.cloudflare.com/fundamentals/api/how-to/make-api-calls/",
		"kind": "docs"
	}],
	default_namespace: "cloudflare"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/gitlab-rest-api.json
var gitlab_rest_api_default = {
	slug: "gitlab-rest-api",
	display_name: "GitLab REST API",
	description: "GitLab REST API for user, project, and instance inspection",
	category: "dev",
	kind: "api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://gitlab.com",
		"api_spec_url": "https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/api/openapi/openapi_v2.yaml",
		"api_allowed_hosts": ["gitlab.com"],
		"api_auth": {
			"method": "header",
			"required": true,
			"env": "GITLAB_TOKEN",
			"secret_name": "gitlab_token",
			"header_name": "PRIVATE-TOKEN"
		}
	},
	auth: {
		"method": "header",
		"header_name": "PRIVATE-TOKEN",
		"required_secrets": ["GITLAB_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "REST API",
			"url": "https://docs.gitlab.com/api/rest/",
			"kind": "docs"
		}, {
			"label": "Authentication",
			"url": "https://docs.gitlab.com/api/rest/authentication/",
			"kind": "docs"
		}],
		"base_url": "https://gitlab.com",
		"auth_mode": "header",
		"required_secrets": [{
			"env": "GITLAB_TOKEN",
			"display_name": "GitLab personal access token",
			"description": "Personal access token Harbor sends as a PRIVATE-TOKEN header.",
			"required": true
		}],
		"spec_url": "https://gitlab.com/gitlab-org/gitlab/-/raw/master/doc/api/openapi/openapi_v2.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/api/v4/user",
			"expected_status": 200,
			"success_message": "Returns the authenticated GitLab user."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "PRIVATE-TOKEN"
				}
			],
			"message": "Set a valid `GITLAB_TOKEN`; Harbor sends it as a PRIVATE-TOKEN header."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "404"
			}, {
				"kind": "substring",
				"pattern": "not found"
			}],
			"message": "Private GitLab resources return 404 when the token cannot see the project or group."
		}]
	},
	links: [{
		"label": "REST API",
		"url": "https://docs.gitlab.com/api/rest/",
		"kind": "docs"
	}],
	default_namespace: "gitlab_rest"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/deepwiki-mcp.json
var deepwiki_mcp_default = {
	slug: "deepwiki-mcp",
	skill: {},
	display_name: "DeepWiki Docs",
	description: "Read GitHub repository wikis and knowledge graphs",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.deepwiki.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://deepwiki.com",
		"kind": "docs"
	}],
	default_namespace: "deepwiki"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/context7-mcp.json
var context7_mcp_default = {
	slug: "context7-mcp",
	skill: {},
	display_name: "Context7 Docs",
	description: "Up-to-date library and framework documentation",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.context7.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://context7.com",
		"kind": "docs"
	}],
	default_namespace: "context7"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/notion-mcp.json
var notion_mcp_default = {
	slug: "notion-mcp",
	skill: {},
	display_name: "Notion MCP",
	description: "Search, read, and update workspace pages and docs via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.notion.com/mcp",
		"mcp_transport": "http",
		"oauth_discovery": {
			"authorization_server": "https://mcp.notion.com",
			"authorization_endpoint": "https://mcp.notion.com/authorize",
			"token_endpoint": "https://mcp.notion.com/token",
			"registration_endpoint": "https://mcp.notion.com/register",
			"scopes_supported": [],
			"has_dynamic_registration": true,
			"token_endpoint_auth_methods_supported": [
				"client_secret_basic",
				"client_secret_post",
				"none"
			],
			"resource": "https://mcp.notion.com/mcp",
			"revocation_endpoint": "https://mcp.notion.com/token"
		}
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	auth_test: {
		"method": "POST",
		"url": "https://mcp.notion.com/mcp",
		"headers": {
			"content-type": "application/json",
			"accept": "application/json, text/event-stream"
		},
		"body": {
			"jsonrpc": "2.0",
			"id": 1,
			"method": "initialize",
			"params": {
				"protocolVersion": "2025-11-25",
				"capabilities": {},
				"clientInfo": {
					"name": "harbor-auth-test",
					"version": "0.0.0"
				}
			}
		},
		"expected_status": 200,
		"auth_template": { "kind": "none" }
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.notion.com/guides/mcp/mcp",
		"kind": "docs"
	}],
	default_namespace: "notion-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/browserbase-mcp.json
var browserbase_mcp_default = {
	slug: "browserbase-mcp",
	display_name: "Browserbase MCP",
	description: "Cloud browser automation via MCP",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.browserbase.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "query",
		"query_param": "browserbaseApiKey",
		"required_secrets": ["BROWSERBASE_API_KEY"]
	},
	default_namespace: "browserbase-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/firecrawl-mcp.json
var firecrawl_mcp_default = {
	slug: "firecrawl-mcp",
	display_name: "Firecrawl MCP",
	description: "Web scraping and crawling via MCP",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.firecrawl.dev/v2/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "bearer",
		"required_secrets": ["FIRECRAWL_API_KEY"]
	},
	default_namespace: "firecrawl-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/linear-mcp.json
var linear_mcp_default = {
	slug: "linear-mcp",
	skill: {},
	display_name: "Linear MCP",
	description: "Issue tracking and project management via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.linear.app/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "linear-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/sentry-mcp.json
var sentry_mcp_default = {
	slug: "sentry-mcp",
	skill: {},
	display_name: "Sentry MCP",
	description: "Error tracking, traces, and issue management via MCP",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.sentry.dev/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "sentry-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/cloudflare-mcp.json
var cloudflare_mcp_default = {
	slug: "cloudflare-mcp",
	skill: {},
	display_name: "Cloudflare MCP",
	description: "Workers, KV, R2, and edge infrastructure via MCP",
	category: "infra",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.cloudflare.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "cloudflare-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/neon-mcp.json
var neon_mcp_default = {
	slug: "neon-mcp",
	skill: {},
	display_name: "Neon MCP",
	description: "Manage Postgres databases, branches, and queries via MCP",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.neon.tech/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	auth_test: {
		"method": "POST",
		"url": "https://mcp.neon.tech/mcp",
		"headers": {
			"content-type": "application/json",
			"accept": "application/json, text/event-stream"
		},
		"body": {
			"jsonrpc": "2.0",
			"id": 1,
			"method": "initialize",
			"params": {
				"protocolVersion": "2025-11-25",
				"capabilities": {},
				"clientInfo": {
					"name": "harbor-auth-test",
					"version": "0.0.0"
				}
			}
		},
		"expected_status": 200,
		"auth_template": { "kind": "none" }
	},
	default_namespace: "neon-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/stripe-mcp.json
var stripe_mcp_default = {
	slug: "stripe-mcp",
	skill: {},
	display_name: "Stripe MCP",
	description: "Payments and billing management via MCP",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.stripe.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "stripe-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/supabase-mcp.json
var supabase_mcp_default = {
	slug: "supabase-mcp",
	skill: {},
	display_name: "Supabase MCP",
	description: "Projects, database, auth, storage, and logs via MCP",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.supabase.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://supabase.com/docs/guides/getting-started/mcp",
		"kind": "docs"
	}],
	default_namespace: "supabase-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/posthog-mcp.json
var posthog_mcp_default = {
	slug: "posthog-mcp",
	skill: {},
	display_name: "PostHog MCP",
	description: "Analytics, feature flags, session replay, and errors via MCP",
	category: "analytics",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.posthog.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://posthog.com/docs/model-context-protocol",
		"kind": "docs"
	}],
	default_namespace: "posthog-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/figma-mcp.json
var figma_mcp_default = {
	slug: "figma-mcp",
	display_name: "Figma MCP",
	description: "Design context, component data, and canvas edits via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.figma.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.figma.com/docs/figma-mcp-server/",
		"kind": "docs"
	}],
	default_namespace: "figma-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/axiom-mcp.json
var axiom_mcp_default = {
	slug: "axiom-mcp",
	skill: {},
	display_name: "Axiom MCP",
	description: "Query, stream, and analyze logs, traces, and event data via MCP",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.axiom.co/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "axiom-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/monday-mcp.json
var monday_mcp_default = {
	slug: "monday-mcp",
	display_name: "Monday.com MCP",
	description: "Boards, items, users, and work OS automation via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.monday.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developer.monday.com/api-reference/docs/mondaycom-mcp-integration",
		"kind": "docs"
	}],
	default_namespace: "monday-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/miro-mcp.json
var miro_mcp_default = {
	slug: "miro-mcp",
	skill: {},
	display_name: "Miro MCP",
	description: "Board context, diagrams, and prototyping workflows via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.miro.com/",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.miro.com/docs/miro-mcp",
		"kind": "docs"
	}],
	default_namespace: "miro-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/calendly-mcp.json
var calendly_mcp_default = {
	slug: "calendly-mcp",
	skill: {},
	display_name: "Calendly MCP",
	description: "Availability, scheduling, and event type workflows via MCP",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.calendly.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developer.calendly.com/calendly-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "calendly-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/attio-mcp.json
var attio_mcp_default = {
	slug: "attio-mcp",
	display_name: "Attio MCP",
	description: "CRM search, records, and workspace operations via MCP",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.attio.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.attio.com/mcp/overview",
		"kind": "docs"
	}],
	default_namespace: "attio-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/make-mcp.json
var make_mcp_default = {
	slug: "make-mcp",
	display_name: "Make MCP",
	description: "Run scenarios and manage automations via MCP",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.make.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.make.com/mcp-server/",
		"kind": "docs"
	}],
	default_namespace: "make-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/pylon-mcp.json
var pylon_mcp_default = {
	slug: "pylon-mcp",
	display_name: "Pylon MCP",
	description: "Customer support issues, accounts, and contacts via MCP",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.usepylon.com/",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.usepylon.com/pylon-docs/integrations/mcp",
		"kind": "docs"
	}],
	default_namespace: "pylon-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/hex-mcp.json
var hex_mcp_default = {
	slug: "hex-mcp",
	skill: {},
	display_name: "Hex MCP",
	description: "Search projects and run data threads in Hex via MCP",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://app.hex.tech/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://learn.hex.tech/docs/api-integrations/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "hex-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/incidentio-mcp.json
var incidentio_mcp_default = {
	slug: "incidentio-mcp",
	display_name: "incident.io MCP",
	description: "Incidents, alerts, on-call, and operational analysis via MCP",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.incident.io/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.incident.io/ai/remote-mcp",
		"kind": "docs"
	}],
	default_namespace: "incidentio-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/ahrefs-mcp.json
var ahrefs_mcp_default = {
	slug: "ahrefs-mcp",
	skill: {},
	display_name: "Ahrefs MCP",
	description: "SEO, keyword, backlink, and site data via MCP",
	category: "analytics",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.ahrefs.com/mcp/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.ahrefs.com/docs/mcp/introduction",
		"kind": "docs"
	}],
	default_namespace: "ahrefs-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/bitly-mcp.json
var bitly_mcp_default = {
	slug: "bitly-mcp",
	display_name: "Bitly MCP",
	description: "Short links, QR codes, and click analytics via MCP",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api-ssl.bitly.com/v4/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://dev.bitly.com/bitly-mcp/",
		"kind": "docs"
	}],
	default_namespace: "bitly-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/tavily-mcp.json
var tavily_mcp_default = {
	slug: "tavily-mcp",
	skill: {},
	display_name: "Tavily MCP",
	description: "Search, extract, map, and crawl the web via MCP",
	category: "search",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.tavily.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.tavily.com/documentation/mcp",
		"kind": "docs"
	}],
	default_namespace: "tavily-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/replicate-mcp.json
var replicate_mcp_default = {
	slug: "replicate-mcp",
	skill: {},
	display_name: "Replicate MCP",
	description: "Discover, compare, and run AI models via MCP (requires OAuth sign-in)",
	category: "media",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.replicate.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	auth_test: {
		"method": "POST",
		"url": "https://mcp.replicate.com/mcp",
		"headers": {
			"content-type": "application/json",
			"accept": "application/json, text/event-stream"
		},
		"body": {
			"jsonrpc": "2.0",
			"id": 1,
			"method": "initialize",
			"params": {
				"protocolVersion": "2025-11-25",
				"capabilities": {},
				"clientInfo": {
					"name": "harbor-auth-test",
					"version": "0.0.0"
				}
			}
		},
		"expected_status": 200,
		"auth_template": { "kind": "none" }
	},
	links: [{
		"label": "Docs",
		"url": "https://replicate.com/docs/reference/mcp",
		"kind": "docs"
	}],
	default_namespace: "replicate-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/granola-mcp.json
var granola_mcp_default = {
	slug: "granola-mcp",
	display_name: "Granola MCP",
	description: "Meeting notes, transcripts, and insights via MCP",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.granola.ai/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.granola.ai/help-center/sharing/integrations/mcp",
		"kind": "docs"
	}],
	default_namespace: "granola-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/sanity-mcp.json
var sanity_mcp_default = {
	slug: "sanity-mcp",
	display_name: "Sanity MCP",
	description: "Schemas, documents, datasets, and content operations via MCP",
	category: "storage",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.sanity.io",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://www.sanity.io/docs/ai/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "sanity-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/amplitude-mcp.json
var amplitude_mcp_default = {
	slug: "amplitude-mcp",
	display_name: "Amplitude MCP",
	description: "Product analytics, user behavior data, and cohorts",
	category: "analytics",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.amplitude.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "amplitude-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/mixpanel-mcp.json
var mixpanel_mcp_default = {
	slug: "mixpanel-mcp",
	skill: {},
	display_name: "Mixpanel MCP",
	description: "Event analytics, funnels, retention, and user insights",
	category: "analytics",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.mixpanel.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "mixpanel-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/apify-mcp.json
var apify_mcp_default = {
	slug: "apify-mcp",
	display_name: "Apify MCP",
	description: "Web scraping, automation, and data extraction actors",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.apify.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.apify.com/platform/integrations/mcp",
		"kind": "docs"
	}],
	default_namespace: "apify-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/jina-mcp.json
var jina_mcp_default = {
	slug: "jina-mcp",
	skill: {},
	display_name: "Jina AI MCP",
	description: "Web reading, search, and content extraction",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.jina.ai/v1",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://mcp.jina.ai",
		"kind": "docs"
	}],
	default_namespace: "jina-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/scrapingbee-mcp.json
var scrapingbee_mcp_default = {
	slug: "scrapingbee-mcp",
	display_name: "ScrapingBee MCP",
	description: "Web scraping with JS rendering and proxy rotation",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.scrapingbee.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://mcp.scrapingbee.com",
		"kind": "docs"
	}],
	default_namespace: "scrapingbee-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/brightdata-mcp.json
var brightdata_mcp_default = {
	slug: "brightdata-mcp",
	display_name: "Bright Data MCP",
	description: "Web scraping, data collection, and proxy infrastructure",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.brightdata.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "brightdata-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/github-mcp.json
var github_mcp_default = {
	slug: "github-mcp",
	display_name: "GitHub MCP",
	description: "Repositories, issues, PRs, code search, and CI/CD workflows",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.githubcopilot.com/mcp/",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.github.com/en/copilot/tutorials/using-github-mcp",
		"kind": "docs"
	}],
	default_namespace: "github-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/atlassian-mcp.json
var atlassian_mcp_default = {
	slug: "atlassian-mcp",
	display_name: "Atlassian MCP",
	description: "Jira issues, Confluence pages, and Bitbucket repositories",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.atlassian.com/v1/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developer.atlassian.com/cloud/mcp",
		"kind": "docs"
	}],
	default_namespace: "atlassian-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/vercel-mcp.json
var vercel_mcp_default = {
	slug: "vercel-mcp",
	display_name: "Vercel MCP",
	description: "Deployments, projects, domains, and environment variables",
	category: "infra",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.vercel.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://vercel.com/docs/mcp",
		"kind": "docs"
	}],
	default_namespace: "vercel-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/digitalocean-mcp.json
var digitalocean_mcp_default = {
	slug: "digitalocean-mcp",
	skill: {},
	display_name: "DigitalOcean MCP",
	description: "App Platform, Kubernetes, networking, and infrastructure",
	category: "infra",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://apps.mcp.digitalocean.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.digitalocean.com/products/mcp",
		"kind": "docs"
	}],
	default_namespace: "digitalocean-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/digitalocean-api.json
var digitalocean_api_default = {
	slug: "digitalocean-api",
	display_name: "DigitalOcean API",
	description: "DigitalOcean API for account, droplets, projects, and regions",
	category: "infra",
	kind: "api",
	icon_url: "/plugin-icons/digitalocean-mcp.svg",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.digitalocean.com",
		"api_allowed_hosts": ["api.digitalocean.com"],
		"api_spec_url": "https://raw.githubusercontent.com/digitalocean/openapi/main/specification/DigitalOcean-public.v2.yaml",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "DIGITALOCEAN_TOKEN",
			"secret_name": "digitalocean_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["DIGITALOCEAN_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API Overview",
			"url": "https://docs.digitalocean.com/reference/api/",
			"kind": "docs"
		}, {
			"label": "Account scope",
			"url": "https://docs.digitalocean.com/reference/api/scopes/account/",
			"kind": "docs"
		}],
		"base_url": "https://api.digitalocean.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "DIGITALOCEAN_TOKEN",
			"display_name": "DigitalOcean token",
			"description": "Personal access token Harbor sends as a Bearer token to the DigitalOcean API.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/digitalocean/openapi/main/specification/DigitalOcean-public.v2.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v2/account",
			"expected_status": 200,
			"success_message": "Returns the authenticated DigitalOcean account."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "invalid token"
				},
				{
					"kind": "substring",
					"pattern": "DIGITALOCEAN_TOKEN"
				}
			],
			"message": "Set a valid `DIGITALOCEAN_TOKEN`; Harbor forwards it as a Bearer token."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "Forbidden"
				},
				{
					"kind": "substring",
					"pattern": "account:read"
				},
				{
					"kind": "substring",
					"pattern": "api:read"
				}
			],
			"message": "Grant the token account read access and the API read scopes needed by the endpoints you want to use."
		}]
	},
	links: [{
		"label": "API Overview",
		"url": "https://docs.digitalocean.com/reference/api/",
		"kind": "docs"
	}, {
		"label": "Account scope",
		"url": "https://docs.digitalocean.com/reference/api/scopes/account/",
		"kind": "docs"
	}],
	default_namespace: "digitalocean_api"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/asana-api.json
var asana_api_default = {
	slug: "asana-api",
	display_name: "Asana API",
	description: "Asana REST API for workspaces, users, projects, and teams",
	category: "dev",
	kind: "api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://app.asana.com/api/1.0",
		"api_allowed_hosts": ["app.asana.com"],
		"api_spec_url": "https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "ASANA_ACCESS_TOKEN",
			"secret_name": "asana_access_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["ASANA_ACCESS_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://developers.asana.com/reference/rest-api-reference",
			"kind": "docs"
		}, {
			"label": "Personal access token",
			"url": "https://developers.asana.com/docs/personal-access-token",
			"kind": "docs"
		}],
		"base_url": "https://app.asana.com/api/1.0",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "ASANA_ACCESS_TOKEN",
			"display_name": "Asana personal access token",
			"description": "Personal access token Harbor sends as a Bearer token to the Asana API.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/workspaces?limit=1",
			"expected_status": 200,
			"success_message": "Returns the workspaces visible to the authenticated Asana user."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "ASANA_ACCESS_TOKEN"
				},
				{
					"kind": "substring",
					"pattern": "invalid token"
				}
			],
			"message": "Set a valid `ASANA_ACCESS_TOKEN`; Harbor forwards it as a Bearer token to Asana."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "Forbidden"
				},
				{
					"kind": "substring",
					"pattern": "workspace"
				},
				{
					"kind": "substring",
					"pattern": "not authorized"
				}
			],
			"message": "Make sure the PAT belongs to an Asana account that can see the workspace or project you are querying."
		}]
	},
	links: [{
		"label": "API reference",
		"url": "https://developers.asana.com/reference/rest-api-reference",
		"kind": "docs"
	}, {
		"label": "Personal access token",
		"url": "https://developers.asana.com/docs/personal-access-token",
		"kind": "docs"
	}],
	default_namespace: "asana_api"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/twilio-api.json
var twilio_api_default = {
	slug: "twilio-api",
	display_name: "Twilio API",
	description: "Twilio REST API for accounts and phone-number inspection",
	category: "comms",
	kind: "api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.twilio.com",
		"api_allowed_hosts": ["api.twilio.com"],
		"api_spec_url": "https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_api_v2010.json",
		"api_auth": {
			"method": "basic",
			"required": true,
			"username_env": "TWILIO_ACCOUNT_SID",
			"username_secret_name": "twilio_account_sid",
			"password_env": "TWILIO_AUTH_TOKEN",
			"password_secret_name": "twilio_auth_token"
		}
	},
	auth: {
		"method": "basic",
		"required_secrets": ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API basics",
			"url": "https://www.twilio.com/docs/iam/api/",
			"kind": "docs"
		}, {
			"label": "Auth Token",
			"url": "https://www.twilio.com/docs/iam/api/authtoken",
			"kind": "docs"
		}],
		"base_url": "https://api.twilio.com",
		"auth_mode": "basic",
		"required_secrets": [{
			"env": "TWILIO_ACCOUNT_SID",
			"display_name": "Twilio Account SID",
			"description": "Account SID Harbor uses as the Basic auth username for Twilio REST.",
			"required": true
		}, {
			"env": "TWILIO_AUTH_TOKEN",
			"display_name": "Twilio Auth Token",
			"description": "Auth Token Harbor uses as the Basic auth password for Twilio REST.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_api_v2010.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/2010-04-01/Accounts.json?PageSize=1",
			"expected_status": 200,
			"success_message": "Lists the Twilio accounts visible to the authenticated account."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "TWILIO_AUTH_TOKEN"
				},
				{
					"kind": "substring",
					"pattern": "accountSid_authToken"
				}
			],
			"message": "Set a valid `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`; Harbor sends them as HTTP Basic auth."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "404"
				},
				{
					"kind": "substring",
					"pattern": "not found"
				},
				{
					"kind": "substring",
					"pattern": "subaccount"
				},
				{
					"kind": "substring",
					"pattern": "Account SID"
				}
			],
			"message": "Use an Account SID that the authenticated Twilio account can actually see, especially for subaccount-scoped reads."
		}]
	},
	links: [{
		"label": "API basics",
		"url": "https://www.twilio.com/docs/iam/api/",
		"kind": "docs"
	}, {
		"label": "Auth Token",
		"url": "https://www.twilio.com/docs/iam/api/authtoken",
		"kind": "docs"
	}],
	default_namespace: "twilio_api"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/axiom-api.json
var axiom_api_default = {
	slug: "axiom-api",
	display_name: "Axiom API",
	description: "Query datasets, monitors, and account state via the Axiom REST API",
	category: "observability",
	kind: "api",
	default_namespace: "axiom_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.axiom.co/v2",
		"api_allowed_hosts": ["api.axiom.co"],
		"api_spec_url": "https://axiom.co/docs/restapi/versions/v2.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "AXIOM_TOKEN",
			"secret_name": "axiom_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["AXIOM_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://axiom.co/docs/restapi/introduction",
			"kind": "docs"
		}, {
			"label": "Tokens",
			"url": "https://axiom.co/docs/reference/tokens",
			"kind": "docs"
		}],
		"base_url": "https://api.axiom.co/v2",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "AXIOM_TOKEN",
			"display_name": "Axiom API token",
			"description": "Axiom API token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://axiom.co/docs/restapi/versions/v2.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/user",
			"expected_status": 200,
			"success_message": "Returns the authenticated Axiom user."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "invalid token"
				},
				{
					"kind": "substring",
					"pattern": "AXIOM_TOKEN"
				}
			],
			"message": "Set a valid `AXIOM_TOKEN`; Harbor forwards it as a Bearer token."
		}, {
			"matchers": [
				{
					"kind": "substring",
					"pattern": "datasets|read"
				},
				{
					"kind": "substring",
					"pattern": "monitors|read"
				},
				{
					"kind": "substring",
					"pattern": "x-axiom-org-id"
				}
			],
			"message": "Grant the token the dataset and monitor read permissions needed by the read/list tools; PATs may also need the Axiom organization ID upstream."
		}]
	}
};
//#endregion
//#region ../registry-catalog/data/v1/entries/resend-api.json
var resend_api_default = {
	slug: "resend-api",
	display_name: "Resend API",
	description: "Inspect domains and API key state via the Resend REST API",
	category: "comms",
	kind: "api",
	default_namespace: "resend_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.resend.com",
		"api_allowed_hosts": ["api.resend.com"],
		"api_spec_url": "https://raw.githubusercontent.com/resend/resend-openapi/main/resend.yaml",
		"api_default_headers": { "User-Agent": "Harbor/1.0" },
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "RESEND_API_KEY",
			"secret_name": "resend_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["RESEND_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://resend.com/docs/api-reference/introduction",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://resend.com/docs/dashboard/api-keys/introduction",
			"kind": "docs"
		}],
		"base_url": "https://api.resend.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "RESEND_API_KEY",
			"display_name": "Resend API key",
			"description": "Resend API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/resend/resend-openapi/main/resend.yaml",
		"default_headers": { "User-Agent": "Harbor/1.0" },
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/domains",
			"expected_status": 200,
			"success_message": "Returns the authenticated Resend domains."
		},
		"failure_hints": [
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "401"
					},
					{
						"kind": "substring",
						"pattern": "403"
					},
					{
						"kind": "substring",
						"pattern": "invalid API key"
					},
					{
						"kind": "substring",
						"pattern": "RESEND_API_KEY"
					}
				],
				"message": "Set a valid `RESEND_API_KEY`; Harbor forwards it as a Bearer token."
			},
			{
				"matchers": [
					{
						"kind": "substring",
						"pattern": "1010"
					},
					{
						"kind": "substring",
						"pattern": "User-Agent"
					},
					{
						"kind": "substring",
						"pattern": "missing"
					}
				],
				"message": "Resend rejects requests without a `User-Agent` header; Harbor sets one on this entry."
			},
			{
				"matchers": [{
					"kind": "substring",
					"pattern": "sending access"
				}, {
					"kind": "substring",
					"pattern": "full access"
				}],
				"message": "Use a full-access Resend API key if you need domain or API-key inspection; sending-access keys are send-only."
			}
		]
	}
};
//#endregion
//#region ../registry-catalog/data/v1/entries/openrouter-api.json
var openrouter_api_default = {
	slug: "openrouter-api",
	display_name: "OpenRouter API",
	description: "List models, inspect credits, and call OpenRouter-compatible AI endpoints",
	category: "ai",
	kind: "api",
	icon_url: "/plugin-icons/openrouter-mcp.png",
	default_namespace: "openrouter_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://openrouter.ai/api/v1",
		"api_allowed_hosts": ["openrouter.ai"],
		"api_spec_url": "https://openrouter.ai/openapi.json",
		"api_default_headers": {
			"HTTP-Referer": "https://tryharbor.ai",
			"X-Title": "Harbor"
		},
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "OPENROUTER_API_KEY",
			"secret_name": "openrouter_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["OPENROUTER_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://openrouter.ai/docs/api-reference/overview",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://openrouter.ai/settings/keys",
			"kind": "docs"
		}],
		"base_url": "https://openrouter.ai/api/v1",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "OPENROUTER_API_KEY",
			"display_name": "OpenRouter API key",
			"description": "OpenRouter API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://openrouter.ai/openapi.json",
		"default_headers": {
			"HTTP-Referer": "https://tryharbor.ai",
			"X-Title": "Harbor"
		},
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/credits",
			"expected_status": 200,
			"success_message": "Returns the authenticated OpenRouter credit balance."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "No auth credentials found"
				},
				{
					"kind": "substring",
					"pattern": "OPENROUTER_API_KEY"
				}
			],
			"message": "Set a valid `OPENROUTER_API_KEY`; Harbor forwards it as a Bearer token."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "402"
			}, {
				"kind": "substring",
				"pattern": "credits"
			}],
			"message": "The OpenRouter key is valid but the account may need credits for model invocation."
		}]
	}
};
//#endregion
//#region ../registry-catalog/data/v1/entries/openai-api.json
var openai_api_default = {
	slug: "openai-api",
	display_name: "OpenAI API",
	description: "OpenAI API for models, Responses, and embeddings",
	category: "ai",
	kind: "api",
	icon_url: "/plugin-icons/openai-api.svg",
	default_namespace: "openai_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.openai.com/v1",
		"api_allowed_hosts": ["api.openai.com"],
		"api_spec_url": "https://app.stainless.com/api/spec/documented/openai/openapi.documented.yml",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "OPENAI_API_KEY",
			"secret_name": "openai_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["OPENAI_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://platform.openai.com/docs/api-reference",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://platform.openai.com/api-keys",
			"kind": "dashboard"
		}],
		"base_url": "https://api.openai.com/v1",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "OPENAI_API_KEY",
			"display_name": "OpenAI API key",
			"description": "OpenAI API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://app.stainless.com/api/spec/documented/openai/openapi.documented.yml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/models",
			"expected_status": 200,
			"success_message": "Returns models visible to the OpenAI key."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Incorrect API key"
			}],
			"message": "Set a valid `OPENAI_API_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://platform.openai.com/docs/api-reference",
		"kind": "docs"
	}, {
		"label": "Dashboard",
		"url": "https://platform.openai.com",
		"kind": "dashboard"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/anthropic-api.json
var anthropic_api_default = {
	slug: "anthropic-api",
	display_name: "Anthropic API",
	description: "Anthropic Claude API for messages, models, batches, and files",
	category: "ai",
	kind: "api",
	icon_url: "/plugin-icons/anthropic-api.png",
	default_namespace: "anthropic_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.anthropic.com/v1",
		"api_allowed_hosts": ["api.anthropic.com"],
		"api_spec_url": "https://app.stainless.com/api/spec/documented/anthropic/openapi.documented.yml",
		"api_default_headers": { "anthropic-version": "2023-06-01" },
		"api_auth": {
			"method": "header",
			"required": true,
			"env": "ANTHROPIC_API_KEY",
			"secret_name": "anthropic_api_key",
			"header_name": "x-api-key"
		}
	},
	auth: {
		"method": "header",
		"header_name": "x-api-key",
		"required_secrets": ["ANTHROPIC_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.anthropic.com/en/api/overview",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://console.anthropic.com/settings/keys",
			"kind": "dashboard"
		}],
		"base_url": "https://api.anthropic.com/v1",
		"auth_mode": "header",
		"required_secrets": [{
			"env": "ANTHROPIC_API_KEY",
			"display_name": "Anthropic API key",
			"description": "Anthropic API key Harbor sends in the x-api-key header.",
			"required": true
		}],
		"spec_url": "https://app.stainless.com/api/spec/documented/anthropic/openapi.documented.yml",
		"default_headers": { "anthropic-version": "2023-06-01" },
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/models",
			"expected_status": 200,
			"success_message": "Returns Anthropic models visible to the API key."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "invalid"
				}
			],
			"message": "Set a valid `ANTHROPIC_API_KEY`; Harbor forwards it in the `x-api-key` header with the Anthropic API version header."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.anthropic.com/en/api/overview",
		"kind": "docs"
	}, {
		"label": "Dashboard",
		"url": "https://console.anthropic.com",
		"kind": "dashboard"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/xai-api.json
var xai_api_default = {
	slug: "xai-api",
	display_name: "xAI API",
	description: "xAI REST API for chat, responses, embeddings, image generation, and model metadata",
	category: "ai",
	kind: "api",
	icon_url: "/plugin-icons/xai-api.svg",
	default_namespace: "xai_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.x.ai",
		"api_allowed_hosts": ["api.x.ai"],
		"api_spec_url": "https://api.x.ai/api-docs/openapi.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "XAI_API_KEY",
			"secret_name": "xai_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["XAI_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.x.ai/docs",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://console.x.ai",
			"kind": "dashboard"
		}],
		"base_url": "https://api.x.ai",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "XAI_API_KEY",
			"display_name": "xAI API key",
			"description": "xAI API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://api.x.ai/api-docs/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/models",
			"expected_status": 200,
			"success_message": "Returns xAI models visible to the API key."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				}
			],
			"message": "Set a valid `XAI_API_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.x.ai/docs",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/perplexity-api.json
var perplexity_api_default = {
	slug: "perplexity-api",
	display_name: "Perplexity API",
	description: "Perplexity Sonar API for models, search, and web-grounded responses",
	category: "ai",
	kind: "api",
	icon_url: "/plugin-icons/perplexity-api.svg",
	default_namespace: "perplexity_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.perplexity.ai",
		"api_allowed_hosts": ["api.perplexity.ai"],
		"api_spec_url": "https://docs.perplexity.ai/openapi.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "PERPLEXITY_API_KEY",
			"secret_name": "perplexity_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["PERPLEXITY_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.perplexity.ai",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://www.perplexity.ai/settings/api",
			"kind": "dashboard"
		}],
		"base_url": "https://api.perplexity.ai",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "PERPLEXITY_API_KEY",
			"display_name": "Perplexity API key",
			"description": "Perplexity API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://docs.perplexity.ai/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/models",
			"expected_status": 200,
			"success_message": "Returns Perplexity models visible to the API key."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "invalid"
			}],
			"message": "Set a valid `PERPLEXITY_API_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.perplexity.ai",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/x-api.json
var x_api_default = {
	slug: "x-api",
	display_name: "X API",
	description: "X API v2 endpoints converted from the official Postman collection",
	category: "comms",
	kind: "api",
	icon_url: "/plugin-icons/x-api.svg",
	default_namespace: "x_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.x.com",
		"api_allowed_hosts": ["api.x.com"],
		"api_spec_url": "https://api.tryharbor.ai/openapi/x-api-v2.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "X_ACCESS_TOKEN",
			"secret_name": "x_access_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["X_ACCESS_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.x.com/x-api",
			"kind": "docs"
		}, {
			"label": "Developer portal",
			"url": "https://developer.x.com/en/portal/dashboard",
			"kind": "dashboard"
		}],
		"base_url": "https://api.x.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "X_ACCESS_TOKEN",
			"display_name": "X access token",
			"description": "X API Bearer token. Use an app-only bearer token for public read endpoints, or an OAuth 2.0 user access token with the required scopes for user-context/write endpoints.",
			"required": true
		}],
		"spec_url": "https://api.tryharbor.ai/openapi/x-api-v2.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/2/users/by/username/xdevelopers",
			"expected_status": 200,
			"success_message": "Returns the public @XDevelopers user, matching X's first-request guide."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "403"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				}
			],
			"message": "Set a valid `X_ACCESS_TOKEN`; Harbor forwards it as a Bearer token. Public reads can use an app-only bearer token; user-context and write endpoints need an OAuth 2.0 user access token with the endpoint's required scopes."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.x.com/x-api",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/open-meteo-api.json
var open_meteo_api_default = {
	slug: "open-meteo-api",
	display_name: "Open-Meteo API",
	description: "Official Open-Meteo weather forecast API imported from its OpenAPI spec",
	category: "data",
	kind: "api",
	default_namespace: "open_meteo",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.open-meteo.com",
		"api_allowed_hosts": ["api.open-meteo.com"],
		"api_spec_url": "https://raw.githubusercontent.com/open-meteo/open-meteo/main/openapi.yml",
		"api_auth": {
			"method": "none",
			"required": false
		}
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://open-meteo.com/en/docs",
			"kind": "docs"
		}],
		"base_url": "https://api.open-meteo.com",
		"auth_mode": "none",
		"required_secrets": [],
		"spec_url": "https://raw.githubusercontent.com/open-meteo/open-meteo/main/openapi.yml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/forecast",
			"query": {
				"latitude": "52.52",
				"longitude": "13.41",
				"current": "temperature_2m"
			},
			"expected_status": 200,
			"success_message": "Returns a public Open-Meteo forecast response."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "400"
			}],
			"message": "Check the latitude, longitude, and forecast parameters sent to Open-Meteo."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://open-meteo.com/en/docs",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/polymarket-gamma-api.json
var polymarket_gamma_api_default = {
	slug: "polymarket-gamma-api",
	display_name: "Polymarket Gamma API",
	description: "Official Polymarket Gamma API imported from its OpenAPI spec",
	category: "data",
	kind: "api",
	default_namespace: "polymarket_gamma",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://gamma-api.polymarket.com",
		"api_allowed_hosts": ["gamma-api.polymarket.com"],
		"api_spec_url": "https://gamma-api.polymarket.com/openapi.json",
		"api_auth": {
			"method": "none",
			"required": false
		}
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.polymarket.com",
			"kind": "docs"
		}],
		"base_url": "https://gamma-api.polymarket.com",
		"auth_mode": "none",
		"required_secrets": [],
		"spec_url": "https://gamma-api.polymarket.com/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/spotlights",
			"expected_status": 200,
			"success_message": "Returns public Polymarket Gamma spotlight data."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "429"
			}],
			"message": "Polymarket Gamma is public but may rate-limit anonymous requests; retry later."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.polymarket.com",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/kalshi-api.json
var kalshi_api_default = {
	slug: "kalshi-api",
	display_name: "Kalshi API",
	description: "Official Kalshi Trade API imported from its OpenAPI spec",
	category: "data",
	kind: "api",
	default_namespace: "kalshi_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.elections.kalshi.com/trade-api/v2",
		"api_allowed_hosts": ["api.elections.kalshi.com"],
		"api_spec_url": "https://docs.kalshi.com/openapi.yaml",
		"api_auth": {
			"method": "none",
			"required": false
		}
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.kalshi.com",
			"kind": "docs"
		}],
		"base_url": "https://api.elections.kalshi.com/trade-api/v2",
		"auth_mode": "none",
		"required_secrets": [],
		"spec_url": "https://docs.kalshi.com/openapi.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/exchange/status",
			"expected_status": 200,
			"success_message": "Returns the public Kalshi exchange status."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "403"
			}],
			"message": "Public Kalshi endpoints should not require credentials; authenticated endpoints may require Kalshi API keys outside this no-secret setup."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.kalshi.com",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/browser-use-api.json
var browser_use_api_default = {
	slug: "browser-use-api",
	display_name: "Browser-use API",
	description: "Official Browser-use Cloud API imported from its OpenAPI spec",
	category: "web",
	kind: "api",
	default_namespace: "browser_use_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.browser-use.com/api/v3",
		"api_allowed_hosts": ["api.browser-use.com"],
		"api_spec_url": "https://docs.browser-use.com/cloud/openapi/v3.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "BROWSER_USE_API_KEY",
			"secret_name": "browser_use_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["BROWSER_USE_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.browser-use.com/cloud",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://cloud.browser-use.com",
			"kind": "dashboard"
		}],
		"base_url": "https://api.browser-use.com/api/v3",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "BROWSER_USE_API_KEY",
			"display_name": "Browser-use API key",
			"description": "Browser-use Cloud API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://docs.browser-use.com/cloud/openapi/v3.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/sessions",
			"expected_status": 200,
			"success_message": "Returns Browser-use Cloud sessions visible to the API key."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "403"
			}],
			"message": "Set a valid `BROWSER_USE_API_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.browser-use.com/cloud",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/stripe-api.json
var stripe_api_default = {
	slug: "stripe-api",
	display_name: "Stripe API",
	description: "Official Stripe API imported from Stripe's OpenAPI spec",
	category: "data",
	kind: "api",
	default_namespace: "stripe_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.stripe.com",
		"api_allowed_hosts": ["api.stripe.com"],
		"api_spec_url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "STRIPE_SECRET_KEY",
			"secret_name": "stripe_secret_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["STRIPE_SECRET_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://docs.stripe.com/api",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://dashboard.stripe.com/apikeys",
			"kind": "dashboard"
		}],
		"base_url": "https://api.stripe.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "STRIPE_SECRET_KEY",
			"display_name": "Stripe secret key",
			"description": "Stripe secret key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/account",
			"expected_status": 200,
			"success_message": "Returns the Stripe account for the secret key."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Invalid API Key"
			}],
			"message": "Set a valid `STRIPE_SECRET_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API reference",
		"url": "https://docs.stripe.com/api",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/vercel-api.json
var vercel_api_default = {
	slug: "vercel-api",
	display_name: "Vercel API",
	description: "Official Vercel REST API imported from Vercel's OpenAPI spec",
	category: "dev",
	kind: "api",
	default_namespace: "vercel_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.vercel.com",
		"api_allowed_hosts": ["api.vercel.com"],
		"api_spec_url": "https://openapi.vercel.sh/",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "VERCEL_TOKEN",
			"secret_name": "vercel_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["VERCEL_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API reference",
			"url": "https://vercel.com/docs/rest-api",
			"kind": "docs"
		}, {
			"label": "Tokens",
			"url": "https://vercel.com/account/tokens",
			"kind": "dashboard"
		}],
		"base_url": "https://api.vercel.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "VERCEL_TOKEN",
			"display_name": "Vercel token",
			"description": "Vercel token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://openapi.vercel.sh/",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v2/user",
			"expected_status": 200,
			"success_message": "Returns the authenticated Vercel user."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Unauthorized"
			}],
			"message": "Set a valid `VERCEL_TOKEN`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API reference",
		"url": "https://vercel.com/docs/rest-api",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/sentry-api.json
var sentry_api_default = {
	slug: "sentry-api",
	display_name: "Sentry API",
	description: "Official Sentry REST API imported from Sentry's OpenAPI schema",
	category: "observability",
	kind: "api",
	default_namespace: "sentry_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://sentry.io",
		"api_allowed_hosts": [
			"sentry.io",
			"us.sentry.io",
			"de.sentry.io"
		],
		"api_spec_url": "https://raw.githubusercontent.com/getsentry/sentry-api-schema/main/openapi-derefed.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "SENTRY_AUTH_TOKEN",
			"secret_name": "sentry_auth_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["SENTRY_AUTH_TOKEN"]
	},
	auth_test: {
		"method": "GET",
		"url": "https://sentry.io/api/0/organizations/",
		"expected_status": 200,
		"auth_template": {
			"kind": "header",
			"header_name": "Authorization",
			"value_template": "Bearer ${secret}",
			"secret_slot": "SENTRY_AUTH_TOKEN"
		}
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.sentry.io/api/",
			"kind": "docs"
		}, {
			"label": "Auth tokens",
			"url": "https://sentry.io/settings/account/api/auth-tokens/",
			"kind": "dashboard"
		}],
		"base_url": "https://sentry.io",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "SENTRY_AUTH_TOKEN",
			"display_name": "Sentry auth token",
			"description": "Sentry user auth token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/getsentry/sentry-api-schema/main/openapi-derefed.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/api/0/organizations/",
			"expected_status": 200,
			"success_message": "Returns Sentry organizations visible to the auth token."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "403"
			}],
			"message": "Set a valid `SENTRY_AUTH_TOKEN` with access to the target Sentry organization."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.sentry.io/api/",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/figma-api.json
var figma_api_default = {
	slug: "figma-api",
	display_name: "Figma API",
	description: "Official Figma REST API imported from Figma's OpenAPI spec",
	category: "dev",
	kind: "api",
	default_namespace: "figma_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.figma.com",
		"api_allowed_hosts": ["api.figma.com"],
		"api_spec_url": "https://raw.githubusercontent.com/figma/rest-api-spec/main/openapi/openapi.yaml",
		"api_auth": {
			"method": "header",
			"required": true,
			"env": "FIGMA_TOKEN",
			"secret_name": "figma_token",
			"header_name": "X-Figma-Token"
		}
	},
	auth: {
		"method": "header",
		"header_name": "X-Figma-Token",
		"required_secrets": ["FIGMA_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://www.figma.com/developers/api",
			"kind": "docs"
		}, {
			"label": "Account settings",
			"url": "https://www.figma.com/settings",
			"kind": "dashboard"
		}],
		"base_url": "https://api.figma.com",
		"auth_mode": "header",
		"required_secrets": [{
			"env": "FIGMA_TOKEN",
			"display_name": "Figma token",
			"description": "Figma personal access token Harbor sends in the X-Figma-Token header.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/figma/rest-api-spec/main/openapi/openapi.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/me",
			"expected_status": 200,
			"success_message": "Returns the authenticated Figma user."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "403"
			}, {
				"kind": "substring",
				"pattern": "Invalid token"
			}],
			"message": "Set a valid `FIGMA_TOKEN`; Harbor sends it in the X-Figma-Token header."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://www.figma.com/developers/api",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/supabase-api.json
var supabase_api_default = {
	slug: "supabase-api",
	display_name: "Supabase Management API",
	description: "Official Supabase Management API imported from Supabase's OpenAPI spec",
	category: "dev",
	kind: "api",
	default_namespace: "supabase_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.supabase.com",
		"api_allowed_hosts": ["api.supabase.com"],
		"api_spec_url": "https://api.supabase.com/api/v1-json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "SUPABASE_ACCESS_TOKEN",
			"secret_name": "supabase_access_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["SUPABASE_ACCESS_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "Management API docs",
			"url": "https://supabase.com/docs/reference/api/introduction",
			"kind": "docs"
		}, {
			"label": "Access tokens",
			"url": "https://supabase.com/dashboard/account/tokens",
			"kind": "dashboard"
		}],
		"base_url": "https://api.supabase.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "SUPABASE_ACCESS_TOKEN",
			"display_name": "Supabase access token",
			"description": "Supabase Management API access token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://api.supabase.com/api/v1-json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v1/projects",
			"expected_status": 200,
			"success_message": "Returns Supabase projects visible to the access token."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Invalid API key"
			}],
			"message": "Set a valid `SUPABASE_ACCESS_TOKEN`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "Management API docs",
		"url": "https://supabase.com/docs/reference/api/introduction",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/netlify-api.json
var netlify_api_default = {
	slug: "netlify-api",
	display_name: "Netlify API",
	description: "Official Netlify API imported from Netlify's OpenAPI spec",
	category: "dev",
	kind: "api",
	default_namespace: "netlify_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.netlify.com/api/v1",
		"api_allowed_hosts": ["api.netlify.com"],
		"api_spec_url": "https://open-api.netlify.com/openapi.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "NETLIFY_AUTH_TOKEN",
			"secret_name": "netlify_auth_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["NETLIFY_AUTH_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://docs.netlify.com/api/get-started/",
			"kind": "docs"
		}, {
			"label": "Applications",
			"url": "https://app.netlify.com/user/applications",
			"kind": "dashboard"
		}],
		"base_url": "https://api.netlify.com/api/v1",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "NETLIFY_AUTH_TOKEN",
			"display_name": "Netlify auth token",
			"description": "Netlify personal access token Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://open-api.netlify.com/openapi.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/user",
			"expected_status": 200,
			"success_message": "Returns the authenticated Netlify user."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Unauthorized"
			}],
			"message": "Set a valid `NETLIFY_AUTH_TOKEN`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://docs.netlify.com/api/get-started/",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/sendgrid-api.json
var sendgrid_api_default = {
	slug: "sendgrid-api",
	display_name: "SendGrid Mail API",
	description: "Official Twilio SendGrid Mail API imported from SendGrid's OpenAPI spec",
	category: "comms",
	kind: "api",
	default_namespace: "sendgrid_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.sendgrid.com",
		"api_allowed_hosts": ["api.sendgrid.com", "api.eu.sendgrid.com"],
		"api_spec_url": "https://raw.githubusercontent.com/twilio/sendgrid-oai/main/spec/json/tsg_mail_v3.json",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "SENDGRID_API_KEY",
			"secret_name": "sendgrid_api_key",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["SENDGRID_API_KEY"]
	},
	api_setup: {
		"links": [{
			"label": "Mail Send API docs",
			"url": "https://www.twilio.com/docs/sendgrid/api-reference/mail-send",
			"kind": "docs"
		}, {
			"label": "API keys",
			"url": "https://app.sendgrid.com/settings/api_keys",
			"kind": "dashboard"
		}],
		"base_url": "https://api.sendgrid.com",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "SENDGRID_API_KEY",
			"display_name": "SendGrid API key",
			"description": "SendGrid API key Harbor sends as a Bearer token.",
			"required": true
		}],
		"spec_url": "https://raw.githubusercontent.com/twilio/sendgrid-oai/main/spec/json/tsg_mail_v3.json",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v3/user/profile",
			"expected_status": 200,
			"success_message": "Returns the SendGrid user profile for the API key."
		},
		"failure_hints": [{
			"matchers": [{
				"kind": "substring",
				"pattern": "401"
			}, {
				"kind": "substring",
				"pattern": "Forbidden"
			}],
			"message": "Set a valid `SENDGRID_API_KEY`; Harbor forwards it as a Bearer token."
		}]
	},
	links: [{
		"label": "Mail Send API docs",
		"url": "https://www.twilio.com/docs/sendgrid/api-reference/mail-send",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/planetscale-mcp.json
var planetscale_mcp_default = {
	slug: "planetscale-mcp",
	skill: {},
	display_name: "PlanetScale MCP",
	description: "Database management, branches, schemas, and query insights",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.pscale.dev/mcp/planetscale",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://planetscale.com/docs/concepts/mcp",
		"kind": "docs"
	}],
	default_namespace: "planetscale-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/betterstack-mcp.json
var betterstack_mcp_default = {
	slug: "betterstack-mcp",
	display_name: "Better Stack MCP",
	description: "Uptime monitoring, telemetry, and incident management",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.betterstack.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://betterstack.com/docs/mcp",
		"kind": "docs"
	}],
	default_namespace: "betterstack-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/newrelic-mcp.json
var newrelic_mcp_default = {
	slug: "newrelic-mcp",
	display_name: "New Relic MCP",
	description: "NRQL queries, entity management, metrics, logs, and alerts",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.newrelic.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.newrelic.com/docs/agentic-ai/mcp",
		"kind": "docs"
	}],
	default_namespace: "newrelic-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/buildkite-mcp.json
var buildkite_mcp_default = {
	slug: "buildkite-mcp",
	display_name: "Buildkite MCP",
	description: "Pipelines, builds, jobs, and test analytics",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.buildkite.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://buildkite.com/docs/apis/mcp",
		"kind": "docs"
	}],
	default_namespace: "buildkite-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/openai-mcp.json
var openai_mcp_default = {
	slug: "openai-mcp",
	skill: {},
	display_name: "OpenAI Docs",
	description: "OpenAI platform documentation and OpenAPI spec lookup",
	category: "ai",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://developers.openai.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://platform.openai.com/docs/guides/mcp",
		"kind": "docs"
	}],
	default_namespace: "openai-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/huggingface-mcp.json
var huggingface_mcp_default = {
	slug: "huggingface-mcp",
	skill: {},
	display_name: "Hugging Face MCP",
	description: "Models, datasets, spaces, and ML resources",
	category: "ai",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://huggingface.co/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://huggingface.co/docs/hub/mcp",
		"kind": "docs"
	}],
	default_namespace: "huggingface-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/slack-mcp.json
var slack_mcp_default = {
	slug: "slack-mcp",
	display_name: "Slack MCP",
	description: "OAuth-based Slack messages, channels, search, files, reminders, and workspace actions",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://slack-mcp.zonko-ai.workers.dev/mcp",
		"mcp_transport": "http",
		"oauth_discovery": {
			"authorization_server": "https://slack-mcp.zonko-ai.workers.dev",
			"authorization_endpoint": "https://slack-mcp.zonko-ai.workers.dev/authorize",
			"token_endpoint": "https://slack-mcp.zonko-ai.workers.dev/token",
			"registration_endpoint": "https://slack-mcp.zonko-ai.workers.dev/register",
			"scopes_supported": ["slack"],
			"has_dynamic_registration": true,
			"token_endpoint_auth_methods_supported": [
				"client_secret_basic",
				"client_secret_post",
				"none"
			],
			"resource": "https://slack-mcp.zonko-ai.workers.dev",
			"revocation_endpoint": "https://slack-mcp.zonko-ai.workers.dev/token"
		}
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/slack",
	links: [{
		"label": "Docs",
		"url": "https://github.com/zonko-ai/slack-mcp",
		"kind": "docs"
	}],
	default_namespace: "slack-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/zoom-mcp.json
var zoom_mcp_default = {
	slug: "zoom-mcp",
	display_name: "Zoom MCP",
	description: "Meetings, Team Chat, and Zoom Docs",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.zoom.us/mcp/zoom/streamable",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.zoom.us/docs/mcp/",
		"kind": "docs"
	}],
	default_namespace: "zoom-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/asana-mcp.json
var asana_mcp_default = {
	slug: "asana-mcp",
	display_name: "Asana MCP",
	description: "Task management, projects, and workspace operations",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.asana.com/v2/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.asana.com/docs/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "asana-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/clickup-mcp.json
var clickup_mcp_default = {
	slug: "clickup-mcp",
	display_name: "ClickUp MCP",
	description: "Tasks, projects, and workspace management",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.clickup.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developer.clickup.com/docs",
		"kind": "docs"
	}],
	default_namespace: "clickup-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/airtable-mcp.json
var airtable_mcp_default = {
	slug: "airtable-mcp",
	display_name: "Airtable MCP",
	description: "Bases, tables, records, and schema management",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.airtable.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://support.airtable.com/docs/using-the-airtable-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "airtable-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/close-mcp.json
var close_mcp_default = {
	slug: "close-mcp",
	display_name: "Close MCP",
	description: "CRM leads, contacts, and opportunity management",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.close.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://help.close.com/docs/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "close-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/apollo-mcp.json
var apollo_mcp_default = {
	slug: "apollo-mcp",
	display_name: "Apollo.io MCP",
	description: "Prospect search, contact enrichment, and outbound campaigns",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.apollo.io/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "apollo-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/intercom-mcp.json
var intercom_mcp_default = {
	slug: "intercom-mcp",
	display_name: "Intercom MCP",
	description: "Conversations, contacts, and ticket management",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.intercom.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://mcp.intercom.com",
		"kind": "docs"
	}],
	default_namespace: "intercom-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/canva-mcp.json
var canva_mcp_default = {
	slug: "canva-mcp",
	display_name: "Canva MCP",
	description: "Create designs, autofill templates, and design manipulation",
	category: "media",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.canva.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://canva.dev/docs/mcp/",
		"kind": "docs"
	}],
	default_namespace: "canva-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/paypal-mcp.json
var paypal_mcp_default = {
	slug: "paypal-mcp",
	display_name: "PayPal MCP",
	description: "Payment processing and merchant tools",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.paypal.com/sse",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.paypal.ai/developer/tools/ai/mcp-quickstart",
		"kind": "docs"
	}],
	default_namespace: "paypal-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/square-mcp.json
var square_mcp_default = {
	slug: "square-mcp",
	display_name: "Square MCP",
	description: "Payments, catalog, orders, and customer management",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.squareup.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://github.com/square/square-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "square-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/brevo-mcp.json
var brevo_mcp_default = {
	slug: "brevo-mcp",
	display_name: "Brevo MCP",
	description: "Email campaigns, contacts, transactional email, and SMS",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.brevo.com/v1/brevo/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.brevo.com/docs/mcp-protocol",
		"kind": "docs"
	}],
	default_namespace: "brevo-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/hubspot-mcp.json
var hubspot_mcp_default = {
	slug: "hubspot-mcp",
	display_name: "HubSpot MCP",
	description: "CRM contacts, deals, companies, tickets, and automation",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.hubspot.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-hubspot-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "hubspot-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/clerk-mcp.json
var clerk_mcp_default = {
	slug: "clerk-mcp",
	display_name: "Clerk Docs",
	description: "Clerk SDK snippets, documentation, and developer guides",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.clerk.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://clerk.com/docs/guides/development/mcp/clerk-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "clerk-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/cloudinary-mcp.json
var cloudinary_mcp_default = {
	slug: "cloudinary-mcp",
	display_name: "Cloudinary MCP",
	description: "Upload, manage, transform, and analyze media assets",
	category: "media",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://asset-management.mcp.cloudinary.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://console.cloudinary.com/documentation/cloudinary_llm_mcp",
		"kind": "docs"
	}],
	default_namespace: "cloudinary-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/mapbox-mcp.json
var mapbox_mcp_default = {
	slug: "mapbox-mcp",
	display_name: "Mapbox MCP",
	description: "Geocoding, directions, isochrones, and static maps",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.mapbox.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.mapbox.com/api/guides/mcp-server/",
		"kind": "docs"
	}],
	default_namespace: "mapbox-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/google-maps-mcp.json
var google_maps_mcp_default = {
	slug: "google-maps-mcp",
	display_name: "Google Maps MCP",
	description: "Place search, geocoding, routing, and weather via Maps Grounding Lite",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mapstools.googleapis.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/maps/ai/grounding-lite/reference",
		"kind": "docs"
	}],
	default_namespace: "google-maps-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/gmail-mcp.json
var gmail_mcp_default = {
	slug: "gmail-mcp",
	display_name: "Gmail",
	description: "Read, search, draft, send, label, and triage Gmail messages on behalf of the connected user",
	category: "comms",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_S4X59eoandGf",
		"toolkit_slug": "gmail"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/gmail",
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/gmail/api",
		"kind": "docs"
	}],
	default_namespace: "gmail"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/google-drive-mcp.json
var google_drive_mcp_default = {
	slug: "google-drive-mcp",
	display_name: "Google Drive",
	description: "Search and read files in the connected user's Google Drive",
	category: "storage",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_-JpcQd2Qeck8",
		"toolkit_slug": "googledrive"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/googledrive",
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/drive/api",
		"kind": "docs"
	}],
	default_namespace: "google-drive"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/google-sheets-mcp.json
var google_sheets_mcp_default = {
	slug: "google-sheets-mcp",
	display_name: "Google Sheets",
	description: "Read and write Google Sheets ranges, append rows, and create tabs",
	category: "data",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_Ou58hAS2jOhP",
		"toolkit_slug": "googlesheets"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/googlesheets",
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/sheets/api",
		"kind": "docs"
	}],
	default_namespace: "google-sheets"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/google-docs-mcp.json
var google_docs_mcp_default = {
	slug: "google-docs-mcp",
	display_name: "Google Docs",
	description: "Read and append content to Google Docs as markdown",
	category: "data",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_KB7gKC3kbFGP",
		"toolkit_slug": "googledocs"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/googledocs",
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/docs/api",
		"kind": "docs"
	}],
	default_namespace: "google-docs"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/google-calendar-mcp.json
var google_calendar_mcp_default = {
	slug: "google-calendar-mcp",
	display_name: "Google Calendar",
	description: "List, create, and update calendar events; read free/busy across calendars",
	category: "comms",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_HZdMZoL4mwsL",
		"toolkit_slug": "googlecalendar"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/googlecalendar",
	links: [{
		"label": "Docs",
		"url": "https://developers.google.com/calendar/api",
		"kind": "docs"
	}],
	default_namespace: "google-calendar"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/onedrive-mcp.json
var onedrive_mcp_default = {
	slug: "onedrive-mcp",
	display_name: "OneDrive",
	description: "Search, read, upload, share, and manage files in the connected user's OneDrive",
	category: "storage",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_SsVdIydkFEGK",
		"toolkit_slug": "one_drive"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/one_drive",
	links: [{
		"label": "Docs",
		"url": "https://docs.composio.dev/toolkits/one_drive",
		"kind": "docs"
	}],
	default_namespace: "onedrive"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/outlook-mcp.json
var outlook_mcp_default = {
	slug: "outlook-mcp",
	display_name: "Outlook",
	description: "Read, search, draft, send, and organize Outlook mail, calendar events, and contacts",
	category: "comms",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_qzmn1g9V4Fe3",
		"toolkit_slug": "outlook"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/outlook",
	links: [{
		"label": "Docs",
		"url": "https://docs.composio.dev/toolkits/outlook",
		"kind": "docs"
	}],
	default_namespace: "outlook"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/microsoft-teams-mcp.json
var microsoft_teams_mcp_default = {
	slug: "microsoft-teams-mcp",
	display_name: "Microsoft Teams",
	description: "Read and manage Teams chats, channels, meetings, files, and collaboration workflows",
	category: "comms",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_jA2-etu4SEI6",
		"toolkit_slug": "microsoft_teams"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/microsoft_teams",
	links: [{
		"label": "Docs",
		"url": "https://docs.composio.dev/toolkits/microsoft_teams",
		"kind": "docs"
	}],
	default_namespace: "microsoft-teams"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/excel-mcp.json
var excel_mcp_default = {
	slug: "excel-mcp",
	display_name: "Excel",
	description: "Read, update, create, and analyze Excel workbooks, worksheets, ranges, tables, and charts",
	category: "data",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_NlWoBCTlrzGW",
		"toolkit_slug": "excel"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/excel",
	links: [{
		"label": "Docs",
		"url": "https://docs.composio.dev/toolkits/excel",
		"kind": "docs"
	}],
	default_namespace: "excel"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/sharepoint-mcp.json
var sharepoint_mcp_default = {
	slug: "sharepoint-mcp",
	display_name: "SharePoint",
	description: "Search, read, create, update, and manage SharePoint sites, lists, folders, and files",
	category: "storage",
	kind: "composio",
	config: {
		"composio_auth_config_id": "ac_jajzHz0UpwEM",
		"toolkit_slug": "share_point"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	icon_url: "https://logos.composio.dev/api/share_point",
	links: [{
		"label": "Docs",
		"url": "https://docs.composio.dev/toolkits/share_point",
		"kind": "docs"
	}],
	default_namespace: "sharepoint"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/semgrep-mcp.json
var semgrep_mcp_default = {
	slug: "semgrep-mcp",
	display_name: "Semgrep MCP",
	description: "Code security scanning for vulnerabilities, supply chain, and secrets",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.semgrep.ai/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://semgrep.dev/docs/mcp",
		"kind": "docs"
	}],
	default_namespace: "semgrep-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/shortcut-mcp.json
var shortcut_mcp_default = {
	slug: "shortcut-mcp",
	skill: {},
	display_name: "Shortcut MCP",
	description: "Project management stories, epics, and workflows",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.shortcut.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://help.shortcut.com/hc/en-us/articles/36443434285844-MCP-Server",
		"kind": "docs"
	}],
	default_namespace: "shortcut-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/plane-mcp.json
var plane_mcp_default = {
	slug: "plane-mcp",
	skill: {},
	display_name: "Plane MCP",
	description: "Open-source project management with issues, epics, and cycles",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.plane.so/http/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://developers.plane.so/dev-tools/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "plane-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/typeform-mcp.json
var typeform_mcp_default = {
	slug: "typeform-mcp",
	display_name: "Typeform MCP",
	description: "Create and manage forms, retrieve submissions",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.typeform.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://typeform.com/developers/get-started/mcp/",
		"kind": "docs"
	}],
	default_namespace: "typeform-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/tally-mcp.json
var tally_mcp_default = {
	slug: "tally-mcp",
	display_name: "Tally MCP",
	description: "Build and manage forms using natural language",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.tally.so/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://tally.so/help/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "tally-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/mercury-mcp.json
var mercury_mcp_default = {
	slug: "mercury-mcp",
	display_name: "Mercury MCP",
	description: "Business banking accounts, balances, and transactions",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.mercury.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "mercury-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/webflow-mcp.json
var webflow_mcp_default = {
	slug: "webflow-mcp",
	display_name: "Webflow MCP",
	description: "Manage sites, pages, CMS collections, and design elements",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.webflow.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://mcp.webflow.com/",
		"kind": "docs"
	}],
	default_namespace: "webflow-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/customerio-mcp.json
var customerio_mcp_default = {
	slug: "customerio-mcp",
	skill: {},
	display_name: "Customer.io MCP",
	description: "Customer engagement, user profiles, segments, and campaigns",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.customer.io/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.customer.io/ai/mcp-server/",
		"kind": "docs"
	}],
	default_namespace: "customerio-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/tigris-mcp.json
var tigris_mcp_default = {
	slug: "tigris-mcp",
	skill: {},
	display_name: "Tigris MCP",
	description: "S3-compatible object storage for buckets and objects",
	category: "storage",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.storage.dev/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://www.tigrisdata.com/docs/mcp/remote/",
		"kind": "docs"
	}],
	default_namespace: "tigris-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/box-mcp.json
var box_mcp_default = {
	slug: "box-mcp",
	display_name: "Box MCP",
	description: "Cloud content management, files, folders, and collaboration",
	category: "storage",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.box.com",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "box-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/dropbox-mcp.json
var dropbox_mcp_default = {
	slug: "dropbox-mcp",
	display_name: "Dropbox MCP",
	description: "File storage, sharing, and search across Dropbox and Dash",
	category: "storage",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.dropbox.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "dropbox-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/instacart-mcp.json
var instacart_mcp_default = {
	slug: "instacart-mcp",
	skill: {},
	display_name: "Instacart MCP",
	description: "Product search, ordering, and cart management",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.instacart.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.instacart.com/developer_platform_api/guide/tutorials/mcp/",
		"kind": "docs"
	}],
	default_namespace: "instacart-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/dodo-payments-mcp.json
var dodo_payments_mcp_default = {
	slug: "dodo-payments-mcp",
	display_name: "Dodo Payments MCP",
	description: "Payment processing and merchant tools via code generation",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.dodopayments.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.dodopayments.com/developer-resources/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "dodo-payments-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/pagerduty-mcp.json
var pagerduty_mcp_default = {
	slug: "pagerduty-mcp",
	display_name: "PagerDuty MCP",
	description: "Incidents, on-call schedules, services, and team management",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.pagerduty.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.pagerduty.com/main/docs/pagerduty-mcp-server-integration-guide",
		"kind": "docs"
	}],
	default_namespace: "pagerduty-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/fal-mcp.json
var fal_mcp_default = {
	slug: "fal-mcp",
	display_name: "fal.ai MCP",
	description: "Access 1,000+ AI models for image, video, and audio generation",
	category: "ai",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.fal.ai/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://blog.fal.ai/connect-your-ai-to-1-000-models-with-the-fal-mcp-server/",
		"kind": "docs"
	}],
	default_namespace: "fal-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/exa-mcp.json
var exa_mcp_default = {
	slug: "exa-mcp",
	skill: {},
	display_name: "Exa MCP",
	description: "AI-native web search, code context retrieval, and content extraction",
	category: "search",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.exa.ai/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://exa.ai/docs/reference/exa-mcp",
		"kind": "docs"
	}],
	default_namespace: "exa-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/parallel-search-mcp.json
var parallel_search_mcp_default = {
	slug: "parallel-search-mcp",
	display_name: "Parallel Search MCP",
	description: "Real-time web search and markdown content extraction (web_search + web_fetch). Free tier requires no API key; Bearer token unlocks higher rate limits.",
	category: "search",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://search.parallel.ai/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://docs.parallel.ai/mcp",
		"kind": "docs"
	}, {
		"label": "Platform",
		"url": "https://platform.parallel.ai",
		"kind": "dashboard"
	}],
	default_namespace: "parallel-search-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/you-mcp.json
var you_mcp_default = {
	slug: "you-mcp",
	display_name: "You.com MCP",
	description: "Real-time web search, AI answers, and content extraction",
	category: "search",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.you.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "you-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/render-mcp.json
var render_mcp_default = {
	slug: "render-mcp",
	skill: {},
	display_name: "Render MCP",
	description: "Manage web services, databases, metrics, and deployments",
	category: "infra",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.render.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://render.com/docs/mcp-server",
		"kind": "docs"
	}],
	default_namespace: "render-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/heroku-mcp.json
var heroku_mcp_default = {
	slug: "heroku-mcp",
	display_name: "Heroku MCP",
	description: "Create and manage apps, dynos, add-ons, and deployments",
	category: "infra",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.heroku.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://heroku.com/blog/heroku-remote-mcp-server",
		"kind": "docs"
	}],
	default_namespace: "heroku-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/wix-mcp.json
var wix_mcp_default = {
	slug: "wix-mcp",
	skill: {},
	display_name: "Wix MCP",
	description: "Build and manage Wix sites, collections, and business tools",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.wix.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "wix-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/plaid-mcp.json
var plaid_mcp_default = {
	slug: "plaid-mcp",
	display_name: "Plaid MCP",
	description: "Banking data access, account verification, and financial connections",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.dashboard.plaid.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	links: [{
		"label": "Docs",
		"url": "https://plaid.com/docs/resources/mcp",
		"kind": "docs"
	}],
	default_namespace: "plaid-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/cypress-mcp.json
var cypress_mcp_default = {
	slug: "cypress-mcp",
	display_name: "Cypress Cloud MCP",
	description: "Test results, debugging, and CI/CD test analytics",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.cypress.io/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "cypress-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/azure-devops-mcp.json
var azure_devops_mcp_default = {
	slug: "azure-devops-mcp",
	display_name: "Azure DevOps MCP",
	description: "Boards, repositories, pipelines, and work items",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.dev.azure.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "azure-devops-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/devrev-mcp.json
var devrev_mcp_default = {
	slug: "devrev-mcp",
	display_name: "DevRev MCP",
	description: "Product development platform with issues, tickets, and knowledge",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://api.devrev.ai/mcp/v1",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "devrev-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/globalping-mcp.json
var globalping_mcp_default = {
	slug: "globalping-mcp",
	display_name: "Globalping MCP",
	description: "Network diagnostics — ping, traceroute, DNS, and HTTP from global probes",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.globalping.dev/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "globalping-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/coingecko-mcp.json
var coingecko_mcp_default = {
	slug: "coingecko-mcp",
	skill: {},
	display_name: "CoinGecko MCP",
	description: "Cryptocurrency market data, prices, and exchange information",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.api.coingecko.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "coingecko-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/scraperapi-mcp.json
var scraperapi_mcp_default = {
	slug: "scraperapi-mcp",
	display_name: "ScraperAPI MCP",
	description: "Web scraping with proxy rotation and JS rendering",
	category: "web",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.scraperapi.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "scraperapi-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/mollie-mcp.json
var mollie_mcp_default = {
	slug: "mollie-mcp",
	skill: {},
	display_name: "Mollie MCP",
	description: "Payment processing, refunds, and subscription management",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.mollie.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "mollie-mcp",
	links: [{
		"label": "Docs",
		"url": "https://docs.mollie.com",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/docusign-mcp.json
var docusign_mcp_default = {
	slug: "docusign-mcp",
	display_name: "DocuSign MCP",
	description: "E-signature workflows, envelope management, and document automation",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.docusign.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "docusign-mcp",
	links: [{
		"label": "Docs",
		"url": "https://developers.docusign.com",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/buffer-mcp.json
var buffer_mcp_default = {
	slug: "buffer-mcp",
	display_name: "Buffer MCP",
	description: "Social media scheduling, publishing, and analytics",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.buffer.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "buffer-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/lambdatest-mcp.json
var lambdatest_mcp_default = {
	slug: "lambdatest-mcp",
	skill: {},
	display_name: "LambdaTest MCP",
	description: "Cross-browser testing, automation, and test analytics",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.lambdatest.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "lambdatest-mcp",
	links: [{
		"label": "Docs",
		"url": "https://www.lambdatest.com/support/docs/mcp-server/",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/freshdesk-mcp.json
var freshdesk_mcp_default = {
	slug: "freshdesk-mcp",
	display_name: "Freshdesk MCP",
	description: "Customer support tickets, contacts, and knowledge base",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.freshdesk.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "freshdesk-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/datadog-mcp.json
var datadog_mcp_default = {
	slug: "datadog-mcp",
	display_name: "Datadog MCP",
	description: "Logs, metrics, traces, dashboards, monitors, and incidents",
	category: "observability",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.datadoghq.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "datadog-mcp",
	links: [{
		"label": "Docs",
		"url": "https://docs.datadoghq.com/bits_ai/mcp_server/",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/stackoverflow-mcp.json
var stackoverflow_mcp_default = {
	slug: "stackoverflow-mcp",
	display_name: "Stack Overflow MCP",
	description: "Search questions, answers, and developer knowledge",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.stackoverflow.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "stackoverflow-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/prisma-mcp.json
var prisma_mcp_default = {
	slug: "prisma-mcp",
	skill: {},
	display_name: "Prisma MCP",
	description: "Database schema management, migrations, and Prisma Postgres",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.prisma.io/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "prisma-mcp",
	links: [{
		"label": "Docs",
		"url": "https://www.prisma.io/docs/orm/prisma-schema/mcp",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/ramp-mcp.json
var ramp_mcp_default = {
	slug: "ramp-mcp",
	display_name: "Ramp MCP",
	description: "Corporate expense management, cards, and reimbursements",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.ramp.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "ramp-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/stytch-mcp.json
var stytch_mcp_default = {
	slug: "stytch-mcp",
	display_name: "Stytch MCP",
	description: "Authentication, user management, and identity APIs",
	category: "dev",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.stytch.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "stytch-mcp",
	links: [{
		"label": "Docs",
		"url": "https://stytch.com/docs/guides/mcp",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/xero-mcp.json
var xero_mcp_default = {
	slug: "xero-mcp",
	display_name: "Xero MCP",
	description: "Accounting, invoicing, and financial reporting",
	category: "data",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.xero.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "xero-mcp",
	links: [{
		"label": "Docs",
		"url": "https://developer.xero.com",
		"kind": "docs"
	}]
};
//#endregion
//#region ../registry-catalog/data/v1/entries/pinterest-mcp.json
var pinterest_mcp_default = {
	slug: "pinterest-mcp",
	display_name: "Pinterest MCP",
	description: "Pin management, boards, and advertising campaigns",
	category: "comms",
	kind: "mcp",
	config: {
		"mcp_endpoint": "https://mcp.pinterest.com/mcp",
		"mcp_transport": "http"
	},
	auth: {
		"method": "none",
		"required_secrets": []
	},
	default_namespace: "pinterest-mcp"
};
//#endregion
//#region ../registry-catalog/data/v1/entries/whoop-api.json
var whoop_api_default = {
	slug: "whoop-api",
	display_name: "WHOOP API",
	description: "Read WHOOP health data: recovery scores, sleep stages, strain cycles, workouts, and body measurements",
	category: "data",
	kind: "api",
	icon_url: "https://www.whoop.com/favicon.ico",
	default_namespace: "whoop_api",
	config: {
		"api_protocol": "openapi",
		"api_base_url": "https://api.prod.whoop.com/developer",
		"api_allowed_hosts": ["api.prod.whoop.com"],
		"api_spec_url": "https://api.prod.whoop.com/developer/doc/openapi.yaml",
		"api_auth": {
			"method": "bearer",
			"required": true,
			"env": "WHOOP_ACCESS_TOKEN",
			"secret_name": "whoop_access_token",
			"prefix": "Bearer "
		}
	},
	auth: {
		"method": "bearer",
		"prefix": "Bearer ",
		"required_secrets": ["WHOOP_ACCESS_TOKEN"]
	},
	api_setup: {
		"links": [{
			"label": "API docs",
			"url": "https://developer.whoop.com/api/",
			"kind": "docs"
		}, {
			"label": "Developer portal",
			"url": "https://app.whoop.com/apps",
			"kind": "dashboard"
		}],
		"base_url": "https://api.prod.whoop.com/developer",
		"auth_mode": "bearer",
		"required_secrets": [{
			"env": "WHOOP_ACCESS_TOKEN",
			"display_name": "WHOOP access token",
			"description": "OAuth 2.0 access token from WHOOP. Create an app at app.whoop.com/apps, run the OAuth 2.0 authorization code flow, and paste the resulting access token here. Required scopes: read:profile, read:recovery, read:cycles, read:sleep, read:workout, read:body_measurement.",
			"required": true
		}],
		"spec_url": "https://api.prod.whoop.com/developer/doc/openapi.yaml",
		"verify_probe": {
			"kind": "request",
			"method": "GET",
			"path": "/v2/user/profile/basic",
			"expected_status": 200,
			"success_message": "Returns the authenticated WHOOP user's basic profile."
		},
		"failure_hints": [{
			"matchers": [
				{
					"kind": "substring",
					"pattern": "401"
				},
				{
					"kind": "substring",
					"pattern": "Unauthorized"
				},
				{
					"kind": "substring",
					"pattern": "invalid_token"
				}
			],
			"message": "Set a valid `WHOOP_ACCESS_TOKEN`. Obtain one by registering an app at app.whoop.com/apps and completing the OAuth 2.0 authorization code flow with the required read scopes."
		}, {
			"matchers": [{
				"kind": "substring",
				"pattern": "403"
			}, {
				"kind": "substring",
				"pattern": "insufficient_scope"
			}],
			"message": "The access token is missing required scopes. Re-authorize with: read:profile, read:recovery, read:cycles, read:sleep, read:workout, read:body_measurement."
		}]
	},
	links: [{
		"label": "API docs",
		"url": "https://developer.whoop.com/api/",
		"kind": "docs"
	}]
};
const REGISTRY_CATALOG_SLUGS = entries$1;
const REGISTRY_CATALOG_ENTRY_BY_SLUG = {
	"git-cli": git_cli_default,
	"echo-cli": echo_cli_default,
	"gh-cli": gh_cli_default,
	"vercel-cli": vercel_cli_default,
	"modal-cli": modal_cli_default,
	"wrangler-cli": wrangler_cli_default,
	"aws-cli": aws_cli_default,
	"convex-cli": convex_cli_default,
	"glab-cli": glab_cli_default,
	"linear-graphql": linear_graphql_default,
	"github-graphql": github_graphql_default,
	"github-rest-api": github_rest_api_default,
	"discord-api": discord_api_default,
	"cloudflare-api": cloudflare_api_default,
	"gitlab-rest-api": gitlab_rest_api_default,
	"deepwiki-mcp": deepwiki_mcp_default,
	"context7-mcp": context7_mcp_default,
	"notion-mcp": notion_mcp_default,
	"browserbase-mcp": browserbase_mcp_default,
	"firecrawl-mcp": firecrawl_mcp_default,
	"linear-mcp": linear_mcp_default,
	"sentry-mcp": sentry_mcp_default,
	"cloudflare-mcp": cloudflare_mcp_default,
	"neon-mcp": neon_mcp_default,
	"stripe-mcp": stripe_mcp_default,
	"supabase-mcp": supabase_mcp_default,
	"posthog-mcp": posthog_mcp_default,
	"figma-mcp": figma_mcp_default,
	"axiom-mcp": axiom_mcp_default,
	"monday-mcp": monday_mcp_default,
	"miro-mcp": miro_mcp_default,
	"calendly-mcp": calendly_mcp_default,
	"attio-mcp": attio_mcp_default,
	"make-mcp": make_mcp_default,
	"pylon-mcp": pylon_mcp_default,
	"hex-mcp": hex_mcp_default,
	"incidentio-mcp": incidentio_mcp_default,
	"ahrefs-mcp": ahrefs_mcp_default,
	"bitly-mcp": bitly_mcp_default,
	"tavily-mcp": tavily_mcp_default,
	"replicate-mcp": replicate_mcp_default,
	"granola-mcp": granola_mcp_default,
	"sanity-mcp": sanity_mcp_default,
	"amplitude-mcp": amplitude_mcp_default,
	"mixpanel-mcp": mixpanel_mcp_default,
	"apify-mcp": apify_mcp_default,
	"jina-mcp": jina_mcp_default,
	"scrapingbee-mcp": scrapingbee_mcp_default,
	"brightdata-mcp": brightdata_mcp_default,
	"github-mcp": github_mcp_default,
	"atlassian-mcp": atlassian_mcp_default,
	"vercel-mcp": vercel_mcp_default,
	"digitalocean-mcp": digitalocean_mcp_default,
	"digitalocean-api": digitalocean_api_default,
	"asana-api": asana_api_default,
	"twilio-api": twilio_api_default,
	"axiom-api": axiom_api_default,
	"resend-api": resend_api_default,
	"openrouter-api": openrouter_api_default,
	"openai-api": openai_api_default,
	"anthropic-api": anthropic_api_default,
	"xai-api": xai_api_default,
	"perplexity-api": perplexity_api_default,
	"x-api": x_api_default,
	"open-meteo-api": open_meteo_api_default,
	"polymarket-gamma-api": polymarket_gamma_api_default,
	"kalshi-api": kalshi_api_default,
	"browser-use-api": browser_use_api_default,
	"stripe-api": stripe_api_default,
	"vercel-api": vercel_api_default,
	"sentry-api": sentry_api_default,
	"figma-api": figma_api_default,
	"supabase-api": supabase_api_default,
	"netlify-api": netlify_api_default,
	"sendgrid-api": sendgrid_api_default,
	"planetscale-mcp": planetscale_mcp_default,
	"betterstack-mcp": betterstack_mcp_default,
	"newrelic-mcp": newrelic_mcp_default,
	"buildkite-mcp": buildkite_mcp_default,
	"openai-mcp": openai_mcp_default,
	"huggingface-mcp": huggingface_mcp_default,
	"slack-mcp": slack_mcp_default,
	"zoom-mcp": zoom_mcp_default,
	"asana-mcp": asana_mcp_default,
	"clickup-mcp": clickup_mcp_default,
	"airtable-mcp": airtable_mcp_default,
	"close-mcp": close_mcp_default,
	"apollo-mcp": apollo_mcp_default,
	"intercom-mcp": intercom_mcp_default,
	"canva-mcp": canva_mcp_default,
	"paypal-mcp": paypal_mcp_default,
	"square-mcp": square_mcp_default,
	"brevo-mcp": brevo_mcp_default,
	"hubspot-mcp": hubspot_mcp_default,
	"clerk-mcp": clerk_mcp_default,
	"cloudinary-mcp": cloudinary_mcp_default,
	"mapbox-mcp": mapbox_mcp_default,
	"google-maps-mcp": google_maps_mcp_default,
	"gmail-mcp": gmail_mcp_default,
	"google-drive-mcp": google_drive_mcp_default,
	"google-sheets-mcp": google_sheets_mcp_default,
	"google-docs-mcp": google_docs_mcp_default,
	"google-calendar-mcp": google_calendar_mcp_default,
	"onedrive-mcp": onedrive_mcp_default,
	"outlook-mcp": outlook_mcp_default,
	"microsoft-teams-mcp": microsoft_teams_mcp_default,
	"excel-mcp": excel_mcp_default,
	"sharepoint-mcp": sharepoint_mcp_default,
	"semgrep-mcp": semgrep_mcp_default,
	"shortcut-mcp": shortcut_mcp_default,
	"plane-mcp": plane_mcp_default,
	"typeform-mcp": typeform_mcp_default,
	"tally-mcp": tally_mcp_default,
	"mercury-mcp": mercury_mcp_default,
	"webflow-mcp": webflow_mcp_default,
	"customerio-mcp": customerio_mcp_default,
	"tigris-mcp": tigris_mcp_default,
	"box-mcp": box_mcp_default,
	"dropbox-mcp": dropbox_mcp_default,
	"instacart-mcp": instacart_mcp_default,
	"dodo-payments-mcp": dodo_payments_mcp_default,
	"pagerduty-mcp": pagerduty_mcp_default,
	"fal-mcp": fal_mcp_default,
	"exa-mcp": exa_mcp_default,
	"parallel-search-mcp": parallel_search_mcp_default,
	"you-mcp": you_mcp_default,
	"render-mcp": render_mcp_default,
	"heroku-mcp": heroku_mcp_default,
	"wix-mcp": wix_mcp_default,
	"plaid-mcp": plaid_mcp_default,
	"cypress-mcp": cypress_mcp_default,
	"azure-devops-mcp": azure_devops_mcp_default,
	"devrev-mcp": devrev_mcp_default,
	"globalping-mcp": globalping_mcp_default,
	"coingecko-mcp": coingecko_mcp_default,
	"scraperapi-mcp": scraperapi_mcp_default,
	"mollie-mcp": mollie_mcp_default,
	"docusign-mcp": docusign_mcp_default,
	"buffer-mcp": buffer_mcp_default,
	"lambdatest-mcp": lambdatest_mcp_default,
	"freshdesk-mcp": freshdesk_mcp_default,
	"datadog-mcp": datadog_mcp_default,
	"stackoverflow-mcp": stackoverflow_mcp_default,
	"prisma-mcp": prisma_mcp_default,
	"ramp-mcp": ramp_mcp_default,
	"stytch-mcp": stytch_mcp_default,
	"xero-mcp": xero_mcp_default,
	"pinterest-mcp": pinterest_mcp_default,
	"whoop-api": whoop_api_default
};
const REGISTRY_CATALOG_ENTRIES = REGISTRY_CATALOG_SLUGS.map((slug) => {
	const entry = REGISTRY_CATALOG_ENTRY_BY_SLUG[slug];
	if (!entry) throw new Error(`Missing registry catalog JSON for slug: ${slug}`);
	return entry;
});
const REGISTRY_CATALOG_LOCAL_ICONS = local_icons_default;
const REGISTRY_CATALOG_ICON_HOST_OVERRIDES = icon_host_overrides_default;
const REGISTRY_CATALOG_POPULARITY = popularity_default;
//#endregion
//#region ../registry/src/entries.ts
const decodePluginRegistryEntry = Schema.decodeUnknownSync(PluginRegistryEntry);
const PLUGIN_REGISTRY = REGISTRY_CATALOG_ENTRIES.map((entry) => decodePluginRegistryEntry(entry));
//#endregion
//#region ../registry/src/local-icons.ts
const LOCAL_ICONS = REGISTRY_CATALOG_LOCAL_ICONS;
const LOCAL_ICON_PATHS = Object.fromEntries(Object.entries(LOCAL_ICONS).map(([slug, icon]) => icon.kind === "single" ? [slug, icon.path] : [slug, icon.light]));
//#endregion
//#region ../registry/src/index.ts
function getLocalIcon(slug) {
	return LOCAL_ICONS[slug];
}
function getLocalIconPath(slug, theme) {
	const icon = LOCAL_ICONS[slug];
	if (!icon) return void 0;
	if (icon.kind === "single") return icon.path;
	return theme === "dark" ? icon.dark : icon.light;
}
function getLocalIconStyle(slug) {
	const icon = LOCAL_ICONS[slug];
	if (!icon) return void 0;
	return icon.kind === "themed" ? "themed" : icon.style;
}
function isLocalIconUrl(url) {
	if (typeof url !== "string") return false;
	if (url.startsWith("/plugin-icons/")) return true;
	const match = /^https?:\/\/([^/?#]+)(\/[^?#]*)/i.exec(url);
	if (!match) return false;
	const host = match[1]?.toLowerCase();
	const pathname = match[2] ?? "";
	return (host === "tryharbor.ai" || host === "stag.tryharbor.ai") && pathname.startsWith("/plugin-icons/");
}
const ICON_HOST_OVERRIDES = REGISTRY_CATALOG_ICON_HOST_OVERRIDES;
const FAVICON_PIPELINE_VERSION = "hrbr3";
function faviconUrl(host) {
	return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=256&client=${FAVICON_PIPELINE_VERSION}`;
}
function tryHost(value) {
	if (!value) return void 0;
	const host = value.match(/^[a-z]+:\/\/([^/?#:]+)/i)?.[1];
	if (!host || host === "raw.githubusercontent.com") return void 0;
	return host;
}
function deriveIconUrl(entry) {
	return entry.icon_url ?? LOCAL_ICON_PATHS[entry.slug];
}
const registryPopularity = REGISTRY_CATALOG_POPULARITY;
const POPULARITY_DEFAULT = registryPopularity.default;
const POPULARITY = registryPopularity.entries;
function decorateEntry(entry) {
	const icon_url = deriveIconUrl(entry);
	const popularity = entry.popularity ?? POPULARITY[entry.slug] ?? POPULARITY_DEFAULT;
	const needsIcon = icon_url && icon_url !== entry.icon_url;
	if (!needsIcon && popularity === entry.popularity) return entry;
	return {
		...entry,
		...needsIcon ? { icon_url } : {},
		popularity
	};
}
function getRegistryEntry(slug) {
	const entry = PLUGIN_REGISTRY.find((e) => e.slug === slug);
	return entry ? decorateEntry(entry) : void 0;
}
function listRegistryEntries(category) {
	return (category ? PLUGIN_REGISTRY.filter((e) => e.category === category) : PLUGIN_REGISTRY).map(decorateEntry);
}
function getRequiredSecrets(slug) {
	const entry = PLUGIN_REGISTRY.find((e) => e.slug === slug || e.default_namespace === slug);
	return entry ? [...getRequiredSecretEnvs(decorateEntry(entry))] : [];
}
const CALLABLE_BINDING_KINDS = new Set([
	"mcp",
	"cli_command",
	"api_request",
	"api_graphql"
]);
function addIfPresent(target, value, requiredOnly, required) {
	if (!value) return;
	if (requiredOnly && !required) return;
	target.add(value);
}
function collectApiAuthSecretEnvs(target, auth, requiredOnly) {
	if (!auth || auth.method === "none") return;
	const required = auth.required !== false;
	addIfPresent(target, auth.env, requiredOnly, required);
	addIfPresent(target, auth.username_env, requiredOnly, required);
	addIfPresent(target, auth.password_env, requiredOnly, required);
}
function getApiBindingAuth(binding) {
	if (binding.kind === "api_request") return binding.auth;
	if (binding.kind === "api_graphql") return binding.auth;
}
function resolveApiSecretName(auth, env) {
	if (!auth) return void 0;
	if (auth.env === env) return auth.secret_name;
	if (auth.username_env === env) return auth.username_secret_name;
	if (auth.password_env === env) return auth.password_secret_name;
}
function countCallableManifestTools(tools) {
	return tools.filter((tool) => CALLABLE_BINDING_KINDS.has(tool.binding.kind)).length;
}
function getRequiredSecretEnvs(entry) {
	const required = /* @__PURE__ */ new Set();
	if (entry.kind === "mcp") {
		for (const secret of entry.auth.required_secrets) if (secret) required.add(secret);
	}
	if (entry.kind === "cli") {
		for (const secret of entry.cli_setup.required_secrets) if (secret.required) required.add(secret.env);
		for (const binding of entry.config.sand_secret_bindings ?? []) {
			if (binding.required === false) continue;
			required.add(binding.env);
		}
	}
	if (entry.kind === "api") {
		for (const secret of entry.api_setup.required_secrets) if (secret.required) required.add(secret.env);
		collectApiAuthSecretEnvs(required, entry.config.api_auth, true);
		for (const tool of entry.manifest?.tools ?? []) collectApiAuthSecretEnvs(required, getApiBindingAuth(tool.binding), true);
	}
	return [...required];
}
function getAllowedSecretEnvs(entry) {
	const allowed = /* @__PURE__ */ new Set();
	if (entry.kind === "mcp") {
		for (const secret of entry.auth.required_secrets) if (secret) allowed.add(secret);
	}
	if (entry.kind === "cli") {
		for (const secret of entry.cli_setup.required_secrets) allowed.add(secret.env);
		for (const binding of entry.config.sand_secret_bindings ?? []) if (binding.env) allowed.add(binding.env);
	}
	if (entry.kind === "api") {
		for (const secret of entry.api_setup.required_secrets) allowed.add(secret.env);
		collectApiAuthSecretEnvs(allowed, entry.config.api_auth, false);
		for (const tool of entry.manifest?.tools ?? []) collectApiAuthSecretEnvs(allowed, getApiBindingAuth(tool.binding), false);
	}
	return [...allowed];
}
function resolveRegistryInstallSecrets(entry, input) {
	const normalized = {};
	for (const [env, value] of Object.entries(input.secrets_by_env ?? {})) {
		if (!env || typeof value !== "string") continue;
		const trimmed = value.trim();
		if (!trimmed) continue;
		normalized[env] = trimmed;
	}
	if (input.credential_value && Object.keys(normalized).length === 0) {
		const fallbackEnv = getRequiredSecretEnvs(entry)[0] ?? getAllowedSecretEnvs(entry)[0];
		if (fallbackEnv) normalized[fallbackEnv] = input.credential_value;
	}
	const requiredEnvKeys = getRequiredSecretEnvs(entry);
	const allowedEnvKeys = getAllowedSecretEnvs(entry);
	const missingRequired = requiredEnvKeys.filter((env) => !normalized[env]);
	const providedKeys = Object.keys(normalized);
	return {
		secrets_by_env: normalized,
		missing_required_envs: missingRequired,
		unexpected_envs: allowedEnvKeys.length === 0 ? providedKeys : providedKeys.filter((env) => !allowedEnvKeys.includes(env)),
		primary_auth_env: entry.auth.method === "none" ? void 0 : requiredEnvKeys.find((env) => normalized[env]) ?? providedKeys[0]
	};
}
function resolveCredentialNameForEnv(entry, env) {
	if (entry.kind === "cli") {
		const binding = (entry.config.sand_secret_bindings ?? []).find((item) => item.env === env);
		if (binding?.secret_name) return binding.secret_name;
	}
	if (entry.kind === "api") {
		const configMapped = resolveApiSecretName(entry.config.api_auth, env);
		if (configMapped) return configMapped;
		for (const tool of entry.manifest?.tools ?? []) {
			const bindingMapped = resolveApiSecretName(getApiBindingAuth(tool.binding), env);
			if (bindingMapped) return bindingMapped;
		}
	}
	return env;
}
//#endregion
export { ICON_HOST_OVERRIDES, LOCAL_ICONS, LOCAL_ICON_PATHS, PLUGIN_REGISTRY, POPULARITY, POPULARITY_DEFAULT, PluginCategory, PluginRegistryApiSetup, PluginRegistryApiSetupVerifyProbe, PluginRegistryCliSetup, PluginRegistryCliSetupFailureHint, PluginRegistryCliSetupFailureMatcher, PluginRegistryCliSetupRequiredSecret, PluginRegistryCliSetupRunnableRequirement, PluginRegistryCliSetupVerifyProbe, PluginRegistryEntry, PluginRegistryEntryAvailability, PluginRegistryListResult, PluginRegistryListResultWithoutManifest, PluginRegistryManifest, PluginRegistryManifestTool, PluginRegistryManifestToolBinding, PluginRegistryPublicEntry, PluginRegistryPublicEntryWithoutManifest, countCallableManifestTools, faviconUrl, getAllowedSecretEnvs, getLocalIcon, getLocalIconPath, getLocalIconStyle, getRegistryEntry, getRequiredSecretEnvs, getRequiredSecrets, isLocalIconUrl, listRegistryEntries, resolveCredentialNameForEnv, resolveRegistryInstallSecrets, tryHost };

//# sourceMappingURL=base.mjs.map