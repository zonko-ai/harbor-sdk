import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { REGISTRY_CATALOG_ENTRY_BY_SLUG } from "@hrbr/registry-catalog"
import {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalMcpPluginRuntime,
  type HarborLocalToolCallResult,
} from "@hrbr/runtime-local"

type McpSource = "linear-mcp" | "notion-mcp"

interface McpRegistryEntry {
  readonly slug: McpSource
  readonly display_name: string
  readonly kind: "mcp"
  readonly config: {
    readonly mcp_endpoint: string
  }
  readonly default_namespace: McpSource
}

export interface LocalRegistryPreviewInput {
  readonly prompt: string
  readonly linearRoot?: string | undefined
  readonly notionRoot?: string | undefined
  readonly invokeProvider?: boolean | undefined
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
}

export interface LocalRegistryPreview {
  readonly source: McpSource
  readonly projectRoot: string
  readonly providerInvokeEnabled: boolean
  readonly hits: readonly {
    readonly toolId: string
    readonly displayName: string
    readonly score: number
  }[]
  readonly schema: unknown
  readonly localCall: HarborLocalToolCallResult
}

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function chooseSource(prompt: string): McpSource {
  return /notion|doc|page|workspace/i.test(prompt) ? "notion-mcp" : "linear-mcp"
}

function defaultRoot(source: McpSource): string {
  return source === "linear-mcp" ? "../plugin-linear-mcp-local" : "../plugin-notion-mcp-local"
}

function safeReadTool(source: McpSource): string {
  return source === "linear-mcp" ? "linear-mcp.list_issues" : "notion-mcp.notion-search"
}

function registryPlugin(source: McpSource) {
  const entry = REGISTRY_CATALOG_ENTRY_BY_SLUG[source] as McpRegistryEntry
  return {
    slug: entry.slug,
    namespace: entry.default_namespace,
    displayName: entry.display_name,
    endpoint: entry.config.mcp_endpoint,
    auth: source === "linear-mcp"
      ? { method: "bearer" as const, envName: "LINEAR_MCP_ACCESS_TOKEN" }
      : { method: "oauth2" as const },
  }
}

export async function loadLocalRegistryPreview(input: LocalRegistryPreviewInput): Promise<LocalRegistryPreview> {
  const source = chooseSource(input.prompt)
  const configuredRoot = source === "linear-mcp" ? input.linearRoot : input.notionRoot
  const projectRoot = resolve(exampleRoot, configuredRoot ?? defaultRoot(source))
  const runtime = input.invokeProvider
    ? await createHarborLocalMcpPluginRuntime({
        projectRoot,
        plugin: registryPlugin(source),
        env: input.env,
      })
    : undefined
  const index = runtime?.index ?? await buildHarborLocalToolIndexFromSqlite(projectRoot, {
    callTool: async (call, tool) => ({
      toolId: call.toolId,
      output: {
        dispatchedBy: "harbor-sdk-local-runtime",
        sourceRefId: tool.namespace,
        tool: tool.name,
        input: call.input,
        note: "Set HARBOR_INVOKE_PROVIDER=1 after connecting credentials to dispatch through the SDK local MCP runtime.",
      },
    }),
  })
  const hits = index.search({ query: input.prompt, namespace: source, limit: 5 })
  const toolId = hits[0]?.toolId ?? safeReadTool(source)
  const schema = index.schema(toolId)
  const localCall = await index.call({
    toolId,
    input: source === "linear-mcp"
      ? { assignee: "me", limit: 5 }
      : { query: input.prompt, filters: {} },
  })
  return {
    source,
    projectRoot,
    providerInvokeEnabled: input.invokeProvider === true,
    hits: hits.map((hit) => ({
      toolId: hit.toolId,
      displayName: hit.displayName,
      score: hit.score,
    })),
    schema,
    localCall,
  }
}
