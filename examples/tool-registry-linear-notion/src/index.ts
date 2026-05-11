import { createMemoryTraceWriter } from '@hrbr/runs'
import { defineSourceAdapter } from '@hrbr/source-core'
import { createCredentialResolver, createMemoryCredentialStore } from '@hrbr/source-credentials'
import { createToolPolicy } from '@hrbr/source-policy'
import { createToolRegistry } from '@hrbr/tools'

const linear = defineSourceAdapter({
  id: 'linear',
  namespace: 'linear',
  displayName: 'Linear',
  kind: 'api',
  listTools: async () => [
    {
      name: 'create_issue',
      displayName: 'Create issue',
      description: 'Create a Linear issue in a team workspace.',
      inputSchema: {
        type: 'object',
        required: ['teamKey', 'title'],
        properties: {
          teamKey: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'number' },
        },
      },
      outputSchema: {
        type: 'object',
        required: ['id', 'url'],
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
        },
      },
      tags: ['issues', 'project-management'],
      kind: 'api',
    },
    {
      name: 'list_issues',
      displayName: 'List issues',
      description: 'List recent Linear issues for a team.',
      inputSchema: {
        type: 'object',
        required: ['teamKey'],
        properties: {
          teamKey: { type: 'string' },
          limit: { type: 'number' },
        },
      },
      tags: ['issues', 'search'],
      kind: 'api',
    },
  ],
  invokeTool: async (name, input, ctx) => {
    if (!ctx?.credentials) throw new Error('Missing Linear credentials')
    const token = ctx.credentials.require('api_token')
    if (name === 'create_issue') {
      const title = String(input['title'] ?? '').trim()
      if (!title) throw new Error('Linear issue title is required')
      return {
        id: 'LIN-123',
        url: 'https://linear.example.com/acme/issue/LIN-123',
        title,
        teamKey: String(input['teamKey'] ?? 'ENG'),
        authenticated: token.startsWith('lin_'),
      }
    }
    if (name === 'list_issues') {
      return {
        issues: [
          { id: 'LIN-122', title: 'Ship SDK examples' },
          { id: 'LIN-123', title: 'Document tool registry flow' },
        ].slice(0, Number(input['limit'] ?? 10)),
      }
    }
    throw new Error(`Unknown Linear tool: ${name}`)
  },
})

const notion = defineSourceAdapter({
  id: 'notion',
  namespace: 'notion',
  displayName: 'Notion',
  kind: 'api',
  listTools: async () => [
    {
      name: 'search_pages',
      displayName: 'Search pages',
      description: 'Search Notion pages by query.',
      inputSchema: {
        type: 'object',
        required: ['query'],
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
        },
      },
      tags: ['docs', 'search'],
      kind: 'api',
    },
    {
      name: 'append_block',
      displayName: 'Append block',
      description: 'Append a paragraph block to a Notion page.',
      inputSchema: {
        type: 'object',
        required: ['pageId', 'text'],
        properties: {
          pageId: { type: 'string' },
          text: { type: 'string' },
        },
      },
      outputSchema: {
        type: 'object',
        required: ['blockId'],
        properties: {
          blockId: { type: 'string' },
        },
      },
      tags: ['docs', 'write'],
      kind: 'api',
    },
    {
      name: 'delete_page',
      displayName: 'Delete page',
      description: 'Archive a Notion page.',
      inputSchema: {
        type: 'object',
        required: ['pageId'],
        properties: { pageId: { type: 'string' } },
      },
      tags: ['docs', 'destructive'],
      kind: 'api',
    },
  ],
  invokeTool: async (name, input, ctx) => {
    if (!ctx?.credentials) throw new Error('Missing Notion credentials')
    const token = ctx.credentials.require('integration_token')
    if (name === 'search_pages') {
      return {
        pages: [
          { id: 'page_sdk', title: 'SDK launch plan' },
          { id: 'page_examples', title: 'Example registry notes' },
        ].slice(0, Number(input['limit'] ?? 10)),
        authenticated: token.startsWith('ntn_'),
      }
    }
    if (name === 'append_block') {
      return {
        blockId: 'block_123',
        pageId: String(input['pageId']),
        text: String(input['text']),
      }
    }
    if (name === 'delete_page') {
      return { archived: true, pageId: String(input['pageId']) }
    }
    throw new Error(`Unknown Notion tool: ${name}`)
  },
})

const traces = createMemoryTraceWriter({ workspaceId: 'local-sdk-demo' })

const registry = createToolRegistry({
  workspaceId: 'local-sdk-demo',
  traces,
  policy: createToolPolicy({
    rules: [
      {
        match: 'notion.delete_page',
        decision: { kind: 'require_approval', reason: 'Deleting knowledge-base content needs a human checkpoint.' },
      },
      { match: 'linear.*', decision: { kind: 'allow' } },
      { match: 'notion.*', decision: { kind: 'allow' } },
    ],
  }),
  credentials: createCredentialResolver({
    store: createMemoryCredentialStore({
      secrets: {
        linear_token: 'lin_dev_token',
        notion_token: 'ntn_dev_token',
      },
    }),
    bindings: [
      {
        workspace_id: 'local-sdk-demo',
        source_id: 'linear',
        slot: 'api_token',
        scope: 'workspace',
        value: { kind: 'secret', secret_id: 'linear_token' },
        status: 'active',
      },
      {
        workspace_id: 'local-sdk-demo',
        source_id: 'notion',
        slot: 'integration_token',
        scope: 'workspace',
        value: { kind: 'secret', secret_id: 'notion_token' },
        status: 'active',
      },
    ],
  }),
  sources: [linear, notion],
})

const issueSearch = await registry.search({ query: 'create issue', limit: 5 })
const docsSearch = await registry.search({ query: 'append block', limit: 5 })
const issueSchema = await registry.schema({ toolId: 'linear.create_issue' })
const issue = await registry.call('linear.create_issue', {
  teamKey: 'SDK',
  title: 'Create public SDK examples',
  description: 'Add offline examples for Linear and Notion adapters.',
  priority: 2,
})
const pages = await registry.call('notion.search_pages', { query: 'SDK', limit: 1 })
const block = await registry.call('notion.append_block', {
  pageId: 'page_sdk',
  text: 'The SDK registry can compose Linear and Notion-style adapters.',
})
const graph = issue.run_id ? await traces.graph(issue.run_id) : null

console.log({
  hits: [...issueSearch.hits, ...docsSearch.hits].map((hit) => hit.tool_id),
  issueInputSchema: issueSchema.input_schema,
  issue: issue.result,
  pages: pages.result,
  block: block.result,
  issueRun: graph
    ? {
        id: graph.run.id,
        status: graph.run.status,
        spans: graph.spans.map((span) => ({ kind: span.kind, title: span.title, status: span.status })),
      }
    : null,
})
