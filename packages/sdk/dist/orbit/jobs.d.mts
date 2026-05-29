import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitJobName: Schema.NonEmptyString;
type OrbitJobName = typeof OrbitJobName.Type;
declare const OrbitJobVersion: Schema.NonEmptyString;
type OrbitJobVersion = typeof OrbitJobVersion.Type;
declare const OrbitJobStatus: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
type OrbitJobStatus = typeof OrbitJobStatus.Type;
declare const OrbitJobVersionStatus: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
type OrbitJobVersionStatus = typeof OrbitJobVersionStatus.Type;
declare const OrbitJobExecutionLane: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>;
type OrbitJobExecutionLane = typeof OrbitJobExecutionLane.Type;
declare const OrbitJobRunLane: Schema.Literal<"worker_platform">;
type OrbitJobRunLane = typeof OrbitJobRunLane.Type;
declare const OrbitJobCapability: Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>;
type OrbitJobCapability = typeof OrbitJobCapability.Type;
declare const OrbitJobKind: Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>;
type OrbitJobKind = typeof OrbitJobKind.Type;
declare const OrbitJobIdempotency: Schema.Struct<{
  readonly required: Schema.optional<Schema.Boolean>;
  readonly key: Schema.optional<Schema.Union<readonly [Schema.String, Schema.$Array<Schema.String>]>>;
  readonly ttl_seconds: Schema.optional<Schema.Number>;
}>;
type OrbitJobIdempotency = typeof OrbitJobIdempotency.Type;
declare const OrbitJobRetryPolicy: Schema.Struct<{
  readonly max_attempts: Schema.optional<Schema.Number>;
  readonly backoff: Schema.optional<Schema.Union<readonly [Schema.Literal<"none">, Schema.Literal<"fixed">, Schema.Literal<"exponential">]>>;
}>;
type OrbitJobRetryPolicy = typeof OrbitJobRetryPolicy.Type;
declare const OrbitJobRetentionPolicy: Schema.Struct<{
  readonly run_ttl_seconds: Schema.optional<Schema.Number>;
  readonly artifact_ttl_seconds: Schema.optional<Schema.Number>;
}>;
type OrbitJobRetentionPolicy = typeof OrbitJobRetentionPolicy.Type;
declare const OrbitJobPublishRuntime: Schema.Union<readonly [Schema.Literal<"classic">, Schema.Literal<"bundled">, Schema.Literal<"define_job">]>;
type OrbitJobPublishRuntime = typeof OrbitJobPublishRuntime.Type;
declare const OrbitJobPublishBundle: Schema.Struct<{
  readonly code: Schema.NonEmptyString;
  readonly sourcemap: Schema.optional<Schema.String>;
  readonly hash: Schema.NonEmptyString;
  readonly bytes: Schema.Number;
}>;
type OrbitJobPublishBundle = typeof OrbitJobPublishBundle.Type;
declare const OrbitJsonSchema: Schema.$Record<Schema.String, Schema.Unknown>;
type OrbitJsonSchema = typeof OrbitJsonSchema.Type;
declare const OrbitJobArtifactRef: Schema.Struct<{
  readonly id: Schema.String;
  readonly kind: Schema.String;
  readonly url: Schema.optional<Schema.String>;
}>;
type OrbitJobArtifactRef = typeof OrbitJobArtifactRef.Type;
declare const OrbitJobSummary: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.NullOr<Schema.String>;
  readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
  readonly kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>>;
  readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
  readonly lane: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>>;
  readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
  readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
  readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
  readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type OrbitJobSummary = typeof OrbitJobSummary.Type;
declare const OrbitJobVersionRecord: Schema.Struct<{
  readonly version: Schema.NonEmptyString;
  readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
  readonly lane: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>;
  readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
  readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
  }>>>;
  readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
  readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
  readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly created_at: Schema.String;
  readonly error_message: Schema.NullOr<Schema.String>;
}>;
type OrbitJobVersionRecord = typeof OrbitJobVersionRecord.Type;
declare const OrbitJobDetail: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.NullOr<Schema.String>;
  readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
  readonly kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>>;
  readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
  readonly lane: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>>;
  readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
  readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
  readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
  readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly input_schema: Schema.NullOr<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly output_schema: Schema.NullOr<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
  }>>>;
  readonly versions: Schema.$Array<Schema.Struct<{
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
    readonly lane: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>;
    readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
    readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
    }>>>;
    readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
    readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
    readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.String;
    readonly error_message: Schema.NullOr<Schema.String>;
  }>>;
}>;
type OrbitJobDetail = typeof OrbitJobDetail.Type;
declare const OrbitJobListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitJobListBody = typeof OrbitJobListBody.Type;
declare const OrbitJobListResponse: Schema.Struct<{
  readonly jobs: Schema.$Array<Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly description: Schema.NullOr<Schema.String>;
    readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
    readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
    readonly kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>>;
    readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
    readonly lane: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>>;
    readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
    readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
    readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
    readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
  }>>;
  readonly count: Schema.Number;
}>;
type OrbitJobListResponse = typeof OrbitJobListResponse.Type;
declare const OrbitJobInspectBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
}>;
type OrbitJobInspectBody = typeof OrbitJobInspectBody.Type;
declare const OrbitJobInspectResponse: Schema.Struct<{
  readonly job: Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly description: Schema.NullOr<Schema.String>;
    readonly latest_version: Schema.NullOr<Schema.NonEmptyString>;
    readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"disabled">, Schema.Literal<"failed">]>;
    readonly kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"query">, Schema.Literal<"mutation">, Schema.Literal<"task">]>>;
    readonly tags: Schema.optional<Schema.$Array<Schema.String>>;
    readonly lane: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>>;
    readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
    readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
    readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
    readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly input_schema: Schema.NullOr<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly output_schema: Schema.NullOr<Schema.$Record<Schema.String, Schema.Unknown>>;
    readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
    }>>>;
    readonly versions: Schema.$Array<Schema.Struct<{
      readonly version: Schema.NonEmptyString;
      readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
      readonly lane: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>;
      readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
      readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
      }>>>;
      readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
      readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
      readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly created_at: Schema.String;
      readonly error_message: Schema.NullOr<Schema.String>;
    }>>;
  }>;
}>;
type OrbitJobInspectResponse = typeof OrbitJobInspectResponse.Type;
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
declare const OrbitJobPublishResponse: Schema.Struct<{
  readonly job: Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
    readonly lane: Schema.optional<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
    readonly deployment_id: Schema.optional<Schema.String>;
    readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
  }>;
  readonly timing: Schema.optional<Schema.Struct<{
    readonly validate_ms: Schema.optional<Schema.Number>;
    readonly schema_normalize_ms: Schema.optional<Schema.Number>;
    readonly source_store_ms: Schema.optional<Schema.Number>;
    readonly wfp_upload_ms: Schema.optional<Schema.Number>;
    readonly deploy_ping_ms: Schema.optional<Schema.Number>;
    readonly total_ms: Schema.Number;
  }>>;
}>;
type OrbitJobPublishResponse = typeof OrbitJobPublishResponse.Type;
declare const OrbitJobRunBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
  readonly input: Schema.optional<Schema.Unknown>;
  readonly timeout_ms: Schema.optional<Schema.Number>;
  readonly lane: Schema.optional<Schema.Literal<"worker_platform">>;
  readonly idempotency_key: Schema.optional<Schema.String>;
}>;
type OrbitJobRunBody = typeof OrbitJobRunBody.Type;
declare const OrbitJobRunResponse: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly job: Schema.NonEmptyString;
  readonly version: Schema.NonEmptyString;
  readonly run_id: Schema.String;
  readonly duration_ms: Schema.Number;
  readonly output: Schema.Unknown;
  readonly artifacts: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly kind: Schema.String;
    readonly url: Schema.optional<Schema.String>;
  }>>;
  readonly lane_used: Schema.optional<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
  readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type OrbitJobRunResponse = typeof OrbitJobRunResponse.Type;
declare const OrbitJobVersionsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
}>;
type OrbitJobVersionsBody = typeof OrbitJobVersionsBody.Type;
declare const OrbitJobVersionsResponse: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly versions: Schema.$Array<Schema.Struct<{
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"validating">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
    readonly lane: Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>;
    readonly capabilities: Schema.$Array<Schema.Union<readonly [Schema.Literal<"storage">, Schema.Literal<"cache">, Schema.Literal<"ai">, Schema.Literal<"plugins">, Schema.Literal<"memory">, Schema.Literal<"data">, Schema.Literal<"workflow">, Schema.Literal<"sessions">, Schema.Literal<"socket">]>>;
    readonly trigger_manifest: Schema.optional<Schema.NullOr<Schema.Struct<{
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
    }>>>;
    readonly deployment_id: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly deployment_provider: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>>>;
    readonly deployment_status: Schema.optional<Schema.NullOr<Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>>>;
    readonly deployed_at: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly created_at: Schema.String;
    readonly error_message: Schema.NullOr<Schema.String>;
  }>>;
}>;
type OrbitJobVersionsResponse = typeof OrbitJobVersionsResponse.Type;
declare const OrbitJobDisableBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.NonEmptyString>;
}>;
type OrbitJobDisableBody = typeof OrbitJobDisableBody.Type;
declare const OrbitJobDisableResponse: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly version: Schema.NullOr<Schema.NonEmptyString>;
  readonly disabled: Schema.Boolean;
}>;
type OrbitJobDisableResponse = typeof OrbitJobDisableResponse.Type;
declare const OrbitJobInvocationStatus: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>;
type OrbitJobInvocationStatus = typeof OrbitJobInvocationStatus.Type;
declare const OrbitJobCallerKind: Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>;
type OrbitJobCallerKind = typeof OrbitJobCallerKind.Type;
declare const OrbitJobInvocationSummary: Schema.Struct<{
  readonly id: Schema.String;
  readonly job: Schema.NonEmptyString;
  readonly version: Schema.NonEmptyString;
  readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>;
  readonly caller_kind: Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>;
  readonly caller_id: Schema.NullOr<Schema.String>;
  readonly lane_used: Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
  readonly deployment_id: Schema.NullOr<Schema.String>;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly error_code: Schema.NullOr<Schema.String>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
}>;
type OrbitJobInvocationSummary = typeof OrbitJobInvocationSummary.Type;
declare const OrbitJobInvocationDetail: Schema.Struct<{
  readonly input: Schema.Unknown;
  readonly output: Schema.Unknown;
  readonly output_ref: Schema.NullOr<Schema.String>;
  readonly id: Schema.String;
  readonly job: Schema.NonEmptyString;
  readonly version: Schema.NonEmptyString;
  readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>;
  readonly caller_kind: Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>;
  readonly caller_id: Schema.NullOr<Schema.String>;
  readonly lane_used: Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
  readonly deployment_id: Schema.NullOr<Schema.String>;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly error_code: Schema.NullOr<Schema.String>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
}>;
type OrbitJobInvocationDetail = typeof OrbitJobInvocationDetail.Type;
declare const OrbitJobInvocationListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly name: Schema.optional<Schema.NonEmptyString>;
  readonly version: Schema.optional<Schema.NonEmptyString>;
  readonly status: Schema.optional<Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>>;
  readonly caller_kind: Schema.optional<Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>>;
  readonly since: Schema.optional<Schema.String>;
  readonly before: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitJobInvocationListBody = typeof OrbitJobInvocationListBody.Type;
declare const OrbitJobInvocationListResponse: Schema.Struct<{
  readonly invocations: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly job: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>;
    readonly caller_kind: Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>;
    readonly caller_id: Schema.NullOr<Schema.String>;
    readonly lane_used: Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
    readonly deployment_id: Schema.NullOr<Schema.String>;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error_code: Schema.NullOr<Schema.String>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
  }>>;
  readonly next_cursor: Schema.NullOr<Schema.String>;
}>;
type OrbitJobInvocationListResponse = typeof OrbitJobInvocationListResponse.Type;
declare const OrbitJobInvocationGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly invocation_id: Schema.NonEmptyString;
}>;
type OrbitJobInvocationGetBody = typeof OrbitJobInvocationGetBody.Type;
declare const OrbitJobInvocationGetResponse: Schema.Struct<{
  readonly invocation: Schema.Struct<{
    readonly input: Schema.Unknown;
    readonly output: Schema.Unknown;
    readonly output_ref: Schema.NullOr<Schema.String>;
    readonly id: Schema.String;
    readonly job: Schema.NonEmptyString;
    readonly version: Schema.NonEmptyString;
    readonly status: Schema.Union<readonly [Schema.Literal<"running">, Schema.Literal<"completed">, Schema.Literal<"failed">, Schema.Literal<"cancelled">]>;
    readonly caller_kind: Schema.Union<readonly [Schema.Literal<"user">, Schema.Literal<"agent">, Schema.Literal<"workflow">, Schema.Literal<"system">, Schema.Literal<"trigger">]>;
    readonly caller_id: Schema.NullOr<Schema.String>;
    readonly lane_used: Schema.NullOr<Schema.Union<readonly [Schema.Literal<"dynamic_worker">, Schema.Literal<"worker_platform">, Schema.Literal<"container">, Schema.Literal<"local_host">]>>;
    readonly deployment_id: Schema.NullOr<Schema.String>;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error_code: Schema.NullOr<Schema.String>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
  }>;
}>;
type OrbitJobInvocationGetResponse = typeof OrbitJobInvocationGetResponse.Type;
declare const defineOrbitJob: <T>(definition: T) => T;
//#endregion
//#region ../core-effect/src/trigger.d.ts
declare const TriggerSourceKind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
type TriggerSourceKind = typeof TriggerSourceKind.Type;
declare const TriggerKind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
type TriggerKind = TriggerSourceKind;
declare const TriggerInputMapping: Schema.Union<readonly [Schema.Struct<{
  readonly mode: Schema.Literal<"passthrough">;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"source_event">;
  readonly schema: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"declarative">;
  readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
}>]>;
type TriggerInputMapping = typeof TriggerInputMapping.Type;
declare const TriggerableJobEventBinding: Schema.Struct<{
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
}>;
type TriggerableJobEventBinding = typeof TriggerableJobEventBinding.Type;
declare const TriggerableJobManifest: Schema.Struct<{
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
}>;
type TriggerableJobManifest = typeof TriggerableJobManifest.Type;
//#endregion
export { OrbitJobArtifactRef, OrbitJobCallerKind, OrbitJobCapability, OrbitJobDetail, OrbitJobDisableBody, OrbitJobDisableResponse, OrbitJobExecutionLane, OrbitJobIdempotency, OrbitJobInspectBody, OrbitJobInspectResponse, OrbitJobInvocationDetail, OrbitJobInvocationGetBody, OrbitJobInvocationGetResponse, OrbitJobInvocationListBody, OrbitJobInvocationListResponse, OrbitJobInvocationStatus, OrbitJobInvocationSummary, OrbitJobKind, OrbitJobListBody, OrbitJobListResponse, OrbitJobName, OrbitJobPublishBody, OrbitJobPublishBundle, OrbitJobPublishResponse, OrbitJobPublishRuntime, OrbitJobRetentionPolicy, OrbitJobRetryPolicy, OrbitJobRunBody, OrbitJobRunLane, OrbitJobRunResponse, OrbitJobStatus, OrbitJobSummary, OrbitJobVersion, OrbitJobVersionRecord, OrbitJobVersionStatus, OrbitJobVersionsBody, OrbitJobVersionsResponse, OrbitJsonSchema, TriggerInputMapping, TriggerKind, TriggerableJobEventBinding, TriggerableJobManifest, defineOrbitJob };
//# sourceMappingURL=jobs.d.mts.map