import { Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
/**
* Normalize an arbitrary free-text string into the lowercase-safe namespace
* shape accepted by {@link SourceNamespace}: lowercase, non-alphanumerics
* collapsed to `-`, leading/trailing `-` trimmed, capped at 40 chars.
*
* This is the single source of truth for the namespace slugify algorithm. The
* frontend mirror lives in
* `apps/web/modules/plugin-registry/namespace-suffix.ts`; the two must stay in
* sync. Returns `''` for input that contains no alphanumerics — callers that
* need a non-empty result should fall back to a default (e.g. `'source'`),
* which is what {@link NormalizedSourceNamespace} does on decode.
*/
function sanitizeNamespace(input) {
	return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}
Schema.String.pipe(Schema.decodeTo(SourceNamespace, {
	decode: SchemaGetter.transform((s) => sanitizeNamespace(s) || "source"),
	encode: SchemaGetter.passthrough()
}));
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
const TriggerDeliveryAttemptStatus = Schema.Literals([
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
const TriggerScheduleSpec = Schema.Struct({
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
const TriggerConfig = TriggerSourceConfig;
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
const TriggerInspectBody = Schema.Struct({
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
const TriggerInspectResponse = Schema.Struct({
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
const TriggerReplayBody = Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId,
	reason: Schema.optional(Schema.String)
});
const TriggerPauseResumeBody = Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
const TriggerListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	status: Schema.optional(TriggerStatus),
	kind: Schema.optional(TriggerKind),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
const TriggerListResponse = Schema.Struct({
	triggers: Schema.Array(TriggerRecord),
	count: Schema.Number
});
const TriggerGetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: TriggerId
});
const TriggerGetResponse = Schema.Struct({ trigger: TriggerRecord });
const TriggerActivateResponse = Schema.Struct({ trigger: TriggerRecord });
const TriggerStatusUpdateResponse = Schema.Struct({ trigger: TriggerRecord });
const TriggerDeliveriesListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	trigger_id: Schema.optional(TriggerId),
	status: Schema.optional(TriggerDeliveryStatus),
	limit: Schema.optional(Schema.Number),
	offset: Schema.optional(Schema.Number)
});
const TriggerDeliveriesListResponse = Schema.Struct({
	deliveries: Schema.Array(TriggerDeliveryRecord),
	count: Schema.Number
});
const TriggerDeliveryGetBody = Schema.Struct({
	workspace_id: WorkspaceId,
	delivery_id: TriggerDeliveryId
});
const TriggerDeliveryGetResponse = Schema.Struct({ delivery: TriggerDeliveryRecord });
const TriggerLimitsGetBody = Schema.Struct({ workspace_id: WorkspaceId });
const TriggerLimitsUpdateBody = Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
const TriggerLimitsResponse = Schema.Struct({
	workspace_id: WorkspaceId,
	limits: TriggerLimits
});
//#endregion
export { TriggerActivateBody, TriggerActivateResponse, TriggerActivationDraft, TriggerCheck, TriggerCheckStatus, TriggerConcurrencyOverflow, TriggerConcurrencyPolicy, TriggerConcurrencyScope, TriggerConfig, TriggerDeliveriesListBody, TriggerDeliveriesListResponse, TriggerDeliveryAttemptStatus, TriggerDeliveryGetBody, TriggerDeliveryGetResponse, TriggerDeliveryId, TriggerDeliveryRecord, TriggerDeliveryStatus, TriggerErrorReason, TriggerGetBody, TriggerGetResponse, TriggerId, TriggerIdempotencyPolicy, TriggerInputDeclarativeMapping, TriggerInputMapping, TriggerInputPassthroughMapping, TriggerInputSourceEventMapping, TriggerInspectBody, TriggerInspectResponse, TriggerKind, TriggerLimits, TriggerLimitsGetBody, TriggerLimitsResponse, TriggerLimitsUpdateBody, TriggerListBody, TriggerListResponse, TriggerMisfireStrategy, TriggerOnceScheduleSpec, TriggerPauseResumeBody, TriggerRecord, TriggerReplayBody, TriggerRequiredSetup, TriggerRetentionPolicy, TriggerRetryPolicy, TriggerScheduleCatchUp, TriggerScheduleSpec, TriggerScheduleSpecWithKind, TriggerSetupKind, TriggerSourceConfig, TriggerSourceKind, TriggerStatus, TriggerStatusUpdateResponse, TriggerTargetJobRef, TriggerWebhookEventType, TriggerWebhookIdempotency, TriggerWebhookSignedPayloadPart, TriggerWebhookSpec, TriggerWebhookVerification, TriggerableJobEventBinding, TriggerableJobManifest };

//# sourceMappingURL=trigger.mjs.map