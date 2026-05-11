import {
  createMemoryOrbitRuntime,
  type OrbitAiClient,
  type OrbitDbRuntimeClient,
  type OrbitSocketClient,
  type OrbitToolsClient,
} from '@hrbr/orbit/runtime'

const tools: OrbitToolsClient = {
  search: async ({ query }) => ({
    hits: [
      {
        tool_id: 'tickets.create',
        namespace: 'tickets',
        signature: 'tickets.create(input)',
        description: `Create a ticket matched from "${query}"`,
      },
    ],
  }),
  describe: async ({ toolId }) => ({
    tool_id: toolId,
    input_schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'normal', 'high'] },
      },
    },
  }),
  namespaces: async () => ({
    namespaces: [{ namespace: 'tickets', js_var: 'tickets', kind: 'api', tool_count: 1 }],
  }),
}

const socket: OrbitSocketClient = {
  url: async ({ channel }) => ({
    channel,
    url: `wss://developer-runtime.example.com/orbit/${channel}`,
    expires_at: '2026-04-28T00:30:00.000Z',
  }),
  broadcast: async ({ channel }) => ({ channel, delivered: 1 }),
  stats: async ({ channel }) => ({ channel, connections: 1 }),
}

const db: OrbitDbRuntimeClient = {
  exec: async () => ({ changes: 1, meta: { source: 'local-memory' } }),
  query: async () => ({
    rows: [{ id: 'ticket_123', title: 'Cannot log in' }],
    meta: { source: 'local-memory' },
  }),
  first: async () => ({
    row: { id: 'ticket_123', title: 'Cannot log in' },
    meta: { source: 'local-memory' },
  }),
  batch: async (statements) => ({
    results: statements.map(() => ({ rows: [], meta: { source: 'local-memory' } })),
  }),
}

const ai: OrbitAiClient = {
  models: async () => ({
    models: [{ id: 'local-summary', name: 'Local Summary', task: 'summarization' }],
  }),
  text: async ({ input }) => ({
    model: 'local-summary',
    text: String(input),
    raw: { local: true },
  }),
  generate: async ({ input }) => ({
    model: 'local-summary',
    text: `Generated: ${String(input)}`,
    raw: { local: true },
  }),
  summarize: async ({ input }) => ({
    model: 'local-summary',
    summary: String(input).slice(0, 80),
    raw: { local: true },
  }),
  embed: async () => ({
    model: 'local-embed',
    embeddings: [[1, 0, 0]],
    raw: { local: true },
  }),
  classify: async () => ({
    model: 'local-summary',
    label: 'support',
    raw: { local: true },
  }),
  rerank: async () => ({
    model: 'local-summary',
    ranking: [{ index: 0, score: 1 }],
    raw: { local: true },
  }),
}

const orbit = createMemoryOrbitRuntime({
  id: (() => {
    let next = 0
    return () => `orbit-example-${++next}`
  })(),
  now: () => new Date('2026-04-28T00:00:00.000Z'),
  tools,
  socket,
  db,
  ai,
})

await orbit.storage.put({
  key: 'tickets/ticket_123.json',
  data: { id: 'ticket_123', title: 'Cannot log in' },
  encoding: 'json',
  content_type: 'application/json',
})
await orbit.cache.set('tickets:last', { id: 'ticket_123' }, 600)

const [cachedTicket, listed, summary, search, realtime, latestTicket, usage] = await Promise.all([
  orbit.cache.get('tickets:last'),
  orbit.storage.list({ prefix: 'tickets/' }),
  orbit.ai?.summarize({ input: 'Customer cannot log in after password reset.' }),
  orbit.tools?.search({ query: 'create support ticket', limit: 3 }),
  orbit.socket?.url({ channel: 'tickets.ticket_123' }),
  orbit.db?.first('select * from tickets order by created_at desc limit 1'),
  orbit.usage.list(),
])

console.log({
  cachedTicket,
  storedObjects: listed.objects.map((object) => object.key),
  summary: summary?.summary,
  toolHit: Array.isArray((search as { hits?: unknown }).hits)
    ? (search as { hits: Array<{ tool_id?: string }> }).hits[0]?.tool_id
    : null,
  realtimeUrl: realtime?.url,
  latestTicket: latestTicket?.row,
  usage: usage.data.map((row) => row.operation),
})
