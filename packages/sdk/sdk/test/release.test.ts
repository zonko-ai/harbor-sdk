import { spawnSync } from "node:child_process"
import { access, mkdir, mkdtemp, readFile, rm, symlink } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { describe, expect, it } from "bun:test"
import { createHarbor, HARBOR_LOCAL_CREDENTIAL_KEY_ENV } from "@hrbr/sdk/local"
import { serveHarborMcpTestServer } from "@hrbr/sdk/testing"

const repoRoot = resolve(import.meta.dir, "../../../..")
const sdkPackageRoot = resolve(import.meta.dir, "..")
const runtimeLocalPackageRoot = resolve(repoRoot, "packages/sdk/runtime-local")

async function withTempDir<T>(prefix: string, fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  try {
    return await fn(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

describe("@hrbr/sdk release smoke", () => {
  it("exposes the supported public subpaths to Bun consumers", async () => {
    const local = await import("@hrbr/sdk/local")
    const core = await import("@hrbr/sdk/core")
    const testing = await import("@hrbr/sdk/testing")

    expect(typeof local.createHarbor).toBe("function")
    expect(typeof local.HarborLocalError).toBe("function")
    expect(typeof local.harborLocalConsoleLogger).toBe("function")
    expect(typeof core.createMcpHttpSourceAdapter).toBe("function")
    expect(typeof testing.serveHarborMcpTestServer).toBe("function")
  })

  it("keeps export maps aligned with the current publish contract", async () => {
    const sdkPackage = JSON.parse(await readFile(join(sdkPackageRoot, "package.json"), "utf8")) as {
      exports?: Record<string, string>
    }
    const runtimePackage = JSON.parse(await readFile(join(runtimeLocalPackageRoot, "package.json"), "utf8")) as {
      exports?: Record<string, string | { types?: string; default?: string }>
    }

    expect(sdkPackage.exports).toMatchObject({
      ".": "./src/index.ts",
      "./core": "./src/core.ts",
      "./local": "./src/local.ts",
      "./testing": "./src/testing.ts",
    })
    expect(runtimePackage.exports?.["./promise"]).toEqual({
      types: "./src/promise.ts",
      default: "./dist/promise.js",
    })
  })

  it("emits declaration files for the public SDK subpaths", async () => {
    await withTempDir("hrbr-sdk-dts-", async (outDir) => {
      const result = spawnSync("bunx", [
        "tsc",
        "-p",
        join(sdkPackageRoot, "tsconfig.json"),
        "--emitDeclarationOnly",
        "--declaration",
        "--declarationMap",
        "false",
        "--outDir",
        outDir,
        "--noEmit",
        "false",
      ], { cwd: repoRoot, encoding: "utf8" })

      expect(result.status, result.stderr || result.stdout).toBe(0)
      await expect(access(join(outDir, "index.d.ts"))).resolves.toBeNull()
      await expect(access(join(outDir, "core.d.ts"))).resolves.toBeNull()
      await expect(access(join(outDir, "local.d.ts"))).resolves.toBeNull()
      await expect(access(join(outDir, "testing.d.ts"))).resolves.toBeNull()
      await expect(readFile(join(outDir, "local.d.ts"), "utf8")).resolves.toContain("createHarbor")
    })
  })

  it("loads the shipped local promise bundle through Node package resolution", async () => {
    await withTempDir("hrbr-sdk-node-import-", async (dir) => {
      const scope = join(dir, "node_modules/@hrbr")
      await mkdir(scope, { recursive: true })
      await symlink(runtimeLocalPackageRoot, join(scope, "runtime-local"), "dir")
      const result = spawnSync(process.execPath, [
        "--input-type=module",
        "-e",
        "import('@hrbr/runtime-local/promise').then((m)=>console.log(typeof m.createHarborLocalRuntime, typeof m.HarborLocalError)).catch((e)=>{console.error(e.stack); process.exit(1)})",
      ], { cwd: dir, encoding: "utf8" })

      expect(result.status, result.stderr).toBe(0)
      expect(result.stdout.trim()).toBe("function function")
    })
  })

  it("runs the public local facade from an empty project through MCP, search, exec, and write blocking", async () => {
    await withTempDir("hrbr-sdk-public-local-", async (projectRoot) => {
      const server = await serveHarborMcpTestServer({
        name: "release-fixture-mcp",
        tools: [
          {
            name: "list_items",
            description: "List release smoke items",
            annotations: { readOnlyHint: true },
            handler: () => ({
              content: [{ type: "text", text: JSON.stringify({ items: [{ id: "REL-1" }] }) }],
              structuredContent: { items: [{ id: "REL-1", title: "Release smoke" }] },
            }),
          },
          {
            name: "create_item",
            description: "Create a release smoke item",
            annotations: { readOnlyHint: false, destructiveHint: false },
            handler: () => ({
              content: [{ type: "text", text: JSON.stringify({ created: true }) }],
              structuredContent: { created: true },
            }),
          },
        ],
      })
      try {
        const harbor = createHarbor({
          projectRoot,
          allowLocalNetwork: true,
          env: { [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "release-key" },
        })
        const setup = await harbor.sources.ensureMcpSources({
          sources: [{
            endpoint: server.url,
            name: "Release Fixture MCP",
            namespace: "release-mcp",
            auth: "none",
          }],
        })

        expect(setup.ready).toBe(true)
        await expect(access(join(projectRoot, ".harbor/harbor.sqlite"))).resolves.toBeNull()
        await expect(harbor.sources.probeMcp("release-mcp")).resolves.toMatchObject({
          ok: true,
          status: "ready",
          sourceId: "release-mcp",
        })
        await expect(harbor.tools.search({ query: "release smoke items" })).resolves.toEqual(expect.arrayContaining([
          expect.objectContaining({ toolId: "release-mcp.list_items" }),
        ]))
        await expect(harbor.tools.schema("release-mcp.list_items")).resolves.toMatchObject({
          toolId: "release-mcp.list_items",
        })
        await expect(harbor.tools.invoke("release-mcp.list_items", {})).resolves.toMatchObject({
          output: { structuredContent: { items: [{ id: "REL-1", title: "Release smoke" }] } },
        })
        await expect(harbor.tools.runAction({
          kind: "invoke",
          toolId: "release-mcp.create_item",
          input: { title: "blocked" },
        })).resolves.toMatchObject({
          kind: "invoke",
          blocked: true,
          reason: expect.stringContaining("confirmWrites"),
        })
        await expect(harbor.exec.bindings()).resolves.toEqual([
          { namespace: "release-mcp", aliases: ["release_mcp", "releaseMcp"], toolCount: 2 },
        ])
        await expect(harbor.exec.toolGuide()).resolves.toEqual(expect.arrayContaining([
          expect.objectContaining({
            call: "releaseMcp.listItems(input)",
            toolId: "release-mcp.list_items",
          }),
        ]))
        await expect(harbor.exec.run(`
          const items = await releaseMcp.listItems({});
          return items.structuredContent.items;
        `)).resolves.toMatchObject({
          ok: true,
          namespaces: ["release-mcp"],
          value: [{ id: "REL-1", title: "Release smoke" }],
        })
        await expect(harbor.exec.run(`
          return await releaseMcp.createItem({ title: "blocked" });
        `)).resolves.toMatchObject({
          ok: false,
          error: { code: "local_write_confirmation_required" },
          namespaces: ["release-mcp"],
        })
        await expect(harbor.invocations.list({ namespace: "release-mcp" })).resolves.toEqual(expect.arrayContaining([
          expect.objectContaining({ toolId: "release-mcp.list_items", ok: true }),
          expect.objectContaining({ toolId: "release-mcp.create_item", ok: false }),
        ]))
      } finally {
        await server.close()
      }
    })
  })
})
