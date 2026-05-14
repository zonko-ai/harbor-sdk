import { createRequire } from "node:module"
import { harborLocalPaths, LOCAL_WORKSPACE_ID } from "./index"
import { ensureHarborLocalProject } from "./index"
import { readHarborLocalCredentials } from "./credentials"
import { createHarborLocalToolIndex, type HarborLocalToolIndex, type HarborLocalToolIndexOptions, type HarborLocalToolIndexRecord } from "./tool-search"
import type { HarborLocalPackageManifest, HarborLocalPackageToolMetadata } from "./package-format"

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

export interface HarborLocalPluginInstallResult {
  readonly packageId: string
  readonly sourceRefs: readonly HarborLocalSourceRef[]
  readonly tools: readonly HarborLocalToolIndexRecord[]
}

export interface HarborLocalSourceRef {
  readonly id: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly kind: "plugin"
  readonly name: string
  readonly path: string
  readonly manifest: HarborLocalPackageManifest
  readonly toolCount: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalCredentialResolverInput {
  readonly key: string
}

export interface HarborLocalCredentialResolveInput {
  readonly workspaceId: string
  readonly sourceId: string
  readonly slots?: readonly string[] | undefined
}

export interface HarborLocalResolvedCredentials {
  readonly get: (slot: string) => string | undefined
  readonly require: (slot: string) => string
  readonly has: (slot: string) => boolean
  readonly slots: () => readonly string[]
}

export interface HarborLocalCredentialResolver {
  readonly resolve: (input: HarborLocalCredentialResolveInput) => Promise<HarborLocalResolvedCredentials>
}

function loadDatabase(): SqlDatabaseCtor {
  const req = createRequire(import.meta.url)
  try {
    return (req("bun:sqlite") as { Database: SqlDatabaseCtor }).Database
  } catch {
    try {
      return (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
    } catch {
      throw new Error("Local plugin store requires bun:sqlite or node:sqlite")
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

function sourceRefId(manifest: HarborLocalPackageManifest, namespace: string): string {
  return `source:${manifest.name}:${namespace}`
}

function packageId(manifest: HarborLocalPackageManifest): string {
  return `package:${manifest.kind}:${manifest.name}`
}

function toolRecord(
  manifest: HarborLocalPackageManifest,
  tool: HarborLocalPackageToolMetadata
): HarborLocalToolIndexRecord {
  const sourceRef = sourceRefId(manifest, tool.namespace)
  return {
    id: `tool:${sourceRef}:${tool.name}`,
    workspaceId: LOCAL_WORKSPACE_ID,
    sourceRefId: sourceRef,
    namespace: tool.namespace,
    name: tool.name,
    displayName: tool.displayName,
    ...(tool.description !== undefined ? { description: tool.description } : {}),
    ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
    ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema } : {}),
    searchText: [
      manifest.name,
      tool.namespace,
      tool.name,
      tool.displayName,
      tool.description ?? "",
    ].join(" "),
  }
}

function parseJson<T>(value: unknown): T | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined
  return JSON.parse(value) as T
}

function resolvedCredentials(values: ReadonlyMap<string, string>): HarborLocalResolvedCredentials {
  return {
    get: (slot) => values.get(slot),
    require: (slot) => {
      const value = values.get(slot)
      if (value === undefined) throw new Error(`Missing local credential for slot "${slot}"`)
      return value
    },
    has: (slot) => values.has(slot),
    slots: () => [...values.keys()],
  }
}

export async function installHarborLocalPluginManifest(input: {
  readonly projectRoot: string
  readonly manifest: HarborLocalPackageManifest
  readonly now?: (() => Date) | undefined
}): Promise<HarborLocalPluginInstallResult> {
  if (input.manifest.kind !== "plugin") {
    throw new Error("Only plugin package manifests can be installed as local plugins")
  }
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })

  const createdAt = timestamp(input.now)
  const tools = (input.manifest.tools ?? []).map((tool) => toolRecord(input.manifest, tool))
  const sourceIds = [...new Set(tools.map((tool) => tool.sourceRefId))]
  const db = openDatabase(input.projectRoot)
  try {
    db.exec("BEGIN")
    db.prepare(
      `INSERT OR REPLACE INTO package_metadata
        (id, workspace_id, kind, name, version, owner, manifest_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      packageId(input.manifest),
      LOCAL_WORKSPACE_ID,
      input.manifest.kind,
      input.manifest.name,
      input.manifest.version,
      JSON.stringify(input.manifest.owner),
      JSON.stringify(input.manifest),
      createdAt,
      createdAt
    )

    for (const sourceId of sourceIds) {
      const namespace = sourceId.split(":").at(-1) ?? sourceId
      db.prepare(
        `INSERT OR REPLACE INTO source_refs
          (id, workspace_id, kind, name, path, manifest_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        sourceId,
        LOCAL_WORKSPACE_ID,
        "plugin",
        namespace,
        input.manifest.source.path,
        JSON.stringify(input.manifest),
        createdAt,
        createdAt
      )
    }

    for (const sourceId of sourceIds) {
      db.prepare("DELETE FROM tool_index WHERE workspace_id = ? AND source_ref_id = ?")
        .run(LOCAL_WORKSPACE_ID, sourceId)
    }
    for (const tool of tools) {
      db.prepare(
        `INSERT INTO tool_index
          (id, workspace_id, source_ref_id, namespace, name, display_name, description,
           input_schema_json, output_schema_json, search_text, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        tool.id,
        tool.workspaceId,
        tool.sourceRefId,
        tool.namespace,
        tool.name,
        tool.displayName,
        tool.description ?? null,
        tool.inputSchema === undefined ? null : JSON.stringify(tool.inputSchema),
        tool.outputSchema === undefined ? null : JSON.stringify(tool.outputSchema),
        tool.searchText,
        createdAt,
        createdAt
      )
    }
    db.exec("COMMIT")
  } catch (error) {
    db.exec("ROLLBACK")
    throw error
  } finally {
    db.close()
  }

  const sources = await listHarborLocalSources(input.projectRoot)
  return {
    packageId: packageId(input.manifest),
    sourceRefs: sources.filter((source) => sourceIds.includes(source.id)),
    tools,
  }
}

export async function listHarborLocalSources(projectRoot: string): Promise<readonly HarborLocalSourceRef[]> {
  await ensureHarborLocalProject({ projectRoot, updateGitignore: false })
  const db = openDatabase(projectRoot)
  try {
    const rows = db.prepare(
      `SELECT source_refs.*, COUNT(tool_index.id) AS tool_count
         FROM source_refs
         LEFT JOIN tool_index ON tool_index.source_ref_id = source_refs.id
        WHERE source_refs.workspace_id = ?
        GROUP BY source_refs.id
        ORDER BY source_refs.name ASC`
    ).all(LOCAL_WORKSPACE_ID) as Array<Record<string, unknown>>

    return rows.map((row) => ({
      id: String(row.id),
      workspaceId: LOCAL_WORKSPACE_ID,
      kind: "plugin" as const,
      name: String(row.name),
      path: String(row.path),
      manifest: parseJson<HarborLocalPackageManifest>(row.manifest_json) as HarborLocalPackageManifest,
      toolCount: Number(row.tool_count ?? 0),
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
    }))
  } finally {
    db.close()
  }
}

export async function buildHarborLocalToolIndexFromSqlite(
  projectRoot: string,
  options: HarborLocalToolIndexOptions = {}
): Promise<HarborLocalToolIndex> {
  await ensureHarborLocalProject({ projectRoot, updateGitignore: false })
  const db = openDatabase(projectRoot)
  try {
    const rows = db.prepare(
      `SELECT id, workspace_id, source_ref_id, namespace, name, display_name, description,
              input_schema_json, output_schema_json, search_text
         FROM tool_index
        WHERE workspace_id = ?
        ORDER BY namespace ASC, name ASC`
    ).all(LOCAL_WORKSPACE_ID) as Array<Record<string, unknown>>

    const records = rows.map((row): HarborLocalToolIndexRecord => ({
      id: String(row.id),
      workspaceId: LOCAL_WORKSPACE_ID,
      sourceRefId: String(row.source_ref_id),
      namespace: String(row.namespace),
      name: String(row.name),
      displayName: String(row.display_name),
      ...(typeof row.description === "string" ? { description: row.description } : {}),
      ...(typeof row.input_schema_json === "string"
        ? { inputSchema: JSON.parse(row.input_schema_json) as unknown }
        : {}),
      ...(typeof row.output_schema_json === "string"
        ? { outputSchema: JSON.parse(row.output_schema_json) as unknown }
        : {}),
      searchText: String(row.search_text),
    }))
    return createHarborLocalToolIndex(records, options)
  } finally {
    db.close()
  }
}

export function createHarborLocalCredentialResolver(
  projectRoot: string,
  input: HarborLocalCredentialResolverInput
): HarborLocalCredentialResolver {
  return {
    resolve: async (resolveInput) => {
      const file = await readHarborLocalCredentials(projectRoot, input.key)
      const values = new Map<string, string>()
      for (const credential of file.credentials) {
        if (credential.status !== "active") continue
        if (credential.sourceRefId !== resolveInput.sourceId) continue
        if (resolveInput.slots && !resolveInput.slots.includes(credential.slot)) continue
        values.set(credential.slot, credential.value)
      }
      return resolvedCredentials(values)
    },
  }
}
