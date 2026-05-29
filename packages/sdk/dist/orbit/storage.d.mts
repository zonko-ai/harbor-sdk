import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitStorageKey: Schema.NonEmptyString;
type OrbitStorageKey = typeof OrbitStorageKey.Type;
declare const OrbitStorageEncoding: Schema.Union<readonly [Schema.Literal<"auto">, Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>;
type OrbitStorageEncoding = typeof OrbitStorageEncoding.Type;
declare const OrbitStorageObject: Schema.Struct<{
  readonly key: Schema.NonEmptyString;
  readonly size: Schema.Number;
  readonly uploaded: Schema.String;
  readonly content_type: Schema.String;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>;
type OrbitStorageObject = typeof OrbitStorageObject.Type;
declare const OrbitStorageListBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly prefix: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitStorageListBody = typeof OrbitStorageListBody.Type;
declare const OrbitStorageListResponse: Schema.Struct<{
  readonly objects: Schema.$Array<Schema.Struct<{
    readonly key: Schema.NonEmptyString;
    readonly size: Schema.Number;
    readonly uploaded: Schema.String;
    readonly content_type: Schema.String;
    readonly download_url: Schema.String;
    readonly expires_at: Schema.String;
    readonly expires_in_seconds: Schema.Number;
  }>>;
  readonly truncated: Schema.Boolean;
  readonly cursor: Schema.optional<Schema.String>;
}>;
type OrbitStorageListResponse = typeof OrbitStorageListResponse.Type;
declare const OrbitStoragePutBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly data: Schema.Unknown;
  readonly content_type: Schema.optional<Schema.String>;
  readonly encoding: Schema.optional<Schema.Union<readonly [Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>>;
}>;
type OrbitStoragePutBody = typeof OrbitStoragePutBody.Type;
declare const OrbitStorageGetBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
  readonly encoding: Schema.optional<Schema.Union<readonly [Schema.Literal<"auto">, Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>>;
}>;
type OrbitStorageGetBody = typeof OrbitStorageGetBody.Type;
declare const OrbitStorageGetResponse: Schema.NullOr<Schema.Struct<{
  readonly encoding: Schema.Union<readonly [Schema.Literal<"metadata">, Schema.Literal<"text">, Schema.Literal<"json">, Schema.Literal<"base64">]>;
  readonly data: Schema.optional<Schema.Unknown>;
  readonly key: Schema.NonEmptyString;
  readonly size: Schema.Number;
  readonly uploaded: Schema.String;
  readonly content_type: Schema.String;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>>;
type OrbitStorageGetResponse = typeof OrbitStorageGetResponse.Type;
declare const OrbitStorageUrlBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageUrlBody = typeof OrbitStorageUrlBody.Type;
declare const OrbitStorageUrlResponse: Schema.Struct<{
  readonly key: Schema.NonEmptyString;
  readonly download_url: Schema.String;
  readonly expires_at: Schema.String;
  readonly expires_in_seconds: Schema.Number;
}>;
type OrbitStorageUrlResponse = typeof OrbitStorageUrlResponse.Type;
declare const OrbitStorageDeleteBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageDeleteBody = typeof OrbitStorageDeleteBody.Type;
declare const OrbitStorageDeleteResponse: Schema.Struct<{
  readonly deleted: Schema.Boolean;
  readonly key: Schema.NonEmptyString;
}>;
type OrbitStorageDeleteResponse = typeof OrbitStorageDeleteResponse.Type;
//#endregion
export { OrbitStorageDeleteBody, OrbitStorageDeleteResponse, OrbitStorageEncoding, OrbitStorageGetBody, OrbitStorageGetResponse, OrbitStorageKey, OrbitStorageListBody, OrbitStorageListResponse, OrbitStorageObject, OrbitStoragePutBody, OrbitStorageUrlBody, OrbitStorageUrlResponse };
//# sourceMappingURL=storage.d.mts.map