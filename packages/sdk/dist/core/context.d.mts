import { Effect, Schema } from "effect";

//#region ../core-effect/src/scalars.d.ts
declare const Timestamp: Schema.String;
type Timestamp = typeof Timestamp.Type;
declare const WorkspaceId: Schema.String;
type WorkspaceId = typeof WorkspaceId.Type;
declare const SourceNamespace: Schema.String;
type SourceNamespace = typeof SourceNamespace.Type;
//#endregion
//#region ../core-effect/src/context.d.ts
declare const CONTEXT_TRACE_POLL_INTERVAL_MS: number;
declare const CONTEXT_TRACE_MIN_CONSUME_GAP_MS: number;
declare const CONTEXT_FRESHNESS_TTL_MS: number;
declare const CONTEXT_WORKSPACE_INACTIVITY_STOP_MS: number;
declare const ContextEntityId: Schema.NonEmptyString;
type ContextEntityId = typeof ContextEntityId.Type;
declare const ContextEntityKind: Schema.Literals<readonly ["workspace", "plugin_namespace", "topic_join", "team_member", "run_evidence"]>;
type ContextEntityKind = typeof ContextEntityKind.Type;
declare const ContextEntityStatus: Schema.Literals<readonly ["active", "partial", "blocked", "stale", "inactive"]>;
type ContextEntityStatus = typeof ContextEntityStatus.Type;
declare const ContextConfidence: Schema.Literals<readonly ["high", "medium", "low"]>;
type ContextConfidence = typeof ContextConfidence.Type;
declare const ContextProfileValue: Schema.Union<readonly [Schema.String, Schema.Number, Schema.Boolean, Schema.$Array<Schema.String>, Schema.Null]>;
type ContextProfileValue = typeof ContextProfileValue.Type;
declare const ContextProfileKv: Schema.Struct<{
  readonly key: Schema.NonEmptyString;
  readonly value: Schema.Union<readonly [Schema.String, Schema.Number, Schema.Boolean, Schema.$Array<Schema.String>, Schema.Null]>;
  readonly evidence: Schema.optional<Schema.String>;
  readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
}>;
type ContextProfileKv = typeof ContextProfileKv.Type;
declare const ContextQueryPath: Schema.Struct<{
  readonly intent: Schema.NonEmptyString;
  readonly tool: Schema.NonEmptyString;
  readonly when_to_use: Schema.String;
  readonly required_inputs: Schema.$Array<Schema.String>;
  readonly read_only: Schema.Boolean;
}>;
type ContextQueryPath = typeof ContextQueryPath.Type;
declare const ContextEvidenceRef: Schema.Struct<{
  readonly kind: Schema.Literals<readonly ["path", "run_id", "trace_window", "url"]>;
  readonly value: Schema.NonEmptyString;
}>;
type ContextEvidenceRef = typeof ContextEvidenceRef.Type;
declare const ContextSourceMetadata: Schema.Struct<{
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly namespace: Schema.String;
  readonly status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly catalog_category: Schema.optional<Schema.String>;
  readonly auth_method: Schema.optional<Schema.String>;
  readonly refreshed_at: Schema.String;
}>;
type ContextSourceMetadata = typeof ContextSourceMetadata.Type;
declare const ContextRefreshPolicy: Schema.Struct<{
  readonly auto_refresh: Schema.Boolean;
  readonly freshness_ttl_ms: Schema.Number;
  readonly trace_poll_interval_ms: Schema.Number;
  readonly min_trace_consume_gap_ms: Schema.Number;
  readonly stop_if_no_traces_for_ms: Schema.Number;
}>;
type ContextRefreshPolicy = typeof ContextRefreshPolicy.Type;
declare const DefaultContextRefreshPolicy: {
  readonly auto_refresh: boolean;
  readonly freshness_ttl_ms: number;
  readonly trace_poll_interval_ms: number;
  readonly min_trace_consume_gap_ms: number;
  readonly stop_if_no_traces_for_ms: number;
};
declare const ContextConsumptionState: Schema.Struct<{
  readonly last_trace_consumed_at: Schema.optional<Schema.String>;
  readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
  readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
  readonly last_trace_cursor: Schema.optional<Schema.String>;
  readonly last_user_activity_at: Schema.optional<Schema.String>;
  readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
}>;
type ContextConsumptionState = typeof ContextConsumptionState.Type;
declare const ContextEntity: Schema.Struct<{
  readonly entity_id: Schema.NonEmptyString;
  readonly kind: Schema.Literals<readonly ["workspace", "plugin_namespace", "topic_join", "team_member", "run_evidence"]>;
  readonly workspace_id: Schema.String;
  readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly title: Schema.NonEmptyString;
  readonly status: Schema.Literals<readonly ["active", "partial", "blocked", "stale", "inactive"]>;
  readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
  readonly profile_kv: Schema.$Array<Schema.Struct<{
    readonly key: Schema.NonEmptyString;
    readonly value: Schema.Union<readonly [Schema.String, Schema.Number, Schema.Boolean, Schema.$Array<Schema.String>, Schema.Null]>;
    readonly evidence: Schema.optional<Schema.String>;
    readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
  }>>;
  readonly query_paths: Schema.$Array<Schema.Struct<{
    readonly intent: Schema.NonEmptyString;
    readonly tool: Schema.NonEmptyString;
    readonly when_to_use: Schema.String;
    readonly required_inputs: Schema.$Array<Schema.String>;
    readonly read_only: Schema.Boolean;
  }>>;
  readonly evidence: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literals<readonly ["path", "run_id", "trace_window", "url"]>;
    readonly value: Schema.NonEmptyString;
  }>>;
  readonly related_entity_ids: Schema.$Array<Schema.NonEmptyString>;
  readonly source_metadata: Schema.optional<Schema.Struct<{
    readonly source_id: Schema.optional<Schema.NonEmptyString>;
    readonly namespace: Schema.String;
    readonly status: Schema.String;
    readonly tool_count: Schema.optional<Schema.Number>;
    readonly catalog_category: Schema.optional<Schema.String>;
    readonly auth_method: Schema.optional<Schema.String>;
    readonly refreshed_at: Schema.String;
  }>>;
  readonly refresh_policy: Schema.Struct<{
    readonly auto_refresh: Schema.Boolean;
    readonly freshness_ttl_ms: Schema.Number;
    readonly trace_poll_interval_ms: Schema.Number;
    readonly min_trace_consume_gap_ms: Schema.Number;
    readonly stop_if_no_traces_for_ms: Schema.Number;
  }>;
  readonly consumption_state: Schema.Struct<{
    readonly last_trace_consumed_at: Schema.optional<Schema.String>;
    readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
    readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
    readonly last_trace_cursor: Schema.optional<Schema.String>;
    readonly last_user_activity_at: Schema.optional<Schema.String>;
    readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
  }>;
  readonly updated_at: Schema.String;
}>;
type ContextEntity = typeof ContextEntity.Type;
declare const ContextMachineState: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
  readonly entities: Schema.$Record<Schema.String, Schema.Struct<{
    readonly entity_id: Schema.NonEmptyString;
    readonly kind: Schema.Literals<readonly ["workspace", "plugin_namespace", "topic_join", "team_member", "run_evidence"]>;
    readonly workspace_id: Schema.String;
    readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
    readonly namespace: Schema.optional<Schema.String>;
    readonly title: Schema.NonEmptyString;
    readonly status: Schema.Literals<readonly ["active", "partial", "blocked", "stale", "inactive"]>;
    readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
    readonly profile_kv: Schema.$Array<Schema.Struct<{
      readonly key: Schema.NonEmptyString;
      readonly value: Schema.Union<readonly [Schema.String, Schema.Number, Schema.Boolean, Schema.$Array<Schema.String>, Schema.Null]>;
      readonly evidence: Schema.optional<Schema.String>;
      readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
    }>>;
    readonly query_paths: Schema.$Array<Schema.Struct<{
      readonly intent: Schema.NonEmptyString;
      readonly tool: Schema.NonEmptyString;
      readonly when_to_use: Schema.String;
      readonly required_inputs: Schema.$Array<Schema.String>;
      readonly read_only: Schema.Boolean;
    }>>;
    readonly evidence: Schema.$Array<Schema.Struct<{
      readonly kind: Schema.Literals<readonly ["path", "run_id", "trace_window", "url"]>;
      readonly value: Schema.NonEmptyString;
    }>>;
    readonly related_entity_ids: Schema.$Array<Schema.NonEmptyString>;
    readonly source_metadata: Schema.optional<Schema.Struct<{
      readonly source_id: Schema.optional<Schema.NonEmptyString>;
      readonly namespace: Schema.String;
      readonly status: Schema.String;
      readonly tool_count: Schema.optional<Schema.Number>;
      readonly catalog_category: Schema.optional<Schema.String>;
      readonly auth_method: Schema.optional<Schema.String>;
      readonly refreshed_at: Schema.String;
    }>>;
    readonly refresh_policy: Schema.Struct<{
      readonly auto_refresh: Schema.Boolean;
      readonly freshness_ttl_ms: Schema.Number;
      readonly trace_poll_interval_ms: Schema.Number;
      readonly min_trace_consume_gap_ms: Schema.Number;
      readonly stop_if_no_traces_for_ms: Schema.Number;
    }>;
    readonly consumption_state: Schema.Struct<{
      readonly last_trace_consumed_at: Schema.optional<Schema.String>;
      readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
      readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
      readonly last_trace_cursor: Schema.optional<Schema.String>;
      readonly last_user_activity_at: Schema.optional<Schema.String>;
      readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
    }>;
    readonly updated_at: Schema.String;
  }>>;
  readonly consumption_state: Schema.Struct<{
    readonly last_trace_consumed_at: Schema.optional<Schema.String>;
    readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
    readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
    readonly last_trace_cursor: Schema.optional<Schema.String>;
    readonly last_user_activity_at: Schema.optional<Schema.String>;
    readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
  }>;
  readonly updated_at: Schema.String;
}>;
type ContextMachineState = typeof ContextMachineState.Type;
declare const PluginNamespaceAddedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_added">;
  readonly workspace_id: Schema.String;
  readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly catalog_category: Schema.optional<Schema.String>;
  readonly auth_method: Schema.optional<Schema.String>;
  readonly occurred_at: Schema.String;
}>;
type PluginNamespaceAddedTrigger = typeof PluginNamespaceAddedTrigger.Type;
declare const PluginNamespaceReconnectedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_reconnected">;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly occurred_at: Schema.String;
}>;
type PluginNamespaceReconnectedTrigger = typeof PluginNamespaceReconnectedTrigger.Type;
declare const PluginNamespaceInstanceRefreshedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_instance_refreshed">;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly occurred_at: Schema.String;
}>;
type PluginNamespaceInstanceRefreshedTrigger = typeof PluginNamespaceInstanceRefreshedTrigger.Type;
declare const TraceWindowObservedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"trace_window_observed">;
  readonly workspace_id: Schema.String;
  readonly observed_at: Schema.String;
  readonly window_start_utc: Schema.String;
  readonly window_end_utc: Schema.String;
  readonly new_trace_count: Schema.Number;
  readonly run_ids: Schema.$Array<Schema.String>;
}>;
type TraceWindowObservedTrigger = typeof TraceWindowObservedTrigger.Type;
declare const ManualContextRefreshRequestedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"manual_context_refresh_requested">;
  readonly workspace_id: Schema.String;
  readonly requested_at: Schema.String;
  readonly scope: Schema.Literals<readonly ["workspace", "namespace"]>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly requested_by: Schema.optional<Schema.NonEmptyString>;
  readonly reason: Schema.optional<Schema.String>;
}>;
type ManualContextRefreshRequestedTrigger = typeof ManualContextRefreshRequestedTrigger.Type;
declare const TeamMemberAddedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"team_member_added">;
  readonly workspace_id: Schema.String;
  readonly member_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly email: Schema.optional<Schema.String>;
  readonly occurred_at: Schema.String;
}>;
type TeamMemberAddedTrigger = typeof TeamMemberAddedTrigger.Type;
declare const FreshnessExpiredTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"freshness_expired">;
  readonly workspace_id: Schema.String;
  readonly entity_id: Schema.NonEmptyString;
  readonly observed_at: Schema.String;
}>;
type FreshnessExpiredTrigger = typeof FreshnessExpiredTrigger.Type;
declare const WorkspaceInactivityObservedTrigger: Schema.Struct<{
  readonly kind: Schema.Literal<"workspace_inactivity_observed">;
  readonly workspace_id: Schema.String;
  readonly observed_at: Schema.String;
  readonly last_trace_at: Schema.optional<Schema.String>;
  readonly inactive_for_ms: Schema.Number;
}>;
type WorkspaceInactivityObservedTrigger = typeof WorkspaceInactivityObservedTrigger.Type;
declare const ContextTrigger: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_added">;
  readonly workspace_id: Schema.String;
  readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly catalog_category: Schema.optional<Schema.String>;
  readonly auth_method: Schema.optional<Schema.String>;
  readonly occurred_at: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_reconnected">;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly occurred_at: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"plugin_namespace_instance_refreshed">;
  readonly workspace_id: Schema.String;
  readonly namespace: Schema.String;
  readonly source_id: Schema.optional<Schema.NonEmptyString>;
  readonly source_status: Schema.String;
  readonly tool_count: Schema.optional<Schema.Number>;
  readonly occurred_at: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"trace_window_observed">;
  readonly workspace_id: Schema.String;
  readonly observed_at: Schema.String;
  readonly window_start_utc: Schema.String;
  readonly window_end_utc: Schema.String;
  readonly new_trace_count: Schema.Number;
  readonly run_ids: Schema.$Array<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"manual_context_refresh_requested">;
  readonly workspace_id: Schema.String;
  readonly requested_at: Schema.String;
  readonly scope: Schema.Literals<readonly ["workspace", "namespace"]>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly requested_by: Schema.optional<Schema.NonEmptyString>;
  readonly reason: Schema.optional<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"team_member_added">;
  readonly workspace_id: Schema.String;
  readonly member_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly email: Schema.optional<Schema.String>;
  readonly occurred_at: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"freshness_expired">;
  readonly workspace_id: Schema.String;
  readonly entity_id: Schema.NonEmptyString;
  readonly observed_at: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"workspace_inactivity_observed">;
  readonly workspace_id: Schema.String;
  readonly observed_at: Schema.String;
  readonly last_trace_at: Schema.optional<Schema.String>;
  readonly inactive_for_ms: Schema.Number;
}>]>;
type ContextTrigger = typeof ContextTrigger.Type;
declare const ContextCommand: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"create_or_refresh_namespace_entity">;
  readonly namespace: Schema.String;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"generate_namespace_profile">;
  readonly namespace: Schema.String;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"digest_trace_window">;
  readonly window_start_utc: Schema.String;
  readonly window_end_utc: Schema.String;
  readonly run_ids: Schema.$Array<Schema.String>;
  readonly read_only: Schema.Boolean;
  readonly allow_plugin_exec: Schema.Boolean;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"refresh_workspace_context">;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"refresh_namespace_context">;
  readonly namespace: Schema.String;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"refresh_affected_joins">;
  readonly entity_ids: Schema.$Array<Schema.NonEmptyString>;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"seed_team_member_queries">;
  readonly member_id: Schema.NonEmptyString;
  readonly name: Schema.NonEmptyString;
  readonly email: Schema.optional<Schema.String>;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"mark_entity_stale">;
  readonly entity_id: Schema.NonEmptyString;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"stop_auto_refresh">;
  readonly reason: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"noop">;
  readonly reason: Schema.String;
}>]>;
type ContextCommand = typeof ContextCommand.Type;
declare const ContextTransitionResult: Schema.Struct<{
  readonly state: Schema.Struct<{
    readonly workspace_id: Schema.String;
    readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
    readonly entities: Schema.$Record<Schema.String, Schema.Struct<{
      readonly entity_id: Schema.NonEmptyString;
      readonly kind: Schema.Literals<readonly ["workspace", "plugin_namespace", "topic_join", "team_member", "run_evidence"]>;
      readonly workspace_id: Schema.String;
      readonly workspace_slug: Schema.optional<Schema.NonEmptyString>;
      readonly namespace: Schema.optional<Schema.String>;
      readonly title: Schema.NonEmptyString;
      readonly status: Schema.Literals<readonly ["active", "partial", "blocked", "stale", "inactive"]>;
      readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
      readonly profile_kv: Schema.$Array<Schema.Struct<{
        readonly key: Schema.NonEmptyString;
        readonly value: Schema.Union<readonly [Schema.String, Schema.Number, Schema.Boolean, Schema.$Array<Schema.String>, Schema.Null]>;
        readonly evidence: Schema.optional<Schema.String>;
        readonly confidence: Schema.Literals<readonly ["high", "medium", "low"]>;
      }>>;
      readonly query_paths: Schema.$Array<Schema.Struct<{
        readonly intent: Schema.NonEmptyString;
        readonly tool: Schema.NonEmptyString;
        readonly when_to_use: Schema.String;
        readonly required_inputs: Schema.$Array<Schema.String>;
        readonly read_only: Schema.Boolean;
      }>>;
      readonly evidence: Schema.$Array<Schema.Struct<{
        readonly kind: Schema.Literals<readonly ["path", "run_id", "trace_window", "url"]>;
        readonly value: Schema.NonEmptyString;
      }>>;
      readonly related_entity_ids: Schema.$Array<Schema.NonEmptyString>;
      readonly source_metadata: Schema.optional<Schema.Struct<{
        readonly source_id: Schema.optional<Schema.NonEmptyString>;
        readonly namespace: Schema.String;
        readonly status: Schema.String;
        readonly tool_count: Schema.optional<Schema.Number>;
        readonly catalog_category: Schema.optional<Schema.String>;
        readonly auth_method: Schema.optional<Schema.String>;
        readonly refreshed_at: Schema.String;
      }>>;
      readonly refresh_policy: Schema.Struct<{
        readonly auto_refresh: Schema.Boolean;
        readonly freshness_ttl_ms: Schema.Number;
        readonly trace_poll_interval_ms: Schema.Number;
        readonly min_trace_consume_gap_ms: Schema.Number;
        readonly stop_if_no_traces_for_ms: Schema.Number;
      }>;
      readonly consumption_state: Schema.Struct<{
        readonly last_trace_consumed_at: Schema.optional<Schema.String>;
        readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
        readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
        readonly last_trace_cursor: Schema.optional<Schema.String>;
        readonly last_user_activity_at: Schema.optional<Schema.String>;
        readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
      }>;
      readonly updated_at: Schema.String;
    }>>;
    readonly consumption_state: Schema.Struct<{
      readonly last_trace_consumed_at: Schema.optional<Schema.String>;
      readonly last_trace_window_start_utc: Schema.optional<Schema.String>;
      readonly last_trace_window_end_utc: Schema.optional<Schema.String>;
      readonly last_trace_cursor: Schema.optional<Schema.String>;
      readonly last_user_activity_at: Schema.optional<Schema.String>;
      readonly auto_refresh_stopped_at: Schema.optional<Schema.String>;
    }>;
    readonly updated_at: Schema.String;
  }>;
  readonly commands: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"create_or_refresh_namespace_entity">;
    readonly namespace: Schema.String;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"generate_namespace_profile">;
    readonly namespace: Schema.String;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"digest_trace_window">;
    readonly window_start_utc: Schema.String;
    readonly window_end_utc: Schema.String;
    readonly run_ids: Schema.$Array<Schema.String>;
    readonly read_only: Schema.Boolean;
    readonly allow_plugin_exec: Schema.Boolean;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"refresh_workspace_context">;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"refresh_namespace_context">;
    readonly namespace: Schema.String;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"refresh_affected_joins">;
    readonly entity_ids: Schema.$Array<Schema.NonEmptyString>;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"seed_team_member_queries">;
    readonly member_id: Schema.NonEmptyString;
    readonly name: Schema.NonEmptyString;
    readonly email: Schema.optional<Schema.String>;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"mark_entity_stale">;
    readonly entity_id: Schema.NonEmptyString;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"stop_auto_refresh">;
    readonly reason: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"noop">;
    readonly reason: Schema.String;
  }>]>>;
  readonly receipts: Schema.$Array<Schema.String>;
}>;
type ContextTransitionResult = typeof ContextTransitionResult.Type;
declare function makeContextEntityId(workspaceId: WorkspaceId, kind: ContextEntityKind, namespace?: SourceNamespace): ContextEntityId;
declare function makeInitialContextMachineState(input: {
  readonly workspace_id: WorkspaceId;
  readonly workspace_slug?: string | undefined;
  readonly now: Timestamp;
}): ContextMachineState;
declare function applyContextTrigger(state: ContextMachineState, trigger: ContextTrigger): Effect.Effect<ContextTransitionResult>;
declare function applyContextTriggerSync(state: ContextMachineState, trigger: ContextTrigger): ContextTransitionResult;
//#endregion
export { CONTEXT_FRESHNESS_TTL_MS, CONTEXT_TRACE_MIN_CONSUME_GAP_MS, CONTEXT_TRACE_POLL_INTERVAL_MS, CONTEXT_WORKSPACE_INACTIVITY_STOP_MS, ContextCommand, ContextConfidence, ContextConsumptionState, ContextEntity, ContextEntityId, ContextEntityKind, ContextEntityStatus, ContextEvidenceRef, ContextMachineState, ContextProfileKv, ContextProfileValue, ContextQueryPath, ContextRefreshPolicy, ContextSourceMetadata, ContextTransitionResult, ContextTrigger, DefaultContextRefreshPolicy, FreshnessExpiredTrigger, ManualContextRefreshRequestedTrigger, PluginNamespaceAddedTrigger, PluginNamespaceInstanceRefreshedTrigger, PluginNamespaceReconnectedTrigger, TeamMemberAddedTrigger, TraceWindowObservedTrigger, WorkspaceInactivityObservedTrigger, applyContextTrigger, applyContextTriggerSync, makeContextEntityId, makeInitialContextMachineState };
//# sourceMappingURL=context.d.mts.map