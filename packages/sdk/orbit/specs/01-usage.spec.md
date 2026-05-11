# 01 — Orbit usage and audit contracts

`@hrbr/orbit/usage` owns contracts for audited `orbit.*` primitive activity.

## Purpose

Usage records explain what Orbit primitive did work, against what target, for which workspace/run, and whether it succeeded.

```text
   orbit.* call ──▶ host dispatch ──▶ usage/event row ──▶ run/audit surfaces
```

Conclusion: every new primitive should extend the shared usage vocabulary instead of inventing per-module logs.

## Current exports

```ts
OrbitUsageQueryBody
OrbitUsageRow
OrbitUsageQueryResponse
```

Current API route:

```text
POST /orbit/usage
```

## Current row fields

```text
id
run_id
workspace_id
operation
key
model
size_bytes
duration_ms
error
created_at
```

## Required evolution

Before broad primitive expansion, `operation` should stop being an unstructured free string. Add a shared taxonomy with at least:

```text
primitive     storage | cache | ai | db | jobs | apps | socket
operation     put | get | list | delete | run | models | publish | inspect | open
status        ok | error | denied | unavailable | cancelled
reason_code   missing_binding | policy_denied | invalid_input | upstream_error | timeout
```

Future usage/event fields should reserve:

```text
parent_run_id
child_run_id
target
resource_refs
units_json
error_code
```

## Operation naming

Use dot nomenclature for all new rows:

```text
storage.put
storage.get
storage.list
storage.delete
storage.url
storage.download
cache.get
cache.set
cache.delete
ai.run
ai.generate
ai.summarize
ai.embed
ai.classify
ai.rerank
ai.models
db.exec
db.query
db.first
db.batch
jobs.publish
jobs.inspect
jobs.run
jobs.disable
jobs.version.create
apps.publish
apps.inspect
apps.open
apps.disable
```

Token values must never be persisted in usage rows. Usage may store token lease IDs, scope, TTL, and sanitized reason codes.

## Audit guarantees

- Usage logging is best-effort for low-level runtime calls unless a primitive explicitly requires durable audit.
- Workflow, session, approval, token lease, cancellation, payment, and policy-denied events require durable audit.
- Errors must be sanitized before persistence.
- Public usage queries must remain workspace-scoped.

## Non-goals

- No analytics warehouse contract.
- No raw Cloudflare diagnostics-channel event passthrough.
- No billing contract until unit/cost semantics are explicitly designed.

## Source documents

Start future audit/usage research from:

- `apps/api/src/plugins/sandbox/orbit-primitives.ts` — current `orbit_usage_log` write collector and runtime operation names.
- `apps/api/src/routes/orbit.ts` — current `/orbit/usage` query route.
- `apps/api/migrations/0032_orbit_usage_log.sql` — current D1 usage table shape.
- `docs/architecture/runs-traces-data-flow.md` — Harbor run/event/audit data-flow context.
- `docs/architecture/execution-layer-shape.md` — execution-layer boundary and audit positioning.
- `https://developers.cloudflare.com/agents/api-reference/observability/` — Agents diagnostics channels and event categories.

## Cross-links

- [Storage](./02-storage.spec.md)
- [Cache](./03-cache.spec.md)
- [AI](./04-ai.spec.md)
- [Jobs](./10-jobs.spec.md)
- [Apps](./11-apps.spec.md)
- [Socket](./12-socket.spec.md)
