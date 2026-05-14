import {
  createHarborLocalMcpToolRuntime,
  type HarborLocalMcpToolRuntimeInput,
} from "./mcp-runtime"
import * as v from "valibot"
import type {
  HarborLocalToolCallResult,
  HarborLocalToolDescription,
  HarborLocalToolSchema,
  HarborLocalToolSearchHit,
} from "./tool-search"

export type HarborLocalRegistryAction =
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

export const harborLocalRegistryActionSchema = v.variant("kind", [
  v.object({
    kind: v.literal("search"),
    query: v.string(),
    namespace: v.optional(v.string()),
    limit: v.optional(v.number()),
  }),
  v.object({
    kind: v.literal("schema"),
    toolId: v.string(),
  }),
  v.object({
    kind: v.literal("invoke"),
    toolId: v.string(),
    input: v.unknown(),
  }),
])

export const harborLocalRegistryAgentStepSchema = v.object({
  action: v.picklist(["search", "schema", "invoke", "final"]),
  query: v.optional(v.string()),
  namespace: v.optional(v.string()),
  limit: v.optional(v.number()),
  toolId: v.optional(v.string()),
  input: v.optional(v.unknown()),
  answer: v.optional(v.string()),
  selectedToolId: v.optional(v.nullable(v.string())),
  localRegistryCall: v.optional(v.unknown()),
})

export type HarborLocalRegistryAgentStep = v.InferOutput<typeof harborLocalRegistryAgentStepSchema>

export function harborLocalRegistryActionFromAgentStep(
  step: HarborLocalRegistryAgentStep
): HarborLocalRegistryAction {
  if (step.action === "search") {
    return {
      kind: "search",
      query: step.query ?? "",
      ...(step.namespace !== undefined ? { namespace: step.namespace } : {}),
      ...(step.limit !== undefined ? { limit: step.limit } : {}),
    }
  }
  if (step.action === "schema") return { kind: "schema", toolId: step.toolId ?? "" }
  if (step.action === "invoke") return { kind: "invoke", toolId: step.toolId ?? "", input: step.input ?? {} }
  throw new Error("Final agent steps are not executable Harbor registry actions.")
}

export interface HarborLocalRegistryWriteToolInput {
  readonly toolId: string
  readonly tool: HarborLocalToolDescription | null
}

export type HarborLocalRegistryWriteToolMatcher = (
  input: HarborLocalRegistryWriteToolInput
) => boolean

export interface HarborLocalRegistryActionInput extends HarborLocalMcpToolRuntimeInput {
  readonly action: HarborLocalRegistryAction
  readonly confirmWrites?: boolean | undefined
  readonly isWriteTool?: HarborLocalRegistryWriteToolMatcher | undefined
  readonly writeBlockedReason?: string | undefined
}

export type HarborLocalRegistryActionResult =
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

const WRITE_TOOL_PATTERN =
  /(?:^|[._-])(?:create|update|delete|remove|archive|move|duplicate|post|send|write|publish)(?:$|[._-])/i

export const harborLocalDefaultWriteToolMatcher: HarborLocalRegistryWriteToolMatcher = ({
  toolId,
  tool,
}) => WRITE_TOOL_PATTERN.test(toolId) || WRITE_TOOL_PATTERN.test(tool?.name ?? "")

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

export async function runHarborLocalRegistryAction(
  input: HarborLocalRegistryActionInput
): Promise<HarborLocalRegistryActionResult> {
  const runtime = await createHarborLocalMcpToolRuntime({
    projectRoot: input.projectRoot,
    env: input.env,
    envName: input.envName,
    allowLocalNetwork: input.allowLocalNetwork,
    ...(input.fetch ? { fetch: input.fetch } : {}),
  })

  if (input.action.kind === "search") {
    return {
      kind: "search",
      hits: runtime.search({
        query: input.action.query,
        namespace: input.action.namespace,
        limit: input.action.limit,
      }),
    }
  }

  if (input.action.kind === "schema") {
    return {
      kind: "schema",
      schema: runtime.schema(input.action.toolId),
    }
  }

  const tool = runtime.describe(input.action.toolId)
  const isWriteTool = input.isWriteTool ?? harborLocalDefaultWriteToolMatcher
  if (
    isWriteTool({ toolId: input.action.toolId, tool }) &&
    input.confirmWrites !== true
  ) {
    return {
      kind: "invoke",
      blocked: true,
      toolId: input.action.toolId,
      reason:
        input.writeBlockedReason ??
        "Write tool blocked. Pass confirmWrites: true to allow this local tool invocation.",
    }
  }

  return {
    kind: "invoke",
    blocked: false,
    result: await runtime.call({
      toolId: input.action.toolId,
      input: normalizeInvokeInput(input.action.input),
    }),
  }
}
