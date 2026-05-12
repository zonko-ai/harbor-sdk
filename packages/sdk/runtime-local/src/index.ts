export const LOCAL_WORKSPACE_ID = "local"
export const HARBOR_LOCAL_DIR = ".harbor"
export const HARBOR_RUNTIME_FILE = "runtime.json"
export const HARBOR_SQLITE_FILE = "harbor.sqlite"
export const HARBOR_CREDENTIALS_FILE = "credentials.enc"
export const HARBOR_REGISTRY_REFS_FILE = "registry-dev-refs.json"
export const HARBOR_CLOUDFLARE_LOCK_FILE = "cloudflare.lock.json"

export const HARBOR_LOCAL_LAYOUT = {
  root: HARBOR_LOCAL_DIR,
  runtime: `${HARBOR_LOCAL_DIR}/${HARBOR_RUNTIME_FILE}`,
  sqlite: `${HARBOR_LOCAL_DIR}/${HARBOR_SQLITE_FILE}`,
  credentials: `${HARBOR_LOCAL_DIR}/${HARBOR_CREDENTIALS_FILE}`,
  registryRefs: `${HARBOR_LOCAL_DIR}/${HARBOR_REGISTRY_REFS_FILE}`,
  artifacts: `${HARBOR_LOCAL_DIR}/artifacts`,
  traces: `${HARBOR_LOCAL_DIR}/traces`,
  cache: `${HARBOR_LOCAL_DIR}/cache`,
  cloudflareLock: `${HARBOR_LOCAL_DIR}/${HARBOR_CLOUDFLARE_LOCK_FILE}`,
} as const

export type HarborLocalRuntimeStatus = "stopped" | "starting" | "running" | "stale"

export interface HarborLocalRuntimeInfo {
  readonly projectRoot: string
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly host: "127.0.0.1"
  readonly port: number
  readonly pid?: number | undefined
  readonly status: HarborLocalRuntimeStatus
  readonly runtimeVersion: string
}

export interface HarborLocalRuntimeToken {
  readonly token: string
  readonly createdAt: string
}

export interface HarborLocalRuntimeManifest {
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly projectRoot: string
  readonly host: "127.0.0.1"
  readonly port: number
  readonly tokenHash: string
  readonly runtimeVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface HarborLocalRuntimePaths {
  readonly root: string
  readonly runtime: string
  readonly sqlite: string
  readonly credentials: string
  readonly registryRefs: string
  readonly artifacts: string
  readonly traces: string
  readonly cache: string
  readonly cloudflareLock: string
}

export interface HarborLocalRuntime {
  readonly info: () => Promise<HarborLocalRuntimeInfo>
  readonly ensure: () => Promise<HarborLocalRuntimeInfo>
  readonly stop: () => Promise<void>
}

export function harborLocalPaths(projectRoot: string): HarborLocalRuntimePaths {
  const join = (path: string) => `${projectRoot.replace(/\/$/, "")}/${path}`
  return {
    root: join(HARBOR_LOCAL_LAYOUT.root),
    runtime: join(HARBOR_LOCAL_LAYOUT.runtime),
    sqlite: join(HARBOR_LOCAL_LAYOUT.sqlite),
    credentials: join(HARBOR_LOCAL_LAYOUT.credentials),
    registryRefs: join(HARBOR_LOCAL_LAYOUT.registryRefs),
    artifacts: join(HARBOR_LOCAL_LAYOUT.artifacts),
    traces: join(HARBOR_LOCAL_LAYOUT.traces),
    cache: join(HARBOR_LOCAL_LAYOUT.cache),
    cloudflareLock: join(HARBOR_LOCAL_LAYOUT.cloudflareLock),
  }
}
