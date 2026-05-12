# Harbor Platform SDK Task Plan

This plan turns the current SDK primitives into two runtime lanes behind one authoring model:

- `@hrbr/runtime-local`: dev-first local Harbor runtime.
- `@hrbr/runtime-cloudflare`: user-owned Cloudflare runtime adapter.

Beach is the only user-facing interface for this system. There is no Coast CLI dependency and no dashboard in the MVP.

## MVP Decisions

- Local runtime is dev-first, not production.
- One implicit local workspace.
- Project-local `.harbor/` state.
- Beach auto-creates `.harbor/` on first use.
- `.harbor/` is added to `.gitignore`.
- One daemon per project.
- Daemon binds to `127.0.0.1`.
- Daemon exposes an MCP endpoint plus a small internal control API.
- Control API requires a generated local auth token.
- Beach auto-starts the daemon and connects to its MCP endpoint.
- QuickJS-ng is the only local exec engine.
- QuickJS runs bundled JavaScript only; no direct npm imports.
- QuickJS network access is off by default.
- Local jobs/apps expose HTTP routes through one runtime port.
- Cloudflare runtime is controlled through the local daemon.
- Cloudflare uses user-owned accounts.
- Cloudflare provisioning uses direct Cloudflare API calls.
- Cloudflare create/change/delete requires plan plus confirmation.
- Read-only Cloudflare status/health/plan preview does not require confirmation.
- Vectorize and local-to-Cloudflare migration are post-MVP.

## Technical Execution Details

Build this in dependency order so each layer can be tested before the next one depends on it.

1. Package the public SDK boundary first.
   - Keep authoring APIs in `@hrbr/sdk`.
   - Keep runtime-specific behavior in `@hrbr/runtime-local` and `@hrbr/runtime-cloudflare`.
   - Do not make Beach or Coast a dependency of the SDK packages.

2. Establish the local runtime substrate.
   - Create `.harbor/` project state, `.gitignore` protection, local manifest files, and SQLite schema.
   - Add repository/store interfaces before adding concrete execution behavior.
   - Verify each substrate step with package typecheck and focused runtime-local tests.

3. Add the local daemon and Beach connection contract.
   - Daemon owns local HTTP routes, MCP endpoint, app/job preview routes, and control APIs.
   - Beach should only need project discovery plus daemon connection metadata.
   - The SDK should expose helper APIs that Beach can call, while actual Beach wiring stays outside this repo.

4. Add developer-owned local extension loops.
   - Registry dev refs point to local plugin, workflow, job, app, and source files.
   - Watchers trigger re-indexing and validation.
   - Credentials are encrypted locally and exposed through runtime APIs.

5. Add local discovery before execution.
   - Index tools from dev refs into the local tool index.
   - Support search, describe, schema, schemas, and call dispatch boundaries.
   - Keep vector search out of MVP; use BM25-style lexical ranking locally.

6. Add execution after discovery is stable.
   - QuickJS-ng runs bundled JavaScript only.
   - Tool calls go through the local registry boundary.
   - Storage, cache, db, artifacts, and traces are approved host calls.

7. Add local jobs, apps, workflows, and package validation.
   - Jobs/apps run locally through the daemon.
   - Workflows validate required tools/sources before running.
   - Package manifests and tests prepare submissions for Harbor review.

8. Add Cloudflare as a second runtime, not a second product.
   - Cloudflare operations route through the local daemon.
   - Users own the Cloudflare account and resources.
   - The same authoring model should target local first, then Cloudflare-backed Orbit adapters.

## 1. Public Package Boundary

Status: complete in `@hrbr/sdk`, `@hrbr/runtime-local`, and `@hrbr/runtime-cloudflare` skeleton packages. Verified with `bun run typecheck:packages`.

- Add top-level `@hrbr/sdk` package.
- Re-export stable authoring primitives:
  - sources
  - tools
  - credentials
  - policies
  - runs/traces
  - workflows
  - Orbit contracts
  - hosted client interfaces
- Add `@hrbr/runtime-local` package.
- Add `@hrbr/runtime-cloudflare` package.
- Mark experimental/private exports clearly.
- Add compatibility policy for SDK packages, runtime contracts, and manifest versions.

## 2. Local Project Layout

Status: complete in `@hrbr/runtime-local` for MVP layout helpers. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Create `.harbor/` on first Beach/runtime use.
- Auto-add `.harbor/` to `.gitignore`.
- Use this MVP layout:

```text
.harbor/
  runtime.json
  harbor.sqlite
  credentials.enc
  registry-dev-refs.json
  artifacts/
  traces/
  cache/
  cloudflare.lock.json
```

- Store daemon port, auth token hash/metadata, runtime version, and project identity in `runtime.json`.
- Keep only one implicit workspace, internally represented as `workspace_id = "local"`.

## 3. SQLite Runtime Store

Status: complete for initial schema/migration definitions and repository-facing SQL executor boundary. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Add SQLite schema for:
  - local workspace metadata
  - source refs
  - tool index
  - plugin/package metadata
  - workflow refs
  - job refs and versions
  - app refs and versions
  - run records
  - span records
  - artifact metadata
  - cache metadata
  - credential metadata
  - Cloudflare resource metadata
- Add migrations for local SQLite.
- Add repository interfaces so tests can use memory stores.

## 4. Local Daemon

Status: complete for MVP daemon skeleton with localhost binding, runtime manifest writing, token-protected control info, health endpoint, and placeholder MCP endpoint. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Implement one daemon per project.
- Bind only to `127.0.0.1`.
- Allocate a dynamic port and write it to `.harbor/runtime.json`.
- Generate a local auth token and require it on the control API.
- Expose:
  - health endpoint
  - internal control API
  - MCP endpoint for Beach
  - local app/job HTTP routes
  - artifact routes
- Add stale daemon detection and restart.
- Add structured logs under `.harbor/traces/` or SQLite.

## 5. Beach Integration

Status: complete for the SDK-side runtime boundary: the daemon writes reconnectable local connection metadata, exposes a token-authenticated control surface, and exports connection helpers Beach can consume. Actual Beach package wiring remains outside this SDK repo. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Beach detects the current project root.
- Beach auto-creates `.harbor/` if missing.
- Beach auto-starts the local daemon if not running.
- Beach reads daemon connection info from `.harbor/runtime.json`.
- Beach connects to the daemon MCP endpoint.
- Beach exposes one MCP surface that can target:
  - `local`
  - `cloudflare`
- Beach enforces confirmations for destructive actions.

## 6. Local Registry and Hot Reload

Status: complete for dev-ref persistence and file-watch hot reload signals in `@hrbr/runtime-local`. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Store dev refs in `.harbor/registry-dev-refs.json`.
- Reference source/plugin/workflow/job/app files by path during development.
- Watch referenced files for changes.
- Re-index tools and manifests on change.
- Keep source-path refs mutable in dev.
- Snapshot source code and generated manifests only during package/submit.

## 7. Local Credentials

Status: complete for encrypted local credential file helpers, env import, and redaction utilities in `@hrbr/runtime-local`. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Add encrypted credential vault at `.harbor/credentials.enc`.
- Support env import for onboarding.
- Never commit credentials or lockfiles.
- Add secret redaction in logs, traces, validation output, and error messages.
- Expose credential read/write through runtime APIs, not direct file access.

## 8. Local Tool Search

Status: complete for in-process local tool index helpers with BM25-style lexical ranking, namespace filtering, describe/schema/schemas surfaces, and a runtime-injected call dispatch boundary. SQLite persistence target remains the Step 3 `tool_index` schema. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Add durable local tool index in SQLite.
- Implement lexical search first.
- Add BM25 search for better local ranking.
- Keep semantic/vector search out of MVP.
- Support search, describe, schema, schemas, and call against local sources.

## 9. QuickJS-ng Execution

Status: complete for the SDK-owned QuickJS-ng execution wrapper: bundled JavaScript validation, injected JSON input, sync result extraction, memory/stack/time limits, no default network API, direct import rejection, and approved sync host-call bridges for tools, storage, cache, db, artifacts, and traces. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Add QuickJS-ng WASM runtime integration.
- Execute bundled JavaScript only.
- Disallow direct npm imports at runtime.
- Disable network access by default.
- Expose approved host calls for:
  - tools
  - storage
  - cache
  - db
  - artifacts
  - traces
- Run sync request/response execution in MVP.
- Defer background jobs/queues.

## 10. Local Jobs and Apps

Status: complete for SDK-owned local job/app primitives: QuickJS-backed job runner, minimal JSON schema validation, daemon `POST /jobs/:job/run`, daemon `/apps/:app/*` JSON/HTML preview routes, daemon `/artifacts/*` serving, single-port routing, and in-memory trace emission for job/app invocations. SQLite persistence and richer route matching remain later hardening. Verified with `bun test packages/sdk/runtime-local/test` and `bun run typecheck:packages`.

- Add local job runner over QuickJS.
- Validate job input/output schemas.
- Add local app preview routes on the daemon HTTP server.
- Use one runtime port for all apps/jobs.
- Route examples:
  - `/apps/:app/*`
  - `/jobs/:job/run`
  - `/artifacts/*`
- Support JSON and HTML responses first.
- Serve static/generated assets through artifact routes.
- Add local trace records for every job/app invocation.

## 11. Local Workflows

- Add workflow package metadata.
- Validate workflow input/output schemas.
- Validate required tools/sources before run.
- Run workflows against local tool registry and QuickJS jobs.
- Add workflow replay fixtures.
- Add docs/manifest generation for workflow submissions.

## 12. Plugin and Workflow Package Format

- Define manifest format for community submissions.
- Include:
  - package name
  - owner/maintainer
  - source metadata
  - tools
  - auth requirements
  - scopes
  - policies
  - docs
  - examples
  - tests
  - compatibility
  - changelog
- Generate manifests from SDK definitions.
- Validate manifest and schema quality locally.

## 13. Git-Based Submission Flow

- Define repo layout for plugin/workflow submissions.
- Add validation checks Harbor reviewers can run.
- Add package snapshot creation.
- Add security checklist output.
- Add ownership and maintenance metadata.
- Keep Harbor curated registry as the first official submission target.
- Keep manifest portable enough for future Git/npm registries.

## 14. Cloudflare Runtime Package

- Create `@hrbr/runtime-cloudflare`.
- Keep Cloudflare dependencies out of local runtime package.
- Expose Cloudflare as an Orbit/runtime adapter, not a different authoring model.
- Route all Cloudflare operations through the local daemon.
- Store Cloudflare credentials in encrypted local credentials.
- Support env import for Cloudflare onboarding.

## 15. Cloudflare Provisioning

- Use direct Cloudflare API calls first.
- Generate a plan for resources to create/change/delete.
- Require confirmation for mutations.
- Skip confirmation for read-only plan/status/health.
- Write `.harbor/cloudflare.lock.json`.
- Use lockfile for idempotent updates, teardown, health checks, and debugging.
- Add optional Wrangler export later, not MVP.

## 16. Cloudflare Orbit Adapters

- Add Cloudflare-backed adapters for:
  - storage -> R2
  - cache -> KV
  - db -> D1
  - jobs -> Workers/Queues where needed
  - apps -> Workers routes
  - ai -> AI Gateway
  - sockets -> Durable Objects later
- Keep Vectorize post-MVP.
- Keep local-to-Cloudflare migration post-MVP.

## 17. Security and Confirmation Layer

- Mark destructive actions in the MCP/control API.
- Require confirmation before:
  - deleting local data
  - mutating Cloudflare resources
  - running destructive tools
  - changing credentials
  - publishing/submitting packages
- Add static checks for:
  - secret leakage
  - unsafe auth scopes
  - destructive tool metadata
  - network access assumptions
  - missing policies

## 18. Tests

- Unit test runtime stores.
- Unit test SQLite migrations.
- Unit test credential vault redaction.
- Unit test local registry indexing/search.
- Unit test QuickJS execution sandbox.
- Unit test Beach daemon auto-start handshake.
- Integration test local MCP flow through daemon.
- Integration test app/job HTTP routes.
- Integration test plugin/workflow package validation.
- Integration test Cloudflare plan generation with mocked API.
- Keep real Cloudflare provisioning tests behind explicit env flags.

## 19. Examples

- Local source adapter.
- Local plugin package.
- Local workflow package.
- Local job.
- Local app preview.
- Local Beach MCP interaction.
- Cloudflare plan preview.
- Cloudflare-backed storage/db/job/app example.
- Git-based plugin submission example.

## Recommended Build Order

1. Public package boundary.
2. `.harbor/` project layout.
3. SQLite store and repositories.
4. Local daemon with auth token and health/control API.
5. Beach auto-start and MCP connection.
6. Local registry refs and hot reload.
7. Credential vault and env import.
8. Local lexical/BM25 tool search.
9. QuickJS-ng bundled sync execution.
10. Local job runner.
11. Local app HTTP preview.
12. Local workflow validation/run/replay.
13. Plugin/workflow package manifest.
14. Git-based submission validation.
15. `@hrbr/runtime-cloudflare` package skeleton.
16. Cloudflare credential connection through daemon.
17. Cloudflare plan preview and lockfile.
18. Cloudflare mutation confirmation and provisioning.
19. Cloudflare storage/db/jobs/apps adapters.
20. Tests, examples, and release hardening.
