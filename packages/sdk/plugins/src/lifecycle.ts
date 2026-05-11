import { Context, Effect } from "effect"
import type { AuthConfig, PluginSource, SourceConfig, SourceKind, SourceStatus } from "./index"

export type LifecycleRegistryEntry = {
  readonly slug: string
  readonly kind: SourceKind
  readonly display_name: string
  readonly description: string
  readonly category?: string | undefined
  readonly icon_url?: string | null | undefined
  readonly links?: unknown
  readonly default_namespace?: string | undefined
  readonly auth: AuthConfig
  readonly config: Record<string, unknown>
  readonly manifest?: {
    readonly tools?: ReadonlyArray<unknown> | undefined
    readonly shared_defs?: unknown
  } | undefined
  readonly availability?: {
    readonly selectable: boolean
  } | undefined
  readonly oauth_client?: unknown
}

export type LifecycleInstallInput = {
  readonly entry: LifecycleRegistryEntry
  readonly workspaceId: string
  readonly actorId: string
  readonly sourceId: string
  readonly namespace: string
  readonly sourceConfig: SourceConfig
  readonly authConfig: AuthConfig
  readonly detectedStatus?: SourceStatus | string | undefined
  readonly primaryCredentialValue?: string | undefined
  readonly toolInsertConcurrency?: number | undefined
  readonly workerEnv?: Record<string, string | undefined> | undefined
  readonly encryptionKey?: string | undefined
}

export type LifecycleRefreshInput = {
  readonly source: PluginSource
  readonly config: SourceConfig
  readonly authConfig: AuthConfig
  readonly actorId: string
  readonly entry?: LifecycleRegistryEntry | undefined
  readonly primaryCredentialValue?: string | undefined
  readonly workerEnv?: Record<string, string | undefined> | undefined
  readonly encryptionKey?: string | undefined
}

export type LifecycleRemoveInput = {
  readonly sourceId: string
  readonly workspaceId: string
}

export type LifecycleDetectInput = {
  readonly entry: LifecycleRegistryEntry
  readonly sourceConfig: SourceConfig
  readonly authConfig: AuthConfig
  readonly workerEnv?: Record<string, string | undefined> | undefined
}

export type LifecycleSourceResult = {
  readonly source_id: string
  readonly tool_count: number
  readonly status: SourceStatus | string
  readonly source?: PluginSource | undefined
}

export type LifecycleDetectResult = {
  readonly sourceConfig: SourceConfig
  readonly authConfig: AuthConfig
  readonly status?: SourceStatus | string | undefined
}

export type PluginLifecycleShape = {
  readonly install: (input: LifecycleInstallInput) => Effect.Effect<LifecycleSourceResult, unknown>
  readonly refresh: (input: LifecycleRefreshInput) => Effect.Effect<LifecycleSourceResult, unknown>
  readonly remove: (input: LifecycleRemoveInput) => Effect.Effect<{ readonly source_id: string; readonly removed: boolean }, unknown>
  readonly detect: (input: LifecycleDetectInput) => Effect.Effect<LifecycleDetectResult, unknown>
}

export class PluginLifecycle extends Context.Service<PluginLifecycle, PluginLifecycleShape>()("PluginLifecycle") {}
