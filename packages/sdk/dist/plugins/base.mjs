import { Context, Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
const SourceId = Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
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
const SourceKind$1 = Schema.Literals([
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
	"api_graphql"
]);
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
	"api_graphql"
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
Schema.Union([
	MCPToolBinding$1,
	MCPPromptBinding$1,
	MCPResourceReadBinding$1,
	MCPResourceTemplateBinding$1,
	ApiRequestBinding$1,
	ApiGraphqlBinding$1,
	CliCommandBinding$1
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
Schema.Struct({ hits: Schema.Array(ToolSignatureHit$1) });
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
	namespace: Schema.NonEmptyString,
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
	namespace: Schema.optional(SourceNamespace),
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
const SourceConfig = Schema.Union([
	MCPSourceConfig,
	CliSourceConfig,
	ApiSourceConfig
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
const ToolBinding = Schema.Union([
	MCPToolBinding,
	MCPPromptBinding,
	MCPResourceReadBinding,
	MCPResourceTemplateBinding,
	ApiRequestBinding,
	ApiGraphqlBinding,
	CliCommandBinding
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
const ToolsSearchResponse = Schema.Struct({ hits: Schema.Array(ToolSignatureHit) });
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
	namespace: Schema.NonEmptyString,
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
	namespace: Schema.optional(RegistryNamespace),
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
export { AWAITING_OAUTH_SOURCE_STATUSES, AddSourceBody, AddSourceResult, AddToolBody, AddToolResult, ApiAuthConfig, ApiGraphqlBinding, ApiRequestBinding, ApiSourceConfig, AuthConfig, AuthTemplate, CliArgTemplateFlag, CliArgTemplateInput, CliArgTemplateLiteral, CliArgTemplateOption, CliArgTemplatePart, CliCommandBinding, CliCwdPolicy, CliLauncher, CliSandResultDefaults, CliSourceConfig, ComposioStaticAuthConfig, ComposioStaticAuthScheme, CredentialCreateBody, CredentialCreateResult, CredentialDeleteResult, CredentialIdBody, CredentialKind, CredentialListItem, CredentialUpsertBody, CredentialUpsertResult, CredentialsListBody, CredentialsListResult, CustomMcpAddConfig, DiscoveryResult, DiscoverySourceMetadata, ExecuteResult, ExecuteResultContent, ExecuteResultJsonContent, ExecuteResultSkillBundleContent, ExecuteResultTextContent, ExecuteSkillBundle, ExecuteSkillBundleFile, ExtractedTool, InvokeResult, InvokeResultContent, InvokeToolBody, InvokerResult, InvokerRuntimeConfig, MCPPromptBinding, MCPResourceReadBinding, MCPResourceTemplateBinding, MCPSourceConfig, MCPToolBinding, McpAnnotations, McpIcon, McpOAuthClientConfig, McpOAuthDiscovery, McpOAuthDiscoveryResult, McpProbeBody, McpProbeResult, McpServerInfo, MetaSearchBody, OAuthCallbackUrlResult, OAuthConfigureBody, OAuthConfigureResult, OAuthDisconnectResult, OAuthFlowStatusBody, OAuthFlowStatusResult, OAuthReconnectBody, OAuthSetupHints, OAuthSetupHintsBody, OAuthSetupHintsRegisterUrlSource, OAuthStartResult, PLUGIN_CATEGORY_LABELS, PersistedAuthConfig, PersistedAuthConfigJson, PluginCredential, PluginInstallJob, PluginInstallJobGetBody, PluginInstallJobListBody, PluginInstallJobListResult, PluginInstallJobStatus, PluginLifecycle, PluginSource, PluginSourceCreator, PluginTool, RefreshSourceBody, RefreshSourceResult, RegistryInstallBody, RegistryInstallJobResult, RegistryInstallResult, RegistryInstallSourceResult, RegistryListBody, RemoveSourceResult, ResolvedAuth, SOURCE_STATUSES, SourceAbandonResult, SourceAuthTestBody, SourceAuthTestRedactedRequest, SourceAuthTestResult, SourceCleanupStaleResult, SourceConfig, SourceConfigJson, SourceIdBody, SourceKind, SourceLink, SourceListBody, SourceListResult, SourceStatus, SourceSummary, SourceVerification, SourceVerificationGetBody, SourceVerificationGetResult, SourceVerificationProbeBody, SourceVerificationProbeResult, SourceVerificationSetBody, SourceVerificationSetResult, SourceVerificationStatus, SourceVerificationSummary, SourceVisibility, SourceVisibilitySetBody, SubmitSourceRequestBody, SubmitSourceRequestResult, ToolBinding, ToolBindingJson, ToolDescribeBody, ToolDescribeResponse, ToolIdBody, ToolIdsBody, ToolSchemaResponse, ToolSchemasResponse, ToolSearchKind, ToolSearchMode, ToolSearchResult, ToolSignatureHit, ToolsListBody, ToolsListResult, ToolsReindexBody, ToolsReindexResult, ToolsSearchBody, ToolsSearchResponse, WorkspaceOAuthClient, WorkspaceOAuthClientDeleteBody, WorkspaceOAuthClientDeleteResult, WorkspaceOAuthClientListBody, WorkspaceOAuthClientListResult, WorkspaceOAuthClientSetBody, WorkspaceOAuthClientSetResult, comparePluginSourcesForDisplay, displayPluginSourceStatus, effectivePluginSourceStatus, isPluginSourceAwaitingOauth, isPluginSourceRunnable, isPluginSourceToolCallable, pluginSourceDomainView, pluginSourceNextAction, pluginToolNamespaceSummary, registryAgentSkillSlug, selectRepresentativePluginSource, summarizePluginSourceGroupHealth };

//# sourceMappingURL=base.mjs.map