const BASE = import.meta.env.DEV ? "" : ""

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE + path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  })
  const payload = await response.json()
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message ?? `Request failed: ${response.status}`)
  }
  return payload.data as T
}

export interface HealthData {
  status: string
  projectRoot: string
  host: string
  port: number
}

export interface CatalogEntry {
  slug: string
  displayName: string
  description?: string
  category?: string
  defaultNamespace: string
  endpoint: string
  transport?: string
  auth?: {
    mode?: "oauth2" | "bearer" | "query" | "none"
    requiredSecrets?: string[]
    headerName?: string
    queryParam?: string
  }
  oauthDiscovery?: unknown
  localAvailability?: {
    selectable?: boolean
  }
  iconUrl?: string
}

export interface InstalledSource {
  id: string
  name?: string
  namespace?: string
  endpoint?: string
  command?: string
  status: string
  auth?: { kind: string }
  oauth?: { status?: string; sourceRefId?: string }
}

export interface InvocationTrace {
  id?: string
  toolId?: string
  namespace?: string
  ok?: boolean
  status?: string
  createdAt?: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  input?: unknown
  output?: unknown
  error?: unknown
}

export interface ToolHit {
  toolId: string
  namespace?: string
  description?: string
  score?: number
}

export const api = {
  health: () => request<HealthData>("/health"),
  catalog: () =>
    request<{ entries: CatalogEntry[]; total: number }>("/api/catalog"),
  sources: () =>
    request<{ sources: InstalledSource[]; total: number }>("/api/sources"),
  install: (body: Record<string, unknown>) =>
    request<{
      source: InstalledSource
      oauth?: { sourceId: string; authorizationUrl: string }
    }>("/api/sources/install", { method: "POST", body: JSON.stringify(body) }),
  connect: (body: Record<string, unknown>) =>
    request<{ sourceId: string; authorizationUrl: string }>(
      "/api/sources/connect",
      { method: "POST", body: JSON.stringify(body) },
    ),
  refresh: (sourceId: string) =>
    request<{ toolCount: number }>("/api/sources/refresh", {
      method: "POST",
      body: JSON.stringify({ sourceId }),
    }),
  remove: (sourceId: string) =>
    request<{ sourceId: string; removed: boolean }>("/api/sources/remove", {
      method: "POST",
      body: JSON.stringify({ sourceId }),
    }),
  searchTools: (query: string, limit = 30, namespace?: string) =>
    request<{ hits: ToolHit[] }>("/api/tools/search", {
      method: "POST",
      body: JSON.stringify({ query, limit, namespace }),
    }),
  toolSchema: (toolId: string) =>
    request<unknown>("/api/tools/schema", {
      method: "POST",
      body: JSON.stringify({ toolId }),
    }),
  invokeTool: (toolId: string, input: unknown) =>
    request<unknown>("/api/tools/invoke", {
      method: "POST",
      body: JSON.stringify({ toolId, input, confirmWrites: true }),
    }),
  invocations: (limit = 50) =>
    request<{ invocations: InvocationTrace[] }>(
      `/api/invocations?limit=${limit}`,
    ),
}
