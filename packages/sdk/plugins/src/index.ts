// @hrbr/plugins — Plugin, tool, and credential contracts.
// All domain types as Effect schemas. Implementation contracts as interfaces.
import { Schema } from "effect"
import {
  SandResultMode,
  SandRuntimeSpec,
  SandRuntimeConstraints,
  SandIsolationPolicy,
  SandSecretBinding,
  SandStdinMode,
} from "@hrbr/sand"

const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
const RegistryNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/))
const RegistryToolIdentifier = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/))
const ExternalToolIdentifier = Schema.NonEmptyString
const SecretEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/))

// ── Source Kind ──────────────────────────────────────────────────────

export const SourceKind = Schema.Literals(["mcp", "cli", "api"])
export type SourceKind = typeof SourceKind.Type

// ── MCP Source Config ────────────────────────────────────────────────

export const McpOAuthDiscovery = Schema.Struct({
  authorization_server: Schema.String,
  authorization_endpoint: Schema.String,
  token_endpoint: Schema.String,
  registration_endpoint: Schema.optional(Schema.String),
  scopes_supported: Schema.Array(Schema.String),
  has_dynamic_registration: Schema.Boolean,
  /** RFC 8414 §2: URL of provider developer portal / docs for registering apps. */
  service_documentation: Schema.optional(Schema.String),
  /** RFC 8414 §2: URL of provider policy / ToS (for display only). */
  op_policy_uri: Schema.optional(Schema.String),
  op_tos_uri: Schema.optional(Schema.String),
  /** RFC 8414 §2. If `["none"]` the AS treats clients as public (PKCE-only). */
  token_endpoint_auth_methods_supported: Schema.optional(Schema.Array(Schema.String)),
  /** RFC 9728: the MCP resource identifier from Protected Resource Metadata. */
  resource: Schema.optional(Schema.String),
  /** RFC 9728: documentation URL for the resource (provider's app registration docs). */
  resource_documentation: Schema.optional(Schema.String),
  /** RFC 7009 / RFC 8414 §2: endpoint to revoke access/refresh tokens. */
  revocation_endpoint: Schema.optional(Schema.String),
})
export type McpOAuthDiscovery = typeof McpOAuthDiscovery.Type

/**
 * Pre-configured OAuth client credentials for providers that do NOT support
 * RFC 7591 dynamic client registration (GitHub, PostHog proxy client, etc.).
 *
 * Per MCP Authorization spec (2025-03-26 §2.3) clients MAY use pre-registered
 * OAuth clients when the authorization server does not advertise a
 * `registration_endpoint`. All fields are optional so the shape is backwards
 * compatible with existing ready sources that rely on dynamic registration.
 */
export const McpOAuthClientConfig = Schema.Struct({
  client_id: Schema.optional(Schema.String),
  /** Some providers accept public clients (PKCE-only). Leave unset in that case. */
  client_secret: Schema.optional(Schema.String),
  /** Overrides the server-built callback URL. Used by providers that pin redirect_uri (PostHog). */
  redirect_uri: Schema.optional(Schema.String),
  /** Extra scope override if the user needs something beyond `scopes_supported`. */
  scope: Schema.optional(Schema.String),
})
export type McpOAuthClientConfig = typeof McpOAuthClientConfig.Type

export const MCPSourceConfig = Schema.Struct({
  kind: Schema.Literal("mcp"),
  endpoint: Schema.NonEmptyString,
  transport: Schema.Literals(["http", "sse", "auto"]),
  auth_mode: Schema.optional(Schema.Literals(["none", "bearer", "api_key", "oauth2"])),
  oauth_redirect_url: Schema.optional(Schema.String),
  oauth_scopes: Schema.optional(Schema.Array(Schema.String)),
  oauth_discovery: Schema.optional(McpOAuthDiscovery),
  oauth_client_config: Schema.optional(McpOAuthClientConfig),
  /**
   * Static HTTP headers injected on every MCP request to this source.
   * Values may contain template tokens that the invoker resolves at
   * call time:
   *   - `{{env:VAR_NAME}}` — substituted from the API Worker env
   *     (Wrangler secret). Used for platform-level auth keys like
   *     Composio's `x-api-key` that are Harbor-wide, not per-user.
   * See apps/api/src/plugins/invoker/mcp.ts for the resolver.
   */
  default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  /**
   * Composio auth-config id used by Connect to initiate the per-user
   * Composio OAuth flow. When set, `/plugins/sources/oauth/start` calls
   * Composio's `connected_accounts` endpoint instead of the generic
   * OAuth discovery flow. See docs/plans/google-workspace-composio-swap.md.
   */
  composio_auth_config_id: Schema.optional(Schema.NonEmptyString),
})
export type MCPSourceConfig = typeof MCPSourceConfig.Type

export const CustomMcpAddConfig = Schema.Struct({
  kind: Schema.Literal("mcp"),
  endpoint: Schema.NonEmptyString,
  transport: Schema.optional(Schema.Literals(["http", "sse", "auto"])),
})
export type CustomMcpAddConfig = typeof CustomMcpAddConfig.Type

// ── CLI Source Config ────────────────────────────────────────────────

export const CliLauncher = Schema.Literals(["binary", "npx", "uvx", "bunx"])
export type CliLauncher = typeof CliLauncher.Type

export const CliCwdPolicy = Schema.Literals(["workspace", "configured", "call"])
export type CliCwdPolicy = typeof CliCwdPolicy.Type

/**
 * CLI sources still use the `cli` source kind, but the execution lane behind
 * them is Harbor sand.
 */
export const CliSandResultDefaults = Schema.Struct({
  sand_stdin_mode: Schema.optional(SandStdinMode),
  sand_result_mode: SandResultMode,
  streaming: Schema.optional(Schema.Boolean),
  timeout_ms: Schema.optional(Schema.Number),
})
export type CliSandResultDefaults = typeof CliSandResultDefaults.Type

export const CliSourceConfig = Schema.Struct({
  kind: Schema.Literal("cli"),
  namespace: Schema.NonEmptyString,
  launcher: CliLauncher,
  command: Schema.NonEmptyString,
  args: Schema.optional(Schema.Array(Schema.String)),
  cwd_policy: CliCwdPolicy,
  cwd: Schema.optional(Schema.String),
  allowed_env_keys: Schema.optional(Schema.Array(Schema.NonEmptyString)),
  sand_sandbox_policy: Schema.optional(SandIsolationPolicy),
  sand_secret_bindings: Schema.optional(Schema.Array(SandSecretBinding)),
  sand_runtime: Schema.optional(SandRuntimeSpec),
  cli_result_defaults: Schema.optional(CliSandResultDefaults),
  sand_runtime_constraints: Schema.optional(SandRuntimeConstraints),
})
export type CliSourceConfig = typeof CliSourceConfig.Type

// ── API Source Config ────────────────────────────────────────────────

export const ApiAuthConfig = Schema.Struct({
  method: Schema.Literals(["none", "header", "bearer", "query", "basic"]),
  required: Schema.optional(Schema.Boolean),
  env: Schema.optional(SecretEnvKey),
  secret_name: Schema.optional(Schema.NonEmptyString),
  header_name: Schema.optional(Schema.String),
  query_param: Schema.optional(Schema.String),
  prefix: Schema.optional(Schema.String),
  username_env: Schema.optional(SecretEnvKey),
  username_secret_name: Schema.optional(Schema.NonEmptyString),
  password_env: Schema.optional(SecretEnvKey),
  password_secret_name: Schema.optional(Schema.NonEmptyString),
})
export type ApiAuthConfig = typeof ApiAuthConfig.Type

export const ApiSourceConfig = Schema.Struct({
  kind: Schema.Literal("api"),
  protocol: Schema.optional(Schema.Literals(["openapi", "graphql", "http"])),
  base_url: Schema.NonEmptyString,
  allowed_hosts: Schema.optional(Schema.Array(Schema.NonEmptyString)),
  spec_url: Schema.optional(Schema.String),
  graphql_endpoint: Schema.optional(Schema.String),
  graphql_schema_url: Schema.optional(Schema.String),
  default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  timeout_ms: Schema.optional(Schema.Number),
  auth: Schema.optional(ApiAuthConfig),
})
export type ApiSourceConfig = typeof ApiSourceConfig.Type

export const SourceConfig = Schema.Union([MCPSourceConfig, CliSourceConfig, ApiSourceConfig])
export type SourceConfig = typeof SourceConfig.Type

// ── Auth Config ──────────────────────────────────────────────────────

export const AuthTemplate = Schema.Union([
  Schema.Struct({ kind: Schema.Literal('header'), header_name: Schema.NonEmptyString, value_template: Schema.NonEmptyString, secret_slot: Schema.NonEmptyString }),
  Schema.Struct({ kind: Schema.Literal('query'), query_param: Schema.NonEmptyString, value_template: Schema.NonEmptyString, secret_slot: Schema.NonEmptyString }),
  Schema.Struct({ kind: Schema.Literal('basic'), username_slot: Schema.NonEmptyString, password_slot: Schema.NonEmptyString }),
  Schema.Struct({ kind: Schema.Literal('oauth_grant'), header_name: Schema.optional(Schema.String), value_template: Schema.optional(Schema.String) }),
  Schema.Struct({ kind: Schema.Literal('none') }),
])
export type AuthTemplate = typeof AuthTemplate.Type

export const AuthConfig = Schema.Struct({
  method: Schema.Literals(["header", "bearer", "query", "basic", "none"]),
  header_name: Schema.optional(Schema.String),
  query_param: Schema.optional(Schema.String),
  prefix: Schema.optional(Schema.String),
  credential_id: Schema.optional(Schema.String),
  credential_value: Schema.optional(Schema.String),
})
export type AuthConfig = typeof AuthConfig.Type

export * from './lifecycle'

export const PersistedAuthConfig = Schema.Struct({
  method: Schema.Literals(["header", "bearer", "query", "basic", "none"]),
  header_name: Schema.optional(Schema.String),
  query_param: Schema.optional(Schema.String),
  prefix: Schema.optional(Schema.String),
  credential_id: Schema.optional(Schema.String),
})
export type PersistedAuthConfig = typeof PersistedAuthConfig.Type

// ── Workspace-level OAuth client config ──────────────────────────────

/**
 * Workspace-scoped preconfigured OAuth client. A workspace admin registers
 * this ONCE per provider (identified by `registry_slug`) so every member in
 * the workspace inherits it. Replaces the per-install user-facing form for
 * providers that don't support RFC 7591 dynamic client registration.
 *
 * The secret is never returned over the wire — only `has_client_secret`
 * is exposed. See apps/api/src/routes/plugins/oauth.ts for the listing
 * endpoint that redacts secrets.
 */
export const WorkspaceOAuthClient = Schema.Struct({
  registry_slug: Schema.String,
  client_id: Schema.String,
  has_client_secret: Schema.Boolean,
  redirect_uri: Schema.optional(Schema.String),
  scope: Schema.optional(Schema.String),
  created_by: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type WorkspaceOAuthClient = typeof WorkspaceOAuthClient.Type

export const WorkspaceOAuthClientListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
})
export type WorkspaceOAuthClientListBody = typeof WorkspaceOAuthClientListBody.Type

export const WorkspaceOAuthClientListResult = Schema.Struct({
  data: Schema.Array(WorkspaceOAuthClient),
  total: Schema.Number,
})
export type WorkspaceOAuthClientListResult = typeof WorkspaceOAuthClientListResult.Type

export const WorkspaceOAuthClientSetBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  registry_slug: Schema.NonEmptyString,
  client_id: Schema.NonEmptyString,
  client_secret: Schema.optional(Schema.String),
  redirect_uri: Schema.optional(Schema.String),
  scope: Schema.optional(Schema.String),
})
export type WorkspaceOAuthClientSetBody = typeof WorkspaceOAuthClientSetBody.Type

export const WorkspaceOAuthClientSetResult = Schema.Struct({
  ok: Schema.Literal(true),
  seeded_sources: Schema.Number,
})
export type WorkspaceOAuthClientSetResult = typeof WorkspaceOAuthClientSetResult.Type

export const WorkspaceOAuthClientDeleteBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  registry_slug: Schema.NonEmptyString,
})
export type WorkspaceOAuthClientDeleteBody = typeof WorkspaceOAuthClientDeleteBody.Type

export const WorkspaceOAuthClientDeleteResult = Schema.Struct({
  ok: Schema.Literal(true),
})
export type WorkspaceOAuthClientDeleteResult = typeof WorkspaceOAuthClientDeleteResult.Type

// ── Source Status ────────────────────────────────────────────────────

export const SOURCE_STATUSES = [
  "pending", "discovering", "ready",
  "needs_credentials", "credentials_error",
  "mcp_disconnected", "spec_error", "refreshing",
  "requires_oauth", "reconnect_required",
  "no_tools", "verification_required", "verification_failed",
] as const
export const SourceStatus = Schema.Literals(SOURCE_STATUSES)
export type SourceStatus = typeof SourceStatus.Type

export const SourceVisibility = Schema.Literals([
  "personal",
  "workspace",
])
export type SourceVisibility = typeof SourceVisibility.Type

export const SourceVerificationStatus = Schema.Literals([
  "pending",
  "verified",
  "failed",
])
export type SourceVerificationStatus = typeof SourceVerificationStatus.Type

export const SourceVerificationSummary = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  agent_id: Schema.NonEmptyString,
  status: SourceVerificationStatus,
  verified: Schema.Boolean,
  checked_at: Schema.String,
  error: Schema.optional(Schema.String),
})
export type SourceVerificationSummary = typeof SourceVerificationSummary.Type

export const SourceVerification = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  agent_id: Schema.NonEmptyString,
  status: SourceVerificationStatus,
  verified: Schema.Boolean,
  error: Schema.optional(Schema.String),
  details: Schema.optional(Schema.Unknown),
  checked_at: Schema.String,
  created_by: Schema.optional(Schema.String),
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type SourceVerification = typeof SourceVerification.Type

export const PluginSourceCreator = Schema.Struct({
  id: Schema.String,
  name: Schema.optional(Schema.NullOr(Schema.String)),
  email: Schema.optional(Schema.NullOr(Schema.String)),
  avatar_url: Schema.optional(Schema.NullOr(Schema.String)),
})
export type PluginSourceCreator = typeof PluginSourceCreator.Type

// ── MCP Metadata ─────────────────────────────────────────────────────

export const McpServerInfo = Schema.Struct({
  name: Schema.String,
  version: Schema.optional(Schema.String),
})
export type McpServerInfo = typeof McpServerInfo.Type

export const McpIcon = Schema.Struct({
  src: Schema.String,
  mimeType: Schema.optional(Schema.String),
  sizes: Schema.optional(Schema.String),
})
export type McpIcon = typeof McpIcon.Type

export const McpAnnotations = Schema.Struct({
  title: Schema.optional(Schema.String),
  readOnlyHint: Schema.optional(Schema.Boolean),
  destructiveHint: Schema.optional(Schema.Boolean),
  idempotentHint: Schema.optional(Schema.Boolean),
  openWorldHint: Schema.optional(Schema.Boolean),
})
export type McpAnnotations = typeof McpAnnotations.Type

// ── Source Link ──────────────────────────────────────────────────────

export const SourceLink = Schema.Struct({
  label: Schema.String,
  url: Schema.String,
  kind: Schema.Literals(["docs", "dashboard", "api"]),
})
export type SourceLink = typeof SourceLink.Type

// ── Plugin Source ────────────────────────────────────────────────────

export const PluginSource = Schema.Struct({
  id: Schema.String,
  workspace_id: Schema.String,
  kind: SourceKind,
  namespace: Schema.String,
  display_name: Schema.String,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  config: Schema.Unknown,
  auth_config: Schema.Unknown,
  // Legacy display/effective status. New callers should prefer
  // effective_status and keep install_status for the persisted row state.
  status: SourceStatus,
  install_status: Schema.optional(SourceStatus),
  effective_status: Schema.optional(SourceStatus),
  runnable: Schema.optional(Schema.Boolean),
  redacted: Schema.optional(Schema.Boolean),
  non_runnable_reason: Schema.optional(Schema.String),
  tool_count: Schema.Number,
  last_synced_at: Schema.optional(Schema.NullOr(Schema.String)),
  error: Schema.optional(Schema.NullOr(Schema.String)),
  verified: Schema.optional(Schema.Boolean),
  last_verified_at: Schema.optional(Schema.NullOr(Schema.String)),
  last_verify_error: Schema.optional(Schema.NullOr(Schema.String)),
  latest_verification: Schema.optional(SourceVerificationSummary),
  sand_missing_required_secret_envs: Schema.optional(Schema.Array(Schema.String)),
  category: Schema.optional(Schema.NullOr(Schema.String)),
  links: Schema.optional(Schema.NullOr(Schema.Array(SourceLink))),
  icon_url: Schema.optional(Schema.NullOr(Schema.String)),
  shared_defs: Schema.optional(Schema.NullOr(Schema.Unknown)),
  registry_slug: Schema.optional(Schema.NullOr(Schema.String)),
  mcp_protocol_version: Schema.optional(Schema.NullOr(Schema.String)),
  mcp_server_info: Schema.optional(Schema.Unknown),
  mcp_capabilities: Schema.optional(Schema.Unknown),
  mcp_instructions: Schema.optional(Schema.NullOr(Schema.String)),
  mcp_prompt_count: Schema.optional(Schema.Number),
  mcp_resource_count: Schema.optional(Schema.Number),
  mcp_resource_template_count: Schema.optional(Schema.Number),
  generated_types: Schema.optional(Schema.NullOr(Schema.String)),
  created_by: Schema.optional(Schema.NullOr(Schema.String)),
  created_by_user: Schema.optional(Schema.NullOr(PluginSourceCreator)),
  source_visibility: Schema.optional(SourceVisibility),
  // Caller-specific rollup of the install status. When the source row is
  // `ready` on the install side but the caller is missing the
  // per-user grant that invocations need, the API downgrades this to
  // `requires_oauth` so the UI can render a Connect CTA instead of a
  // false-green Ready. Defaults to the row `status`
  // when no per-caller override applies.
  caller_status: Schema.optional(SourceStatus),
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type PluginSource = typeof PluginSource.Type

export function effectivePluginSourceStatus(
  source: Pick<PluginSource, "status" | "caller_status" | "effective_status">,
): SourceStatus {
  return source.effective_status ?? source.caller_status ?? source.status
}

export function isPluginSourceRunnable(
  source: Pick<PluginSource, "status" | "caller_status" | "effective_status" | "tool_count" | "runnable">,
): boolean {
  return source.runnable ?? (effectivePluginSourceStatus(source) === "ready" && source.tool_count > 0)
}

export function displayPluginSourceStatus(
  source: Pick<PluginSource, "status" | "caller_status" | "effective_status" | "tool_count">,
): SourceStatus {
  const status = effectivePluginSourceStatus(source)
  return status === "ready" && source.tool_count <= 0 ? "no_tools" : status
}

export type PluginSourceDisplayStatus = SourceStatus | "awaiting_oauth"

export const AWAITING_OAUTH_SOURCE_STATUSES = new Set<SourceStatus>([
  "requires_oauth",
  "reconnect_required",
])

export function isPluginSourceAwaitingOauth(
  source: Pick<PluginSource, "status" | "caller_status" | "effective_status">,
): boolean {
  const callerStatus = source.caller_status
  if (callerStatus && AWAITING_OAUTH_SOURCE_STATUSES.has(callerStatus)) return true
  return AWAITING_OAUTH_SOURCE_STATUSES.has(effectivePluginSourceStatus(source))
}

export interface PluginSourceDomainView {
  readonly status: PluginSourceDisplayStatus
  readonly effective_status: PluginSourceDisplayStatus
  readonly caller_runnable: boolean
  readonly runnable: boolean
  readonly tool_count: number
}

export function pluginSourceDomainView(
  source: Pick<PluginSource, "status" | "caller_status" | "effective_status" | "tool_count" | "runnable">,
): PluginSourceDomainView {
  const awaitingOauth = isPluginSourceAwaitingOauth(source)
  const runnable = !awaitingOauth && isPluginSourceRunnable(source)
  const status = awaitingOauth ? "awaiting_oauth" : displayPluginSourceStatus(source)
  return {
    status,
    effective_status: status,
    caller_runnable: runnable,
    runnable,
    tool_count: runnable ? source.tool_count : 0,
  }
}

export type PluginSourceDomainAction =
  | { readonly kind: "connect"; readonly namespace: string }
  | { readonly kind: "list_tools"; readonly namespace: string }

export function pluginSourceNextAction(source: PluginSource): PluginSourceDomainAction {
  return isPluginSourceAwaitingOauth(source)
    ? { kind: "connect", namespace: source.namespace }
    : { kind: "list_tools", namespace: source.namespace }
}

export function registryAgentSkillSlug(entry: unknown, fallbackSlug?: string | null): string | null {
  if (typeof entry !== "object" || entry === null) return null
  const record = entry as Record<string, unknown>
  const skill = typeof record["skill"] === "object" && record["skill"] !== null
    ? record["skill"] as Record<string, unknown>
    : null
  if (!skill) return null
  const slug = skill["slug"] ?? skill["skill_slug"] ?? skill["id"] ?? fallbackSlug
  return typeof slug === "string" && slug.length > 0 ? slug : null
}

export interface PluginSourceToolCallabilityInput {
  readonly namespace: string
  readonly kind?: string | undefined
  readonly status?: string | undefined
  readonly caller_status?: string | undefined
  readonly effective_status?: string | undefined
  readonly tool_count?: number | undefined
  readonly runnable?: boolean | undefined
}

export function isPluginSourceToolCallable(source: PluginSourceToolCallabilityInput): boolean {
  const status = source.effective_status ?? source.caller_status ?? source.status
  if (status === "requires_oauth" || status === "reconnect_required") return false
  if (source.runnable === false) return false
  return status === "ready" && Number(source.tool_count ?? 0) > 0
}

export function pluginToolNamespaceSummary(source: PluginSourceToolCallabilityInput) {
  const view = "status" in source && "tool_count" in source && source.status
    ? pluginSourceDomainView({
        status: source.status as SourceStatus,
        caller_status: source.caller_status as SourceStatus | undefined,
        effective_status: source.effective_status as SourceStatus | undefined,
        tool_count: Number(source.tool_count ?? 0),
        runnable: source.runnable,
      })
    : null
  return {
    namespace: source.namespace,
    mode: source.kind ?? "api",
    status: view?.status ?? (source.effective_status ?? source.caller_status ?? source.status ?? "unknown"),
    tool_count: view?.tool_count ?? Number(source.tool_count ?? 0),
  }
}

type PluginSourceHealthInput = Pick<
  PluginSource,
  "status" | "caller_status" | "effective_status" | "tool_count" | "runnable"
>

export interface PluginSourceGroupHealth {
  readonly activeCount: number
  readonly worstStatus: SourceStatus | null
}

const SOURCE_DISPLAY_STATUS_PRIORITY: Record<SourceStatus, number> = {
  mcp_disconnected: 4,
  credentials_error: 4,
  spec_error: 4,
  verification_failed: 4,
  needs_credentials: 3,
  requires_oauth: 3,
  reconnect_required: 3,
  verification_required: 3,
  refreshing: 2,
  no_tools: 2,
  discovering: 1,
  pending: 1,
  ready: 0,
}

export function summarizePluginSourceGroupHealth(
  sources: readonly PluginSourceHealthInput[],
): PluginSourceGroupHealth {
  let activeCount = 0
  let worstStatus: SourceStatus | null = null
  for (const source of sources) {
    const status = displayPluginSourceStatus(source)
    if (isPluginSourceRunnable(source)) activeCount += 1
    const rank = SOURCE_DISPLAY_STATUS_PRIORITY[status] ?? 0
    const worstRank = worstStatus ? SOURCE_DISPLAY_STATUS_PRIORITY[worstStatus] ?? 0 : -1
    if (rank > worstRank) worstStatus = status
  }
  return { activeCount, worstStatus }
}

type PluginSourceSelectionInput = Pick<
  PluginSource,
  "id" | "status" | "caller_status" | "effective_status" | "tool_count" | "runnable" | "last_synced_at" | "updated_at" | "created_at"
>

function pluginSourceTimestampValue(value: string | null | undefined): number {
  if (!value) return 0
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function pluginSourceSelectionRank(source: PluginSourceSelectionInput): number {
  const effectiveStatus = effectivePluginSourceStatus(source)
  if (isPluginSourceRunnable(source)) return 700
  if (source.status === "ready" && source.tool_count > 0) return 600
  if (source.tool_count > 0) return 500
  if (effectiveStatus === "ready") return 400
  if (effectiveStatus === "refreshing") return 350
  if (effectiveStatus === "discovering" || effectiveStatus === "pending") return 300
  if (
    effectiveStatus === "requires_oauth" ||
    effectiveStatus === "reconnect_required" ||
    effectiveStatus === "needs_credentials"
  ) return 200
  if (effectiveStatus === "no_tools") return 100
  return 0
}

export function comparePluginSourcesForDisplay(
  a: PluginSourceSelectionInput,
  b: PluginSourceSelectionInput,
): number {
  const rankDelta = pluginSourceSelectionRank(b) - pluginSourceSelectionRank(a)
  if (rankDelta !== 0) return rankDelta

  const toolDelta = b.tool_count - a.tool_count
  if (toolDelta !== 0) return toolDelta

  const aTime =
    pluginSourceTimestampValue(a.last_synced_at) ||
    pluginSourceTimestampValue(a.updated_at) ||
    pluginSourceTimestampValue(a.created_at)
  const bTime =
    pluginSourceTimestampValue(b.last_synced_at) ||
    pluginSourceTimestampValue(b.updated_at) ||
    pluginSourceTimestampValue(b.created_at)
  const timeDelta = bTime - aTime
  if (timeDelta !== 0) return timeDelta

  return a.id.localeCompare(b.id)
}

export function selectRepresentativePluginSource<T extends PluginSourceSelectionInput>(
  sources: readonly T[],
): T | null {
  if (sources.length === 0) return null
  return [...sources].sort(comparePluginSourcesForDisplay)[0] ?? null
}

// ── Tool Binding ─────────────────────────────────────────────────────

export const MCPToolBinding = Schema.Struct({
  kind: Schema.Literal("mcp"),
  tool_name: Schema.String,
  cached_input_schema: Schema.optional(Schema.Unknown),
  cached_output_schema: Schema.optional(Schema.Unknown),
})
export type MCPToolBinding = typeof MCPToolBinding.Type

export const MCPPromptBinding = Schema.Struct({
  kind: Schema.Literal('mcp_prompt'),
  prompt_name: Schema.String,
})
export type MCPPromptBinding = typeof MCPPromptBinding.Type

export const MCPResourceReadBinding = Schema.Struct({
  kind: Schema.Literal('mcp_resource_read'),
  uri: Schema.String,
})
export type MCPResourceReadBinding = typeof MCPResourceReadBinding.Type

export const MCPResourceTemplateBinding = Schema.Struct({
  kind: Schema.Literal('mcp_resource_template'),
  uri_template: Schema.String,
})
export type MCPResourceTemplateBinding = typeof MCPResourceTemplateBinding.Type

export const ApiRequestBinding = Schema.Struct({
  kind: Schema.Literal("api_request"),
  method: Schema.Literals(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]),
  path: Schema.NonEmptyString,
  headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  query: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  body_template: Schema.optional(Schema.Unknown),
  timeout_ms: Schema.optional(Schema.Number),
  auth: Schema.optional(ApiAuthConfig),
})
export type ApiRequestBinding = typeof ApiRequestBinding.Type

export const ApiGraphqlBinding = Schema.Struct({
  kind: Schema.Literal("api_graphql"),
  path: Schema.optional(Schema.NonEmptyString),
  document: Schema.NonEmptyString,
  operation_name: Schema.optional(Schema.NonEmptyString),
  headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  variables_template: Schema.optional(Schema.Unknown),
  timeout_ms: Schema.optional(Schema.Number),
  auth: Schema.optional(ApiAuthConfig),
})
export type ApiGraphqlBinding = typeof ApiGraphqlBinding.Type

export const CliArgTemplateLiteral = Schema.Struct({
  kind: Schema.Literal("literal"),
  value: Schema.String,
})
export type CliArgTemplateLiteral = typeof CliArgTemplateLiteral.Type

export const CliArgTemplateInput = Schema.Struct({
  kind: Schema.Literal("input"),
  path: Schema.NonEmptyString,
})
export type CliArgTemplateInput = typeof CliArgTemplateInput.Type

export const CliArgTemplateOption = Schema.Struct({
  kind: Schema.Literal("option"),
  flag: Schema.NonEmptyString,
  path: Schema.NonEmptyString,
  omit_if_empty: Schema.optional(Schema.Boolean),
})
export type CliArgTemplateOption = typeof CliArgTemplateOption.Type

export const CliArgTemplateFlag = Schema.Struct({
  kind: Schema.Literal("flag"),
  flag: Schema.NonEmptyString,
  path: Schema.NonEmptyString,
})
export type CliArgTemplateFlag = typeof CliArgTemplateFlag.Type

export const CliArgTemplatePart = Schema.Union([
  CliArgTemplateLiteral,
  CliArgTemplateInput,
  CliArgTemplateOption,
  CliArgTemplateFlag,
])
export type CliArgTemplatePart = typeof CliArgTemplatePart.Type

export const CliCommandBinding = Schema.Struct({
  kind: Schema.Literal("cli_command"),
  tool_name: Schema.String,
  argv_template: Schema.Array(CliArgTemplatePart),
  sand_stdin_mode: SandStdinMode,
  sand_result_mode: SandResultMode,
  timeout_ms: Schema.optional(Schema.Number),
  streaming: Schema.optional(Schema.Boolean),
})
export type CliCommandBinding = typeof CliCommandBinding.Type

export const ToolBinding = Schema.Union([
  MCPToolBinding,
  MCPPromptBinding,
  MCPResourceReadBinding,
  MCPResourceTemplateBinding,
  ApiRequestBinding,
  ApiGraphqlBinding,
  CliCommandBinding,
])
export type ToolBinding = typeof ToolBinding.Type

export const ToolBindingJson = Schema.fromJsonString(ToolBinding)
export type ToolBindingJson = typeof ToolBindingJson.Type

export const SourceConfigJson = Schema.fromJsonString(SourceConfig)
export type SourceConfigJson = typeof SourceConfigJson.Type

export const PersistedAuthConfigJson = Schema.fromJsonString(PersistedAuthConfig)
export type PersistedAuthConfigJson = typeof PersistedAuthConfigJson.Type

// ── Plugin Tool ──────────────────────────────────────────────────────

export const PluginTool = Schema.Struct({
  id: Schema.String,
  workspace_id: Schema.String,
  source_id: Schema.String,
  // Runtime tools are provider-owned identifiers. MCP servers commonly
  // expose names like `notion-create-comment`, and Harbor persists globally
  // qualified ids like `notion-mcp.notion-create-comment`. Keep registry
  // authoring schemas strict, but do not reject valid live provider tools
  // when encoding list/detail responses.
  tool_id: ExternalToolIdentifier,
  name: ExternalToolIdentifier,
  display_name: Schema.NonEmptyString,
  description: Schema.optional(Schema.NullOr(Schema.String)),
  title: Schema.optional(Schema.NullOr(Schema.String)),
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  input_type: Schema.optional(Schema.String),
  output_type: Schema.optional(Schema.String),
  type_definitions: Schema.optional(Schema.String),
  annotations: Schema.optional(Schema.Unknown),
  icons: Schema.optional(Schema.Unknown),
  binding: Schema.Unknown,
  tags: Schema.optional(Schema.NullOr(Schema.Array(Schema.NonEmptyString))),
  types: Schema.optional(Schema.String),
  created_at: Schema.String,
  // Canonical surface emitted by `/plugins/tools/list` so consumers
  // (Coast, Lighthouse, web) can render call shapes without a
  // separate /plugins/tools/describe round-trip. All three are
  // optional on the wire so older clients (and rows that haven't
  // been re-projected through @hrbr/plugin-identifiers) decode
  // unchanged.
  namespace: Schema.optional(Schema.String),
  js_var: Schema.optional(Schema.String),
  signature: Schema.optional(Schema.String),
})
export type PluginTool = typeof PluginTool.Type

// ── Resolved Auth ────────────────────────────────────────────────────

export const ResolvedAuth = Schema.Struct({
  method: Schema.Literals(["header", "bearer", "query", "none"]),
  header_name: Schema.optional(Schema.String),
  query_param: Schema.optional(Schema.String),
  prefix: Schema.optional(Schema.String),
  value: Schema.optional(Schema.String),
})
export type ResolvedAuth = typeof ResolvedAuth.Type

// ── Credential ───────────────────────────────────────────────────────

export const CredentialKind = Schema.Literals(["api_key", "bearer_token", "oauth2_token", "custom"])
export type CredentialKind = typeof CredentialKind.Type

export const PluginCredential = Schema.Struct({
  id: Schema.String,
  workspace_id: Schema.String,
  source_id: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.String,
  display_name: Schema.String,
  kind: CredentialKind,
  status: Schema.Literals(["active", "expired", "revoked", "error"]),
  last_used_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_by: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type PluginCredential = typeof PluginCredential.Type

// ── Invoke ───────────────────────────────────────────────────────────

export const InvokeResultContent = Schema.Struct({
  type: Schema.Literals(["text", "image", "binary"]),
  mime_type: Schema.optional(Schema.String),
  data: Schema.String,
})
export type InvokeResultContent = typeof InvokeResultContent.Type

export const InvokeResult = Schema.Struct({
  result: Schema.Unknown,
  upstream_status: Schema.optional(Schema.Number),
  content_type: Schema.String,
  content: Schema.optional(Schema.Array(InvokeResultContent)),
  duration_ms: Schema.Number,
  invocation_id: Schema.String,
  run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
})
export type InvokeResult = typeof InvokeResult.Type

export const ExecuteArtifact = Schema.Struct({
  key: Schema.String,
  url: Schema.String,
  content_type: Schema.String,
  size: Schema.Number,
})
export type ExecuteArtifact = typeof ExecuteArtifact.Type

export const ExecuteResult = Schema.Struct({
  result: Schema.Unknown,
  error: Schema.optional(Schema.String),
  logs: Schema.optional(Schema.Unknown),
  // "dynamic_worker" = synchronous mode=exec through the Dynamic Worker
  // execution engine. "workflow" = durable mode=workflow execution.
  mode: Schema.Union([Schema.Literal("dynamic_worker"), Schema.Literal("workflow")]),
  artifacts: Schema.optional(Schema.Array(ExecuteArtifact)),
  // Advisory notes captured during the run from upstream MCP responses
  // (e.g. "state value not recognized; returning all"). Each entry is
  // tagged with the originating namespace + tool so the LLM can decide
  // whether to retry with adjusted args. Absent when no warnings fired.
  warnings: Schema.optional(
    Schema.Array(
      Schema.Struct({
        namespace: Schema.String,
        tool: Schema.String,
        message: Schema.String,
      })
    )
  ),
  run_id: Schema.String.check(Schema.isUUID()),
  workflow_instance_id: Schema.optional(Schema.String),
})
export type ExecuteResult = typeof ExecuteResult.Type

// ── Search ───────────────────────────────────────────────────────────

export const ToolSearchKind = Schema.Literals(["mcp", "cli_command", "api_request", "api_graphql"])
export type ToolSearchKind = typeof ToolSearchKind.Type

export const ToolSearchResult = Schema.Struct({
  tool_id: Schema.String,
  display_name: Schema.String,
  description: Schema.optional(Schema.String),
  source_namespace: Schema.String,
  source_display_name: Schema.String,
  score: Schema.Number,
  // Optional on the wire — older API builds don't emit these.
  // Lets `/plugins/meta/search` consumers skip a /describe call
  // when they only need the canonical signature + JS namespace alias.
  js_var: Schema.optional(Schema.String),
  signature: Schema.optional(Schema.String),
})
export type ToolSearchResult = typeof ToolSearchResult.Type

export const ToolSignatureHit = Schema.Struct({
  tool_id: Schema.String,
  name: Schema.String,
  namespace: Schema.String,
  js_var: Schema.String,
  display_name: Schema.String,
  description: Schema.optional(Schema.String),
  signature: Schema.String,
  score: Schema.Number,
  kind: ToolSearchKind,
})
export type ToolSignatureHit = typeof ToolSignatureHit.Type

export const ToolsSearchResponse = Schema.Struct({
  hits: Schema.Array(ToolSignatureHit),
})
export type ToolsSearchResponse = typeof ToolsSearchResponse.Type

export const ToolDescribeResponse = Schema.Struct({
  tool_id: Schema.String,
  name: Schema.String,
  namespace: Schema.String,
  js_var: Schema.String,
  display_name: Schema.String,
  description: Schema.optional(Schema.String),
  signature: Schema.String,
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  input_type: Schema.optional(Schema.String),
  output_type: Schema.optional(Schema.String),
  type_definitions: Schema.optional(Schema.String),
  call_example: Schema.String,
  kind: ToolSearchKind,
})
export type ToolDescribeResponse = typeof ToolDescribeResponse.Type

export const ToolSchemaResponse = Schema.Struct({
  tool_id: Schema.String,
  name: Schema.optional(Schema.String),
  display_name: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  title: Schema.optional(Schema.NullOr(Schema.String)),
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  input_type: Schema.optional(Schema.String),
  output_type: Schema.optional(Schema.String),
  type_definitions: Schema.optional(Schema.String),
  shared_defs: Schema.optional(Schema.Unknown),
  namespace: Schema.optional(Schema.String),
  source_display_name: Schema.optional(Schema.NullOr(Schema.String)),
})
export type ToolSchemaResponse = typeof ToolSchemaResponse.Type

export const ToolSchemasResponse = Schema.Struct({
  data: Schema.Array(ToolSchemaResponse),
})
export type ToolSchemasResponse = typeof ToolSchemasResponse.Type

export const ToolsListResult = Schema.Struct({
  data: Schema.Array(PluginTool),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type ToolsListResult = typeof ToolsListResult.Type

export const ToolsReindexResult = Schema.Struct({
  queued: Schema.Number,
  sources: Schema.Array(Schema.Struct({
    source_id: Schema.String.check(Schema.isUUID()),
    namespace: Schema.String,
  })),
})
export type ToolsReindexResult = typeof ToolsReindexResult.Type

export const AddToolResult = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  tool_id: RegistryToolIdentifier,
})
export type AddToolResult = typeof AddToolResult.Type

export const SourceSummary = Schema.Struct({
  namespace: Schema.String,
  display_name: Schema.String,
  kind: SourceKind,
  tool_count: Schema.Number,
  status: SourceStatus,
  category: Schema.optional(Schema.String),
})
export type SourceSummary = typeof SourceSummary.Type

export const OAuthCallbackUrlResult = Schema.Struct({
  callback_url: Schema.String,
})
export type OAuthCallbackUrlResult = typeof OAuthCallbackUrlResult.Type

// ── Request body schemas (from api-types/plugins) ────────────────────

export const SourceIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
})
export type SourceIdBody = typeof SourceIdBody.Type

export const OAuthReconnectBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  grant_id: Schema.optional(Schema.String.check(Schema.isUUID())),
})
export type OAuthReconnectBody = typeof OAuthReconnectBody.Type

export const OAuthDisconnectResult = Schema.Struct({
  ok: Schema.Literal(true),
})
export type OAuthDisconnectResult = typeof OAuthDisconnectResult.Type

export const OAuthConfigureBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  client_id: Schema.optional(Schema.String),
  client_secret: Schema.optional(Schema.String),
  redirect_uri: Schema.optional(Schema.String),
  scope: Schema.optional(Schema.String),
})
export type OAuthConfigureBody = typeof OAuthConfigureBody.Type

export const OAuthConfigureResult = Schema.Struct({
  ok: Schema.Literal(true),
})
export type OAuthConfigureResult = typeof OAuthConfigureResult.Type

export const OAuthSetupHintsBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  registry_slug: Schema.optional(RegistrySlug),
})
export type OAuthSetupHintsBody = typeof OAuthSetupHintsBody.Type

export const OAuthSetupHintsRegisterUrlSource = Schema.Literals([
  "service_documentation",
  "resource_documentation",
  "authorization_server_origin",
  "none",
])
export type OAuthSetupHintsRegisterUrlSource = typeof OAuthSetupHintsRegisterUrlSource.Type

export const OAuthSetupHints = Schema.Struct({
  display_name: Schema.String,
  redirect_uri: Schema.String,
  register_url: Schema.NullOr(Schema.String),
  register_url_source: OAuthSetupHintsRegisterUrlSource,
  scopes_supported: Schema.Array(Schema.String),
  requires_client_secret: Schema.Boolean,
  has_dynamic_registration: Schema.Boolean,
  workspace_client_already_configured: Schema.Boolean,
  has_global_client: Schema.Boolean,
  authorization_server_host: Schema.NullOr(Schema.String),
})
export type OAuthSetupHints = typeof OAuthSetupHints.Type

export const OAuthStartResult = Schema.Struct({
  authorization_url: Schema.String,
  state: Schema.optional(Schema.String),
})
export type OAuthStartResult = typeof OAuthStartResult.Type

export const OAuthFlowStatusBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  state: Schema.NonEmptyString,
})
export type OAuthFlowStatusBody = typeof OAuthFlowStatusBody.Type

export const OAuthFlowStatusResult = Schema.Struct({
  state: Schema.String,
  source_id: Schema.String.check(Schema.isUUID()),
  purpose: Schema.Literals(["connect", "reconnect"]),
  grant_id: Schema.NullOr(Schema.String.check(Schema.isUUID())),
  status: Schema.Literals(["pending", "consumed", "expired", "superseded", "failed"]),
  error: Schema.NullOr(Schema.String),
  expires_at: Schema.String,
  created_at: Schema.String,
  updated_at: Schema.String,
  source_status: Schema.optional(Schema.NullOr(SourceStatus)),
  source_tool_count: Schema.optional(Schema.NullOr(Schema.Number)),
  source_error: Schema.optional(Schema.NullOr(Schema.String)),
})
export type OAuthFlowStatusResult = typeof OAuthFlowStatusResult.Type

export const SourceListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  registry_slug: Schema.optional(RegistrySlug),
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
  machine_id: Schema.optional(Schema.NonEmptyString),
  agent_id: Schema.optional(Schema.NonEmptyString),
})
export type SourceListBody = typeof SourceListBody.Type

export const SourceListResult = Schema.Struct({
  data: Schema.Array(PluginSource),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceListResult = typeof SourceListResult.Type

export const SourceAuthTestBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.NonEmptyString,
  override_secrets: Schema.optional(Schema.Record(Schema.String, Schema.String)),
})
export type SourceAuthTestBody = typeof SourceAuthTestBody.Type

export const SourceAuthTestRedactedRequest = Schema.Struct({
  method: Schema.NonEmptyString,
  url: Schema.NonEmptyString,
  headers: Schema.Record(Schema.String, Schema.String),
  body_preview: Schema.optional(Schema.String),
})
export type SourceAuthTestRedactedRequest = typeof SourceAuthTestRedactedRequest.Type

export const SourceAuthTestResult = Schema.Struct({
  ok: Schema.Boolean,
  http_status: Schema.NullOr(Schema.Number),
  latency_ms: Schema.Number,
  redacted_request: SourceAuthTestRedactedRequest,
  upstream_body_preview: Schema.String,
  provider_diagnosis: Schema.NonEmptyString,
  suggested_fix: Schema.optional(Schema.String),
})
export type SourceAuthTestResult = typeof SourceAuthTestResult.Type

export const SourceAbandonResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  abandoned: Schema.Literal(true),
})
export type SourceAbandonResult = typeof SourceAbandonResult.Type

export const SourceCleanupStaleResult = Schema.Struct({
  ok: Schema.Literal(true),
  ttl_minutes: Schema.Number,
})
export type SourceCleanupStaleResult = typeof SourceCleanupStaleResult.Type

export const SourceVisibilitySetBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  source_visibility: SourceVisibility,
})
export type SourceVisibilitySetBody = typeof SourceVisibilitySetBody.Type

export const McpProbeBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  endpoint: Schema.NonEmptyString,
})
export type McpProbeBody = typeof McpProbeBody.Type

// /plugins/sources/refresh accepts exactly one of source_id or namespace.
// The route enforces the XOR after schema decode so API callers get a
// structured validation error instead of a generic schema failure.
export const RefreshSourceBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  namespace: Schema.optional(Schema.NonEmptyString),
})
export type RefreshSourceBody = typeof RefreshSourceBody.Type

export const RefreshSourceResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  tool_count: Schema.Number,
  status: SourceStatus,
  source: PluginSource,
})
export type RefreshSourceResult = typeof RefreshSourceResult.Type

export const RegistryListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  slug: Schema.optional(RegistrySlug),
})
export type RegistryListBody = typeof RegistryListBody.Type

export const ToolIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  tool_id: Schema.String,
})
export type ToolIdBody = typeof ToolIdBody.Type

export const AddSourceBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  kind: SourceKind,
  namespace: Schema.NonEmptyString,
  display_name: Schema.NonEmptyString,
  config: Schema.Unknown,
  auth_config: Schema.optional(Schema.Unknown),
  description: Schema.optional(Schema.String),
  category: Schema.optional(Schema.String),
  icon_url: Schema.optional(Schema.String),
  links: Schema.optional(Schema.Array(SourceLink)),
  source_visibility: Schema.optional(SourceVisibility),
})
export type AddSourceBody = typeof AddSourceBody.Type

export const AddSourceResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  tool_count: Schema.Number,
  status: SourceStatus,
  source: PluginSource,
})
export type AddSourceResult = typeof AddSourceResult.Type

export const RemoveSourceResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  removed: Schema.Literal(true),
})
export type RemoveSourceResult = typeof RemoveSourceResult.Type

export const SourceVerificationSetBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.NonEmptyString,
  agent_id: Schema.NonEmptyString,
  status: SourceVerificationStatus,
  error: Schema.optional(Schema.String),
  details: Schema.optional(Schema.Unknown),
  checked_at: Schema.optional(Schema.String),
})
export type SourceVerificationSetBody = typeof SourceVerificationSetBody.Type

export const SourceVerificationGetBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  machine_id: Schema.optional(Schema.NonEmptyString),
  agent_id: Schema.optional(Schema.NonEmptyString),
})
export type SourceVerificationGetBody = typeof SourceVerificationGetBody.Type

export const SourceVerificationGetResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  verification: Schema.NullOr(SourceVerification),
})
export type SourceVerificationGetResult = typeof SourceVerificationGetResult.Type

export const SourceVerificationSetResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  verification: SourceVerification,
})
export type SourceVerificationSetResult = typeof SourceVerificationSetResult.Type

export const SourceVerificationProbeBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
})
export type SourceVerificationProbeBody = typeof SourceVerificationProbeBody.Type

export const SourceVerificationProbeResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  status: SourceVerificationStatus,
  verified: Schema.Boolean,
  checked_at: Schema.String,
  error: Schema.optional(Schema.String),
  details: Schema.optional(Schema.Unknown),
})
export type SourceVerificationProbeResult = typeof SourceVerificationProbeResult.Type

export const RegistryInstallBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  slug: RegistrySlug,
  namespace: Schema.optional(RegistryNamespace),
  source_visibility: Schema.optional(SourceVisibility),
  secrets_by_env: Schema.optional(Schema.Record(SecretEnvKey, Schema.NonEmptyString)),
  /** @deprecated Use secrets_by_env with env-keyed values. */
  credential_value: Schema.optional(Schema.NonEmptyString),
})
export type RegistryInstallBody = typeof RegistryInstallBody.Type

export const SubmitSourceRequestBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  name: Schema.String.check(Schema.isTrimmed(), Schema.isMinLength(1), Schema.isMaxLength(120)),
  description: Schema.optional(
    Schema.String.check(Schema.isTrimmed(), Schema.isMaxLength(2000))
  ),
  docs_url: Schema.optional(
    Schema.String.check(
      Schema.isTrimmed(),
      Schema.isPattern(/^https?:\/\/[^\s]+$/)
    )
  ),
})
export type SubmitSourceRequestBody = typeof SubmitSourceRequestBody.Type

export const SubmitSourceRequestResult = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  created_at: Schema.Number,
})
export type SubmitSourceRequestResult = typeof SubmitSourceRequestResult.Type

export const PluginInstallJobStatus = Schema.Literals(["pending", "running", "succeeded", "failed", "cancelled"])
export type PluginInstallJobStatus = typeof PluginInstallJobStatus.Type

export const PluginInstallJob = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  slug: RegistrySlug,
  namespace: RegistryNamespace,
  status: PluginInstallJobStatus,
  error: Schema.optional(Schema.NullOr(Schema.String)),
  attempts: Schema.Number,
  payload_json: Schema.optional(Schema.NullOr(Schema.String)),
  created_by: Schema.optional(Schema.NullOr(Schema.String)),
  source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
  source_status: Schema.optional(Schema.NullOr(SourceStatus)),
  source_tool_count: Schema.optional(Schema.NullOr(Schema.Number)),
  source_error: Schema.optional(Schema.NullOr(Schema.String)),
  started_at: Schema.optional(Schema.NullOr(Schema.String)),
  finished_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type PluginInstallJob = typeof PluginInstallJob.Type

export const PluginInstallJobListResult = Schema.Struct({
  data: Schema.Array(PluginInstallJob),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type PluginInstallJobListResult = typeof PluginInstallJobListResult.Type

export const PluginInstallJobGetBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  job_id: Schema.String.check(Schema.isUUID()),
})
export type PluginInstallJobGetBody = typeof PluginInstallJobGetBody.Type

export const PluginInstallJobListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  slug: Schema.optional(RegistrySlug),
  status: Schema.optional(PluginInstallJobStatus),
  active: Schema.optional(Schema.Boolean),
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
})
export type PluginInstallJobListBody = typeof PluginInstallJobListBody.Type

export const RegistryInstallJobResult = Schema.Struct({
  job_id: Schema.String.check(Schema.isUUID()),
  status: PluginInstallJobStatus,
})
export type RegistryInstallJobResult = typeof RegistryInstallJobResult.Type

export const RegistryInstallSourceResult = Schema.Struct({
  source_id: Schema.String.check(Schema.isUUID()),
  tool_count: Schema.Number,
  status: SourceStatus,
})
export type RegistryInstallSourceResult = typeof RegistryInstallSourceResult.Type

export const RegistryInstallResult = Schema.Union([
  RegistryInstallJobResult,
  RegistryInstallSourceResult,
])
export type RegistryInstallResult = typeof RegistryInstallResult.Type

export const ToolsListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  namespace: Schema.optional(Schema.String),
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
})
export type ToolsListBody = typeof ToolsListBody.Type

export const ToolIdsBody = Schema.Struct({
  tool_ids: Schema.Array(Schema.NonEmptyString),
})
export type ToolIdsBody = typeof ToolIdsBody.Type

export const ToolsReindexBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  namespace: Schema.optional(Schema.String),
  all: Schema.optional(Schema.Boolean),
})
export type ToolsReindexBody = typeof ToolsReindexBody.Type

/**
 * Tool search execution mode.
 *
 * - `auto` (default): vector-first with a lexical D1 fallback when Vectorize
 *   is unavailable, errors, or returns no hits. Matches the legacy behaviour
 *   so existing clients keep working.
 * - `vector`: only run the Vectorize-backed semantic search. If the
 *   workspace has no enabled scopes, no Vectorize binding, or the embedding
 *   path errors, the response surfaces an empty result rather than silently
 *   degrading to lexical scoring.
 * - `lexical`: skip Vectorize entirely and only run the D1 lexical scorer.
 *   Useful for diagnosing search quality without depending on the vector
 *   index.
 */
export const ToolSearchMode = Schema.Literals(["auto", "vector", "lexical"])
export type ToolSearchMode = typeof ToolSearchMode.Type

export const ToolsSearchBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  query: Schema.NonEmptyString,
  limit: Schema.optional(Schema.Number),
  source: Schema.optional(Schema.String),
  kind: Schema.optional(Schema.Array(ToolSearchKind)),
  verbose: Schema.optional(Schema.Boolean),
  mode: Schema.optional(ToolSearchMode),
})
export type ToolsSearchBody = typeof ToolsSearchBody.Type

export const ToolDescribeBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  tool_id: Schema.String,
})
export type ToolDescribeBody = typeof ToolDescribeBody.Type

export const AddToolBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  tool_id: ExternalToolIdentifier,
  name: ExternalToolIdentifier,
  display_name: Schema.NonEmptyString,
  description: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  annotations: Schema.optional(Schema.Unknown),
  icons: Schema.optional(Schema.Unknown),
  binding: Schema.Unknown,
  tags: Schema.optional(Schema.Array(Schema.NonEmptyString)),
})
export type AddToolBody = typeof AddToolBody.Type

export const CredentialCreateBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  name: Schema.NonEmptyString,
  display_name: Schema.NonEmptyString,
  value: Schema.NonEmptyString,
  kind: Schema.optional(CredentialKind),
})
export type CredentialCreateBody = typeof CredentialCreateBody.Type

export const CredentialUpsertBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  name: Schema.NonEmptyString,
  display_name: Schema.optional(Schema.String),
  value: Schema.NonEmptyString,
  kind: Schema.optional(CredentialKind),
})
export type CredentialUpsertBody = typeof CredentialUpsertBody.Type

export const CredentialCreateResult = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  name: Schema.String,
})
export type CredentialCreateResult = typeof CredentialCreateResult.Type

export const CredentialUpsertResult = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.String.check(Schema.isUUID()),
  name: Schema.String,
  created: Schema.Boolean,
})
export type CredentialUpsertResult = typeof CredentialUpsertResult.Type

export const CredentialsListBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  limit: Schema.optional(Schema.Number),
  offset: Schema.optional(Schema.Number),
  cursor: Schema.optional(Schema.String),
  include_total: Schema.optional(Schema.Boolean),
})
export type CredentialsListBody = typeof CredentialsListBody.Type

export const CredentialListItem = Schema.Struct({
  id: Schema.String.check(Schema.isUUID()),
  workspace_id: Schema.String.check(Schema.isUUID()),
  source_id: Schema.optional(Schema.NullOr(Schema.String.check(Schema.isUUID()))),
  name: Schema.String,
  display_name: Schema.String,
  kind: CredentialKind,
  status: Schema.Literals(["active", "expired", "revoked", "error"]),
  masked_value: Schema.String,
  last_used_at: Schema.optional(Schema.NullOr(Schema.String)),
  created_by: Schema.optional(Schema.NullOr(Schema.String)),
  created_at: Schema.String,
  updated_at: Schema.String,
})
export type CredentialListItem = typeof CredentialListItem.Type

export const CredentialsListResult = Schema.Struct({
  data: Schema.Array(CredentialListItem),
  total: Schema.optional(Schema.NullOr(Schema.Number)),
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
  nextCursor: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CredentialsListResult = typeof CredentialsListResult.Type

export const CredentialIdBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  credential_id: Schema.String.check(Schema.isUUID()),
})
export type CredentialIdBody = typeof CredentialIdBody.Type

export const CredentialDeleteResult = Schema.Struct({
  ok: Schema.Boolean,
})
export type CredentialDeleteResult = typeof CredentialDeleteResult.Type

export const InvokeToolBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  tool_id: Schema.String,
  input: Schema.Record(Schema.String, Schema.Unknown),
  agent_id: Schema.optional(Schema.String.check(Schema.isUUID())),
  run_id: Schema.optional(Schema.String.check(Schema.isUUID())),
})
export type InvokeToolBody = typeof InvokeToolBody.Type

export const MetaSearchBody = Schema.Struct({
  workspace_id: Schema.String.check(Schema.isUUID()),
  query: Schema.NonEmptyString,
  limit: Schema.optional(Schema.Number),
})
export type MetaSearchBody = typeof MetaSearchBody.Type

// ── Discovery data schemas ──────────────────────────────────────────────

export const ExtractedTool = Schema.Struct({
  tool_id: RegistryToolIdentifier,
  name: RegistryToolIdentifier,
  display_name: Schema.NonEmptyString,
  description: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  binding: Schema.Unknown,
  tags: Schema.optional(Schema.Array(Schema.NonEmptyString)),
  annotations: Schema.optional(Schema.Unknown),
  icons: Schema.optional(Schema.Array(McpIcon)),
})
export type ExtractedTool = typeof ExtractedTool.Type

export const DiscoverySourceMetadata = Schema.Struct({
  protocol_version: Schema.optional(Schema.String),
  server_info: Schema.optional(Schema.Unknown),
  capabilities: Schema.optional(Schema.Unknown),
  instructions: Schema.optional(Schema.String),
  icons: Schema.optional(Schema.Array(McpIcon)),
  prompt_count: Schema.optional(Schema.Number),
  resource_count: Schema.optional(Schema.Number),
  resource_template_count: Schema.optional(Schema.Number),
})
export type DiscoverySourceMetadata = typeof DiscoverySourceMetadata.Type

export const DiscoveryResult = Schema.Struct({
  tools: Schema.Array(ExtractedTool),
  shared_defs: Schema.optional(Schema.Unknown),
  source_metadata: Schema.optional(DiscoverySourceMetadata),
})
export type DiscoveryResult = typeof DiscoveryResult.Type

export const InvokerResult = Schema.Struct({
  result: Schema.Unknown,
  content_type: Schema.String,
  content: Schema.optional(Schema.Array(InvokeResultContent)),
  upstream_status: Schema.optional(Schema.Number),
  duration_ms: Schema.optional(Schema.Number),
  status: Schema.optional(Schema.Number),
})
export type InvokerResult = typeof InvokerResult.Type

export const InvokerRuntimeConfig = Schema.Struct({
  base_url: Schema.optional(Schema.String),
  default_headers: Schema.optional(Schema.Record(Schema.String, Schema.String)),
  encryption_key: Schema.optional(Schema.String),
})
export type InvokerRuntimeConfig = typeof InvokerRuntimeConfig.Type

// ── Async implementation contracts (interfaces — cannot be schemas) ───

export interface SourceDiscoverer {
  discover(
    namespace: string,
    config: MCPSourceConfig,
    auth_config: AuthConfig,
  ): Promise<DiscoveryResult>
}

export interface ToolInvoker {
  invoke(
    binding: ToolBinding,
    input: Record<string, unknown>,
    auth: ResolvedAuth,
    runtime: InvokerRuntimeConfig,
  ): Promise<InvokerResult>
}

// ── MCP Probe ────────────────────────────────────────────────────────

export const McpOAuthDiscoveryResult = Schema.Struct({
  authorization_server: Schema.String,
  authorization_endpoint: Schema.String,
  token_endpoint: Schema.String,
  registration_endpoint: Schema.NullOr(Schema.String),
  scopes_supported: Schema.Array(Schema.String),
  has_dynamic_registration: Schema.Boolean,
})
export type McpOAuthDiscoveryResult = typeof McpOAuthDiscoveryResult.Type

export const McpProbeResult = Schema.Struct({
  endpoint: Schema.String,
  connected: Schema.Boolean,
  requires_auth: Schema.Boolean,
  tool_count: Schema.Number,
  server_name: Schema.NullOr(Schema.String),
  oauth: Schema.NullOr(McpOAuthDiscoveryResult),
})
export type McpProbeResult = typeof McpProbeResult.Type

// ── Category labels ──────────────────────────────────────────────────

export const PLUGIN_CATEGORY_LABELS: Record<string, string> = {
  search: "Search",
  ai: "AI",
  comms: "Communication",
  dev: "Developer Tools",
  data: "Data",
  web: "Web",
  media: "Media",
  infra: "Infrastructure",
  observability: "Observability",
  analytics: "Analytics",
  storage: "Storage",
  other: "Other",
}
