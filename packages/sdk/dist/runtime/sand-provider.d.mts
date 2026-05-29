import { Context, Effect, Layer, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
type RuntimeErrorReason = 'validation' | 'planning' | 'provider' | 'host' | 'state' | 'artifact' | 'timeout' | 'internal';
declare class RuntimeError extends Error {
  readonly reason: RuntimeErrorReason;
  readonly details?: unknown | undefined;
  readonly _tag = "RuntimeError";
  constructor(reason: RuntimeErrorReason, message: string, details?: unknown | undefined);
}
//#endregion
//#region ../runtime-provider-sand/src/index.d.ts
type RuntimeSandArgvPart = {
  readonly kind: 'literal';
  readonly value: string;
} | {
  readonly kind: 'input';
  readonly path: string;
} | {
  readonly kind: 'option';
  readonly path: string;
  readonly flag: string;
  readonly omit_if_empty?: boolean | undefined;
} | {
  readonly kind: 'flag';
  readonly path: string;
  readonly flag: string;
};
interface RuntimeSandCommandBinding {
  readonly argv_template: ReadonlyArray<RuntimeSandArgvPart>;
  readonly sand_stdin_mode: 'none' | 'json' | 'text';
  readonly sand_result_mode: string;
  readonly timeout_ms?: number | undefined;
  readonly tool_name?: string | undefined;
}
interface RuntimeSandSourceConfig {
  readonly cwd_policy?: string | undefined;
  readonly cwd?: string | undefined;
  readonly args?: ReadonlyArray<string> | undefined;
}
interface RuntimeSandCallOptions {
  readonly env?: Record<string, string> | undefined;
  readonly secret_env?: Record<string, string> | undefined;
  readonly cwd?: string | undefined;
  readonly timeout_ms?: number | undefined;
}
interface RuntimeSandInvocationInput {
  readonly namespace: string;
  readonly toolName: string;
  readonly resultMode: string;
  readonly invoke: () => Promise<unknown>;
}
interface RuntimeSandInvocationResult {
  readonly raw: unknown;
  readonly value: unknown;
}
interface RuntimeSandProvider {
  readonly invoke: (input: RuntimeSandInvocationInput) => Effect.Effect<RuntimeSandInvocationResult, RuntimeError>;
}
declare const RuntimeSandProvider: Context.Service<RuntimeSandProvider, RuntimeSandProvider>;
declare const RuntimeSandProviderLive: Layer.Layer<RuntimeSandProvider, never, never>;
declare function readRuntimeInputPath(input: Record<string, unknown>, path: string): unknown;
declare function toRuntimeCliString(value: unknown): string | null;
declare function normalizeRuntimeStringRecord(value: unknown): Record<string, string> | undefined;
declare function isBlockedRuntimeSandEnvKey(key: string): boolean;
declare function normalizeRuntimeSandSecretEnvRecord(value: unknown): Record<string, string> | undefined;
declare function buildRuntimeSandCliArgv(binding: RuntimeSandCommandBinding, input: Record<string, unknown>): string[];
declare function resolveRuntimeSandCwd(sourceConfig: RuntimeSandSourceConfig, input: Record<string, unknown>, originCwd: string | undefined, overrideCwd: string | undefined, normalizeOriginCwd?: (cwd: string | undefined) => string | undefined): string | undefined;
declare function resolveRuntimeSandStdin(binding: RuntimeSandCommandBinding, input: Record<string, unknown>): string | undefined;
declare function normalizeRuntimeSandCallOptions(input: unknown): RuntimeSandCallOptions | undefined;
declare function normalizeRuntimeSandResult(raw: unknown, resultMode: string): unknown;
declare function sanitizeRuntimeSandInvocationLogInput(namespace: string, tool: string, input: Record<string, unknown>, options: {
  env?: Record<string, string> | undefined;
  cwd?: string | undefined;
  timeout_ms?: number | undefined;
} | undefined, envKeys: ReadonlyArray<string>, secretEnvKeys?: ReadonlyArray<string>): Record<string, unknown>;
//#endregion
export { RuntimeSandArgvPart, RuntimeSandCallOptions, RuntimeSandCommandBinding, RuntimeSandInvocationInput, RuntimeSandInvocationResult, RuntimeSandProvider, RuntimeSandProviderLive, RuntimeSandSourceConfig, buildRuntimeSandCliArgv, isBlockedRuntimeSandEnvKey, normalizeRuntimeSandCallOptions, normalizeRuntimeSandResult, normalizeRuntimeSandSecretEnvRecord, normalizeRuntimeStringRecord, readRuntimeInputPath, resolveRuntimeSandCwd, resolveRuntimeSandStdin, sanitizeRuntimeSandInvocationLogInput, toRuntimeCliString };
//# sourceMappingURL=sand-provider.d.mts.map