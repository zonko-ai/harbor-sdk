import type { OrbitAppJobRef, OrbitAppRoute } from "./apps"
import {
  createInlineSourceRef,
  createOrbitPlatform,
  type OrbitAppDeploymentRecord,
  type OrbitAppRecord,
  type OrbitAppVersionRecordRow,
  type OrbitDeploymentProvider,
  type OrbitJobDeploymentRecord,
  type OrbitJobRecord,
  type OrbitJobVersionRecordRow,
  type OrbitPlatform,
  type OrbitPlatformRepository,
  type OrbitSourceStore,
  type OrbitWorkspaceDatabaseProvider,
  type OrbitWorkspaceDatabaseRecord,
} from "./platform"

export interface CloudflareOrbitPlatformConfig {
  readonly accountId: string
  readonly apiToken: string
  readonly controlDatabaseId: string
  readonly r2Bucket?: {
    readonly put: (key: string, value: string, options?: { readonly httpMetadata?: { readonly contentType?: string } }) => Promise<unknown>
  } | undefined
  readonly jobDispatchNamespace: string
  readonly appDispatchNamespace: string
  readonly apiBaseUrl: string
  readonly appsBaseUrl: string
  readonly apiServiceName?: string | undefined
  readonly fetch?: typeof fetch | undefined
}

export interface CloudflareOrbitWorkspaceBootstrapInput {
  readonly workspaceId: string
  readonly workspaceName: string
  readonly workspaceSlug: string
  readonly userId: string
  readonly email: string
  readonly name?: string | null | undefined
  readonly avatarUrl?: string | null | undefined
}

export interface CloudflareOrbitWorkspaceBootstrapResult {
  readonly workspaceId: string
  readonly userId: string
}

interface CloudflareEnvelope<T> {
  readonly success?: boolean
  readonly result?: T
  readonly errors?: readonly { readonly message?: string }[]
}

interface D1Result<T> {
  readonly results?: readonly T[]
  readonly success?: boolean
  readonly meta?: { readonly changes?: number }
}

const MAIN_MODULE = "worker.js"
const USER_MODULE = "user-job.js"
const WORKSPACE_DB_BINDING = "__HRBR_WORKSPACE_DB"

function cfError(json: CloudflareEnvelope<unknown>, fallback: string): string {
  return json.errors?.map((error) => error.message).filter(Boolean).join("; ") || fallback
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function query<T>(
  config: CloudflareOrbitPlatformConfig,
  statements: { readonly sql: string; readonly params?: readonly unknown[] } | readonly { readonly sql: string; readonly params?: readonly unknown[] }[],
): Promise<readonly D1Result<T>[]> {
  if (Array.isArray(statements)) {
    const results: D1Result<T>[] = []
    for (const statement of statements) results.push(...await query<T>(config, statement))
    return results
  }
  const fetchImpl = config.fetch ?? fetch
  const response = await fetchImpl(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/d1/database/${encodeURIComponent(config.controlDatabaseId)}/query`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(statements),
    },
  )
  const json = await response.json() as CloudflareEnvelope<D1Result<T> | D1Result<T>[]>
  if (!response.ok || json.success !== true || !json.result) {
    throw new Error(cfError(json, `Cloudflare D1 query failed with HTTP ${response.status}`))
  }
  return Array.isArray(json.result) ? json.result : [json.result]
}

async function first<T>(
  config: CloudflareOrbitPlatformConfig,
  sql: string,
  params: readonly unknown[],
): Promise<T | null> {
  const [result] = await query<T>(config, { sql, params })
  return result?.results?.[0] ?? null
}

function one<T>(value: T | null, message: string): T {
  if (!value) throw new Error(message)
  return value
}

export async function ensureCloudflareOrbitWorkspace(
  config: CloudflareOrbitPlatformConfig,
  input: CloudflareOrbitWorkspaceBootstrapInput,
): Promise<CloudflareOrbitWorkspaceBootstrapResult> {
  const existingUser = await first<{ readonly id: string }>(
    config,
    "SELECT id FROM users WHERE id = ? OR email = ? LIMIT 1",
    [input.userId, input.email],
  )
  const userId = existingUser?.id ?? input.userId
  const displayName = input.name ?? null
  const avatarUrl = input.avatarUrl ?? null

  if (existingUser) {
    await query(config, {
      sql: "UPDATE users SET email = ?, name = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?",
      params: [input.email, displayName, avatarUrl, userId],
    })
  } else {
    await query(config, {
      sql: "INSERT INTO users (id, email, name, avatar_url, workos_user_id) VALUES (?, ?, ?, ?, ?)",
      params: [userId, input.email, displayName, avatarUrl, `sdk:${userId}`],
    })
  }

  await query(config, [
    {
      sql: `INSERT INTO workspaces (id, name, slug, created_by)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          slug = excluded.slug,
          created_by = excluded.created_by,
          updated_at = datetime('now'),
          deleted_at = NULL`,
      params: [input.workspaceId, input.workspaceName, input.workspaceSlug, userId],
    },
    {
      sql: `INSERT INTO workspace_members (id, workspace_id, user_id, role, onboarded_at)
        VALUES (?, ?, ?, 'owner', datetime('now'))
        ON CONFLICT(workspace_id, user_id) DO UPDATE SET
          role = 'owner',
          onboarded_at = COALESCE(workspace_members.onboarded_at, datetime('now'))`,
      params: [crypto.randomUUID(), input.workspaceId, userId],
    },
  ])

  return { workspaceId: input.workspaceId, userId }
}

export function createCloudflareD1OrbitRepository(config: CloudflareOrbitPlatformConfig): OrbitPlatformRepository {
  return {
    getOrCreateJob: async (input) => {
      const existing = await first<OrbitJobRecord>(config, "SELECT * FROM orbit_jobs WHERE workspace_id = ? AND name = ?", [input.workspaceId, input.name])
      if (existing) return existing
      const id = crypto.randomUUID()
      await query(config, {
        sql: "INSERT INTO orbit_jobs (id, workspace_id, name, description, status, created_by) VALUES (?, ?, ?, ?, 'ready', ?)",
        params: [id, input.workspaceId, input.name, input.description, input.createdBy],
      })
      return one(await first<OrbitJobRecord>(config, "SELECT * FROM orbit_jobs WHERE workspace_id = ? AND id = ?", [input.workspaceId, id]), "Inserted Orbit job was not readable")
    },
    listJobs: async (input) => (await query<OrbitJobRecord>(config, {
      sql: "SELECT * FROM orbit_jobs WHERE workspace_id = ? AND status = 'ready' ORDER BY created_at DESC LIMIT ? OFFSET ?",
      params: [input.workspaceId, input.limit, input.offset],
    }))[0]?.results ?? [],
    countJobs: async (workspaceId) => (await first<{ readonly count: number }>(config, "SELECT COUNT(*) AS count FROM orbit_jobs WHERE workspace_id = ? AND status = 'ready'", [workspaceId]))?.count ?? 0,
    getJobByName: (workspaceId, name) => first(config, "SELECT * FROM orbit_jobs WHERE workspace_id = ? AND name = ?", [workspaceId, name]),
    nextJobVersion: async (workspaceId, jobId) => (await first<{ readonly next_version: number }>(config, "SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM orbit_job_versions WHERE workspace_id = ? AND job_id = ?", [workspaceId, jobId]))?.next_version ?? 1,
    createJobVersion: async (row) => {
      await query(config, {
        sql: `INSERT INTO orbit_job_versions (
          id, workspace_id, job_id, version, version_name, description, source_ref, code_hash,
          input_schema, output_schema, capabilities, lane, policy, status, error_message, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [row.id, row.workspace_id, row.job_id, row.version, row.version_name, row.description, row.source_ref, row.code_hash, row.input_schema, row.output_schema, row.capabilities, row.lane, row.policy, row.status, row.error_message, row.created_by],
      })
      return one(await first<OrbitJobVersionRecordRow>(config, "SELECT * FROM orbit_job_versions WHERE workspace_id = ? AND id = ?", [row.workspace_id, row.id]), "Inserted Orbit job version was not readable")
    },
    listJobVersions: async (workspaceId, jobId) => (await query<OrbitJobVersionRecordRow>(config, {
      sql: "SELECT * FROM orbit_job_versions WHERE workspace_id = ? AND job_id = ? ORDER BY version DESC",
      params: [workspaceId, jobId],
    }))[0]?.results ?? [],
    insertJobDeployment: async (row) => {
      await query(config, {
        sql: `INSERT INTO orbit_job_deployments (
          id, workspace_id, job_id, version_id, lane, provider, deployment_ref, dispatch_namespace, status, policy, created_by, promoted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        params: [row.id, row.workspace_id, row.job_id, row.version_id, row.lane, row.provider, row.deployment_ref, row.dispatch_namespace, row.status, row.policy, row.created_by],
      })
      return one(await first<OrbitJobDeploymentRecord>(config, "SELECT * FROM orbit_job_deployments WHERE workspace_id = ? AND id = ?", [row.workspace_id, row.id]), "Inserted Orbit job deployment was not readable")
    },
    markJobReady: async (workspaceId, jobId, versionId, deploymentId, description) => {
      await query(config, [
        { sql: "UPDATE orbit_job_versions SET status = 'ready', lane = (SELECT lane FROM orbit_job_deployments WHERE id = ?) WHERE id = ?", params: [deploymentId, versionId] },
        { sql: "UPDATE orbit_jobs SET latest_version_id = ?, description = COALESCE(?, description), status = 'ready', updated_at = datetime('now') WHERE workspace_id = ? AND id = ?", params: [versionId, description, workspaceId, jobId] },
      ])
    },
    getReadyJobDeployment: (workspaceId, versionId) => first(config, "SELECT * FROM orbit_job_deployments WHERE workspace_id = ? AND version_id = ? AND lane = 'worker_platform' AND status = 'ready' ORDER BY promoted_at DESC LIMIT 1", [workspaceId, versionId]),

    getOrCreateApp: async (input) => {
      const existing = await first<OrbitAppRecord>(config, "SELECT * FROM orbit_apps WHERE workspace_id = ? AND name = ?", [input.workspaceId, input.name])
      if (existing) return existing
      const id = crypto.randomUUID()
      await query(config, {
        sql: "INSERT INTO orbit_apps (id, workspace_id, name, description, status, created_by) VALUES (?, ?, ?, ?, 'ready', ?)",
        params: [id, input.workspaceId, input.name, input.description, input.createdBy],
      })
      return one(await first<OrbitAppRecord>(config, "SELECT * FROM orbit_apps WHERE workspace_id = ? AND id = ?", [input.workspaceId, id]), "Inserted Orbit app was not readable")
    },
    listApps: async (input) => (await query<OrbitAppRecord>(config, {
      sql: "SELECT * FROM orbit_apps WHERE workspace_id = ? AND status = 'ready' ORDER BY created_at DESC LIMIT ? OFFSET ?",
      params: [input.workspaceId, input.limit, input.offset],
    }))[0]?.results ?? [],
    countApps: async (workspaceId) => (await first<{ readonly count: number }>(config, "SELECT COUNT(*) AS count FROM orbit_apps WHERE workspace_id = ? AND status = 'ready'", [workspaceId]))?.count ?? 0,
    getAppByName: (workspaceId, name) => first(config, "SELECT * FROM orbit_apps WHERE workspace_id = ? AND name = ?", [workspaceId, name]),
    nextAppVersion: async (workspaceId, appId) => (await first<{ readonly next_version: number }>(config, "SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM orbit_app_versions WHERE workspace_id = ? AND app_id = ?", [workspaceId, appId]))?.next_version ?? 1,
    createAppVersion: async (row) => {
      await query(config, {
        sql: `INSERT INTO orbit_app_versions (
          id, workspace_id, app_id, version, version_name, description, source_ref,
          code_hash, route_manifest, job_manifest, policy, status, error_message, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params: [row.id, row.workspace_id, row.app_id, row.version, row.version_name, row.description, row.source_ref, row.code_hash, row.route_manifest, row.job_manifest, row.policy, row.status, row.error_message, row.created_by],
      })
      return one(await first<OrbitAppVersionRecordRow>(config, "SELECT * FROM orbit_app_versions WHERE workspace_id = ? AND id = ?", [row.workspace_id, row.id]), "Inserted Orbit app version was not readable")
    },
    listAppVersions: async (workspaceId, appId) => (await query<OrbitAppVersionRecordRow>(config, {
      sql: "SELECT * FROM orbit_app_versions WHERE workspace_id = ? AND app_id = ? ORDER BY version DESC",
      params: [workspaceId, appId],
    }))[0]?.results ?? [],
    insertAppDeployment: async (row) => {
      await query(config, {
        sql: `INSERT INTO orbit_app_deployments (
          id, workspace_id, app_id, version_id, provider, deployment_ref, dispatch_namespace, public_url, status, policy, created_by, deployed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        params: [row.id, row.workspace_id, row.app_id, row.version_id, row.provider, row.deployment_ref, row.dispatch_namespace, row.public_url, row.status, row.policy, row.created_by],
      })
      return one(await first<OrbitAppDeploymentRecord>(config, "SELECT * FROM orbit_app_deployments WHERE workspace_id = ? AND id = ?", [row.workspace_id, row.id]), "Inserted Orbit app deployment was not readable")
    },
    markAppReady: async (workspaceId, appId, versionId, description, publicUrl) => {
      await query(config, {
        sql: "UPDATE orbit_apps SET latest_version_id = ?, description = COALESCE(?, description), public_url = ?, status = 'ready', updated_at = datetime('now') WHERE workspace_id = ? AND id = ?",
        params: [versionId, description, publicUrl, workspaceId, appId],
      })
    },
    getReadyAppDeploymentByName: (workspaceId, name) => first(config, `SELECT d.*, v.route_manifest AS route_manifest, v.job_manifest AS job_manifest, a.name AS app_name
      FROM orbit_app_deployments d
      INNER JOIN orbit_apps a ON a.id = d.app_id
      INNER JOIN orbit_app_versions v ON v.id = d.version_id
      WHERE d.workspace_id = ? AND a.name = ? AND a.status = 'ready' AND v.status = 'ready' AND d.status = 'ready'
      ORDER BY d.deployed_at DESC LIMIT 1`, [workspaceId, name]),
  }
}

export function createCloudflareSourceStore(config: CloudflareOrbitPlatformConfig): OrbitSourceStore {
  return {
    putJobSource: async (input) => {
      const ref = await createInlineSourceRef(input.code)
      if (config.r2Bucket) {
        const key = `${input.workspaceId}/orbit/jobs/${input.jobId}/${input.versionId}/source.ts`
        await config.r2Bucket.put(key, input.code, { httpMetadata: { contentType: "text/typescript; charset=utf-8" } })
        return { ...ref, kind: "r2", key }
      }
      return ref
    },
    putAppSource: async (input) => {
      const ref = await createInlineSourceRef(input.code)
      if (config.r2Bucket) {
        const key = `${input.workspaceId}/orbit/apps/${input.appId}/${input.versionId}/source.ts`
        await config.r2Bucket.put(key, input.code, { httpMetadata: { contentType: "text/typescript; charset=utf-8" } })
        return { ...ref, kind: "r2", key }
      }
      return ref
    },
  }
}

interface CloudflareD1Database {
  readonly uuid?: string
  readonly name?: string
}

async function findD1DatabaseByName(config: CloudflareOrbitPlatformConfig, name: string): Promise<CloudflareD1Database | null> {
  const response = await (config.fetch ?? fetch)(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/d1/database?name=${encodeURIComponent(name)}`,
    { headers: { authorization: `Bearer ${config.apiToken}` } },
  )
  const json = await response.json() as CloudflareEnvelope<readonly CloudflareD1Database[]>
  if (!response.ok || json.success !== true) {
    throw new Error(cfError(json, `Cloudflare D1 list failed with HTTP ${response.status}`))
  }
  return json.result?.find((database) => database.name === name && database.uuid) ?? null
}

async function createOrFindD1Database(config: CloudflareOrbitPlatformConfig, name: string): Promise<CloudflareD1Database> {
  const existing = await findD1DatabaseByName(config, name)
  if (existing?.uuid) return existing

  const response = await (config.fetch ?? fetch)(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/d1/database`,
    {
      method: "POST",
      headers: { authorization: `Bearer ${config.apiToken}`, "content-type": "application/json" },
      body: JSON.stringify({ name }),
    },
  )
  const json = await response.json() as CloudflareEnvelope<CloudflareD1Database>
  if (!response.ok || json.success !== true || !json.result?.uuid) {
    const afterConflict = await findD1DatabaseByName(config, name)
    if (afterConflict?.uuid) return afterConflict
    throw new Error(cfError(json, `Cloudflare D1 create failed with HTTP ${response.status}`))
  }
  return json.result
}

export function createCloudflareWorkspaceDatabaseProvider(config: CloudflareOrbitPlatformConfig): OrbitWorkspaceDatabaseProvider {
  return {
    ensure: async (workspaceId) => {
      const existing = await first<OrbitWorkspaceDatabaseRecord>(config, "SELECT * FROM workspace_databases WHERE workspace_id = ?", [workspaceId])
      if (existing?.status === "ready") return existing
      const name = `hbr_${workspaceId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 58)}`
      const database = await createOrFindD1Database(config, name)
      const databaseId = one(database.uuid ?? null, "Cloudflare D1 database id was missing")
      await query(config, {
        sql: `INSERT INTO workspace_databases (workspace_id, cf_database_id, cf_database_name, status)
          VALUES (?, ?, ?, 'ready')
          ON CONFLICT(workspace_id) DO UPDATE SET cf_database_id = ?, cf_database_name = ?, status = 'ready', error_message = NULL, updated_at = datetime('now')`,
        params: [workspaceId, databaseId, database.name ?? name, databaseId, database.name ?? name],
      })
      return one(await first<OrbitWorkspaceDatabaseRecord>(config, "SELECT * FROM workspace_databases WHERE workspace_id = ?", [workspaceId]), "Workspace database was not readable after creation")
    },
  }
}

function prepareClassicJobSource(userSource: string): string {
  return userSource.replace(/^\s*import\s+.*?;?\s*$/gm, "").replace(/export\s+default\s+/, "const __job = ")
}

function jobWorkerModule(input: { readonly userSource: string; readonly hostUrl: string; readonly workspaceId: string; readonly deploymentRef: string; readonly hostCallSecret: string; readonly runtime: "classic" | "bundled" }): string {
  const classic = input.runtime === "classic" ? prepareClassicJobSource(input.userSource) : ""
  const bundled = input.runtime === "bundled" ? `import __job from "./${USER_MODULE}";` : ""
  return `// Auto-generated by @hrbr/orbit/cloudflare.
${bundled}
${input.runtime === "classic" ? "const defineOrbitJob = (definition) => definition;" : ""}
const __HOST_URL = ${JSON.stringify(input.hostUrl)};
const __WORKSPACE_ID = ${JSON.stringify(input.workspaceId)};
const __DEPLOYMENT_REF = ${JSON.stringify(input.deploymentRef)};
const __HOST_CALL_SECRET = ${JSON.stringify(input.hostCallSecret)};
${classic}
if (!__job || typeof __job.handler !== "function") throw new Error("INVALID_JOB_DEFINITION");
export default {
  async fetch(request, env) {
    if (request.method === "GET" && new URL(request.url).pathname === "/__hrbr/health") return Response.json({ ok: true, kind: "orbit_job", workspace_id: __WORKSPACE_ID, deployment_ref: __DEPLOYMENT_REF });
    if (request.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });
    const payload = await request.json().catch(() => ({}));
    const input = payload && typeof payload === "object" ? payload.input : undefined;
    const orbit = { db: env?.${WORKSPACE_DB_BINDING} };
    const plugins = {};
    try {
      const output = await __job.handler({ orbit, plugins }, input);
      return Response.json({ ok: true, output });
    } catch (error) {
      return Response.json({ ok: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
  }
};`
}

function prepareClassicAppSource(appSource: string): string {
  return appSource.replace(/^\s*import\s+.*?;?\s*$/gm, "").replace(/export\s+default\s+/, "const __app = ")
}

function appWorkerModule(input: { readonly appSource: string; readonly hostUrl: string; readonly workspaceId: string; readonly deploymentRef: string; readonly hostCallSecret: string; readonly routes: readonly OrbitAppRoute[]; readonly jobs: Readonly<Record<string, OrbitAppJobRef>>; readonly runtime: "classic" | "bundled" }): string {
  const source = input.runtime === "classic" ? prepareClassicAppSource(input.appSource) : input.appSource.replace(/export\s+default\s+/, "const __app = ")
  return `// Auto-generated by @hrbr/orbit/cloudflare.
const defineOrbitApp = (definition) => definition;
const __ROUTES = ${JSON.stringify(input.routes)};
const __JOBS = ${JSON.stringify(input.jobs)};
${source}
if (!__app || typeof __app !== "object") throw new Error("INVALID_APP_DEFINITION");
async function readInput(request, route) {
  if (route.input === "none") return {};
  if (route.input === "query") return Object.fromEntries(new URL(request.url).searchParams.entries());
  if (route.input === "json") return await request.json();
  if (route.input === "form") return Object.fromEntries((await request.formData()).entries());
  if (route.input === "raw") return { body: await request.text() };
  return {};
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/__hrbr/health") return Response.json({ ok: true, kind: "orbit_app", routes: __ROUTES.length, jobs: Object.keys(__JOBS).length });
    if (typeof __app.fetch === "function") return __app.fetch(request, env, ctx);
    const route = __ROUTES.find((candidate) => candidate.method === request.method && candidate.path === url.pathname);
    if (!route) return new Response("Not found", { status: 404 });
    if (route.static_html && !route.job) return new Response(route.static_html, { headers: { "content-type": "text/html; charset=utf-8" } });
    const input = await readInput(request, route);
    return Response.json({ ok: true, input, route: route.id ?? route.path });
  }
};`
}

async function uploadDispatchScript(config: CloudflareOrbitPlatformConfig, namespace: string, scriptName: string, modules: readonly { readonly name: string; readonly source: string }[], bindings: readonly Record<string, unknown>[]): Promise<void> {
  const form = new FormData()
  form.append("metadata", new Blob([JSON.stringify({
    main_module: MAIN_MODULE,
    compatibility_date: "2026-05-12",
    compatibility_flags: ["nodejs_compat"],
    limits: { cpu_ms: 300000 },
    bindings,
  })], { type: "application/json" }), "metadata.json")
  for (const module of modules) {
    form.append(module.name, new Blob([module.source], { type: "application/javascript+module" }), module.name)
  }
  const response = await (config.fetch ?? fetch)(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/workers/dispatch/namespaces/${encodeURIComponent(namespace)}/scripts/${encodeURIComponent(scriptName)}`,
    { method: "PUT", headers: { authorization: `Bearer ${config.apiToken}` }, body: form },
  )
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(`Cloudflare WFP upload failed with HTTP ${response.status}: ${text.slice(0, 500)}`)
  }
}

export function createCloudflareWfpDeploymentProvider(config: CloudflareOrbitPlatformConfig): OrbitDeploymentProvider {
  const apiServiceName = config.apiServiceName ?? (config.apiBaseUrl.includes("stag") ? "hbr3-staging" : "hbr3")
  return {
    jobDispatchNamespace: config.jobDispatchNamespace,
    appDispatchNamespace: config.appDispatchNamespace,
    uploadJob: async (input) => {
      const modules = [
        {
          name: MAIN_MODULE,
          source: jobWorkerModule({
            userSource: input.code,
            hostUrl: config.apiBaseUrl.replace(/\/+$/, ""),
            workspaceId: input.workspaceId,
            deploymentRef: input.scriptName,
            hostCallSecret: input.hostCallSecret,
            runtime: input.runtime,
          }),
        },
      ]
      if (input.runtime === "bundled") modules.push({ name: USER_MODULE, source: input.code })
      await uploadDispatchScript(config, config.jobDispatchNamespace, input.scriptName, modules, [
        { type: "service", name: "HARBOR_API", service: apiServiceName },
        { type: "d1", name: WORKSPACE_DB_BINDING, database_id: input.workspaceDatabaseId },
      ])
    },
    uploadApp: async (input) => {
      await uploadDispatchScript(config, config.appDispatchNamespace, input.scriptName, [{
        name: MAIN_MODULE,
        source: appWorkerModule({
          appSource: input.code,
          hostUrl: config.apiBaseUrl.replace(/\/+$/, ""),
          workspaceId: input.workspaceId,
          deploymentRef: input.scriptName,
          hostCallSecret: input.hostCallSecret,
          routes: input.routes,
          jobs: input.jobs,
          runtime: input.runtime,
        }),
      }], [{ type: "service", name: "HARBOR_API", service: apiServiceName }])
    },
  }
}

export function createCloudflareOrbitPlatform(config: CloudflareOrbitPlatformConfig): OrbitPlatform {
  return createOrbitPlatform({
    repository: createCloudflareD1OrbitRepository(config),
    sourceStore: createCloudflareSourceStore(config),
    workspaceDatabaseProvider: createCloudflareWorkspaceDatabaseProvider(config),
    deploymentProvider: createCloudflareWfpDeploymentProvider(config),
    config: { appsBaseUrl: config.appsBaseUrl },
  })
}
