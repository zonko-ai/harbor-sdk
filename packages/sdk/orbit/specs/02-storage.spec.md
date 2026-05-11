# 02 — `orbit.storage.*`

`@hrbr/orbit/storage` owns workspace-scoped execution storage contracts. It is not an R2 API.

## Purpose

`orbit.storage.*` stores durable blobs and artifacts that runs and jobs can read, write, list, delete, and link.

```text
   orbit.storage key ──▶ workspace scoping ──▶ R2 object/artifact plane
```

## Current SDK exports

```ts
OrbitStorageKey
OrbitStorageEncoding
OrbitStorageObject
OrbitStorageListBody
OrbitStorageListResponse
OrbitStoragePutBody
OrbitStoragePutResponse
OrbitStorageGetBody
OrbitStorageGetResponse
OrbitStorageUrlBody
OrbitStorageUrlResponse
OrbitStorageDeleteBody
OrbitStorageDeleteResponse
```

## Current runtime API

```ts
orbit.storage.put(key, data, opts?)
orbit.storage.get(key, opts?)
orbit.storage.list(opts?)
orbit.storage.delete(key)
orbit.storage.url(key)
```

Runtime storage calls cross a JSON host-call bridge from a V8 Worker isolate. Large bytes should not cross that bridge by default.

Storage encoding rules:

- object/array data in `put` stores JSON as `application/json`
- string data stores UTF-8 text by default
- binary/media writes use explicit `encoding: "base64"`
- `get` defaults to `encoding: "auto"`
- text/json ≤64 KiB may return inline data
- media/binary and large objects return metadata plus signed download URL
- signed download URLs expire after 30 minutes and include `expires_at` / `expires_in_seconds`

## Current HTTP API

```text
POST /orbit/storage/list
POST /orbit/storage/put
POST /orbit/storage/get
POST /orbit/storage/url
POST /orbit/storage/delete
GET  /storage/download/:token
```

`/storage/download/:token` is authorized by the signed token alone until expiry. The token binds workspace id, storage key, and expiration.

## Key rules

`OrbitStorageKey`:

- non-empty
- max 512 chars
- cannot start with `/` or `\`
- cannot contain `..`

Runtime storage keys are workspace-prefixed by the host, not by user code.

## List response

All surfaces use the same envelope:

```ts
{
  objects: OrbitStorageObject[]
  truncated: boolean
  cursor?: string
}
```

Rules:

- API, SDK, web, and sandbox agree on the list envelope.
- `cursor` is honored anywhere `limit` exists.
- One default limit applies across surfaces.
- Objects include `content_type`, `download_url`, `expires_at`, and `expires_in_seconds`.

## Usage operations

Operation names use dot nomenclature:

```text
storage.put
storage.get
storage.list
storage.delete
storage.url
storage.download
```

## Non-goals

- No raw R2 methods, bucket names, account IDs, or signed URL internals.
- No alternate provider-backed storage backend in the storage implementation plan.
- No raw binary streams across the sandbox or WFP host-call JSON bridge.

## Source documents

Start future storage work from:

- `apps/api/src/orbit/storage/service.ts` — shared R2-backed storage behavior and signed download URLs.
- `apps/api/src/plugins/sandbox/orbit-primitives.ts` — runtime `orbit.storage.*` host-call wiring and usage logging.
- `apps/api/src/routes/orbit.ts` — `/orbit/storage/*` API routes.
- `packages/sdk/orbit/src/storage.ts` — SDK storage schemas.
- `https://developers.cloudflare.com/r2/` — R2 object storage backing context.

## Cross-links

- [Common](./00-common.spec.md)
- [Usage](./01-usage.spec.md)
