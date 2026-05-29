import { Schema } from "effect";
//#region ../core-effect/src/run.ts
const RunStatus = Schema.Literals([
	"queued",
	"running",
	"completed",
	"failed",
	"cancelled"
]);
function isTerminalRunStatus(status) {
	return status === "completed" || status === "failed" || status === "cancelled";
}
const RunSource = Schema.Literals([
	"api",
	"cli",
	"worker"
]);
const SpanStatus = Schema.Literals([
	"pending",
	"success",
	"error",
	"warning"
]);
const SpanKind = Schema.Literals([
	"run",
	"mcp.tool_call",
	"mcp.prompts_get",
	"mcp.resources_read",
	"mcp.notification",
	"mcp.reconnect",
	"api.request",
	"api.graphql",
	"cli.command",
	"orbit.storage",
	"orbit.cache",
	"orbit.ai",
	"orbit.db",
	"orbit.fetch",
	"orbit.job_invoke",
	"secret.resolve",
	"retry",
	"agent.step",
	"workflow.step",
	"workflow.sleep",
	"workflow.wait_event",
	"log"
]);
const SpanError = Schema.Struct({
	message: Schema.String,
	code: Schema.optional(Schema.Union([Schema.String, Schema.Number])),
	data: Schema.optional(Schema.Unknown)
});
const Span = Schema.Struct({
	id: Schema.String,
	run_id: Schema.String,
	parent_id: Schema.NullOr(Schema.String),
	agent_id: Schema.NullOr(Schema.String),
	kind: SpanKind,
	status: SpanStatus,
	title: Schema.NullOr(Schema.String),
	source_id: Schema.NullOr(Schema.String),
	source_namespace: Schema.NullOr(Schema.String),
	source_display_name: Schema.NullOr(Schema.String),
	source_icon_url: Schema.NullOr(Schema.String),
	tool_id: Schema.NullOr(Schema.String),
	tool_name: Schema.NullOr(Schema.String),
	tool_display_name: Schema.NullOr(Schema.String),
	tool_description: Schema.NullOr(Schema.String),
	tool_icons: Schema.optional(Schema.Unknown),
	input_schema: Schema.optional(Schema.Unknown),
	output_schema: Schema.optional(Schema.Unknown),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	content_type: Schema.NullOr(Schema.String),
	upstream_status: Schema.NullOr(Schema.Number),
	error: Schema.NullOr(SpanError),
	tokens_in: Schema.NullOr(Schema.Number),
	tokens_out: Schema.NullOr(Schema.Number),
	cost_usd: Schema.NullOr(Schema.Number),
	started_at: Schema.String,
	finished_at: Schema.NullOr(Schema.String),
	duration_ms: Schema.NullOr(Schema.Number),
	started_offset_ms: Schema.Number,
	metadata: Schema.Unknown
});
const Run = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	agent_id: Schema.String,
	status: RunStatus,
	source: RunSource,
	trigger: Schema.NullOr(Schema.String),
	input: Schema.optional(Schema.Unknown),
	output: Schema.optional(Schema.Unknown),
	error_message: Schema.NullOr(Schema.String),
	error_code: Schema.NullOr(Schema.String),
	exit_code: Schema.NullOr(Schema.Number),
	duration_ms: Schema.NullOr(Schema.Number),
	artifact_count: Schema.Number,
	workflow_instance_id: Schema.optional(Schema.NullOr(Schema.String)),
	started_at: Schema.NullOr(Schema.String),
	finished_at: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	sources: Schema.optional(Schema.Array(Schema.String))
});
const Artifact = Schema.Struct({
	id: Schema.String,
	name: Schema.String,
	mime_type: Schema.String,
	size_bytes: Schema.Number,
	storage_key: Schema.NullOr(Schema.String),
	created_at: Schema.String
});
const RunSummary = Schema.Struct({
	span_count: Schema.Number,
	error_count: Schema.Number,
	retry_count: Schema.Number,
	total_tokens_in: Schema.NullOr(Schema.Number),
	total_tokens_out: Schema.NullOr(Schema.Number),
	total_cost_usd: Schema.NullOr(Schema.Number)
});
const RunGraph = Schema.Struct({
	run: Run,
	spans: Schema.Array(Span),
	next_cursor: Schema.NullOr(Schema.String),
	summary: RunSummary
});
const RunIdBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	run_id: Schema.String.check(Schema.isUUID())
});
const RunGraphBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	run_id: Schema.String.check(Schema.isUUID()),
	cursor: Schema.optional(Schema.String),
	since_offset_ms: Schema.optional(Schema.Number)
});
const ListRunsBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	source: Schema.optional(Schema.String),
	created_after: Schema.optional(Schema.String),
	created_before: Schema.optional(Schema.String),
	offset: Schema.optional(Schema.Number),
	limit: Schema.optional(Schema.Number),
	cursor: Schema.optional(Schema.String),
	include_total: Schema.optional(Schema.Boolean)
});
const ListRunsResult = Schema.Struct({
	data: Schema.Array(Run),
	total: Schema.optional(Schema.NullOr(Schema.Number)),
	limit: Schema.Number,
	offset: Schema.Number,
	hasMore: Schema.Boolean,
	nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
	source_options: Schema.optional(Schema.Array(Schema.String))
});
const CreateRunBody = Schema.Struct({
	workspace_id: Schema.String.check(Schema.isUUID()),
	agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	input: Schema.optional(Schema.Unknown),
	trigger: Schema.optional(Schema.String)
});
//#endregion
export { Artifact, CreateRunBody, ListRunsBody, ListRunsResult, Run, RunGraph, RunGraphBody, RunIdBody, RunSource, RunStatus, RunSummary, Span, SpanError, SpanKind, SpanStatus, isTerminalRunStatus };

//# sourceMappingURL=run.mjs.map