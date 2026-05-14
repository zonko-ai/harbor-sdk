import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import {
  createHarborLocalMcpToolRuntime,
  type HarborLocalToolCallResult,
  type HarborLocalToolSchema,
  type HarborLocalToolSearchHit,
} from "@hrbr/runtime-local"

export type RegistryAction =
  | {
      readonly kind: "search"
      readonly query: string
      readonly namespace?: string | undefined
      readonly limit?: number | undefined
    }
  | {
      readonly kind: "schema"
      readonly toolId: string
    }
  | {
      readonly kind: "invoke"
      readonly toolId: string
      readonly input: unknown
    }

export interface RegistryActionInput {
  readonly action: RegistryAction
  readonly projectRoot?: string | undefined
  readonly confirmWrites?: boolean | undefined
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly fetch?: typeof fetch | undefined
}

export type RegistryActionResult =
  | {
      readonly kind: "search"
      readonly hits: readonly HarborLocalToolSearchHit[]
    }
  | {
      readonly kind: "schema"
      readonly schema: HarborLocalToolSchema | null
    }
  | {
      readonly kind: "invoke"
      readonly blocked: false
      readonly result: HarborLocalToolCallResult
    }
  | {
      readonly kind: "invoke"
      readonly blocked: true
      readonly toolId: string
      readonly reason: string
    }

const exampleRoot = dirname(dirname(fileURLToPath(import.meta.url)))

function isWriteTool(toolId: string): boolean {
  return /(?:^|\.)notion-(?:create|update|delete|duplicate|move|archive)|(?:^|\.)notion-create-|(?:^|\.)notion-update-|(?:^|\.)notion-delete-/i.test(toolId)
}

function normalizeInvokeInput(input: unknown): unknown {
  if (typeof input !== "string") return input
  const trimmed = input.trim()
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return input
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return input
  }
}

export async function runRegistryAction(input: RegistryActionInput): Promise<RegistryActionResult> {
  const projectRoot = input.projectRoot ?? exampleRoot
  const index = await createHarborLocalMcpToolRuntime({
    projectRoot,
    env: input.env,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  })

  if (input.action.kind === "search") {
    return {
      kind: "search",
      hits: index.search({
        query: input.action.query,
        namespace: input.action.namespace,
        limit: input.action.limit,
      }),
    }
  }

  if (input.action.kind === "schema") {
    return {
      kind: "schema",
      schema: index.schema(input.action.toolId),
    }
  }

  if (isWriteTool(input.action.toolId) && input.confirmWrites !== true) {
    return {
      kind: "invoke",
      blocked: true,
      toolId: input.action.toolId,
      reason: "Write tool blocked. Set HARBOR_CONFIRM_NOTION_WRITE=1 to allow Notion write invocations.",
    }
  }

  return {
    kind: "invoke",
    blocked: false,
    result: await index.call({
      toolId: input.action.toolId,
      input: normalizeInvokeInput(input.action.input),
    }),
  }
}
