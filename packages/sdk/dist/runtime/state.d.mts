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
//#region ../runtime-state/src/index.d.ts
declare const RuntimeStateEventKind: Schema.Literals<readonly ["run_event", "tool_call", "orbit_usage", "warning", "timing", "final_result"]>;
type RuntimeStateEventKind = typeof RuntimeStateEventKind.Type;
declare const RuntimeStateBaseEvent: Schema.Struct<{
  readonly kind: Schema.Literals<readonly ["run_event", "tool_call", "orbit_usage", "warning", "timing", "final_result"]>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeStateBaseEvent = typeof RuntimeStateBaseEvent.Type;
declare const RuntimeRunStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"run_event">;
  readonly name: Schema.String;
  readonly status: Schema.optional<Schema.String>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeRunStateEvent = typeof RuntimeRunStateEvent.Type;
declare const RuntimeToolCallStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"tool_call">;
  readonly sourceId: Schema.String;
  readonly sourceNamespace: Schema.String;
  readonly toolId: Schema.String;
  readonly title: Schema.optional<Schema.String>;
  readonly status: Schema.String;
  readonly durationMs: Schema.optional<Schema.Number>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly contentType: Schema.optional<Schema.String>;
  readonly upstreamStatus: Schema.optional<Schema.Number>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeToolCallStateEvent = typeof RuntimeToolCallStateEvent.Type;
declare const RuntimeOrbitUsageStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"orbit_usage">;
  readonly operation: Schema.String;
  readonly key: Schema.optional<Schema.String>;
  readonly model: Schema.optional<Schema.String>;
  readonly sizeBytes: Schema.optional<Schema.Number>;
  readonly durationMs: Schema.Number;
  readonly error: Schema.optional<Schema.String>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeOrbitUsageStateEvent = typeof RuntimeOrbitUsageStateEvent.Type;
declare const RuntimeWarningStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"warning">;
  readonly namespace: Schema.optional<Schema.String>;
  readonly tool: Schema.optional<Schema.String>;
  readonly message: Schema.String;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeWarningStateEvent = typeof RuntimeWarningStateEvent.Type;
declare const RuntimeTimingStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"timing">;
  readonly name: Schema.String;
  readonly durationMs: Schema.Number;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeTimingStateEvent = typeof RuntimeTimingStateEvent.Type;
declare const RuntimeFinalResultStateEvent: Schema.Struct<{
  readonly kind: Schema.Literal<"final_result">;
  readonly status: Schema.Literals<readonly ["completed", "failed", "cancelled"]>;
  readonly durationMs: Schema.optional<Schema.Number>;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly artifactCount: Schema.optional<Schema.Number>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeFinalResultStateEvent = typeof RuntimeFinalResultStateEvent.Type;
declare const RuntimeStructuredStateEvent: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"run_event">;
  readonly name: Schema.String;
  readonly status: Schema.optional<Schema.String>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"tool_call">;
  readonly sourceId: Schema.String;
  readonly sourceNamespace: Schema.String;
  readonly toolId: Schema.String;
  readonly title: Schema.optional<Schema.String>;
  readonly status: Schema.String;
  readonly durationMs: Schema.optional<Schema.Number>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly contentType: Schema.optional<Schema.String>;
  readonly upstreamStatus: Schema.optional<Schema.Number>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"orbit_usage">;
  readonly operation: Schema.String;
  readonly key: Schema.optional<Schema.String>;
  readonly model: Schema.optional<Schema.String>;
  readonly sizeBytes: Schema.optional<Schema.Number>;
  readonly durationMs: Schema.Number;
  readonly error: Schema.optional<Schema.String>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"warning">;
  readonly namespace: Schema.optional<Schema.String>;
  readonly tool: Schema.optional<Schema.String>;
  readonly message: Schema.String;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"timing">;
  readonly name: Schema.String;
  readonly durationMs: Schema.Number;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"final_result">;
  readonly status: Schema.Literals<readonly ["completed", "failed", "cancelled"]>;
  readonly durationMs: Schema.optional<Schema.Number>;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly artifactCount: Schema.optional<Schema.Number>;
  readonly time: Schema.String;
  readonly runId: Schema.String;
  readonly scopeId: Schema.String;
  readonly agentId: Schema.optional<Schema.String>;
  readonly rootSpanId: Schema.optional<Schema.String>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>]>;
type RuntimeStructuredStateEvent = typeof RuntimeStructuredStateEvent.Type;
interface RuntimeStatePort {
  readonly record: (event: RuntimeStructuredStateEvent) => Effect.Effect<void, RuntimeError>;
  readonly flush: () => Effect.Effect<void, RuntimeError>;
}
declare const RuntimeStatePort: Context.Service<RuntimeStatePort, RuntimeStatePort>;
interface RuntimeStateWriteQueue<TWrite> {
  readonly push: (write: TWrite) => void;
  readonly drain: () => readonly TWrite[];
  readonly size: () => number;
  readonly snapshot: () => readonly TWrite[];
}
declare function createRuntimeStateWriteQueue<TWrite>(): RuntimeStateWriteQueue<TWrite>;
interface RuntimeStateFlushInfo {
  readonly batchSize: number;
  readonly durationMs: number;
}
interface RuntimeStateWriteFlushOptions<TWrite> {
  readonly queue: RuntimeStateWriteQueue<TWrite>;
  readonly flush: (writes: readonly TWrite[]) => Promise<void>;
  readonly now?: (() => number) | undefined;
  readonly schedule?: ((work: Promise<void>) => void) | undefined;
  readonly onEmpty?: (() => void) | undefined;
  readonly onSuccess?: ((info: RuntimeStateFlushInfo) => void) | undefined;
  readonly onFailure?: ((error: unknown, info: RuntimeStateFlushInfo) => void) | undefined;
}
declare function flushRuntimeStateWriteQueue<TWrite>(options: RuntimeStateWriteFlushOptions<TWrite>): void;
interface LocalRuntimeStatePortSnapshot {
  readonly events: ReadonlyArray<RuntimeStructuredStateEvent>;
  readonly flushCount: number;
}
declare function makeLocalRuntimeStatePort(): {
  layer: Layer.Layer<RuntimeStatePort, never, never>;
  snapshot: () => LocalRuntimeStatePortSnapshot;
};
//#endregion
export { LocalRuntimeStatePortSnapshot, RuntimeFinalResultStateEvent, RuntimeOrbitUsageStateEvent, RuntimeRunStateEvent, RuntimeStateBaseEvent, RuntimeStateEventKind, RuntimeStateFlushInfo, RuntimeStatePort, RuntimeStateWriteFlushOptions, RuntimeStateWriteQueue, RuntimeStructuredStateEvent, RuntimeTimingStateEvent, RuntimeToolCallStateEvent, RuntimeWarningStateEvent, createRuntimeStateWriteQueue, flushRuntimeStateWriteQueue, makeLocalRuntimeStatePort };
//# sourceMappingURL=state.d.mts.map