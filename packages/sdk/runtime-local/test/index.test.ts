import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, expect, it } from "bun:test"
import {
  ensureHarborLocalProject,
  expectedHarborLocalTables,
  createHarborLocalToolIndex,
  harborLocalDaemonConnection,
  harborLocalPaths,
  HARBOR_LOCAL_DIR,
  HARBOR_LOCAL_SCHEMA_VERSION,
  importHarborLocalCredentialsFromEnv,
  hashHarborLocalToken,
  readHarborLocalRuntimeManifest,
  readHarborLocalCredentials,
  redactHarborSecret,
  readHarborRegistryDevRefs,
  removeHarborRegistryDevRef,
  runHarborLocalQuickJS,
  runHarborLocalMigrations,
  startHarborLocalDaemon,
  upsertHarborRegistryDevRef,
  watchHarborRegistryDevRefs,
  writeHarborLocalCredentials,
  LOCAL_WORKSPACE_ID,
  type HarborRegistryDevRefsFile,
} from "../src/index"

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
    expect(tables).toContain("cloudflare_resources")
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
    expect(statements[0]).toContain("CREATE TABLE IF NOT EXISTS cloudflare_resources")
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
})

describe("@hrbr/runtime-local tool search", () => {
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
})
