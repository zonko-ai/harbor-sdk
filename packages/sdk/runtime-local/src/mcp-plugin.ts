import { createMcpHttpSourceAdapter, type McpSourceFetch } from "@hrbr/source-mcp"
import { importHarborLocalCredentialsFromEnvKey } from "./credentials"
import { generateHarborLocalPluginPackageManifest } from "./package-format"
import {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalCredentialResolverFromEnv,
  installHarborLocalPluginManifest,
  type HarborLocalCredentialResolverFromEnvInput,
  type HarborLocalPluginInstallResult,
  type HarborLocalResolvedCredentials,
} from "./plugin-store"
import type { HarborLocalToolIndex, HarborLocalToolIndexRecord } from "./tool-search"

export type HarborLocalMcpPluginAuth =
  | { readonly method: "none" }
  | {
      readonly method: "bearer"
      readonly credentialSlot?: string | undefined
      readonly envName?: string | undefined
      readonly required?: boolean | undefined
    }
  | {
      readonly method: "oauth2"
      readonly credentialSlot?: string | undefined
      readonly required?: boolean | undefined
    }

export interface HarborLocalMcpPluginDefinition {
  readonly slug: string
  readonly namespace: string
  readonly displayName: string
  readonly endpoint: string
  readonly description?: string | undefined
  readonly auth: HarborLocalMcpPluginAuth
  readonly sourcePath?: string | undefined
  readonly protocolVersion?: string | undefined
}

export interface HarborLocalMcpPluginRuntimeInput extends HarborLocalCredentialResolverFromEnvInput {
  readonly projectRoot: string
  readonly plugin: HarborLocalMcpPluginDefinition
  readonly fetch?: McpSourceFetch | undefined
}

export interface HarborLocalMcpPluginRuntime {
  readonly sourceRefId: string
  readonly index: HarborLocalToolIndex
  readonly credentials?: HarborLocalResolvedCredentials | undefined
}

function sourceRefId(plugin: HarborLocalMcpPluginDefinition): string {
  return `source:${plugin.slug}:${plugin.namespace}`
}

function credentialSlot(auth: HarborLocalMcpPluginAuth): string | undefined {
  if (auth.method === "none") return undefined
  return auth.credentialSlot ?? "access_token"
}

function titleFromToolName(name: string): string {
  return name
    .split(/[_-]+/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function recordsFromTools(
  plugin: HarborLocalMcpPluginDefinition,
  tools: Awaited<ReturnType<ReturnType<typeof createMcpHttpSourceAdapter>["listTools"]>>
): readonly HarborLocalToolIndexRecord[] {
  const sourceRef = sourceRefId(plugin)
  return tools.map((tool) => ({
    id: `tool:${sourceRef}:${tool.name}`,
    workspaceId: "local",
    sourceRefId: sourceRef,
    namespace: plugin.namespace,
    name: tool.name,
    displayName: tool.displayName ?? titleFromToolName(tool.name),
    ...(tool.description !== undefined ? { description: tool.description } : {}),
    ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
    ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema } : {}),
    searchText: [
      plugin.slug,
      plugin.namespace,
      tool.name,
      tool.displayName ?? "",
      tool.description ?? "",
    ].join(" "),
  }))
}

async function resolveCredentials(input: HarborLocalMcpPluginRuntimeInput): Promise<HarborLocalResolvedCredentials | undefined> {
  const slot = credentialSlot(input.plugin.auth)
  if (!slot) return undefined
  if (input.plugin.auth.method === "bearer" && input.plugin.auth.envName) {
    await importHarborLocalCredentialsFromEnvKey(input.projectRoot, {
      sourceRefId: sourceRefId(input.plugin),
      slots: { [slot]: input.plugin.auth.envName },
      env: input.env,
      envName: input.envName,
    })
  }
  const credentials = await createHarborLocalCredentialResolverFromEnv(input.projectRoot, {
    env: input.env,
    envName: input.envName,
  }).resolve({
    workspaceId: "local",
    sourceId: sourceRefId(input.plugin),
  })
  if ((input.plugin.auth.method === "bearer" || input.plugin.auth.method === "oauth2") && input.plugin.auth.required !== false) {
    credentials.require(slot)
  }
  return credentials
}

function createAdapter(input: HarborLocalMcpPluginRuntimeInput, credentials: HarborLocalResolvedCredentials | undefined) {
  const slot = credentialSlot(input.plugin.auth)
  return createMcpHttpSourceAdapter({
    id: input.plugin.slug,
    namespace: input.plugin.namespace,
    displayName: input.plugin.displayName,
    endpoint: input.plugin.endpoint,
    ...(input.plugin.protocolVersion !== undefined ? { protocolVersion: input.plugin.protocolVersion } : {}),
    ...(input.fetch !== undefined ? { fetch: input.fetch } : {}),
    ...(slot && credentials ? { bearerCredentialSlot: slot } : {}),
  })
}

export async function installHarborLocalMcpPlugin(
  input: HarborLocalMcpPluginRuntimeInput
): Promise<HarborLocalPluginInstallResult> {
  const credentials = await resolveCredentials(input)
  const adapter = createAdapter(input, credentials)
  const tools = recordsFromTools(input.plugin, await adapter.listTools(credentials ? { credentials } : undefined))
  const slot = credentialSlot(input.plugin.auth)
  const manifest = generateHarborLocalPluginPackageManifest({
    name: input.plugin.slug,
    version: "0.1.0",
    owner: { name: "Harbor SDK" },
    source: {
      kind: "local",
      path: input.plugin.sourcePath ?? `plugins/${input.plugin.slug}`,
    },
    tools,
    docs: { readme: "README.md" },
    auth: slot && input.plugin.auth.method !== "none"
      ? { required: input.plugin.auth.required !== false, slots: input.plugin.auth.method === "oauth2" ? [slot, "refresh_token"] : [slot] }
      : { required: false, slots: [] },
    scopes: input.plugin.auth.method === "none" ? [] : [`${input.plugin.slug}:read`],
    policies: [`confirm before calling ${input.plugin.namespace} create/update/delete tools`],
    tests: [],
    compatibility: { sdk: ">=0.0.0", runtimeLocal: ">=0.0.0" },
    changelog: [`Installed local MCP plugin ${input.plugin.slug}.`],
  })
  return installHarborLocalPluginManifest({ projectRoot: input.projectRoot, manifest })
}

export async function createHarborLocalMcpPluginRuntime(
  input: HarborLocalMcpPluginRuntimeInput
): Promise<HarborLocalMcpPluginRuntime> {
  const credentials = await resolveCredentials(input)
  const adapter = createAdapter(input, credentials)
  const index = await buildHarborLocalToolIndexFromSqlite(input.projectRoot, {
    callTool: async (call, tool) => ({
      toolId: call.toolId,
      output: await adapter.invokeTool(
        tool.name,
        call.input as Readonly<Record<string, unknown>>,
        credentials ? { credentials } : undefined
      ),
    }),
  })
  return {
    sourceRefId: sourceRefId(input.plugin),
    index,
    ...(credentials !== undefined ? { credentials } : {}),
  }
}
