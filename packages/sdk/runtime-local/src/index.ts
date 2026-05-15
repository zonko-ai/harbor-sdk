import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { initializeHarborLocalSqlite } from "./sqlite"

export {
  harborLocalSecurityAction,
  requireHarborLocalConfirmation,
  runHarborLocalStaticSecurityChecks,
  type HarborLocalConfirmationInput,
  type HarborLocalSecurityAction,
  type HarborLocalSecurityActionKind,
  type HarborLocalStaticCheck,
} from "./security"

export {
  createHarborLocalSubmissionSecurityChecklist,
  createHarborLocalSubmissionSnapshot,
  harborLocalSubmissionLayout,
  validateHarborLocalSubmission,
  type HarborLocalSubmissionFile,
  type HarborLocalSubmissionSecurityCheck,
  type HarborLocalSubmissionSnapshot,
  type HarborLocalSubmissionValidationResult,
} from "./submission"

export {
  generateHarborLocalPluginPackageManifest,
  generateHarborLocalWorkflowPackageManifest,
  validateHarborLocalPackageManifest,
  type HarborLocalPackageAuthRequirement,
  type HarborLocalPackageCompatibility,
  type HarborLocalPackageDocs,
  type HarborLocalPackageManifest,
  type HarborLocalPackageOwner,
  type HarborLocalPackageSourceMetadata,
  type HarborLocalPackageToolMetadata,
  type HarborLocalPackageValidationResult,
} from "./package-format"

export {
  createHarborLocalWorkflowReplayFixture,
  generateHarborLocalWorkflowManifest,
  runHarborLocalWorkflow,
  validateHarborLocalWorkflowRequirements,
  type HarborLocalWorkflowDefinition,
  type HarborLocalWorkflowJobStep,
  type HarborLocalWorkflowManifest,
  type HarborLocalWorkflowReplayFixture,
  type HarborLocalWorkflowRunInput,
  type HarborLocalWorkflowRunResult,
  type HarborLocalWorkflowStep,
  type HarborLocalWorkflowStepResult,
  type HarborLocalWorkflowToolStep,
} from "./workflows"

export {
  matchHarborLocalAppRoute,
  runHarborLocalAppRoute,
  runHarborLocalJob,
  validateHarborLocalJsonSchema,
  type HarborLocalAppDefinition,
  type HarborLocalAppRequest,
  type HarborLocalAppResponse,
  type HarborLocalAppRouteDefinition,
  type HarborLocalJobDefinition,
  type HarborLocalJobRunInput,
  type HarborLocalJobRunResult,
  type HarborLocalJsonSchema,
  type HarborLocalTraceRecord,
} from "./jobs-apps"

export {
  runHarborLocalQuickJS,
  type HarborLocalQuickJSExecutionInput,
  type HarborLocalQuickJSExecutionResult,
  type HarborLocalQuickJSHostCallHandler,
  type HarborLocalQuickJSHostCallName,
  type HarborLocalQuickJSNamespaceBinding,
} from "./quickjs"

export {
  createHarborLocalExecRuntime,
  harborLocalNamespaceToJsVar,
  type HarborLocalExecBinding,
  type HarborLocalExecRunOptions,
  type HarborLocalExecRunResult,
  type HarborLocalExecRuntime,
  type HarborLocalExecRuntimeInput,
  type HarborLocalExecToolGuide,
} from "./exec"

export {
  createHarborLocalToolIndex,
  type HarborLocalToolDescription,
  type HarborLocalToolIndex,
  type HarborLocalToolIndexRecord,
  type HarborLocalToolCallHandler,
  type HarborLocalToolCallInput,
  type HarborLocalToolCallResult,
  type HarborLocalToolIndexOptions,
  type HarborLocalToolSchema,
  type HarborLocalToolSchemasInput,
  type HarborLocalToolSearchHit,
  type HarborLocalToolSearchInput,
} from "./tool-search"

export {
  harborLocalDefaultWriteToolMatcher,
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryActionSchema,
  harborLocalRegistryAgentStepSchema,
  runHarborLocalRegistryAction,
  type HarborLocalRegistryAgentStep,
  type HarborLocalRegistryAction,
  type HarborLocalRegistryActionInput,
  type HarborLocalRegistryActionResult,
  type HarborLocalRegistryWriteToolInput,
  type HarborLocalRegistryWriteToolMatcher,
} from "./tool-registry-actions"

export {
  buildHarborLocalToolIndexFromSqlite,
  createHarborLocalCredentialResolver,
  createHarborLocalCredentialResolverFromEnv,
  installHarborLocalPluginManifest,
  listHarborLocalSources,
  type HarborLocalCredentialResolveInput,
  type HarborLocalCredentialResolverFromEnvInput,
  type HarborLocalCredentialResolverInput,
  type HarborLocalCredentialResolver,
  type HarborLocalPluginInstallResult,
  type HarborLocalResolvedCredentials,
  type HarborLocalSourceRef,
} from "./plugin-store"

export {
  HARBOR_LOCAL_CREDENTIAL_KEY_ENV,
  importHarborLocalCredentialsFromEnv,
  importHarborLocalCredentialsFromEnvKey,
  readHarborLocalCredentialKeyFromEnv,
  readHarborLocalCredentials,
  readHarborLocalCredentialsFromEnvKey,
  redactHarborSecret,
  writeHarborLocalCredentials,
  type HarborLocalCredentialEnvImportInput,
  type HarborLocalCredentialEnvImportFromKeyInput,
  type HarborLocalCredentialKeyEnvInput,
  type HarborLocalCredentialRecord,
  type HarborLocalCredentialsFile,
  type HarborLocalEncryptedCredentialsFile,
} from "./credentials"

export {
  readHarborRegistryDevRefs,
  removeHarborRegistryDevRef,
  upsertHarborRegistryDevRef,
  watchHarborRegistryDevRefs,
  writeHarborRegistryDevRefs,
  type HarborRegistryDevRefInput,
  type HarborRegistryWatchEvent,
  type HarborRegistryWatcher,
} from "./registry"

export {
  completeHarborLocalOAuthCallback,
  completeHarborLocalOAuthFlow,
  refreshHarborLocalOAuthGrant,
  readHarborLocalOAuthPendingFlow,
  readHarborLocalOAuthStatus,
  startHarborLocalOAuthFlow,
  type HarborLocalOAuthCallbackExchangeInput,
  type HarborLocalOAuthCallbackInput,
  type HarborLocalOAuthClientInput,
  type HarborLocalOAuthCompleteInput,
  type HarborLocalOAuthGrant,
  type HarborLocalOAuthPendingFlow,
  type HarborLocalOAuthRefreshInput,
  type HarborLocalOAuthRefreshResult,
  type HarborLocalOAuthStartResult,
  type HarborLocalOAuthStatus,
} from "./oauth"

export {
  createHarborLocalMcpPluginRuntime,
  installHarborLocalMcpPlugin,
  type HarborLocalMcpPluginAuth,
  type HarborLocalMcpPluginDefinition,
  type HarborLocalMcpPluginRuntime,
  type HarborLocalMcpPluginRuntimeInput,
} from "./mcp-plugin"

export {
  listHarborLocalMcpToolBindings,
  putHarborLocalMcpToolBindings,
  readHarborLocalMcpSource,
  updateHarborLocalMcpSourceStatus,
  upsertHarborLocalMcpSource,
  type HarborLocalMcpAuthInput,
  type HarborLocalMcpCredentialInput,
  type HarborLocalMcpRemoteTransport,
  type HarborLocalMcpSourceInput,
  type HarborLocalMcpSourceStatus,
  type HarborLocalMcpStoredSource,
  type HarborLocalMcpToolBinding,
  type HarborLocalMcpToolBindingInput,
} from "./mcp-store"

export {
  connectHarborLocalMcpOAuthSource,
  createHarborLocalMcpToolIndexFromBindings,
  createHarborLocalMcpToolRuntime,
  probeHarborLocalMcpSource,
  refreshHarborLocalMcpSource,
  type HarborLocalMcpOAuthConnectHandle,
  type HarborLocalMcpOAuthConnectInput,
  type HarborLocalMcpOAuthDiscovery,
  type HarborLocalMcpProbeSourceInput,
  type HarborLocalMcpProbeSourceResult,
  type HarborLocalMcpRefreshSourceInput,
  type HarborLocalMcpRefreshSourceResult,
  type HarborLocalMcpToolRuntimeInput,
} from "./mcp-runtime"

export {
  createHarborLocalToken,
  ensureHarborLocalDaemonConnection,
  hashHarborLocalToken,
  readHarborLocalRuntimeManifest,
  startHarborLocalDaemon,
  type EnsureHarborLocalDaemonConnectionInput,
  type HarborLocalDaemonHandle,
  type HarborLocalDaemonManifestReadResult,
  type StartHarborLocalDaemonInput,
} from "./daemon"

export {
  expectedHarborLocalTables,
  HARBOR_LOCAL_MIGRATIONS,
  HARBOR_LOCAL_SCHEMA_VERSION,
  HARBOR_LOCAL_TABLES,
  initializeHarborLocalSqlite,
  runHarborLocalMigrations,
  type HarborLocalMigration,
  type HarborLocalSqlExecutor,
  type HarborLocalTable,
} from "./sqlite"

export const LOCAL_WORKSPACE_ID = "local"
export const HARBOR_LOCAL_DIR = ".harbor"
export const HARBOR_RUNTIME_FILE = "runtime.json"
export const HARBOR_SQLITE_FILE = "harbor.sqlite"
export const HARBOR_CREDENTIALS_FILE = "credentials.enc"
export const HARBOR_REGISTRY_REFS_FILE = "registry-dev-refs.json"

export const HARBOR_LOCAL_LAYOUT = {
  root: HARBOR_LOCAL_DIR,
  runtime: `${HARBOR_LOCAL_DIR}/${HARBOR_RUNTIME_FILE}`,
  sqlite: `${HARBOR_LOCAL_DIR}/${HARBOR_SQLITE_FILE}`,
  credentials: `${HARBOR_LOCAL_DIR}/${HARBOR_CREDENTIALS_FILE}`,
  registryRefs: `${HARBOR_LOCAL_DIR}/${HARBOR_REGISTRY_REFS_FILE}`,
  artifacts: `${HARBOR_LOCAL_DIR}/artifacts`,
  traces: `${HARBOR_LOCAL_DIR}/traces`,
  cache: `${HARBOR_LOCAL_DIR}/cache`,
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
  readonly token: string
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
}

export interface HarborLocalRuntime {
  readonly info: () => Promise<HarborLocalRuntimeInfo>
  readonly ensure: () => Promise<HarborLocalRuntimeInfo>
  readonly stop: () => Promise<void>
}

export interface HarborLocalDaemonConnection {
  readonly origin: string
  readonly token: string
  readonly headers: Readonly<Record<string, string>>
}

export function harborLocalPaths(projectRoot: string): HarborLocalRuntimePaths {
  const root = projectRoot.replace(/\/$/, "")
  const resolve = (path: string) => join(root, path)
  return {
    root: resolve(HARBOR_LOCAL_LAYOUT.root),
    runtime: resolve(HARBOR_LOCAL_LAYOUT.runtime),
    sqlite: resolve(HARBOR_LOCAL_LAYOUT.sqlite),
    credentials: resolve(HARBOR_LOCAL_LAYOUT.credentials),
    registryRefs: resolve(HARBOR_LOCAL_LAYOUT.registryRefs),
    artifacts: resolve(HARBOR_LOCAL_LAYOUT.artifacts),
    traces: resolve(HARBOR_LOCAL_LAYOUT.traces),
    cache: resolve(HARBOR_LOCAL_LAYOUT.cache),
  }
}

export interface HarborRegistryDevRefsFile {
  readonly version: 1
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly refs: readonly HarborRegistryDevRef[]
}

export interface HarborRegistryDevRef {
  readonly kind: "source" | "plugin" | "workflow" | "job" | "app"
  readonly path: string
  readonly name?: string | undefined
}

export interface EnsureHarborLocalProjectInput {
  readonly projectRoot: string
  readonly updateGitignore?: boolean | undefined
}

export interface EnsureHarborLocalProjectResult {
  readonly workspaceId: typeof LOCAL_WORKSPACE_ID
  readonly paths: HarborLocalRuntimePaths
  readonly gitignoreUpdated: boolean
}

const DEFAULT_REGISTRY_REFS: HarborRegistryDevRefsFile = {
  version: 1,
  workspaceId: LOCAL_WORKSPACE_ID,
  refs: [],
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await readFile(path)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false
    throw error
  }
}

async function writeJsonIfMissing(path: string, value: unknown): Promise<void> {
  if (await pathExists(path)) return
  try {
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") return
    throw error
  }
}

export async function ensureHarborGitignore(projectRoot: string): Promise<boolean> {
  const path = join(projectRoot, ".gitignore")
  let existing = ""
  try {
    existing = await readFile(path, "utf8")
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
  }

  const lines = existing.split(/\r?\n/).map((line) => line.trim())
  if (lines.includes(`${HARBOR_LOCAL_DIR}/`) || lines.includes(HARBOR_LOCAL_DIR)) return false

  const prefix = existing.length > 0 && !existing.endsWith("\n") ? "\n" : ""
  await writeFile(path, `${existing}${prefix}${HARBOR_LOCAL_DIR}/\n`)
  return true
}

export async function ensureHarborLocalProject(
  input: EnsureHarborLocalProjectInput
): Promise<EnsureHarborLocalProjectResult> {
  const paths = harborLocalPaths(input.projectRoot)
  await mkdir(paths.root, { recursive: true })
  await mkdir(paths.artifacts, { recursive: true })
  await mkdir(paths.traces, { recursive: true })
  await mkdir(paths.cache, { recursive: true })
  await writeJsonIfMissing(paths.registryRefs, DEFAULT_REGISTRY_REFS)
  await initializeHarborLocalSqlite(paths.sqlite)

  const gitignoreUpdated =
    input.updateGitignore === false ? false : await ensureHarborGitignore(input.projectRoot)

  return {
    workspaceId: LOCAL_WORKSPACE_ID,
    paths,
    gitignoreUpdated,
  }
}

export function harborLocalDaemonConnection(
  manifest: HarborLocalRuntimeManifest
): HarborLocalDaemonConnection {
  return {
    origin: `http://${manifest.host}:${manifest.port}`,
    token: manifest.token,
    headers: { authorization: `Bearer ${manifest.token}` },
  }
}
