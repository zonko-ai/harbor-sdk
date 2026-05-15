#!/usr/bin/env bun
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

interface RegistryRow {
  readonly slug: string
  readonly kind: string
  readonly is_active: number | boolean
  readonly entry_json: string
  readonly availability_status: string
  readonly availability_selectable: number | boolean
  readonly availability_hidden_in_onboarding: number | boolean
  readonly availability_label?: string | null | undefined
  readonly availability_reason?: string | null | undefined
  readonly availability_code?: string | null | undefined
  readonly availability_overridden: number | boolean
  readonly requires_global_oauth_client: number | boolean
  readonly global_oauth_eligible: number | boolean
  readonly display_name_override?: string | null | undefined
  readonly description_override?: string | null | undefined
  readonly category_override?: string | null | undefined
  readonly icon_url_override?: string | null | undefined
}

interface RegistryEntry {
  readonly slug: string
  readonly display_name: string
  readonly description: string
  readonly category: string
  readonly kind: string
  readonly default_namespace: string
  readonly icon_url?: string | undefined
  readonly links?: readonly LocalMcpLink[] | undefined
  readonly auth?: {
    readonly method?: string | undefined
    readonly header_name?: string | undefined
    readonly query_param?: string | undefined
    readonly prefix?: string | undefined
    readonly required_secrets?: readonly string[] | undefined
  } | undefined
  readonly config?: {
    readonly mcp_endpoint?: string | undefined
    readonly mcp_transport?: string | undefined
    readonly oauth_discovery?: RegistryOAuthDiscovery | undefined
  } | undefined
}

interface RegistryOAuthDiscovery {
  readonly authorization_server?: string | undefined
  readonly authorization_endpoint?: string | undefined
  readonly token_endpoint?: string | undefined
  readonly registration_endpoint?: string | undefined
  readonly scopes_supported?: readonly string[] | undefined
  readonly resource?: string | undefined
  readonly has_dynamic_registration?: boolean | undefined
  readonly token_endpoint_auth_methods_supported?: readonly string[] | undefined
  readonly revocation_endpoint?: string | undefined
}

interface LocalMcpLink {
  readonly label: string
  readonly url: string
  readonly kind?: string | undefined
}

interface LocalMcpCatalogEntry {
  readonly slug: string
  readonly displayName: string
  readonly description: string
  readonly category: string
  readonly defaultNamespace: string
  readonly endpoint: string
  readonly transport: "http" | "sse"
  readonly auth: {
    readonly mode: "none" | "oauth2" | "bearer" | "query" | "header" | "basic"
    readonly requiredSecrets: readonly string[]
    readonly headerName?: string | undefined
    readonly queryParam?: string | undefined
    readonly prefix?: string | undefined
  }
  readonly oauthDiscovery?: {
    readonly authorizationServer?: string | undefined
    readonly authorizationEndpoint: string
    readonly tokenEndpoint: string
    readonly registrationEndpoint?: string | undefined
    readonly scopes: readonly string[]
    readonly resource?: string | undefined
    readonly hasDynamicRegistration?: boolean | undefined
    readonly tokenEndpointAuthMethods?: readonly string[] | undefined
    readonly revocationEndpoint?: string | undefined
  } | undefined
  readonly availability: {
    readonly status: "active" | "coming_soon"
    readonly selectable: boolean
    readonly hiddenInOnboarding: boolean
    readonly overridden: boolean
    readonly label?: string | undefined
    readonly reason?: string | undefined
    readonly code?: string | undefined
  }
  readonly localAvailability: {
    readonly status: "active" | "coming_soon"
    readonly selectable: boolean
    readonly hiddenInOnboarding: boolean
    readonly reason?: string | undefined
    readonly code?: string | undefined
  }
  readonly requiresGlobalOAuthClient: boolean
  readonly globalOAuthEligible: boolean
  readonly verified: boolean
  readonly iconUrl?: string | undefined
  readonly links: readonly LocalMcpLink[]
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")
const defaultOutput = resolve(repoRoot, "packages/sdk/registry-catalog/data/v1/local-mcp-catalog.json")

function argValue(name: string): string | undefined {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

function hasArg(name: string): boolean {
  return process.argv.includes(name)
}

function readDotEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  const env: Record<string, string> = {}
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match) continue
    let value = match[2] ?? ""
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[match[1]!] = value
  }
  return env
}

function parseWranglerRows(stdout: string): readonly RegistryRow[] {
  const start = stdout.indexOf("[")
  const end = stdout.lastIndexOf("]")
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Wrangler D1 output did not contain a JSON result array.")
  }
  const parsed = JSON.parse(stdout.slice(start, end + 1)) as Array<{ readonly results?: readonly RegistryRow[] }>
  return parsed[0]?.results ?? []
}

function readRowsFromInput(path: string): readonly RegistryRow[] {
  return parseWranglerRows(readFileSync(path, "utf8"))
}

function readRowsFromStagingD1(harborRoot: string): readonly RegistryRow[] {
  const apiRoot = resolve(harborRoot, "apps/api")
  const env = {
    ...process.env,
    ...readDotEnv(resolve(harborRoot, ".env.staging")),
  }
  const result = spawnSync(
    "bunx",
    [
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--env",
      "staging",
      "--remote",
      "--json",
      "--command",
      `SELECT slug, kind, is_active, entry_json,
              availability_status, availability_selectable, availability_hidden_in_onboarding,
              availability_label, availability_reason, availability_code, availability_overridden,
              requires_global_oauth_client, global_oauth_eligible,
              display_name_override, description_override, category_override, icon_url_override
         FROM (
           SELECT slug, kind, is_active, entry_json,
                  availability_status, availability_selectable, availability_hidden_in_onboarding,
                  availability_label, availability_reason, availability_code, availability_overridden,
                  requires_global_oauth_client, global_oauth_eligible,
                  display_name_override, description_override, category_override, icon_url_override
             FROM plugin_registry_entry_admin_overrides
           UNION ALL
           SELECT slug, kind, is_active, entry_json,
                  availability_status, availability_selectable, availability_hidden_in_onboarding,
                  availability_label, availability_reason, availability_code, availability_overridden,
                  requires_global_oauth_client, global_oauth_eligible,
                  display_name_override, description_override, category_override, icon_url_override
             FROM plugin_registry_entries base
            WHERE NOT EXISTS (
              SELECT 1
                FROM plugin_registry_entry_admin_overrides admin
               WHERE admin.slug = base.slug
            )
         ) plugin_registry_entries
        WHERE kind = 'mcp'
          AND is_active = 1
        ORDER BY slug ASC;`,
    ],
    { cwd: apiRoot, env, encoding: "utf8" }
  )
  if (result.status !== 0) {
    throw new Error(result.stderr || "Wrangler D1 MCP catalog export failed.")
  }
  return parseWranglerRows(result.stdout)
}

function bool(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1
}

function nonEmpty(value: string | null | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined
}

function projectOAuth(discovery: RegistryOAuthDiscovery | undefined): LocalMcpCatalogEntry["oauthDiscovery"] {
  if (!discovery?.authorization_endpoint || !discovery.token_endpoint) return undefined
  return {
    ...(nonEmpty(discovery.authorization_server) ? { authorizationServer: discovery.authorization_server } : {}),
    authorizationEndpoint: discovery.authorization_endpoint,
    tokenEndpoint: discovery.token_endpoint,
    ...(nonEmpty(discovery.registration_endpoint) ? { registrationEndpoint: discovery.registration_endpoint } : {}),
    scopes: [...(discovery.scopes_supported ?? [])],
    ...(nonEmpty(discovery.resource) ? { resource: discovery.resource } : {}),
    ...(discovery.has_dynamic_registration !== undefined ? { hasDynamicRegistration: discovery.has_dynamic_registration } : {}),
    ...(discovery.token_endpoint_auth_methods_supported !== undefined
      ? { tokenEndpointAuthMethods: [...discovery.token_endpoint_auth_methods_supported] }
      : {}),
    ...(nonEmpty(discovery.revocation_endpoint) ? { revocationEndpoint: discovery.revocation_endpoint } : {}),
  }
}

function projectRow(row: RegistryRow): LocalMcpCatalogEntry {
  const base = JSON.parse(row.entry_json) as RegistryEntry
  const entry = {
    ...base,
    ...(nonEmpty(row.display_name_override) ? { display_name: row.display_name_override! } : {}),
    ...(nonEmpty(row.description_override) ? { description: row.description_override! } : {}),
    ...(nonEmpty(row.category_override) ? { category: row.category_override! } : {}),
    ...(nonEmpty(row.icon_url_override) ? { icon_url: row.icon_url_override! } : {}),
  }
  if (entry.kind !== "mcp" || row.kind !== "mcp") {
    throw new Error(`Expected MCP registry row for ${row.slug}.`)
  }
  if (!entry.config?.mcp_endpoint) {
    throw new Error(`MCP registry row ${row.slug} is missing config.mcp_endpoint.`)
  }
  const oauthDiscovery = projectOAuth(entry.config.oauth_discovery)
  const authMethod = entry.auth?.method ?? "none"
  const mode = oauthDiscovery ? "oauth2" : authMethod
  if (!["none", "oauth2", "bearer", "query", "header", "basic"].includes(mode)) {
    throw new Error(`MCP registry row ${row.slug} has unsupported auth mode ${mode}.`)
  }
  const availabilityStatus = row.availability_status === "coming_soon" ? "coming_soon" : "active"
  const availabilityCode = nonEmpty(row.availability_code)
  const localAvailability = availabilityCode === "superseded_by_kind"
    ? {
      status: "active" as const,
      selectable: true,
      hiddenInOnboarding: false,
      reason: "Enabled for local Harbor because v1 is MCP-only.",
      code: "local_mcp_only",
    }
    : {
      status: availabilityStatus as "active" | "coming_soon",
      selectable: bool(row.availability_selectable),
      hiddenInOnboarding: bool(row.availability_hidden_in_onboarding),
      ...(nonEmpty(row.availability_reason) ? { reason: row.availability_reason! } : {}),
      ...(availabilityCode ? { code: availabilityCode } : {}),
    }
  return {
    slug: row.slug,
    displayName: entry.display_name,
    description: entry.description,
    category: entry.category,
    defaultNamespace: entry.default_namespace,
    endpoint: entry.config.mcp_endpoint,
    transport: entry.config.mcp_transport === "sse" ? "sse" : "http",
    auth: {
      mode: mode as LocalMcpCatalogEntry["auth"]["mode"],
      requiredSecrets: [...(entry.auth?.required_secrets ?? [])],
      ...(nonEmpty(entry.auth?.header_name) ? { headerName: entry.auth!.header_name } : {}),
      ...(nonEmpty(entry.auth?.query_param) ? { queryParam: entry.auth!.query_param } : {}),
      ...(nonEmpty(entry.auth?.prefix) ? { prefix: entry.auth!.prefix } : {}),
    },
    ...(oauthDiscovery ? { oauthDiscovery } : {}),
    availability: {
      status: availabilityStatus,
      selectable: bool(row.availability_selectable),
      hiddenInOnboarding: bool(row.availability_hidden_in_onboarding),
      overridden: bool(row.availability_overridden),
      ...(nonEmpty(row.availability_label) ? { label: row.availability_label! } : {}),
      ...(nonEmpty(row.availability_reason) ? { reason: row.availability_reason! } : {}),
      ...(availabilityCode ? { code: availabilityCode } : {}),
    },
    localAvailability,
    requiresGlobalOAuthClient: bool(row.requires_global_oauth_client),
    globalOAuthEligible: bool(row.global_oauth_eligible),
    verified: localAvailability.status === "active" && localAvailability.selectable,
    ...(nonEmpty(entry.icon_url) ? { iconUrl: entry.icon_url! } : {}),
    links: [...(entry.links ?? [])],
  }
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

const input = argValue("--input")
const output = resolve(argValue("--output") ?? defaultOutput)
const rows = input
  ? readRowsFromInput(resolve(input))
  : hasArg("--from-staging-d1")
    ? readRowsFromStagingD1(resolve(argValue("--harbor-root") ?? "../harbor"))
    : (() => {
      throw new Error("Pass --input <wrangler-json> or --from-staging-d1.")
    })()

const entries = rows
  .map(projectRow)
  .sort((a, b) => a.slug.localeCompare(b.slug))

writeFileSync(output, stableJson({
  version: 1,
  source: {
    kind: "harbor-main-staging-d1",
    table: "plugin_registry_entries + plugin_registry_entry_admin_overrides",
    rowFilter: "effective kind = 'mcp' and is_active = 1",
  },
  entries,
}))

console.log(`Wrote ${entries.length} local MCP catalog entries to ${output}`)
