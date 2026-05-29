import { Schema } from "effect";

//#region ../core-effect/src/trigger.d.ts
declare const TriggerId: Schema.NonEmptyString;
type TriggerId = typeof TriggerId.Type;
declare const TriggerDeliveryId: Schema.NonEmptyString;
type TriggerDeliveryId = typeof TriggerDeliveryId.Type;
declare const TriggerSourceKind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
type TriggerSourceKind = typeof TriggerSourceKind.Type;
declare const TriggerKind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
type TriggerKind = TriggerSourceKind;
declare const TriggerStatus: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
type TriggerStatus = typeof TriggerStatus.Type;
declare const TriggerDeliveryStatus: Schema.Literals<readonly ["queued", "claimed", "running", "completed", "failed", "skipped", "cancelled", "dead_lettered"]>;
type TriggerDeliveryStatus = typeof TriggerDeliveryStatus.Type;
declare const TriggerDeliveryAttemptStatus: Schema.Literals<readonly ["started", "completed", "failed", "retry_scheduled", "abandoned"]>;
type TriggerDeliveryAttemptStatus = typeof TriggerDeliveryAttemptStatus.Type;
declare const TriggerSetupKind: Schema.Literals<readonly ["webhook_url", "source_authorization", "secret", "schedule", "policy"]>;
type TriggerSetupKind = typeof TriggerSetupKind.Type;
declare const TriggerCheckStatus: Schema.Literals<readonly ["pass", "warn", "fail"]>;
type TriggerCheckStatus = typeof TriggerCheckStatus.Type;
declare const TriggerScheduleCatchUp: Schema.Literals<readonly ["none", "one", "all"]>;
type TriggerScheduleCatchUp = typeof TriggerScheduleCatchUp.Type;
declare const TriggerMisfireStrategy: Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>;
type TriggerMisfireStrategy = typeof TriggerMisfireStrategy.Type;
declare const TriggerConcurrencyOverflow: Schema.Literals<readonly ["queue", "skip", "coalesce_latest", "fail"]>;
type TriggerConcurrencyOverflow = typeof TriggerConcurrencyOverflow.Type;
declare const TriggerConcurrencyScope: Schema.Literals<readonly ["global", "workspace", "trigger", "job", "custom"]>;
type TriggerConcurrencyScope = typeof TriggerConcurrencyScope.Type;
declare const TriggerErrorReason: Schema.Literals<readonly ["invalid_trigger_kind", "invalid_config", "target_job_not_found", "target_version_not_ready", "target_not_triggerable", "input_mapping_invalid", "schedule_invalid", "webhook_verification_unavailable", "source_authorization_missing", "quota_exceeded", "policy_denied", "receipt_expired", "receipt_consumed", "idempotency_conflict", "concurrency_limit_exceeded"]>;
type TriggerErrorReason = typeof TriggerErrorReason.Type;
declare const TriggerScheduleSpec: Schema.Struct<{
  readonly cron: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
  readonly min_interval_seconds: Schema.optional<Schema.Number>;
  readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
  readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
}>;
type TriggerScheduleSpec = typeof TriggerScheduleSpec.Type;
declare const TriggerOnceScheduleSpec: Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.once">;
  readonly fire_at: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
}>;
type TriggerOnceScheduleSpec = typeof TriggerOnceScheduleSpec.Type;
declare const TriggerWebhookSignedPayloadPart: Schema.Union<readonly [Schema.Struct<{
  readonly type: Schema.Literal<"raw_body">;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"header">;
  readonly header: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"json_path">;
  readonly path: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly type: Schema.Literal<"static">;
  readonly value: Schema.String;
}>]>;
type TriggerWebhookSignedPayloadPart = typeof TriggerWebhookSignedPayloadPart.Type;
declare const TriggerWebhookVerification: Schema.Union<readonly [Schema.Struct<{
  readonly mode: Schema.Literal<"none">;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"shared_secret_header">;
  readonly header: Schema.NonEmptyString;
  readonly secret_sha256: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"hmac_sha256">;
  readonly signature_header: Schema.NonEmptyString;
  readonly secret: Schema.NonEmptyString;
  readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
  readonly prefix: Schema.optional<Schema.String>;
  readonly signed_payload: Schema.optional<Schema.Struct<{
    readonly separator: Schema.optional<Schema.String>;
    readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly type: Schema.Literal<"raw_body">;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"header">;
      readonly header: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"json_path">;
      readonly path: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly type: Schema.Literal<"static">;
      readonly value: Schema.String;
    }>]>>;
  }>>;
  readonly tolerance_seconds: Schema.optional<Schema.Number>;
  readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"standard_webhooks">;
  readonly secret: Schema.NonEmptyString;
  readonly tolerance_seconds: Schema.optional<Schema.Number>;
}>]>;
type TriggerWebhookVerification = typeof TriggerWebhookVerification.Type;
declare const TriggerWebhookIdempotency: Schema.Union<readonly [Schema.Struct<{
  readonly mode: Schema.Literal<"body_sha256">;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"header">;
  readonly header: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"json_path">;
  readonly path: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"standard_webhooks_id">;
}>]>;
type TriggerWebhookIdempotency = typeof TriggerWebhookIdempotency.Type;
declare const TriggerWebhookEventType: Schema.Union<readonly [Schema.Struct<{
  readonly mode: Schema.Literal<"none">;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"static">;
  readonly value: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"header">;
  readonly header: Schema.NonEmptyString;
}>, Schema.Struct<{
  readonly mode: Schema.Literal<"json_path">;
  readonly path: Schema.NonEmptyString;
}>]>;
type TriggerWebhookEventType = typeof TriggerWebhookEventType.Type;
declare const TriggerWebhookSpec: Schema.Struct<{
  readonly kind: Schema.Literal<"webhook.http">;
  readonly event: Schema.optional<Schema.String>;
  readonly secret_ref: Schema.optional<Schema.String>;
  readonly max_event_bytes: Schema.optional<Schema.Number>;
  readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"shared_secret_header">;
    readonly header: Schema.NonEmptyString;
    readonly secret_sha256: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"hmac_sha256">;
    readonly signature_header: Schema.NonEmptyString;
    readonly secret: Schema.NonEmptyString;
    readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly signed_payload: Schema.optional<Schema.Struct<{
      readonly separator: Schema.optional<Schema.String>;
      readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"raw_body">;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"header">;
        readonly header: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"json_path">;
        readonly path: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"static">;
        readonly value: Schema.String;
      }>]>>;
    }>>;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
    readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks">;
    readonly secret: Schema.NonEmptyString;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
  }>]>>;
  readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"body_sha256">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks_id">;
  }>]>>;
  readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"static">;
    readonly value: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>]>>;
}>;
type TriggerWebhookSpec = typeof TriggerWebhookSpec.Type;
declare const TriggerScheduleSpecWithKind: Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.cron">;
  readonly cron: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
  readonly min_interval_seconds: Schema.optional<Schema.Number>;
  readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
  readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
}>;
type TriggerScheduleSpecWithKind = typeof TriggerScheduleSpecWithKind.Type;
declare const TriggerSourceConfig: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.cron">;
  readonly cron: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
  readonly min_interval_seconds: Schema.optional<Schema.Number>;
  readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
  readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.once">;
  readonly fire_at: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"webhook.http">;
  readonly event: Schema.optional<Schema.String>;
  readonly secret_ref: Schema.optional<Schema.String>;
  readonly max_event_bytes: Schema.optional<Schema.Number>;
  readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"shared_secret_header">;
    readonly header: Schema.NonEmptyString;
    readonly secret_sha256: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"hmac_sha256">;
    readonly signature_header: Schema.NonEmptyString;
    readonly secret: Schema.NonEmptyString;
    readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly signed_payload: Schema.optional<Schema.Struct<{
      readonly separator: Schema.optional<Schema.String>;
      readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"raw_body">;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"header">;
        readonly header: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"json_path">;
        readonly path: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"static">;
        readonly value: Schema.String;
      }>]>>;
    }>>;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
    readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks">;
    readonly secret: Schema.NonEmptyString;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
  }>]>>;
  readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"body_sha256">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks_id">;
  }>]>>;
  readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"static">;
    readonly value: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>]>>;
}>]>;
type TriggerSourceConfig = typeof TriggerSourceConfig.Type;
declare const TriggerConfig: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.cron">;
  readonly cron: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
  readonly min_interval_seconds: Schema.optional<Schema.Number>;
  readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
  readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"schedule.once">;
  readonly fire_at: Schema.NonEmptyString;
  readonly timezone: Schema.optional<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"webhook.http">;
  readonly event: Schema.optional<Schema.String>;
  readonly secret_ref: Schema.optional<Schema.String>;
  readonly max_event_bytes: Schema.optional<Schema.Number>;
  readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"shared_secret_header">;
    readonly header: Schema.NonEmptyString;
    readonly secret_sha256: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"hmac_sha256">;
    readonly signature_header: Schema.NonEmptyString;
    readonly secret: Schema.NonEmptyString;
    readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
    readonly prefix: Schema.optional<Schema.String>;
    readonly signed_payload: Schema.optional<Schema.Struct<{
      readonly separator: Schema.optional<Schema.String>;
      readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
        readonly type: Schema.Literal<"raw_body">;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"header">;
        readonly header: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"json_path">;
        readonly path: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly type: Schema.Literal<"static">;
        readonly value: Schema.String;
      }>]>>;
    }>>;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
    readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks">;
    readonly secret: Schema.NonEmptyString;
    readonly tolerance_seconds: Schema.optional<Schema.Number>;
  }>]>>;
  readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"body_sha256">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"standard_webhooks_id">;
  }>]>>;
  readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"none">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"static">;
    readonly value: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"header">;
    readonly header: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"json_path">;
    readonly path: Schema.NonEmptyString;
  }>]>>;
}>]>;
type TriggerConfig = TriggerSourceConfig;
declare const TriggerInputPassthroughMapping: Schema.Struct<{
  readonly mode: Schema.Literal<"passthrough">;
}>;
type TriggerInputPassthroughMapping = typeof TriggerInputPassthroughMapping.Type;
declare const TriggerInputSourceEventMapping: Schema.Struct<{
  readonly mode: Schema.Literal<"source_event">;
  readonly schema: Schema.NonEmptyString;
}>;
type TriggerInputSourceEventMapping = typeof TriggerInputSourceEventMapping.Type;
declare const TriggerInputDeclarativeMapping: Schema.Struct<{
  readonly mode: Schema.Literal<"declarative">;
  readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
}>;
type TriggerInputDeclarativeMapping = typeof TriggerInputDeclarativeMapping.Type;
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
declare const TriggerIdempotencyPolicy: Schema.Struct<{
  readonly key: Schema.$Array<Schema.NonEmptyString>;
  readonly ttl_seconds: Schema.optional<Schema.Number>;
}>;
type TriggerIdempotencyPolicy = typeof TriggerIdempotencyPolicy.Type;
declare const TriggerConcurrencyPolicy: Schema.Struct<{
  readonly scope: Schema.optional<Schema.Literals<readonly ["global", "workspace", "trigger", "job", "custom"]>>;
  readonly key: Schema.$Array<Schema.NonEmptyString>;
  readonly limit: Schema.Number;
  readonly overflow: Schema.Literals<readonly ["queue", "skip", "coalesce_latest", "fail"]>;
  readonly ttl_seconds: Schema.optional<Schema.Number>;
}>;
type TriggerConcurrencyPolicy = typeof TriggerConcurrencyPolicy.Type;
declare const TriggerRetryPolicy: Schema.Struct<{
  readonly max_attempts: Schema.optional<Schema.Number>;
  readonly backoff: Schema.optional<Schema.Literals<readonly ["none", "fixed", "exponential"]>>;
}>;
type TriggerRetryPolicy = typeof TriggerRetryPolicy.Type;
declare const TriggerRetentionPolicy: Schema.Struct<{
  readonly event_ttl_seconds: Schema.optional<Schema.Number>;
  readonly delivery_ttl_seconds: Schema.optional<Schema.Number>;
}>;
type TriggerRetentionPolicy = typeof TriggerRetentionPolicy.Type;
declare const TriggerLimits: Schema.Struct<{
  readonly max_active_triggers: Schema.optional<Schema.Number>;
  readonly max_active_schedules: Schema.optional<Schema.Number>;
  readonly max_due_per_tick: Schema.optional<Schema.Number>;
  readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
  readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
  readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
  readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
  readonly max_event_bytes: Schema.optional<Schema.Number>;
}>;
type TriggerLimits = typeof TriggerLimits.Type;
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
declare const TriggerTargetJobRef: Schema.Struct<{
  readonly job: Schema.NonEmptyString;
  readonly version: Schema.optional<Schema.String>;
}>;
type TriggerTargetJobRef = typeof TriggerTargetJobRef.Type;
declare const TriggerInspectBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly source: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"schedule.cron">;
    readonly cron: Schema.NonEmptyString;
    readonly timezone: Schema.optional<Schema.String>;
    readonly min_interval_seconds: Schema.optional<Schema.Number>;
    readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
    readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"schedule.once">;
    readonly fire_at: Schema.NonEmptyString;
    readonly timezone: Schema.optional<Schema.String>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"webhook.http">;
    readonly event: Schema.optional<Schema.String>;
    readonly secret_ref: Schema.optional<Schema.String>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
    readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"none">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"shared_secret_header">;
      readonly header: Schema.NonEmptyString;
      readonly secret_sha256: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"hmac_sha256">;
      readonly signature_header: Schema.NonEmptyString;
      readonly secret: Schema.NonEmptyString;
      readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly signed_payload: Schema.optional<Schema.Struct<{
        readonly separator: Schema.optional<Schema.String>;
        readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly type: Schema.Literal<"raw_body">;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"header">;
          readonly header: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"json_path">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"static">;
          readonly value: Schema.String;
        }>]>>;
      }>>;
      readonly tolerance_seconds: Schema.optional<Schema.Number>;
      readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"standard_webhooks">;
      readonly secret: Schema.NonEmptyString;
      readonly tolerance_seconds: Schema.optional<Schema.Number>;
    }>]>>;
    readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"body_sha256">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"header">;
      readonly header: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"json_path">;
      readonly path: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"standard_webhooks_id">;
    }>]>>;
    readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"none">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"static">;
      readonly value: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"header">;
      readonly header: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"json_path">;
      readonly path: Schema.NonEmptyString;
    }>]>>;
  }>]>;
  readonly target: Schema.Struct<{
    readonly job: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.String>;
  }>;
  readonly input_mapping: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"passthrough">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"source_event">;
    readonly schema: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"declarative">;
    readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
  }>]>>;
  readonly limits: Schema.optional<Schema.Struct<{
    readonly max_active_triggers: Schema.optional<Schema.Number>;
    readonly max_active_schedules: Schema.optional<Schema.Number>;
    readonly max_due_per_tick: Schema.optional<Schema.Number>;
    readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
    readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
  }>>;
  readonly activation: Schema.optional<Schema.Struct<{
    readonly name: Schema.optional<Schema.String>;
    readonly description: Schema.optional<Schema.String>;
  }>>;
}>;
type TriggerInspectBody = typeof TriggerInspectBody.Type;
declare const TriggerCheck: Schema.Struct<{
  readonly code: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["pass", "warn", "fail"]>;
  readonly message: Schema.String;
  readonly data: Schema.optional<Schema.Unknown>;
}>;
type TriggerCheck = typeof TriggerCheck.Type;
declare const TriggerRequiredSetup: Schema.Struct<{
  readonly kind: Schema.Literals<readonly ["webhook_url", "source_authorization", "secret", "schedule", "policy"]>;
  readonly status: Schema.Literals<readonly ["ready", "required", "missing"]>;
  readonly data: Schema.optional<Schema.Unknown>;
}>;
type TriggerRequiredSetup = typeof TriggerRequiredSetup.Type;
declare const TriggerActivationDraft: Schema.Struct<{
  readonly source: Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"schedule.cron">;
    readonly cron: Schema.NonEmptyString;
    readonly timezone: Schema.optional<Schema.String>;
    readonly min_interval_seconds: Schema.optional<Schema.Number>;
    readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
    readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"schedule.once">;
    readonly fire_at: Schema.NonEmptyString;
    readonly timezone: Schema.optional<Schema.String>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"webhook.http">;
    readonly event: Schema.optional<Schema.String>;
    readonly secret_ref: Schema.optional<Schema.String>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
    readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"none">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"shared_secret_header">;
      readonly header: Schema.NonEmptyString;
      readonly secret_sha256: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"hmac_sha256">;
      readonly signature_header: Schema.NonEmptyString;
      readonly secret: Schema.NonEmptyString;
      readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
      readonly prefix: Schema.optional<Schema.String>;
      readonly signed_payload: Schema.optional<Schema.Struct<{
        readonly separator: Schema.optional<Schema.String>;
        readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
          readonly type: Schema.Literal<"raw_body">;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"header">;
          readonly header: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"json_path">;
          readonly path: Schema.NonEmptyString;
        }>, Schema.Struct<{
          readonly type: Schema.Literal<"static">;
          readonly value: Schema.String;
        }>]>>;
      }>>;
      readonly tolerance_seconds: Schema.optional<Schema.Number>;
      readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"standard_webhooks">;
      readonly secret: Schema.NonEmptyString;
      readonly tolerance_seconds: Schema.optional<Schema.Number>;
    }>]>>;
    readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"body_sha256">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"header">;
      readonly header: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"json_path">;
      readonly path: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"standard_webhooks_id">;
    }>]>>;
    readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"none">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"static">;
      readonly value: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"header">;
      readonly header: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"json_path">;
      readonly path: Schema.NonEmptyString;
    }>]>>;
  }>]>;
  readonly target: Schema.Struct<{
    readonly job: Schema.NonEmptyString;
    readonly version: Schema.optional<Schema.String>;
  }>;
  readonly input_mapping: Schema.optional<Schema.Union<readonly [Schema.Struct<{
    readonly mode: Schema.Literal<"passthrough">;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"source_event">;
    readonly schema: Schema.NonEmptyString;
  }>, Schema.Struct<{
    readonly mode: Schema.Literal<"declarative">;
    readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
  }>]>>;
  readonly limits: Schema.optional<Schema.Struct<{
    readonly max_active_triggers: Schema.optional<Schema.Number>;
    readonly max_active_schedules: Schema.optional<Schema.Number>;
    readonly max_due_per_tick: Schema.optional<Schema.Number>;
    readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
    readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
  }>>;
}>;
type TriggerActivationDraft = typeof TriggerActivationDraft.Type;
declare const TriggerActivateBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly inspect_receipt_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly description: Schema.optional<Schema.String>;
  readonly status: Schema.optional<Schema.Literals<readonly ["active", "paused"]>>;
}>;
type TriggerActivateBody = typeof TriggerActivateBody.Type;
declare const TriggerInspectResponse: Schema.Struct<{
  readonly ok: Schema.Boolean;
  readonly receipt_id: Schema.NonEmptyString;
  readonly expires_at: Schema.String;
  readonly normalized: Schema.Struct<{
    readonly source: Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"schedule.cron">;
      readonly cron: Schema.NonEmptyString;
      readonly timezone: Schema.optional<Schema.String>;
      readonly min_interval_seconds: Schema.optional<Schema.Number>;
      readonly catch_up: Schema.optional<Schema.Literals<readonly ["none", "one", "all"]>>;
      readonly misfire_strategy: Schema.optional<Schema.Literals<readonly ["skip", "coalesce_latest", "enqueue"]>>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"schedule.once">;
      readonly fire_at: Schema.NonEmptyString;
      readonly timezone: Schema.optional<Schema.String>;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"webhook.http">;
      readonly event: Schema.optional<Schema.String>;
      readonly secret_ref: Schema.optional<Schema.String>;
      readonly max_event_bytes: Schema.optional<Schema.Number>;
      readonly verification: Schema.optional<Schema.Union<readonly [Schema.Struct<{
        readonly mode: Schema.Literal<"none">;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"shared_secret_header">;
        readonly header: Schema.NonEmptyString;
        readonly secret_sha256: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"hmac_sha256">;
        readonly signature_header: Schema.NonEmptyString;
        readonly secret: Schema.NonEmptyString;
        readonly encoding: Schema.optional<Schema.Literals<readonly ["hex", "base64"]>>;
        readonly prefix: Schema.optional<Schema.String>;
        readonly signed_payload: Schema.optional<Schema.Struct<{
          readonly separator: Schema.optional<Schema.String>;
          readonly parts: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
            readonly type: Schema.Literal<"raw_body">;
          }>, Schema.Struct<{
            readonly type: Schema.Literal<"header">;
            readonly header: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly type: Schema.Literal<"json_path">;
            readonly path: Schema.NonEmptyString;
          }>, Schema.Struct<{
            readonly type: Schema.Literal<"static">;
            readonly value: Schema.String;
          }>]>>;
        }>>;
        readonly tolerance_seconds: Schema.optional<Schema.Number>;
        readonly timestamp_header: Schema.optional<Schema.NonEmptyString>;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"standard_webhooks">;
        readonly secret: Schema.NonEmptyString;
        readonly tolerance_seconds: Schema.optional<Schema.Number>;
      }>]>>;
      readonly idempotency: Schema.optional<Schema.Union<readonly [Schema.Struct<{
        readonly mode: Schema.Literal<"body_sha256">;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"header">;
        readonly header: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"json_path">;
        readonly path: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"standard_webhooks_id">;
      }>]>>;
      readonly event_type: Schema.optional<Schema.Union<readonly [Schema.Struct<{
        readonly mode: Schema.Literal<"none">;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"static">;
        readonly value: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"header">;
        readonly header: Schema.NonEmptyString;
      }>, Schema.Struct<{
        readonly mode: Schema.Literal<"json_path">;
        readonly path: Schema.NonEmptyString;
      }>]>>;
    }>]>;
    readonly target: Schema.Struct<{
      readonly job: Schema.NonEmptyString;
      readonly version: Schema.optional<Schema.String>;
    }>;
    readonly input_mapping: Schema.optional<Schema.Union<readonly [Schema.Struct<{
      readonly mode: Schema.Literal<"passthrough">;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"source_event">;
      readonly schema: Schema.NonEmptyString;
    }>, Schema.Struct<{
      readonly mode: Schema.Literal<"declarative">;
      readonly fields: Schema.$Record<Schema.String, Schema.NonEmptyString>;
    }>]>>;
    readonly limits: Schema.optional<Schema.Struct<{
      readonly max_active_triggers: Schema.optional<Schema.Number>;
      readonly max_active_schedules: Schema.optional<Schema.Number>;
      readonly max_due_per_tick: Schema.optional<Schema.Number>;
      readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
      readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
      readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
      readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
      readonly max_event_bytes: Schema.optional<Schema.Number>;
    }>>;
  }>;
  readonly target: Schema.Struct<{
    readonly job: Schema.NonEmptyString;
    readonly version: Schema.String;
    readonly compatible: Schema.Boolean;
    readonly manifest: Schema.optional<Schema.Struct<{
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
  }>;
  readonly checks: Schema.$Array<Schema.Struct<{
    readonly code: Schema.NonEmptyString;
    readonly status: Schema.Literals<readonly ["pass", "warn", "fail"]>;
    readonly message: Schema.String;
    readonly data: Schema.optional<Schema.Unknown>;
  }>>;
  readonly required_setup: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literals<readonly ["webhook_url", "source_authorization", "secret", "schedule", "policy"]>;
    readonly status: Schema.Literals<readonly ["ready", "required", "missing"]>;
    readonly data: Schema.optional<Schema.Unknown>;
  }>>;
  readonly activation_body: Schema.optional<Schema.Struct<{
    readonly workspace_id: Schema.String;
    readonly inspect_receipt_id: Schema.NonEmptyString;
    readonly name: Schema.NonEmptyString;
    readonly description: Schema.optional<Schema.String>;
    readonly status: Schema.optional<Schema.Literals<readonly ["active", "paused"]>>;
  }>>;
  readonly errors: Schema.optional<Schema.$Array<Schema.Struct<{
    readonly reason: Schema.Literals<readonly ["invalid_trigger_kind", "invalid_config", "target_job_not_found", "target_version_not_ready", "target_not_triggerable", "input_mapping_invalid", "schedule_invalid", "webhook_verification_unavailable", "source_authorization_missing", "quota_exceeded", "policy_denied", "receipt_expired", "receipt_consumed", "idempotency_conflict", "concurrency_limit_exceeded"]>;
    readonly message: Schema.String;
    readonly path: Schema.optional<Schema.String>;
  }>>>;
}>;
type TriggerInspectResponse = typeof TriggerInspectResponse.Type;
declare const TriggerRecord: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly workspace_id: Schema.String;
  readonly name: Schema.String;
  readonly description: Schema.NullOr<Schema.String>;
  readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
  readonly status: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
  readonly target_job_name: Schema.String;
  readonly target_version_name: Schema.String;
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
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly activated_at: Schema.NullOr<Schema.String>;
  readonly paused_at: Schema.NullOr<Schema.String>;
  readonly disabled_at: Schema.NullOr<Schema.String>;
}>;
type TriggerRecord = typeof TriggerRecord.Type;
declare const TriggerDeliveryRecord: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly workspace_id: Schema.String;
  readonly trigger_id: Schema.NonEmptyString;
  readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
  readonly status: Schema.Literals<readonly ["queued", "claimed", "running", "completed", "failed", "skipped", "cancelled", "dead_lettered"]>;
  readonly scheduled_for: Schema.NullOr<Schema.String>;
  readonly source_delivery_id: Schema.NullOr<Schema.String>;
  readonly idempotency_key: Schema.String;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly job_invocation_id: Schema.NullOr<Schema.String>;
  readonly attempt_count: Schema.Number;
  readonly next_attempt_at: Schema.NullOr<Schema.String>;
  readonly error_reason: Schema.NullOr<Schema.String>;
  readonly error_message: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly finished_at: Schema.NullOr<Schema.String>;
}>;
type TriggerDeliveryRecord = typeof TriggerDeliveryRecord.Type;
declare const TriggerReplayBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly delivery_id: Schema.NonEmptyString;
  readonly reason: Schema.optional<Schema.String>;
}>;
type TriggerReplayBody = typeof TriggerReplayBody.Type;
declare const TriggerPauseResumeBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly trigger_id: Schema.NonEmptyString;
}>;
type TriggerPauseResumeBody = typeof TriggerPauseResumeBody.Type;
declare const TriggerListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly status: Schema.optional<Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>>;
  readonly kind: Schema.optional<Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type TriggerListBody = typeof TriggerListBody.Type;
declare const TriggerListResponse: Schema.Struct<{
  readonly triggers: Schema.$Array<Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly name: Schema.String;
    readonly description: Schema.NullOr<Schema.String>;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
    readonly target_job_name: Schema.String;
    readonly target_version_name: Schema.String;
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
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly activated_at: Schema.NullOr<Schema.String>;
    readonly paused_at: Schema.NullOr<Schema.String>;
    readonly disabled_at: Schema.NullOr<Schema.String>;
  }>>;
  readonly count: Schema.Number;
}>;
type TriggerListResponse = typeof TriggerListResponse.Type;
declare const TriggerGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly trigger_id: Schema.NonEmptyString;
}>;
type TriggerGetBody = typeof TriggerGetBody.Type;
declare const TriggerGetResponse: Schema.Struct<{
  readonly trigger: Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly name: Schema.String;
    readonly description: Schema.NullOr<Schema.String>;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
    readonly target_job_name: Schema.String;
    readonly target_version_name: Schema.String;
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
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly activated_at: Schema.NullOr<Schema.String>;
    readonly paused_at: Schema.NullOr<Schema.String>;
    readonly disabled_at: Schema.NullOr<Schema.String>;
  }>;
}>;
type TriggerGetResponse = typeof TriggerGetResponse.Type;
declare const TriggerActivateResponse: Schema.Struct<{
  readonly trigger: Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly name: Schema.String;
    readonly description: Schema.NullOr<Schema.String>;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
    readonly target_job_name: Schema.String;
    readonly target_version_name: Schema.String;
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
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly activated_at: Schema.NullOr<Schema.String>;
    readonly paused_at: Schema.NullOr<Schema.String>;
    readonly disabled_at: Schema.NullOr<Schema.String>;
  }>;
}>;
type TriggerActivateResponse = typeof TriggerActivateResponse.Type;
declare const TriggerStatusUpdateResponse: Schema.Struct<{
  readonly trigger: Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly name: Schema.String;
    readonly description: Schema.NullOr<Schema.String>;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["draft", "active", "paused", "disabled", "failed"]>;
    readonly target_job_name: Schema.String;
    readonly target_version_name: Schema.String;
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
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly activated_at: Schema.NullOr<Schema.String>;
    readonly paused_at: Schema.NullOr<Schema.String>;
    readonly disabled_at: Schema.NullOr<Schema.String>;
  }>;
}>;
type TriggerStatusUpdateResponse = typeof TriggerStatusUpdateResponse.Type;
declare const TriggerDeliveriesListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly trigger_id: Schema.optional<Schema.NonEmptyString>;
  readonly status: Schema.optional<Schema.Literals<readonly ["queued", "claimed", "running", "completed", "failed", "skipped", "cancelled", "dead_lettered"]>>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type TriggerDeliveriesListBody = typeof TriggerDeliveriesListBody.Type;
declare const TriggerDeliveriesListResponse: Schema.Struct<{
  readonly deliveries: Schema.$Array<Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly trigger_id: Schema.NonEmptyString;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["queued", "claimed", "running", "completed", "failed", "skipped", "cancelled", "dead_lettered"]>;
    readonly scheduled_for: Schema.NullOr<Schema.String>;
    readonly source_delivery_id: Schema.NullOr<Schema.String>;
    readonly idempotency_key: Schema.String;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly job_invocation_id: Schema.NullOr<Schema.String>;
    readonly attempt_count: Schema.Number;
    readonly next_attempt_at: Schema.NullOr<Schema.String>;
    readonly error_reason: Schema.NullOr<Schema.String>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
  }>>;
  readonly count: Schema.Number;
}>;
type TriggerDeliveriesListResponse = typeof TriggerDeliveriesListResponse.Type;
declare const TriggerDeliveryGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly delivery_id: Schema.NonEmptyString;
}>;
type TriggerDeliveryGetBody = typeof TriggerDeliveryGetBody.Type;
declare const TriggerDeliveryGetResponse: Schema.Struct<{
  readonly delivery: Schema.Struct<{
    readonly id: Schema.NonEmptyString;
    readonly workspace_id: Schema.String;
    readonly trigger_id: Schema.NonEmptyString;
    readonly kind: Schema.Literals<readonly ["schedule.cron", "schedule.once", "webhook.http"]>;
    readonly status: Schema.Literals<readonly ["queued", "claimed", "running", "completed", "failed", "skipped", "cancelled", "dead_lettered"]>;
    readonly scheduled_for: Schema.NullOr<Schema.String>;
    readonly source_delivery_id: Schema.NullOr<Schema.String>;
    readonly idempotency_key: Schema.String;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly job_invocation_id: Schema.NullOr<Schema.String>;
    readonly attempt_count: Schema.Number;
    readonly next_attempt_at: Schema.NullOr<Schema.String>;
    readonly error_reason: Schema.NullOr<Schema.String>;
    readonly error_message: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly finished_at: Schema.NullOr<Schema.String>;
  }>;
}>;
type TriggerDeliveryGetResponse = typeof TriggerDeliveryGetResponse.Type;
declare const TriggerLimitsGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type TriggerLimitsGetBody = typeof TriggerLimitsGetBody.Type;
declare const TriggerLimitsUpdateBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limits: Schema.Struct<{
    readonly max_active_triggers: Schema.optional<Schema.Number>;
    readonly max_active_schedules: Schema.optional<Schema.Number>;
    readonly max_due_per_tick: Schema.optional<Schema.Number>;
    readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
    readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
  }>;
}>;
type TriggerLimitsUpdateBody = typeof TriggerLimitsUpdateBody.Type;
declare const TriggerLimitsResponse: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly limits: Schema.Struct<{
    readonly max_active_triggers: Schema.optional<Schema.Number>;
    readonly max_active_schedules: Schema.optional<Schema.Number>;
    readonly max_due_per_tick: Schema.optional<Schema.Number>;
    readonly max_concurrent_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_cron_deliveries: Schema.optional<Schema.Number>;
    readonly max_concurrent_webhook_deliveries: Schema.optional<Schema.Number>;
    readonly min_cron_interval_seconds: Schema.optional<Schema.Number>;
    readonly max_event_bytes: Schema.optional<Schema.Number>;
  }>;
}>;
type TriggerLimitsResponse = typeof TriggerLimitsResponse.Type;
//#endregion
export { TriggerActivateBody, TriggerActivateResponse, TriggerActivationDraft, TriggerCheck, TriggerCheckStatus, TriggerConcurrencyOverflow, TriggerConcurrencyPolicy, TriggerConcurrencyScope, TriggerConfig, TriggerDeliveriesListBody, TriggerDeliveriesListResponse, TriggerDeliveryAttemptStatus, TriggerDeliveryGetBody, TriggerDeliveryGetResponse, TriggerDeliveryId, TriggerDeliveryRecord, TriggerDeliveryStatus, TriggerErrorReason, TriggerGetBody, TriggerGetResponse, TriggerId, TriggerIdempotencyPolicy, TriggerInputDeclarativeMapping, TriggerInputMapping, TriggerInputPassthroughMapping, TriggerInputSourceEventMapping, TriggerInspectBody, TriggerInspectResponse, TriggerKind, TriggerLimits, TriggerLimitsGetBody, TriggerLimitsResponse, TriggerLimitsUpdateBody, TriggerListBody, TriggerListResponse, TriggerMisfireStrategy, TriggerOnceScheduleSpec, TriggerPauseResumeBody, TriggerRecord, TriggerReplayBody, TriggerRequiredSetup, TriggerRetentionPolicy, TriggerRetryPolicy, TriggerScheduleCatchUp, TriggerScheduleSpec, TriggerScheduleSpecWithKind, TriggerSetupKind, TriggerSourceConfig, TriggerSourceKind, TriggerStatus, TriggerStatusUpdateResponse, TriggerTargetJobRef, TriggerWebhookEventType, TriggerWebhookIdempotency, TriggerWebhookSignedPayloadPart, TriggerWebhookSpec, TriggerWebhookVerification, TriggerableJobEventBinding, TriggerableJobManifest };
//# sourceMappingURL=trigger.d.mts.map