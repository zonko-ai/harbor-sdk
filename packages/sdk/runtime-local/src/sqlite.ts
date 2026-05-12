export const HARBOR_LOCAL_SCHEMA_VERSION = 1

export const HARBOR_LOCAL_TABLES = [
  "local_workspace",
  "source_refs",
  "tool_index",
  "package_metadata",
  "workflow_refs",
  "job_refs",
  "job_versions",
  "app_refs",
  "app_versions",
  "runs",
  "spans",
  "artifact_metadata",
  "cache_metadata",
  "credential_metadata",
  "cloudflare_resources",
] as const

export type HarborLocalTable = (typeof HARBOR_LOCAL_TABLES)[number]

export interface HarborLocalSqlExecutor {
  readonly exec: (sql: string) => Promise<void>
}

export interface HarborLocalMigration {
  readonly version: number
  readonly name: string
  readonly sql: string
}

export const HARBOR_LOCAL_MIGRATIONS: readonly HarborLocalMigration[] = [
  {
    version: 1,
    name: "0001_initial_local_runtime_store",
    sql: `
CREATE TABLE IF NOT EXISTS local_workspace (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_refs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  manifest_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tool_index (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT NOT NULL,
  namespace TEXT NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  input_schema_json TEXT,
  output_schema_json TEXT,
  search_text TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS package_metadata (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT,
  owner TEXT,
  manifest_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflow_refs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  manifest_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_refs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  manifest_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_versions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  job_ref_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  source_snapshot TEXT NOT NULL,
  manifest_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_refs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  manifest_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_versions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  app_ref_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  source_snapshot TEXT NOT NULL,
  route_manifest_json TEXT NOT NULL,
  job_manifest_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  input_json TEXT,
  output_json TEXT,
  error_json TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS spans (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  input_json TEXT,
  output_json TEXT,
  error_json TEXT,
  started_at TEXT NOT NULL,
  finished_at TEXT
);

CREATE TABLE IF NOT EXISTS artifact_metadata (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  run_id TEXT,
  key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_metadata (
  key TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  expires_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credential_metadata (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT,
  slot TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cloudflare_resources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  account_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  cloudflare_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_index_workspace_search ON tool_index(workspace_id, namespace, name);
CREATE INDEX IF NOT EXISTS idx_runs_workspace_started ON runs(workspace_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_spans_run_started ON spans(run_id, started_at);
CREATE INDEX IF NOT EXISTS idx_artifact_metadata_workspace_key ON artifact_metadata(workspace_id, key);
CREATE INDEX IF NOT EXISTS idx_cloudflare_resources_workspace_kind ON cloudflare_resources(workspace_id, kind);
`.trim(),
  },
]

export function expectedHarborLocalTables(): readonly HarborLocalTable[] {
  return HARBOR_LOCAL_TABLES
}

export async function runHarborLocalMigrations(
  executor: HarborLocalSqlExecutor,
  migrations: readonly HarborLocalMigration[] = HARBOR_LOCAL_MIGRATIONS
): Promise<number> {
  let latest = 0
  for (const migration of [...migrations].sort((a, b) => a.version - b.version)) {
    await executor.exec(migration.sql)
    latest = migration.version
  }
  return latest
}
