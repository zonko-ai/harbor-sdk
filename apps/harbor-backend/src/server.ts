import { ROUTES } from "@hrbr/harbor-control"
import { createBackendState, addDynamicSource, listRuns, listSources, runGraph } from "./state"
import type { BackendState, HarborSdkBackendEnv } from "./state"
import { parseBackendEnv } from "./env"
import { checkCloudflareStagingConnection } from "./cloudflare"

export interface HarborSdkBackendServer {
  readonly state: BackendState
  readonly fetch: (request: Request) => Promise<Response>
}

interface JsonRequest {
  readonly path: string
  readonly body: Record<string, unknown>
  readonly headers: Headers
}

function json(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    status: init?.status ?? 200,
    headers: {
      "content-type": "application/json",
    },
  })
}

function apiJson(data: unknown, init?: ResponseInit): Response {
  return json({ success: true, data }, init)
}

function errorResponse(error: unknown, status = 500): Response {
  const message = error instanceof Error ? error.message : String(error)
  return json({ success: false, error: message }, { status })
}

function stringField(body: Record<string, unknown>, key: string): string | undefined {
  const value = body[key]
  return typeof value === "string" ? value : undefined
}

function numberField(body: Record<string, unknown>, key: string): number | undefined {
  const value = body[key]
  return typeof value === "number" ? value : undefined
}

function booleanField(body: Record<string, unknown>, key: string): boolean | undefined {
  const value = body[key]
  return typeof value === "boolean" ? value : undefined
}

function objectField(body: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = body[key]
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function stringArrayField(body: Record<string, unknown>, key: string): readonly string[] {
  const value = body[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function sourceKind(value: unknown): "mcp" | "cli" | "api" {
  if (value === "mcp" || value === "cli" || value === "api") return value
  return "api"
}

function visibility(value: unknown): "personal" | "workspace" | undefined {
  if (value === "personal" || value === "workspace") return value
  return undefined
}

function routeRequest(request: Request): Promise<JsonRequest> {
  return (async () => {
    const url = new URL(request.url)
    const gettablePaths = new Set(["/health", "/cloudflare/staging"])
    if (request.method !== "POST" && !gettablePaths.has(url.pathname)) {
      throw new Response("Method not allowed", { status: 405 })
    }
    if (url.pathname === "/health") {
      return { path: url.pathname, body: {}, headers: request.headers }
    }
    const payload = (await request.json().catch(() => ({}))) as unknown
    const body =
      payload && typeof payload === "object" && !Array.isArray(payload)
        ? (payload as Record<string, unknown>)
        : {}
    return { path: url.pathname, body, headers: request.headers }
  })()
}

async function handleRoute(
  state: BackendState,
  request: JsonRequest,
  runIds: string[],
): Promise<Response> {
  const { path, body, headers } = request

  if (path === "/health") {
    return json({
      ok: true,
      backend: "harbor-sdk",
      environment: state.env,
      workspace_id: state.workspace.id,
      env_file: {
        expected: `apps/harbor-backend/.env.${state.env}`,
      },
      cloudflare: {
        mode: state.env === "staging" ? "staging" : "dev",
        validation_path: "/cloudflare/staging",
        has_api_token: Boolean(process.env["CLOUDFLARE_API_TOKEN"]),
        has_account_id: Boolean(process.env["CLOUDFLARE_ACCOUNT_ID"]),
        has_ai_gateway_token: Boolean(process.env["CLOUDFLARE_AI_GATEWAY_TOKEN"]),
        ai_gateway_account_id: process.env["CLOUDFLARE_AI_GATEWAY_ACCOUNT_ID"] ?? null,
        ai_gateway_name: process.env["CLOUDFLARE_AI_GATEWAY_NAME"] ?? null,
        d1_database_configured: Boolean(process.env["D1_DATABASE_ID"]),
        kv_namespace_configured: Boolean(process.env["KV_NAMESPACE_ID"]),
        r2_bucket_name: process.env["R2_BUCKET_NAME"] ?? null,
        queue_name: process.env["QUEUE_NAME"] ?? null,
      },
    })
  }

  if (path === "/cloudflare/staging") {
    if (state.env !== "staging") {
      return errorResponse("Cloudflare staging checks require HARBOR_SDK_BACKEND_ENV=staging.", 400)
    }
    return json(await checkCloudflareStagingConnection())
  }

  if (path === ROUTES.users.me) {
    return apiJson(state.user)
  }

  if (path === ROUTES.workspaces.list) {
    return apiJson(
      state.listWorkspaces({
        limit: numberField(body, "limit"),
        offset: numberField(body, "offset"),
        cursor: stringField(body, "cursor"),
        includeTotal: booleanField(body, "include_total"),
      }),
    )
  }

  if (path === ROUTES.workspaces.get) {
    const workspaceId = stringField(body, "workspace_id")
    if (workspaceId && workspaceId !== state.workspace.id) {
      return errorResponse(`Workspace "${workspaceId}" is not registered.`, 404)
    }
    return apiJson(state.workspace)
  }

  if (path === ROUTES.workspaces.create) {
    return apiJson(state.workspace)
  }

  if (path === ROUTES.plugins.sources.list) {
    return apiJson(
      listSources(state, {
        sourceId: stringField(body, "source_id"),
        registrySlug: stringField(body, "registry_slug"),
        limit: numberField(body, "limit"),
        offset: numberField(body, "offset"),
        cursor: stringField(body, "cursor"),
        includeTotal: booleanField(body, "include_total"),
      }),
    )
  }

  if (path === ROUTES.plugins.sources.get) {
    const sourceId = stringField(body, "source_id")
    const source = sourceId ? state.sources.get(sourceId)?.source : undefined
    if (!source) return errorResponse(`Source "${sourceId ?? ""}" is not registered.`, 404)
    return apiJson(source)
  }

  if (path === ROUTES.plugins.sources.add) {
    const namespace = stringField(body, "namespace")
    const displayName = stringField(body, "display_name")
    if (!namespace || !displayName) return errorResponse("namespace and display_name are required.", 400)
    const record = addDynamicSource(state, {
      kind: sourceKind(body["kind"]),
      namespace,
      displayName,
      config: body["config"] ?? {},
      authConfig: body["auth_config"],
      description: stringField(body, "description"),
      category: stringField(body, "category"),
      iconUrl: stringField(body, "icon_url"),
      visibility: visibility(body["source_visibility"]),
    })
    return apiJson({
      source_id: record.source.id,
      tool_count: record.source.tool_count,
      status: record.source.status,
      source: record.source,
    })
  }

  if (path === ROUTES.plugins.sources.refresh) {
    const sourceId = stringField(body, "source_id")
    const namespace = stringField(body, "namespace")
    const record =
      (sourceId ? state.sources.get(sourceId) : undefined) ??
      [...state.sources.values()].find((item) => item.source.namespace === namespace)
    if (!record) return errorResponse("Source is not registered.", 404)
    const toolCount = (await record.adapter.listTools()).length
    const source = { ...record.source, tool_count: toolCount, updated_at: new Date().toISOString() }
    state.sources.set(source.id, { ...record, source })
    state.rebuildRegistry()
    return apiJson({ source_id: source.id, tool_count: toolCount, status: source.status, source })
  }

  if (path === ROUTES.plugins.sources.remove) {
    const sourceId = stringField(body, "source_id")
    if (!sourceId || !state.sources.delete(sourceId)) {
      return errorResponse(`Source "${sourceId ?? ""}" is not registered.`, 404)
    }
    const index = state.sourceOrder.indexOf(sourceId)
    if (index >= 0) state.sourceOrder.splice(index, 1)
    state.rebuildRegistry()
    return apiJson({ source_id: sourceId, removed: true })
  }

  if (path === ROUTES.plugins.sources.visibility.set) {
    const sourceId = stringField(body, "source_id")
    const sourceVisibility = visibility(body["source_visibility"]) ?? "workspace"
    const record = sourceId ? state.sources.get(sourceId) : undefined
    if (!record) return errorResponse(`Source "${sourceId ?? ""}" is not registered.`, 404)
    const source = { ...record.source, source_visibility: sourceVisibility }
    state.sources.set(source.id, { ...record, source })
    return apiJson(source)
  }

  if (path === ROUTES.plugins.sources.probe) {
    return apiJson({
      endpoint: stringField(body, "endpoint") ?? "",
      connected: true,
      requires_auth: false,
      tool_count: 1,
      server_name: "harbor-sdk-backend",
      oauth: null,
    })
  }

  if (path === ROUTES.plugins.sources.oauth.start || path === ROUTES.plugins.sources.oauth.reconnect) {
    return apiJson({
      authorization_url: `https://auth.tryharbor.local/${state.env}/authorize`,
      state: "sdk-local-oauth-state",
    })
  }

  if (path === ROUTES.plugins.sources.oauth.setupHints) {
    return apiJson({
      display_name: "SDK source",
      redirect_uri:
        state.env === "staging"
          ? "https://stag.tryharbor.ai/callback"
          : "http://localhost:3000/callback",
      register_url: null,
      register_url_source: "none",
      scopes_supported: [],
      requires_client_secret: false,
      has_dynamic_registration: false,
      workspace_client_already_configured: false,
      has_global_client: false,
      authorization_server_host: null,
    })
  }

  if (path === ROUTES.plugins.sources.verification.get) {
    return apiJson({ source_id: stringField(body, "source_id") ?? state.workspace.id, verification: null })
  }

  if (path === ROUTES.plugins.sources.verification.probe) {
    return apiJson({
      source_id: stringField(body, "source_id") ?? state.workspace.id,
      status: "verified",
      verified: true,
      checked_at: new Date().toISOString(),
      details: { backend: "harbor-sdk" },
    })
  }

  if (path === ROUTES.plugins.sources.verification.set) {
    const at = stringField(body, "checked_at") ?? new Date().toISOString()
    const sourceId = stringField(body, "source_id") ?? state.workspace.id
    return apiJson({
      source_id: sourceId,
      verification: {
        id: "66666666-6666-4666-8666-666666666666",
        workspace_id: state.workspace.id,
        source_id: sourceId,
        machine_id: stringField(body, "machine_id") ?? "sdk-machine",
        agent_id: stringField(body, "agent_id") ?? "sdk-agent",
        status: body["status"] === "pending" || body["status"] === "verified" || body["status"] === "failed"
          ? body["status"]
          : "verified",
        verified: body["status"] !== "failed",
        ...(stringField(body, "error") ? { error: stringField(body, "error") } : {}),
        ...(body["details"] !== undefined ? { details: body["details"] } : {}),
        checked_at: at,
        created_by: "33333333-3333-4333-8333-333333333333",
        created_at: at,
        updated_at: at,
      },
    })
  }

  if (path === ROUTES.plugins.installJobs.list) {
    return apiJson({ data: [], total: 0, limit: numberField(body, "limit") ?? 50, offset: 0, hasMore: false, nextCursor: null })
  }

  if (path === ROUTES.plugins.installJobs.get) {
    return errorResponse(`Install job "${stringField(body, "job_id") ?? ""}" is not registered.`, 404)
  }

  if (path === ROUTES.plugins.registry.list) {
    const slug = stringField(body, "slug")
    const rows = slug
      ? state.registryEntries.filter((entry) => entry.slug === slug)
      : state.registryEntries
    return apiJson({ data: rows, total: rows.length, limit: rows.length || 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.plugins.registry.install) {
    const slug = stringField(body, "slug")
    const entry = state.registryEntries.find((candidate) => candidate.slug === slug)
    if (!entry) return errorResponse(`Registry entry "${slug ?? ""}" is not available.`, 404)
    const record = addDynamicSource(state, {
      kind: entry.kind,
      namespace: stringField(body, "namespace") ?? entry.default_namespace,
      displayName: entry.display_name,
      config: "config" in entry ? entry.config : {},
      authConfig: { method: entry.auth.method },
      description: entry.description,
      category: entry.category,
      iconUrl: entry.icon_url,
      visibility: visibility(body["source_visibility"]),
    })
    return apiJson({
      source_id: record.source.id,
      tool_count: record.source.tool_count,
      status: record.source.status,
    })
  }

  if (path === ROUTES.plugins.tools.list) {
    return apiJson(
      await state.registry.list({
        sourceId: stringField(body, "source_id"),
        namespace: stringField(body, "namespace"),
        limit: numberField(body, "limit"),
        offset: numberField(body, "offset"),
        cursor: stringField(body, "cursor"),
      }),
    )
  }

  if (path === ROUTES.plugins.tools.search) {
    return apiJson(
      await state.registry.search({
        query: stringField(body, "query") ?? "",
        limit: numberField(body, "limit"),
        source: stringField(body, "source"),
      }),
    )
  }

  if (path === ROUTES.plugins.tools.describe) {
    return apiJson(await state.registry.describe({ toolId: stringField(body, "tool_id") ?? "" }))
  }

  if (path === ROUTES.plugins.tools.schema) {
    return apiJson(await state.registry.schema({ toolId: stringField(body, "tool_id") ?? "" }))
  }

  if (path === ROUTES.plugins.tools.schemas) {
    const data = await state.registry.schemas({ toolIds: stringArrayField(body, "tool_ids") })
    return apiJson({ data })
  }

  if (path === ROUTES.plugins.invoke) {
    const result = await state.registry.invoke({
      toolId: stringField(body, "tool_id") ?? "",
      input: objectField(body, "input"),
      agentId: stringField(body, "agent_id"),
      runId: stringField(body, "run_id"),
    })
    if (result.run_id && !runIds.includes(result.run_id)) runIds.push(result.run_id)
    return apiJson(result)
  }

  if (path === ROUTES.exec) {
    const run = await state.traces.startRun({
      workspaceId: state.workspace.id,
      agentId: headers.get("X-Hrbr-Agent-Id") ?? undefined,
      trigger: "sdk.execute",
      input: { code: stringField(body, "code") ?? "", mode: stringField(body, "mode") ?? "exec" },
    })
    const span = await state.traces.startSpan({
      runId: run.id,
      kind: "agent.step",
      title: "SDK backend execute",
      input: { code: stringField(body, "code") ?? "" },
    })
    await state.traces.finishSpan({
      spanId: span.id,
      status: "success",
      output: { evaluated: false },
    })
    await state.traces.finishRun({
      runId: run.id,
      status: "completed",
      output: { message: "Execution route is wired; arbitrary code evaluation is disabled." },
    })
    if (!runIds.includes(run.id)) runIds.push(run.id)
    return apiJson({
      result: { message: "Execution route is wired; arbitrary code evaluation is disabled." },
      mode: stringField(body, "mode") === "workflow" ? "workflow" : "dynamic_worker",
      run_id: run.id,
      artifacts: [],
    })
  }

  if (path === ROUTES.runs.list) {
    return apiJson(
      await listRuns(state.traces, runIds, {
        limit: numberField(body, "limit"),
        offset: numberField(body, "offset"),
        cursor: stringField(body, "cursor"),
        includeTotal: booleanField(body, "include_total"),
      }),
    )
  }

  if (path === ROUTES.runs.get) {
    const graph = await runGraph(state.traces, stringField(body, "run_id") ?? "")
    return apiJson(graph.run)
  }

  if (path === ROUTES.runs.graph) {
    return apiJson(await runGraph(state.traces, stringField(body, "run_id") ?? ""))
  }

  return errorResponse(`Route "${path}" is not implemented by the SDK backend.`, 404)
}

export function createHarborSdkBackendServer(input?: {
  readonly env?: HarborSdkBackendEnv | undefined
}): HarborSdkBackendServer {
  const env = input?.env ?? parseBackendEnv(process.env["HARBOR_SDK_BACKEND_ENV"])
  const state = createBackendState(env)
  const localRunIds: string[] = []
  return {
    state,
    fetch: async (request) => {
      try {
        const parsed = await routeRequest(request)
        return await handleRoute(state, parsed, localRunIds)
      } catch (error) {
        if (error instanceof Response) return error
        return errorResponse(error)
      }
    },
  }
}
