import { createHash, randomBytes } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http"
import type { AddressInfo } from "node:net"
import {
  applyCloudflareProvisioningPlan,
  createCloudflareProvisioningPlan,
  type CloudflareAccountRef,
  type CloudflareOrbitResourceRef,
  type CloudflareProvisioningLock,
} from "@hrbr/runtime-cloudflare"
import {
  runHarborLocalAppRoute,
  runHarborLocalJob,
  type HarborLocalAppDefinition,
  type HarborLocalJobDefinition,
  type HarborLocalTraceRecord,
} from "./jobs-apps"
import {
  completeHarborLocalOAuthCallback,
  type HarborLocalOAuthCallbackExchangeInput,
} from "./oauth"
import { harborLocalSecurityAction, requireHarborLocalConfirmation } from "./security"
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
  readonly jobs?: readonly HarborLocalJobDefinition[] | undefined
  readonly apps?: readonly HarborLocalAppDefinition[] | undefined
  readonly artifacts?: Readonly<Record<string, string>> | undefined
  readonly traceSink?: HarborLocalTraceRecord[] | undefined
  readonly oauth?: HarborLocalDaemonOAuthInput | undefined
}

export interface HarborLocalDaemonOAuthInput {
  readonly env?: Readonly<Record<string, string | undefined>> | undefined
  readonly envName?: string | undefined
  readonly exchangeCode: (input: HarborLocalOAuthCallbackExchangeInput) => Promise<{
    readonly accessToken: string
    readonly refreshToken?: string | undefined
    readonly tokenType?: string | undefined
    readonly expiresAt?: string | undefined
    readonly scopes?: readonly string[] | undefined
  }>
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

export interface EnsureHarborLocalDaemonConnectionInput {
  readonly projectRoot: string
  readonly runtimeVersion?: string | undefined
  readonly now?: (() => Date) | undefined
}

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

function html(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8" })
  res.end(body)
}

function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) return null
  return header.slice("Bearer ".length)
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  if (chunks.length === 0) return null
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

function isAuthed(req: IncomingMessage, token: string): boolean {
  return bearerToken(req) === token
}

interface CloudflareControlBody {
  readonly account: CloudflareAccountRef
  readonly desiredResources: readonly CloudflareOrbitResourceRef[]
  readonly confirmed?: boolean | undefined
}

async function readCloudflareLock(projectRoot: string): Promise<CloudflareProvisioningLock | null> {
  const paths = harborLocalPaths(projectRoot)
  try {
    return JSON.parse(await readFile(paths.cloudflareLock, "utf8")) as CloudflareProvisioningLock
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
    throw error
  }
}

async function writeCloudflareLock(projectRoot: string, lock: CloudflareProvisioningLock): Promise<void> {
  const paths = harborLocalPaths(projectRoot)
  await writeFile(paths.cloudflareLock, `${JSON.stringify(lock, null, 2)}\n`)
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

export async function ensureHarborLocalDaemonConnection(
  input: EnsureHarborLocalDaemonConnectionInput
): Promise<HarborLocalDaemonHandle> {
  return await startHarborLocalDaemon(input)
}

export async function startHarborLocalDaemon(
  input: StartHarborLocalDaemonInput
): Promise<HarborLocalDaemonHandle> {
  await ensureHarborLocalProject({ projectRoot: input.projectRoot })
  const now = input.now ?? (() => new Date())
  const token = input.token ?? createHarborLocalToken()
  const runtimeVersion = input.runtimeVersion ?? "0.0.0-dev"
  let info: HarborLocalRuntimeInfo

  const jobs = new Map((input.jobs ?? []).map((job) => [job.id, job]))
  const apps = new Map((input.apps ?? []).map((app) => [app.id, app]))

  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1")
      if (url.pathname === "/health") {
        json(res, 200, { ok: true, workspace_id: LOCAL_WORKSPACE_ID })
        return
      }
      if (url.pathname === "/mcp") {
        json(res, 501, { ok: false, code: "mcp_not_implemented" })
        return
      }
      if (url.pathname === "/oauth/callback") {
        if (!input.oauth) {
          json(res, 404, { ok: false, code: "oauth_not_configured" })
          return
        }
        const state = url.searchParams.get("state")
        const code = url.searchParams.get("code")
        if (!state || !code) {
          json(res, 400, { ok: false, code: "oauth_callback_missing_params" })
          return
        }
        const grant = await completeHarborLocalOAuthCallback(input.projectRoot, {
          state,
          code,
          env: input.oauth.env,
          envName: input.oauth.envName,
          exchangeCode: input.oauth.exchangeCode,
          now,
        })
        html(res, 200, `<h1>Harbor local OAuth connected</h1><p>${grant.sourceRefId}</p>`)
        return
      }
      if (url.pathname === "/control/info") {
        if (!isAuthed(req, token)) {
          json(res, 401, { ok: false, code: "unauthorized" })
          return
        }
        json(res, 200, { ok: true, runtime: info })
        return
      }
      if (url.pathname === "/control/cloudflare/status") {
        if (!isAuthed(req, token)) {
          json(res, 401, { ok: false, code: "unauthorized" })
          return
        }
        json(res, 200, await readCloudflareLock(input.projectRoot))
        return
      }
      if (url.pathname === "/control/cloudflare/plan") {
        if (!isAuthed(req, token)) {
          json(res, 401, { ok: false, code: "unauthorized" })
          return
        }
        const body = await readJsonBody(req) as CloudflareControlBody
        json(res, 200, createCloudflareProvisioningPlan({
          account: body.account,
          desiredResources: body.desiredResources,
          currentLock: await readCloudflareLock(input.projectRoot),
        }))
        return
      }
      if (url.pathname === "/control/cloudflare/apply") {
        if (!isAuthed(req, token)) {
          json(res, 401, { ok: false, code: "unauthorized" })
          return
        }
        const body = await readJsonBody(req) as CloudflareControlBody
        const plan = createCloudflareProvisioningPlan({
          account: body.account,
          desiredResources: body.desiredResources,
          currentLock: await readCloudflareLock(input.projectRoot),
        })
        requireHarborLocalConfirmation({
          action: harborLocalSecurityAction({
            kind: "cloudflare.mutate",
            title: "Apply Cloudflare provisioning plan",
            destructive: plan.requiresConfirmation,
          }),
          confirmed: body.confirmed === true,
        })
        const lock = await applyCloudflareProvisioningPlan({
          plan,
          confirmed: body.confirmed === true,
          now,
        })
        await writeCloudflareLock(input.projectRoot, lock)
        json(res, 200, lock)
        return
      }
      const jobMatch = url.pathname.match(/^\/jobs\/([^/]+)\/run$/)
      if (jobMatch?.[1]) {
        if (!isAuthed(req, token)) {
          json(res, 401, { ok: false, code: "unauthorized" })
          return
        }
        const job = jobs.get(decodeURIComponent(jobMatch[1]))
        if (!job) {
          json(res, 404, { ok: false, code: "job_not_found" })
          return
        }
        const body = await readJsonBody(req)
        const run = await runHarborLocalJob({ job, input: body, now })
        input.traceSink?.push(run.trace)
        json(res, 200, { ok: true, output: run.output, trace: run.trace })
        return
      }
      const appMatch = url.pathname.match(/^\/apps\/([^/]+)(\/.*)?$/)
      if (appMatch?.[1]) {
        const app = apps.get(decodeURIComponent(appMatch[1]))
        if (!app) {
          json(res, 404, { ok: false, code: "app_not_found" })
          return
        }
        const appResponse = await runHarborLocalAppRoute({
          app,
          now,
          request: {
            appId: app.id,
            method: req.method ?? "GET",
            path: appMatch[2] ?? "/",
            query: Object.fromEntries(url.searchParams.entries()),
            body: req.method === "GET" ? undefined : await readJsonBody(req),
          },
        })
        input.traceSink?.push(appResponse.trace)
        if (appResponse.contentType === "text/html") {
          html(res, appResponse.status, String(appResponse.body ?? ""))
          return
        }
        json(res, appResponse.status, appResponse.body)
        return
      }
      const artifactMatch = url.pathname.match(/^\/artifacts\/(.+)$/)
      if (artifactMatch?.[1]) {
        const artifact = input.artifacts?.[decodeURIComponent(artifactMatch[1])]
        if (artifact === undefined) {
          json(res, 404, { ok: false, code: "artifact_not_found" })
          return
        }
        res.writeHead(200, { "content-type": "application/octet-stream" })
        res.end(artifact)
        return
      }
      json(res, 404, { ok: false, code: "not_found" })
    })().catch((error: unknown) => {
      json(res, 500, { ok: false, code: "runtime_error", message: (error as Error).message })
    })
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
    token,
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
