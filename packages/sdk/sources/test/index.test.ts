import { describe, expect, it } from "bun:test"
import {
  isPluginSourceRunnable,
  pluginSourceDomainView,
  type PluginSource,
  type SourceCatalogReader,
  type SourceLifecycleClient,
  type SourceListResult,
} from "../src/index"

function source(overrides: Partial<PluginSource> = {}): PluginSource {
  return {
    id: "source-1",
    workspace_id: "11111111-1111-4111-8111-111111111111",
    kind: "mcp",
    namespace: "sentry-mcp",
    display_name: "Sentry",
    config: {},
    auth_config: {},
    status: "ready",
    tool_count: 4,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  }
}

describe("@hrbr/sources contracts", () => {
  it("keeps source readiness helpers available at the SDK boundary", () => {
    const ready = source()
    const awaitingOauth = source({ caller_status: "requires_oauth" })

    expect(isPluginSourceRunnable(ready)).toBe(true)
    expect(pluginSourceDomainView(awaitingOauth)).toMatchObject({
      status: "awaiting_oauth",
      runnable: false,
      tool_count: 0,
    })
  })

  it("allows platform and hosted clients to share the same source reader shape", async () => {
    const page: SourceListResult = {
      data: [source()],
      limit: 50,
      offset: 0,
      hasMore: false,
    }
    const reader: SourceCatalogReader = {
      list: async () => page,
      get: async ({ sourceId }) => source({ id: sourceId }),
      registry: {
        list: async () => ({ data: [], total: 0, limit: 0, offset: 0, hasMore: false }),
      },
    }

    await expect(reader.list()).resolves.toEqual(page)
    await expect(reader.get({ sourceId: "source-2" })).resolves.toMatchObject({
      id: "source-2",
    })
  })

  it("keeps source lifecycle verbs behind the SDK contract", async () => {
    const client: SourceLifecycleClient = {
      list: async () => ({ data: [], limit: 50, offset: 0, hasMore: false }),
      get: async ({ sourceId }) => source({ id: sourceId }),
      registry: {
        list: async () => ({ data: [], total: 0, limit: 0, offset: 0, hasMore: false }),
        install: async () => ({
          source_id: "33333333-3333-4333-8333-333333333333",
          tool_count: 1,
          status: "ready",
        }),
      },
      add: async () => ({
        source_id: "33333333-3333-4333-8333-333333333333",
        tool_count: 1,
        status: "ready",
        source: source({ id: "33333333-3333-4333-8333-333333333333" }),
      }),
      refresh: async () => ({
        source_id: "33333333-3333-4333-8333-333333333333",
        tool_count: 2,
        status: "ready",
        source: source({ id: "33333333-3333-4333-8333-333333333333", tool_count: 2 }),
      }),
      remove: async ({ sourceId }) => ({ source_id: sourceId, removed: true }),
      setVisibility: async ({ sourceId }) => source({ id: sourceId, source_visibility: "workspace" }),
      probeMcp: async ({ endpoint }) => ({
        endpoint,
        connected: true,
        requires_auth: false,
        tool_count: 1,
        server_name: "dev-mcp",
        oauth: null,
      }),
      oauth: {
        start: async () => ({ authorization_url: "https://provider.example.com/oauth", state: "state-1" }),
        reconnect: async () => ({ authorization_url: "https://provider.example.com/oauth", state: "state-2" }),
        setupHints: async () => ({
          display_name: "Provider",
          redirect_uri: "https://harbor.test/oauth/callback",
          register_url: null,
          register_url_source: "none",
          scopes_supported: [],
          requires_client_secret: true,
          has_dynamic_registration: false,
          workspace_client_already_configured: false,
          has_global_client: true,
          authorization_server_host: null,
        }),
      },
      installJobs: {
        get: async ({ jobId }) => ({
          id: jobId,
          workspace_id: "11111111-1111-4111-8111-111111111111",
          slug: "sentry-mcp",
          namespace: "sentry-mcp",
          status: "succeeded",
          attempts: 1,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        }),
        list: async () => ({ data: [], limit: 50, offset: 0, hasMore: false }),
      },
      verification: {
        get: async ({ sourceId }) => ({ source_id: sourceId, verification: null }),
        probe: async ({ sourceId }) => ({
          source_id: sourceId,
          status: "verified",
          verified: true,
          checked_at: "2026-01-01T00:00:00.000Z",
        }),
        set: async ({ sourceId, machineId, agentId }) => ({
          source_id: sourceId,
          verification: {
            id: "55555555-5555-4555-8555-555555555555",
            workspace_id: "11111111-1111-4111-8111-111111111111",
            source_id: sourceId,
            machine_id: machineId,
            agent_id: agentId,
            status: "verified",
            verified: true,
            checked_at: "2026-01-01T00:00:00.000Z",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        }),
      },
    }

    await expect(client.registry.install({ slug: "sentry-mcp" })).resolves.toMatchObject({
      status: "ready",
    })
    await expect(client.probeMcp({ endpoint: "https://worker.example.com/mcp" })).resolves.toMatchObject({
      connected: true,
    })
  })
})
