import { describe, expect, it } from 'bun:test'
import { Schema } from 'effect'
import { OrbitAppPublishBody } from '../src/apps'
import { createMemoryOrbitRuntime, type OrbitAiClient } from '../src/runtime'
import { OrbitJobPublishBody } from '../src/jobs'
import { OrbitSocketUrlBody } from '../src/socket'
import { OrbitStorageListResponse, OrbitStoragePutBody } from '../src/storage'

const workspaceId = '11111111-1111-4111-8111-111111111111'

const jobPublishFixture = {
  workspace_id: workspaceId,
  name: 'lead-capture',
  description: 'Capture leads',
  kind: 'mutation',
  tags: ['forms', 'crm'],
  input_binding: 'json',
  input_schema: { type: 'object', required: ['email'] },
  output_schema: { type: 'object' },
  capabilities: ['storage', 'socket'],
  timeout_ms: 5000,
  idempotency: { required: true, key: ['email'], ttl_seconds: 86400 },
  retry: { max_attempts: 2, backoff: 'exponential' },
  retention: { run_ttl_seconds: 604800, artifact_ttl_seconds: 604800 },
  compatibility_date: '2026-04-28',
  code: 'export default async () => ({ ok: true })',
}

const appPublishFixture = {
  workspace_id: workspaceId,
  name: 'lead-capture-app',
  code: 'export default defineOrbitApp({})',
  theme: { title: 'Leads', accent: '#2563eb' },
  allowed_origins: ['https://example.com'],
  jobs: {
    submit: {
      name: 'lead-capture',
      version: 'v1',
      description: 'Persist lead submissions',
      input_schema: { type: 'object' },
      output_schema: { type: 'object' },
    },
  },
  routes: [
    {
      id: 'submit',
      title: 'Submit lead',
      method: 'POST',
      path: '/submit',
      auth: 'public',
      permissions: [{ action: 'lead:create', resource: 'lead' }],
      input: 'json',
      output: 'json',
      input_transform: { kind: 'none' },
      output_transform: { kind: 'template', value: '{{json}}' },
      job: 'submit',
      tags: ['form'],
    },
  ],
}

describe('orbit contracts', () => {
  it('decodes additive job publish metadata', () => {
    const body = Schema.decodeUnknownSync(OrbitJobPublishBody)(jobPublishFixture)

    expect(body.kind).toBe('mutation')
    expect(body.idempotency?.required).toBe(true)
  })

  it('decodes additive app route and job metadata', () => {
    const body = Schema.decodeUnknownSync(OrbitAppPublishBody)(appPublishFixture)

    expect(body.routes[0]?.id).toBe('submit')
    expect(body.jobs.submit?.description).toBe('Persist lead submissions')
  })

  it('decodes storage list envelope', () => {
    const response = Schema.decodeUnknownSync(OrbitStorageListResponse)({
      objects: [{
        key: 'notes/hello.txt',
        size: 5,
        uploaded: '2026-04-28T00:00:00.000Z',
        content_type: 'text/plain',
        download_url: '/api/hrbr/storage/download/token',
        expires_at: '2026-04-28T00:30:00.000Z',
        expires_in_seconds: 1800,
      }],
      truncated: false,
    })

    expect(response.objects[0]?.key).toBe('notes/hello.txt')
  })

  it('decodes JSON storage put body', () => {
    const body = Schema.decodeUnknownSync(OrbitStoragePutBody)({
      workspace_id: workspaceId,
      key: 'notes/state.json',
      data: { ok: true },
    })

    expect(body.key).toBe('notes/state.json')
  })

  it('decodes socket URL body', () => {
    const body = Schema.decodeUnknownSync(OrbitSocketUrlBody)({
      workspace_id: workspaceId,
      channel: 'build-status',
      permissions: ['receive', 'send'],
      expires_in_seconds: 300,
      allowed_origins: ['https://example.com'],
    })

    expect(body.channel).toBe('build-status')
  })

  it('provides a local Orbit runtime for storage, cache, and usage primitives', async () => {
    let tick = 0
    const orbit = createMemoryOrbitRuntime({
      id: () => `orbit-${++tick}`,
      now: () => new Date('2026-04-28T00:00:00.000Z'),
    })

    await orbit.storage.put({
      key: 'notes/state.json',
      data: { ok: true },
      encoding: 'json',
      content_type: 'application/json',
    })
    await orbit.cache.set('last-note', { key: 'notes/state.json' }, 60)

    await expect(orbit.storage.get({ key: 'notes/state.json' })).resolves.toMatchObject({
      key: 'notes/state.json',
      encoding: 'json',
      data: { ok: true },
    })
    await expect(orbit.cache.get('last-note')).resolves.toEqual({ key: 'notes/state.json' })
    await expect(orbit.usage.list()).resolves.toMatchObject({
      data: [
        { operation: 'storage.put', key: 'notes/state.json' },
        { operation: 'cache.set', key: 'last-note' },
        { operation: 'storage.get', key: 'notes/state.json' },
        { operation: 'cache.get', key: 'last-note' },
      ],
    })
  })

  it('accepts host-provided Orbit capability adapters', async () => {
    const ai: OrbitAiClient = {
      models: async () => ({ models: [{ id: 'demo', name: 'Demo', task: 'text-generation' }] }),
      text: async ({ model }) => ({ model: model ?? 'demo', text: 'hello', raw: {} }),
      generate: async ({ model }) => ({ model: model ?? 'demo', text: 'generated', raw: {} }),
      summarize: async ({ model }) => ({ model: model ?? 'demo', summary: 'short', raw: {} }),
      embed: async ({ model }) => ({ model: model ?? 'demo', embeddings: [[1, 2, 3]], raw: {} }),
      classify: async ({ model }) => ({ model: model ?? 'demo', label: 'ok', raw: {} }),
      rerank: async ({ model }) => ({ model: model ?? 'demo', ranking: [], raw: {} }),
    }
    const orbit = createMemoryOrbitRuntime({ ai })

    await expect(orbit.ai?.text({ input: 'hi' })).resolves.toEqual({
      model: 'demo',
      text: 'hello',
      raw: {},
    })
    await expect(orbit.ai?.generate({ input: 'hi' })).resolves.toEqual({
      model: 'demo',
      text: 'generated',
      raw: {},
    })
  })

  it('accepts a host-provided execution DB adapter', async () => {
    const orbit = createMemoryOrbitRuntime({
      db: {
        exec: async () => ({ changes: 1, meta: {} }),
        query: async () => ({ rows: [{ id: 1 }], meta: {} }),
        first: async () => ({ row: { id: 1 }, meta: {} }),
        batch: async (statements) => ({
          results: statements.map(() => ({ rows: [], meta: {} })),
        }),
      },
    })

    await expect(orbit.db?.query('select 1')).resolves.toEqual({
      rows: [{ id: 1 }],
      meta: {},
    })
  })

  it('accepts host-provided tools and socket adapters', async () => {
    const orbit = createMemoryOrbitRuntime({
      tools: {
        search: async ({ query }) => ({ hits: [{ tool_id: 'demo.echo', query }] }),
        describe: async ({ toolId }) => ({ tool_id: toolId, signature: 'demo.echo(input)' }),
        namespaces: async () => ({
          namespaces: [{ namespace: 'demo', js_var: 'demo', kind: 'api', tool_count: 1 }],
        }),
      },
      socket: {
        url: async ({ channel }) => ({
          channel,
          url: `wss://example.test/${channel}`,
          expires_at: '2026-04-28T00:30:00.000Z',
        }),
        broadcast: async ({ channel }) => ({ channel, delivered: 1 }),
        stats: async ({ channel }) => ({ channel, connections: 1 }),
      },
    })

    await expect(orbit.tools?.search({ query: 'echo' })).resolves.toEqual({
      hits: [{ tool_id: 'demo.echo', query: 'echo' }],
    })
    await expect(orbit.socket?.url({ channel: 'updates' })).resolves.toEqual({
      channel: 'updates',
      url: 'wss://example.test/updates',
      expires_at: '2026-04-28T00:30:00.000Z',
    })
  })
})
