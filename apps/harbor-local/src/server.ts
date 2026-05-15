import { REGISTRY_LOCAL_MCP_CATALOG_ENTRIES, type LocalMcpCatalogEntryJson } from "@hrbr/registry-catalog"
import {
  createHarbor,
  HarborLocalError,
  isHarborLocalError,
  type HarborLocalMcpOAuthDiscovery,
} from "@hrbr/sdk/local"
import type { McpSourceFetch } from "@hrbr/source-mcp"
import type { HarborLocalServerEnv } from "./env"
import { handleLocalHarborMcpRequest } from "./mcp"

export interface HarborLocalServerInput {
  readonly env: HarborLocalServerEnv
  readonly fetch?: McpSourceFetch | undefined
}

export interface HarborLocalServer {
  readonly env: HarborLocalServerEnv
  readonly fetch: (request: Request) => Promise<Response>
}

type LocalMcpCatalogEntry = LocalMcpCatalogEntryJson
type LocalHarborRuntime = ReturnType<typeof createHarbor>
type HarborLocalMcpSourceInput = Parameters<LocalHarborRuntime["sources"]["setupMcp"]>[0]["source"]

interface JsonBody {
  readonly [key: string]: unknown
}

interface PendingOAuthConnection {
  readonly close: () => Promise<void>
}

const pendingOAuth = new Map<string, PendingOAuthConnection>()

function json(payload: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
    },
  })
}

function contentTypeFor(pathname: string): string {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8"
  if (pathname.endsWith(".js") || pathname.endsWith(".mjs")) return "text/javascript; charset=utf-8"
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8"
  if (pathname.endsWith(".svg")) return "image/svg+xml"
  if (pathname.endsWith(".png")) return "image/png"
  if (pathname.endsWith(".ico")) return "image/x-icon"
  if (pathname.endsWith(".json")) return "application/json"
  if (pathname.endsWith(".woff2")) return "font/woff2"
  if (pathname.endsWith(".woff")) return "font/woff"
  if (pathname.endsWith(".map")) return "application/json"
  return "application/octet-stream"
}

async function staticResponse(pathname: string): Promise<Response | null> {
  const rel = pathname === "/" || pathname === "/index.html"
    ? "../public/dist/index.html"
    : `../public/dist${pathname}`
  const file = Bun.file(new URL(rel, import.meta.url))
  if (!(await file.exists())) return null
  return new Response(file, {
    headers: {
      "content-type": contentTypeFor(pathname === "/" ? "/index.html" : pathname),
      "cache-control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
    },
  })
}

function ok(data: unknown, init?: ResponseInit): Response {
  return json({ ok: true, data }, init)
}

function errorResponse(error: unknown): Response {
  const status = error instanceof HarborLocalError && error.code === "local_mcp_source_unknown"
    ? 404
    : error instanceof SyntaxError
      ? 400
      : 500
  return json({
    ok: false,
    code: isHarborLocalError(error) ? error.code : "runtime_error",
    message: error instanceof Error ? error.message : String(error),
    ...(isHarborLocalError(error) && error.details ? { details: error.details } : {}),
  }, { status })
}

async function readJson(request: Request): Promise<JsonBody> {
  const text = await request.text()
  if (!text.trim()) return {}
  const value = JSON.parse(text) as unknown
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SyntaxError("JSON request body must be an object.")
  }
  return value as JsonBody
}

function stringField(body: JsonBody, key: string): string | undefined {
  const value = body[key]
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined
}

function booleanField(body: JsonBody, key: string): boolean | undefined {
  const value = body[key]
  return typeof value === "boolean" ? value : undefined
}

function objectField(body: JsonBody, key: string): Record<string, unknown> {
  const value = body[key]
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function numberField(body: JsonBody, key: string): number | undefined {
  const value = body[key]
  return typeof value === "number" ? value : undefined
}

function catalogEntry(slug: string): LocalMcpCatalogEntry | undefined {
  return REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.find((entry) => entry.slug === slug)
}

function oauthDiscovery(entry: LocalMcpCatalogEntry): HarborLocalMcpOAuthDiscovery | undefined {
  const discovery = entry.oauthDiscovery
  if (!discovery) return undefined
  return {
    authorizationEndpoint: discovery.authorizationEndpoint,
    tokenEndpoint: discovery.tokenEndpoint,
    registrationEndpoint: discovery.registrationEndpoint,
    scopes: discovery.scopes,
    resource: discovery.resource,
  }
}

function sourceFromCatalog(entry: LocalMcpCatalogEntry, body: JsonBody): HarborLocalMcpSourceInput {
  const namespace = stringField(body, "namespace") ?? entry.defaultNamespace
  const name = stringField(body, "name") ?? entry.displayName
  const discovery = oauthDiscovery(entry)
  const source: HarborLocalMcpSourceInput = {
    transport: "remote",
    name,
    namespace,
    endpoint: entry.endpoint,
    remoteTransport: entry.transport === "sse" ? "sse" : "streamable-http",
    auth: discovery ? { kind: "oauth2" } : { kind: "none" },
  }
  if (entry.auth.mode === "bearer" && entry.auth.requiredSecrets[0]) {
    const auth = entry.auth as {
      readonly headerName?: string | undefined
      readonly prefix?: string | undefined
      readonly requiredSecrets: readonly string[]
    }
    return {
      ...source,
      auth: {
        kind: "header",
        headerName: auth.headerName ?? "authorization",
        secretSlot: auth.requiredSecrets[0]!,
        prefix: auth.prefix ?? "Bearer ",
      },
    }
  }
  if (entry.auth.mode === "query" && entry.auth.requiredSecrets[0] && entry.auth.queryParam) {
    return {
      ...source,
      queryParams: {
        [entry.auth.queryParam]: { kind: "binding", slot: entry.auth.requiredSecrets[0] },
      },
    }
  }
  return source
}

function customSource(body: JsonBody): HarborLocalMcpSourceInput {
  const endpoint = stringField(body, "endpoint")
  if (!endpoint) throw new SyntaxError("endpoint is required for custom MCP install.")
  const namespace = stringField(body, "namespace")
  const name = stringField(body, "name") ?? namespace ?? new URL(endpoint).hostname
  const auth = stringField(body, "auth")
  return {
    transport: "remote",
    name,
    ...(namespace ? { namespace } : {}),
    endpoint,
    remoteTransport: "streamable-http",
    auth: auth === "oauth2" ? { kind: "oauth2" } : { kind: "none" },
  }
}

function runtime(input: HarborLocalServerInput) {
  const env = {
    ...process.env,
    ...(input.env.credentialKey ? { HARBOR_LOCAL_CREDENTIAL_KEY: input.env.credentialKey } : {}),
    ...(input.env.oauthPort !== undefined ? { HARBOR_LOCAL_OAUTH_PORT: String(input.env.oauthPort) } : {}),
  }
  return createHarbor({
    projectRoot: input.env.projectRoot,
    env,
    allowLocalNetwork: true,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  })
}

async function catalogResponse(): Promise<Response> {
  return ok({
    entries: REGISTRY_LOCAL_MCP_CATALOG_ENTRIES,
    total: REGISTRY_LOCAL_MCP_CATALOG_ENTRIES.length,
  })
}

async function installSource(input: HarborLocalServerInput, body: JsonBody): Promise<Response> {
  const harbor = runtime(input)
  const slug = stringField(body, "slug")
  const entry = slug ? catalogEntry(slug) : undefined
  if (slug && !entry) return json({ ok: false, code: "catalog_entry_not_found", message: `Unknown MCP catalog slug "${slug}".` }, { status: 404 })
  let discovery = entry ? oauthDiscovery(entry) : undefined
  let source = entry ? sourceFromCatalog(entry, body) : customSource(body)
  if (!discovery && source.transport === "remote" && source.auth?.kind === "none") {
    discovery = await harbor.sources.discoverMcpOAuth(source.endpoint) ?? undefined
    if (discovery) source = { ...source, auth: { kind: "oauth2" } }
  }
  const setup = await harbor.sources.setupMcp({
    source,
    discovery,
    connect: booleanField(body, "connect") ?? false,
    refresh: booleanField(body, "refresh") ?? false,
    clientName: stringField(body, "clientName"),
  })
  const oauth = setup.oauth
    ? {
      sourceId: setup.source.id,
      authorizationUrl: setup.oauth.authorizationUrl,
      redirectUri: setup.oauth.redirectUri,
      state: setup.oauth.state,
    }
    : undefined
  if (setup.oauth) {
    const prior = pendingOAuth.get(setup.source.id)
    await prior?.close()
    pendingOAuth.set(setup.source.id, { close: setup.oauth.close })
  }
  return ok({
    source: setup.source,
    ...(oauth ? { oauth } : {}),
    ...(setup.refresh ? { refresh: setup.refresh } : {}),
  })
}

async function connectSource(input: HarborLocalServerInput, body: JsonBody): Promise<Response> {
  const sourceId = stringField(body, "sourceId")
  if (!sourceId) throw new SyntaxError("sourceId is required.")
  const slug = stringField(body, "slug")
  const entry = slug ? catalogEntry(slug) : undefined
  let discovery = entry ? oauthDiscovery(entry) : objectField(body, "discovery") as unknown as HarborLocalMcpOAuthDiscovery
  const harbor = runtime(input)
  if (!discovery?.authorizationEndpoint || !discovery.tokenEndpoint) {
    const source = await harbor.sources.getMcp(sourceId)
    if (source?.endpoint) {
      discovery = await harbor.sources.discoverMcpOAuth(source.endpoint) ?? discovery
    }
  }
  if (!discovery?.authorizationEndpoint || !discovery.tokenEndpoint) {
    throw new SyntaxError("OAuth discovery is required to connect this MCP source.")
  }
  const connect = await harbor.sources.connectMcpOAuth({
    sourceId,
    discovery,
    clientName: stringField(body, "clientName"),
    port: numberField(body, "port"),
  })
  const prior = pendingOAuth.get(sourceId)
  await prior?.close()
  pendingOAuth.set(sourceId, { close: connect.close })
  return ok({
    sourceId,
    authorizationUrl: connect.authorizationUrl,
    redirectUri: connect.redirectUri,
    state: connect.state,
  })
}

async function route(input: HarborLocalServerInput, request: Request): Promise<Response> {
  const url = new URL(request.url)
  if (request.method === "OPTIONS") return new Response(null, { status: 204 })
  if (url.pathname === "/mcp") return handleLocalHarborMcpRequest(input, request)
  if (request.method === "GET") {
    const staticFile = await staticResponse(url.pathname)
    if (staticFile) return staticFile
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 })
  }
  if (request.method === "GET" && url.pathname === "/health") {
    return ok({
      status: "ok",
      projectRoot: input.env.projectRoot,
      host: input.env.host,
      port: input.env.port,
    })
  }
  if (request.method === "GET" && url.pathname === "/api/catalog") return catalogResponse()
  if (request.method === "GET" && url.pathname === "/api/sources") {
    const harbor = runtime(input)
    const sources = await harbor.sources.listMcp()
    const withStatus = await Promise.all(sources.map(async (source) => ({
      ...source,
      oauth: source.auth.kind === "oauth2"
        ? await harbor.sources.oauthStatus(source.id)
        : { sourceRefId: source.id, status: "not_required" },
    })))
    return ok({ sources: withStatus, total: sources.length })
  }
  if (request.method === "POST" && url.pathname === "/api/sources/install") {
    return installSource(input, await readJson(request))
  }
  if (request.method === "POST" && url.pathname === "/api/sources/connect") {
    return connectSource(input, await readJson(request))
  }
  if (request.method === "POST" && url.pathname === "/api/sources/refresh") {
    const body = await readJson(request)
    const sourceId = stringField(body, "sourceId")
    if (!sourceId) throw new SyntaxError("sourceId is required.")
    return ok(await runtime(input).sources.refreshMcp(sourceId))
  }
  if (request.method === "POST" && url.pathname === "/api/sources/remove") {
    const body = await readJson(request)
    const sourceId = stringField(body, "sourceId")
    if (!sourceId) throw new SyntaxError("sourceId is required.")
    const prior = pendingOAuth.get(sourceId)
    await prior?.close()
    pendingOAuth.delete(sourceId)
    return ok(await runtime(input).sources.removeMcp(sourceId))
  }
  if (request.method === "POST" && url.pathname === "/api/tools/search") {
    const body = await readJson(request)
    return ok({
      hits: await runtime(input).tools.search({
        query: stringField(body, "query") ?? "",
        namespace: stringField(body, "namespace"),
        limit: numberField(body, "limit"),
      }),
    })
  }
  if (request.method === "POST" && url.pathname === "/api/tools/schema") {
    const body = await readJson(request)
    const toolId = stringField(body, "toolId")
    if (!toolId) throw new SyntaxError("toolId is required.")
    return ok(await runtime(input).tools.schema(toolId))
  }
  if (request.method === "POST" && url.pathname === "/api/tools/invoke") {
    const body = await readJson(request)
    const toolId = stringField(body, "toolId")
    if (!toolId) throw new SyntaxError("toolId is required.")
    return ok(await runtime(input).tools.invoke(toolId, body["input"] ?? {}, {
      confirmWrites: booleanField(body, "confirmWrites") ?? true,
    }))
  }
  if (request.method === "GET" && url.pathname === "/api/invocations") {
    return ok({
      invocations: await runtime(input).invocations.list({
        namespace: url.searchParams.get("namespace") ?? undefined,
        toolId: url.searchParams.get("toolId") ?? undefined,
        limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
      }),
    })
  }
  return json({ ok: false, code: "not_found", message: `No route for ${request.method} ${url.pathname}.` }, { status: 404 })
}

export function createHarborLocalServer(input: HarborLocalServerInput): HarborLocalServer {
  return {
    env: input.env,
    fetch: async (request) => {
      try {
        const response = await route(input, request)
        response.headers.set("access-control-allow-origin", "*")
        response.headers.set("access-control-allow-methods", "GET,POST,OPTIONS")
        response.headers.set("access-control-allow-headers", "content-type")
        return response
      } catch (error) {
        return errorResponse(error)
      }
    },
  }
}
