import { randomUUID } from "node:crypto"
import * as http from "node:http"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js"
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js"
import type { z } from "zod"

export interface HarborMcpTestTool {
  readonly name: string
  readonly description?: string | undefined
  readonly inputSchema?: z.ZodRawShape | undefined
  readonly annotations?: ToolAnnotations | undefined
  readonly handler: (input: Record<string, unknown>) => CallToolResult | Promise<CallToolResult>
}

export interface HarborMcpTestServerInput {
  readonly name: string
  readonly version?: string | undefined
  readonly tools: readonly HarborMcpTestTool[]
}

export interface HarborMcpTestServerHandle {
  readonly url: string
  readonly sessionCount: () => number
  readonly close: () => Promise<void>
}

function createMcpServer(input: HarborMcpTestServerInput): McpServer {
  const server = new McpServer({
    name: input.name,
    version: input.version ?? "0.0.0-test",
  })

  for (const tool of input.tools) {
    server.registerTool(tool.name, {
      ...(tool.description !== undefined ? { description: tool.description } : {}),
      ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema } : {}),
      ...(tool.annotations !== undefined ? { annotations: tool.annotations } : {}),
    }, async (args: unknown) => tool.handler(args as Record<string, unknown>))
  }

  return server
}

export async function serveHarborMcpTestServer(
  input: HarborMcpTestServerInput
): Promise<HarborMcpTestServerHandle> {
  const transports = new Map<string, StreamableHTTPServerTransport>()
  let sessions = 0

  const server = http.createServer(async (req, res) => {
    const sessionId = req.headers["mcp-session-id"]
    if (typeof sessionId === "string") {
      const transport = transports.get(sessionId)
      if (!transport) {
        res.writeHead(404)
        res.end("Session not found")
        return
      }
      await transport.handleRequest(req, res)
      return
    }

    const mcpServer = createMcpServer(input)
    sessions += 1
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id: string) => {
        transports.set(id, transport)
      },
    })

    await mcpServer.connect(transport as Parameters<McpServer["connect"]>[0])
    await transport.handleRequest(req, res)
  })

  const url = await new Promise<string>((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      if (!address || typeof address === "string") throw new Error("MCP test server did not bind to a TCP port.")
      resolve(`http://127.0.0.1:${address.port}`)
    })
  })

  return {
    url,
    sessionCount: () => sessions,
    close: () => new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve())
    }),
  }
}
