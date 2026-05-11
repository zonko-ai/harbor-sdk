# 11 — `orbit.apps.*`

`@hrbr/orbit/apps` owns contracts for deployable public HTTP app surfaces that compose private Orbit jobs.

## Purpose

An Orbit app is a named, versioned, workspace-scoped web surface. It is deployed as a Workers for Platforms dispatch script behind a Harbor-owned public gateway.

```text
Browser
  -> Harbor app gateway real Worker
  -> private orbit.app WFP dispatch Worker
  -> signed jobs.run host call
  -> private orbit.job WFP dispatch Worker
  -> Orbit primitives / MCP / API clients
```

Apps are not forms, raw Workers, raw dispatch namespace scripts, or generic deploys. They are the public ingress and presentation primitive above jobs.

## Boundary

Apps may:

- declare HTTP routes
- serve HTML / JSON / text / redirects
- parse query / JSON / form / raw request input
- call declared jobs by alias

Apps may not:

- access raw Cloudflare bindings
- call `orbit.db`, `orbit.storage`, `orbit.cache`, `orbit.ai`, MCP, or API clients directly
- choose arbitrary job names at runtime
- receive public traffic directly
- own workspace auth or admin checks without gateway enforcement

All effectful stateful work must go through `orbit.jobs`.

## Proposed app definition

```ts
import { defineOrbitApp } from "@hrbr/orbit/apps"

export default defineOrbitApp({
  name: "neocloud-agents",
  description: "Public waitlist page backed by private jobs",
  jobs: {
    render: { name: "neocloud-agents-render", version: "v1" },
    submit: { name: "neocloud-agents-submit", version: "v1" },
  },
  routes: [
    { method: "GET", path: "/", auth: "public", input: "query", output: "html", job: "render" },
    { method: "POST", path: "/join", auth: "public", input: "json", output: "json", job: "submit" },
  ],
})
```

## Contracts

```ts
OrbitAppName
OrbitAppVersion
OrbitAppStatus
OrbitAppVersionStatus
OrbitAppRouteMethod
OrbitAppRouteAuth
OrbitAppInputAdapter
OrbitAppOutputAdapter
OrbitAppRateLimit
OrbitAppJobRef
OrbitAppRoute
OrbitAppListBody / Response
OrbitAppInspectBody / Response
OrbitAppPublishBody / Response
OrbitAppDisableBody / Response
OrbitAppOpenBody / Response
```

## Route auth

```text
public            anonymous traffic allowed by gateway policy
workspace_member  gateway must authenticate and authorize workspace membership
signed_link       future opaque signed-link actor
auth service      future first-party service actor
```

## Lifecycle

```text
publish
  -> validate route manifest
  -> resolve and pin declared jobs to ready versions
  -> require each job has ready worker_platform deployment
  -> store immutable app source
  -> create app version
  -> deploy app WFP dispatch script
  -> mark app version/deployment ready
  -> expose canonical gateway URL
```

## Runtime host-call

App dispatch scripts can call only:

```text
jobs.run
```

The host validates:

- app deployment HMAC
- timestamp and nonce
- same workspace
- declared app job alias
- pinned job name/version match
- target job ready WFP deployment

## Public gateway

The public gateway owns:

- URL parsing
- workspace/app/route lookup
- route auth
- body limits
- rate limits
- actor envelope
- app invocation audit
- dispatch to app script

The app dispatch script must not be public-routed directly.

## Non-goals

- No form-specific primitive.
- No custom domains in v0.
- No raw Cloudflare Worker/deploy API.
- No direct app access to state/storage/AI/MCP.
- No durable workflow primitive.
- No sessions/facets public API.

## Cross-links

- [Jobs](./10-jobs.spec.md)
- [Usage](./01-usage.spec.md)
