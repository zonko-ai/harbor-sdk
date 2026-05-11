# 03 — `orbit.cache.*`

`@hrbr/orbit/cache` owns scoped execution cache contracts. It is not a KV API.

## Purpose

`orbit.cache.*` provides short-lived, workspace-scoped cache state for expensive intermediate work.

```text
   orbit.cache key ──▶ ws:{workspaceId}:{key} ──▶ KV TTL entry
```

## Current status

Runtime-only today. There is no public API route and no Coast command.

Current runtime:

```ts
orbit.cache.get(key)
orbit.cache.set(key, value, opts?)
orbit.cache.delete(key)
```

## Semantics

- Cache is not canonical state.
- Values may expire or be stale.
- TTL is required or capped by runtime policy.
- KV eventual consistency must be visible in the spec language.
- Cache values must stay workspace-scoped by the host.

## Planned SDK contracts

Only add route/request schemas if cache becomes a public API surface. For now, keep the module as the namespace home for runtime type declarations.

Possible future helper:

```ts
orbit.cache.memo(key, fn, opts?)
```

`memo` must be best-effort and explicitly TTL-bound.

## Non-goals

- No locks.
- No durable workflow state.
- No canonical memory metadata.
- No raw KV namespace operations.
- No compare-and-swap semantics unless backed by a stronger store.

## Usage operations

Reserve operation names:

```text
cache.get
cache.set
cache.delete
cache.memo
```

## Source documents

Start future cache research from:

- `apps/api/src/plugins/sandbox/orbit-primitives.ts` — current KV-backed `orbit.cache.*` runtime behavior, key prefixing, TTL bounds, and serialization.
- `packages/sdk/orbit/src/cache.ts` — current placeholder module.
- `https://developers.cloudflare.com/kv/` — Workers KV behavior and consistency model.
- [AI](./04-ai.spec.md) — AI helpers may use cache for model/embedding results where policy allows.

## Cross-links

- [Common](./00-common.spec.md)
- [Usage](./01-usage.spec.md)
- [AI](./04-ai.spec.md)
