import { Context, Effect, Layer, Schema, Scope } from "effect";
import { Server } from "node:http";

//#region ../platform-local/src/frontend.d.ts
interface LocalHarborFrontendOptions {
  readonly title?: string | undefined;
  readonly authRequired?: boolean | undefined;
}
declare const LOCAL_HARBOR_FRONTEND_SCRIPT_PATH = "/local/frontend.js";
declare const renderLocalHarborFrontendHtml: (options?: LocalHarborFrontendOptions) => string;
declare const renderLocalHarborFrontendScript: () => string;
//#endregion
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
declare const RuntimeArtifactRef: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.String;
  readonly contentType: Schema.optional<Schema.String>;
  readonly url: Schema.optional<Schema.String>;
  readonly sizeBytes: Schema.optional<Schema.Number>;
  readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
}>;
type RuntimeArtifactRef = typeof RuntimeArtifactRef.Type;
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
interface LocalRuntimeStatePortSnapshot {
  readonly events: ReadonlyArray<RuntimeStructuredStateEvent>;
  readonly flushCount: number;
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
interface RuntimeArtifactStore {
  readonly write: (artifact: RuntimeArtifactBinaryWrite) => Effect.Effect<RuntimeArtifactPointer, RuntimeError>;
}
declare const RuntimeArtifactStore: Context.Service<RuntimeArtifactStore, RuntimeArtifactStore>;
interface LocalRuntimeArtifactStoreSnapshot {
  readonly artifacts: ReadonlyArray<RuntimeArtifactPointer>;
}
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
//#region ../platform-local/src/providers.d.ts
type LocalRuntimeHostHandler = (invocation: RuntimeHostInvocation) => Effect.Effect<RuntimeExecutionResult, RuntimeError>;
type LocalRuntimeHostCallback = (invocation: RuntimeHostInvocation) => RuntimeExecutionResult | Promise<RuntimeExecutionResult>;
declare const makeLocalRuntimeHostHandler: (callback: LocalRuntimeHostCallback) => LocalRuntimeHostHandler;
interface LocalRuntimeProvidersOptions {
  readonly host?: LocalRuntimeHostHandler | undefined;
}
interface LocalRuntimeStateSnapshot {
  readonly events: ReadonlyArray<RuntimeStateEvent>;
  readonly artifacts: ReadonlyArray<RuntimeArtifactRef>;
  readonly statePort: LocalRuntimeStatePortSnapshot;
  readonly artifactStore: LocalRuntimeArtifactStoreSnapshot;
}
declare const makeInMemoryLocalRuntimeProviders: (options?: LocalRuntimeProvidersOptions) => {
  layers: Layer.Layer<RuntimeState | RuntimeArtifacts | RuntimeStatePort | RuntimeArtifactStore | RuntimeProviderRegistry | RuntimeHost | Telemetry, never, never>;
  snapshot: () => LocalRuntimeStateSnapshot;
};
declare const makeLocalRuntimeProviders: (options?: LocalRuntimeProvidersOptions) => {
  layers: Layer.Layer<RuntimeState | RuntimeArtifacts | RuntimeStatePort | RuntimeArtifactStore | RuntimeProviderRegistry | RuntimeHost | Telemetry, never, never>;
  snapshot: () => LocalRuntimeStateSnapshot;
};
//#endregion
//#region ../platform-local/src/project.d.ts
declare const LOCAL_PROJECT_MANIFEST_VERSION = 1;
interface LocalStoreHandle {
  readonly path: string;
}
interface LocalProjectLayout {
  readonly rootDir: string;
  readonly harborDir: string;
  readonly runtimeManifestPath: string;
  readonly artifactsDir: string;
  readonly tracesDir: string;
  readonly cacheDir: string;
  readonly gitignorePath: string;
  readonly store: LocalStoreHandle;
}
interface LocalRuntimeManifest {
  readonly version: typeof LOCAL_PROJECT_MANIFEST_VERSION;
  readonly project: {
    readonly workspaceId: string;
    readonly workspaceName: string;
    readonly slug: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly store: {
    readonly driver: 'sqlite';
    readonly path: string;
  };
  readonly auth?: {
    readonly tokenSha256: string;
    readonly tokenHint: string;
  };
}
interface LocalProjectHandle {
  readonly rootDir: string;
  readonly layout: LocalProjectLayout;
  readonly manifest: LocalRuntimeManifest;
}
interface InitLocalProjectOptions {
  readonly rootDir?: string | undefined;
  readonly storePath?: string | undefined;
  readonly workspaceId?: string | undefined;
  readonly workspaceName?: string | undefined;
  readonly slug?: string | undefined;
  readonly authToken?: string | undefined;
  readonly now?: (() => Date) | undefined;
}
interface DiscoverLocalProjectOptions {
  readonly startDir?: string | undefined;
}
interface LocalWorkspaceRecord {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
interface LocalRunRecord {
  readonly id: string;
  readonly workspaceId: string;
  readonly mode: string;
  readonly status: 'running' | 'completed' | 'failed';
  readonly codeSha256: string;
  readonly request: unknown;
  readonly result: unknown;
  readonly error: string | null;
  readonly createdAt: string;
  readonly completedAt: string | null;
}
interface LocalRuntimeEventRecord {
  readonly id: number;
  readonly runId: string;
  readonly name: string;
  readonly time: string;
  readonly detail: unknown;
}
interface LocalHarborStore {
  readonly handle: LocalStoreHandle;
  readonly schemaVersion: () => number;
  readonly upsertWorkspace: (workspace: LocalWorkspaceRecord) => void;
  readonly getWorkspace: (workspaceId: string) => LocalWorkspaceRecord | null;
  readonly listWorkspaces: (options?: {
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
  }) => {
    readonly data: ReadonlyArray<LocalWorkspaceRecord>;
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
    readonly hasMore: boolean;
  };
  readonly recordRunStarted: (run: {
    readonly id: string;
    readonly workspaceId: string;
    readonly mode: string;
    readonly code: string;
    readonly request: unknown;
    readonly createdAt: string;
  }) => void;
  readonly recordRunCompleted: (run: {
    readonly id: string;
    readonly status: 'completed' | 'failed';
    readonly result: unknown;
    readonly error?: string | undefined;
    readonly completedAt: string;
  }) => void;
  readonly recordRuntimeEvents: (runId: string, events: ReadonlyArray<RuntimeStateEvent>) => void;
  readonly listRuns: (workspaceId: string) => ReadonlyArray<LocalRunRecord>;
  readonly getRun: (runId: string) => LocalRunRecord | null;
  readonly listRuntimeEvents: (runId: string) => ReadonlyArray<LocalRuntimeEventRecord>;
  readonly close: () => void;
}
interface CreateLocalHarborFetchOptions {
  readonly project: LocalProjectHandle;
  readonly store?: LocalHarborStore | undefined;
  readonly storeHandle?: LocalStoreHandle | undefined;
  readonly runtimeHost?: LocalRuntimeHostHandler | undefined;
  readonly planner?: RuntimePlanner['plan'] | undefined;
  readonly authToken?: string | undefined;
  readonly requireAuth?: boolean | undefined;
  readonly frontend?: LocalHarborFrontendOptions | false | undefined;
  readonly now?: (() => Date) | undefined;
}
interface LocalHarborFetchHandler {
  readonly project: LocalProjectHandle;
  readonly store: LocalHarborStore;
  readonly fetch: typeof fetch;
  readonly close: () => void;
}
interface StartLocalHarborServerOptions extends CreateLocalHarborFetchOptions {
  readonly hostname?: string | undefined;
  readonly port?: number | undefined;
}
interface LocalHarborServer {
  readonly project: LocalProjectHandle;
  readonly store: LocalHarborStore;
  readonly fetch: typeof fetch;
  readonly server: Server;
  readonly url: string;
  readonly close: () => Promise<void>;
}
declare const resolveLocalProjectLayout: (rootDir: string, options?: {
  readonly storePath?: string | undefined;
}) => LocalProjectLayout;
declare const createLocalStoreHandle: (path: string) => LocalStoreHandle;
declare const initLocalProject: (options?: InitLocalProjectOptions) => LocalProjectHandle;
declare const discoverLocalProject: (options?: DiscoverLocalProjectOptions) => LocalProjectHandle | null;
declare const localWorkspaceFromManifest: (manifest: LocalRuntimeManifest) => LocalWorkspaceRecord;
declare const openLocalHarborStore: (handle: LocalStoreHandle) => LocalHarborStore;
declare const createLocalHarborFetch: (options: CreateLocalHarborFetchOptions) => LocalHarborFetchHandler;
declare const startLocalHarborServer: (options: StartLocalHarborServerOptions) => Promise<LocalHarborServer>;
//#endregion
export { CreateLocalHarborFetchOptions, DiscoverLocalProjectOptions, InitLocalProjectOptions, LOCAL_HARBOR_FRONTEND_SCRIPT_PATH, LocalHarborFetchHandler, LocalHarborFrontendOptions, LocalHarborServer, LocalHarborStore, LocalProjectHandle, LocalProjectLayout, LocalRunRecord, LocalRuntimeEventRecord, LocalRuntimeHostCallback, LocalRuntimeHostHandler, LocalRuntimeManifest, LocalRuntimeStateSnapshot, LocalStoreHandle, LocalWorkspaceRecord, StartLocalHarborServerOptions, createLocalHarborFetch, createLocalStoreHandle, discoverLocalProject, initLocalProject, localWorkspaceFromManifest, makeInMemoryLocalRuntimeProviders, makeLocalRuntimeHostHandler, makeLocalRuntimeProviders, openLocalHarborStore, renderLocalHarborFrontendHtml, renderLocalHarborFrontendScript, resolveLocalProjectLayout, startLocalHarborServer };
//# sourceMappingURL=local.d.mts.map