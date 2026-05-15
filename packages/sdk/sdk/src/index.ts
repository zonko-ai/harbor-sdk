/**
 * Public Harbor SDK entrypoint.
 *
 * This package is intentionally an aggregator over stable SDK primitives. It
 * should not grow Harbor SaaS internals or runtime implementation details.
 */

export * as ai from "@hrbr/ai"
export * as client from "@hrbr/client"
export * as common from "@hrbr/common"
export * as orbit from "@hrbr/orbit"
export * as plugins from "@hrbr/plugins"
export * as runs from "@hrbr/runs"
export * as runtimeLocal from "@hrbr/runtime-local"
export * as sourceCore from "@hrbr/source-core"
export * as sourceCredentials from "@hrbr/source-credentials"
export * as sourceMcp from "@hrbr/source-mcp"
export * as sourcePolicy from "@hrbr/source-policy"
export * as sources from "@hrbr/sources"
export * as tools from "@hrbr/tools"
export * as workflows from "@hrbr/workflows"
export * as workspaces from "@hrbr/workspaces"

export { createHarborClient } from "@hrbr/client"
export { createMemoryOrbitRuntime } from "@hrbr/orbit/runtime"
export { createMemoryTraceWriter } from "@hrbr/runs"
export { defineSourceAdapter } from "@hrbr/source-core"
export { createCredentialResolver, createMemoryCredentialStore } from "@hrbr/source-credentials"
export { createToolPolicy } from "@hrbr/source-policy"
export { createMcpHttpSourceAdapter } from "@hrbr/source-mcp"
export { createToolRegistry } from "@hrbr/tools"
export { defineWorkflow, runWorkflow } from "@hrbr/workflows"
