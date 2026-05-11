import type {
  OrbitAiClassifyResponse,
  OrbitAiEmbedResponse,
  OrbitAiModelsResponse,
  OrbitAiRerankResponse,
  OrbitAiRunArgs,
  OrbitAiSummaryResponse,
  OrbitAiTextResponse,
} from "./ai"
import type {
  OrbitAppDisableResponse,
  OrbitAppInspectResponse,
  OrbitAppListResponse,
  OrbitAppName,
  OrbitAppOpenResponse,
  OrbitAppPublishBody,
  OrbitAppPublishResponse,
  OrbitAppVersion,
} from "./apps"
import type {
  OrbitJobDisableResponse,
  OrbitJobInspectResponse,
  OrbitJobListResponse,
  OrbitJobName,
  OrbitJobPublishBody,
  OrbitJobPublishResponse,
  OrbitJobRunBody,
  OrbitJobRunResponse,
  OrbitJobVersion,
  OrbitJobVersionsResponse,
} from "./jobs"
import type {
  OrbitStorageDeleteResponse,
  OrbitStorageGetResponse,
  OrbitStorageKey,
  OrbitStorageListResponse,
  OrbitStoragePutBody,
  OrbitStorageUrlResponse,
} from "./storage"
import type {
  OrbitSocketBroadcastBody,
  OrbitSocketBroadcastResponse,
  OrbitSocketChannel,
  OrbitSocketPermission,
  OrbitSocketStatsResponse,
  OrbitSocketUrlResponse,
} from "./socket"
import type { OrbitUsageQueryResponse, OrbitUsageRow } from "./usage"

export interface OrbitToolsSearchInput {
  readonly query: string
  readonly limit?: number | undefined
  readonly source?: string | undefined
  readonly kind?: readonly string[] | undefined
}

export interface OrbitToolsDescribeInput {
  readonly toolId: string
}

export interface OrbitToolsNamespace {
  readonly namespace: string
  readonly js_var: string
  readonly kind: "mcp" | "cli" | "api"
  readonly tool_count: number
}

export interface OrbitToolsNamespacesResponse {
  readonly namespaces: readonly OrbitToolsNamespace[]
}

export interface OrbitToolsClient {
  readonly search: (input: OrbitToolsSearchInput) => Promise<unknown>
  readonly describe: (input: OrbitToolsDescribeInput) => Promise<unknown>
  readonly namespaces: () => Promise<OrbitToolsNamespacesResponse>
}

export interface OrbitSocketUrlInput {
  readonly channel: OrbitSocketChannel
  readonly permissions?: readonly OrbitSocketPermission[] | undefined
  readonly expires_in_seconds?: number | undefined
  readonly allowed_origins?: readonly string[] | undefined
}

export interface OrbitSocketClient {
  readonly url: (input: OrbitSocketUrlInput) => Promise<OrbitSocketUrlResponse>
  readonly broadcast: (input: Omit<OrbitSocketBroadcastBody, "workspace_id">) => Promise<OrbitSocketBroadcastResponse>
  readonly stats: (input: { readonly channel: OrbitSocketChannel }) => Promise<OrbitSocketStatsResponse>
}

export interface OrbitStorageClient {
  readonly list: (input?: {
    readonly prefix?: string | undefined
    readonly limit?: number | undefined
    readonly cursor?: string | undefined
  }) => Promise<OrbitStorageListResponse>
  readonly put: (input: Omit<OrbitStoragePutBody, "workspace_id">) => Promise<OrbitStorageUrlResponse>
  readonly get: (input: {
    readonly key: OrbitStorageKey
    readonly encoding?: "auto" | "metadata" | "text" | "json" | "base64" | undefined
  }) => Promise<OrbitStorageGetResponse>
  readonly url: (input: { readonly key: OrbitStorageKey }) => Promise<OrbitStorageUrlResponse>
  readonly delete: (input: { readonly key: OrbitStorageKey }) => Promise<OrbitStorageDeleteResponse>
}

export interface OrbitCacheClient {
  readonly get: <T = unknown>(key: string) => Promise<T | null>
  readonly set: (key: string, value: unknown, ttlSeconds?: number | undefined) => Promise<void>
  readonly delete: (key: string) => Promise<boolean>
}

export interface OrbitAiClient {
  readonly models: (input?: {
    readonly search?: string | undefined
    readonly task?: string | undefined
    readonly limit?: number | undefined
  }) => Promise<OrbitAiModelsResponse>
  readonly text: (input: OrbitAiRunArgs) => Promise<OrbitAiTextResponse>
  readonly generate: (input: OrbitAiRunArgs) => Promise<OrbitAiTextResponse>
  readonly summarize: (input: OrbitAiRunArgs) => Promise<OrbitAiSummaryResponse>
  readonly embed: (input: OrbitAiRunArgs) => Promise<OrbitAiEmbedResponse>
  readonly classify: (input: OrbitAiRunArgs) => Promise<OrbitAiClassifyResponse>
  readonly rerank: (input: OrbitAiRunArgs) => Promise<OrbitAiRerankResponse>
}

export interface OrbitJobsClient {
  readonly list: (input?: {
    readonly limit?: number | undefined
    readonly offset?: number | undefined
  }) => Promise<OrbitJobListResponse>
  readonly inspect: (input: {
    readonly name: OrbitJobName
    readonly version?: OrbitJobVersion | undefined
  }) => Promise<OrbitJobInspectResponse>
  readonly publish: (input: Omit<OrbitJobPublishBody, "workspace_id">) => Promise<OrbitJobPublishResponse>
  readonly run: (input: Omit<OrbitJobRunBody, "workspace_id">) => Promise<OrbitJobRunResponse>
  readonly versions: (input: { readonly name: OrbitJobName }) => Promise<OrbitJobVersionsResponse>
  readonly disable: (input: {
    readonly name: OrbitJobName
    readonly version?: OrbitJobVersion | undefined
  }) => Promise<OrbitJobDisableResponse>
}

export interface OrbitAppsClient {
  readonly list: (input?: {
    readonly limit?: number | undefined
    readonly offset?: number | undefined
  }) => Promise<OrbitAppListResponse>
  readonly inspect: (input: {
    readonly name: OrbitAppName
    readonly version?: OrbitAppVersion | undefined
  }) => Promise<OrbitAppInspectResponse>
  readonly publish: (input: Omit<OrbitAppPublishBody, "workspace_id">) => Promise<OrbitAppPublishResponse>
  readonly open: (input: {
    readonly name: OrbitAppName
    readonly path?: string | undefined
  }) => Promise<OrbitAppOpenResponse>
  readonly disable: (input: {
    readonly name: OrbitAppName
    readonly version?: OrbitAppVersion | undefined
  }) => Promise<OrbitAppDisableResponse>
}

export interface OrbitDbStatement {
  readonly sql: string
  readonly params?: readonly unknown[] | undefined
}

export interface OrbitDbMutationResponse {
  readonly changes: number
  readonly meta: Record<string, unknown>
}

export interface OrbitDbRowsResponse {
  readonly rows: readonly Record<string, unknown>[]
  readonly meta: Record<string, unknown>
}

export interface OrbitDbFirstResponse {
  readonly row: Record<string, unknown> | null
  readonly meta: Record<string, unknown>
}

export interface OrbitDbBatchResponse {
  readonly results: readonly OrbitDbRowsResponse[]
}

export interface OrbitDbRuntimeClient {
  readonly exec: (sql: string, params?: readonly unknown[] | undefined) => Promise<OrbitDbMutationResponse>
  readonly query: (sql: string, params?: readonly unknown[] | undefined) => Promise<OrbitDbRowsResponse>
  readonly first: (sql: string, params?: readonly unknown[] | undefined) => Promise<OrbitDbFirstResponse>
  readonly batch: (statements: readonly OrbitDbStatement[]) => Promise<OrbitDbBatchResponse>
}

export interface OrbitUsageClient {
  readonly list: (input?: {
    readonly runId?: string | undefined
    readonly operation?: string | undefined
    readonly limit?: number | undefined
    readonly offset?: number | undefined
  }) => Promise<OrbitUsageQueryResponse>
}

export interface OrbitRuntime {
  readonly storage: OrbitStorageClient
  readonly cache: OrbitCacheClient
  readonly ai?: OrbitAiClient | undefined
  readonly jobs?: OrbitJobsClient | undefined
  readonly apps?: OrbitAppsClient | undefined
  readonly db?: OrbitDbRuntimeClient | undefined
  readonly tools?: OrbitToolsClient | undefined
  readonly socket?: OrbitSocketClient | undefined
  readonly usage: OrbitUsageClient
}

export interface MemoryOrbitRuntimeInput {
  readonly now?: (() => Date) | undefined
  readonly id?: (() => string) | undefined
  readonly ai?: OrbitAiClient | undefined
  readonly jobs?: OrbitJobsClient | undefined
  readonly apps?: OrbitAppsClient | undefined
  readonly db?: OrbitDbRuntimeClient | undefined
  readonly tools?: OrbitToolsClient | undefined
  readonly socket?: OrbitSocketClient | undefined
}

interface StoredObject {
  readonly key: string
  readonly data: unknown
  readonly contentType: string
  readonly uploaded: string
}

interface CacheEntry {
  readonly value: unknown
  readonly expiresAt: number | null
}

function defaultId(): string {
  const crypto = (globalThis as { readonly crypto?: { readonly randomUUID?: () => string } }).crypto
  return crypto?.randomUUID?.() ?? `orbit_${Math.random().toString(36).slice(2)}`
}

function dataSize(value: unknown): number {
  if (typeof value === "string") return new TextEncoder().encode(value).byteLength
  return new TextEncoder().encode(JSON.stringify(value)).byteLength
}

function objectUrl(key: string, now: () => Date): OrbitStorageUrlResponse {
  const expiresAt = new Date(now().getTime() + 1_800_000).toISOString()
  return {
    key,
    download_url: `memory://orbit/storage/${encodeURIComponent(key)}`,
    expires_at: expiresAt,
    expires_in_seconds: 1800,
  }
}

export function createMemoryOrbitRuntime(input: MemoryOrbitRuntimeInput = {}): OrbitRuntime {
  const now = input.now ?? (() => new Date())
  const id = input.id ?? defaultId
  const objects = new Map<string, StoredObject>()
  const cache = new Map<string, CacheEntry>()
  const usageRows: OrbitUsageRow[] = []

  function record(operation: string, key?: string | null, sizeBytes?: number | null): void {
    usageRows.push({
      id: id(),
      run_id: null,
      workspace_id: "11111111-1111-4111-8111-111111111111",
      operation,
      key: key ?? null,
      model: null,
      size_bytes: sizeBytes ?? null,
      duration_ms: 0,
      error: null,
      created_at: now().toISOString(),
    })
  }

  return {
    storage: {
      list: async (listInput = {}) => {
        const limit = Math.max(1, Math.min(listInput.limit ?? 100, 500))
        const offset = listInput.cursor ? Number(listInput.cursor) : 0
        const rows = [...objects.values()]
          .filter((object) => listInput.prefix === undefined || object.key.startsWith(listInput.prefix))
          .sort((a, b) => a.key.localeCompare(b.key))
        const page = rows.slice(offset, offset + limit + 1)
        const visible = page.slice(0, limit)
        record("storage.list", listInput.prefix ?? null, null)
        return {
          objects: visible.map((object) => ({
            ...objectUrl(object.key, now),
            size: dataSize(object.data),
            uploaded: object.uploaded,
            content_type: object.contentType,
          })),
          truncated: page.length > limit,
          ...(page.length > limit ? { cursor: String(offset + limit) } : {}),
        }
      },
      put: async (putInput) => {
        const contentType =
          putInput.content_type ??
          (putInput.encoding === "json" ? "application/json" : "application/octet-stream")
        objects.set(putInput.key, {
          key: putInput.key,
          data: putInput.data,
          contentType,
          uploaded: now().toISOString(),
        })
        record("storage.put", putInput.key, dataSize(putInput.data))
        return objectUrl(putInput.key, now)
      },
      get: async (getInput) => {
        const object = objects.get(getInput.key)
        record("storage.get", getInput.key, null)
        if (!object) return null
        const encoding = getInput.encoding === undefined || getInput.encoding === "auto" ? "json" : getInput.encoding
        return {
          ...objectUrl(object.key, now),
          size: dataSize(object.data),
          uploaded: object.uploaded,
          content_type: object.contentType,
          encoding,
          ...(encoding === "metadata" ? {} : { data: object.data }),
        }
      },
      url: async ({ key }) => {
        record("storage.url", key, null)
        if (!objects.has(key)) throw new Error(`Orbit storage object "${key}" is not registered.`)
        return objectUrl(key, now)
      },
      delete: async ({ key }) => {
        const deleted = objects.delete(key)
        record("storage.delete", key, null)
        return { key, deleted }
      },
    },
    cache: {
      get: async <T = unknown>(key: string) => {
        const entry = cache.get(key)
        record("cache.get", key, null)
        if (!entry) return null
        if (entry.expiresAt !== null && entry.expiresAt <= now().getTime()) {
          cache.delete(key)
          return null
        }
        return entry.value as T
      },
      set: async (key, value, ttlSeconds) => {
        cache.set(key, {
          value,
          expiresAt: ttlSeconds === undefined ? null : now().getTime() + ttlSeconds * 1000,
        })
        record("cache.set", key, dataSize(value))
      },
      delete: async (key) => {
        const deleted = cache.delete(key)
        record("cache.delete", key, null)
        return deleted
      },
    },
    ...(input.ai ? { ai: input.ai } : {}),
    ...(input.jobs ? { jobs: input.jobs } : {}),
    ...(input.apps ? { apps: input.apps } : {}),
    ...(input.db ? { db: input.db } : {}),
    ...(input.tools ? { tools: input.tools } : {}),
    ...(input.socket ? { socket: input.socket } : {}),
    usage: {
      list: async (usageInput = {}) => {
        const filtered = usageRows.filter((row) => {
          if (usageInput.runId !== undefined && row.run_id !== usageInput.runId) return false
          if (usageInput.operation !== undefined && row.operation !== usageInput.operation) return false
          return true
        })
        const limit = Math.max(1, Math.min(usageInput.limit ?? 100, 500))
        const offset = Math.max(0, usageInput.offset ?? 0)
        return {
          data: filtered.slice(offset, offset + limit),
          limit,
          offset,
        }
      },
    },
  }
}
