import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  createHarborLocalMcpPluginRuntime,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  installHarborLocalMcpPlugin,
  listHarborLocalSources,
  readHarborLocalOAuthStatus,
  startHarborLocalDaemon,
  startHarborLocalOAuthFlow,
} from "@hrbr/runtime-local"
import {
  exchangeOAuthAuthorizationCode,
  registerOAuthDynamicClient,
} from "@hrbr/source-auth"

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
      readonly registration_endpoint?: string | undefined
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
const liveMode = process.env.NOTION_MCP_LIVE === "1"

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

if (!process.env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV]) {
  throw new Error(`${HARBOR_LOCAL_CREDENTIAL_KEY_ENV}=dev-key is required so OAuth tokens can be encrypted locally.`)
}

async function waitForOAuthReady(timeoutMs = 300_000): Promise<void> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const status = await readHarborLocalOAuthStatus(exampleRoot, sourceRefId)
    if (status.status === "ready") return
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error("Timed out waiting for Notion OAuth callback.")
}

let oauthClient: { clientId: string; clientSecret?: string | undefined } = {
  clientId: "local-public-client",
}

const daemon = await startHarborLocalDaemon({
  projectRoot: exampleRoot,
  oauth: {
    exchangeCode: async (input) => {
      if (liveMode) {
        return exchangeOAuthAuthorizationCode({
          tokenEndpoint: registryEntry.config.oauth_discovery.token_endpoint,
          code: input.code,
          codeVerifier: input.codeVerifier,
          clientId: oauthClient.clientId,
          clientSecret: oauthClient.clientSecret,
          redirectUri: input.redirectUri,
        })
      }
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
  const redirectUri = `${daemon.origin}/oauth/callback`
  if (liveMode) {
    const registrationEndpoint = registryEntry.config.oauth_discovery.registration_endpoint
    if (!registrationEndpoint) throw new Error("Notion MCP registry metadata does not include registration_endpoint.")
    oauthClient = await registerOAuthDynamicClient({
      registrationEndpoint,
      clientName: "Harbor SDK Local Notion MCP",
      redirectUris: [redirectUri],
      scopes: registryEntry.config.oauth_discovery.scopes_supported,
    })
  }
  const flow = await startHarborLocalOAuthFlow({
    projectRoot: exampleRoot,
    client: {
      sourceRefId,
      clientId: oauthClient.clientId,
      authorizationEndpoint: registryEntry.config.oauth_discovery.authorization_endpoint,
      tokenEndpoint: registryEntry.config.oauth_discovery.token_endpoint,
      redirectUri,
      scopes: registryEntry.config.oauth_discovery.scopes_supported,
      resource: registryEntry.config.oauth_discovery.resource,
      ...(oauthClient.clientSecret ? { clientSecretRef: "dynamic-client-secret" } : {}),
    },
    now: () => new Date("2026-05-14T00:00:00.000Z"),
  })
  if (liveMode) {
    console.log(`Open this URL to connect Notion MCP:\n${flow.authorizationUrl}\n`)
    await waitForOAuthReady()
  } else {
    await fetch(`${daemon.origin}/oauth/callback?state=${flow.state}&code=mock-provider-code`)
  }

  const plugin = {
    slug: registryEntry.slug,
    namespace,
    displayName: registryEntry.display_name,
    endpoint: registryEntry.config.mcp_endpoint,
    sourcePath: join("examples", "plugin-notion-mcp-local"),
    auth: { method: "oauth2" as const },
  }
  const install = await installHarborLocalMcpPlugin({
    projectRoot: exampleRoot,
    plugin,
    ...(liveMode ? {} : { fetch: fixtureNotionMcpFetch }),
  })
  const localSources = await listHarborLocalSources(exampleRoot)
  const runtime = await createHarborLocalMcpPluginRuntime({
    projectRoot: exampleRoot,
    plugin,
    ...(liveMode ? {} : { fetch: fixtureNotionMcpFetch }),
  })

  const searchHits = runtime.index.search({ query: "search Notion docs", namespace, limit: 3 })
  const search = await runtime.index.call({
    toolId: `${namespace}.notion-search`,
    input: { query: "SDK plugin examples", filters: {} },
  })
  const fetchResult = await runtime.index.call({
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
      encryptedSlots: runtime.credentials?.slots() ?? [],
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
