import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHarborClient } from '@hrbr/client'
import { Effect } from 'effect'
import { initLocalProject, startLocalHarborServer } from '@hrbr/sdk/platform/local'

export const startExampleLocalHarbor = async () => {
  const rootDir = await mkdtemp(join(tmpdir(), 'harbor-sdk-local-'))
  const project = initLocalProject({
    rootDir,
    workspaceId: 'workspace_local',
    workspaceName: 'Local SDK Workspace',
    authToken: 'local-token',
  })

  const server = await startLocalHarborServer({
    project,
    authToken: 'local-token',
    runtimeHost: (invocation) =>
      Effect.succeed({
        mode: invocation.request.mode,
        result: {
          ok: true,
          scopeId: invocation.context.scopeId,
        },
        logs: [],
        warnings: [],
        timings: {},
      }),
  })

  return {
    rootDir,
    server,
    async close() {
      await server.close()
      await rm(rootDir, { recursive: true, force: true })
    },
  }
}

if (import.meta.main) {
  const local = await startExampleLocalHarbor()
  try {
    const harbor = createHarborClient({
      baseUrl: local.server.url,
      workspaceId: 'workspace_local',
      auth: { kind: 'bearer', token: 'local-token' },
    })

    const workspace = await harbor.workspaces.get()
    const run = await harbor.runtime.execute({ code: 'return { ok: true }' })
    const html = await fetch(local.server.url).then((response) => response.text())

    console.log(JSON.stringify({
      url: local.server.url,
      workspace,
      run,
      hasFrontend: html.includes('Harbor Local') && html.includes('/local/frontend.js'),
    }, null, 2))
  } finally {
    await local.close()
  }
}
