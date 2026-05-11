// @hrbr/source-core — provider-agnostic source identity and tool primitives.
//
// PRUNE pass kept SourceKind / SourceNamespace / CapabilityTag as internal
// schema primitives — they're used by SourceIdentity below but not imported
// outside this package.
import { Schema } from "effect"

const SourceKind = Schema.Literals(["mcp", "cli", "api"])
type SourceKind = typeof SourceKind.Type

export const SourceId = Schema.NonEmptyString
export type SourceId = typeof SourceId.Type

export const WorkspaceId = Schema.NonEmptyString
export type WorkspaceId = typeof WorkspaceId.Type

export const CatalogSlug = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
export type CatalogSlug = typeof CatalogSlug.Type

const SourceNamespace = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/))
type SourceNamespace = typeof SourceNamespace.Type

const CapabilityTag = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/))
type CapabilityTag = typeof CapabilityTag.Type

export const AdapterId = Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/))
export type AdapterId = typeof AdapterId.Type

export const SourceIdentity = Schema.Struct({
  slug: CatalogSlug,
  kind: SourceKind,
  default_namespace: SourceNamespace,
  display_name: Schema.NonEmptyString,
})
export type SourceIdentity = typeof SourceIdentity.Type

export const TOOL_BINDING_KINDS = [
  "mcp",
  "mcp_prompt",
  "mcp_resource_read",
  "mcp_resource_template",
  "cli_command",
  "api_request",
  "api_graphql",
] as const
export const ToolBindingKind = Schema.Literals(TOOL_BINDING_KINDS)
export type ToolBindingKind = typeof ToolBindingKind.Type

export const SourceRuntimeTransport = Schema.Literals(["mcp_http", "mcp_sse", "cli", "api_http", "api_graphql"])
export type SourceRuntimeTransport = typeof SourceRuntimeTransport.Type

export type SourceToolKind = "mcp" | "api" | "cli" | "custom"

export type SourceJsonSchema = Readonly<Record<string, unknown>>

export interface SourceToolDefinition {
  readonly name: string
  readonly displayName?: string | undefined
  readonly description?: string | undefined
  readonly inputSchema?: SourceJsonSchema | undefined
  readonly outputSchema?: SourceJsonSchema | undefined
  readonly inputType?: string | undefined
  readonly outputType?: string | undefined
  readonly typeDefinitions?: string | undefined
  readonly annotations?: unknown
  readonly tags?: readonly string[] | undefined
  readonly kind?: SourceToolKind | undefined
}

export interface SourceAdapterCredentials {
  readonly get: (slot: string) => string | undefined
  readonly require: (slot: string) => string
  readonly has: (slot: string) => boolean
  readonly slots: () => readonly string[]
}

export interface SourceAdapterInvokeContext {
  readonly signal?: AbortSignal | undefined
  readonly credentials?: SourceAdapterCredentials | undefined
}

export interface SourceAdapterDescribeContext {
  readonly signal?: AbortSignal | undefined
  readonly credentials?: SourceAdapterCredentials | undefined
}

export interface SourceAdapterListContext {
  readonly signal?: AbortSignal | undefined
  readonly credentials?: SourceAdapterCredentials | undefined
}

export interface SourceAdapter {
  readonly id?: string | undefined
  readonly namespace: string
  readonly displayName: string
  readonly kind?: SourceToolKind | undefined
  readonly listTools: (ctx?: SourceAdapterListContext) => Promise<readonly SourceToolDefinition[]>
  readonly describeTool?: (
    name: string,
    ctx?: SourceAdapterDescribeContext,
  ) => Promise<SourceToolDefinition | null | undefined>
  readonly invokeTool: (
    name: string,
    input: Readonly<Record<string, unknown>>,
    ctx?: SourceAdapterInvokeContext,
  ) => Promise<unknown>
}

export function defineSourceAdapter(adapter: SourceAdapter): SourceAdapter {
  return adapter
}
