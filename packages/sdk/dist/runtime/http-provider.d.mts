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
//#region ../runtime-provider-http/src/index.d.ts
interface RuntimeHttpRawResult {
  readonly result?: unknown;
  readonly content_type?: string | null | undefined;
  readonly upstream_status?: number | null | undefined;
  readonly upstream_traceparent?: string | undefined;
  readonly [key: string]: unknown;
}
interface RuntimeHttpInvocationInput {
  readonly namespace: string;
  readonly toolName: string;
  readonly invoke: () => Promise<RuntimeHttpRawResult>;
}
interface RuntimeHttpInvocationResult {
  readonly raw: RuntimeHttpRawResult;
  readonly value: unknown;
  readonly contentType?: string | null | undefined;
  readonly upstreamStatus?: number | null | undefined;
  readonly upstreamTraceparent?: string | undefined;
}
interface RuntimeHttpProvider {
  readonly invoke: (input: RuntimeHttpInvocationInput) => Effect.Effect<RuntimeHttpInvocationResult, RuntimeError>;
}
declare const RuntimeHttpProvider: Context.Service<RuntimeHttpProvider, RuntimeHttpProvider>;
declare const RuntimeHttpProviderLive: Layer.Layer<RuntimeHttpProvider, never, never>;
declare function finalizeRuntimeHttpResult(raw: RuntimeHttpRawResult): RuntimeHttpInvocationResult;
//#endregion
export { RuntimeHttpInvocationInput, RuntimeHttpInvocationResult, RuntimeHttpProvider, RuntimeHttpProviderLive, RuntimeHttpRawResult, finalizeRuntimeHttpResult };
//# sourceMappingURL=http-provider.d.mts.map