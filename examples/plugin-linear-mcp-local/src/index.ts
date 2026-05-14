import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalCredentialResolverFromEnv,
  generateHarborLocalPluginPackageManifest,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  importHarborLocalCredentialsFromEnvKey,
  installHarborLocalPluginManifest,
  listHarborLocalSources,
  type HarborLocalToolIndexRecord,
} from "@hrbr/runtime-local"
import { createMcpHttpSourceAdapter } from "@hrbr/source-mcp"

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
const sourceRefId = `source:${registryEntry.slug}:${namespace}`
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

function titleFromToolName(name: string): string {
  return name
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function recordsFromTools(
  tools: Awaited<ReturnType<ReturnType<typeof createMcpHttpSourceAdapter>["listTools"]>>
): readonly HarborLocalToolIndexRecord[] {
  return tools.map((tool) => ({
    id: `tool:${sourceRefId}:${tool.name}`,
    workspaceId: "local",
    sourceRefId,
    namespace,
    name: tool.name,
    displayName: tool.displayName ?? titleFromToolName(tool.name),
    ...(tool.description !== undefined ? { description: tool.description } : {}),
    ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
    ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema } : {}),
    searchText: [
      registryEntry.slug,
      namespace,
      tool.name,
      tool.displayName ?? "",
      tool.description ?? "",
    ].join(" "),
  }))
}

async function credentialsForLinearMcp() {
  if (!hasBearerToken) return undefined
  await importHarborLocalCredentialsFromEnvKey(exampleRoot, {
    sourceRefId,
    slots: { access_token: "LINEAR_MCP_ACCESS_TOKEN" },
  })
  return createHarborLocalCredentialResolverFromEnv(exampleRoot).resolve({
    workspaceId: "local",
    sourceId: sourceRefId,
    slots: ["access_token"],
  })
}

if (!process.env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV]) {
  throw new Error(`${HARBOR_LOCAL_CREDENTIAL_KEY_ENV}=dev-key is required so local credential storage has a vault key.`)
}

const credentials = await credentialsForLinearMcp()
const linearMcp = createMcpHttpSourceAdapter({
  id: registryEntry.slug,
  namespace,
  displayName: registryEntry.display_name,
  endpoint: process.env.LINEAR_MCP_ENDPOINT ?? registryEntry.config.mcp_endpoint,
  ...(hasBearerToken ? { bearerCredentialSlot: "access_token" } : {}),
  ...(liveMode ? {} : { fetch: fixtureLinearMcpFetch }),
})

const discoveredTools = await linearMcp.listTools(credentials ? { credentials } : undefined)
const toolRecords = recordsFromTools(discoveredTools)
const manifest = generateHarborLocalPluginPackageManifest({
  name: registryEntry.slug,
  version: "0.1.0",
  owner: { name: "Harbor SDK" },
  source: {
    kind: "local",
    path: join("examples", "plugin-linear-mcp-local"),
    entrypoint: "src/index.ts",
  },
  tools: toolRecords,
  docs: {
    readme: "README.md",
    examples: ["bun run example:linear-mcp-local"],
  },
  ...(hasBearerToken ? { auth: { required: true, slots: ["access_token"] } } : { auth: { required: false, slots: [] } }),
  scopes: ["linear:read"],
  policies: ["confirm before calling linear-mcp create/update/delete tools"],
  tests: ["bun run --filter plugin-linear-mcp-local-example typecheck", "bun run example:linear-mcp-local"],
  compatibility: { sdk: ">=0.0.0", runtimeLocal: ">=0.0.0" },
  changelog: ["Initial local Linear MCP plugin example."],
})

const install = await installHarborLocalPluginManifest({
  projectRoot: exampleRoot,
  manifest,
  now: () => new Date("2026-05-14T00:00:00.000Z"),
})
const localSources = await listHarborLocalSources(exampleRoot)
const localIndex = await buildHarborLocalToolIndexFromSqlite(exampleRoot, {
  callTool: async (input, tool) => ({
    toolId: input.toolId,
    output: await linearMcp.invokeTool(
      tool.name,
      input.input as Readonly<Record<string, unknown>>,
      credentials ? { credentials } : undefined
    ),
  }),
})

const hits = localIndex.search({ query: "list my Linear issues", namespace, limit: 3 })
const schema = localIndex.schema(`${namespace}.list_issues`)
const smoke = await localIndex.call({
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
    importedSlots: credentials?.slots() ?? [],
    secretValuesInEnvOnly: true,
  },
  search: hits.map((hit) => ({
    toolId: hit.toolId,
    displayName: hit.displayName,
  })),
  schema,
  smoke,
}, null, 2))
