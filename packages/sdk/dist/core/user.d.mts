import { Schema } from "effect";

//#region ../core-effect/src/user.d.ts
declare const UpdateUserBody: Schema.Struct<{
  readonly name: Schema.String;
}>;
type UpdateUserBody = typeof UpdateUserBody.Type;
declare const UserProfile: Schema.Struct<{
  readonly id: Schema.String;
  readonly email: Schema.String;
  readonly name: Schema.NullOr<Schema.String>;
  readonly avatar_url: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly default_workspace_id: Schema.NullOr<Schema.String>;
}>;
type UserProfile = typeof UserProfile.Type;
declare const UpdateUserResult: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.String;
}>;
type UpdateUserResult = typeof UpdateUserResult.Type;
declare const SetDefaultWorkspaceBody: Schema.Struct<{
  readonly workspace_id: Schema.NullOr<Schema.NonEmptyString>;
}>;
type SetDefaultWorkspaceBody = typeof SetDefaultWorkspaceBody.Type;
declare const SetDefaultWorkspaceResult: Schema.Struct<{
  readonly default_workspace_id: Schema.NullOr<Schema.String>;
}>;
type SetDefaultWorkspaceResult = typeof SetDefaultWorkspaceResult.Type;
declare const DevicePollBody: Schema.Struct<{
  readonly device_code: Schema.NonEmptyString;
}>;
type DevicePollBody = typeof DevicePollBody.Type;
declare const CurrentWorkspaceBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type CurrentWorkspaceBody = typeof CurrentWorkspaceBody.Type;
//#endregion
export { CurrentWorkspaceBody, DevicePollBody, SetDefaultWorkspaceBody, SetDefaultWorkspaceResult, UpdateUserBody, UpdateUserResult, UserProfile };
//# sourceMappingURL=user.d.mts.map