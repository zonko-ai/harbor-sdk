# 00 — Common Orbit contracts

`@hrbr/orbit/common` owns shared value contracts used by all Orbit primitive modules.

## Purpose

Common contracts define tenancy and shared scalar rules. They do not model users, organizations, auth sessions, or runtime implementation.

## Current exports

```ts
OrbitWorkspaceId
```

`OrbitWorkspaceId` is a UUID workspace identifier used by API-route request bodies.

## Authority model

```text
   API routes                         sandbox runtime
   ──────────                         ───────────────
   workspace_id in body       │       workspace_id from sealed run context
   user scope checked         │       no user-selected workspace_id
   route schema decoded       │       host dispatcher validates authority
```

Conclusion: common schemas identify scope; they do not grant authority.

## Rules

- API request bodies that operate on workspace state include `workspace_id`.
- API handlers must verify workspace scope before touching storage, D1, AI, or execution state.
- Sandbox calls must not accept caller-provided `workspace_id` for authority.
- Runtime implementations may derive workspace, run, user, and agent attribution from the execution envelope.

## Non-goals

- No user/session/org schema ownership.
- No authz helpers.
- No Cloudflare account IDs or binding names.
- No runtime context object schema until the execution envelope is formalized.

## Future shared contracts

Reserve these for later modules:

```ts
OrbitRunId
OrbitWorkflowId
OrbitSessionId
OrbitOperationName
OrbitCapabilityName
OrbitReasonCode
```

Do not add them until at least two primitive modules need the exact same contract.

## Source documents

Start future common-contract research from:

- `packages/sdk/orbit/src/common.ts` — current shared Orbit workspace ID schema.
- `packages/sdk/common/src/index.ts` — shared SDK primitive conventions outside Orbit.
- `apps/api/src/effect.ts` — current API route body decoding and workspace scope helper imports.
- `apps/api/src/routes/orbit.ts` — current Orbit route workspace request patterns.
- `docs/contracts/auth-surfaces.md` — auth boundary context.
- `docs/contracts/repo-structure.md` — repo/package organization contract.
- `docs/architecture/execution-layer-shape.md` — control-plane vs execution-lane authority split.
- `packages/sdk/orbit/SPEC.md` — package-level Orbit boundary and source index.
