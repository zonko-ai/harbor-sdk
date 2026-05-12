import { listRegistryEntries, type PluginRegistryPublicEntry } from "@hrbr/registry"
import { createMemoryTraceWriter, type Run, type RunGraph, type TraceWriter } from "@hrbr/runs"
import { defineSourceAdapter, type SourceAdapter, type SourceToolDefinition } from "@hrbr/source-core"
import {
  createCredentialResolver,
  createMemoryCredentialStore,
  type CredentialBinding,
} from "@hrbr/source-credentials"
import { createToolPolicy } from "@hrbr/source-policy"
import { createToolRegistry, type ToolRegistry } from "@hrbr/tools"
import type { PluginSource, SourceStatus, SourceVisibility } from "@hrbr/plugins"
import type { ListWorkspacesResult, Workspace } from "@hrbr/workspaces"
import type { UserProfile } from "@hrbr/common"

export type HarborSdkBackendEnv = "dev" | "staging"

export interface SourceRecord {
  readonly source: PluginSource
  readonly adapter: SourceAdapter
}

export interface BackendState {
  readonly env: HarborSdkBackendEnv
  readonly workspace: Workspace
  readonly user: UserProfile
  readonly traces: TraceWriter
  readonly registry: ToolRegistry
  readonly sources: Map<string, SourceRecord>
  readonly sourceOrder: string[]
  readonly registryEntries: readonly PluginRegistryPublicEntry[]
  readonly listWorkspaces: (input?: {
    readonly limit?: number | undefined
    readonly offset?: number | undefined
    readonly cursor?: string | undefined
    readonly includeTotal?: boolean | undefined
  }) => ListWorkspacesResult
  readonly rebuildRegistry: () => void
}

const DEV_WORKSPACE_ID = "11111111-1111-4111-8111-111111111111"
const STAGING_WORKSPACE_ID = "22222222-2222-4222-8222-222222222222"
const DEFAULT_AGENT_ID = "33333333-3333-4333-8333-333333333333"

const SDK_ECHO_SOURCE_ID = "44444444-4444-4444-8444-444444444444"
const SDK_ENV_SOURCE_ID = "55555555-5555-4555-8555-555555555555"

function now(): string {
  return new Date().toISOString()
}

function uuidFromNamespace(namespace: string): string {
  const bytes = new TextEncoder().encode(namespace)
  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193)
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0")
  return `${hex.slice(0, 8)}-aaaa-4aaa-8aaa-${hex}${hex.slice(0, 4)}`
}

function page<T>(
  rows: readonly T[],
  input?: {
    readonly limit?: number | undefined
    readonly offset?: number | undefined
    readonly cursor?: string | undefined
    readonly includeTotal?: boolean | undefined
  },
): {
  readonly data: readonly T[]
  readonly total?: number | null | undefined
  readonly limit: number
  readonly offset: number
  readonly hasMore: boolean
  readonly nextCursor?: string | null | undefined
} {
  const limit = Math.max(1, Math.min(input?.limit ?? 50, 200))
  const cursorOffset = input?.cursor ? Number(input.cursor) : undefined
  const offset = Number.isFinite(cursorOffset)
    ? Number(cursorOffset)
    : Math.max(0, input?.offset ?? 0)
  const slice = rows.slice(offset, offset + limit + 1)
  const hasMore = slice.length > limit
  return {
    data: hasMore ? slice.slice(0, limit) : slice,
    ...(input?.includeTotal ? { total: rows.length } : {}),
    limit,
    offset,
    hasMore,
    nextCursor: hasMore ? String(offset + limit) : null,
  }
}

function workspaceForEnv(env: HarborSdkBackendEnv): Workspace {
  return {
    id: env === "staging" ? STAGING_WORKSPACE_ID : DEV_WORKSPACE_ID,
    name: env === "staging" ? "SDK Harbor Staging" : "SDK Harbor Dev",
    slug: env === "staging" ? "sdk-harbor-staging" : "sdk-harbor-dev",
    role: "owner",
    onboarded_at: now(),
    current_user_id: DEFAULT_AGENT_ID,
    current_user_email: `sdk-${env}@tryharbor.local`,
    current_user_name: "SDK Harbor",
    current_user_avatar: null,
    created_at: now(),
    updated_at: now(),
  }
}

function userForWorkspace(workspace: Workspace): UserProfile {
  return {
    id: workspace.current_user_id ?? DEFAULT_AGENT_ID,
    email: workspace.current_user_email ?? "sdk@tryharbor.local",
    name: workspace.current_user_name ?? null,
    avatar_url: workspace.current_user_avatar ?? null,
    created_at: workspace.created_at ?? now(),
    default_workspace_id: workspace.id,
  }
}

function echoTools(): readonly SourceToolDefinition[] {
  return [
    {
      name: "ping",
      displayName: "Ping",
      description: "Echo input back with backend environment metadata.",
      inputSchema: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      outputSchema: {
        type: "object",
        required: ["ok", "message", "environment"],
        properties: {
          ok: { type: "boolean" },
          message: { type: "string" },
          environment: { type: "string" },
        },
      },
      tags: ["sdk", "diagnostic"],
      kind: "custom",
    },
    {
      name: "summarize",
      displayName: "Summarize",
      description: "Return a small deterministic summary for validation runs.",
      inputSchema: {
        type: "object",
        required: ["text"],
        properties: {
          text: { type: "string" },
          maxWords: { type: "number" },
        },
      },
      outputSchema: {
        type: "object",
        required: ["summary", "word_count"],
        properties: {
          summary: { type: "string" },
          word_count: { type: "number" },
        },
      },
      tags: ["sdk", "text"],
      kind: "custom",
    },
  ]
}

function envTools(): readonly SourceToolDefinition[] {
  return [
    {
      name: "describe",
      displayName: "Describe environment",
      description: "Report non-secret dev/staging environment readiness.",
      inputSchema: {
        type: "object",
        properties: {
          includeOptional: { type: "boolean" },
        },
      },
      outputSchema: {
        type: "object",
        required: ["environment", "has_internal_secret"],
        properties: {
          environment: { type: "string" },
          has_internal_secret: { type: "boolean" },
          optional: { type: "object" },
        },
      },
      tags: ["sdk", "environment"],
      kind: "custom",
    },
  ]
}

function createEchoAdapter(env: HarborSdkBackendEnv): SourceAdapter {
  return defineSourceAdapter({
    id: SDK_ECHO_SOURCE_ID,
    namespace: "sdk_echo",
    displayName: "SDK Echo",
    kind: "custom",
    listTools: async () => echoTools(),
    invokeTool: async (name, input) => {
      if (name === "ping") {
        return {
          ok: true,
          message: String(input["message"] ?? "pong"),
          environment: env,
        }
      }
      if (name === "summarize") {
        const text = String(input["text"] ?? "")
        const maxWords = typeof input["maxWords"] === "number" ? input["maxWords"] : 12
        const words = text.trim().split(/\s+/).filter(Boolean)
        return {
          summary: words.slice(0, Math.max(1, maxWords)).join(" "),
          word_count: words.length,
        }
      }
      throw new Error(`Unknown SDK Echo tool "${name}".`)
    },
  })
}

function createEnvAdapter(env: HarborSdkBackendEnv): SourceAdapter {
  return defineSourceAdapter({
    id: SDK_ENV_SOURCE_ID,
    namespace: "sdk_env",
    displayName: "SDK Environment",
    kind: "custom",
    listTools: async () => envTools(),
    invokeTool: async (name, input, ctx) => {
      if (name !== "describe") throw new Error(`Unknown SDK Environment tool "${name}".`)
      const includeOptional = input["includeOptional"] === true
      return {
        environment: env,
        has_internal_secret: ctx?.credentials?.has("internal_secret") ?? false,
        ...(includeOptional
          ? {
              optional: {
                exa_configured: Boolean(process.env["EXA_API_KEY"]),
                sentry_environment: process.env["NEXT_PUBLIC_SENTRY_ENVIRONMENT"] ?? env,
              },
            }
          : {}),
      }
    },
  })
}

function createDynamicAdapter(input: {
  readonly id: string
  readonly kind: "mcp" | "cli" | "api"
  readonly namespace: string
  readonly displayName: string
  readonly description?: string | undefined
}): SourceAdapter {
  const tool: SourceToolDefinition = {
    name: "invoke",
    displayName: `${input.displayName} invoke`,
    description: input.description ?? "Dynamically registered SDK source placeholder.",
    inputSchema: {
      type: "object",
      properties: {
        payload: {},
      },
    },
    outputSchema: {
      type: "object",
      required: ["source", "payload"],
      properties: {
        source: { type: "string" },
        payload: {},
      },
    },
    tags: ["dynamic"],
    kind: input.kind,
  }
  return defineSourceAdapter({
    id: input.id,
    namespace: input.namespace,
    displayName: input.displayName,
    kind: input.kind,
    listTools: async () => [tool],
    invokeTool: async (name, payload) => {
      if (name !== "invoke") throw new Error(`Unknown dynamic tool "${name}".`)
      return { source: input.namespace, payload }
    },
  })
}

function pluginSource(input: {
  readonly id: string
  readonly workspaceId: string
  readonly kind: "mcp" | "cli" | "api"
  readonly namespace: string
  readonly displayName: string
  readonly description?: string | null | undefined
  readonly config?: unknown
  readonly authConfig?: unknown
  readonly toolCount: number
  readonly category?: string | null | undefined
  readonly iconUrl?: string | null | undefined
  readonly registrySlug?: string | null | undefined
  readonly visibility?: SourceVisibility | undefined
  readonly status?: SourceStatus | undefined
}): PluginSource {
  const at = now()
  return {
    id: input.id,
    workspace_id: input.workspaceId,
    kind: input.kind,
    namespace: input.namespace,
    display_name: input.displayName,
    description: input.description ?? null,
    config: input.config ?? {},
    auth_config: input.authConfig ?? { method: "none" },
    status: input.status ?? "ready",
    install_status: input.status ?? "ready",
    effective_status: input.status ?? "ready",
    runnable: input.toolCount > 0,
    redacted: true,
    tool_count: input.toolCount,
    last_synced_at: at,
    error: null,
    verified: true,
    last_verified_at: at,
    last_verify_error: null,
    category: input.category ?? "dev",
    links: null,
    icon_url: input.iconUrl ?? null,
    shared_defs: null,
    registry_slug: input.registrySlug ?? null,
    created_by: DEFAULT_AGENT_ID,
    created_by_user: {
      id: DEFAULT_AGENT_ID,
      name: "SDK Harbor",
      email: "sdk@tryharbor.local",
      avatar_url: null,
    },
    source_visibility: input.visibility ?? "workspace",
    caller_status: input.status ?? "ready",
    created_at: at,
    updated_at: at,
  }
}

function registryEntries(): readonly PluginRegistryPublicEntry[] {
  return listRegistryEntries()
    .filter((entry) => entry.slug === "sentry-api" || entry.slug === "open-meteo-api")
    .map((entry) => ({
      ...entry,
      availability: {
        status: "active",
        selectable: true,
        hiddenInOnboarding: false,
      },
    }))
}

function bindings(workspaceId: string): readonly CredentialBinding[] {
  return [
    {
      workspace_id: workspaceId,
      source_id: SDK_ENV_SOURCE_ID,
      slot: "internal_secret",
      scope: "workspace",
      value: { kind: "env", env: "INTERNAL_API_SECRET" },
      status: "active",
    },
  ]
}

function buildRegistry(input: {
  readonly workspaceId: string
  readonly traces: TraceWriter
  readonly sources: Iterable<SourceRecord>
}): ToolRegistry {
  return createToolRegistry({
    workspaceId: input.workspaceId,
    principalId: DEFAULT_AGENT_ID,
    sources: [...input.sources].map((record) => record.adapter),
    traces: input.traces,
    credentials: createCredentialResolver({
      store: createMemoryCredentialStore({
        secrets: {
          INTERNAL_API_SECRET:
            process.env["INTERNAL_API_SECRET"] ??
            process.env["LIGHTHOUSE_API_SECRET"] ??
            "local-dev-placeholder",
        },
      }),
      bindings: bindings(input.workspaceId),
    }),
    policy: createToolPolicy({
      rules: [
        {
          match: "sdk_env.*",
          decision: { kind: "allow" },
        },
        {
          match: "sdk_echo.*",
          decision: { kind: "allow" },
        },
      ],
      defaultDecision: { kind: "allow" },
    }),
  })
}

export function createBackendState(env: HarborSdkBackendEnv): BackendState {
  const workspace = workspaceForEnv(env)
  const user = userForWorkspace(workspace)
  const traces = createMemoryTraceWriter({
    workspaceId: workspace.id,
    agentId: DEFAULT_AGENT_ID,
  })
  const sources = new Map<string, SourceRecord>()
  const sourceOrder: string[] = []

  function addRecord(record: SourceRecord): void {
    sources.set(record.source.id, record)
    sourceOrder.push(record.source.id)
  }

  const echo = createEchoAdapter(env)
  addRecord({
    adapter: echo,
    source: pluginSource({
      id: SDK_ECHO_SOURCE_ID,
      workspaceId: workspace.id,
      kind: "api",
      namespace: echo.namespace,
      displayName: echo.displayName,
      description: "Built-in SDK source used to validate tool registry routes.",
      toolCount: echoTools().length,
      category: "dev",
      registrySlug: "sdk-echo",
    }),
  })

  const envSource = createEnvAdapter(env)
  addRecord({
    adapter: envSource,
    source: pluginSource({
      id: SDK_ENV_SOURCE_ID,
      workspaceId: workspace.id,
      kind: "api",
      namespace: envSource.namespace,
      displayName: envSource.displayName,
      description: "Non-secret environment readiness source for dev/staging.",
      toolCount: envTools().length,
      category: "infra",
      registrySlug: "sdk-env",
    }),
  })

  const state = {
    env,
    workspace,
    user,
    traces,
    sources,
    sourceOrder,
    registryEntries: registryEntries(),
    registry: buildRegistry({ workspaceId: workspace.id, traces, sources: sources.values() }),
    listWorkspaces: (input) => {
      const result = page([workspace], input)
      return {
        data: [...result.data],
        ...(result.total !== undefined ? { total: result.total } : {}),
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      }
    },
    rebuildRegistry: () => {
      state.registry = buildRegistry({
        workspaceId: workspace.id,
        traces,
        sources: sources.values(),
      })
    },
  } satisfies BackendState

  return state
}

export function addDynamicSource(
  state: BackendState,
  input: {
    readonly kind: "mcp" | "cli" | "api"
    readonly namespace: string
    readonly displayName: string
    readonly config: unknown
    readonly authConfig?: unknown
    readonly description?: string | undefined
    readonly category?: string | undefined
    readonly iconUrl?: string | undefined
    readonly visibility?: SourceVisibility | undefined
  },
): SourceRecord {
  const id = uuidFromNamespace(`${state.workspace.id}:${input.namespace}`)
  const adapter = createDynamicAdapter({
    id,
    kind: input.kind,
    namespace: input.namespace,
    displayName: input.displayName,
    description: input.description,
  })
  const record = {
    adapter,
    source: pluginSource({
      id,
      workspaceId: state.workspace.id,
      kind: input.kind,
      namespace: input.namespace,
      displayName: input.displayName,
      description: input.description,
      config: input.config,
      authConfig: input.authConfig,
      toolCount: 1,
      category: input.category ?? "other",
      iconUrl: input.iconUrl,
      visibility: input.visibility,
    }),
  }
  if (!state.sources.has(id)) state.sourceOrder.push(id)
  state.sources.set(id, record)
  state.rebuildRegistry()
  return record
}

export function listSources(state: BackendState, input?: {
  readonly sourceId?: string | undefined
  readonly registrySlug?: string | undefined
  readonly limit?: number | undefined
  readonly offset?: number | undefined
  readonly cursor?: string | undefined
  readonly includeTotal?: boolean | undefined
}): {
  readonly data: readonly PluginSource[]
  readonly total?: number | null | undefined
  readonly limit: number
  readonly offset: number
  readonly hasMore: boolean
  readonly nextCursor?: string | null | undefined
} {
  const rows = state.sourceOrder
    .map((id) => state.sources.get(id)?.source)
    .filter((source): source is PluginSource => {
      if (!source) return false
      if (input?.sourceId && source.id !== input.sourceId) return false
      if (input?.registrySlug && source.registry_slug !== input.registrySlug) return false
      return true
    })
  return page(rows, input)
}

export async function listRuns(
  traces: TraceWriter,
  runIds: readonly string[],
  input?: {
    readonly limit?: number | undefined
    readonly offset?: number | undefined
    readonly cursor?: string | undefined
    readonly includeTotal?: boolean | undefined
  },
): Promise<{
  readonly data: readonly Run[]
  readonly total?: number | null | undefined
  readonly limit: number
  readonly offset: number
  readonly hasMore: boolean
  readonly nextCursor?: string | null | undefined
  readonly source_options: readonly string[]
}> {
  const runs: Run[] = []
  for (const runId of runIds) {
    try {
      runs.push((await traces.graph(runId)).run)
    } catch {
      // Ignore missing run ids; this keeps the in-memory reader tolerant of
      // discarded traces during iterative local runs.
    }
  }
  const result = page(
    runs.sort((a, b) => b.created_at.localeCompare(a.created_at)),
    input,
  )
  return {
    data: [...result.data],
    ...(result.total !== undefined ? { total: result.total } : {}),
    limit: result.limit,
    offset: result.offset,
    hasMore: result.hasMore,
    nextCursor: result.nextCursor,
    source_options: ["sdk_echo", "sdk_env"],
  }
}

export async function runGraph(traces: TraceWriter, runId: string): Promise<RunGraph> {
  return traces.graph(runId)
}
