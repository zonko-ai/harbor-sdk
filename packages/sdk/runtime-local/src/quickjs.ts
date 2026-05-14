import quickJSNgVariant from "@jitl/quickjs-ng-wasmfile-release-sync"
import {
  newQuickJSWASMModuleFromVariant,
  shouldInterruptAfterDeadline,
  type QuickJSContext,
  type QuickJSHandle,
  type QuickJSRuntime,
  type QuickJSWASMModule,
} from "quickjs-emscripten-core"

export interface HarborLocalQuickJSExecutionInput {
  readonly code: string
  readonly filename?: string | undefined
  readonly input?: unknown
  readonly hostCall?: HarborLocalQuickJSHostCallHandler | undefined
  readonly namespaceBindings?: readonly HarborLocalQuickJSNamespaceBinding[] | undefined
  readonly timeoutMs?: number | undefined
  readonly memoryLimitBytes?: number | undefined
  readonly stackSizeBytes?: number | undefined
}

export interface HarborLocalQuickJSExecutionResult {
  readonly ok: true
  readonly value: unknown
}

export interface HarborLocalQuickJSNamespaceBinding {
  readonly alias: string
  readonly namespace: string
}

export type HarborLocalQuickJSHostCallName =
  | "tools.namespaceCall"
  | "tools.call"
  | "logs.emit"
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
) => unknown | Promise<unknown>

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
globalThis.console = Object.freeze({
  log: (...args) => globalThis.__harborHostCall("logs.emit", JSON.stringify({ level: "log", args })),
  warn: (...args) => globalThis.__harborHostCall("logs.emit", JSON.stringify({ level: "warn", args })),
  error: (...args) => globalThis.__harborHostCall("logs.emit", JSON.stringify({ level: "error", args })),
});
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

function namespaceBootstrap(bindings: readonly HarborLocalQuickJSNamespaceBinding[]): string {
  const lines = [
    `async function __harborNamespaceCall(namespace, tool, input) {`,
    `  return JSON.parse(await globalThis.__harborHostCallAsync("tools.namespaceCall", JSON.stringify({ namespace, tool, input })));`,
    `}`,
  ]
  for (const binding of bindings) {
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(binding.alias)) {
      throw new Error(`Invalid QuickJS namespace alias: ${binding.alias}`)
    }
    lines.push(
      `const ${binding.alias} = new Proxy({}, { get: (_, tool) => (input = {}) => __harborNamespaceCall(${JSON.stringify(binding.namespace)}, String(tool), input) });`
    )
  }
  return lines.join("\n")
}

async function waitForQuickJSValue(
  runtime: QuickJSRuntime,
  context: QuickJSContext,
  handle: QuickJSHandle
): Promise<unknown> {
  const state = context.getPromiseState(handle)
  if (state.type === "fulfilled") return context.dump(state.value)
  if (state.type === "rejected") {
    try {
      throw context.dump(state.error)
    } finally {
      state.error.dispose()
    }
  }

  let settled:
    | { readonly result: Awaited<ReturnType<typeof context.resolvePromise>> }
    | { readonly error: unknown }
    | undefined
  void context.resolvePromise(handle)
    .then((result) => {
      settled = { result }
    })
    .catch((error) => {
      settled = { error }
    })

  while (!settled) {
    context.unwrapResult(runtime.executePendingJobs())
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
  if ("error" in settled) throw settled.error
  const resolved = context.unwrapResult(settled.result)
  try {
    return context.dump(resolved)
  } finally {
    resolved.dispose()
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
    const hostCall = context.newFunction("__harborHostCall", (nameHandle, payloadHandle) => {
      const name = context.getString(nameHandle) as HarborLocalQuickJSHostCallName
      const payload = JSON.parse(context.getString(payloadHandle)) as unknown
      if (!input.hostCall) {
        if (name === "logs.emit") return context.newString("null")
        throw new Error(`Host call is not configured: ${name}`)
      }
      const result = input.hostCall(name, payload)
      if (result && typeof result === "object" && "then" in result) {
        if (name === "logs.emit") return context.newString("null")
        throw new Error(`Host call is async-only: ${name}`)
      }
      return context.newString(JSON.stringify(result ?? null))
    })
    context.setProp(context.global, "__harborHostCall", hostCall)
    hostCall.dispose()

    const asyncHostCall = context.newFunction("__harborHostCallAsync", (nameHandle, payloadHandle) => {
      const name = context.getString(nameHandle) as HarborLocalQuickJSHostCallName
      const payload = JSON.parse(context.getString(payloadHandle)) as unknown
      if (!input.hostCall) throw new Error(`Host call is not configured: ${name}`)
      const deferred = context.newPromise(Promise.resolve(input.hostCall(name, payload))
        .then((value) => context.newString(JSON.stringify(value ?? null)))
        .catch((error) => {
          throw error instanceof Error ? error : new Error(String(error))
        }))
      void deferred.settled.then(() => deferred.dispose())
      return deferred.handle
    })
    context.setProp(context.global, "__harborHostCallAsync", asyncHostCall)
    asyncHostCall.dispose()

    const bootstrap = context.evalCode(HARBOR_HOST_BOOTSTRAP, "<harbor-host>")
    context.unwrapResult(bootstrap).dispose()

    if (input.namespaceBindings && input.namespaceBindings.length > 0) {
      const namespaces = context.evalCode(namespaceBootstrap(input.namespaceBindings), "<harbor-namespaces>")
      context.unwrapResult(namespaces).dispose()
    }

    const injectedInput = context.evalCode(
      `globalThis.__harborInput = ${JSON.stringify(input.input ?? null)};`,
      "<harbor-input>"
    )
    context.unwrapResult(injectedInput).dispose()

    const result = context.evalCode(input.code, input.filename ?? "<harbor-bundle>")
    const handle = context.unwrapResult(result)
    try {
      return { ok: true, value: await waitForQuickJSValue(runtime, context, handle) }
    } finally {
      handle.dispose()
    }
  } finally {
    context.dispose()
    runtime.dispose()
  }
}
