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
//#region ../runtime-provider-mcp/src/index.d.ts
interface RuntimeMcpInvocationInput {
  readonly namespace: string;
  readonly toolName: string;
  readonly invoke: () => Promise<unknown>;
}
interface RuntimeMcpInvocationResult {
  readonly raw: unknown;
  readonly value: unknown;
  readonly warnings: readonly string[];
  readonly isError: boolean;
  readonly errorMessage?: string | undefined;
}
interface RuntimeMcpProvider {
  readonly invoke: (input: RuntimeMcpInvocationInput) => Effect.Effect<RuntimeMcpInvocationResult, RuntimeError>;
}
declare const RuntimeMcpProvider: Context.Service<RuntimeMcpProvider, RuntimeMcpProvider>;
declare const RuntimeMcpProviderLive: Layer.Layer<RuntimeMcpProvider, never, never>;
declare function normalizeMcpResult(raw: unknown): unknown;
declare function isMcpErrorResult(raw: unknown): boolean;
declare function extractMcpWarnings(result: unknown): string[];
declare function mcpErrorResultMessage(result: unknown): string;
declare function finalizeRuntimeMcpResult(raw: unknown): RuntimeMcpInvocationResult;
//#endregion
export { RuntimeMcpInvocationInput, RuntimeMcpInvocationResult, RuntimeMcpProvider, RuntimeMcpProviderLive, extractMcpWarnings, finalizeRuntimeMcpResult, isMcpErrorResult, mcpErrorResultMessage, normalizeMcpResult };
//# sourceMappingURL=mcp-provider.d.mts.map