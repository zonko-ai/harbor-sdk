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

### Iteration 3: Plugin Registry and Local Tool Search Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter3-plugins.IIJ3IW`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-10: Beach local runtime has no local plugin registry actions

- Scenario: List local custom plugin refs through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=plugin_list`.
- Expected: Beach lists local custom plugin refs from `.harbor/registry-dev-refs.json` and supports adding/removing local plugin refs.
- Actual: MCP validation rejected the action because `hrbr_local` only supports bootstrap/status/credential actions.
- Evidence: Validation error said `Invalid option: expected one of "bootstrap"|"status"|"credential_list"|"credential_set"|"credential_import_env"|"credential_delete"`.
- Suspected cause: Local registry dev-ref primitives exist in `@hrbr/runtime-local`, but Beach has not exposed them.
- Fix status: fixed. `hrbr_local` now supports `plugin_list`, `plugin_add`, and `plugin_delete` over `.harbor/registry-dev-refs.json`.
- Retest:
  - Created `/tmp/harbor-sdk-beach-iter3-plugins.IIJ3IW/demo-plugin.json`.
  - `plugin_add path=demo-plugin.json name=Demo` returned namespace `demo` and tool `demo.search_issues`.
  - `plugin_list` returned one local plugin.
  - `plugin_delete path=demo-plugin.json` returned `deleted: true`.
  - A sequential registry check showed `refs: []`.

### BUG-11: Beach local runtime has no local BM25 tool search actions

- Scenario: Search locally indexed plugin tools through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=tool_search query=issue`.
- Expected: Beach searches local plugin tools using the SDK local lexical/BM25 index.
- Actual: MCP validation rejected the action because no local tool-search action exists.
- Suspected cause: `createHarborLocalToolIndex` exists in the SDK package, but Beach has not built an index from local registry refs.
- Fix status: fixed. `hrbr_local` now supports `tool_search`, `tool_describe`, `tool_schema`, `tool_schemas`, and `tool_call` using a local index built from plugin refs.
- Retest:
  - `tool_search query="issue keyword"` returned `demo.search_issues` with BM25 score.
  - `tool_describe tool_id=demo.search_issues` returned description and schemas.
  - `tool_schema` and `tool_schemas namespace=demo` returned the expected JSON schemas.
  - `tool_call tool_id=demo.search_issues input={"query":"bug"}` returned the plugin manifest's static local output.
  - After `plugin_delete`, `tool_search query=issue` returned `hits: []`.

## Iteration 3 Fix Plan

Expose a narrow local plugin manifest format through `hrbr_local`, then index those local tools with the SDK BM25 helper.

1. Extend `hrbr_local` with plugin registry actions:
   - `plugin_list`
   - `plugin_add`
   - `plugin_delete`
2. Use `.harbor/registry-dev-refs.json` as the source of truth through the SDK registry helpers.
3. Support JSON plugin manifests that declare:
   - `namespace`
   - optional `name`
   - `tools[]` with `name`, `displayName`, `description`, `inputSchema`, `outputSchema`, and optional static `output` for local call smoke tests.
4. Extend `hrbr_local` with tool actions:
   - `tool_search`
   - `tool_describe`
   - `tool_schema`
   - `tool_schemas`
   - `tool_call`
5. Build the local tool index from plugin refs on demand. Avoid hidden cloud calls.
6. Retest add/list/search/describe/schema/call/delete through `mcporter`.

### Iteration 4: Local QuickJS Exec Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter4-exec.7OmizW`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-12: Beach local runtime has no QuickJS exec action

- Scenario: Run bundled JavaScript through Beach against the local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local --args '{"action":"exec","code":"return { ok: true }"}'`.
- Expected: Beach executes bundled JavaScript with QuickJS-ng through `@hrbr/runtime-local`, without using Harbor cloud exec.
- Actual: MCP validation rejected the action because no local exec action exists.
- Evidence: Validation error listed only bootstrap/status/credential/plugin/tool actions.
- Suspected cause: `runHarborLocalQuickJS` exists in the SDK package, but Beach has not exposed it through `hrbr_local`.
- Fix status: fixed. `hrbr_local` now supports `action=exec` and runs bundled JavaScript through `runHarborLocalQuickJS`.
- Retest:
  - Successful exec returned `{ ok: true, input: { hello: "world" }, fetchType: "undefined" }`.
  - Import code was rejected with `QuickJS local execution only accepts bundled JavaScript without import/export`.
  - Infinite loop with `timeout_ms=25` returned `interrupted`.
  - Local tool host call `harbor.tools.call("execdemo.answer", { q: 1 })` returned static plugin output `{ ok: true, answer: 42 }`.
  - Artifact host call wrote `.harbor/artifacts/result.json`.

### BUG-13: Beach build does not stage the QuickJS WASM asset

- Scenario: Run local QuickJS exec through the built Beach `dist/index.js`.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local --args '{"action":"exec","code":"({ ok: true })"}'`.
- Expected: Built Beach can load QuickJS-ng's WASM runtime and execute bundled code.
- Actual: Runtime failed with `ENOENT: no such file or directory, open '.../apps/beach/dist/emscripten-module.wasm'`.
- Suspected cause: Bun bundles the JavaScript loader into `dist/index.js`, but the QuickJS package's adjacent `emscripten-module.wasm` asset is not copied into Beach `dist`.
- Fix status: fixed. Beach build now runs `scripts/copy-quickjs-wasm.mjs` after bundling to stage `dist/emscripten-module.wasm`.
- Retest: Rebuilt Beach with `bun run --cwd apps/beach build`; local exec through `node apps/beach/dist/index.js stdio-direct` loaded QuickJS successfully.

## Iteration 4 Fix Plan

Add a local `exec` action to `hrbr_local` over the SDK QuickJS runner.

1. Extend `hrbr_local` schema with `action=exec`, `code`, `input`, and `timeout_ms`.
2. Execute bundled JavaScript only through `runHarborLocalQuickJS`.
3. Keep direct imports and `fetch` unavailable by relying on the SDK QuickJS validator/bootstrap.
4. Provide approved local host calls for:
   - static local tool calls from plugin manifests
   - in-memory storage/cache for smoke testing
   - artifact and trace writes under `.harbor/artifacts` and `.harbor/traces`
5. Retest successful exec, rejected import, unavailable `fetch`, timeout, and a host tool call.

### Iteration 5: Local Jobs Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter5-jobs.R6a8Mk`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-14: Beach local runtime has no local job actions

- Scenario: List/create/run/delete local jobs through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=job_list`.
- Expected: Beach exposes local job actions backed by the SDK local job runner.
- Actual: MCP validation rejected the action because no local job action exists.
- Evidence: Validation error listed bootstrap/status/credential/plugin/tool/exec actions only.
- Suspected cause: `runHarborLocalJob` exists in `@hrbr/runtime-local`, but Beach has not exposed job refs or job runs.
- Fix status: fixed. `hrbr_local` now supports `job_list`, `job_add`, `job_delete`, and `job_run`.
- Retest:
  - Created `/tmp/harbor-sdk-beach-iter5-jobs.R6a8Mk/hello-job.json`.
  - `job_add path=hello-job.json name="Hello Job"` returned job metadata.
  - Sequential `job_list` returned one job.
  - `job_run job_id=hello-job input={"name":"Kushagra","count":2}` returned output `{ greeting: "hello Kushagra", count: 2 }` and a job trace.
  - `job_run` without required `name` failed with `input.name is required`.
  - `job_delete path=hello-job.json` returned `deleted: true`, and a sequential registry check showed `refs: []`.

## Iteration 5 Fix Plan

Add local job actions to `hrbr_local` using JSON job manifests and the SDK job runner.

1. Extend `hrbr_local` schema with:
   - `job_list`
   - `job_add`
   - `job_delete`
   - `job_run`
2. Store job refs in `.harbor/registry-dev-refs.json` with `kind=job`.
3. Support JSON job manifests with `id`, `code`, optional `inputSchema`, optional `outputSchema`, and optional `timeoutMs`.
4. Run jobs through `runHarborLocalJob`.
5. Retest add/list/run/delete through Beach, plus schema validation failure.

### Iteration 6: Local Apps Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter6-apps.OBuUEJ`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-15: Beach local runtime has no local app actions

- Scenario: List/create/preview/delete local apps through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=app_list`.
- Expected: Beach exposes local app actions backed by the SDK local app route runner.
- Actual: MCP validation rejected the action because no local app action exists.
- Evidence: Validation error listed bootstrap/status/credential/plugin/tool/exec/job actions only.
- Suspected cause: `runHarborLocalAppRoute` exists in `@hrbr/runtime-local`, but Beach has not exposed app refs or previews.
- Fix status: fixed. `hrbr_local` now supports `app_list`, `app_add`, `app_delete`, and `app_preview`.
- Retest:
  - Created `/tmp/harbor-sdk-beach-iter6-apps.OBuUEJ/demo-app.json`.
  - `app_add path=demo-app.json name="Demo App"` returned app metadata with `/` and `/html` routes.
  - Sequential `app_list` returned one app.
  - `app_preview app_id=demo-app route_path=/` returned JSON body `{ ok: true, route: "/" }` and an app trace.
  - `app_preview app_id=demo-app route_path=/html` returned `contentType: "text/html"` and HTML body.
  - Missing route preview failed with `Local app route not found: GET /missing`.
  - `app_delete path=demo-app.json` returned `deleted: true`, and `app_list` returned `count: 0`.

## Iteration 6 Fix Plan

Add local app actions to `hrbr_local` using JSON app manifests and the SDK app route runner.

1. Extend `hrbr_local` schema with:
   - `app_list`
   - `app_add`
   - `app_delete`
   - `app_preview`
2. Store app refs in `.harbor/registry-dev-refs.json` with `kind=app`.
3. Support JSON app manifests with `id` and `routes[]` containing `method`, `path`, and `code`.
4. Preview routes through `runHarborLocalAppRoute`.
5. Retest add/list/preview/delete through Beach, plus missing-route error.

### Iteration 7: Local Workflows Through Beach

- Test project: `/tmp/harbor-sdk-beach-iter7-workflows.GRNo9Z`
- Beach command shape: `mcporter ... node /Users/kushagrakaushal/Desktop/Rough/zonko/harbor/apps/beach/dist/index.js stdio-direct`
- Status: bugs documented before fixes.

### BUG-16: Beach local runtime has no local workflow actions

- Scenario: List/create/run/delete local workflows through Beach after bootstrapping a fresh local runtime.
- Beach command/tool call: `mcporter call --stdio "node .../apps/beach/dist/index.js stdio-direct" hrbr_local action=workflow_list`.
- Expected: Beach exposes local workflow actions backed by the SDK local workflow runner.
- Actual: MCP validation rejected the action because no local workflow action exists.
- Evidence: Validation error listed bootstrap/status/credential/plugin/tool/exec/job/app actions only.
- Suspected cause: `runHarborLocalWorkflow` exists in `@hrbr/runtime-local`, but Beach has not exposed workflow refs or runs.
- Fix status: fixed. `hrbr_local` now supports `workflow_list`, `workflow_add`, `workflow_delete`, `workflow_run`, `workflow_manifest`, and `workflow_replay`.
- Retest:
  - Created `/tmp/harbor-sdk-beach-iter7-workflows.GRNo9Z/workflow-plugin.json` and `demo-workflow.json`.
  - `plugin_add` installed tool `wf.lookup`.
  - `workflow_add path=demo-workflow.json name="Demo Workflow"` returned workflow metadata.
  - `workflow_list` returned one workflow.
  - `workflow_run workflow_id=demo-workflow` returned final output `{ ok: true, final: "from-tool" }` and both tool/job step outputs.
  - `workflow_manifest` returned required tools, schema, and step metadata.
  - `workflow_replay` returned replay input, output, and steps.
  - After deleting the plugin, workflow run failed with `Required workflow tool is missing: wf.lookup`.
  - `workflow_delete path=demo-workflow.json` returned `deleted: true`.

## Iteration 7 Fix Plan

Add local workflow actions to `hrbr_local` using JSON workflow manifests and the SDK workflow runner.

1. Extend `hrbr_local` schema with:
   - `workflow_list`
   - `workflow_add`
   - `workflow_delete`
   - `workflow_run`
   - `workflow_manifest`
   - `workflow_replay`
2. Store workflow refs in `.harbor/registry-dev-refs.json` with `kind=workflow`.
3. Support JSON workflow manifests matching `HarborLocalWorkflowDefinition`.
4. Run workflows through `runHarborLocalWorkflow` using the local tool index.
5. Retest add/list/run/manifest/replay/delete and missing required tool behavior.

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
