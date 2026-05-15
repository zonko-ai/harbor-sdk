import { createMcpHttpSourceAdapter, type McpSourceFetch } from "@hrbr/source-mcp"
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

export interface HarborLocalMcpToolRuntimeInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly fetch?: McpSourceFetch | undefined
  readonly allowLocalNetwork?: boolean | undefined
}

export interface HarborLocalMcpOAuthDiscovery {
  readonly authorizationEndpoint: string
  readonly tokenEndpoint: string
  readonly registrationEndpoint?: string | undefined
  readonly scopes?: readonly string[] | undefined
  readonly resource?: string | undefined
}

export interface HarborLocalMcpOAuthConnectInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly sourceId: string
  readonly discovery: HarborLocalMcpOAuthDiscovery
  readonly clientName?: string | undefined
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
        throw new Error(refresh.error ?? `OAuth reconnect is required for MCP source "${input.source.id}".`)
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
    throw new Error(`MCP source "${source.id}" is not a remote HTTP source.`)
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
  throw new Error(`Timed out waiting for OAuth callback for MCP source "${sourceId}".`)
}

export async function connectHarborLocalMcpOAuthSource(
  input: HarborLocalMcpOAuthConnectInput
): Promise<HarborLocalMcpOAuthConnectHandle> {
  const source = await readHarborLocalMcpSource(input.projectRoot, input.sourceId)
  if (!source) throw new Error(`Unknown local MCP source "${input.sourceId}".`)
  if (source.auth.kind !== "oauth2") {
    throw new Error(`MCP source "${input.sourceId}" is not configured for oauth2 auth.`)
  }

  let oauthClient: { clientId: string; clientSecret?: string | undefined } = {
    clientId: "local-public-client",
  }
  const daemon = await startHarborLocalDaemon({
    projectRoot: input.projectRoot,
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
  if (!source) throw new Error(`Unknown local MCP source "${input.sourceId}".`)
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
      if (!source) throw new Error(`Unknown local MCP source for namespace "${tool.namespace}".`)
      const binding = (await listHarborLocalMcpToolBindings(input.projectRoot, source.id))
        .find((candidate) => `${candidate.namespace}.${candidate.toolId}` === call.toolId)
      if (!binding) throw new Error(`No MCP binding found for local tool "${call.toolId}".`)
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
  if (!source) throw new Error(`Unknown local MCP source "${sourceId}".`)
  return createHarborLocalToolIndex(await searchableRecordsForSource(projectRoot, source))
}
