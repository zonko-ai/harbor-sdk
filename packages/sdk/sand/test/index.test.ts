import { describe, expect, it } from "bun:test"
import { Schema } from "effect"
import {
  SandInvocationEnvelope,
  SandInvocationResult,
  SandSessionOpenBody,
  SandSessionFrame,
  type SandInvocationEnvelope as SandInvocationEnvelopeType,
} from "../src/index"

describe("sand contracts", () => {
  it("decodes a sand invocation envelope", () => {
    const envelope = Schema.decodeUnknownSync(SandInvocationEnvelope)({
      invocation_id: "11111111-1111-4111-8111-111111111111",
      session_id: "22222222-2222-4222-8222-222222222222",
      workspace_id: "33333333-3333-4333-8333-333333333333",
      agent_id: "44444444-4444-4444-8444-444444444444",
      machine_id: "machine-a",
      source_namespace: "vercel",
      tool_id: "deploy",
      tool_name: "deploy",
      timeout_ms: 45_000,
      request: {
        source_namespace: "vercel",
        tool_name: "deploy",
        input: { project: "web" },
        options: {
          env: { VERCEL_PROJECT_ID: "proj_123" },
          secret_env: { VERCEL_TOKEN: { __hrbr_secret_ref: "ref_123" } },
          timeout_ms: 30_000,
        },
      },
      command: {
        launcher: "binary",
        command: "vercel",
        args: ["deploy", "--prod=false"],
        stdin_mode: "none",
        result_mode: "json_stdout",
        runtime: {
          artifacts: [{ id: "vercel_config_dir", kind: "temp_dir", prefix: "hrbr-sand-vercel-" }],
          env: [{ env: "VERCEL_TELEMETRY_DISABLED", value: { kind: "literal", value: "1" } }],
          args: [
            { kind: "literal", value: "--global-config" },
            { kind: "artifact_path", artifact_id: "vercel_config_dir" },
            { kind: "literal", value: "--token" },
            { kind: "secret_env", env: "VERCEL_TOKEN" },
          ],
        },
        sandbox_policy: {
          filesystem: "workspace",
          network: "allowlist",
          allowed_hosts: ["api.vercel.com"],
        },
      },
      sealed_secrets: [{
        env: "VERCEL_TOKEN",
        key_id: "machine-key",
        algorithm: "rsa-oaep-256+jwk-v1",
        ciphertext_b64: "c2VhbGVk",
        cipher_text: "c2VhbGVk",
      }],
      env_keys: ["VERCEL_PROJECT_ID", "VERCEL_TOKEN"],
      requested_at: "2026-04-22T00:00:00.000Z",
      expires_at: "2026-04-22T00:05:00.000Z",
    }) satisfies SandInvocationEnvelopeType

    expect(envelope.command.command).toBe("vercel")
    expect(envelope.command.runtime?.args).toHaveLength(4)
    expect(envelope.timeout_ms).toBe(45_000)
    expect(envelope.request.options?.env?.VERCEL_PROJECT_ID).toBe("proj_123")
    expect(envelope.request.options?.secret_env?.VERCEL_TOKEN.__hrbr_secret_ref).toBe("ref_123")
  })

  it("decodes sand session frames and invocation results", () => {
    const result = Schema.decodeUnknownSync(SandInvocationResult)({
      invocation_id: "11111111-1111-4111-8111-111111111111",
      session_id: "22222222-2222-4222-8222-222222222222",
      status: "ok",
      exit_code: 0,
      stdout: "{\"ok\":true}",
      result: { ok: true },
      duration_ms: 123,
      completed_at: "2026-04-22T00:00:01.000Z",
    })

    const frame = Schema.decodeUnknownSync(SandSessionFrame)({
      type: "result",
      session_id: "22222222-2222-4222-8222-222222222222",
      result,
    })

    expect(frame.type).toBe("result")
    expect(frame.result.status).toBe("ok")
  })

  it("decodes sand session opens with machine sealing keys", () => {
    const open = Schema.decodeUnknownSync(SandSessionOpenBody)({
      workspace_id: "33333333-3333-4333-8333-333333333333",
      agent_id: "44444444-4444-4444-8444-444444444444",
      machine_id: "machine-a",
      capabilities: {
        sandbox_runtime_available: true,
        runtime_constraints: {
          os: ["darwin"],
          arch: ["arm64"],
        },
      },
      machine_public_key: {
        key_id: "machine-key",
        algorithm: "rsa-oaep-256+jwk-v1",
        public_key_jwk: {
          kty: "RSA",
          e: "AQAB",
          n: "somerawmodulus",
        },
      },
    })

    expect(open.machine_public_key?.key_id).toBe("machine-key")
    expect(open.machine_public_key?.algorithm).toBe("rsa-oaep-256+jwk-v1")
    expect(open.capabilities?.runtime_constraints?.os).toEqual(["darwin"])
  })
})
