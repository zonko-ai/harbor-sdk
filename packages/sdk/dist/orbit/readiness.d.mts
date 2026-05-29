import { Schema } from "effect";

//#region ../core-effect/src/orbit.d.ts
declare const OrbitReadinessSubjectKind: Schema.Union<readonly [Schema.Literal<"orbit_job_version">, Schema.Literal<"orbit_app_version">, Schema.Literal<"plugin_tool">]>;
type OrbitReadinessSubjectKind = typeof OrbitReadinessSubjectKind.Type;
declare const OrbitReadinessCheckKind: Schema.Union<readonly [Schema.Literal<"deploy_ping">, Schema.Literal<"schema">, Schema.Literal<"risk">, Schema.Literal<"quality">, Schema.Literal<"smoke">]>;
type OrbitReadinessCheckKind = typeof OrbitReadinessCheckKind.Type;
declare const OrbitReadinessStatus: Schema.Union<readonly [Schema.Literal<"queued">, Schema.Literal<"running">, Schema.Literal<"healthy">, Schema.Literal<"degraded">, Schema.Literal<"broken">, Schema.Literal<"skipped">]>;
type OrbitReadinessStatus = typeof OrbitReadinessStatus.Type;
declare const OrbitReadinessSummary: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly subject_kind: Schema.Union<readonly [Schema.Literal<"orbit_job_version">, Schema.Literal<"orbit_app_version">, Schema.Literal<"plugin_tool">]>;
  readonly subject_id: Schema.String;
  readonly status: Schema.Union<readonly [Schema.Literal<"queued">, Schema.Literal<"running">, Schema.Literal<"healthy">, Schema.Literal<"degraded">, Schema.Literal<"broken">, Schema.Literal<"skipped">]>;
  readonly summary: Schema.$Record<Schema.String, Schema.Unknown>;
  readonly last_check_id: Schema.NullOr<Schema.String>;
  readonly checked_at: Schema.NullOr<Schema.String>;
  readonly changed_at: Schema.String;
  readonly updated_at: Schema.String;
}>;
type OrbitReadinessSummary = typeof OrbitReadinessSummary.Type;
//#endregion
export { OrbitReadinessCheckKind, OrbitReadinessStatus, OrbitReadinessSubjectKind, OrbitReadinessSummary };
//# sourceMappingURL=readiness.d.mts.map