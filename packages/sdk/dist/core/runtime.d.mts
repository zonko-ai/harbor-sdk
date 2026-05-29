import { Schema } from "effect";

//#region ../core-effect/src/runtime.d.ts
declare const RuntimeExecutionKind: Schema.Literals<readonly ["exec", "tool_invocation", "workflow"]>;
type RuntimeExecutionKind = typeof RuntimeExecutionKind.Type;
declare const RuntimeExecutionRequest: Schema.Struct<{
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
type RuntimeExecutionRequest = typeof RuntimeExecutionRequest.Type;
declare const RuntimeExecutionResult: Schema.Struct<{
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
type RuntimeExecutionResult = typeof RuntimeExecutionResult.Type;
//#endregion
export { RuntimeExecutionKind, RuntimeExecutionRequest, RuntimeExecutionResult };
//# sourceMappingURL=runtime.d.mts.map