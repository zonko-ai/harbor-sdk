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
//#region ../core-effect/src/activity.ts
const ActivityStreamUrlBody = Schema.Struct({ expires_in_seconds: Schema.optional(Schema.Number) });
const ActivityStreamUrlResult = Schema.Struct({
	workspace_id: Schema.String,
	token: Schema.String,
	expires_at: Schema.String
});
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
export { ActivityStreamUrlBody, ActivityStreamUrlResult, WorkspaceActivityEvent, WorkspaceActivityHeadResult, WorkspaceActivitySinceResult, WorkspaceNotification, WorkspaceNotificationMarkAllReadBody, WorkspaceNotificationMarkReadBody, WorkspaceNotificationMarkReadResult, WorkspaceNotificationsListBody, WorkspaceNotificationsListResult };

//# sourceMappingURL=activity.mjs.map