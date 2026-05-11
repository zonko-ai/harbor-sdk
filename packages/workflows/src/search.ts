// Catalog access. After the workflow primitive moved to the workflows D1
// table (apps/api), this package exists only as the build-time source of
// truth that POST /internal/workflows/seed loads on deploy. Runtime
// search/recommendation logic now lives in apps/web/modules/onboarding/
// utils/workflow-search.ts and operates on data fetched from the API.

import { WORKFLOWS, WORKFLOW_BY_ID } from "./manifest.generated"
import type { Workflow } from "./types"

export function listWorkflows(): ReadonlyArray<Workflow> {
  return WORKFLOWS
}

export function getWorkflow(id: string): Workflow | undefined {
  return WORKFLOW_BY_ID[id]
}

export function isToolSlug(slug: string): boolean {
  return slug.endsWith("-mcp") || slug.endsWith("-cli") || slug.endsWith("-api")
}

export function isInputSlug(slug: string): boolean {
  return !isToolSlug(slug)
}
