//#region ../inspect-core/src/index.d.ts
declare const INSPECT_RESULT_KIND = "harbor.inspect_result";
declare const inspectRootGlobalNames: readonly ["hrbr", "defineJob", "deployApp"];
declare const legacyInspectDomainNames: readonly ["auth", "workspace", "sources", "plugins", "tools", "jobs", "apps", "harbor"];
type InspectEvalResult = {
  readonly ok: boolean;
  readonly result: unknown;
  readonly logs: readonly string[];
  readonly error?: string | undefined;
};
interface BuildInspectRuntimeSourceOptions {
  readonly domainKeys: readonly string[];
  readonly hostCallSetup: readonly string[];
  readonly resultEnvelope?: boolean | undefined;
  readonly resultKind?: string | undefined;
  readonly deployAppRuntime?: string | null | undefined;
  readonly clearGlobalHostCall?: boolean | undefined;
}
interface BuildQuickJsInspectSourceOptions {
  readonly domainKeys: readonly string[];
  readonly deployAppRuntime?: string | null | undefined;
}
interface BuildDispatchInspectWorkerSourceOptions {
  readonly domainKeys: readonly string[];
  readonly resultKind?: string | undefined;
  readonly deployAppRuntime?: string | null | undefined;
  readonly hostDispatchExpression?: string | undefined;
}
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
//#endregion
export { BuildDispatchInspectWorkerSourceOptions, BuildInspectRuntimeSourceOptions, BuildQuickJsInspectSourceOptions, INSPECT_RESULT_KIND, InspectEvalResult, applyInspectErrorHint, buildDispatchInspectWorkerSource, buildInspectRuntimeSource, buildQuickJsInspectSource, inspectGlobalShadowingError, inspectRootGlobalNames, legacyInspectDomainNames, normalizeInspectWorkerResult, wrapInspectUserCode };
//# sourceMappingURL=inspect.d.mts.map