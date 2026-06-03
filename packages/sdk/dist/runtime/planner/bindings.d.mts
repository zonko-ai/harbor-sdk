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
  /** True when user code references the `state` Tier-0 filesystem global. */
  readonly state: boolean;
  /** True when user code references the `git` Tier-0 git global. */
  readonly git: boolean;
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
declare function resolveBindingUsage(code: string, namespaces: ReadonlyArray<string>, sandNamespaces?: ReadonlyArray<string>,
/**
 * When true, `state` and `git` are treated as Harbor-reserved
 * identifiers: their member references surface in the plan and a
 * user-declared `const state`/`const git` raises a collision. When
 * false (default), they are ordinary free identifiers — keeps the
 * shell-fs surface byte-identical to absent when the host flag is off.
 */
shellFsEnabled?: boolean): BindingUsage;
//#endregion
export { BindingUsage, PrescanResult, ReservedBindingCollisionError, __resetBindingMemos, prescanReferences, resolveBindingUsage };
//# sourceMappingURL=bindings.d.mts.map