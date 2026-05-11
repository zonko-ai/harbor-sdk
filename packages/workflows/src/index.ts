// @hrbr/workflows — build-time catalog parsed from
// /workflows/harbor-skill-workflow/. Loaded once by
// POST /internal/workflows/seed (apps/api) into the `workflows` D1
// table. Every other consumer (lighthouse `workflow` tool, `hrbr
// workflow get` CLI, web onboarding) reads from the table via the
// API — never from this manifest.

export type {
  Workflow,
  WorkflowCatalogEntry,
  WorkflowGetResponse,
  WorkflowListResponse,
  WorkflowOwnerKind,
  WorkflowPluginRequirement,
  WorkflowRequestStatus,
  WorkflowScope,
  WorkflowSourceBinding,
  WorkflowSourceVisibility,
  WorkflowUserSummary,
  OrGroup,
  Slot,
  ToolSlot,
  InputSlot,
  SlotKind,
} from "./types"

export {
  WorkflowGetResponseSchema,
  WorkflowListEntrySchema,
  WorkflowListResponseSchema,
  WorkflowUserSummarySchema,
  workflowScopeRequest,
  type WorkflowGetResponseWire,
  type WorkflowListEntryWire,
  type WorkflowListResponseWire,
  type WorkflowScopeFilter,
  type WorkflowUserSummaryWire,
} from "./schemas"

export {
  workflowCatalogMap,
  workflowOwnerLabel,
  workflowSkillDetail,
  workflowSkillListRow,
  workflowToolRequirementsToon,
  workflowUnavailableMessage,
  workflowUpdatedByLabel,
  workflowVersionLabel,
  type WorkflowSkillDetail,
  type WorkflowSkillListRow,
} from "./surface"

export {
  listWorkflows,
  getWorkflow,
  isToolSlug,
  isInputSlug,
} from "./search"

export {
  defineWorkflow,
  runWorkflow,
  type DefineWorkflowInput,
  type RunWorkflowInput,
  type RunWorkflowResult,
  type WorkflowDuration,
  type WorkflowRetryOptions,
  type WorkflowRuntimeContext,
  type WorkflowStepExecutionContext,
  type WorkflowStepHandler,
  type WorkflowStepBackend,
  type WorkflowStepDoOptions,
  type WorkflowStepRuntime,
  type WorkflowToolCaller,
  type WorkflowWaitForEventOptions,
} from "./runtime"
