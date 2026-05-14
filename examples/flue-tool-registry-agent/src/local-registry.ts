import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  buildHarborLocalToolIndexFromSqlite,
  type HarborLocalToolCallResult,
} from "@hrbr/runtime-local"

export interface LocalRegistryPreviewInput {
  readonly prompt: string
  readonly linearRoot?: string | undefined
  readonly notionRoot?: string | undefined
}

export interface LocalRegistryPreview {
  readonly source: "linear-mcp" | "notion-mcp"
  readonly projectRoot: string
  readonly hits: readonly {
    readonly toolId: string
    readonly displayName: string
    readonly score: number
  }[]
  readonly schema: unknown
  readonly localCall: HarborLocalToolCallResult
}

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function chooseSource(prompt: string): "linear-mcp" | "notion-mcp" {
  return /notion|doc|page|workspace/i.test(prompt) ? "notion-mcp" : "linear-mcp"
}

function defaultRoot(source: "linear-mcp" | "notion-mcp"): string {
  return source === "linear-mcp" ? "../plugin-linear-mcp-local" : "../plugin-notion-mcp-local"
}

function safeReadTool(source: "linear-mcp" | "notion-mcp"): string {
  return source === "linear-mcp" ? "linear-mcp.list_issues" : "notion-mcp.notion-search"
}

export async function loadLocalRegistryPreview(input: LocalRegistryPreviewInput): Promise<LocalRegistryPreview> {
  const source = chooseSource(input.prompt)
  const configuredRoot = source === "linear-mcp" ? input.linearRoot : input.notionRoot
  const projectRoot = resolve(exampleRoot, configuredRoot ?? defaultRoot(source))
  const index = await buildHarborLocalToolIndexFromSqlite(projectRoot, {
    callTool: async (call, tool) => ({
      toolId: call.toolId,
      output: {
        dispatchedBy: "harbor-sdk-local-runtime",
        sourceRefId: tool.namespace,
        tool: tool.name,
        input: call.input,
        note: "The Flue starter loads tool metadata from the local Harbor runtime. Provider-backed invocation stays in the installed plugin adapter.",
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
    hits: hits.map((hit) => ({
      toolId: hit.toolId,
      displayName: hit.displayName,
      score: hit.score,
    })),
    schema,
    localCall,
  }
}
