// @hrbr/registry — Type definitions for plugin registry entries.
// Separate file to break the entries ↔ index cycle.
import { Schema } from "effect"
import {
  ApiAuthConfig,
  ApiGraphqlBinding,
  ApiRequestBinding,
  AuthTemplate,
  CliCommandBinding,
  CliCwdPolicy,
  CliLauncher,
  CliSandResultDefaults,
  McpOAuthDiscovery,
  MCPToolBinding,
  SourceLink,
} from "@hrbr/plugins"
import { SandRuntimeConstraints, SandRuntimeSpec, SandIsolationPolicy, SandSecretBinding } from "@hrbr/sand"

const RegistrySlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
const RegistryNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/))
const RegistryToolIdentifier = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/))
const SecretEnvKey = Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/))
const SkillSlug = RegistrySlug

export const PluginCategory = Schema.Literals([
  "search", "ai", "comms", "dev", "data", "web", "media", "infra",
  "observability", "analytics", "storage", "other",
])
export type PluginCategory = typeof PluginCategory.Type

export const PluginRegistryManifestToolBinding = Schema.Union([
  MCPToolBinding,
  CliCommandBinding,
  ApiRequestBinding,
  ApiGraphqlBinding,
])
export type PluginRegistryManifestToolBinding = typeof PluginRegistryManifestToolBinding.Type

export const PluginRegistryManifestTool = Schema.Struct({
  tool_id: RegistryToolIdentifier,
  name: RegistryToolIdentifier,
  display_name: Schema.NonEmptyString,
  description: Schema.optional(Schema.String),
  title: Schema.optional(Schema.String),
  input_schema: Schema.optional(Schema.Unknown),
  output_schema: Schema.optional(Schema.Unknown),
  annotations: Schema.optional(Schema.Unknown),
  icons: Schema.optional(Schema.Unknown),
  binding: PluginRegistryManifestToolBinding,
  tags: Schema.optional(Schema.Array(Schema.NonEmptyString)),
})
export type PluginRegistryManifestTool = typeof PluginRegistryManifestTool.Type

export const PluginRegistryManifest = Schema.Struct({
  tools: Schema.Array(PluginRegistryManifestTool),
  shared_defs: Schema.optional(Schema.Unknown),
})
export type PluginRegistryManifest = typeof PluginRegistryManifest.Type

export const PluginRegistryCliSetupRequiredSecret = Schema.Struct({
  env: SecretEnvKey,
  display_name: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  required: Schema.Boolean,
})
export type PluginRegistryCliSetupRequiredSecret = typeof PluginRegistryCliSetupRequiredSecret.Type

export const PluginRegistryCliSetupRunnableRequirement = Schema.Struct({
  summary: Schema.NonEmptyString,
  required_programs: Schema.Array(Schema.NonEmptyString),
})
export type PluginRegistryCliSetupRunnableRequirement = typeof PluginRegistryCliSetupRunnableRequirement.Type

export const PluginRegistryCliSetupVerifyProbe = Schema.Struct({
  args: Schema.Array(Schema.NonEmptyString),
  success_message: Schema.NonEmptyString,
})
export type PluginRegistryCliSetupVerifyProbe = typeof PluginRegistryCliSetupVerifyProbe.Type

export const PluginRegistryCliSetupFailureMatcher = Schema.Struct({
  kind: Schema.Literals(["substring", "regex"]),
  pattern: Schema.NonEmptyString,
  flags: Schema.optional(Schema.NonEmptyString),
})
export type PluginRegistryCliSetupFailureMatcher = typeof PluginRegistryCliSetupFailureMatcher.Type

export const PluginRegistryCliSetupFailureHint = Schema.Struct({
  matchers: Schema.Array(PluginRegistryCliSetupFailureMatcher),
  message: Schema.NonEmptyString,
})
export type PluginRegistryCliSetupFailureHint = typeof PluginRegistryCliSetupFailureHint.Type

export const PluginRegistryCliSetup = Schema.Struct({
  links: Schema.Array(SourceLink),
  required_secrets: Schema.Array(PluginRegistryCliSetupRequiredSecret),
  runnable: PluginRegistryCliSetupRunnableRequirement,
  verify_probe: PluginRegistryCliSetupVerifyProbe,
  failure_hints: Schema.Array(PluginRegistryCliSetupFailureHint),
})
export type PluginRegistryCliSetup = typeof PluginRegistryCliSetup.Type

export const PluginRegistryApiSetupVerifyProbe = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("request"),
    method: Schema.Literals(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]),
    path: Schema.NonEmptyString,
    query: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
    headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
    expected_status: Schema.optional(Schema.Number),
    success_message: Schema.NonEmptyString,
  }),
  Schema.Struct({
    kind: Schema.Literal("graphql"),
    method: Schema.Literal("POST"),
    path: Schema.NonEmptyString,
    document: Schema.NonEmptyString,
    operation_name: Schema.optional(Schema.NonEmptyString),
    variables_template: Schema.optional(Schema.Unknown),
    headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
    expected_status: Schema.optional(Schema.Number),
    success_message: Schema.NonEmptyString,
  }),
])
export type PluginRegistryApiSetupVerifyProbe = typeof PluginRegistryApiSetupVerifyProbe.Type

export const PluginRegistryApiSetup = Schema.Struct({
  links: Schema.Array(SourceLink),
  base_url: Schema.NonEmptyString,
  auth_mode: Schema.Literals(["header", "bearer", "query", "none", "basic"]),
  required_secrets: Schema.Array(PluginRegistryCliSetupRequiredSecret),
  verify_probe: PluginRegistryApiSetupVerifyProbe,
  failure_hints: Schema.Array(PluginRegistryCliSetupFailureHint),
  spec_url: Schema.optional(Schema.NonEmptyString),
  graphql_endpoint: Schema.optional(Schema.NonEmptyString),
  graphql_schema_url: Schema.optional(Schema.NonEmptyString),
  default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  timeout_ms: Schema.optional(Schema.Number),
})
export type PluginRegistryApiSetup = typeof PluginRegistryApiSetup.Type

const PluginRegistryAuthTest = Schema.Struct({
  method: Schema.Literals(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"]),
  url: Schema.optional(Schema.NonEmptyString),
  path: Schema.optional(Schema.NonEmptyString),
  headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  body: Schema.optional(Schema.Unknown),
  expected_status: Schema.optional(Schema.Number),
  auth_template: AuthTemplate,
})
type PluginRegistryAuthTest = typeof PluginRegistryAuthTest.Type

const PluginRegistryEntryFields = {
  slug: RegistrySlug,
  display_name: Schema.NonEmptyString,
  description: Schema.NonEmptyString,
  category: PluginCategory,
  auth: Schema.Struct({
    method: Schema.Literals(["header", "bearer", "query", "none", "basic"]),
    header_name: Schema.optional(Schema.NonEmptyString),
    query_param: Schema.optional(Schema.NonEmptyString),
    prefix: Schema.optional(Schema.String),
    required_secrets: Schema.Array(SecretEnvKey),
  }),
  /**
   * Pre-registered OAuth client seed (for providers that don't support
   * RFC 7591 dynamic registration but expose a public proxy client).
   * PostHog's remote MCP, for example, ships with a fixed public client_id
   * and a hardcoded redirect_uri.
   */
  oauth_client: Schema.optional(Schema.Struct({
    client_id: Schema.optional(Schema.NonEmptyString),
    client_secret: Schema.optional(Schema.NonEmptyString),
    redirect_uri: Schema.optional(Schema.NonEmptyString),
    scope: Schema.optional(Schema.NonEmptyString),
  })),
  auth_test: Schema.optional(PluginRegistryAuthTest),
  links: Schema.optional(Schema.Array(SourceLink)),
  icon_url: Schema.optional(Schema.NonEmptyString),
  skill: Schema.optional(Schema.Struct({
    slug: Schema.optional(SkillSlug),
  })),
  default_namespace: RegistryNamespace,
  /**
   * Hand-tuned popularity score used to rank the catalog in the dashboard.
   * Higher = more likely to be surfaced first. Values typically fall on a
   * 0..100 scale. Decorated by `listRegistryEntries()` from a central
   * POPULARITY map so the canonical catalog JSON stays free of churn.
   *
   * Will eventually be replaced / supplemented by a workspace-scoped
   * usage-metric popularity (live telemetry), but this hard-coded seed is
   * what the UI reads today.
   */
  popularity: Schema.optional(Schema.Number),
  /**
   * Server-decorated: true when Harbor has a global OAuth client
   * configured for this slug via `GLOBAL_MCP_OAUTH_CLIENTS` AND the
   * slug is eligible for global-client activation. SourcePolicy uses this
   * deploy fact to flip eligible confidential-client providers from
   * `coming_soon` to `active` without exposing the secret itself. The
   * client never sets this field — it is attached by `plugins/registry/list`
   * on the API.
   */
  is_oauth_client_configured: Schema.optional(Schema.Boolean),
} as const

const PluginRegistryMcpConfig = Schema.Struct({
  mcp_endpoint: Schema.NonEmptyString,
  mcp_transport: Schema.Literals(["http", "sse"]),
  oauth_discovery: Schema.optional(McpOAuthDiscovery),
  mcp_default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  composio_auth_config_id: Schema.optional(Schema.NonEmptyString),
})

const PluginRegistryCliConfig = Schema.Struct({
  cli_launcher: CliLauncher,
  cli_command: Schema.NonEmptyString,
  cli_args: Schema.optional(Schema.Array(Schema.String)),
  cli_cwd_policy: CliCwdPolicy,
  cli_cwd: Schema.optional(Schema.String),
  cli_allowed_env_keys: Schema.optional(Schema.Array(SecretEnvKey)),
  sand_sandbox_policy: Schema.optional(SandIsolationPolicy),
  sand_secret_bindings: Schema.optional(Schema.Array(SandSecretBinding)),
  sand_runtime: Schema.optional(SandRuntimeSpec),
  cli_result_defaults: Schema.optional(CliSandResultDefaults),
  sand_runtime_constraints: Schema.optional(SandRuntimeConstraints),
})

const PluginRegistryApiConfig = Schema.Struct({
  api_protocol: Schema.optional(Schema.Literals(["openapi", "graphql", "http"])),
  api_base_url: Schema.NonEmptyString,
  api_allowed_hosts: Schema.optional(Schema.Array(Schema.NonEmptyString)),
  api_spec_url: Schema.optional(Schema.NonEmptyString),
  api_graphql_endpoint: Schema.optional(Schema.NonEmptyString),
  api_graphql_schema_url: Schema.optional(Schema.NonEmptyString),
  api_default_headers: Schema.optional(Schema.Record(Schema.NonEmptyString, Schema.String)),
  api_timeout_ms: Schema.optional(Schema.Number),
  api_auth: Schema.optional(ApiAuthConfig),
})

export const PluginRegistryEntry = Schema.Union([
  Schema.Struct({
    ...PluginRegistryEntryFields,
    kind: Schema.Literal("mcp"),
    config: PluginRegistryMcpConfig,
    manifest: Schema.optional(PluginRegistryManifest),
  }),
  Schema.Struct({
    ...PluginRegistryEntryFields,
    kind: Schema.Literal("cli"),
    cli_setup: PluginRegistryCliSetup,
    config: PluginRegistryCliConfig,
    manifest: PluginRegistryManifest,
  }),
  Schema.Struct({
    ...PluginRegistryEntryFields,
    kind: Schema.Literal("api"),
    api_setup: PluginRegistryApiSetup,
    config: PluginRegistryApiConfig,
    manifest: Schema.optional(PluginRegistryManifest),
  }),
])
export type PluginRegistryEntry = typeof PluginRegistryEntry.Type

export const PluginRegistryEntryAvailability = Schema.Struct({
  status: Schema.Literals(["active", "coming_soon"]),
  selectable: Schema.Boolean,
  hiddenInOnboarding: Schema.Boolean,
  label: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
  code: Schema.optional(Schema.Literals([
    "sse_only",
    "manual_oauth_setup",
    "requires_client_secret",
    "install_verification_pending",
    "known_broken",
    "superseded_by_kind",
  ])),
})
export type PluginRegistryEntryAvailability = typeof PluginRegistryEntryAvailability.Type
export type RegistryAvailability = PluginRegistryEntryAvailability
export type RegistryAvailabilityStatus = RegistryAvailability["status"]
export type RegistryAvailabilityReason = NonNullable<RegistryAvailability["code"]>

const PluginRegistryPublicEntryFields = {
  ...PluginRegistryEntryFields,
  availability: PluginRegistryEntryAvailability,
} as const

export const PluginRegistryPublicEntry = Schema.Union([
  Schema.Struct({
    ...PluginRegistryPublicEntryFields,
    kind: Schema.Literal("mcp"),
    config: PluginRegistryMcpConfig,
    manifest: Schema.optional(PluginRegistryManifest),
  }),
  Schema.Struct({
    ...PluginRegistryPublicEntryFields,
    kind: Schema.Literal("cli"),
    cli_setup: PluginRegistryCliSetup,
    config: PluginRegistryCliConfig,
    manifest: PluginRegistryManifest,
  }),
  Schema.Struct({
    ...PluginRegistryPublicEntryFields,
    kind: Schema.Literal("api"),
    api_setup: PluginRegistryApiSetup,
    config: PluginRegistryApiConfig,
    manifest: Schema.optional(PluginRegistryManifest),
  }),
])
export type PluginRegistryPublicEntry = typeof PluginRegistryPublicEntry.Type

export const PluginRegistryListResult = Schema.Struct({
  data: Schema.Array(PluginRegistryPublicEntry),
  total: Schema.Number,
  limit: Schema.Number,
  offset: Schema.Number,
  hasMore: Schema.Boolean,
})
export type PluginRegistryListResult = typeof PluginRegistryListResult.Type
