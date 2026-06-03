import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitAppName: Schema.NonEmptyString;
type OrbitAppName = typeof OrbitAppName.Type;
declare const OrbitAppVersion: Schema.NonEmptyString;
type OrbitAppVersion = typeof OrbitAppVersion.Type;
declare const OrbitAppStatus: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
type OrbitAppStatus = typeof OrbitAppStatus.Type;
declare const OrbitAppVersionStatus: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
type OrbitAppVersionStatus = typeof OrbitAppVersionStatus.Type;
declare const OrbitAppRouteMethod: Schema.Union<readonly [Schema.Literal<"GET">, Schema.Literal<"POST">, Schema.Literal<"PUT">, Schema.Literal<"PATCH">, Schema.Literal<"DELETE">, Schema.Literal<"OPTIONS">]>;
type OrbitAppRouteMethod = typeof OrbitAppRouteMethod.Type;
declare const OrbitAppRouteAuth: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
type OrbitAppRouteAuth = typeof OrbitAppRouteAuth.Type;
declare const OrbitAppAccess: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
type OrbitAppAccess = typeof OrbitAppAccess.Type;
declare const OrbitAppInputAdapter: Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"query">, Schema.Literal<"json">, Schema.Literal<"form">, Schema.Literal<"raw">]>;
type OrbitAppInputAdapter = typeof OrbitAppInputAdapter.Type;
declare const OrbitAppOutputAdapter: Schema.Union<readonly [Schema.Literal<"html">, Schema.Literal<"json">, Schema.Literal<"text">, Schema.Literal<"redirect">, Schema.Literal<"passthrough">]>;
type OrbitAppOutputAdapter = typeof OrbitAppOutputAdapter.Type;
declare const OrbitAppRoutePermission: Schema.Struct<{
  readonly action: Schema.String;
  readonly resource: Schema.optional<Schema.String>;
}>;
type OrbitAppRoutePermission = typeof OrbitAppRoutePermission.Type;
declare const OrbitAppTransform: Schema.Struct<{
  readonly kind: Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"template">, Schema.Literal<"jsonpath">]>;
  readonly value: Schema.optional<Schema.String>;
}>;
type OrbitAppTransform = typeof OrbitAppTransform.Type;
declare const OrbitAppRateLimit: Schema.Struct<{
  readonly window_seconds: Schema.Number;
  readonly max: Schema.Number;
}>;
type OrbitAppRateLimit = typeof OrbitAppRateLimit.Type;
declare const OrbitAppJobRef: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
  readonly input_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly output_schema: Schema.optional<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly description: Schema.optional<Schema.String>;
}>;
type OrbitAppJobRef = typeof OrbitAppJobRef.Type;
declare const OrbitAppRoute: Schema.Struct<{
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
}>;
type OrbitAppRoute = typeof OrbitAppRoute.Type;
declare const OrbitAppTheme: Schema.Struct<{
  readonly title: Schema.optional<Schema.String>;
  readonly description: Schema.optional<Schema.String>;
  readonly accent: Schema.optional<Schema.String>;
}>;
type OrbitAppTheme = typeof OrbitAppTheme.Type;
declare const OrbitAppPublishRuntime: Schema.Union<readonly [Schema.Literal<"classic">, Schema.Literal<"bundled">]>;
type OrbitAppPublishRuntime = typeof OrbitAppPublishRuntime.Type;
declare const OrbitAppPublishBundle: Schema.Struct<{
  readonly code: Schema.NonEmptyString;
  readonly sourcemap: Schema.optional<Schema.String>;
  readonly hash: Schema.NonEmptyString;
  readonly bytes: Schema.Number;
}>;
type OrbitAppPublishBundle = typeof OrbitAppPublishBundle.Type;
declare const OrbitAppSummary: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.NullOr<Schema.String>;
  readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
  readonly url: Schema.NullOr<Schema.String>;
  readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
  readonly created_at: Schema.String;
}>;
type OrbitAppSummary = typeof OrbitAppSummary.Type;
declare const OrbitAppVersionRecord: Schema.Struct<{
  readonly version: Schema.NonEmptyString;
  readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
  readonly route_count: Schema.Number;
  readonly job_count: Schema.Number;
  readonly created_at: Schema.String;
  readonly error_message: Schema.NullOr<Schema.String>;
}>;
type OrbitAppVersionRecord = typeof OrbitAppVersionRecord.Type;
declare const OrbitAppDetail: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.NullOr<Schema.String>;
  readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
  readonly url: Schema.NullOr<Schema.String>;
  readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
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
  readonly versions: Schema.$Array<Schema.Struct<{
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
    readonly route_count: Schema.Number;
    readonly job_count: Schema.Number;
    readonly created_at: Schema.String;
    readonly error_message: Schema.NullOr<Schema.String>;
  }>>;
}>;
type OrbitAppDetail = typeof OrbitAppDetail.Type;
declare const OrbitAppListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitAppListBody = typeof OrbitAppListBody.Type;
declare const OrbitAppListResponse: Schema.Struct<{
  readonly apps: Schema.$Array<Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly description: Schema.NullOr<Schema.String>;
    readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
    readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
    readonly url: Schema.NullOr<Schema.String>;
    readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
    readonly created_at: Schema.String;
  }>>;
  readonly count: Schema.Number;
}>;
type OrbitAppListResponse = typeof OrbitAppListResponse.Type;
declare const OrbitAppInspectBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
}>;
type OrbitAppInspectBody = typeof OrbitAppInspectBody.Type;
declare const OrbitAppInspectResponse: Schema.Struct<{
  readonly app: Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly description: Schema.NullOr<Schema.String>;
    readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
    readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
    readonly url: Schema.NullOr<Schema.String>;
    readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
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
    readonly versions: Schema.$Array<Schema.Struct<{
      readonly version: Schema.NonEmptyString;
      readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
      readonly route_count: Schema.Number;
      readonly job_count: Schema.Number;
      readonly created_at: Schema.String;
      readonly error_message: Schema.NullOr<Schema.String>;
    }>>;
  }>;
}>;
type OrbitAppInspectResponse = typeof OrbitAppInspectResponse.Type;
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
declare const OrbitAppPublishResponse: Schema.Struct<{
  readonly app: Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
    readonly url: Schema.String;
  }>;
}>;
type OrbitAppPublishResponse = typeof OrbitAppPublishResponse.Type;
declare const OrbitAppDisableBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
}>;
type OrbitAppDisableBody = typeof OrbitAppDisableBody.Type;
declare const OrbitAppDisableResponse: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.NullOr<Schema.NonEmptyString>;
  readonly disabled: Schema.Boolean;
}>;
type OrbitAppDisableResponse = typeof OrbitAppDisableResponse.Type;
declare const OrbitAppAccessUpdateBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
}>;
type OrbitAppAccessUpdateBody = typeof OrbitAppAccessUpdateBody.Type;
declare const OrbitAppAccessUpdateResponse: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly access: Schema.Union<readonly [Schema.Literal<"public">, Schema.Literal<"workspace_member">]>;
  readonly routes_updated: Schema.Number;
}>;
type OrbitAppAccessUpdateResponse = typeof OrbitAppAccessUpdateResponse.Type;
declare const OrbitAppOpenBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly path: Schema.optional<Schema.String>;
}>;
type OrbitAppOpenBody = typeof OrbitAppOpenBody.Type;
declare const OrbitAppOpenResponse: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly url: Schema.String;
}>;
type OrbitAppOpenResponse = typeof OrbitAppOpenResponse.Type;
declare const OrbitAppInvocationStatus: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"denied">, Schema.Literal<"rate_limited">]>;
type OrbitAppInvocationStatus = typeof OrbitAppInvocationStatus.Type;
declare const OrbitAppActorKind: Schema.Union<readonly [Schema.Literal<"anonymous">, Schema.Literal<"workspace_user">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
type OrbitAppActorKind = typeof OrbitAppActorKind.Type;
declare const OrbitAppJobCallStatus: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">]>;
type OrbitAppJobCallStatus = typeof OrbitAppJobCallStatus.Type;
declare const OrbitAppInvocationSummary: Schema.Struct<{
  readonly id: Schema.String;
  readonly app: Schema.NonEmptyString;
  readonly version: Schema.NonEmptyString;
  readonly deployment_id: Schema.NullOr<Schema.String>;
  readonly method: Schema.String;
  readonly path: Schema.String;
  readonly route_job: Schema.NullOr<Schema.String>;
  readonly actor_kind: Schema.Union<readonly [Schema.Literal<"anonymous">, Schema.Literal<"workspace_user">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
  readonly actor_id: Schema.NullOr<Schema.String>;
  readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"denied">, Schema.Literal<"rate_limited">]>;
  readonly status_code: Schema.NullOr<Schema.Number>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
  readonly job_call_count: Schema.Number;
}>;
type OrbitAppInvocationSummary = typeof OrbitAppInvocationSummary.Type;
declare const OrbitAppJobCallSummary: Schema.Struct<{
  readonly id: Schema.String;
  readonly job_invocation_id: Schema.NullOr<Schema.String>;
  readonly job_name: Schema.String;
  readonly job_version: Schema.NullOr<Schema.String>;
  readonly route_job: Schema.NullOr<Schema.String>;
  readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">]>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
}>;
type OrbitAppJobCallSummary = typeof OrbitAppJobCallSummary.Type;
declare const OrbitAppInvocationListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.optional<Schema.NonEmptyString>;
  readonly version: Schema.optional<Schema.NonEmptyString>;
  readonly route_job: Schema.optional<Schema.String>;
  readonly status: Schema.optional<Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"denied">, Schema.Literal<"rate_limited">]>>;
  readonly actor_kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"anonymous">, Schema.Literal<"workspace_user">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>>;
  readonly since: Schema.optional<Schema.String>;
  readonly before: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitAppInvocationListBody = typeof OrbitAppInvocationListBody.Type;
declare const OrbitAppInvocationListResponse: Schema.Struct<{
  readonly invocations: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly app: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly deployment_id: Schema.NullOr<Schema.String>;
    readonly method: Schema.String;
    readonly path: Schema.String;
    readonly route_job: Schema.NullOr<Schema.String>;
    readonly actor_kind: Schema.Union<readonly [Schema.Literal<"anonymous">, Schema.Literal<"workspace_user">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
    readonly actor_id: Schema.NullOr<Schema.String>;
    readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"denied">, Schema.Literal<"rate_limited">]>;
    readonly status_code: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
    readonly job_call_count: Schema.Number;
  }>>;
  readonly next_cursor: Schema.NullOr<Schema.String>;
}>;
type OrbitAppInvocationListResponse = typeof OrbitAppInvocationListResponse.Type;
declare const OrbitAppInvocationGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly invocation_id: Schema.NonEmptyString;
}>;
type OrbitAppInvocationGetBody = typeof OrbitAppInvocationGetBody.Type;
declare const OrbitAppInvocationGetResponse: Schema.Struct<{
  readonly invocation: Schema.Struct<{
    readonly id: Schema.String;
    readonly app: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly deployment_id: Schema.NullOr<Schema.String>;
    readonly method: Schema.String;
    readonly path: Schema.String;
    readonly route_job: Schema.NullOr<Schema.String>;
    readonly actor_kind: Schema.Union<readonly [Schema.Literal<"anonymous">, Schema.Literal<"workspace_user">, Schema.Literal<"signed_link">, Schema.Literal<"service">]>;
    readonly actor_id: Schema.NullOr<Schema.String>;
    readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"denied">, Schema.Literal<"rate_limited">]>;
    readonly status_code: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
    readonly job_call_count: Schema.Number;
  }>;
  readonly job_calls: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly job_invocation_id: Schema.NullOr<Schema.String>;
    readonly job_name: Schema.String;
    readonly job_version: Schema.NullOr<Schema.String>;
    readonly route_job: Schema.NullOr<Schema.String>;
    readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">]>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
  }>>;
}>;
type OrbitAppInvocationGetResponse = typeof OrbitAppInvocationGetResponse.Type;
declare const OrbitAppActivityKind: Schema.Union<readonly [Schema.Literal<"invocation">, Schema.Literal<"version_change">, Schema.Literal<"admin_change">]>;
type OrbitAppActivityKind = typeof OrbitAppActivityKind.Type;
declare const OrbitAppActivityRow: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.Union<readonly [Schema.Literal<"invocation">, Schema.Literal<"version_change">, Schema.Literal<"admin_change">]>;
  readonly type: Schema.String;
  readonly activity: Schema.String;
  readonly created_at: Schema.String;
}>;
type OrbitAppActivityRow = typeof OrbitAppActivityRow.Type;
declare const OrbitAppActivityListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitAppActivityListBody = typeof OrbitAppActivityListBody.Type;
declare const OrbitAppActivityListResponse: Schema.Struct<{
  readonly activity: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly kind: Schema.Union<readonly [Schema.Literal<"invocation">, Schema.Literal<"version_change">, Schema.Literal<"admin_change">]>;
    readonly type: Schema.String;
    readonly activity: Schema.String;
    readonly created_at: Schema.String;
  }>>;
  readonly next_cursor: Schema.NullOr<Schema.String>;
}>;
type OrbitAppActivityListResponse = typeof OrbitAppActivityListResponse.Type;
declare const defineOrbitApp: <T>(definition: T) => T;
//#endregion
export { OrbitAppAccess, OrbitAppAccessUpdateBody, OrbitAppAccessUpdateResponse, OrbitAppActivityKind, OrbitAppActivityListBody, OrbitAppActivityListResponse, OrbitAppActivityRow, OrbitAppActorKind, OrbitAppDetail, OrbitAppDisableBody, OrbitAppDisableResponse, OrbitAppInputAdapter, OrbitAppInspectBody, OrbitAppInspectResponse, OrbitAppInvocationGetBody, OrbitAppInvocationGetResponse, OrbitAppInvocationListBody, OrbitAppInvocationListResponse, OrbitAppInvocationStatus, OrbitAppInvocationSummary, OrbitAppJobCallStatus, OrbitAppJobCallSummary, OrbitAppJobRef, OrbitAppListBody, OrbitAppListResponse, OrbitAppName, OrbitAppOpenBody, OrbitAppOpenResponse, OrbitAppOutputAdapter, OrbitAppPublishBody, OrbitAppPublishBundle, OrbitAppPublishResponse, OrbitAppPublishRuntime, OrbitAppRateLimit, OrbitAppRoute, OrbitAppRouteAuth, OrbitAppRouteMethod, OrbitAppRoutePermission, OrbitAppStatus, OrbitAppSummary, OrbitAppTheme, OrbitAppTransform, OrbitAppVersion, OrbitAppVersionRecord, OrbitAppVersionStatus, defineOrbitApp };
//# sourceMappingURL=apps.d.mts.map