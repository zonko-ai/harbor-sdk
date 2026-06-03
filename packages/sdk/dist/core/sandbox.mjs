import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
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
const SecretName = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/sandbox.ts
const SandUuid = Schema.String.check(Schema.isUUID());
const SAND_ERROR_TAGS = {
	MACHINE_KEYPAIR_UNAVAILABLE: "SAND_MACHINE_KEYPAIR_UNAVAILABLE",
	SESSION_INCOMPLETE: "SAND_SESSION_INCOMPLETE",
	RUNTIME_UNAVAILABLE: "LOCAL_RUNTIME_UNAVAILABLE",
	TOOL_UNAVAILABLE: "LOCAL_TOOL_UNAVAILABLE"
};
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
const SandSessionOpenBody = Schema.Struct({
	workspace_id: WorkspaceId,
	agent_id: SandUuid,
	machine_id: Schema.NonEmptyString,
	run_id: Schema.optional(RunId),
	capabilities: Schema.optional(SandMachineCapabilities),
	machine_public_key: Schema.optional(SandMachinePublicKey)
});
const SandSessionOpenResponse = Schema.Struct({
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
const SandSessionCloseBody = Schema.Struct({
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
const SandSessionRespondBody = Schema.Struct({
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
const SandSessionFrame = Schema.Union([
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
export { SAND_ERROR_TAGS, SandCallOptions, SandCommandSpec, SandDispatchRequest, SandErrorFrame, SandHeartbeatFrame, SandInvocationEnvelope, SandInvocationFrame, SandInvocationResult, SandInvocationResultStatus, SandIsolationFilesystemMode, SandIsolationNetworkMode, SandIsolationPolicy, SandLauncher, SandMachineCapabilities, SandMachinePublicKey, SandResultFrame, SandResultMode, SandRuntimeArch, SandRuntimeArtifact, SandRuntimeConstraints, SandRuntimeEnvBinding, SandRuntimeOS, SandRuntimeSpec, SandRuntimeTempDirArtifact, SandRuntimeTempFileArtifact, SandRuntimeValue, SandRuntimeValueArtifactPath, SandRuntimeValueLiteral, SandRuntimeValueSecretEnv, SandSealedSecret, SandSealingAlgorithm, SandSecretBinding, SandSecretRef, SandSessionCloseBody, SandSessionFrame, SandSessionOpenBody, SandSessionOpenResponse, SandSessionRespondBody, SandSessionStatus, SandStdinMode, SandboxRequest, SandboxResult, SandboxRuntime };

//# sourceMappingURL=sandbox.mjs.map