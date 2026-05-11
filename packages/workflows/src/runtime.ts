import type { SpanError, TraceWriter } from "@hrbr/runs"
import type { ToolInvocation, ToolInvokeInput, ToolInvocationClient } from "@hrbr/tools"

export type WorkflowDuration = number | string

export interface WorkflowRetryOptions {
  readonly maxAttempts?: number | undefined
  readonly delayMs?: number | undefined
}

export interface WorkflowStepDoOptions {
  readonly retries?: number | WorkflowRetryOptions | undefined
  readonly timeoutMs?: number | undefined
}

export interface WorkflowStepExecutionContext {
  readonly attempt: number
  readonly signal: AbortSignal
}

export type WorkflowStepHandler<T> = (ctx: WorkflowStepExecutionContext) => Promise<T> | T

export interface WorkflowWaitForEventOptions {
  readonly type: string
  readonly timeout?: WorkflowDuration | undefined
  readonly [key: string]: unknown
}

export interface WorkflowStepBackend {
  readonly sleep?: (name: string, duration: WorkflowDuration) => Promise<void> | void
  readonly sleepUntil?: (name: string, when: Date) => Promise<void> | void
  readonly waitForEvent?: (name: string, options: WorkflowWaitForEventOptions) => Promise<unknown>
}

export interface WorkflowStepRuntime {
  readonly do: {
    <T>(name: string, fn: WorkflowStepHandler<T>): Promise<T>
    <T>(name: string, options: WorkflowStepDoOptions, fn: WorkflowStepHandler<T>): Promise<T>
  }
  readonly sleep: (name: string, duration: WorkflowDuration) => Promise<void>
  readonly sleepUntil: (name: string, when: Date | number) => Promise<void>
  readonly waitForEvent: <T = unknown>(
    name: string,
    options: WorkflowWaitForEventOptions,
  ) => Promise<T>
}

export interface WorkflowToolCaller {
  readonly call: (
    toolId: string,
    input?: Readonly<Record<string, unknown>>,
  ) => Promise<ToolInvocation>
  readonly invoke: (
    input: Omit<ToolInvokeInput, "runId">,
  ) => Promise<ToolInvocation>
}

export interface WorkflowRuntimeContext<Input> {
  readonly input: Input
  readonly step: WorkflowStepRuntime
  readonly tools: WorkflowToolCaller
}

export interface DefineWorkflowInput<Input, Output> {
  readonly name: string
  readonly description?: string | undefined
  readonly run: (ctx: WorkflowRuntimeContext<Input>) => Promise<Output> | Output
}

export interface RunWorkflowInput<Input> {
  readonly input: Input
  readonly tools: ToolInvocationClient
  readonly stepBackend?: WorkflowStepBackend | undefined
  readonly traces?: TraceWriter | undefined
  readonly workspaceId?: string | undefined
  readonly agentId?: string | undefined
}

export interface RunWorkflowResult<Output> {
  readonly output: Output
  readonly runId?: string | undefined
}

function toSpanError(error: unknown): SpanError {
  if (error instanceof Error) return { message: error.message }
  return { message: String(error) }
}

function durationToMs(value: WorkflowDuration): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value)
  if (typeof value !== "string") return undefined
  const match = /^\s*(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|millis|seconds?|minutes?|hours?|days?)?\s*$/i.exec(value)
  if (!match) return undefined
  const amount = Number(match[1])
  const unit = (match[2] ?? "ms").toLowerCase()
  if (unit.startsWith("d")) return amount * 86_400_000
  if (unit.startsWith("h")) return amount * 3_600_000
  if (unit.startsWith("min") || unit === "m") return amount * 60_000
  if (unit.startsWith("s")) return amount * 1_000
  return amount
}

function normalizeRetries(retries: WorkflowStepDoOptions["retries"]): { maxAttempts: number; delayMs: number } {
  if (retries === undefined) return { maxAttempts: 1, delayMs: 0 }
  if (typeof retries === "number") return { maxAttempts: Math.max(1, Math.floor(retries) + 1), delayMs: 0 }
  return {
    maxAttempts: Math.max(1, Math.floor(retries.maxAttempts ?? 1)),
    delayMs: Math.max(0, retries.delayMs ?? 0),
  }
}

function wait(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve()
  return new Promise((resolve) => setTimeout(resolve, ms))
}

class WorkflowStepTimeoutError extends Error {
  constructor(name: string, timeoutMs: number) {
    super(`Workflow step "${name}" timed out after ${timeoutMs}ms.`)
    this.name = "WorkflowStepTimeoutError"
  }
}

async function withTimeout<T>(
  promise: Promise<T>,
  controller: AbortController,
  timeoutMs: number | undefined,
  name: string,
): Promise<T> {
  if (timeoutMs === undefined) return promise
  if (!Number.isFinite(timeoutMs) || timeoutMs < 0) throw new Error(`Invalid timeout for workflow step "${name}".`)
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort(new WorkflowStepTimeoutError(name, timeoutMs))
          reject(new WorkflowStepTimeoutError(name, timeoutMs))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const WORKFLOW_EVENT_TYPE_PATTERN = /^[a-zA-Z0-9_-]{1,100}$/

function validateWaitForEventOptions(options: WorkflowWaitForEventOptions): void {
  if (!WORKFLOW_EVENT_TYPE_PATTERN.test(options.type)) {
    throw new Error('step.waitForEvent options.type must match [a-zA-Z0-9_-]{1,100}. Dots and empty values are not allowed.')
  }
}

export function defineWorkflow<Input, Output>(
  workflow: DefineWorkflowInput<Input, Output>,
): DefineWorkflowInput<Input, Output> {
  return workflow
}

export async function runWorkflow<Input, Output>(
  workflow: DefineWorkflowInput<Input, Output>,
  input: RunWorkflowInput<Input>,
): Promise<RunWorkflowResult<Output>> {
  const run = input.traces
    ? await input.traces.startRun({
        workspaceId: input.workspaceId,
        agentId: input.agentId,
        trigger: `workflow:${workflow.name}`,
        input: input.input,
      })
    : null

  const step: WorkflowStepRuntime = {
    do: (async <T>(
      name: string,
      optionsOrFn: WorkflowStepDoOptions | WorkflowStepHandler<T>,
      maybeFn?: WorkflowStepHandler<T>,
    ): Promise<T> => {
      const options = typeof optionsOrFn === "function" ? {} : optionsOrFn
      const fn = typeof optionsOrFn === "function" ? optionsOrFn : maybeFn
      if (!fn) throw new Error(`Workflow step "${name}" is missing a handler.`)
      const retry = normalizeRetries(options.retries)
      const span = input.traces && run
        ? await input.traces.startSpan({
            runId: run.id,
            kind: "workflow.step",
            title: name,
            metadata: { workflow: workflow.name, retries: options.retries, timeout_ms: options.timeoutMs },
          })
        : null
      let attempt = 0
      let lastError: unknown
      while (attempt < retry.maxAttempts) {
        attempt += 1
        const controller = new AbortController()
        try {
          const result = await withTimeout(
            Promise.resolve().then(() => fn({ attempt, signal: controller.signal })),
            controller,
            options.timeoutMs,
            name,
          )
          if (input.traces && span) {
            await input.traces.finishSpan({ spanId: span.id, status: "success", output: result })
          }
          return result
        } catch (error) {
          lastError = error
          if (error instanceof WorkflowStepTimeoutError || attempt >= retry.maxAttempts) break
          if (input.traces && run) {
            const retrySpan = await input.traces.startSpan({
              runId: run.id,
              parentId: span?.id,
              kind: "retry",
              title: `Retry ${name}`,
              metadata: { workflow: workflow.name, step: name, attempt, max_attempts: retry.maxAttempts },
              input: { attempt, error: toSpanError(error) },
            })
            await input.traces.finishSpan({ spanId: retrySpan.id, status: "warning", error: toSpanError(error) })
          }
          await wait(retry.delayMs)
        }
      }
      if (input.traces && span) {
        await input.traces.finishSpan({ spanId: span.id, status: "error", error: toSpanError(lastError) })
      }
      throw lastError
    }) as WorkflowStepRuntime["do"],
    sleep: async (name, duration) => {
      const durationMs = durationToMs(duration)
      const span = input.traces && run
        ? await input.traces.startSpan({
            runId: run.id,
            kind: "workflow.sleep",
            title: name,
            input: { duration },
            metadata: { workflow: workflow.name, duration_ms: durationMs },
          })
        : null
      try {
        if (input.stepBackend?.sleep) await input.stepBackend.sleep(name, duration)
        else if (durationMs !== undefined) await wait(durationMs)
        else throw new Error(`Workflow sleep "${name}" has an unsupported duration.`)
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "success" })
      } catch (error) {
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "error", error: toSpanError(error) })
        throw error
      }
    },
    sleepUntil: async (name, when) => {
      const wakeAt = when instanceof Date ? when : new Date(when)
      if (Number.isNaN(wakeAt.getTime())) throw new Error(`Workflow sleepUntil "${name}" received an invalid date.`)
      const span = input.traces && run
        ? await input.traces.startSpan({
            runId: run.id,
            kind: "workflow.sleep",
            title: name,
            input: { wake_at: wakeAt.toISOString() },
            metadata: { workflow: workflow.name, wake_at: wakeAt.toISOString() },
          })
        : null
      try {
        if (input.stepBackend?.sleepUntil) await input.stepBackend.sleepUntil(name, wakeAt)
        else await wait(Math.max(0, wakeAt.getTime() - Date.now()))
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "success" })
      } catch (error) {
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "error", error: toSpanError(error) })
        throw error
      }
    },
    waitForEvent: async <T = unknown>(name: string, options: WorkflowWaitForEventOptions): Promise<T> => {
      validateWaitForEventOptions(options)
      const span = input.traces && run
        ? await input.traces.startSpan({
            runId: run.id,
            kind: "workflow.wait_event",
            title: name,
            input: options,
            metadata: { workflow: workflow.name, event_type: options.type, timeout: options.timeout },
          })
        : null
      try {
        if (!input.stepBackend?.waitForEvent) {
          throw new Error("Workflow waitForEvent requires a stepBackend.waitForEvent implementation.")
        }
        const result = await input.stepBackend.waitForEvent(name, options) as T
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "success", output: result })
        return result
      } catch (error) {
        if (input.traces && span) await input.traces.finishSpan({ spanId: span.id, status: "error", error: toSpanError(error) })
        throw error
      }
    },
  }

  const tools: WorkflowToolCaller = {
    call: (toolId, toolInput) =>
      input.tools.invoke({
        toolId,
        input: toolInput,
        agentId: input.agentId,
        ...(run ? { runId: run.id } : {}),
      }),
    invoke: (toolInput) =>
      input.tools.invoke({
        ...toolInput,
        agentId: toolInput.agentId ?? input.agentId,
        ...(run ? { runId: run.id } : {}),
      }),
  }

  try {
    const output = await workflow.run({ input: input.input, step, tools })
    if (input.traces && run) {
      await input.traces.finishRun({ runId: run.id, status: "completed", output })
    }
    return {
      output,
      ...(run ? { runId: run.id } : {}),
    }
  } catch (error) {
    if (input.traces && run) {
      await input.traces.finishRun({ runId: run.id, status: "failed", error: toSpanError(error) })
    }
    throw error
  }
}
