import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitUsageQueryBody: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly run_id: Schema.optional<Schema.String>;
  readonly operation: Schema.optional<Schema.String>;
  readonly limit: Schema.optional<Schema.Number>;
  readonly offset: Schema.optional<Schema.Number>;
}>;
type OrbitUsageQueryBody = typeof OrbitUsageQueryBody.Type;
declare const OrbitUsageRow: Schema.Struct<{
  readonly id: Schema.String;
  readonly run_id: Schema.NullOr<Schema.String>;
  readonly workspace_id: Schema.String;
  readonly operation: Schema.String;
  readonly key: Schema.NullOr<Schema.String>;
  readonly model: Schema.NullOr<Schema.String>;
  readonly size_bytes: Schema.NullOr<Schema.Number>;
  readonly duration_ms: Schema.NullOr<Schema.Number>;
  readonly error: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
}>;
type OrbitUsageRow = typeof OrbitUsageRow.Type;
declare const OrbitUsageQueryResponse: Schema.Struct<{
  readonly data: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly run_id: Schema.NullOr<Schema.String>;
    readonly workspace_id: Schema.String;
    readonly operation: Schema.String;
    readonly key: Schema.NullOr<Schema.String>;
    readonly model: Schema.NullOr<Schema.String>;
    readonly size_bytes: Schema.NullOr<Schema.Number>;
    readonly duration_ms: Schema.NullOr<Schema.Number>;
    readonly error: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
  }>>;
  readonly limit: Schema.Number;
  readonly offset: Schema.Number;
}>;
type OrbitUsageQueryResponse = typeof OrbitUsageQueryResponse.Type;
//#endregion
export { OrbitUsageQueryBody, OrbitUsageQueryResponse, OrbitUsageRow };
//# sourceMappingURL=usage.d.mts.map