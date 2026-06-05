//#region ../inspect-core/src/index.d.ts
declare const INSPECT_RESULT_KIND = "harbor.inspect_result";
declare const inspectRootGlobalNames: readonly ["hrbr", "defineJob", "deployApp"];
declare const harborInspectDomainKeys: readonly ["auth.status", "auth.start", "auth.logout", "auth.diagnose", "workspace.current", "workspace.list", "workspace.switch", "workspace.select", "workspace.create", "sources.list", "sources.search", "sources.install", "sources.remove", "sources.installStatus", "sources.oauthStart", "tools.search", "context.entities.list", "context.entities.read", "context.entities.get", "context.files.list", "context.files.read", "context.files.search", "runs.list", "runs.get", "runs.graph", "runs.trace", "jobs.list", "jobs.inspect", "jobs.versions", "apps.list", "apps.inspect", "apps.open", "triggers.inspect", "triggers.activate", "triggers.list", "triggers.get", "triggers.pause", "triggers.resume", "triggers.disable", "triggers.replay", "triggers.deliveries.list", "triggers.deliveries.get", "triggers.limits.get", "triggers.limits.update"];
type HarborInspectDomainKey = (typeof harborInspectDomainKeys)[number];
type InspectFilesystemMode = 'none';
interface InspectRuntimeCapabilities {
  readonly hostCall: 'path_args';
  readonly network: 'none';
  readonly filesystem: {
    readonly mode: InspectFilesystemMode;
    readonly reason: string;
  };
  readonly shell: 'none';
}
interface InspectBehaviorProtocol {
  readonly id: string;
  readonly rootGlobal: 'hrbr';
  readonly domainKeys: readonly string[];
  readonly rootGlobalNames: readonly string[];
  readonly blockedGlobals: readonly string[];
  readonly capabilities: InspectRuntimeCapabilities;
  readonly toolDescription: string;
}
declare const harborInspectBehaviorProtocol: {
  readonly id: "harbor.inspect.control-plane.v1";
  readonly rootGlobal: "hrbr";
  readonly domainKeys: readonly ["auth.status", "auth.start", "auth.logout", "auth.diagnose", "workspace.current", "workspace.list", "workspace.switch", "workspace.select", "workspace.create", "sources.list", "sources.search", "sources.install", "sources.remove", "sources.installStatus", "sources.oauthStart", "tools.search", "context.entities.list", "context.entities.read", "context.entities.get", "context.files.list", "context.files.read", "context.files.search", "runs.list", "runs.get", "runs.graph", "runs.trace", "jobs.list", "jobs.inspect", "jobs.versions", "apps.list", "apps.inspect", "apps.open", "triggers.inspect", "triggers.activate", "triggers.list", "triggers.get", "triggers.pause", "triggers.resume", "triggers.disable", "triggers.replay", "triggers.deliveries.list", "triggers.deliveries.get", "triggers.limits.get", "triggers.limits.update"];
  readonly rootGlobalNames: readonly ["hrbr", "defineJob", "deployApp"];
  readonly blockedGlobals: readonly ["fetch", "XMLHttpRequest", "WebSocket", "require", "process", "Bun", "Deno", "fs"];
  readonly capabilities: {
    readonly hostCall: "path_args";
    readonly network: "none";
    readonly filesystem: {
      readonly mode: "none";
      readonly reason: string;
    };
    readonly shell: "none";
  };
  readonly toolDescription: "Harbor inspect JS only. One control-plane global: hrbr. Use hrbr.auth/hrbr.workspace/hrbr.sources/hrbr.tools/hrbr.context/hrbr.runs/hrbr.jobs/hrbr.apps/hrbr.triggers. No raw filesystem, shell, local git, direct network, or sand runtime.";
};
declare const legacyInspectDomainNames: readonly ["auth", "workspace", "sources", "plugins", "tools", "jobs", "apps", "harbor"];
type InspectEvalResult = {
  readonly ok: boolean;
  readonly result: unknown;
  readonly logs: readonly string[];
  readonly error?: string | undefined;
};
interface BuildInspectRuntimeSourceOptions {
  readonly domainKeys?: readonly string[] | undefined;
  readonly protocol?: InspectBehaviorProtocol | undefined;
  readonly hostCallSetup: readonly string[];
  readonly resultEnvelope?: boolean | undefined;
  readonly resultKind?: string | undefined;
  readonly deployAppRuntime?: string | null | undefined;
  readonly clearGlobalHostCall?: boolean | undefined;
}
interface BuildQuickJsInspectSourceOptions {
  readonly domainKeys?: readonly string[] | undefined;
  readonly protocol?: InspectBehaviorProtocol | undefined;
  readonly deployAppRuntime?: string | null | undefined;
}
interface BuildDispatchInspectWorkerSourceOptions {
  readonly domainKeys?: readonly string[] | undefined;
  readonly protocol?: InspectBehaviorProtocol | undefined;
  readonly resultKind?: string | undefined;
  readonly deployAppRuntime?: string | null | undefined;
  readonly hostDispatchExpression?: string | undefined;
}
declare function assertInspectProtocolDomainKeys(protocol: InspectBehaviorProtocol, implementedKeys: readonly string[]): readonly string[];
declare function inspectGlobalShadowingError(code: string): string | undefined;
declare function applyInspectErrorHint(_code: string, error: string | undefined): string | undefined;
declare function wrapInspectUserCode(code: string): string;
declare function buildInspectRuntimeSource(code: string, options: BuildInspectRuntimeSourceOptions): string;
declare function buildQuickJsInspectSource(code: string, options: BuildQuickJsInspectSourceOptions): string;
declare function buildDispatchInspectWorkerSource(code: string, options: BuildDispatchInspectWorkerSourceOptions): string;
declare function normalizeInspectWorkerResult(code: string, timeoutMs: number, workerResult: {
  result: unknown;
  error?: string | undefined;
  logs?: string[] | undefined;
}, resultKind?: string): InspectEvalResult;
type InspectJsonRecord = Record<string, unknown>;
interface BuildInspectToolSearchResultOptions {
  readonly query: string;
  readonly hits: readonly unknown[];
  readonly contractLookup?: 'resource' | 'runtime' | undefined;
}
type InspectAuthMode = 'local' | 'cloud';
interface BuildInspectAuthStatusResultOptions {
  readonly mode: InspectAuthMode;
  readonly authenticated: boolean;
  readonly email?: string | null | undefined;
  readonly selectedWorkspacePresent?: boolean | undefined;
  readonly workspace?: unknown;
  readonly pending?: unknown;
  readonly pendingError?: string | undefined;
}
interface BuildInspectAuthManagedResultOptions {
  readonly mode: 'cloud';
  readonly action: 'start' | 'logout';
}
declare function buildInspectAuthStatusResult(options: BuildInspectAuthStatusResultOptions): InspectJsonRecord;
declare function buildInspectAuthManagedResult(options: BuildInspectAuthManagedResultOptions): InspectJsonRecord;
declare function compactInspectToolSearchHit(tool: unknown): InspectJsonRecord | null;
declare function compactInspectToolContract(tool: unknown): InspectJsonRecord | null;
declare function buildInspectToolSearchResult(options: BuildInspectToolSearchResultOptions): InspectJsonRecord;
interface ShallowInspectValueOptions {
  readonly maxDepth?: number | undefined;
}
declare function shallowInspectValue(value: unknown, options?: ShallowInspectValueOptions): unknown;
//#endregion
export { BuildDispatchInspectWorkerSourceOptions, BuildInspectAuthManagedResultOptions, BuildInspectAuthStatusResultOptions, BuildInspectRuntimeSourceOptions, BuildInspectToolSearchResultOptions, BuildQuickJsInspectSourceOptions, HarborInspectDomainKey, INSPECT_RESULT_KIND, InspectAuthMode, InspectBehaviorProtocol, InspectEvalResult, InspectFilesystemMode, InspectJsonRecord, InspectRuntimeCapabilities, ShallowInspectValueOptions, applyInspectErrorHint, assertInspectProtocolDomainKeys, buildDispatchInspectWorkerSource, buildInspectAuthManagedResult, buildInspectAuthStatusResult, buildInspectRuntimeSource, buildInspectToolSearchResult, buildQuickJsInspectSource, compactInspectToolContract, compactInspectToolSearchHit, harborInspectBehaviorProtocol, harborInspectDomainKeys, inspectGlobalShadowingError, inspectRootGlobalNames, legacyInspectDomainNames, normalizeInspectWorkerResult, shallowInspectValue, wrapInspectUserCode };
//# sourceMappingURL=inspect.d.mts.map