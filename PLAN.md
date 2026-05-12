# Harbor SDK Backend Rebuild Plan

## Objective

Build a new Harbor backend implementation in this repository using the Harbor
SDK primitives, without changing the neighboring `../harbor` repository. Use the
main Harbor repo only as read-only reference and for dev/staging environment
shape. Fix SDK gaps in this repo when the rebuild exposes incorrect or missing
SDK behavior, then open a PR to `main` with the reasoning.

## Checklist

- [x] Read `docs/architecture/harbor-sdk-spec.md` and confirm the SDK boundary:
  composable primitives, no public turnkey `createHarbor()` API.
- [x] Confirm working branch in `harbor-sdk` for SDK and rebuild changes.
- [x] Inspect the neighboring Harbor repo SDK and backend shape as read-only
  reference.
- [x] Inspect the current SDK packages and examples to identify available
  primitives.
- [x] Create a new Harbor backend folder in this repo that depends on local SDK
  packages.
- [x] Implement backend routes using SDK primitives for workspaces, sources,
  tools, runs/traces, credentials, policy, and Orbit where available.
- [x] Copy or adapt dashboard/frontend assets from the main Harbor repo only
  when needed, without editing `../harbor`.
- [x] Use only dev/staging environment names and document required env vars;
  do not touch production env.
- [x] Run typechecks/tests for SDK packages and the new backend.
- [x] Fix SDK implementation gaps found during the rebuild.
- [x] Perform completion audit against every explicit requirement.
- [ ] Commit changes and create a PR to `main` with summary, tests, and SDK
  reasoning.

## Notes

- The public SDK spec explicitly says Harbor SaaS remains the productized
  control plane. This rebuild should be an internal validation/example backend
  composed from primitives, not a new public all-in-one SDK surface.
- `../harbor` is read-only for this task.
- The new backend package is `apps/harbor-backend`. It is intentionally a
  validation app, not a public SDK facade.
- Dashboard/frontend copying was not needed for the backend validation slice;
  this repo now exposes Harbor-compatible API routes that an existing frontend
  can target.
- The rebuild did not expose a failing SDK primitive; no existing SDK package
  required behavior fixes beyond adding the backend validation app.
- Follow-up integration request added backend-local env templates, ignored
  `.env.dev` / `.env.staging` support, and a redacted live staging Cloudflare
  account probe at `/cloudflare/staging`.
- Frontend integration exposed missing user/profile coverage. Added
  `ROUTES.users.me` backed by the SDK `UserProfile` contract, switched Harbor
  API routes to the normal `{ success: true, data }` envelope, and taught
  `@hrbr/client` to unwrap that envelope before schema decoding.

## Completion Audit

- Requirement: read `docs/architecture/harbor-sdk-spec.md`.
  Evidence: the implementation keeps the SDK primitive boundary and does not add
  a public `createHarbor()` facade.
- Requirement: inspect `../harbor` SDK and backend without changing it.
  Evidence: compared `../harbor/packages/sdk`, `../harbor/apps/api`, and
  `../harbor/.env.dev.example` / `.env.staging.example`; `git -C ../harbor
  status --short` shows only pre-existing untracked files and no tracked edits
  from this work.
- Requirement: build a new Harbor backend in a new folder using `harbor-sdk`.
  Evidence: `apps/harbor-backend` is a new workspace package depending on local
  `@hrbr/*` SDK packages.
- Requirement: backend should use SDK primitives.
  Evidence: `apps/harbor-backend/src/state.ts` composes `defineSourceAdapter`,
  `createToolRegistry`, `createCredentialResolver`,
  `createMemoryCredentialStore`, `createToolPolicy`, and
  `createMemoryTraceWriter`.
- Requirement: use dev and staging env only, do not touch prod.
  Evidence: `parseBackendEnv` accepts only `dev` and `staging`; README documents
  only `../harbor/.env.dev.example` and `.env.staging.example`, and explicitly
  says `.env.prod` is not read or written.
- Requirement: env files should be present here and staging should connect to
  Cloudflare through the env file.
  Evidence: committed `apps/harbor-backend/.env.dev.example` and
  `.env.staging.example`; local ignored `apps/harbor-backend/.env.dev` and
  `.env.staging` were copied from the non-production Harbor env files for
  testing; `bun run --filter @hrbr/harbor-backend dev:staging` loads
  `.env.staging`, `/health` reports staging Cloudflare readiness, and
  `/cloudflare/staging` returned `ok: true` with HTTP status 200 for the
  Cloudflare account API.
- Requirement: dashboard/frontend can be copied from main Harbor repo.
  Evidence: no copy was needed for the backend validation slice; the new backend
  serves Harbor-compatible API route contracts that the existing frontend can
  target.
- Requirement: avoid stale/dead code.
  Evidence: the backend is a focused in-memory route adapter rather than a copy
  of `../harbor/apps/api` internals.
- Requirement: create and maintain a plan file.
  Evidence: this `PLAN.md` is the running checklist and audit.
- Requirement: validate behavior.
  Evidence: `bun run typecheck` passed; `bun test packages/sdk/*/test
  packages/workflows/test apps/harbor-backend/test` passed with 115 passing
  tests and 4 skipped bundled-publish tests.
- Requirement: Harbor frontend should work against the SDK backend.
  Evidence: after adding `users/me` and the success envelope, proxied
  `POST http://localhost:3000/api/hrbr/users/me`,
  `/api/hrbr/workspaces/list`, and `/api/hrbr/plugins/tools/search` returned
  HTTP 200 with `success: true` payloads from the SDK backend.
