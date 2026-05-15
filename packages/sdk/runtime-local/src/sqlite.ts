import { createRequire } from "node:module"

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
  "oauth_clients",
  "oauth_pending_flows",
  "oauth_grants",
  "mcp_sources",
  "mcp_source_headers",
  "mcp_source_query_params",
  "mcp_tool_bindings",
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

CREATE TABLE IF NOT EXISTS oauth_clients (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret_ref TEXT,
  authorization_endpoint TEXT NOT NULL,
  token_endpoint TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  scopes_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_pending_flows (
  state TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT NOT NULL,
  oauth_client_id TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  code_challenge TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  status TEXT NOT NULL,
  authorization_url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_grants (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT NOT NULL,
  oauth_client_id TEXT NOT NULL,
  status TEXT NOT NULL,
  scopes_json TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_sources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  transport TEXT NOT NULL,
  name TEXT NOT NULL,
  namespace TEXT NOT NULL,
  endpoint TEXT,
  remote_transport TEXT,
  command TEXT,
  args_json TEXT,
  env_json TEXT,
  cwd TEXT,
  auth_kind TEXT NOT NULL,
  auth_header_name TEXT,
  auth_header_slot TEXT,
  auth_header_prefix TEXT,
  auth_connection_slot TEXT,
  auth_client_id_slot TEXT,
  auth_client_secret_slot TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mcp_source_headers (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  text_value TEXT,
  slot TEXT,
  prefix TEXT
);

CREATE TABLE IF NOT EXISTS mcp_source_query_params (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  text_value TEXT,
  slot TEXT,
  prefix TEXT
);

CREATE TABLE IF NOT EXISTS mcp_tool_bindings (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  namespace TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  description TEXT,
  input_schema_json TEXT,
  output_schema_json TEXT,
  annotations_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tool_index_workspace_search ON tool_index(workspace_id, namespace, name);
CREATE INDEX IF NOT EXISTS idx_runs_workspace_started ON runs(workspace_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_spans_run_started ON spans(run_id, started_at);
CREATE INDEX IF NOT EXISTS idx_artifact_metadata_workspace_key ON artifact_metadata(workspace_id, key);
CREATE INDEX IF NOT EXISTS idx_oauth_grants_source_status ON oauth_grants(workspace_id, source_ref_id, status);
CREATE INDEX IF NOT EXISTS idx_oauth_pending_source_status ON oauth_pending_flows(workspace_id, source_ref_id, status);
CREATE INDEX IF NOT EXISTS idx_mcp_sources_workspace_namespace ON mcp_sources(workspace_id, namespace);
CREATE INDEX IF NOT EXISTS idx_mcp_tool_bindings_source ON mcp_tool_bindings(workspace_id, source_id);
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

interface SqlDatabase {
  readonly exec: (sql: string) => void
  readonly close: () => void
}

type SqlDatabaseCtor = new (filename: string) => SqlDatabase

let DatabaseSync: SqlDatabaseCtor | null = null
let warningPatched = false

function loadSqliteDatabase(): SqlDatabaseCtor | null {
  if (DatabaseSync) return DatabaseSync
  if (!warningPatched) {
    warningPatched = true
    const original = process.emitWarning.bind(process)
    process.emitWarning = ((warning, ...rest: unknown[]) => {
      const text =
        typeof warning === "string"
          ? warning
          : warning instanceof Error
            ? warning.message
            : String(warning)
      if (/SQLite is an experimental feature/i.test(text)) return
      return (original as (...args: unknown[]) => void)(warning as string, ...rest)
    }) as typeof process.emitWarning
  }
  const req = createRequire(import.meta.url)
  try {
    DatabaseSync = (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
    return DatabaseSync
  } catch {
    try {
      const BunDb = (req("bun:sqlite") as { Database: new (filename: string) => unknown }).Database
      DatabaseSync = class Adapted {
        private readonly inner: SqlDatabase
        constructor(filename: string) {
          this.inner = new BunDb(filename) as SqlDatabase
        }
        exec(sql: string): void {
          this.inner.exec(sql)
        }
        close(): void {
          this.inner.close()
        }
      }
      return DatabaseSync
    } catch {
      return null
    }
  }
}

export async function initializeHarborLocalSqlite(filename: string): Promise<number> {
  const Database = loadSqliteDatabase()
  if (!Database) {
    throw new Error("Local SQLite initialization requires node:sqlite or bun:sqlite")
  }
  const db = new Database(filename)
  try {
    return await runHarborLocalMigrations({
      exec: async (sql) => {
        db.exec(sql)
      },
    })
  } finally {
    db.close()
  }
}
