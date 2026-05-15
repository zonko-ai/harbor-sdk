import { describe, expect, it } from "bun:test"
import {
  canonicalJson,
  REGISTRY_CATALOG_AVAILABILITY,
  REGISTRY_CATALOG_ENTRIES,
  REGISTRY_CATALOG_ENTRY_BY_SLUG,
  REGISTRY_CATALOG_ICON_HOST_OVERRIDES,
  REGISTRY_CATALOG_LOCAL_ICONS,
  REGISTRY_CATALOG_POPULARITY,
  REGISTRY_CATALOG_SLUGS,
  REGISTRY_CATALOG_VERSION,
  REGISTRY_LOCAL_MCP_CATALOG,
  REGISTRY_LOCAL_MCP_CATALOG_ENTRIES,
} from "../src/index"

describe("@hrbr/registry-catalog committed JSON data", () => {
  it("exposes a versioned slug index with a matching entry for every slug", () => {
    expect(REGISTRY_CATALOG_VERSION).toBe(1)
    expect(REGISTRY_CATALOG_SLUGS.length).toBeGreaterThan(100)
    expect(REGISTRY_CATALOG_ENTRIES).toHaveLength(REGISTRY_CATALOG_SLUGS.length)

    const uniqueSlugs = new Set(REGISTRY_CATALOG_SLUGS)
    expect(uniqueSlugs.size).toBe(REGISTRY_CATALOG_SLUGS.length)

    for (const slug of REGISTRY_CATALOG_SLUGS) {
      const entry = REGISTRY_CATALOG_ENTRY_BY_SLUG[slug] as { slug?: string } | undefined
      expect(entry?.slug).toBe(slug)
    }
  })

  it("exposes committed decorator data used by the public registry package", () => {
    expect((REGISTRY_CATALOG_LOCAL_ICONS as Record<string, unknown>)["github-mcp"]).toBeTruthy()
    expect((REGISTRY_CATALOG_ICON_HOST_OVERRIDES as Record<string, string>)["github-mcp"]).toBe("github.com")
    expect((REGISTRY_CATALOG_POPULARITY as { entries: Record<string, number> }).entries["github-mcp"]).toBe(100)
  })

  it("keeps availability governance references inside the committed catalog", () => {
    const slugs = new Set(REGISTRY_CATALOG_SLUGS)
    const availability = REGISTRY_CATALOG_AVAILABILITY as {
      manual_oauth_setup_slugs: string[]
      client_secret_required_slugs: string[]
      global_client_enabled_slugs: string[]
      known_broken_slugs: string[]
      install_verification_pending_slugs: string[]
      superseded_by_kind: Record<string, string>
    }

    for (const slug of [
      ...availability.manual_oauth_setup_slugs,
      ...availability.client_secret_required_slugs,
      ...availability.global_client_enabled_slugs,
      ...availability.known_broken_slugs,
      ...availability.install_verification_pending_slugs,
      ...Object.keys(availability.superseded_by_kind),
      ...Object.values(availability.superseded_by_kind),
    ]) {
      expect(slugs.has(slug), `unknown availability slug: ${slug}`).toBe(true)
    }
  })

  it("enables Slack MCP through the global confidential OAuth client policy", () => {
    const availability = REGISTRY_CATALOG_AVAILABILITY as {
      client_secret_required_slugs: string[]
      global_client_enabled_slugs: string[]
      known_broken_slugs: string[]
    }

    expect(availability.client_secret_required_slugs).toContain("slack-mcp")
    expect(availability.global_client_enabled_slugs).toContain("slack-mcp")
    expect(availability.known_broken_slugs).not.toContain("slack-mcp")
  })

  it("canonicalizes object key order for stable content hashing inputs", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}')
  })

  it("exposes a local-safe MCP catalog seed for offline local Harbor", () => {
    expect(REGISTRY_LOCAL_MCP_CATALOG.version).toBe(1)
    expect(REGISTRY_LOCAL_MCP_CATALOG.source).toEqual({
      kind: "harbor-main-staging-d1",
      table: "plugin_registry_entries + plugin_registry_entry_admin_overrides",
      rowFilter: "effective kind = 'mcp' and is_active = 1",
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES).toHaveLength(105)

    const slugs = new Set<string>()
    for (const entry of REGISTRY_LOCAL_MCP_CATALOG_ENTRIES) {
      slugs.add(entry.slug)
      expect(entry.endpoint).toMatch(/^https?:\/\//)
      expect(["http", "sse"]).toContain(entry.transport)
      expect(entry.defaultNamespace.length).toBeGreaterThan(0)
      expect(entry.auth.requiredSecrets.every((secret) => /^[A-Z0-9_]+$/.test(secret))).toBe(true)
      expect(entry.localAvailability.selectable).toBe(entry.verified)
    }
    expect(JSON.stringify(REGISTRY_LOCAL_MCP_CATALOG)).not.toMatch(/access_token|refresh_token|workspace_id|workos/i)

    expect(slugs.size).toBe(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.length)
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "linear-mcp")).toMatchObject({
      displayName: "Linear MCP",
      defaultNamespace: "linear-mcp",
      endpoint: "https://mcp.linear.app/mcp",
      auth: { mode: "none", requiredSecrets: [] },
      availability: { status: "active", selectable: true, overridden: true },
      localAvailability: { status: "active", selectable: true },
      verified: true,
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "airtable-mcp")).toMatchObject({
      availability: { status: "active", selectable: true, overridden: true },
      localAvailability: { status: "active", selectable: true },
      verified: true,
      iconUrl: "https://tryharbor.ai/plugin-icons/airtable-mcp.svg",
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "notion-mcp")).toMatchObject({
      auth: { mode: "oauth2", requiredSecrets: [] },
      oauthDiscovery: {
        authorizationEndpoint: "https://mcp.notion.com/authorize",
        tokenEndpoint: "https://mcp.notion.com/token",
        resource: "https://mcp.notion.com/mcp",
      },
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "slack-mcp")).toMatchObject({
      auth: { mode: "oauth2", requiredSecrets: [] },
      oauthDiscovery: {
        authorizationEndpoint: "https://slack-mcp.zonko-ai.workers.dev/authorize",
      },
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "firecrawl-mcp")).toMatchObject({
      auth: { mode: "bearer", requiredSecrets: ["FIRECRAWL_API_KEY"] },
    })
    expect(REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === "browserbase-mcp")).toMatchObject({
      auth: { mode: "query", requiredSecrets: ["BROWSERBASE_API_KEY"], queryParam: "browserbaseApiKey" },
    })
  })
})
