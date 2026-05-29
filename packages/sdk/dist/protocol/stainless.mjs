//#region ../protocol/src/openapi.ts
const HARBOR_OPENAPI_VERSION = "1.0.0";
const HARBOR_OPENAPI_PATH = "/openapi/harbor.v1.json";
const HARBOR_OPENAPI_ALIAS_PATH = "/openapi.json";
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const objectSchema = (properties, required = [], extra = {}) => ({
	type: "object",
	additionalProperties: false,
	properties,
	...required.length > 0 ? { required: [...required] } : {},
	...extra
});
const stringEnum = (values) => ({
	type: "string",
	enum: [...values]
});
const nullable = (schema) => ({ anyOf: [schema, { type: "null" }] });
const jsonValueSchema = { description: "Arbitrary JSON value." };
const harborProtocolOperations = [
	{
		operationId: "getHealth",
		method: "get",
		path: "/health",
		tags: ["Health"],
		summary: "Read the shallow Harbor API health status.",
		auth: "none",
		responseSchemaName: "HealthResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getV1Health",
		method: "get",
		path: "/v1/health",
		tags: ["Health"],
		summary: "Read the shallow Harbor API health status through the v1 compatibility path.",
		auth: "none",
		responseSchemaName: "HealthResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHealthz",
		method: "get",
		path: "/healthz",
		tags: ["Health"],
		summary: "Read the deep Harbor API health status including D1 migration readiness.",
		auth: "none",
		responseSchemaName: "HealthzResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getV1Healthz",
		method: "get",
		path: "/v1/healthz",
		tags: ["Health"],
		summary: "Read the deep Harbor API health status through the v1 compatibility path.",
		auth: "none",
		responseSchemaName: "HealthzResponse",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHarborWellKnown",
		method: "get",
		path: "/.well-known/harbor.json",
		tags: ["Discovery"],
		summary: "Read Harbor service discovery metadata.",
		auth: "none",
		responseSchemaName: "WellKnownHarbor",
		responseEnvelope: "direct"
	},
	{
		operationId: "getWellKnownIndex",
		method: "get",
		path: "/.well-known/index.json",
		tags: ["Discovery"],
		summary: "Read the Harbor well-known index.",
		auth: "none",
		responseSchemaName: "WellKnownIndex",
		responseEnvelope: "direct"
	},
	{
		operationId: "getHarborOpenApi",
		method: "get",
		path: HARBOR_OPENAPI_PATH,
		tags: ["Discovery"],
		summary: "Read the first-party Harbor OpenAPI document.",
		auth: "none",
		responseSchemaName: "OpenApiDocument",
		responseEnvelope: "direct"
	},
	{
		operationId: "getOpenApiJson",
		method: "get",
		path: HARBOR_OPENAPI_ALIAS_PATH,
		tags: ["Discovery"],
		summary: "Read the first-party Harbor OpenAPI document through the conventional alias.",
		description: "Compatibility alias for generic OpenAPI tooling. The canonical Harbor path remains /openapi/harbor.v1.json.",
		auth: "none",
		responseSchemaName: "OpenApiDocument",
		responseEnvelope: "direct"
	},
	{
		operationId: "listWorkspaces",
		method: "post",
		path: "/workspaces/list",
		tags: ["Workspaces"],
		summary: "List workspaces available to the authenticated caller.",
		description: "Returns the caller-specific workspace membership view. The API control plane derives the caller from the bearer token.",
		auth: "bearer",
		requestSchemaName: "ListWorkspacesRequest",
		responseSchemaName: "ListWorkspacesResult",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getWorkspace",
		method: "post",
		path: "/workspaces/get",
		tags: ["Workspaces"],
		summary: "Read one workspace visible to the authenticated caller.",
		description: "The API control plane enforces workspace scope before returning the workspace record.",
		auth: "bearer",
		requestSchemaName: "WorkspaceRequest",
		responseSchemaName: "WorkspaceDetail",
		responseEnvelope: "api-success"
	},
	{
		operationId: "executePlugin",
		method: "post",
		path: "/plugins/execute",
		tags: ["Runtime"],
		summary: "Execute JavaScript or TypeScript against ready Harbor sources in a workspace.",
		description: "The API control plane authenticates and authorizes the caller before dispatching to the runtime execution layer.",
		auth: "bearer",
		requestSchemaName: "ExecuteRequest",
		responseSchemaName: "ExecuteResult",
		responseEnvelope: "api-success"
	},
	{
		operationId: "inspectTrigger",
		method: "post",
		path: "/triggers/inspect",
		tags: ["Triggers"],
		summary: "Inspect and validate a proposed trigger before activation.",
		auth: "bearer",
		requestSchemaName: "TriggerInspectBody",
		responseSchemaName: "TriggerInspectResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "activateTrigger",
		method: "post",
		path: "/triggers/activate",
		tags: ["Triggers"],
		summary: "Activate a trigger from a valid Inspect receipt.",
		auth: "bearer",
		requestSchemaName: "TriggerActivateBody",
		responseSchemaName: "TriggerActivateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "listTriggers",
		method: "post",
		path: "/triggers/list",
		tags: ["Triggers"],
		summary: "List triggers in a workspace.",
		auth: "bearer",
		requestSchemaName: "TriggerListBody",
		responseSchemaName: "TriggerListResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTrigger",
		method: "post",
		path: "/triggers/get",
		tags: ["Triggers"],
		summary: "Read one trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerGetBody",
		responseSchemaName: "TriggerGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "pauseTrigger",
		method: "post",
		path: "/triggers/pause",
		tags: ["Triggers"],
		summary: "Pause an active trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "resumeTrigger",
		method: "post",
		path: "/triggers/resume",
		tags: ["Triggers"],
		summary: "Resume a paused trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "disableTrigger",
		method: "post",
		path: "/triggers/disable",
		tags: ["Triggers"],
		summary: "Disable a trigger.",
		auth: "bearer",
		requestSchemaName: "TriggerPauseResumeBody",
		responseSchemaName: "TriggerStatusUpdateResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "replayTriggerDelivery",
		method: "post",
		path: "/triggers/replay",
		tags: ["Triggers"],
		summary: "Replay a terminal trigger delivery.",
		auth: "bearer",
		requestSchemaName: "TriggerReplayBody",
		responseSchemaName: "TriggerDeliveryGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "listTriggerDeliveries",
		method: "post",
		path: "/triggers/deliveries/list",
		tags: ["Triggers"],
		summary: "List trigger deliveries in a workspace.",
		auth: "bearer",
		requestSchemaName: "TriggerDeliveriesListBody",
		responseSchemaName: "TriggerDeliveriesListResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTriggerDelivery",
		method: "post",
		path: "/triggers/deliveries/get",
		tags: ["Triggers"],
		summary: "Read one trigger delivery.",
		auth: "bearer",
		requestSchemaName: "TriggerDeliveryGetBody",
		responseSchemaName: "TriggerDeliveryGetResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "getTriggerLimits",
		method: "post",
		path: "/triggers/limits/get",
		tags: ["Triggers"],
		summary: "Read workspace trigger limits.",
		auth: "bearer",
		requestSchemaName: "TriggerLimitsGetBody",
		responseSchemaName: "TriggerLimitsResponse",
		responseEnvelope: "api-success"
	},
	{
		operationId: "updateTriggerLimits",
		method: "post",
		path: "/triggers/limits/update",
		tags: ["Triggers"],
		summary: "Update workspace trigger limits.",
		auth: "bearer",
		requestSchemaName: "TriggerLimitsUpdateBody",
		responseSchemaName: "TriggerLimitsResponse",
		responseEnvelope: "api-success"
	}
];
const harborOpenApiComponents = {
	ApiFailure: objectSchema({
		success: {
			type: "boolean",
			enum: [false]
		},
		error: { type: "string" },
		issues: {
			type: "array",
			items: { type: "string" }
		}
	}, ["success", "error"]),
	RateLimitInfo: objectSchema({
		policy_id: { type: "string" },
		scope: stringEnum([
			"workspace",
			"user",
			"agent",
			"ip",
			"public"
		]),
		limit: {
			type: "integer",
			minimum: 1
		},
		window_ms: {
			type: "integer",
			minimum: 1
		},
		remaining: {
			type: "integer",
			minimum: 0
		},
		reset_at_ms: {
			type: "integer",
			minimum: 1
		}
	}, [
		"policy_id",
		"scope",
		"limit",
		"window_ms",
		"remaining",
		"reset_at_ms"
	]),
	ApiRateLimitFailure: objectSchema({
		success: {
			type: "boolean",
			enum: [false]
		},
		error: { type: "string" },
		retry_after_sec: {
			type: "integer",
			minimum: 1
		},
		rate_limit: ref("RateLimitInfo")
	}, [
		"success",
		"error",
		"retry_after_sec",
		"rate_limit"
	]),
	HealthResponse: objectSchema({
		status: {
			type: "string",
			enum: ["ok"]
		},
		service: {
			type: "string",
			enum: ["harbor-api"]
		},
		environment: { type: "string" }
	}, [
		"status",
		"service",
		"environment"
	]),
	HealthzResponse: objectSchema({
		status: stringEnum(["ok", "error"]),
		service: {
			type: "string",
			enum: ["harbor-api"]
		},
		environment: { type: "string" },
		version: nullable({ type: "string" }),
		checks: objectSchema({
			db: stringEnum(["ok", "error"]),
			migrations: stringEnum([
				"ok",
				"drift",
				"unknown"
			])
		}, ["db", "migrations"]),
		migrations: objectSchema({
			expected: nullable({ type: "string" }),
			latest_applied: nullable({ type: "string" }),
			latest_applied_at: nullable({ type: "string" }),
			applied_count: { type: "number" }
		}),
		db_ms: { type: "number" },
		total_ms: { type: "number" },
		timestamp: {
			type: "string",
			format: "date-time"
		},
		error: { type: "string" }
	}, [
		"status",
		"service",
		"environment",
		"checks",
		"migrations",
		"db_ms",
		"total_ms",
		"timestamp"
	]),
	WellKnownHarbor: objectSchema({
		name: { type: "string" },
		id: { type: "string" },
		description: { type: "string" },
		endpoints: objectSchema({
			api: {
				type: "string",
				format: "uri"
			},
			web: {
				type: "string",
				format: "uri"
			},
			mcp: {
				type: "string",
				format: "uri"
			},
			apps: {
				type: "string",
				format: "uri"
			}
		}, [
			"api",
			"web",
			"mcp",
			"apps"
		]),
		well_known: objectSchema({
			index: {
				type: "string",
				format: "uri"
			},
			harbor: {
				type: "string",
				format: "uri"
			},
			openapi: {
				type: "string",
				format: "uri"
			},
			mcp_protected_resource: {
				type: "string",
				format: "uri"
			},
			agent_skills: {
				type: "string",
				format: "uri"
			},
			ai_policy: {
				type: "string",
				format: "uri"
			}
		}, [
			"index",
			"harbor",
			"openapi",
			"mcp_protected_resource",
			"agent_skills",
			"ai_policy"
		])
	}, [
		"name",
		"id",
		"description",
		"endpoints",
		"well_known"
	]),
	WellKnownIndex: objectSchema({
		name: { type: "string" },
		entries: {
			type: "array",
			items: objectSchema({
				rel: { type: "string" },
				href: { type: "string" },
				type: { type: "string" }
			}, [
				"rel",
				"href",
				"type"
			])
		}
	}, ["name", "entries"]),
	OpenApiDocument: {
		type: "object",
		additionalProperties: true,
		description: "OpenAPI 3 document for Harbor first-party API surfaces."
	},
	Workspace: objectSchema({
		id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		slug: {
			type: "string",
			pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
		},
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		role: stringEnum([
			"owner",
			"admin",
			"member",
			"viewer"
		]),
		onboarded_at: nullable({
			type: "string",
			format: "date-time"
		}),
		current_user_id: {
			type: "string",
			format: "uuid"
		},
		current_user_email: {
			type: "string",
			format: "email"
		},
		current_user_name: nullable({ type: "string" }),
		current_user_avatar: nullable({ type: "string" })
	}, [
		"id",
		"name",
		"slug",
		"role",
		"onboarded_at"
	]),
	WorkspaceDetail: objectSchema({
		id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		slug: {
			type: "string",
			pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
		},
		created_by: {
			type: "string",
			format: "uuid"
		},
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		}
	}, [
		"id",
		"name",
		"slug",
		"created_by",
		"created_at",
		"updated_at"
	]),
	ListWorkspacesRequest: objectSchema({
		limit: {
			type: "integer",
			minimum: 1
		},
		offset: {
			type: "integer",
			minimum: 0
		},
		cursor: { type: "string" },
		include_total: { type: "boolean" }
	}),
	WorkspaceRequest: objectSchema({ workspace_id: {
		type: "string",
		format: "uuid"
	} }, ["workspace_id"]),
	ListWorkspacesResult: objectSchema({
		data: {
			type: "array",
			items: ref("Workspace")
		},
		total: nullable({ type: "number" }),
		limit: {
			type: "integer",
			minimum: 0
		},
		offset: {
			type: "integer",
			minimum: 0
		},
		hasMore: { type: "boolean" },
		nextCursor: nullable({ type: "string" })
	}, [
		"data",
		"limit",
		"offset",
		"hasMore"
	]),
	ApiSuccessListWorkspacesResult: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("ListWorkspacesResult")
	}, ["success", "data"]),
	ApiSuccessWorkspaceDetail: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("WorkspaceDetail")
	}, ["success", "data"]),
	SourceRef: objectSchema({ namespace: {
		type: "string",
		minLength: 1
	} }, ["namespace"]),
	ExecutionInput: objectSchema({
		path: {
			type: "string",
			minLength: 1
		},
		content_type: { type: "string" },
		size_bytes: { type: "number" },
		sha256: { type: "string" },
		data_base64: { type: "string" }
	}, [
		"path",
		"size_bytes",
		"sha256",
		"data_base64"
	]),
	ExecuteRequest: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		mode: stringEnum(["exec", "workflow"]),
		sources: {
			type: "array",
			items: ref("SourceRef")
		},
		code: {
			type: "string",
			minLength: 1
		},
		timeout_ms: { type: "number" },
		run_id: {
			type: "string",
			format: "uuid"
		},
		sand_session_id: { type: "string" },
		origin_cwd: { type: "string" },
		execution_inputs: {
			type: "array",
			items: ref("ExecutionInput")
		}
	}, ["workspace_id", "code"]),
	ExecuteWarning: objectSchema({
		namespace: { type: "string" },
		tool: { type: "string" },
		message: { type: "string" }
	}, [
		"namespace",
		"tool",
		"message"
	]),
	ExecuteResultTextContent: objectSchema({
		type: {
			type: "string",
			enum: ["text"]
		},
		mime_type: { type: "string" },
		text: { type: "string" }
	}, ["type", "text"]),
	ExecuteResultJsonContent: objectSchema({
		type: {
			type: "string",
			enum: ["json"]
		},
		mime_type: { type: "string" },
		json: jsonValueSchema
	}, ["type", "json"]),
	ExecuteSkillBundleFile: objectSchema({
		relative_path: { type: "string" },
		content_base64: { type: "string" },
		content_hash: { type: "string" }
	}, [
		"relative_path",
		"content_base64",
		"content_hash"
	]),
	ExecuteSkillBundle: objectSchema({
		slug: { type: "string" },
		name: { type: "string" },
		description: { type: "string" },
		content: { type: "string" },
		content_hash: { type: "string" },
		source_commit: { type: "string" },
		files: {
			type: "array",
			items: ref("ExecuteSkillBundleFile")
		}
	}, [
		"slug",
		"content",
		"content_hash"
	]),
	ExecuteResultSkillBundleContent: objectSchema({
		type: {
			type: "string",
			enum: ["skill_bundle"]
		},
		skill: ref("ExecuteSkillBundle")
	}, ["type", "skill"]),
	ExecuteResultContent: { oneOf: [
		ref("ExecuteResultTextContent"),
		ref("ExecuteResultJsonContent"),
		ref("ExecuteResultSkillBundleContent")
	] },
	ExecuteResult: objectSchema({
		result: jsonValueSchema,
		error: { type: "string" },
		logs: jsonValueSchema,
		mode: stringEnum(["dynamic_worker", "workflow"]),
		content: {
			type: "array",
			items: ref("ExecuteResultContent")
		},
		warnings: {
			type: "array",
			items: ref("ExecuteWarning")
		},
		run_id: {
			type: "string",
			format: "uuid"
		},
		workflow_instance_id: { type: "string" }
	}, [
		"result",
		"mode",
		"run_id"
	]),
	ApiSuccessExecuteResult: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("ExecuteResult")
	}, ["success", "data"]),
	TriggerKind: stringEnum([
		"schedule.cron",
		"schedule.once",
		"webhook.http"
	]),
	TriggerStatus: stringEnum([
		"draft",
		"active",
		"paused",
		"disabled",
		"failed"
	]),
	TriggerDeliveryStatus: stringEnum([
		"queued",
		"claimed",
		"running",
		"completed",
		"failed",
		"skipped",
		"cancelled",
		"dead_lettered"
	]),
	TriggerTargetJobRef: objectSchema({
		job: {
			type: "string",
			minLength: 1
		},
		version: { type: "string" }
	}, ["job"]),
	TriggerLimits: objectSchema({
		max_active_triggers: { type: "number" },
		max_active_schedules: { type: "number" },
		max_due_per_tick: { type: "number" },
		max_concurrent_deliveries: { type: "number" },
		max_concurrent_cron_deliveries: { type: "number" },
		max_concurrent_webhook_deliveries: { type: "number" },
		min_cron_interval_seconds: { type: "number" },
		max_event_bytes: { type: "number" }
	}),
	TriggerInspectBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		source: jsonValueSchema,
		target: ref("TriggerTargetJobRef"),
		input_mapping: jsonValueSchema,
		limits: ref("TriggerLimits"),
		activation: objectSchema({
			name: { type: "string" },
			description: { type: "string" }
		})
	}, [
		"workspace_id",
		"source",
		"target"
	]),
	TriggerActivateBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		inspect_receipt_id: {
			type: "string",
			minLength: 1
		},
		name: { type: "string" },
		description: nullable({ type: "string" }),
		status: stringEnum(["active", "paused"])
	}, [
		"workspace_id",
		"inspect_receipt_id",
		"name"
	]),
	TriggerListBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		status: ref("TriggerStatus"),
		kind: ref("TriggerKind"),
		limit: { type: "number" },
		offset: { type: "number" }
	}, ["workspace_id"]),
	TriggerGetBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "trigger_id"]),
	TriggerPauseResumeBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "trigger_id"]),
	TriggerReplayBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		delivery_id: {
			type: "string",
			minLength: 1
		},
		reason: { type: "string" }
	}, ["workspace_id", "delivery_id"]),
	TriggerDeliveriesListBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		},
		status: ref("TriggerDeliveryStatus"),
		limit: { type: "number" },
		offset: { type: "number" }
	}, ["workspace_id"]),
	TriggerDeliveryGetBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		delivery_id: {
			type: "string",
			minLength: 1
		}
	}, ["workspace_id", "delivery_id"]),
	TriggerLimitsGetBody: objectSchema({ workspace_id: {
		type: "string",
		format: "uuid"
	} }, ["workspace_id"]),
	TriggerLimitsUpdateBody: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		limits: ref("TriggerLimits")
	}, ["workspace_id", "limits"]),
	TriggerCheck: objectSchema({
		code: {
			type: "string",
			minLength: 1
		},
		status: stringEnum([
			"pass",
			"warn",
			"fail"
		]),
		message: { type: "string" },
		data: jsonValueSchema
	}, [
		"code",
		"status",
		"message"
	]),
	TriggerRequiredSetup: objectSchema({
		kind: stringEnum([
			"webhook_url",
			"provider_permission",
			"secret",
			"schedule",
			"policy"
		]),
		status: stringEnum([
			"ready",
			"required",
			"missing"
		]),
		data: jsonValueSchema
	}, ["kind", "status"]),
	TriggerRecord: objectSchema({
		id: {
			type: "string",
			minLength: 1
		},
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		name: { type: "string" },
		description: nullable({ type: "string" }),
		kind: ref("TriggerKind"),
		status: ref("TriggerStatus"),
		target_job_name: { type: "string" },
		target_version_name: { type: "string" },
		trigger_manifest: jsonValueSchema,
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		activated_at: nullable({
			type: "string",
			format: "date-time"
		}),
		paused_at: nullable({
			type: "string",
			format: "date-time"
		}),
		disabled_at: nullable({
			type: "string",
			format: "date-time"
		})
	}, [
		"id",
		"workspace_id",
		"name",
		"description",
		"kind",
		"status",
		"target_job_name",
		"target_version_name",
		"created_at",
		"updated_at",
		"activated_at",
		"paused_at",
		"disabled_at"
	]),
	TriggerDeliveryRecord: objectSchema({
		id: {
			type: "string",
			minLength: 1
		},
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		trigger_id: {
			type: "string",
			minLength: 1
		},
		kind: ref("TriggerKind"),
		status: ref("TriggerDeliveryStatus"),
		scheduled_for: nullable({
			type: "string",
			format: "date-time"
		}),
		source_delivery_id: nullable({ type: "string" }),
		idempotency_key: { type: "string" },
		run_id: nullable({
			type: "string",
			format: "uuid"
		}),
		job_invocation_id: nullable({
			type: "string",
			format: "uuid"
		}),
		attempt_count: { type: "number" },
		next_attempt_at: nullable({
			type: "string",
			format: "date-time"
		}),
		error_reason: nullable({ type: "string" }),
		error_message: nullable({ type: "string" }),
		created_at: {
			type: "string",
			format: "date-time"
		},
		updated_at: {
			type: "string",
			format: "date-time"
		},
		finished_at: nullable({
			type: "string",
			format: "date-time"
		})
	}, [
		"id",
		"workspace_id",
		"trigger_id",
		"kind",
		"status",
		"scheduled_for",
		"source_delivery_id",
		"idempotency_key",
		"run_id",
		"job_invocation_id",
		"attempt_count",
		"next_attempt_at",
		"error_reason",
		"error_message",
		"created_at",
		"updated_at",
		"finished_at"
	]),
	TriggerInspectResponse: objectSchema({
		ok: { type: "boolean" },
		receipt_id: { type: "string" },
		expires_at: {
			type: "string",
			format: "date-time"
		},
		normalized: jsonValueSchema,
		target: jsonValueSchema,
		checks: {
			type: "array",
			items: ref("TriggerCheck")
		},
		required_setup: {
			type: "array",
			items: ref("TriggerRequiredSetup")
		},
		activation_body: jsonValueSchema,
		errors: {
			type: "array",
			items: jsonValueSchema
		}
	}, [
		"ok",
		"receipt_id",
		"expires_at",
		"normalized",
		"target",
		"checks",
		"required_setup"
	]),
	TriggerActivateResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerListResponse: objectSchema({
		triggers: {
			type: "array",
			items: ref("TriggerRecord")
		},
		count: { type: "number" }
	}, ["triggers", "count"]),
	TriggerGetResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerStatusUpdateResponse: objectSchema({ trigger: ref("TriggerRecord") }, ["trigger"]),
	TriggerDeliveriesListResponse: objectSchema({
		deliveries: {
			type: "array",
			items: ref("TriggerDeliveryRecord")
		},
		count: { type: "number" }
	}, ["deliveries", "count"]),
	TriggerDeliveryGetResponse: objectSchema({ delivery: ref("TriggerDeliveryRecord") }, ["delivery"]),
	TriggerLimitsResponse: objectSchema({
		workspace_id: {
			type: "string",
			format: "uuid"
		},
		limits: ref("TriggerLimits")
	}, ["workspace_id", "limits"]),
	ApiSuccessTriggerInspectResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerInspectResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerActivateResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerActivateResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerListResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerListResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerGetResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerGetResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerStatusUpdateResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerStatusUpdateResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerDeliveriesListResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerDeliveriesListResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerDeliveryGetResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerDeliveryGetResponse")
	}, ["success", "data"]),
	ApiSuccessTriggerLimitsResponse: objectSchema({
		success: {
			type: "boolean",
			enum: [true]
		},
		data: ref("TriggerLimitsResponse")
	}, ["success", "data"])
};
const responseFor = (operation) => {
	return {
		description: "Successful response.",
		content: { "application/json": { schema: operation.responseEnvelope === "api-success" ? ref(`ApiSuccess${operation.responseSchemaName}`) : ref(operation.responseSchemaName) } }
	};
};
const jsonContent = (name) => ({ "application/json": { schema: ref(name) } });
const failureResponses = (operation) => operation.auth === "bearer" ? {
	"400": {
		description: "Invalid request.",
		content: jsonContent("ApiFailure")
	},
	"401": {
		description: "Missing or invalid credentials.",
		content: jsonContent("ApiFailure")
	},
	"403": {
		description: "Workspace or capability access denied.",
		content: jsonContent("ApiFailure")
	},
	"429": {
		description: "Configured rate limit exceeded.",
		content: jsonContent("ApiRateLimitFailure")
	},
	"500": {
		description: "Internal service failure.",
		content: jsonContent("ApiFailure")
	}
} : { "500": {
	description: "Internal service failure.",
	content: jsonContent("ApiFailure")
} };
const operationToOpenApi = (operation) => ({
	operationId: operation.operationId,
	tags: [...operation.tags],
	summary: operation.summary,
	...operation.description ? { description: operation.description } : {},
	...operation.auth === "bearer" ? { security: [{ bearerAuth: [] }] } : { security: [] },
	...operation.requestSchemaName ? { requestBody: {
		required: true,
		content: { "application/json": { schema: ref(operation.requestSchemaName) } }
	} } : {},
	responses: {
		"200": responseFor(operation),
		...failureResponses(operation)
	}
});
function createHarborOpenApiDocument(options = {}) {
	const paths = {};
	for (const operation of harborProtocolOperations) {
		const pathItem = paths[operation.path] ?? {};
		pathItem[operation.method] = operationToOpenApi(operation);
		paths[operation.path] = pathItem;
	}
	return {
		openapi: "3.0.3",
		info: {
			title: "Harbor API",
			version: HARBOR_OPENAPI_VERSION,
			description: "First-party Harbor API contract for discovery, health, and runtime execution ingress. Control-plane authorization remains owned by apps/api."
		},
		servers: [{
			url: options.serverUrl ?? "https://api.tryharbor.ai",
			description: "Production"
		}, {
			url: options.stagingServerUrl ?? "https://stagapi.tryharbor.ai",
			description: "Staging"
		}],
		paths,
		components: {
			securitySchemes: { bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "Harbor API key or WorkOS AuthKit access token",
				description: "Use a Harbor workspace API key, or a WorkOS/AuthKit access token on API routes that explicitly support WorkOS bearer authentication. Workspace authorization remains enforced by Harbor API routes."
			} },
			schemas: harborOpenApiComponents
		},
		tags: [
			{
				name: "Discovery",
				description: "Unauthenticated discovery documents."
			},
			{
				name: "Health",
				description: "Operational health checks."
			},
			{
				name: "Workspaces",
				description: "Authenticated workspace control-plane resources."
			},
			{
				name: "Runtime",
				description: "Workspace-scoped execution ingress."
			}
		]
	};
}
createHarborOpenApiDocument();
//#endregion
//#region ../protocol/src/stainless.ts
const operationById = new Map(harborProtocolOperations.map((operation) => [operation.operationId, operation]));
const requireOperation = (operationId) => {
	const operation = operationById.get(operationId);
	if (!operation) throw new Error(`Unknown Harbor protocol operation: ${operationId}`);
	return operation;
};
function createHarborStainlessConfig() {
	const health = requireOperation("getHealth");
	const healthz = requireOperation("getHealthz");
	const execute = requireOperation("executePlugin");
	return {
		organization: {
			name: "harbor",
			docs: "https://tryharbor.ai/docs"
		},
		targets: { python: { package_name: "harbor_sdk_generated" } },
		client_settings: { opts: { bearer_token: {
			type: "string",
			auth: { security_scheme: "bearerAuth" },
			read_env: "HARBOR_API_KEY"
		} } },
		environments: {
			production: "https://api.tryharbor.ai",
			staging: "https://stagapi.tryharbor.ai"
		},
		resources: {
			health: { methods: {
				retrieve: `${health.method} ${health.path}`,
				retrieve_deep: `${healthz.method} ${healthz.path}`
			} },
			runtime: { methods: { execute: `${execute.method} ${execute.path}` } }
		}
	};
}
function stringifyHarborStainlessConfig() {
	return `organization:
  name: harbor
  docs: https://tryharbor.ai/docs

targets:
  python:
    package_name: harbor_sdk_generated

client_settings:
  opts:
    bearer_token:
      type: string
      auth:
        security_scheme: bearerAuth
      read_env: HARBOR_API_KEY

environments:
  production: https://api.tryharbor.ai
  staging: https://stagapi.tryharbor.ai

resources:
  health:
    methods:
      retrieve: get /health
      retrieve_deep: get /healthz
  runtime:
    methods:
      execute: post /plugins/execute
`;
}
//#endregion
export { createHarborStainlessConfig, stringifyHarborStainlessConfig };

//# sourceMappingURL=stainless.mjs.map