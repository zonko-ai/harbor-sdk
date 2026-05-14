import { describe, expect, it } from 'bun:test'
import { createCredentialResolver, createMemoryCredentialStore } from '@hrbr/source-credentials'
import { createToolRegistry } from '@hrbr/tools'
import { createMcpHttpSourceAdapter, McpSourceError } from '../src/index'

function json(payload: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers instanceof Headers
        ? Object.fromEntries(init.headers.entries())
        : init?.headers),
    },
  })
}

describe('@hrbr/source-mcp', () => {
  it('adapts a developer-owned MCP HTTP endpoint into a local tool registry source', async () => {
    const seen: Array<{ method: string; authorization: string | null; session: string | null }> = []
    const initializeParams: unknown[] = []
    const fetch: typeof globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { method: string; params?: unknown }
      const headers = new Headers(init?.headers)
      seen.push({
        method: body.method,
        authorization: headers.get('authorization'),
        session: headers.get('mcp-session-id'),
      })

      if (body.method === 'initialize') {
        initializeParams.push(body.params)
        return json(
          {
            jsonrpc: '2.0',
            id: 1,
            result: {
              protocolVersion: '2025-03-26',
              capabilities: {},
              serverInfo: { name: 'dev-cf-worker' },
            },
          },
          { headers: { 'mcp-session-id': 'session-1' } }
        )
      }
      if (body.method === 'notifications/initialized') return new Response(null, { status: 202 })
      if (body.method === 'tools/list') {
        return json({
          jsonrpc: '2.0',
          id: 2,
          result: {
            tools: [
              {
                name: 'deploy',
                description: 'Deploy a worker.',
                inputSchema: {
                  type: 'object',
                  required: ['name'],
                  properties: { name: { type: 'string' } },
                },
              },
            ],
          },
        })
      }
      if (body.method === 'tools/call') {
        return json({
          jsonrpc: '2.0',
          id: 3,
          result: {
            content: [{ type: 'text', text: 'deployed' }],
            structuredContent: { ok: true, target: 'worker-a' },
          },
        })
      }
      throw new Error(`Unexpected method ${body.method}`)
    }

    const source = createMcpHttpSourceAdapter({
      id: 'own-cf',
      namespace: 'own_cf',
      displayName: 'Own Cloudflare MCP',
      endpoint: 'https://worker.example.com/mcp',
      fetch,
      bearerCredentialSlot: 'token',
    })
    const registry = createToolRegistry({
      workspaceId: 'local-dev',
      credentials: createCredentialResolver({
        store: createMemoryCredentialStore({ secrets: { cf_token: 'cf-dev-token' } }),
        bindings: [
          {
            workspace_id: 'local-dev',
            source_id: 'own-cf',
            slot: 'token',
            scope: 'workspace',
            value: { kind: 'secret', secret_id: 'cf_token' },
            status: 'active',
          },
        ],
      }),
      sources: [source],
    })

    await expect(registry.search({ query: 'worker' })).resolves.toMatchObject({
      hits: [{ tool_id: 'own_cf.deploy', namespace: 'own_cf', kind: 'mcp' }],
    })
    await expect(registry.call('own_cf.deploy', { name: 'worker-a' })).resolves.toMatchObject({
      result: {
        content: [{ type: 'text', text: 'deployed' }],
        structuredContent: { ok: true, target: 'worker-a' },
      },
    })
    expect(seen.map((entry) => entry.method)).toEqual([
      'initialize',
      'notifications/initialized',
      'tools/list',
      'tools/call',
    ])
    expect(initializeParams[0]).toMatchObject({
      clientInfo: { name: '@hrbr/source-mcp', version: '0.0.0' },
    })
    expect(seen.every((entry) => entry.authorization === 'Bearer cf-dev-token')).toBe(true)
    expect(seen.slice(1).every((entry) => entry.session === 'session-1')).toBe(true)
  })

  it('surfaces MCP JSON-RPC failures with method and provider code', async () => {
    const source = createMcpHttpSourceAdapter({
      namespace: 'broken',
      displayName: 'Broken MCP',
      endpoint: 'https://broken.example.com/mcp',
      fetch: async () =>
        json({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32601, message: 'Method not found' },
        }),
    })

    await expect(source.listTools()).rejects.toMatchObject({
      name: 'McpSourceError',
      method: 'initialize',
      code: -32601,
    } satisfies Partial<McpSourceError>)
  })

  it('fails before network I/O when a configured bearer credential is missing', async () => {
    let called = false
    const source = createMcpHttpSourceAdapter({
      namespace: 'secure',
      displayName: 'Secure MCP',
      endpoint: 'https://secure.example.com/mcp',
      bearerCredentialSlot: 'token',
      fetch: async () => {
        called = true
        return json({})
      },
    })

    await expect(source.listTools()).rejects.toMatchObject({
      name: 'McpSourceError',
      method: 'initialize',
      message: 'MCP source "secure" requires credential slot "token".',
    } satisfies Partial<McpSourceError>)
    expect(called).toBe(false)
  })

  it('rejects local endpoints unless explicitly allowed', () => {
    expect(() =>
      createMcpHttpSourceAdapter({
        namespace: 'local',
        displayName: 'Local MCP',
        endpoint: 'http://127.0.0.1:7331/mcp',
      })
    ).toThrow(/allowLocalNetwork/)

    expect(() =>
      createMcpHttpSourceAdapter({
        namespace: 'local',
        displayName: 'Local MCP',
        endpoint: 'http://127.0.0.1:7331/mcp',
        allowLocalNetwork: true,
      })
    ).not.toThrow()
  })

  it('rejects invalid timeouts during adapter construction', () => {
    expect(() =>
      createMcpHttpSourceAdapter({
        namespace: 'timeout',
        displayName: 'Timeout MCP',
        endpoint: 'https://timeout.example.com/mcp',
        timeoutMs: 0,
      })
    ).toThrow(/timeoutMs must be a positive number/)
  })

  it('uses caller abort signals for MCP requests', async () => {
    const controller = new AbortController()
    const seen: AbortSignal[] = []
    const source = createMcpHttpSourceAdapter({
      namespace: 'abortable',
      displayName: 'Abortable MCP',
      endpoint: 'https://abortable.example.com/mcp',
      fetch: async (_url, init) => {
        seen.push(init?.signal as AbortSignal)
        return json({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: {},
          },
        })
      },
    })

    await source.listTools({ signal: controller.signal })

    expect(seen[0]).toBeDefined()
    expect(seen[0]).not.toBe(controller.signal)
  })

  it('does not follow MCP endpoint redirects', async () => {
    const redirects: Array<RequestRedirect | undefined> = []
    const source = createMcpHttpSourceAdapter({
      namespace: 'redirect',
      displayName: 'Redirect MCP',
      endpoint: 'https://redirect.example.com/mcp',
      fetch: async (_url, init) => {
        redirects.push(init?.redirect)
        return json({
          jsonrpc: '2.0',
          id: 1,
          result: {
            protocolVersion: '2025-03-26',
            capabilities: {},
          },
        })
      },
    })

    await source.listTools()

    expect(redirects[0]).toBe('error')
  })

  it('wraps invalid JSON responses as MCP source errors', async () => {
    const source = createMcpHttpSourceAdapter({
      namespace: 'invalid',
      displayName: 'Invalid JSON MCP',
      endpoint: 'https://invalid.example.com/mcp',
      fetch: async () => new Response('not-json', { headers: { 'content-type': 'application/json' } }),
    })

    await expect(source.listTools()).rejects.toMatchObject({
      name: 'McpSourceError',
      method: 'initialize',
      message: 'MCP initialize response was not valid JSON.',
    } satisfies Partial<McpSourceError>)
  })
})
