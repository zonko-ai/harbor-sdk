// @hrbr/sand — Shared contracts for Harbor's sand execution lane.
import { Schema } from "effect"

export { SAND_ERROR_TAGS, type SandErrorTag } from "./errors"

export const SandRuntimeOS = Schema.Literals(["darwin", "linux", "windows"])
export type SandRuntimeOS = typeof SandRuntimeOS.Type

export const SandRuntimeArch = Schema.Literals(["arm64", "x64"])
export type SandRuntimeArch = typeof SandRuntimeArch.Type

export const SandRuntimeConstraints = Schema.Struct({
  os: Schema.optional(Schema.Array(SandRuntimeOS)),
  arch: Schema.optional(Schema.Array(SandRuntimeArch)),
  requires_sandbox_runtime: Schema.optional(Schema.Boolean),
})
export type SandRuntimeConstraints = typeof SandRuntimeConstraints.Type

export const SandIsolationFilesystemMode = Schema.Literals(["workspace", "cwd", "custom", "none"])
export type SandIsolationFilesystemMode = typeof SandIsolationFilesystemMode.Type

export const SandIsolationNetworkMode = Schema.Literals(["inherit", "deny", "allowlist"])
export type SandIsolationNetworkMode = typeof SandIsolationNetworkMode.Type

export const SandIsolationPolicy = Schema.Struct({
  filesystem: Schema.optional(SandIsolationFilesystemMode),
  network: Schema.optional(SandIsolationNetworkMode),
  readable_paths: Schema.optional(Schema.Array(Schema.String)),
  writable_paths: Schema.optional(Schema.Array(Schema.String)),
  allowed_hosts: Schema.optional(Schema.Array(Schema.String)),
})
export type SandIsolationPolicy = typeof SandIsolationPolicy.Type

export const SandSecretBinding = Schema.Struct({
  secret_name: Schema.NonEmptyString,
  env: Schema.NonEmptyString,
  required: Schema.optional(Schema.Boolean),
})
export type SandSecretBinding = typeof SandSecretBinding.Type

export const SandSealingAlgorithm = Schema.Literal("rsa-oaep-256+jwk-v1")
export type SandSealingAlgorithm = typeof SandSealingAlgorithm.Type

export const SandMachinePublicKey = Schema.Struct({
  key_id: Schema.NonEmptyString,
  algorithm: SandSealingAlgorithm,
  public_key_jwk: Schema.Record(Schema.String, Schema.Unknown),
})
export type SandMachinePublicKey = typeof SandMachinePublicKey.Type

export const SandSealedSecret = Schema.Struct({
  env: Schema.NonEmptyString,
  key_id: Schema.NonEmptyString,
  algorithm: SandSealingAlgorithm,
  ciphertext_b64: Schema.optional(Schema.NonEmptyString),
  // Legacy transport alias kept during the Coast migration window.
  cipher_text: Schema.optional(Schema.NonEmptyString),
})
export type SandSealedSecret = typeof SandSealedSecret.Type

export const SandSecretRef = Schema.Struct({
  __hrbr_secret_ref: Schema.NonEmptyString,
})
export type SandSecretRef = typeof SandSecretRef.Type

export const SandResultMode = Schema.Literals(["json_stdout", "stdout_text", "binary_base64", "exit_code_only"])
export type SandResultMode = typeof SandResultMode.Type

export const SandStdinMode = Schema.Literals(["none", "json", "text"])
export type SandStdinMode = typeof SandStdinMode.Type

export const SandCallOptions = Schema.Struct({
  env: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  secret_env: Schema.optional(Schema.Record(Schema.String, SandSecretRef)),
  cwd: Schema.optional(Schema.String),
  timeout_ms: Schema.optional(Schema.Number),
})
export type SandCallOptions = typeof SandCallOptions.Type

export const SandLauncher = Schema.Literals(["binary", "npx", "uvx", "bunx"])
export type SandLauncher = typeof SandLauncher.Type

const SandEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/))
const SandRuntimeArtifactId = Schema.String.check(Schema.isPattern(/^[a-z][a-z0-9_]*$/))

export const SandRuntimeTempDirArtifact = Schema.Struct({
  id: SandRuntimeArtifactId,
  kind: Schema.Literal("temp_dir"),
  prefix: Schema.NonEmptyString,
})
export type SandRuntimeTempDirArtifact = typeof SandRuntimeTempDirArtifact.Type

export const SandRuntimeTempFileArtifact = Schema.Struct({
  id: SandRuntimeArtifactId,
  kind: Schema.Literal("temp_file"),
  filename: Schema.NonEmptyString,
  prefix: Schema.optional(Schema.NonEmptyString),
  parent_artifact_id: Schema.optional(SandRuntimeArtifactId),
  contents: Schema.optional(Schema.String),
})
export type SandRuntimeTempFileArtifact = typeof SandRuntimeTempFileArtifact.Type

export const SandRuntimeArtifact = Schema.Union([
  SandRuntimeTempDirArtifact,
  SandRuntimeTempFileArtifact,
])
export type SandRuntimeArtifact = typeof SandRuntimeArtifact.Type

export const SandRuntimeValueLiteral = Schema.Struct({
  kind: Schema.Literal("literal"),
  value: Schema.String,
})
export type SandRuntimeValueLiteral = typeof SandRuntimeValueLiteral.Type

export const SandRuntimeValueArtifactPath = Schema.Struct({
  kind: Schema.Literal("artifact_path"),
  artifact_id: SandRuntimeArtifactId,
})
export type SandRuntimeValueArtifactPath = typeof SandRuntimeValueArtifactPath.Type

export const SandRuntimeValueSecretEnv = Schema.Struct({
  kind: Schema.Literal("secret_env"),
  env: SandEnvKey,
})
export type SandRuntimeValueSecretEnv = typeof SandRuntimeValueSecretEnv.Type

export const SandRuntimeValue = Schema.Union([
  SandRuntimeValueLiteral,
  SandRuntimeValueArtifactPath,
  SandRuntimeValueSecretEnv,
])
export type SandRuntimeValue = typeof SandRuntimeValue.Type

export const SandRuntimeEnvBinding = Schema.Struct({
  env: SandEnvKey,
  value: SandRuntimeValue,
})
export type SandRuntimeEnvBinding = typeof SandRuntimeEnvBinding.Type

export const SandRuntimeSpec = Schema.Struct({
  artifacts: Schema.optional(Schema.Array(SandRuntimeArtifact)),
  env: Schema.optional(Schema.Array(SandRuntimeEnvBinding)),
  args: Schema.optional(Schema.Array(SandRuntimeValue)),
})
export type SandRuntimeSpec = typeof SandRuntimeSpec.Type

export const SandCommandSpec = Schema.Struct({
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
  runtime_constraints: Schema.optional(SandRuntimeConstraints),
})
export type SandCommandSpec = typeof SandCommandSpec.Type

export const SandMachineCapabilities = Schema.Struct({
  sandbox_runtime_available: Schema.Boolean,
  sandbox_runtime_version: Schema.optional(Schema.String),
  runtime_constraints: Schema.optional(SandRuntimeConstraints),
  cli_sources: Schema.optional(Schema.Array(Schema.String)),
})
export type SandMachineCapabilities = typeof SandMachineCapabilities.Type

export const SandSessionStatus = Schema.Literals(["created", "active", "closing", "closed", "expired"])
export type SandSessionStatus = typeof SandSessionStatus.Type

export const SandSessionOpenBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  agent_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  capabilities: Schema.optional(SandMachineCapabilities),
  machine_public_key: Schema.optional(SandMachinePublicKey),
})
export type SandSessionOpenBody = typeof SandSessionOpenBody.Type

export const SandSessionOpenResponse = Schema.Struct({
  session_id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  agent_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  status: SandSessionStatus,
  expires_at: Schema.String,
  heartbeat_interval_ms: Schema.optional(Schema.Number),
  machine_public_key_registered: Schema.optional(Schema.Boolean),
  sealing_key_id: Schema.optional(Schema.NonEmptyString),
})
export type SandSessionOpenResponse = typeof SandSessionOpenResponse.Type

export const SandSessionCloseBody = Schema.Struct({
  session_id: Schema.String.check(Schema.isUUID()),
  reason: Schema.optional(Schema.String),
})
export type SandSessionCloseBody = typeof SandSessionCloseBody.Type

export const SandSessionRespondBody = Schema.Struct({
  session_id: Schema.String.check(Schema.isUUID()),
  invocation_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  agent_id: Schema.String.check(Schema.isUUID()),
  result: Schema.Unknown,
})
export type SandSessionRespondBody = typeof SandSessionRespondBody.Type

export const SandDispatchRequest = Schema.Struct({
  source_namespace: Schema.NonEmptyString,
  tool_name: Schema.NonEmptyString,
  input: Schema.Record(Schema.String, Schema.Unknown),
  options: Schema.optional(SandCallOptions),
})
export type SandDispatchRequest = typeof SandDispatchRequest.Type

export const SandInvocationEnvelope = Schema.Struct({
  invocation_id: Schema.String.check(Schema.isUUID()),
  session_id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  agent_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  source_namespace: Schema.NonEmptyString,
  tool_id: Schema.NonEmptyString,
  tool_name: Schema.NonEmptyString,
  timeout_ms: Schema.optional(Schema.Number),
  request: SandDispatchRequest,
  command: SandCommandSpec,
  sealed_secrets: Schema.optional(Schema.Array(SandSealedSecret)),
  env_keys: Schema.optional(Schema.Array(Schema.String)),
  requested_at: Schema.String,
  expires_at: Schema.String,
})
export type SandInvocationEnvelope = typeof SandInvocationEnvelope.Type

export const SandInvocationResultStatus = Schema.Literals(["ok", "error", "cancelled"])
export type SandInvocationResultStatus = typeof SandInvocationResultStatus.Type

export const SandInvocationResult = Schema.Struct({
  invocation_id: Schema.String.check(Schema.isUUID()),
  session_id: Schema.String.check(Schema.isUUID()),
  status: SandInvocationResultStatus,
  exit_code: Schema.optional(Schema.Number),
  stdout: Schema.optional(Schema.String),
  stderr: Schema.optional(Schema.String),
  result: Schema.optional(Schema.Unknown),
  error: Schema.optional(Schema.String),
  duration_ms: Schema.Number,
  completed_at: Schema.String,
})
export type SandInvocationResult = typeof SandInvocationResult.Type

export const SandHeartbeatFrame = Schema.Struct({
  type: Schema.Literal("heartbeat"),
  session_id: Schema.String.check(Schema.isUUID()),
  sent_at: Schema.String,
})
export type SandHeartbeatFrame = typeof SandHeartbeatFrame.Type

export const SandInvocationFrame = Schema.Struct({
  type: Schema.Literal("invoke"),
  session_id: Schema.String.check(Schema.isUUID()),
  invocation: SandInvocationEnvelope,
})
export type SandInvocationFrame = typeof SandInvocationFrame.Type

export const SandResultFrame = Schema.Struct({
  type: Schema.Literal("result"),
  session_id: Schema.String.check(Schema.isUUID()),
  result: SandInvocationResult,
})
export type SandResultFrame = typeof SandResultFrame.Type

export const SandErrorFrame = Schema.Struct({
  type: Schema.Literal("error"),
  session_id: Schema.String.check(Schema.isUUID()),
  invocation_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  code: Schema.optional(Schema.String),
  error: Schema.String,
})
export type SandErrorFrame = typeof SandErrorFrame.Type

export const SandSessionFrame = Schema.Union([
  SandHeartbeatFrame,
  SandInvocationFrame,
  SandResultFrame,
  SandErrorFrame,
])
export type SandSessionFrame = typeof SandSessionFrame.Type
