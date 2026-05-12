import { expect, test } from "bun:test"
import { createHarborClient } from "@hrbr/client"
import { createHarborSdkBackendServer } from "../src/server"
import { loadBackendEnvFile } from "../src/env"
import { checkCloudflareStagingConnection } from "../src/cloudflare"

function clientFor(server: ReturnType<typeof createHarborSdkBackendServer>) {
  return createHarborClient({
    apiUrl: "http://sdk-backend.local",
    apiKey: "test",
    workspaceId: server.state.workspace.id,
    fetch: (input, init) => {
      const request = input instanceof Request ? input : new Request(String(input), init)
      return server.fetch(request)
    },
  })
}

test("serves Harbor client routes from SDK primitives", async () => {
  const server = createHarborSdkBackendServer({ env: "dev" })
  const client = clientFor(server)

  const workspaces = await client.workspaces.list({ includeTotal: true })
  expect(workspaces.total).toBe(1)
  expect(workspaces.data[0]?.slug).toBe("sdk-harbor-dev")

  const userResponse = await server.fetch(
    new Request("http://sdk-backend.local/users/me", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    }),
  )
  expect(userResponse.status).toBe(200)
  expect(await userResponse.json()).toMatchObject({
    success: true,
    data: {
      id: "33333333-3333-4333-8333-333333333333",
      email: "sdk-dev@tryharbor.local",
      default_workspace_id: server.state.workspace.id,
    },
  })

  const sources = await client.sources.list({ includeTotal: true })
  expect(sources.total).toBe(2)
  expect(sources.data.map((source) => source.namespace)).toContain("sdk_echo")

  const tools = await client.tools.search({ query: "ping" })
  expect(tools.hits[0]?.tool_id).toBe("sdk_echo.ping")

  const schema = await client.tools.describe({ toolId: "sdk_echo.ping" })
  expect(schema.signature).toBe("sdk_echo.ping(input)")

  const invocation = await client.tools.invoke({
    toolId: "sdk_echo.ping",
    input: { message: "hello" },
  })
  expect(invocation.result).toEqual({ ok: true, message: "hello", environment: "dev" })
  expect(invocation.run_id).toBeString()

  const graph = await client.runs.graph({ runId: invocation.run_id ?? "" })
  expect(graph.run.status).toBe("completed")
  expect(graph.spans[0]?.tool_id).toBe("sdk_echo.ping")

  const registry = await client.sources.registry.list()
  expect(registry.total).toBeGreaterThan(0)
  expect(registry.data.some((entry) => entry.slug === "sentry-api")).toBe(true)
})

test("can add a dynamic source without changing the Harbor repo", async () => {
  const server = createHarborSdkBackendServer({ env: "staging" })
  const client = clientFor(server)

  const added = await client.sources.add({
    kind: "api",
    namespace: "custom_ops",
    displayName: "Custom Ops",
    config: { kind: "api", base_url: "https://example.com" },
    sourceVisibility: "workspace",
  })

  expect(added.status).toBe("ready")
  const result = await client.tools.invoke({
    toolId: "custom_ops.invoke",
    input: { payload: { ok: true } },
  })
  expect(result.result).toEqual({ source: "custom_ops", payload: { payload: { ok: true } } })
})

test("serves Harbor dashboard routes from SDK state", async () => {
  const server = createHarborSdkBackendServer({ env: "dev" })
  const workspaceId = server.state.workspace.id

  async function post(path: string, body: Record<string, unknown> = {}) {
    const response = await server.fetch(
      new Request(`http://sdk-backend.local/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ workspace_id: workspaceId, ...body }),
      }),
    )
    expect(response.status).toBe(200)
    return response.json() as Promise<{ readonly success: true; readonly data: unknown }>
  }

  const summary = await post("home/summary")
  expect(summary.data).toMatchObject({
    connected_plugins_count: 2,
    agents_connected_count: 1,
  })

  const members = await post("workspaces/members/list")
  expect(members.data).toMatchObject({ total: 1 })

  const invite = await post("workspaces/invites/send", {
    email: "teammate@example.com",
    role: "member",
  })
  expect(invite.data).toMatchObject({
    email: "teammate@example.com",
    status: "pending",
  })

  const workflows = await post("workflows/list", { scope: "native" })
  const workflowList = workflows.data as { readonly workflows: readonly { readonly id: string }[] }
  expect(Array.isArray(workflowList.workflows)).toBe(true)
  expect(workflowList.workflows.length).toBeGreaterThan(0)

  const workflow = await post("workflows/get", { id: workflowList.workflows[0]?.id })
  expect(workflow.data).toHaveProperty("body_markdown")

  const apps = await post("orbit/apps/list")
  expect(apps.data).toMatchObject({ count: 1 })

  const jobs = await post("orbit/jobs/list")
  expect(jobs.data).toMatchObject({ count: 3 })

  const run = await post("orbit/jobs/run", {
    name: "sdk-ping",
    input: { message: "hello" },
  })
  expect(run.data).toMatchObject({ ok: true, job: "sdk-ping" })

  const chat = await post("agent-chat/messages/send", { message: "hello" })
  expect(chat.data).toMatchObject({
    thread: { status: "completed" },
  })
})

test("streams agent chat events as SSE", async () => {
  const server = createHarborSdkBackendServer({ env: "dev" })
  const send = await server.fetch(
    new Request("http://sdk-backend.local/agent-chat/messages/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspace_id: server.state.workspace.id, message: "stream me" }),
    }),
  )
  const body = await send.json() as {
    readonly data: { readonly thread: { readonly id: string } }
  }
  const stream = await server.fetch(
    new Request(`http://sdk-backend.local/agent-chat/events/stream?thread_id=${body.data.thread.id}`),
  )
  expect(stream.status).toBe(200)
  expect(stream.headers.get("content-type")).toContain("text/event-stream")
  expect(await stream.text()).toContain("event: agent_chat_event")
})

test("serves browser-openable backend and Orbit app pages", async () => {
  const server = createHarborSdkBackendServer({ env: "staging" })

  const root = await server.fetch(new Request("http://sdk-backend.local/"))
  expect(root.status).toBe(200)
  expect(root.headers.get("content-type")).toContain("text/html")
  expect(await root.text()).toContain("Harbor SDK Backend")

  const app = await server.fetch(new Request("http://sdk-backend.local/orbit/apps/sdk-dashboard"))
  expect(app.status).toBe(200)
  expect(app.headers.get("content-type")).toContain("text/html")
  expect(await app.text()).toContain("sdk-dashboard")
})

test("loads backend env files and exposes redacted Cloudflare readiness", async () => {
  const loaded = await loadBackendEnvFile({ env: "staging" })
  expect(loaded.path.endsWith("apps/harbor-backend/.env.staging")).toBe(true)
  process.env["R2_BUCKET_NAME"] = "hbr3-staging-artifacts"
  process.env["QUEUE_NAME"] = "hbr3-staging-events"

  const server = createHarborSdkBackendServer({ env: "staging" })
  const response = await server.fetch(new Request("http://sdk-backend.local/health"))
  const body = await response.json() as {
    readonly environment: string
    readonly cloudflare: {
      readonly mode: string
      readonly r2_bucket_name: string | null
      readonly queue_name: string | null
    }
  }

  expect(body.environment).toBe("staging")
  expect(body.cloudflare.mode).toBe("staging")
  expect(body.cloudflare.r2_bucket_name).toBe("hbr3-staging-artifacts")
  expect(body.cloudflare.queue_name).toBe("hbr3-staging-events")
})

test("checks Cloudflare staging connection with redacted credentials", async () => {
  const previousAccount = process.env["CLOUDFLARE_ACCOUNT_ID"]
  const previousToken = process.env["CLOUDFLARE_API_TOKEN"]
  process.env["CLOUDFLARE_ACCOUNT_ID"] = "account_123"
  process.env["CLOUDFLARE_API_TOKEN"] = "token_secret"

  const result = await checkCloudflareStagingConnection({
    fetch: async (input, init) => {
      expect(String(input)).toBe("https://api.cloudflare.com/client/v4/accounts/account_123")
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer token_secret")
      return new Response(
        JSON.stringify({ success: true, result: { name: "staging-account" } }),
        { headers: { "content-type": "application/json" } },
      )
    },
  })

  expect(result).toEqual({
    configured: true,
    ok: true,
    status: 200,
    account_id_present: true,
    api_token_present: true,
    account_name: "staging-account",
  })

  if (previousAccount === undefined) delete process.env["CLOUDFLARE_ACCOUNT_ID"]
  else process.env["CLOUDFLARE_ACCOUNT_ID"] = previousAccount
  if (previousToken === undefined) delete process.env["CLOUDFLARE_API_TOKEN"]
  else process.env["CLOUDFLARE_API_TOKEN"] = previousToken
})
