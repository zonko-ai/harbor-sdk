import { defineSourceAdapter } from '@hrbr/source-core'
import { createCredentialResolver, createMemoryCredentialStore } from '@hrbr/source-credentials'
import { createMcpHttpSourceAdapter } from '@hrbr/source-mcp'
import { createToolPolicy } from '@hrbr/source-policy'
import { createMemoryTraceWriter } from '@hrbr/runs'
import { createToolRegistry } from '@hrbr/tools'
import { defineWorkflow, runWorkflow } from '@hrbr/workflows'

const tickets = defineSourceAdapter({
  namespace: 'tickets',
  displayName: 'Tickets',
  listTools: async () => [
    {
      name: 'create',
      displayName: 'Create ticket',
      description: "Create a support ticket in the developer's own system.",
      inputSchema: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'normal', 'high'] },
        },
      },
      outputSchema: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
        },
      },
      kind: 'custom',
    },
  ],
  invokeTool: async (name, input, ctx) => {
    if (name !== 'create') throw new Error(`Unknown ticket tool: ${name}`)
    if (!ctx?.credentials) throw new Error('Missing credential resolver')
    const apiKey = ctx.credentials.require('api_key')
    return {
      id: 'ticket_123',
      title: input['title'],
      priority: input['priority'] ?? 'normal',
      authenticated: apiKey.startsWith('ticket_'),
    }
  },
})

const ownMcp = createMcpHttpSourceAdapter({
  id: 'own-cf-mcp',
  namespace: 'own_cf',
  displayName: 'Own Cloudflare MCP',
  endpoint: 'https://developer-worker.example.com/mcp',
  bearerCredentialSlot: 'token',
  fetch: async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as { method: string }
    if (body.method === 'initialize') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            serverInfo: { name: 'own-cf' },
          },
        }),
        { headers: { 'content-type': 'application/json', 'mcp-session-id': 'local-session' } }
      )
    }
    if (body.method === 'notifications/initialized') return new Response(null, { status: 202 })
    if (body.method === 'tools/list') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          result: {
            tools: [
              {
                name: 'lookup_customer',
                description: "Lookup a customer in the developer's own MCP server.",
                inputSchema: {
                  type: 'object',
                  required: ['email'],
                  properties: { email: { type: 'string' } },
                },
              },
            ],
          },
        }),
        { headers: { 'content-type': 'application/json' } }
      )
    }
    if (body.method === 'tools/call') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          result: {
            content: [{ type: 'text', text: 'customer found' }],
            structuredContent: { id: 'cus_123' },
          },
        }),
        { headers: { 'content-type': 'application/json' } }
      )
    }
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        error: { code: -32601, message: `Unknown MCP method ${body.method}` },
      }),
      { headers: { 'content-type': 'application/json' } }
    )
  },
})

const traces = createMemoryTraceWriter({ workspaceId: 'local-dev' })

const registry = createToolRegistry({
  workspaceId: 'local-dev',
  traces,
  policy: createToolPolicy({
    rules: [
      {
        match: 'tickets.delete',
        decision: { kind: 'require_approval', reason: 'Ticket deletion needs human approval' },
      },
      { match: 'tickets.*', decision: { kind: 'allow' } },
    ],
  }),
  credentials: createCredentialResolver({
    store: createMemoryCredentialStore({
      secrets: {
        tickets_api_key: 'ticket_dev_key',
        own_cf_token: 'cf_dev_token',
      },
    }),
    bindings: [
      {
        workspace_id: 'local-dev',
        source_id: 'tickets',
        slot: 'api_key',
        scope: 'workspace',
        value: { kind: 'secret', secret_id: 'tickets_api_key' },
        status: 'active',
      },
      {
        workspace_id: 'local-dev',
        source_id: 'own-cf-mcp',
        slot: 'token',
        scope: 'workspace',
        value: { kind: 'secret', secret_id: 'own_cf_token' },
        status: 'active',
      },
    ],
  }),
  sources: [tickets, ownMcp],
})

const matches = await registry.search({ query: 'support ticket' })
const first = matches.hits[0]
if (!first) throw new Error('Expected ticket source to expose a tool')

const schema = await registry.describe({ toolId: first.tool_id })
const mcpSchema = await registry.describe({ toolId: 'own_cf.lookup_customer' })
const mcpResult = await registry.call('own_cf.lookup_customer', {
  email: 'sam@example.com',
})
const result = await registry.call(first.tool_id, {
  title: 'Cannot log in',
  priority: 'high',
})
const graph = result.run_id ? await traces.graph(result.run_id) : null

const triage = defineWorkflow<{ title: string }, { ticket: unknown }>({
  name: 'triage-ticket',
  run: async ({ input, step, tools }) => {
    const title = await step.do('normalize title', () => String(input['title']).trim())
    await step.sleep('approval debounce', '1s')
    const approval = await step.waitForEvent<{ approved: boolean }>('approval', {
      type: 'ticket_approved',
      timeout: '5m',
    })
    if (!approval.approved) throw new Error('Ticket was not approved')
    const ticket = await step.do('create ticket', () =>
      tools.call('tickets.create', { title, priority: 'high' })
    )
    return { ticket: ticket.result }
  },
})

const workflow = await runWorkflow(triage, {
  input: { title: ' Cannot log in ' },
  tools: registry,
  traces,
  workspaceId: 'local-dev',
  stepBackend: {
    sleep: async () => {},
    waitForEvent: async () => ({ approved: true }),
  },
})
const workflowGraph = workflow.runId ? await traces.graph(workflow.runId) : null

console.log({ schema, mcpSchema, mcpResult, result, graph, workflow, workflowGraph })
