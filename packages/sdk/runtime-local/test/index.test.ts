import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, expect, it } from "bun:test"
import * as v from "valibot"
import {
  ensureHarborLocalProject,
  expectedHarborLocalTables,
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalToolIndex,
  createHarborLocalCredentialResolver,
  createHarborLocalCredentialResolverFromEnv,
  createHarborLocalExecRuntime,
  createHarborLocalMcpPluginRuntime,
  createHarborLocalMcpToolRuntime,
  createHarborLocalWorkflowReplayFixture,
  createHarborLocalSubmissionSnapshot,
  harborLocalDaemonConnection,
  harborLocalPaths,
  harborLocalSubmissionLayout,
  generateHarborLocalWorkflowManifest,
  generateHarborLocalPluginPackageManifest,
  generateHarborLocalWorkflowPackageManifest,
  harborLocalSecurityAction,
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryActionSchema,
  harborLocalRegistryAgentStepSchema,
  HARBOR_LOCAL_DIR,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  HARBOR_LOCAL_SCHEMA_VERSION,
  importHarborLocalCredentialsFromEnv,
  importHarborLocalCredentialsFromEnvKey,
  installHarborLocalPluginManifest,
  installHarborLocalMcpPlugin,
  hashHarborLocalToken,
  listHarborLocalMcpToolBindings,
  listHarborLocalSources,
  completeHarborLocalOAuthFlow,
  connectHarborLocalMcpOAuthSource,
  putHarborLocalMcpToolBindings,
  readHarborLocalCredentialKeyFromEnv,
  readHarborLocalRuntimeManifest,
  readHarborLocalCredentials,
  readHarborLocalCredentialsFromEnvKey,
  readHarborLocalMcpSource,
  readHarborLocalOAuthStatus,
  redactHarborSecret,
  readHarborRegistryDevRefs,
  removeHarborRegistryDevRef,
  refreshHarborLocalMcpSource,
  runHarborLocalRegistryAction,
  runHarborLocalQuickJS,
  runHarborLocalJob,
  runHarborLocalWorkflow,
  runHarborLocalMigrations,
  runHarborLocalStaticSecurityChecks,
  startHarborLocalDaemon,
  startHarborLocalOAuthFlow,
  upsertHarborLocalMcpSource,
  upsertHarborRegistryDevRef,
  validateHarborLocalPackageManifest,
  validateHarborLocalSubmission,
  requireHarborLocalConfirmation,
  watchHarborRegistryDevRefs,
  writeHarborLocalCredentials,
  LOCAL_WORKSPACE_ID,
  type HarborRegistryDevRefsFile,
} from "../src/index"
import { createHarborLocalRuntime } from "../src/promise"

async function withTempProject<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "hrbr-runtime-local-"))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("@hrbr/runtime-local project layout", () => {
  it("creates the local .harbor layout and protects it with .gitignore", async () => {
    await withTempProject(async (projectRoot) => {
      const result = await ensureHarborLocalProject({ projectRoot })
      const paths = harborLocalPaths(projectRoot)

      expect(result.workspaceId).toBe(LOCAL_WORKSPACE_ID)
      expect(result.paths).toEqual(paths)
      expect(result.gitignoreUpdated).toBe(true)

      const gitignore = await readFile(join(projectRoot, ".gitignore"), "utf8")
      expect(gitignore).toContain(`${HARBOR_LOCAL_DIR}/`)

      const refs = JSON.parse(await readFile(paths.registryRefs, "utf8")) as HarborRegistryDevRefsFile
      expect(refs).toEqual({ version: 1, workspaceId: "local", refs: [] })

      const sqlite = await readFile(paths.sqlite)
      expect(sqlite.length).toBeGreaterThan(0)

      await expect(readFile(paths.artifacts, "utf8")).rejects.toThrow()
      await expect(readFile(paths.traces, "utf8")).rejects.toThrow()
      await expect(readFile(paths.cache, "utf8")).rejects.toThrow()
    })
  })

  it("is idempotent and does not duplicate .gitignore entries", async () => {
    await withTempProject(async (projectRoot) => {
      const first = await ensureHarborLocalProject({ projectRoot })
      const second = await ensureHarborLocalProject({ projectRoot })

      expect(first.gitignoreUpdated).toBe(true)
      expect(second.gitignoreUpdated).toBe(false)

      const gitignore = await readFile(join(projectRoot, ".gitignore"), "utf8")
      expect(gitignore.match(/\.harbor\//g)).toHaveLength(1)
    })
  })
})

describe("@hrbr/runtime-local sqlite schema", () => {
  it("tracks the MVP local runtime tables in the initial migration", () => {
    const tables = expectedHarborLocalTables()
    expect(tables).toContain("local_workspace")
    expect(tables).toContain("source_refs")
    expect(tables).toContain("tool_index")
    expect(tables).toContain("workflow_refs")
    expect(tables).toContain("job_refs")
    expect(tables).toContain("app_refs")
    expect(tables).toContain("runs")
    expect(tables).toContain("spans")
    expect(tables).toContain("artifact_metadata")
    expect(tables).toContain("cache_metadata")
    expect(tables).toContain("credential_metadata")
    expect(tables).toContain("oauth_clients")
    expect(tables).toContain("oauth_pending_flows")
    expect(tables).toContain("oauth_grants")
    expect(tables).toContain("mcp_sources")
    expect(tables).toContain("mcp_source_headers")
    expect(tables).toContain("mcp_source_query_params")
    expect(tables).toContain("mcp_tool_bindings")
  })

  it("runs local migrations in version order", async () => {
    const statements: string[] = []
    const latest = await runHarborLocalMigrations({
      exec: async (sql) => {
        statements.push(sql)
      },
    })

    expect(latest).toBe(HARBOR_LOCAL_SCHEMA_VERSION)
    expect(statements).toHaveLength(1)
    expect(statements[0]).toContain("CREATE TABLE IF NOT EXISTS local_workspace")
    expect(statements[0]).toContain("CREATE TABLE IF NOT EXISTS mcp_sources")
    expect(statements[0]).toContain("CREATE TABLE IF NOT EXISTS mcp_tool_bindings")
  })
})

describe("@hrbr/runtime-local daemon", () => {
  it("starts on localhost, writes runtime metadata, and protects control routes", async () => {
    await withTempProject(async (projectRoot) => {
      const daemon = await startHarborLocalDaemon({
        projectRoot,
        token: "test-token",
        runtimeVersion: "test",
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })
      try {
        expect(daemon.info.host).toBe("127.0.0.1")
        expect(daemon.info.workspaceId).toBe("local")
        expect(daemon.origin).toBe(`http://127.0.0.1:${daemon.info.port}`)

        await expect(fetch(`${daemon.origin}/health`).then((res) => res.json())).resolves.toEqual({
          ok: true,
          workspace_id: "local",
        })

        await expect(fetch(`${daemon.origin}/control/info`)).resolves.toMatchObject({
          status: 401,
        })

        const authed = await fetch(`${daemon.origin}/control/info`, {
          headers: { authorization: `Bearer ${daemon.token}` },
        })
        await expect(authed.json()).resolves.toMatchObject({
          ok: true,
          runtime: { host: "127.0.0.1", status: "running", runtimeVersion: "test" },
        })

        const runtime = await readHarborLocalRuntimeManifest(projectRoot)
        expect(runtime.manifest).toMatchObject({
          workspaceId: "local",
          host: "127.0.0.1",
          port: daemon.info.port,
          token: "test-token",
          tokenHash: hashHarborLocalToken("test-token"),
          runtimeVersion: "test",
        })
        expect(runtime.manifest && harborLocalDaemonConnection(runtime.manifest)).toEqual({
          origin: daemon.origin,
          token: "test-token",
          headers: { authorization: "Bearer test-token" },
        })
      } finally {
        await daemon.close()
      }
    })
  })

  it("exposes the placeholder MCP endpoint on the daemon port", async () => {
    await withTempProject(async (projectRoot) => {
      const daemon = await startHarborLocalDaemon({ projectRoot, token: "test-token" })
      try {
        const response = await fetch(`${daemon.origin}/mcp`)
        expect(response.status).toBe(501)
        await expect(response.json()).resolves.toEqual({ ok: false, code: "mcp_not_implemented" })
      } finally {
        await daemon.close()
      }
    })
  })

  it("does not expose Cloudflare provisioning routes from the local daemon", async () => {
    await withTempProject(async (projectRoot) => {
      const daemon = await startHarborLocalDaemon({ projectRoot, token: "test-token" })
      try {
        const response = await fetch(`${daemon.origin}/control/cloudflare/plan`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${daemon.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ account: { accountId: "acct-1" }, desiredResources: [] }),
        })
        expect(response.status).toBe(404)
        await expect(response.json()).resolves.toEqual({ ok: false, code: "not_found" })
      } finally {
        await daemon.close()
      }
    })
  })
})

describe("@hrbr/runtime-local registry dev refs", () => {
  it("persists dev refs idempotently for local source paths", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })

      await upsertHarborRegistryDevRef(projectRoot, {
        kind: "source",
        path: "sources/acme.ts",
        name: "acme",
      })
      await upsertHarborRegistryDevRef(projectRoot, {
        kind: "source",
        path: "sources/acme.ts",
        name: "acme",
      })
      await upsertHarborRegistryDevRef(projectRoot, {
        kind: "workflow",
        path: "workflows/triage.ts",
      })

      await expect(readHarborRegistryDevRefs(projectRoot)).resolves.toEqual({
        version: 1,
        workspaceId: "local",
        refs: [
          { kind: "source", path: "sources/acme.ts", name: "acme" },
          { kind: "workflow", path: "workflows/triage.ts" },
        ],
      })

      await removeHarborRegistryDevRef(projectRoot, { kind: "source", path: "sources/acme.ts" })
      await expect(readHarborRegistryDevRefs(projectRoot)).resolves.toMatchObject({
        refs: [{ kind: "workflow", path: "workflows/triage.ts" }],
      })
    })
  })

  it("preserves concurrent registry ref updates", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })

      await Promise.all([
        upsertHarborRegistryDevRef(projectRoot, {
          kind: "plugin",
          path: "plugins/final.json",
          name: "Final Plugin",
        }),
        upsertHarborRegistryDevRef(projectRoot, {
          kind: "job",
          path: "jobs/final.json",
          name: "Final Job",
        }),
        upsertHarborRegistryDevRef(projectRoot, {
          kind: "app",
          path: "apps/final.json",
          name: "Final App",
        }),
      ])

      await expect(readHarborRegistryDevRefs(projectRoot)).resolves.toMatchObject({
        refs: [
          { kind: "app", path: "apps/final.json", name: "Final App" },
          { kind: "job", path: "jobs/final.json", name: "Final Job" },
          { kind: "plugin", path: "plugins/final.json", name: "Final Plugin" },
        ],
      })
    })
  })

  it("watches dev ref paths for hot reload signals", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await mkdir(join(projectRoot, "sources"), { recursive: true })
      await writeFile(join(projectRoot, "sources/acme.ts"), "export default {}\n")
      await upsertHarborRegistryDevRef(projectRoot, {
        kind: "source",
        path: "sources/acme.ts",
        name: "acme",
      })

      const event = new Promise<string>((resolve) => {
        watchHarborRegistryDevRefs(projectRoot, (item) => resolve(item.ref.path))
          .then(async (watcher) => {
            await writeFile(join(projectRoot, "sources/acme.ts"), "export default { changed: true }\n")
            setTimeout(() => watcher.close(), 150)
          })
      })

      await expect(event).resolves.toBe("sources/acme.ts")
    })
  })
})

describe("@hrbr/runtime-local MCP source store", () => {
  it("stores MCP source auth, credential maps, and durable tool bindings separately", async () => {
    await withTempProject(async (projectRoot) => {
      const source = await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Linear MCP",
          namespace: "linear-mcp",
          endpoint: "https://mcp.linear.app/mcp",
          remoteTransport: "auto",
          headers: {
            authorization: { kind: "binding", slot: "auth:oauth2:connection", prefix: "Bearer " },
          },
          queryParams: {
            tenant: "local-dev",
          },
          auth: { kind: "oauth2" },
        },
        now: () => new Date("2026-05-14T00:00:00.000Z"),
      })

      expect(source).toMatchObject({
        id: "linear-mcp",
        workspaceId: "local",
        transport: "remote",
        name: "Linear MCP",
        namespace: "linear-mcp",
        endpoint: "https://mcp.linear.app/mcp",
        remoteTransport: "auto",
        status: "requires_auth",
        auth: {
          kind: "oauth2",
          connectionSlot: "auth:oauth2:connection",
        },
        headers: {
          authorization: { kind: "binding", slot: "auth:oauth2:connection", prefix: "Bearer " },
        },
        queryParams: {
          tenant: "local-dev",
        },
      })

      await expect(readHarborLocalMcpSource(projectRoot, "linear-mcp")).resolves.toMatchObject({
        auth: { kind: "oauth2" },
        headers: {
          authorization: { kind: "binding", slot: "auth:oauth2:connection" },
        },
      })

      const bindings = await putHarborLocalMcpToolBindings({
        projectRoot,
        sourceId: "linear-mcp",
        namespace: "linear-mcp",
        tools: [{
          toolId: "list_issues",
          toolName: "list_issues",
          description: "List Linear issues",
          inputSchema: { type: "object", properties: { limit: { type: "number" } } },
          annotations: { readOnlyHint: true },
        }],
        now: () => new Date("2026-05-14T00:00:00.000Z"),
      })

      expect(bindings).toMatchObject([{
        id: "linear-mcp.list_issues",
        sourceId: "linear-mcp",
        namespace: "linear-mcp",
        toolId: "list_issues",
        toolName: "list_issues",
        description: "List Linear issues",
        inputSchema: { type: "object", properties: { limit: { type: "number" } } },
        annotations: { readOnlyHint: true },
      }])
      await expect(listHarborLocalMcpToolBindings(projectRoot, "linear-mcp")).resolves.toHaveLength(1)
    })
  })

  it("stores stdio MCP sources without enabling execution by default", async () => {
    await withTempProject(async (projectRoot) => {
      const source = await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "stdio",
          name: "Local Test Server",
          command: "npx",
          args: ["-y", "example-mcp"],
          env: { EXAMPLE: "1" },
          cwd: "/tmp",
        },
        now: () => new Date("2026-05-14T00:00:00.000Z"),
      })

      expect(source).toMatchObject({
        id: "local_test_server",
        transport: "stdio",
        command: "npx",
        args: ["-y", "example-mcp"],
        env: { EXAMPLE: "1" },
        cwd: "/tmp",
        auth: { kind: "none" },
      })
    })
  })

  it("discovers MCP tools into searchable SQLite rows and invokes by stored binding", async () => {
    await withTempProject(async (projectRoot) => {
      const seen: Array<{ method: string; tool?: string | undefined }> = []
      const fetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const body = JSON.parse(String(init?.body ?? "{}")) as { id?: number; method: string; params?: { name?: string; arguments?: unknown } }
        seen.push({ method: body.method, tool: body.params?.name })
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { protocolVersion: "2025-03-26", capabilities: {}, serverInfo: { name: "linear" } },
          }), { headers: { "content-type": "application/json", "mcp-session-id": "session-1" } })
        }
        if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
        if (body.method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: [
                {
                  name: "list_issues",
                  description: "List Linear tickets and issues",
                  inputSchema: { type: "object", properties: { assignee: { type: "string" } } },
                  annotations: { readOnlyHint: true },
                },
                {
                  name: "create_issue",
                  description: "Create a Linear ticket",
                  inputSchema: { type: "object", required: ["title"], properties: { title: { type: "string" } } },
                  annotations: { destructiveHint: true },
                },
              ],
            },
          }), { headers: { "content-type": "application/json" } })
        }
        if (body.method === "tools/call") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { structuredContent: { called: body.params?.name, input: body.params?.arguments } },
          }), { headers: { "content-type": "application/json" } })
        }
        throw new Error(`Unexpected method ${body.method}`)
      }

      await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Linear MCP",
          namespace: "linear-mcp",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { kind: "none" },
        },
      })

      await expect(refreshHarborLocalMcpSource({
        projectRoot,
        sourceId: "linear-mcp",
        fetch,
      })).resolves.toMatchObject({
        sourceId: "linear-mcp",
        namespace: "linear-mcp",
        toolCount: 2,
      })

      const runtime = await createHarborLocalMcpToolRuntime({ projectRoot, fetch })
      const hits = runtime.search({ query: "linear tickets", limit: 2 })
      expect(hits[0]).toMatchObject({
        toolId: "linear-mcp.list_issues",
      })
      await expect(runtime.call({
        toolId: "linear-mcp.list_issues",
        input: { assignee: "me" },
      })).resolves.toMatchObject({
        output: { structuredContent: { called: "list_issues", input: { assignee: "me" } } },
      })
      const actionSearch = await runHarborLocalRegistryAction({
        projectRoot,
        fetch,
        action: { kind: "search", namespace: "linear-mcp", query: "linear tickets" },
      })
      expect(actionSearch.kind).toBe("search")
      if (actionSearch.kind === "search") {
        expect(actionSearch.hits[0]).toMatchObject({ toolId: "linear-mcp.list_issues" })
      }
      await expect(runHarborLocalRegistryAction({
        projectRoot,
        fetch,
        action: { kind: "schema", toolId: "linear-mcp.create_issue" },
      })).resolves.toMatchObject({
        kind: "schema",
        schema: { toolId: "linear-mcp.create_issue" },
      })
      await expect(runHarborLocalRegistryAction({
        projectRoot,
        fetch,
        action: { kind: "invoke", toolId: "linear-mcp.create_issue", input: { title: "Bug" } },
      })).resolves.toMatchObject({
        kind: "invoke",
        blocked: true,
        toolId: "linear-mcp.create_issue",
      })
      await expect(runHarborLocalRegistryAction({
        projectRoot,
        fetch,
        confirmWrites: true,
        action: { kind: "invoke", toolId: "linear-mcp.create_issue", input: "{\"title\":\"Bug\"}" },
      })).resolves.toMatchObject({
        kind: "invoke",
        blocked: false,
        result: {
          output: { structuredContent: { called: "create_issue", input: { title: "Bug" } } },
        },
      })
      const promiseRuntime = createHarborLocalRuntime({ projectRoot, fetch })
      const promiseHits = await promiseRuntime.tools.search({
        namespace: "linear-mcp",
        query: "linear tickets",
      })
      expect(promiseHits[0]).toMatchObject({ toolId: "linear-mcp.list_issues" })
      await expect(promiseRuntime.tools.schema("linear-mcp.create_issue")).resolves.toMatchObject({
        toolId: "linear-mcp.create_issue",
      })
      await expect(promiseRuntime.tools.runAction({
        kind: "invoke",
        toolId: "linear-mcp.create_issue",
        input: { title: "Promise bug" },
      })).resolves.toMatchObject({
        kind: "invoke",
        blocked: true,
      })
      expect(seen.some((entry) => entry.method === "tools/call" && entry.tool === "list_issues")).toBe(true)
    })
  })

  it("runs local exec code with backend-resolved MCP namespace proxies", async () => {
    await withTempProject(async (projectRoot) => {
      const calls: Array<{ method: string; tool?: string | undefined; url: string }> = []
      const fetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const href = typeof url === "string" ? url : url instanceof URL ? url.href : url.url
        const body = JSON.parse(String(init?.body ?? "{}")) as { id?: number; method: string; params?: { name?: string; arguments?: unknown } }
        calls.push({ method: body.method, tool: body.params?.name, url: href })
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { protocolVersion: "2025-03-26", capabilities: {}, serverInfo: { name: href.includes("notion") ? "notion" : "linear", version: "test" } },
          }), { headers: { "content-type": "application/json", "mcp-session-id": href.includes("notion") ? "notion-session" : "linear-session" } })
        }
        if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
        if (body.method === "tools/list" && href.includes("linear")) {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: [
                {
                  name: "list_issues",
                  description: "List Linear issues",
                  inputSchema: { type: "object", properties: { query: { type: "string" } } },
                  annotations: { readOnlyHint: true },
                },
                {
                  name: "create_issue",
                  description: "Create Linear issue",
                  inputSchema: { type: "object", properties: { title: { type: "string" } } },
                  annotations: { destructiveHint: true },
                },
              ],
            },
          }), { headers: { "content-type": "application/json" } })
        }
        if (body.method === "tools/list" && href.includes("notion")) {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: [{
                name: "notion-search",
                description: "Search Notion pages",
                inputSchema: { type: "object", properties: { query: { type: "string" } } },
                annotations: { readOnlyHint: true },
              }],
            },
          }), { headers: { "content-type": "application/json" } })
        }
        if (body.method === "tools/call") {
          const output = body.params?.name === "list_issues"
            ? { issues: [{ id: "LIN-1", title: "Ship local exec", project: "Harbor Alpha" }] }
            : { results: [{ id: "notion-1", title: "Harbor Alpha launch notes" }] }
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { structuredContent: output },
          }), { headers: { "content-type": "application/json" } })
        }
        throw new Error(`Unexpected method ${body.method}`)
      }

      await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Linear MCP",
          namespace: "linear-mcp",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { kind: "none" },
        },
      })
      await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Notion MCP",
          namespace: "notion-mcp",
          endpoint: "https://mcp.notion.com/mcp",
          auth: { kind: "none" },
        },
      })
      await refreshHarborLocalMcpSource({ projectRoot, sourceId: "linear-mcp", fetch })
      await refreshHarborLocalMcpSource({ projectRoot, sourceId: "notion-mcp", fetch })

      const exec = createHarborLocalExecRuntime({ projectRoot, fetch })
      await expect(exec.bindings()).resolves.toEqual([
        { namespace: "linear-mcp", aliases: ["linear_mcp", "linearMcp"], toolCount: 2 },
        { namespace: "notion-mcp", aliases: ["notion_mcp", "notionMcp"], toolCount: 1 },
      ])
      await expect(exec.run(`
        const [linear, notion] = await Promise.all([
          linearMcp.listIssues({ query: "Harbor Alpha" }),
          notionMcp.notionSearch({ query: "Harbor Alpha" }),
        ]);
        console.log("loaded", linear.structuredContent.issues.length, notion.structuredContent.results.length);
        return {
          linearIssues: linear.structuredContent.issues,
          notionResults: notion.structuredContent.results,
        };
      `)).resolves.toMatchObject({
        ok: true,
        namespaces: ["linear-mcp", "notion-mcp"],
        logs: [{ level: "log", args: ["loaded", 1, 1] }],
        value: {
          linearIssues: [{ id: "LIN-1", title: "Ship local exec", project: "Harbor Alpha" }],
          notionResults: [{ id: "notion-1", title: "Harbor Alpha launch notes" }],
        },
      })
      await expect(exec.run(`
        return await linearMcp.createIssue({ title: "blocked" });
      `)).resolves.toMatchObject({
        ok: false,
        error: { code: "EXEC_ERROR", message: expect.stringContaining("Blocked write tool") },
        namespaces: ["linear-mcp"],
      })
      await expect(exec.run(`
        return await linarMcp.listIssues({});
      `)).resolves.toMatchObject({
        ok: false,
        error: { code: "EXEC_ERROR", message: expect.stringContaining("Available namespace aliases") },
        namespaces: [],
      })
      await expect(exec.run(`
        return await linearMcp.missingTool({});
      `)).resolves.toMatchObject({
        ok: false,
        error: { code: "EXEC_ERROR", message: expect.stringContaining("Tool \"missingTool\" not found") },
        namespaces: ["linear-mcp"],
      })
      expect(calls.some((call) => call.method === "tools/call" && call.tool === "list_issues")).toBe(true)
      expect(calls.some((call) => call.method === "tools/call" && call.tool === "notion-search")).toBe(true)
    })
  })

  it("refreshes OAuth MCP tools as ready and resolves access tokens during invocation", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      const authorizations: string[] = []
      const fetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const headers = new Headers(init?.headers)
        const body = JSON.parse(String(init?.body ?? "{}")) as { id?: number; method: string; params?: { name?: string } }
        authorizations.push(headers.get("authorization") ?? "")
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { protocolVersion: "2025-03-26", capabilities: {}, serverInfo: { name: "linear" } },
          }), { headers: { "content-type": "application/json", "mcp-session-id": "session-1" } })
        }
        if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
        if (body.method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: [{
                name: "list_issues",
                description: "List Linear tickets and issues",
                inputSchema: { type: "object", properties: { assignee: { type: "string" } } },
                annotations: { readOnlyHint: true },
              }],
            },
          }), { headers: { "content-type": "application/json" } })
        }
        if (body.method === "tools/call") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { structuredContent: { called: body.params?.name } },
          }), { headers: { "content-type": "application/json" } })
        }
        throw new Error(`Unexpected method ${body.method}`)
      }

      await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Linear MCP",
          namespace: "linear-mcp",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { kind: "oauth2" },
        },
      })
      await importHarborLocalCredentialsFromEnv(projectRoot, {
        sourceRefId: "linear-mcp",
        slots: { access_token: "LINEAR_MCP_ACCESS_TOKEN" },
        env: { LINEAR_MCP_ACCESS_TOKEN: "oauth-access-token" },
        key: "vault-key",
      })

      await expect(refreshHarborLocalMcpSource({
        projectRoot,
        sourceId: "linear-mcp",
        env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
        fetch,
      })).resolves.toMatchObject({ toolCount: 1 })
      await expect(readHarborLocalMcpSource(projectRoot, "linear-mcp")).resolves.toMatchObject({
        status: "ready",
      })

      const runtime = await createHarborLocalMcpToolRuntime({
        projectRoot,
        env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
        fetch,
      })
      await expect(runtime.call({
        toolId: "linear-mcp.list_issues",
        input: { assignee: "me" },
      })).resolves.toMatchObject({
        output: { structuredContent: { called: "list_issues" } },
      })
      expect(authorizations.every((value) => value === "Bearer oauth-access-token")).toBe(true)
    })
  })

  it("connects OAuth MCP sources through the local callback and stores encrypted grant tokens", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await upsertHarborLocalMcpSource({
        projectRoot,
        source: {
          transport: "remote",
          name: "Linear MCP",
          namespace: "linear-mcp",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { kind: "oauth2" },
        },
      })

      const fetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const href = String(url)
        if (href === "https://mcp.linear.app/register") {
          const body = JSON.parse(String(init?.body ?? "{}")) as { redirect_uris?: string[] }
          expect(body.redirect_uris?.[0]).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/oauth\/callback$/)
          return new Response(JSON.stringify({ client_id: "client-1" }), {
            headers: { "content-type": "application/json" },
          })
        }
        if (href === "https://mcp.linear.app/token") {
          const body = new URLSearchParams(String(init?.body ?? ""))
          expect(body.get("code")).toBe("provider-code")
          expect(body.get("client_id")).toBe("client-1")
          expect(body.get("code_verifier")?.length).toBeGreaterThan(10)
          return new Response(JSON.stringify({
            access_token: "access-1",
            refresh_token: "refresh-1",
            token_type: "Bearer",
            scope: "read write",
          }), { headers: { "content-type": "application/json" } })
        }
        throw new Error(`Unexpected OAuth request ${href}`)
      }

      const connect = await connectHarborLocalMcpOAuthSource({
        projectRoot,
        sourceId: "linear-mcp",
        discovery: {
          authorizationEndpoint: "https://mcp.linear.app/authorize",
          tokenEndpoint: "https://mcp.linear.app/token",
          registrationEndpoint: "https://mcp.linear.app/register",
          resource: "https://mcp.linear.app",
          scopes: ["read", "write"],
        },
        env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
        fetch,
      })
      try {
        const authorizationUrl = new URL(connect.authorizationUrl)
        expect(authorizationUrl.origin).toBe("https://mcp.linear.app")
        expect(authorizationUrl.pathname).toBe("/authorize")
        expect(authorizationUrl.searchParams.get("client_id")).toBe("client-1")
        expect(authorizationUrl.searchParams.get("resource")).toBe("https://mcp.linear.app")
        expect(connect.redirectUri).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/oauth\/callback$/)

        const callback = await globalThis.fetch(`${connect.daemon.origin}/oauth/callback?state=${connect.state}&code=provider-code`)
        expect(callback.status).toBe(200)
        await expect(connect.waitForReady(1_000)).resolves.toMatchObject({ status: "ready" })

        const resolver = createHarborLocalCredentialResolver(projectRoot, { key: "vault-key" })
        const credentials = await resolver.resolve({ workspaceId: "local", sourceId: "linear-mcp" })
        expect(credentials.require("access_token")).toBe("access-1")
        expect(credentials.require("refresh_token")).toBe("refresh-1")
      } finally {
        await connect.close()
      }
    })
  })
})

describe("@hrbr/runtime-local credentials", () => {
  it("stores local credentials encrypted and reads them with the vault key", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      const paths = harborLocalPaths(projectRoot)
      await writeHarborLocalCredentials(projectRoot, {
        version: 1,
        workspaceId: "local",
        credentials: [{
          id: "source-1:api_key",
          workspaceId: "local",
          sourceRefId: "source-1",
          slot: "api_key",
          value: "sk_test_secret",
          scope: "local",
          status: "active",
          createdAt: "2026-05-12T00:00:00.000Z",
          updatedAt: "2026-05-12T00:00:00.000Z",
        }],
      }, "vault-key")

      const raw = await readFile(paths.credentials, "utf8")
      expect(raw).not.toContain("sk_test_secret")
      await expect(readHarborLocalCredentials(projectRoot, "vault-key")).resolves.toMatchObject({
        credentials: [{ id: "source-1:api_key", value: "sk_test_secret" }],
      })
    })
  })

  it("imports credentials from env and redacts display values", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await importHarborLocalCredentialsFromEnv(projectRoot, {
        sourceRefId: "source-1",
        slots: { api_key: "ACME_API_KEY" },
        env: { ACME_API_KEY: "sk_live_123456789" },
        key: "vault-key",
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      await expect(readHarborLocalCredentials(projectRoot, "vault-key")).resolves.toMatchObject({
        credentials: [{
          id: "source-1:api_key",
          sourceRefId: "source-1",
          slot: "api_key",
          value: "sk_live_123456789",
        }],
      })
      expect(redactHarborSecret("sk_live_123456789")).toBe("sk_l...6789")
    })
  })

  it("uses HARBOR_LOCAL_CREDENTIAL_KEY as the setup-time vault key", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await importHarborLocalCredentialsFromEnvKey(projectRoot, {
        sourceRefId: "source:linear-mcp:linear-mcp",
        slots: { LINEAR_API_KEY: "LINEAR_API_KEY" },
        env: {
          [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key",
          LINEAR_API_KEY: "lin_secret",
        },
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      await expect(readHarborLocalCredentialsFromEnvKey(projectRoot, {
        env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
      })).resolves.toMatchObject({
        credentials: [{
          id: "source:linear-mcp:linear-mcp:LINEAR_API_KEY",
          sourceRefId: "source:linear-mcp:linear-mcp",
          slot: "LINEAR_API_KEY",
          value: "lin_secret",
        }],
      })
    })
  })

  it("requires a non-empty local credential key env value", () => {
    expect(() => readHarborLocalCredentialKeyFromEnv({
      env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "" },
    })).toThrow("HARBOR_LOCAL_CREDENTIAL_KEY is required")
  })
})

describe("@hrbr/runtime-local local OAuth", () => {
  it("tracks a local OAuth flow and stores grant tokens encrypted as source credentials", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      const start = await startHarborLocalOAuthFlow({
        projectRoot,
        client: {
          sourceRefId: "source:notion-mcp:notion-mcp",
          clientId: "client-id",
          authorizationEndpoint: "https://auth.example.com/authorize",
          tokenEndpoint: "https://auth.example.com/token",
          redirectUri: "http://127.0.0.1:7331/oauth/callback",
          scopes: ["read", "write"],
        },
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      const pending = await readHarborLocalOAuthStatus(projectRoot, "source:notion-mcp:notion-mcp")
      expect(pending.status).toBe("pending")
      expect(new URL(start.authorizationUrl).searchParams.get("code_challenge_method")).toBe("S256")

      const grant = await completeHarborLocalOAuthFlow(projectRoot, {
        state: start.state,
        code: "provider-code",
        key: "vault-key",
        tokens: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          expiresAt: "2026-05-12T01:00:00.000Z",
          scopes: ["read"],
        },
        now: () => new Date("2026-05-12T00:01:00.000Z"),
      })

      expect(grant).toMatchObject({
        sourceRefId: "source:notion-mcp:notion-mcp",
        status: "active",
        scopes: ["read"],
      })
      await expect(readHarborLocalOAuthStatus(projectRoot, "source:notion-mcp:notion-mcp")).resolves.toMatchObject({
        status: "ready",
      })
      await expect(readHarborLocalCredentials(projectRoot, "vault-key")).resolves.toMatchObject({
        credentials: [
          { sourceRefId: "source:notion-mcp:notion-mcp", slot: "access_token", value: "access-token" },
          { sourceRefId: "source:notion-mcp:notion-mcp", slot: "refresh_token", value: "refresh-token" },
        ],
      })
    })
  })

  it("handles the local OAuth callback route through a mock token exchanger", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      const daemon = await startHarborLocalDaemon({
        projectRoot,
        token: "test-token",
        oauth: {
          env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
          exchangeCode: async (input) => {
            expect(input.code).toBe("provider-code")
            expect(input.codeVerifier.length).toBeGreaterThan(10)
            return {
              accessToken: "callback-access",
              refreshToken: "callback-refresh",
              scopes: ["read"],
            }
          },
        },
      })
      try {
        const flow = await startHarborLocalOAuthFlow({
          projectRoot,
          client: {
            sourceRefId: "source:notion-mcp:notion-mcp",
            clientId: "client-id",
            authorizationEndpoint: "https://auth.example.com/authorize",
            tokenEndpoint: "https://auth.example.com/token",
            redirectUri: `${daemon.origin}/oauth/callback`,
            scopes: ["read"],
          },
        })

        const callback = await fetch(`${daemon.origin}/oauth/callback?state=${flow.state}&code=provider-code`)
        expect(callback.status).toBe(200)
        await expect(readHarborLocalCredentials(projectRoot, "vault-key")).resolves.toMatchObject({
          credentials: [
            { sourceRefId: "source:notion-mcp:notion-mcp", slot: "access_token", value: "callback-access" },
            { sourceRefId: "source:notion-mcp:notion-mcp", slot: "refresh_token", value: "callback-refresh" },
          ],
        })
      } finally {
        await daemon.close()
      }
    })
  })
})

describe("@hrbr/runtime-local tool search", () => {
  it("exports registry action schemas for agent loops", () => {
    expect(v.parse(harborLocalRegistryActionSchema, {
      kind: "search",
      query: "linear issues",
    })).toEqual({
      kind: "search",
      query: "linear issues",
    })

    const invokeStep = v.parse(harborLocalRegistryAgentStepSchema, {
      action: "invoke",
      toolId: "linear-mcp.list_issues",
      input: { limit: 3 },
    })

    expect(harborLocalRegistryActionFromAgentStep(invokeStep)).toEqual({
      kind: "invoke",
      toolId: "linear-mcp.list_issues",
      input: { limit: 3 },
    })

    const finalStep = v.parse(harborLocalRegistryAgentStepSchema, {
      action: "final",
      answer: "done",
    })

    expect(() => harborLocalRegistryActionFromAgentStep(finalStep)).toThrow(
      "Final agent steps are not executable Harbor registry actions."
    )
  })

  it("ranks local tools with lexical BM25-style scoring and supports describe/schema", () => {
    const index = createHarborLocalToolIndex([
      {
        id: "1",
        workspaceId: "local",
        sourceRefId: "source-1",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        description: "Create a GitHub issue",
        inputSchema: { type: "object", required: ["title"] },
        outputSchema: { type: "object" },
        searchText: "github issue bug ticket create",
      },
      {
        id: "2",
        workspaceId: "local",
        sourceRefId: "source-2",
        namespace: "slack",
        name: "post_message",
        displayName: "Post Message",
        description: "Send a Slack channel message",
        searchText: "slack message channel post",
      },
    ])

    expect(index.search({ query: "create bug issue" })[0]).toMatchObject({
      toolId: "github.create_issue",
      namespace: "github",
      name: "create_issue",
    })
    expect(index.search({ query: "message", namespace: "github" })).toEqual([])
    expect(index.describe("github.create_issue")).toMatchObject({
      displayName: "Create Issue",
      inputSchema: { type: "object", required: ["title"] },
    })
    expect(index.schema("github.create_issue")).toEqual({
      toolId: "github.create_issue",
      inputSchema: { type: "object", required: ["title"] },
      outputSchema: { type: "object" },
    })
    expect(index.schemas({ namespace: "github" })).toEqual([{
      toolId: "github.create_issue",
      inputSchema: { type: "object", required: ["title"] },
      outputSchema: { type: "object" },
    }])
  })

  it("dispatches local calls through the configured runtime handler", async () => {
    const index = createHarborLocalToolIndex([
      {
        id: "1",
        workspaceId: "local",
        sourceRefId: "source-1",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        inputSchema: { type: "object" },
        outputSchema: { type: "object" },
        searchText: "github issue create",
      },
    ], {
      callTool: async (input, tool) => ({
        toolId: input.toolId,
        output: { ok: true, displayName: tool.displayName, input: input.input },
      }),
    })

    await expect(index.call({
      toolId: "github.create_issue",
      input: { title: "Bug" },
    })).resolves.toEqual({
      toolId: "github.create_issue",
      output: { ok: true, displayName: "Create Issue", input: { title: "Bug" } },
    })
    await expect(index.call({
      toolId: "github.missing",
      input: {},
    })).rejects.toThrow("Unknown local tool")
  })
})

describe("@hrbr/runtime-local plugin install store", () => {
  it("persists plugin source and tool metadata into the local runtime store", async () => {
    await withTempProject(async (projectRoot) => {
      const manifest = generateHarborLocalPluginPackageManifest({
        name: "linear-mcp",
        version: "1.0.0",
        owner: { name: "Harbor Dev" },
        source: { kind: "local", path: "plugins/linear-mcp" },
        docs: { readme: "# Linear MCP" },
        auth: { required: true, slots: ["LINEAR_API_KEY"] },
        scopes: ["issues:read"],
        policies: ["network:linear.app"],
        tests: ["bun test"],
        changelog: ["1.0.0 initial submission"],
        tools: [{
          id: "tool-linear-list",
          workspaceId: "local",
          sourceRefId: "source-linear",
          namespace: "linear-mcp",
          name: "list_issues",
          displayName: "List issues",
          description: "List Linear issues through the MCP source.",
          inputSchema: { type: "object", properties: { limit: { type: "number" } } },
          searchText: "linear issues list",
        }],
      })

      const installed = await installHarborLocalPluginManifest({
        projectRoot,
        manifest,
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      expect(installed).toMatchObject({
        packageId: "package:plugin:linear-mcp",
        sourceRefs: [{
          id: "source:linear-mcp:linear-mcp",
          name: "linear-mcp",
          toolCount: 1,
        }],
        tools: [{
          namespace: "linear-mcp",
          name: "list_issues",
        }],
      })
      await expect(listHarborLocalSources(projectRoot)).resolves.toMatchObject([
        { name: "linear-mcp", toolCount: 1 },
      ])

      const index = await buildHarborLocalToolIndexFromSqlite(projectRoot, {
        callTool: (input) => ({ toolId: input.toolId, output: { ok: true, input: input.input } }),
      })
      expect(index.search({ query: "linear issues" })[0]).toMatchObject({
        toolId: "linear-mcp.list_issues",
      })
      expect(index.describe("linear-mcp.list_issues")).toMatchObject({
        displayName: "List issues",
        inputSchema: { type: "object", properties: { limit: { type: "number" } } },
      })
      await expect(index.call({
        toolId: "linear-mcp.list_issues",
        input: { limit: 2 },
      })).resolves.toEqual({
        toolId: "linear-mcp.list_issues",
        output: { ok: true, input: { limit: 2 } },
      })
    })
  })

  it("resolves encrypted local credentials by source ref and slot", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await importHarborLocalCredentialsFromEnv(projectRoot, {
        sourceRefId: "source:linear-mcp:linear-mcp",
        slots: { LINEAR_API_KEY: "LINEAR_API_KEY" },
        env: { LINEAR_API_KEY: "lin_secret" },
        key: "vault-key",
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      const resolver = createHarborLocalCredentialResolver(projectRoot, { key: "vault-key" })
      await expect(resolver.resolve({
        workspaceId: "local",
        sourceId: "source:linear-mcp:linear-mcp",
      }).then((credentials) => credentials.require("LINEAR_API_KEY"))).resolves.toBe("lin_secret")
      await expect(resolver.resolve({
        workspaceId: "local",
        sourceId: "source:other",
      }).then((credentials) => credentials.has("LINEAR_API_KEY"))).resolves.toBe(false)
    })
  })

  it("resolves encrypted local credentials using the standard vault key env var", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      await importHarborLocalCredentialsFromEnvKey(projectRoot, {
        sourceRefId: "source:linear-mcp:linear-mcp",
        slots: { LINEAR_API_KEY: "LINEAR_API_KEY" },
        env: {
          [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key",
          LINEAR_API_KEY: "lin_secret",
        },
        now: () => new Date("2026-05-12T00:00:00.000Z"),
      })

      const resolver = createHarborLocalCredentialResolverFromEnv(projectRoot, {
        env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "vault-key" },
      })
      await expect(resolver.resolve({
        workspaceId: "local",
        sourceId: "source:linear-mcp:linear-mcp",
      }).then((credentials) => credentials.require("LINEAR_API_KEY"))).resolves.toBe("lin_secret")
    })
  })

  it("installs and invokes provider-backed MCP plugins through the SDK runtime helper", async () => {
    await withTempProject(async (projectRoot) => {
      await ensureHarborLocalProject({ projectRoot })
      const seen: Array<{ method: string; authorization: string | null }> = []
      const fetch = async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
        const body = JSON.parse(String(init?.body ?? "{}")) as { id?: number; method: string; params?: { name?: string } }
        seen.push({ method: body.method, authorization: new Headers(init?.headers).get("authorization") })
        if (body.method === "initialize") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { protocolVersion: "2025-03-26", capabilities: {}, serverInfo: { name: "linear" } },
          }), { headers: { "content-type": "application/json", "mcp-session-id": "session-1" } })
        }
        if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
        if (body.method === "tools/list") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: [{
                name: "list_issues",
                description: "List issues",
                inputSchema: { type: "object", properties: { limit: { type: "number" } } },
              }],
            },
          }), { headers: { "content-type": "application/json" } })
        }
        if (body.method === "tools/call") {
          return new Response(JSON.stringify({
            jsonrpc: "2.0",
            id: body.id,
            result: { structuredContent: { ok: true, tool: body.params?.name } },
          }), { headers: { "content-type": "application/json" } })
        }
        throw new Error(`Unexpected method ${body.method}`)
      }

      await installHarborLocalMcpPlugin({
        projectRoot,
        env: {
          HARBOR_LOCAL_CREDENTIAL_KEY: "vault-key",
          LINEAR_MCP_ACCESS_TOKEN: "lin-token",
        },
        plugin: {
          slug: "linear-mcp",
          namespace: "linear-mcp",
          displayName: "Linear MCP",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { method: "bearer", envName: "LINEAR_MCP_ACCESS_TOKEN" },
        },
        fetch,
      })
      const runtime = await createHarborLocalMcpPluginRuntime({
        projectRoot,
        env: { HARBOR_LOCAL_CREDENTIAL_KEY: "vault-key" },
        plugin: {
          slug: "linear-mcp",
          namespace: "linear-mcp",
          displayName: "Linear MCP",
          endpoint: "https://mcp.linear.app/mcp",
          auth: { method: "bearer" },
        },
        fetch,
      })

      expect(runtime.index.search({ query: "issues", namespace: "linear-mcp" })[0]?.toolId).toBe("linear-mcp.list_issues")
      await expect(runtime.index.call({
        toolId: "linear-mcp.list_issues",
        input: { limit: 1 },
      })).resolves.toMatchObject({
        output: { structuredContent: { ok: true, tool: "list_issues" } },
      })
      expect(seen.every((entry) => entry.authorization === "Bearer lin-token")).toBe(true)
    })
  })
})

describe("@hrbr/runtime-local QuickJS execution", () => {
  it("runs bundled JavaScript with injected input inside QuickJS-ng", async () => {
    await expect(runHarborLocalQuickJS({
      code: "({ ok: true, total: __harborInput.a + __harborInput.b })",
      input: { a: 2, b: 3 },
    })).resolves.toEqual({
      ok: true,
      value: { ok: true, total: 5 },
    })
  })

  it("rejects direct imports and leaves network APIs unavailable by default", async () => {
    await expect(runHarborLocalQuickJS({
      code: "import value from 'left-pad'; value",
    })).rejects.toThrow("bundled JavaScript")

    await expect(runHarborLocalQuickJS({
      code: "typeof fetch",
    })).resolves.toEqual({
      ok: true,
      value: "undefined",
    })
  })

  it("interrupts long-running code", async () => {
    await expect(runHarborLocalQuickJS({
      code: "for (;;) {}",
      timeoutMs: 10,
    })).rejects.toThrow()
  })

  it("exposes approved sync host calls through the harbor runtime object", async () => {
    const calls: unknown[] = []
    await expect(runHarborLocalQuickJS({
      code: `
        const issue = harbor.tools.call("github.create_issue", { title: __harborInput.title });
        harbor.cache.set("lastIssue", issue.id);
        ({ issue, cached: harbor.cache.get("lastIssue") });
      `,
      input: { title: "Bug" },
      hostCall: (name, payload) => {
        calls.push({ name, payload })
        if (name === "tools.call") return { id: "ISSUE-1" }
        if (name === "cache.set") return { ok: true }
        if (name === "cache.get") return "ISSUE-1"
        return null
      },
    })).resolves.toEqual({
      ok: true,
      value: { issue: { id: "ISSUE-1" }, cached: "ISSUE-1" },
    })
    expect(calls).toEqual([
      {
        name: "tools.call",
        payload: { toolId: "github.create_issue", input: { title: "Bug" } },
      },
      {
        name: "cache.set",
        payload: { key: "lastIssue", value: "ISSUE-1" },
      },
      {
        name: "cache.get",
        payload: { key: "lastIssue" },
      },
    ])
  })
})

describe("@hrbr/runtime-local jobs and apps", () => {
  it("runs local jobs over QuickJS with schema validation", async () => {
    await expect(runHarborLocalJob({
      job: {
        id: "sum",
        code: "({ total: __harborInput.a + __harborInput.b })",
        inputSchema: {
          type: "object",
          required: ["a", "b"],
          properties: {
            a: { type: "number" },
            b: { type: "number" },
          },
        },
        outputSchema: {
          type: "object",
          required: ["total"],
          properties: { total: { type: "number" } },
        },
      },
      input: { a: 4, b: 8 },
      now: () => new Date("2026-05-12T00:00:00.000Z"),
    })).resolves.toMatchObject({
      jobId: "sum",
      output: { total: 12 },
      trace: { kind: "job", targetId: "sum", status: "ok" },
    })

    await expect(runHarborLocalJob({
      job: {
        id: "sum",
        code: "null",
        inputSchema: { type: "object", required: ["a"] },
      },
      input: {},
    })).rejects.toThrow("input.a is required")
  })

  it("serves local job, app, and artifact routes on one daemon port", async () => {
    await withTempProject(async (projectRoot) => {
      const traces = []
      const daemon = await startHarborLocalDaemon({
        projectRoot,
        token: "test-token",
        now: () => new Date("2026-05-12T00:00:00.000Z"),
        jobs: [{
          id: "echo",
          code: "({ echoed: __harborInput.message })",
          inputSchema: {
            type: "object",
            required: ["message"],
            properties: { message: { type: "string" } },
          },
        }],
        apps: [{
          id: "hello",
          routes: [{
            path: "/",
            code: "({ contentType: 'text/html', body: `<h1>Hello ${__harborInput.query.name}</h1>` })",
          }],
        }],
        artifacts: { "reports/one.txt": "report-one" },
        traceSink: traces,
      })
      try {
        const job = await fetch(`${daemon.origin}/jobs/echo/run`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${daemon.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ message: "hi" }),
        })
        await expect(job.json()).resolves.toMatchObject({
          ok: true,
          output: { echoed: "hi" },
          trace: { kind: "job", targetId: "echo", status: "ok" },
        })

        const app = await fetch(`${daemon.origin}/apps/hello/?name=Harbor`)
        expect(app.headers.get("content-type")).toContain("text/html")
        await expect(app.text()).resolves.toBe("<h1>Hello Harbor</h1>")

        const artifact = await fetch(`${daemon.origin}/artifacts/reports%2Fone.txt`)
        await expect(artifact.text()).resolves.toBe("report-one")

        expect(traces).toEqual([
          expect.objectContaining({ kind: "job", targetId: "echo", status: "ok" }),
          expect.objectContaining({ kind: "app", targetId: "hello", status: "ok" }),
        ])
      } finally {
        await daemon.close()
      }
    })
  })
})

describe("@hrbr/runtime-local workflows", () => {
  it("runs local workflow job and tool steps with requirement validation", async () => {
    const tools = createHarborLocalToolIndex([
      {
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        searchText: "github issue create",
      },
    ], {
      callTool: (input) => ({
        toolId: input.toolId,
        output: { issueId: "ISSUE-1", title: (input.input as { title: string }).title },
      }),
    })
    const workflow = {
      id: "triage",
      title: "Triage",
      requiredTools: ["github.create_issue"],
      requiredSources: ["source-github"],
      inputSchema: {
        type: "object" as const,
        required: ["title"],
        properties: { title: { type: "string" as const } },
      },
      outputSchema: {
        type: "object" as const,
        required: ["issueId"],
        properties: { issueId: { type: "string" as const } },
      },
      steps: [
        {
          id: "normalize",
          kind: "job" as const,
          job: {
            id: "normalize-title",
            code: "({ title: String(__harborInput.title).trim() })",
          },
        },
        {
          id: "create",
          kind: "tool" as const,
          toolId: "github.create_issue",
        },
      ],
    }

    const result = await runHarborLocalWorkflow({
      workflow,
      input: { title: " Login broken " },
      tools,
      installedSourceRefIds: ["source-github"],
      now: () => new Date("2026-05-12T00:00:00.000Z"),
    })

    expect(result).toEqual({
      workflowId: "triage",
      output: { issueId: "ISSUE-1", title: "Login broken" },
      steps: [
        { stepId: "normalize", kind: "job", output: { title: "Login broken" } },
        { stepId: "create", kind: "tool", output: { issueId: "ISSUE-1", title: "Login broken" } },
      ],
    })
    expect(generateHarborLocalWorkflowManifest(workflow)).toMatchObject({
      id: "triage",
      requiredTools: ["github.create_issue"],
      requiredSources: ["source-github"],
      steps: [
        { id: "normalize", kind: "job" },
        { id: "create", kind: "tool" },
      ],
    })
    expect(createHarborLocalWorkflowReplayFixture({
      workflowId: workflow.id,
      input: { title: " Login broken " },
      result,
    })).toMatchObject({
      workflowId: "triage",
      output: { issueId: "ISSUE-1", title: "Login broken" },
    })
  })

  it("rejects workflows when required local tools or sources are missing", async () => {
    const tools = createHarborLocalToolIndex([])
    await expect(runHarborLocalWorkflow({
      workflow: {
        id: "triage",
        title: "Triage",
        requiredTools: ["github.create_issue"],
        requiredSources: ["source-github"],
        steps: [],
      },
      input: {},
      tools,
      installedSourceRefIds: [],
    })).rejects.toThrow("Required workflow tool is missing")
  })
})

describe("@hrbr/runtime-local package format", () => {
  it("generates and validates plugin package manifests", () => {
    const manifest = generateHarborLocalPluginPackageManifest({
      name: "github-tools",
      version: "1.0.0",
      owner: { name: "Harbor Dev", email: "dev@example.com" },
      source: { kind: "local", path: "plugins/github" },
      docs: { readme: "# GitHub Tools", examples: ["examples/create-issue.json"] },
      auth: { required: true, slots: ["GITHUB_TOKEN"] },
      scopes: ["issues:write"],
      policies: ["network:github.com"],
      tests: ["bun test"],
      compatibility: { sdk: ">=0.1.0", runtimeLocal: ">=0.1.0" },
      changelog: ["1.0.0 initial submission"],
      tools: [{
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        description: "Create a GitHub issue",
        inputSchema: { type: "object", required: ["title"] },
        outputSchema: { type: "object" },
        searchText: "github issue create",
      }],
    })

    expect(manifest).toMatchObject({
      manifestVersion: 1,
      kind: "plugin",
      name: "github-tools",
      tools: [{ namespace: "github", name: "create_issue" }],
      auth: { required: true, slots: ["GITHUB_TOKEN"] },
    })
    expect(validateHarborLocalPackageManifest(manifest)).toEqual({
      ok: true,
      errors: [],
      warnings: [],
    })
  })

  it("generates workflow package manifests and reports quality errors", () => {
    const workflow = {
      id: "triage",
      title: "Triage",
      requiredTools: ["github.create_issue"],
      steps: [],
    }
    const manifest = generateHarborLocalWorkflowPackageManifest({
      name: "triage-workflow",
      version: "1.0.0",
      owner: { name: "Harbor Dev" },
      source: { kind: "local", path: "workflows/triage.ts" },
      workflow,
      docs: { readme: "# Triage" },
      tests: ["bun test"],
      changelog: ["1.0.0 initial submission"],
    })
    expect(validateHarborLocalPackageManifest(manifest).ok).toBe(true)

    expect(validateHarborLocalPackageManifest({
      ...manifest,
      name: "Bad Name",
      changelog: [],
      docs: { readme: "" },
    })).toMatchObject({
      ok: false,
      errors: [
        "name must be a portable package slug",
        "docs.readme is required",
        "changelog must include at least one entry",
      ],
    })
  })
})

describe("@hrbr/runtime-local submission flow", () => {
  it("builds git-oriented submission layout, snapshot files, and review checks", () => {
    const manifest = generateHarborLocalPluginPackageManifest({
      name: "github-tools",
      version: "1.0.0",
      owner: { name: "Harbor Dev", email: "dev@example.com" },
      source: { kind: "git", path: "https://github.com/acme/github-tools" },
      docs: { readme: "# GitHub Tools" },
      auth: { required: true, slots: ["GITHUB_TOKEN"] },
      scopes: ["issues:write"],
      policies: ["network:github.com"],
      tests: ["bun test"],
      changelog: ["1.0.0 initial submission"],
      tools: [{
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        searchText: "github issue create",
      }],
    })

    expect(harborLocalSubmissionLayout("plugin")).toEqual([
      "harbor.package.json",
      "README.md",
      "CHANGELOG.md",
      "plugins/",
      "examples/",
      "tests/",
    ])
    expect(createHarborLocalSubmissionSnapshot(manifest).files.map((file) => file.path)).toEqual([
      "harbor.package.json",
      "README.md",
      "CHANGELOG.md",
      "OWNERS.md",
    ])
    expect(validateHarborLocalSubmission(manifest)).toMatchObject({
      ok: true,
      security: [
        { id: "auth-secret-values", status: "pass" },
        { id: "scopes-declared", status: "pass" },
        { id: "policies-declared", status: "pass" },
        { id: "tests-declared", status: "pass" },
      ],
    })
  })

  it("flags security and review gaps before submission", () => {
    const manifest = generateHarborLocalPluginPackageManifest({
      name: "github-tools",
      version: "1.0.0",
      owner: { name: "Harbor Dev" },
      source: { kind: "local", path: "plugins/github" },
      docs: { readme: "# GitHub Tools" },
      auth: { required: true, slots: ["GITHUB_TOKEN=secret"] },
      changelog: ["1.0.0 initial submission"],
      tools: [{
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "create_issue",
        displayName: "Create Issue",
        searchText: "github issue create",
      }],
    })

    expect(validateHarborLocalSubmission(manifest)).toMatchObject({
      ok: false,
      security: [
        { id: "auth-secret-values", status: "fail" },
        { id: "scopes-declared", status: "warn" },
        { id: "policies-declared", status: "warn" },
        { id: "tests-declared", status: "warn" },
      ],
    })
  })
})

describe("@hrbr/runtime-local security", () => {
  it("requires confirmation for destructive actions", () => {
    const action = harborLocalSecurityAction({
      kind: "credentials.change",
      title: "Rotate token",
    })
    expect(action).toMatchObject({
      destructive: true,
      requiresConfirmation: true,
    })
    expect(() => requireHarborLocalConfirmation({ action, confirmed: false }))
      .toThrow("Confirmation required")
    expect(() => requireHarborLocalConfirmation({ action, confirmed: true })).not.toThrow()
  })

  it("reports static security checks for package manifests", () => {
    const manifest = generateHarborLocalPluginPackageManifest({
      name: "github-tools",
      version: "1.0.0",
      owner: { name: "Harbor Dev" },
      source: { kind: "local", path: "plugins/github" },
      docs: { readme: "# GitHub Tools" },
      auth: { required: true, slots: ["GITHUB_TOKEN=secret"] },
      scopes: ["admin:*"],
      policies: ["delete:issues"],
      tests: ["bun test"],
      changelog: ["1.0.0 initial submission"],
      tools: [{
        id: "tool-1",
        workspaceId: "local",
        sourceRefId: "source-github",
        namespace: "github",
        name: "delete_issue",
        displayName: "Delete Issue",
        searchText: "github issue delete",
      }],
    })

    expect(runHarborLocalStaticSecurityChecks(manifest)).toEqual([
      expect.objectContaining({ id: "secret-leakage", status: "fail" }),
      expect.objectContaining({ id: "unsafe-auth-scopes", status: "warn" }),
      expect.objectContaining({ id: "destructive-policy", status: "warn" }),
      expect.objectContaining({ id: "network-policy", status: "warn" }),
    ])
  })
})
