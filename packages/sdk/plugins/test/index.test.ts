import { describe, expect, it } from "bun:test"
import { Schema } from "effect"
import {
  ApiGraphqlBinding,
  ApiRequestBinding,
  ApiSourceConfig,
  CliCommandBinding,
  CliSandResultDefaults,
  CliSourceConfig,
  ExecuteResult,
  ExtractedTool,
  MCPSourceConfig,
  PluginSource,
  PluginTool,
  MCPToolBinding,
  RegistryInstallBody,
  RefreshSourceResult,
  SourceAuthTestResult,
  SourceVerification,
  SourceVerificationGetBody,
  SourceVerificationSetBody,
  comparePluginSourcesForDisplay,
  displayPluginSourceStatus,
  effectivePluginSourceStatus,
  isPluginSourceAwaitingOauth,
  isPluginSourceToolCallable,
  isPluginSourceRunnable,
  pluginSourceDomainView,
  pluginToolNamespaceSummary,
  registryAgentSkillSlug,
  selectRepresentativePluginSource,
  SourceConfig,
  summarizePluginSourceGroupHealth,
  ToolBinding,
  ToolBindingJson,
  ToolDescribeBody,
  ToolDescribeResponse,
  ToolsSearchBody,
  ToolsSearchResponse,
} from "../src/index"

describe("plugin contracts", () => {
  it("keeps MCP source configs backward compatible", () => {
    const config = Schema.decodeUnknownSync(SourceConfig)({
      kind: "mcp",
      endpoint: "https://example.com/mcp",
      transport: "http",
    })

    expect(config.kind).toBe("mcp")
    expect(Schema.decodeUnknownSync(MCPSourceConfig)(config).endpoint).toBe("https://example.com/mcp")
  })

  it("decodes CLI source configs", () => {
    const config = Schema.decodeUnknownSync(CliSourceConfig)({
      kind: "cli",
      namespace: "vercel",
      launcher: "binary",
      command: "vercel",
      args: ["deploy"],
      cwd_policy: "workspace",
      allowed_env_keys: ["VERCEL_PROJECT_ID", "VERCEL_ORG_ID"],
      sand_sandbox_policy: {
        filesystem: "workspace",
        network: "allowlist",
        allowed_hosts: ["api.vercel.com"],
      },
      sand_runtime: {
        artifacts: [{ id: "vercel_config_dir", kind: "temp_dir", prefix: "hrbr-sand-vercel-" }],
        env: [{ env: "VERCEL_TELEMETRY_DISABLED", value: { kind: "literal", value: "1" } }],
        args: [
          { kind: "literal", value: "--global-config" },
          { kind: "artifact_path", artifact_id: "vercel_config_dir" },
          { kind: "literal", value: "--token" },
          { kind: "secret_env", env: "VERCEL_TOKEN" },
        ],
      },
      sand_secret_bindings: [{ secret_name: "vercel_token", env: "VERCEL_TOKEN", required: true }],
      cli_result_defaults: {
        sand_result_mode: "json_stdout",
        sand_stdin_mode: "none",
        streaming: true,
      },
      sand_runtime_constraints: {
        os: ["darwin"],
        arch: ["arm64"],
        requires_sandbox_runtime: true,
      },
    })

    expect(config.kind).toBe("cli")
    expect(config.sand_runtime_constraints?.requires_sandbox_runtime).toBe(true)
    expect(config.allowed_env_keys).toEqual(["VERCEL_PROJECT_ID", "VERCEL_ORG_ID"])
    expect(config.sand_runtime?.args).toHaveLength(4)
    expect(config.cli_result_defaults?.sand_result_mode).toBe("json_stdout")
  })

  it("exposes explicit sand result defaults", () => {
    const defaults = Schema.decodeUnknownSync(CliSandResultDefaults)({
      sand_result_mode: "json_stdout",
      sand_stdin_mode: "none",
    })

    expect(defaults.sand_result_mode).toBe("json_stdout")
    expect(defaults.sand_stdin_mode).toBe("none")
  })

  it("decodes API source configs with auth", () => {
    const config = Schema.decodeUnknownSync(ApiSourceConfig)({
      kind: "api",
      protocol: "openapi",
      base_url: "https://api.example.com",
      allowed_hosts: ["api.example.com"],
      spec_url: "https://api.example.com/openapi.json",
      graphql_endpoint: "https://api.example.com/graphql",
      default_headers: {
        "x-client": "harbor",
      },
      timeout_ms: 8_000,
      auth: {
        method: "header",
        env: "EXAMPLE_API_KEY",
        secret_name: "example_api_key",
        header_name: "x-api-key",
        required: true,
      },
    })

    expect(config.kind).toBe("api")
    expect(config.base_url).toBe("https://api.example.com")
    expect(config.allowed_hosts).toEqual(["api.example.com"])
    expect(config.protocol).toBe("openapi")
    expect(config.spec_url).toBe("https://api.example.com/openapi.json")
    expect(config.auth?.env).toBe("EXAMPLE_API_KEY")
  })

  it("rejects unsupported API oauth2 connection auth config", () => {
    expect(() =>
      Schema.decodeUnknownSync(ApiSourceConfig)({
        kind: "api",
        base_url: "https://api.example.com",
        auth: {
          method: "oauth2_connection",
          connection_id: "conn_123",
        },
      }),
    ).toThrow()
  })

  it("decodes both MCP and CLI tool bindings", () => {
    const mcpBinding = Schema.decodeUnknownSync(ToolBinding)({
      kind: "mcp",
      tool_name: "search",
    })
    const cliBinding = Schema.decodeUnknownSync(ToolBinding)({
      kind: "cli_command",
      tool_name: "deploy",
      argv_template: [
        { kind: "literal", value: "deploy" },
        { kind: "option", flag: "--project", path: "project" },
        { kind: "flag", flag: "--prod", path: "prod" },
      ],
      sand_stdin_mode: "none",
      sand_result_mode: "json_stdout",
      streaming: true,
    })

    expect(Schema.decodeUnknownSync(MCPToolBinding)(mcpBinding).tool_name).toBe("search")
    expect(Schema.decodeUnknownSync(CliCommandBinding)(cliBinding).argv_template).toHaveLength(3)
    expect(Schema.decodeUnknownSync(CliCommandBinding)(cliBinding).sand_result_mode).toBe("json_stdout")
  })

  it("decodes JSON-encoded tool bindings", () => {
    const binding = Schema.decodeUnknownSync(ToolBindingJson)(JSON.stringify({
      kind: "mcp",
      tool_name: "search",
    }))

    expect(binding.kind).toBe("mcp")
    expect(Schema.decodeUnknownSync(MCPToolBinding)(binding).tool_name).toBe("search")
  })

  it("decodes tool search and describe contracts", () => {
    const body = Schema.decodeUnknownSync(ToolsSearchBody)({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      query: "create issue",
      source: "linear-mcp",
      kind: ["mcp"],
      limit: 5,
    })
    const response = Schema.decodeUnknownSync(ToolsSearchResponse)({
      hits: [{
        tool_id: "create_issue",
        name: "create_issue",
        namespace: "linear-mcp",
        js_var: "linearMcp",
        display_name: "Create Issue",
        signature: "linearMcp.createIssue(title: string): Promise<unknown>",
        score: 42,
        kind: "mcp",
      }],
    })
    const describeBody = Schema.decodeUnknownSync(ToolDescribeBody)({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      tool_id: "linear-mcp.create_issue",
    })
    const describeResponse = Schema.decodeUnknownSync(ToolDescribeResponse)({
      tool_id: "create_issue",
      name: "create_issue",
      namespace: "linear-mcp",
      js_var: "linearMcp",
      display_name: "Create Issue",
      signature: "linearMcp.createIssue(title: string): Promise<unknown>",
      call_example: "await linearMcp.createIssue({ title: \"...\" })",
      kind: "mcp",
    })

    expect(body.query).toBe("create issue")
    expect(response.hits[0]?.js_var).toBe("linearMcp")
    expect(describeBody.tool_id).toBe("linear-mcp.create_issue")
    expect(describeResponse.call_example).toContain("linearMcp.createIssue")
  })

  it("decodes runtime tool list rows with provider-owned identifiers", () => {
    const tool = Schema.decodeUnknownSync(PluginTool)({
      id: "tool-row-1",
      workspace_id: "11111111-1111-4111-8111-111111111111",
      source_id: "22222222-2222-4222-8222-222222222222",
      tool_id: "notion-mcp.notion-create-comment",
      name: "notion-create-comment",
      display_name: "Create a page comment",
      description: null,
      title: null,
      input_schema: { type: "object" },
      output_schema: { type: "object" },
      annotations: null,
      icons: null,
      binding: { kind: "mcp", tool_name: "notion-create-comment" },
      tags: ["notion"],
      created_at: "2026-05-02T00:00:00.000Z",
      namespace: "notion-mcp",
      js_var: "notionMcp",
      signature: "notionMcp.notionCreateComment(input: unknown): Promise<unknown>",
    })

    expect(tool.tool_id).toBe("notion-mcp.notion-create-comment")
    expect(tool.name).toBe("notion-create-comment")
  })

  it("decodes API request and graphql bindings", () => {
    const requestBinding = Schema.decodeUnknownSync(ToolBinding)({
      kind: "api_request",
      method: "POST",
      path: "/v1/search",
      headers: {
        "content-type": "application/json",
      },
      body_template: {
        q: { "$input": "query" },
      },
      auth: {
        method: "bearer",
        env: "SEARCH_API_TOKEN",
      },
    })
    const graphqlBinding = Schema.decodeUnknownSync(ToolBinding)({
      kind: "api_graphql",
      path: "/graphql",
      document: "query Repo($owner: String!, $name: String!) { repository(owner: $owner, name: $name) { id } }",
      operation_name: "Repo",
      auth: {
        method: "bearer",
        env: "GITHUB_TOKEN",
      },
    })

    expect(Schema.decodeUnknownSync(ApiRequestBinding)(requestBinding).method).toBe("POST")
    expect(Schema.decodeUnknownSync(ApiGraphqlBinding)(graphqlBinding).operation_name).toBe("Repo")
  })

  it("accepts env-keyed registry install secrets", () => {
    const body = Schema.decodeUnknownSync(RegistryInstallBody)({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      slug: "git-cli",
      secrets_by_env: {
        GITHUB_TOKEN: "ghp_test",
        VERCEL_TOKEN: "vercel_test",
      },
    })

    expect(body.secrets_by_env?.GITHUB_TOKEN).toBe("ghp_test")
    expect(body.credential_value).toBeUndefined()
  })

  it("rejects malformed registry install keys and namespaces", () => {
    expect(() =>
      Schema.decodeUnknownSync(RegistryInstallBody)({
        workspace_id: "11111111-1111-4111-8111-111111111111",
        slug: "Git CLI",
        namespace: "bad namespace",
        secrets_by_env: {
          "bad-key": "value",
        },
      })
    ).toThrow()
  })

  it("keeps plugin tools approval-free while requiring normalized ids", () => {
    const tool = Schema.decodeUnknownSync(PluginTool)({
      id: "tool-row",
      workspace_id: "workspace",
      source_id: "source",
      tool_id: "head_sha",
      name: "head_sha",
      display_name: "HEAD SHA",
      binding: { kind: "cli_command" },
      tags: ["git"],
      created_at: "2026-04-22T00:00:00.000Z",
    })

    expect(tool.tool_id).toBe("head_sha")
    expect(tool.display_name).toBe("HEAD SHA")
  })

  it("decodes dynamic worker execute response envelopes", () => {
    const result = Schema.decodeUnknownSync(ExecuteResult)({
      result: { ok: true },
      logs: [{ level: "info", message: "done" }],
      mode: "dynamic_worker",
      artifacts: [
        {
          key: "workspaces/ws/artifacts/run/image.png",
          url: "/artifacts/workspaces/ws/artifacts/run/image.png",
          content_type: "image/png",
          size: 42,
        },
      ],
      run_id: "11111111-1111-4111-8111-111111111111",
    })

    expect(result.mode).toBe("dynamic_worker")
    expect(result.artifacts?.[0]?.content_type).toBe("image/png")
  })

  it("decodes source auth-test diagnostics", () => {
    const result = Schema.decodeUnknownSync(SourceAuthTestResult)({
      ok: false,
      http_status: 401,
      latency_ms: 85,
      redacted_request: {
        method: "POST",
        url: "https://api.example.com/graphql",
        headers: {
          Authorization: "<redacted>",
        },
        body_preview: "query Viewer { viewer { id } }",
      },
      upstream_body_preview: "{\"error\":\"invalid token\"}",
      provider_diagnosis: "unauthorized",
      suggested_fix: "Replace the credential with a valid provider token for this workspace.",
    })

    expect(result.ok).toBe(false)
    expect(result.redacted_request.headers.Authorization).toBe("<redacted>")
  })

  it("decodes source refresh results", () => {
    const source = {
      id: "22222222-2222-4222-8222-222222222222",
      workspace_id: "11111111-1111-4111-8111-111111111111",
      kind: "mcp",
      namespace: "linear",
      display_name: "Linear",
      config: {},
      auth_config: {},
      status: "ready",
      tool_count: 8,
      created_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
    }
    const result = Schema.decodeUnknownSync(RefreshSourceResult)({
      source_id: source.id,
      status: "ready",
      tool_count: 8,
      source,
    })

    expect(result.source.namespace).toBe("linear")
    expect(result.tool_count).toBe(8)
  })

  it("rejects malformed extracted tool identifiers", () => {
    expect(() =>
      Schema.decodeUnknownSync(ExtractedTool)({
        tool_id: "bad tool",
        name: "bad tool",
        display_name: "Bad Tool",
        binding: { kind: "mcp", tool_name: "search" },
      })
    ).toThrow()
  })

  it("decodes source verification write/read payloads", () => {
    const setBody = Schema.decodeUnknownSync(SourceVerificationSetBody)({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      source_id: "22222222-2222-4222-8222-222222222222",
      machine_id: "mbp-umang",
      agent_id: "coast-cli",
      status: "failed",
      error: "missing GH_TOKEN",
      details: { hint: "run hrbr plugins auth gh" },
      checked_at: "2026-04-24T12:00:00.000Z",
    })
    const getBody = Schema.decodeUnknownSync(SourceVerificationGetBody)({
      workspace_id: "11111111-1111-4111-8111-111111111111",
      source_id: "22222222-2222-4222-8222-222222222222",
      machine_id: "mbp-umang",
      agent_id: "coast-cli",
    })

    expect(setBody.status).toBe("failed")
    expect(getBody.machine_id).toBe("mbp-umang")
  })

  it("decodes source verification records and optional source readiness fields", () => {
    const verification = Schema.decodeUnknownSync(SourceVerification)({
      id: "33333333-3333-4333-8333-333333333333",
      workspace_id: "11111111-1111-4111-8111-111111111111",
      source_id: "22222222-2222-4222-8222-222222222222",
      machine_id: "mbp-umang",
      agent_id: "coast-cli",
      status: "verified",
      verified: true,
      checked_at: "2026-04-24T12:00:00.000Z",
      created_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
    })
    const source = Schema.decodeUnknownSync(PluginSource)({
      id: "22222222-2222-4222-8222-222222222222",
      workspace_id: "11111111-1111-4111-8111-111111111111",
      kind: "api",
      namespace: "httpbin",
      display_name: "Httpbin",
      config: {},
      auth_config: {},
      status: "ready",
      tool_count: 2,
      verified: false,
      last_verified_at: "2026-04-24T12:00:00.000Z",
      last_verify_error: "missing token",
      latest_verification: {
        source_id: "22222222-2222-4222-8222-222222222222",
        machine_id: "mbp-umang",
        agent_id: "coast-cli",
        status: "failed",
        verified: false,
        checked_at: "2026-04-24T12:00:00.000Z",
        error: "missing token",
      },
      created_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
    })

    expect(verification.status).toBe("verified")
    expect(source.latest_verification?.status).toBe("failed")
  })

  it("selects a runnable or tool-bearing source as the plugin representative", () => {
    const staleNoTools = {
      id: "source-a",
      status: "no_tools" as const,
      caller_status: "no_tools" as const,
      runnable: false,
      tool_count: 0,
      last_synced_at: null,
      updated_at: "2026-04-24T12:03:00.000Z",
      created_at: "2026-04-24T12:03:00.000Z",
    }
    const readyButCallerNeedsOauth = {
      id: "source-b",
      status: "ready" as const,
      caller_status: "requires_oauth" as const,
      runnable: false,
      tool_count: 12,
      last_synced_at: "2026-04-24T12:00:00.000Z",
      updated_at: "2026-04-24T12:00:00.000Z",
      created_at: "2026-04-24T12:00:00.000Z",
    }
    const callerRunnable = {
      id: "source-c",
      status: "ready" as const,
      caller_status: "ready" as const,
      runnable: true,
      tool_count: 8,
      last_synced_at: "2026-04-24T12:01:00.000Z",
      updated_at: "2026-04-24T12:01:00.000Z",
      created_at: "2026-04-24T12:01:00.000Z",
    }

    const sources = [staleNoTools, readyButCallerNeedsOauth, callerRunnable]

    expect(selectRepresentativePluginSource(sources)?.id).toBe("source-c")
    expect([...sources].sort(comparePluginSourcesForDisplay).map((source) => source.id)).toEqual([
      "source-c",
      "source-b",
      "source-a",
    ])
  })

  it("summarizes caller-effective source health for connected plugin groups", () => {
    const sources = [
      {
        status: "ready" as const,
        caller_status: "ready" as const,
        runnable: true,
        tool_count: 4,
      },
      {
        status: "ready" as const,
        caller_status: "requires_oauth" as const,
        runnable: false,
        tool_count: 4,
      },
      {
        status: "ready" as const,
        caller_status: "ready" as const,
        runnable: false,
        tool_count: 0,
      },
    ]

    expect(displayPluginSourceStatus(sources[2]!)).toBe("no_tools")
    expect(summarizePluginSourceGroupHealth(sources)).toEqual({
      activeCount: 1,
      worstStatus: "requires_oauth",
    })
  })

  it("prefers explicit effective_status over legacy status/caller_status rollups", () => {
    const source = {
      status: "ready" as const,
      caller_status: "ready" as const,
      effective_status: "no_tools" as const,
      tool_count: 0,
      runnable: false,
    }

    expect(effectivePluginSourceStatus(source)).toBe("no_tools")
    expect(displayPluginSourceStatus(source)).toBe("no_tools")
    expect(isPluginSourceRunnable(source)).toBe(false)
  })

  it("produces a caller-safe source domain view for oauth-pending sources", () => {
    const source = {
      status: "ready" as const,
      caller_status: "requires_oauth" as const,
      tool_count: 22,
      runnable: true,
    }

    expect(isPluginSourceAwaitingOauth(source)).toBe(true)
    expect(pluginSourceDomainView(source)).toEqual({
      status: "awaiting_oauth",
      effective_status: "awaiting_oauth",
      caller_runnable: false,
      runnable: false,
      tool_count: 0,
    })
  })

  it("extracts registry agent skill slugs with fallback to plugin slug", () => {
    expect(registryAgentSkillSlug({ slug: "github-mcp", skill: { slug: "github" } })).toBe("github")
    expect(registryAgentSkillSlug({ slug: "linear-mcp", skill: {} }, "linear-mcp")).toBe("linear-mcp")
    expect(registryAgentSkillSlug({ slug: "plain-plugin" }, "plain-plugin")).toBe(null)
  })

  it("shares tool namespace callability across Coast and Beach surfaces", () => {
    const ready = {
      namespace: "linear-mcp",
      kind: "mcp",
      status: "ready",
      caller_status: "ready",
      tool_count: 12,
    }
    const awaiting = {
      namespace: "gmail-mcp",
      kind: "mcp",
      status: "ready",
      caller_status: "requires_oauth",
      tool_count: 22,
      runnable: true,
    }

    expect(isPluginSourceToolCallable(ready)).toBe(true)
    expect(pluginToolNamespaceSummary(ready)).toEqual({
      namespace: "linear-mcp",
      mode: "mcp",
      status: "ready",
      tool_count: 12,
    })
    expect(isPluginSourceToolCallable(awaiting)).toBe(false)
    expect(pluginToolNamespaceSummary(awaiting)).toEqual({
      namespace: "gmail-mcp",
      mode: "mcp",
      status: "awaiting_oauth",
      tool_count: 0,
    })
  })
})
