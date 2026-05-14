import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  createHarborLocalMcpPluginRuntime,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  installHarborLocalMcpPlugin,
  listHarborLocalSources,
} from "@hrbr/runtime-local"

interface LinearMcpRegistryEntry {
  readonly slug: "linear-mcp"
  readonly display_name: string
  readonly description: string
  readonly kind: "mcp"
  readonly config: {
    readonly mcp_endpoint: string
    readonly mcp_transport: "http"
  }
  readonly default_namespace: "linear-mcp"
}

interface McpRequestBody {
  readonly id?: number | string | undefined
  readonly method: string
  readonly params?: unknown
}

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const registryEntry = REGISTRY_CATALOG_ENTRY_BY_SLUG["linear-mcp"] as LinearMcpRegistryEntry
const namespace = registryEntry.default_namespace
const liveMode = process.env.LINEAR_MCP_LIVE === "1"
const hasBearerToken = Boolean(process.env.LINEAR_MCP_ACCESS_TOKEN)

function jsonRpc(id: number | string | undefined, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "content-type": "application/json", "mcp-session-id": "linear-local-fixture" },
  })
}

function fixtureLinearMcpFetch(_url: string | URL | Request, init?: RequestInit): Promise<Response> {
  const body = JSON.parse(String(init?.body ?? "{}")) as McpRequestBody
  if (body.method === "initialize") {
    return Promise.resolve(jsonRpc(body.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "linear-mcp-fixture", version: "0.0.0-local" },
    }))
  }
  if (body.method === "notifications/initialized") {
    return Promise.resolve(new Response(null, { status: 202 }))
  }
  if (body.method === "tools/list") {
    return Promise.resolve(jsonRpc(body.id, {
      tools: [
        {
          name: "list_issues",
          description: "List Linear issues with optional team, assignee, state, and limit filters.",
          inputSchema: {
            type: "object",
            properties: {
              team: { type: "string" },
              assignee: { type: "string" },
              state: { type: "string" },
              limit: { type: "number", minimum: 1, maximum: 250 },
            },
          },
        },
        {
          name: "get_issue",
          description: "Read a Linear issue by identifier or UUID.",
          inputSchema: {
            type: "object",
            required: ["id"],
            properties: { id: { type: "string" } },
          },
        },
        {
          name: "get_team",
          description: "Resolve a Linear team by name, key, or UUID.",
          inputSchema: {
            type: "object",
            required: ["query"],
            properties: { query: { type: "string" } },
          },
        },
        {
          name: "create_issue",
          description: "Create a Linear issue after a caller-side confirmation policy approves the write.",
          inputSchema: {
            type: "object",
            required: ["team", "title"],
            properties: {
              team: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              priority: { type: "number" },
            },
          },
        },
      ],
    }))
  }
  if (body.method === "tools/call") {
    const params = body.params as { name?: string; arguments?: Record<string, unknown> } | undefined
    if (params?.name === "list_issues") {
      return Promise.resolve(jsonRpc(body.id, {
        content: [{ type: "text", text: "SDK-17 Add local Linear MCP plugin example" }],
        structuredContent: {
          issues: [
            {
              identifier: "SDK-17",
              title: "Add local Linear MCP plugin example",
              status: "In Progress",
              assignee: "SDK Team",
              url: "https://linear.app/example/issue/SDK-17",
            },
          ].slice(0, Number(params.arguments?.["limit"] ?? 10)),
        },
      }))
    }
    if (params?.name === "get_issue") {
      return Promise.resolve(jsonRpc(body.id, {
        structuredContent: {
          identifier: String(params.arguments?.["id"] ?? "SDK-17"),
          title: "Add local Linear MCP plugin example",
          status: "In Progress",
        },
      }))
    }
  }
  return Promise.resolve(new Response(JSON.stringify({
    jsonrpc: "2.0",
    id: body.id,
    error: { code: -32601, message: `Unknown MCP method ${body.method}` },
  }), { status: 200, headers: { "content-type": "application/json" } }))
}

if (!process.env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV]) {
  throw new Error(`${HARBOR_LOCAL_CREDENTIAL_KEY_ENV}=dev-key is required so local credential storage has a vault key.`)
}

const plugin = {
  slug: registryEntry.slug,
  namespace,
  displayName: registryEntry.display_name,
  endpoint: process.env.LINEAR_MCP_ENDPOINT ?? registryEntry.config.mcp_endpoint,
  sourcePath: join("examples", "plugin-linear-mcp-local"),
  auth: hasBearerToken ? { method: "bearer" as const, envName: "LINEAR_MCP_ACCESS_TOKEN" } : { method: "none" as const },
}

const install = await installHarborLocalMcpPlugin({
  projectRoot: exampleRoot,
  plugin,
  ...(liveMode ? {} : { fetch: fixtureLinearMcpFetch }),
})
const localSources = await listHarborLocalSources(exampleRoot)
const runtime = await createHarborLocalMcpPluginRuntime({
  projectRoot: exampleRoot,
  plugin,
  ...(liveMode ? {} : { fetch: fixtureLinearMcpFetch }),
})

const hits = runtime.index.search({ query: "list my Linear issues", namespace, limit: 3 })
const schema = runtime.index.schema(`${namespace}.list_issues`)
const smoke = await runtime.index.call({
  toolId: `${namespace}.list_issues`,
  input: { assignee: "me", limit: 1 },
})

console.log(JSON.stringify({
  registry: {
    slug: registryEntry.slug,
    namespace,
    endpoint: registryEntry.config.mcp_endpoint,
    transport: registryEntry.config.mcp_transport,
  },
  localRuntime: {
    projectRoot: exampleRoot,
    sourceRefs: install.sourceRefs.map((source) => source.id),
    sources: localSources.map((source) => ({
      id: source.id,
      name: source.name,
      toolCount: source.toolCount,
    })),
  },
  credentials: {
    importedSlots: runtime.credentials?.slots() ?? [],
    authSource: liveMode && !hasBearerToken ? "use-flue-setup-e2e-oauth" : hasBearerToken ? "bearer-env-import" : "fixture",
    secretValuesInEnvOnly: hasBearerToken,
  },
  search: hits.map((hit) => ({
    toolId: hit.toolId,
    displayName: hit.displayName,
  })),
  schema,
  smoke,
}, null, 2))
