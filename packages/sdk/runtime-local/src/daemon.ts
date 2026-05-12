import { createHash, randomBytes } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import type { AddressInfo } from "node:net"
import {
  ensureHarborLocalProject,
  harborLocalPaths,
  LOCAL_WORKSPACE_ID,
  type HarborLocalRuntimeInfo,
  type HarborLocalRuntimeManifest,
  type HarborLocalRuntimeStatus,
} from "./index"

export interface StartHarborLocalDaemonInput {
  readonly projectRoot: string
  readonly runtimeVersion?: string | undefined
  readonly token?: string | undefined
  readonly now?: (() => Date) | undefined
}

export interface HarborLocalDaemonHandle {
  readonly info: HarborLocalRuntimeInfo
  readonly token: string
  readonly origin: string
  readonly close: () => Promise<void>
}

export interface HarborLocalDaemonManifestReadResult {
  readonly manifest: HarborLocalRuntimeManifest | null
  readonly status: HarborLocalRuntimeStatus
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) return null
  return header.slice("Bearer ".length)
}

export function hashHarborLocalToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export function createHarborLocalToken(): string {
  return randomBytes(32).toString("base64url")
}

async function listen(server: Server): Promise<number> {
  return await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject)
      const address = server.address() as AddressInfo
      resolve(address.port)
    })
  })
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

export async function readHarborLocalRuntimeManifest(
  projectRoot: string
): Promise<HarborLocalDaemonManifestReadResult> {
  const paths = harborLocalPaths(projectRoot)
  try {
    const manifest = JSON.parse(await readFile(paths.runtime, "utf8")) as HarborLocalRuntimeManifest
    return { manifest, status: "stopped" }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { manifest: null, status: "stopped" }
    }
    throw error
  }
}

export async function startHarborLocalDaemon(
  input: StartHarborLocalDaemonInput
): Promise<HarborLocalDaemonHandle> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const now = input.now ?? (() => new Date())
  const token = input.token ?? createHarborLocalToken()
  const runtimeVersion = input.runtimeVersion ?? "0.0.0-dev"
  let info: HarborLocalRuntimeInfo

  const server = createServer((req, res) => {
    if (req.url === "/health") {
      json(res, 200, { ok: true, workspace_id: LOCAL_WORKSPACE_ID })
      return
    }
    if (req.url === "/mcp") {
      json(res, 501, { ok: false, code: "mcp_not_implemented" })
      return
    }
    if (req.url === "/control/info") {
      if (bearerToken(req) !== token) {
        json(res, 401, { ok: false, code: "unauthorized" })
        return
      }
      json(res, 200, { ok: true, runtime: info })
      return
    }
    json(res, 404, { ok: false, code: "not_found" })
  })

  const port = await listen(server)
  info = {
    projectRoot: input.projectRoot,
    workspaceId: LOCAL_WORKSPACE_ID,
    host: "127.0.0.1",
    port,
    pid: process.pid,
    status: "running",
    runtimeVersion,
  }

  const timestamp = now().toISOString()
  const paths = harborLocalPaths(input.projectRoot)
  const manifest: HarborLocalRuntimeManifest = {
    workspaceId: LOCAL_WORKSPACE_ID,
    projectRoot: input.projectRoot,
    host: "127.0.0.1",
    port,
    tokenHash: hashHarborLocalToken(token),
    runtimeVersion,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await writeFile(paths.runtime, `${JSON.stringify(manifest, null, 2)}\n`)

  return {
    info,
    token,
    origin: `http://127.0.0.1:${port}`,
    close: async () => {
      await closeServer(server)
    },
  }
}
