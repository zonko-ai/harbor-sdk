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
})
