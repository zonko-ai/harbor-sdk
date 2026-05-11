export {
  comparePluginSourcesForDisplay,
  displayPluginSourceStatus,
  effectivePluginSourceStatus,
  isPluginSourceAwaitingOauth,
  isPluginSourceRunnable,
  isPluginSourceToolCallable,
  PluginSource,
  PluginSourceCreator,
  pluginSourceDomainView,
  pluginSourceNextAction,
  pluginToolNamespaceSummary,
  registryAgentSkillSlug,
  selectRepresentativePluginSource,
  SourceKind,
  SourceListBody,
  SourceListResult,
  SourceSummary,
  SourceStatus,
  SourceVerification,
  SourceVerificationGetBody,
  SourceVerificationGetResult,
  SourceVerificationProbeBody,
  SourceVerificationProbeResult,
  SourceVerificationStatus,
  SourceVerificationSummary,
  SourceVisibility,
  AddSourceBody,
  AddSourceResult,
  McpProbeBody,
  McpProbeResult,
  OAuthSetupHints,
  OAuthSetupHintsBody,
  OAuthStartResult,
  PluginInstallJob,
  PluginInstallJobGetBody,
  PluginInstallJobListBody,
  PluginInstallJobListResult,
  RefreshSourceBody,
  RefreshSourceResult,
  RegistryInstallBody,
  RegistryInstallResult,
  RemoveSourceResult,
  SourceIdBody,
  SourceVerificationSetBody,
  SourceVerificationSetResult,
  SourceVisibilitySetBody,
  summarizePluginSourceGroupHealth,
} from "@hrbr/plugins"

export { PluginRegistryListResult } from "@hrbr/registry"
export { RegistryListBody } from "@hrbr/plugins"

export type PluginSourceDisplayStatus = import("@hrbr/plugins").PluginSourceDisplayStatus
export type PluginSourceDomainAction = import("@hrbr/plugins").PluginSourceDomainAction
export type PluginSourceDomainView = import("@hrbr/plugins").PluginSourceDomainView
export type PluginSourceGroupHealth = import("@hrbr/plugins").PluginSourceGroupHealth
export type SourceRegistryPage = import("@hrbr/registry").PluginRegistryListResult

export interface SourceListInput {
  readonly sourceId?: string | undefined
  readonly registrySlug?: string | undefined
  readonly limit?: number | undefined
  readonly offset?: number | undefined
  readonly cursor?: string | undefined
  readonly includeTotal?: boolean | undefined
  readonly machineId?: string | undefined
  readonly agentId?: string | undefined
}

export interface SourceGetInput {
  readonly sourceId: string
}

export interface SourceRegistryListInput {
  readonly slug?: string | undefined
}

export interface SourceRegistryInstallInput {
  readonly slug: string
  readonly namespace?: string | undefined
  readonly sourceVisibility?: import("@hrbr/plugins").SourceVisibility | undefined
  readonly secretsByEnv?: Readonly<Record<string, string>> | undefined
}

export interface SourceAddInput {
  readonly kind: import("@hrbr/plugins").SourceKind
  readonly namespace: string
  readonly displayName: string
  readonly config: unknown
  readonly authConfig?: unknown
  readonly description?: string | undefined
  readonly category?: string | undefined
  readonly iconUrl?: string | undefined
  readonly links?: import("@hrbr/plugins").SourceLink[] | undefined
  readonly sourceVisibility?: import("@hrbr/plugins").SourceVisibility | undefined
}

export interface SourceRefreshInput {
  readonly sourceId?: string | undefined
  readonly namespace?: string | undefined
}

export interface SourceRemoveInput {
  readonly sourceId: string
}

export interface SourceVisibilitySetInput {
  readonly sourceId: string
  readonly sourceVisibility: import("@hrbr/plugins").SourceVisibility
}

export interface SourceMcpProbeInput {
  readonly endpoint: string
}

export interface SourceOAuthStartInput {
  readonly sourceId: string
}

export interface SourceOAuthSetupHintsInput {
  readonly sourceId?: string | undefined
  readonly registrySlug?: string | undefined
}

export interface SourceInstallJobGetInput {
  readonly jobId: string
}

export interface SourceInstallJobListInput {
  readonly slug?: string | undefined
  readonly status?: import("@hrbr/plugins").PluginInstallJobStatus | undefined
  readonly active?: boolean | undefined
  readonly limit?: number | undefined
  readonly offset?: number | undefined
  readonly cursor?: string | undefined
  readonly includeTotal?: boolean | undefined
}

export interface SourceVerificationGetInput {
  readonly sourceId: string
  readonly machineId?: string | undefined
  readonly agentId?: string | undefined
}

export interface SourceVerificationProbeInput {
  readonly sourceId: string
}

export interface SourceVerificationSetInput {
  readonly sourceId: string
  readonly machineId: string
  readonly agentId: string
  readonly status: import("@hrbr/plugins").SourceVerificationStatus
  readonly error?: string | undefined
  readonly details?: unknown
  readonly checkedAt?: string | undefined
}

export interface SourceRegistryClient {
  readonly list: (input?: SourceRegistryListInput) => Promise<SourceRegistryPage>
  readonly install: (input: SourceRegistryInstallInput) => Promise<import("@hrbr/plugins").RegistryInstallResult>
}

export interface SourceOAuthClient {
  readonly start: (input: SourceOAuthStartInput) => Promise<import("@hrbr/plugins").OAuthStartResult>
  readonly reconnect: (input: SourceOAuthStartInput) => Promise<import("@hrbr/plugins").OAuthStartResult>
  readonly setupHints: (input: SourceOAuthSetupHintsInput) => Promise<import("@hrbr/plugins").OAuthSetupHints>
}

export interface SourceInstallJobsClient {
  readonly get: (input: SourceInstallJobGetInput) => Promise<import("@hrbr/plugins").PluginInstallJob>
  readonly list: (input?: SourceInstallJobListInput) => Promise<import("@hrbr/plugins").PluginInstallJobListResult>
}

export interface SourceVerificationClient {
  readonly get: (input: SourceVerificationGetInput) => Promise<import("@hrbr/plugins").SourceVerificationGetResult>
  readonly probe: (input: SourceVerificationProbeInput) => Promise<import("@hrbr/plugins").SourceVerificationProbeResult>
  readonly set: (input: SourceVerificationSetInput) => Promise<import("@hrbr/plugins").SourceVerificationSetResult>
}

export interface SourceCatalogReader {
  readonly list: (input?: SourceListInput) => Promise<import("@hrbr/plugins").SourceListResult>
  readonly get: (input: SourceGetInput) => Promise<import("@hrbr/plugins").PluginSource>
  readonly registry: SourceRegistryClient
}

export interface SourceLifecycleClient extends SourceCatalogReader {
  readonly add: (input: SourceAddInput) => Promise<import("@hrbr/plugins").AddSourceResult>
  readonly refresh: (input: SourceRefreshInput) => Promise<import("@hrbr/plugins").RefreshSourceResult>
  readonly remove: (input: SourceRemoveInput) => Promise<import("@hrbr/plugins").RemoveSourceResult>
  readonly setVisibility: (input: SourceVisibilitySetInput) => Promise<import("@hrbr/plugins").PluginSource>
  readonly probeMcp: (input: SourceMcpProbeInput) => Promise<import("@hrbr/plugins").McpProbeResult>
  readonly oauth: SourceOAuthClient
  readonly installJobs: SourceInstallJobsClient
  readonly verification: SourceVerificationClient
}
