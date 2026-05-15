export {
  REGISTRY_CATALOG_AVAILABILITY,
  REGISTRY_CATALOG_ENTRIES,
  REGISTRY_CATALOG_ENTRY_BY_SLUG,
  REGISTRY_CATALOG_ICON_HOST_OVERRIDES,
  REGISTRY_CATALOG_LOCAL_ICONS,
  REGISTRY_LOCAL_MCP_CATALOG,
  REGISTRY_LOCAL_MCP_CATALOG_ENTRIES,
  REGISTRY_CATALOG_POPULARITY,
  REGISTRY_CATALOG_SLUGS,
  REGISTRY_CATALOG_VERSION,
} from './data'
export type { LocalMcpCatalogEntryJson, LocalMcpCatalogJson, RegistryCatalogEntryJson, RegistryCatalogJson } from './data'

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortJson(value))
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson)
  if (!value || typeof value !== 'object') return value
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value).sort()) {
    sorted[key] = sortJson((value as Record<string, unknown>)[key])
  }
  return sorted
}
