import type { WorkflowGetResponseWire, WorkflowListEntryWire } from "./schemas"

export interface WorkflowSkillListRow {
  readonly id: string
  readonly title: string
  readonly scope: string
  readonly owner: string
  readonly updated_at: string
  readonly description: string
  readonly updated_by: string
  readonly version: string
  readonly runnable: boolean
  readonly access_request_status: string | null
}

export interface WorkflowSkillDetail {
  readonly id: string
  readonly title: string
  readonly scope: string
  readonly owner: string
  readonly updated_at: string | null
  readonly description: string
  readonly updated_by: string
  readonly version: string
  readonly runnable: boolean
  readonly access_request_status: string | null
  readonly body_markdown?: string | undefined
  readonly content_hash: string
  readonly default_tools: readonly unknown[]
  readonly or_groups: readonly unknown[]
  readonly optional_tools: readonly unknown[]
}

export function workflowOwnerLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string {
  if (entry.workflow_scope === "native" || entry.owner_kind === "system") return "Harbor"
  if (entry.owner_kind === "workspace") return "Workspace"
  return entry.owner_user?.name ?? entry.owner_user?.email ?? entry.owner_id ?? "-"
}

export function workflowUpdatedByLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string {
  return entry.updated_by_user?.name ?? entry.updated_by_user?.email ?? "-"
}

export function workflowVersionLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string {
  return entry.version_name ?? (entry.version_number ? `v${entry.version_number}` : "-")
}

export function workflowSkillListRow(entry: WorkflowListEntryWire): WorkflowSkillListRow {
  return {
    id: entry.id,
    title: entry.title,
    scope: entry.workflow_scope ?? "native",
    owner: workflowOwnerLabel(entry),
    updated_at: entry.updated_at ?? "-",
    description: entry.description,
    updated_by: workflowUpdatedByLabel(entry),
    version: workflowVersionLabel(entry),
    runnable: entry.runnable ?? !entry.redacted,
    access_request_status: entry.access_request_status ?? null,
  }
}

export function workflowSkillDetail(entry: WorkflowGetResponseWire): WorkflowSkillDetail {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    scope: entry.workflow_scope ?? "native",
    owner: workflowOwnerLabel(entry),
    updated_by: workflowUpdatedByLabel(entry),
    updated_at: entry.updated_at ?? null,
    version: workflowVersionLabel(entry),
    runnable: entry.runnable ?? !entry.redacted,
    access_request_status: entry.access_request_status ?? null,
    body_markdown: entry.body_markdown,
    content_hash: entry.content_hash,
    default_tools: entry.default_tools,
    or_groups: entry.or_groups,
    optional_tools: entry.optional_tools,
  }
}

function toolSlotName(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value !== "object" || value === null) return String(value)
  const record = value as Record<string, unknown>
  const slug = record.slug ?? record.id ?? record.name
  const kind = record.kind
  if (typeof slug === "string" && typeof kind === "string" && kind !== "tool") return `${kind}:${slug}`
  if (typeof slug === "string") return slug
  return JSON.stringify(value)
}

export function workflowToolRequirementsToon(entry: {
  readonly default_tools: readonly unknown[]
  readonly or_groups: readonly unknown[]
  readonly optional_tools: readonly unknown[]
}): string {
  const lines: string[] = []
  if (entry.default_tools.length > 0) {
    lines.push("required_tools:")
    for (const tool of entry.default_tools) lines.push(`  - ${toolSlotName(tool)}`)
  }
  if (entry.or_groups.length > 0) {
    lines.push("one_of_groups:")
    entry.or_groups.forEach((group, index) => {
      const choices = Array.isArray(group) ? group.map(toolSlotName).join(" | ") : toolSlotName(group)
      lines.push(`  ${index + 1}: ${choices}`)
    })
  }
  if (entry.optional_tools.length > 0) {
    lines.push("optional_tools:")
    for (const tool of entry.optional_tools) lines.push(`  - ${toolSlotName(tool)}`)
  }
  return lines.join("\n")
}

export function workflowCatalogMap(entries: ReadonlyArray<WorkflowListEntryWire>) {
  return new Map(entries.map((entry) => [
    entry.id,
    {
      slug: entry.id,
      content_hash: entry.content_hash,
      plugin: entry.workflow_scope ?? "native",
    },
  ]))
}

export function workflowUnavailableMessage(skillId: string): string {
  return `Skill ${skillId} is not available to this workspace. Request access from the skill owner in the dashboard.`
}
