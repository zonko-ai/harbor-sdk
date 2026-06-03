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
   * True when user code references the `state` global (Tier-0 workspace
   * filesystem, e.g. state.readFile / state.writeFile). Only surfaced
   * as a usable binding when the host enables the shell-fs flag; the
   * planner zeroes this out when shell-fs is disabled so the identifier
   * stays a plain free variable.
   */
  readonly state: boolean;
  /**
   * True when user code references the `git` global (Tier-0 isomorphic-git
   * over the workspace filesystem, e.g. git.init / git.status). Gated the
   * same way as `state`.
   */
  readonly git: boolean;
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
  readonly kind: 'mcp' | 'api' | 'cli' | 'composio';
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
  /** Tier-0 workspace filesystem (`state.*`). Always false when shell-fs disabled. */
  readonly state: boolean;
  /** Tier-0 git (`git.*`). Always false when shell-fs disabled. */
  readonly git: boolean;
  readonly step: boolean;
  readonly aliases: BindingUsage['aliases'];
}
declare function planRuntimeNamespaceUsage(userCode: string, sources: ReadonlyArray<SourceBindingAvailability>, /** Enables the Tier-0 `state.*` / `git.*` reserved bindings. Default off. */

shellFsEnabled?: boolean): RuntimeNamespaceUsagePlan;
//#endregion
export { RuntimeNamespaceUsagePlan, SourceBindingAvailability, planRuntimeNamespaceUsage };
//# sourceMappingURL=namespace-plan.d.mts.map