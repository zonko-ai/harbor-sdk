import { createRequire } from "node:module"
import { ensureHarborLocalProject, LOCAL_WORKSPACE_ID, harborLocalPaths } from "./index"

interface Statement {
  readonly run: (...args: unknown[]) => unknown
  readonly all: (...args: unknown[]) => unknown[]
}

interface SqlDatabase {
  readonly prepare: (sql: string) => Statement
  readonly close: () => void
}

type SqlDatabaseCtor = new (filename: string) => SqlDatabase

export type HarborLocalMcpRemoteTransport = "streamable-http" | "sse" | "auto"

export type HarborLocalMcpCredentialInput =
  | string
  | {
      readonly kind: "binding"
      readonly slot: string
      readonly prefix?: string | undefined
    }

export type HarborLocalMcpAuthInput =
  | { readonly kind: "none" }
  | {
      readonly kind: "header"
      readonly headerName: string
      readonly secretSlot: string
      readonly prefix?: string | undefined
    }
  | {
      readonly kind: "oauth2"
      readonly connectionSlot?: string | undefined
      readonly clientIdSlot?: string | undefined
      readonly clientSecretSlot?: string | undefined
    }

export type HarborLocalMcpSourceInput =
  | {
      readonly transport: "remote"
      readonly name: string
      readonly endpoint: string
      readonly namespace?: string | undefined
      readonly remoteTransport?: HarborLocalMcpRemoteTransport | undefined
      readonly headers?: Readonly<Record<string, HarborLocalMcpCredentialInput>> | undefined
      readonly queryParams?: Readonly<Record<string, HarborLocalMcpCredentialInput>> | undefined
      readonly auth?: HarborLocalMcpAuthInput | undefined
      readonly status?: HarborLocalMcpSourceStatus | undefined
    }
  | {
      readonly transport: "stdio"
      readonly name: string
      readonly command: string
      readonly args?: readonly string[] | undefined
      readonly env?: Readonly<Record<string, string>> | undefined
      readonly cwd?: string | undefined
      readonly namespace?: string | undefined
      readonly status?: HarborLocalMcpSourceStatus | undefined
    }

export type HarborLocalMcpSourceStatus = "installed" | "requires_auth" | "ready" | "error"

export interface HarborLocalMcpStoredSource {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly transport: "remote" | "stdio"
  readonly name: string
  readonly namespace: string
  readonly status: HarborLocalMcpSourceStatus
  readonly endpoint?: string | undefined
  readonly remoteTransport?: HarborLocalMcpRemoteTransport | undefined
  readonly command?: string | undefined
  readonly args?: readonly string[] | undefined
  readonly env?: Readonly<Record<string, string>> | undefined
  readonly cwd?: string | undefined
  readonly auth: HarborLocalMcpAuthInput
  readonly headers: Readonly<Record<string, HarborLocalMcpCredentialInput>>
  readonly queryParams: Readonly<Record<string, HarborLocalMcpCredentialInput>>
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalMcpToolBindingInput {
  readonly toolId: string
  readonly toolName: string
  readonly description?: string | undefined
  readonly inputSchema?: unknown
  readonly outputSchema?: unknown
  readonly annotations?: unknown
}

export interface HarborLocalMcpToolBinding extends HarborLocalMcpToolBindingInput {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly sourceId: string
  readonly namespace: string
  readonly createdAt: string
  readonly updatedAt: string
}

function loadDatabase(): SqlDatabaseCtor {
  const req = createRequire(import.meta.url)
  try {
    return (req("bun:sqlite") as { Database: SqlDatabaseCtor }).Database
  } catch {
    try {
      return (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
    } catch {
      throw new Error("Local MCP store requires bun:sqlite or node:sqlite")
    }
  }
}

function openDatabase(projectRoot: string): SqlDatabase {
  const Database = loadDatabase()
  return new Database(harborLocalPaths(projectRoot).sqlite)
}

function timestamp(now: (() => Date) | undefined): string {
  return (now ?? (() => new Date()))().toISOString()
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "mcp"
}

function namespaceFor(input: HarborLocalMcpSourceInput): string {
  if (input.namespace?.trim()) return input.namespace.trim()
  if (input.name.trim()) return slugify(input.name)
  if (input.transport === "remote") return slugify(new URL(input.endpoint).hostname)
  return slugify(input.command.split(/[\\/]/).pop() ?? input.command)
}

function sourceIdFor(input: HarborLocalMcpSourceInput): string {
  return namespaceFor(input)
}

function authFor(input: HarborLocalMcpSourceInput): HarborLocalMcpAuthInput {
  if (input.transport === "stdio") return { kind: "none" }
  return input.auth ?? { kind: "none" }
}

function json(value: unknown): string | null {
  return value === undefined ? null : JSON.stringify(value)
}

function parseJson<T>(value: unknown): T | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined
  return JSON.parse(value) as T
}

function authColumns(auth: HarborLocalMcpAuthInput): Record<string, unknown> {
  if (auth.kind === "header") {
    return {
      auth_kind: "header",
      auth_header_name: auth.headerName,
      auth_header_slot: auth.secretSlot,
      auth_header_prefix: auth.prefix ?? null,
      auth_connection_slot: null,
      auth_client_id_slot: null,
      auth_client_secret_slot: null,
    }
  }
  if (auth.kind === "oauth2") {
    return {
      auth_kind: "oauth2",
      auth_header_name: null,
      auth_header_slot: null,
      auth_header_prefix: null,
      auth_connection_slot: auth.connectionSlot ?? "auth:oauth2:connection",
      auth_client_id_slot: auth.clientIdSlot ?? null,
      auth_client_secret_slot: auth.clientSecretSlot ?? null,
    }
  }
  return {
    auth_kind: "none",
    auth_header_name: null,
    auth_header_slot: null,
    auth_header_prefix: null,
    auth_connection_slot: null,
    auth_client_id_slot: null,
    auth_client_secret_slot: null,
  }
}

function authFromRow(row: Record<string, unknown>): HarborLocalMcpAuthInput {
  if (row["auth_kind"] === "header") {
    return {
      kind: "header",
      headerName: String(row["auth_header_name"] ?? ""),
      secretSlot: String(row["auth_header_slot"] ?? "auth:header"),
      ...(typeof row["auth_header_prefix"] === "string" ? { prefix: row["auth_header_prefix"] } : {}),
    }
  }
  if (row["auth_kind"] === "oauth2") {
    return {
      kind: "oauth2",
      connectionSlot: String(row["auth_connection_slot"] ?? "auth:oauth2:connection"),
      ...(typeof row["auth_client_id_slot"] === "string" ? { clientIdSlot: row["auth_client_id_slot"] } : {}),
      ...(typeof row["auth_client_secret_slot"] === "string" ? { clientSecretSlot: row["auth_client_secret_slot"] } : {}),
    }
  }
  return { kind: "none" }
}

function credentialRows(
  sourceId: string,
  values: Readonly<Record<string, HarborLocalMcpCredentialInput>> | undefined
): ReadonlyArray<{ id: string; name: string; kind: "text" | "binding"; textValue: string | null; slot: string | null; prefix: string | null }> {
  return Object.entries(values ?? {}).map(([name, value]) => {
    if (typeof value === "string") {
      return { id: JSON.stringify([sourceId, name]), name, kind: "text", textValue: value, slot: null, prefix: null }
    }
    return {
      id: JSON.stringify([sourceId, name]),
      name,
      kind: "binding",
      textValue: null,
      slot: value.slot,
      prefix: value.prefix ?? null,
    }
  })
}

function credentialsFromRows(rows: readonly Record<string, unknown>[]): Record<string, HarborLocalMcpCredentialInput> {
  const out: Record<string, HarborLocalMcpCredentialInput> = {}
  for (const row of rows) {
    const name = row["name"]
    if (typeof name !== "string") continue
    if (row["kind"] === "text" && typeof row["text_value"] === "string") {
      out[name] = row["text_value"]
      continue
    }
    if (row["kind"] === "binding" && typeof row["slot"] === "string") {
      out[name] = {
        kind: "binding",
        slot: row["slot"],
        ...(typeof row["prefix"] === "string" ? { prefix: row["prefix"] } : {}),
      }
    }
  }
  return out
}

export async function upsertHarborLocalMcpSource(input: {
  readonly projectRoot: string
  readonly source: HarborLocalMcpSourceInput
  readonly now?: (() => Date) | undefined
}): Promise<HarborLocalMcpStoredSource> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const db = openDatabase(input.projectRoot)
  const id = sourceIdFor(input.source)
  const namespace = namespaceFor(input.source)
  const now = timestamp(input.now)
  const auth = authFor(input.source)
  const authCols = authColumns(auth)
  try {
    const existing = db.prepare("SELECT created_at FROM mcp_sources WHERE id = ? AND workspace_id = ?").all(id, LOCAL_WORKSPACE_ID)[0] as Record<string, unknown> | undefined
    db.prepare("DELETE FROM mcp_source_headers WHERE workspace_id = ? AND source_id = ?").run(LOCAL_WORKSPACE_ID, id)
    db.prepare("DELETE FROM mcp_source_query_params WHERE workspace_id = ? AND source_id = ?").run(LOCAL_WORKSPACE_ID, id)
    db.prepare(`
      INSERT OR REPLACE INTO mcp_sources (
        id, workspace_id, transport, name, namespace, endpoint, remote_transport, command,
        args_json, env_json, cwd, auth_kind, auth_header_name, auth_header_slot,
        auth_header_prefix, auth_connection_slot, auth_client_id_slot,
        auth_client_secret_slot, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      LOCAL_WORKSPACE_ID,
      input.source.transport,
      input.source.name,
      namespace,
      input.source.transport === "remote" ? input.source.endpoint : null,
      input.source.transport === "remote" ? (input.source.remoteTransport ?? "auto") : null,
      input.source.transport === "stdio" ? input.source.command : null,
      input.source.transport === "stdio" ? json(input.source.args) : null,
      input.source.transport === "stdio" ? json(input.source.env) : null,
      input.source.transport === "stdio" ? (input.source.cwd ?? null) : null,
      authCols["auth_kind"],
      authCols["auth_header_name"],
      authCols["auth_header_slot"],
      authCols["auth_header_prefix"],
      authCols["auth_connection_slot"],
      authCols["auth_client_id_slot"],
      authCols["auth_client_secret_slot"],
      input.source.status ?? (auth.kind === "none" ? "installed" : "requires_auth"),
      typeof existing?.["created_at"] === "string" ? existing["created_at"] : now,
      now
    )
    if (input.source.transport === "remote") {
      const insert = db.prepare(`
        INSERT INTO mcp_source_headers (id, workspace_id, source_id, name, kind, text_value, slot, prefix)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const row of credentialRows(id, input.source.headers)) {
        insert.run(row.id, LOCAL_WORKSPACE_ID, id, row.name, row.kind, row.textValue, row.slot, row.prefix)
      }
      const insertParam = db.prepare(`
        INSERT INTO mcp_source_query_params (id, workspace_id, source_id, name, kind, text_value, slot, prefix)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      for (const row of credentialRows(id, input.source.queryParams)) {
        insertParam.run(row.id, LOCAL_WORKSPACE_ID, id, row.name, row.kind, row.textValue, row.slot, row.prefix)
      }
    }
    const source = await readHarborLocalMcpSource(input.projectRoot, id)
    if (!source) throw new Error(`Failed to read local MCP source "${id}" after upsert`)
    return source
  } finally {
    db.close()
  }
}

export async function readHarborLocalMcpSource(
  projectRoot: string,
  sourceId: string
): Promise<HarborLocalMcpStoredSource | null> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  try {
    const row = db.prepare("SELECT * FROM mcp_sources WHERE workspace_id = ? AND id = ?").all(LOCAL_WORKSPACE_ID, sourceId)[0] as Record<string, unknown> | undefined
    if (!row) return null
    const headers = db.prepare("SELECT * FROM mcp_source_headers WHERE workspace_id = ? AND source_id = ?").all(LOCAL_WORKSPACE_ID, sourceId) as Record<string, unknown>[]
    const queryParams = db.prepare("SELECT * FROM mcp_source_query_params WHERE workspace_id = ? AND source_id = ?").all(LOCAL_WORKSPACE_ID, sourceId) as Record<string, unknown>[]
    return {
      id: String(row["id"]),
      workspaceId: LOCAL_WORKSPACE_ID,
      transport: row["transport"] === "stdio" ? "stdio" : "remote",
      name: String(row["name"]),
      namespace: String(row["namespace"]),
      status: String(row["status"]) as HarborLocalMcpSourceStatus,
      ...(typeof row["endpoint"] === "string" ? { endpoint: row["endpoint"] } : {}),
      ...(typeof row["remote_transport"] === "string" ? { remoteTransport: row["remote_transport"] as HarborLocalMcpRemoteTransport } : {}),
      ...(typeof row["command"] === "string" ? { command: row["command"] } : {}),
      ...(parseJson<readonly string[]>(row["args_json"]) ? { args: parseJson<readonly string[]>(row["args_json"]) } : {}),
      ...(parseJson<Readonly<Record<string, string>>>(row["env_json"]) ? { env: parseJson<Readonly<Record<string, string>>>(row["env_json"]) } : {}),
      ...(typeof row["cwd"] === "string" ? { cwd: row["cwd"] } : {}),
      auth: authFromRow(row),
      headers: credentialsFromRows(headers),
      queryParams: credentialsFromRows(queryParams),
      createdAt: String(row["created_at"]),
      updatedAt: String(row["updated_at"]),
    }
  } finally {
    db.close()
  }
}

export async function putHarborLocalMcpToolBindings(input: {
  readonly projectRoot: string
  readonly sourceId: string
  readonly namespace: string
  readonly tools: readonly HarborLocalMcpToolBindingInput[]
  readonly now?: (() => Date) | undefined
}): Promise<readonly HarborLocalMcpToolBinding[]> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const db = openDatabase(input.projectRoot)
  const now = timestamp(input.now)
  try {
    db.prepare("DELETE FROM mcp_tool_bindings WHERE workspace_id = ? AND source_id = ?").run(LOCAL_WORKSPACE_ID, input.sourceId)
    const insert = db.prepare(`
      INSERT INTO mcp_tool_bindings (
        id, workspace_id, source_id, namespace, tool_id, tool_name, description,
        input_schema_json, output_schema_json, annotations_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const tool of input.tools) {
      insert.run(
        `${input.namespace}.${tool.toolId}`,
        LOCAL_WORKSPACE_ID,
        input.sourceId,
        input.namespace,
        tool.toolId,
        tool.toolName,
        tool.description ?? null,
        json(tool.inputSchema),
        json(tool.outputSchema),
        json(tool.annotations),
        now,
        now
      )
    }
    return listHarborLocalMcpToolBindings(input.projectRoot, input.sourceId)
  } finally {
    db.close()
  }
}

export async function listHarborLocalMcpToolBindings(
  projectRoot: string,
  sourceId: string
): Promise<readonly HarborLocalMcpToolBinding[]> {
  await ensureHarborLocalProject({ projectRoot })
  const db = openDatabase(projectRoot)
  try {
    const rows = db.prepare(`
      SELECT * FROM mcp_tool_bindings
      WHERE workspace_id = ? AND source_id = ?
      ORDER BY id ASC
    `).all(LOCAL_WORKSPACE_ID, sourceId) as Record<string, unknown>[]
    return rows.map((row) => ({
      id: String(row["id"]),
      workspaceId: LOCAL_WORKSPACE_ID,
      sourceId: String(row["source_id"]),
      namespace: String(row["namespace"]),
      toolId: String(row["tool_id"]),
      toolName: String(row["tool_name"]),
      ...(typeof row["description"] === "string" ? { description: row["description"] } : {}),
      ...(parseJson(row["input_schema_json"]) !== undefined ? { inputSchema: parseJson(row["input_schema_json"]) } : {}),
      ...(parseJson(row["output_schema_json"]) !== undefined ? { outputSchema: parseJson(row["output_schema_json"]) } : {}),
      ...(parseJson(row["annotations_json"]) !== undefined ? { annotations: parseJson(row["annotations_json"]) } : {}),
      createdAt: String(row["created_at"]),
      updatedAt: String(row["updated_at"]),
    }))
  } finally {
    db.close()
  }
}
