// @hrbr/registry — committed JSON-backed plugin registry entries.
import { Schema } from "effect"
import { REGISTRY_CATALOG_ENTRIES } from "@hrbr/registry-catalog"
import { PluginRegistryEntry } from "./types"

export const PLUGIN_REGISTRY: PluginRegistryEntry[] = Array.from(
  Schema.decodeUnknownSync(Schema.Array(PluginRegistryEntry))(REGISTRY_CATALOG_ENTRIES),
)
