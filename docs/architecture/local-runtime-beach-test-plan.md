# Local Runtime Beach Test Plan

This file is the approval checklist before starting Beach-driven local runtime testing and bug fixing.

Scope: test the local runtime only, exactly how a user would use it through Beach in a locally hosted environment. Do not use Coast as the user interface. Cloudflare-backed runtime paths are out of scope except where they must stay disabled or non-blocking for local use.

## Iteration Protocol

Use this loop for every iteration:

1. Create a fresh local test project unless the scenario explicitly tests persistence or restart.
2. Exercise the feature only through Beach/MCP, the way an actual local user would.
3. Record every bug in this file before fixing anything.
4. At the end of the iteration, write the fix plan under that iteration.
5. Fix only the bugs recorded for that iteration.
6. Retest the same Beach commands and update each bug with fix status and retest evidence.
7. Commit code changes and this task file together before starting the next iteration.

## Iteration Checklist

### Iteration 1: Bootstrap and Local Surface

- List Beach MCP tools from a fresh project.
- Bootstrap local runtime through Beach.
- Verify `.harbor/` project state is created.
- Verify `.harbor/` is protected by `.gitignore`.
- Verify daemon starts locally and reports status.
- Verify Beach exposes an explicit local runtime surface.
- Verify existing cloud workspace behavior is not silently replaced.

### Iteration 2: Credentials Vault

- Add/import local credentials through Beach.
- List credential metadata without revealing secrets.
- Update credentials.
- Delete credentials.
- Verify encrypted storage and redaction in traces/errors.

### Iteration 3: Plugin Registry and Local Tool Search

- List native/global plugins where Beach exposes them.
- List local custom plugins.
- Add a local custom plugin ref.
- Validate plugin manifest/schema failures.
- Index plugin tools locally.
- Search with lexical/BM25 behavior.
- Describe tool schemas.
- Call a local tool.
- Delete local plugin refs and verify tools disappear.

### Iteration 4: Local Exec

- Run bundled JavaScript through QuickJS-ng via Beach.
- Verify direct imports are rejected.
- Verify network access is unavailable by default.
- Verify approved host calls for tools, storage, cache, db, artifacts, and traces.
- Test timeout and invalid code handling.

### Iteration 5: Jobs

- Create, list, inspect, update, delete, and run local jobs.
- Validate JSON input/output schemas.
- Verify traces and artifacts.
- Verify daemon job route behavior.
- Test missing credential/tool failures.

### Iteration 6: Apps

- Create, list, inspect, update, delete, and preview local apps.
- Verify JSON and HTML responses.
- Verify artifact/static serving.
- Verify app route isolation.
- Verify app errors and missing routes.

### Iteration 7: Workflows

- List native workflows where Beach exposes them.
- Create, list, inspect, update, delete, and run local workflows.
- Validate required tools and sources before run.
- Generate replay fixtures.
- Generate workflow package manifests.

### Iteration 8: Package Submission Flow

- Generate plugin package snapshot.
- Generate workflow package snapshot.
- Validate package metadata, README, changelog, owner metadata, tests, scopes, and policies.
- Confirm secret leakage, broad scope, and destructive policy warnings.

### Iteration 9: Persistence, Restart, and Recovery

- Stop and restart the daemon.
- Reconnect Beach.
- Verify registry refs, credential metadata, jobs, apps, workflows, traces, and artifacts persist where expected.
- Corrupt local runtime files and verify actionable recovery errors.
- Simulate stale daemon port behavior.

### Iteration 10: Final Acceptance Pass

- Run one clean Beach-driven flow from scratch:
  - bootstrap local runtime
  - add/import credentials
  - add custom plugin
  - search, describe, and call local tools
  - run local exec
  - create and run a job
  - create and preview an app
  - create and run a workflow
  - generate package/submission artifacts
  - restart daemon and reconnect Beach
  - re-run the core job/app/workflow checks

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
- Fix status: partial. A new Beach `hrbr_local` bootstrap/status surface now creates `.harbor/` and starts a daemon, but follow-up BUG-6 shows the bootstrap layout is incomplete.
- Retest: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=bootstrap` from `/tmp/harbor-sdk-beach-iter1-retest.BqLLwz` returned `status: "running"` and created `.gitignore`, `.harbor/runtime.json`, `.harbor/registry-dev-refs.json`, `.harbor/artifacts`, `.harbor/traces`, and `.harbor/cache`.

### BUG-2: Beach MCP surface has no local runtime mode or local CRUD actions

- Scenario: List Beach MCP tools as an actual MCP client.
- Beach command/tool call: `mcporter list --stdio "node .../apps/beach/dist/index.js serve" --schema --json`.
- Expected: Local runtime surface exposes local project operations for credentials, plugins, workflows, jobs, apps, tool search, and exec.
- Actual: Exposed default tools are the existing cloud/control-plane surfaces: `hrbr_workspace`, `hrbr_plugins`, `hrbr_skills`, `hrbr_orbit`, `hrbr_tools`, `hrbr_exec`.
- Evidence: Tool schemas only include cloud/workspace actions. `hrbr_orbit` supports `list/inspect/open/versions/run`, not local create/update/delete. `hrbr_skills` is read-only. No credential vault tool is exposed.
- Suspected cause: Beach has not been extended with a local runtime target or local authoring actions.
- Fix status: partial. `hrbr_local` now exposes local bootstrap/status only. Local CRUD actions for credentials, plugins, tools, exec, jobs, apps, and workflows remain later iterations.
- Retest: `mcporter list --stdio "node .../apps/beach/dist/index.js stdio-direct" --schema --json` from `/tmp/harbor-sdk-beach-iter1-retest.BqLLwz` includes `hrbr_local` with `action=bootstrap|status`.

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

### BUG-6: Local bootstrap layout is incomplete

- Scenario: Bootstrap the local runtime through Beach from a fresh project.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=bootstrap`.
- Expected: Bootstrap prepares the local project layout promised by the SDK plan: `.harbor/runtime.json`, `.harbor/harbor.sqlite`, `.harbor/credentials.enc`, `.harbor/registry-dev-refs.json`, `.harbor/artifacts/`, `.harbor/traces/`, `.harbor/cache/`, and clear `cloudflare.lock.json` behavior.
- Actual: Bootstrap created runtime, registry refs, artifacts, traces, and cache, but `files.sqlite`, `files.credentials`, and `files.cloudflareLock` were false.
- Evidence: `find /tmp/harbor-sdk-beach-iter1-retest.BqLLwz -maxdepth 3 -print | sort` did not include `harbor.sqlite`, `credentials.enc`, or `cloudflare.lock.json`.
- Suspected cause: `ensureHarborLocalProject` creates directories and registry refs only; SQLite, credential vault, and Cloudflare lock initialization are lazy or absent.
- Fix status: deferred to the first store/vault implementation slice. Do not create fake `harbor.sqlite` or invalid `credentials.enc` placeholders; implement a real local store/vault initialization path before marking this fixed.
- Retest: token retest project `/tmp/harbor-sdk-beach-iter1-token-retest.uwDLoF` still reports `sqlite: false`, `credentials: false`, and `cloudflareLock: false`, so this remains open for the next local store/vault iteration.

### BUG-7: Beach bootstrap response exposes the local daemon bearer token

- Scenario: Bootstrap the local runtime through Beach from a fresh project.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=bootstrap`.
- Expected: Beach output should expose safe connection metadata only; auth tokens and authorization headers should never be printed to an MCP client transcript.
- Actual: Response included `connection.connection.token` and `connection.connection.headers.authorization` with the raw bearer token.
- Suspected cause: Beach returned `harborLocalDaemonConnection(runtime.manifest)` directly instead of a redacted/safe connection summary.
- Fix status: fixed. Beach now returns only `origin`, `mcp_endpoint`, and `auth: "local-bearer-token-redacted"`.
- Retest: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=bootstrap` from `/tmp/harbor-sdk-beach-iter1-token-retest.uwDLoF` returned no raw `token` field and no `authorization` header.

### Iteration 2: Credentials Vault Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter2-creds.yAtyg2`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-8: Beach local runtime has no credential vault actions

- Scenario: Add/list/update/delete local credentials through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=credential_list`.
- Expected: Beach exposes local credential vault actions that can add/import credentials, list safe metadata, update credentials, delete credentials, and keep secret values out of output.
- Actual: MCP validation rejected the action because `hrbr_local` only supports `bootstrap` and `status`.
- Evidence: Validation error said `Invalid option: expected one of "bootstrap"|"status"`.
- Suspected cause: Iteration 1 only added the local bootstrap/status surface and did not wire the SDK credential vault primitives into Beach.
- Fix status: fixed. `hrbr_local` now supports `credential_list`, `credential_set`, `credential_import_env`, and `credential_delete`.
- Retest:
  - `credential_list` returned `vault: "uninitialized"` and no credentials before mutation.
  - `credential_set slot=api_token value=super-secret-token-123456` returned metadata with redacted value `supe...3456`.
  - `credential_import_env` with `HRBR_TEST_IMPORT_TOKEN=imported-secret-abcdef` returned metadata with redacted value `impo...cdef`.
  - `credential_delete credential_id=local:api_token` removed the credential on the sequential retest.
  - `rg -n "super-secret-token-123456|imported-secret-abcdef|HRBR_TEST_IMPORT_TOKEN" .harbor` found no raw dummy secrets in `.harbor`.

### BUG-9: Beach status does not reconnect to an already-running local daemon

- Scenario: Bootstrap local runtime in one Beach process, then call `hrbr_local action=status` from a second Beach process.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=status`.
- Expected: Status probes the manifest daemon endpoint and reports `running` when the daemon is still alive.
- Actual: Status reported `status: "stopped"` and `daemon: null` even though `fetch("http://127.0.0.1:49782/health")` returned `200 {"ok":true,"workspace_id":"local"}`.
- Suspected cause: `localStatus` only checks the in-memory `localDaemons` map for the current Beach process and does not verify manifest connection metadata.
- Fix status: fixed. `hrbr_local status` now probes the daemon `/health` endpoint from `runtime.json`.
- Retest: a second Beach process calling `hrbr_local action=status` from `/tmp/harbor-sdk-beach-iter2-creds.yAtyg2` returned `status: "running"` with daemon source `runtime_manifest`.

## Iteration 2 Fix Plan

Implement local credentials as Beach-owned actions over the SDK credential vault primitives, and make status process-independent.

1. Extend `hrbr_local` schema with explicit credential actions:
   - `credential_list`
   - `credential_set`
   - `credential_import_env`
   - `credential_delete`
2. Use a project-local vault key file under `.harbor/` for local-only Beach usage.
   - Generate it on first credential mutation.
   - Keep it inside `.harbor/`, which bootstrap already adds to `.gitignore`.
   - Do not print the key or raw credential values.
3. Return only credential metadata:
   - id
   - slot
   - source ref id
   - scope
   - status
   - created/updated timestamps
   - redacted value preview only when useful.
4. Update/delete through `readHarborLocalCredentials` and `writeHarborLocalCredentials`.
5. Make `status` probe the daemon health endpoint from `runtime.json` before reporting stopped.
6. Retest through `mcporter` from a fresh project and keep Beach typecheck/build green.

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
