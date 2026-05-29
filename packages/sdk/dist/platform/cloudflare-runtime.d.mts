import { Context, Effect, Layer, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
declare const RuntimeMetadata: Schema.$Record<Schema.String, Schema.Unknown>;
type RuntimeMetadata = typeof RuntimeMetadata.Type;
declare const TrustedExecutionContext: Schema.Struct<{
  readonly scopeId: Schema.String;
  readonly runId: Schema.String;
  readonly attributionId: Schema.optional<Schema.String>;
  readonly machineId: Schema.optional<Schema.String>;
  readonly trace: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly grants: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type TrustedExecutionContext = typeof TrustedExecutionContext.Type;
declare const RuntimeArtifactRef: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.String;
  readonly contentType: Schema.optional<Schema.String>;
  readonly url: Schema.optional<Schema.String>;
  readonly sizeBytes: Schema.optional<Schema.Number>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeArtifactRef = typeof RuntimeArtifactRef.Type;
type RuntimeErrorReason = 'validation' | 'planning' | 'provider' | 'host' | 'state' | 'artifact' | 'timeout' | 'internal';
declare class RuntimeError extends Error {
  readonly reason: RuntimeErrorReason;
  readonly details?: unknown | undefined;
  readonly _tag = "RuntimeError";
  constructor(reason: RuntimeErrorReason, message: string, details?: unknown | undefined);
}
interface RuntimeState {
  readonly record: (event: RuntimeStateEvent) => Effect.Effect<void, RuntimeError>;
  readonly flush: () => Effect.Effect<void, RuntimeError>;
}
declare const RuntimeState: Context.Service<RuntimeState, RuntimeState>;
interface RuntimeStateEvent {
  readonly name: string;
  readonly time: string;
  readonly detail?: unknown;
}
interface RuntimeArtifacts {
  readonly put: (artifact: RuntimeArtifactWrite, context: TrustedExecutionContext) => Effect.Effect<RuntimeArtifactRef, RuntimeError>;
}
declare const RuntimeArtifacts: Context.Service<RuntimeArtifacts, RuntimeArtifacts>;
interface RuntimeArtifactWrite {
  readonly kind: string;
  readonly contentType: string;
  readonly body: Uint8Array;
  readonly metadata?: RuntimeMetadata | undefined;
}
//#endregion
//#region ../runtime-artifacts/src/index.d.ts
declare const RuntimeArtifactKind: Schema.Literals<readonly ["file", "image", "output"]>;
type RuntimeArtifactKind = typeof RuntimeArtifactKind.Type;
declare const RuntimeArtifactPointer: Schema.Struct<{
  readonly key: Schema.String;
  readonly url: Schema.String;
  readonly kind: Schema.Literals<readonly ["file", "image", "output"]>;
  readonly contentType: Schema.String;
  readonly sizeBytes: Schema.Number;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeArtifactPointer = typeof RuntimeArtifactPointer.Type;
interface RuntimeArtifactBinaryWrite {
  readonly kind: RuntimeArtifactKind;
  readonly contentType: string;
  readonly extension: string;
  readonly body: Uint8Array;
  readonly metadata?: RuntimeMetadata | undefined;
}
interface RuntimeArtifactBinaryWriter {
  readonly write: (artifact: RuntimeArtifactBinaryWrite) => Promise<RuntimeArtifactPointer> | RuntimeArtifactPointer;
}
interface RuntimeArtifactStore {
  readonly write: (artifact: RuntimeArtifactBinaryWrite) => Effect.Effect<RuntimeArtifactPointer, RuntimeError>;
}
declare const RuntimeArtifactStore: Context.Service<RuntimeArtifactStore, RuntimeArtifactStore>;
//#endregion
//#region ../telemetry/src/index.d.ts
type TelemetryMetadata = Readonly<Record<string, unknown>>;
type TelemetryRedactor = (value: unknown, key?: string | undefined) => unknown;
interface TelemetryEvent {
  readonly name: string;
  readonly time?: string | undefined;
  readonly attributes?: TelemetryMetadata | undefined;
  readonly durationMs?: number | undefined;
}
interface TelemetryWarning {
  readonly code: string;
  readonly message: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySpan {
  readonly name: string;
  readonly attributes?: TelemetryMetadata | undefined;
}
interface TelemetrySink {
  readonly event?: ((event: TelemetryEvent) => Effect.Effect<void, unknown>) | undefined;
  readonly warning?: ((warning: TelemetryWarning) => Effect.Effect<void, unknown>) | undefined;
}
interface TelemetryOptions {
  readonly sink?: TelemetrySink | undefined;
  readonly now?: (() => number) | undefined;
  readonly redact?: TelemetryRedactor | undefined;
}
interface Telemetry {
  readonly event: (event: TelemetryEvent) => Effect.Effect<void>;
  readonly warning: (warning: TelemetryWarning) => Effect.Effect<void>;
  readonly span: <A, E, R>(span: TelemetrySpan, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  readonly redact: (value: unknown) => unknown;
}
declare const Telemetry: Context.Service<Telemetry, Telemetry>;
//#endregion
//#region ../runtime-state/src/index.d.ts
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
interface RuntimeStateFlushInfo {
  readonly batchSize: number;
  readonly durationMs: number;
}
//#endregion
//#region ../platform-cloudflare/src/runtime.d.ts
interface CloudflareRuntimeBindingNames {
  readonly worker: string;
  readonly stateDatabase: string;
  readonly artifactBucket: string;
  readonly cacheNamespace: string;
  readonly workflow?: string | undefined;
  readonly sessionsObject?: string | undefined;
}
interface CloudflareRuntimeStackSpec {
  readonly name: string;
  readonly bindings: CloudflareRuntimeBindingNames;
}
declare const cloudflareRuntimeStackSpec: (spec: CloudflareRuntimeStackSpec) => CloudflareRuntimeStackSpec;
interface CloudflareRuntimeExecutionContext {
  readonly waitUntil?: ((work: Promise<unknown>) => void) | undefined;
}
interface CloudflareRuntimeTelemetryOptions extends TelemetryOptions {}
interface CloudflareRuntimeR2PutOptions {
  readonly httpMetadata?: {
    readonly contentType?: string | undefined;
  } | undefined;
  readonly customMetadata?: Record<string, string> | undefined;
}
interface CloudflareRuntimeR2Bucket {
  readonly put: (key: string, value: Uint8Array, options?: CloudflareRuntimeR2PutOptions | undefined) => Promise<unknown>;
}
interface CloudflareRuntimeD1Database<TWrite> {
  readonly batch: (writes: readonly TWrite[]) => Promise<unknown>;
}
interface CloudflareRuntimeArtifactWriterOptions {
  readonly bucket: CloudflareRuntimeR2Bucket;
  readonly keyPrefix: string;
  readonly key?: ((artifact: RuntimeArtifactBinaryWrite) => string) | undefined;
  readonly id?: (() => string) | undefined;
  readonly publicUrl?: ((key: string) => string) | undefined;
}
interface CloudflareRuntimeStateFlushOptions<TWrite> {
  readonly queue: RuntimeStateWriteQueue<TWrite>;
  readonly db: CloudflareRuntimeD1Database<TWrite>;
  readonly context?: CloudflareRuntimeExecutionContext | undefined;
  readonly now?: (() => number) | undefined;
  readonly onEmpty?: (() => void) | undefined;
  readonly onSuccess?: ((info: RuntimeStateFlushInfo) => void) | undefined;
  readonly onFailure?: ((error: unknown, info: RuntimeStateFlushInfo) => void) | undefined;
}
interface CloudflareRuntimeStateLayerOptions<TWrite> extends CloudflareRuntimeStateFlushOptions<TWrite> {
  readonly mapEvent: (event: RuntimeStateEvent) => TWrite;
}
interface CloudflareRuntimeStatePortLayerOptions<TWrite> extends CloudflareRuntimeStateFlushOptions<TWrite> {
  readonly mapEvent: (event: RuntimeStructuredStateEvent) => TWrite;
}
declare function scheduleCloudflareRuntimeWork(work: Promise<unknown>, context?: CloudflareRuntimeExecutionContext | undefined): void;
declare function makeCloudflareRuntimeArtifactWriter(options: CloudflareRuntimeArtifactWriterOptions): RuntimeArtifactBinaryWriter;
declare const makeCloudflareRuntimeArtifactStoreLayer: (options: CloudflareRuntimeArtifactWriterOptions) => Layer.Layer<RuntimeArtifactStore, never, never>;
declare const makeCloudflareRuntimeTelemetryLayer: (options?: CloudflareRuntimeTelemetryOptions) => Layer.Layer<Telemetry, never, never>;
declare const CloudflareRuntimeTelemetryNoopLive: Layer.Layer<Telemetry, never, never>;
declare const makeCloudflareRuntimeArtifactsLayer: (options: CloudflareRuntimeArtifactWriterOptions) => Layer.Layer<RuntimeArtifacts, never, never>;
declare function flushCloudflareRuntimeStateWrites<TWrite>(options: CloudflareRuntimeStateFlushOptions<TWrite>): void;
declare const makeCloudflareRuntimeStateLayer: <TWrite>(options: CloudflareRuntimeStateLayerOptions<TWrite>) => Layer.Layer<RuntimeState, never, never>;
declare const makeCloudflareRuntimeStatePortLayer: <TWrite>(options: CloudflareRuntimeStatePortLayerOptions<TWrite>) => Layer.Layer<RuntimeStatePort, never, never>;
//#endregion
export { CloudflareRuntimeArtifactWriterOptions, CloudflareRuntimeBindingNames, CloudflareRuntimeD1Database, CloudflareRuntimeExecutionContext, CloudflareRuntimeR2Bucket, CloudflareRuntimeR2PutOptions, CloudflareRuntimeStackSpec, CloudflareRuntimeStateFlushOptions, CloudflareRuntimeStateLayerOptions, CloudflareRuntimeStatePortLayerOptions, CloudflareRuntimeTelemetryNoopLive, CloudflareRuntimeTelemetryOptions, cloudflareRuntimeStackSpec, flushCloudflareRuntimeStateWrites, makeCloudflareRuntimeArtifactStoreLayer, makeCloudflareRuntimeArtifactWriter, makeCloudflareRuntimeArtifactsLayer, makeCloudflareRuntimeStateLayer, makeCloudflareRuntimeStatePortLayer, makeCloudflareRuntimeTelemetryLayer, scheduleCloudflareRuntimeWork };
//# sourceMappingURL=cloudflare-runtime.d.mts.map