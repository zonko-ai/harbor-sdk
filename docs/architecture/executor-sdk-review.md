# Executor SDK Review

Reviewed repository: `https://github.com/RhysSullivan/executor`

Reviewed revision: `0b6ca6e` on `main`

This report analyzes Executor as an SDK architecture and compares its shape to
Harbor SDK primitives in this repository. The key takeaway is that Executor is
not just a client library. It is a TypeScript monorepo for building an agent
tool integration platform: plugins declare source types, tools, storage schema,
HTTP routes, credential providers, OAuth behavior, UI bundles, and invocation
handlers; apps compose those packages into local, cloud, CLI, MCP, desktop, and
marketing products.

## 1. README: Scope of the SDK

Executor is an integration layer for AI agents. It gives one catalog of tools
that can be shared by local agents, MCP clients, hosted workers, command-line
flows, and UI applications. Its public SDK center is `@executor-js/sdk`, but the
usable SDK is the larger package graph around it: storage adapters, execution
runtimes, plugins, HTTP APIs, React surfaces, and app hosts.

The repository is a Bun, TypeScript, Effect, Turbo monorepo. The root
`package.json` uses workspaces for `packages/*/*`, `packages/react`, `apps/*`,
and `examples/*`. The packages are grouped by role:

| Area | Packages | Role |
| --- | --- | --- |
| Core SDK | `packages/core/sdk` | Public executor contract: `createExecutor`, plugin specification, source and tool registry APIs, secrets, connections, policies, OAuth, elicitation, schema utilities, hosted HTTP guard, and test helpers. |
| Core API | `packages/core/api` | Effect HTTP API groups for tools, sources, secrets, connections, executions, policies, OAuth, and scope. Also composes plugin-provided HTTP groups into a host API. |
| Storage | `packages/core/storage-core`, `storage-drizzle`, `storage-file`, `storage-postgres` | DB adapter abstraction, typed schema model, in-memory test adapter, Drizzle-backed adapter, SQLite file adapter, Postgres adapter, and blob stores. |
| Execution | `packages/core/execution`, `packages/kernel/*` | Agent code execution layer. `@executor-js/execution` bridges sandboxed code to `executor.tools.invoke`. Kernel packages define `CodeExecutor`, IR, QuickJS runtime, Deno subprocess runtime, and Cloudflare dynamic-worker runtime. |
| Plugins | `packages/plugins/*` | First-party integrations and credential providers: OpenAPI, GraphQL, MCP, Google Discovery, 1Password, WorkOS Vault, keychain, file secrets, and an example plugin. |
| Host | `packages/hosts/mcp` | MCP server host that exposes Executor through MCP and routes code execution to the execution engine. |
| React | `packages/react` | Shared plugin UI, API clients, pages, components, hooks, and styles used by local/cloud products. |
| Apps | `apps/cli`, `apps/local`, `apps/cloud`, `apps/desktop`, `apps/marketing` | Product entry points that compose the SDK into a CLI, local web runtime, hosted Cloudflare app, desktop wrapper, and marketing site. |
| Examples | `examples/promise-sdk`, `examples/all-plugins` | Developer-oriented composition examples, including an Effect-free promise facade and an all-plugin in-memory bootstrap. |

The SDK format is plugin-kernel based. A plugin is declared with
`definePlugin(...)` and may contribute:

- `id` and optional `packageName` for runtime and client-bundle identity.
- A plugin-owned storage schema that is merged into the executor schema at
  startup.
- A typed storage factory that receives only a scoped view of the adapter and a
  plugin-scoped blob store.
- Extension methods exposed as `executor[plugin.id]`.
- Static sources and static tools.
- Dynamic tool invocation through `invokeTool`.
- Source lifecycle hooks for refresh and removal.
- URL detection hooks for add-source onboarding.
- Tool annotations such as approval and elicitation metadata.
- Secret providers, connection providers, OAuth handlers, and usage lookup.
- Optional HTTP API groups, handler layers, extension service tags, and client
  UI config.

That architecture is similar to mature SDK platforms such as OpenTelemetry,
Backstage, and OpenCode-style plugin systems: a small core defines stable
contracts, plugins supply domain capabilities, adapters swap infrastructure,
and apps compose the graph into products. Compared with a simple client SDK,
Executor is much more extensible because it models storage, runtime, auth,
policy, and UI. Compared with a full application framework, it is still
relatively low-level because host apps must supply storage, scopes, auth
boundaries, plugin lists, runtime choices, and product UI.

The central developer experience is straightforward once the package roles are
understood:

```ts
import { createExecutor } from "@executor-js/sdk/promise"
import { mcpPlugin } from "@executor-js/plugin-mcp/promise"
import { openApiPlugin } from "@executor-js/plugin-openapi/promise"
import { graphqlPlugin } from "@executor-js/plugin-graphql/promise"

const executor = await createExecutor({
  scopes: [{ id: "my-app", name: "my-app" }],
  plugins: [mcpPlugin(), openApiPlugin(), graphqlPlugin()],
  onElicitation: "accept-all",
})

await executor.openapi.addSpec({
  spec: "https://petstore3.swagger.io/api/v3/openapi.json",
  namespace: "petstore",
  scope: "my-app",
})

const tools = await executor.tools.list()
const result = await executor.tools.invoke(tools[0].id, {})
```

The Effect-native API is more powerful but has a steeper learning curve. The
promise facade lowers the barrier for application developers. Building on top
of the SDK is easy for source composition, tool invocation, and local examples.
It is harder for production hosts because production usage requires careful
choices around storage migrations, secret providers, hosted outbound networking,
runtime sandboxing, OAuth, organization scoping, and user approval flows.

The SDK is designed to support:

- Agent tool catalogs that unify OpenAPI, GraphQL, MCP, Google Discovery, and
  custom plugin surfaces.
- Local-first developer runtimes with a web UI, CLI, MCP endpoint, and SQLite
  storage.
- Hosted multi-user runtimes on Cloudflare Workers with Postgres-backed
  storage, auth middleware, and dynamic-worker execution.
- Credential and connection management across plugins, including keychain,
  file-based secrets, 1Password, WorkOS Vault, OAuth sessions, and token
  refresh.
- Sandboxed TypeScript or JavaScript execution with tool access through a
  stable `tools.*` bridge.
- Plugin-authored UI and HTTP routes that are folded into host applications.

Its strengths are the clean package boundaries, typed plugin model, unified
tool catalog, explicit source and scope model, adapter-backed storage, strong
Effect error channels, first-party test fixtures, and multiple runtime backends.
The core also contains several good security-minded primitives: scoped adapters,
connection-owned secret rows, deletion guards based on usage lookup, approval
annotations, SSRF-oriented hosted HTTP validation, local server host allowlists,
and default-deny Deno permissions.

Its limitations are mostly productization and complexity tradeoffs:

- Plugin authors need to understand a large `PluginSpec` contract.
- Effect-native development is powerful but unfamiliar to many SDK consumers.
- Storage is abstracted, but schema generation and migrations remain host
  responsibilities.
- Runtime safety depends on which `CodeExecutor` a host selects and how it is
  configured.
- Some host-level security decisions are intentionally outside the SDK, so a
  careless host can weaken the model.
- The SDK exposes low-level seams, not a turnkey app builder.

For Harbor SDK, the useful comparison is that Executor puts a strong public
kernel above plugins and host apps. Harbor already has primitive packages such
as `@hrbr/source-core`, `@hrbr/tools`, `@hrbr/runs`, `@hrbr/workflows`,
`@hrbr/orbit`, and `@hrbr/client`. Executor shows how those could be composed
behind a public plugin and runtime facade without turning the SDK into a
`createHarbor()` clone. The Harbor SDK should keep its current primitive-first
boundary, but it can borrow Executor's clear package layering: public kernel,
source/plugin packages, storage/runtime adapters, host adapters, examples, and
optional UI integrations.

The `apps/harbor-backend` package in this repository is a concrete example of
that approach. It is not exported as a public SDK surface. It composes SDK
primitives into a Harbor-like backend:

- `@hrbr/tools` for registry, search, describe, and invoke behavior.
- `@hrbr/source-core`, `@hrbr/source-mcp`, `@hrbr/source-credentials`, and
  `@hrbr/source-policy` for source adapters, credential resolution, and policy.
- `@hrbr/runs` for run and span trace state.
- `@hrbr/workflows` for workflow catalog and execution.
- `@hrbr/orbit` for apps, jobs, storage, AI, DB, sockets, and runtime contracts.
- `@hrbr/client`, `@hrbr/sources`, and `@hrbr/workspaces` for wire contracts.

That backend demonstrates what Executor's `apps/local` and `apps/cloud` also
demonstrate: the SDK should make the platform rebuildable internally by
composition, while public docs should teach developers to use the primitives for
their own runtimes rather than presenting the complete SaaS as a scaffold.

## 2. Security Flaws

| Severity | Area | Affected files/modules | Issue | Recommended fix |
| --- | --- | --- | --- | --- |
| High | Local server CSRF and local-network exposure | `apps/local/src/serve.ts` | The local app is unauthenticated by default on loopback. It checks Host and requires auth only when binding to a non-loopback host, but state-changing API and MCP routes can still be reached from a browser on the same machine unless every sensitive route enforces additional origin, token, or content-type checks. A malicious website can attempt requests to `http://127.0.0.1:4788` and may be able to trigger local actions if CORS, form-compatible requests, or preflight behavior allow it. | Require a randomly generated local bearer token by default, even on loopback, or enforce strict Origin/Sec-Fetch-Site checks for browser-originated requests. Treat local agent servers as privileged control planes, not as public localhost pages. |
| High | Sandboxed code execution | `packages/kernel/runtime-dynamic-worker`, `runtime-deno-subprocess`, `runtime-quickjs`, `packages/core/execution` | The SDK intentionally executes user or agent-supplied code. QuickJS disables `fetch` and sets memory, stack, and timeout limits. Deno denies permissions by default. Dynamic Worker defaults outbound access to `null`. These are good defaults, but the API lets hosts opt into network, filesystem, env, subprocess, FFI, extra modules, or inherited worker networking. A host misconfiguration can turn tool execution into arbitrary code execution with network or local system access. | Keep default-deny runtime policies in production templates. Add explicit "dangerous" naming for all permission-widening options. Emit startup warnings or fail closed when hosted/cloud code execution inherits network or filesystem capability unintentionally. Add a runtime capability audit endpoint/test helper. |
| High | SSRF and outbound URL validation gaps | `packages/core/sdk/src/hosted-http-client.ts`, plugins that call user-provided endpoints | The hosted HTTP client blocks localhost, private IPv4/IPv6, metadata hostnames, and cross-origin redirects, but it validates only the URL hostname before fetch. It does not perform DNS resolution and IP-range validation after resolution, so DNS rebinding or public hostnames resolving to private addresses can bypass hostname-based checks. | Resolve hostnames through a controlled resolver before outbound fetch in hosted environments, reject private/link-local/metadata IPs after DNS resolution, and re-check every redirect target. For Cloudflare Workers, use platform controls or a dedicated egress proxy that enforces resolved-IP policy. |
| Medium | Raw SQL and migration-time dynamic SQL | `apps/local/src/server/migrate-connections.ts`, `apps/local/src/server/db-upgrade.ts`, `packages/core/storage-drizzle/src/adapter.ts` | Most application queries go through Drizzle or prepared statements, but migration code still contains raw SQL strings. One example builds `PRAGMA table_info('${table.replaceAll("'", "''")}')`; another builds `SELECT ${selectCols} FROM openapi_source`. These values are controlled by code paths today, not user input, but this normalizes raw SQL patterns in a sensitive codebase and can become unsafe when reused. The storage adapter also uses `sql.raw(stmt)` for transaction control. | Keep raw SQL restricted to one-shot migrations and transaction control only. Add a lint rule or helper that forbids ad hoc SQL string interpolation outside approved migration files. Use identifier whitelists for table and column names instead of escaping. Document why `sql.raw("BEGIN")` is allowed only for fixed statements. |
| Medium | Plugin HTTP route trust boundary | `packages/core/sdk/src/plugin.ts`, `packages/core/api/src/plugin-routes.ts`, plugin `api` packages | Plugins can contribute HTTP API groups and handler layers that hosts mount under the host API. The SDK comments say host auth and scope middleware apply, but the plugin abstraction itself does not force authorization semantics inside every endpoint. A plugin route with weak assumptions can become a host-level authorization bug. | Add route capability metadata such as required auth level, required scope, and mutation/read classification. Require host composition tests proving plugin groups are behind the expected auth middleware. Prefer route helpers that require scope and principal inputs. |
| Medium | Approval bypass through `accept-all` | `packages/core/sdk/src/executor.ts`, examples, CLI automation | `onElicitation: "accept-all"` is convenient for tests and automation. If used in a real host, approval and elicitation prompts can be silently accepted. Because plugin annotations drive approval checks, this setting can bypass an important human-in-the-loop control. | Keep `accept-all` in testing helpers and examples only. Add a production-mode guard that rejects `accept-all` unless an explicit unsafe flag is set. Surface the active elicitation mode in host diagnostics. |
| Medium | Long execution budgets and resource consumption | `packages/kernel/runtime-quickjs/src/index.ts`, `packages/kernel/runtime-dynamic-worker/src/executor.ts`, `packages/kernel/runtime-deno-subprocess/src/index.ts` | Default execution timeout is five minutes for QuickJS and dynamic-worker style execution. QuickJS has a 64 MB memory limit and 1 MB stack limit, but long-running code can still consume CPU, queue pending tool calls, hold MCP sessions, and tie up worker or local resources. | Make production host defaults shorter and configurable per tenant/tool. Track per-execution CPU, tool-call count, pending elicitation count, and wall-time budgets. Add cancellation paths across all runtime backends. |
| Medium | Secret provider and file-secret storage posture | `packages/plugins/file-secrets`, `packages/plugins/keychain`, `packages/plugins/onepassword`, `packages/plugins/workos-vault` | The SDK supports multiple secret backends, which is good, but the file secret provider necessarily writes secrets to local storage. The security posture depends on filesystem permissions and user environment. It is acceptable for local development but risky as a default in shared or synced directories. | Mark file secrets as local-development only in docs and diagnostics. Enforce restrictive file modes. Prefer OS keychain or managed vault providers for production templates. |
| Low | Error and log data exposure | `packages/core/execution/src/engine.ts`, `packages/core/execution/src/tool-invoker.ts`, runtime packages | Execution results include result data, logs, and error strings. Output is truncated, but tool outputs and user code logs may still contain secrets or sensitive API responses. | Add secret-pattern redaction at formatting boundaries. Let secret providers register redactors. Mark logs as sensitive by default in hosted environments and limit exposure in MCP responses. |
| Low | Open plugin surface increases supply-chain risk | `packages/plugins/*`, `packages/core/vite-plugin` | Plugins can ship server code, client code, routes, storage schema, secret providers, and invocation handlers. This is the power of the architecture, but third-party plugins become highly privileged extensions. | Define a plugin trust model before marketplace-style distribution. Add package provenance checks, signed manifests, permission declarations, and review gates for plugins that request routes, secrets, subprocess, network, or UI bundles. |

Notes on raw or naked SQL:

- The main adapter path is mostly structured. `storage-drizzle` compiles typed
  `Where` clauses into Drizzle SQL expressions and uses query builders for
  create, read, update, and delete operations.
- The risky places are migration and adapter escape hatches. `sql.raw(stmt)` is
  used for fixed transaction statements in non-Postgres transaction handling.
  `migrate-connections.ts` uses prepared statements for values, but still has
  dynamic SQL for schema inspection and column selection.
- The immediate injection risk looks low because the dynamic identifiers are
  currently code-controlled. The design risk is medium because SDK and platform
  developers may copy these patterns into request-time paths.

Positive security patterns found:

- Local network binding is loopback by default, and non-loopback bind requires a
  bearer token or basic password.
- Local server Host headers are allowlisted.
- Hosted outbound requests reject localhost, private network addresses,
  metadata hostnames, non-HTTP(S) protocols, and cross-origin redirects.
- QuickJS disables direct `fetch`, sets memory and stack limits, and exposes
  only the tool bridge.
- Deno subprocess execution denies net, read, write, env, run, and FFI by
  default.
- Dynamic Worker execution defaults outbound fetch/connect to blocked.
- Secrets and connections are routed through providers and connection-owned
  secret rows rather than exposed as only raw strings.
- Source removal and secret removal check usages before deletion.
- Tool policies and annotations support block, approval, and elicitation flows.

## 3. Examples of What Can Be Built

Executor can be used to build several practical systems:

1. Local AI tool hub

   A desktop or localhost app that lets a developer connect MCP servers,
   OpenAPI specs, GraphQL endpoints, Google APIs, and credential providers once,
   then share that catalog with Cursor, Claude Code, OpenCode, or other
   MCP-compatible tools. Executor's `apps/local`, `apps/cli`, and
   `packages/hosts/mcp` are the reference shape.

2. Hosted integration control plane

   A Cloudflare-hosted multi-tenant service that stores sources and credentials,
   authenticates users and organizations, exposes HTTP APIs, and executes
   sandboxed tool-using code. Executor's `apps/cloud` shows this direction with
   Postgres storage, Cloudflare runtime integration, hosted auth, MCP sessions,
   and dynamic-worker execution.

3. Plugin marketplace or source framework

   A platform where teams write plugins for new source types. Plugins can define
   source schemas, add-source flows, dynamic invocation, credential usage,
   HTTP routes, and React UI. The OpenAPI, GraphQL, MCP, and Google Discovery
   packages are examples of source plugins; keychain, file secrets,
   1Password, and WorkOS Vault are examples of provider plugins.

4. Agent code execution service

   A runtime where an agent writes small TypeScript snippets and calls
   `tools.github.issues.create(...)`, `tools.stripe.customers.list(...)`, or
   any other cataloged tool through a sandbox bridge. The execution engine
   keeps runtime choice behind a `CodeExecutor` interface, so a host can choose
   QuickJS locally, Deno subprocesses where available, or dynamic workers in a
   hosted environment.

5. Unified developer CLI

   A CLI can auto-start a local daemon, search tools, describe schemas, invoke
   tools, and resume paused executions. Executor's published CLI package uses
   the same SDK graph as the web and MCP surfaces rather than maintaining a
   separate integration path.

6. Internal platform backend built from SDK primitives

   This is the Harbor-relevant example. `apps/harbor-backend` in this repository
   rebuilds a Harbor-like backend from SDK packages without exporting a public
   `createHarbor()` API. It serves health, control-plane, source, tool, workflow,
   run, Orbit app/job, and agent-chat style routes from composed SDK state. That
   is the right SDK posture: the app proves the primitives are sufficient to
   build a product backend, while the public SDK remains a set of reusable
   source, credential, policy, registry, run, workflow, Orbit, and client
   building blocks.

7. Testable in-memory integration harness

   Executor's `examples/all-plugins` wires plugins with an in-memory adapter and
   in-memory blob store. Harbor SDK has the same opportunity: a test harness can
   compose memory sources, credentials, policy, runs, workflows, and Orbit
   runtime pieces so developers can test custom platforms without standing up
   the hosted Harbor product.

For Harbor SDK specifically, Executor suggests a practical implementation
direction:

- Keep the public SDK primitive-first.
- Add crisp package roles and examples for common composition paths.
- Consider a small public kernel facade that wires registry, sources,
  credentials, policy, runs, workflows, and runtime adapters without exposing a
  full Harbor SaaS clone.
- Keep `apps/harbor-backend` as a reference app, not the public API.
- Treat security defaults as part of the SDK contract, especially around
  secrets, raw SQL, sandbox capabilities, hosted outbound requests, local server
  auth, and plugin trust boundaries.
