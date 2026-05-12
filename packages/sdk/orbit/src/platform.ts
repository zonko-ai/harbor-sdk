import type {
  OrbitAppDetail,
  OrbitAppJobRef,
  OrbitAppPublishBody,
  OrbitAppPublishResponse,
  OrbitAppRoute,
  OrbitAppSummary,
  OrbitAppVersionRecord,
} from "./apps"
import type {
  OrbitJobCapability,
  OrbitJobDetail,
  OrbitJobPublishBody,
  OrbitJobPublishResponse,
  OrbitJobSummary,
  OrbitJobVersionRecord,
} from "./jobs"

export type OrbitDeploymentProviderKind = "cloudflare_wfp" | "cloudflare_container" | "local"
export type OrbitDeploymentStatus = "deploying" | "promoting" | "ready" | "failed" | "disabled"

export interface OrbitStoredSourceRef {
  readonly kind: string
  readonly key?: string | undefined
  readonly sha256: string
}

export interface OrbitJobRecord {
  readonly id: string
  readonly workspace_id: string
  readonly name: string
  readonly description: string | null
  readonly status: "ready" | "disabled" | "failed"
  readonly latest_version_id: string | null
  readonly created_by: string
  readonly created_at: string
  readonly updated_at: string
}

export interface OrbitJobVersionRecordRow {
  readonly id: string
  readonly workspace_id: string
  readonly job_id: string
  readonly version: number
  readonly version_name: string
  readonly description: string | null
  readonly source_ref: string
  readonly code_hash: string
  readonly input_schema: string
  readonly output_schema: string | null
  readonly capabilities: string
  readonly lane: "dynamic_worker" | "worker_platform" | "container" | "local_host"
  readonly policy: string
  readonly status: "validating" | "ready" | "failed" | "disabled"
  readonly error_message: string | null
  readonly created_by: string
  readonly created_at: string
}

export interface OrbitJobDeploymentRecord {
  readonly id: string
  readonly workspace_id: string
  readonly job_id: string
  readonly version_id: string
  readonly lane: "worker_platform" | "container" | "local_host"
  readonly provider: OrbitDeploymentProviderKind
  readonly deployment_ref: string
  readonly dispatch_namespace: string | null
  readonly status: OrbitDeploymentStatus
  readonly error_message: string | null
  readonly policy: string
  readonly created_by: string
  readonly created_at: string
  readonly promoted_at: string | null
  readonly disabled_at: string | null
}

export interface OrbitAppRecord {
  readonly id: string
  readonly workspace_id: string
  readonly name: string
  readonly description: string | null
  readonly status: "ready" | "disabled" | "failed"
  readonly latest_version_id: string | null
  readonly public_url: string | null
  readonly created_by: string
  readonly created_at: string
  readonly updated_at: string
}

export interface OrbitAppVersionRecordRow {
  readonly id: string
  readonly workspace_id: string
  readonly app_id: string
  readonly version: number
  readonly version_name: string
  readonly description: string | null
  readonly source_ref: string
  readonly code_hash: string
  readonly route_manifest: string
  readonly job_manifest: string
  readonly policy: string
  readonly status: "validating" | "ready" | "failed" | "disabled"
  readonly error_message: string | null
  readonly created_by: string
  readonly created_at: string
}

export interface OrbitAppDeploymentRecord {
  readonly id: string
  readonly workspace_id: string
  readonly app_id: string
  readonly version_id: string
  readonly provider: "cloudflare_wfp"
  readonly deployment_ref: string
  readonly dispatch_namespace: string | null
  readonly public_url: string
  readonly status: OrbitDeploymentStatus
  readonly error_message: string | null
  readonly policy: string
  readonly created_by: string
  readonly created_at: string
  readonly deployed_at: string | null
  readonly disabled_at: string | null
}

export interface OrbitWorkspaceDatabaseRecord {
  readonly workspace_id: string
  readonly cf_database_id: string
  readonly cf_database_name: string
  readonly status: "creating" | "ready" | "failed" | "disabled"
  readonly error_message: string | null
}

export interface OrbitPlatformRepository {
  readonly getOrCreateJob: (input: {
    readonly workspaceId: string
    readonly name: string
    readonly description: string | null
    readonly createdBy: string
  }) => Promise<OrbitJobRecord>
  readonly listJobs: (input: { readonly workspaceId: string; readonly limit: number; readonly offset: number }) => Promise<readonly OrbitJobRecord[]>
  readonly countJobs: (workspaceId: string) => Promise<number>
  readonly getJobByName: (workspaceId: string, name: string) => Promise<OrbitJobRecord | null>
  readonly nextJobVersion: (workspaceId: string, jobId: string) => Promise<number>
  readonly createJobVersion: (row: Omit<OrbitJobVersionRecordRow, "created_at">) => Promise<OrbitJobVersionRecordRow>
  readonly listJobVersions: (workspaceId: string, jobId: string) => Promise<readonly OrbitJobVersionRecordRow[]>
  readonly insertJobDeployment: (row: Omit<OrbitJobDeploymentRecord, "created_at" | "promoted_at" | "disabled_at" | "error_message">) => Promise<OrbitJobDeploymentRecord>
  readonly markJobReady: (workspaceId: string, jobId: string, versionId: string, deploymentId: string, description: string | null) => Promise<void>
  readonly getReadyJobDeployment: (workspaceId: string, versionId: string) => Promise<OrbitJobDeploymentRecord | null>

  readonly getOrCreateApp: (input: {
    readonly workspaceId: string
    readonly name: string
    readonly description: string | null
    readonly createdBy: string
  }) => Promise<OrbitAppRecord>
  readonly listApps: (input: { readonly workspaceId: string; readonly limit: number; readonly offset: number }) => Promise<readonly OrbitAppRecord[]>
  readonly countApps: (workspaceId: string) => Promise<number>
  readonly getAppByName: (workspaceId: string, name: string) => Promise<OrbitAppRecord | null>
  readonly nextAppVersion: (workspaceId: string, appId: string) => Promise<number>
  readonly createAppVersion: (row: Omit<OrbitAppVersionRecordRow, "created_at">) => Promise<OrbitAppVersionRecordRow>
  readonly listAppVersions: (workspaceId: string, appId: string) => Promise<readonly OrbitAppVersionRecordRow[]>
  readonly insertAppDeployment: (row: Omit<OrbitAppDeploymentRecord, "created_at" | "deployed_at" | "disabled_at" | "error_message">) => Promise<OrbitAppDeploymentRecord>
  readonly markAppReady: (workspaceId: string, appId: string, versionId: string, description: string | null, publicUrl: string) => Promise<void>
  readonly getReadyAppDeploymentByName: (workspaceId: string, name: string) => Promise<(OrbitAppDeploymentRecord & {
    readonly route_manifest: string
    readonly job_manifest: string
    readonly app_name: string
  }) | null>
}

export interface OrbitSourceStore {
  readonly putJobSource: (input: {
    readonly workspaceId: string
    readonly jobId: string
    readonly versionId: string
    readonly code: string
  }) => Promise<OrbitStoredSourceRef>
  readonly putAppSource: (input: {
    readonly workspaceId: string
    readonly appId: string
    readonly versionId: string
    readonly code: string
  }) => Promise<OrbitStoredSourceRef>
}

export interface OrbitWorkspaceDatabaseProvider {
  readonly ensure: (workspaceId: string) => Promise<OrbitWorkspaceDatabaseRecord>
}

export interface OrbitDeploymentProvider {
  readonly uploadJob: (input: {
    readonly workspaceId: string
    readonly scriptName: string
    readonly code: string
    readonly runtime: "classic" | "bundled"
    readonly hostCallSecret: string
    readonly workspaceDatabaseId: string
  }) => Promise<void>
  readonly uploadApp: (input: {
    readonly workspaceId: string
    readonly scriptName: string
    readonly code: string
    readonly runtime: "classic" | "bundled"
    readonly hostCallSecret: string
    readonly routes: readonly OrbitAppRoute[]
    readonly jobs: Readonly<Record<string, OrbitAppJobRef>>
  }) => Promise<void>
  readonly deleteJob?: ((scriptName: string) => Promise<void>) | undefined
  readonly deleteApp?: ((scriptName: string) => Promise<void>) | undefined
  readonly jobDispatchNamespace?: string | null | undefined
  readonly appDispatchNamespace?: string | null | undefined
}

export interface OrbitPlatformConfig {
  readonly appsBaseUrl: string
}

export interface OrbitPlatformInput {
  readonly repository: OrbitPlatformRepository
  readonly sourceStore: OrbitSourceStore
  readonly deploymentProvider: OrbitDeploymentProvider
  readonly workspaceDatabaseProvider: OrbitWorkspaceDatabaseProvider
  readonly config: OrbitPlatformConfig
  readonly id?: (() => string) | undefined
  readonly now?: (() => Date) | undefined
  readonly secret?: (() => string) | undefined
}

export interface OrbitPlatform {
  readonly publishJob: (body: OrbitJobPublishBody, userId: string) => Promise<OrbitJobPublishResponse>
  readonly publishApp: (body: OrbitAppPublishBody, userId: string) => Promise<OrbitAppPublishResponse>
  readonly listJobs: (input: { readonly workspace_id: string; readonly limit?: number; readonly offset?: number }) => Promise<{ readonly jobs: readonly OrbitJobSummary[]; readonly count: number }>
  readonly inspectJob: (input: { readonly workspace_id: string; readonly name: string; readonly version?: string }) => Promise<{ readonly job: OrbitJobDetail }>
  readonly listApps: (input: { readonly workspace_id: string; readonly limit?: number; readonly offset?: number }) => Promise<{ readonly apps: readonly OrbitAppSummary[]; readonly count: number }>
  readonly inspectApp: (input: { readonly workspace_id: string; readonly name: string; readonly version?: string }) => Promise<{ readonly app: OrbitAppDetail }>
  readonly openApp: (input: { readonly workspace_id: string; readonly name: string; readonly path?: string }) => Promise<{ readonly name: string; readonly url: string }>
  readonly resolveGatewayApp: (input: { readonly workspace_id: string; readonly name: string }) => Promise<{
    readonly workspace_id: string
    readonly name: string
    readonly deployment_ref: string
    readonly version_id: string
    readonly routes: readonly OrbitAppRoute[]
  }>
}

function defaultId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `orbit_${Math.random().toString(36).slice(2)}`
}

function randomSecret(): string {
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")
}

function scriptName(prefix: string, id: string): string {
  return `${prefix}_${id.replace(/-/g, "").slice(0, 32)}`
}

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value) as unknown
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return []
  }
}

function parseJsonObject<T extends Record<string, unknown>>(value: string | null): T | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as unknown
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as T : null
  } catch {
    return null
  }
}

function routeAccess(routes: readonly OrbitAppRoute[]): "public" | "workspace_member" {
  return routes.length > 0 && routes.every((route) => route.auth === "public") ? "public" : "workspace_member"
}

function validateJobPublish(body: OrbitJobPublishBody): void {
  const issues: string[] = []
  if (!body.code.trim()) issues.push("Job source must not be blank")
  if ((body.runtime ?? "classic") === "bundled" && !body.bundle?.code) issues.push("Bundled job runtime requires bundle.code")
  if (body.capabilities && new Set(body.capabilities).size !== body.capabilities.length) issues.push("Job capabilities must be unique")
  if (issues.length > 0) throw new Error(`Orbit job publish failed: ${issues.join("; ")}`)
}

function validateAppPublish(body: OrbitAppPublishBody): void {
  const issues: string[] = []
  if (!body.code.trim()) issues.push("App source must not be blank")
  if ((body.runtime ?? "classic") === "bundled" && !body.bundle?.code) issues.push("Bundled app runtime requires bundle.code")
  if (body.routes.length === 0) issues.push("App routes must not be empty")
  if (Object.keys(body.jobs).length === 0) issues.push("App jobs must not be empty")
  const jobs = new Set(Object.keys(body.jobs))
  for (const route of body.routes) {
    if (!route.path.startsWith("/")) issues.push(`Route path '${route.path}' must start with /`)
    if (route.job && !jobs.has(route.job)) issues.push(`Route '${route.method} ${route.path}' references undeclared job alias '${route.job}'`)
  }
  if (issues.length > 0) throw new Error(`Orbit app publish failed: ${issues.join("; ")}`)
}

function jobSummary(row: OrbitJobRecord, versions: readonly OrbitJobVersionRecordRow[] = []): OrbitJobSummary {
  const latest = versions.find((version) => version.id === row.latest_version_id) ?? versions[0] ?? null
  return {
    name: row.name,
    description: row.description,
    latest_version: latest?.version_name ?? null,
    status: row.status,
    capabilities: latest ? parseJsonArray<OrbitJobCapability>(latest.capabilities) : [],
  }
}

function jobDetail(row: OrbitJobRecord, versions: readonly OrbitJobVersionRecordRow[], selected?: string): OrbitJobDetail {
  const version = selected
    ? versions.find((candidate) => candidate.version_name === selected) ?? null
    : versions.find((candidate) => candidate.id === row.latest_version_id) ?? versions[0] ?? null
  return {
    name: row.name,
    description: version?.description ?? row.description,
    latest_version: version?.version_name ?? null,
    status: row.status,
    capabilities: version ? parseJsonArray<OrbitJobCapability>(version.capabilities) : [],
    input_schema: parseJsonObject(version?.input_schema ?? null),
    output_schema: parseJsonObject(version?.output_schema ?? null),
    versions: versions.map((item): OrbitJobVersionRecord => ({
      version: item.version_name,
      status: item.status,
      lane: item.lane,
      capabilities: parseJsonArray<OrbitJobCapability>(item.capabilities),
      created_at: item.created_at,
      error_message: item.error_message,
    })),
  }
}

function appSummary(row: OrbitAppRecord, versions: readonly OrbitAppVersionRecordRow[] = []): OrbitAppSummary {
  const latest = versions.find((version) => version.id === row.latest_version_id) ?? versions[0] ?? null
  const routes = latest ? parseJsonArray<OrbitAppRoute>(latest.route_manifest) : []
  return {
    name: row.name,
    description: row.description,
    latest_version: latest?.version_name ?? null,
    status: row.status,
    url: row.public_url,
    access: routeAccess(routes),
  }
}

function appDetail(row: OrbitAppRecord, versions: readonly OrbitAppVersionRecordRow[], selected?: string): OrbitAppDetail {
  const version = selected
    ? versions.find((candidate) => candidate.version_name === selected) ?? null
    : versions.find((candidate) => candidate.id === row.latest_version_id) ?? versions[0] ?? null
  const routes = version ? parseJsonArray<OrbitAppRoute>(version.route_manifest) : []
  return {
    name: row.name,
    description: version?.description ?? row.description,
    latest_version: version?.version_name ?? null,
    status: row.status,
    url: row.public_url,
    access: routeAccess(routes),
    routes,
    jobs: parseJsonObject<Record<string, OrbitAppJobRef>>(version?.job_manifest ?? null) ?? {},
    versions: versions.map((item): OrbitAppVersionRecord => ({
      version: item.version_name,
      status: item.status,
      route_count: parseJsonArray<OrbitAppRoute>(item.route_manifest).length,
      job_count: Object.keys(parseJsonObject<Record<string, OrbitAppJobRef>>(item.job_manifest) ?? {}).length,
      created_at: item.created_at,
      error_message: item.error_message,
    })),
  }
}

export function createOrbitPlatform(input: OrbitPlatformInput): OrbitPlatform {
  const id = input.id ?? defaultId
  const now = input.now ?? (() => new Date())
  const secret = input.secret ?? randomSecret

  return {
    publishJob: async (body, userId) => {
      validateJobPublish(body)
      const job = await input.repository.getOrCreateJob({
        workspaceId: body.workspace_id,
        name: body.name,
        description: body.description ?? null,
        createdBy: userId,
      })
      const version = await input.repository.nextJobVersion(body.workspace_id, job.id)
      const versionId = id()
      const deploymentId = id()
      const deploymentRef = scriptName("hbr", deploymentId)
      const runtime = body.runtime ?? "classic"
      const sourceText = runtime === "bundled" ? body.bundle!.code : body.code
      const sourceRef = await input.sourceStore.putJobSource({ workspaceId: body.workspace_id, jobId: job.id, versionId, code: body.code })
      const workspaceDb = await input.workspaceDatabaseProvider.ensure(body.workspace_id)
      const hostCallSecret = secret()
      await input.deploymentProvider.uploadJob({
        workspaceId: body.workspace_id,
        scriptName: deploymentRef,
        code: sourceText,
        runtime,
        hostCallSecret,
        workspaceDatabaseId: workspaceDb.cf_database_id,
      })
      const capabilities = body.capabilities ?? []
      const versionRow = await input.repository.createJobVersion({
        id: versionId,
        workspace_id: body.workspace_id,
        job_id: job.id,
        version,
        version_name: `v${version}`,
        description: body.description ?? job.description,
        source_ref: JSON.stringify(sourceRef),
        code_hash: sourceRef.sha256,
        input_schema: JSON.stringify(body.input_schema ?? { type: "object", additionalProperties: true }),
        output_schema: body.output_schema ? JSON.stringify(body.output_schema) : null,
        capabilities: JSON.stringify(capabilities),
        lane: "worker_platform",
        policy: JSON.stringify({ runtime, run_as: "caller", idempotency: body.idempotency, retry: body.retry, retention: body.retention }),
        status: "ready",
        error_message: null,
        created_by: userId,
      })
      await input.repository.insertJobDeployment({
        id: deploymentId,
        workspace_id: body.workspace_id,
        job_id: job.id,
        version_id: versionId,
        lane: "worker_platform",
        provider: "cloudflare_wfp",
        deployment_ref: deploymentRef,
        dispatch_namespace: input.deploymentProvider.jobDispatchNamespace ?? null,
        status: "ready",
        policy: JSON.stringify({ host_call_secret: hostCallSecret, workspace_database_id: workspaceDb.cf_database_id, runtime }),
        created_by: userId,
      })
      await input.repository.markJobReady(body.workspace_id, job.id, versionId, deploymentId, body.description ?? null)
      return {
        job: {
          name: body.name,
          version: versionRow.version_name,
          status: "ready",
          lane: "worker_platform",
          deployment_id: deploymentId,
          capabilities,
        },
      } satisfies OrbitJobPublishResponse
    },

    publishApp: async (body, userId) => {
      validateAppPublish(body)
      const resolvedJobs: Record<string, OrbitAppJobRef> = {}
      for (const [alias, ref] of Object.entries(body.jobs)) {
        const job = await input.repository.getJobByName(body.workspace_id, ref.name)
        if (!job) throw new Error(`Job '${ref.name}' is not ready`)
        const versions = await input.repository.listJobVersions(body.workspace_id, job.id)
        const selected = ref.version
          ? versions.find((version) => version.version_name === ref.version)
          : versions.find((version) => version.id === job.latest_version_id) ?? versions[0]
        if (!selected || selected.status !== "ready") throw new Error(`Job '${ref.name}' has no ready version`)
        const deployment = await input.repository.getReadyJobDeployment(body.workspace_id, selected.id)
        if (!deployment) throw new Error(`Job '${ref.name}' version '${selected.version_name}' has no ready worker_platform deployment`)
        resolvedJobs[alias] = { ...ref, version: selected.version_name }
      }
      const app = await input.repository.getOrCreateApp({
        workspaceId: body.workspace_id,
        name: body.name,
        description: body.description ?? null,
        createdBy: userId,
      })
      const version = await input.repository.nextAppVersion(body.workspace_id, app.id)
      const versionId = id()
      const deploymentId = id()
      const deploymentRef = scriptName("hbr_app", deploymentId)
      const runtime = body.runtime ?? "classic"
      const sourceText = runtime === "bundled" ? body.bundle!.code : body.code
      const sourceRef = await input.sourceStore.putAppSource({ workspaceId: body.workspace_id, appId: app.id, versionId, code: body.code })
      const publicUrl = `${input.config.appsBaseUrl.replace(/\/+$/, "")}/${encodeURIComponent(body.workspace_id)}/${encodeURIComponent(body.name)}`
      const hostCallSecret = secret()
      await input.deploymentProvider.uploadApp({
        workspaceId: body.workspace_id,
        scriptName: deploymentRef,
        code: sourceText,
        runtime,
        hostCallSecret,
        routes: body.routes,
        jobs: resolvedJobs,
      })
      const versionRow = await input.repository.createAppVersion({
        id: versionId,
        workspace_id: body.workspace_id,
        app_id: app.id,
        version,
        version_name: `v${version}`,
        description: body.description ?? app.description,
        source_ref: JSON.stringify(sourceRef),
        code_hash: sourceRef.sha256,
        route_manifest: JSON.stringify(body.routes),
        job_manifest: JSON.stringify(resolvedJobs),
        policy: JSON.stringify({ public_url: publicUrl, runtime, theme: body.theme, allowed_origins: body.allowed_origins }),
        status: "ready",
        error_message: null,
        created_by: userId,
      })
      await input.repository.insertAppDeployment({
        id: deploymentId,
        workspace_id: body.workspace_id,
        app_id: app.id,
        version_id: versionId,
        provider: "cloudflare_wfp",
        deployment_ref: deploymentRef,
        dispatch_namespace: input.deploymentProvider.appDispatchNamespace ?? null,
        public_url: publicUrl,
        status: "ready",
        policy: JSON.stringify({ host_call_secret: hostCallSecret, runtime }),
        created_by: userId,
      })
      await input.repository.markAppReady(body.workspace_id, app.id, versionId, body.description ?? null, publicUrl)
      return { app: { name: body.name, version: versionRow.version_name, status: "ready", url: publicUrl } } satisfies OrbitAppPublishResponse
    },

    listJobs: async (request) => {
      const limit = Math.min(Math.max(request.limit ?? 50, 1), 200)
      const offset = Math.max(request.offset ?? 0, 0)
      const rows = await input.repository.listJobs({ workspaceId: request.workspace_id, limit, offset })
      const jobs = await Promise.all(rows.map(async (row) => jobSummary(row, await input.repository.listJobVersions(request.workspace_id, row.id))))
      return { jobs, count: await input.repository.countJobs(request.workspace_id) }
    },

    inspectJob: async (request) => {
      const job = await input.repository.getJobByName(request.workspace_id, request.name)
      if (!job) throw new Error(`Orbit job '${request.name}' is not registered`)
      return { job: jobDetail(job, await input.repository.listJobVersions(request.workspace_id, job.id), request.version) }
    },

    listApps: async (request) => {
      const limit = Math.min(Math.max(request.limit ?? 50, 1), 200)
      const offset = Math.max(request.offset ?? 0, 0)
      const rows = await input.repository.listApps({ workspaceId: request.workspace_id, limit, offset })
      const apps = await Promise.all(rows.map(async (row) => appSummary(row, await input.repository.listAppVersions(request.workspace_id, row.id))))
      return { apps, count: await input.repository.countApps(request.workspace_id) }
    },

    inspectApp: async (request) => {
      const app = await input.repository.getAppByName(request.workspace_id, request.name)
      if (!app) throw new Error(`Orbit app '${request.name}' is not registered`)
      return { app: appDetail(app, await input.repository.listAppVersions(request.workspace_id, app.id), request.version) }
    },

    openApp: async (request) => {
      const app = await input.repository.getAppByName(request.workspace_id, request.name)
      if (!app?.public_url || app.status !== "ready") throw new Error(`Orbit app URL '${request.name}' is not registered`)
      const suffix = request.path ? `/${request.path.replace(/^\/+/, "")}` : ""
      return { name: app.name, url: `${app.public_url}${suffix}` }
    },

    resolveGatewayApp: async (request) => {
      const deployment = await input.repository.getReadyAppDeploymentByName(request.workspace_id, request.name)
      if (!deployment) throw new Error(`Ready Orbit app deployment '${request.name}' is not registered`)
      return {
        workspace_id: request.workspace_id,
        name: request.name,
        deployment_ref: deployment.deployment_ref,
        version_id: deployment.version_id,
        routes: parseJsonArray<OrbitAppRoute>(deployment.route_manifest),
      }
    },
  }
}

export async function createInlineSourceRef(code: string): Promise<OrbitStoredSourceRef> {
  return { kind: "inline", sha256: await sha256Hex(code) }
}
