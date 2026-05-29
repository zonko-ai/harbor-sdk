import { Schema } from "effect";

//#region ../core-effect/src/event.d.ts
declare const AuditEntry: Schema.Struct<{
  readonly id: Schema.String;
  readonly action: Schema.String;
  readonly resource_type: Schema.String;
  readonly resource_id: Schema.NullOr<Schema.String>;
  readonly actor_id: Schema.String;
  readonly actor_name: Schema.NullOr<Schema.String>;
  readonly metadata: Schema.NullOr<Schema.Unknown>;
  readonly created_at: Schema.String;
}>;
type AuditEntry = typeof AuditEntry.Type;
declare const EventType: Schema.Literals<readonly ["run.started", "run.step", "run.tool_call", "run.tool_result", "run.output", "run.error", "run.completed", "run.failed"]>;
type EventType = typeof EventType.Type;
declare const EventItem: Schema.Struct<{
  readonly event_type: Schema.Literals<readonly ["run.started", "run.step", "run.tool_call", "run.tool_result", "run.output", "run.error", "run.completed", "run.failed"]>;
  readonly payload: Schema.optional<Schema.Unknown>;
}>;
type EventItem = typeof EventItem.Type;
declare const IngestEventsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.String;
  readonly events: Schema.$Array<Schema.Struct<{
    readonly event_type: Schema.Literals<readonly ["run.started", "run.step", "run.tool_call", "run.tool_result", "run.output", "run.error", "run.completed", "run.failed"]>;
    readonly payload: Schema.optional<Schema.Unknown>;
  }>>;
}>;
type IngestEventsBody = typeof IngestEventsBody.Type;
declare const ListEventsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.optional<Schema.String>;
  readonly event_type: Schema.optional<Schema.Literals<readonly ["run.started", "run.step", "run.tool_call", "run.tool_result", "run.output", "run.error", "run.completed", "run.failed"]>>;
  readonly limit: Schema.optional<Schema.Number>;
}>;
type ListEventsBody = typeof ListEventsBody.Type;
declare const RunEvent: Schema.Struct<{
  readonly id: Schema.String;
  readonly run_id: Schema.String;
  readonly workspace_id: Schema.String;
  readonly event_type: Schema.String;
  readonly payload: Schema.NullOr<Schema.Unknown>;
  readonly created_at: Schema.String;
}>;
type RunEvent = typeof RunEvent.Type;
//#endregion
export { AuditEntry, EventItem, EventType, IngestEventsBody, ListEventsBody, RunEvent };
//# sourceMappingURL=event.d.mts.map