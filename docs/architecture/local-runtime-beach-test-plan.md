# Local Runtime Beach Test Plan

This file is the approval checklist before starting Beach-driven local runtime testing and bug fixing.

Scope: test the local runtime only, exactly how a user would use it through Beach in a locally hosted environment. Do not use Coast as the user interface. Cloudflare-backed runtime paths are out of scope except where they must stay disabled or non-blocking for local use.

## Working Rules

- Use Beach as the user-facing interface for every scenario.
- Start from a fresh local project for the main acceptance pass.
- If a scenario fails, write it down in this file before fixing it.
- Before moving to the next iteration, fix open bugs first, update the bug log, retest, then continue.
- Keep repo tests/typechecks green after fixes.

## Bug Log

### Iteration 1: Beach Local Runtime Bootstrap and Surface Smoke

- Test project: `/tmp/harbor-sdk-beach-iter1.366woT`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js serve`
- Status: bugs documented before fixes.

When testing starts, record failures in this format:

```text
### BUG-N: Short title

- Scenario:
- Beach command/tool call:
- Expected:
- Actual:
- Suspected cause:
- Fix status:
- Retest:
```

### BUG-1: Beach does not bootstrap `.harbor/` local runtime state

- Scenario: Start from a fresh local project and use Beach as the only interface.
- Beach command/tool call: `mcporter list --stdio "node .../apps/beach/dist/index.js serve" --schema --json`, then inspect `/tmp/harbor-sdk-beach-iter1.366woT`.
- Expected: Beach initializes or connects to the SDK local runtime and creates `.harbor/` state for local use.
- Actual: Beach exposes Harbor cloud workspace tools and no `.harbor/` directory is created.
- Evidence: `find /tmp/harbor-sdk-beach-iter1.366woT -maxdepth 2 -print` returned only the temp project directory.
- Suspected cause: Beach currently starts the existing hrbr MCP sidecar over Coast/cloud APIs and has no integration with `@hrbr/runtime-local`.
- Fix status: open.
- Retest: pending.

### BUG-2: Beach MCP surface has no local runtime mode or local CRUD actions

- Scenario: List Beach MCP tools as an actual MCP client.
- Beach command/tool call: `mcporter list --stdio "node .../apps/beach/dist/index.js serve" --schema --json`.
- Expected: Local runtime surface exposes local project operations for credentials, plugins, workflows, jobs, apps, tool search, and exec.
- Actual: Exposed default tools are the existing cloud/control-plane surfaces: `hrbr_workspace`, `hrbr_plugins`, `hrbr_skills`, `hrbr_orbit`, `hrbr_tools`, `hrbr_exec`.
- Evidence: Tool schemas only include cloud/workspace actions. `hrbr_orbit` supports `list/inspect/open/versions/run`, not local create/update/delete. `hrbr_skills` is read-only. No credential vault tool is exposed.
- Suspected cause: Beach has not been extended with a local runtime target or local authoring actions.
- Fix status: open.
- Retest: pending.

### BUG-3: Plugin registry operations are cloud workspace operations, not local plugin registry operations

- Scenario: Test plugin listing from a clean local project.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js serve" hrbr_plugins action=list limit:5`.
- Expected: Local runtime plugin list is empty or reflects `.harbor/registry-dev-refs.json`; custom local plugin creation/deletion is available.
- Actual: Returned cloud workspace plugin state for workspace `c7c4f96d-eb82-4e71-8aee-462ccafce9e8`, including installed ready sources like `cloudflare`, `linear-mcp`, `replicate-mcp`, etc.
- Suspected cause: `hrbr_plugins` routes directly to Harbor API plugin endpoints and has no local registry implementation.
- Fix status: open.
- Retest: pending.

### BUG-4: Tool search lexical mode searches cloud workspace tools, not local BM25 index

- Scenario: Run lexical tool search from a clean local project.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js serve" hrbr_tools action=search query='github issue' mode=lexical limit:3`.
- Expected: Search hits come from the local SDK BM25 index populated from local plugin refs.
- Actual: Search returned cloud workspace tools under `gitlab-rest` for GitHub integration endpoints.
- Suspected cause: `hrbr_tools` routes to Harbor API tool search and does not use `createHarborLocalToolIndex`.
- Fix status: open.
- Retest: pending.

### BUG-5: Jobs, apps, workflows, and exec remain cloud/control-plane surfaces

- Scenario: Test local jobs/apps/workflows/exec from a clean local project.
- Beach command/tool calls:
  - `hrbr_orbit surface=jobs action=list limit:3`
  - `hrbr_orbit surface=apps action=list limit:3`
  - `hrbr_skills action=list catalog=workflows scope=all limit:3`
  - `hrbr_exec code='export default async function main() { return { ok: true, local: typeof fetch === "undefined" }; }' timeout-ms:10000`
- Expected: Local job/app/workflow CRUD and QuickJS execution operate against the SDK local runtime.
- Actual:
  - jobs/apps list reads cloud Orbit state.
  - workflows list reads native Harbor workflow catalog.
  - exec attempts Harbor cloud execution and failed with `SchemaError(Expected "sandbox", got "dynamic_worker" at ["mode"])`.
- Suspected cause: Beach currently documents and implements `hrbr_exec` as cloud execution and `hrbr_orbit`/`hrbr_skills` as hosted control-plane reads.
- Fix status: open.
- Retest: pending.

## Iteration 1 Fix Plan

Implement the local runtime as an explicit Beach target instead of mixing it silently into the existing cloud workspace behavior.

1. Add Beach local runtime mode.
   - Introduce a target selector such as `target: "local" | "cloud"` on relevant Beach tools, defaulting to current cloud behavior unless local project mode is explicitly requested.
   - For local-only testing, use `target=local` in every test call.

2. Wire Beach to `@hrbr/runtime-local`.
   - Add a package dependency from Beach to the SDK local runtime package or a stable public SDK package export.
   - On `target=local`, call `ensureHarborLocalDaemonConnection({ projectRoot: process.cwd() })`.
   - Use the returned local daemon/control metadata instead of Harbor API calls.

3. Add a local runtime Beach tool surface.
   - Add a dedicated tool if cleaner, e.g. `hrbr_local`, with actions for bootstrap/status/credentials/plugins/tools/exec/jobs/apps/workflows/package.
   - Prefer one coherent local tool over overloading every existing cloud tool if schemas would become unclear.

4. Implement local action coverage in thin vertical slices.
   - Iteration 2: bootstrap/status and `.harbor` state verification.
   - Iteration 3: credentials vault.
   - Iteration 4: plugins registry refs and local tool search.
   - Iteration 5: QuickJS exec and jobs.
   - Iteration 6: apps and artifacts.
   - Iteration 7: workflows and package/submission validation.
   - Iteration 8: restart/persistence/negative recovery.

5. Keep fixes robust.
   - No ad hoc temp-file protocol outside the SDK runtime APIs.
   - No Coast CLI dependency for local runtime.
   - Preserve current cloud Beach behavior for existing users.
   - Add Beach tests/smoke commands where possible and keep SDK tests green.

## Test Tasks

### 1. Local Runtime Bootstrap

- Start from a fresh local project.
- Use Beach to initialize local runtime state.
- Verify `.harbor/` is auto-created.
- Verify `.harbor/` is added to `.gitignore`.
- Verify `runtime.json`, `harbor.sqlite`, `credentials.enc`, `registry-dev-refs.json`, `artifacts/`, `traces/`, `cache/`, and `cloudflare.lock.json` behavior.
- Verify daemon starts on `127.0.0.1`.
- Verify daemon auth token/control metadata.
- Restart Beach/daemon and verify reconnect or stale-daemon recovery.

### 2. Beach MCP Surface

- List local runtime tools/resources through Beach.
- Verify local runtime targeting works without Cloudflare setup.
- Verify Cloudflare runtime paths do not block local runtime use.
- Record missing Beach commands, unsupported MCP calls, or route gaps.

### 3. Credentials Vault

- Import credentials from env through the Beach/local runtime flow.
- Add local credentials.
- Read local credential metadata safely.
- Update credentials.
- Delete credentials.
- Verify `.harbor/credentials.enc` does not contain raw secrets.
- Verify secret redaction in outputs, traces, validation messages, and errors.

### 4. Plugin Registry

- List native/global plugins where Beach exposes them.
- List local custom plugins.
- List all plugins.
- Add a custom plugin/source from a local file path.
- Verify registry dev refs are persisted.
- Verify hot reload after editing the plugin/source file.
- Remove/delete local plugin refs.
- Verify deleted plugins disappear from local registry views.
- Validate plugin manifest/package generation.
- Verify bad plugin definitions produce actionable validation errors.

### 5. Tool Search

- Index local plugin tools.
- Test lexical/BM25 search queries.
- Test exact tool-name search.
- Test namespace filtering.
- Test `search`.
- Test `describe`.
- Test `schema`.
- Test `schemas`.
- Test local tool call dispatch.
- Verify deleted plugin tools disappear from search.

### 6. Local Exec

- Run bundled QuickJS code through Beach/local runtime.
- Verify no direct npm imports.
- Verify no `fetch` by default.
- Verify approved host calls:
  - tools
  - storage
  - cache
  - db
  - artifacts
  - traces
- Test timeout/infinite loop handling.
- Test invalid bundled code.
- Test bad input/output schema failures.

### 7. Jobs

- Create local jobs.
- List local jobs.
- Get job details.
- Update local jobs.
- Delete local jobs.
- Run jobs with JSON input.
- Verify output schema validation.
- Verify traces/artifacts.
- Verify daemon job route: `/jobs/:job/run`.
- Test invalid job code.
- Test missing credential/tool failures.

### 8. Apps

- Create local apps.
- List local apps.
- Get app details.
- Update local apps.
- Delete local apps.
- Preview app routes through the daemon.
- Verify JSON responses.
- Verify HTML responses.
- Verify artifact/static serving.
- Verify app route isolation.
- Verify app trace records.
- Test app errors and missing routes.

### 9. Workflows

- List native workflows where Beach exposes them.
- Create local workflows.
- List local workflows.
- Get workflow details.
- Update local workflows.
- Delete local workflows.
- Run workflows using local tools and jobs.
- Validate required tools before run.
- Validate required sources before run.
- Generate replay fixtures.
- Generate workflow package manifests.
- Verify workflow deletion removes local refs/search artifacts where relevant.

### 10. Package Submission Flow

- Generate plugin package snapshot.
- Generate workflow package snapshot.
- Validate `harbor.package.json`.
- Validate README output.
- Validate changelog output.
- Validate ownership metadata.
- Run security checklist.
- Confirm secret leakage warnings.
- Confirm broad scope warnings.
- Confirm destructive policy warnings.

### 11. Persistence and Restart

- Stop daemon.
- Restart daemon.
- Reconnect Beach.
- Verify registry refs persist.
- Verify credential metadata persists.
- Verify runtime manifest behavior.
- Verify jobs persist or record missing persistence as a bug.
- Verify apps persist or record missing persistence as a bug.
- Verify workflows persist or record missing persistence as a bug.
- Verify traces/artifacts behavior after restart.

### 12. Negative and Recovery Tests

- Corrupt `registry-dev-refs.json`.
- Corrupt `runtime.json`.
- Use missing credential key.
- Create duplicate plugin/tool IDs.
- Run workflow with missing requirements.
- Simulate stale daemon port.
- Verify errors are actionable.
- Verify recovery works where expected.

### 13. Final Acceptance Pass

Run one clean Beach-driven flow from scratch:

1. Bootstrap local runtime.
2. Add/import credentials.
3. Add custom plugin.
4. Search local tools.
5. Describe schema and call a local tool.
6. Run local exec.
7. Create and run a job.
8. Create and preview an app.
9. Create and run a workflow.
10. Generate package/submission artifacts.
11. Restart daemon and reconnect Beach.
12. Re-run the core job/app/workflow checks.

## Verification Gates

- `bun test`
- `bun run typecheck`
- Beach-driven final acceptance pass succeeds.
- Bug Log has no open `Fix status: open` items.
