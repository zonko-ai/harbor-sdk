import { describe, expect, it } from "bun:test"
import { createHarborClient, HarborClientError, type HarborClientFetch } from "../src/index"

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: { "content-type": "application/json", ...init?.headers },
  })
}

describe("@hrbr/client", () => {
  it("posts workspace list requests without forcing a selected workspace", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        data: [{
          id: "11111111-1111-4111-8111-111111111111",
          name: "Demo",
          slug: "demo",
          role: "owner",
          onboarded_at: null,
        }],
        limit: 20,
        offset: 0,
        hasMore: false,
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "22222222-2222-4222-8222-222222222222",
      fetch: fetchImpl,
    })

    const result = await harbor.workspaces.list({ limit: 20 })

    expect(result.data[0]?.slug).toBe("demo")
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/workspaces/list")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({ limit: 20 })
  })

  it("unwraps Harbor success envelopes before decoding responses", async () => {
    const fetchImpl: HarborClientFetch = async () =>
      jsonResponse({
        success: true,
        data: {
          data: [{
            id: "11111111-1111-4111-8111-111111111111",
            name: "Envelope Demo",
            slug: "envelope-demo",
            role: "owner",
            onboarded_at: null,
          }],
          limit: 20,
          offset: 0,
          hasMore: false,
        },
      })

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "22222222-2222-4222-8222-222222222222",
      fetch: fetchImpl,
    })

    const result = await harbor.workspaces.list({ limit: 20 })

    expect(result.data[0]?.slug).toBe("envelope-demo")
  })

  it("posts run graph requests to the hosted Harbor runs route", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        run: {
          id: "33333333-3333-4333-8333-333333333333",
          workspace_id: "11111111-1111-4111-8111-111111111111",
          agent_id: "22222222-2222-4222-8222-222222222222",
          status: "completed",
          source: "cli",
          trigger: "exec",
          error_message: null,
          error_code: null,
          exit_code: 0,
          duration_ms: 12,
          artifact_count: 0,
          started_at: "2026-01-01T00:00:00.000Z",
          finished_at: "2026-01-01T00:00:00.012Z",
          created_at: "2026-01-01T00:00:00.000Z",
        },
        spans: [],
        next_cursor: null,
        summary: {
          span_count: 0,
          error_count: 0,
          retry_count: 0,
          total_tokens_in: null,
          total_tokens_out: null,
          total_cost_usd: null,
        },
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    const result = await harbor.runs.graph({
      runId: "33333333-3333-4333-8333-333333333333",
      sinceOffsetMs: 120,
    })

    expect(result.run.id).toBe("33333333-3333-4333-8333-333333333333")
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/runs/graph")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      run_id: "33333333-3333-4333-8333-333333333333",
      since_offset_ms: 120,
    })
  })

  it("posts source list requests to the hosted Harbor sources route", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        data: [{
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
        }],
        limit: 20,
        offset: 0,
        hasMore: false,
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    const result = await harbor.sources.list({ registrySlug: "sentry-mcp", limit: 20 })

    expect(result.data[0]?.namespace).toBe("sentry-mcp")
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/plugins/sources/list")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      registry_slug: "sentry-mcp",
      limit: 20,
    })
  })

  it("posts registry list requests to the hosted Harbor registry route", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({ data: [], total: 0, limit: 0, offset: 0, hasMore: false })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(harbor.sources.registry.list({ slug: "sentry-mcp" })).resolves.toMatchObject({
      data: [],
      total: 0,
    })
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/plugins/registry/list")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      slug: "sentry-mcp",
    })
  })

  it("posts source lifecycle requests to hosted Harbor routes", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      const path = new URL(String(url)).pathname
      if (path === "/plugins/registry/install") {
        return jsonResponse({
          source_id: "33333333-3333-4333-8333-333333333333",
          tool_count: 3,
          status: "ready",
        })
      }
      if (path === "/plugins/sources/refresh") {
        return jsonResponse({
          source_id: "33333333-3333-4333-8333-333333333333",
          tool_count: 4,
          status: "ready",
          source: {
            id: "33333333-3333-4333-8333-333333333333",
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
          },
        })
      }
      if (path === "/plugins/sources/remove") {
        return jsonResponse({
          source_id: "33333333-3333-4333-8333-333333333333",
          removed: true,
        })
      }
      throw new Error(`Unexpected path ${path}`)
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(
      harbor.sources.registry.install({
        slug: "sentry-mcp",
        namespace: "sentry-mcp",
        sourceVisibility: "workspace",
        secretsByEnv: { SENTRY_AUTH_TOKEN: "secret" },
      }),
    ).resolves.toMatchObject({ source_id: "33333333-3333-4333-8333-333333333333" })
    await expect(harbor.sources.refresh({ namespace: "sentry-mcp" })).resolves.toMatchObject({
      tool_count: 4,
    })
    await expect(
      harbor.sources.remove({ sourceId: "33333333-3333-4333-8333-333333333333" }),
    ).resolves.toMatchObject({ removed: true })

    expect(calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/plugins/registry/install",
      "/plugins/sources/refresh",
      "/plugins/sources/remove",
    ])
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      slug: "sentry-mcp",
      namespace: "sentry-mcp",
      source_visibility: "workspace",
      secrets_by_env: { SENTRY_AUTH_TOKEN: "secret" },
    })
    expect(JSON.parse(String(calls[1]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      namespace: "sentry-mcp",
    })
  })

  it("posts OAuth, probe, install job, and verification requests through source lifecycle", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      const path = new URL(String(url)).pathname
      if (path === "/plugins/sources/probe") {
        return jsonResponse({
          endpoint: "https://worker.example.com/mcp",
          connected: true,
          requires_auth: false,
          tool_count: 2,
          server_name: "worker",
          oauth: null,
        })
      }
      if (path === "/plugins/sources/oauth/start") {
        return jsonResponse({
          authorization_url: "https://provider.example.com/oauth",
          state: "state-1",
        })
      }
      if (path === "/plugins/sources/oauth/setup-hints") {
        return jsonResponse({
          display_name: "Sentry",
          redirect_uri: "https://api.tryharbor.ai/oauth/callback",
          register_url: null,
          register_url_source: "none",
          scopes_supported: [],
          requires_client_secret: true,
          has_dynamic_registration: false,
          workspace_client_already_configured: false,
          has_global_client: true,
          authorization_server_host: null,
        })
      }
      if (path === "/plugins/install-jobs/get") {
        return jsonResponse({
          id: "44444444-4444-4444-8444-444444444444",
          workspace_id: "11111111-1111-4111-8111-111111111111",
          slug: "sentry-mcp",
          namespace: "sentry-mcp",
          status: "succeeded",
          attempts: 1,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        })
      }
      if (path === "/plugins/sources/verification/set") {
        return jsonResponse({
          source_id: "33333333-3333-4333-8333-333333333333",
          verification: {
            id: "55555555-5555-4555-8555-555555555555",
            workspace_id: "11111111-1111-4111-8111-111111111111",
            source_id: "33333333-3333-4333-8333-333333333333",
            machine_id: "machine-1",
            agent_id: "agent-1",
            status: "verified",
            verified: true,
            details: null,
            checked_at: "2026-01-01T00:00:00.000Z",
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
          },
        })
      }
      throw new Error(`Unexpected path ${path}`)
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(harbor.sources.probeMcp({ endpoint: "https://worker.example.com/mcp" })).resolves.toMatchObject({
      connected: true,
      tool_count: 2,
    })
    await expect(
      harbor.sources.oauth.start({ sourceId: "33333333-3333-4333-8333-333333333333" }),
    ).resolves.toMatchObject({ state: "state-1" })
    await expect(harbor.sources.oauth.setupHints({ registrySlug: "sentry-mcp" })).resolves.toMatchObject({
      has_global_client: true,
    })
    await expect(
      harbor.sources.installJobs.get({ jobId: "44444444-4444-4444-8444-444444444444" }),
    ).resolves.toMatchObject({ status: "succeeded" })
    await expect(
      harbor.sources.verification.set({
        sourceId: "33333333-3333-4333-8333-333333333333",
        machineId: "machine-1",
        agentId: "agent-1",
        status: "verified",
      }),
    ).resolves.toMatchObject({ verification: { verified: true } })

    expect(calls.map((call) => new URL(call.url).pathname)).toEqual([
      "/plugins/sources/probe",
      "/plugins/sources/oauth/start",
      "/plugins/sources/oauth/setup-hints",
      "/plugins/install-jobs/get",
      "/plugins/sources/verification/set",
    ])
  })

  it("posts tool search requests to the hosted Harbor tools route", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        hits: [{
          tool_id: "web_search_exa",
          name: "web_search_exa",
          namespace: "exa-mcp",
          js_var: "exa_mcp",
          display_name: "Web Search",
          signature: "exa_mcp.web_search_exa(args)",
          score: 11,
          kind: "mcp",
        }],
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    const result = await harbor.tools.search({ query: "search web", limit: 3, mode: "lexical" })

    expect(result.hits[0]?.tool_id).toBe("web_search_exa")
    expect(calls).toHaveLength(1)
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/plugins/tools/search")
    expect(calls[0]?.init?.method).toBe("POST")
    expect((calls[0]?.init?.headers as Record<string, string>).authorization).toBe("Bearer test-key")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      query: "search web",
      limit: 3,
      mode: "lexical",
    })
  })

  it("posts direct tool invocation requests to the hosted Harbor invoke route", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        result: { issue_count: 2 },
        content_type: "application/json",
        duration_ms: 42,
        invocation_id: "invoke-1",
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    const result = await harbor.tools.invoke({
      toolId: "sentry-mcp.search_issues",
      input: { query: "is:unresolved" },
      agentId: "22222222-2222-4222-8222-222222222222",
    })

    expect(result.invocation_id).toBe("invoke-1")
    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/plugins/invoke")
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      tool_id: "sentry-mcp.search_issues",
      input: { query: "is:unresolved" },
      agent_id: "22222222-2222-4222-8222-222222222222",
    })
  })

  it("posts execution requests with optional agent identity headers", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    const fetchImpl: HarborClientFetch = async (url, init) => {
      calls.push({ url: String(url), init })
      return jsonResponse({
        result: { ok: true },
        mode: "dynamic_worker",
        run_id: "33333333-3333-4333-8333-333333333333",
      })
    }

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(
      harbor.tools.execute({
        code: "return await sentry_mcp.searchIssues({ query: 'is:unresolved' })",
        sources: [{ namespace: "sentry-mcp" }],
        timeoutMs: 30_000,
        identity: {
          machineId: "machine-1",
          agentFamily: "custom-sdk-agent",
          agentId: "22222222-2222-4222-8222-222222222222",
          session: "session-1",
        },
      }),
    ).resolves.toMatchObject({ mode: "dynamic_worker" })

    expect(calls[0]?.url).toBe("https://api.tryharbor.ai/plugins/execute")
    expect(calls[0]?.init?.headers).toMatchObject({
      "X-Hrbr-Machine": "machine-1",
      "X-Hrbr-Agent": "custom-sdk-agent",
      "X-Hrbr-Agent-Id": "22222222-2222-4222-8222-222222222222",
      "X-Hrbr-Agent-Session": "session-1",
    })
    expect(JSON.parse(String(calls[0]?.init?.body))).toEqual({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      code: "return await sentry_mcp.searchIssues({ query: 'is:unresolved' })",
      sources: [{ namespace: "sentry-mcp" }],
      timeout_ms: 30000,
    })
  })

  it("decodes schema responses through Harbor plugin contracts", async () => {
    const fetchImpl: HarborClientFetch = async () =>
      jsonResponse({
        tool_id: "exa-mcp.web_search_exa",
        name: "web_search_exa",
        input_type: "type Input = { query: string }",
      })

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai/",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(harbor.tools.schema({ toolId: "exa-mcp.web_search_exa" })).resolves.toMatchObject({
      tool_id: "exa-mcp.web_search_exa",
      input_type: "type Input = { query: string }",
    })
  })

  it("throws a structured error for non-2xx responses", async () => {
    const fetchImpl: HarborClientFetch = async () =>
      jsonResponse({ error: "no workspace" }, { status: 403 })

    const harbor = createHarborClient({
      apiUrl: "https://api.tryharbor.ai",
      apiKey: "test-key",
      workspaceId: "11111111-1111-4111-8111-111111111111",
      fetch: fetchImpl,
    })

    await expect(harbor.tools.list()).rejects.toBeInstanceOf(HarborClientError)
  })
})
