//#region ../runtime-planner/src/bindings.d.ts
/**
 * Test-only hook: drops both memo tables. Production callers should
 * never need this — entries TTL out via FIFO eviction.
 *
 * @testOnly
 */
declare function __resetBindingMemos(): void;
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
declare class ReservedBindingCollisionError extends Error {
  readonly names: ReadonlyArray<string>;
  constructor(names: ReadonlyArray<string>);
}
interface PrescanResult {
  readonly candidates: ReadonlySet<string>;
  readonly hrbr: boolean;
  readonly orbit: boolean;
  readonly secrets: boolean;
  readonly sand: boolean;
  readonly jobs: boolean;
  readonly defineJob: boolean;
  readonly deployApp: boolean;
  /**
   * True when user code references the `step` global (step.do /
   * step.sleep / step.sleepUntil / step.waitForEvent). Triggers
   * mode=workflow auto-routing if the caller didn't specify mode.
   */
  readonly step: boolean;
  readonly parseFailed: boolean;
}
/**
 * Fast pre-scan over user code to collect free identifier names plus
 * the four reserved bindings (`orbit`, `secrets`, `sand`, `jobs`).
 *
 * Used by `executeWorker` to constrain the upstream `plugin_sources`
 * D1 query to only the candidate namespaces. The proper namespace plan
 * is still recomputed via `planWorkerNamespaceUsage` once the
 * authoritative source list is loaded — this helper is purely a
 * filter to avoid loading every workspace plugin row when the user
 * code only references one or two of them (or none).
 *
 * On parse failure, returns `parseFailed: true` and an empty candidate
 * set; the caller should fall back to the unfiltered query path so
 * that broken code still produces the same compile-time error users
 * see today.
 */
declare function prescanReferences(code: string): PrescanResult;
declare function resolveBindingUsage(code: string, namespaces: ReadonlyArray<string>, sandNamespaces?: ReadonlyArray<string>): BindingUsage;
//#endregion
export { BindingUsage, PrescanResult, ReservedBindingCollisionError, __resetBindingMemos, prescanReferences, resolveBindingUsage };
//# sourceMappingURL=bindings.d.mts.map