import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitSocketChannel: Schema.NonEmptyString;
type OrbitSocketChannel = typeof OrbitSocketChannel.Type;
declare const OrbitSocketPermission: Schema.Union<readonly [Schema.Literal<"receive">, Schema.Literal<"send">]>;
type OrbitSocketPermission = typeof OrbitSocketPermission.Type;
declare const OrbitSocketUrlBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
  readonly permissions: Schema.optional<Schema.$Array<Schema.Union<readonly [Schema.Literal<"receive">, Schema.Literal<"send">]>>>;
  readonly expires_in_seconds: Schema.optional<Schema.Number>;
  readonly allowed_origins: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type OrbitSocketUrlBody = typeof OrbitSocketUrlBody.Type;
declare const OrbitSocketUrlResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly url: Schema.String;
  readonly expires_at: Schema.String;
}>;
type OrbitSocketUrlResponse = typeof OrbitSocketUrlResponse.Type;
declare const OrbitSocketBroadcastBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
  readonly event: Schema.Unknown;
}>;
type OrbitSocketBroadcastBody = typeof OrbitSocketBroadcastBody.Type;
declare const OrbitSocketBroadcastResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly delivered: Schema.Number;
}>;
type OrbitSocketBroadcastResponse = typeof OrbitSocketBroadcastResponse.Type;
declare const OrbitSocketStatsBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly channel: Schema.NonEmptyString;
}>;
type OrbitSocketStatsBody = typeof OrbitSocketStatsBody.Type;
declare const OrbitSocketStatsResponse: Schema.Struct<{
  readonly channel: Schema.NonEmptyString;
  readonly connections: Schema.Number;
}>;
type OrbitSocketStatsResponse = typeof OrbitSocketStatsResponse.Type;
//#endregion
export { OrbitSocketBroadcastBody, OrbitSocketBroadcastResponse, OrbitSocketChannel, OrbitSocketPermission, OrbitSocketStatsBody, OrbitSocketStatsResponse, OrbitSocketUrlBody, OrbitSocketUrlResponse };
//# sourceMappingURL=socket.d.mts.map