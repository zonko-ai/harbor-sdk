import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
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
//#region ../core-effect/src/event.ts
const AuditEntry = Schema.Struct({
	id: Schema.String,
	action: Schema.String,
	resource_type: Schema.String,
	resource_id: Schema.NullOr(Schema.String),
	actor_id: Schema.String,
	actor_name: Schema.NullOr(Schema.String),
	metadata: Schema.NullOr(Schema.Unknown),
	created_at: Schema.String
});
const EventType = Schema.Literals([
	"run.started",
	"run.step",
	"run.tool_call",
	"run.tool_result",
	"run.output",
	"run.error",
	"run.completed",
	"run.failed"
]);
const EventItem = Schema.Struct({
	event_type: EventType,
	payload: Schema.optional(Schema.Unknown)
});
const IngestEventsBody = Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.String.check(Schema.isUUID()),
	events: Schema.Array(EventItem)
});
const ListEventsBody = Schema.Struct({
	workspace_id: WorkspaceId,
	run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
	event_type: Schema.optional(EventType),
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 500
	})))
});
const RunEvent = Schema.Struct({
	id: Schema.String,
	run_id: Schema.String,
	workspace_id: Schema.String,
	event_type: Schema.String,
	payload: Schema.NullOr(Schema.Unknown),
	created_at: Schema.String
});
//#endregion
export { AuditEntry, EventItem, EventType, IngestEventsBody, ListEventsBody, RunEvent };

//# sourceMappingURL=event.mjs.map