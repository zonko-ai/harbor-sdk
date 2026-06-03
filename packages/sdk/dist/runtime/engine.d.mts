import { Context, Effect, Layer, Schema, Scope } from "effect";

//#region ../runtime-core/src/index.d.ts
declare const RuntimeCapabilityKind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "git", "artifact", "job", "workflow_step"]>;
type RuntimeCapabilityKind = typeof RuntimeCapabilityKind.Type;
declare const RuntimeMetadata: Schema.$Record<Schema.String, Schema.Unknown>;
type RuntimeMetadata = typeof RuntimeMetadata.Type;
declare const RuntimeExecutionRequest: Schema.Struct<{
  readonly code: Schema.String;
  readonly mode: Schema.Literals<readonly ["exec", "workflow", "job", "test"]>;
  readonly timeoutMs: Schema.optional<Schema.Number>;
  readonly executionInputs: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly name: Schema.String;
    readonly contentType: Schema.optional<Schema.String>;
    readonly data: Schema.String;
    readonly sha256: Schema.optional<Schema.String>;
  }>>>;
  readonly sourceFilter: Schema.optional<Schema.$Array<Schema.String>>;
  readonly features: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeExecutionRequest = typeof RuntimeExecutionRequest.Type;
declare const TrustedExecutionContext: Schema.Struct<{
  readonly scopeId: Schema.String;
  readonly runId: Schema.String;
  readonly attributionId: Schema.optional<Schema.String>;
  readonly machineId: Schema.optional<Schema.String>;
  readonly trace: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly grants: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type TrustedExecutionContext = typeof TrustedExecutionContext.Type;
declare const RuntimePlan: Schema.Struct<{
  readonly requiredNamespaces: Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
    readonly bindingKind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "git", "artifact", "job", "workflow_step"]>;
    readonly optional: Schema.optional<Schema.Boolean>;
  }>>;
  readonly aliasMap: Schema.$Record<Schema.String, Schema.String>;
  readonly capabilities: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "git", "artifact", "job", "workflow_step"]>;
    readonly key: Schema.String;
    readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  }>>;
  readonly mountedInputs: Schema.$Array<Schema.Struct<{
    readonly name: Schema.String;
    readonly contentType: Schema.optional<Schema.String>;
    readonly data: Schema.String;
    readonly sha256: Schema.optional<Schema.String>;
  }>>;
  readonly generatedTypeBlocks: Schema.$Array<Schema.String>;
  readonly warnings: Schema.$Array<Schema.String>;
}>;
type RuntimePlan = typeof RuntimePlan.Type;
interface RuntimePlanningResult {
  readonly runtimePlan: RuntimePlan;
  readonly hostPlan?: unknown;
}
declare const RuntimeExecutionResult: Schema.Struct<{
  readonly mode: Schema.Literals<readonly ["exec", "workflow", "job", "test"]>;
  readonly result: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly logs: Schema.$Array<Schema.String>;
  readonly warnings: Schema.$Array<Schema.String>;
  readonly timings: Schema.$Record<Schema.String, Schema.Number>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeExecutionResult = typeof RuntimeExecutionResult.Type;
type RuntimeErrorReason = 'validation' | 'planning' | 'provider' | 'host' | 'state' | 'artifact' | 'timeout' | 'internal';
declare class RuntimeError extends Error {
  readonly reason: RuntimeErrorReason;
  readonly details?: unknown | undefined;
  readonly _tag = "RuntimeError";
  constructor(reason: RuntimeErrorReason, message: string, details?: unknown | undefined);
}
interface PreparedRuntimeProvider {
  readonly kind: RuntimeCapabilityKind;
  readonly key: string;
  readonly metadata?: RuntimeMetadata | undefined;
}
interface PreparedRuntimeProviders {
  readonly providers: ReadonlyArray<PreparedRuntimeProvider>;
}
interface RuntimeProviderPrepareInput {
  readonly kind: RuntimeCapabilityKind;
  readonly key: string;
  readonly plan: RuntimePlan;
  readonly context: TrustedExecutionContext;
  readonly metadata?: RuntimeMetadata | undefined;
  readonly optional?: boolean | undefined;
}
interface RuntimeCapabilityProvider {
  readonly kind: RuntimeCapabilityKind;
  readonly prepare: (input: RuntimeProviderPrepareInput) => Effect.Effect<PreparedRuntimeProvider | ReadonlyArray<PreparedRuntimeProvider>, RuntimeError>;
  readonly dispose?: (prepared: PreparedRuntimeProvider) => Effect.Effect<void, RuntimeError>;
}
interface RuntimeHostInvocation {
  readonly request: RuntimeExecutionRequest;
  readonly context: TrustedExecutionContext;
  readonly plan: RuntimePlan;
  readonly hostPlan?: unknown;
  readonly providers: PreparedRuntimeProviders;
}
interface RuntimePlanner {
  readonly plan: (request: RuntimeExecutionRequest, context: TrustedExecutionContext) => Effect.Effect<RuntimePlanningResult, RuntimeError>;
}
declare const RuntimePlanner: Context.Service<RuntimePlanner, RuntimePlanner>;
interface RuntimeProviderRegistry {
  readonly prepare: (plan: RuntimePlan, context: TrustedExecutionContext) => Effect.Effect<PreparedRuntimeProviders, RuntimeError>;
  readonly prepareScoped: (plan: RuntimePlan, context: TrustedExecutionContext) => Effect.Effect<PreparedRuntimeProviders, RuntimeError, Scope.Scope>;
  readonly dispose: (prepared: PreparedRuntimeProviders) => Effect.Effect<void, RuntimeError>;
}
declare const RuntimeProviderRegistry: Context.Service<RuntimeProviderRegistry, RuntimeProviderRegistry>;
interface RuntimeHost {
  readonly invoke: (invocation: RuntimeHostInvocation) => Effect.Effect<RuntimeExecutionResult, RuntimeError>;
}
declare const RuntimeHost: Context.Service<RuntimeHost, RuntimeHost>;
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
interface RuntimeExecutor {
  readonly execute: (request: RuntimeExecutionRequest, context: TrustedExecutionContext) => Effect.Effect<RuntimeExecutionResult, RuntimeError>;
}
declare const RuntimeExecutor: Context.Service<RuntimeExecutor, RuntimeExecutor>;
//#endregion
//#region ../telemetry/src/index.d.ts
type TelemetryMetadata = Readonly<Record<string, unknown>>;
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
interface Telemetry {
  readonly event: (event: TelemetryEvent) => Effect.Effect<void>;
  readonly warning: (warning: TelemetryWarning) => Effect.Effect<void>;
  readonly span: <A, E, R>(span: TelemetrySpan, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  readonly redact: (value: unknown) => unknown;
}
declare const Telemetry: Context.Service<Telemetry, Telemetry>;
//#endregion
//#region ../runtime-engine/src/index.d.ts
declare const makeRuntimeProviderRegistry: (providers: ReadonlyArray<RuntimeCapabilityProvider>) => RuntimeProviderRegistry;
declare const RuntimeProviderRegistryLive: (providers: ReadonlyArray<RuntimeCapabilityProvider>) => Layer.Layer<RuntimeProviderRegistry, never, never>;
declare const RuntimeExecutorLive: Layer.Layer<RuntimeExecutor, never, RuntimeProviderRegistry | RuntimePlanner | RuntimeHost | RuntimeState | Telemetry>;
//#endregion
export { RuntimeExecutorLive, RuntimeProviderRegistryLive, makeRuntimeProviderRegistry };
//# sourceMappingURL=engine.d.mts.map