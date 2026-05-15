# Local Harbor MCP Console

Status: planned

## Boundary

Local Harbor MCP Console is a repo-local product app built on the Harbor SDK. It
is not a new public SDK promise and not a clone of hosted Harbor.

The app belongs under:

```text
apps/harbor-local
```

The reusable MCP lifecycle remains in SDK packages:

```text
packages/sdk/sdk
packages/sdk/runtime-local
packages/sdk/source-mcp
packages/sdk/registry-catalog
```

## V1 Scope

V1 is a fully offline MCP plugin console:

- project-local `.harbor/` state by default
- SQLite local runtime backend
- encrypted credential and OAuth token storage
- MCP catalog from a checked-in generated seed
- custom HTTP MCP URL install
- MCP auth modes `none` and `oauth2`
- localhost OAuth callback
- automatic tool discovery after connect
- lexical/BM25-style tool search
- tool schema inspection
- direct tool invocation
- persisted invocation history
- local diagnostics
- browser-facing local API server for the UI

The browser-facing local API is a product layer over `@hrbr/sdk/local`. It does
not replace the existing client SDK:

```ts
import { createHarbor } from "@hrbr/sdk/local"
```

The local API server should call that SDK facade, and the UI should call the
local API server.

## Explicit Non-Goals

V1 must not include:

- WorkOS or hosted Harbor user auth
- hosted workspaces or team membership
- Harbor cloud runtime dependency
- Cloudflare runtime
- Orbit
- workflows
- apps
- jobs
- chat or agents
- STDIO MCP process management
- vector or embedding search
- write confirmations
- hosted app publishing
- billing, audit, or organization admin surfaces

## Catalog Source

The local catalog seed should be generated from Harbor main staging metadata, not
invented by the local app.

Maintainer flow:

1. Use `../harbor/.env.staging` to inspect Harbor main staging Cloudflare D1.
2. Combine staging D1 MCP metadata with checked-in registry metadata where
   needed.
3. Export only local-safe MCP catalog fields into this repo.
4. Commit the generated seed.

Runtime flow:

1. Local Harbor reads the checked-in seed.
2. Local Harbor does not call staging D1.
3. Users can also install a custom MCP URL that is not in the seed.

Allowed seed fields:

- slug
- display name
- description
- category
- default namespace
- endpoint
- transport
- auth mode
- OAuth discovery metadata
- availability or verified status
- icon metadata
- links

Forbidden seed fields:

- workspace data
- user data
- OAuth grants
- credentials
- WorkOS identifiers
- install jobs
- hosted-only source state
- raw encrypted secret values

## Local State

By default, local Harbor uses the current working directory:

```text
<project>/.harbor/harbor.sqlite
<project>/.harbor/credentials.enc
<project>/.harbor/registry-dev-refs.json
```

Supported overrides:

```bash
HARBOR_LOCAL_PROJECT_DIR=/path/to/project
HARBOR_LOCAL_OAUTH_PORT=8789
```

The server binds to `127.0.0.1` by default.

## Product API Shape

The local app should expose a small internal API for the UI:

```text
GET  /api/catalog
GET  /api/sources
POST /api/sources/install
POST /api/sources/:id/oauth/start
POST /api/sources/:id/refresh
GET  /api/tools/search
GET  /api/tools/:id/schema
POST /api/tools/:id/invoke
GET  /api/invocations
```

The API is allowed to evolve while the app is internal. It should still return
structured errors and status values because the UI needs reliable state.

## SDK Responsibilities

The SDK owns:

- local project initialization and migrations
- encrypted credential storage
- OAuth flow, refresh, and reconnect status
- MCP source install/update
- MCP endpoint probing
- MCP discovery and tool binding persistence
- tool search
- schema lookup
- invocation
- structured SDK errors and logs

The app owns:

- local HTTP routes
- UI-specific response shaping
- catalog presentation
- OAuth open/connect UX
- tool browser UX
- invocation form UX
- invocation history presentation
- diagnostics presentation

## UI Reuse

Use Harbor main as reference for:

- plugin cards
- namespace collision handling
- OAuth connect panels
- connected source status cards
- tool accordion/search
- plugin detail layout

Do not import hosted-only assumptions such as workspace context, WorkOS auth,
hosted API hooks, install jobs, source visibility, or team permissions.
