import { createRequire } from "node:module"
import { ensureHarborLocalProject, harborLocalPaths, LOCAL_WORKSPACE_ID } from "./index"

interface Statement {
  readonly run: (...args: unknown[]) => unknown
  readonly all: (...args: unknown[]) => unknown[]
}

interface SqlDatabase {
  readonly exec: (sql: string) => void
  readonly prepare: (sql: string) => Statement
  readonly close: () => void
}

type SqlDatabaseCtor = new (filename: string) => SqlDatabase

export interface HarborLocalToolInvocationInput {
  readonly sourceRefId?: string | undefined
  readonly namespace: string
  readonly toolId: string
  readonly input?: unknown
  readonly output?: unknown
  readonly error?: unknown
  readonly ok: boolean
  readonly durationMs: number
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalToolInvocationRecord {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly sourceRefId?: string | undefined
  readonly namespace: string
  readonly toolId: string
  readonly input?: unknown
  readonly output?: unknown
  readonly error?: unknown
  readonly ok: boolean
  readonly durationMs: number
  readonly createdAt: string
}

export interface HarborLocalToolInvocationListInput {
  readonly limit?: number | undefined
  readonly namespace?: string | undefined
  readonly toolId?: string | undefined
  readonly sourceRefId?: string | undefined
}

function loadDatabase(): SqlDatabaseCtor {
  const req = createRequire(import.meta.url)
  try {
    return (req("bun:sqlite") as { Database: SqlDatabaseCtor }).Database
  } catch {
    try {
      return (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
    } catch {
      throw new Error("Local invocation store requires bun:sqlite or node:sqlite")
    }
  }
}

function openDatabase(projectRoot: string): SqlDatabase {
  const Database = loadDatabase()
  return new Database(harborLocalPaths(projectRoot).sqlite)
}

function ensureInvocationTable(db: SqlDatabase): void {
  db.exec(`
CREATE TABLE IF NOT EXISTS tool_invocations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  source_ref_id TEXT,
  namespace TEXT NOT NULL,
  tool_id TEXT NOT NULL,
  input_json TEXT,
  output_json TEXT,
  error_json TEXT,
  ok INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tool_invocations_workspace_created ON tool_invocations(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_invocations_tool ON tool_invocations(workspace_id, tool_id, created_at DESC);
`.trim())
}

function json(value: unknown): string | null {
  return value === undefined ? null : JSON.stringify(value)
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string" || value.length === 0) return undefined
  return JSON.parse(value) as unknown
}

function timestamp(now: (() => Date) | undefined): string {
  return (now ?? (() => new Date()))().toISOString()
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `invocation_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function rowToInvocation(row: Record<string, unknown>): HarborLocalToolInvocationRecord {
  return {
    id: String(row["id"]),
    workspaceId: LOCAL_WORKSPACE_ID,
    ...(typeof row["source_ref_id"] === "string" ? { sourceRefId: row["source_ref_id"] } : {}),
    namespace: String(row["namespace"]),
    toolId: String(row["tool_id"]),
    ...(parseJson(row["input_json"]) !== undefined ? { input: parseJson(row["input_json"]) } : {}),
    ...(parseJson(row["output_json"]) !== undefined ? { output: parseJson(row["output_json"]) } : {}),
    ...(parseJson(row["error_json"]) !== undefined ? { error: parseJson(row["error_json"]) } : {}),
    ok: Number(row["ok"]) === 1,
    durationMs: Number(row["duration_ms"] ?? 0),
    createdAt: String(row["created_at"]),
  }
}

export async function recordHarborLocalToolInvocation(input: {
  readonly projectRoot: string
  readonly invocation: HarborLocalToolInvocationInput
}): Promise<HarborLocalToolInvocationRecord> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const db = openDatabase(input.projectRoot)
  const id = randomId()
  const createdAt = timestamp(input.invocation.now)
  try {
    ensureInvocationTable(db)
    db.prepare(`
      INSERT INTO tool_invocations (
        id, workspace_id, source_ref_id, namespace, tool_id, input_json,
        output_json, error_json, ok, duration_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      LOCAL_WORKSPACE_ID,
      input.invocation.sourceRefId ?? null,
      input.invocation.namespace,
      input.invocation.toolId,
      json(input.invocation.input),
      json(input.invocation.output),
      json(input.invocation.error),
      input.invocation.ok ? 1 : 0,
      Math.max(0, Math.round(input.invocation.durationMs)),
      createdAt
    )
  } finally {
    db.close()
  }
  return {
    id,
    workspaceId: LOCAL_WORKSPACE_ID,
    ...(input.invocation.sourceRefId !== undefined ? { sourceRefId: input.invocation.sourceRefId } : {}),
    namespace: input.invocation.namespace,
    toolId: input.invocation.toolId,
    ...(input.invocation.input !== undefined ? { input: input.invocation.input } : {}),
    ...(input.invocation.output !== undefined ? { output: input.invocation.output } : {}),
    ...(input.invocation.error !== undefined ? { error: input.invocation.error } : {}),
    ok: input.invocation.ok,
    durationMs: Math.max(0, Math.round(input.invocation.durationMs)),
    createdAt,
  }
}

export async function listHarborLocalToolInvocations(
  projectRoot: string,
  input: HarborLocalToolInvocationListInput = {}
): Promise<readonly HarborLocalToolInvocationRecord[]> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  try {
    ensureInvocationTable(db)
    const clauses = ["workspace_id = ?"]
    const args: unknown[] = [LOCAL_WORKSPACE_ID]
    if (input.namespace !== undefined) {
      clauses.push("namespace = ?")
      args.push(input.namespace)
    }
    if (input.toolId !== undefined) {
      clauses.push("tool_id = ?")
      args.push(input.toolId)
    }
    if (input.sourceRefId !== undefined) {
      clauses.push("source_ref_id = ?")
      args.push(input.sourceRefId)
    }
    const limit = Math.max(1, Math.min(input.limit ?? 50, 500))
    const rows = db.prepare(`
      SELECT *
        FROM tool_invocations
       WHERE ${clauses.join(" AND ")}
       ORDER BY created_at DESC, id DESC
       LIMIT ?
    `).all(...args, limit) as Record<string, unknown>[]
    return rows.map(rowToInvocation)
  } finally {
    db.close()
  }
}
