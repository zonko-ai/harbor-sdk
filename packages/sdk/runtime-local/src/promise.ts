import {
  connectHarborLocalMcpOAuthSource,
  createHarborLocalMcpToolRuntime,
  importHarborLocalCredentialsFromEnv,
  listHarborLocalSources,
  readHarborLocalMcpSource,
  readHarborLocalOAuthStatus,
  refreshHarborLocalMcpSource,
  runHarborLocalRegistryAction,
  upsertHarborLocalMcpSource,
  type HarborLocalCredentialEnvImportInput,
  type HarborLocalMcpOAuthConnectHandle,
  type HarborLocalMcpOAuthDiscovery,
  type HarborLocalMcpRefreshSourceResult,
  type HarborLocalMcpSourceInput,
  type HarborLocalMcpStoredSource,
  type HarborLocalOAuthStatus,
  type HarborLocalRegistryAction,
  type HarborLocalRegistryActionResult,
  type HarborLocalRegistryWriteToolMatcher,
  type HarborLocalSourceRef,
  type HarborLocalToolCallResult,
  type HarborLocalToolSchema,
  type HarborLocalToolSearchHit,
} from "./index"
import type { McpSourceFetch } from "@hrbr/source-mcp"

export { HARBOR_LOCAL_CREDENTIAL_KEY_ENV } from "./credentials"
export type {
  HarborLocalRegistryAction,
  HarborLocalRegistryActionResult,
  HarborLocalRegistryWriteToolMatcher,
} from "./tool-registry-actions"
export type { HarborLocalMcpOAuthDiscovery } from "./mcp-runtime"

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
    readonly refreshMcp: (sourceId: string) => Promise<HarborLocalMcpRefreshSourceResult>
    readonly setupMcp: (input: HarborLocalMcpSetupInput) => Promise<HarborLocalMcpSetupResult>
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
  }
}
