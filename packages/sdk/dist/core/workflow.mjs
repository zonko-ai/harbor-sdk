import { Schema } from "effect";
//#region ../core-effect/src/scalars.ts
const Timestamp = Schema.String;
Schema.NullOr(Timestamp);
const WorkspaceId = Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isUUID());
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/));
Schema.NonEmptyString;
Schema.NonEmptyString;
Schema.String.check(Schema.isPattern(/^[A-Z][A-Z0-9_]*$/));
Schema.String.check(Schema.isPattern(/^[a-z0-9]+(?:_[a-z0-9]+)*$/));
Schema.Record(Schema.String, Schema.Unknown);
//#endregion
//#region ../core-effect/src/workflow.ts
const WorkflowId = Schema.NonEmptyString;
const WorkflowSlotKind = Schema.Literals(["tool", "input"]);
const WorkflowToolSlot = Schema.Struct({
	kind: Schema.Literal("tool"),
	slug: Schema.String
});
const WorkflowInputSlot = Schema.Struct({
	kind: Schema.Literal("input"),
	slug: Schema.String
});
const WorkflowSlot = Schema.Union([WorkflowToolSlot, WorkflowInputSlot]);
const WorkflowOrGroup = Schema.Array(WorkflowSlot);
const Workflow = Schema.Struct({
	id: WorkflowId,
	title: Schema.String,
	description: Schema.String,
	category: Schema.String,
	defaultTools: Schema.Array(WorkflowToolSlot),
	orGroups: Schema.Array(WorkflowOrGroup),
	optionalTools: Schema.Array(WorkflowToolSlot),
	bodyMarkdown: Schema.String,
	contentHash: Schema.String
});
const WorkflowOwnerKind = Schema.Literals(["system", "workspace"]);
const WorkflowUserSummary = Schema.Struct({
	id: Schema.String,
	name: Schema.NullOr(Schema.String),
	email: Schema.NullOr(Schema.String),
	avatar_url: Schema.NullOr(Schema.String)
});
const WorkflowUserSummarySchema = Schema.Struct({
	id: Schema.String,
	name: Schema.optional(Schema.NullOr(Schema.String)),
	email: Schema.optional(Schema.NullOr(Schema.String)),
	avatar_url: Schema.optional(Schema.NullOr(Schema.String))
});
const WorkflowPluginRequirement = Schema.Struct({
	slug: Schema.String,
	kind: Schema.optional(Schema.Literals([
		"mcp",
		"cli",
		"api"
	])),
	optional: Schema.optional(Schema.Boolean)
});
const WorkflowSourceBinding = Schema.Struct({
	slug: Schema.optional(Schema.String),
	namespace: Schema.optional(Schema.String),
	source_id: Schema.optional(Schema.String)
});
const WorkflowEntryShape = {
	id: Schema.String,
	title: Schema.String,
	description: Schema.String,
	category: Schema.optional(Schema.String),
	content_hash: Schema.String,
	owner_kind: WorkflowOwnerKind,
	workspace_id: Schema.NullOr(Schema.String),
	updated_by_user: Schema.NullOr(WorkflowUserSummarySchema),
	version_name: Schema.NullOr(Schema.String),
	version_number: Schema.NullOr(Schema.Number),
	updated_at: Schema.optional(Schema.String),
	default_tools: Schema.Array(Schema.Unknown),
	or_groups: Schema.Array(Schema.Unknown),
	optional_tools: Schema.Array(Schema.Unknown)
};
const WorkflowListEntrySchema = Schema.Struct(WorkflowEntryShape);
const WorkflowListResponseSchema = Schema.Struct({ workflows: Schema.Array(WorkflowListEntrySchema) });
const WorkflowGetResponseSchema = Schema.Struct({
	...WorkflowEntryShape,
	body_markdown: Schema.optional(Schema.String)
});
const WorkflowListBodySchema = Schema.Struct({ workspace_id: WorkspaceId });
const WorkflowGetBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowAddBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowRemoveBodySchema = Schema.Struct({
	workspace_id: WorkspaceId,
	workflow_id: WorkflowId
});
const WorkflowCatalogEntry = Schema.Struct({
	id: Schema.String,
	title: Schema.String,
	description: Schema.String,
	category: Schema.String,
	content_hash: Schema.String,
	owner_kind: WorkflowOwnerKind,
	workspace_id: Schema.NullOr(Schema.String),
	updated_by_user: Schema.NullOr(WorkflowUserSummary),
	latest_version_id: Schema.NullOr(Schema.String),
	version_name: Schema.NullOr(Schema.String),
	version_number: Schema.NullOr(Schema.Number),
	version_sequence: Schema.Number,
	last_published_at: Schema.NullOr(Schema.String),
	last_published_by: Schema.NullOr(Schema.String),
	created_by: Schema.NullOr(Schema.String),
	updated_by: Schema.NullOr(Schema.String),
	created_at: Schema.String,
	updated_at: Schema.String,
	plugin_requirements: Schema.Array(WorkflowPluginRequirement),
	source_bindings: Schema.Array(WorkflowSourceBinding),
	default_tools: Schema.Array(WorkflowToolSlot),
	or_groups: Schema.Array(WorkflowOrGroup),
	optional_tools: Schema.Array(WorkflowToolSlot)
});
const WorkflowListResponse = Schema.Struct({ workflows: Schema.Array(WorkflowCatalogEntry) });
const WorkflowGetResponse = Schema.Struct({
	...WorkflowCatalogEntry.fields,
	body_markdown: Schema.String
});
function workflowOwnerLabel(entry) {
	return entry.owner_kind === "system" ? "Harbor" : "Workspace";
}
function workflowUpdatedByLabel(entry) {
	return entry.updated_by_user?.name ?? entry.updated_by_user?.email ?? "-";
}
function workflowVersionLabel(entry) {
	return entry.version_name ?? (entry.version_number ? `v${entry.version_number}` : "-");
}
function workflowSkillListRow(entry) {
	return {
		id: entry.id,
		title: entry.title,
		owner: workflowOwnerLabel(entry),
		owner_kind: entry.owner_kind,
		updated_at: entry.updated_at ?? "-",
		description: entry.description,
		updated_by: workflowUpdatedByLabel(entry),
		version: workflowVersionLabel(entry)
	};
}
function workflowSkillDetail(entry) {
	return {
		id: entry.id,
		title: entry.title,
		description: entry.description,
		owner: workflowOwnerLabel(entry),
		owner_kind: entry.owner_kind,
		updated_by: workflowUpdatedByLabel(entry),
		updated_at: entry.updated_at ?? null,
		version: workflowVersionLabel(entry),
		body_markdown: entry.body_markdown,
		content_hash: entry.content_hash,
		default_tools: entry.default_tools,
		or_groups: entry.or_groups,
		optional_tools: entry.optional_tools
	};
}
function workflowToolSlotName(value) {
	if (typeof value === "string") return value;
	if (typeof value !== "object" || value === null) return String(value);
	const record = value;
	const slug = record.slug ?? record.id ?? record.name;
	const kind = record.kind;
	if (typeof slug === "string" && typeof kind === "string" && kind !== "tool") return `${kind}:${slug}`;
	if (typeof slug === "string") return slug;
	return JSON.stringify(value);
}
function workflowToolRequirementsToon(entry) {
	const lines = [];
	if (entry.default_tools.length > 0) {
		lines.push("required_tools:");
		for (const tool of entry.default_tools) lines.push(`  - ${workflowToolSlotName(tool)}`);
	}
	if (entry.or_groups.length > 0) {
		lines.push("one_of_groups:");
		entry.or_groups.forEach((group, index) => {
			const choices = Array.isArray(group) ? group.map(workflowToolSlotName).join(" | ") : workflowToolSlotName(group);
			lines.push(`  ${index + 1}: ${choices}`);
		});
	}
	if (entry.optional_tools.length > 0) {
		lines.push("optional_tools:");
		for (const tool of entry.optional_tools) lines.push(`  - ${workflowToolSlotName(tool)}`);
	}
	return lines.join("\n");
}
function workflowCatalogMap(entries) {
	return new Map(entries.map((entry) => [entry.id, {
		slug: entry.id,
		content_hash: entry.content_hash,
		owner_kind: entry.owner_kind
	}]));
}
function workflowIsToolSlug(slug) {
	return slug.endsWith("-mcp") || slug.endsWith("-cli") || slug.endsWith("-api");
}
function workflowIsInputSlug(slug) {
	return !workflowIsToolSlug(slug);
}
//#endregion
export { Workflow, WorkflowAddBodySchema, WorkflowCatalogEntry, WorkflowGetBodySchema, WorkflowGetResponse, WorkflowGetResponseSchema, WorkflowId, WorkflowInputSlot, WorkflowListBodySchema, WorkflowListEntrySchema, WorkflowListResponse, WorkflowListResponseSchema, WorkflowOrGroup, WorkflowOwnerKind, WorkflowPluginRequirement, WorkflowRemoveBodySchema, WorkflowSlot, WorkflowSlotKind, WorkflowSourceBinding, WorkflowToolSlot, WorkflowUserSummary, WorkflowUserSummarySchema, workflowCatalogMap, workflowIsInputSlug, workflowIsToolSlug, workflowOwnerLabel, workflowSkillDetail, workflowSkillListRow, workflowToolRequirementsToon, workflowUpdatedByLabel, workflowVersionLabel };

//# sourceMappingURL=workflow.mjs.map