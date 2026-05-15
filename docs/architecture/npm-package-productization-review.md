# Harbor SDK npm productization review

This review looks at the repository from the point of view of publishing a
developer-facing npm SDK. It uses `../executor` as the reference for package
shape, plugin ergonomics, MCP lifecycle, build outputs, and public/private API
boundaries.

## Current verdict

Harbor SDK has the right raw ingredients, but it is not yet shaped like a
publishable npm product.

The strongest parts are the primitive packages:

- `@hrbr/source-core` defines a small source adapter contract.
- `@hrbr/source-mcp` can list, describe, and invoke HTTP MCP tools.
- `@hrbr/source-auth` contains reusable OAuth PKCE, dynamic client
registration, token exchange, and refresh helpers.
- `@hrbr/runtime-local` now owns local SQLite state, encrypted credentials, MCP
OAuth, discovery, search, invocation, and local exec.
- `@hrbr/tools`, `@hrbr/runs`, `@hrbr/workflows`, and `@hrbr/orbit` provide the
registry, tracing, workflow, and runtime primitives.

The weak parts are product shape:

- All SDK packages are still marked `private: true`.
- Most package exports point at `src/*.ts` instead of stable `dist` artifacts.
- There is no shared package build system like `tsup` or a release pipeline.
- The public API is spread across many internal package names instead of one
obvious beginner path and a few expert subpaths.
- Runtime package names expose internal architecture more than user intent.
- `runtime-cloudflare` is a thin adapter stub, currently leaks into
  `runtime-local`, and should be removed from the public/local runtime surface.
- Docs are still mostly architecture notes and generated API docs, not a
Fumadocs product docs site with task-oriented flows.
- Examples are improving, but several still exist as historical/internal demos
and should be pruned or reframed before publication.

## Current codebase flow

```text
Developer app / example
  |
  | imports one or more @hrbr/* packages
  v
@hrbr/sdk
  |
  | aggregate re-export over many primitive packages
  v
Source layer
  @hrbr/source-core
    - SourceAdapter
    - SourceToolDefinition
  @hrbr/source-mcp
    - HTTP/SSE/streamable MCP adapter
  @hrbr/source-auth
    - OAuth PKCE, dynamic registration, token exchange, refresh
  @hrbr/source-credentials
    - credential store and resolver primitives
  @hrbr/source-policy
    - allow, block, approval policy
  |
  v
Tool/runtime layer
  @hrbr/tools
    - registry, search, describe, schema, invoke
  @hrbr/runtime-local
    - .harbor/harbor.sqlite
    - .harbor/credentials.enc
    - MCP source install and OAuth
    - tool indexing and search
    - tool invocation
    - local exec bridge over QuickJS/emscripten wasm
  @hrbr/runtime-cloudflare
    - current Cloudflare plan/apply/status adapter stub
    - should be a sibling adapter, not a dependency of runtime-local
  |
  v
Higher-level primitives
  @hrbr/runs
    - run/span trace model
  @hrbr/workflows
    - typed workflow helpers
  @hrbr/orbit
    - storage/cache/db/ai/jobs/apps/socket contracts
  |
  v
Hosted/client layer
  @hrbr/client
  @hrbr/sources
  @hrbr/workspaces
  @hrbr/harbor-control
```

The intended runtime flow for local MCP now looks like:

```text
main.ts
  -> createHarborLocalRuntime({ projectRoot, env })
  -> sources.ensureMcpSources([{ endpoint }], { connect, refresh })
  -> local OAuth callback if needed
  -> encrypted grant in .harbor/credentials.enc
  -> discovered tools in .harbor/harbor.sqlite
  -> tools.search / tools.schema / tools.invoke
  -> optional exec.run(code), where code calls namespace.toolName(input)
```

That is the right direction. The problem is that this flow lives under
`@hrbr/runtime-local/promise`, while the main `@hrbr/sdk` package still reads
like an internal aggregate rather than the obvious product entrypoint.

## Executor comparison

Executor has a clearer product package shape:

```text
@executor-js/sdk
  .        -> Promise-first public API
  /core    -> Effect/core API
  /client  -> hosted/client helpers
  /testing -> test helpers

@executor-js/plugin-mcp
  .        -> Promise-first plugin API
  /core    -> lower-level SDK API
  /client  -> React/client UI integration
  /testing -> fixtures
```

Executor's MCP package is especially useful as a reference:

- `src/sdk/discover.ts` owns MCP discovery as SDK logic, not example logic.
- `src/sdk/connection.ts` owns transport creation, connection shape, and
Cloudflare-safe dynamic stdio import.
- `src/sdk/plugin.ts` owns source config, auth config, credential binding,
source lifecycle, tool binding, refresh, invocation, and extension methods.
- `src/sdk/*test.ts` covers connection pooling, cross-user isolation,
per-user auth isolation, probe shape, elicitation, and plugin behavior.
- `src/promise.ts` exposes a small Promise surface for normal users.
- `publishConfig.exports` points npm users at built `dist` files while local
workspace exports can still point at source files.

Harbor should copy the packaging and layering pattern, not the exact Effect
implementation.

## What should change before npm publication

### 1. Define the public npm surface

Recommended public packages:

- `@hrbr/sdk`: Promise-first package for the common path.
- `@hrbr/sdk/core`: lower-level primitives for advanced users.
- `@hrbr/sdk/local`: local runtime, MCP install, OAuth, encrypted credential
storage, tool search, invocation, and exec.
- `@hrbr/sdk/cloudflare`: Cloudflare adapter once it is real.
- `@hrbr/sdk/testing`: fixtures, local MCP test server, mock OAuth provider,
and in-memory helpers.

Keep internal packages private unless they are truly meant to be imported
directly. The current many-package map is useful internally, but it is too
fragmented as the first npm story.

### 2. Add real build and publish configuration

Every publishable package needs:

- `version`, `license`, `repository`, `homepage`, and `bugs`.
- `files: ["dist"]`.
- `publishConfig.access: "public"`.
- `exports` for local development and `publishConfig.exports` for npm builds.
- generated `.d.ts` files.
- a consistent build command, probably `tsup` plus declaration emit.
- package-level `README.md` and `CHANGELOG.md`.

Current risk: most packages export `./src/index.ts`. That works in Bun
workspaces, but it is not a stable npm contract for Node, bundlers, and
non-TypeScript consumers.

### 3. Rename and restructure the public API around user intent

The current structure is accurate but too internal:

- `runtime-local`
- `source-mcp`
- `source-auth`
- `source-credentials`
- `registry-catalog`
- `harbor-control`

Users should see concepts like:

- create a local Harbor runtime
- install/connect an MCP source
- search tools
- invoke tools
- run sandboxed code
- use Cloudflare as a runtime adapter
- write a plugin

The implementation can keep internal packages, but docs and exports should
present a smaller facade.

### 4. Move SDK-owned lifecycle out of examples

Examples should be close to 50-100 LOC and should not know how OAuth, discovery,
credential storage, SQLite migrations, or MCP tool indexing work.

SDK should own:

- local `.harbor` initialization and migrations
- source existence checks
- OAuth status checks
- browser/auth URL flow
- token refresh and reconnect status
- encrypted credential reads/writes
- MCP discovery
- tool indexing
- lexical/BM25 search over saved tools
- invocation with just-in-time credential resolution
- safe write-tool gating
- local exec namespace resolution

Examples should only declare:

- MCP URLs
- project root
- environment
- model/provider choice when using an AI agent
- user prompt
- final output shape

### 5. Finish MCP plugin correctness

Harbor's MCP path is close but still needs Executor-style completeness:

- clear `discoverTools` equivalent as a public SDK function
- endpoint probing and wrong-shape diagnostics
- streamable HTTP vs SSE transport abstraction
- stdio support, disabled by default and dynamically imported for Node-only
contexts
- connection pooling and invalidation
- scope/user credential isolation tests
- OAuth protected-resource metadata discovery
- refresh-token retry when access tokens are invalid
- source persistence even when auth is not complete
- durable tool bindings preserving original MCP tool names
- MCP elicitation routed through host approval/elicitation callbacks
- destructive annotation mapping to write confirmation policy

This should live in SDK packages, not in examples.

### 6. Keep `runtime-cloudflare` private and remove it from the local path

Current `@hrbr/runtime-cloudflare` has:

- resource ref and lock types
- plan/apply/status helpers
- a daemon HTTP adapter
- a simple Orbit binding adapter shape
- mocked tests

It does not yet have:

- real Cloudflare Worker entrypoint helpers
- D1 schema/migration helpers for Harbor local/runtime concepts
- KV/R2/D1/DO/Queue binding implementations aligned to public Orbit
  contracts
- credential/secret storage strategy for Cloudflare Secrets or Workers Secrets
  Store
- durable OAuth grant storage on Cloudflare
- tool registry persistence on D1
- runtime-local parity tests
- wrangler example
- deployment guide
- production security guidance for egress, OAuth callbacks, secrets, and
  tenant isolation

Do not market this as publish-ready. Keep it private and mark Cloudflare support
as coming soon in the repo README/docs until it can run a real
Cloudflare-hosted registry/exec flow.

Also fix the package layering. `runtime-local` currently imports
`@hrbr/runtime-cloudflare` through `src/daemon.ts`; that should not happen.
Local and Cloudflare runtimes sit at the same horizontal level. Shared
provisioning or resource-plan contracts should move into a neutral internal
package, or the Cloudflare daemon routes should move out of `runtime-local`.

Any public example that imports `@hrbr/runtime-cloudflare` should be deleted or
moved to a private/coming-soon area until the adapter is real.

### 7. Replace generated API docs with Fumadocs product docs last

Generated TypeDoc can remain as API reference, but it should not be the main
docs experience.

Fumadocs structure should be task-first:

```text
docs/
  introduction
  quickstart
  concepts/
    runtime
    sources
    tools
    credentials
    auth
    policies
    exec
  guides/
    connect-linear-mcp
    connect-notion-mcp
    build-a-local-tool-registry
    build-an-ai-sdk-agent
    run-local-exec
    write-a-plugin
    cloudflare-coming-soon
  reference/
    sdk
    local-runtime
    mcp
    testing
  examples/
```

Docs must explain what files are created locally:

- `.harbor/harbor.sqlite`
- `.harbor/credentials.enc`
- `.harbor/registry-dev-refs.json`
- runtime manifests and locks

Docs must also state what is safe to commit and what must be ignored.

### 8. Clean examples before publishing

Keep:

- `examples/ai-sdk-tool-registry-agent`
- `examples/ai-sdk-local-exec-agent`
- Flue examples as first-class framework integration examples.
- one minimal custom source example
- one minimal plugin authoring example

Archive or rewrite:

- historical fake Linear/Notion registry examples
- mock Notion flows that can be mistaken for real auth unless clearly labeled
- any Cloudflare runtime example until `runtime-cloudflare` is complete

Examples should import from the final public facade, not from deep internal
implementation packages.

The product story is not "AI SDK first." The product story is that Harbor SDK
can be used from any agent framework or app framework. AI SDK and Flue should
both be represented, with each example proving that the framework owns the
agent/model loop while Harbor SDK owns plugin install, OAuth, credential
storage, tool discovery, search, invocation, and exec.

### 9. Improve testing quality

Current SDK test count is light for a platform SDK. Before publishing, add
tests around product contracts, not only helpers:

- `npm pack` smoke test for every public package
- import tests from a temp Node project
- Bun and Node execution tests
- ESM export map tests
- declaration file tests
- local runtime migration from empty project
- OAuth connect, refresh, invalid token, reconnect paths
- MCP discovery and invoke against fixture server
- live-optional Linear/Notion smoke tests gated by env
- local exec namespace resolution and write-blocking tests
- Cloudflare adapter tests with Miniflare/workerd once implemented

### 10. Stabilize errors and logs

Public SDK users need typed, actionable errors. Several packages still throw
generic `Error`.

Recommended:

- SDK error base class with `code`, `message`, `cause`, and optional safe
diagnostic details.
- stable codes for missing env, auth required, reconnect required, source not
found, tool not found, schema invalid, policy blocked, write confirmation
required, transport failed, token refresh failed, and migration failed.
- logger hooks in the Promise facade so examples can print progress without
hardcoding logging behavior.

### 11. Add package ownership boundaries

Some packages mix product concepts and primitive concepts. For example,
`@hrbr/orbit` includes app/job/UI/rendering concepts alongside runtime storage
and DB contracts. That may be fine internally, but public docs should split:

- runtime primitives
- hosted Harbor SaaS wire contracts
- app/job authoring
- UI rendering helpers

If a package is not ready to be supported publicly, keep it internal and export
only the stable subset through `@hrbr/sdk`.

## Bad practices to fix

- Publishing source files directly through package exports.
- Marking all packages private while examples depend on them as if they are
public.
- Committing generated build artifacts in one package but not having a general
build story.
- Having a large generated `docs/api` setup while the product docs are missing.
- Letting examples own lifecycle responsibilities that should be SDK APIs.
- Mixing old fake/demo examples with real connected-account examples.
- Using internal product words and data-model names as the primary user-facing
package story.
- Generic thrown errors in public flows.
- Cloudflare runtime package name implying completeness before the adapter is
production-ready.
- No `npm pack`/install verification in CI.

## Recommended implementation order

1. Lock the public package surface.
   Decide which imports are supported for npm users and which packages remain
   workspace-internal.
2. Add build/publish infrastructure.
   Add package metadata, `tsup`, declarations, `files`, `publishConfig`, export
   maps, and npm pack smoke tests.
3. Create the Promise-first SDK facade.
   Make the happy path import obvious and stable. Keep lower-level primitives
   available through expert subpaths.
4. Finish local MCP lifecycle as SDK-owned behavior.
   Close gaps in discovery, OAuth refresh, reconnect, durable bindings, search,
   invocation, and exec.
5. Rewrite examples against the facade.
   The AI SDK and Flue examples should both become reference integrations. Each
   example should be small enough that users can understand the SDK by reading
   `main.ts`.
6. Add Fumadocs.
   Build docs around quickstarts, concepts, and guides. Keep generated API docs
   as secondary reference.
7. Remove Cloudflare from the public/local runtime path.
   Keep `runtime-cloudflare` private, remove examples that import it, and mark
   Cloudflare support as an unchecked coming-soon item in the README/docs.
8. Add release-quality CI.
   Typecheck, tests, pack, temp-project imports, docs build, and selected e2e
   examples.

## Harbor main PR #364 comparison

PR `zonko-ai/harbor#364` adds a Harbor Platform SDK spec in the main Harbor
repo. It is directionally useful, but it should not be treated as the same SDK
surface as this package.

What makes sense:

- Keeping `@zonko-ai/harbor` as a CLI package, not the SDK boundary.
- Extracting local auth, control client, identity, and cloud exec helpers out
  of Coast/Reef-style app code.
- Supporting local agent integrations such as Reef, Beach v2, and `pi-harbor`
  without shelling out to `hrbr`.
- Defining small packages/submodules for auth, control, identity, and exec.
- Keeping remote MCP OAuth and full workspace tool proxying out of that v0
  platform-control SDK.

What needs caution:

- Naming it "the SDK" can conflict with this repo's npm SDK. A clearer product
  distinction is needed: Harbor main PR #364 is a Harbor Cloud platform/client
  SDK; this repo is the local plugin/tool/runtime SDK.
- The proposed `getWorkspaceApiKey(): Promise<string | null>` conflicts with
  the stated security rule that public SDK calls should never return raw API
  keys. Prefer returning an authenticated control client or an opaque
  credential handle.
- The proposed `raw(route: string, ...)` helper conflicts with the non-goal of
  avoiding stringly raw API helpers. If it exists, keep it internal or constrain
  it with typed route constants.
- Fixed `https://api.tryharbor.ai` is right as the default, but the package
  still needs an explicit dev/staging override path for Harbor engineers and
  tests.
- A manual review checklist under `tests/*.md` is useful as documentation, but
  it is not a test. Follow-up implementation should add real package/import
  tests.

Recommendation: follow PR #364 for the Harbor Cloud control-plane client
boundary, but do not merge its scope into this npm SDK. The two surfaces should
compose like this:

```text
@hrbr/sdk/local
  local MCP/plugin runtime, OAuth, SQLite, credentials, search, invoke, exec

@hrbr/platform or @hrbr/cloud
  Harbor Cloud auth, control client, identity, cloud exec
```

If both are published later, docs must state when to use each one.

## Implementation task list

- [ ] Lock package naming and public import paths for `@hrbr/sdk`, `@hrbr/sdk/local`, `@hrbr/sdk/core`, and `@hrbr/sdk/testing`.
- [ ] Decide whether Harbor Cloud control-plane helpers from PR #364 live as `@hrbr/platform`, `@hrbr/cloud`, or a subpath of `@hrbr/sdk`.
- [ ] Remove `@hrbr/runtime-cloudflare` from `@hrbr/runtime-local` dependencies.
- [ ] Move or delete Cloudflare daemon routes from `runtime-local`.
- [ ] Delete or hide public examples that import `@hrbr/runtime-cloudflare`.
- [ ] Remove `runtimeCloudflare` from the public `@hrbr/sdk` aggregate export until Cloudflare is complete.
- [ ] Mark Cloudflare support as unchecked coming soon in the root README and future Fumadocs navigation.
- [ ] Add build/publish infrastructure: `dist`, declarations, export maps, `files`, metadata, and `publishConfig`.
- [ ] Create the Promise-first public facade for local runtime usage.
- [ ] Finish MCP lifecycle gaps: discovery API, endpoint probing, OAuth refresh/reconnect, durable bindings, invocation, search, and write gating.
- [ ] Rewrite AI SDK examples against the public facade.
- [ ] Rewrite Flue examples against the same public facade.
- [ ] Keep examples framework-neutral in docs: AI SDK and Flue are consumers, Harbor SDK owns plugin/runtime behavior.
- [ ] Add typed SDK errors and logger hooks.
- [ ] Add npm pack, temp-project import, Bun/Node, declaration, migration, OAuth, MCP, and local exec tests.
- [ ] Add Fumadocs last, after the public surface and examples stabilize.

## Ideal product-level API direction

The SDK should eventually let a user write something close to:

```ts
import { createHarbor } from "@hrbr/sdk/local"

const harbor = await createHarbor({
  projectRoot: import.meta.dirname,
  env: process.env,
  sources: [
    { type: "mcp", endpoint: "https://mcp.linear.app/mcp" },
    { type: "mcp", endpoint: "https://mcp.notion.com/mcp" },
  ],
})

await harbor.ready()

const tools = await harbor.tools.search("open Linear issues")
const result = await harbor.tools.invoke(tools[0].id, {})

const summary = await harbor.exec.run(`
  const issues = await linear.listIssues({ state: "open" })
  const pages = await notion.search({ query: "Harbor Alpha" })
  return { issues, pages }
`)
```

This does not need to become a SaaS clone. It should be a small local runtime
facade over the primitives already in the repo. The key product bar is that
examples should not need to know the internal storage, OAuth, discovery, or MCP
transport details.
