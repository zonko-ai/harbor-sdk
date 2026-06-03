import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitWorkspaceId: Schema.String;
type OrbitWorkspaceId = typeof OrbitWorkspaceId.Type;
declare const OrbitPrimitive: Schema.Literals<readonly ["kv", "blob", "log", "job", "app"]>;
type OrbitPrimitive = typeof OrbitPrimitive.Type;
declare const OrbitScope: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.optional<Schema.String>;
}>;
type OrbitScope = typeof OrbitScope.Type;
declare const OrbitArtifactRef: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly content_type: Schema.optional<Schema.String>;
  readonly size_bytes: Schema.optional<Schema.Number>;
}>;
type OrbitArtifactRef = typeof OrbitArtifactRef.Type;
declare const OrbitStorageKey: Schema.NonEmptyString;
type OrbitStorageKey = typeof OrbitStorageKey.Type;
declare const OrbitStorageEncoding: Schema.Union<readonly [Schema.Literal<"auto">, Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>;
type OrbitStorageEncoding = typeof OrbitStorageEncoding.Type;
declare const OrbitStorageObject: Schema.Struct<{
  readonly key: Schema.NonEmptyString;
  readonly size: Schema.Number;
  readonly uploaded: Schema.String;
  readonly content_type: Schema.String;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>;
type OrbitStorageObject = typeof OrbitStorageObject.Type;
declare const OrbitStorageListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly prefix: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitStorageListBody = typeof OrbitStorageListBody.Type;
declare const OrbitStorageListResponse: Schema.Struct<{
  readonly objects: Schema.$Array<Schema.Struct<{
    readonly key: Schema.NonEmptyString;
    readonly size: Schema.Number;
    readonly uploaded: Schema.String;
    readonly content_type: Schema.String;
    readonly download_url: Schema.String;
    readonly expires_at: Schema.String;
    readonly expires_in_seconds: Schema.Number;
  }>>;
  readonly truncated: Schema.Boolean;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitStorageListResponse = typeof OrbitStorageListResponse.Type;
declare const OrbitStoragePutBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly data: Schema.Unknown;
  readonly content_type: Schema.optional<Schema.String>;
  readonly encoding: Schema.optional<Schema.Union<readonly [Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>>;
}>;
type OrbitStoragePutBody = typeof OrbitStoragePutBody.Type;
declare const OrbitStorageGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly encoding: Schema.optional<Schema.Union<readonly [Schema.Literal<"auto">, Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>>;
}>;
type OrbitStorageGetBody = typeof OrbitStorageGetBody.Type;
declare const OrbitStorageGetResponse: Schema.NullOr<Schema.Struct<{
  readonly encoding: Schema.Union<readonly [Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>;
  readonly data: Schema.optional<Schema.Unknown>;
  readonly key: Schema.NonEmptyString;
  readonly size: Schema.Number;
  readonly uploaded: Schema.String;
  readonly content_type: Schema.String;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>>;
type OrbitStorageGetResponse = typeof OrbitStorageGetResponse.Type;
declare const OrbitStorageUrlBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageUrlBody = typeof OrbitStorageUrlBody.Type;
declare const OrbitStorageUrlResponse: Schema.Struct<{
  readonly key: Schema.NonEmptyString;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>;
type OrbitStorageUrlResponse = typeof OrbitStorageUrlResponse.Type;
declare const OrbitStorageDeleteBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageDeleteBody = typeof OrbitStorageDeleteBody.Type;
declare const OrbitStorageDeleteResponse: Schema.Struct<{
  readonly deleted: Schema.Boolean;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageDeleteResponse = typeof OrbitStorageDeleteResponse.Type;
declare const OrbitAiModelTask: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
type OrbitAiModelTask = typeof OrbitAiModelTask.Type;
declare const OrbitAiModel: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
  readonly task: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
  readonly provider: Schema.optional<Schema.String>;
  readonly fast: Schema.optional<Schema.Boolean>;
  readonly reasoning: Schema.optional<Schema.Boolean>;
  readonly vision: Schema.optional<Schema.Boolean>;
}>;
type OrbitAiModel = typeof OrbitAiModel.Type;
declare const OrbitAiModelsResultInfo: Schema.Struct<{
  readonly count: Schema.optional<Schema.Number>;
  readonly page: Schema.optional<Schema.Number>;
  readonly per_page: Schema.optional<Schema.Number>;
  readonly total_count: Schema.optional<Schema.Number>;
  readonly total_pages: Schema.optional<Schema.Number>;
}>;
type OrbitAiModelsResultInfo = typeof OrbitAiModelsResultInfo.Type;
declare const OrbitAiModelsResponse: Schema.Struct<{
  readonly models: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.String;
    readonly task: Schema.Union<readonly [Schema.Literal<"text-generation">, Schema.Literal<"text-embeddings">, Schema.Literal<"classification">, Schema.Literal<"rerank">, Schema.Literal<"summarization">]>;
    readonly provider: Schema.optional<Schema.String>;
    readonly fast: Schema.optional<Schema.Boolean>;
    readonly reasoning: Schema.optional<Schema.Boolean>;
    readonly vision: Schema.optional<Schema.Boolean>;
  }>>;
  readonly workspace_allowed: Schema.optional<Schema.NullOr<Schema.$Array<Schema.String>>>;
  readonly source: Schema.optional<Schema.String>;
  readonly fallback_reason: Schema.optional<Schema.String>;
  readonly result_info: Schema.optional<Schema.Struct<{
    readonly count: Schema.optional<Schema.Number>;
    readonly page: Schema.optional<Schema.Number>;
    readonly per_page: Schema.optional<Schema.Number>;
    readonly total_count: Schema.optional<Schema.Number>;
    readonly total_pages: Schema.optional<Schema.Number>;
  }>>;
}>;
type OrbitAiModelsResponse = typeof OrbitAiModelsResponse.Type;
declare const OrbitAiTextOptions: Schema.Struct<{
  readonly model: Schema.optional<Schema.String>;
  readonly temperature: Schema.optional<Schema.Number>;
  readonly max_tokens: Schema.optional<Schema.Number>;
}>;
type OrbitAiTextOptions = typeof OrbitAiTextOptions.Type;
declare const OrbitAiRunArgs: Schema.Struct<{
  readonly model: Schema.optional<Schema.String>;
  readonly input: Schema.Unknown;
  readonly temperature: Schema.optional<Schema.Number>;
  readonly max_tokens: Schema.optional<Schema.Number>;
}>;
type OrbitAiRunArgs = typeof OrbitAiRunArgs.Type;
declare const OrbitAiTextResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly text: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiTextResponse = typeof OrbitAiTextResponse.Type;
declare const OrbitAiSummaryResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly summary: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiSummaryResponse = typeof OrbitAiSummaryResponse.Type;
declare const OrbitAiEmbedResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly embeddings: Schema.$Array<Schema.$Array<Schema.Number>>;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiEmbedResponse = typeof OrbitAiEmbedResponse.Type;
declare const OrbitAiClassifyResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly label: Schema.String;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiClassifyResponse = typeof OrbitAiClassifyResponse.Type;
declare const OrbitAiRerankResponse: Schema.Struct<{
  readonly model: Schema.String;
  readonly ranking: Schema.Unknown;
  readonly raw: Schema.Unknown;
}>;
type OrbitAiRerankResponse = typeof OrbitAiRerankResponse.Type;
declare const OrbitUsageQueryBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.optional<Schema.String>;
  readonly operation: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitUsageQueryBody = typeof OrbitUsageQueryBody.Type;
declare const OrbitUsageRow: Schema.Struct<{
  readonly id: Schema.String;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly workspace_id: Schema.String;
  readonly operation: Schema.String;
  readonly key: Schema.NullOr<Schema.String>;
  readonly model: Schema.NullOr<Schema.String>;
  readonly size_bytes: Schema.NullOr<Schema.Number>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly error: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
}>;
type OrbitUsageRow = typeof OrbitUsageRow.Type;
declare const OrbitUsageQueryResponse: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly workspace_id: Schema.String;
    readonly operation: Schema.String;
    readonly key: Schema.NullOr<Schema.String>;
    readonly model: Schema.NullOr<Schema.String>;
    readonly size_bytes: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
  }>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
}>;
type OrbitUsageQueryResponse = typeof OrbitUsageQueryResponse.Type;
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
declare const OrbitJobDeploymentProvider: Schema.Union<readonly [Schema.Literal<"cloudflare_wfp">, Schema.Literal<"cloudflare_container">, Schema.Literal<"local">]>;
type OrbitJobDeploymentProvider = typeof OrbitJobDeploymentProvider.Type;
declare const OrbitJobDeploymentStatus: Schema.Union<readonly [Schema.Literal<"promoting">, Schema.Literal<"ready">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
type OrbitJobDeploymentStatus = typeof OrbitJobDeploymentStatus.Type;
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
  readonly created_at: Schema.String;
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
    readonly created_at: Schema.String;
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
declare const OrbitSocketChannel: Schema.NonEmptyString;
type OrbitSocketChannel = typeof OrbitSocketChannel.Type;
declare const OrbitSocketPermission: Schema.Union<readonly [Schema.Literal<"receive">, Schema.Literal<"send">]>;
type OrbitSocketPermission = typeof OrbitSocketPermission.Type;
declare const OrbitSocketUrlBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
  readonly permissions: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Literal<"receive">, Schema.Literal<"send">]>>>;
  readonly expires_in_seconds: Schema.optional<Schema.Number>;
  readonly allowed_origins: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type OrbitSocketUrlBody = typeof OrbitSocketUrlBody.Type;
declare const OrbitSocketUrlResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly url: Schema.String;
  readonly expires_at: Schema.String;
}>;
type OrbitSocketUrlResponse = typeof OrbitSocketUrlResponse.Type;
declare const OrbitSocketBroadcastBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
  readonly event: Schema.Unknown;
}>;
type OrbitSocketBroadcastBody = typeof OrbitSocketBroadcastBody.Type;
declare const OrbitSocketBroadcastResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly delivered: Schema.Number;
}>;
type OrbitSocketBroadcastResponse = typeof OrbitSocketBroadcastResponse.Type;
declare const OrbitSocketStatsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
}>;
type OrbitSocketStatsBody = typeof OrbitSocketStatsBody.Type;
declare const OrbitSocketStatsResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly connections: Schema.Number;
}>;
type OrbitSocketStatsResponse = typeof OrbitSocketStatsResponse.Type;
declare const OrbitDbTableName: Schema.NonEmptyString;
type OrbitDbTableName = typeof OrbitDbTableName.Type;
declare const OrbitDbTableSummary: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly type: Schema.Union<readonly [Schema.Literal<"table">, Schema.Literal<"view">]>;
  readonly row_count: Schema.NullOr<Schema.Number>;
  readonly columns: Schema.$Array<Schema.Struct<{
    readonly name: Schema.String;
    readonly type: Schema.String;
    readonly notnull: Schema.Boolean;
    readonly pk: Schema.Boolean;
  }>>;
}>;
type OrbitDbTableSummary = typeof OrbitDbTableSummary.Type;
declare const OrbitDbTablesBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type OrbitDbTablesBody = typeof OrbitDbTablesBody.Type;
declare const OrbitDbTablesResponse: Schema.Struct<{
  readonly workspace_database_id: Schema.NullOr<Schema.String>;
  readonly workspace_database_name: Schema.NullOr<Schema.String>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"creating">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
  readonly tables: Schema.$Array<Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly type: Schema.Union<readonly [Schema.Literal<"table">, Schema.Literal<"view">]>;
    readonly row_count: Schema.NullOr<Schema.Number>;
    readonly columns: Schema.$Array<Schema.Struct<{
      readonly name: Schema.String;
      readonly type: Schema.String;
      readonly notnull: Schema.Boolean;
      readonly pk: Schema.Boolean;
    }>>;
  }>>;
}>;
type OrbitDbTablesResponse = typeof OrbitDbTablesResponse.Type;
declare const OrbitDbPeekBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly table: Schema.NonEmptyString;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitDbPeekBody = typeof OrbitDbPeekBody.Type;
declare const OrbitDbPeekResponse: Schema.Struct<{
  readonly table: Schema.NonEmptyString;
  readonly columns: Schema.$Array<Schema.String>;
  readonly rows: Schema.$Array<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly truncated: Schema.Boolean;
  readonly total_rows: Schema.NullOr<Schema.Number>;
}>;
type OrbitDbPeekResponse = typeof OrbitDbPeekResponse.Type;
declare const OrbitReadinessSubjectKind: Schema.Union<readonly [Schema.Literal<"orbit_job_version">, Schema.Literal<"orbit_app_version">, Schema.Literal<"plugin_tool">]>;
type OrbitReadinessSubjectKind = typeof OrbitReadinessSubjectKind.Type;
declare const OrbitReadinessCheckKind: Schema.Union<readonly [Schema.Literal<"deploy_ping">, Schema.Literal<"schema">, Schema.Literal<"risk">, Schema.Literal<"quality">, Schema.Literal<"smoke">]>;
type OrbitReadinessCheckKind = typeof OrbitReadinessCheckKind.Type;
declare const OrbitReadinessStatus: Schema.Union<readonly [Schema.Literal<"queued">, Schema.Literal<"running">, Schema.Literal<"healthy">, Schema.Literal<"degraded">, Schema.Literal<"broken">, Schema.Literal<"skipped">]>;
type OrbitReadinessStatus = typeof OrbitReadinessStatus.Type;
declare const OrbitReadinessSummary: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly subject_kind: Schema.Union<readonly [Schema.Literal<"orbit_job_version">, Schema.Literal<"orbit_app_version">, Schema.Literal<"plugin_tool">]>;
  readonly subject_id: Schema.String;
  readonly status: Schema.Union<readonly [Schema.Literal<"queued">, Schema.Literal<"running">, Schema.Literal<"healthy">, Schema.Literal<"degraded">, Schema.Literal<"broken">, Schema.Literal<"skipped">]>;
  readonly summary: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly last_check_id: Schema.NullOr<Schema.String>;
  readonly checked_at: Schema.NullOr<Schema.String>;
  readonly changed_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type OrbitReadinessSummary = typeof OrbitReadinessSummary.Type;
declare const OrbitBrandName: Schema.NonEmptyString;
type OrbitBrandName = typeof OrbitBrandName.Type;
type OrbitBrandNameEncoded = typeof OrbitBrandName.Encoded;
declare const OrbitBrandLogoUrl: Schema.NonEmptyString;
type OrbitBrandLogoUrl = typeof OrbitBrandLogoUrl.Type;
type OrbitBrandLogoUrlEncoded = typeof OrbitBrandLogoUrl.Encoded;
declare const OrbitBrandColor: Schema.NonEmptyString;
type OrbitBrandColor = typeof OrbitBrandColor.Type;
type OrbitBrandColorEncoded = typeof OrbitBrandColor.Encoded;
declare const OrbitBrandFontFamily: Schema.NonEmptyString;
type OrbitBrandFontFamily = typeof OrbitBrandFontFamily.Type;
type OrbitBrandFontFamilyEncoded = typeof OrbitBrandFontFamily.Encoded;
declare const WorkspaceBranding: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly brand_name: Schema.optional<Schema.NonEmptyString>;
  readonly brand_logo_url: Schema.optional<Schema.NonEmptyString>;
  readonly primary_color: Schema.optional<Schema.NonEmptyString>;
  readonly accent_color: Schema.optional<Schema.NonEmptyString>;
  readonly font_family: Schema.optional<Schema.NonEmptyString>;
  readonly dark_mode_default: Schema.Boolean;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly updated_by: Schema.optional<Schema.String>;
}>;
type WorkspaceBranding = typeof WorkspaceBranding.Type;
type WorkspaceBrandingEncoded = typeof WorkspaceBranding.Encoded;
declare const ORBIT_PRIMITIVE_KEYS: readonly ["storage_put", "storage_get", "storage_list", "storage_delete", "storage_url", "cache_get", "cache_set", "cache_delete", "socket_url", "socket_broadcast", "socket_stats", "tools_search", "tools_describe", "tools_namespaces", "db_exec", "db_query", "db_first", "db_batch", "ai_run", "ai_generate", "ai_summarize", "ai_embed", "ai_classify", "ai_rerank", "ai_models"];
type OrbitPrimitiveKey = (typeof ORBIT_PRIMITIVE_KEYS)[number];
declare const WFP_NATIVE_PRIMITIVE_KEYS: readonly ["db_exec", "db_query", "db_first", "db_batch"];
declare const HOST_CALL_PRIMITIVE_KEYS: ("storage_put" | "storage_get" | "storage_list" | "storage_delete" | "storage_url" | "cache_get" | "cache_set" | "cache_delete" | "socket_url" | "socket_broadcast" | "socket_stats" | "tools_search" | "tools_describe" | "tools_namespaces" | "ai_run" | "ai_generate" | "ai_summarize" | "ai_embed" | "ai_classify" | "ai_rerank" | "ai_models")[];
declare function orbitAppListRow(app: OrbitAppSummary): {
  name: string;
  status: "ready" | "disabled" | "failed";
  latest_version: string | null;
  url: string | null;
  access: "public" | "workspace_member";
};
declare function orbitAppDetailView(app: OrbitAppDetail): {
  name: string;
  status: "ready" | "disabled" | "failed";
  latest_version: string | null;
  url: string | null;
  access: "public" | "workspace_member";
  routes: number;
  jobs: number;
  versions: number;
};
declare function orbitJobListRow(job: OrbitJobSummary): {
  name: string;
  status: "ready" | "disabled" | "failed";
  latest_version: string | null;
  capabilities: readonly ("data" | "storage" | "cache" | "ai" | "plugins" | "memory" | "workflow" | "sessions" | "socket")[];
  kind: "task" | "query" | "mutation" | null;
  tags: readonly string[];
};
declare function orbitJobDetailView(job: OrbitJobDetail): {
  name: string;
  status: "ready" | "disabled" | "failed";
  latest_version: string | null;
  capabilities: readonly ("data" | "storage" | "cache" | "ai" | "plugins" | "memory" | "workflow" | "sessions" | "socket")[];
  versions: number;
  kind: "task" | "query" | "mutation" | null;
  tags: readonly string[];
  has_input_schema: boolean;
  has_output_schema: boolean;
};
declare function orbitJobVersionRow(version: OrbitJobVersionRecord): {
  version: string;
  status: "ready" | "disabled" | "failed" | "validating";
  lane: "dynamic_worker" | "worker_platform" | "container" | "local_host";
  capabilities: readonly ("data" | "storage" | "cache" | "ai" | "plugins" | "memory" | "workflow" | "sessions" | "socket")[];
  created_at: string;
  error: string | null;
};
//#endregion
export { HOST_CALL_PRIMITIVE_KEYS, ORBIT_PRIMITIVE_KEYS, OrbitAiClassifyResponse, OrbitAiEmbedResponse, OrbitAiModel, OrbitAiModelTask, OrbitAiModelsResponse, OrbitAiModelsResultInfo, OrbitAiRerankResponse, OrbitAiRunArgs, OrbitAiSummaryResponse, OrbitAiTextOptions, OrbitAiTextResponse, OrbitAppAccess, OrbitAppAccessUpdateBody, OrbitAppAccessUpdateResponse, OrbitAppActivityKind, OrbitAppActivityListBody, OrbitAppActivityListResponse, OrbitAppActivityRow, OrbitAppActorKind, OrbitAppDetail, OrbitAppDisableBody, OrbitAppDisableResponse, OrbitAppInputAdapter, OrbitAppInspectBody, OrbitAppInspectResponse, OrbitAppInvocationGetBody, OrbitAppInvocationGetResponse, OrbitAppInvocationListBody, OrbitAppInvocationListResponse, OrbitAppInvocationStatus, OrbitAppInvocationSummary, OrbitAppJobCallStatus, OrbitAppJobCallSummary, OrbitAppJobRef, OrbitAppListBody, OrbitAppListResponse, OrbitAppName, OrbitAppOpenBody, OrbitAppOpenResponse, OrbitAppOutputAdapter, OrbitAppPublishBody, OrbitAppPublishBundle, OrbitAppPublishResponse, OrbitAppPublishRuntime, OrbitAppRateLimit, OrbitAppRoute, OrbitAppRouteAuth, OrbitAppRouteMethod, OrbitAppRoutePermission, OrbitAppStatus, OrbitAppSummary, OrbitAppTheme, OrbitAppTransform, OrbitAppVersion, OrbitAppVersionRecord, OrbitAppVersionStatus, OrbitArtifactRef, OrbitBrandColor, OrbitBrandColorEncoded, OrbitBrandFontFamily, OrbitBrandFontFamilyEncoded, OrbitBrandLogoUrl, OrbitBrandLogoUrlEncoded, OrbitBrandName, OrbitBrandNameEncoded, OrbitDbPeekBody, OrbitDbPeekResponse, OrbitDbTableName, OrbitDbTableSummary, OrbitDbTablesBody, OrbitDbTablesResponse, OrbitJobArtifactRef, OrbitJobCallerKind, OrbitJobCapability, OrbitJobDeploymentProvider, OrbitJobDeploymentStatus, OrbitJobDetail, OrbitJobDisableBody, OrbitJobDisableResponse, OrbitJobExecutionLane, OrbitJobIdempotency, OrbitJobInspectBody, OrbitJobInspectResponse, OrbitJobInvocationDetail, OrbitJobInvocationGetBody, OrbitJobInvocationGetResponse, OrbitJobInvocationListBody, OrbitJobInvocationListResponse, OrbitJobInvocationStatus, OrbitJobInvocationSummary, OrbitJobKind, OrbitJobListBody, OrbitJobListResponse, OrbitJobName, OrbitJobPublishBody, OrbitJobPublishBundle, OrbitJobPublishResponse, OrbitJobPublishRuntime, OrbitJobRetentionPolicy, OrbitJobRetryPolicy, OrbitJobRunBody, OrbitJobRunLane, OrbitJobRunResponse, OrbitJobStatus, OrbitJobSummary, OrbitJobVersion, OrbitJobVersionRecord, OrbitJobVersionStatus, OrbitJobVersionsBody, OrbitJobVersionsResponse, OrbitJsonSchema, OrbitPrimitive, OrbitPrimitiveKey, OrbitReadinessCheckKind, OrbitReadinessStatus, OrbitReadinessSubjectKind, OrbitReadinessSummary, OrbitScope, OrbitSocketBroadcastBody, OrbitSocketBroadcastResponse, OrbitSocketChannel, OrbitSocketPermission, OrbitSocketStatsBody, OrbitSocketStatsResponse, OrbitSocketUrlBody, OrbitSocketUrlResponse, OrbitStorageDeleteBody, OrbitStorageDeleteResponse, OrbitStorageEncoding, OrbitStorageGetBody, OrbitStorageGetResponse, OrbitStorageKey, OrbitStorageListBody, OrbitStorageListResponse, OrbitStorageObject, OrbitStoragePutBody, OrbitStorageUrlBody, OrbitStorageUrlResponse, OrbitUsageQueryBody, OrbitUsageQueryResponse, OrbitUsageRow, OrbitWorkspaceId, WFP_NATIVE_PRIMITIVE_KEYS, WorkspaceBranding, WorkspaceBrandingEncoded, defineOrbitApp, defineOrbitJob, orbitAppDetailView, orbitAppListRow, orbitJobDetailView, orbitJobListRow, orbitJobVersionRow };
//# sourceMappingURL=orbit.d.mts.map