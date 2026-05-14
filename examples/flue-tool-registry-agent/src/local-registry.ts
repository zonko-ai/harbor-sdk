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

function pageInputFromLinear(linearCall: HarborLocalToolCallResult, prompt: string): Record<string, unknown> {
  const output = linearCall.output as { structuredContent?: { issues?: unknown } } | undefined
  return {
    parent: { type: "workspace" },
    pages: [{
      title: "Linear ticket summary",
      properties: {
        source: "Harbor SDK Flue local E2E",
        prompt,
      },
      content: {
        type: "linear_issues",
        issues: output?.structuredContent?.issues ?? linearCall.output,
      },
    }],
  }
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
  const notionCall = confirmed
    ? await index.call({
        toolId: notionWrite.hit.toolId,
        input: pageInputFromLinear(linearCall, input.prompt),
      })
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
      confirmationRequired: true,
      confirmed,
      call: notionCall,
    },
  }
}

export async function loadLocalRegistryPreview(input: LocalRegistryPreviewInput): Promise<LocalRegistryPreview> {
  return runLinearToNotionE2E(input)
}
