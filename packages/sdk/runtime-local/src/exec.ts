import { createRequire } from "node:module"
import { harborLocalDefaultWriteToolMatcher } from "./tool-registry-actions"
import { createHarborLocalMcpToolRuntime, type HarborLocalMcpToolRuntimeInput } from "./mcp-runtime"
import { harborLocalPaths, LOCAL_WORKSPACE_ID, runHarborLocalQuickJS } from "./index"
import type { HarborLocalToolDescription } from "./tool-search"

interface Statement {
  readonly all: (...args: unknown[]) => unknown[]
}

interface SqlDatabase {
  readonly prepare: (sql: string) => Statement
  readonly close: () => void
}

type SqlDatabaseCtor = new (filename: string) => SqlDatabase

export interface HarborLocalExecRunOptions {
  readonly input?: unknown
  readonly timeoutMs?: number | undefined
  readonly confirmWrites?: boolean | undefined
  readonly isWriteTool?: ((tool: HarborLocalToolDescription) => boolean) | undefined
}

export interface HarborLocalExecRunResult {
  readonly ok: boolean
  readonly value?: unknown
  readonly error?: HarborLocalExecError | undefined
  readonly namespaces: readonly string[]
  readonly logs: readonly HarborLocalExecLogEntry[]
  readonly durationMs: number
}

export interface HarborLocalExecError {
  readonly code: "EXEC_ERROR"
  readonly message: string
}

export interface HarborLocalExecLogEntry {
  readonly level: "log" | "warn" | "error"
  readonly args: readonly unknown[]
}

export interface HarborLocalExecBinding {
  readonly namespace: string
  readonly aliases: readonly string[]
  readonly toolCount: number
}

export interface HarborLocalExecRuntimeInput extends HarborLocalMcpToolRuntimeInput {}

export interface HarborLocalExecRuntime {
  readonly run: (code: string, options?: HarborLocalExecRunOptions) => Promise<HarborLocalExecRunResult>
  readonly bindings: () => Promise<readonly HarborLocalExecBinding[]>
}

function loadDatabase(): SqlDatabaseCtor {
  const req = createRequire(import.meta.url)
  try {
    return (req("bun:sqlite") as { Database: SqlDatabaseCtor }).Database
  } catch {
    return (req("node:sqlite") as { DatabaseSync: SqlDatabaseCtor }).DatabaseSync
  }
}

function jsIdentifier(value: string): string | null {
  const cleaned = value.replace(/[^A-Za-z0-9_$]+/g, "_").replace(/^([^A-Za-z_$])/, "_$1")
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(cleaned) ? cleaned : null
}

export function harborLocalNamespaceToJsVar(namespace: string): string {
  const parts = namespace.split(/[^A-Za-z0-9_$]+/g).filter(Boolean)
  const camel = parts
    .map((part, index) => index === 0
      ? part
      : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("")
  return jsIdentifier(camel) ?? "source"
}

function toCamelCase(value: string): string {
  return value
    .split(/[^A-Za-z0-9_$]+|_/g)
    .filter(Boolean)
    .map((part, index) => index === 0
      ? part
      : `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join("")
}

function namespaceAliases(namespace: string): readonly string[] {
  const aliases = new Set<string>()
  const raw = jsIdentifier(namespace)
  if (raw) aliases.add(raw)
  const snake = jsIdentifier(namespace.replace(/[^A-Za-z0-9_$]+/g, "_"))
  if (snake) aliases.add(snake)
  aliases.add(harborLocalNamespaceToJsVar(namespace))
  return [...aliases]
}

function stripCommentsAndStrings(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/[^\n\r]*/g, " ")
    .replace(/`(?:\\[\s\S]|[^`\\])*`/g, " ")
    .replace(/"(?:\\.|[^"\\])*"/g, " ")
    .replace(/'(?:\\.|[^'\\])*'/g, " ")
}

function declaredIdentifiers(code: string): ReadonlySet<string> {
  const stripped = stripCommentsAndStrings(code)
  const declared = new Set<string>()
  for (const match of stripped.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g)) {
    if (match[1]) declared.add(match[1])
  }
  for (const match of stripped.matchAll(/\(([^)]*)\)\s*=>/g)) {
    for (const name of match[1]?.split(",") ?? []) {
      const trimmed = name.trim()
      if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(trimmed)) declared.add(trimmed)
    }
  }
  return declared
}

function referencedIdentifiers(code: string): ReadonlySet<string> {
  const stripped = stripCommentsAndStrings(code)
  const declared = declaredIdentifiers(code)
  const refs = new Set<string>()
  for (const match of stripped.matchAll(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g)) {
    const name = match[0]
    if (declared.has(name)) continue
    refs.add(name)
  }
  return refs
}

async function listExecBindings(input: HarborLocalExecRuntimeInput): Promise<readonly HarborLocalExecBinding[]> {
  const Database = loadDatabase()
  const db = new Database(harborLocalPaths(input.projectRoot).sqlite)
  try {
    const rows = db.prepare(`
      SELECT namespace, COUNT(*) AS tool_count
        FROM tool_index
       WHERE workspace_id = ?
       GROUP BY namespace
       ORDER BY namespace ASC
    `).all(LOCAL_WORKSPACE_ID) as Record<string, unknown>[]
    return rows.map((row) => {
      const namespace = String(row.namespace)
      return {
        namespace,
        aliases: namespaceAliases(namespace),
        toolCount: Number(row.tool_count ?? 0),
      }
    })
  } finally {
    db.close()
  }
}

function resolveNamespaces(code: string, bindings: readonly HarborLocalExecBinding[]): readonly {
  readonly namespace: string
  readonly alias: string
}[] {
  const refs = referencedIdentifiers(code)
  const resolved: { namespace: string; alias: string }[] = []
  const seen = new Set<string>()
  for (const binding of bindings) {
    const alias = binding.aliases.find((candidate) => refs.has(candidate))
    if (!alias || seen.has(binding.namespace)) continue
    seen.add(binding.namespace)
    resolved.push({ namespace: binding.namespace, alias })
  }
  return resolved
}

function unresolvedNamespaceReference(
  code: string,
  bindings: readonly HarborLocalExecBinding[],
  resolved: readonly { readonly alias: string }[]
): string | null {
  const refs = referencedIdentifiers(code)
  const knownAliases = new Set(bindings.flatMap((binding) => [...binding.aliases]))
  const resolvedAliases = new Set(resolved.map((binding) => binding.alias))
  for (const ref of refs) {
    if (knownAliases.has(ref) || resolvedAliases.has(ref)) continue
    if (/Mcp$/.test(ref)) return ref
  }
  return null
}

function resolveToolId(
  requestedNamespace: string,
  requestedTool: string,
  tools: readonly HarborLocalToolDescription[]
): string {
  const aliases = new Map<string, string>()
  for (const tool of tools) {
    if (tool.namespace !== requestedNamespace) continue
    aliases.set(tool.name, tool.toolId)
    aliases.set(toCamelCase(tool.name), tool.toolId)
    aliases.set(tool.name.replace(/[^A-Za-z0-9_$]+/g, "_"), tool.toolId)
  }
  const hit = aliases.get(requestedTool)
  if (hit) return hit
  const candidates = tools
    .filter((tool) => tool.namespace === requestedNamespace)
    .map((tool) => toCamelCase(tool.name))
    .slice(0, 5)
  throw new Error(`Tool "${requestedTool}" not found in namespace "${requestedNamespace}".${candidates.length ? ` Did you mean: ${candidates.join(", ")}?` : ""}`)
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === "string" && error.trim()) return error
  return "Local exec failed"
}

export function createHarborLocalExecRuntime(input: HarborLocalExecRuntimeInput): HarborLocalExecRuntime {
  return {
    bindings: () => listExecBindings(input),
    run: async (code, options = {}) => {
      const started = Date.now()
      const logs: HarborLocalExecLogEntry[] = []
      const toolRuntime = await createHarborLocalMcpToolRuntime(input)
      const bindings = await listExecBindings(input)
      const namespaces = resolveNamespaces(code, bindings)
      const missingNamespace = unresolvedNamespaceReference(code, bindings, namespaces)
      if (missingNamespace) {
        return {
          ok: false,
          error: {
            code: "EXEC_ERROR",
            message: `Namespace "${missingNamespace}" is not available. Available namespace aliases: ${bindings.flatMap((binding) => [...binding.aliases]).join(", ") || "none"}.`,
          },
          namespaces: namespaces.map((binding) => binding.namespace),
          logs,
          durationMs: Date.now() - started,
        }
      }
      const tools = namespaces.flatMap((binding) =>
        toolRuntime.schemas({ namespace: binding.namespace })
          .map((schema) => toolRuntime.describe(schema.toolId))
          .filter((tool): tool is HarborLocalToolDescription => tool !== null)
      )
      try {
        const value = await runHarborLocalQuickJS({
          code: `(async () => {\n${code}\n})()`,
          filename: "<harbor-local-exec>",
          input: options.input,
          timeoutMs: options.timeoutMs,
          namespaceBindings: namespaces,
          hostCall: async (name, payload) => {
            if (name === "logs.emit") {
              const event = payload as { level?: unknown; args?: unknown }
              logs.push({
                level: event.level === "warn" ? "warn" : event.level === "error" ? "error" : "log",
                args: Array.isArray(event.args) ? event.args : [],
              })
              return null
            }
            if (name !== "tools.namespaceCall") return null
            const request = payload as { namespace?: unknown; tool?: unknown; input?: unknown }
            const namespace = String(request.namespace ?? "")
            const toolName = String(request.tool ?? "")
            const toolId = resolveToolId(namespace, toolName, tools)
            const tool = toolRuntime.describe(toolId)
            if (!tool) throw new Error(`Unknown local exec tool: ${toolId}`)
            const isWrite = options.isWriteTool?.(tool) ?? harborLocalDefaultWriteToolMatcher({ toolId, tool })
            if (isWrite && options.confirmWrites !== true) {
              throw new Error(`Blocked write tool "${toolId}". Re-run with write confirmation enabled to allow it.`)
            }
            const result = await toolRuntime.call({ toolId, input: request.input ?? {} })
            return result.output
          },
        })
        return {
          ok: true,
          value: value.value,
          namespaces: namespaces.map((binding) => binding.namespace),
          logs,
          durationMs: Date.now() - started,
        }
      } catch (error) {
        return {
          ok: false,
          error: {
            code: "EXEC_ERROR",
            message: errorMessage(error),
          },
          namespaces: namespaces.map((binding) => binding.namespace),
          logs,
          durationMs: Date.now() - started,
        }
      }
    },
  }
}
