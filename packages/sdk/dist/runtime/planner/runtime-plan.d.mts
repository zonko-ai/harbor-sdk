import { Context, Schema } from "effect";

//#region ../runtime-core/src/index.d.ts
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
//#endregion
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
//#endregion
//#region ../runtime-planner/src/runtime-plan.d.ts
interface RuntimePlannerOptions {
  readonly sourceBindings?: ReadonlyArray<SourceBindingAvailability> | undefined;
  readonly generatedTypeBlocks?: ReadonlyArray<string> | undefined;
}
interface RuntimePlanProjection {
  readonly namespaceUsage: RuntimeNamespaceUsagePlan;
  readonly runtimePlan: RuntimePlan;
}
declare function runtimePlannerOptionsFromRequest(request: RuntimeExecutionRequest): RuntimePlannerOptions;
declare function projectRuntimeNamespaceUsage(usage: RuntimeNamespaceUsagePlan, request: RuntimeExecutionRequest, options?: RuntimePlannerOptions): RuntimePlanProjection;
declare function createRuntimePlan(request: RuntimeExecutionRequest, _context: TrustedExecutionContext, options?: RuntimePlannerOptions): RuntimePlan;
declare function createRuntimePlanProjection(request: RuntimeExecutionRequest, options?: RuntimePlannerOptions): RuntimePlanProjection;
//#endregion
export { RuntimePlanProjection, RuntimePlannerOptions, createRuntimePlan, createRuntimePlanProjection, projectRuntimeNamespaceUsage, runtimePlannerOptionsFromRequest };
//# sourceMappingURL=runtime-plan.d.mts.map