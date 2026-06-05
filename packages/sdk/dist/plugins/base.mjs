import { Context, Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
const UserId = Schema.NonEmptyString;
const AgentId = Schema.NonEmptyString;
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
const SandboxRequest = Schema.Struct({
	workspace_id: WorkspaceId,
	runtime: SandboxRuntime,
	entrypoint: Schema.NonEmptyString,
	files: Schema.Record(Schema.String, Schema.String),
	env: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	secrets: Schema.optional(Schema.Array(SecretName)),
	timeout_ms: Schema.optional(Schema.Number)
});
const SandboxResult = Schema.Struct({
	ok: Schema.Boolean,
	stdout: Schema.String,
	stderr: Schema.String,
	result: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String)
});
//#endregion
//#region ../core-effect/src/source.ts
const SourceKind$1 = Schema.Literals([
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
const SourceStatus$1 = Schema.Literals([
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
const SourceVisibility$1 = Schema.Literals(["personal", "workspace"]);
const SourceVerificationStatus$1 = Schema.Literals([
	"pending",
	"verified",
	"failed"
]);
const SourceIdentity = Schema.Struct({
	slug: RegistrySlug$1,
	kind: SourceKind$1,
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
const ApiAuthConfig$1 = Schema.Struct({
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
const CliSourceConfig$1 = Schema.Struct({
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
const ApiSourceConfig$1 = Schema.Struct({
	kind: Schema.Literal("api"),
	namespace: SourceNamespace,
	base_url: Schema.NonEmptyString,
	auth_mode: Schema.optional(SourceAuthMode),
	required_secrets: Schema.optional(Schema.Array(SecretName))
});
const SourceConfig$1 = Schema.Union([
	McpSourceConfig,
	CliSourceConfig$1,
	ApiSourceConfig$1
]);
Schema.Struct({
	id: SourceId,
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	slug: Schema.optional(RegistrySlug$1),
	kind: SourceKind$1,
	status: SourceStatus$1,
	config: SourceConfig$1,
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
const PluginTool$1 = Schema.Struct({
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
const AuthTemplate$1 = Schema.Union([
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
const SourceLink$1 = Schema.Struct({
	label: Schema.String,
	url: Schema.String,
	kind: Schema.Literals([
		"docs",
		"dashboard",
		"api"
	])
});
const ComposioStaticAuthScheme$1 = Schema.Literals([
	"API_KEY",
	"BEARER_TOKEN",
	"BASIC"
]);
const ComposioStaticAuthConfig$1 = Schema.Struct({
	auth_scheme: ComposioStaticAuthScheme$1,
	credential_map: Schema.Record(Schema.NonEmptyString, SecretName),
	validate_credentials: Schema.optional(Schema.Boolean)
});
const SourceVerificationSummary$1 = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus$1,
	verified: Schema.Boolean,
	checked_at: Schema.String,
	error: Schema.optional(Schema.String)
});
const SourceVerification$1 = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus$1,
	verified: Schema.Boolean,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown),
	checked_at: Schema.String,
	created_by: Schema.optional(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String
});
const PluginSourceCreator$1 = Schema.Struct({
	id: Schema.String,
	name: Schema.optional(Schema.NullOr(Schema.String)),
	email: Schema.optional(Schema.NullOr(Schema.String)),
	avatar_url: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	name: Schema.String,
	version: Schema.optional(Schema.String)
});
const McpIcon$1 = Schema.Struct({
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
const PluginSource$1 = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	kind: SourceKind$1,
	namespace: Schema.String,
	display_name: Schema.String,
	description: Schema.optional(Schema.NullOr(Schema.String)),
	config: Schema.Unknown,
	auth_config: Schema.Unknown,
	status: SourceStatus$1,
	install_status: Schema.optional(SourceStatus$1),
	effective_status: Schema.optional(SourceStatus$1),
	runnable: Schema.optional(Schema.Boolean),
	redacted: Schema.optional(Schema.Boolean),
	non_runnable_reason: Schema.optional(Schema.String),
	tool_count: Schema.Number,
	last_synced_at: Schema.optional(Schema.NullOr(Schema.String)),
	error: Schema.optional(Schema.NullOr(Schema.String)),
	verified: Schema.optional(Schema.Boolean),
	last_verified_at: Schema.optional(Schema.NullOr(Schema.String)),
	last_verify_error: Schema.optional(Schema.NullOr(Schema.String)),
	latest_verification: Schema.optional(SourceVerificationSummary$1),
	sand_missing_required_secret_envs: Schema.optional(Schema.Array(Schema.String)),
	category: Schema.optional(Schema.NullOr(Schema.String)),
	links: Schema.optional(Schema.NullOr(Schema.Array(SourceLink$1))),
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
	created_by_user: Schema.optional(Schema.NullOr(PluginSourceCreator$1)),
	source_visibility: Schema.optional(SourceVisibility$1),
	caller_status: Schema.optional(SourceStatus$1),
	created_at: Schema.String,
	updated_at: Schema.String
});
const MCPToolBinding$1 = Schema.Struct({
	kind: Schema.Literal("mcp"),
	tool_name: Schema.String,
	cached_input_schema: Schema.optional(Schema.Unknown),
	cached_output_schema: Schema.optional(Schema.Unknown)
});
const MCPPromptBinding$1 = Schema.Struct({
	kind: Schema.Literal("mcp_prompt"),
	prompt_name: Schema.String
});
const MCPResourceReadBinding$1 = Schema.Struct({
	kind: Schema.Literal("mcp_resource_read"),
	uri: Schema.String
});
const MCPResourceTemplateBinding$1 = Schema.Struct({
	kind: Schema.Literal("mcp_resource_template"),
	uri_template: Schema.String
});
const ApiRequestBinding$1 = Schema.Struct({
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
	auth: Schema.optional(ApiAuthConfig$1)
});
const ApiGraphqlBinding$1 = Schema.Struct({
	kind: Schema.Literal("api_graphql"),
	path: Schema.optional(Schema.NonEmptyString),
	document: Schema.NonEmptyString,
	operation_name: Schema.optional(Schema.NonEmptyString),
	headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	variables_template: Schema.optional(Schema.Unknown),
	timeout_ms: Schema.optional(Schema.Number),
	auth: Schema.optional(ApiAuthConfig$1)
});
const CliArgTemplateLiteral$1 = Schema.Struct({
	kind: Schema.Literal("literal"),
	value: Schema.String
});
const CliArgTemplateInput$1 = Schema.Struct({
	kind: Schema.Literal("input"),
	path: Schema.NonEmptyString
});
const CliArgTemplateOption$1 = Schema.Struct({
	kind: Schema.Literal("option"),
	flag: Schema.NonEmptyString,
	path: Schema.NonEmptyString,
	omit_if_empty: Schema.optional(Schema.Boolean)
});
const CliArgTemplateFlag$1 = Schema.Struct({
	kind: Schema.Literal("flag"),
	flag: Schema.NonEmptyString,
	path: Schema.NonEmptyString
});
const CliArgTemplatePart$1 = Schema.Union([
	CliArgTemplateLiteral$1,
	CliArgTemplateInput$1,
	CliArgTemplateOption$1,
	CliArgTemplateFlag$1
]);
Schema.Literals([
	"binary",
	"npx",
	"uvx",
	"bunx"
]);
Schema.Literals([
	"workspace",
	"configured",
	"call"
]);
Schema.Struct({
	sand_stdin_mode: Schema.optional(SandStdinMode),
	sand_result_mode: SandResultMode,
	streaming: Schema.optional(Schema.Boolean),
	timeout_ms: Schema.optional(Schema.Number)
});
const CliCommandBinding$1 = Schema.Struct({
	kind: Schema.Literal("cli_command"),
	tool_name: Schema.String,
	argv_template: Schema.Array(CliArgTemplatePart$1),
	sand_stdin_mode: SandStdinMode,
	sand_result_mode: SandResultMode,
	timeout_ms: Schema.optional(Schema.Number),
	streaming: Schema.optional(Schema.Boolean)
});
const ComposioToolBinding$1 = Schema.Struct({
	kind: Schema.Literal("composio"),
	/** Composio tool slug, e.g. `GMAIL_SEND_EMAIL`. The execute call targets this. */
	tool_slug: Schema.NonEmptyString,
	/** Owning toolkit slug, e.g. `gmail`. Informational; mirrors the source config. */
	toolkit_slug: Schema.optional(Schema.NonEmptyString),
	/** Pinned Composio tool version. Forwarded to the execute call when set. */
	version: Schema.optional(Schema.NonEmptyString)
});
Schema.Union([
	MCPToolBinding$1,
	MCPPromptBinding$1,
	MCPResourceReadBinding$1,
	MCPResourceTemplateBinding$1,
	ApiRequestBinding$1,
	ApiGraphqlBinding$1,
	CliCommandBinding$1,
	ComposioToolBinding$1
]);
const InvokeResultContent$1 = Schema.Struct({
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
	content: Schema.optional(Schema.Array(InvokeResultContent$1)),
	duration_ms: Schema.Number,
	invocation_id: Schema.String,
	run_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const ExecuteResultTextContent$1 = Schema.Struct({
	type: Schema.Literal("text"),
	mime_type: Schema.optional(Schema.String),
	text: Schema.String
});
const ExecuteResultJsonContent$1 = Schema.Struct({
	type: Schema.Literal("json"),
	mime_type: Schema.optional(Schema.String),
	json: Schema.Unknown
});
const ExecuteSkillBundleFile$1 = Schema.Struct({
	relative_path: Schema.String,
	content_base64: Schema.String,
	content_hash: Schema.String
});
const ExecuteSkillBundle$1 = Schema.Struct({
	slug: Schema.String,
	name: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	content: Schema.String,
	content_hash: Schema.String,
	source_commit: Schema.optional(Schema.String),
	files: Schema.optional(Schema.Array(ExecuteSkillBundleFile$1))
});
const ExecuteResultSkillBundleContent$1 = Schema.Struct({
	type: Schema.Literal("skill_bundle"),
	skill: ExecuteSkillBundle$1
});
const ExecuteResultContent$1 = Schema.Union([
	ExecuteResultTextContent$1,
	ExecuteResultJsonContent$1,
	ExecuteResultSkillBundleContent$1
]);
Schema.Struct({
	result: Schema.Unknown,
	error: Schema.optional(Schema.String),
	logs: Schema.optional(Schema.Unknown),
	mode: Schema.Union([Schema.Literal("dynamic_worker"), Schema.Literal("workflow")]),
	content: Schema.optional(Schema.Array(ExecuteResultContent$1)),
	warnings: Schema.optional(Schema.Array(Schema.Struct({
		namespace: Schema.String,
		tool: Schema.String,
		message: Schema.String
	}))),
	run_id: Schema.String.check(Schema.isUUID()),
	workflow_instance_id: Schema.optional(Schema.String)
});
const ToolSearchKind$1 = Schema.Literals([
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
const ToolSignatureHit$1 = Schema.Struct({
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
	kind: ToolSearchKind$1
});
Schema.Struct({
	hits: Schema.Array(ToolSignatureHit$1),
	results: Schema.Array(ToolSignatureHit$1),
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
	kind: ToolSearchKind$1
});
const ToolSchemaResponse$1 = Schema.Struct({
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
Schema.Struct({ data: Schema.Array(ToolSchemaResponse$1) });
Schema.Struct({
	data: Schema.Array(PluginTool$1),
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
	kind: SourceKind$1,
	tool_count: Schema.Number,
	status: SourceStatus$1,
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
const CredentialKind$1 = Schema.Literals([
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
	kind: CredentialKind$1,
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
const WorkspaceOAuthClient$1 = Schema.Struct({
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
	data: Schema.Array(WorkspaceOAuthClient$1),
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
const OAuthSetupHintsRegisterUrlSource$1 = Schema.Literals([
	"service_documentation",
	"resource_documentation",
	"authorization_server_origin",
	"none"
]);
Schema.Struct({
	display_name: Schema.String,
	redirect_uri: Schema.String,
	register_url: Schema.NullOr(Schema.String),
	register_url_source: OAuthSetupHintsRegisterUrlSource$1,
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
	source_status: Schema.optional(Schema.NullOr(SourceStatus$1)),
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
	data: Schema.Array(PluginSource$1),
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
const SourceAuthTestRedactedRequest$1 = Schema.Struct({
	method: Schema.NonEmptyString,
	url: Schema.NonEmptyString,
	headers: Schema.Record(Schema.String, Schema.String),
	body_preview: Schema.optional(Schema.String)
});
Schema.Struct({
	ok: Schema.Boolean,
	http_status: Schema.NullOr(Schema.Number),
	latency_ms: Schema.Number,
	redacted_request: SourceAuthTestRedactedRequest$1,
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
	source_visibility: SourceVisibility$1
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
	status: SourceStatus$1,
	source: PluginSource$1
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
	kind: SourceKind$1,
	namespace: NormalizedSourceNamespace,
	display_name: Schema.NonEmptyString,
	config: Schema.Unknown,
	auth_config: Schema.optional(Schema.Unknown),
	description: Schema.optional(Schema.String),
	category: Schema.optional(Schema.String),
	icon_url: Schema.optional(Schema.String),
	links: Schema.optional(Schema.Array(SourceLink$1)),
	source_visibility: Schema.optional(SourceVisibility$1)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus$1,
	source: PluginSource$1
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
	status: SourceVerificationStatus$1,
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
	verification: Schema.NullOr(SourceVerification$1)
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	verification: SourceVerification$1
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	status: SourceVerificationStatus$1,
	verified: Schema.Boolean,
	checked_at: Schema.String,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	slug: RegistrySlug$1,
	namespace: Schema.optional(NormalizedSourceNamespace),
	source_visibility: Schema.optional(SourceVisibility$1),
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
const PluginInstallJobStatus$1 = Schema.Literals([
	"pending",
	"running",
	"succeeded",
	"failed",
	"cancelled"
]);
const PluginInstallJob$1 = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	slug: RegistrySlug$1,
	namespace: SourceNamespace,
	status: PluginInstallJobStatus$1,
	error: Schema.optional(Schema.NullOr(Schema.String)),
	attempts: Schema.Number,
	payload_json: Schema.optional(Schema.NullOr(Schema.String)),
	created_by: Schema.optional(Schema.NullOr(Schema.String)),
	source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
	source_status: Schema.optional(Schema.NullOr(SourceStatus$1)),
	source_tool_count: Schema.optional(Schema.NullOr(Schema.Number)),
	source_error: Schema.optional(Schema.NullOr(Schema.String)),
	started_at: Schema.optional(Schema.NullOr(Schema.String)),
	finished_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	updated_at: Schema.String
});
Schema.Struct({
	data: Schema.Array(PluginInstallJob$1),
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
	status: Schema.optional(PluginInstallJobStatus$1),
	active: Schema.optional(Schema.Boolean),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const RegistryInstallJobResult$1 = Schema.Struct({
	job_id: Schema.String.check(Schema.isUUID()),
	status: PluginInstallJobStatus$1
});
const RegistryInstallSourceResult$1 = Schema.Struct({
	source_id: Schema.String.check(Schema.isUUID()),
	tool_count: Schema.Number,
	status: SourceStatus$1
});
Schema.Union([RegistryInstallJobResult$1, RegistryInstallSourceResult$1]);
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
const ToolSearchMode$1 = Schema.Literals([
	"auto",
	"vector",
	"lexical"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	kind: Schema.optional(Schema.Array(ToolSearchKind$1)),
	verbose: Schema.optional(Schema.Boolean),
	mode: Schema.optional(ToolSearchMode$1)
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
	kind: Schema.optional(CredentialKind$1)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.optional(Schema.String),
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind$1)
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
const CredentialListItem$1 = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: WorkspaceId,
	source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
	name: Schema.String,
	display_name: Schema.String,
	kind: CredentialKind$1,
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
	data: Schema.Array(CredentialListItem$1),
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
const ExtractedTool$1 = Schema.Struct({
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
	icons: Schema.optional(Schema.Array(McpIcon$1))
});
const DiscoverySourceMetadata$1 = Schema.Struct({
	protocol_version: Schema.optional(Schema.String),
	server_info: Schema.optional(Schema.Unknown),
	capabilities: Schema.optional(Schema.Unknown),
	instructions: Schema.optional(Schema.String),
	icons: Schema.optional(Schema.Array(McpIcon$1)),
	prompt_count: Schema.optional(Schema.Number),
	resource_count: Schema.optional(Schema.Number),
	resource_template_count: Schema.optional(Schema.Number)
});
Schema.Struct({
	tools: Schema.Array(ExtractedTool$1),
	shared_defs: Schema.optional(Schema.Unknown),
	source_metadata: Schema.optional(DiscoverySourceMetadata$1)
});
Schema.Struct({
	result: Schema.Unknown,
	content_type: Schema.String,
	content: Schema.optional(Schema.Array(InvokeResultContent$1)),
	upstream_status: Schema.optional(Schema.Number),
	duration_ms: Schema.optional(Schema.Number),
	status: Schema.optional(Schema.Number)
});
Schema.Struct({
	base_url: Schema.optional(Schema.String),
	default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	encryption_key: Schema.optional(Schema.String)
});
const McpOAuthDiscoveryResult$1 = Schema.Struct({
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
	oauth: Schema.NullOr(McpOAuthDiscoveryResult$1)
});
Schema.Struct({ expires_in_seconds: Schema.optional(Schema.Number) });
Schema.Struct({
	workspace_id: Schema.String,
	token: Schema.String,
	expires_at: Schema.String
});
const WorkspaceActivityEvent = Schema.Struct({
	version: Schema.Number,
	topic: Schema.String,
	payload: Schema.Unknown,
	created_at: Schema.String
});
Schema.Struct({
	version: Schema.Number,
	events: Schema.Array(WorkspaceActivityEvent),
	timed_out: Schema.Boolean,
	truncated: Schema.Boolean
});
Schema.Struct({ version: Schema.Number });
const WorkspaceNotification = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	version: Schema.Number,
	topic: Schema.String,
	payload: Schema.Unknown,
	created_at: Schema.String,
	read_at: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 100
	}))),
	offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)))
});
Schema.Struct({
	notifications: Schema.Array(WorkspaceNotification),
	unread_count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	notification_id: Schema.String
});
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({ marked: Schema.Number });
//#endregion
//#region ../core-effect/src/agent.ts
const OriginConfidence = Schema.Literals([
	"high",
	"pid",
	"none"
]);
Schema.Struct({
	id: AgentId,
	workspace_id: WorkspaceId,
	machine_id: Schema.String,
	agent_family: Schema.String,
	origin_confidence: OriginConfidence,
	origin_source: Schema.String,
	first_seen_at: Schema.String,
	last_seen_at: Schema.String,
	is_online: Schema.Boolean,
	display_name: Schema.NullOr(Schema.String),
	tags: Schema.String,
	metadata: Schema.String,
	created_by: Schema.String,
	created_at: Schema.String,
	updated_at: Schema.String
});
Schema.Struct({
	workspace_id: WorkspaceId,
	machine_id: Schema.NonEmptyString,
	agent_family: Schema.NonEmptyString,
	origin_confidence: OriginConfidence,
	origin_source: Schema.String,
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: AgentId,
	display_name: Schema.optional(Schema.String),
	tags: Schema.optional(Schema.Array(Schema.String)),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const AgentIconStyle = Schema.Literals(["color", "mono"]);
const AgentIconSpec = Schema.Struct({
	path: Schema.String,
	darkPath: Schema.optional(Schema.String),
	style: AgentIconStyle
});
const AgentCatalogKind = Schema.Literals(["local", "mcp"]);
const AgentInstallInstructionKind = Schema.Literals([
	"handoff",
	"mcp-shell",
	"markdown"
]);
const AgentInstallInstruction = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	kind: AgentInstallInstructionKind,
	command: Schema.optional(Schema.String),
	next: Schema.optional(Schema.String),
	instructions: Schema.optional(Schema.String)
});
Schema.Struct({
	slug: Schema.String,
	label: Schema.String,
	kind: AgentCatalogKind,
	icon: AgentIconSpec,
	iconPath: Schema.String,
	iconPathDark: Schema.String,
	envVars: Schema.Array(Schema.Struct({ name: Schema.String })),
	command: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	aliases: Schema.optional(Schema.Array(Schema.String)),
	installInstructions: Schema.optional(Schema.Array(AgentInstallInstruction))
});
const AgentConnectionStatus = Schema.Literals(["connected", "disconnected"]);
Schema.Struct({
	id: Schema.String,
	family: Schema.String,
	alias: Schema.String,
	label: Schema.String,
	icon: AgentIconSpec,
	status: AgentConnectionStatus,
	last_seen_at: Schema.String,
	origin_confidence: OriginConfidence,
	hostname: Schema.optional(Schema.String)
});
const InstallGuideTab = Schema.Struct({
	id: Schema.String,
	label: Schema.String,
	instructions: Schema.String
});
const InstallAgentGuide = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	icon: Schema.String,
	image_url: Schema.String,
	tabs: Schema.Array(InstallGuideTab)
});
Schema.Struct({
	workflow: Schema.NullOr(Schema.String),
	agents: Schema.Array(InstallAgentGuide)
});
Schema.Literals([
	"owner",
	"admin",
	"member",
	"viewer"
]);
Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	slug: Schema.String,
	role: Schema.optional(Schema.String),
	created_at: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String)
});
Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	role: Schema.String,
	workspace_id: Schema.String,
	invited_by: Schema.optional(Schema.String),
	created_at: Schema.optional(Schema.String),
	expires_at: Schema.optional(Schema.String),
	status: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: Schema.String,
	slug: Schema.String,
	client_id: Schema.String,
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String),
	updated_at: Schema.optional(Schema.String),
	created_by: Schema.optional(Schema.String)
});
Schema.Struct({
	clientName: Schema.NonEmptyString,
	clientVersion: Schema.NonEmptyString,
	machineId: Schema.optional(Schema.String),
	agentFamily: Schema.optional(Schema.String)
});
//#endregion
//#region ../core-effect/src/context.ts
const CONTEXT_TRACE_POLL_INTERVAL_MS = 360 * 60 * 1e3;
const CONTEXT_TRACE_MIN_CONSUME_GAP_MS = 300 * 60 * 1e3;
const CONTEXT_FRESHNESS_TTL_MS = 10080 * 60 * 1e3;
const CONTEXT_WORKSPACE_INACTIVITY_STOP_MS = 7200 * 60 * 1e3;
const ContextEntityId = Schema.NonEmptyString;
const ContextEntityKind = Schema.Literals([
	"workspace",
	"plugin_namespace",
	"topic_join",
	"team_member",
	"run_evidence"
]);
const ContextEntityStatus = Schema.Literals([
	"active",
	"partial",
	"blocked",
	"stale",
	"inactive"
]);
const ContextConfidence = Schema.Literals([
	"high",
	"medium",
	"low"
]);
const ContextProfileValue = Schema.Union([
	Schema.String,
	Schema.Number,
	Schema.Boolean,
	Schema.Array(Schema.String),
	Schema.Null
]);
const ContextProfileKv = Schema.Struct({
	key: Schema.NonEmptyString,
	value: ContextProfileValue,
	evidence: Schema.optional(Schema.String),
	confidence: ContextConfidence
});
const ContextQueryPath = Schema.Struct({
	intent: Schema.NonEmptyString,
	tool: Schema.NonEmptyString,
	when_to_use: Schema.String,
	required_inputs: Schema.Array(Schema.String),
	read_only: Schema.Boolean
});
const ContextEvidenceRef = Schema.Struct({
	kind: Schema.Literals([
		"path",
		"run_id",
		"trace_window",
		"url"
	]),
	value: Schema.NonEmptyString
});
const ContextSourceMetadata = Schema.Struct({
	source_id: Schema.optional(SourceId),
	namespace: SourceNamespace,
	status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	catalog_category: Schema.optional(Schema.String),
	auth_method: Schema.optional(Schema.String),
	refreshed_at: Timestamp
});
const ContextRefreshPolicy = Schema.Struct({
	auto_refresh: Schema.Boolean,
	freshness_ttl_ms: Schema.Number,
	trace_poll_interval_ms: Schema.Number,
	min_trace_consume_gap_ms: Schema.Number,
	stop_if_no_traces_for_ms: Schema.Number
});
Schema.decodeUnknownSync(ContextRefreshPolicy)({
	auto_refresh: true,
	freshness_ttl_ms: CONTEXT_FRESHNESS_TTL_MS,
	trace_poll_interval_ms: CONTEXT_TRACE_POLL_INTERVAL_MS,
	min_trace_consume_gap_ms: CONTEXT_TRACE_MIN_CONSUME_GAP_MS,
	stop_if_no_traces_for_ms: CONTEXT_WORKSPACE_INACTIVITY_STOP_MS
});
const ContextConsumptionState = Schema.Struct({
	last_trace_consumed_at: Schema.optional(Timestamp),
	last_trace_window_start_utc: Schema.optional(Timestamp),
	last_trace_window_end_utc: Schema.optional(Timestamp),
	last_trace_cursor: Schema.optional(Schema.String),
	last_user_activity_at: Schema.optional(Timestamp),
	auto_refresh_stopped_at: Schema.optional(Timestamp)
});
const ContextEntity = Schema.Struct({
	entity_id: ContextEntityId,
	kind: ContextEntityKind,
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	namespace: Schema.optional(SourceNamespace),
	title: Schema.NonEmptyString,
	status: ContextEntityStatus,
	confidence: ContextConfidence,
	profile_kv: Schema.Array(ContextProfileKv),
	query_paths: Schema.Array(ContextQueryPath),
	evidence: Schema.Array(ContextEvidenceRef),
	related_entity_ids: Schema.Array(ContextEntityId),
	source_metadata: Schema.optional(ContextSourceMetadata),
	refresh_policy: ContextRefreshPolicy,
	consumption_state: ContextConsumptionState,
	updated_at: Timestamp
});
const ContextMachineState = Schema.Struct({
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	entities: Schema.Record(Schema.String, ContextEntity),
	consumption_state: ContextConsumptionState,
	updated_at: Timestamp
});
const PluginNamespaceAddedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_added"),
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	catalog_category: Schema.optional(Schema.String),
	auth_method: Schema.optional(Schema.String),
	occurred_at: Timestamp
});
const PluginNamespaceReconnectedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_reconnected"),
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	occurred_at: Timestamp
});
const PluginNamespaceInstanceRefreshedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_instance_refreshed"),
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	occurred_at: Timestamp
});
const TraceWindowObservedTrigger = Schema.Struct({
	kind: Schema.Literal("trace_window_observed"),
	workspace_id: WorkspaceId,
	observed_at: Timestamp,
	window_start_utc: Timestamp,
	window_end_utc: Timestamp,
	new_trace_count: Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)),
	run_ids: Schema.Array(RunId)
});
const ManualContextRefreshRequestedTrigger = Schema.Struct({
	kind: Schema.Literal("manual_context_refresh_requested"),
	workspace_id: WorkspaceId,
	requested_at: Timestamp,
	scope: Schema.Literals(["workspace", "namespace"]),
	namespace: Schema.optional(SourceNamespace),
	requested_by: Schema.optional(UserId),
	reason: Schema.optional(Schema.String)
});
const TeamMemberAddedTrigger = Schema.Struct({
	kind: Schema.Literal("team_member_added"),
	workspace_id: WorkspaceId,
	member_id: UserId,
	name: Schema.NonEmptyString,
	email: Schema.optional(Schema.String),
	occurred_at: Timestamp
});
const FreshnessExpiredTrigger = Schema.Struct({
	kind: Schema.Literal("freshness_expired"),
	workspace_id: WorkspaceId,
	entity_id: ContextEntityId,
	observed_at: Timestamp
});
const WorkspaceInactivityObservedTrigger = Schema.Struct({
	kind: Schema.Literal("workspace_inactivity_observed"),
	workspace_id: WorkspaceId,
	observed_at: Timestamp,
	last_trace_at: Schema.optional(Timestamp),
	inactive_for_ms: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0))
});
Schema.Union([
	PluginNamespaceAddedTrigger,
	PluginNamespaceReconnectedTrigger,
	PluginNamespaceInstanceRefreshedTrigger,
	TraceWindowObservedTrigger,
	ManualContextRefreshRequestedTrigger,
	TeamMemberAddedTrigger,
	FreshnessExpiredTrigger,
	WorkspaceInactivityObservedTrigger
]);
const ContextCommand = Schema.Union([
	Schema.Struct({
		kind: Schema.Literal("create_or_refresh_namespace_entity"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("generate_namespace_profile"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("digest_trace_window"),
		window_start_utc: Timestamp,
		window_end_utc: Timestamp,
		run_ids: Schema.Array(RunId),
		read_only: Schema.Boolean,
		allow_plugin_exec: Schema.Boolean
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_workspace_context"),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_namespace_context"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_affected_joins"),
		entity_ids: Schema.Array(ContextEntityId),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("seed_team_member_queries"),
		member_id: UserId,
		name: Schema.NonEmptyString,
		email: Schema.optional(Schema.String)
	}),
	Schema.Struct({
		kind: Schema.Literal("mark_entity_stale"),
		entity_id: ContextEntityId,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("stop_auto_refresh"),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("noop"),
		reason: Schema.String
	})
]);
Schema.Struct({
	state: ContextMachineState,
	commands: Schema.Array(ContextCommand),
	receipts: Schema.Array(Schema.String)
});
Schema.Struct({
	id: Schema.String,
	action: Schema.String,
	resource_type: Schema.String,
	resource_id: Schema.NullOr(Schema.String),
	actor_id: Schema.String,
	actor_name: Schema.NullOr(Schema.String),
	metadata: Schema.NullOr(Schema.Unknown),
	created_at: Schema.String
});
const EventType = Schema.Literals([
	"run.started",
	"run.step",
	"run.tool_call",
	"run.tool_result",
	"run.output",
	"run.error",
	"run.completed",
	"run.failed"
]);
const EventItem = Schema.Struct({
	event_type: EventType,
	payload: Schema.optional(Schema.Unknown)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.String.check(Schema.isUUID()),
	events: Schema.Array(EventItem)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	event_type: Schema.optional(EventType),
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 500
	})))
});
Schema.Struct({
	id: Schema.String,
	run_id: Schema.String,
	workspace_id: Schema.String,
	event_type: Schema.String,
	payload: Schema.NullOr(Schema.Unknown),
	created_at: Schema.String
});
Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	issues: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 200
	}))),
	offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0))),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
//#endregion
//#region ../core-effect/src/trigger.ts
const TriggerId = Schema.NonEmptyString;
const TriggerDeliveryId = Schema.NonEmptyString;
const TriggerSourceKind = Schema.Literals([
	"schedule.cron",
	"schedule.once",
	"webhook.http"
]);
const TriggerKind = TriggerSourceKind;
const TriggerStatus = Schema.Literals([
	"draft",
	"active",
	"paused",
	"disabled",
	"failed"
]);
const TriggerDeliveryStatus = Schema.Literals([
	"queued",
	"claimed",
	"running",
	"completed",
	"failed",
	"skipped",
	"cancelled",
	"dead_lettered"
]);
Schema.Literals([
	"started",
	"completed",
	"failed",
	"retry_scheduled",
	"abandoned"
]);
const TriggerSetupKind = Schema.Literals([
	"webhook_url",
	"source_authorization",
	"secret",
	"schedule",
	"policy"
]);
const TriggerCheckStatus = Schema.Literals([
	"pass",
	"warn",
	"fail"
]);
const TriggerScheduleCatchUp = Schema.Literals([
	"none",
	"one",
	"all"
]);
const TriggerMisfireStrategy = Schema.Literals([
	"skip",
	"coalesce_latest",
	"enqueue"
]);
const TriggerConcurrencyOverflow = Schema.Literals([
	"queue",
	"skip",
	"coalesce_latest",
	"fail"
]);
const TriggerConcurrencyScope = Schema.Literals([
	"global",
	"workspace",
	"trigger",
	"job",
	"custom"
]);
const TriggerErrorReason = Schema.Literals([
	"invalid_trigger_kind",
	"invalid_config",
	"target_job_not_found",
	"target_version_not_ready",
	"target_not_triggerable",
	"input_mapping_invalid",
	"schedule_invalid",
	"webhook_verification_unavailable",
	"source_authorization_missing",
	"quota_exceeded",
	"policy_denied",
	"receipt_expired",
	"receipt_consumed",
	"idempotency_conflict",
	"concurrency_limit_exceeded"
]);
Schema.Struct({
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerOnceScheduleSpec = Schema.Struct({
	kind: Schema.Literal("schedule.once"),
	fire_at: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String)
});
const TriggerWebhookSignedPayloadPart = Schema.Union([
	Schema.Struct({ type: Schema.Literal("raw_body") }),
	Schema.Struct({
		type: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("static"),
		value: Schema.String
	})
]);
const TriggerWebhookVerification = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("shared_secret_header"),
		header: Schema.NonEmptyString,
		secret_sha256: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("hmac_sha256"),
		signature_header: Schema.NonEmptyString,
		secret: Schema.NonEmptyString,
		encoding: Schema.optional(Schema.Literals(["hex", "base64"])),
		prefix: Schema.optional(Schema.String),
		signed_payload: Schema.optional(Schema.Struct({
			separator: Schema.optional(Schema.String),
			parts: Schema.Array(TriggerWebhookSignedPayloadPart)
		})),
		tolerance_seconds: Schema.optional(Schema.Number),
		timestamp_header: Schema.optional(Schema.NonEmptyString)
	}),
	Schema.Struct({
		mode: Schema.Literal("standard_webhooks"),
		secret: Schema.NonEmptyString,
		tolerance_seconds: Schema.optional(Schema.Number)
	})
]);
const TriggerWebhookIdempotency = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("body_sha256") }),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({ mode: Schema.Literal("standard_webhooks_id") })
]);
const TriggerWebhookEventType = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("static"),
		value: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	})
]);
const TriggerWebhookSpec = Schema.Struct({
	kind: Schema.Literal("webhook.http"),
	event: Schema.optional(Schema.String),
	secret_ref: Schema.optional(Schema.String),
	max_event_bytes: Schema.optional(Schema.Number),
	verification: Schema.optional(TriggerWebhookVerification),
	idempotency: Schema.optional(TriggerWebhookIdempotency),
	event_type: Schema.optional(TriggerWebhookEventType)
});
const TriggerScheduleSpecWithKind = Schema.Struct({
	kind: Schema.Literal("schedule.cron"),
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerSourceConfig = Schema.Union([
	TriggerScheduleSpecWithKind,
	TriggerOnceScheduleSpec,
	TriggerWebhookSpec
]);
const TriggerInputPassthroughMapping = Schema.Struct({ mode: Schema.Literal("passthrough") });
const TriggerInputSourceEventMapping = Schema.Struct({
	mode: Schema.Literal("source_event"),
	schema: Schema.NonEmptyString
});
const TriggerInputDeclarativeMapping = Schema.Struct({
	mode: Schema.Literal("declarative"),
	fields: Schema.Record(Schema.String, Schema.NonEmptyString)
});
const TriggerInputMapping = Schema.Union([
	TriggerInputPassthroughMapping,
	TriggerInputSourceEventMapping,
	TriggerInputDeclarativeMapping
]);
const TriggerIdempotencyPolicy = Schema.Struct({
	key: Schema.Array(Schema.NonEmptyString),
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerConcurrencyPolicy = Schema.Struct({
	scope: Schema.optional(TriggerConcurrencyScope),
	key: Schema.Array(Schema.NonEmptyString),
	limit: Schema.Number,
	overflow: TriggerConcurrencyOverflow,
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerRetryPolicy = Schema.Struct({
	max_attempts: Schema.optional(Schema.Number),
	backoff: Schema.optional(Schema.Literals([
		"none",
		"fixed",
		"exponential"
	]))
});
const TriggerRetentionPolicy = Schema.Struct({
	event_ttl_seconds: Schema.optional(Schema.Number),
	delivery_ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerLimitCount = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1));
const TriggerLimitEventBytes = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1024));
const TriggerLimits = Schema.Struct({
	max_active_triggers: Schema.optional(TriggerLimitCount),
	max_active_schedules: Schema.optional(TriggerLimitCount),
	max_due_per_tick: Schema.optional(TriggerLimitCount),
	max_concurrent_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_cron_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_webhook_deliveries: Schema.optional(TriggerLimitCount),
	min_cron_interval_seconds: Schema.optional(TriggerLimitCount),
	max_event_bytes: Schema.optional(TriggerLimitEventBytes)
});
const TriggerableJobEventBinding = Schema.Struct({
	source_kind: TriggerSourceKind,
	event: Schema.optional(Schema.NonEmptyString),
	input_mapping: TriggerInputMapping,
	idempotency: Schema.optional(TriggerIdempotencyPolicy),
	concurrency: Schema.optional(TriggerConcurrencyPolicy),
	retry: Schema.optional(TriggerRetryPolicy),
	retention: Schema.optional(TriggerRetentionPolicy),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const TriggerableJobManifest = Schema.Struct({
	version: Schema.optional(Schema.Literal(1)),
	events: Schema.Array(TriggerableJobEventBinding)
});
const TriggerTargetJobRef = Schema.Struct({
	job: Schema.NonEmptyString,
	version: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits),
	activation: Schema.optional(Schema.Struct({
		name: Schema.optional(Schema.String),
		description: Schema.optional(Schema.String)
	}))
});
const TriggerCheck = Schema.Struct({
	code: Schema.NonEmptyString,
	status: TriggerCheckStatus,
	message: Schema.String,
	data: Schema.optional(Schema.Unknown)
});
const TriggerRequiredSetup = Schema.Struct({
	kind: TriggerSetupKind,
	status: Schema.Literals([
		"ready",
		"required",
		"missing"
	]),
	data: Schema.optional(Schema.Unknown)
});
const TriggerActivationDraft = Schema.Struct({
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits)
});
const TriggerActivateBody = Schema.Struct({
	workspace_id: WorkspaceId,
	inspect_receipt_id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	status: Schema.optional(Schema.Literals(["active", "paused"]))
});
Schema.Struct({
	ok: Schema.Boolean,
	receipt_id: Schema.NonEmptyString,
	expires_at: Schema.String,
	normalized: TriggerActivationDraft,
	target: Schema.Struct({
		job: Schema.NonEmptyString,
		version: Schema.String,
		compatible: Schema.Boolean,
		manifest: Schema.optional(TriggerableJobManifest)
	}),
	checks: Schema.Array(TriggerCheck),
	required_setup: Schema.Array(TriggerRequiredSetup),
	activation_body: Schema.optional(TriggerActivateBody),
	errors: Schema.optional(Schema.Array(Schema.Struct({
		reason: TriggerErrorReason,
		message: Schema.String,
		path: Schema.optional(Schema.String)
	})))
});
const TriggerRecord = Schema.Struct({
	id: TriggerId,
	workspace_id: WorkspaceId,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	kind: TriggerKind,
	status: TriggerStatus,
	target_job_name: Schema.String,
	target_version_name: Schema.String,
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	created_at: Schema.String,
	updated_at: Schema.String,
	activated_at: Schema.NullOr(Schema.String),
	paused_at: Schema.NullOr(Schema.String),
	disabled_at: Schema.NullOr(Schema.String)
});
const TriggerDeliveryRecord = Schema.Struct({
	id: TriggerDeliveryId,
	workspace_id: WorkspaceId,
	trigger_id: TriggerId,
	kind: TriggerKind,
	status: TriggerDeliveryStatus,
	scheduled_for: Schema.NullOr(Schema.String),
	source_delivery_id: Schema.NullOr(Schema.String),
	idempotency_key: Schema.String,
	run_id: Schema.NullOr(Schema.String),
	job_invocation_id: Schema.NullOr(Schema.String),
	attempt_count: Schema.Number,
	next_attempt_at: Schema.NullOr(Schema.String),
	error_reason: Schema.NullOr(Schema.String),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId,
	reason: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	status: Schema.optional(TriggerStatus),
	kind: Schema.optional(TriggerKind),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	triggers: Schema.Array(TriggerRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: Schema.optional(TriggerId),
	status: Schema.optional(TriggerDeliveryStatus),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	deliveries: Schema.Array(TriggerDeliveryRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId
});
Schema.Struct({ delivery: TriggerDeliveryRecord });
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
//#endregion
//#region ../core-effect/src/orbit.ts
const OrbitWorkspaceId = WorkspaceId;
Schema.Literals([
	"kv",
	"blob",
	"log",
	"job",
	"app"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.optional(RunId)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	key: Schema.NonEmptyString,
	content_type: Schema.optional(Schema.String),
	size_bytes: Schema.optional(Schema.Number)
});
const OrbitStorageKey = Schema.NonEmptyString.check(Schema.isMaxLength(512), Schema.isPattern(/^(?![\\/])(?!.*\.\.).+$/));
const OrbitStorageEncoding = Schema.Union([
	Schema.Literal("auto"),
	Schema.Literal("metadata"),
	Schema.Literal("text"),
	Schema.Literal("json"),
	Schema.Literal("base64")
]);
const OrbitStorageObject = Schema.Struct({
	key: OrbitStorageKey,
	size: Schema.Number,
	uploaded: Schema.String,
	content_type: Schema.String,
	download_url: Schema.String,
	expires_at: Schema.String,
	expires_in_seconds: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	prefix: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	objects: Schema.Array(OrbitStorageObject),
	truncated: Schema.Boolean,
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey,
	data: Schema.Unknown,
	content_type: Schema.optional(Schema.String),
	encoding: Schema.optional(Schema.Union([
		Schema.Literal("text"),
		Schema.Literal("json"),
		Schema.Literal("base64")
	]))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey,
	encoding: Schema.optional(OrbitStorageEncoding)
});
Schema.NullOr(Schema.Struct({
	...OrbitStorageObject.fields,
	encoding: Schema.Union([
		Schema.Literal("metadata"),
		Schema.Literal("text"),
		Schema.Literal("json"),
		Schema.Literal("base64")
	]),
	data: Schema.optional(Schema.Unknown)
}));
const OrbitStorageReadEncoding = Schema.Union([
	Schema.Literal("bytes"),
	Schema.Literal("text"),
	Schema.Literal("base64")
]);
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey,
	offset: Schema.optional(Schema.Number),
	length: Schema.optional(Schema.Number),
	encoding: Schema.optional(OrbitStorageReadEncoding)
});
Schema.Struct({
	bytes: Schema.optional(Schema.Uint8Array),
	text: Schema.optional(Schema.String),
	data_base64: Schema.optional(Schema.String),
	size: Schema.Number,
	offset: Schema.Number,
	length: Schema.Number,
	eof: Schema.Boolean,
	content_type: Schema.String
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey
});
Schema.Struct({
	key: OrbitStorageKey,
	download_url: Schema.String,
	expires_at: Schema.String,
	expires_in_seconds: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey
});
Schema.Struct({
	deleted: Schema.Boolean,
	key: OrbitStorageKey
});
const OrbitAiModelTask = Schema.Union([
	Schema.Literal("text-generation"),
	Schema.Literal("text-embeddings"),
	Schema.Literal("classification"),
	Schema.Literal("rerank"),
	Schema.Literal("summarization")
]);
const OrbitAiModel = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	task: OrbitAiModelTask,
	provider: Schema.optional(Schema.String),
	fast: Schema.optional(Schema.Boolean),
	reasoning: Schema.optional(Schema.Boolean),
	vision: Schema.optional(Schema.Boolean)
});
const OrbitAiModelsResultInfo = Schema.Struct({
	count: Schema.optional(Schema.Number),
	page: Schema.optional(Schema.Number),
	per_page: Schema.optional(Schema.Number),
	total_count: Schema.optional(Schema.Number),
	total_pages: Schema.optional(Schema.Number)
});
Schema.Struct({
	models: Schema.Array(OrbitAiModel),
	workspace_allowed: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
	source: Schema.optional(Schema.String),
	fallback_reason: Schema.optional(Schema.String),
	result_info: Schema.optional(OrbitAiModelsResultInfo)
});
Schema.Struct({
	model: Schema.optional(Schema.String),
	temperature: Schema.optional(Schema.Number),
	max_tokens: Schema.optional(Schema.Number)
});
Schema.Struct({
	model: Schema.optional(Schema.String),
	input: Schema.Unknown,
	temperature: Schema.optional(Schema.Number),
	max_tokens: Schema.optional(Schema.Number)
});
Schema.Struct({
	model: Schema.String,
	text: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	summary: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	embeddings: Schema.Array(Schema.Array(Schema.Number)),
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	label: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	ranking: Schema.Unknown,
	raw: Schema.Unknown
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	run_id: Schema.optional(Schema.String),
	operation: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
const OrbitUsageRow = Schema.Struct({
	id: Schema.String,
	run_id: Schema.NullOr(Schema.String),
	workspace_id: OrbitWorkspaceId,
	operation: Schema.String,
	key: Schema.NullOr(Schema.String),
	model: Schema.NullOr(Schema.String),
	size_bytes: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	error: Schema.NullOr(Schema.String),
	created_at: Schema.String
});
Schema.Struct({
	data: Schema.Array(OrbitUsageRow),
	limit: Schema.Number,
	offset: Schema.Number
});
const OrbitJobName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/));
const OrbitJobVersion = Schema.NonEmptyString.check(Schema.isMaxLength(32), Schema.isPattern(/^v[1-9][0-9]*$/));
const OrbitJobStatus = Schema.Union([
	Schema.Literal("ready"),
	Schema.Literal("disabled"),
	Schema.Literal("failed")
]);
const OrbitJobVersionStatus = Schema.Union([
	Schema.Literal("validating"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitJobExecutionLane = Schema.Union([
	Schema.Literal("dynamic_worker"),
	Schema.Literal("worker_platform"),
	Schema.Literal("container"),
	Schema.Literal("local_host")
]);
const OrbitJobRunLane = Schema.Literal("worker_platform");
const OrbitJobCapability = Schema.Union([
	Schema.Literal("storage"),
	Schema.Literal("cache"),
	Schema.Literal("ai"),
	Schema.Literal("plugins"),
	Schema.Literal("memory"),
	Schema.Literal("data"),
	Schema.Literal("workflow"),
	Schema.Literal("sessions"),
	Schema.Literal("socket")
]);
const OrbitJobKind = Schema.Union([
	Schema.Literal("query"),
	Schema.Literal("mutation"),
	Schema.Literal("task")
]);
const OrbitJobIdempotency = Schema.Struct({
	required: Schema.optional(Schema.Boolean),
	key: Schema.optional(Schema.Union([Schema.String, Schema.Array(Schema.String)])),
	ttl_seconds: Schema.optional(Schema.Number)
});
const OrbitJobRetryPolicy = Schema.Struct({
	max_attempts: Schema.optional(Schema.Number),
	backoff: Schema.optional(Schema.Union([
		Schema.Literal("none"),
		Schema.Literal("fixed"),
		Schema.Literal("exponential")
	]))
});
const OrbitJobRetentionPolicy = Schema.Struct({
	run_ttl_seconds: Schema.optional(Schema.Number),
	artifact_ttl_seconds: Schema.optional(Schema.Number)
});
const OrbitJobPublishRuntime = Schema.Union([
	Schema.Literal("classic"),
	Schema.Literal("bundled"),
	Schema.Literal("define_job")
]);
const OrbitJobPublishBundle = Schema.Struct({
	code: Schema.NonEmptyString,
	sourcemap: Schema.optional(Schema.String),
	hash: Schema.NonEmptyString,
	bytes: Schema.Number
});
const OrbitJsonSchema = Schema.Record(Schema.String, Schema.Unknown);
const OrbitJobArtifactRef = Schema.Struct({
	id: Schema.String,
	kind: Schema.String,
	url: Schema.optional(Schema.String)
});
const OrbitJobDeploymentProvider = Schema.Union([
	Schema.Literal("cloudflare_wfp"),
	Schema.Literal("cloudflare_container"),
	Schema.Literal("local")
]);
const OrbitJobDeploymentStatus = Schema.Union([
	Schema.Literal("promoting"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitJobSummary = Schema.Struct({
	name: OrbitJobName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitJobVersion),
	status: OrbitJobStatus,
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	lane: Schema.optional(Schema.NullOr(OrbitJobExecutionLane)),
	capabilities: Schema.Array(OrbitJobCapability),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String
});
const OrbitJobVersionRecord = Schema.Struct({
	version: OrbitJobVersion,
	status: OrbitJobVersionStatus,
	lane: OrbitJobExecutionLane,
	capabilities: Schema.Array(OrbitJobCapability),
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	error_message: Schema.NullOr(Schema.String)
});
const OrbitJobDetail = Schema.Struct({
	name: OrbitJobName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitJobVersion),
	status: OrbitJobStatus,
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	lane: Schema.optional(Schema.NullOr(OrbitJobExecutionLane)),
	capabilities: Schema.Array(OrbitJobCapability),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String)),
	input_schema: Schema.NullOr(OrbitJsonSchema),
	output_schema: Schema.NullOr(OrbitJsonSchema),
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	versions: Schema.Array(OrbitJobVersionRecord)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	jobs: Schema.Array(OrbitJobSummary),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion)
});
Schema.Struct({ job: OrbitJobDetail });
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	description: Schema.optional(Schema.String),
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	input_binding: Schema.optional(Schema.String),
	input_schema: Schema.optional(OrbitJsonSchema),
	output_schema: Schema.optional(OrbitJsonSchema),
	capabilities: Schema.optional(Schema.Array(OrbitJobCapability)),
	timeout_ms: Schema.optional(Schema.Number),
	idempotency: Schema.optional(OrbitJobIdempotency),
	retry: Schema.optional(OrbitJobRetryPolicy),
	retention: Schema.optional(OrbitJobRetentionPolicy),
	trigger_manifest: Schema.optional(TriggerableJobManifest),
	compatibility_date: Schema.optional(Schema.String),
	code: Schema.NonEmptyString,
	runtime: Schema.optional(OrbitJobPublishRuntime),
	bundle: Schema.optional(OrbitJobPublishBundle),
	idempotency_key: Schema.optional(Schema.String),
	allow_generic_schema: Schema.optional(Schema.Boolean)
});
Schema.Struct({
	job: Schema.Struct({
		name: OrbitJobName,
		version: OrbitJobVersion,
		status: OrbitJobVersionStatus,
		lane: Schema.optional(OrbitJobExecutionLane),
		deployment_id: Schema.optional(Schema.String),
		capabilities: Schema.Array(OrbitJobCapability)
	}),
	timing: Schema.optional(Schema.Struct({
		validate_ms: Schema.optional(Schema.Number),
		schema_normalize_ms: Schema.optional(Schema.Number),
		source_store_ms: Schema.optional(Schema.Number),
		wfp_upload_ms: Schema.optional(Schema.Number),
		deploy_ping_ms: Schema.optional(Schema.Number),
		total_ms: Schema.Number
	}))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion),
	input: Schema.optional(Schema.Unknown),
	timeout_ms: Schema.optional(Schema.Number),
	lane: Schema.optional(OrbitJobRunLane),
	idempotency_key: Schema.optional(Schema.String)
});
Schema.Struct({
	ok: Schema.Boolean,
	job: OrbitJobName,
	version: OrbitJobVersion,
	run_id: Schema.String,
	duration_ms: Schema.Number,
	output: Schema.Unknown,
	artifacts: Schema.Array(OrbitJobArtifactRef),
	lane_used: Schema.optional(OrbitJobExecutionLane),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName
});
Schema.Struct({
	name: OrbitJobName,
	versions: Schema.Array(OrbitJobVersionRecord)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion)
});
Schema.Struct({
	name: OrbitJobName,
	version: Schema.NullOr(OrbitJobVersion),
	disabled: Schema.Boolean
});
const OrbitJobInvocationStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed"),
	Schema.Literal("cancelled")
]);
const OrbitJobCallerKind = Schema.Union([
	Schema.Literal("user"),
	Schema.Literal("agent"),
	Schema.Literal("workflow"),
	Schema.Literal("system"),
	Schema.Literal("trigger")
]);
const OrbitJobInvocationSummary = Schema.Struct({
	id: Schema.String,
	job: OrbitJobName,
	version: OrbitJobVersion,
	status: OrbitJobInvocationStatus,
	caller_kind: OrbitJobCallerKind,
	caller_id: Schema.NullOr(Schema.String),
	lane_used: Schema.NullOr(OrbitJobExecutionLane),
	deployment_id: Schema.NullOr(Schema.String),
	run_id: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	error_code: Schema.NullOr(Schema.String),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
const OrbitJobInvocationDetail = Schema.Struct({
	...OrbitJobInvocationSummary.fields,
	input: Schema.Unknown,
	output: Schema.Unknown,
	output_ref: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: Schema.optional(OrbitJobName),
	version: Schema.optional(OrbitJobVersion),
	status: Schema.optional(OrbitJobInvocationStatus),
	caller_kind: Schema.optional(OrbitJobCallerKind),
	since: Schema.optional(Schema.String),
	before: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	invocations: Schema.Array(OrbitJobInvocationSummary),
	next_cursor: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	invocation_id: Schema.NonEmptyString
});
Schema.Struct({ invocation: OrbitJobInvocationDetail });
const OrbitAppName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/));
const OrbitAppVersion = Schema.NonEmptyString.check(Schema.isMaxLength(32), Schema.isPattern(/^v[1-9][0-9]*$/));
const OrbitAppStatus = Schema.Union([
	Schema.Literal("ready"),
	Schema.Literal("disabled"),
	Schema.Literal("failed")
]);
const OrbitAppVersionStatus = Schema.Union([
	Schema.Literal("validating"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitAppRouteMethod = Schema.Union([
	Schema.Literal("GET"),
	Schema.Literal("POST"),
	Schema.Literal("PUT"),
	Schema.Literal("PATCH"),
	Schema.Literal("DELETE"),
	Schema.Literal("OPTIONS")
]);
const OrbitAppRouteAuth = Schema.Union([
	Schema.Literal("public"),
	Schema.Literal("workspace_member"),
	Schema.Literal("signed_link"),
	Schema.Literal("service")
]);
const OrbitAppAccess = Schema.Union([Schema.Literal("public"), Schema.Literal("workspace_member")]);
const OrbitAppInputAdapter = Schema.Union([
	Schema.Literal("none"),
	Schema.Literal("query"),
	Schema.Literal("json"),
	Schema.Literal("form"),
	Schema.Literal("raw")
]);
const OrbitAppOutputAdapter = Schema.Union([
	Schema.Literal("html"),
	Schema.Literal("json"),
	Schema.Literal("text"),
	Schema.Literal("redirect"),
	Schema.Literal("passthrough")
]);
const OrbitAppRoutePermission = Schema.Struct({
	action: Schema.String,
	resource: Schema.optional(Schema.String)
});
const OrbitAppTransform = Schema.Struct({
	kind: Schema.Union([
		Schema.Literal("none"),
		Schema.Literal("template"),
		Schema.Literal("jsonpath")
	]),
	value: Schema.optional(Schema.String)
});
const OrbitAppRateLimit = Schema.Struct({
	window_seconds: Schema.Number,
	max: Schema.Number
});
const OrbitAppJobRef = Schema.Struct({
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion),
	input_schema: Schema.optional(OrbitJsonSchema),
	output_schema: Schema.optional(OrbitJsonSchema),
	description: Schema.optional(Schema.String)
});
const OrbitAppRoute = Schema.Struct({
	method: OrbitAppRouteMethod,
	path: Schema.NonEmptyString,
	id: Schema.optional(Schema.String),
	title: Schema.optional(Schema.String),
	tags: Schema.optional(Schema.Array(Schema.String)),
	auth: OrbitAppRouteAuth,
	permissions: Schema.optional(Schema.Array(OrbitAppRoutePermission)),
	input: OrbitAppInputAdapter,
	output: OrbitAppOutputAdapter,
	input_transform: Schema.optional(OrbitAppTransform),
	output_transform: Schema.optional(OrbitAppTransform),
	job: Schema.optional(Schema.NonEmptyString),
	static_html: Schema.optional(Schema.NonEmptyString),
	rate_limit: Schema.optional(OrbitAppRateLimit)
});
const OrbitAppTheme = Schema.Struct({
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	accent: Schema.optional(Schema.String)
});
const OrbitAppPublishRuntime = Schema.Union([Schema.Literal("classic"), Schema.Literal("bundled")]);
const OrbitAppPublishBundle = Schema.Struct({
	code: Schema.NonEmptyString,
	sourcemap: Schema.optional(Schema.String),
	hash: Schema.NonEmptyString,
	bytes: Schema.Number
});
const OrbitAppSummary = Schema.Struct({
	name: OrbitAppName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitAppVersion),
	status: OrbitAppStatus,
	url: Schema.NullOr(Schema.String),
	access: OrbitAppAccess,
	created_at: Schema.String
});
const OrbitAppVersionRecord = Schema.Struct({
	version: OrbitAppVersion,
	status: OrbitAppVersionStatus,
	route_count: Schema.Number,
	job_count: Schema.Number,
	created_at: Schema.String,
	error_message: Schema.NullOr(Schema.String)
});
const OrbitAppDetail = Schema.Struct({
	name: OrbitAppName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitAppVersion),
	status: OrbitAppStatus,
	url: Schema.NullOr(Schema.String),
	access: OrbitAppAccess,
	routes: Schema.Array(OrbitAppRoute),
	jobs: Schema.Record(Schema.String, OrbitAppJobRef),
	versions: Schema.Array(OrbitAppVersionRecord)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	apps: Schema.Array(OrbitAppSummary),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	version: Schema.optional(OrbitAppVersion)
});
Schema.Struct({ app: OrbitAppDetail });
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	description: Schema.optional(Schema.String),
	code: Schema.NonEmptyString,
	runtime: Schema.optional(OrbitAppPublishRuntime),
	bundle: Schema.optional(OrbitAppPublishBundle),
	routes: Schema.Array(OrbitAppRoute),
	jobs: Schema.Record(Schema.String, OrbitAppJobRef),
	theme: Schema.optional(OrbitAppTheme),
	allowed_origins: Schema.optional(Schema.Array(Schema.String)),
	idempotency_key: Schema.optional(Schema.String)
});
Schema.Struct({ app: Schema.Struct({
	name: OrbitAppName,
	version: OrbitAppVersion,
	status: OrbitAppVersionStatus,
	url: Schema.String
}) });
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	version: Schema.optional(OrbitAppVersion)
});
Schema.Struct({
	name: OrbitAppName,
	version: Schema.NullOr(OrbitAppVersion),
	disabled: Schema.Boolean
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	access: OrbitAppAccess
});
Schema.Struct({
	name: OrbitAppName,
	access: OrbitAppAccess,
	routes_updated: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	path: Schema.optional(Schema.String)
});
Schema.Struct({
	name: OrbitAppName,
	url: Schema.String
});
const OrbitAppInvocationStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed"),
	Schema.Literal("denied"),
	Schema.Literal("rate_limited")
]);
const OrbitAppActorKind = Schema.Union([
	Schema.Literal("anonymous"),
	Schema.Literal("workspace_user"),
	Schema.Literal("signed_link"),
	Schema.Literal("service")
]);
const OrbitAppJobCallStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed")
]);
const OrbitAppInvocationSummary = Schema.Struct({
	id: Schema.String,
	app: OrbitAppName,
	version: OrbitAppVersion,
	deployment_id: Schema.NullOr(Schema.String),
	method: Schema.String,
	path: Schema.String,
	route_job: Schema.NullOr(Schema.String),
	actor_kind: OrbitAppActorKind,
	actor_id: Schema.NullOr(Schema.String),
	status: OrbitAppInvocationStatus,
	status_code: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String),
	job_call_count: Schema.Number
});
const OrbitAppJobCallSummary = Schema.Struct({
	id: Schema.String,
	job_invocation_id: Schema.NullOr(Schema.String),
	job_name: Schema.String,
	job_version: Schema.NullOr(Schema.String),
	route_job: Schema.NullOr(Schema.String),
	status: OrbitAppJobCallStatus,
	error_message: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	run_id: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: Schema.optional(OrbitAppName),
	version: Schema.optional(OrbitAppVersion),
	route_job: Schema.optional(Schema.String),
	status: Schema.optional(OrbitAppInvocationStatus),
	actor_kind: Schema.optional(OrbitAppActorKind),
	since: Schema.optional(Schema.String),
	before: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	invocations: Schema.Array(OrbitAppInvocationSummary),
	next_cursor: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	invocation_id: Schema.NonEmptyString
});
Schema.Struct({
	invocation: OrbitAppInvocationSummary,
	job_calls: Schema.Array(OrbitAppJobCallSummary)
});
const OrbitAppActivityKind = Schema.Union([
	Schema.Literal("invocation"),
	Schema.Literal("version_change"),
	Schema.Literal("admin_change")
]);
const OrbitAppActivityRow = Schema.Struct({
	id: Schema.String,
	kind: OrbitAppActivityKind,
	type: Schema.String,
	activity: Schema.String,
	created_at: Schema.String
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	activity: Schema.Array(OrbitAppActivityRow),
	next_cursor: Schema.NullOr(Schema.String)
});
const OrbitSocketChannel = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/));
const OrbitSocketPermission = Schema.Union([Schema.Literal("receive"), Schema.Literal("send")]);
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel,
	permissions: Schema.optional(Schema.Array(OrbitSocketPermission)),
	expires_in_seconds: Schema.optional(Schema.Number),
	allowed_origins: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	channel: OrbitSocketChannel,
	url: Schema.String,
	expires_at: Schema.String
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel,
	event: Schema.Unknown
});
Schema.Struct({
	channel: OrbitSocketChannel,
	delivered: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel
});
Schema.Struct({
	channel: OrbitSocketChannel,
	connections: Schema.Number
});
const OrbitDbTableName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-zA-Z_][a-zA-Z0-9_-]{0,127}$/));
const OrbitDbTableSummary = Schema.Struct({
	name: OrbitDbTableName,
	type: Schema.Union([Schema.Literal("table"), Schema.Literal("view")]),
	row_count: Schema.NullOr(Schema.Number),
	columns: Schema.Array(Schema.Struct({
		name: Schema.String,
		type: Schema.String,
		notnull: Schema.Boolean,
		pk: Schema.Boolean
	}))
});
Schema.Struct({ workspace_id: OrbitWorkspaceId });
Schema.Struct({
	workspace_database_id: Schema.NullOr(Schema.String),
	workspace_database_name: Schema.NullOr(Schema.String),
	status: Schema.Union([
		Schema.Literal("ready"),
		Schema.Literal("creating"),
		Schema.Literal("failed"),
		Schema.Literal("disabled")
	]),
	tables: Schema.Array(OrbitDbTableSummary)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	table: OrbitDbTableName,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	table: OrbitDbTableName,
	columns: Schema.Array(Schema.String),
	rows: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
	truncated: Schema.Boolean,
	total_rows: Schema.NullOr(Schema.Number)
});
const OrbitReadinessSubjectKind = Schema.Union([
	Schema.Literal("orbit_job_version"),
	Schema.Literal("orbit_app_version"),
	Schema.Literal("plugin_tool")
]);
Schema.Union([
	Schema.Literal("deploy_ping"),
	Schema.Literal("schema"),
	Schema.Literal("risk"),
	Schema.Literal("quality"),
	Schema.Literal("smoke")
]);
const OrbitReadinessStatus = Schema.Union([
	Schema.Literal("queued"),
	Schema.Literal("running"),
	Schema.Literal("healthy"),
	Schema.Literal("degraded"),
	Schema.Literal("broken"),
	Schema.Literal("skipped")
]);
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	subject_kind: OrbitReadinessSubjectKind,
	subject_id: Schema.String,
	status: OrbitReadinessStatus,
	summary: Schema.Record(Schema.String, Schema.Unknown),
	last_check_id: Schema.NullOr(Schema.String),
	checked_at: Schema.NullOr(Schema.String),
	changed_at: Schema.String,
	updated_at: Schema.String
});
const OrbitBrandName = Schema.NonEmptyString.check(Schema.isMaxLength(128));
const OrbitBrandLogoUrl = Schema.NonEmptyString.check(Schema.isMaxLength(2048));
const OrbitBrandColor = Schema.NonEmptyString.check(Schema.isMaxLength(64), Schema.isPattern(/^\d*\.?\d+\s+\d*\.?\d+\s+\d*\.?\d+$/));
const OrbitBrandFontFamily = Schema.NonEmptyString.check(Schema.isMaxLength(256));
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	brand_name: Schema.optional(OrbitBrandName),
	brand_logo_url: Schema.optional(OrbitBrandLogoUrl),
	primary_color: Schema.optional(OrbitBrandColor),
	accent_color: Schema.optional(OrbitBrandColor),
	font_family: Schema.optional(OrbitBrandFontFamily),
	dark_mode_default: Schema.Boolean,
	created_at: Schema.String,
	updated_at: Schema.String,
	updated_by: Schema.optional(Schema.String)
});
const ORBIT_PRIMITIVE_KEYS = [
	"storage_put",
	"storage_get",
	"storage_list",
	"storage_delete",
	"storage_url",
	"storage_read",
	"cache_get",
	"cache_set",
	"cache_delete",
	"socket_url",
	"socket_broadcast",
	"socket_stats",
	"tools_search",
	"tools_describe",
	"tools_namespaces",
	"db_exec",
	"db_query",
	"db_first",
	"db_batch",
	"ai_run",
	"ai_generate",
	"ai_summarize",
	"ai_embed",
	"ai_classify",
	"ai_rerank",
	"ai_models"
];
const WFP_NATIVE_PRIMITIVE_KEYS = [
	"db_exec",
	"db_query",
	"db_first",
	"db_batch"
];
ORBIT_PRIMITIVE_KEYS.filter((key) => !WFP_NATIVE_PRIMITIVE_KEYS.includes(key));
//#endregion
//#region ../core-effect/src/rate-limit.ts
const NonNegativeInteger = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0));
const PositiveInteger = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1));
const RateLimitScope = Schema.Literals([
	"workspace",
	"user",
	"agent",
	"ip",
	"public"
]);
Schema.Struct({
	id: Schema.String,
	scope: RateLimitScope,
	windowMs: PositiveInteger,
	max: PositiveInteger,
	costUnit: Schema.optional(Schema.String)
});
const RateLimitBucketSnapshot = Schema.Struct({
	windowStartMs: NonNegativeInteger,
	count: NonNegativeInteger
});
const RateLimitInfo = Schema.Struct({
	policy_id: Schema.String,
	scope: RateLimitScope,
	limit: PositiveInteger,
	window_ms: PositiveInteger,
	remaining: NonNegativeInteger,
	reset_at_ms: PositiveInteger
});
Schema.Struct({
	allowed: Schema.Boolean,
	retryAfterSec: NonNegativeInteger,
	remaining: NonNegativeInteger,
	resetAtMs: PositiveInteger,
	bucket: RateLimitBucketSnapshot,
	info: RateLimitInfo
});
Schema.Struct({
	success: Schema.Literal(false),
	error: Schema.String,
	retry_after_sec: PositiveInteger,
	rate_limit: RateLimitInfo
});
Context.Service("@hrbr/core/RateLimiter");
//#endregion
//#region ../core-effect/src/registry.ts
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
	MCPToolBinding$1,
	CliCommandBinding$1,
	ApiRequestBinding$1,
	ApiGraphqlBinding$1
]);
const PluginRegistryManifestTool = Schema.Struct({
	tool_id: RegistryToolIdentifier$1,
	name: RegistryToolIdentifier$1,
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
	env: SecretName,
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
	links: Schema.Array(SourceLink$1),
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
	links: Schema.Array(SourceLink$1),
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
	auth_template: AuthTemplate$1
});
const PluginRegistryAuth = Schema.Struct({
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
	required_secrets: Schema.Array(SecretName)
});
const PluginRegistryOAuthClientSeed = Schema.Struct({
	client_id: Schema.optional(Schema.NonEmptyString),
	client_secret: Schema.optional(Schema.NonEmptyString),
	redirect_uri: Schema.optional(Schema.NonEmptyString),
	scope: Schema.optional(Schema.NonEmptyString)
});
const PluginRegistrySkill = Schema.Struct({ slug: Schema.optional(RegistrySlug$1) });
const PluginRegistryEntryFields = {
	slug: RegistrySlug$1,
	display_name: Schema.NonEmptyString,
	description: Schema.NonEmptyString,
	category: PluginCategory,
	auth: PluginRegistryAuth,
	oauth_client: Schema.optional(PluginRegistryOAuthClientSeed),
	auth_test: Schema.optional(PluginRegistryAuthTest),
	links: Schema.optional(Schema.Array(SourceLink$1)),
	icon_url: Schema.optional(Schema.NonEmptyString),
	skill: Schema.optional(PluginRegistrySkill),
	default_namespace: SourceNamespace,
	popularity: Schema.optional(Schema.Number),
	is_oauth_client_configured: Schema.optional(Schema.Boolean)
};
const PluginRegistryMcpConfig = Schema.Struct({
	mcp_endpoint: Schema.NonEmptyString,
	mcp_transport: Schema.Literals(["http", "sse"]),
	oauth_discovery: Schema.optional(OAuthDiscovery),
	mcp_default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	composio_auth_config_id: Schema.optional(Schema.NonEmptyString)
});
const PluginRegistryCliConfig = Schema.Struct({
	cli_launcher: Schema.Literals([
		"binary",
		"npx",
		"uvx",
		"bunx"
	]),
	cli_command: Schema.NonEmptyString,
	cli_args: Schema.optional(Schema.Array(Schema.String)),
	cli_cwd_policy: Schema.Literals([
		"workspace",
		"configured",
		"call"
	]),
	cli_cwd: Schema.optional(Schema.String),
	cli_allowed_env_keys: Schema.optional(Schema.Array(SecretName)),
	sand_sandbox_policy: Schema.optional(SandIsolationPolicy),
	sand_secret_bindings: Schema.optional(Schema.Array(SandSecretBinding)),
	sand_runtime: Schema.optional(SandRuntimeSpec),
	cli_result_defaults: Schema.optional(Schema.Struct({
		sand_stdin_mode: Schema.optional(Schema.Literals([
			"none",
			"json",
			"text"
		])),
		sand_result_mode: Schema.Literals([
			"json_stdout",
			"stdout_text",
			"binary_base64",
			"exit_code_only"
		]),
		streaming: Schema.optional(Schema.Boolean),
		timeout_ms: Schema.optional(Schema.Number)
	})),
	sand_runtime_constraints: Schema.optional(SandRuntimeConstraints)
});
/**
* Registry config for an SDK-native Composio source. Mirrors the source-side
* `ComposioSourceConfig` (kind `composio`) without an MCP endpoint: discovery
* and execution happen over Composio's REST tool API, keyed on
* `composio_auth_config_id`, scoped to a single `toolkit_slug`.
*/
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
	api_auth: Schema.optional(ApiAuthConfig$1)
});
Schema.Union([
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
Schema.Struct({
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
Schema.Struct({
	data: Schema.Array(PluginRegistryPublicEntryWithoutManifest),
	total: Schema.Number,
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean
});
//#endregion
//#region ../core-effect/src/run.ts
const RunStatus = Schema.Literals([
	"queued",
	"running",
	"completed",
	"failed",
	"cancelled"
]);
const RunSource = Schema.Literals([
	"api",
	"cli",
	"worker"
]);
const SpanStatus = Schema.Literals([
	"pending",
	"success",
	"error",
	"warning"
]);
const SpanKind = Schema.Literals([
	"run",
	"mcp.tool_call",
	"mcp.prompts_get",
	"mcp.resources_read",
	"mcp.notification",
	"mcp.reconnect",
	"api.request",
	"api.graphql",
	"cli.command",
	"orbit.storage",
	"orbit.cache",
	"orbit.ai",
	"orbit.db",
	"orbit.fetch",
	"orbit.job_invoke",
	"secret.resolve",
	"retry",
	"agent.step",
	"workflow.step",
	"workflow.sleep",
	"workflow.wait_event",
	"log"
]);
const SpanError = Schema.Struct({
	message: Schema.String,
	code: Schema.optional(Schema.Union([Schema.String, Schema.Number])),
	data: Schema.optional(Schema.Unknown)
});
const Span = Schema.Struct({
	id: Schema.String,
	run_id: Schema.String,
	parent_id: Schema.NullOr(Schema.String),
	agent_id: Schema.NullOr(Schema.String),
	kind: SpanKind,
	status: SpanStatus,
	title: Schema.NullOr(Schema.String),
	source_id: Schema.NullOr(Schema.String),
	source_namespace: Schema.NullOr(Schema.String),
	source_display_name: Schema.NullOr(Schema.String),
	source_icon_url: Schema.NullOr(Schema.String),
	tool_id: Schema.NullOr(Schema.String),
	tool_name: Schema.NullOr(Schema.String),
	tool_display_name: Schema.NullOr(Schema.String),
	tool_description: Schema.NullOr(Schema.String),
	tool_icons: Schema.optional(Schema.Unknown),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	content_type: Schema.NullOr(Schema.String),
	upstream_status: Schema.NullOr(Schema.Number),
	error: Schema.NullOr(SpanError),
	tokens_in: Schema.NullOr(Schema.Number),
	tokens_out: Schema.NullOr(Schema.Number),
	cost_usd: Schema.NullOr(Schema.Number),
	started_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	started_offset_ms: Schema.Number,
	metadata: Schema.Unknown
});
const Run = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	agent_id: Schema.String,
	status: RunStatus,
	source: RunSource,
	trigger: Schema.NullOr(Schema.String),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	error_message: Schema.NullOr(Schema.String),
	error_code: Schema.NullOr(Schema.String),
	exit_code: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	artifact_count: Schema.Number,
	workflow_instance_id: Schema.optional(Schema.NullOr(Schema.String)),
	started_at: Schema.NullOr(Schema.String),
	finished_at: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	sources: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	mime_type: Schema.String,
	size_bytes: Schema.Number,
	storage_key: Schema.NullOr(Schema.String),
	created_at: Schema.String
});
const RunSummary = Schema.Struct({
	span_count: Schema.Number,
	error_count: Schema.Number,
	retry_count: Schema.Number,
	total_tokens_in: Schema.NullOr(Schema.Number),
	total_tokens_out: Schema.NullOr(Schema.Number),
	total_cost_usd: Schema.NullOr(Schema.Number)
});
Schema.Struct({
	run: Run,
	spans: Schema.Array(Span),
	next_cursor: Schema.NullOr(Schema.String),
	summary: RunSummary
});
Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	run_id: Schema.String.check(Schema.isUUID())
});
Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	run_id: Schema.String.check(Schema.isUUID()),
	cursor: Schema.optional(Schema.String),
	since_offset_ms: Schema.optional(Schema.Number)
});
Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	source: Schema.optional(Schema.String),
	created_after: Schema.optional(Schema.String),
	created_before: Schema.optional(Schema.String),
	offset: Schema.optional(Schema.Number),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
Schema.Struct({
	data: Schema.Array(Run),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
	source_options: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	input: Schema.optional(Schema.Unknown),
	trigger: Schema.optional(Schema.String)
});
//#endregion
//#region ../core-effect/src/runtime.ts
const RuntimeExecutionKind = Schema.Literals([
	"exec",
	"tool_invocation",
	"workflow"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	kind: RuntimeExecutionKind,
	run_id: Schema.optional(RunId),
	payload: Schema.Unknown,
	low_level: Schema.optional(SandboxRequest)
});
Schema.Struct({
	ok: Schema.Boolean,
	run_id: Schema.optional(RunId),
	output: Schema.optional(Schema.Unknown),
	error: Schema.optional(Schema.String),
	low_level: Schema.optional(SandboxResult)
});
Context.Service("@hrbr/core/WorkspaceAuthorizer");
Context.Service("@hrbr/core/RunStore");
Context.Service("@hrbr/core/CredentialStore");
Context.Service("@hrbr/core/SourceRegistry");
Context.Service("@hrbr/core/McpSessionPool");
Context.Service("@hrbr/core/RuntimeExecutor");
Context.Service("@hrbr/core/ArtifactStore");
Context.Service("@hrbr/core/ToolCatalog");
Schema.Struct({ name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(100)) });
Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	name: Schema.NullOr(Schema.String),
	avatar_url: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	default_workspace_id: Schema.NullOr(Schema.String)
});
Schema.Struct({
	id: Schema.String,
	name: Schema.String
});
Schema.Struct({ workspace_id: Schema.NullOr(Schema.NonEmptyString) });
Schema.Struct({ default_workspace_id: Schema.NullOr(Schema.String) });
Schema.Struct({ device_code: Schema.NonEmptyString });
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({ workspace_id: WorkspaceId });
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
const AssignableRole = Schema.Literals([
	"admin",
	"member",
	"viewer"
]);
new Set(ROLES);
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
Schema.Struct({
	name: Schema.NonEmptyString,
	slug: WorkspaceSlug
});
Schema.Struct({
	workspace_id: WorkspaceId,
	name: Schema.optional(Schema.NonEmptyString),
	slug: Schema.optional(WorkspaceSlug)
});
Schema.Struct({
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
Schema.Struct({
	data: Schema.Array(Workspace),
	user: UserOnboarding,
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	workspace_id: WorkspaceId,
	user_id: UserId,
	role: WorkspaceRole,
	created_at: Timestamp
});
Schema.Struct({
	workspace_id: WorkspaceId,
	member_id: WorkspaceId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	member_id: WorkspaceId,
	role: AssignableRole
});
Schema.Struct({
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
Schema.Struct({
	workspace_id: WorkspaceId,
	invite_id: WorkspaceId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	email: Schema.NonEmptyString,
	role: AssignableRole
});
Schema.Struct({
	workspace_id: WorkspaceId,
	invite_id: WorkspaceId
});
Schema.Struct({ invite_token: Schema.NonEmptyString });
Schema.Struct({
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
//#region ../core-effect/src/workflow.ts
const WorkflowId = Schema.NonEmptyString;
Schema.Literals(["tool", "input"]);
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
Schema.Struct({
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
	kind: Schema.optional(SourceKind$1),
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
Schema.Struct({ workflows: Schema.Array(WorkflowListEntrySchema) });
Schema.Struct({
	...WorkflowEntryShape,
	body_markdown: Schema.optional(Schema.String)
});
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
Schema.Struct({
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
Schema.Struct({ workflows: Schema.Array(WorkflowCatalogEntry) });
Schema.Struct({
	...WorkflowCatalogEntry.fields,
	body_markdown: Schema.String
});
//#endregion
//#region ../plugins/src/lifecycle.ts
var PluginLifecycle = class extends Context.Service()("PluginLifecycle") {};
//#endregion
//#region ../plugins/src/index.ts
const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
const RegistryNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
const RegistryToolIdentifier = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
const ExternalToolIdentifier = Schema.NonEmptyString;
const SecretEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
const SourceKind = SourceKind$1;
const McpOAuthDiscovery = Schema.Struct({
	authorization_server: Schema.String,
	authorization_endpoint: Schema.String,
	token_endpoint: Schema.String,
	registration_endpoint: Schema.optional(Schema.String),
	scopes_supported: Schema.Array(Schema.String),
	has_dynamic_registration: Schema.Boolean,
	/** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
	service_documentation: Schema.optional(Schema.String),
	/** RFC 8414 §2: URL of provider policy / ToS (for display only). */
	op_policy_uri: Schema.optional(Schema.String),
	op_tos_uri: Schema.optional(Schema.String),
	/** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
	token_endpoint_auth_methods_supported: Schema.optional(Schema.Array(Schema.String)),
	/** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
	resource: Schema.optional(Schema.String),
	/** RFC 9728: documentation URL for the resource (provider's app registration docs). */
	resource_documentation: Schema.optional(Schema.String),
	/** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
	revocation_endpoint: Schema.optional(Schema.String)
});
/**
* Pre-configured OAuth client credentials for providers that do NOT support
* RFC 7591 dynamic client registration (GitHub, PostHog proxy client, etc.).
*
* Per MCP Authorization spec (2025-03-26 §2.3) clients MAY use pre-registered
* OAuth clients when the authorization server does not advertise a
* `registration_endpoint`. All fields are optional so the shape is backwards
* compatible with existing ready sources that rely on dynamic registration.
*/
const McpOAuthClientConfig = Schema.Struct({
	client_id: Schema.optional(Schema.String),
	/** Some providers accept public clients (PKCE-only). Leave unset in that case. */
	client_secret: Schema.optional(Schema.String),
	/** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
	redirect_uri: Schema.optional(Schema.String),
	/** Extra scope override if the user needs something beyond `scopes_supported`. */
	scope: Schema.optional(Schema.String)
});
const ComposioStaticAuthScheme = ComposioStaticAuthScheme$1;
const ComposioStaticAuthConfig = ComposioStaticAuthConfig$1;
const MCPSourceConfig = Schema.Struct({
	kind: Schema.Literal("mcp"),
	endpoint: Schema.NonEmptyString,
	transport: Schema.Literals([
		"http",
		"sse",
		"auto"
	]),
	auth_mode: Schema.optional(Schema.Literals([
		"none",
		"bearer",
		"api_key",
		"oauth2"
	])),
	oauth_redirect_url: Schema.optional(Schema.String),
	oauth_scopes: Schema.optional(Schema.Array(Schema.String)),
	oauth_discovery: Schema.optional(McpOAuthDiscovery),
	oauth_client_config: Schema.optional(McpOAuthClientConfig),
	/**
	* Static HTTP headers injected on every MCP request to this source.
	* Values may contain template tokens that the invoker resolves at
	* call time:
	*   - `{{env:VAR_NAME}}` — substituted from the API Worker env
	*     (Wrangler secret). Used for platform-level auth keys like
	*     Composio's `x-api-key` that are Harbor-wide, not per-user.
	* See apps/api/src/plugins/invoker/mcp.ts for the resolver.
	*/
	default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
	/**
	* Composio auth-config id used by Connect to initiate the per-user
	* Composio OAuth flow. When set, `/plugins/sources/oauth/start` calls
	* Composio's `connected_accounts` endpoint instead of the generic
	* OAuth discovery flow. See docs/plans/google-workspace-composio-swap.md.
	*/
	composio_auth_config_id: Schema.optional(Schema.NonEmptyString),
	/**
	* Static credential import metadata for Composio-backed MCP sources.
	* The raw credential values stay in plugin_credentials; this field only
	* records how install-time secret env keys should be translated into
	* Composio's connected-account `state.val` shape.
	*/
	composio_static_auth: Schema.optional(ComposioStaticAuthConfig)
});
const CustomMcpAddConfig = Schema.Struct({
	kind: Schema.Literal("mcp"),
	endpoint: Schema.NonEmptyString,
	transport: Schema.optional(Schema.Literals([
		"http",
		"sse",
		"auto"
	]))
});
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
/**
* CLI sources still use the `cli` source kind, but the execution lane behind
* them is Harbor sand.
*/
const CliSandResultDefaults = Schema.Struct({
	sand_stdin_mode: Schema.optional(SandStdinMode),
	sand_result_mode: SandResultMode,
	streaming: Schema.optional(Schema.Boolean),
	timeout_ms: Schema.optional(Schema.Number)
});
const CliSourceConfig = Schema.Struct({
	kind: Schema.Literal("cli"),
	namespace: Schema.NonEmptyString,
	launcher: CliLauncher,
	command: Schema.NonEmptyString,
	args: Schema.optional(Schema.Array(Schema.String)),
	cwd_policy: CliCwdPolicy,
	cwd: Schema.optional(Schema.String),
	allowed_env_keys: Schema.optional(Schema.Array(Schema.NonEmptyString)),
	sand_sandbox_policy: Schema.optional(SandIsolationPolicy),
	sand_secret_bindings: Schema.optional(Schema.Array(SandSecretBinding)),
	sand_runtime: Schema.optional(SandRuntimeSpec),
	cli_result_defaults: Schema.optional(CliSandResultDefaults),
	sand_runtime_constraints: Schema.optional(SandRuntimeConstraints)
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
	env: Schema.optional(SecretEnvKey),
	secret_name: Schema.optional(Schema.NonEmptyString),
	header_name: Schema.optional(Schema.String),
	query_param: Schema.optional(Schema.String),
	prefix: Schema.optional(Schema.String),
	username_env: Schema.optional(SecretEnvKey),
	username_secret_name: Schema.optional(Schema.NonEmptyString),
	password_env: Schema.optional(SecretEnvKey),
	password_secret_name: Schema.optional(Schema.NonEmptyString)
});
const ApiSourceConfig = Schema.Struct({
	kind: Schema.Literal("api"),
	protocol: Schema.optional(Schema.Literals([
		"openapi",
		"graphql",
		"http"
	])),
	base_url: Schema.NonEmptyString,
	allowed_hosts: Schema.optional(Schema.Array(Schema.NonEmptyString)),
	spec_url: Schema.optional(Schema.String),
	graphql_endpoint: Schema.optional(Schema.String),
	graphql_schema_url: Schema.optional(Schema.String),
	default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
	timeout_ms: Schema.optional(Schema.Number),
	auth: Schema.optional(ApiAuthConfig)
});
/**
* SDK-native Composio source. Unlike a `kind:'mcp'` Composio source (which
* speaks MCP over `backend.composio.dev/v3/mcp/...`), a `composio` source
* discovers and invokes tools through Composio's REST tool API directly:
*
*   - discovery  → `GET /api/v3/tools?toolkit_slugs=<toolkit_slug>` returns
*                  tool defs carrying strict input AND output JSON Schema.
*   - execution  → `POST /api/v3/tools/execute/<tool_slug>` with the
*                  persisted `composio_connected_account_id`.
*
* There is intentionally NO `endpoint` field — execution never touches the
* MCP transport. Auth is the same Composio connected account established by
* the managed-account OAuth flow (keyed on `composio_auth_config_id`), so
* switching an existing MCP-backed Composio source to this kind requires no
* re-auth.
*/
const ComposioSourceConfig = Schema.Struct({
	kind: Schema.Literal("composio"),
	/**
	* Composio auth-config id. Drives the managed-account OAuth flow exactly
	* like the MCP-backed Composio source, and is the key under which the
	* connected account is created.
	*/
	composio_auth_config_id: Schema.NonEmptyString,
	/** Composio toolkit slug to ingest, e.g. `gmail`, `google-calendar`, `slack`. */
	toolkit_slug: Schema.NonEmptyString,
	/** Optional Composio tool version pin applied to discovery + execution. */
	version: Schema.optional(Schema.NonEmptyString),
	/**
	* When set, discovery keeps only these tool slugs from the toolkit. Absent
	* means “all tools in the toolkit”.
	*/
	allowed_tools: Schema.optional(Schema.Array(Schema.NonEmptyString)),
	/**
	* Static HTTP headers reserved for parity with the other source configs.
	* Composio platform auth (`x-api-key`) is sourced from the Worker env, not
	* from here.
	*/
	default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String))
});
const SourceConfig = Schema.Union([
	MCPSourceConfig,
	CliSourceConfig,
	ApiSourceConfig,
	ComposioSourceConfig
]);
const AuthTemplate = AuthTemplate$1;
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
/**
* Workspace-scoped preconfigured OAuth client. A workspace admin registers
* this ONCE per provider (identified by `registry_slug`) so every member in
* the workspace inherits it. Replaces the per-install user-facing form for
* providers that don't support RFC 7591 dynamic client registration.
*
* The secret is never returned over the wire — only `has_client_secret`
* is exposed. See apps/api/src/routes/plugins/oauth.ts for the listing
* endpoint that redacts secrets.
*/
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
const WorkspaceOAuthClientListBody = Schema.Struct({ workspace_id: Schema.String.check(Schema.isUUID()) });
const WorkspaceOAuthClientListResult = Schema.Struct({
	data: Schema.Array(WorkspaceOAuthClient),
	total: Schema.Number
});
const WorkspaceOAuthClientSetBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	registry_slug: Schema.NonEmptyString
});
const WorkspaceOAuthClientDeleteResult = Schema.Struct({ ok: Schema.Literal(true) });
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
const SourceLink = Schema.Struct({
	label: Schema.String,
	url: Schema.String,
	kind: Schema.Literals([
		"docs",
		"dashboard",
		"api"
	])
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
function registryAgentSkillSlug(entry, fallbackSlug) {
	if (typeof entry !== "object" || entry === null) return null;
	const record = entry;
	const skill = typeof record["skill"] === "object" && record["skill"] !== null ? record["skill"] : null;
	if (!skill) return null;
	const slug = skill["slug"] ?? skill["skill_slug"] ?? skill["id"] ?? fallbackSlug;
	return typeof slug === "string" && slug.length > 0 ? slug : null;
}
/**
* A source "needs setup" when it requires an OAuth/credential connect or is in
* a hard error state. These are exactly the per-source statuses whose
* connect/reconnect flow the plugins page surfaces via the "Connect" button and
* the detail page auto-opens on `?setup=1`. Transient states (no_tools,
* discovering, pending, refreshing, ready) are NOT setup.
*/
function pluginSourceStatusNeedsSetup(status) {
	return status === "requires_oauth" || status === "reconnect_required" || status === "needs_credentials" || status === "spec_error" || status === "credentials_error" || status === "mcp_disconnected" || status === "verification_failed" || status === "verification_required";
}
function isPluginSourceToolCallable(source) {
	const status = source.effective_status ?? source.caller_status ?? source.status;
	if (status === "requires_oauth" || status === "reconnect_required") return false;
	if (source.runnable === false) return false;
	return status === "ready" && Number(source.tool_count ?? 0) > 0;
}
function pluginToolNamespaceSummary(source) {
	const view = "status" in source && "tool_count" in source && source.status ? pluginSourceDomainView({
		status: source.status,
		caller_status: source.caller_status,
		effective_status: source.effective_status,
		tool_count: Number(source.tool_count ?? 0),
		runnable: source.runnable
	}) : null;
	return {
		namespace: source.namespace,
		mode: source.kind ?? "api",
		status: view?.status ?? source.effective_status ?? source.caller_status ?? source.status ?? "unknown",
		tool_count: view?.tool_count ?? Number(source.tool_count ?? 0)
	};
}
const SOURCE_DISPLAY_STATUS_PRIORITY = {
	mcp_disconnected: 4,
	credentials_error: 4,
	spec_error: 4,
	verification_failed: 4,
	needs_credentials: 3,
	requires_oauth: 3,
	reconnect_required: 3,
	verification_required: 3,
	refreshing: 2,
	no_tools: 2,
	discovering: 1,
	pending: 1,
	ready: 0
};
function summarizePluginSourceGroupHealth(sources) {
	let activeCount = 0;
	let worstStatus = null;
	for (const source of sources) {
		const status = displayPluginSourceStatus(source);
		if (isPluginSourceRunnable(source)) activeCount += 1;
		if ((SOURCE_DISPLAY_STATUS_PRIORITY[status] ?? 0) > (worstStatus ? SOURCE_DISPLAY_STATUS_PRIORITY[worstStatus] ?? 0 : -1)) worstStatus = status;
	}
	return {
		activeCount,
		worstStatus
	};
}
function pluginSourceTimestampValue(value) {
	if (!value) return 0;
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? timestamp : 0;
}
function pluginSourceSelectionRank(source) {
	const effectiveStatus = effectivePluginSourceStatus(source);
	if (isPluginSourceRunnable(source)) return 700;
	if (source.status === "ready" && source.tool_count > 0) return 600;
	if (source.tool_count > 0) return 500;
	if (effectiveStatus === "ready") return 400;
	if (effectiveStatus === "refreshing") return 350;
	if (effectiveStatus === "discovering" || effectiveStatus === "pending") return 300;
	if (effectiveStatus === "requires_oauth" || effectiveStatus === "reconnect_required" || effectiveStatus === "needs_credentials") return 200;
	if (effectiveStatus === "no_tools") return 100;
	return 0;
}
function comparePluginSourcesForDisplay(a, b) {
	const rankDelta = pluginSourceSelectionRank(b) - pluginSourceSelectionRank(a);
	if (rankDelta !== 0) return rankDelta;
	const toolDelta = b.tool_count - a.tool_count;
	if (toolDelta !== 0) return toolDelta;
	const aTime = pluginSourceTimestampValue(a.last_synced_at) || pluginSourceTimestampValue(a.updated_at) || pluginSourceTimestampValue(a.created_at);
	const timeDelta = (pluginSourceTimestampValue(b.last_synced_at) || pluginSourceTimestampValue(b.updated_at) || pluginSourceTimestampValue(b.created_at)) - aTime;
	if (timeDelta !== 0) return timeDelta;
	return a.id.localeCompare(b.id);
}
function selectRepresentativePluginSource(sources) {
	if (sources.length === 0) return null;
	return [...sources].sort(comparePluginSourcesForDisplay)[0] ?? null;
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
	/** Owning toolkit slug, e.g. `gmail`. Mirrors the source config; informational. */
	toolkit_slug: Schema.optional(Schema.NonEmptyString),
	/** Pinned Composio tool version. Forwarded to the execute call when set. */
	version: Schema.optional(Schema.NonEmptyString)
});
const ToolBinding = Schema.Union([
	MCPToolBinding,
	MCPPromptBinding,
	MCPResourceReadBinding,
	MCPResourceTemplateBinding,
	ApiRequestBinding,
	ApiGraphqlBinding,
	CliCommandBinding,
	ComposioToolBinding
]);
const ToolBindingJson = Schema.fromJsonString(ToolBinding);
const SourceConfigJson = Schema.fromJsonString(SourceConfig);
const PersistedAuthConfigJson = Schema.fromJsonString(PersistedAuthConfig);
const PluginTool = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	source_id: Schema.String,
	tool_id: ExternalToolIdentifier,
	name: ExternalToolIdentifier,
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
	"api_request",
	"api_graphql",
	"composio"
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
const OAuthCallbackUrlResult = Schema.Struct({ callback_url: Schema.String });
const SourceIdBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID())
});
const OAuthReconnectBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	grant_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const OAuthDisconnectResult = Schema.Struct({ ok: Schema.Literal(true) });
const OAuthConfigureBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	client_id: Schema.optional(Schema.String),
	client_secret: Schema.optional(Schema.String),
	redirect_uri: Schema.optional(Schema.String),
	scope: Schema.optional(Schema.String)
});
const OAuthConfigureResult = Schema.Struct({ ok: Schema.Literal(true) });
const OAuthSetupHintsBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	source_visibility: SourceVisibility
});
const McpProbeBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	endpoint: Schema.NonEmptyString
});
const RefreshSourceBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	slug: Schema.optional(RegistrySlug)
});
const ToolIdBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	tool_id: Schema.String
});
const AddSourceBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	machine_id: Schema.NonEmptyString,
	agent_id: Schema.NonEmptyString,
	status: SourceVerificationStatus,
	error: Schema.optional(Schema.String),
	details: Schema.optional(Schema.Unknown),
	checked_at: Schema.optional(Schema.String)
});
const SourceVerificationGetBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	slug: RegistrySlug,
	namespace: Schema.optional(NormalizedSourceNamespace),
	source_visibility: Schema.optional(SourceVisibility),
	secrets_by_env: Schema.optional(Schema.Record(SecretEnvKey, Schema.NonEmptyString)),
	/** @deprecated Use secrets_by_env with env-keyed values. */
	credential_value: Schema.optional(Schema.NonEmptyString)
});
const SubmitSourceRequestBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	slug: RegistrySlug,
	namespace: RegistryNamespace,
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	job_id: Schema.String.check(Schema.isUUID())
});
const PluginInstallJobListBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
const ToolIdsBody = Schema.Struct({ tool_ids: Schema.Array(Schema.NonEmptyString) });
const ToolsReindexBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	namespace: Schema.optional(Schema.String),
	all: Schema.optional(Schema.Boolean)
});
/**
* Tool search execution mode.
*
* - `auto` (default): vector-first with a lexical D1 fallback when Vectorize
*   is unavailable, errors, or returns no hits. Matches the legacy behaviour
*   so existing clients keep working.
* - `vector`: only run the Vectorize-backed semantic search. If the
*   workspace has no enabled scopes, no Vectorize binding, or the embedding
*   path errors, the response surfaces an empty result rather than silently
*   degrading to lexical scoring.
* - `lexical`: skip Vectorize entirely and only run the D1 lexical scorer.
*   Useful for diagnosing search quality without depending on the vector
*   index.
*/
const ToolSearchMode = Schema.Literals([
	"auto",
	"vector",
	"lexical"
]);
const ToolsSearchBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	query: Schema.NonEmptyString,
	limit: Schema.optional(Schema.Number),
	source: Schema.optional(Schema.String),
	kind: Schema.optional(Schema.Array(ToolSearchKind)),
	verbose: Schema.optional(Schema.Boolean),
	mode: Schema.optional(ToolSearchMode)
});
const ToolDescribeBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	tool_id: Schema.String
});
const AddToolBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	tool_id: ExternalToolIdentifier,
	name: ExternalToolIdentifier,
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.NonEmptyString,
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
const CredentialUpsertBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.NonEmptyString,
	display_name: Schema.optional(Schema.String),
	value: Schema.NonEmptyString,
	kind: Schema.optional(CredentialKind)
});
const CredentialCreateResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String
});
const CredentialUpsertResult = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: Schema.String.check(Schema.isUUID()),
	source_id: Schema.String.check(Schema.isUUID()),
	name: Schema.String,
	created: Schema.Boolean
});
const CredentialsListBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const CredentialListItem = Schema.Struct({
	id: Schema.String.check(Schema.isUUID()),
	workspace_id: Schema.String.check(Schema.isUUID()),
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
	workspace_id: Schema.String.check(Schema.isUUID()),
	credential_id: Schema.String.check(Schema.isUUID())
});
const CredentialDeleteResult = Schema.Struct({ ok: Schema.Boolean });
const InvokeToolBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	tool_id: Schema.String,
	input: Schema.Record(Schema.String, Schema.Unknown),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	run_id: Schema.optional(Schema.String.check(Schema.isUUID()))
});
const MetaSearchBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
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
const PLUGIN_CATEGORY_LABELS = {
	search: "Search",
	ai: "AI",
	comms: "Communication",
	dev: "Developer Tools",
	data: "Data",
	web: "Web",
	media: "Media",
	infra: "Infrastructure",
	observability: "Observability",
	analytics: "Analytics",
	storage: "Storage",
	other: "Other"
};
//#endregion
export { AWAITING_OAUTH_SOURCE_STATUSES, AddSourceBody, AddSourceResult, AddToolBody, AddToolResult, ApiAuthConfig, ApiGraphqlBinding, ApiRequestBinding, ApiSourceConfig, AuthConfig, AuthTemplate, CliArgTemplateFlag, CliArgTemplateInput, CliArgTemplateLiteral, CliArgTemplateOption, CliArgTemplatePart, CliCommandBinding, CliCwdPolicy, CliLauncher, CliSandResultDefaults, CliSourceConfig, ComposioSourceConfig, ComposioStaticAuthConfig, ComposioStaticAuthScheme, ComposioToolBinding, CredentialCreateBody, CredentialCreateResult, CredentialDeleteResult, CredentialIdBody, CredentialKind, CredentialListItem, CredentialUpsertBody, CredentialUpsertResult, CredentialsListBody, CredentialsListResult, CustomMcpAddConfig, DiscoveryResult, DiscoverySourceMetadata, ExecuteResult, ExecuteResultContent, ExecuteResultJsonContent, ExecuteResultSkillBundleContent, ExecuteResultTextContent, ExecuteSkillBundle, ExecuteSkillBundleFile, ExtractedTool, InvokeResult, InvokeResultContent, InvokeToolBody, InvokerResult, InvokerRuntimeConfig, MCPPromptBinding, MCPResourceReadBinding, MCPResourceTemplateBinding, MCPSourceConfig, MCPToolBinding, McpAnnotations, McpIcon, McpOAuthClientConfig, McpOAuthDiscovery, McpOAuthDiscoveryResult, McpProbeBody, McpProbeResult, McpServerInfo, MetaSearchBody, NormalizedSourceNamespace, OAuthCallbackUrlResult, OAuthConfigureBody, OAuthConfigureResult, OAuthDisconnectResult, OAuthFlowStatusBody, OAuthFlowStatusResult, OAuthReconnectBody, OAuthSetupHints, OAuthSetupHintsBody, OAuthSetupHintsRegisterUrlSource, OAuthStartResult, PLUGIN_CATEGORY_LABELS, PersistedAuthConfig, PersistedAuthConfigJson, PluginCredential, PluginInstallJob, PluginInstallJobGetBody, PluginInstallJobListBody, PluginInstallJobListResult, PluginInstallJobStatus, PluginLifecycle, PluginSource, PluginSourceCreator, PluginTool, RefreshSourceBody, RefreshSourceResult, RegistryInstallBody, RegistryInstallJobResult, RegistryInstallResult, RegistryInstallSourceResult, RegistryListBody, RemoveSourceResult, ResolvedAuth, SOURCE_STATUSES, SourceAbandonResult, SourceAuthTestBody, SourceAuthTestRedactedRequest, SourceAuthTestResult, SourceCleanupStaleResult, SourceConfig, SourceConfigJson, SourceIdBody, SourceKind, SourceLink, SourceListBody, SourceListResult, SourceStatus, SourceSummary, SourceVerification, SourceVerificationGetBody, SourceVerificationGetResult, SourceVerificationProbeBody, SourceVerificationProbeResult, SourceVerificationSetBody, SourceVerificationSetResult, SourceVerificationStatus, SourceVerificationSummary, SourceVisibility, SourceVisibilitySetBody, SubmitSourceRequestBody, SubmitSourceRequestResult, ToolBinding, ToolBindingJson, ToolDescribeBody, ToolDescribeResponse, ToolIdBody, ToolIdsBody, ToolSchemaResponse, ToolSchemasResponse, ToolSearchKind, ToolSearchMode, ToolSearchResult, ToolSignatureHit, ToolsListBody, ToolsListResult, ToolsReindexBody, ToolsReindexResult, ToolsSearchBody, ToolsSearchResponse, WorkspaceOAuthClient, WorkspaceOAuthClientDeleteBody, WorkspaceOAuthClientDeleteResult, WorkspaceOAuthClientListBody, WorkspaceOAuthClientListResult, WorkspaceOAuthClientSetBody, WorkspaceOAuthClientSetResult, comparePluginSourcesForDisplay, displayPluginSourceStatus, effectivePluginSourceStatus, isPluginSourceAwaitingOauth, isPluginSourceRunnable, isPluginSourceToolCallable, pluginSourceDomainView, pluginSourceNextAction, pluginSourceStatusNeedsSetup, pluginToolNamespaceSummary, registryAgentSkillSlug, sanitizeNamespace, selectRepresentativePluginSource, summarizePluginSourceGroupHealth };

//# sourceMappingURL=base.mjs.map