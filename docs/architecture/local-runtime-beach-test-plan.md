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

No tests have been run yet.

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

