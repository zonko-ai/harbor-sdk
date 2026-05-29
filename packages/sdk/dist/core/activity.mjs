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
//#region ../core-effect/src/activity.ts
const WorkspaceActivitySinceBody = Schema.Struct({
	workspace_id: WorkspaceId,
	after: Schema.optional(Schema.Number),
	timeout_ms: Schema.optional(Schema.Number)
});
const WorkspaceActivityHeadBody = Schema.Struct({ workspace_id: WorkspaceId });
const WorkspaceActivityEvent = Schema.Struct({
	version: Schema.Number,
	topic: Schema.String,
	payload: Schema.Unknown,
	created_at: Schema.String
});
const WorkspaceActivitySinceResult = Schema.Struct({
	version: Schema.Number,
	events: Schema.Array(WorkspaceActivityEvent),
	timed_out: Schema.Boolean,
	truncated: Schema.Boolean
});
const WorkspaceActivityHeadResult = Schema.Struct({ version: Schema.Number });
const WorkspaceNotification = Schema.Struct({
	id: Schema.String,
	workspace_id: Schema.String,
	version: Schema.Number,
	topic: Schema.String,
	payload: Schema.Unknown,
	created_at: Schema.String,
	read_at: Schema.NullOr(Schema.String)
});
const WorkspaceNotificationsListBody = Schema.Struct({
	workspace_id: WorkspaceId,
	limit: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isBetween({
		minimum: 1,
		maximum: 100
	}))),
	offset: Schema.optional(Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)))
});
const WorkspaceNotificationsListResult = Schema.Struct({
	notifications: Schema.Array(WorkspaceNotification),
	unread_count: Schema.Number
});
const WorkspaceNotificationMarkReadBody = Schema.Struct({
	workspace_id: WorkspaceId,
	notification_id: Schema.String
});
const WorkspaceNotificationMarkAllReadBody = Schema.Struct({ workspace_id: WorkspaceId });
const WorkspaceNotificationMarkReadResult = Schema.Struct({ marked: Schema.Number });
//#endregion
export { WorkspaceActivityEvent, WorkspaceActivityHeadBody, WorkspaceActivityHeadResult, WorkspaceActivitySinceBody, WorkspaceActivitySinceResult, WorkspaceNotification, WorkspaceNotificationMarkAllReadBody, WorkspaceNotificationMarkReadBody, WorkspaceNotificationMarkReadResult, WorkspaceNotificationsListBody, WorkspaceNotificationsListResult };

//# sourceMappingURL=activity.mjs.map