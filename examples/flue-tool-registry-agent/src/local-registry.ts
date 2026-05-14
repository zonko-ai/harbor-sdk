import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  createHarborLocalMcpToolRuntime,
  type HarborLocalToolCallResult,
  type HarborLocalToolIndex,
  type HarborLocalToolSchema,
  type HarborLocalToolSearchHit,
} from "@hrbr/runtime-local"

type McpSource = "linear-mcp" | "notion-mcp"

export interface LinearToNotionE2EInput {
  readonly prompt: string
  readonly projectRoot?: string | undefined
  readonly confirmNotionWrite?: boolean | undefined
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly fetch?: typeof fetch | undefined
}

export interface SelectedTool {
  readonly query: string
  readonly hit: HarborLocalToolSearchHit
  readonly schema: HarborLocalToolSchema | null
}

export interface LinearToNotionE2EResult {
  readonly projectRoot: string
  readonly prompt: string
  readonly providerInvokeEnabled: true
  readonly linearRead: {
    readonly selected: SelectedTool
    readonly call: HarborLocalToolCallResult
  }
  readonly notionWrite: {
    readonly selected: SelectedTool
    readonly parentPageId: string | null
    readonly confirmationRequired: boolean
    readonly confirmed: boolean
    readonly call: HarborLocalToolCallResult | null
  }
}

export type LocalRegistryPreview = LinearToNotionE2EResult
export type LocalRegistryPreviewInput = LinearToNotionE2EInput

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function firstSearchHit(
  index: HarborLocalToolIndex,
  namespace: McpSource,
  query: string
): SelectedTool {
  const hit = index.search({ query, namespace, limit: 5 })[0]
  if (!hit) {
    throw new Error(`No local MCP tool matched "${query}" in namespace "${namespace}". Run setup:e2e first.`)
  }
  return {
    query,
    hit,
    schema: index.schema(hit.toolId),
  }
}

function envValue(env: Readonly<Record<string, string | undefined>> | undefined, key: string): string | undefined {
  const value = env?.[key]
  return typeof value === "string" && value.trim() ? value.trim() : undefined
}

function textFromOutput(output: unknown): string {
  if (typeof output === "string") return output
  if (output && typeof output === "object" && "content" in output) {
    const content = (output as { content?: unknown }).content
    if (Array.isArray(content)) {
      return content
        .map((item) => item && typeof item === "object" && "text" in item ? String((item as { text?: unknown }).text ?? "") : "")
        .filter(Boolean)
        .join("\n")
    }
  }
  return JSON.stringify(output, null, 2)
}

function markdownFromLinear(linearCall: HarborLocalToolCallResult, prompt: string): string {
  const output = linearCall.output as { structuredContent?: unknown } | undefined
  return [
    "## Request",
    prompt,
    "",
    "## Linear Result",
    "```json",
    JSON.stringify(output?.structuredContent ?? linearCall.output, null, 2),
    "```",
    "",
    "## Notes",
    textFromOutput(linearCall.output),
  ].join("\n")
}

function pageInputFromLinear(
  linearCall: HarborLocalToolCallResult,
  prompt: string,
  parentPageId: string
): Record<string, unknown> {
  return {
    parent: { page_id: parentPageId },
    pages: [{
      properties: { title: "Harbor Alpha Linear tickets - last 24 hours" },
      content: markdownFromLinear(linearCall, prompt),
    }],
  }
}

function parseNotionSearchResults(output: unknown): Array<{ id?: string; title?: string; type?: string }> {
  const structuredResults = output && typeof output === "object" && "structuredContent" in output
    ? (output as { structuredContent?: { results?: Array<{ id?: string; title?: string; type?: string }> } }).structuredContent?.results
    : undefined
  if (Array.isArray(structuredResults)) return structuredResults
  const content = output && typeof output === "object" && "content" in output
    ? (output as { content?: unknown }).content
    : undefined
  const text = Array.isArray(content)
    ? content
        .map((item) => item && typeof item === "object" && "text" in item ? String((item as { text?: unknown }).text ?? "") : "")
        .join("\n")
    : typeof output === "string"
      ? output
      : ""
  if (!text.trim()) return []
  try {
    const parsed = JSON.parse(text) as { results?: Array<{ id?: string; title?: string; type?: string }> }
    return parsed.results ?? []
  } catch {
    return []
  }
}

async function resolveNotionParentPageId(input: {
  readonly index: HarborLocalToolIndex
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
}): Promise<string | null> {
  const configured = envValue(input.env, "HARBOR_NOTION_PARENT_PAGE_ID")
  if (configured) return configured
  const search = await input.index.call({
    toolId: "notion-mcp.notion-search",
    input: {
      query: envValue(input.env, "HARBOR_NOTION_PARENT_QUERY") ?? "Harbor Alpha",
      filters: {},
      page_size: 5,
      max_highlight_length: 120,
    },
  })
  return parseNotionSearchResults(search.output).find((result) => result.type === "page" && result.id)?.id ?? null
}

export async function runLinearToNotionE2E(input: LinearToNotionE2EInput): Promise<LinearToNotionE2EResult> {
  const projectRoot = input.projectRoot ?? exampleRoot
  const index = await createHarborLocalMcpToolRuntime({
    projectRoot,
    env: input.env,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  })

  const linearRead = firstSearchHit(
    index,
    "linear-mcp",
    `${input.prompt} linear tickets issues assigned list`
  )
  const linearCall = await index.call({
    toolId: linearRead.hit.toolId,
    input: { assignee: "me", limit: 5 },
  })

  const notionWrite = firstSearchHit(
    index,
    "notion-mcp",
    `${input.prompt} notion create page save linear ticket summary`
  )
  const confirmed = input.confirmNotionWrite === true
  const parentPageId = confirmed
    ? await resolveNotionParentPageId({ index, env: input.env })
    : null
  const notionCall = confirmed
    ? parentPageId
      ? await index.call({
        toolId: notionWrite.hit.toolId,
        input: pageInputFromLinear(linearCall, input.prompt, parentPageId),
      })
      : {
          toolId: notionWrite.hit.toolId,
          output: {
            ok: false,
            error: "No Notion parent page found. Set HARBOR_NOTION_PARENT_PAGE_ID or HARBOR_NOTION_PARENT_QUERY.",
          },
        }
    : null

  return {
    projectRoot,
    prompt: input.prompt,
    providerInvokeEnabled: true,
    linearRead: {
      selected: linearRead,
      call: linearCall,
    },
    notionWrite: {
      selected: notionWrite,
      parentPageId,
      confirmationRequired: true,
      confirmed,
      call: notionCall,
    },
  }
}

export async function loadLocalRegistryPreview(input: LocalRegistryPreviewInput): Promise<LocalRegistryPreview> {
  return runLinearToNotionE2E(input)
}
