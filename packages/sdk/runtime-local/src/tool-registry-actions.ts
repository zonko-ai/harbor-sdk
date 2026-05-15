import {
  createHarborLocalMcpToolRuntime,
  type HarborLocalMcpToolRuntimeInput,
} from "./mcp-runtime"
import { HarborLocalError } from "./errors"
import { recordHarborLocalToolInvocation } from "./invocations"
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
  throw new HarborLocalError({
    code: "local_registry_action_invalid",
    message: "Final agent steps are not executable Harbor registry actions.",
    details: { action: step.action },
  })
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

function namespaceFromToolId(toolId: string): string {
  const index = toolId.indexOf(".")
  return index === -1 ? toolId : toolId.slice(0, index)
}

function errorPayload(error: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...("code" in error ? { code: (error as { readonly code?: unknown }).code } : {}),
      ...("details" in error ? { details: (error as { readonly details?: unknown }).details } : {}),
    }
  }
  return error
}

async function recordInvocation(input: HarborLocalRegistryActionInput, invocation: {
  readonly toolId: string
  readonly input: unknown
  readonly output?: unknown
  readonly error?: unknown
  readonly ok: boolean
  readonly durationMs: number
}): Promise<void> {
  await recordHarborLocalToolInvocation({
    projectRoot: input.projectRoot,
    invocation: {
      sourceRefId: namespaceFromToolId(invocation.toolId),
      namespace: namespaceFromToolId(invocation.toolId),
      toolId: invocation.toolId,
      input: invocation.input,
      ...(invocation.output !== undefined ? { output: invocation.output } : {}),
      ...(invocation.error !== undefined ? { error: invocation.error } : {}),
      ok: invocation.ok,
      durationMs: invocation.durationMs,
    },
  })
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
  const invokeInput = normalizeInvokeInput(input.action.input)
  const startedAt = Date.now()
  if (
    isWriteTool({ toolId: input.action.toolId, tool }) &&
    input.confirmWrites !== true
  ) {
    const reason =
      input.writeBlockedReason ??
      "Write tool blocked. Pass confirmWrites: true to allow this local tool invocation."
    await recordInvocation(input, {
      toolId: input.action.toolId,
      input: invokeInput,
      error: { code: "local_write_confirmation_required", message: reason },
      ok: false,
      durationMs: Date.now() - startedAt,
    })
    return {
      kind: "invoke",
      blocked: true,
      toolId: input.action.toolId,
      reason,
    }
  }

  try {
    const result = await runtime.call({
      toolId: input.action.toolId,
      input: invokeInput,
    })
    await recordInvocation(input, {
      toolId: input.action.toolId,
      input: invokeInput,
      output: result.output,
      ok: true,
      durationMs: Date.now() - startedAt,
    })
    return {
      kind: "invoke",
      blocked: false,
      result,
    }
  } catch (error) {
    await recordInvocation(input, {
      toolId: input.action.toolId,
      input: invokeInput,
      error: errorPayload(error),
      ok: false,
      durationMs: Date.now() - startedAt,
    })
    throw error
  }
}
