// Registry category catalog, re-exported from @hrbr/registry so there is
// exactly one source of truth for the closed set.
//
// Lighthouse tool schemas and coast CLI enums both derive `category` choices
// from here — if a new category is added to @hrbr/registry, no code change
// is required in either surface beyond rebuilding.

export { PluginCategory } from "@hrbr/registry";
export type { PluginCategory as PluginCategoryType } from "@hrbr/registry";

export type {
  RegistryAvailability,
  RegistryAvailabilityReason,
  RegistryAvailabilityStatus,
} from "@hrbr/registry";

// Human-friendly labels. LLM tool descriptions use these verbatim so users
// see "Observability" not "observability" in dashboards/chat UIs.
export const CATEGORY_LABELS: Record<string, string> = {
  search: "Search",
  ai: "AI",
  comms: "Communication",
  dev: "Developer Tools",
  data: "Data",
  web: "Web",
  media: "Media",
  infra: "Infrastructure",
  observability: "Observability",
  analytics: "Analytics",
  storage: "Storage",
  other: "Other",
};

// The closed set duplicated here as plain strings (for JSON-schema enum
// emission in MCP tool schemas — Effect `Schema.Literals` is a runtime
// construct, not a JSON array). Keep this in lockstep with
// `PluginCategory` in @hrbr/registry; the test in this package verifies
// that.
export const CATEGORY_SLUGS = [
  "search",
  "ai",
  "comms",
  "dev",
  "data",
  "web",
  "media",
  "infra",
  "observability",
  "analytics",
  "storage",
  "other",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];
