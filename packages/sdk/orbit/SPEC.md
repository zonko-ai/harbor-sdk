# @hrbr/orbit SPEC

`@hrbr/orbit` defines Harbor Orbit execution-layer contracts for `orbit.*` capabilities. It models workspace-scoped execution primitives, not raw Cloudflare bindings.

```text
   Harbor exec layer
      │
      ├──▶ orbit.storage.*       : workspace blobs/artifacts
      ├──▶ orbit.cache.*         : scoped TTL cache
      ├──▶ orbit.ai.*            : policy-routed model tasks
      ├──▶ orbit.tools.*         : in-run tool discovery
      ├──▶ orbit.db.*            : workspace execution database
      ├──▶ orbit.usage           : primitive activity audit
      ├──▶ orbit.jobs.*          : named workspace functions
      ├──▶ orbit.apps.*          : public app surfaces
      └──▶ orbit.socket.*        : signed realtime rooms
```

Conclusion: Orbit is Harbor's stable capability API; Cloudflare products are implementation lanes behind it.

## Design boundary

Orbit contracts are scoped to Harbor's remote execution layer:

- API routes own ingress, authz, workspace policy, and request validation.
- Sandbox runtime calls derive workspace/run authority from a trusted execution envelope.
- SDK modules define Effect v4 schemas and TypeScript types for those contracts.
- Cloudflare bindings stay private to `apps/api` and executor implementations.

```text
   API request body                    sandbox runtime call
   ───────────────                     ────────────────────
   includes workspace_id       │       derives workspace_id from run context
   checks user/workspace scope │       cannot choose workspace_id
   validates request schema    │       calls host dispatcher
```

## Non-goals

- No raw R2/KV/D1/Vectorize/Durable Object/Workers AI exports.
- No raw Durable Object facet, `subAgent`, `runFiber`, or Agent SQL APIs.
- No arbitrary SQL, table-name access, or user-defined query execution.
- No secrets-as-strings API.
- No route handlers or runtime implementation inside the SDK.
- No claim that Cloudflare Agents SDK replaces `/plugins/execute`.
- No claim that fibers resume arbitrary sandbox JavaScript mid-instruction.

## Package contract

- Schemas use Effect v4 `Schema` APIs.
- Every exported schema has a same-name type alias.
- Primitive modules map to public `orbit.*` namespaces.
- `@hrbr/orbit/runtime` defines host adapter contracts for local runtimes,
  tests, and Harbor's hosted execution layer.
- Apps should prefer subpath imports.
- `src/index.ts` re-exports stable modules for convenience only.

```ts
import { OrbitStorageListBody } from "@hrbr/orbit/storage"
import { OrbitAiModelsResponse } from "@hrbr/orbit/ai"
import { createMemoryOrbitRuntime } from "@hrbr/orbit/runtime"
```

## Module table

| Orbit namespace | Code module | Package export | Spec | Status |
|---|---|---|---|---|
| shared primitives | `src/common.ts` | `@hrbr/orbit/common` | [Common](./specs/00-common.spec.md) | current |
| usage/audit | `src/usage.ts` | `@hrbr/orbit/usage` | [Usage](./specs/01-usage.spec.md) | current |
| `orbit.storage.*` | `src/storage.ts` | `@hrbr/orbit/storage` | [Storage](./specs/02-storage.spec.md) | current |
| `orbit.cache.*` | `src/cache.ts` | `@hrbr/orbit/cache` | [Cache](./specs/03-cache.spec.md) | runtime-only placeholder |
| `orbit.ai.*` | `src/ai.ts` | `@hrbr/orbit/ai` | [AI](./specs/04-ai.spec.md) | current + expanding |
| runtime adapters | `src/runtime.ts` | `@hrbr/orbit/runtime` | n/a | current |
| `orbit.jobs.*` | `src/jobs.ts` | `@hrbr/orbit/jobs` | [Jobs](./specs/10-jobs.spec.md) | planned; Coast/Lighthouse callable functions |
| `orbit.apps.*` | `src/apps.ts` | `@hrbr/orbit/apps` | [Apps](./specs/11-apps.spec.md) | current |
| `orbit.socket.*` | `src/socket.ts` | `@hrbr/orbit/socket` | [Socket](./specs/12-socket.spec.md) | current |

## Deferred modules

These are intentionally deferred and should not be implemented from this spec pass:

| Namespace | Reason to defer |
|---|---|
| `orbit.sources.*` | Requires SourceFacetDO/MCP health model; public API starts read-only later. |
| `orbit.browser.*` | Requires browser policy, allowlists, artifact schema, and abuse controls. |
| `orbit.net.*` | Requires egress policy and `globalOutbound`/Outbound Worker contract. |
| `orbit.secrets.*` | Requires secret-reference and host-side injection model. |
| `orbit.deploy.*` | Requires Worker Forge review, revocation, quota, and billing model. |
| `orbit.context.*` | Depends on source contracts stabilizing. |

## Source documents

Use these as the starting corpus for future research passes and implementation reviews:

| Area | Sources |
|---|---|
| Harbor execution architecture | `docs/architecture/execution-layer-shape.md`, `docs/architecture/tiered-execution-design.md`, `docs/architecture/durable-objects-migration.md` |
| Orbit SDK/runtime baseline | `packages/sdk/orbit/*`, `apps/api/src/routes/orbit.ts`, `apps/api/src/plugins/sandbox/orbit-primitives.ts`, `apps/api/src/plugins/sandbox/index.ts` |
| Cloudflare runtime references | `https://developers.cloudflare.com/ai-gateway/`, `https://developers.cloudflare.com/workers-ai/`, `https://developers.cloudflare.com/d1/`, `https://developers.cloudflare.com/workflows/`, `https://developers.cloudflare.com/queues/` |

## Coast and Lighthouse job surfaces

Jobs are the planned named-function surface for LLMs and agents. Agents should discover, inspect, publish, and run jobs through Coast or Lighthouse, not by generating raw `exec` code to call internal APIs.

```text
   Coast CLI       hrbr job list / inspect / publish / run
   Lighthouse MCP  jobs action=list / inspect / publish / run
```

The same job invocation contract can later run through sandbox, Workers for Platforms, container, or local lanes without changing the Coast/Lighthouse call shape. Workers for Platforms is a later promoted-worker lane, not the default path for normal job runs.

## Cross-module ordering

```text
   common ──▶ usage ──┬──▶ storage
                      ├──▶ cache
                      ├──▶ socket
                      ├──▶ ai
                      ├──▶ jobs
                      └──▶ apps
```

Usage comes early because every primitive should share one operation vocabulary.

## Compileable example

`examples/sdk-orbit-runtime` shows the intended public SDK shape: a developer
can compose local storage/cache/usage with host-provided tools, socket, DB, and
AI adapters. The example deliberately does not expose `createHarbor()` or any
turnkey SaaS-control-plane scaffold.

## Spec index

- [Common](./specs/00-common.spec.md)
- [Usage](./specs/01-usage.spec.md)
- [Storage](./specs/02-storage.spec.md)
- [Cache](./specs/03-cache.spec.md)
- [AI](./specs/04-ai.spec.md)
- [Jobs](./specs/10-jobs.spec.md)
- [Apps](./specs/11-apps.spec.md)
- [Socket](./specs/12-socket.spec.md)
