import { Effect, Schema, SchemaGetter } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
const UserId = Schema.NonEmptyString;
Schema.NonEmptyString;
const RunId = Schema.String.check(Schema.isUUID());
const SourceId = Schema.NonEmptyString;
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
//#region ../core-effect/src/context.ts
const CONTEXT_TRACE_POLL_INTERVAL_MS = 360 * 60 * 1e3;
const CONTEXT_TRACE_MIN_CONSUME_GAP_MS = 300 * 60 * 1e3;
const CONTEXT_FRESHNESS_TTL_MS = 10080 * 60 * 1e3;
const CONTEXT_WORKSPACE_INACTIVITY_STOP_MS = 7200 * 60 * 1e3;
const ContextEntityId = Schema.NonEmptyString;
const ContextEntityKind = Schema.Literals([
	"workspace",
	"plugin_namespace",
	"topic_join",
	"team_member",
	"run_evidence"
]);
const ContextEntityStatus = Schema.Literals([
	"active",
	"partial",
	"blocked",
	"stale",
	"inactive"
]);
const ContextConfidence = Schema.Literals([
	"high",
	"medium",
	"low"
]);
const ContextProfileValue = Schema.Union([
	Schema.String,
	Schema.Number,
	Schema.Boolean,
	Schema.Array(Schema.String),
	Schema.Null
]);
const ContextProfileKv = Schema.Struct({
	key: Schema.NonEmptyString,
	value: ContextProfileValue,
	evidence: Schema.optional(Schema.String),
	confidence: ContextConfidence
});
const ContextQueryPath = Schema.Struct({
	intent: Schema.NonEmptyString,
	tool: Schema.NonEmptyString,
	when_to_use: Schema.String,
	required_inputs: Schema.Array(Schema.String),
	read_only: Schema.Boolean
});
const ContextEvidenceRef = Schema.Struct({
	kind: Schema.Literals([
		"path",
		"run_id",
		"trace_window",
		"url"
	]),
	value: Schema.NonEmptyString
});
const ContextSourceMetadata = Schema.Struct({
	source_id: Schema.optional(SourceId),
	namespace: SourceNamespace,
	status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	catalog_category: Schema.optional(Schema.String),
	auth_method: Schema.optional(Schema.String),
	refreshed_at: Timestamp
});
const ContextRefreshPolicy = Schema.Struct({
	auto_refresh: Schema.Boolean,
	freshness_ttl_ms: Schema.Number,
	trace_poll_interval_ms: Schema.Number,
	min_trace_consume_gap_ms: Schema.Number,
	stop_if_no_traces_for_ms: Schema.Number
});
const DefaultContextRefreshPolicy = Schema.decodeUnknownSync(ContextRefreshPolicy)({
	auto_refresh: true,
	freshness_ttl_ms: CONTEXT_FRESHNESS_TTL_MS,
	trace_poll_interval_ms: CONTEXT_TRACE_POLL_INTERVAL_MS,
	min_trace_consume_gap_ms: CONTEXT_TRACE_MIN_CONSUME_GAP_MS,
	stop_if_no_traces_for_ms: CONTEXT_WORKSPACE_INACTIVITY_STOP_MS
});
const ContextConsumptionState = Schema.Struct({
	last_trace_consumed_at: Schema.optional(Timestamp),
	last_trace_window_start_utc: Schema.optional(Timestamp),
	last_trace_window_end_utc: Schema.optional(Timestamp),
	last_trace_cursor: Schema.optional(Schema.String),
	last_user_activity_at: Schema.optional(Timestamp),
	auto_refresh_stopped_at: Schema.optional(Timestamp)
});
const ContextEntity = Schema.Struct({
	entity_id: ContextEntityId,
	kind: ContextEntityKind,
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	namespace: Schema.optional(SourceNamespace),
	title: Schema.NonEmptyString,
	status: ContextEntityStatus,
	confidence: ContextConfidence,
	profile_kv: Schema.Array(ContextProfileKv),
	query_paths: Schema.Array(ContextQueryPath),
	evidence: Schema.Array(ContextEvidenceRef),
	related_entity_ids: Schema.Array(ContextEntityId),
	source_metadata: Schema.optional(ContextSourceMetadata),
	refresh_policy: ContextRefreshPolicy,
	consumption_state: ContextConsumptionState,
	updated_at: Timestamp
});
const ContextMachineState = Schema.Struct({
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	entities: Schema.Record(Schema.String, ContextEntity),
	consumption_state: ContextConsumptionState,
	updated_at: Timestamp
});
const PluginNamespaceAddedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_added"),
	workspace_id: WorkspaceId,
	workspace_slug: Schema.optional(Schema.NonEmptyString),
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	catalog_category: Schema.optional(Schema.String),
	auth_method: Schema.optional(Schema.String),
	occurred_at: Timestamp
});
const PluginNamespaceReconnectedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_reconnected"),
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	occurred_at: Timestamp
});
const PluginNamespaceInstanceRefreshedTrigger = Schema.Struct({
	kind: Schema.Literal("plugin_namespace_instance_refreshed"),
	workspace_id: WorkspaceId,
	namespace: SourceNamespace,
	source_id: Schema.optional(SourceId),
	source_status: Schema.String,
	tool_count: Schema.optional(Schema.Number),
	occurred_at: Timestamp
});
const TraceWindowObservedTrigger = Schema.Struct({
	kind: Schema.Literal("trace_window_observed"),
	workspace_id: WorkspaceId,
	observed_at: Timestamp,
	window_start_utc: Timestamp,
	window_end_utc: Timestamp,
	new_trace_count: Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)),
	run_ids: Schema.Array(RunId)
});
const ManualContextRefreshRequestedTrigger = Schema.Struct({
	kind: Schema.Literal("manual_context_refresh_requested"),
	workspace_id: WorkspaceId,
	requested_at: Timestamp,
	scope: Schema.Literals(["workspace", "namespace"]),
	namespace: Schema.optional(SourceNamespace),
	requested_by: Schema.optional(UserId),
	reason: Schema.optional(Schema.String)
});
const TeamMemberAddedTrigger = Schema.Struct({
	kind: Schema.Literal("team_member_added"),
	workspace_id: WorkspaceId,
	member_id: UserId,
	name: Schema.NonEmptyString,
	email: Schema.optional(Schema.String),
	occurred_at: Timestamp
});
const FreshnessExpiredTrigger = Schema.Struct({
	kind: Schema.Literal("freshness_expired"),
	workspace_id: WorkspaceId,
	entity_id: ContextEntityId,
	observed_at: Timestamp
});
const WorkspaceInactivityObservedTrigger = Schema.Struct({
	kind: Schema.Literal("workspace_inactivity_observed"),
	workspace_id: WorkspaceId,
	observed_at: Timestamp,
	last_trace_at: Schema.optional(Timestamp),
	inactive_for_ms: Schema.Number.check(Schema.isGreaterThanOrEqualTo(0))
});
const ContextTrigger = Schema.Union([
	PluginNamespaceAddedTrigger,
	PluginNamespaceReconnectedTrigger,
	PluginNamespaceInstanceRefreshedTrigger,
	TraceWindowObservedTrigger,
	ManualContextRefreshRequestedTrigger,
	TeamMemberAddedTrigger,
	FreshnessExpiredTrigger,
	WorkspaceInactivityObservedTrigger
]);
const ContextCommand = Schema.Union([
	Schema.Struct({
		kind: Schema.Literal("create_or_refresh_namespace_entity"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("generate_namespace_profile"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("digest_trace_window"),
		window_start_utc: Timestamp,
		window_end_utc: Timestamp,
		run_ids: Schema.Array(RunId),
		read_only: Schema.Boolean,
		allow_plugin_exec: Schema.Boolean
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_workspace_context"),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_namespace_context"),
		namespace: SourceNamespace,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("refresh_affected_joins"),
		entity_ids: Schema.Array(ContextEntityId),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("seed_team_member_queries"),
		member_id: UserId,
		name: Schema.NonEmptyString,
		email: Schema.optional(Schema.String)
	}),
	Schema.Struct({
		kind: Schema.Literal("mark_entity_stale"),
		entity_id: ContextEntityId,
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("stop_auto_refresh"),
		reason: Schema.String
	}),
	Schema.Struct({
		kind: Schema.Literal("noop"),
		reason: Schema.String
	})
]);
const ContextTransitionResult = Schema.Struct({
	state: ContextMachineState,
	commands: Schema.Array(ContextCommand),
	receipts: Schema.Array(Schema.String)
});
function makeContextEntityId(workspaceId, kind, namespace) {
	return namespace ? workspaceId + ":" + kind + ":" + namespace : workspaceId + ":" + kind;
}
function makeInitialContextMachineState(input) {
	return {
		workspace_id: input.workspace_id,
		workspace_slug: input.workspace_slug,
		entities: {},
		consumption_state: {},
		updated_at: input.now
	};
}
function applyContextTrigger(state, trigger) {
	return Effect.sync(() => applyContextTriggerSync(state, trigger));
}
function applyContextTriggerSync(state, trigger) {
	switch (trigger.kind) {
		case "plugin_namespace_added": return upsertNamespaceEntity(state, trigger, "plugin namespace added");
		case "plugin_namespace_reconnected": return upsertNamespaceEntity(state, trigger, "plugin namespace reconnected");
		case "plugin_namespace_instance_refreshed": return upsertNamespaceEntity(state, trigger, "plugin namespace instance refreshed");
		case "trace_window_observed": return observeTraceWindow(state, trigger);
		case "manual_context_refresh_requested": return requestManualRefresh(state, trigger);
		case "team_member_added": return addTeamMember(state, trigger);
		case "freshness_expired": return expireFreshness(state, trigger);
		case "workspace_inactivity_observed": return observeWorkspaceInactivity(state, trigger);
		default: throw new Error("Unsupported context trigger kind");
	}
}
function upsertNamespaceEntity(state, trigger, reason) {
	const entityId = makeContextEntityId(trigger.workspace_id, "plugin_namespace", trigger.namespace);
	const prior = state.entities[entityId];
	const sourceMetadata = {
		source_id: trigger.source_id,
		namespace: trigger.namespace,
		status: trigger.source_status,
		tool_count: trigger.tool_count,
		catalog_category: trigger.kind === "plugin_namespace_added" ? trigger.catalog_category : prior?.source_metadata?.catalog_category,
		auth_method: trigger.kind === "plugin_namespace_added" ? trigger.auth_method : prior?.source_metadata?.auth_method,
		refreshed_at: trigger.occurred_at
	};
	return {
		state: putEntity(state, {
			entity_id: entityId,
			kind: "plugin_namespace",
			workspace_id: trigger.workspace_id,
			workspace_slug: trigger.kind === "plugin_namespace_added" ? trigger.workspace_slug : prior?.workspace_slug,
			namespace: trigger.namespace,
			title: prior?.title ?? trigger.namespace + " context",
			status: trigger.source_status === "ready" ? "active" : "partial",
			confidence: prior?.confidence ?? "medium",
			profile_kv: prior?.profile_kv ?? [],
			query_paths: prior?.query_paths ?? [],
			evidence: prior?.evidence ?? [],
			related_entity_ids: prior?.related_entity_ids ?? [],
			source_metadata: sourceMetadata,
			refresh_policy: prior?.refresh_policy ?? DefaultContextRefreshPolicy,
			consumption_state: prior?.consumption_state ?? {},
			updated_at: trigger.occurred_at
		}, trigger.occurred_at),
		commands: [
			{
				kind: "create_or_refresh_namespace_entity",
				namespace: trigger.namespace,
				reason
			},
			{
				kind: "generate_namespace_profile",
				namespace: trigger.namespace,
				reason: "metadata changed; regenerate generalized 2-5 profile kv facts"
			},
			{
				kind: "refresh_affected_joins",
				entity_ids: [entityId],
				reason: "namespace metadata changed"
			}
		],
		receipts: [trigger.namespace + ": " + reason]
	};
}
function observeTraceWindow(state, trigger) {
	if (trigger.new_trace_count === 0) return noChange(state, trigger.observed_at, "trace window has no new traces");
	if (!isTraceConsumeGapSatisfied(state.consumption_state.last_trace_consumed_at, trigger.observed_at)) return noChange(state, trigger.observed_at, "trace digest skipped; last consumption is within 5h");
	return {
		state: {
			...state,
			consumption_state: {
				...state.consumption_state,
				last_trace_consumed_at: trigger.observed_at,
				last_trace_window_start_utc: trigger.window_start_utc,
				last_trace_window_end_utc: trigger.window_end_utc
			},
			updated_at: trigger.observed_at
		},
		commands: [{
			kind: "digest_trace_window",
			window_start_utc: trigger.window_start_utc,
			window_end_utc: trigger.window_end_utc,
			run_ids: trigger.run_ids,
			read_only: true,
			allow_plugin_exec: false
		}],
		receipts: ["trace window queued: " + String(trigger.new_trace_count) + " new traces from " + trigger.window_start_utc + " to " + trigger.window_end_utc]
	};
}
function requestManualRefresh(state, trigger) {
	if (trigger.scope === "namespace") {
		if (!trigger.namespace) return noChange(state, trigger.requested_at, "namespace refresh requested without namespace");
		return {
			state: {
				...state,
				updated_at: trigger.requested_at
			},
			commands: [{
				kind: "refresh_namespace_context",
				namespace: trigger.namespace,
				reason: trigger.reason ?? "manual namespace context refresh"
			}, {
				kind: "generate_namespace_profile",
				namespace: trigger.namespace,
				reason: "manual namespace context refresh"
			}],
			receipts: ["manual namespace refresh requested for " + trigger.namespace]
		};
	}
	return {
		state: {
			...state,
			updated_at: trigger.requested_at
		},
		commands: [{
			kind: "refresh_workspace_context",
			reason: trigger.reason ?? "manual workspace context refresh"
		}],
		receipts: ["manual workspace refresh requested"]
	};
}
function addTeamMember(state, trigger) {
	const entityId = trigger.workspace_id + ":team_member:" + trigger.member_id;
	const profileKv = [{
		key: "name",
		value: trigger.name,
		confidence: "high"
	}];
	if (trigger.email) profileKv.push({
		key: "email",
		value: trigger.email,
		confidence: "high"
	});
	return {
		state: putEntity(state, {
			entity_id: entityId,
			kind: "team_member",
			workspace_id: trigger.workspace_id,
			title: trigger.name,
			status: "active",
			confidence: "high",
			profile_kv: profileKv,
			query_paths: [],
			evidence: [],
			related_entity_ids: [],
			refresh_policy: DefaultContextRefreshPolicy,
			consumption_state: {},
			updated_at: trigger.occurred_at
		}, trigger.occurred_at),
		commands: [{
			kind: "seed_team_member_queries",
			member_id: trigger.member_id,
			name: trigger.name,
			email: trigger.email
		}, {
			kind: "refresh_workspace_context",
			reason: "team member added; refresh workspace namespace context with member seed"
		}],
		receipts: ["team member added: " + trigger.name]
	};
}
function expireFreshness(state, trigger) {
	const entity = state.entities[trigger.entity_id];
	if (!entity) return noChange(state, trigger.observed_at, "freshness expired for unknown entity");
	return {
		state: putEntity(state, {
			...entity,
			status: "stale",
			updated_at: trigger.observed_at
		}, trigger.observed_at),
		commands: [{
			kind: "mark_entity_stale",
			entity_id: trigger.entity_id,
			reason: "freshness ttl expired"
		}],
		receipts: ["entity marked stale: " + trigger.entity_id]
	};
}
function observeWorkspaceInactivity(state, trigger) {
	if (trigger.inactive_for_ms < 432e6) return noChange(state, trigger.observed_at, "workspace still active enough for auto refresh");
	return {
		state: {
			...state,
			consumption_state: {
				...state.consumption_state,
				auto_refresh_stopped_at: trigger.observed_at
			},
			updated_at: trigger.observed_at
		},
		commands: [{
			kind: "stop_auto_refresh",
			reason: "no traces generated for at least 5 days"
		}],
		receipts: ["workspace auto refresh stopped for inactivity"]
	};
}
function putEntity(state, entity, updatedAt) {
	return {
		...state,
		entities: {
			...state.entities,
			[entity.entity_id]: entity
		},
		updated_at: updatedAt
	};
}
function noChange(state, observedAt, reason) {
	return {
		state: {
			...state,
			updated_at: observedAt
		},
		commands: [{
			kind: "noop",
			reason
		}],
		receipts: [reason]
	};
}
function isTraceConsumeGapSatisfied(lastTraceConsumedAt, observedAt) {
	if (!lastTraceConsumedAt) return true;
	return Date.parse(observedAt) - Date.parse(lastTraceConsumedAt) >= CONTEXT_TRACE_MIN_CONSUME_GAP_MS;
}
//#endregion
export { CONTEXT_FRESHNESS_TTL_MS, CONTEXT_TRACE_MIN_CONSUME_GAP_MS, CONTEXT_TRACE_POLL_INTERVAL_MS, CONTEXT_WORKSPACE_INACTIVITY_STOP_MS, ContextCommand, ContextConfidence, ContextConsumptionState, ContextEntity, ContextEntityId, ContextEntityKind, ContextEntityStatus, ContextEvidenceRef, ContextMachineState, ContextProfileKv, ContextProfileValue, ContextQueryPath, ContextRefreshPolicy, ContextSourceMetadata, ContextTransitionResult, ContextTrigger, DefaultContextRefreshPolicy, FreshnessExpiredTrigger, ManualContextRefreshRequestedTrigger, PluginNamespaceAddedTrigger, PluginNamespaceInstanceRefreshedTrigger, PluginNamespaceReconnectedTrigger, TeamMemberAddedTrigger, TraceWindowObservedTrigger, WorkspaceInactivityObservedTrigger, applyContextTrigger, applyContextTriggerSync, makeContextEntityId, makeInitialContextMachineState };

//# sourceMappingURL=context.mjs.map