import { runHarborLocalQuickJS, type HarborLocalQuickJSHostCallHandler } from "./quickjs"

export interface HarborLocalJsonSchema {
  readonly type?: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null"
  readonly required?: readonly string[] | undefined
  readonly properties?: Readonly<Record<string, HarborLocalJsonSchema>> | undefined
  readonly items?: HarborLocalJsonSchema | undefined
}

export interface HarborLocalJobDefinition {
  readonly id: string
  readonly code: string
  readonly inputSchema?: HarborLocalJsonSchema | undefined
  readonly outputSchema?: HarborLocalJsonSchema | undefined
  readonly timeoutMs?: number | undefined
}

export interface HarborLocalJobRunInput {
  readonly job: HarborLocalJobDefinition
  readonly input: unknown
  readonly now?: (() => Date) | undefined
  readonly hostCall?: HarborLocalQuickJSHostCallHandler | undefined
}

export interface HarborLocalTraceRecord {
  readonly id: string
  readonly kind: "job" | "app"
  readonly targetId: string
  readonly status: "ok" | "error"
  readonly startedAt: string
  readonly endedAt: string
}

export interface HarborLocalJobRunResult {
  readonly jobId: string
  readonly output: unknown
  readonly trace: HarborLocalTraceRecord
}

export interface HarborLocalAppRouteDefinition {
  readonly method?: string | undefined
  readonly path: string
  readonly code: string
}

export interface HarborLocalAppDefinition {
  readonly id: string
  readonly routes: readonly HarborLocalAppRouteDefinition[]
}

export interface HarborLocalAppRequest {
  readonly appId: string
  readonly method: string
  readonly path: string
  readonly query: Readonly<Record<string, string>>
  readonly body?: unknown
}

export interface HarborLocalAppResponse {
  readonly status: number
  readonly contentType: "application/json" | "text/html"
  readonly body: unknown
  readonly trace: HarborLocalTraceRecord
}

let traceCounter = 0

function nextTraceId(): string {
  traceCounter += 1
  return `local-trace-${traceCounter}`
}

function typeMatches(value: unknown, type: NonNullable<HarborLocalJsonSchema["type"]>): boolean {
  if (type === "array") return Array.isArray(value)
  if (type === "integer") return Number.isInteger(value)
  if (type === "null") return value === null
  return typeof value === type && !Array.isArray(value) && value !== null
}

export function validateHarborLocalJsonSchema(
  schema: HarborLocalJsonSchema | undefined,
  value: unknown,
  label = "value"
): void {
  if (!schema) return
  if (schema.type && !typeMatches(value, schema.type)) {
    throw new Error(`${label} must be ${schema.type}`)
  }
  if (schema.type === "object" && schema.required) {
    const object = value as Record<string, unknown>
    for (const field of schema.required) {
      if (!(field in object)) throw new Error(`${label}.${field} is required`)
    }
  }
  if (schema.type === "object" && schema.properties) {
    const object = value as Record<string, unknown>
    for (const [field, childSchema] of Object.entries(schema.properties)) {
      if (field in object) validateHarborLocalJsonSchema(childSchema, object[field], `${label}.${field}`)
    }
  }
  if (schema.type === "array" && schema.items && Array.isArray(value)) {
    value.forEach((item, index) => validateHarborLocalJsonSchema(schema.items, item, `${label}[${index}]`))
  }
}

function trace(
  kind: HarborLocalTraceRecord["kind"],
  targetId: string,
  status: HarborLocalTraceRecord["status"],
  startedAt: string,
  now: () => Date
): HarborLocalTraceRecord {
  return {
    id: nextTraceId(),
    kind,
    targetId,
    status,
    startedAt,
    endedAt: now().toISOString(),
  }
}

export async function runHarborLocalJob(input: HarborLocalJobRunInput): Promise<HarborLocalJobRunResult> {
  const now = input.now ?? (() => new Date())
  const startedAt = now().toISOString()
  validateHarborLocalJsonSchema(input.job.inputSchema, input.input, "input")
  try {
    const result = await runHarborLocalQuickJS({
      code: input.job.code,
      input: input.input,
      timeoutMs: input.job.timeoutMs,
      hostCall: input.hostCall,
    })
    validateHarborLocalJsonSchema(input.job.outputSchema, result.value, "output")
    return {
      jobId: input.job.id,
      output: result.value,
      trace: trace("job", input.job.id, "ok", startedAt, now),
    }
  } catch (error) {
    const failed = trace("job", input.job.id, "error", startedAt, now)
    Object.assign(error as Error, { trace: failed })
    throw error
  }
}

export function matchHarborLocalAppRoute(
  app: HarborLocalAppDefinition,
  request: Pick<HarborLocalAppRequest, "method" | "path">
): HarborLocalAppRouteDefinition | null {
  return app.routes.find((route) => {
    const method = route.method?.toUpperCase() ?? "GET"
    return method === request.method.toUpperCase() && route.path === request.path
  }) ?? null
}

export async function runHarborLocalAppRoute(input: {
  readonly app: HarborLocalAppDefinition
  readonly request: HarborLocalAppRequest
  readonly now?: (() => Date) | undefined
  readonly hostCall?: HarborLocalQuickJSHostCallHandler | undefined
}): Promise<HarborLocalAppResponse> {
  const route = matchHarborLocalAppRoute(input.app, input.request)
  if (!route) throw new Error(`Local app route not found: ${input.request.method} ${input.request.path}`)

  const now = input.now ?? (() => new Date())
  const startedAt = now().toISOString()
  try {
    const result = await runHarborLocalQuickJS({
      code: route.code,
      input: input.request,
      hostCall: input.hostCall,
    })
    const value = result.value as { status?: number; contentType?: string; body?: unknown }
    const body = Object.prototype.hasOwnProperty.call(value, "body") ? value.body : value
    const contentType = value.contentType === "text/html" ? "text/html" : "application/json"
    return {
      status: typeof value.status === "number" ? value.status : 200,
      contentType,
      body,
      trace: trace("app", input.app.id, "ok", startedAt, now),
    }
  } catch (error) {
    const failed = trace("app", input.app.id, "error", startedAt, now)
    Object.assign(error as Error, { trace: failed })
    throw error
  }
}
