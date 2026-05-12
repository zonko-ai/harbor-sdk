import {
  runHarborLocalJob,
  validateHarborLocalJsonSchema,
  type HarborLocalJobDefinition,
  type HarborLocalJsonSchema,
} from "./jobs-apps"
import type { HarborLocalToolIndex } from "./tool-search"

export interface HarborLocalWorkflowJobStep {
  readonly id: string
  readonly kind: "job"
  readonly job: HarborLocalJobDefinition
  readonly input?: unknown
}

export interface HarborLocalWorkflowToolStep {
  readonly id: string
  readonly kind: "tool"
  readonly toolId: string
  readonly input?: unknown
}

export type HarborLocalWorkflowStep = HarborLocalWorkflowJobStep | HarborLocalWorkflowToolStep

export interface HarborLocalWorkflowDefinition {
  readonly id: string
  readonly title: string
  readonly description?: string | undefined
  readonly version?: string | undefined
  readonly inputSchema?: HarborLocalJsonSchema | undefined
  readonly outputSchema?: HarborLocalJsonSchema | undefined
  readonly requiredTools?: readonly string[] | undefined
  readonly requiredSources?: readonly string[] | undefined
  readonly steps: readonly HarborLocalWorkflowStep[]
}

export interface HarborLocalWorkflowRunInput {
  readonly workflow: HarborLocalWorkflowDefinition
  readonly input: unknown
  readonly tools: HarborLocalToolIndex
  readonly installedSourceRefIds?: readonly string[] | undefined
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalWorkflowStepResult {
  readonly stepId: string
  readonly kind: HarborLocalWorkflowStep["kind"]
  readonly output: unknown
}

export interface HarborLocalWorkflowRunResult {
  readonly workflowId: string
  readonly output: unknown
  readonly steps: readonly HarborLocalWorkflowStepResult[]
}

export interface HarborLocalWorkflowManifest {
  readonly id: string
  readonly title: string
  readonly description?: string | undefined
  readonly version?: string | undefined
  readonly requiredTools: readonly string[]
  readonly requiredSources: readonly string[]
  readonly inputSchema?: HarborLocalJsonSchema | undefined
  readonly outputSchema?: HarborLocalJsonSchema | undefined
  readonly steps: readonly Pick<HarborLocalWorkflowStep, "id" | "kind">[]
}

export interface HarborLocalWorkflowReplayFixture {
  readonly workflowId: string
  readonly input: unknown
  readonly output: unknown
  readonly steps: readonly HarborLocalWorkflowStepResult[]
}

export function validateHarborLocalWorkflowRequirements(input: {
  readonly workflow: HarborLocalWorkflowDefinition
  readonly tools: HarborLocalToolIndex
  readonly installedSourceRefIds?: readonly string[] | undefined
}): void {
  for (const toolId of input.workflow.requiredTools ?? []) {
    if (!input.tools.describe(toolId)) throw new Error(`Required workflow tool is missing: ${toolId}`)
  }
  const installed = new Set(input.installedSourceRefIds ?? [])
  for (const sourceRefId of input.workflow.requiredSources ?? []) {
    if (!installed.has(sourceRefId)) throw new Error(`Required workflow source is missing: ${sourceRefId}`)
  }
}

export async function runHarborLocalWorkflow(
  input: HarborLocalWorkflowRunInput
): Promise<HarborLocalWorkflowRunResult> {
  validateHarborLocalWorkflowRequirements(input)
  validateHarborLocalJsonSchema(input.workflow.inputSchema, input.input, "input")

  let current = input.input
  const steps: HarborLocalWorkflowStepResult[] = []
  for (const step of input.workflow.steps) {
    if (step.kind === "job") {
      const result = await runHarborLocalJob({
        job: step.job,
        input: step.input ?? current,
        now: input.now,
      })
      current = result.output
    } else {
      const result = await input.tools.call({
        toolId: step.toolId,
        input: step.input ?? current,
      })
      current = result.output
    }
    steps.push({ stepId: step.id, kind: step.kind, output: current })
  }

  validateHarborLocalJsonSchema(input.workflow.outputSchema, current, "output")
  return { workflowId: input.workflow.id, output: current, steps }
}

export function generateHarborLocalWorkflowManifest(
  workflow: HarborLocalWorkflowDefinition
): HarborLocalWorkflowManifest {
  return {
    id: workflow.id,
    title: workflow.title,
    ...(workflow.description !== undefined ? { description: workflow.description } : {}),
    ...(workflow.version !== undefined ? { version: workflow.version } : {}),
    requiredTools: workflow.requiredTools ?? [],
    requiredSources: workflow.requiredSources ?? [],
    ...(workflow.inputSchema !== undefined ? { inputSchema: workflow.inputSchema } : {}),
    ...(workflow.outputSchema !== undefined ? { outputSchema: workflow.outputSchema } : {}),
    steps: workflow.steps.map((step) => ({ id: step.id, kind: step.kind })),
  }
}

export function createHarborLocalWorkflowReplayFixture(input: {
  readonly workflowId: string
  readonly input: unknown
  readonly result: HarborLocalWorkflowRunResult
}): HarborLocalWorkflowReplayFixture {
  return {
    workflowId: input.workflowId,
    input: input.input,
    output: input.result.output,
    steps: input.result.steps,
  }
}
