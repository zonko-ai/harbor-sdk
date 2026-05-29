import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
const SourceId = Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
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
const CliCommandBinding = Schema.Struct({
	kind: Schema.Literal("cli_command"),
	tool_name: Schema.String,
	argv_template: Schema.Array(CliArgTemplatePart),
	sand_stdin_mode: SandStdinMode,
	sand_result_mode: SandResultMode,
	timeout_ms: Schema.optional(Schema.Number),
	streaming: Schema.optional(Schema.Boolean)
});
const ProviderToolBinding = Schema.Union([
	MCPToolBinding,
	MCPPromptBinding,
	MCPResourceReadBinding,
	MCPResourceTemplateBinding,
	ApiRequestBinding,
	ApiGraphqlBinding,
	CliCommandBinding
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
Schema.Struct({ hits: Schema.Array(ToolSignatureHit) });
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
	tool_id: RegistryToolIdentifier
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
	registry_slug: Schema.optional(RegistrySlug)
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
	registry_slug: Schema.optional(RegistrySlug),
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
	slug: Schema.optional(RegistrySlug)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	tool_id: Schema.String
});
Schema.Struct({
	workspace_id: WorkspaceId,
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
	slug: RegistrySlug,
	namespace: Schema.optional(SourceNamespace),
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
const CATEGORY_LABELS = {
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
const CATEGORY_SLUGS = [
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
];
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
const PluginRegistrySkill = Schema.Struct({ slug: Schema.optional(RegistrySlug) });
const PluginRegistryEntryFields = {
	slug: RegistrySlug,
	display_name: Schema.NonEmptyString,
	description: Schema.NonEmptyString,
	category: PluginCategory,
	auth: PluginRegistryAuth,
	oauth_client: Schema.optional(PluginRegistryOAuthClientSeed),
	auth_test: Schema.optional(PluginRegistryAuthTest),
	links: Schema.optional(Schema.Array(SourceLink)),
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
	})
]);
const PluginRegistryListResultWithoutManifest = Schema.Struct({
	data: Schema.Array(PluginRegistryPublicEntryWithoutManifest),
	total: Schema.Number,
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean
});
const RegistrySourceKind = SourceKind;
const RegistryToolBinding = ProviderToolBinding;
//#endregion
export { CATEGORY_LABELS, CATEGORY_SLUGS, PluginCategory, PluginRegistryApiConfig, PluginRegistryApiSetup, PluginRegistryApiSetupVerifyProbe, PluginRegistryAuth, PluginRegistryCliConfig, PluginRegistryCliSetup, PluginRegistryCliSetupFailureHint, PluginRegistryCliSetupFailureMatcher, PluginRegistryCliSetupRequiredSecret, PluginRegistryCliSetupRunnableRequirement, PluginRegistryCliSetupVerifyProbe, PluginRegistryEntry, PluginRegistryEntryAvailability, PluginRegistryListResult, PluginRegistryListResultWithoutManifest, PluginRegistryManifest, PluginRegistryManifestTool, PluginRegistryManifestToolBinding, PluginRegistryMcpConfig, PluginRegistryOAuthClientSeed, PluginRegistryPublicEntry, PluginRegistryPublicEntryWithoutManifest, PluginRegistrySkill, RegistrySourceKind, RegistryToolBinding };

//# sourceMappingURL=registry.mjs.map