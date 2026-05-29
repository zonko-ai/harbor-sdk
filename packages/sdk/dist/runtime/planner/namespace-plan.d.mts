//#region ../runtime-planner/src/bindings.d.ts
interface BindingUsage {
  readonly namespaces: ReadonlyArray<string>;
  readonly aliases: ReadonlyMap<string, ReadonlyArray<string>>;
  readonly hrbr: boolean;
  readonly orbit: boolean;
  readonly secrets: boolean;
  readonly sand: boolean;
  readonly sandNamespaces: ReadonlyArray<string>;
  readonly jobs: boolean;
  readonly defineJob: boolean;
  readonly deployApp: boolean;
  /**
   * True when user code references the `step` global (step.do /
   * step.sleep / step.sleepUntil / step.waitForEvent). Triggers
   * mode=workflow auto-routing if the caller didn't specify mode.
   */
  readonly step: boolean;
}
//#endregion
//#region ../runtime-planner/src/namespace-plan.d.ts
interface SourceBindingAvailability {
  readonly namespace: string;
  readonly kind: 'mcp' | 'api' | 'cli';
  readonly has_cli_bindings: boolean;
}
interface RuntimeNamespaceUsagePlan {
  readonly availableNamespaces: readonly string[];
  readonly availableSandNamespaces: readonly string[];
  readonly namespaces: readonly string[];
  readonly sandNamespaces: readonly string[];
  readonly loadNamespaces: readonly string[];
  readonly hrbr: boolean;
  readonly orbit: boolean;
  readonly secrets: boolean;
  readonly jobs: boolean;
  readonly step: boolean;
  readonly aliases: BindingUsage['aliases'];
}
declare function planRuntimeNamespaceUsage(userCode: string, sources: ReadonlyArray<SourceBindingAvailability>): RuntimeNamespaceUsagePlan;
//#endregion
export { RuntimeNamespaceUsagePlan, SourceBindingAvailability, planRuntimeNamespaceUsage };
//# sourceMappingURL=namespace-plan.d.mts.map