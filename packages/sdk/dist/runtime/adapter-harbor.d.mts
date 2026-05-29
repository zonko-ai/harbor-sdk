import { Schema } from "effect";

//#region ../core-effect/src/runtime.d.ts
declare const RuntimeExecutionRequest$1: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly kind: Schema.Literals<readonly ["exec", "tool_invocation", "workflow"]>;
  readonly run_id: Schema.optional<Schema.String>;
  readonly payload: Schema.Unknown;
  readonly low_level: Schema.optional<Schema.Struct<{
    readonly workspace_id: Schema.String;
    readonly runtime: Schema.Literals<readonly ["codemode", "node", "bun"]>;
    readonly entrypoint: Schema.NonEmptyString;
    readonly files: Schema.$Record<Schema.String, Schema.String>;
    readonly env: Schema.optional<Schema.$Record<Schema.String, Schema.String>>;
    readonly secrets: Schema.optional<Schema.$Array<Schema.String>>;
    readonly timeout_ms: Schema.optional<Schema.Number>;
  }>>;
}>;
type RuntimeExecutionRequest$1 = typeof RuntimeExecutionRequest$1.Type;
declare const RuntimeExecutionResult$1: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly run_id: Schema.optional<Schema.String>;
  readonly output: Schema.optional<Schema.Unknown>;
  readonly error: Schema.optional<Schema.String>;
  readonly low_level: Schema.optional<Schema.Struct<{
    readonly ok: Schema.Boolean;
    readonly stdout: Schema.String;
    readonly stderr: Schema.String;
    readonly result: Schema.optional<Schema.Unknown>;
    readonly error: Schema.optional<Schema.String>;
  }>>;
}>;
type RuntimeExecutionResult$1 = typeof RuntimeExecutionResult$1.Type;
//#endregion
//#region ../runtime-core/src/index.d.ts
declare const RuntimeExecutionMode: Schema.Literals<readonly ["exec", "workflow", "job", "test"]>;
type RuntimeExecutionMode = typeof RuntimeExecutionMode.Type;
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
//#endregion
//#region ../runtime-adapter-harbor/src/index.d.ts
declare const harborRequestToRuntimeRequest: (request: RuntimeExecutionRequest$1) => RuntimeExecutionRequest;
declare const harborRequestToTrustedContext: (request: RuntimeExecutionRequest$1) => TrustedExecutionContext;
declare const runtimeResultToHarborResult: (result: RuntimeExecutionResult, context: TrustedExecutionContext) => RuntimeExecutionResult$1;
interface HarborWorkerSourceRef {
  readonly namespace: string;
}
interface HarborWorkerExecutionInput {
  readonly path: string;
  readonly content_type?: string | undefined;
  readonly data_base64: string;
  readonly sha256?: string | undefined;
  readonly size_bytes?: number | undefined;
}
interface HarborWorkerExecutionRequest {
  readonly workspace_id: string;
  readonly run_id?: string | undefined;
  readonly code: string;
  readonly timeout_ms?: number | undefined;
  readonly sources?: ReadonlyArray<HarborWorkerSourceRef> | undefined;
  readonly execution_inputs?: ReadonlyArray<HarborWorkerExecutionInput> | undefined;
  readonly mode?: string | undefined;
  readonly workflow_step?: unknown;
  readonly agent_id?: string | undefined;
  readonly sand_machine_id?: string | undefined;
}
interface HarborWorkerRuntimeOptions {
  readonly mode?: RuntimeExecutionMode | undefined;
  readonly attributionId?: string | undefined;
  readonly machineId?: string | undefined;
  readonly trace?: RuntimeMetadata | undefined;
  readonly features?: RuntimeMetadata | undefined;
}
declare const harborWorkerRequestToRuntimeRequest: (request: HarborWorkerExecutionRequest, options?: HarborWorkerRuntimeOptions) => RuntimeExecutionRequest;
declare const harborWorkerRequestToTrustedContext: (request: HarborWorkerExecutionRequest, options?: HarborWorkerRuntimeOptions) => TrustedExecutionContext;
//#endregion
export { HarborWorkerExecutionInput, HarborWorkerExecutionRequest, HarborWorkerRuntimeOptions, HarborWorkerSourceRef, harborRequestToRuntimeRequest, harborRequestToTrustedContext, harborWorkerRequestToRuntimeRequest, harborWorkerRequestToTrustedContext, runtimeResultToHarborResult };
//# sourceMappingURL=adapter-harbor.d.mts.map