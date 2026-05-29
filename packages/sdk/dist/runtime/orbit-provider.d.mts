import { Context, Effect, Layer, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
declare const RuntimeCapabilityKind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "artifact", "job", "workflow_step"]>;
type RuntimeCapabilityKind = typeof RuntimeCapabilityKind.Type;
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
declare const RuntimePlan: Schema.Struct<{
  readonly requiredNamespaces: Schema.$Array<Schema.Struct<{
    readonly namespace: Schema.String;
    readonly bindingKind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "artifact", "job", "workflow_step"]>;
    readonly optional: Schema.optional<Schema.Boolean>;
  }>>;
  readonly aliasMap: Schema.$Record<Schema.String, Schema.String>;
  readonly capabilities: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literals<readonly ["tool", "orbit", "secret", "host", "state", "artifact", "job", "workflow_step"]>;
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
//#endregion
//#region ../runtime-provider-orbit/src/index.d.ts
declare const RUNTIME_ORBIT_DISPATCH_PREFIX = "orbit__";
declare const RUNTIME_ORBIT_CACHE_KEY_PREFIX = "ws:";
declare const RUNTIME_ORBIT_DEFAULT_CAPABILITY_KEY = "orbit";
declare const RUNTIME_ORBIT_PRIMITIVES: readonly [{
  readonly key: "storage_put";
  readonly operation: "storage.put";
  readonly family: "storage";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "storage_get";
  readonly operation: "storage.get";
  readonly family: "storage";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "storage_list";
  readonly operation: "storage.list";
  readonly family: "storage";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "storage_delete";
  readonly operation: "storage.delete";
  readonly family: "storage";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "storage_url";
  readonly operation: "storage.url";
  readonly family: "storage";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "cache_get";
  readonly operation: "cache.get";
  readonly family: "cache";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "cache_set";
  readonly operation: "cache.set";
  readonly family: "cache";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "cache_delete";
  readonly operation: "cache.delete";
  readonly family: "cache";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "socket_url";
  readonly operation: "socket.url";
  readonly family: "socket";
  readonly exposedOnHrbr: false;
}, {
  readonly key: "socket_broadcast";
  readonly operation: "socket.broadcast";
  readonly family: "socket";
  readonly exposedOnHrbr: false;
}, {
  readonly key: "socket_stats";
  readonly operation: "socket.stats";
  readonly family: "socket";
  readonly exposedOnHrbr: false;
}, {
  readonly key: "db_exec";
  readonly operation: "db.exec";
  readonly family: "db";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "db_query";
  readonly operation: "db.query";
  readonly family: "db";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "db_first";
  readonly operation: "db.first";
  readonly family: "db";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "db_batch";
  readonly operation: "db.batch";
  readonly family: "db";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "tools_search";
  readonly operation: "tools.search";
  readonly family: "tools";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "tools_describe";
  readonly operation: "tools.describe";
  readonly family: "tools";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "tools_namespaces";
  readonly operation: "tools.namespaces";
  readonly family: "tools";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_run";
  readonly operation: "ai.run";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_generate";
  readonly operation: "ai.generate";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_summarize";
  readonly operation: "ai.summarize";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_embed";
  readonly operation: "ai.embed";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_classify";
  readonly operation: "ai.classify";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_rerank";
  readonly operation: "ai.rerank";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}, {
  readonly key: "ai_models";
  readonly operation: "ai.models";
  readonly family: "ai";
  readonly exposedOnHrbr: true;
}];
type RuntimeOrbitPrimitive = (typeof RUNTIME_ORBIT_PRIMITIVES)[number];
type RuntimeOrbitPrimitiveKey = RuntimeOrbitPrimitive['key'];
type RuntimeOrbitOperationName = RuntimeOrbitPrimitive['operation'];
type RuntimeOrbitPrimitiveFamily = RuntimeOrbitPrimitive['family'];
declare const RUNTIME_ORBIT_PRIMITIVE_KEYS: readonly RuntimeOrbitPrimitiveKey[];
declare const RUNTIME_ORBIT_OPERATION_NAMES: readonly RuntimeOrbitOperationName[];
interface RuntimeOrbitUsageEntry {
  readonly operation: RuntimeOrbitOperationName;
  readonly key?: string | undefined;
  readonly model?: string | undefined;
  readonly sizeBytes?: number | undefined;
  readonly durationMs: number;
  readonly error?: string | undefined;
}
interface RuntimeOrbitUsageSink {
  readonly record: (entry: RuntimeOrbitUsageEntry) => void;
}
type RuntimeOrbitCallable = (args: unknown) => Promise<unknown>;
type RuntimeOrbitUsageMeta = Partial<Omit<RuntimeOrbitUsageEntry, 'operation' | 'durationMs' | 'error'>>;
type RuntimeOrbitMetaExtractor = (args: unknown, result: unknown) => RuntimeOrbitUsageMeta;
interface RuntimeOrbitPrepareInput {
  readonly key?: string | undefined;
  readonly metadata?: RuntimeMetadata | undefined;
}
interface RuntimeOrbitPreparedProvider extends PreparedRuntimeProvider {
  readonly kind: 'orbit';
  readonly key: string;
  readonly metadata?: RuntimeMetadata | undefined;
}
interface RuntimeOrbitProvider {
  readonly prepare: (input?: RuntimeOrbitPrepareInput | undefined) => Effect.Effect<RuntimeOrbitPreparedProvider, RuntimeError>;
}
declare const RuntimeOrbitProvider: Context.Service<RuntimeOrbitProvider, RuntimeOrbitProvider>;
declare function runtimeOrbitDispatchKey(key: RuntimeOrbitPrimitiveKey): string;
declare function validateRuntimeOrbitUserKey(key: string): void;
declare function scopeRuntimeOrbitCacheKey(workspaceId: string, userKey: string): string;
declare function traceRuntimeOrbitOperation(sink: RuntimeOrbitUsageSink | undefined, operation: RuntimeOrbitOperationName, fn: RuntimeOrbitCallable, extractMeta?: RuntimeOrbitMetaExtractor | undefined): RuntimeOrbitCallable;
interface RuntimeOrbitSurfaceSourceOptions {
  readonly workspaceVariableName?: string | undefined;
  readonly orbitVariableName?: string | undefined;
  readonly hrbrVariableName?: string | undefined;
  readonly exposeOrbit?: boolean | undefined;
  readonly exposeHrbr?: boolean | undefined;
  readonly exposeGlobalHrbr?: boolean | undefined;
  readonly jobsExpression?: string | undefined;
  readonly dbExpression?: string | undefined;
  readonly callExpression?: ((key: RuntimeOrbitPrimitiveKey, argsExpression: string) => string) | undefined;
}
declare function createRuntimeOrbitSurfaceSource(options?: RuntimeOrbitSurfaceSourceOptions): string;
declare function createRuntimeOrbitPreamble(options?: {
  readonly hrbr?: boolean;
}): string;
declare const RuntimeOrbitProviderLive: Layer.Layer<RuntimeOrbitProvider, never, never>;
declare const RuntimeOrbitCapabilityProvider: RuntimeCapabilityProvider;
//#endregion
export { RUNTIME_ORBIT_CACHE_KEY_PREFIX, RUNTIME_ORBIT_DEFAULT_CAPABILITY_KEY, RUNTIME_ORBIT_DISPATCH_PREFIX, RUNTIME_ORBIT_OPERATION_NAMES, RUNTIME_ORBIT_PRIMITIVES, RUNTIME_ORBIT_PRIMITIVE_KEYS, RuntimeOrbitCallable, RuntimeOrbitCapabilityProvider, RuntimeOrbitMetaExtractor, RuntimeOrbitOperationName, RuntimeOrbitPrepareInput, RuntimeOrbitPreparedProvider, RuntimeOrbitPrimitive, RuntimeOrbitPrimitiveFamily, RuntimeOrbitPrimitiveKey, RuntimeOrbitProvider, RuntimeOrbitProviderLive, RuntimeOrbitSurfaceSourceOptions, RuntimeOrbitUsageEntry, RuntimeOrbitUsageMeta, RuntimeOrbitUsageSink, createRuntimeOrbitPreamble, createRuntimeOrbitSurfaceSource, runtimeOrbitDispatchKey, scopeRuntimeOrbitCacheKey, traceRuntimeOrbitOperation, validateRuntimeOrbitUserKey };
//# sourceMappingURL=orbit-provider.d.mts.map