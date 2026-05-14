import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  connectHarborLocalMcpOAuthSource,
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  importHarborLocalCredentialsFromEnv,
  readHarborLocalOAuthStatus,
  refreshHarborLocalMcpSource,
  upsertHarborLocalMcpSource,
  type HarborLocalMcpOAuthDiscovery,
} from "@hrbr/runtime-local"
import { flueLinearNotionFixtureFetch } from "./fixture-mcp"

type SourceSlug = "linear-mcp" | "notion-mcp"

interface McpCatalogEntry {
  readonly slug: SourceSlug
  readonly display_name: string
  readonly config: {
    readonly mcp_endpoint: string
    readonly oauth_discovery: {
      readonly authorization_endpoint: string
      readonly token_endpoint: string
      readonly registration_endpoint?: string | undefined
      readonly scopes_supported: readonly string[]
      readonly resource?: string | undefined
    }
  }
  readonly default_namespace: SourceSlug
}

export interface SetupFlueLinearNotionE2EInput {
  readonly projectRoot?: string | undefined
  readonly liveOAuth?: boolean | undefined
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
}

export interface SetupFlueLinearNotionE2EResult {
  readonly projectRoot: string
  readonly mode: "fixture" | "live-oauth"
  readonly sources: readonly {
    readonly slug: SourceSlug
    readonly namespace: SourceSlug
    readonly endpoint: string
    readonly refreshedToolCount: number
  }[]
}

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceSlugs: readonly SourceSlug[] = ["linear-mcp", "notion-mcp"]

function envFor(input: SetupFlueLinearNotionE2EInput): Readonly<Record<string, string | undefined>> {
  return input.env ?? process.env
}

function requireCredentialKey(env: Readonly<Record<string, string | undefined>>): void {
  if (!env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV]) {
    throw new Error(`${HARBOR_LOCAL_CREDENTIAL_KEY_ENV}=dev-key is required so local OAuth tokens can be encrypted.`)
  }
}

function entryFor(slug: SourceSlug): McpCatalogEntry {
  return REGISTRY_CATALOG_ENTRY_BY_SLUG[slug] as McpCatalogEntry
}

function discoveryFor(entry: McpCatalogEntry): HarborLocalMcpOAuthDiscovery {
  return {
    authorizationEndpoint: entry.config.oauth_discovery.authorization_endpoint,
    tokenEndpoint: entry.config.oauth_discovery.token_endpoint,
    registrationEndpoint: entry.config.oauth_discovery.registration_endpoint,
    scopes: entry.config.oauth_discovery.scopes_supported,
    resource: entry.config.oauth_discovery.resource,
  }
}

async function connectLiveOAuth(input: {
  readonly projectRoot: string
  readonly entry: McpCatalogEntry
  readonly env: Readonly<Record<string, string | undefined>>
}): Promise<void> {
  const status = await readHarborLocalOAuthStatus(input.projectRoot, input.entry.default_namespace)
  if (status.status === "ready") return

  const connect = await connectHarborLocalMcpOAuthSource({
    projectRoot: input.projectRoot,
    sourceId: input.entry.default_namespace,
    discovery: discoveryFor(input.entry),
    clientName: `Harbor SDK Local ${input.entry.display_name}`,
    env: input.env,
  })
  try {
    console.log(`Open this URL to connect ${input.entry.display_name}:\n${connect.authorizationUrl}\n`)
    await connect.waitForReady()
  } finally {
    await connect.close()
  }
}

async function installSource(input: {
  readonly projectRoot: string
  readonly entry: McpCatalogEntry
}): Promise<void> {
  await upsertHarborLocalMcpSource({
    projectRoot: input.projectRoot,
    source: {
      transport: "remote",
      name: input.entry.display_name,
      namespace: input.entry.default_namespace,
      endpoint: input.entry.config.mcp_endpoint,
      remoteTransport: "auto",
      auth: { kind: "oauth2" },
    },
  })
}

async function importFixtureCredential(input: {
  readonly projectRoot: string
  readonly sourceId: SourceSlug
  readonly env: Readonly<Record<string, string | undefined>>
}): Promise<void> {
  await importHarborLocalCredentialsFromEnv(input.projectRoot, {
    sourceRefId: input.sourceId,
    slots: { access_token: "HARBOR_FIXTURE_MCP_ACCESS_TOKEN" },
    env: {
      ...input.env,
      HARBOR_FIXTURE_MCP_ACCESS_TOKEN: "fixture-access-token",
    },
    key: input.env[HARBOR_LOCAL_CREDENTIAL_KEY_ENV] ?? "",
  })
}

export async function setupFlueLinearNotionE2E(
  input: SetupFlueLinearNotionE2EInput = {}
): Promise<SetupFlueLinearNotionE2EResult> {
  const env = envFor(input)
  requireCredentialKey(env)
  const projectRoot = input.projectRoot ?? exampleRoot
  const liveOAuth = input.liveOAuth === true
  const sources: Array<SetupFlueLinearNotionE2EResult["sources"][number]> = []

  for (const slug of sourceSlugs) {
    const entry = entryFor(slug)
    await installSource({ projectRoot, entry })
    if (liveOAuth) {
      await connectLiveOAuth({ projectRoot, entry, env })
    } else {
      await importFixtureCredential({ projectRoot, sourceId: entry.default_namespace, env })
    }
    const refresh = await refreshHarborLocalMcpSource({
      projectRoot,
      sourceId: entry.default_namespace,
      env,
      ...(liveOAuth ? {} : { fetch: flueLinearNotionFixtureFetch }),
    })
    sources.push({
      slug,
      namespace: entry.default_namespace,
      endpoint: entry.config.mcp_endpoint,
      refreshedToolCount: refresh.toolCount,
    })
  }

  return {
    projectRoot,
    mode: liveOAuth ? "live-oauth" : "fixture",
    sources,
  }
}

if (import.meta.main) {
  const result = await setupFlueLinearNotionE2E({
    liveOAuth: process.env.HARBOR_MCP_LIVE_OAUTH === "1",
  })
  console.log(JSON.stringify(result, null, 2))
}
