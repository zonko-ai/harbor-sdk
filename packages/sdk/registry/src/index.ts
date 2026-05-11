// @hrbr/registry — Plugin catalog types, data, and lookup helpers.
// Types live in types.ts, data in entries.ts — no cycle.

export {
  PluginCategory,
  PluginRegistryCliSetup,
  PluginRegistryCliSetupFailureHint,
  PluginRegistryCliSetupFailureMatcher,
  PluginRegistryCliSetupRequiredSecret,
  PluginRegistryCliSetupRunnableRequirement,
  PluginRegistryCliSetupVerifyProbe,
  PluginRegistryApiSetup,
  PluginRegistryApiSetupVerifyProbe,
  PluginRegistryEntry,
  PluginRegistryManifest,
  PluginRegistryManifestToolBinding,
  PluginRegistryManifestTool,
  PluginRegistryEntryAvailability,
  PluginRegistryPublicEntry,
  PluginRegistryListResult,
} from "./types"
export type { LocalIconStyle, LocalIcon, LocalIconSingle, LocalIconThemed } from "./local-icon-style"
export type {
  RegistryAvailability,
  RegistryAvailabilityReason,
  RegistryAvailabilityStatus,
} from "./types"
import type { PluginRegistryEntry, PluginCategory, PluginRegistryManifestTool } from "./types"

// ── Data ─────────────────────────────────────────────────────────────

export { PLUGIN_REGISTRY } from "./entries"

// ── Helpers ──────────────────────────────────────────────────────────

import { REGISTRY_CATALOG_ICON_HOST_OVERRIDES, REGISTRY_CATALOG_POPULARITY } from "@hrbr/registry-catalog"
import { PLUGIN_REGISTRY } from "./entries"
import { LOCAL_ICONS, LOCAL_ICON_PATHS } from "./local-icons"
import type { LocalIcon, LocalIconStyle } from "./local-icon-style"

// ── Local icon helpers ───────────────────────────────────────────────

export function getLocalIcon(slug: string): LocalIcon | undefined {
  return LOCAL_ICONS[slug]
}

export function getLocalIconPath(
  slug: string,
  theme?: 'light' | 'dark',
): string | undefined {
  const icon = LOCAL_ICONS[slug]
  if (!icon) return undefined
  if (icon.kind === 'single') return icon.path
  return theme === 'dark' ? icon.dark : icon.light
}

export function getLocalIconStyle(slug: string): LocalIconStyle | 'themed' | undefined {
  const icon = LOCAL_ICONS[slug]
  if (!icon) return undefined
  return icon.kind === 'themed' ? 'themed' : icon.style
}

export function isLocalIconUrl(url?: string | null): url is string {
  if (typeof url !== 'string') return false
  if (url.startsWith('/plugin-icons/')) return true
  const match = /^https?:\/\/([^/?#]+)(\/[^?#]*)/i.exec(url)
  if (!match) return false
  const host = match[1]?.toLowerCase()
  const pathname = match[2] ?? ''
  return (
    (host === 'tryharbor.ai' || host === 'stag.tryharbor.ai')
    && pathname.startsWith('/plugin-icons/')
  )
}

export { LOCAL_ICONS, LOCAL_ICON_PATHS } from "./local-icons"

export const ICON_HOST_OVERRIDES: Partial<Record<string, string>> = REGISTRY_CATALOG_ICON_HOST_OVERRIDES


// Bump this whenever the outbound fetch shape in
// apps/web/app/api/icon-proxy/route.ts changes (user-agent, accept
// header, size, or any cf.* cache-relevant option). Google ignores
// unknown query params, but Cloudflare's Workers subrequest cache
// keys on the full URL, so bumping this invalidates every stale
// entry in one constant change. Unrelated to the browser-facing
// `?v=…` in apps/web/lib/icon-proxy.ts — that one busts the edge
// + browser cache of our OWN response; this one busts the Worker's
// cache of Google's response.
const FAVICON_PIPELINE_VERSION = 'hrbr3'

export function faviconUrl(host: string): string {
  // sz=256 is the largest size Google's /s2/favicons endpoint honours;
  // for sites that only publish a 16×16 favicon Google still returns
  // that, but asking for the larger variant picks up high-res
  // apple-touch-icons / manifest icons when the site publishes them.
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=256&client=${FAVICON_PIPELINE_VERSION}`
}

export function tryHost(value?: string): string | undefined {
  if (!value) return undefined
  const match = value.match(/^[a-z]+:\/\/([^/?#:]+)/i)
  const host = match?.[1]
  if (!host || host === "raw.githubusercontent.com") return undefined
  return host
}

function deriveIconUrl(entry: PluginRegistryEntry): string | undefined {
  // Entry-declared `icon_url` wins — used for plugins that want a
  // remote brand-mark (e.g. `https://logos.composio.dev/api/gmail`)
  // instead of a hand-drawn local SVG. Fall back to the local mapping
  // when the entry doesn't declare one.
  return entry.icon_url ?? LOCAL_ICON_PATHS[entry.slug]
}

// ── Popularity seed ───────────────────────────────────────────────────
// Hand-tuned relative popularity. Higher = rank higher in the 'Popularity'
// sort on the dashboard catalog. Missing entries default to
// POPULARITY_DEFAULT. This map is the UI's only dependency for 'popular'
// today; later we'll layer workspace-scoped usage metrics on top.
const registryPopularity = REGISTRY_CATALOG_POPULARITY as {
  readonly default: number
  readonly entries: Partial<Record<string, number>>
}
export const POPULARITY_DEFAULT = registryPopularity.default
export const POPULARITY: Partial<Record<string, number>> = registryPopularity.entries

function decorateEntry(entry: PluginRegistryEntry): PluginRegistryEntry {
  const icon_url = deriveIconUrl(entry)
  const popularity = entry.popularity ?? POPULARITY[entry.slug] ?? POPULARITY_DEFAULT
  const needsIcon = icon_url && icon_url !== entry.icon_url
  if (!needsIcon && popularity === entry.popularity) return entry
  return {
    ...entry,
    ...(needsIcon ? { icon_url } : {}),
    popularity,
  }
}

export function getRegistryEntry(slug: string): PluginRegistryEntry | undefined {
  const entry = PLUGIN_REGISTRY.find((e) => e.slug === slug)
  return entry ? decorateEntry(entry) : undefined
}

export function listRegistryEntries(category?: PluginCategory): PluginRegistryEntry[] {
  const entries = category
    ? PLUGIN_REGISTRY.filter((e) => e.category === category)
    : PLUGIN_REGISTRY
  return entries.map(decorateEntry)
}

export function getRequiredSecrets(slug: string): string[] {
  const entry = PLUGIN_REGISTRY.find((e) => e.slug === slug || e.default_namespace === slug)
  return entry ? [...getRequiredSecretEnvs(decorateEntry(entry))] : []
}

const CALLABLE_BINDING_KINDS = new Set(["mcp", "cli_command", "api_request", "api_graphql"])

type ApiAuthLike = {
  readonly method?: string | undefined
  readonly required?: boolean | undefined
  readonly env?: string | undefined
  readonly secret_name?: string | undefined
  readonly username_env?: string | undefined
  readonly username_secret_name?: string | undefined
  readonly password_env?: string | undefined
  readonly password_secret_name?: string | undefined
}

function addIfPresent(target: Set<string>, value: string | undefined, requiredOnly: boolean, required: boolean): void {
  if (!value) return
  if (requiredOnly && !required) return
  target.add(value)
}

function collectApiAuthSecretEnvs(target: Set<string>, auth: ApiAuthLike | undefined, requiredOnly: boolean): void {
  if (!auth || auth.method === "none") return
  const required = auth.required !== false
  addIfPresent(target, auth.env, requiredOnly, required)
  addIfPresent(target, auth.username_env, requiredOnly, required)
  addIfPresent(target, auth.password_env, requiredOnly, required)
}

function getApiBindingAuth(binding: PluginRegistryManifestTool["binding"]): ApiAuthLike | undefined {
  if (binding.kind === "api_request") return binding.auth
  if (binding.kind === "api_graphql") return binding.auth
  return undefined
}

function resolveApiSecretName(auth: ApiAuthLike | undefined, env: string): string | undefined {
  if (!auth) return undefined
  if (auth.env === env) return auth.secret_name
  if (auth.username_env === env) return auth.username_secret_name
  if (auth.password_env === env) return auth.password_secret_name
  return undefined
}

export function countCallableManifestTools(tools: ReadonlyArray<PluginRegistryManifestTool>): number {
  return tools.filter((tool) => CALLABLE_BINDING_KINDS.has(tool.binding.kind)).length
}

export function getRequiredSecretEnvs(entry: PluginRegistryEntry): ReadonlyArray<string> {
  const required = new Set<string>()

  if (entry.kind === "mcp") {
    for (const secret of entry.auth.required_secrets) {
      if (secret) required.add(secret)
    }
  }

  if (entry.kind === "cli") {
    for (const secret of entry.cli_setup.required_secrets) {
      if (secret.required) required.add(secret.env)
    }
    for (const binding of entry.config.sand_secret_bindings ?? []) {
      if (binding.required === false) continue
      required.add(binding.env)
    }
  }

  if (entry.kind === "api") {
    for (const secret of entry.api_setup.required_secrets) {
      if (secret.required) required.add(secret.env)
    }
    collectApiAuthSecretEnvs(required, entry.config.api_auth, true)
    for (const tool of entry.manifest?.tools ?? []) {
      collectApiAuthSecretEnvs(required, getApiBindingAuth(tool.binding), true)
    }
  }

  return [...required]
}

export function getAllowedSecretEnvs(entry: PluginRegistryEntry): ReadonlyArray<string> {
  const allowed = new Set<string>()

  if (entry.kind === "mcp") {
    for (const secret of entry.auth.required_secrets) {
      if (secret) allowed.add(secret)
    }
  }

  if (entry.kind === "cli") {
    for (const secret of entry.cli_setup.required_secrets) {
      allowed.add(secret.env)
    }
    for (const binding of entry.config.sand_secret_bindings ?? []) {
      if (binding.env) allowed.add(binding.env)
    }
  }

  if (entry.kind === "api") {
    for (const secret of entry.api_setup.required_secrets) {
      allowed.add(secret.env)
    }
    collectApiAuthSecretEnvs(allowed, entry.config.api_auth, false)
    for (const tool of entry.manifest?.tools ?? []) {
      collectApiAuthSecretEnvs(allowed, getApiBindingAuth(tool.binding), false)
    }
  }

  return [...allowed]
}

export function resolveRegistryInstallSecrets(
  entry: PluginRegistryEntry,
  input: {
    readonly secrets_by_env?: Readonly<Record<string, string>> | undefined
    readonly credential_value?: string | undefined
  },
): {
  readonly secrets_by_env: Readonly<Record<string, string>>
  readonly missing_required_envs: ReadonlyArray<string>
  readonly unexpected_envs: ReadonlyArray<string>
  readonly primary_auth_env: string | undefined
} {
  const normalized: Record<string, string> = {}
  for (const [env, value] of Object.entries(input.secrets_by_env ?? {})) {
    if (!env || typeof value !== "string") continue
    const trimmed = value.trim()
    if (!trimmed) continue
    normalized[env] = trimmed
  }

  if (input.credential_value && Object.keys(normalized).length === 0) {
    const fallbackEnv = getRequiredSecretEnvs(entry)[0] ?? getAllowedSecretEnvs(entry)[0]
    if (fallbackEnv) normalized[fallbackEnv] = input.credential_value
  }

  const requiredEnvKeys = getRequiredSecretEnvs(entry)
  const allowedEnvKeys = getAllowedSecretEnvs(entry)
  const missingRequired = requiredEnvKeys.filter((env) => !normalized[env])
  const providedKeys = Object.keys(normalized)
  const unexpectedEnvKeys =
    allowedEnvKeys.length === 0
      ? providedKeys
      : providedKeys.filter((env) => !allowedEnvKeys.includes(env))
  const primaryAuthEnv =
    entry.auth.method === "none"
      ? undefined
      : requiredEnvKeys.find((env) => normalized[env]) ?? providedKeys[0]

  return {
    secrets_by_env: normalized,
    missing_required_envs: missingRequired,
    unexpected_envs: unexpectedEnvKeys,
    primary_auth_env: primaryAuthEnv,
  }
}

export function resolveCredentialNameForEnv(entry: PluginRegistryEntry, env: string): string {
  if (entry.kind === "cli") {
    const binding = (entry.config.sand_secret_bindings ?? []).find((item) => item.env === env)
    if (binding?.secret_name) return binding.secret_name
  }

  if (entry.kind === "api") {
    const configMapped = resolveApiSecretName(entry.config.api_auth, env)
    if (configMapped) return configMapped
    for (const tool of entry.manifest?.tools ?? []) {
      const bindingMapped = resolveApiSecretName(getApiBindingAuth(tool.binding), env)
      if (bindingMapped) return bindingMapped
    }
  }

  return env
}
