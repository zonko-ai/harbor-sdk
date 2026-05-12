import quickJSNgVariant from "@jitl/quickjs-ng-wasmfile-release-sync"
import {
  newQuickJSWASMModuleFromVariant,
  shouldInterruptAfterDeadline,
  type QuickJSWASMModule,
} from "quickjs-emscripten-core"

export interface HarborLocalQuickJSExecutionInput {
  readonly code: string
  readonly filename?: string | undefined
  readonly input?: unknown
  readonly timeoutMs?: number | undefined
  readonly memoryLimitBytes?: number | undefined
  readonly stackSizeBytes?: number | undefined
}

export interface HarborLocalQuickJSExecutionResult {
  readonly ok: true
  readonly value: unknown
}

const DEFAULT_TIMEOUT_MS = 1_000
const DEFAULT_MEMORY_LIMIT_BYTES = 64 * 1024 * 1024
const DEFAULT_STACK_SIZE_BYTES = 1024 * 1024

let quickJSModule: Promise<QuickJSWASMModule> | undefined

function getQuickJSModule(): Promise<QuickJSWASMModule> {
  quickJSModule ??= newQuickJSWASMModuleFromVariant(quickJSNgVariant)
  return quickJSModule
}

function validateBundledCode(code: string): void {
  if (/^\s*import\s/m.test(code) || /\bimport\s*\(/.test(code) || /^\s*export\s/m.test(code)) {
    throw new Error("QuickJS local execution only accepts bundled JavaScript without import/export")
  }
}

export async function runHarborLocalQuickJS(
  input: HarborLocalQuickJSExecutionInput
): Promise<HarborLocalQuickJSExecutionResult> {
  validateBundledCode(input.code)

  const QuickJS = await getQuickJSModule()
  const runtime = QuickJS.newRuntime()
  runtime.setMemoryLimit(input.memoryLimitBytes ?? DEFAULT_MEMORY_LIMIT_BYTES)
  runtime.setMaxStackSize(input.stackSizeBytes ?? DEFAULT_STACK_SIZE_BYTES)
  runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + (input.timeoutMs ?? DEFAULT_TIMEOUT_MS)))

  const context = runtime.newContext()
  try {
    const injectedInput = context.evalCode(
      `globalThis.__harborInput = ${JSON.stringify(input.input ?? null)};`,
      "<harbor-input>"
    )
    context.unwrapResult(injectedInput).dispose()

    const result = context.evalCode(input.code, input.filename ?? "<harbor-bundle>")
    const handle = context.unwrapResult(result)
    try {
      return { ok: true, value: context.dump(handle) }
    } finally {
      handle.dispose()
    }
  } finally {
    context.dispose()
    runtime.dispose()
  }
}
