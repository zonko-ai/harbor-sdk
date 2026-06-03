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
//#region ../core-effect/src/user.ts
const UpdateUserBody = Schema.Struct({ name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(100)) });
const UserProfile = Schema.Struct({
	id: Schema.String,
	email: Schema.String,
	name: Schema.NullOr(Schema.String),
	avatar_url: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	default_workspace_id: Schema.NullOr(Schema.String)
});
const UpdateUserResult = Schema.Struct({
	id: Schema.String,
	name: Schema.String
});
const SetDefaultWorkspaceBody = Schema.Struct({ workspace_id: Schema.NullOr(Schema.NonEmptyString) });
const SetDefaultWorkspaceResult = Schema.Struct({ default_workspace_id: Schema.NullOr(Schema.String) });
const DevicePollBody = Schema.Struct({ device_code: Schema.NonEmptyString });
const CurrentWorkspaceBody = Schema.Struct({ workspace_id: WorkspaceId });
//#endregion
export { CurrentWorkspaceBody, DevicePollBody, SetDefaultWorkspaceBody, SetDefaultWorkspaceResult, UpdateUserBody, UpdateUserResult, UserProfile };

//# sourceMappingURL=user.mjs.map