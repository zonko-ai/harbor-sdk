import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, expect, it } from "bun:test"
import { createHarborLocalServer } from "../src/server"
import type { HarborLocalServerEnv } from "../src/env"

async function withTempProject<T>(fn: (projectRoot: string) => Promise<T>): Promise<T> {
  const projectRoot = await mkdtemp(join(tmpdir(), "hrbr-local-app-"))
  try {
    return await fn(projectRoot)
  } finally {
    await rm(projectRoot, { recursive: true, force: true })
  }
}

function testEnv(projectRoot: string): HarborLocalServerEnv {
  return {
    projectRoot,
    host: "127.0.0.1",
    port: 7332,
    credentialKey: "test-key",
  }
}

async function json(response: Response): Promise<unknown> {
  expect(response.headers.get("content-type")).toContain("application/json")
  return response.json()
}

function fixtureFetch(calls: Array<{ readonly method: string; readonly tool?: string | undefined }>) {
  return async (_url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      readonly id?: number
      readonly method: string
      readonly params?: { readonly name?: string; readonly arguments?: unknown }
    }
    calls.push({ method: body.method, tool: body.params?.name })
    if (body.method === "initialize") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          protocolVersion: "2025-03-26",
          capabilities: { tools: {} },
          serverInfo: { name: "fixture-mcp" },
        },
      }), {
        headers: { "content-type": "application/json", "mcp-session-id": "fixture-session" },
      })
    }
    if (body.method === "notifications/initialized") return new Response(null, { status: 202 })
    if (body.method === "tools/list") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          tools: [
            {
              name: "list_items",
              description: "List fixture items",
              inputSchema: { type: "object", properties: { limit: { type: "number" } } },
              annotations: { readOnlyHint: true },
            },
            {
              name: "create_item",
              description: "Create fixture item",
              inputSchema: { type: "object", required: ["title"], properties: { title: { type: "string" } } },
            },
          ],
        },
      }), { headers: { "content-type": "application/json" } })
    }
    if (body.method === "tools/call") {
      return new Response(JSON.stringify({
        jsonrpc: "2.0",
        id: body.id,
        result: {
          structuredContent: {
            tool: body.params?.name,
            input: body.params?.arguments,
          },
        },
      }), { headers: { "content-type": "application/json" } })
    }
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      id: body.id,
      error: { code: -32601, message: `Unexpected method ${body.method}` },
    }), { headers: { "content-type": "application/json" } })
  }
}

describe("@hrbr/harbor-local API server", () => {
  it("serves the local console frontend from the same server", async () => {
    await withTempProject(async (projectRoot) => {
      const server = createHarborLocalServer({ env: testEnv(projectRoot) })

      const html = await server.fetch(new Request("http://local.harbor/"))
      expect(html.headers.get("content-type")).toContain("text/html")
      await expect(html.text()).resolves.toContain("Harbor Local")

      const app = await server.fetch(new Request("http://local.harbor/app.js"))
      expect(app.headers.get("content-type")).toContain("text/javascript")
      await expect(app.text()).resolves.toContain("renderOverview")

      const css = await server.fetch(new Request("http://local.harbor/styles.css"))
      expect(css.headers.get("content-type")).toContain("text/css")
      await expect(css.text()).resolves.toContain(".sidebar")
    })
  })

  it("serves health and the offline local MCP catalog seed", async () => {
    await withTempProject(async (projectRoot) => {
      const server = createHarborLocalServer({ env: testEnv(projectRoot) })

      await expect(json(await server.fetch(new Request("http://local.harbor/health")))).resolves.toMatchObject({
        ok: true,
        data: { status: "ok", projectRoot },
      })
      const catalog = await json(await server.fetch(new Request("http://local.harbor/api/catalog"))) as {
        readonly ok: true
        readonly data: { readonly total: number; readonly entries: readonly { readonly slug: string }[] }
      }
      expect(catalog.data.total).toBe(106)
      expect(catalog.data.entries.some((entry) => entry.slug === "linear-mcp")).toBe(true)
      expect(catalog.data.entries.some((entry) => entry.slug === "notion-mcp")).toBe(true)
    })
  })

  it("installs a custom MCP source, refreshes tools, searches, invokes, and records history", async () => {
    await withTempProject(async (projectRoot) => {
      const calls: Array<{ readonly method: string; readonly tool?: string | undefined }> = []
      const server = createHarborLocalServer({
        env: testEnv(projectRoot),
        fetch: fixtureFetch(calls),
      })

      const install = await json(await server.fetch(new Request("http://local.harbor/api/sources/install", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://fixture.example.com/mcp",
          name: "Fixture MCP",
          namespace: "fixture-mcp",
          refresh: true,
        }),
      }))) as { readonly ok: true; readonly data: { readonly source: { readonly id: string }; readonly refresh: { readonly toolCount: number } } }
      expect(install.data.source.id).toBe("fixture-mcp")
      expect(install.data.refresh.toolCount).toBe(2)

      const sources = await json(await server.fetch(new Request("http://local.harbor/api/sources"))) as {
        readonly ok: true
        readonly data: {
          readonly total: number
          readonly sources: readonly {
            readonly id: string
            readonly oauth: { readonly status: string }
          }[]
        }
      }
      expect(sources.data.total).toBe(1)
      expect(sources.data.sources[0]?.id).toBe("fixture-mcp")
      expect(sources.data.sources[0]?.oauth.status).toBe("not_required")

      const search = await json(await server.fetch(new Request("http://local.harbor/api/tools/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "fixture items", namespace: "fixture-mcp" }),
      }))) as { readonly ok: true; readonly data: { readonly hits: readonly { readonly toolId: string }[] } }
      expect(search.data.hits[0]?.toolId).toBe("fixture-mcp.list_items")

      await expect(json(await server.fetch(new Request("http://local.harbor/api/tools/schema", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ toolId: "fixture-mcp.create_item" }),
      })))).resolves.toMatchObject({
        ok: true,
        data: { toolId: "fixture-mcp.create_item" },
      })

      await expect(json(await server.fetch(new Request("http://local.harbor/api/tools/invoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolId: "fixture-mcp.create_item",
          input: { title: "Local item" },
        }),
      })))).resolves.toMatchObject({
        ok: true,
        data: {
          output: { structuredContent: { tool: "create_item", input: { title: "Local item" } } },
        },
      })

      const invocations = await json(await server.fetch(new Request("http://local.harbor/api/invocations?namespace=fixture-mcp"))) as {
        readonly ok: true
        readonly data: { readonly invocations: readonly { readonly toolId: string; readonly ok: boolean }[] }
      }
      expect(invocations.data.invocations).toEqual(expect.arrayContaining([
        expect.objectContaining({ toolId: "fixture-mcp.create_item", ok: true }),
      ]))
      expect(calls.some((call) => call.method === "tools/call" && call.tool === "create_item")).toBe(true)
    })
  })

  it("returns structured errors for invalid requests", async () => {
    await withTempProject(async (projectRoot) => {
      const server = createHarborLocalServer({ env: testEnv(projectRoot) })
      const response = await server.fetch(new Request("http://local.harbor/api/sources/install", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: "missing-mcp" }),
      }))
      expect(response.status).toBe(404)
      await expect(json(response)).resolves.toMatchObject({
        ok: false,
        code: "catalog_entry_not_found",
      })
    })
  })
})
