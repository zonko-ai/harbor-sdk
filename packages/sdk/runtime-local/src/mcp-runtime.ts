import {
  createMcpHttpSourceAdapter,
  probeMcpHttpSource,
  type McpHttpProbeResult,
  type McpSourceFetch,
} from "@hrbr/source-mcp"
import {
  exchangeOAuthAuthorizationCode,
  registerOAuthDynamicClient,
  type OAuthFetch,
} from "@hrbr/source-auth"
import {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalCredentialResolverFromEnv,
  type HarborLocalCredentialResolverFromEnvInput,
} from "./plugin-store"
import {
  listHarborLocalMcpToolBindings,
  putHarborLocalMcpToolBindings,
  readHarborLocalMcpSource,
  updateHarborLocalMcpSourceStatus,
  type HarborLocalMcpStoredSource,
  type HarborLocalMcpToolBinding,
} from "./mcp-store"
import {
  readHarborLocalOAuthStatus,
  refreshHarborLocalOAuthGrant,
  startHarborLocalOAuthFlow,
  type HarborLocalOAuthStatus,
} from "./oauth"
import {
  startHarborLocalDaemon,
  type HarborLocalDaemonHandle,
} from "./daemon"
import { createHarborLocalToolIndex, type HarborLocalToolIndexRecord } from "./tool-search"
import type { HarborLocalToolIndex } from "./tool-search"
import { HarborLocalError } from "./errors"

interface SourceCredentials {
  readonly get: (slot: string) => string | undefined
  readonly require: (slot: string) => string
  readonly has: (slot: string) => boolean
  readonly slots: () => readonly string[]
}

export interface HarborLocalMcpRefreshSourceInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly sourceId: string
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}

export interface HarborLocalMcpRefreshSourceResult {
  readonly sourceId: string
  readonly namespace: string
  readonly toolCount: number
  readonly tools: readonly HarborLocalMcpToolBinding[]
}

export interface HarborLocalMcpProbeSourceInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly sourceId: string
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}

export interface HarborLocalMcpProbeSourceResult extends McpHttpProbeResult {
  readonly sourceId: string
}

export interface HarborLocalMcpToolRuntimeInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}

export interface HarborLocalMcpOAuthDiscovery {
  readonly authorizationServer?: string | undefined
  readonly authorizationEndpoint: string
  readonly tokenEndpoint: string
  readonly registrationEndpoint?: string | undefined
  readonly scopes?: readonly string[] | undefined
  readonly resource?: string | undefined
  readonly hasDynamicRegistration?: boolean | undefined
  readonly tokenEndpointAuthMethods?: readonly string[] | undefined
  readonly revocationEndpoint?: string | undefined
}

export interface HarborLocalMcpOAuthConnectInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly sourceId: string
  readonly discovery: HarborLocalMcpOAuthDiscovery
  readonly clientName?: string | undefined
  readonly port?: number | undefined
  readonly fetch?: OAuthFetch | undefined
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalMcpOAuthConnectHandle {
  readonly sourceId: string
  readonly authorizationUrl: string
  readonly state: string
  readonly redirectUri: string
  readonly daemon: HarborLocalDaemonHandle
  readonly waitForReady: (timeoutMs?: number) => Promise<HarborLocalOAuthStatus>
  readonly close: () => Promise<void>
}

interface McpOAuthResourceMetadata {
  readonly resource?: string | undefined
  readonly authorization_servers?: readonly string[] | undefined
  readonly scopes_supported?: readonly string[] | undefined
}

interface McpOAuthAuthorizationServerMetadata {
  readonly authorization_endpoint?: string | undefined
  readonly token_endpoint?: string | undefined
  readonly registration_endpoint?: string | undefined
  readonly scopes_supported?: readonly string[] | undefined
  readonly token_endpoint_auth_methods_supported?: readonly string[] | undefined
  readonly revocation_endpoint?: string | undefined
}

const OAUTH_DISCOVERY_TIMEOUT_MS = 8_000

function validHttpUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString().replace(/\/$/, "") : undefined
  } catch {
    return undefined
  }
}

function wellKnownUrl(
  base: string,
  name: "oauth-protected-resource" | "oauth-authorization-server" | "openid-configuration",
  preserveQuery = false
): string {
  const input = new URL(base)
  const pathSuffix = input.pathname === "/" ? "" : input.pathname.replace(/\/$/, "")
  const url = new URL(input.origin)
  url.pathname = name === "openid-configuration"
    ? `${pathSuffix}/.well-known/openid-configuration`
    : `/.well-known/${name}${pathSuffix}`
  url.search = preserveQuery ? input.search : ""
  url.hash = ""
  return url.toString()
}

async function fetchDiscoveryJson<T>(
  url: string,
  fetchImpl: McpSourceFetch | undefined
): Promise<T | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OAUTH_DISCOVERY_TIMEOUT_MS)
  try {
    const res = await (fetchImpl ?? fetch)(url, {
      headers: {
        accept: "application/json",
        "mcp-protocol-version": "2025-03-26",
      },
      signal: controller.signal,
    })
    if (!res.ok) return null
    const contentType = res.headers.get("content-type") ?? ""
    if (contentType && !contentType.toLowerCase().includes("json")) return null
    return await res.json() as T
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function discoverHarborLocalMcpOAuth(input: {
  readonly endpoint: string
  readonly fetch?: McpSourceFetch | undefined
}): Promise<HarborLocalMcpOAuthDiscovery | null> {
  const endpoint = validHttpUrl(input.endpoint)
  if (!endpoint) return null
  const endpointUrl = new URL(endpoint)
  const resourceCandidates = [
    wellKnownUrl(endpoint, "oauth-protected-resource", true),
    ...(endpointUrl.pathname !== "/"
      ? [wellKnownUrl(endpointUrl.origin, "oauth-protected-resource")]
      : []),
  ]
  let resourceMeta: McpOAuthResourceMetadata | null = null
  for (const candidate of resourceCandidates) {
    resourceMeta = await fetchDiscoveryJson<McpOAuthResourceMetadata>(candidate, input.fetch)
    if (resourceMeta) break
  }
  const authorizationServer = validHttpUrl(resourceMeta?.authorization_servers?.[0]) ?? endpointUrl.origin
  const authMeta = await fetchDiscoveryJson<McpOAuthAuthorizationServerMetadata>(
    wellKnownUrl(authorizationServer, "oauth-authorization-server"),
    input.fetch
  ) ?? await fetchDiscoveryJson<McpOAuthAuthorizationServerMetadata>(
    wellKnownUrl(authorizationServer, "openid-configuration"),
    input.fetch
  )
  const authorizationEndpoint = validHttpUrl(authMeta?.authorization_endpoint)
  const tokenEndpoint = validHttpUrl(authMeta?.token_endpoint)
  if (!authorizationEndpoint || !tokenEndpoint) return null
  const registrationEndpoint = validHttpUrl(authMeta?.registration_endpoint)
  const scopes = resourceMeta?.scopes_supported?.length
    ? resourceMeta.scopes_supported
    : authMeta?.scopes_supported ?? []
  return {
    authorizationServer,
    authorizationEndpoint,
    tokenEndpoint,
    ...(registrationEndpoint ? { registrationEndpoint } : {}),
    scopes: [...scopes],
    ...(resourceMeta?.resource ? { resource: resourceMeta.resource } : {}),
    hasDynamicRegistration: !!registrationEndpoint,
    ...(authMeta?.token_endpoint_auth_methods_supported
      ? { tokenEndpointAuthMethods: [...authMeta.token_endpoint_auth_methods_supported] }
      : {}),
    ...(authMeta?.revocation_endpoint ? { revocationEndpoint: authMeta.revocation_endpoint } : {}),
  }
}

function titleFromToolName(name: string): string {
  return name
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function sourceRefId(source: HarborLocalMcpStoredSource): string {
  return source.id
}

function bindingSearchText(source: HarborLocalMcpStoredSource, binding: HarborLocalMcpToolBinding): string {
  return [
    source.name,
    source.namespace,
    binding.toolId,
    binding.toolName,
    binding.description ?? "",
  ].join(" ")
}

function bindingToToolIndexRecord(
  source: HarborLocalMcpStoredSource,
  binding: HarborLocalMcpToolBinding
): HarborLocalToolIndexRecord {
  return {
    id: `tool:${sourceRefId(source)}:${binding.toolId}`,
    workspaceId: "local",
    sourceRefId: sourceRefId(source),
    namespace: source.namespace,
    name: binding.toolId,
    displayName: titleFromToolName(binding.toolId),
    ...(binding.description !== undefined ? { description: binding.description } : {}),
    ...(binding.inputSchema !== undefined ? { inputSchema: binding.inputSchema } : {}),
    ...(binding.outputSchema !== undefined ? { outputSchema: binding.outputSchema } : {}),
    searchText: bindingSearchText(source, binding),
  }
}

async function resolvedCredentials(
  input: HarborLocalCredentialResolverFromEnvInput & { readonly projectRoot: string; readonly sourceId: string },
): Promise<SourceCredentials> {
  return createHarborLocalCredentialResolverFromEnv(input.projectRoot, {
    env: input.env,
    envName: input.envName,
  }).resolve({
    workspaceId: "local",
    sourceId: input.sourceId,
  })
}

function bearerSlot(source: HarborLocalMcpStoredSource): string | undefined {
  if (source.auth.kind === "header" && source.auth.headerName.toLowerCase() === "authorization") {
    return source.auth.secretSlot
  }
  if (source.auth.kind === "oauth2") {
    return "access_token"
  }
  return undefined
}

async function optionalCredentials(
  input: HarborLocalCredentialResolverFromEnvInput & {
    readonly projectRoot: string
    readonly source: HarborLocalMcpStoredSource
    readonly fetch?: McpSourceFetch | undefined
  },
): Promise<SourceCredentials | undefined> {
  const slot = bearerSlot(input.source)
  if (slot === undefined) return undefined
  if (input.source.auth.kind === "oauth2") {
    const oauth = await readHarborLocalOAuthStatus(input.projectRoot, input.source.id)
    if (oauth.status === "ready" || oauth.status === "reconnect_required") {
      const refresh = await refreshHarborLocalOAuthGrant(input.projectRoot, {
        sourceRefId: input.source.id,
        env: input.env,
        envName: input.envName,
        fetch: input.fetch,
      })
      if (refresh.status === "reconnect_required") {
        throw new HarborLocalError({
          code: "local_mcp_oauth_reconnect_required",
          message: refresh.error ?? `OAuth reconnect is required for MCP source "${input.source.id}".`,
          details: { sourceId: input.source.id },
        })
      }
    }
  }
  return slot === undefined
    ? undefined
    : resolvedCredentials({
        projectRoot: input.projectRoot,
        sourceId: input.source.id,
        env: input.env,
        envName: input.envName,
      })
}

function adapterForSource(input: {
  readonly source: HarborLocalMcpStoredSource
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}) {
  const source = input.source
  if (source.transport !== "remote" || !source.endpoint) {
    throw new HarborLocalError({
      code: "local_mcp_source_unsupported_transport",
      message: `MCP source "${source.id}" is not a remote HTTP source.`,
      details: { sourceId: source.id, transport: source.transport },
    })
  }
  return createMcpHttpSourceAdapter({
    id: source.id,
    namespace: source.namespace,
    displayName: source.name,
    endpoint: source.endpoint,
    allowLocalNetwork: input.allowLocalNetwork,
    ...(input.fetch !== undefined ? { fetch: input.fetch } : {}),
    ...(bearerSlot(source) !== undefined ? { bearerCredentialSlot: bearerSlot(source) } : {}),
  })
}

async function waitForOAuthReady(
  projectRoot: string,
  sourceId: string,
  timeoutMs = 300_000
): Promise<HarborLocalOAuthStatus> {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const status = await readHarborLocalOAuthStatus(projectRoot, sourceId)
    if (status.status === "ready") return status
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  throw new HarborLocalError({
    code: "local_mcp_oauth_timeout",
    message: `Timed out waiting for OAuth callback for MCP source "${sourceId}".`,
    details: { sourceId, timeoutMs },
  })
}

export async function connectHarborLocalMcpOAuthSource(
  input: HarborLocalMcpOAuthConnectInput
): Promise<HarborLocalMcpOAuthConnectHandle> {
  const source = await readHarborLocalMcpSource(input.projectRoot, input.sourceId)
  if (!source) throw new HarborLocalError({
    code: "local_mcp_source_unknown",
    message: `Unknown local MCP source "${input.sourceId}".`,
    details: { sourceId: input.sourceId },
  })
  if (source.auth.kind !== "oauth2") {
    throw new HarborLocalError({
      code: "local_mcp_oauth_not_configured",
      message: `MCP source "${input.sourceId}" is not configured for oauth2 auth.`,
      details: { sourceId: input.sourceId, auth: source.auth.kind },
    })
  }

  let oauthClient: { clientId: string; clientSecret?: string | undefined } = {
    clientId: "local-public-client",
  }
  const daemon = await startHarborLocalDaemon({
    projectRoot: input.projectRoot,
    port: input.port,
    now: input.now,
    oauth: {
      env: input.env,
      envName: input.envName,
      exchangeCode: async (callback) =>
        exchangeOAuthAuthorizationCode({
          tokenEndpoint: input.discovery.tokenEndpoint,
          code: callback.code,
          codeVerifier: callback.codeVerifier,
          clientId: oauthClient.clientId,
          clientSecret: oauthClient.clientSecret,
          redirectUri: callback.redirectUri,
          fetch: input.fetch,
        }),
    },
  })

  try {
    const redirectUri = `${daemon.origin}/oauth/callback`
    if (input.discovery.registrationEndpoint) {
      oauthClient = await registerOAuthDynamicClient({
        registrationEndpoint: input.discovery.registrationEndpoint,
        clientName: input.clientName ?? `Harbor SDK Local ${source.name}`,
        redirectUris: [redirectUri],
        scopes: input.discovery.scopes ?? [],
        fetch: input.fetch,
      })
    }
    const flow = await startHarborLocalOAuthFlow({
      projectRoot: input.projectRoot,
      client: {
        sourceRefId: source.id,
        clientId: oauthClient.clientId,
        authorizationEndpoint: input.discovery.authorizationEndpoint,
        tokenEndpoint: input.discovery.tokenEndpoint,
        redirectUri,
        scopes: input.discovery.scopes ?? [],
        resource: input.discovery.resource,
        ...(oauthClient.clientSecret ? { clientSecretRef: "dynamic-client-secret" } : {}),
      },
      now: input.now,
    })
    return {
      sourceId: source.id,
      authorizationUrl: flow.authorizationUrl,
      state: flow.state,
      redirectUri,
      daemon,
      waitForReady: (timeoutMs) => waitForOAuthReady(input.projectRoot, source.id, timeoutMs),
      close: () => daemon.close(),
    }
  } catch (error) {
    await daemon.close()
    throw error
  }
}

async function searchableRecordsForSource(projectRoot: string, source: HarborLocalMcpStoredSource): Promise<readonly HarborLocalToolIndexRecord[]> {
  const bindings = await listHarborLocalMcpToolBindings(projectRoot, source.id)
  return bindings.map((binding) => bindingToToolIndexRecord(source, binding))
}

export async function refreshHarborLocalMcpSource(
  input: HarborLocalMcpRefreshSourceInput
): Promise<HarborLocalMcpRefreshSourceResult> {
  const source = await readHarborLocalMcpSource(input.projectRoot, input.sourceId)
  if (!source) throw new HarborLocalError({
    code: "local_mcp_source_unknown",
    message: `Unknown local MCP source "${input.sourceId}".`,
    details: { sourceId: input.sourceId },
  })
  const adapter = adapterForSource({ source, fetch: input.fetch, allowLocalNetwork: input.allowLocalNetwork })
  const credentials = await optionalCredentials({
    projectRoot: input.projectRoot,
    source,
    env: input.env,
    envName: input.envName,
    fetch: input.fetch,
  })
  const tools = await adapter.listTools(credentials ? { credentials } : undefined)
  const bindings = await putHarborLocalMcpToolBindings({
    projectRoot: input.projectRoot,
    sourceId: source.id,
    namespace: source.namespace,
    tools: tools.map((tool) => ({
      toolId: tool.name,
      toolName: tool.name,
      ...(tool.description !== undefined ? { description: tool.description } : {}),
      ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
      ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema } : {}),
      ...(tool.annotations !== undefined ? { annotations: tool.annotations } : {}),
    })),
  })
  const records = await searchableRecordsForSource(input.projectRoot, source)
  await writeMcpToolIndex(input.projectRoot, source.id, records)
  await updateHarborLocalMcpSourceStatus({
    projectRoot: input.projectRoot,
    sourceId: source.id,
    status: "ready",
  })
  return {
    sourceId: source.id,
    namespace: source.namespace,
    toolCount: bindings.length,
    tools: bindings,
  }
}

export async function probeHarborLocalMcpSource(
  input: HarborLocalMcpProbeSourceInput
): Promise<HarborLocalMcpProbeSourceResult> {
  const source = await readHarborLocalMcpSource(input.projectRoot, input.sourceId)
  if (!source) throw new HarborLocalError({
    code: "local_mcp_source_unknown",
    message: `Unknown local MCP source "${input.sourceId}".`,
    details: { sourceId: input.sourceId },
  })
  if (source.transport !== "remote" || !source.endpoint) {
    return {
      ok: false,
      status: "blocked",
      endpoint: source.endpoint ?? "",
      namespace: source.namespace,
      sourceId: source.id,
      message: `MCP source "${source.id}" is not a remote HTTP source.`,
      method: "configure",
    }
  }
  const credentials = await optionalCredentials({
    projectRoot: input.projectRoot,
    source,
    env: input.env,
    envName: input.envName,
    fetch: input.fetch,
  })
  const probe = await probeMcpHttpSource({
    id: source.id,
    namespace: source.namespace,
    displayName: source.name,
    endpoint: source.endpoint,
    allowLocalNetwork: input.allowLocalNetwork,
    ...(input.fetch !== undefined ? { fetch: input.fetch } : {}),
    ...(bearerSlot(source) !== undefined ? { bearerCredentialSlot: bearerSlot(source) } : {}),
    ...(credentials !== undefined ? { credentials } : {}),
  })
  return {
    ...probe,
    sourceId: source.id,
  }
}

async function writeMcpToolIndex(
  projectRoot: string,
  sourceId: string,
  records: readonly HarborLocalToolIndexRecord[]
): Promise<void> {
  const { createRequire } = await import("node:module")
  const { harborLocalPaths } = await import("./index")
  const req = createRequire(import.meta.url)
  const Database = (() => {
    try {
      return (req("bun:sqlite") as { Database: new (filename: string) => { prepare: (sql: string) => { run: (...args: unknown[]) => unknown }; close: () => void } }).Database
    } catch {
      return (req("node:sqlite") as { DatabaseSync: new (filename: string) => { prepare: (sql: string) => { run: (...args: unknown[]) => unknown }; close: () => void } }).DatabaseSync
    }
  })()
  const db = new Database(harborLocalPaths(projectRoot).sqlite)
  const now = new Date().toISOString()
  try {
    db.prepare("DELETE FROM tool_index WHERE workspace_id = ? AND source_ref_id = ?").run("local", sourceId)
    const insert = db.prepare(`
      INSERT INTO tool_index
        (id, workspace_id, source_ref_id, namespace, name, display_name, description,
         input_schema_json, output_schema_json, search_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    for (const record of records) {
      insert.run(
        record.id,
        record.workspaceId,
        record.sourceRefId,
        record.namespace,
        record.name,
        record.displayName,
        record.description ?? null,
        record.inputSchema === undefined ? null : JSON.stringify(record.inputSchema),
        record.outputSchema === undefined ? null : JSON.stringify(record.outputSchema),
        record.searchText,
        now,
        now
      )
    }
  } finally {
    db.close()
  }
}

export async function createHarborLocalMcpToolRuntime(
  input: HarborLocalMcpToolRuntimeInput
): Promise<HarborLocalToolIndex> {
  return buildHarborLocalToolIndexFromSqlite(input.projectRoot, {
    callTool: async (call, tool) => {
      const source = await readHarborLocalMcpSource(input.projectRoot, tool.namespace)
      if (!source) throw new HarborLocalError({
        code: "local_mcp_source_unknown",
        message: `Unknown local MCP source for namespace "${tool.namespace}".`,
        details: { namespace: tool.namespace },
      })
      const binding = (await listHarborLocalMcpToolBindings(input.projectRoot, source.id))
        .find((candidate) => `${candidate.namespace}.${candidate.toolId}` === call.toolId)
      if (!binding) throw new HarborLocalError({
        code: "local_tool_unknown",
        message: `No MCP binding found for local tool "${call.toolId}".`,
        details: { toolId: call.toolId, sourceId: source.id },
      })
      const adapter = adapterForSource({ source, fetch: input.fetch, allowLocalNetwork: input.allowLocalNetwork })
      const credentials = await optionalCredentials({
        projectRoot: input.projectRoot,
        source,
        env: input.env,
        envName: input.envName,
        fetch: input.fetch,
      })
      return {
        toolId: call.toolId,
        output: await adapter.invokeTool(
          binding.toolName,
          call.input as Readonly<Record<string, unknown>>,
          credentials ? { credentials } : undefined
        ),
      }
    },
  })
}

export async function createHarborLocalMcpToolIndexFromBindings(
  projectRoot: string,
  sourceId: string
): Promise<HarborLocalToolIndex> {
  const source = await readHarborLocalMcpSource(projectRoot, sourceId)
  if (!source) throw new HarborLocalError({
    code: "local_mcp_source_unknown",
    message: `Unknown local MCP source "${sourceId}".`,
    details: { sourceId },
  })
  return createHarborLocalToolIndex(await searchableRecordsForSource(projectRoot, source))
}
