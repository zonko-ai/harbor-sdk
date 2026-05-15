# Harbor SDK public package boundary

Status: draft

This boundary defines the npm-facing shape for Harbor SDK refinement. It is a
product boundary, not a complete implementation checklist.

## Public subpaths

```text
@hrbr/sdk
  Promise-first default surface for normal application developers.

@hrbr/sdk/local
  Local MCP/plugin runtime. Owns local source setup, OAuth, encrypted
  credentials, SQLite state, tool discovery, search, invocation, registry
  actions, write gating, and local exec.

@hrbr/sdk/core
  Advanced primitive composition surface. Exposes source, credential, policy,
  tool, run, workflow, Orbit, client, and workspace primitives without
  experimental runtime adapters.

@hrbr/sdk/testing
  Fixture and test helpers only. Safe for examples and SDK consumer tests, not
  for production runtime imports.
```

## Internal or experimental packages

The workspace can keep internal packages for implementation detail, but they
should not be the first public npm story.

```text
@hrbr/runtime-local
  Implementation package behind @hrbr/sdk/local.

@hrbr/runtime-cloudflare
  Private/coming-soon until it no longer leaks into runtime-local and can run a
  real Cloudflare-hosted registry/runtime flow.

@hrbr/registry-catalog
@hrbr/harbor-control
@hrbr/plugin-identifiers
  Internal support packages unless a later task promotes a stable public
  contract.
```

## Harbor Cloud SDK relationship

Harbor main PR `zonko-ai/harbor#364` describes a different SDK boundary:
local auth, control client, identity, and Harbor Cloud exec for Coast/Reef/Beach
style integrations.

That boundary should not be merged into the local plugin/runtime SDK by default.
Use separate naming unless a later product decision says otherwise:

```text
@hrbr/sdk/local
  Local plugin runtime and local MCP execution.

@hrbr/platform or @hrbr/cloud
  Harbor Cloud auth, control client, identity, and cloud exec.
```

If both ship publicly, docs must explain when to use each package.

## Boundary rules

- Local runtime and Cloudflare runtime sit horizontally; neither should import
  the other.
- Examples should import from `@hrbr/sdk/local` or `@hrbr/sdk/testing`, not deep
  implementation package paths.
- Cloudflare support stays unchecked/coming-soon in docs until implemented.
- The default public path should be Promise-first and framework-neutral.
- AI SDK and Flue examples are both valid consumers; Harbor SDK owns source,
  auth, registry, and runtime behavior.
- Testing helpers must stay behind `@hrbr/sdk/testing`.

