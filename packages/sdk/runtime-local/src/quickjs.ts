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
  readonly hostCall?: HarborLocalQuickJSHostCallHandler | undefined
  readonly timeoutMs?: number | undefined
  readonly memoryLimitBytes?: number | undefined
  readonly stackSizeBytes?: number | undefined
}

export interface HarborLocalQuickJSExecutionResult {
  readonly ok: true
  readonly value: unknown
}

export type HarborLocalQuickJSHostCallName =
  | "tools.call"
  | "storage.get"
  | "storage.set"
  | "cache.get"
  | "cache.set"
  | "db.query"
  | "artifacts.write"
  | "traces.emit"

export type HarborLocalQuickJSHostCallHandler = (
  name: HarborLocalQuickJSHostCallName,
  payload: unknown
) => unknown

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

const HARBOR_HOST_BOOTSTRAP = `
globalThis.harbor = Object.freeze({
  tools: Object.freeze({
    call: (toolId, input) => JSON.parse(globalThis.__harborHostCall("tools.call", JSON.stringify({ toolId, input }))),
  }),
  storage: Object.freeze({
    get: (key) => JSON.parse(globalThis.__harborHostCall("storage.get", JSON.stringify({ key }))),
    set: (key, value) => JSON.parse(globalThis.__harborHostCall("storage.set", JSON.stringify({ key, value }))),
  }),
  cache: Object.freeze({
    get: (key) => JSON.parse(globalThis.__harborHostCall("cache.get", JSON.stringify({ key }))),
    set: (key, value) => JSON.parse(globalThis.__harborHostCall("cache.set", JSON.stringify({ key, value }))),
  }),
  db: Object.freeze({
    query: (statement, params) => JSON.parse(globalThis.__harborHostCall("db.query", JSON.stringify({ statement, params }))),
  }),
  artifacts: Object.freeze({
    write: (path, value) => JSON.parse(globalThis.__harborHostCall("artifacts.write", JSON.stringify({ path, value }))),
  }),
  traces: Object.freeze({
    emit: (event) => JSON.parse(globalThis.__harborHostCall("traces.emit", JSON.stringify({ event }))),
  }),
});
`

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
    const hostCall = context.newFunction("__harborHostCall", (nameHandle, payloadHandle) => {
      const name = context.getString(nameHandle) as HarborLocalQuickJSHostCallName
      const payload = JSON.parse(context.getString(payloadHandle)) as unknown
      if (!input.hostCall) throw new Error(`Host call is not configured: ${name}`)
      return context.newString(JSON.stringify(input.hostCall(name, payload) ?? null))
    })
    context.setProp(context.global, "__harborHostCall", hostCall)
    hostCall.dispose()

    const bootstrap = context.evalCode(HARBOR_HOST_BOOTSTRAP, "<harbor-host>")
    context.unwrapResult(bootstrap).dispose()

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
