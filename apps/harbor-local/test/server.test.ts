import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { describe, expect, it } from "bun:test"
import { createHarborLocalServer } from "../src/server"
import type { HarborLocalServerEnv } from "../src/env"
import { createMcpHttpSourceAdapter } from "@hrbr/source-mcp"

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
    const href = _url instanceof Request ? _url.url : String(_url)
    if (href.includes("/.well-known/")) {
      return new Response("not found", { status: 404 })
    }
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
      const htmlText = await html.text()
      expect(htmlText).toContain("Harbor Local")

      const scriptPath = /<script[^>]+src="([^"]+)"/.exec(htmlText)?.[1]
      expect(scriptPath).toBeTruthy()
      const app = await server.fetch(new Request(`http://local.harbor${scriptPath}`))
      expect(app.headers.get("content-type")).toContain("text/javascript")
      await expect(app.text()).resolves.toContain("/api/catalog")

      const cssPath = /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/.exec(htmlText)?.[1]
      expect(cssPath).toBeTruthy()
      const css = await server.fetch(new Request(`http://local.harbor${cssPath}`))
      expect(css.headers.get("content-type")).toContain("text/css")
      await expect(css.text()).resolves.toContain(":root")
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
      expect(catalog.data.total).toBe(105)
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

  it("discovers OAuth for no-auth catalog MCP sources before installing them", async () => {
    await withTempProject(async (projectRoot) => {
      const server = createHarborLocalServer({
        env: testEnv(projectRoot),
        fetch: async (url: string | URL | Request): Promise<Response> => {
          const href = String(url)
          if (href === "https://mcp.linear.app/.well-known/oauth-protected-resource/mcp") {
            return new Response("not found", { status: 404 })
          }
          if (href === "https://mcp.linear.app/.well-known/oauth-protected-resource") {
            return Response.json({
              resource: "https://mcp.linear.app",
              authorization_servers: ["https://mcp.linear.app"],
            })
          }
          if (href === "https://mcp.linear.app/.well-known/oauth-authorization-server") {
            return Response.json({
              authorization_endpoint: "https://mcp.linear.app/authorize",
              token_endpoint: "https://mcp.linear.app/token",
              registration_endpoint: "https://mcp.linear.app/register",
            })
          }
          throw new Error(`Unexpected request ${href}`)
        },
      })

      const install = await json(await server.fetch(new Request("http://local.harbor/api/sources/install", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: "linear-mcp" }),
      }))) as {
        readonly ok: true
        readonly data: { readonly source: { readonly id: string; readonly auth: { readonly kind: string }; readonly status: string } }
      }
      expect(install.data.source).toMatchObject({
        id: "linear-mcp",
        auth: { kind: "oauth2" },
        status: "requires_auth",
      })

      const sources = await json(await server.fetch(new Request("http://local.harbor/api/sources"))) as {
        readonly ok: true
        readonly data: { readonly sources: readonly { readonly id: string; readonly oauth: { readonly status: string } }[] }
      }
      expect(sources.data.sources.find((source) => source.id === "linear-mcp")?.oauth.status).toBe("requires_oauth")
    })
  })

  it("scopes tool search results to the requested namespace", async () => {
    await withTempProject(async (projectRoot) => {
      const calls: Array<{ readonly method: string; readonly tool?: string | undefined }> = []
      const server = createHarborLocalServer({
        env: testEnv(projectRoot),
        fetch: fixtureFetch(calls),
      })

      for (const namespace of ["alpha-mcp", "beta-mcp"]) {
        await json(await server.fetch(new Request("http://local.harbor/api/sources/install", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            endpoint: `https://${namespace}.example.com/mcp`,
            name: namespace,
            namespace,
            refresh: true,
          }),
        })))
      }

      const search = await json(await server.fetch(new Request("http://local.harbor/api/tools/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "fixture items", namespace: "alpha-mcp", limit: 10 }),
      }))) as { readonly ok: true; readonly data: { readonly hits: readonly { readonly toolId: string; readonly namespace: string }[] } }

      expect(search.data.hits.length).toBeGreaterThan(0)
      expect(search.data.hits.every((hit) => hit.namespace === "alpha-mcp")).toBe(true)
      expect(search.data.hits.some((hit) => hit.toolId.startsWith("beta-mcp."))).toBe(false)
    })
  })

  it("removes an installed MCP source and its indexed tools", async () => {
    await withTempProject(async (projectRoot) => {
      const calls: Array<{ readonly method: string; readonly tool?: string | undefined }> = []
      const server = createHarborLocalServer({
        env: testEnv(projectRoot),
        fetch: fixtureFetch(calls),
      })

      await json(await server.fetch(new Request("http://local.harbor/api/sources/install", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://remove-me.example.com/mcp",
          name: "Remove Me",
          namespace: "remove-me",
          refresh: true,
        }),
      })))

      const removed = await json(await server.fetch(new Request("http://local.harbor/api/sources/remove", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sourceId: "remove-me" }),
      }))) as { readonly ok: true; readonly data: { readonly removed: boolean; readonly sourceId: string } }
      expect(removed.data).toEqual({ sourceId: "remove-me", removed: true })

      const sources = await json(await server.fetch(new Request("http://local.harbor/api/sources"))) as {
        readonly ok: true
        readonly data: { readonly total: number }
      }
      expect(sources.data.total).toBe(0)

      const search = await json(await server.fetch(new Request("http://local.harbor/api/tools/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: "fixture items", namespace: "remove-me", limit: 10 }),
      }))) as { readonly ok: true; readonly data: { readonly hits: readonly unknown[] } }
      expect(search.data.hits).toHaveLength(0)
    })
  })

  it("exposes local Harbor itself as a Reef-style MCP server", async () => {
    await withTempProject(async (projectRoot) => {
      const calls: Array<{ readonly method: string; readonly tool?: string | undefined }> = []
      const server = createHarborLocalServer({
        env: testEnv(projectRoot),
        fetch: fixtureFetch(calls),
      })

      await json(await server.fetch(new Request("http://local.harbor/api/sources/install", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: "https://agent-visible.example.com/mcp",
          name: "Agent Visible",
          namespace: "agent-visible",
          refresh: true,
        }),
      })))

      const adapter = createMcpHttpSourceAdapter({
        namespace: "harbor-local",
        displayName: "Harbor Local",
        endpoint: "http://local.harbor/mcp",
        fetch: (url, init) => server.fetch(url instanceof Request
          ? url
          : new Request(url.toString(), init)),
        allowLocalNetwork: true,
      })
      const tools = await adapter.listTools()
      expect(tools.map((tool) => tool.name)).toEqual(["inspect", "exec"])

      const guide = await adapter.invokeTool("inspect", {
        code: "return await hrbr.exec.toolGuide()",
      }) as { readonly content?: readonly { readonly type?: string; readonly text?: string }[] }
      expect(guide.content?.[0]?.text).toContain("\"namespace\": \"agent-visible\"")
      expect(guide.content?.[0]?.text).toContain("\"method\": \"listItems\"")

      const exec = await adapter.invokeTool("exec", {
        code: "const result = await agentVisible.listItems({ limit: 1 }); return result;",
      }) as { readonly content?: readonly { readonly type?: string; readonly text?: string }[] }
      expect(exec.content?.[0]?.text).toContain("ok: true")
      expect(exec.content?.[0]?.text).toContain("\"tool\": \"list_items\"")

      const search = await adapter.invokeTool("inspect", {
        code: "return await hrbr.tools.search({ query: 'fixture items', namespace: 'agent-visible' })",
      }) as { readonly content?: readonly { readonly type?: string; readonly text?: string }[] }
      expect(search.content?.[0]?.text).toContain("\"toolId\": \"agent-visible.list_items\"")

      const history = await adapter.invokeTool("inspect", {
        code: "return await hrbr.invocations.list({ namespace: 'agent-visible' })",
      }) as { readonly content?: readonly { readonly type?: string; readonly text?: string }[] }
      expect(history.content?.[0]?.text).toContain("\"toolId\": \"agent-visible.list_items\"")
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
