import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitDbTableName: Schema.NonEmptyString;
type OrbitDbTableName = typeof OrbitDbTableName.Type;
declare const OrbitDbTableSummary: Schema.Struct<{
  readonly name: Schema.NonEmptyString;
  readonly type: Schema.Union<readonly [Schema.Literal<"table">, Schema.Literal<"view">]>;
  readonly row_count: Schema.NullOr<Schema.Number>;
  readonly columns: Schema.$Array<Schema.Struct<{
    readonly name: Schema.String;
    readonly type: Schema.String;
    readonly notnull: Schema.Boolean;
    readonly pk: Schema.Boolean;
  }>>;
}>;
type OrbitDbTableSummary = typeof OrbitDbTableSummary.Type;
declare const OrbitDbTablesBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type OrbitDbTablesBody = typeof OrbitDbTablesBody.Type;
declare const OrbitDbTablesResponse: Schema.Struct<{
  readonly workspace_database_id: Schema.NullOr<Schema.String>;
  readonly workspace_database_name: Schema.NullOr<Schema.String>;
  readonly status: Schema.Union<readonly [Schema.Literal<"ready">, Schema.Literal<"creating">, Schema.Literal<"failed">, Schema.Literal<"disabled">]>;
  readonly tables: Schema.$Array<Schema.Struct<{
    readonly name: Schema.NonEmptyString;
    readonly type: Schema.Union<readonly [Schema.Literal<"table">, Schema.Literal<"view">]>;
    readonly row_count: Schema.NullOr<Schema.Number>;
    readonly columns: Schema.$Array<Schema.Struct<{
      readonly name: Schema.String;
      readonly type: Schema.String;
      readonly notnull: Schema.Boolean;
      readonly pk: Schema.Boolean;
    }>>;
  }>>;
}>;
type OrbitDbTablesResponse = typeof OrbitDbTablesResponse.Type;
declare const OrbitDbPeekBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly table: Schema.NonEmptyString;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitDbPeekBody = typeof OrbitDbPeekBody.Type;
declare const OrbitDbPeekResponse: Schema.Struct<{
  readonly table: Schema.NonEmptyString;
  readonly columns: Schema.$Array<Schema.String>;
  readonly rows: Schema.$Array<Schema.$Record<Schema.String, Schema.Unknown>>;
  readonly truncated: Schema.Boolean;
  readonly total_rows: Schema.NullOr<Schema.Number>;
}>;
type OrbitDbPeekResponse = typeof OrbitDbPeekResponse.Type;
//#endregion
export { OrbitDbPeekBody, OrbitDbPeekResponse, OrbitDbTableName, OrbitDbTableSummary, OrbitDbTablesBody, OrbitDbTablesResponse };
//# sourceMappingURL=db.d.mts.map