import { describe, expect, it } from 'bun:test'
import type { OrbitAppJobRef, OrbitAppRoute } from '../src/apps'
import {
  createCloudflareWfpDeploymentProvider,
  type CloudflareOrbitPlatformConfig,
} from '../src/cloudflare'
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
  type OrbitPlatformRepository,
  type OrbitSourceStore,
  type OrbitWorkspaceDatabaseProvider,
} from '../src/platform'

const workspaceId = '00000000-0000-4000-8000-000000000001'
const userId = 'user-1'
const now = '2026-05-12T00:00:00.000Z'

function createMemoryRepository(): OrbitPlatformRepository {
  const jobs: OrbitJobRecord[] = []
  const jobVersions: OrbitJobVersionRecordRow[] = []
  const jobDeployments: OrbitJobDeploymentRecord[] = []
  const apps: OrbitAppRecord[] = []
  const appVersions: OrbitAppVersionRecordRow[] = []
  const appDeployments: OrbitAppDeploymentRecord[] = []

  return {
    getOrCreateJob: async (input) => {
      const existing = jobs.find((job) => job.workspace_id === input.workspaceId && job.name === input.name)
      if (existing) return existing
      const row: OrbitJobRecord = {
        id: `job-${jobs.length + 1}`,
        workspace_id: input.workspaceId,
        name: input.name,
        description: input.description,
        status: 'ready',
        latest_version_id: null,
        created_by: input.createdBy,
        created_at: now,
        updated_at: now,
      }
      jobs.push(row)
      return row
    },
    listJobs: async ({ workspaceId, limit, offset }) =>
      jobs.filter((job) => job.workspace_id === workspaceId && job.status === 'ready').slice(offset, offset + limit),
    countJobs: async (id) => jobs.filter((job) => job.workspace_id === id && job.status === 'ready').length,
    getJobByName: async (id, name) =>
      jobs.find((job) => job.workspace_id === id && job.name === name) ?? null,
    nextJobVersion: async (id, jobId) =>
      Math.max(0, ...jobVersions.filter((version) => version.workspace_id === id && version.job_id === jobId).map((version) => version.version)) + 1,
    createJobVersion: async (row) => {
      const inserted = { ...row, created_at: now }
      jobVersions.push(inserted)
      return inserted
    },
    listJobVersions: async (id, jobId) =>
      jobVersions.filter((version) => version.workspace_id === id && version.job_id === jobId).sort((a, b) => b.version - a.version),
    insertJobDeployment: async (row) => {
      const inserted = { ...row, created_at: now, promoted_at: now, disabled_at: null, error_message: null }
      jobDeployments.push(inserted)
      return inserted
    },
    markJobReady: async (id, jobId, versionId, _deploymentId, description) => {
      const version = jobVersions.find((item) => item.workspace_id === id && item.id === versionId)
      if (version) version.status = 'ready'
      const job = jobs.find((item) => item.workspace_id === id && item.id === jobId)
      if (job) {
        job.latest_version_id = versionId
        job.description = description ?? job.description
      }
    },
    getReadyJobDeployment: async (id, versionId) =>
      jobDeployments.find((deployment) => deployment.workspace_id === id && deployment.version_id === versionId && deployment.status === 'ready') ?? null,

    getOrCreateApp: async (input) => {
      const existing = apps.find((app) => app.workspace_id === input.workspaceId && app.name === input.name)
      if (existing) return existing
      const row: OrbitAppRecord = {
        id: `app-${apps.length + 1}`,
        workspace_id: input.workspaceId,
        name: input.name,
        description: input.description,
        status: 'ready',
        latest_version_id: null,
        public_url: null,
        created_by: input.createdBy,
        created_at: now,
        updated_at: now,
      }
      apps.push(row)
      return row
    },
    listApps: async ({ workspaceId, limit, offset }) =>
      apps.filter((app) => app.workspace_id === workspaceId && app.status === 'ready').slice(offset, offset + limit),
    countApps: async (id) => apps.filter((app) => app.workspace_id === id && app.status === 'ready').length,
    getAppByName: async (id, name) =>
      apps.find((app) => app.workspace_id === id && app.name === name) ?? null,
    nextAppVersion: async (id, appId) =>
      Math.max(0, ...appVersions.filter((version) => version.workspace_id === id && version.app_id === appId).map((version) => version.version)) + 1,
    createAppVersion: async (row) => {
      const inserted = { ...row, created_at: now }
      appVersions.push(inserted)
      return inserted
    },
    listAppVersions: async (id, appId) =>
      appVersions.filter((version) => version.workspace_id === id && version.app_id === appId).sort((a, b) => b.version - a.version),
    insertAppDeployment: async (row) => {
      const inserted = { ...row, created_at: now, deployed_at: now, disabled_at: null, error_message: null }
      appDeployments.push(inserted)
      return inserted
    },
    markAppReady: async (id, appId, versionId, description, publicUrl) => {
      const version = appVersions.find((item) => item.workspace_id === id && item.id === versionId)
      if (version) version.status = 'ready'
      const app = apps.find((item) => item.workspace_id === id && item.id === appId)
      if (app) {
        app.latest_version_id = versionId
        app.description = description ?? app.description
        app.public_url = publicUrl
      }
    },
    getReadyAppDeploymentByName: async (id, name) => {
      const app = apps.find((item) => item.workspace_id === id && item.name === name && item.status === 'ready')
      if (!app) return null
      const deployment = appDeployments.find((item) => item.workspace_id === id && item.app_id === app.id && item.status === 'ready')
      const version = deployment ? appVersions.find((item) => item.id === deployment.version_id && item.status === 'ready') : null
      if (!deployment || !version) return null
      return { ...deployment, route_manifest: version.route_manifest, job_manifest: version.job_manifest, app_name: app.name }
    },
  }
}

describe('orbit platform apps', () => {
  it('publishes, lists, inspects, opens, and resolves a mini app', async () => {
    const uploads: Array<{ kind: 'job' | 'app'; code: string; routes?: readonly OrbitAppRoute[]; jobs?: Readonly<Record<string, OrbitAppJobRef>> }> = []
    const deploymentProvider: OrbitDeploymentProvider = {
      uploadJob: async ({ code }) => {
        uploads.push({ kind: 'job', code })
      },
      uploadApp: async ({ code, routes, jobs }) => {
        uploads.push({ kind: 'app', code, routes, jobs })
      },
    }
    const sourceStore: OrbitSourceStore = {
      putJobSource: async ({ code }) => createInlineSourceRef(code),
      putAppSource: async ({ code }) => createInlineSourceRef(code),
    }
    const workspaceDatabaseProvider: OrbitWorkspaceDatabaseProvider = {
      ensure: async (id) => ({
        workspace_id: id,
        cf_database_id: 'db-1',
        cf_database_name: 'workspace-db',
        status: 'ready',
        error_message: null,
      }),
    }
    const platform = createOrbitPlatform({
      repository: createMemoryRepository(),
      deploymentProvider,
      sourceStore,
      workspaceDatabaseProvider,
      config: { appsBaseUrl: 'https://apps.example.test' },
      id: (() => {
        let next = 0
        return () => `id-${++next}`
      })(),
      secret: () => 'secret',
    })

    await expect(platform.publishJob({
      workspace_id: workspaceId,
      name: 'render-mini-app',
      code: 'export default { handler: async () => ({ ok: true }) }',
      input_schema: { type: 'object' },
    }, userId)).resolves.toMatchObject({
      job: { name: 'render-mini-app', version: 'v1', status: 'ready' },
    })

    await expect(platform.publishApp({
      workspace_id: workspaceId,
      name: 'mini-app',
      description: 'A small routed app',
      code: 'export default defineOrbitApp({})',
      routes: [{
        id: 'home',
        method: 'GET',
        path: '/',
        auth: 'public',
        input: 'none',
        output: 'json',
        job: 'render',
      }],
      jobs: { render: { name: 'render-mini-app' } },
    }, userId)).resolves.toEqual({
      app: {
        name: 'mini-app',
        version: 'v1',
        status: 'ready',
        url: `${'https://apps.example.test'}/${workspaceId}/mini-app`,
      },
    })

    await expect(platform.listApps({ workspace_id: workspaceId })).resolves.toMatchObject({
      count: 1,
      apps: [{ name: 'mini-app', latest_version: 'v1', access: 'public' }],
    })
    await expect(platform.inspectApp({ workspace_id: workspaceId, name: 'mini-app' })).resolves.toMatchObject({
      app: {
        name: 'mini-app',
        routes: [{ id: 'home', path: '/', job: 'render' }],
        jobs: { render: { name: 'render-mini-app', version: 'v1' } },
      },
    })
    await expect(platform.openApp({ workspace_id: workspaceId, name: 'mini-app', path: '/settings' })).resolves.toEqual({
      name: 'mini-app',
      url: `${'https://apps.example.test'}/${workspaceId}/mini-app/settings`,
    })
    await expect(platform.resolveGatewayApp({ workspace_id: workspaceId, name: 'mini-app' })).resolves.toMatchObject({
      workspace_id: workspaceId,
      name: 'mini-app',
      deployment_ref: 'hbr_app_id4',
      routes: [{ id: 'home', path: '/' }],
    })
    expect(uploads).toMatchObject([
      { kind: 'job' },
      { kind: 'app', routes: [{ id: 'home' }], jobs: { render: { version: 'v1' } } },
    ])
  })

  it('uploads a runnable app worker that serves declared routes', async () => {
    let workerSource = ''
    const fetchImpl: typeof fetch = async (_url, init) => {
      const form = init?.body as FormData
      for (const [name, value] of form.entries()) {
        if (name === 'worker.js' && value instanceof Blob) workerSource = await value.text()
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'content-type': 'application/json' },
      })
    }
    const provider = createCloudflareWfpDeploymentProvider({
      accountId: 'account',
      apiToken: 'token',
      controlDatabaseId: 'control-db',
      jobDispatchNamespace: 'jobs',
      appDispatchNamespace: 'apps',
      apiBaseUrl: 'https://api.example.test',
      appsBaseUrl: 'https://apps.example.test',
      fetch: fetchImpl,
    } satisfies CloudflareOrbitPlatformConfig)

    await provider.uploadApp({
      workspaceId,
      scriptName: 'mini-app-script',
      code: 'export default defineOrbitApp({})',
      runtime: 'classic',
      hostCallSecret: 'secret',
      routes: [{
        id: 'echo',
        method: 'POST',
        path: '/echo',
        auth: 'public',
        input: 'json',
        output: 'json',
        job: 'render',
      }],
      jobs: { render: { name: 'render-mini-app', version: 'v1' } },
    })

    expect(workerSource).toContain('kind: "orbit_app"')
    expect(workerSource).not.toContain('@hrbr/orbit/app-ui')

    const worker = new Function(`${workerSource.replace('export default', 'return')}`)() as {
      fetch: typeof fetch
    }

    await expect(worker.fetch(new Request('https://mini.example.test/__hrbr/health'))).resolves.toMatchObject({
      status: 200,
    })
    const response = await worker.fetch(new Request('https://mini.example.test/echo', {
      method: 'POST',
      body: JSON.stringify({ hello: 'world' }),
      headers: { 'content-type': 'application/json' },
    }))
    await expect(response.json()).resolves.toEqual({
      ok: true,
      input: { hello: 'world' },
      route: 'echo',
    })
  })
})
