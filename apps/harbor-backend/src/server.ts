import { ROUTES } from "@hrbr/harbor-control"
import {
  createBackendState,
  addDynamicSource,
  getWorkflowDetail,
  listOrbitAppSummaries,
  listOrbitJobSummaries,
  listRuns,
  listSources,
  listWorkflowEntries,
  runGraph,
  sdkDbTables,
} from "./state"
import type { AgentChatEvent, AgentChatMessage, AgentChatState, BackendState, HarborSdkBackendEnv } from "./state"
import { parseBackendEnv } from "./env"
import { checkCloudflareStagingConnection } from "./cloudflare"
import type { OrbitJobInvocationDetail, OrbitStorageObject } from "@hrbr/orbit"

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

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function asRole(value: unknown): "owner" | "admin" | "member" | "viewer" {
  if (value === "owner" || value === "admin" || value === "member" || value === "viewer") return value
  return "member"
}

function titleFromMessage(message: string): string {
  const title = message.trim().replace(/\s+/g, " ").slice(0, 48)
  return title || "Harbor chat"
}

function activeWorkspace(state: BackendState): string {
  return state.workspaceProfile.id
}

function ensureAgentThread(
  state: BackendState,
  input: { readonly threadId?: string | undefined; readonly message?: string | undefined },
): AgentChatState {
  const existing = input.threadId ? state.agentThreads.get(input.threadId) : undefined
  if (existing) return existing
  const at = new Date().toISOString()
  const threadId = input.threadId && input.threadId.trim() ? input.threadId : id("agent-thread")
  const next: AgentChatState = {
    thread: {
      id: threadId,
      workspace_id: activeWorkspace(state),
      created_by: state.userProfile.id,
      agent_id: "sdk-dashboard-agent",
      title: titleFromMessage(input.message ?? "Harbor chat"),
      status: "idle",
      model: "sdk-local",
      metadata: { backend: "harbor-sdk" },
      last_message_at: at,
      created_at: at,
      updated_at: at,
    },
    messages: [],
    events: [],
  }
  state.agentThreads.set(threadId, next)
  return next
}

function updateAgentThread(state: BackendState, next: AgentChatState): AgentChatState {
  state.agentThreads.set(next.thread.id, next)
  return next
}

function textResponseFor(message: string): string {
  return `SDK backend received: ${message}`
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
    const gettablePaths = new Set(["/health", "/cloudflare/staging", ROUTES.agentChat.events.stream])
    if (request.method !== "POST" && !gettablePaths.has(url.pathname)) {
      throw new Response("Method not allowed", { status: 405 })
    }
    if (url.pathname === "/health") {
      return { path: url.pathname, body: {}, headers: request.headers }
    }
    if (url.pathname === ROUTES.agentChat.events.stream) {
      return {
        path: url.pathname,
        body: Object.fromEntries(url.searchParams.entries()),
        headers: request.headers,
      }
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
    return apiJson(state.userProfile)
  }

  if (path === ROUTES.users.update) {
    const name = stringField(body, "name")
    state.userProfile = {
      ...state.userProfile,
      ...(name !== undefined ? { name } : {}),
    }
    const current = state.members.find((member) => member.is_current_user)
    if (current && name !== undefined) {
      const index = state.members.indexOf(current)
      state.members[index] = { ...current, name }
    }
    return apiJson(state.userProfile)
  }

  if (path === ROUTES.home.summary) {
    const connectedPlugins = listSources(state).data.map((source) => ({
      id: source.id,
      display_name: source.display_name,
      namespace: source.namespace,
      kind: source.kind,
      status: source.status,
      tool_count: source.tool_count,
      category: source.category,
      icon_url: source.icon_url,
      registry_slug: source.registry_slug,
    }))
    return apiJson({
      connected_plugins: connectedPlugins,
      connected_plugins_count: connectedPlugins.length,
      connected_tools_count: connectedPlugins.reduce((sum, source) => sum + source.tool_count, 0),
      agents_connected_count: 1,
      agent_identities: {
        "sdk-dashboard-agent": {
          id: "sdk-dashboard-agent",
          family: "sdk",
          alias: "dashboard",
          label: "SDK Dashboard Agent",
          icon: { path: "/agents/codex.svg", style: "mono" },
          status: "connected",
          last_seen_at: new Date().toISOString(),
          origin_confidence: "high",
        },
      },
      dock_agents: [
        {
          slug: "sdk-dashboard-agent",
          label: "SDK Dashboard Agent",
          kind: "local",
          icon: { path: "/agents/codex.svg", style: "mono" },
          status: "connected",
        },
      ],
      invocation_count: 0,
      success_count: 0,
      error_count: 0,
      agent_hourly_invocations: [],
      today_label: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    })
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
    if (workspaceId && workspaceId !== state.workspaceProfile.id) {
      return errorResponse(`Workspace "${workspaceId}" is not registered.`, 404)
    }
    return apiJson(state.workspaceProfile)
  }

  if (path === ROUTES.workspaces.create) {
    return apiJson(state.workspaceProfile)
  }

  if (path === ROUTES.workspaces.update) {
    state.workspaceProfile = {
      ...state.workspaceProfile,
      ...(stringField(body, "name") ? { name: stringField(body, "name") as string } : {}),
      ...(stringField(body, "slug") ? { slug: stringField(body, "slug") as string } : {}),
      updated_at: new Date().toISOString(),
    }
    return apiJson(state.workspaceProfile)
  }

  if (path === ROUTES.workspaces.delete) {
    return apiJson({ workspace_id: stringField(body, "workspace_id") ?? state.workspaceProfile.id, deleted: false })
  }

  if (path === ROUTES.workspaces.completeOnboarding) {
    state.workspaceProfile = {
      ...state.workspaceProfile,
      onboarded_at: state.workspaceProfile.onboarded_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return apiJson(state.workspaceProfile)
  }

  if (path === ROUTES.workspaces.members.list) {
    return apiJson({ data: state.members, total: state.members.length, limit: state.members.length || 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.workspaces.members.updateRole) {
    const memberId = stringField(body, "member_id")
    const member = state.members.find((row) => row.id === memberId)
    if (!member) return errorResponse(`Member "${memberId ?? ""}" is not registered.`, 404)
    const index = state.members.indexOf(member)
    state.members[index] = { ...member, role: asRole(body["role"]) }
    return apiJson(state.members[index])
  }

  if (path === ROUTES.workspaces.members.remove) {
    const memberId = stringField(body, "member_id")
    const index = state.members.findIndex((row) => row.id === memberId)
    if (index < 0) return errorResponse(`Member "${memberId ?? ""}" is not registered.`, 404)
    const [removed] = state.members.splice(index, 1)
    return apiJson({ member_id: removed?.id ?? memberId, removed: true })
  }

  if (path === ROUTES.workspaces.invites.list) {
    return apiJson({ data: state.invites, total: state.invites.length, limit: state.invites.length || 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.workspaces.invites.send) {
    const at = new Date().toISOString()
    const invite = {
      id: id("invite"),
      email: stringField(body, "email") ?? "member@example.com",
      role: asRole(body["role"]),
      invited_by_name: state.userProfile.name,
      status: "pending" as const,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: at,
      invite_token: id("sdk-invite"),
    }
    state.invites.push(invite)
    return apiJson(invite)
  }

  if (path === ROUTES.workspaces.invites.resend) {
    const inviteId = stringField(body, "invite_id")
    const invite = state.invites.find((row) => row.id === inviteId)
    if (!invite) return errorResponse(`Invite "${inviteId ?? ""}" is not registered.`, 404)
    return apiJson(invite)
  }

  if (path === ROUTES.workspaces.invites.revoke) {
    const inviteId = stringField(body, "invite_id")
    const invite = state.invites.find((row) => row.id === inviteId)
    if (!invite) return errorResponse(`Invite "${inviteId ?? ""}" is not registered.`, 404)
    const index = state.invites.indexOf(invite)
    state.invites[index] = { ...invite, status: "revoked" }
    return apiJson(state.invites[index])
  }

  if (path === ROUTES.invites.mine) {
    return apiJson({ data: state.invites.filter((invite) => invite.email === state.userProfile.email), total: 0, limit: 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.invites.accept) {
    const token = stringField(body, "invite_token")
    const invite = state.invites.find((row) => row.invite_token === token)
    if (!invite) return errorResponse(`Invite token "${token ?? ""}" is not registered.`, 404)
    const index = state.invites.indexOf(invite)
    state.invites[index] = { ...invite, status: "accepted" }
    return apiJson({ workspace: state.workspaceProfile, invite: state.invites[index] })
  }

  if (path === ROUTES.agents.announce) {
    return apiJson({
      agent_id: stringField(body, "agent_id") ?? "sdk-dashboard-agent",
      status: "connected",
      workspace_id: activeWorkspace(state),
      last_seen_at: new Date().toISOString(),
    })
  }

  if (path === ROUTES.agents.list) {
    return apiJson({
      data: [
        {
          id: "sdk-dashboard-agent",
          family: "sdk",
          alias: "dashboard",
          label: "SDK Dashboard Agent",
          status: "connected",
          last_seen_at: new Date().toISOString(),
        },
      ],
      total: 1,
    })
  }

  if (path === ROUTES.agents.update) {
    return apiJson({ agent_id: stringField(body, "agent_id") ?? "sdk-dashboard-agent", updated: true })
  }

  if (path === ROUTES.workflows.list) {
    const scopeValue = stringField(body, "scope")
    const scope = scopeValue === "personal" || scopeValue === "workspace" ? scopeValue : "native"
    return apiJson({ workflows: listWorkflowEntries(scope) })
  }

  if (path === ROUTES.workflows.get) {
    const workflow = getWorkflowDetail(stringField(body, "id") ?? stringField(body, "workflow_id") ?? "")
    if (!workflow) return errorResponse("Workflow is not registered.", 404)
    return apiJson(workflow)
  }

  if (path === ROUTES.workflows.clone) {
    const workflow = getWorkflowDetail(stringField(body, "workflow_id") ?? stringField(body, "id") ?? "")
    if (!workflow) return errorResponse("Workflow is not registered.", 404)
    return apiJson({ ...workflow, id: `${workflow.id}-copy`, workflow_scope: "personal" })
  }

  if (path === ROUTES.workflows.access.list) {
    return apiJson({ requests: state.workflowAccessRequests })
  }

  if (path === ROUTES.workflows.access.request) {
    const at = new Date().toISOString()
    const workflowId = stringField(body, "workflow_id") ?? ""
    const workflow = getWorkflowDetail(workflowId)
    const request = {
      id: id("workflow-access"),
      workflow_id: workflowId,
      workflow_title: workflow?.title ?? null,
      requester_id: state.userProfile.id,
      owner_id: workflow?.owner_id ?? state.userProfile.id,
      status: "pending" as const,
      message: stringField(body, "message") ?? null,
      response_message: null,
      cloned_workflow_id: null,
      created_at: at,
      updated_at: at,
    }
    state.workflowAccessRequests.push(request)
    return apiJson(request)
  }

  if (path === ROUTES.workflows.access.decide || path === ROUTES.workflows.access.cancel) {
    const requestId = stringField(body, "request_id")
    const request = state.workflowAccessRequests.find((row) => row.id === requestId)
    if (!request) return errorResponse(`Workflow access request "${requestId ?? ""}" is not registered.`, 404)
    const index = state.workflowAccessRequests.indexOf(request)
    const status = path === ROUTES.workflows.access.cancel ? "cancelled" : body["decision"] === "reject" ? "rejected" : "approved"
    state.workflowAccessRequests[index] = {
      ...request,
      status,
      response_message: stringField(body, "response_message") ?? request.response_message,
      updated_at: new Date().toISOString(),
    }
    return apiJson(state.workflowAccessRequests[index])
  }

  if (path === ROUTES.workflows.changeRequests.list) {
    return apiJson({ change_requests: state.workflowChangeRequests })
  }

  if (path === ROUTES.workflows.changeRequests.propose) {
    const at = new Date().toISOString()
    const request = {
      id: id("workflow-change"),
      workflow_id: stringField(body, "workflow_id") ?? null,
      request_type: body["request_type"] === "create_workspace" ? "create_workspace" as const : "update_workspace" as const,
      status: "pending" as const,
      title: stringField(body, "title") ?? "SDK workflow change",
      description: stringField(body, "description") ?? "",
      proposed_version_name: stringField(body, "proposed_version_name") ?? null,
      change_summary: stringField(body, "change_summary") ?? null,
      created_by: state.userProfile.id,
      reviewed_by: null,
      created_at: at,
      updated_at: at,
    }
    state.workflowChangeRequests.push(request)
    return apiJson(request)
  }

  if (path === ROUTES.workflows.changeRequests.decide || path === ROUTES.workflows.changeRequests.cancel) {
    const requestId = stringField(body, "request_id")
    const request = state.workflowChangeRequests.find((row) => row.id === requestId)
    if (!request) return errorResponse(`Workflow change request "${requestId ?? ""}" is not registered.`, 404)
    const index = state.workflowChangeRequests.indexOf(request)
    const status = path === ROUTES.workflows.changeRequests.cancel ? "cancelled" : body["decision"] === "reject" ? "rejected" : "approved"
    state.workflowChangeRequests[index] = {
      ...request,
      status,
      reviewed_by: state.userProfile.id,
      updated_at: new Date().toISOString(),
    }
    return apiJson(state.workflowChangeRequests[index])
  }

  if (path === ROUTES.orbit.apps.list) {
    const apps = listOrbitAppSummaries(state)
    return apiJson({ apps, count: apps.length })
  }

  if (path === ROUTES.orbit.apps.inspect) {
    const app = state.orbitApps.get(stringField(body, "name") ?? "")
    if (!app) return errorResponse("Orbit app is not registered.", 404)
    return apiJson({ app })
  }

  if (path === ROUTES.orbit.apps.publish) {
    const name = stringField(body, "name")
    if (!name) return errorResponse("name is required.", 400)
    const at = new Date().toISOString()
    const existing = state.orbitApps.get(name)
    const nextVersion = `v${(existing?.versions.length ?? 0) + 1}`
    const routes = Array.isArray(body["routes"]) ? body["routes"] as never[] : []
    const jobs = objectField(body, "jobs")
    state.orbitApps.set(name, {
      name,
      description: stringField(body, "description") ?? existing?.description ?? null,
      latest_version: nextVersion,
      status: "ready",
      url: `http://localhost:8787/orbit/apps/${name}`,
      access: existing?.access ?? "workspace_member",
      routes,
      jobs: jobs as never,
      versions: [
        ...(existing?.versions ?? []),
        {
          version: nextVersion,
          status: "ready",
          route_count: routes.length,
          job_count: Object.keys(jobs).length,
          created_at: at,
          error_message: null,
        },
      ],
    })
    return apiJson({ app: { name, version: nextVersion, status: "ready", url: `http://localhost:8787/orbit/apps/${name}` } })
  }

  if (path === ROUTES.orbit.apps.open) {
    const name = stringField(body, "name") ?? "sdk-dashboard"
    return apiJson({ name, url: `http://localhost:8787/orbit/apps/${name}${stringField(body, "path") ?? ""}` })
  }

  if (path === ROUTES.orbit.apps.disable) {
    const name = stringField(body, "name") ?? ""
    const app = state.orbitApps.get(name)
    if (!app) return errorResponse("Orbit app is not registered.", 404)
    state.orbitApps.set(name, { ...app, status: "disabled" })
    return apiJson({ name, version: app.latest_version, disabled: true })
  }

  if (path === ROUTES.orbit.apps.access.update) {
    const name = stringField(body, "name") ?? ""
    const access = body["access"] === "public" ? "public" : "workspace_member"
    const app = state.orbitApps.get(name)
    if (!app) return errorResponse("Orbit app is not registered.", 404)
    state.orbitApps.set(name, { ...app, access })
    return apiJson({ name, access, routes_updated: app.routes.length })
  }

  if (path === ROUTES.orbit.apps.activity.list) {
    const appName = stringField(body, "name") ?? "sdk-dashboard"
    return apiJson({
      activity: [
        {
          id: id("app-activity"),
          kind: "version_change",
          type: "published",
          activity: `${appName} is served by the SDK backend`,
          created_at: new Date().toISOString(),
        },
      ],
      next_cursor: null,
    })
  }

  if (path === ROUTES.orbit.apps.invocations.list) {
    return apiJson({ invocations: [...state.orbitAppInvocations.values()].map((row) => row.invocation), next_cursor: null })
  }

  if (path === ROUTES.orbit.apps.invocations.get) {
    const invocation = state.orbitAppInvocations.get(stringField(body, "invocation_id") ?? "")
    if (!invocation) return errorResponse("Orbit app invocation is not registered.", 404)
    return apiJson({ invocation: invocation.invocation, job_calls: invocation.jobCalls })
  }

  if (path === ROUTES.orbit.jobs.list) {
    const jobs = listOrbitJobSummaries(state)
    return apiJson({ jobs, count: jobs.length })
  }

  if (path === ROUTES.orbit.jobs.inspect) {
    const job = state.orbitJobs.get(stringField(body, "name") ?? "")
    if (!job) return errorResponse("Orbit job is not registered.", 404)
    return apiJson({ job })
  }

  if (path === ROUTES.orbit.jobs.versions) {
    const name = stringField(body, "name") ?? ""
    const job = state.orbitJobs.get(name)
    if (!job) return errorResponse("Orbit job is not registered.", 404)
    return apiJson({ name, versions: job.versions })
  }

  if (path === ROUTES.orbit.jobs.publish) {
    const name = stringField(body, "name")
    if (!name) return errorResponse("name is required.", 400)
    const at = new Date().toISOString()
    const existing = state.orbitJobs.get(name)
    const version = `v${(existing?.versions.length ?? 0) + 1}`
    const capabilities = stringArrayField(body, "capabilities").filter((capability) =>
      ["storage", "cache", "ai", "plugins", "memory", "data", "workflow", "sessions", "socket"].includes(capability),
    ) as never[]
    state.orbitJobs.set(name, {
      name,
      description: stringField(body, "description") ?? existing?.description ?? null,
      latest_version: version,
      status: "ready",
      kind: body["kind"] === "query" || body["kind"] === "mutation" ? body["kind"] : "task",
      tags: stringArrayField(body, "tags") as string[],
      capabilities,
      input_schema: objectField(body, "input_schema"),
      output_schema: objectField(body, "output_schema"),
      versions: [
        ...(existing?.versions ?? []),
        { version, status: "ready", lane: "dynamic_worker", capabilities, created_at: at, error_message: null },
      ],
    })
    return apiJson({ job: { name, version, status: "ready", lane: "dynamic_worker", capabilities } })
  }

  if (path === ROUTES.orbit.jobs.run) {
    const name = stringField(body, "name") ?? "sdk-ping"
    const job = state.orbitJobs.get(name)
    if (!job) return errorResponse("Orbit job is not registered.", 404)
    const run = await state.traces.startRun({
      workspaceId: activeWorkspace(state),
      agentId: headers.get("X-Hrbr-Agent-Id") ?? state.userProfile.id,
      trigger: "orbit.job",
      input: { job: name, input: body["input"] ?? null },
    })
    await state.traces.finishRun({
      runId: run.id,
      status: "completed",
      output: { ok: true, job: name, input: body["input"] ?? null },
    })
    if (!runIds.includes(run.id)) runIds.push(run.id)
    const at = new Date().toISOString()
    const invocation: OrbitJobInvocationDetail = {
      id: id("job-invocation"),
      job: name,
      version: job.latest_version ?? "v1",
      status: "completed",
      caller_kind: "user",
      caller_id: state.userProfile.id,
      lane_used: "dynamic_worker",
      deployment_id: null,
      run_id: run.id,
      duration_ms: 1,
      error_code: null,
      error_message: null,
      created_at: at,
      finished_at: at,
      input: body["input"] ?? null,
      output: { ok: true, job: name },
      output_ref: null,
    }
    state.orbitJobInvocations.unshift(invocation)
    return apiJson({
      ok: true,
      job: name,
      version: invocation.version,
      run_id: run.id,
      duration_ms: 1,
      output: invocation.output,
      artifacts: [],
      lane_used: "dynamic_worker",
      deployment_id: null,
    })
  }

  if (path === ROUTES.orbit.jobs.disable) {
    const name = stringField(body, "name") ?? ""
    const job = state.orbitJobs.get(name)
    if (!job) return errorResponse("Orbit job is not registered.", 404)
    state.orbitJobs.set(name, { ...job, status: "disabled" })
    return apiJson({ name, version: job.latest_version, disabled: true })
  }

  if (path === ROUTES.orbit.jobs.invocations.list) {
    const name = stringField(body, "name")
    const invocations = state.orbitJobInvocations
      .filter((row) => !name || row.job === name)
      .map(({ input: _input, output: _output, output_ref: _outputRef, ...summary }) => summary)
    return apiJson({ invocations, next_cursor: null })
  }

  if (path === ROUTES.orbit.jobs.invocations.get) {
    const invocation = state.orbitJobInvocations.find((row) => row.id === stringField(body, "invocation_id"))
    if (!invocation) return errorResponse("Orbit job invocation is not registered.", 404)
    return apiJson({ invocation })
  }

  if (path === ROUTES.orbit.db.tables) {
    return apiJson({
      workspace_database_id: "sdk-memory-db",
      workspace_database_name: "SDK in-memory workspace DB",
      status: "ready",
      tables: sdkDbTables(),
    })
  }

  if (path === ROUTES.orbit.db.peek) {
    const table = stringField(body, "table") ?? "sdk_events"
    return apiJson({ table, columns: ["id", "kind", "created_at"], rows: [], truncated: false, total_rows: 0 })
  }

  if (path === ROUTES.orbit.storage.list) {
    return apiJson({ objects: [...state.orbitStorageObjects.values()], truncated: false })
  }

  if (path === ROUTES.orbit.storage.put) {
    const key = stringField(body, "key")
    if (!key) return errorResponse("key is required.", 400)
    const at = new Date().toISOString()
    const object: OrbitStorageObject & { readonly data?: unknown } = {
      key,
      size: JSON.stringify(body["data"] ?? "").length,
      uploaded: at,
      content_type: stringField(body, "content_type") ?? "application/json",
      download_url: `http://localhost:8787/orbit/storage/${encodeURIComponent(key)}`,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      expires_in_seconds: 3600,
      data: body["data"] ?? null,
    }
    state.orbitStorageObjects.set(key, object)
    return apiJson(object)
  }

  if (path === ROUTES.orbit.storage.get) {
    const object = state.orbitStorageObjects.get(stringField(body, "key") ?? "")
    return apiJson(object ? { ...object, encoding: "json" } : null)
  }

  if (path === ROUTES.orbit.storage.url) {
    const key = stringField(body, "key")
    if (!key) return errorResponse("key is required.", 400)
    const object = state.orbitStorageObjects.get(key)
    return apiJson({
      key,
      download_url: object?.download_url ?? `http://localhost:8787/orbit/storage/${encodeURIComponent(key)}`,
      expires_at: object?.expires_at ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      expires_in_seconds: object?.expires_in_seconds ?? 3600,
    })
  }

  if (path === ROUTES.orbit.storage.delete) {
    const key = stringField(body, "key")
    const deleted = key ? state.orbitStorageObjects.delete(key) : false
    return apiJson({ key: key ?? "", deleted })
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

  if (path === ROUTES.plugins.oauth.workspaceClients.list) {
    return apiJson({ data: [], total: 0, limit: 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.plugins.oauth.workspaceClients.set) {
    return apiJson({
      source_id: stringField(body, "source_id") ?? null,
      client_id: stringField(body, "client_id") ?? null,
      configured: true,
      redacted: true,
    })
  }

  if (path === ROUTES.plugins.oauth.workspaceClients.delete) {
    return apiJson({ source_id: stringField(body, "source_id") ?? null, deleted: true })
  }

  if (
    path === ROUTES.plugins.skills.list ||
    path === ROUTES.plugins.skills.installed.list
  ) {
    return apiJson({ data: [], total: 0, limit: 50, offset: 0, hasMore: false })
  }

  if (path === ROUTES.plugins.skills.check) {
    return apiJson({ installed: false, missing_sources: [], missing_tools: [] })
  }

  if (path === ROUTES.plugins.skills.get) {
    return errorResponse(`Skill "${stringField(body, "skill_id") ?? ""}" is not registered.`, 404)
  }

  if (path === ROUTES.plugins.skills.install.record || path === ROUTES.plugins.skills.uninstall.record) {
    return apiJson({ recorded: true })
  }

  if (path === ROUTES.plugins.meta.search) {
    const query = stringField(body, "query") ?? ""
    const tools = await state.registry.search({ query, limit: numberField(body, "limit") ?? 10 })
    const registry = state.registryEntries
      .filter((entry) => !query || `${entry.slug} ${entry.display_name} ${entry.description}`.toLowerCase().includes(query.toLowerCase()))
      .slice(0, numberField(body, "limit") ?? 10)
    return apiJson({ tools: tools.hits, registry })
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

  if (path === ROUTES.agentChat.threads.get) {
    return apiJson(ensureAgentThread(state, { threadId: stringField(body, "thread_id") }))
  }

  if (path === ROUTES.agentChat.messages.send) {
    const message = stringField(body, "message")
    if (!message) return errorResponse("message is required.", 400)
    const current = ensureAgentThread(state, {
      threadId: stringField(body, "thread_id"),
      message,
    })
    const at = new Date().toISOString()
    const userMessage: AgentChatMessage = {
      id: id("agent-message"),
      workspace_id: activeWorkspace(state),
      thread_id: current.thread.id,
      role: "user",
      content: message,
      status: "completed",
      metadata: {},
      created_at: at,
    }
    const assistantMessage: AgentChatMessage = {
      id: id("agent-message"),
      workspace_id: activeWorkspace(state),
      thread_id: current.thread.id,
      role: "assistant",
      content: textResponseFor(message),
      status: "completed",
      metadata: { backend: "harbor-sdk" },
      created_at: at,
    }
    const sequence = current.events.length
    const event: AgentChatEvent = {
      id: id("agent-event"),
      workspace_id: activeWorkspace(state),
      thread_id: current.thread.id,
      message_id: assistantMessage.id,
      run_id: null,
      sequence: sequence + 1,
      type: "final",
      payload: {
        text: assistantMessage.content,
        in_response_to: userMessage.id,
      },
      created_at: at,
    }
    return apiJson(
      updateAgentThread(state, {
        thread: {
          ...current.thread,
          status: "completed",
          last_message_at: at,
          updated_at: at,
        },
        messages: [...current.messages, userMessage, assistantMessage],
        events: [...current.events, event],
      }),
    )
  }

  if (path === ROUTES.agentChat.events.stream) {
    const stateForThread = ensureAgentThread(state, { threadId: stringField(body, "thread_id") })
    const afterSequence = numberField(body, "after_sequence") ?? Number(stringField(body, "after_sequence") ?? 0)
    const events = stateForThread.events.filter((event) => event.sequence > afterSequence)
    const payload = events
      .map((event) => `event: agent_chat_event\ndata: ${JSON.stringify(event)}\n\n`)
      .join("")
    return new Response(payload, {
      status: 200,
      headers: {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
      },
    })
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
