import type { HarborLocalJsonSchema } from "./jobs-apps"
import type { HarborLocalToolIndexRecord } from "./tool-search"
import type { HarborLocalWorkflowDefinition } from "./workflows"

export interface HarborLocalPackageOwner {
  readonly name: string
  readonly email?: string | undefined
  readonly url?: string | undefined
}

export interface HarborLocalPackageSourceMetadata {
  readonly kind: "git" | "local"
  readonly path: string
  readonly entrypoint?: string | undefined
}

export interface HarborLocalPackageToolMetadata {
  readonly namespace: string
  readonly name: string
  readonly displayName: string
  readonly description?: string | undefined
  readonly inputSchema?: HarborLocalJsonSchema | undefined
  readonly outputSchema?: HarborLocalJsonSchema | undefined
}

export interface HarborLocalPackageAuthRequirement {
  readonly required: boolean
  readonly slots: readonly string[]
}

export interface HarborLocalPackageDocs {
  readonly readme: string
  readonly examples?: readonly string[] | undefined
}

export interface HarborLocalPackageCompatibility {
  readonly sdk: string
  readonly runtimeLocal?: string | undefined
  readonly runtimeCloudflare?: string | undefined
}

export interface HarborLocalPackageManifest {
  readonly manifestVersion: 1
  readonly kind: "plugin" | "workflow"
  readonly name: string
  readonly version: string
  readonly owner: HarborLocalPackageOwner
  readonly maintainers: readonly HarborLocalPackageOwner[]
  readonly source: HarborLocalPackageSourceMetadata
  readonly tools?: readonly HarborLocalPackageToolMetadata[] | undefined
  readonly workflow?: Pick<
    HarborLocalWorkflowDefinition,
    "id" | "title" | "description" | "requiredTools" | "requiredSources" | "inputSchema" | "outputSchema"
  > | undefined
  readonly auth?: HarborLocalPackageAuthRequirement | undefined
  readonly scopes: readonly string[]
  readonly policies: readonly string[]
  readonly docs: HarborLocalPackageDocs
  readonly tests: readonly string[]
  readonly compatibility: HarborLocalPackageCompatibility
  readonly changelog: readonly string[]
}

export interface HarborLocalPackageValidationResult {
  readonly ok: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
}

const PACKAGE_NAME_PATTERN = /^[a-z0-9]+(?:[-_./][a-z0-9]+)*$/
const SEMVERISH_PATTERN = /^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/

export function validateHarborLocalPackageManifest(
  manifest: HarborLocalPackageManifest
): HarborLocalPackageValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  if (!PACKAGE_NAME_PATTERN.test(manifest.name)) errors.push("name must be a portable package slug")
  if (!SEMVERISH_PATTERN.test(manifest.version)) errors.push("version must be semver-like")
  if (!manifest.owner.name) errors.push("owner.name is required")
  if (manifest.maintainers.length === 0) warnings.push("at least one maintainer is recommended")
  if (!manifest.docs.readme.trim()) errors.push("docs.readme is required")
  if (manifest.tests.length === 0) warnings.push("at least one validation test command is recommended")
  if (manifest.changelog.length === 0) errors.push("changelog must include at least one entry")
  if (manifest.kind === "plugin" && (manifest.tools?.length ?? 0) === 0) {
    errors.push("plugin packages must define at least one tool")
  }
  for (const [index, tool] of (manifest.tools ?? []).entries()) {
    if (!tool.namespace) errors.push(`tools[${index}].namespace is required`)
    if (!tool.name) errors.push(`tools[${index}].name is required`)
    if (!tool.displayName) warnings.push(`tools[${index}].displayName is recommended`)
  }
  if (manifest.auth) {
    for (const slot of manifest.auth.slots) {
      if (/secret|token|key/i.test(slot) && slot.includes("=")) {
        errors.push("auth slots must name required secrets, not include secret values")
      }
    }
  }
  return { ok: errors.length === 0, errors, warnings }
}

export function generateHarborLocalPluginPackageManifest(input: {
  readonly name: string
  readonly version: string
  readonly owner: HarborLocalPackageOwner
  readonly source: HarborLocalPackageSourceMetadata
  readonly tools: readonly HarborLocalToolIndexRecord[]
  readonly docs: HarborLocalPackageDocs
  readonly auth?: HarborLocalPackageAuthRequirement | undefined
  readonly scopes?: readonly string[] | undefined
  readonly policies?: readonly string[] | undefined
  readonly tests?: readonly string[] | undefined
  readonly compatibility?: Partial<HarborLocalPackageCompatibility> | undefined
  readonly changelog: readonly string[]
}): HarborLocalPackageManifest {
  return {
    manifestVersion: 1,
    kind: "plugin",
    name: input.name,
    version: input.version,
    owner: input.owner,
    maintainers: [input.owner],
    source: input.source,
    tools: input.tools.map((tool) => ({
      namespace: tool.namespace,
      name: tool.name,
      displayName: tool.displayName,
      ...(tool.description !== undefined ? { description: tool.description } : {}),
      ...(tool.inputSchema !== undefined ? { inputSchema: tool.inputSchema as HarborLocalJsonSchema } : {}),
      ...(tool.outputSchema !== undefined ? { outputSchema: tool.outputSchema as HarborLocalJsonSchema } : {}),
    })),
    ...(input.auth !== undefined ? { auth: input.auth } : {}),
    scopes: input.scopes ?? [],
    policies: input.policies ?? [],
    docs: input.docs,
    tests: input.tests ?? [],
    compatibility: {
      sdk: input.compatibility?.sdk ?? ">=0.0.0",
      ...(input.compatibility?.runtimeLocal !== undefined ? { runtimeLocal: input.compatibility.runtimeLocal } : {}),
      ...(input.compatibility?.runtimeCloudflare !== undefined ? { runtimeCloudflare: input.compatibility.runtimeCloudflare } : {}),
    },
    changelog: input.changelog,
  }
}

export function generateHarborLocalWorkflowPackageManifest(input: {
  readonly name: string
  readonly version: string
  readonly owner: HarborLocalPackageOwner
  readonly source: HarborLocalPackageSourceMetadata
  readonly workflow: HarborLocalWorkflowDefinition
  readonly docs: HarborLocalPackageDocs
  readonly scopes?: readonly string[] | undefined
  readonly policies?: readonly string[] | undefined
  readonly tests?: readonly string[] | undefined
  readonly compatibility?: Partial<HarborLocalPackageCompatibility> | undefined
  readonly changelog: readonly string[]
}): HarborLocalPackageManifest {
  return {
    manifestVersion: 1,
    kind: "workflow",
    name: input.name,
    version: input.version,
    owner: input.owner,
    maintainers: [input.owner],
    source: input.source,
    workflow: {
      id: input.workflow.id,
      title: input.workflow.title,
      ...(input.workflow.description !== undefined ? { description: input.workflow.description } : {}),
      ...(input.workflow.requiredTools !== undefined ? { requiredTools: input.workflow.requiredTools } : {}),
      ...(input.workflow.requiredSources !== undefined ? { requiredSources: input.workflow.requiredSources } : {}),
      ...(input.workflow.inputSchema !== undefined ? { inputSchema: input.workflow.inputSchema } : {}),
      ...(input.workflow.outputSchema !== undefined ? { outputSchema: input.workflow.outputSchema } : {}),
    },
    scopes: input.scopes ?? [],
    policies: input.policies ?? [],
    docs: input.docs,
    tests: input.tests ?? [],
    compatibility: {
      sdk: input.compatibility?.sdk ?? ">=0.0.0",
      ...(input.compatibility?.runtimeLocal !== undefined ? { runtimeLocal: input.compatibility.runtimeLocal } : {}),
      ...(input.compatibility?.runtimeCloudflare !== undefined ? { runtimeCloudflare: input.compatibility.runtimeCloudflare } : {}),
    },
    changelog: input.changelog,
  }
}
