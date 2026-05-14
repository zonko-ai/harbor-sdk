import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalCredentialResolverFromEnv,
  generateHarborLocalPluginPackageManifest,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  installHarborLocalPluginManifest,
  listHarborLocalSources,
  readHarborLocalOAuthStatus,
  startHarborLocalDaemon,
  startHarborLocalOAuthFlow,
  type HarborLocalToolIndexRecord,
} from "@hrbr/runtime-local"
import { createMcpHttpSourceAdapter } from "@hrbr/source-mcp"

interface NotionMcpRegistryEntry {
  readonly slug: "notion-mcp"
  readonly display_name: string
  readonly description: string
  readonly kind: "mcp"
  readonly config: {
    readonly mcp_endpoint: string
    readonly mcp_transport: "http"
    readonly oauth_discovery: {
      readonly authorization_endpoint: string
      readonly token_endpoint: string
      readonly scopes_supported: readonly string[]
      readonly resource?: string | undefined
    }
  }
  readonly default_namespace: "notion-mcp"
}

interface McpRequestBody {
  readonly id?: number | string | undefined
  readonly method: string
  readonly params?: unknown
}

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const registryEntry = REGISTRY_CATALOG_ENTRY_BY_SLUG["notion-mcp"] as NotionMcpRegistryEntry
const namespace = registryEntry.default_namespace
const sourceRefId = `source:${registryEntry.slug}:${namespace}`

function jsonRpc(id: number | string | undefined, result: unknown): Response {
  return new Response(JSON.stringify({ jsonrpc: "2.0", id, result }), {
    headers: { "content-type": "application/json", "mcp-session-id": "notion-local-fixture" },
  })
}

function fixtureNotionMcpFetch(_url: string | URL | Request, init?: RequestInit): Promise<Response> {
  const authorization = new Headers(init?.headers).get("authorization")
  if (authorization !== "Bearer mock-notion-access-token") {
    return Promise.resolve(new Response(JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: 401, message: "Missing Notion OAuth bearer token" },
    }), { status: 401, headers: { "content-type": "application/json" } }))
  }

  const body = JSON.parse(String(init?.body ?? "{}")) as McpRequestBody
  if (body.method === "initialize") {
    return Promise.resolve(jsonRpc(body.id, {
      protocolVersion: "2025-03-26",
      capabilities: { tools: {} },
      serverInfo: { name: "notion-mcp-fixture", version: "0.0.0-local" },
    }))
  }
  if (body.method === "notifications/initialized") {
    return Promise.resolve(new Response(null, { status: 202 }))
  }
  if (body.method === "tools/list") {
    return Promise.resolve(jsonRpc(body.id, {
      tools: [
        {
          name: "notion-search",
          description: "Search Notion workspace content by query and optional filters.",
          inputSchema: {
            type: "object",
            required: ["query", "filters"],
            properties: {
              query: { type: "string" },
              filters: { type: "object" },
            },
          },
        },
        {
          name: "notion-fetch",
          description: "Fetch a Notion page, database, URL, UUID, or collection ID.",
          inputSchema: {
            type: "object",
            required: ["id"],
            properties: {
              id: { type: "string" },
              include_discussions: { type: "boolean" },
            },
          },
        },
        {
          name: "notion-create-pages",
          description: "Create Notion pages or database records after caller-side confirmation.",
          inputSchema: {
            type: "object",
            required: ["pages", "parent"],
            properties: {
              pages: { type: "array" },
              parent: { type: "object" },
            },
          },
        },
      ],
    }))
  }
  if (body.method === "tools/call") {
    const params = body.params as { name?: string; arguments?: Record<string, unknown> } | undefined
    if (params?.name === "notion-search") {
      return Promise.resolve(jsonRpc(body.id, {
        content: [{ type: "text", text: "SDK plugin examples" }],
        structuredContent: {
          results: [{
            title: "SDK plugin examples",
            url: "notion://page/sdk-plugin-examples",
            highlight: "Local runtime examples for Harbor SDK plugins.",
          }],
        },
      }))
    }
    if (params?.name === "notion-fetch") {
      return Promise.resolve(jsonRpc(body.id, {
        content: [{ type: "text", text: "# SDK plugin examples\n\nUse local OAuth and encrypted credentials." }],
        structuredContent: {
          id: String(params.arguments?.["id"] ?? "notion://page/sdk-plugin-examples"),
          markdown: "# SDK plugin examples\n\nUse local OAuth and encrypted credentials.",
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

if (!process.env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV]) {
  throw new Error(`${HARBOR_LOCAL_CREDENTIAL_KEY_ENV}=dev-key is required so OAuth tokens can be encrypted locally.`)
}

const daemon = await startHarborLocalDaemon({
  projectRoot: exampleRoot,
  oauth: {
    exchangeCode: async (input) => {
      if (input.code !== "mock-provider-code") throw new Error("Unexpected mock OAuth code")
      return {
        accessToken: "mock-notion-access-token",
        refreshToken: "mock-notion-refresh-token",
        scopes: ["notion.read"],
      }
    },
  },
})

try {
  const flow = await startHarborLocalOAuthFlow({
    projectRoot: exampleRoot,
    client: {
      sourceRefId,
      clientId: "local-public-client",
      authorizationEndpoint: registryEntry.config.oauth_discovery.authorization_endpoint,
      tokenEndpoint: registryEntry.config.oauth_discovery.token_endpoint,
      redirectUri: `${daemon.origin}/oauth/callback`,
      scopes: registryEntry.config.oauth_discovery.scopes_supported,
    },
    now: () => new Date("2026-05-14T00:00:00.000Z"),
  })
  await fetch(`${daemon.origin}/oauth/callback?state=${flow.state}&code=mock-provider-code`)

  const credentialResolver = createHarborLocalCredentialResolverFromEnv(exampleRoot)
  const credentials = await credentialResolver.resolve({
    workspaceId: "local",
    sourceId: sourceRefId,
  })
  const notionMcp = createMcpHttpSourceAdapter({
    id: registryEntry.slug,
    namespace,
    displayName: registryEntry.display_name,
    endpoint: registryEntry.config.mcp_endpoint,
    bearerCredentialSlot: "access_token",
    fetch: fixtureNotionMcpFetch,
  })

  const discoveredTools = await notionMcp.listTools({ credentials })
  const toolRecords = recordsFromTools(discoveredTools)
  const manifest = generateHarborLocalPluginPackageManifest({
    name: registryEntry.slug,
    version: "0.1.0",
    owner: { name: "Harbor SDK" },
    source: {
      kind: "local",
      path: join("examples", "plugin-notion-mcp-local"),
      entrypoint: "src/index.ts",
    },
    tools: toolRecords,
    docs: {
      readme: "README.md",
      examples: ["bun run example:notion-mcp-local"],
    },
    auth: { required: true, slots: ["access_token", "refresh_token"] },
    scopes: ["notion.read"],
    policies: ["confirm before calling notion-mcp create/update/delete tools"],
    tests: ["bun run --filter plugin-notion-mcp-local-example typecheck", "bun run example:notion-mcp-local"],
    compatibility: { sdk: ">=0.0.0", runtimeLocal: ">=0.0.0" },
    changelog: ["Initial local Notion MCP plugin example."],
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
      output: await notionMcp.invokeTool(
        tool.name,
        input.input as Readonly<Record<string, unknown>>,
        { credentials }
      ),
    }),
  })

  const searchHits = localIndex.search({ query: "search Notion docs", namespace, limit: 3 })
  const search = await localIndex.call({
    toolId: `${namespace}.notion-search`,
    input: { query: "SDK plugin examples", filters: {} },
  })
  const fetchResult = await localIndex.call({
    toolId: `${namespace}.notion-fetch`,
    input: { id: "notion://page/sdk-plugin-examples" },
  })
  const oauthStatus = await readHarborLocalOAuthStatus(exampleRoot, sourceRefId)

  console.log(JSON.stringify({
    registry: {
      slug: registryEntry.slug,
      namespace,
      endpoint: registryEntry.config.mcp_endpoint,
      oauthAuthorizationEndpoint: registryEntry.config.oauth_discovery.authorization_endpoint,
    },
    oauth: {
      status: oauthStatus.status,
      authorizationUrlHost: new URL(flow.authorizationUrl).host,
      encryptedSlots: credentials.slots(),
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
    searchHits: searchHits.map((hit) => ({
      toolId: hit.toolId,
      displayName: hit.displayName,
    })),
    smoke: {
      search,
      fetch: fetchResult,
    },
  }, null, 2))
} finally {
  await daemon.close()
}
