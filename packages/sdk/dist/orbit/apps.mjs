import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/trigger.ts
const TriggerId = Schema.NonEmptyString;
const TriggerDeliveryId = Schema.NonEmptyString;
const TriggerSourceKind = Schema.Literals([
	"schedule.cron",
	"schedule.once",
	"webhook.http"
]);
const TriggerKind = TriggerSourceKind;
const TriggerStatus = Schema.Literals([
	"draft",
	"active",
	"paused",
	"disabled",
	"failed"
]);
const TriggerDeliveryStatus = Schema.Literals([
	"queued",
	"claimed",
	"running",
	"completed",
	"failed",
	"skipped",
	"cancelled",
	"dead_lettered"
]);
Schema.Literals([
	"started",
	"completed",
	"failed",
	"retry_scheduled",
	"abandoned"
]);
const TriggerSetupKind = Schema.Literals([
	"webhook_url",
	"source_authorization",
	"secret",
	"schedule",
	"policy"
]);
const TriggerCheckStatus = Schema.Literals([
	"pass",
	"warn",
	"fail"
]);
const TriggerScheduleCatchUp = Schema.Literals([
	"none",
	"one",
	"all"
]);
const TriggerMisfireStrategy = Schema.Literals([
	"skip",
	"coalesce_latest",
	"enqueue"
]);
const TriggerConcurrencyOverflow = Schema.Literals([
	"queue",
	"skip",
	"coalesce_latest",
	"fail"
]);
const TriggerConcurrencyScope = Schema.Literals([
	"global",
	"workspace",
	"trigger",
	"job",
	"custom"
]);
const TriggerErrorReason = Schema.Literals([
	"invalid_trigger_kind",
	"invalid_config",
	"target_job_not_found",
	"target_version_not_ready",
	"target_not_triggerable",
	"input_mapping_invalid",
	"schedule_invalid",
	"webhook_verification_unavailable",
	"source_authorization_missing",
	"quota_exceeded",
	"policy_denied",
	"receipt_expired",
	"receipt_consumed",
	"idempotency_conflict",
	"concurrency_limit_exceeded"
]);
Schema.Struct({
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerOnceScheduleSpec = Schema.Struct({
	kind: Schema.Literal("schedule.once"),
	fire_at: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String)
});
const TriggerWebhookSignedPayloadPart = Schema.Union([
	Schema.Struct({ type: Schema.Literal("raw_body") }),
	Schema.Struct({
		type: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({
		type: Schema.Literal("static"),
		value: Schema.String
	})
]);
const TriggerWebhookVerification = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("shared_secret_header"),
		header: Schema.NonEmptyString,
		secret_sha256: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("hmac_sha256"),
		signature_header: Schema.NonEmptyString,
		secret: Schema.NonEmptyString,
		encoding: Schema.optional(Schema.Literals(["hex", "base64"])),
		prefix: Schema.optional(Schema.String),
		signed_payload: Schema.optional(Schema.Struct({
			separator: Schema.optional(Schema.String),
			parts: Schema.Array(TriggerWebhookSignedPayloadPart)
		})),
		tolerance_seconds: Schema.optional(Schema.Number),
		timestamp_header: Schema.optional(Schema.NonEmptyString)
	}),
	Schema.Struct({
		mode: Schema.Literal("standard_webhooks"),
		secret: Schema.NonEmptyString,
		tolerance_seconds: Schema.optional(Schema.Number)
	})
]);
const TriggerWebhookIdempotency = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("body_sha256") }),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	}),
	Schema.Struct({ mode: Schema.Literal("standard_webhooks_id") })
]);
const TriggerWebhookEventType = Schema.Union([
	Schema.Struct({ mode: Schema.Literal("none") }),
	Schema.Struct({
		mode: Schema.Literal("static"),
		value: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("header"),
		header: Schema.NonEmptyString
	}),
	Schema.Struct({
		mode: Schema.Literal("json_path"),
		path: Schema.NonEmptyString
	})
]);
const TriggerWebhookSpec = Schema.Struct({
	kind: Schema.Literal("webhook.http"),
	event: Schema.optional(Schema.String),
	secret_ref: Schema.optional(Schema.String),
	max_event_bytes: Schema.optional(Schema.Number),
	verification: Schema.optional(TriggerWebhookVerification),
	idempotency: Schema.optional(TriggerWebhookIdempotency),
	event_type: Schema.optional(TriggerWebhookEventType)
});
const TriggerScheduleSpecWithKind = Schema.Struct({
	kind: Schema.Literal("schedule.cron"),
	cron: Schema.NonEmptyString,
	timezone: Schema.optional(Schema.String),
	min_interval_seconds: Schema.optional(Schema.Number),
	catch_up: Schema.optional(TriggerScheduleCatchUp),
	misfire_strategy: Schema.optional(TriggerMisfireStrategy)
});
const TriggerSourceConfig = Schema.Union([
	TriggerScheduleSpecWithKind,
	TriggerOnceScheduleSpec,
	TriggerWebhookSpec
]);
const TriggerInputPassthroughMapping = Schema.Struct({ mode: Schema.Literal("passthrough") });
const TriggerInputSourceEventMapping = Schema.Struct({
	mode: Schema.Literal("source_event"),
	schema: Schema.NonEmptyString
});
const TriggerInputDeclarativeMapping = Schema.Struct({
	mode: Schema.Literal("declarative"),
	fields: Schema.Record(Schema.String, Schema.NonEmptyString)
});
const TriggerInputMapping = Schema.Union([
	TriggerInputPassthroughMapping,
	TriggerInputSourceEventMapping,
	TriggerInputDeclarativeMapping
]);
const TriggerIdempotencyPolicy = Schema.Struct({
	key: Schema.Array(Schema.NonEmptyString),
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerConcurrencyPolicy = Schema.Struct({
	scope: Schema.optional(TriggerConcurrencyScope),
	key: Schema.Array(Schema.NonEmptyString),
	limit: Schema.Number,
	overflow: TriggerConcurrencyOverflow,
	ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerRetryPolicy = Schema.Struct({
	max_attempts: Schema.optional(Schema.Number),
	backoff: Schema.optional(Schema.Literals([
		"none",
		"fixed",
		"exponential"
	]))
});
const TriggerRetentionPolicy = Schema.Struct({
	event_ttl_seconds: Schema.optional(Schema.Number),
	delivery_ttl_seconds: Schema.optional(Schema.Number)
});
const TriggerLimitCount = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1));
const TriggerLimitEventBytes = Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(1024));
const TriggerLimits = Schema.Struct({
	max_active_triggers: Schema.optional(TriggerLimitCount),
	max_active_schedules: Schema.optional(TriggerLimitCount),
	max_due_per_tick: Schema.optional(TriggerLimitCount),
	max_concurrent_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_cron_deliveries: Schema.optional(TriggerLimitCount),
	max_concurrent_webhook_deliveries: Schema.optional(TriggerLimitCount),
	min_cron_interval_seconds: Schema.optional(TriggerLimitCount),
	max_event_bytes: Schema.optional(TriggerLimitEventBytes)
});
const TriggerableJobEventBinding = Schema.Struct({
	source_kind: TriggerSourceKind,
	event: Schema.optional(Schema.NonEmptyString),
	input_mapping: TriggerInputMapping,
	idempotency: Schema.optional(TriggerIdempotencyPolicy),
	concurrency: Schema.optional(TriggerConcurrencyPolicy),
	retry: Schema.optional(TriggerRetryPolicy),
	retention: Schema.optional(TriggerRetentionPolicy),
	metadata: Schema.optional(Schema.Record(Schema.String, Schema.Unknown))
});
const TriggerableJobManifest = Schema.Struct({
	version: Schema.optional(Schema.Literal(1)),
	events: Schema.Array(TriggerableJobEventBinding)
});
const TriggerTargetJobRef = Schema.Struct({
	job: Schema.NonEmptyString,
	version: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits),
	activation: Schema.optional(Schema.Struct({
		name: Schema.optional(Schema.String),
		description: Schema.optional(Schema.String)
	}))
});
const TriggerCheck = Schema.Struct({
	code: Schema.NonEmptyString,
	status: TriggerCheckStatus,
	message: Schema.String,
	data: Schema.optional(Schema.Unknown)
});
const TriggerRequiredSetup = Schema.Struct({
	kind: TriggerSetupKind,
	status: Schema.Literals([
		"ready",
		"required",
		"missing"
	]),
	data: Schema.optional(Schema.Unknown)
});
const TriggerActivationDraft = Schema.Struct({
	source: TriggerSourceConfig,
	target: TriggerTargetJobRef,
	input_mapping: Schema.optional(TriggerInputMapping),
	limits: Schema.optional(TriggerLimits)
});
const TriggerActivateBody = Schema.Struct({
	workspace_id: WorkspaceId,
	inspect_receipt_id: Schema.NonEmptyString,
	name: Schema.NonEmptyString,
	description: Schema.optional(Schema.String),
	status: Schema.optional(Schema.Literals(["active", "paused"]))
});
Schema.Struct({
	ok: Schema.Boolean,
	receipt_id: Schema.NonEmptyString,
	expires_at: Schema.String,
	normalized: TriggerActivationDraft,
	target: Schema.Struct({
		job: Schema.NonEmptyString,
		version: Schema.String,
		compatible: Schema.Boolean,
		manifest: Schema.optional(TriggerableJobManifest)
	}),
	checks: Schema.Array(TriggerCheck),
	required_setup: Schema.Array(TriggerRequiredSetup),
	activation_body: Schema.optional(TriggerActivateBody),
	errors: Schema.optional(Schema.Array(Schema.Struct({
		reason: TriggerErrorReason,
		message: Schema.String,
		path: Schema.optional(Schema.String)
	})))
});
const TriggerRecord = Schema.Struct({
	id: TriggerId,
	workspace_id: WorkspaceId,
	name: Schema.String,
	description: Schema.NullOr(Schema.String),
	kind: TriggerKind,
	status: TriggerStatus,
	target_job_name: Schema.String,
	target_version_name: Schema.String,
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	created_at: Schema.String,
	updated_at: Schema.String,
	activated_at: Schema.NullOr(Schema.String),
	paused_at: Schema.NullOr(Schema.String),
	disabled_at: Schema.NullOr(Schema.String)
});
const TriggerDeliveryRecord = Schema.Struct({
	id: TriggerDeliveryId,
	workspace_id: WorkspaceId,
	trigger_id: TriggerId,
	kind: TriggerKind,
	status: TriggerDeliveryStatus,
	scheduled_for: Schema.NullOr(Schema.String),
	source_delivery_id: Schema.NullOr(Schema.String),
	idempotency_key: Schema.String,
	run_id: Schema.NullOr(Schema.String),
	job_invocation_id: Schema.NullOr(Schema.String),
	attempt_count: Schema.Number,
	next_attempt_at: Schema.NullOr(Schema.String),
	error_reason: Schema.NullOr(Schema.String),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId,
	reason: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({
	workspace_id: WorkspaceId,
	status: Schema.optional(TriggerStatus),
	kind: Schema.optional(TriggerKind),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	triggers: Schema.Array(TriggerRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({ trigger: TriggerRecord });
Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: Schema.optional(TriggerId),
	status: Schema.optional(TriggerDeliveryStatus),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	deliveries: Schema.Array(TriggerDeliveryRecord),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId
});
Schema.Struct({ delivery: TriggerDeliveryRecord });
Schema.Struct({ workspace_id: WorkspaceId });
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
//#endregion
//#region ../core-effect/src/orbit.ts
const OrbitWorkspaceId = WorkspaceId;
Schema.Literals([
	"kv",
	"blob",
	"log",
	"job",
	"app"
]);
Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.optional(RunId)
});
Schema.Struct({
	workspace_id: WorkspaceId,
	key: Schema.NonEmptyString,
	content_type: Schema.optional(Schema.String),
	size_bytes: Schema.optional(Schema.Number)
});
const OrbitStorageKey = Schema.NonEmptyString.check(Schema.isMaxLength(512), Schema.isPattern(/^(?![\\/])(?!.*\.\.).+$/));
const OrbitStorageEncoding = Schema.Union([
	Schema.Literal("auto"),
	Schema.Literal("metadata"),
	Schema.Literal("text"),
	Schema.Literal("json"),
	Schema.Literal("base64")
]);
const OrbitStorageObject = Schema.Struct({
	key: OrbitStorageKey,
	size: Schema.Number,
	uploaded: Schema.String,
	content_type: Schema.String,
	download_url: Schema.String,
	expires_at: Schema.String,
	expires_in_seconds: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	prefix: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	objects: Schema.Array(OrbitStorageObject),
	truncated: Schema.Boolean,
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey,
	data: Schema.Unknown,
	content_type: Schema.optional(Schema.String),
	encoding: Schema.optional(Schema.Union([
		Schema.Literal("text"),
		Schema.Literal("json"),
		Schema.Literal("base64")
	]))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey,
	encoding: Schema.optional(OrbitStorageEncoding)
});
Schema.NullOr(Schema.Struct({
	...OrbitStorageObject.fields,
	encoding: Schema.Union([
		Schema.Literal("metadata"),
		Schema.Literal("text"),
		Schema.Literal("json"),
		Schema.Literal("base64")
	]),
	data: Schema.optional(Schema.Unknown)
}));
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey
});
Schema.Struct({
	key: OrbitStorageKey,
	download_url: Schema.String,
	expires_at: Schema.String,
	expires_in_seconds: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	key: OrbitStorageKey
});
Schema.Struct({
	deleted: Schema.Boolean,
	key: OrbitStorageKey
});
const OrbitAiModelTask = Schema.Union([
	Schema.Literal("text-generation"),
	Schema.Literal("text-embeddings"),
	Schema.Literal("classification"),
	Schema.Literal("rerank"),
	Schema.Literal("summarization")
]);
const OrbitAiModel = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	task: OrbitAiModelTask,
	provider: Schema.optional(Schema.String),
	fast: Schema.optional(Schema.Boolean),
	reasoning: Schema.optional(Schema.Boolean),
	vision: Schema.optional(Schema.Boolean)
});
const OrbitAiModelsResultInfo = Schema.Struct({
	count: Schema.optional(Schema.Number),
	page: Schema.optional(Schema.Number),
	per_page: Schema.optional(Schema.Number),
	total_count: Schema.optional(Schema.Number),
	total_pages: Schema.optional(Schema.Number)
});
Schema.Struct({
	models: Schema.Array(OrbitAiModel),
	workspace_allowed: Schema.optional(Schema.NullOr(Schema.Array(Schema.String))),
	source: Schema.optional(Schema.String),
	fallback_reason: Schema.optional(Schema.String),
	result_info: Schema.optional(OrbitAiModelsResultInfo)
});
Schema.Struct({
	model: Schema.optional(Schema.String),
	temperature: Schema.optional(Schema.Number),
	max_tokens: Schema.optional(Schema.Number)
});
Schema.Struct({
	model: Schema.optional(Schema.String),
	input: Schema.Unknown,
	temperature: Schema.optional(Schema.Number),
	max_tokens: Schema.optional(Schema.Number)
});
Schema.Struct({
	model: Schema.String,
	text: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	summary: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	embeddings: Schema.Array(Schema.Array(Schema.Number)),
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	label: Schema.String,
	raw: Schema.Unknown
});
Schema.Struct({
	model: Schema.String,
	ranking: Schema.Unknown,
	raw: Schema.Unknown
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	run_id: Schema.optional(Schema.String),
	operation: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
const OrbitUsageRow = Schema.Struct({
	id: Schema.String,
	run_id: Schema.NullOr(Schema.String),
	workspace_id: OrbitWorkspaceId,
	operation: Schema.String,
	key: Schema.NullOr(Schema.String),
	model: Schema.NullOr(Schema.String),
	size_bytes: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	error: Schema.NullOr(Schema.String),
	created_at: Schema.String
});
Schema.Struct({
	data: Schema.Array(OrbitUsageRow),
	limit: Schema.Number,
	offset: Schema.Number
});
const OrbitJobName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/));
const OrbitJobVersion = Schema.NonEmptyString.check(Schema.isMaxLength(32), Schema.isPattern(/^v[1-9][0-9]*$/));
const OrbitJobStatus = Schema.Union([
	Schema.Literal("ready"),
	Schema.Literal("disabled"),
	Schema.Literal("failed")
]);
const OrbitJobVersionStatus = Schema.Union([
	Schema.Literal("validating"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitJobExecutionLane = Schema.Union([
	Schema.Literal("dynamic_worker"),
	Schema.Literal("worker_platform"),
	Schema.Literal("container"),
	Schema.Literal("local_host")
]);
const OrbitJobRunLane = Schema.Literal("worker_platform");
const OrbitJobCapability = Schema.Union([
	Schema.Literal("storage"),
	Schema.Literal("cache"),
	Schema.Literal("ai"),
	Schema.Literal("plugins"),
	Schema.Literal("memory"),
	Schema.Literal("data"),
	Schema.Literal("workflow"),
	Schema.Literal("sessions"),
	Schema.Literal("socket")
]);
const OrbitJobKind = Schema.Union([
	Schema.Literal("query"),
	Schema.Literal("mutation"),
	Schema.Literal("task")
]);
const OrbitJobIdempotency = Schema.Struct({
	required: Schema.optional(Schema.Boolean),
	key: Schema.optional(Schema.Union([Schema.String, Schema.Array(Schema.String)])),
	ttl_seconds: Schema.optional(Schema.Number)
});
const OrbitJobRetryPolicy = Schema.Struct({
	max_attempts: Schema.optional(Schema.Number),
	backoff: Schema.optional(Schema.Union([
		Schema.Literal("none"),
		Schema.Literal("fixed"),
		Schema.Literal("exponential")
	]))
});
const OrbitJobRetentionPolicy = Schema.Struct({
	run_ttl_seconds: Schema.optional(Schema.Number),
	artifact_ttl_seconds: Schema.optional(Schema.Number)
});
const OrbitJobPublishRuntime = Schema.Union([
	Schema.Literal("classic"),
	Schema.Literal("bundled"),
	Schema.Literal("define_job")
]);
const OrbitJobPublishBundle = Schema.Struct({
	code: Schema.NonEmptyString,
	sourcemap: Schema.optional(Schema.String),
	hash: Schema.NonEmptyString,
	bytes: Schema.Number
});
const OrbitJsonSchema = Schema.Record(Schema.String, Schema.Unknown);
const OrbitJobArtifactRef = Schema.Struct({
	id: Schema.String,
	kind: Schema.String,
	url: Schema.optional(Schema.String)
});
const OrbitJobDeploymentProvider = Schema.Union([
	Schema.Literal("cloudflare_wfp"),
	Schema.Literal("cloudflare_container"),
	Schema.Literal("local")
]);
const OrbitJobDeploymentStatus = Schema.Union([
	Schema.Literal("promoting"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitJobSummary = Schema.Struct({
	name: OrbitJobName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitJobVersion),
	status: OrbitJobStatus,
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	lane: Schema.optional(Schema.NullOr(OrbitJobExecutionLane)),
	capabilities: Schema.Array(OrbitJobCapability),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String))
});
const OrbitJobVersionRecord = Schema.Struct({
	version: OrbitJobVersion,
	status: OrbitJobVersionStatus,
	lane: OrbitJobExecutionLane,
	capabilities: Schema.Array(OrbitJobCapability),
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String)),
	created_at: Schema.String,
	error_message: Schema.NullOr(Schema.String)
});
const OrbitJobDetail = Schema.Struct({
	name: OrbitJobName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitJobVersion),
	status: OrbitJobStatus,
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	lane: Schema.optional(Schema.NullOr(OrbitJobExecutionLane)),
	capabilities: Schema.Array(OrbitJobCapability),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String)),
	deployment_provider: Schema.optional(Schema.NullOr(OrbitJobDeploymentProvider)),
	deployment_status: Schema.optional(Schema.NullOr(OrbitJobDeploymentStatus)),
	deployed_at: Schema.optional(Schema.NullOr(Schema.String)),
	input_schema: Schema.NullOr(OrbitJsonSchema),
	output_schema: Schema.NullOr(OrbitJsonSchema),
	trigger_manifest: Schema.optional(Schema.NullOr(TriggerableJobManifest)),
	versions: Schema.Array(OrbitJobVersionRecord)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	jobs: Schema.Array(OrbitJobSummary),
	count: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion)
});
Schema.Struct({ job: OrbitJobDetail });
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	description: Schema.optional(Schema.String),
	kind: Schema.optional(OrbitJobKind),
	tags: Schema.optional(Schema.Array(Schema.String)),
	input_binding: Schema.optional(Schema.String),
	input_schema: Schema.optional(OrbitJsonSchema),
	output_schema: Schema.optional(OrbitJsonSchema),
	capabilities: Schema.optional(Schema.Array(OrbitJobCapability)),
	timeout_ms: Schema.optional(Schema.Number),
	idempotency: Schema.optional(OrbitJobIdempotency),
	retry: Schema.optional(OrbitJobRetryPolicy),
	retention: Schema.optional(OrbitJobRetentionPolicy),
	trigger_manifest: Schema.optional(TriggerableJobManifest),
	compatibility_date: Schema.optional(Schema.String),
	code: Schema.NonEmptyString,
	runtime: Schema.optional(OrbitJobPublishRuntime),
	bundle: Schema.optional(OrbitJobPublishBundle),
	idempotency_key: Schema.optional(Schema.String),
	allow_generic_schema: Schema.optional(Schema.Boolean)
});
Schema.Struct({
	job: Schema.Struct({
		name: OrbitJobName,
		version: OrbitJobVersion,
		status: OrbitJobVersionStatus,
		lane: Schema.optional(OrbitJobExecutionLane),
		deployment_id: Schema.optional(Schema.String),
		capabilities: Schema.Array(OrbitJobCapability)
	}),
	timing: Schema.optional(Schema.Struct({
		validate_ms: Schema.optional(Schema.Number),
		schema_normalize_ms: Schema.optional(Schema.Number),
		source_store_ms: Schema.optional(Schema.Number),
		wfp_upload_ms: Schema.optional(Schema.Number),
		deploy_ping_ms: Schema.optional(Schema.Number),
		total_ms: Schema.Number
	}))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion),
	input: Schema.optional(Schema.Unknown),
	timeout_ms: Schema.optional(Schema.Number),
	lane: Schema.optional(OrbitJobRunLane),
	idempotency_key: Schema.optional(Schema.String)
});
Schema.Struct({
	ok: Schema.Boolean,
	job: OrbitJobName,
	version: OrbitJobVersion,
	run_id: Schema.String,
	duration_ms: Schema.Number,
	output: Schema.Unknown,
	artifacts: Schema.Array(OrbitJobArtifactRef),
	lane_used: Schema.optional(OrbitJobExecutionLane),
	deployment_id: Schema.optional(Schema.NullOr(Schema.String))
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName
});
Schema.Struct({
	name: OrbitJobName,
	versions: Schema.Array(OrbitJobVersionRecord)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion)
});
Schema.Struct({
	name: OrbitJobName,
	version: Schema.NullOr(OrbitJobVersion),
	disabled: Schema.Boolean
});
const OrbitJobInvocationStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed"),
	Schema.Literal("cancelled")
]);
const OrbitJobCallerKind = Schema.Union([
	Schema.Literal("user"),
	Schema.Literal("agent"),
	Schema.Literal("workflow"),
	Schema.Literal("system"),
	Schema.Literal("trigger")
]);
const OrbitJobInvocationSummary = Schema.Struct({
	id: Schema.String,
	job: OrbitJobName,
	version: OrbitJobVersion,
	status: OrbitJobInvocationStatus,
	caller_kind: OrbitJobCallerKind,
	caller_id: Schema.NullOr(Schema.String),
	lane_used: Schema.NullOr(OrbitJobExecutionLane),
	deployment_id: Schema.NullOr(Schema.String),
	run_id: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	error_code: Schema.NullOr(Schema.String),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
const OrbitJobInvocationDetail = Schema.Struct({
	...OrbitJobInvocationSummary.fields,
	input: Schema.Unknown,
	output: Schema.Unknown,
	output_ref: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: Schema.optional(OrbitJobName),
	version: Schema.optional(OrbitJobVersion),
	status: Schema.optional(OrbitJobInvocationStatus),
	caller_kind: Schema.optional(OrbitJobCallerKind),
	since: Schema.optional(Schema.String),
	before: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
Schema.Struct({
	invocations: Schema.Array(OrbitJobInvocationSummary),
	next_cursor: Schema.NullOr(Schema.String)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	invocation_id: Schema.NonEmptyString
});
Schema.Struct({ invocation: OrbitJobInvocationDetail });
const OrbitAppName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-z][a-z0-9-]{0,127}$/));
const OrbitAppVersion = Schema.NonEmptyString.check(Schema.isMaxLength(32), Schema.isPattern(/^v[1-9][0-9]*$/));
const OrbitAppStatus = Schema.Union([
	Schema.Literal("ready"),
	Schema.Literal("disabled"),
	Schema.Literal("failed")
]);
const OrbitAppVersionStatus = Schema.Union([
	Schema.Literal("validating"),
	Schema.Literal("ready"),
	Schema.Literal("failed"),
	Schema.Literal("disabled")
]);
const OrbitAppRouteMethod = Schema.Union([
	Schema.Literal("GET"),
	Schema.Literal("POST"),
	Schema.Literal("PUT"),
	Schema.Literal("PATCH"),
	Schema.Literal("DELETE"),
	Schema.Literal("OPTIONS")
]);
const OrbitAppRouteAuth = Schema.Union([
	Schema.Literal("public"),
	Schema.Literal("workspace_member"),
	Schema.Literal("signed_link"),
	Schema.Literal("service")
]);
const OrbitAppAccess = Schema.Union([Schema.Literal("public"), Schema.Literal("workspace_member")]);
const OrbitAppInputAdapter = Schema.Union([
	Schema.Literal("none"),
	Schema.Literal("query"),
	Schema.Literal("json"),
	Schema.Literal("form"),
	Schema.Literal("raw")
]);
const OrbitAppOutputAdapter = Schema.Union([
	Schema.Literal("html"),
	Schema.Literal("json"),
	Schema.Literal("text"),
	Schema.Literal("redirect"),
	Schema.Literal("passthrough")
]);
const OrbitAppRoutePermission = Schema.Struct({
	action: Schema.String,
	resource: Schema.optional(Schema.String)
});
const OrbitAppTransform = Schema.Struct({
	kind: Schema.Union([
		Schema.Literal("none"),
		Schema.Literal("template"),
		Schema.Literal("jsonpath")
	]),
	value: Schema.optional(Schema.String)
});
const OrbitAppRateLimit = Schema.Struct({
	window_seconds: Schema.Number,
	max: Schema.Number
});
const OrbitAppJobRef = Schema.Struct({
	name: OrbitJobName,
	version: Schema.optional(OrbitJobVersion),
	input_schema: Schema.optional(OrbitJsonSchema),
	output_schema: Schema.optional(OrbitJsonSchema),
	description: Schema.optional(Schema.String)
});
const OrbitAppRoute = Schema.Struct({
	method: OrbitAppRouteMethod,
	path: Schema.NonEmptyString,
	id: Schema.optional(Schema.String),
	title: Schema.optional(Schema.String),
	tags: Schema.optional(Schema.Array(Schema.String)),
	auth: OrbitAppRouteAuth,
	permissions: Schema.optional(Schema.Array(OrbitAppRoutePermission)),
	input: OrbitAppInputAdapter,
	output: OrbitAppOutputAdapter,
	input_transform: Schema.optional(OrbitAppTransform),
	output_transform: Schema.optional(OrbitAppTransform),
	job: Schema.optional(Schema.NonEmptyString),
	static_html: Schema.optional(Schema.NonEmptyString),
	rate_limit: Schema.optional(OrbitAppRateLimit)
});
const OrbitAppTheme = Schema.Struct({
	title: Schema.optional(Schema.String),
	description: Schema.optional(Schema.String),
	accent: Schema.optional(Schema.String)
});
const OrbitAppPublishRuntime = Schema.Union([Schema.Literal("classic"), Schema.Literal("bundled")]);
const OrbitAppPublishBundle = Schema.Struct({
	code: Schema.NonEmptyString,
	sourcemap: Schema.optional(Schema.String),
	hash: Schema.NonEmptyString,
	bytes: Schema.Number
});
const OrbitAppSummary = Schema.Struct({
	name: OrbitAppName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitAppVersion),
	status: OrbitAppStatus,
	url: Schema.NullOr(Schema.String),
	access: OrbitAppAccess
});
const OrbitAppVersionRecord = Schema.Struct({
	version: OrbitAppVersion,
	status: OrbitAppVersionStatus,
	route_count: Schema.Number,
	job_count: Schema.Number,
	created_at: Schema.String,
	error_message: Schema.NullOr(Schema.String)
});
const OrbitAppDetail = Schema.Struct({
	name: OrbitAppName,
	description: Schema.NullOr(Schema.String),
	latest_version: Schema.NullOr(OrbitAppVersion),
	status: OrbitAppStatus,
	url: Schema.NullOr(Schema.String),
	access: OrbitAppAccess,
	routes: Schema.Array(OrbitAppRoute),
	jobs: Schema.Record(Schema.String, OrbitAppJobRef),
	versions: Schema.Array(OrbitAppVersionRecord)
});
const OrbitAppListBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
const OrbitAppListResponse = Schema.Struct({
	apps: Schema.Array(OrbitAppSummary),
	count: Schema.Number
});
const OrbitAppInspectBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	version: Schema.optional(OrbitAppVersion)
});
const OrbitAppInspectResponse = Schema.Struct({ app: OrbitAppDetail });
const OrbitAppPublishBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	description: Schema.optional(Schema.String),
	code: Schema.NonEmptyString,
	runtime: Schema.optional(OrbitAppPublishRuntime),
	bundle: Schema.optional(OrbitAppPublishBundle),
	routes: Schema.Array(OrbitAppRoute),
	jobs: Schema.Record(Schema.String, OrbitAppJobRef),
	theme: Schema.optional(OrbitAppTheme),
	allowed_origins: Schema.optional(Schema.Array(Schema.String)),
	idempotency_key: Schema.optional(Schema.String)
});
const OrbitAppPublishResponse = Schema.Struct({ app: Schema.Struct({
	name: OrbitAppName,
	version: OrbitAppVersion,
	status: OrbitAppVersionStatus,
	url: Schema.String
}) });
const OrbitAppDisableBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	version: Schema.optional(OrbitAppVersion)
});
const OrbitAppDisableResponse = Schema.Struct({
	name: OrbitAppName,
	version: Schema.NullOr(OrbitAppVersion),
	disabled: Schema.Boolean
});
const OrbitAppAccessUpdateBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	access: OrbitAppAccess
});
const OrbitAppAccessUpdateResponse = Schema.Struct({
	name: OrbitAppName,
	access: OrbitAppAccess,
	routes_updated: Schema.Number
});
const OrbitAppOpenBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	path: Schema.optional(Schema.String)
});
const OrbitAppOpenResponse = Schema.Struct({
	name: OrbitAppName,
	url: Schema.String
});
const OrbitAppInvocationStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed"),
	Schema.Literal("denied"),
	Schema.Literal("rate_limited")
]);
const OrbitAppActorKind = Schema.Union([
	Schema.Literal("anonymous"),
	Schema.Literal("workspace_user"),
	Schema.Literal("signed_link"),
	Schema.Literal("service")
]);
const OrbitAppJobCallStatus = Schema.Union([
	Schema.Literal("running"),
	Schema.Literal("completed"),
	Schema.Literal("failed")
]);
const OrbitAppInvocationSummary = Schema.Struct({
	id: Schema.String,
	app: OrbitAppName,
	version: OrbitAppVersion,
	deployment_id: Schema.NullOr(Schema.String),
	method: Schema.String,
	path: Schema.String,
	route_job: Schema.NullOr(Schema.String),
	actor_kind: OrbitAppActorKind,
	actor_id: Schema.NullOr(Schema.String),
	status: OrbitAppInvocationStatus,
	status_code: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	error_message: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String),
	job_call_count: Schema.Number
});
const OrbitAppJobCallSummary = Schema.Struct({
	id: Schema.String,
	job_invocation_id: Schema.NullOr(Schema.String),
	job_name: Schema.String,
	job_version: Schema.NullOr(Schema.String),
	route_job: Schema.NullOr(Schema.String),
	status: OrbitAppJobCallStatus,
	error_message: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	run_id: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String)
});
const OrbitAppInvocationListBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: Schema.optional(OrbitAppName),
	version: Schema.optional(OrbitAppVersion),
	route_job: Schema.optional(Schema.String),
	status: Schema.optional(OrbitAppInvocationStatus),
	actor_kind: Schema.optional(OrbitAppActorKind),
	since: Schema.optional(Schema.String),
	before: Schema.optional(Schema.String),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
const OrbitAppInvocationListResponse = Schema.Struct({
	invocations: Schema.Array(OrbitAppInvocationSummary),
	next_cursor: Schema.NullOr(Schema.String)
});
const OrbitAppInvocationGetBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	invocation_id: Schema.NonEmptyString
});
const OrbitAppInvocationGetResponse = Schema.Struct({
	invocation: OrbitAppInvocationSummary,
	job_calls: Schema.Array(OrbitAppJobCallSummary)
});
const OrbitAppActivityKind = Schema.Union([
	Schema.Literal("invocation"),
	Schema.Literal("version_change"),
	Schema.Literal("admin_change")
]);
const OrbitAppActivityRow = Schema.Struct({
	id: Schema.String,
	kind: OrbitAppActivityKind,
	type: Schema.String,
	activity: Schema.String,
	created_at: Schema.String
});
const OrbitAppActivityListBody = Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	name: OrbitAppName,
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String)
});
const OrbitAppActivityListResponse = Schema.Struct({
	activity: Schema.Array(OrbitAppActivityRow),
	next_cursor: Schema.NullOr(Schema.String)
});
const defineOrbitApp = (definition) => definition;
const OrbitSocketChannel = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/));
const OrbitSocketPermission = Schema.Union([Schema.Literal("receive"), Schema.Literal("send")]);
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel,
	permissions: Schema.optional(Schema.Array(OrbitSocketPermission)),
	expires_in_seconds: Schema.optional(Schema.Number),
	allowed_origins: Schema.optional(Schema.Array(Schema.String))
});
Schema.Struct({
	channel: OrbitSocketChannel,
	url: Schema.String,
	expires_at: Schema.String
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel,
	event: Schema.Unknown
});
Schema.Struct({
	channel: OrbitSocketChannel,
	delivered: Schema.Number
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	channel: OrbitSocketChannel
});
Schema.Struct({
	channel: OrbitSocketChannel,
	connections: Schema.Number
});
const OrbitDbTableName = Schema.NonEmptyString.check(Schema.isMaxLength(128), Schema.isPattern(/^[a-zA-Z_][a-zA-Z0-9_-]{0,127}$/));
const OrbitDbTableSummary = Schema.Struct({
	name: OrbitDbTableName,
	type: Schema.Union([Schema.Literal("table"), Schema.Literal("view")]),
	row_count: Schema.NullOr(Schema.Number),
	columns: Schema.Array(Schema.Struct({
		name: Schema.String,
		type: Schema.String,
		notnull: Schema.Boolean,
		pk: Schema.Boolean
	}))
});
Schema.Struct({ workspace_id: OrbitWorkspaceId });
Schema.Struct({
	workspace_database_id: Schema.NullOr(Schema.String),
	workspace_database_name: Schema.NullOr(Schema.String),
	status: Schema.Union([
		Schema.Literal("ready"),
		Schema.Literal("creating"),
		Schema.Literal("failed"),
		Schema.Literal("disabled")
	]),
	tables: Schema.Array(OrbitDbTableSummary)
});
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	table: OrbitDbTableName,
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
Schema.Struct({
	table: OrbitDbTableName,
	columns: Schema.Array(Schema.String),
	rows: Schema.Array(Schema.Record(Schema.String, Schema.Unknown)),
	truncated: Schema.Boolean,
	total_rows: Schema.NullOr(Schema.Number)
});
const OrbitReadinessSubjectKind = Schema.Union([
	Schema.Literal("orbit_job_version"),
	Schema.Literal("orbit_app_version"),
	Schema.Literal("plugin_tool")
]);
Schema.Union([
	Schema.Literal("deploy_ping"),
	Schema.Literal("schema"),
	Schema.Literal("risk"),
	Schema.Literal("quality"),
	Schema.Literal("smoke")
]);
const OrbitReadinessStatus = Schema.Union([
	Schema.Literal("queued"),
	Schema.Literal("running"),
	Schema.Literal("healthy"),
	Schema.Literal("degraded"),
	Schema.Literal("broken"),
	Schema.Literal("skipped")
]);
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	subject_kind: OrbitReadinessSubjectKind,
	subject_id: Schema.String,
	status: OrbitReadinessStatus,
	summary: Schema.Record(Schema.String, Schema.Unknown),
	last_check_id: Schema.NullOr(Schema.String),
	checked_at: Schema.NullOr(Schema.String),
	changed_at: Schema.String,
	updated_at: Schema.String
});
const OrbitBrandName = Schema.NonEmptyString.check(Schema.isMaxLength(128));
const OrbitBrandLogoUrl = Schema.NonEmptyString.check(Schema.isMaxLength(2048));
const OrbitBrandColor = Schema.NonEmptyString.check(Schema.isMaxLength(64), Schema.isPattern(/^\d*\.?\d+\s+\d*\.?\d+\s+\d*\.?\d+$/));
const OrbitBrandFontFamily = Schema.NonEmptyString.check(Schema.isMaxLength(256));
Schema.Struct({
	workspace_id: OrbitWorkspaceId,
	brand_name: Schema.optional(OrbitBrandName),
	brand_logo_url: Schema.optional(OrbitBrandLogoUrl),
	primary_color: Schema.optional(OrbitBrandColor),
	accent_color: Schema.optional(OrbitBrandColor),
	font_family: Schema.optional(OrbitBrandFontFamily),
	dark_mode_default: Schema.Boolean,
	created_at: Schema.String,
	updated_at: Schema.String,
	updated_by: Schema.optional(Schema.String)
});
const ORBIT_PRIMITIVE_KEYS = [
	"storage_put",
	"storage_get",
	"storage_list",
	"storage_delete",
	"storage_url",
	"cache_get",
	"cache_set",
	"cache_delete",
	"socket_url",
	"socket_broadcast",
	"socket_stats",
	"tools_search",
	"tools_describe",
	"tools_namespaces",
	"db_exec",
	"db_query",
	"db_first",
	"db_batch",
	"ai_run",
	"ai_generate",
	"ai_summarize",
	"ai_embed",
	"ai_classify",
	"ai_rerank",
	"ai_models"
];
const WFP_NATIVE_PRIMITIVE_KEYS = [
	"db_exec",
	"db_query",
	"db_first",
	"db_batch"
];
ORBIT_PRIMITIVE_KEYS.filter((key) => !WFP_NATIVE_PRIMITIVE_KEYS.includes(key));
//#endregion
export { OrbitAppAccess, OrbitAppAccessUpdateBody, OrbitAppAccessUpdateResponse, OrbitAppActivityKind, OrbitAppActivityListBody, OrbitAppActivityListResponse, OrbitAppActivityRow, OrbitAppActorKind, OrbitAppDetail, OrbitAppDisableBody, OrbitAppDisableResponse, OrbitAppInputAdapter, OrbitAppInspectBody, OrbitAppInspectResponse, OrbitAppInvocationGetBody, OrbitAppInvocationGetResponse, OrbitAppInvocationListBody, OrbitAppInvocationListResponse, OrbitAppInvocationStatus, OrbitAppInvocationSummary, OrbitAppJobCallStatus, OrbitAppJobCallSummary, OrbitAppJobRef, OrbitAppListBody, OrbitAppListResponse, OrbitAppName, OrbitAppOpenBody, OrbitAppOpenResponse, OrbitAppOutputAdapter, OrbitAppPublishBody, OrbitAppPublishBundle, OrbitAppPublishResponse, OrbitAppPublishRuntime, OrbitAppRateLimit, OrbitAppRoute, OrbitAppRouteAuth, OrbitAppRouteMethod, OrbitAppRoutePermission, OrbitAppStatus, OrbitAppSummary, OrbitAppTheme, OrbitAppTransform, OrbitAppVersion, OrbitAppVersionRecord, OrbitAppVersionStatus, defineOrbitApp };

//# sourceMappingURL=apps.mjs.map