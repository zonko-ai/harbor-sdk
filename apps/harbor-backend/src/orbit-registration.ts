import { createCloudflareOrbitPlatform, ensureCloudflareOrbitWorkspace } from "@hrbr/orbit/cloudflare"
import type { OrbitAppRoute } from "@hrbr/orbit"
import type { BackendState } from "./state"

const DEFAULT_USER_ID = "33333333-3333-4333-8333-333333333333"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required`)
  return value
}

function isStaging(): boolean {
  return process.env["HARBOR_SDK_BACKEND_ENV"] === "staging" ||
    (process.env["API_BASE_URL"] ?? process.env["HRBR_API_URL"] ?? "").includes("stag")
}

function appsBaseUrl(): string {
  return process.env["ORBIT_APPS_BASE_URL"] ?? (isStaging() ? "https://apps.stag.tryharbor.ai" : "https://apps.tryharbor.ai")
}

function apiBaseUrl(): string {
  return process.env["API_BASE_URL"] ?? process.env["HRBR_API_URL"] ?? (isStaging() ? "https://stagapi.tryharbor.ai" : "https://api.tryharbor.ai")
}

function staticDashboardHtml(state: BackendState): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>SDK Dashboard</title>
  </head>
  <body>
    <main>
      <h1>SDK Dashboard</h1>
      <p>This app was registered through @hrbr/orbit and deployed on Cloudflare Workers for Platforms.</p>
      <p>Workspace: <code>${state.workspaceProfile.id}</code></p>
      <p>Environment: <code>${state.env}</code></p>
    </main>
  </body>
</html>`
}

export async function registerDefaultOrbitOnCloudflare(
  state: BackendState,
): Promise<{ readonly url: string }> {
  const cloudflareConfig = {
    accountId: requireEnv("CLOUDFLARE_ACCOUNT_ID"),
    apiToken: process.env["CLOUDFLARE_API_TOKEN"] ?? requireEnv("CLOUDFLARE_TOKEN"),
    controlDatabaseId: requireEnv("D1_DATABASE_ID"),
    jobDispatchNamespace: process.env["DISPATCH_NAMESPACE"] ?? (isStaging() ? "hbr3-staging-jobs" : "hbr3-jobs"),
    appDispatchNamespace: process.env["APP_DISPATCH_NAMESPACE"] ?? (isStaging() ? "hbr3-staging-apps" : "hbr3-apps"),
    apiBaseUrl: apiBaseUrl(),
    appsBaseUrl: appsBaseUrl(),
  }

  const bootstrap = await ensureCloudflareOrbitWorkspace(cloudflareConfig, {
    workspaceId: state.workspaceProfile.id,
    workspaceName: state.workspaceProfile.name,
    workspaceSlug: state.workspaceProfile.slug,
    userId: DEFAULT_USER_ID,
    email: state.userProfile.email,
    name: state.userProfile.name,
    avatarUrl: state.userProfile.avatar_url,
  })
  const platform = createCloudflareOrbitPlatform(cloudflareConfig)

  const job = await platform.publishJob({
    workspace_id: state.workspaceProfile.id,
    name: "sdk-dashboard-job",
    description: "SDK-backed sample Orbit job",
    code: "export default defineOrbitJob({ async handler(_ctx, input) { return { ok: true, input, backend: 'harbor-sdk' } } })",
    input_schema: { type: "object", properties: {}, required: [], additionalProperties: true },
    output_schema: { type: "object", properties: { ok: { type: "boolean" } } },
    capabilities: ["data"],
    allow_generic_schema: true,
  }, bootstrap.userId)

  const routes: OrbitAppRoute[] = [{
    id: "home",
    title: "SDK Dashboard",
    method: "GET",
    path: "/",
    auth: "public",
    input: "none",
    output: "html",
    static_html: staticDashboardHtml(state),
  }]

  const app = await platform.publishApp({
    workspace_id: state.workspaceProfile.id,
    name: "sdk-dashboard",
    description: "SDK-backed Orbit app deployed through Cloudflare",
    code: "export default defineOrbitApp({ name: 'sdk-dashboard' })",
    routes,
    jobs: {
      sdk: { name: job.job.name, version: job.job.version },
    },
  }, bootstrap.userId)

  return { url: app.app.url }
}
