import { Schema } from "effect"
import { ROUTES } from "@hrbr/harbor-control"
import { ListRunsResult, Run, RunGraph } from "@hrbr/runs"
import type { RunGetInput, RunGraphInput, RunListInput, RunReader } from "@hrbr/runs"
import {
  AddSourceResult,
  McpProbeResult,
  OAuthSetupHints,
  OAuthStartResult,
  PluginInstallJob,
  PluginInstallJobListResult,
  PluginRegistryListResult,
  PluginSource,
  RefreshSourceResult,
  RegistryInstallResult,
  RemoveSourceResult,
  SourceListResult,
  SourceVerificationGetResult,
  SourceVerificationProbeResult,
  SourceVerificationSetResult,
} from "@hrbr/sources"
import type {
  SourceAddInput,
  SourceCatalogReader,
  SourceGetInput,
  SourceInstallJobGetInput,
  SourceInstallJobListInput,
  SourceLifecycleClient,
  SourceListInput,
  SourceMcpProbeInput,
  SourceOAuthSetupHintsInput,
  SourceOAuthStartInput,
  SourceRefreshInput,
  SourceRegistryListInput,
  SourceRemoveInput,
  SourceVerificationGetInput,
  SourceVerificationProbeInput,
  SourceVerificationSetInput,
  SourceVisibilitySetInput,
} from "@hrbr/sources"
import type {
  ToolClient,
  ToolDescribeInput,
  ToolExecuteInput,
  ToolListInput,
  ToolInvokeInput,
  ToolSchemaInput,
  ToolSchemasInput,
  ToolSearchInput,
} from "@hrbr/tools"
import {
  ExecuteResult,
  InvokeResult,
  ToolDescribeResponse,
  ToolSchemaResponse,
  ToolSchemasResponse,
  ToolsListResult,
  ToolsSearchResponse,
} from "@hrbr/tools"
import { ListWorkspacesResult, Workspace } from "@hrbr/workspaces"
import type {
  WorkspaceGetInput,
  WorkspaceListInput,
  WorkspaceReader,
} from "@hrbr/workspaces"

export type HarborClientFetch = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>

export interface HarborClientConfig {
  readonly apiUrl: string
  readonly apiKey: string
  readonly workspaceId: string
  readonly fetch?: HarborClientFetch | undefined
}

export interface HarborClient {
  readonly workspaces: WorkspaceReader
  readonly runs: RunReader
  readonly sources: SourceLifecycleClient
  readonly tools: ToolClient
}

export class HarborClientError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(input: { status: number; body: unknown; message?: string | undefined }) {
    super(input.message ?? `Harbor request failed with status ${input.status}`)
    this.name = "HarborClientError"
    this.status = input.status
    this.body = input.body
  }
}

const decodeToolsListResult = Schema.decodeUnknownPromise(ToolsListResult)
const decodeToolsSearchResponse = Schema.decodeUnknownPromise(ToolsSearchResponse)
const decodeToolDescribeResponse = Schema.decodeUnknownPromise(ToolDescribeResponse)
const decodeToolSchemaResponse = Schema.decodeUnknownPromise(ToolSchemaResponse)
const decodeToolSchemasResponse = Schema.decodeUnknownPromise(ToolSchemasResponse)
const decodeInvokeResult = Schema.decodeUnknownPromise(InvokeResult)
const decodeExecuteResult = Schema.decodeUnknownPromise(ExecuteResult)
const decodeListRunsResult = Schema.decodeUnknownPromise(ListRunsResult)
const decodeRun = Schema.decodeUnknownPromise(Run)
const decodeRunGraph = Schema.decodeUnknownPromise(RunGraph)
const decodeSourceListResult = Schema.decodeUnknownPromise(SourceListResult)
const decodePluginSource = Schema.decodeUnknownPromise(PluginSource)
const decodePluginRegistryListResult = Schema.decodeUnknownPromise(PluginRegistryListResult)
const decodeRegistryInstallResult = Schema.decodeUnknownPromise(RegistryInstallResult)
const decodeAddSourceResult = Schema.decodeUnknownPromise(AddSourceResult)
const decodeRefreshSourceResult = Schema.decodeUnknownPromise(RefreshSourceResult)
const decodeRemoveSourceResult = Schema.decodeUnknownPromise(RemoveSourceResult)
const decodeMcpProbeResult = Schema.decodeUnknownPromise(McpProbeResult)
const decodeOAuthStartResult = Schema.decodeUnknownPromise(OAuthStartResult)
const decodeOAuthSetupHints = Schema.decodeUnknownPromise(OAuthSetupHints)
const decodePluginInstallJob = Schema.decodeUnknownPromise(PluginInstallJob)
const decodePluginInstallJobListResult = Schema.decodeUnknownPromise(PluginInstallJobListResult)
const decodeSourceVerificationGetResult = Schema.decodeUnknownPromise(SourceVerificationGetResult)
const decodeSourceVerificationProbeResult = Schema.decodeUnknownPromise(SourceVerificationProbeResult)
const decodeSourceVerificationSetResult = Schema.decodeUnknownPromise(SourceVerificationSetResult)
const decodeListWorkspacesResult = Schema.decodeUnknownPromise(ListWorkspacesResult)
const decodeWorkspace = Schema.decodeUnknownPromise(Workspace)

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}${path}`
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (text.length === 0) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

function unwrapHarborEnvelope(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload
  const record = payload as Record<string, unknown>
  if (record["success"] === true && "data" in record) return record["data"]
  return payload
}

function createPost(config: HarborClientConfig) {
  const fetchImpl = config.fetch ?? globalThis.fetch
  return async function post(
    path: string,
    body: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: { readonly includeWorkspaceId?: boolean | undefined },
  ): Promise<unknown> {
    const requestHeaders: Record<string, string> = {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    }
    for (const [key, value] of Object.entries(headers ?? {})) {
      if (value !== undefined) requestHeaders[key] = value
    }
    const response = await fetchImpl(joinUrl(config.apiUrl, path), {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        ...(options?.includeWorkspaceId === false ? {} : { workspace_id: config.workspaceId }),
        ...body,
      }),
    })
    const payload = await readJson(response)
    if (!response.ok) {
      throw new HarborClientError({ status: response.status, body: payload })
    }
    return unwrapHarborEnvelope(payload)
  }
}

export function createHarborClient(config: HarborClientConfig): HarborClient {
  const post = createPost(config)

  const workspaces: WorkspaceReader = {
    list: async (input?: WorkspaceListInput) => {
      const payload = await post(
        ROUTES.workspaces.list,
        {
          limit: input?.limit,
          offset: input?.offset,
          cursor: input?.cursor,
          include_total: input?.includeTotal,
        },
        undefined,
        { includeWorkspaceId: false },
      )
      return decodeListWorkspacesResult(payload)
    },
    get: async (input: WorkspaceGetInput) => {
      const payload = await post(ROUTES.workspaces.get, {
        workspace_id: input.workspaceId,
      })
      return decodeWorkspace(payload)
    },
  }

  const runs: RunReader = {
    list: async (input?: RunListInput) => {
      const payload = await post(ROUTES.runs.list, {
        agent_id: input?.agentId,
        source: input?.source,
        created_after: input?.createdAfter,
        created_before: input?.createdBefore,
        offset: input?.offset,
        limit: input?.limit,
        cursor: input?.cursor,
        include_total: input?.includeTotal,
      })
      return decodeListRunsResult(payload)
    },
    get: async (input: RunGetInput) => {
      const payload = await post(ROUTES.runs.get, {
        run_id: input.runId,
      })
      return decodeRun(payload)
    },
    graph: async (input: RunGraphInput) => {
      const payload = await post(ROUTES.runs.graph, {
        run_id: input.runId,
        cursor: input.cursor,
        since_offset_ms: input.sinceOffsetMs,
      })
      return decodeRunGraph(payload)
    },
  }

  const sources: SourceLifecycleClient = {
    list: async (input?: SourceListInput) => {
      const payload = await post(ROUTES.plugins.sources.list, {
        source_id: input?.sourceId,
        registry_slug: input?.registrySlug,
        limit: input?.limit,
        offset: input?.offset,
        cursor: input?.cursor,
        include_total: input?.includeTotal,
        machine_id: input?.machineId,
        agent_id: input?.agentId,
      })
      return decodeSourceListResult(payload)
    },
    get: async (input: SourceGetInput) => {
      const payload = await post(ROUTES.plugins.sources.get, {
        source_id: input.sourceId,
      })
      return decodePluginSource(payload)
    },
    registry: {
      list: async (input?: SourceRegistryListInput) => {
        const payload = await post(ROUTES.plugins.registry.list, {
          slug: input?.slug,
        })
        return decodePluginRegistryListResult(payload)
      },
      install: async (input) => {
        const payload = await post(ROUTES.plugins.registry.install, {
          slug: input.slug,
          namespace: input.namespace,
          source_visibility: input.sourceVisibility,
          secrets_by_env: input.secretsByEnv,
        })
        return decodeRegistryInstallResult(payload)
      },
    },
    add: async (input: SourceAddInput) => {
      const payload = await post(ROUTES.plugins.sources.add, {
        kind: input.kind,
        namespace: input.namespace,
        display_name: input.displayName,
        config: input.config,
        auth_config: input.authConfig,
        description: input.description,
        category: input.category,
        icon_url: input.iconUrl,
        links: input.links,
        source_visibility: input.sourceVisibility,
      })
      return decodeAddSourceResult(payload)
    },
    refresh: async (input: SourceRefreshInput) => {
      const payload = await post(ROUTES.plugins.sources.refresh, {
        source_id: input.sourceId,
        namespace: input.namespace,
      })
      return decodeRefreshSourceResult(payload)
    },
    remove: async (input: SourceRemoveInput) => {
      const payload = await post(ROUTES.plugins.sources.remove, {
        source_id: input.sourceId,
      })
      return decodeRemoveSourceResult(payload)
    },
    setVisibility: async (input: SourceVisibilitySetInput) => {
      const payload = await post(ROUTES.plugins.sources.visibility.set, {
        source_id: input.sourceId,
        source_visibility: input.sourceVisibility,
      })
      return decodePluginSource(payload)
    },
    probeMcp: async (input: SourceMcpProbeInput) => {
      const payload = await post(ROUTES.plugins.sources.probe, {
        endpoint: input.endpoint,
      })
      return decodeMcpProbeResult(payload)
    },
    oauth: {
      start: async (input: SourceOAuthStartInput) => {
        const payload = await post(ROUTES.plugins.sources.oauth.start, {
          source_id: input.sourceId,
        })
        return decodeOAuthStartResult(payload)
      },
      reconnect: async (input: SourceOAuthStartInput) => {
        const payload = await post(ROUTES.plugins.sources.oauth.reconnect, {
          source_id: input.sourceId,
        })
        return decodeOAuthStartResult(payload)
      },
      setupHints: async (input: SourceOAuthSetupHintsInput) => {
        const payload = await post(ROUTES.plugins.sources.oauth.setupHints, {
          source_id: input.sourceId,
          registry_slug: input.registrySlug,
        })
        return decodeOAuthSetupHints(payload)
      },
    },
    installJobs: {
      get: async (input: SourceInstallJobGetInput) => {
        const payload = await post(ROUTES.plugins.installJobs.get, {
          job_id: input.jobId,
        })
        return decodePluginInstallJob(payload)
      },
      list: async (input?: SourceInstallJobListInput) => {
        const payload = await post(ROUTES.plugins.installJobs.list, {
          slug: input?.slug,
          status: input?.status,
          active: input?.active,
          limit: input?.limit,
          offset: input?.offset,
          cursor: input?.cursor,
          include_total: input?.includeTotal,
        })
        return decodePluginInstallJobListResult(payload)
      },
    },
    verification: {
      get: async (input: SourceVerificationGetInput) => {
        const payload = await post(ROUTES.plugins.sources.verification.get, {
          source_id: input.sourceId,
          machine_id: input.machineId,
          agent_id: input.agentId,
        })
        return decodeSourceVerificationGetResult(payload)
      },
      probe: async (input: SourceVerificationProbeInput) => {
        const payload = await post(ROUTES.plugins.sources.verification.probe, {
          source_id: input.sourceId,
        })
        return decodeSourceVerificationProbeResult(payload)
      },
      set: async (input: SourceVerificationSetInput) => {
        const payload = await post(ROUTES.plugins.sources.verification.set, {
          source_id: input.sourceId,
          machine_id: input.machineId,
          agent_id: input.agentId,
          status: input.status,
          error: input.error,
          details: input.details,
          checked_at: input.checkedAt,
        })
        return decodeSourceVerificationSetResult(payload)
      },
    },
  }

  const tools: ToolClient = {
    list: async (input?: ToolListInput) => {
      const payload = await post(ROUTES.plugins.tools.list, {
        source_id: input?.sourceId,
        namespace: input?.namespace,
        limit: input?.limit,
        offset: input?.offset,
        cursor: input?.cursor,
      })
      return decodeToolsListResult(payload)
    },
    search: async (input: ToolSearchInput) => {
      const payload = await post(ROUTES.plugins.tools.search, {
        query: input.query,
        limit: input.limit,
        source: input.source,
        kind: input.kind,
        verbose: input.verbose,
        mode: input.mode,
      })
      return decodeToolsSearchResponse(payload)
    },
    describe: async (input: ToolDescribeInput) => {
      const payload = await post(ROUTES.plugins.tools.describe, {
        tool_id: input.toolId,
      })
      return decodeToolDescribeResponse(payload)
    },
    schema: async (input: ToolSchemaInput) => {
      const payload = await post(ROUTES.plugins.tools.schema, {
        tool_id: input.toolId,
      })
      return decodeToolSchemaResponse(payload)
    },
    schemas: async (input: ToolSchemasInput) => {
      const payload = await post(ROUTES.plugins.tools.schemas, {
        tool_ids: [...input.toolIds],
      })
      const decoded = await decodeToolSchemasResponse(payload)
      return decoded.data
    },
    invoke: async (input: ToolInvokeInput) => {
      const payload = await post(ROUTES.plugins.invoke, {
        tool_id: input.toolId,
        input: input.input ?? {},
        agent_id: input.agentId,
        run_id: input.runId,
      })
      return decodeInvokeResult(payload)
    },
    execute: async (input: ToolExecuteInput) => {
      const payload = await post(
        ROUTES.exec,
        {
          code: input.code,
          mode: input.mode,
          sources: input.sources?.map((source) => ({ namespace: source.namespace })),
          timeout_ms: input.timeoutMs,
          run_id: input.runId,
        },
        input.identity
          ? {
              "X-Hrbr-Machine": input.identity.machineId,
              "X-Hrbr-Agent": input.identity.agentFamily,
              "X-Hrbr-Agent-Id": input.identity.agentId,
              "X-Hrbr-Agent-Session": input.identity.session,
            }
          : undefined,
      )
      return decodeExecuteResult(payload)
    },
  }

  return { workspaces, runs, sources, tools }
}

export type {
  Run,
  RunGetInput,
  RunGraph,
  RunGraphInput,
  RunListInput,
  RunReader,
} from "@hrbr/runs"

export type {
  SourceCatalogReader,
  SourceLifecycleClient,
  SourceGetInput,
  SourceAddInput,
  SourceInstallJobGetInput,
  SourceInstallJobListInput,
  SourceListInput,
  SourceMcpProbeInput,
  SourceOAuthSetupHintsInput,
  SourceOAuthStartInput,
  SourceRefreshInput,
  SourceListResult,
  SourceRegistryListInput,
  SourceRegistryInstallInput,
  SourceRemoveInput,
  SourceVerificationGetInput,
  SourceVerificationProbeInput,
  SourceVerificationSetInput,
  SourceVisibilitySetInput,
} from "@hrbr/sources"

export type {
  ToolClient,
  ToolDescribeInput,
  ToolDescription,
  ToolExecuteIdentity,
  ToolExecuteInput,
  ToolExecution,
  ToolExecutionClient,
  ToolExecuteSourceRef,
  ToolInvocation,
  ToolInvocationClient,
  ToolInvokeInput,
  ToolListInput,
  ToolListPage,
  ToolRegistryReader,
  ToolSchema,
  ToolSchemaInput,
  ToolSchemasInput,
  ToolSearchInput,
  ToolSearchPage,
} from "@hrbr/tools"

export type {
  Workspace,
  WorkspaceGetInput,
  WorkspaceListInput,
  WorkspaceReader,
} from "@hrbr/workspaces"
