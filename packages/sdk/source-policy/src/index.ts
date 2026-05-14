// @hrbr/source-policy - compile catalog entries into provider-agnostic source policy.
import { Schema } from "effect"
import type { CatalogAvailabilityRules, CatalogEntry } from "@hrbr/catalog"
import { getCatalogAvailabilityRules } from "@hrbr/catalog"
import { AuthKind, InstallFlow } from "@hrbr/source-auth"
import { SourceIdentity, SourceRuntimeTransport, ToolBindingKind as ToolBindingKindSchema, TOOL_BINDING_KINDS, type ToolBindingKind } from "@hrbr/source-core"
import { CredentialSlot } from "@hrbr/source-credentials"

// Internal availability/exposure/diagnostic schemas. PRUNE pass kept the
// implementations but stopped re-exporting them — nothing outside this
// package consumes them, and re-introducing the export when a real consumer
// lands is a one-line change.
const SourceAvailabilityCode = Schema.Literals([
  "sse_only",
  "manual_oauth_setup",
  "requires_client_secret",
  "install_verification_pending",
  "known_broken",
  "superseded_by_kind",
])
type SourceAvailabilityCode = typeof SourceAvailabilityCode.Type

const SourceExposure = Schema.Struct({
  status: Schema.Literals(["active", "coming_soon"]),
  selectable: Schema.Boolean,
  hidden_in_onboarding: Schema.Boolean,
  label: Schema.optional(Schema.String),
  reason: Schema.optional(Schema.String),
  code: Schema.optional(SourceAvailabilityCode),
  superseded_by: Schema.optional(Schema.String),
})
type SourceExposure = typeof SourceExposure.Type

const PolicyDiagnostic = Schema.Struct({
  phase: Schema.Literals(["catalog", "curation", "deploy", "workspace", "runtime"]),
  modifier_id: Schema.NonEmptyString,
  message: Schema.String,
})
type PolicyDiagnostic = typeof PolicyDiagnostic.Type

export const SourcePolicy = Schema.Struct({
  identity: SourceIdentity,
  exposure: SourceExposure,
  setup: Schema.Struct({
    install_flow: InstallFlow,
    auth_kind: AuthKind,
    credential_slots: Schema.Array(CredentialSlot),
  }),
  runtime: Schema.Struct({
    transport: SourceRuntimeTransport,
    tool_binding_kinds: Schema.Array(ToolBindingKindSchema),
  }),
  agent: Schema.Struct({
    capabilities: Schema.Array(Schema.String),
  }),
  adapters: Schema.Record(Schema.String, Schema.String),
  diagnostics: Schema.Array(PolicyDiagnostic),
})
export type SourcePolicy = typeof SourcePolicy.Type

export interface SourcePolicyContext {
  readonly catalog?: {
    readonly availabilityRules?: CatalogAvailabilityRules | undefined
  } | undefined
  readonly deploy?: {
    readonly configuredGlobalOAuthClientSlugs?: ReadonlySet<string> | undefined
  } | undefined
  readonly workspace?: Record<string, never> | undefined
  readonly runtime?: Record<string, never> | undefined
}

export interface PolicyModifierInput {
  readonly entry: CatalogEntry
  readonly context: SourcePolicyContext
  readonly rules: CatalogAvailabilityRules
}

export interface PolicyModifier {
  readonly id: string
  readonly phase: PolicyDiagnostic["phase"]
  readonly priority: number
  apply(policy: SourcePolicy, input: PolicyModifierInput): SourcePolicy
}

export type ToolPolicyDecision =
  | { readonly kind: "allow" }
  | { readonly kind: "block"; readonly reason: string }
  | { readonly kind: "require_approval"; readonly reason: string }
export type ToolPolicyDenialDecision = Exclude<ToolPolicyDecision, { readonly kind: "allow" }>

export interface ToolPolicyEvaluationInput {
  readonly toolId: string
  readonly namespace: string
  readonly toolName: string
  readonly input: Readonly<Record<string, unknown>>
  readonly principalId?: string | undefined
}

export interface ToolPolicy {
  readonly evaluate: (input: ToolPolicyEvaluationInput) => Promise<ToolPolicyDecision> | ToolPolicyDecision
}

export interface ToolPolicyRule {
  readonly match: string
  readonly decision: ToolPolicyDecision
}

export interface CreateToolPolicyInput {
  readonly rules: readonly ToolPolicyRule[]
  readonly defaultDecision?: ToolPolicyDecision | undefined
}

export class ToolPolicyDeniedError extends Error {
  readonly toolId: string
  readonly decision: ToolPolicyDenialDecision

  constructor(toolId: string, decision: ToolPolicyDenialDecision) {
    const prefix = decision.kind === "block" ? "blocked" : "requires approval"
    super(`Tool "${toolId}" ${prefix}: ${decision.reason}`)
    this.name = "ToolPolicyDeniedError"
    this.toolId = toolId
    this.decision = decision
  }
}

function toolPatternMatches(pattern: string, toolId: string): boolean {
  if (pattern === "*") return true
  if (pattern.endsWith(".*")) {
    const namespace = pattern.slice(0, -2)
    return toolId.startsWith(`${namespace}.`)
  }
  return pattern === toolId
}

export function createToolPolicy(input: CreateToolPolicyInput): ToolPolicy {
  return {
    evaluate: (evaluation) => {
      for (const rule of input.rules) {
        if (toolPatternMatches(rule.match, evaluation.toolId)) return rule.decision
      }
      return input.defaultDecision ?? { kind: "allow" }
    },
  }
}

const comingSoonReason: Record<SourceAvailabilityCode, string> = {
  sse_only: "SSE-only MCP transport is not supported yet.",
  manual_oauth_setup: "Requires preconfigured OAuth app credentials before public setup.",
  requires_client_secret: "Requires a confidential OAuth client secret before Harbor can safely start the flow.",
  install_verification_pending: "Upstream endpoint returned auth-required without OAuth metadata. Install path is not verified yet.",
  known_broken: "Coming soon.",
  superseded_by_kind: "This provider is exposed via another source kind. Policy: REST API > GraphQL API > MCP > CLI.",
}

const activeExposure = (): SourceExposure => ({
  status: "active",
  selectable: true,
  hidden_in_onboarding: false,
})

function stoppedExposure(code: SourceAvailabilityCode, reason = comingSoonReason[code]): SourceExposure {
  return {
    status: "coming_soon",
    selectable: false,
    hidden_in_onboarding: true,
    label: "Coming soon",
    reason,
    code,
  }
}

function withDiagnostic(policy: SourcePolicy, modifier: PolicyModifier, message: string): SourcePolicy {
  return {
    ...policy,
    diagnostics: [...policy.diagnostics, { phase: modifier.phase, modifier_id: modifier.id, message }],
  }
}

function entryConfig(entry: CatalogEntry): Record<string, unknown> {
  return entry.config && typeof entry.config === "object" ? entry.config as Record<string, unknown> : {}
}

function isSseOnly(entry: CatalogEntry): boolean {
  return entry.kind === "mcp" && entryConfig(entry).mcp_transport === "sse"
}

function inferTransport(entry: CatalogEntry): SourceRuntimeTransport {
  if (entry.kind === "cli") return "cli"
  if (entry.kind === "api") return entryConfig(entry).api_protocol === "graphql" ? "api_graphql" : "api_http"
  return isSseOnly(entry) ? "mcp_sse" : "mcp_http"
}

function inferToolBindingKinds(entry: CatalogEntry): ToolBindingKind[] {
  const kinds = new Set<ToolBindingKind>()
  for (const tool of entry.manifest?.tools ?? []) {
    const kind = tool.binding.kind
    if ((TOOL_BINDING_KINDS as readonly string[]).includes(kind)) kinds.add(kind as ToolBindingKind)
  }
  return [...kinds]
}

function inferCredentialSlots(entry: CatalogEntry): CredentialSlot[] {
  return entry.auth.required_secrets.map((env) => ({
    slot: env.toLowerCase(),
    kind: "env_secret",
    label: env,
    scope: "workspace",
  }))
}

function inferBaseAuthKind(entry: CatalogEntry): AuthKind {
  if (entry.kind === "mcp" && entryConfig(entry).oauth_discovery) return "native_oauth"
  return entry.auth.method === "none" ? "none" : "static_secret"
}

function inferBaseInstallFlow(entry: CatalogEntry): InstallFlow {
  if (entry.auth.method !== "none") return "manual_credentials"
  if (entry.kind === "mcp" && entryConfig(entry).oauth_discovery) return "discover_then_auth"
  if (entry.kind === "mcp") return "discover"
  return "direct"
}

function inferCapabilities(entry: CatalogEntry): string[] {
  const capabilities = new Set<string>([entry.category])
  for (const tool of entry.manifest?.tools ?? []) {
    for (const tag of tool.tags ?? []) capabilities.add(tag)
  }
  return [...capabilities]
}

function baseSourcePolicy(entry: CatalogEntry): SourcePolicy {
  return {
    identity: {
      slug: entry.slug,
      kind: entry.kind,
      default_namespace: entry.default_namespace,
      display_name: entry.display_name,
    },
    exposure: activeExposure(),
    setup: {
      install_flow: inferBaseInstallFlow(entry),
      auth_kind: inferBaseAuthKind(entry),
      credential_slots: inferCredentialSlots(entry),
    },
    runtime: {
      transport: inferTransport(entry),
      tool_binding_kinds: inferToolBindingKinds(entry),
    },
    agent: {
      capabilities: inferCapabilities(entry),
    },
    adapters: {},
    diagnostics: [{ phase: "catalog", modifier_id: "base", message: "Compiled base source policy from catalog entry." }],
  }
}

function hasSlug(values: readonly string[], slug: string): boolean {
  return values.includes(slug)
}

function isStopped(policy: SourcePolicy): boolean {
  return policy.exposure.status !== "active"
}

const knownBrokenModifier: PolicyModifier = {
  id: "compat.known_broken",
  phase: "curation",
  priority: 10,
  apply(policy, input) {
    if (!hasSlug(input.rules.known_broken_slugs, input.entry.slug)) return policy
    return withDiagnostic({ ...policy, exposure: stoppedExposure("known_broken") }, this, "Stopped by catalog curation policy.")
  },
}

const supersededByKindModifier: PolicyModifier = {
  id: "compat.superseded_by_kind",
  phase: "curation",
  priority: 20,
  apply(policy, input) {
    if (isStopped(policy)) return policy
    const supersededBy = input.rules.superseded_by_kind[input.entry.slug]
    if (!supersededBy) return policy
    return withDiagnostic({
      ...policy,
      exposure: {
        ...stoppedExposure("superseded_by_kind", comingSoonReason.superseded_by_kind + " Use \x60" + supersededBy + "\x60 instead."),
        superseded_by: supersededBy,
      },
    }, this, "Superseded by " + supersededBy + ".")
  },
}

const sseOnlyModifier: PolicyModifier = {
  id: "compat.sse_only",
  phase: "catalog",
  priority: 30,
  apply(policy, input) {
    if (isStopped(policy)) return policy
    if (!isSseOnly(input.entry)) return policy
    return withDiagnostic({ ...policy, exposure: stoppedExposure("sse_only") }, this, "SSE-only MCP transport is not active.")
  },
}

const clientSecretRequiredModifier: PolicyModifier = {
  id: "compat.client_secret_required",
  phase: "curation",
  priority: 40,
  apply(policy, input) {
    if (isStopped(policy)) return policy
    if (!hasSlug(input.rules.client_secret_required_slugs, input.entry.slug)) return policy
    const configuredByEntry = input.entry.is_oauth_client_configured === true
    const configuredByContext = input.context.deploy?.configuredGlobalOAuthClientSlugs?.has(input.entry.slug) === true
    const globallyEnabled = hasSlug(input.rules.global_client_enabled_slugs, input.entry.slug)
    const configured = globallyEnabled && (configuredByEntry || configuredByContext)
    return withDiagnostic({
      ...policy,
      exposure: configured ? activeExposure() : stoppedExposure("requires_client_secret"),
      setup: {
        ...policy.setup,
        auth_kind: "global_confidential_oauth",
        install_flow: "discover_then_auth",
      },
    }, this, configured ? "Global confidential OAuth client is configured." : "Requires global confidential OAuth client.")
  },
}

const manualOAuthSetupModifier: PolicyModifier = {
  id: "compat.manual_oauth_setup",
  phase: "curation",
  priority: 50,
  apply(policy, input) {
    if (isStopped(policy)) return policy
    if (!hasSlug(input.rules.manual_oauth_setup_slugs, input.entry.slug)) return policy
    return withDiagnostic({
      ...policy,
      exposure: stoppedExposure("manual_oauth_setup"),
      setup: { ...policy.setup, auth_kind: "manual_client_oauth", install_flow: "manual_credentials" },
    }, this, "Requires manual OAuth client setup.")
  },
}

const installVerificationPendingModifier: PolicyModifier = {
  id: "compat.install_verification_pending",
  phase: "curation",
  priority: 60,
  apply(policy, input) {
    if (isStopped(policy)) return policy
    if (!hasSlug(input.rules.install_verification_pending_slugs, input.entry.slug)) return policy
    return withDiagnostic({ ...policy, exposure: stoppedExposure("install_verification_pending") }, this, "Install verification is pending.")
  },
}

export const compatibilityPolicyModifiers: readonly PolicyModifier[] = [
  knownBrokenModifier,
  supersededByKindModifier,
  sseOnlyModifier,
  clientSecretRequiredModifier,
  manualOAuthSetupModifier,
  installVerificationPendingModifier,
]

export function compileSourcePolicy(
  entry: CatalogEntry,
  context: SourcePolicyContext = {},
  modifiers: readonly PolicyModifier[] = compatibilityPolicyModifiers,
): SourcePolicy {
  const rules = context.catalog?.availabilityRules ?? getCatalogAvailabilityRules()
  const input = { entry, context, rules }
  return [...modifiers]
    .sort((a, b) => a.priority - b.priority)
    .reduce((policy, modifier) => modifier.apply(policy, input), baseSourcePolicy(entry))
}
