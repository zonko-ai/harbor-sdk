# @hrbr/sdk

Composite Harbor system SDK facade.

This package is the internal convergence point for Harbor-owned building blocks:
runtime contracts, providers, platform adapters, inspect helpers, plugin
schemas, registry helpers, protocol artifacts, and core control-plane
contracts.

It is not the public application client. App builders should use @hrbr/client.
This package is for Harbor system surfaces that need a stable single import
surface while the underlying package boundaries stay independently testable.

## Surfaces

- @hrbr/sdk/core: core control-plane contracts.
- @hrbr/sdk/core/\*: direct core subpath facades such as
  @hrbr/sdk/core/trigger, @hrbr/sdk/core/plugin, and @hrbr/sdk/core/run.
- @hrbr/sdk/orbit and @hrbr/sdk/orbit/\*: Orbit contracts for jobs, apps,
  storage, DB, cache, usage, and related system surfaces.
- @hrbr/sdk/runtime: runtime contracts, planner, engine, state, artifacts,
  providers, adapter, and telemetry namespaces.
- @hrbr/sdk/inspect: inspect-source wrapping, worker source generation, global
  shadowing checks, and inspect-result normalization helpers.
- @hrbr/sdk/platform: Cloudflare and local platform adapter namespaces.
- @hrbr/sdk/plugins: plugin, policy, and provider-override namespaces.
- @hrbr/sdk/registry: registry, catalog, and registry-catalog namespaces.
- @hrbr/sdk/protocol: protocol/OpenAPI/codegen namespaces.
- @hrbr/sdk/agents: agent package namespace.

Root exports are namespaced on purpose. Subpath exports preserve the existing
leaf-package module shape so consumers can migrate from `@hrbr/core/trigger` to
`@hrbr/sdk/core/trigger` without broad call-site rewrites.

## Release Artifacts

This directory is the generated, publish-shaped `@hrbr/sdk` package. The
current release lane uploads `hrbr-sdk-<version>.tgz` to the matching GitHub
release. Registry publication is intentionally separate and is not part of the
current flow.

Before release, run the repository smoke and pack checks:

```bash
bun run smoke
bun run pack:dry-run
```

## Boundary

- Keep @hrbr/client as the public SDK for external apps.
- Keep @hrbr/sdk as the internal composite SDK for Harbor system code.
- Do not move authz, workspace membership, source grants, or route behavior into
  this facade.
- Do not use this package to publish low-level type-only packages as public npm
  products.

## Validation

    bun run --cwd packages/sdk/system typecheck

## Examples

See `examples/` for small reference snippets that show root namespace imports,
the inspect namespace, and focused subpath imports.
