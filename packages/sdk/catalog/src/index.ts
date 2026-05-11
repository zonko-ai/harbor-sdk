// @hrbr/catalog - SDK-level catalog facade over the current registry package.
import { REGISTRY_CATALOG_AVAILABILITY } from "@hrbr/registry-catalog"
import {
  getRegistryEntry,
  listRegistryEntries,
  type PluginRegistryEntry,
  type RegistryAvailability,
} from "@hrbr/registry"

export type CatalogEntry = PluginRegistryEntry
export type CatalogAvailability = RegistryAvailability

export interface CatalogAvailabilityRules {
  readonly manual_oauth_setup_slugs: readonly string[]
  readonly client_secret_required_slugs: readonly string[]
  readonly global_client_enabled_slugs: readonly string[]
  readonly known_broken_slugs: readonly string[]
  readonly superseded_by_kind: Readonly<Record<string, string>>
  readonly install_verification_pending_slugs: readonly string[]
}

export function listCatalogEntries(): CatalogEntry[] {
  return listRegistryEntries()
}

export function getCatalogEntry(slug: string): CatalogEntry | undefined {
  return getRegistryEntry(slug)
}

export function getCatalogAvailabilityRules(): CatalogAvailabilityRules {
  return REGISTRY_CATALOG_AVAILABILITY as CatalogAvailabilityRules
}
