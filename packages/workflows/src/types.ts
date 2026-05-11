// @hrbr/workflows — public types.
//
// A `Workflow` is a curated chain of tools (real plugin slugs that
// resolve in @hrbr/registry) plus chat-provided inputs (pseudo-slugs
// that represent things the user supplies in conversation, not plugins
// to install).
//
// The OR-group semantics come from workflows/harbor-skill-workflow/workflow-tool-map.json:
// each group is satisfied when ANY of its slots is met.

export type SlotKind = "tool" | "input"

export interface ToolSlot {
  readonly kind: "tool"
  readonly slug: string
}

export interface InputSlot {
  readonly kind: "input"
  readonly slug: string
}

export type Slot = ToolSlot | InputSlot

export type OrGroup = ReadonlyArray<Slot>

export interface Workflow {
  readonly id: string
  readonly title: string
  readonly description: string
  /** CSV category labels, e.g. "Marketing,Content". */
  readonly category: string
  readonly defaultTools: ReadonlyArray<ToolSlot>
  readonly orGroups: ReadonlyArray<OrGroup>
  readonly optionalTools: ReadonlyArray<ToolSlot>
  readonly bodyMarkdown: string
  readonly contentHash: string
}

// API wire shapes served by apps/api /workflows/* routes. The database and
// HTTP contract intentionally use snake_case so callers do not have to depend
// on the build-time manifest casing.
export interface WorkflowCatalogEntry {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly category: string
  readonly content_hash: string
  readonly workflow_scope?: WorkflowScope | undefined
  readonly workspace_id?: string | null | undefined
  readonly owner_kind?: WorkflowOwnerKind | undefined
  readonly owner_id?: string | null | undefined
  readonly owner_user?: WorkflowUserSummary | null | undefined
  readonly updated_by_user?: WorkflowUserSummary | null | undefined
  readonly source_visibility?: WorkflowSourceVisibility | undefined
  readonly latest_version_id?: string | null | undefined
  readonly version_name?: string | null | undefined
  readonly version_number?: number | null | undefined
  readonly version_sequence?: number | undefined
  readonly last_published_at?: string | null | undefined
  readonly last_published_by?: string | null | undefined
  readonly created_by?: string | null | undefined
  readonly updated_by?: string | null | undefined
  readonly created_at?: string | undefined
  readonly updated_at?: string | undefined
  readonly plugin_requirements?: ReadonlyArray<WorkflowPluginRequirement> | undefined
  readonly source_bindings?: ReadonlyArray<WorkflowSourceBinding> | undefined
  readonly access_request_status?: WorkflowRequestStatus | null | undefined
  readonly redacted?: boolean | undefined
  readonly runnable?: boolean | undefined
  readonly default_tools: ReadonlyArray<ToolSlot>
  readonly or_groups: ReadonlyArray<OrGroup>
  readonly optional_tools: ReadonlyArray<ToolSlot>
}

export interface WorkflowListResponse {
  readonly workflows: ReadonlyArray<WorkflowCatalogEntry>
}

export interface WorkflowGetResponse extends WorkflowCatalogEntry {
  readonly body_markdown?: string | undefined
}

export type WorkflowScope = "native" | "personal" | "workspace"

export type WorkflowOwnerKind = "system" | "user" | "workspace"

export type WorkflowSourceVisibility = "personal" | "workspace"

export type WorkflowRequestStatus = "pending" | "approved" | "rejected" | "cancelled"

export interface WorkflowUserSummary {
  readonly id: string
  readonly name: string | null
  readonly email: string | null
  readonly avatar_url: string | null
}

export interface WorkflowPluginRequirement {
  readonly slug: string
  readonly kind?: "mcp" | "cli" | "api" | undefined
  readonly optional?: boolean | undefined
}

export interface WorkflowSourceBinding {
  readonly slug?: string | undefined
  readonly namespace?: string | undefined
  readonly source_id?: string | undefined
}
