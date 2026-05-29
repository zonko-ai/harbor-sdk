import { Schema } from "effect";

//#region ../core-effect/src/http.d.ts
declare const ApiSuccess: <T extends Schema.Top>(data: T) => Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: T;
}>;
declare const ApiFailure: Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>;
type ApiFailure = typeof ApiFailure.Type;
declare const ApiEnvelope: <T extends Schema.Top>(data: T) => Schema.Union<readonly [Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: T;
}>, Schema.Struct<{
  readonly success: Schema.Literal<false>;
  readonly error: Schema.String;
  readonly issues: Schema.optional<Schema.$Array<Schema.String>>;
}>]>;
declare const PaginatedResponse: <T extends Schema.Top>(item: T) => Schema.Struct<{
  readonly success: Schema.Literal<true>;
  readonly data: Schema.$Array<T>;
  readonly total: Schema.optional<Schema.NullOr<Schema.Number>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
  readonly hasMore: Schema.Boolean;
  readonly nextCursor: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
declare const PaginationParams: Schema.Struct<{
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
  readonly cursor: Schema.optional<Schema.String>;
  readonly include_total: Schema.optional<Schema.Boolean>;
}>;
type PaginationParams = typeof PaginationParams.Type;
//#endregion
export { ApiEnvelope, ApiFailure, ApiSuccess, PaginatedResponse, PaginationParams };
//# sourceMappingURL=http.d.mts.map