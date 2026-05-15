import {
  connectHarborLocalMcpOAuthSource,
  createHarborLocalExecRuntime,
  createHarborLocalMcpToolRuntime,
  importHarborLocalCredentialsFromEnv,
  listHarborLocalSources,
  readHarborLocalMcpSource,
  readHarborLocalOAuthStatus,
  probeHarborLocalMcpSource,
  refreshHarborLocalMcpSource,
  runHarborLocalRegistryAction,
  upsertHarborLocalMcpSource,
  type HarborLocalCredentialEnvImportInput,
  type HarborLocalExecBinding,
  type HarborLocalExecRunOptions,
  type HarborLocalExecRunResult,
  type HarborLocalMcpOAuthConnectHandle,
  type HarborLocalMcpOAuthDiscovery,
  type HarborLocalMcpProbeSourceResult,
  type HarborLocalMcpRefreshSourceResult,
  type HarborLocalMcpSourceInput,
  type HarborLocalMcpStoredSource,
  type HarborLocalOAuthStatus,
  type HarborLocalRegistryAgentStep,
  type HarborLocalRegistryAction,
  type HarborLocalRegistryActionResult,
  type HarborLocalRegistryWriteToolMatcher,
  type HarborLocalSourceRef,
  type HarborLocalToolCallResult,
  type HarborLocalToolSchema,
  type HarborLocalToolSearchHit,
} from "./index"
import { REGISTRY_CATALOG_ENTRIES } from "@hrbr/registry-catalog"
import type { McpSourceFetch } from "@hrbr/source-mcp"

export { HARBOR_LOCAL_CREDENTIAL_KEY_ENV } from "./credentials"
export {
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryActionSchema,
  harborLocalRegistryAgentStepSchema,
} from "./tool-registry-actions"
export type {
  HarborLocalRegistryAgentStep,
  HarborLocalRegistryAction,
  HarborLocalRegistryActionResult,
  HarborLocalRegistryWriteToolMatcher,
} from "./tool-registry-actions"
export type { HarborLocalMcpOAuthDiscovery } from "./mcp-runtime"
export type { HarborLocalMcpProbeSourceResult } from "./mcp-runtime"
export type {
  HarborLocalExecBinding,
  HarborLocalExecRunOptions,
  HarborLocalExecRunResult,
} from "./exec"

export interface HarborLocalRuntimeInput {
  readonly projectRoot: string
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}

export interface HarborLocalRuntimeActionOptions {
  readonly confirmWrites?: boolean | undefined
  readonly isWriteTool?: HarborLocalRegistryWriteToolMatcher | undefined
  readonly writeBlockedReason?: string | undefined
}

export interface HarborLocalMcpSetupInput {
  readonly source: HarborLocalMcpSourceInput
  readonly discovery?: HarborLocalMcpOAuthDiscovery | undefined
  readonly connect?: boolean | undefined
  readonly refresh?: boolean | undefined
  readonly clientName?: string | undefined
}

export interface HarborLocalMcpSetupResult {
  readonly source: HarborLocalMcpStoredSource
  readonly oauth?: HarborLocalMcpOAuthConnectHandle | undefined
  readonly refresh?: HarborLocalMcpRefreshSourceResult | undefined
}

export type HarborLocalMcpEnsureAuth = "auto" | "none" | "oauth2"

export interface HarborLocalMcpUrlSourceInput {
  readonly endpoint: string
  readonly name?: string | undefined
  readonly namespace?: string | undefined
  readonly auth?: HarborLocalMcpEnsureAuth | undefined
  readonly discovery?: HarborLocalMcpOAuthDiscovery | undefined
  readonly clientName?: string | undefined
}

export interface HarborLocalMcpEnsureSourcesInput {
  readonly sources: readonly HarborLocalMcpUrlSourceInput[]
  readonly connect?: boolean | undefined
  readonly refresh?: boolean | undefined
  readonly onStatus?: ((event: HarborLocalMcpEnsureStatusEvent) => void | Promise<void>) | undefined
  readonly onAuthorizationUrl?: ((input: {
    readonly sourceId: string
    readonly authorizationUrl: string
  }) => void | Promise<void>) | undefined
}

export type HarborLocalMcpEnsureStatusEvent =
  | {
      readonly stage: "install"
      readonly sourceId: string
      readonly endpoint: string
      readonly message: string
    }
  | {
      readonly stage: "oauth"
      readonly sourceId: string
      readonly status: HarborLocalOAuthStatus["status"]
      readonly message: string
    }
  | {
      readonly stage: "refresh"
      readonly sourceId: string
      readonly message: string
    }
  | {
      readonly stage: "ready"
      readonly sourceId: string
      readonly toolCount: number
      readonly message: string
    }
  | {
      readonly stage: "error"
      readonly sourceId: string
      readonly message: string
    }

export type HarborLocalMcpEnsureSourceStatus =
  | "ready"
  | "installed"
  | "requires_oauth"
  | "pending_oauth"
  | "reconnect_required"
  | "refresh_failed"

export interface HarborLocalMcpEnsureSourceResult {
  readonly source: HarborLocalMcpStoredSource
  readonly status: HarborLocalMcpEnsureSourceStatus
  readonly matchedCatalogSlug?: string | undefined
  readonly authorizationUrl?: string | undefined
  readonly refresh?: HarborLocalMcpRefreshSourceResult | undefined
  readonly error?: string | undefined
}

export interface HarborLocalMcpEnsureSourcesResult {
  readonly sources: readonly HarborLocalMcpEnsureSourceResult[]
  readonly ready: boolean
}

export interface HarborLocalRuntime {
  readonly sources: {
    readonly list: () => Promise<readonly HarborLocalSourceRef[]>
    readonly getMcp: (sourceId: string) => Promise<HarborLocalMcpStoredSource | null>
    readonly oauthStatus: (sourceId: string) => Promise<HarborLocalOAuthStatus>
    readonly upsertMcp: (source: HarborLocalMcpSourceInput) => Promise<HarborLocalMcpStoredSource>
    readonly connectMcpOAuth: (input: {
      readonly sourceId: string
      readonly discovery: HarborLocalMcpOAuthDiscovery
      readonly clientName?: string | undefined
    }) => Promise<HarborLocalMcpOAuthConnectHandle>
    readonly probeMcp: (sourceId: string) => Promise<HarborLocalMcpProbeSourceResult>
    readonly refreshMcp: (sourceId: string) => Promise<HarborLocalMcpRefreshSourceResult>
    readonly setupMcp: (input: HarborLocalMcpSetupInput) => Promise<HarborLocalMcpSetupResult>
    readonly ensureMcpSources: (input: HarborLocalMcpEnsureSourcesInput) => Promise<HarborLocalMcpEnsureSourcesResult>
  }
  readonly credentials: {
    readonly importFromEnv: (
      input: Omit<HarborLocalCredentialEnvImportInput, "projectRoot">
    ) => Promise<void>
  }
  readonly tools: {
    readonly search: (input: {
      readonly query: string
      readonly namespace?: string | undefined
      readonly limit?: number | undefined
    }) => Promise<readonly HarborLocalToolSearchHit[]>
    readonly schema: (toolId: string) => Promise<HarborLocalToolSchema | null>
    readonly invoke: (
      toolId: string,
      input: unknown,
      options?: HarborLocalRuntimeActionOptions
    ) => Promise<HarborLocalToolCallResult | HarborLocalRegistryActionResult>
    readonly runAction: (
      action: HarborLocalRegistryAction,
      options?: HarborLocalRuntimeActionOptions
    ) => Promise<HarborLocalRegistryActionResult>
  }
  readonly exec: {
    readonly run: (code: string, options?: HarborLocalExecRunOptions) => Promise<HarborLocalExecRunResult>
    readonly bindings: () => Promise<readonly HarborLocalExecBinding[]>
  }
}

export function createHarborLocalRuntime(input: HarborLocalRuntimeInput): HarborLocalRuntime {
  const base = {
    projectRoot: input.projectRoot,
    env: input.env,
    allowLocalNetwork: input.allowLocalNetwork,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  }

  const refreshMcp = (sourceId: string) =>
    refreshHarborLocalMcpSource({ ...base, sourceId })

  const ensureOne = async (
    ensureInput: HarborLocalMcpEnsureSourcesInput,
    sourceInput: HarborLocalMcpUrlSourceInput
  ): Promise<HarborLocalMcpEnsureSourceResult> => {
    const catalog = catalogEntryForEndpoint(sourceInput.endpoint)
    const discovery = sourceInput.discovery ?? catalogDiscovery(catalog)
    const authKind = sourceInput.auth === "none"
      ? "none"
      : sourceInput.auth === "oauth2" || discovery
        ? "oauth2"
        : "none"
    const sourceId = sourceInput.namespace ?? catalog?.default_namespace ?? nameFromEndpoint(sourceInput.endpoint)
    await ensureInput.onStatus?.({
      stage: "install",
      sourceId,
      endpoint: sourceInput.endpoint,
      message: `Installing or updating MCP source "${sourceId}" from ${sourceInput.endpoint}.`,
    })
    const source = await upsertHarborLocalMcpSource({
      projectRoot: input.projectRoot,
      source: {
        transport: "remote",
        name: sourceInput.name ?? catalog?.display_name ?? nameFromEndpoint(sourceInput.endpoint),
        namespace: sourceInput.namespace ?? catalog?.default_namespace,
        endpoint: sourceInput.endpoint,
        remoteTransport: "auto",
        auth: authKind === "oauth2" ? { kind: "oauth2" } : { kind: "none" },
      },
    })

    if (authKind === "oauth2") {
      const oauth = await readHarborLocalOAuthStatus(input.projectRoot, source.id)
      await ensureInput.onStatus?.({
        stage: "oauth",
        sourceId: source.id,
        status: oauth.status,
        message: `OAuth status for MCP source "${source.id}" is ${oauth.status}.`,
      })
      if (oauth.status === "reconnect_required") {
        return {
          source,
          status: "reconnect_required",
          ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
        }
      }
      if (oauth.status !== "ready") {
        if (!discovery) {
          return {
            source,
            status: oauth.status === "pending" ? "pending_oauth" : "requires_oauth",
            ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
          }
        }
        if (ensureInput.connect !== true) {
          return {
            source,
            status: oauth.status === "pending" ? "pending_oauth" : "requires_oauth",
            ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
          }
        }
        const connect = await connectHarborLocalMcpOAuthSource({
          ...base,
          sourceId: source.id,
          discovery,
          clientName: sourceInput.clientName ?? `Harbor SDK Local ${source.name}`,
        })
        try {
          await ensureInput.onStatus?.({
            stage: "oauth",
            sourceId: source.id,
            status: "pending",
            message: `Waiting for OAuth callback for MCP source "${source.id}".`,
          })
          await ensureInput.onAuthorizationUrl?.({
            sourceId: source.id,
            authorizationUrl: connect.authorizationUrl,
          })
          await connect.waitForReady()
        } finally {
          await connect.close()
        }
      }
    }

    if (ensureInput.refresh === false) {
      return {
        source,
        status: "installed",
        ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
      }
    }

    try {
      await ensureInput.onStatus?.({
        stage: "refresh",
        sourceId: source.id,
        message: `Refreshing MCP tools for source "${source.id}".`,
      })
      const refresh = await refreshMcp(source.id)
      await ensureInput.onStatus?.({
        stage: "ready",
        sourceId: source.id,
        toolCount: refresh.toolCount,
        message: `MCP source "${source.id}" is ready with ${refresh.toolCount} tools.`,
      })
      return {
        source: await readHarborLocalMcpSource(input.projectRoot, source.id) ?? source,
        status: "ready",
        ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
        refresh,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await ensureInput.onStatus?.({
        stage: "error",
        sourceId: source.id,
        message: `Failed refreshing MCP source "${source.id}": ${message}`,
      })
      return {
        source,
        status: "refresh_failed",
        ...(catalog ? { matchedCatalogSlug: catalog.slug } : {}),
        error: message,
      }
    }
  }

  const runAction = (
    action: HarborLocalRegistryAction,
    options: HarborLocalRuntimeActionOptions = {}
  ) => runHarborLocalRegistryAction({
    ...base,
    action,
    confirmWrites: options.confirmWrites,
    isWriteTool: options.isWriteTool,
    writeBlockedReason: options.writeBlockedReason,
  })

  return {
    sources: {
      list: () => listHarborLocalSources(input.projectRoot),
      getMcp: (sourceId) => readHarborLocalMcpSource(input.projectRoot, sourceId),
      oauthStatus: (sourceId) => readHarborLocalOAuthStatus(input.projectRoot, sourceId),
      upsertMcp: (source) => upsertHarborLocalMcpSource({
        projectRoot: input.projectRoot,
        source,
      }),
      connectMcpOAuth: ({ sourceId, discovery, clientName }) =>
        connectHarborLocalMcpOAuthSource({
          ...base,
          sourceId,
          discovery,
          clientName,
        }),
      probeMcp: (sourceId) => probeHarborLocalMcpSource({ ...base, sourceId }),
      refreshMcp,
      setupMcp: async (setup) => {
        const source = await upsertHarborLocalMcpSource({
          projectRoot: input.projectRoot,
          source: setup.source,
        })
        const oauth = setup.connect === true && setup.discovery
          ? await connectHarborLocalMcpOAuthSource({
            ...base,
            sourceId: source.id,
            discovery: setup.discovery,
            clientName: setup.clientName,
          })
          : undefined
        const refresh = setup.refresh === true ? await refreshMcp(source.id) : undefined
        return {
          source,
          ...(oauth ? { oauth } : {}),
          ...(refresh ? { refresh } : {}),
        }
      },
      ensureMcpSources: async (ensureInput) => {
        const sources = []
        for (const source of ensureInput.sources) {
          sources.push(await ensureOne(ensureInput, source))
        }
        return {
          sources,
          ready: sources.every((source) => source.status === "ready" || source.status === "installed"),
        }
      },
    },
    credentials: {
      importFromEnv: async (credentialInput) => {
        await importHarborLocalCredentialsFromEnv(input.projectRoot, credentialInput)
      },
    },
    tools: {
      search: async (search) => (await createHarborLocalMcpToolRuntime(base)).search(search),
      schema: async (toolId) => (await createHarborLocalMcpToolRuntime(base)).schema(toolId),
      invoke: async (toolId, toolInput, options = {}) => {
        const result = await runAction({ kind: "invoke", toolId, input: toolInput }, options)
        return result.kind === "invoke" && !result.blocked ? result.result : result
      },
      runAction,
    },
    exec: {
      run: async (code, options) => createHarborLocalExecRuntime(base).run(code, options),
      bindings: async () => createHarborLocalExecRuntime(base).bindings(),
    },
  }
}

interface CatalogMcpEntry {
  readonly slug: string
  readonly display_name?: string | undefined
  readonly default_namespace?: string | undefined
  readonly config?: {
    readonly mcp_endpoint?: string | undefined
    readonly oauth_discovery?: {
      readonly authorization_endpoint?: string | undefined
      readonly token_endpoint?: string | undefined
      readonly registration_endpoint?: string | undefined
      readonly scopes_supported?: readonly string[] | undefined
      readonly resource?: string | undefined
    } | undefined
  } | undefined
}

function catalogEntryForEndpoint(endpoint: string): CatalogMcpEntry | undefined {
  return (REGISTRY_CATALOG_ENTRIES as unknown as readonly CatalogMcpEntry[])
    .find((entry) => entry.config?.mcp_endpoint === endpoint)
}

function catalogDiscovery(entry: CatalogMcpEntry | undefined): HarborLocalMcpOAuthDiscovery | undefined {
  const discovery = entry?.config?.oauth_discovery
  if (!discovery?.authorization_endpoint || !discovery.token_endpoint) return undefined
  return {
    authorizationEndpoint: discovery.authorization_endpoint,
    tokenEndpoint: discovery.token_endpoint,
    registrationEndpoint: discovery.registration_endpoint,
    scopes: discovery.scopes_supported,
    resource: discovery.resource,
  }
}

function nameFromEndpoint(endpoint: string): string {
  try {
    return new URL(endpoint).hostname.replace(/^mcp\./, "").split(".")[0] || "MCP Source"
  } catch {
    return "MCP Source"
  }
}
