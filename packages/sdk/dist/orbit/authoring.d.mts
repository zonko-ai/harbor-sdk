import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitJobPublishBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>>;
  readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
  readonly input_binding: Schema.optional<Schema.String>;
  readonly input_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly output_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly capabilities: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly idempotency: Schema.optional<Schema.Struct<{
    readonly required: Schema.optional<Schema.Boolean>;
    readonly key: Schema.optional<Schema.Union<readonly [Schema.String, Schema.$Array<Schema.String>]>>;
    readonly ttl_seconds: Schema.optional<Schema.Number>;
  }>>;
  readonly retry: Schema.optional<Schema.Struct<{
    readonly max_attempts: Schema.optional<Schema.Number>;
    readonly backoff: Schema.optional<Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"fixed">, Schema.Literal<"exponential">]>>;
  }>>;
  readonly retention: Schema.optional<Schema.Struct<{
    readonly run_ttl_seconds: Schema.optional<Schema.Number>;
    readonly artifact_ttl_seconds: Schema.optional<Schema.Number>;
  }>>;
  readonly trigger_manifest: Schema.optional<Schema.Struct<{
    readonly version: Schema.optional<Schema.Literal<1>>;
    readonly events: Schema.$Array<Schema.Struct<{
      readonly source_kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
      readonly event: Schema.optional<Schema.NonEmptyString>;
      readonly input_mapping: Schema.Union<readonly [Schema.Struct<{
        readonly mode: Schema.Literal<"passthrough">;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"source_event">;
        readonly schema: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"declarative">;
        readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
      }>]>;
      readonly idempotency: Schema.optional<Schema.Struct<{
        readonly key: Schema.$Array<Schema.NonEmptyString>;
        readonly ttl_seconds: Schema.optional<Schema.Number>;
      }>>;
      readonly concurrency: Schema.optional<Schema.Struct<{
        readonly scope: Schema.optional<Schema.Literals<readonly ["global", "workspace", "trigger", "job", "custom"]>>;
        readonly key: Schema.$Array<Schema.NonEmptyString>;
        readonly limit: Schema.Number;
        readonly overflow: Schema.Literals<readonly ["queue", "skip", "coalesce_latest", "fail"]>;
        readonly ttl_seconds: Schema.optional<Schema.Number>;
      }>>;
      readonly retry: Schema.optional<Schema.Struct<{
        readonly max_attempts: Schema.optional<Schema.Number>;
        readonly backoff: Schema.optional<Schema.Literals<readonly ["none", "fixed", "exponential"]>>;
      }>>;
      readonly retention: Schema.optional<Schema.Struct<{
        readonly event_ttl_seconds: Schema.optional<Schema.Number>;
        readonly delivery_ttl_seconds: Schema.optional<Schema.Number>;
      }>>;
      readonly metadata: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    }>>;
  }>>;
  readonly compatibility_date: Schema.optional<Schema.String>;
  readonly code: Schema.NonEmptyString;
  readonly runtime: Schema.optional<Schema.Union<readonly [Schema.Literal<"classic">, Schema.Literal<"bundled">, Schema.Literal<"define_job">]>>;
  readonly bundle: Schema.optional<Schema.Struct<{
    readonly code: Schema.NonEmptyString;
    readonly sourcemap: Schema.optional<Schema.String>;
    readonly hash: Schema.NonEmptyString;
    readonly bytes: Schema.Number;
  }>>;
  readonly idempotency_key: Schema.optional<Schema.String>;
  readonly allow_generic_schema: Schema.optional<Schema.Boolean>;
}>;
type OrbitJobPublishBody = typeof OrbitJobPublishBody.Type;
declare const OrbitAppPublishBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly code: Schema.NonEmptyString;
  readonly runtime: Schema.optional<Schema.Union<readonly [Schema.Literal<"classic">, Schema.Literal<"bundled">]>>;
  readonly bundle: Schema.optional<Schema.Struct<{
    readonly code: Schema.NonEmptyString;
    readonly sourcemap: Schema.optional<Schema.String>;
    readonly hash: Schema.NonEmptyString;
    readonly bytes: Schema.Number;
  }>>;
  readonly routes: Schema.$Array<Schema.Struct<{
    readonly method: Schema.Union<readonly [Schema.Literal<"GET">, Schema.Literal<"POST">, Schema.Literal<"PUT">, Schema.Literal<"PATCH">, Schema.Literal<"DELETE">, Schema.Literal<"OPTIONS">]>;
    readonly path: Schema.NonEmptyString;
    readonly id: Schema.optional<Schema.String>;
    readonly title: Schema.optional<Schema.String>;
    readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
    readonly auth: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
    readonly permissions: Schema.optional<Schema.$Array<Schema.Struct<{
      readonly action: Schema.String;
      readonly resource: Schema.optional<Schema.String>;
    }>>>;
    readonly input: Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"query">, Schema.Literal<"json">, Schema.Literal<"form">, Schema.Literal<"raw">]>;
    readonly output: Schema.Union<readonly [Schema.Literal<"html">, Schema.Literal<"json">, Schema.Literal<"text">, Schema.Literal<"redirect">, Schema.Literal<"passthrough">]>;
    readonly input_transform: Schema.optional<Schema.Struct<{
      readonly kind: Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"template">, Schema.Literal<"jsonpath">]>;
      readonly value: Schema.optional<Schema.String>;
    }>>;
    readonly output_transform: Schema.optional<Schema.Struct<{
      readonly kind: Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"template">, Schema.Literal<"jsonpath">]>;
      readonly value: Schema.optional<Schema.String>;
    }>>;
    readonly job: Schema.optional<Schema.NonEmptyString>;
    readonly static_html: Schema.optional<Schema.NonEmptyString>;
    readonly rate_limit: Schema.optional<Schema.Struct<{
      readonly window_seconds: Schema.Number;
      readonly max: Schema.Number;
    }>>;
  }>>;
  readonly jobs: Schema.$Record<Schema.String, Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.NonEmptyString>;
    readonly input_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly output_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly description: Schema.optional<Schema.String>;
  }>>;
  readonly theme: Schema.optional<Schema.Struct<{
    readonly title: Schema.optional<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
    readonly accent: Schema.optional<Schema.String>;
  }>>;
  readonly allowed_origins: Schema.optional<Schema.$Array<Schema.String>>;
  readonly idempotency_key: Schema.optional<Schema.String>;
}>;
type OrbitAppPublishBody = typeof OrbitAppPublishBody.Type;
//#endregion
//#region ../orbit/src/authoring/define-job.d.ts
type DefineJobCompileTiming = {
  readonly validate_ms: number;
  readonly schema_normalize_ms: number;
  readonly total_ms: number;
};
type DefineJobCompileResult = {
  readonly publish: Omit<OrbitJobPublishBody, 'workspace_id'>;
  readonly timing: DefineJobCompileTiming;
};
declare class OrbitAuthoringValidationError extends Error {
  readonly issues: readonly string[];
  constructor(issues: readonly string[]);
}
declare const looksLikeDefineJobSource: (source: string) => boolean;
declare function compileDefineJobPublish(source: string): DefineJobCompileResult;
//#endregion
//#region ../orbit/src/authoring/deploy-app.d.ts
type DeployAppCompileTiming = {
  readonly validate_ms: number;
  readonly manifest_normalize_ms: number;
  readonly total_ms: number;
};
type DeployAppCompileResult = {
  readonly publish: Omit<OrbitAppPublishBody, 'workspace_id'>;
  readonly timing: DeployAppCompileTiming;
};
declare const looksLikeDeployAppSource: (source: string) => boolean;
declare function compileDeployAppPublish(source: string): DeployAppCompileResult;
//#endregion
export { DefineJobCompileResult, DefineJobCompileTiming, DeployAppCompileResult, DeployAppCompileTiming, OrbitAuthoringValidationError, compileDefineJobPublish, compileDeployAppPublish, looksLikeDefineJobSource, looksLikeDeployAppSource };
//# sourceMappingURL=authoring.d.mts.map