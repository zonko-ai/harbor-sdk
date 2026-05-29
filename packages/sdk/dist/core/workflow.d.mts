import { Schema } from "effect";

//#region ../core-effect/src/workflow.d.ts
declare const WorkflowId: Schema.NonEmptyString;
type WorkflowId = typeof WorkflowId.Type;
declare const WorkflowSlotKind: Schema.Literals<readonly ["tool", "input"]>;
type WorkflowSlotKind = typeof WorkflowSlotKind.Type;
declare const WorkflowToolSlot: Schema.Struct<{
  readonly kind: Schema.Literal<"tool">;
  readonly slug: Schema.String;
}>;
type WorkflowToolSlot = typeof WorkflowToolSlot.Type;
declare const WorkflowInputSlot: Schema.Struct<{
  readonly kind: Schema.Literal<"input">;
  readonly slug: Schema.String;
}>;
type WorkflowInputSlot = typeof WorkflowInputSlot.Type;
declare const WorkflowSlot: Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"tool">;
  readonly slug: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"input">;
  readonly slug: Schema.String;
}>]>;
type WorkflowSlot = typeof WorkflowSlot.Type;
declare const WorkflowOrGroup: Schema.$Array<Schema.Union<readonly [Schema.Struct<{
  readonly kind: Schema.Literal<"tool">;
  readonly slug: Schema.String;
}>, Schema.Struct<{
  readonly kind: Schema.Literal<"input">;
  readonly slug: Schema.String;
}>]>>;
type WorkflowOrGroup = typeof WorkflowOrGroup.Type;
declare const Workflow: Schema.Struct<{
  readonly id: Schema.NonEmptyString;
  readonly title: Schema.String;
  readonly description: Schema.String;
  readonly category: Schema.String;
  readonly defaultTools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
  readonly orGroups: Schema.$Array<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly slug: Schema.String;
  }>]>>>;
  readonly optionalTools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
  readonly bodyMarkdown: Schema.String;
  readonly contentHash: Schema.String;
}>;
type Workflow = typeof Workflow.Type;
declare const WorkflowOwnerKind: Schema.Literals<readonly ["system", "workspace"]>;
type WorkflowOwnerKind = typeof WorkflowOwnerKind.Type;
declare const WorkflowUserSummary: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.NullOr<Schema.String>;
  readonly email: Schema.NullOr<Schema.String>;
  readonly avatar_url: Schema.NullOr<Schema.String>;
}>;
type WorkflowUserSummary = typeof WorkflowUserSummary.Type;
declare const WorkflowUserSummarySchema: Schema.Struct<{
  readonly id: Schema.String;
  readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
  readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
}>;
type WorkflowUserSummaryWire = typeof WorkflowUserSummarySchema.Type;
declare const WorkflowPluginRequirement: Schema.Struct<{
  readonly slug: Schema.String;
  readonly kind: Schema.optional<Schema.Literals<readonly ["mcp", "cli", "api"]>>;
  readonly optional: Schema.optional<Schema.Boolean>;
}>;
type WorkflowPluginRequirement = typeof WorkflowPluginRequirement.Type;
declare const WorkflowSourceBinding: Schema.Struct<{
  readonly slug: Schema.optional<Schema.String>;
  readonly namespace: Schema.optional<Schema.String>;
  readonly source_id: Schema.optional<Schema.String>;
}>;
type WorkflowSourceBinding = typeof WorkflowSourceBinding.Type;
declare const WorkflowListEntrySchema: Schema.Struct<{
  id: Schema.String;
  title: Schema.String;
  description: Schema.String;
  category: Schema.optional<Schema.String>;
  content_hash: Schema.String;
  owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
  workspace_id: Schema.NullOr<Schema.String>;
  updated_by_user: Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
  }>>;
  version_name: Schema.NullOr<Schema.String>;
  version_number: Schema.NullOr<Schema.Number>;
  updated_at: Schema.optional<Schema.String>;
  default_tools: Schema.$Array<Schema.Unknown>;
  or_groups: Schema.$Array<Schema.Unknown>;
  optional_tools: Schema.$Array<Schema.Unknown>;
}>;
type WorkflowListEntryWire = typeof WorkflowListEntrySchema.Type;
declare const WorkflowListResponseSchema: Schema.Struct<{
  readonly workflows: Schema.$Array<Schema.Struct<{
    id: Schema.String;
    title: Schema.String;
    description: Schema.String;
    category: Schema.optional<Schema.String>;
    content_hash: Schema.String;
    owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
    workspace_id: Schema.NullOr<Schema.String>;
    updated_by_user: Schema.NullOr<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
      readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
    }>>;
    version_name: Schema.NullOr<Schema.String>;
    version_number: Schema.NullOr<Schema.Number>;
    updated_at: Schema.optional<Schema.String>;
    default_tools: Schema.$Array<Schema.Unknown>;
    or_groups: Schema.$Array<Schema.Unknown>;
    optional_tools: Schema.$Array<Schema.Unknown>;
  }>>;
}>;
type WorkflowListResponseWire = typeof WorkflowListResponseSchema.Type;
declare const WorkflowGetResponseSchema: Schema.Struct<{
  readonly body_markdown: Schema.optional<Schema.String>;
  readonly id: Schema.String;
  readonly title: Schema.String;
  readonly description: Schema.String;
  readonly category: Schema.optional<Schema.String>;
  readonly content_hash: Schema.String;
  readonly owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
  readonly workspace_id: Schema.NullOr<Schema.String>;
  readonly updated_by_user: Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly email: Schema.optional<Schema.NullOr<Schema.String>>;
    readonly avatar_url: Schema.optional<Schema.NullOr<Schema.String>>;
  }>>;
  readonly version_name: Schema.NullOr<Schema.String>;
  readonly version_number: Schema.NullOr<Schema.Number>;
  readonly updated_at: Schema.optional<Schema.String>;
  readonly default_tools: Schema.$Array<Schema.Unknown>;
  readonly or_groups: Schema.$Array<Schema.Unknown>;
  readonly optional_tools: Schema.$Array<Schema.Unknown>;
}>;
type WorkflowGetResponseWire = typeof WorkflowGetResponseSchema.Type;
declare const WorkflowListBodySchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
}>;
type WorkflowListBodyWire = typeof WorkflowListBodySchema.Type;
declare const WorkflowGetBodySchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly workflow_id: Schema.NonEmptyString;
}>;
type WorkflowGetBodyWire = typeof WorkflowGetBodySchema.Type;
declare const WorkflowAddBodySchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly workflow_id: Schema.NonEmptyString;
}>;
type WorkflowAddBodyWire = typeof WorkflowAddBodySchema.Type;
declare const WorkflowRemoveBodySchema: Schema.Struct<{
  readonly workspace_id: Schema.String;
  readonly workflow_id: Schema.NonEmptyString;
}>;
type WorkflowRemoveBodyWire = typeof WorkflowRemoveBodySchema.Type;
declare const WorkflowCatalogEntry: Schema.Struct<{
  readonly id: Schema.String;
  readonly title: Schema.String;
  readonly description: Schema.String;
  readonly category: Schema.String;
  readonly content_hash: Schema.String;
  readonly owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
  readonly workspace_id: Schema.NullOr<Schema.String>;
  readonly updated_by_user: Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.NullOr<Schema.String>;
    readonly email: Schema.NullOr<Schema.String>;
    readonly avatar_url: Schema.NullOr<Schema.String>;
  }>>;
  readonly latest_version_id: Schema.NullOr<Schema.String>;
  readonly version_name: Schema.NullOr<Schema.String>;
  readonly version_number: Schema.NullOr<Schema.Number>;
  readonly version_sequence: Schema.Number;
  readonly last_published_at: Schema.NullOr<Schema.String>;
  readonly last_published_by: Schema.NullOr<Schema.String>;
  readonly created_by: Schema.NullOr<Schema.String>;
  readonly updated_by: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly plugin_requirements: Schema.$Array<Schema.Struct<{
    readonly slug: Schema.String;
    readonly kind: Schema.optional<Schema.Literals<readonly ["mcp", "cli", "api"]>>;
    readonly optional: Schema.optional<Schema.Boolean>;
  }>>;
  readonly source_bindings: Schema.$Array<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
    readonly namespace: Schema.optional<Schema.String>;
    readonly source_id: Schema.optional<Schema.String>;
  }>>;
  readonly default_tools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
  readonly or_groups: Schema.$Array<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly slug: Schema.String;
  }>]>>>;
  readonly optional_tools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
}>;
type WorkflowCatalogEntry = typeof WorkflowCatalogEntry.Type;
declare const WorkflowListResponse: Schema.Struct<{
  readonly workflows: Schema.$Array<Schema.Struct<{
    readonly id: Schema.String;
    readonly title: Schema.String;
    readonly description: Schema.String;
    readonly category: Schema.String;
    readonly content_hash: Schema.String;
    readonly owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
    readonly workspace_id: Schema.NullOr<Schema.String>;
    readonly updated_by_user: Schema.NullOr<Schema.Struct<{
      readonly id: Schema.String;
      readonly name: Schema.NullOr<Schema.String>;
      readonly email: Schema.NullOr<Schema.String>;
      readonly avatar_url: Schema.NullOr<Schema.String>;
    }>>;
    readonly latest_version_id: Schema.NullOr<Schema.String>;
    readonly version_name: Schema.NullOr<Schema.String>;
    readonly version_number: Schema.NullOr<Schema.Number>;
    readonly version_sequence: Schema.Number;
    readonly last_published_at: Schema.NullOr<Schema.String>;
    readonly last_published_by: Schema.NullOr<Schema.String>;
    readonly created_by: Schema.NullOr<Schema.String>;
    readonly updated_by: Schema.NullOr<Schema.String>;
    readonly created_at: Schema.String;
    readonly updated_at: Schema.String;
    readonly plugin_requirements: Schema.$Array<Schema.Struct<{
      readonly slug: Schema.String;
      readonly kind: Schema.optional<Schema.Literals<readonly ["mcp", "cli", "api"]>>;
      readonly optional: Schema.optional<Schema.Boolean>;
    }>>;
    readonly source_bindings: Schema.$Array<Schema.Struct<{
      readonly slug: Schema.optional<Schema.String>;
      readonly namespace: Schema.optional<Schema.String>;
      readonly source_id: Schema.optional<Schema.String>;
    }>>;
    readonly default_tools: Schema.$Array<Schema.Struct<{
      readonly kind: Schema.Literal<"tool">;
      readonly slug: Schema.String;
    }>>;
    readonly or_groups: Schema.$Array<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
      readonly kind: Schema.Literal<"tool">;
      readonly slug: Schema.String;
    }>, Schema.Struct<{
      readonly kind: Schema.Literal<"input">;
      readonly slug: Schema.String;
    }>]>>>;
    readonly optional_tools: Schema.$Array<Schema.Struct<{
      readonly kind: Schema.Literal<"tool">;
      readonly slug: Schema.String;
    }>>;
  }>>;
}>;
type WorkflowListResponse = typeof WorkflowListResponse.Type;
declare const WorkflowGetResponse: Schema.Struct<{
  readonly body_markdown: Schema.String;
  readonly id: Schema.String;
  readonly title: Schema.String;
  readonly description: Schema.String;
  readonly category: Schema.String;
  readonly content_hash: Schema.String;
  readonly owner_kind: Schema.Literals<readonly ["system", "workspace"]>;
  readonly workspace_id: Schema.NullOr<Schema.String>;
  readonly updated_by_user: Schema.NullOr<Schema.Struct<{
    readonly id: Schema.String;
    readonly name: Schema.NullOr<Schema.String>;
    readonly email: Schema.NullOr<Schema.String>;
    readonly avatar_url: Schema.NullOr<Schema.String>;
  }>>;
  readonly latest_version_id: Schema.NullOr<Schema.String>;
  readonly version_name: Schema.NullOr<Schema.String>;
  readonly version_number: Schema.NullOr<Schema.Number>;
  readonly version_sequence: Schema.Number;
  readonly last_published_at: Schema.NullOr<Schema.String>;
  readonly last_published_by: Schema.NullOr<Schema.String>;
  readonly created_by: Schema.NullOr<Schema.String>;
  readonly updated_by: Schema.NullOr<Schema.String>;
  readonly created_at: Schema.String;
  readonly updated_at: Schema.String;
  readonly plugin_requirements: Schema.$Array<Schema.Struct<{
    readonly slug: Schema.String;
    readonly kind: Schema.optional<Schema.Literals<readonly ["mcp", "cli", "api"]>>;
    readonly optional: Schema.optional<Schema.Boolean>;
  }>>;
  readonly source_bindings: Schema.$Array<Schema.Struct<{
    readonly slug: Schema.optional<Schema.String>;
    readonly namespace: Schema.optional<Schema.String>;
    readonly source_id: Schema.optional<Schema.String>;
  }>>;
  readonly default_tools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
  readonly or_groups: Schema.$Array<Schema.$Array<Schema.Union<readonly [Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>, Schema.Struct<{
    readonly kind: Schema.Literal<"input">;
    readonly slug: Schema.String;
  }>]>>>;
  readonly optional_tools: Schema.$Array<Schema.Struct<{
    readonly kind: Schema.Literal<"tool">;
    readonly slug: Schema.String;
  }>>;
}>;
type WorkflowGetResponse = typeof WorkflowGetResponse.Type;
interface WorkflowSkillListRow {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly owner_kind: 'system' | 'workspace';
  readonly updated_at: string;
  readonly description: string;
  readonly updated_by: string;
  readonly version: string;
}
interface WorkflowSkillDetail {
  readonly id: string;
  readonly title: string;
  readonly owner: string;
  readonly owner_kind: 'system' | 'workspace';
  readonly updated_at: string | null;
  readonly description: string;
  readonly updated_by: string;
  readonly version: string;
  readonly body_markdown?: string | undefined;
  readonly content_hash: string;
  readonly default_tools: readonly unknown[];
  readonly or_groups: readonly unknown[];
  readonly optional_tools: readonly unknown[];
}
declare function workflowOwnerLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string;
declare function workflowUpdatedByLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string;
declare function workflowVersionLabel(entry: WorkflowListEntryWire | WorkflowGetResponseWire): string;
declare function workflowSkillListRow(entry: WorkflowListEntryWire): WorkflowSkillListRow;
declare function workflowSkillDetail(entry: WorkflowGetResponseWire): WorkflowSkillDetail;
declare function workflowToolRequirementsToon(entry: {
  readonly default_tools: readonly unknown[];
  readonly or_groups: readonly unknown[];
  readonly optional_tools: readonly unknown[];
}): string;
declare function workflowCatalogMap(entries: ReadonlyArray<WorkflowListEntryWire>): Map<string, {
  slug: string;
  content_hash: string;
  owner_kind: "system" | "workspace";
}>;
declare function workflowIsToolSlug(slug: string): boolean;
declare function workflowIsInputSlug(slug: string): boolean;
//#endregion
export { Workflow, WorkflowAddBodySchema, WorkflowAddBodyWire, WorkflowCatalogEntry, WorkflowGetBodySchema, WorkflowGetBodyWire, WorkflowGetResponse, WorkflowGetResponseSchema, WorkflowGetResponseWire, WorkflowId, WorkflowInputSlot, WorkflowListBodySchema, WorkflowListBodyWire, WorkflowListEntrySchema, WorkflowListEntryWire, WorkflowListResponse, WorkflowListResponseSchema, WorkflowListResponseWire, WorkflowOrGroup, WorkflowOwnerKind, WorkflowPluginRequirement, WorkflowRemoveBodySchema, WorkflowRemoveBodyWire, WorkflowSkillDetail, WorkflowSkillListRow, WorkflowSlot, WorkflowSlotKind, WorkflowSourceBinding, WorkflowToolSlot, WorkflowUserSummary, WorkflowUserSummarySchema, WorkflowUserSummaryWire, workflowCatalogMap, workflowIsInputSlug, workflowIsToolSlug, workflowOwnerLabel, workflowSkillDetail, workflowSkillListRow, workflowToolRequirementsToon, workflowUpdatedByLabel, workflowVersionLabel };
//# sourceMappingURL=workflow.d.mts.map