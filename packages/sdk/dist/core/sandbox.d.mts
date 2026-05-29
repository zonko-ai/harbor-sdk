import { Schema } from "effect";

//#region ../core-effect/src/sandbox.d.ts
declare const SAND_ERROR_TAGS: {
  readonly MACHINE_KEYPAIR_UNAVAILABLE: "SAND_MACHINE_KEYPAIR_UNAVAILABLE";
  readonly SESSION_INCOMPLETE: "SAND_SESSION_INCOMPLETE";
  readonly RUNTIME_UNAVAILABLE: "LOCAL_RUNTIME_UNAVAILABLE";
  readonly TOOL_UNAVAILABLE: "LOCAL_TOOL_UNAVAILABLE";
};
type SandErrorTag = (typeof SAND_ERROR_TAGS)[keyof typeof SAND_ERROR_TAGS];
declare const SandRuntimeOS: Schema.Literals<readonly ["darwin", "linux", "windows"]>;
type SandRuntimeOS = typeof SandRuntimeOS.Type;
declare const SandRuntimeArch: Schema.Literals<readonly ["arm64", "x64"]>;
type SandRuntimeArch = typeof SandRuntimeArch.Type;
declare const SandRuntimeConstraints: Schema.Struct<{
  readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
  readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
  readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
}>;
type SandRuntimeConstraints = typeof SandRuntimeConstraints.Type;
declare const SandIsolationFilesystemMode: Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>;
type SandIsolationFilesystemMode = typeof SandIsolationFilesystemMode.Type;
declare const SandIsolationNetworkMode: Schema.Literals<readonly ["inherit", "deny", "allowlist"]>;
type SandIsolationNetworkMode = typeof SandIsolationNetworkMode.Type;
declare const SandIsolationPolicy: Schema.Struct<{
  readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
  readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
  readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
  readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
  readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type SandIsolationPolicy = typeof SandIsolationPolicy.Type;
declare const SandSecretBinding: Schema.Struct<{
  readonly secret_name: Schema.NonEmptyString;
  readonly env: Schema.NonEmptyString;
  readonly required: Schema.optional<Schema.Boolean>;
}>;
type SandSecretBinding = typeof SandSecretBinding.Type;
declare const SandSealingAlgorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
type SandSealingAlgorithm = typeof SandSealingAlgorithm.Type;
declare const SandMachinePublicKey: Schema.Struct<{
  readonly key_id: Schema.NonEmptyString;
  readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
  readonly public_key_jwk: Schema.$Record<Schema.String, Schema.Unknown>;
}>;
type SandMachinePublicKey = typeof SandMachinePublicKey.Type;
declare const SandSealedSecret: Schema.Struct<{
  readonly env: Schema.NonEmptyString;
  readonly key_id: Schema.NonEmptyString;
  readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
  readonly ciphertext_b64: Schema.optional<Schema.NonEmptyString>;
}>;
type SandSealedSecret = typeof SandSealedSecret.Type;
declare const SandSecretRef: Schema.Struct<{
  readonly __hrbr_secret_ref: Schema.NonEmptyString;
}>;
type SandSecretRef = typeof SandSecretRef.Type;
declare const SandResultMode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
type SandResultMode = typeof SandResultMode.Type;
declare const SandStdinMode: Schema.Literals<readonly ["none", "json", "text"]>;
type SandStdinMode = typeof SandStdinMode.Type;
declare const SandCallOptions: Schema.Struct<{
  readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  readonly secret_env: Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{
    readonly __hrbr_secret_ref: Schema.NonEmptyString;
  }>>>;
  readonly cwd: Schema.optional<Schema.String>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
}>;
type SandCallOptions = typeof SandCallOptions.Type;
declare const SandLauncher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
type SandLauncher = typeof SandLauncher.Type;
declare const SandRuntimeTempDirArtifact: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.Literal<"temp_dir">;
  readonly prefix: Schema.NonEmptyString;
}>;
type SandRuntimeTempDirArtifact = typeof SandRuntimeTempDirArtifact.Type;
declare const SandRuntimeTempFileArtifact: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.Literal<"temp_file">;
  readonly filename: Schema.NonEmptyString;
  readonly prefix: Schema.optional<Schema.NonEmptyString>;
  readonly parent_artifact_id: Schema.optional<Schema.String>;
  readonly contents: Schema.optional<Schema.String>;
}>;
type SandRuntimeTempFileArtifact = typeof SandRuntimeTempFileArtifact.Type;
declare const SandRuntimeArtifact: Schema.Union<readonly [Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.Literal<"temp_dir">;
  readonly prefix: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.Literal<"temp_file">;
  readonly filename: Schema.NonEmptyString;
  readonly prefix: Schema.optional<Schema.NonEmptyString>;
  readonly parent_artifact_id: Schema.optional<Schema.String>;
  readonly contents: Schema.optional<Schema.String>;
}>]>;
type SandRuntimeArtifact = typeof SandRuntimeArtifact.Type;
declare const SandRuntimeValueLiteral: Schema.Struct<{
  readonly kind: Schema.Literal<"literal">;
  readonly value: Schema.String;
}>;
type SandRuntimeValueLiteral = typeof SandRuntimeValueLiteral.Type;
declare const SandRuntimeValueArtifactPath: Schema.Struct<{
  readonly kind: Schema.Literal<"artifact_path">;
  readonly artifact_id: Schema.String;
}>;
type SandRuntimeValueArtifactPath = typeof SandRuntimeValueArtifactPath.Type;
declare const SandRuntimeValueSecretEnv: Schema.Struct<{
  readonly kind: Schema.Literal<"secret_env">;
  readonly env: Schema.String;
}>;
type SandRuntimeValueSecretEnv = typeof SandRuntimeValueSecretEnv.Type;
declare const SandRuntimeValue: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"literal">;
  readonly value: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"artifact_path">;
  readonly artifact_id: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"secret_env">;
  readonly env: Schema.String;
}>]>;
type SandRuntimeValue = typeof SandRuntimeValue.Type;
declare const SandRuntimeEnvBinding: Schema.Struct<{
  readonly env: Schema.String;
  readonly value: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"artifact_path">;
    readonly artifact_id: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"secret_env">;
    readonly env: Schema.String;
  }>]>;
}>;
type SandRuntimeEnvBinding = typeof SandRuntimeEnvBinding.Type;
declare const SandRuntimeSpec: Schema.Struct<{
  readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly id: Schema.String;
    readonly kind: Schema.Literal<"temp_dir">;
    readonly prefix: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly id: Schema.String;
    readonly kind: Schema.Literal<"temp_file">;
    readonly filename: Schema.NonEmptyString;
    readonly prefix: Schema.optional<Schema.NonEmptyString>;
    readonly parent_artifact_id: Schema.optional<Schema.String>;
    readonly contents: Schema.optional<Schema.String>;
  }>]>>>;
  readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly env: Schema.String;
    readonly value: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"artifact_path">;
      readonly artifact_id: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"secret_env">;
      readonly env: Schema.String;
    }>]>;
  }>>>;
  readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"literal">;
    readonly value: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"artifact_path">;
    readonly artifact_id: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"secret_env">;
    readonly env: Schema.String;
  }>]>>>;
}>;
type SandRuntimeSpec = typeof SandRuntimeSpec.Type;
declare const SandCommandSpec: Schema.Struct<{
  readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
  readonly command: Schema.NonEmptyString;
  readonly args: Schema.$Array<Schema.String>;
  readonly stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
  readonly result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly cwd: Schema.optional<Schema.String>;
  readonly stdin: Schema.optional<Schema.String>;
  readonly sandbox_policy: Schema.optional<Schema.Struct<{
    readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
    readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
    readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
    readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly runtime: Schema.optional<Schema.Struct<{
    readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_dir">;
      readonly prefix: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly id: Schema.String;
      readonly kind: Schema.Literal<"temp_file">;
      readonly filename: Schema.NonEmptyString;
      readonly prefix: Schema.optional<Schema.NonEmptyString>;
      readonly parent_artifact_id: Schema.optional<Schema.String>;
      readonly contents: Schema.optional<Schema.String>;
    }>]>>>;
    readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.String;
      readonly value: Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>;
    }>>>;
    readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"literal">;
      readonly value: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"artifact_path">;
      readonly artifact_id: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"secret_env">;
      readonly env: Schema.String;
    }>]>>>;
  }>>;
  readonly runtime_constraints: Schema.optional<Schema.Struct<{
    readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
    readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
    readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
  }>>;
}>;
type SandCommandSpec = typeof SandCommandSpec.Type;
declare const SandMachineCapabilities: Schema.Struct<{
  readonly sandbox_runtime_available: Schema.Boolean;
  readonly sandbox_runtime_version: Schema.optional<Schema.String>;
  readonly runtime_constraints: Schema.optional<Schema.Struct<{
    readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
    readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
    readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
  }>>;
  readonly cli_sources: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type SandMachineCapabilities = typeof SandMachineCapabilities.Type;
declare const SandSessionStatus: Schema.Literals<readonly ["created", "active", "closing", "closed", "expired"]>;
type SandSessionStatus = typeof SandSessionStatus.Type;
declare const SandSessionOpenBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly run_id: Schema.optional<Schema.String>;
  readonly capabilities: Schema.optional<Schema.Struct<{
    readonly sandbox_runtime_available: Schema.Boolean;
    readonly sandbox_runtime_version: Schema.optional<Schema.String>;
    readonly runtime_constraints: Schema.optional<Schema.Struct<{
      readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
      readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
      readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
    }>>;
    readonly cli_sources: Schema.optional<Schema.$Array<Schema.String>>;
  }>>;
  readonly machine_public_key: Schema.optional<Schema.Struct<{
    readonly key_id: Schema.NonEmptyString;
    readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
    readonly public_key_jwk: Schema.$Record<Schema.String, Schema.Unknown>;
  }>>;
}>;
type SandSessionOpenBody = typeof SandSessionOpenBody.Type;
declare const SandSessionOpenResponse: Schema.Struct<{
  readonly session_id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["created", "active", "closing", "closed", "expired"]>;
  readonly expires_at: Schema.String;
  readonly heartbeat_interval_ms: Schema.optional<Schema.Number>;
  readonly machine_public_key_registered: Schema.optional<Schema.Boolean>;
  readonly sealing_key_id: Schema.optional<Schema.NonEmptyString>;
}>;
type SandSessionOpenResponse = typeof SandSessionOpenResponse.Type;
declare const SandSessionCloseBody: Schema.Struct<{
  readonly session_id: Schema.String;
  readonly reason: Schema.optional<Schema.String>;
}>;
type SandSessionCloseBody = typeof SandSessionCloseBody.Type;
declare const SandDispatchRequest: Schema.Struct<{
  readonly source_namespace: Schema.NonEmptyString;
  readonly tool_name: Schema.NonEmptyString;
  readonly input: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly options: Schema.optional<Schema.Struct<{
    readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
    readonly secret_env: Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{
      readonly __hrbr_secret_ref: Schema.NonEmptyString;
    }>>>;
    readonly cwd: Schema.optional<Schema.String>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
}>;
type SandDispatchRequest = typeof SandDispatchRequest.Type;
declare const SandInvocationEnvelope: Schema.Struct<{
  readonly invocation_id: Schema.String;
  readonly session_id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly agent_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly run_id: Schema.optional<Schema.String>;
  readonly source_id: Schema.optional<Schema.String>;
  readonly source_namespace: Schema.NonEmptyString;
  readonly tool_id: Schema.NonEmptyString;
  readonly tool_name: Schema.NonEmptyString;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly request: Schema.Struct<{
    readonly source_namespace: Schema.NonEmptyString;
    readonly tool_name: Schema.NonEmptyString;
    readonly input: Schema.$Record<Schema.String, Schema.Unknown>;
    readonly options: Schema.optional<Schema.Struct<{
      readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
      readonly secret_env: Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{
        readonly __hrbr_secret_ref: Schema.NonEmptyString;
      }>>>;
      readonly cwd: Schema.optional<Schema.String>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
    }>>;
  }>;
  readonly command: Schema.Struct<{
    readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
    readonly command: Schema.NonEmptyString;
    readonly args: Schema.$Array<Schema.String>;
    readonly stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
    readonly result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly cwd: Schema.optional<Schema.String>;
    readonly stdin: Schema.optional<Schema.String>;
    readonly sandbox_policy: Schema.optional<Schema.Struct<{
      readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
      readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
      readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
      readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
    }>>;
    readonly runtime: Schema.optional<Schema.Struct<{
      readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_dir">;
        readonly prefix: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly id: Schema.String;
        readonly kind: Schema.Literal<"temp_file">;
        readonly filename: Schema.NonEmptyString;
        readonly prefix: Schema.optional<Schema.NonEmptyString>;
        readonly parent_artifact_id: Schema.optional<Schema.String>;
        readonly contents: Schema.optional<Schema.String>;
      }>]>>>;
      readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
        readonly env: Schema.String;
        readonly value: Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>;
      }>>>;
      readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly kind: Schema.Literal<"literal">;
        readonly value: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"artifact_path">;
        readonly artifact_id: Schema.String;
      }>, Schema.Struct<{
        readonly kind: Schema.Literal<"secret_env">;
        readonly env: Schema.String;
      }>]>>>;
    }>>;
    readonly runtime_constraints: Schema.optional<Schema.Struct<{
      readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
      readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
      readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
    }>>;
  }>;
  readonly sealed_secrets: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly env: Schema.NonEmptyString;
    readonly key_id: Schema.NonEmptyString;
    readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
    readonly ciphertext_b64: Schema.optional<Schema.NonEmptyString>;
  }>>>;
  readonly env_keys: Schema.optional<Schema.$Array<Schema.String>>;
  readonly requested_at: Schema.String;
  readonly expires_at: Schema.String;
}>;
type SandInvocationEnvelope = typeof SandInvocationEnvelope.Type;
declare const SandSessionRespondBody: Schema.Struct<{
  readonly session_id: Schema.String;
  readonly invocation_id: Schema.String;
  readonly machine_id: Schema.NonEmptyString;
  readonly agent_id: Schema.String;
  readonly result: Schema.Unknown;
}>;
type SandSessionRespondBody = typeof SandSessionRespondBody.Type;
declare const SandInvocationResultStatus: Schema.Literals<readonly ["ok", "error", "cancelled"]>;
type SandInvocationResultStatus = typeof SandInvocationResultStatus.Type;
declare const SandInvocationResult: Schema.Struct<{
  readonly invocation_id: Schema.String;
  readonly session_id: Schema.String;
  readonly status: Schema.Literals<readonly ["ok", "error", "cancelled"]>;
  readonly exit_code: Schema.optional<Schema.Number>;
  readonly stdout: Schema.optional<Schema.String>;
  readonly stderr: Schema.optional<Schema.String>;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly duration_ms: Schema.Number;
  readonly completed_at: Schema.String;
}>;
type SandInvocationResult = typeof SandInvocationResult.Type;
declare const SandHeartbeatFrame: Schema.Struct<{
  readonly type: Schema.Literal<"heartbeat">;
  readonly session_id: Schema.String;
  readonly sent_at: Schema.String;
}>;
type SandHeartbeatFrame = typeof SandHeartbeatFrame.Type;
declare const SandInvocationFrame: Schema.Struct<{
  readonly type: Schema.Literal<"invoke">;
  readonly session_id: Schema.String;
  readonly invocation: Schema.Struct<{
    readonly invocation_id: Schema.String;
    readonly session_id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly agent_id: Schema.String;
    readonly machine_id: Schema.NonEmptyString;
    readonly run_id: Schema.optional<Schema.String>;
    readonly source_id: Schema.optional<Schema.String>;
    readonly source_namespace: Schema.NonEmptyString;
    readonly tool_id: Schema.NonEmptyString;
    readonly tool_name: Schema.NonEmptyString;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly request: Schema.Struct<{
      readonly source_namespace: Schema.NonEmptyString;
      readonly tool_name: Schema.NonEmptyString;
      readonly input: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly options: Schema.optional<Schema.Struct<{
        readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
        readonly secret_env: Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{
          readonly __hrbr_secret_ref: Schema.NonEmptyString;
        }>>>;
        readonly cwd: Schema.optional<Schema.String>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
      }>>;
    }>;
    readonly command: Schema.Struct<{
      readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
      readonly command: Schema.NonEmptyString;
      readonly args: Schema.$Array<Schema.String>;
      readonly stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
      readonly result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
      readonly cwd: Schema.optional<Schema.String>;
      readonly stdin: Schema.optional<Schema.String>;
      readonly sandbox_policy: Schema.optional<Schema.Struct<{
        readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
        readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
        readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
      }>>;
      readonly runtime: Schema.optional<Schema.Struct<{
        readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_dir">;
          readonly prefix: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_file">;
          readonly filename: Schema.NonEmptyString;
          readonly prefix: Schema.optional<Schema.NonEmptyString>;
          readonly parent_artifact_id: Schema.optional<Schema.String>;
          readonly contents: Schema.optional<Schema.String>;
        }>]>>>;
        readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
          readonly env: Schema.String;
          readonly value: Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"artifact_path">;
            readonly artifact_id: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"secret_env">;
            readonly env: Schema.String;
          }>]>;
        }>>>;
        readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>>>;
      }>>;
      readonly runtime_constraints: Schema.optional<Schema.Struct<{
        readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
        readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
        readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly sealed_secrets: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.NonEmptyString;
      readonly key_id: Schema.NonEmptyString;
      readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
      readonly ciphertext_b64: Schema.optional<Schema.NonEmptyString>;
    }>>>;
    readonly env_keys: Schema.optional<Schema.$Array<Schema.String>>;
    readonly requested_at: Schema.String;
    readonly expires_at: Schema.String;
  }>;
}>;
type SandInvocationFrame = typeof SandInvocationFrame.Type;
declare const SandResultFrame: Schema.Struct<{
  readonly type: Schema.Literal<"result">;
  readonly session_id: Schema.String;
  readonly result: Schema.Struct<{
    readonly invocation_id: Schema.String;
    readonly session_id: Schema.String;
    readonly status: Schema.Literals<readonly ["ok", "error", "cancelled"]>;
    readonly exit_code: Schema.optional<Schema.Number>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
    readonly result: Schema.optional<Schema.Unknown>;
    readonly error: Schema.optional<Schema.String>;
    readonly duration_ms: Schema.Number;
    readonly completed_at: Schema.String;
  }>;
}>;
type SandResultFrame = typeof SandResultFrame.Type;
declare const SandErrorFrame: Schema.Struct<{
  readonly type: Schema.Literal<"error">;
  readonly session_id: Schema.String;
  readonly invocation_id: Schema.optional<Schema.String>;
  readonly code: Schema.optional<Schema.String>;
  readonly error: Schema.String;
}>;
type SandErrorFrame = typeof SandErrorFrame.Type;
declare const SandSessionFrame: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"heartbeat">;
  readonly session_id: Schema.String;
  readonly sent_at: Schema.String;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"invoke">;
  readonly session_id: Schema.String;
  readonly invocation: Schema.Struct<{
    readonly invocation_id: Schema.String;
    readonly session_id: Schema.String;
    readonly workspace_id: Schema.String;
    readonly agent_id: Schema.String;
    readonly machine_id: Schema.NonEmptyString;
    readonly run_id: Schema.optional<Schema.String>;
    readonly source_id: Schema.optional<Schema.String>;
    readonly source_namespace: Schema.NonEmptyString;
    readonly tool_id: Schema.NonEmptyString;
    readonly tool_name: Schema.NonEmptyString;
    readonly timeout_ms: Schema.optional<Schema.Number>;
    readonly request: Schema.Struct<{
      readonly source_namespace: Schema.NonEmptyString;
      readonly tool_name: Schema.NonEmptyString;
      readonly input: Schema.$Record<Schema.String, Schema.Unknown>;
      readonly options: Schema.optional<Schema.Struct<{
        readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
        readonly secret_env: Schema.optional<Schema.$Record<Schema.String, Schema.Struct<{
          readonly __hrbr_secret_ref: Schema.NonEmptyString;
        }>>>;
        readonly cwd: Schema.optional<Schema.String>;
        readonly timeout_ms: Schema.optional<Schema.Number>;
      }>>;
    }>;
    readonly command: Schema.Struct<{
      readonly launcher: Schema.Literals<readonly ["binary", "npx", "uvx", "bunx"]>;
      readonly command: Schema.NonEmptyString;
      readonly args: Schema.$Array<Schema.String>;
      readonly stdin_mode: Schema.Literals<readonly ["none", "json", "text"]>;
      readonly result_mode: Schema.Literals<readonly ["json_stdout", "stdout_text", "binary_base64", "exit_code_only"]>;
      readonly timeout_ms: Schema.optional<Schema.Number>;
      readonly cwd: Schema.optional<Schema.String>;
      readonly stdin: Schema.optional<Schema.String>;
      readonly sandbox_policy: Schema.optional<Schema.Struct<{
        readonly filesystem: Schema.optional<Schema.Literals<readonly ["workspace", "cwd", "custom", "none"]>>;
        readonly network: Schema.optional<Schema.Literals<readonly ["inherit", "deny", "allowlist"]>>;
        readonly readable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly writable_paths: Schema.optional<Schema.$Array<Schema.String>>;
        readonly allowed_hosts: Schema.optional<Schema.$Array<Schema.String>>;
      }>>;
      readonly runtime: Schema.optional<Schema.Struct<{
        readonly artifacts: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_dir">;
          readonly prefix: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly id: Schema.String;
          readonly kind: Schema.Literal<"temp_file">;
          readonly filename: Schema.NonEmptyString;
          readonly prefix: Schema.optional<Schema.NonEmptyString>;
          readonly parent_artifact_id: Schema.optional<Schema.String>;
          readonly contents: Schema.optional<Schema.String>;
        }>]>>>;
        readonly env: Schema.optional<Schema.$Array<Schema.Struct<{
          readonly env: Schema.String;
          readonly value: Schema.Union<readonly [Schema.Struct<{
            readonly kind: Schema.Literal<"literal">;
            readonly value: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"artifact_path">;
            readonly artifact_id: Schema.String;
          }>, Schema.Struct<{
            readonly kind: Schema.Literal<"secret_env">;
            readonly env: Schema.String;
          }>]>;
        }>>>;
        readonly args: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly kind: Schema.Literal<"literal">;
          readonly value: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"artifact_path">;
          readonly artifact_id: Schema.String;
        }>, Schema.Struct<{
          readonly kind: Schema.Literal<"secret_env">;
          readonly env: Schema.String;
        }>]>>>;
      }>>;
      readonly runtime_constraints: Schema.optional<Schema.Struct<{
        readonly os: Schema.optional<Schema.$Array<Schema.Literals<readonly ["darwin", "linux", "windows"]>>>;
        readonly arch: Schema.optional<Schema.$Array<Schema.Literals<readonly ["arm64", "x64"]>>>;
        readonly requires_sandbox_runtime: Schema.optional<Schema.Boolean>;
      }>>;
    }>;
    readonly sealed_secrets: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly env: Schema.NonEmptyString;
      readonly key_id: Schema.NonEmptyString;
      readonly algorithm: Schema.Literal<"rsa-oaep-256+jwk-v1">;
      readonly ciphertext_b64: Schema.optional<Schema.NonEmptyString>;
    }>>>;
    readonly env_keys: Schema.optional<Schema.$Array<Schema.String>>;
    readonly requested_at: Schema.String;
    readonly expires_at: Schema.String;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"result">;
  readonly session_id: Schema.String;
  readonly result: Schema.Struct<{
    readonly invocation_id: Schema.String;
    readonly session_id: Schema.String;
    readonly status: Schema.Literals<readonly ["ok", "error", "cancelled"]>;
    readonly exit_code: Schema.optional<Schema.Number>;
    readonly stdout: Schema.optional<Schema.String>;
    readonly stderr: Schema.optional<Schema.String>;
    readonly result: Schema.optional<Schema.Unknown>;
    readonly error: Schema.optional<Schema.String>;
    readonly duration_ms: Schema.Number;
    readonly completed_at: Schema.String;
  }>;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"error">;
  readonly session_id: Schema.String;
  readonly invocation_id: Schema.optional<Schema.String>;
  readonly code: Schema.optional<Schema.String>;
  readonly error: Schema.String;
}>]>;
type SandSessionFrame = typeof SandSessionFrame.Type;
declare const SandboxRuntime: Schema.Literals<readonly ["codemode", "node", "bun"]>;
type SandboxRuntime = typeof SandboxRuntime.Type;
declare const SandboxRequest: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly runtime: Schema.Literals<readonly ["codemode", "node", "bun"]>;
  readonly entrypoint: Schema.NonEmptyString;
  readonly files: Schema.$Record<Schema.String, Schema.String>;
  readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
  readonly secrets: Schema.optional<Schema.$Array<Schema.String>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
}>;
type SandboxRequest = typeof SandboxRequest.Type;
declare const SandboxResult: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly stdout: Schema.String;
  readonly stderr: Schema.String;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
}>;
type SandboxResult = typeof SandboxResult.Type;
//#endregion
export { SAND_ERROR_TAGS, SandCallOptions, SandCommandSpec, SandDispatchRequest, SandErrorFrame, SandErrorTag, SandHeartbeatFrame, SandInvocationEnvelope, SandInvocationFrame, SandInvocationResult, SandInvocationResultStatus, SandIsolationFilesystemMode, SandIsolationNetworkMode, SandIsolationPolicy, SandLauncher, SandMachineCapabilities, SandMachinePublicKey, SandResultFrame, SandResultMode, SandRuntimeArch, SandRuntimeArtifact, SandRuntimeConstraints, SandRuntimeEnvBinding, SandRuntimeOS, SandRuntimeSpec, SandRuntimeTempDirArtifact, SandRuntimeTempFileArtifact, SandRuntimeValue, SandRuntimeValueArtifactPath, SandRuntimeValueLiteral, SandRuntimeValueSecretEnv, SandSealedSecret, SandSealingAlgorithm, SandSecretBinding, SandSecretRef, SandSessionCloseBody, SandSessionFrame, SandSessionOpenBody, SandSessionOpenResponse, SandSessionRespondBody, SandSessionStatus, SandStdinMode, SandboxRequest, SandboxResult, SandboxRuntime };
//# sourceMappingURL=sandbox.d.mts.map