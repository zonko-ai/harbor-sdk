# @hrbr/client

Harbor client package for API consumers and integration authors.

The default entrypoint is Promise-first:

```ts
import { createHarborClient } from '@hrbr/client'

const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: process.env.HARBOR_WORKSPACE_ID!,
  auth: { kind: 'api_key', key: process.env.HARBOR_API_KEY! },
})

const run = await harbor.runtime.execute({
  code: 'return { ok: true }',
})
```

Use `@hrbr/client/effect` when the host application wants an Effect-native client:

```ts
import { Effect } from 'effect'
import { HarborClient, createHarborEffectClient } from '@hrbr/client/effect'

const harbor = createHarborEffectClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: process.env.HARBOR_WORKSPACE_ID!,
  auth: { kind: 'api_key', key: process.env.HARBOR_API_KEY! },
})

const result = await Effect.runPromise(harbor.runtime.execute({ code: 'return { ok: true }' }))

const layer = HarborClient.layer({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: process.env.HARBOR_WORKSPACE_ID!,
  auth: { kind: 'api_key', key: process.env.HARBOR_API_KEY! },
})
```

`@hrbr/client/client` and `@hrbr/client/promise` are also Promise-facing subpaths. They exist for callers that prefer an explicit client module, while the root package remains the normal public SDK import.

## Client Surface

The SDK composes around the generated Harbor API client instead of introducing a separate product model:

- `api`: generated OpenAPI resources for direct control-plane calls.
- `workspaces`: generated workspace list/get helpers with the composed client shape.
- `workspace(workspaceId)`: creates a workspace-bound client for runtime and trigger operations.
- `runtime` and `triggers`: Harbor-owned helpers that resolve workspace context locally, then call generated API resources.
- `sources`, `registry`, `tools`, `credentials`, `oauth`, `runs`, `policies`, `audit`, `jobs`, `apps`, and `workflows`: workspace-scoped control-plane groups.

Root methods return Promises. The Effect subpath adapts the same client surface into `Effect.Effect` values.

## Auth Modes

`api_key` means a Harbor workspace API key. It uses bearer transport on the wire, but the SDK keeps the credential type explicit:

```ts
const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: 'workspace_123',
  auth: { kind: 'api_key', key: process.env.HARBOR_API_KEY! },
})

await harbor.api.getHealth()
await harbor.runtime.execute({ code: 'return { ok: true }' })
```

`bearer` means an app-owned OAuth/AuthKit/WorkOS access token or another Harbor-accepted bearer credential:

```ts
const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: 'workspace_123',
  auth: {
    kind: 'bearer',
    tokenProvider: async () => await getCurrentWorkosAccessToken(),
  },
})

await harbor.sources.list({ limit: 25 })
```

API-key clients require `workspaceId` at construction and fail before any network call when it is missing. Bearer clients may list visible workspaces first and bind an explicit workspace client later.

## Login With Harbor

External browser, mobile, and server apps should treat Harbor as a resource API and WorkOS/AuthKit as the OAuth authorization layer. They should own PKCE state, authorization-code exchange, refresh, cookies, and token storage, then pass only the current access token or token provider into `createHarborClient`.

`createHarborOAuthAuthorizeUrl` builds an authorization URL when the caller already owns PKCE state:

```ts
import { createHarborOAuthAuthorizeUrl } from '@hrbr/client'

const authorizeUrl = createHarborOAuthAuthorizeUrl({
  authorizationServerUrl: 'https://auth.your-workos-domain.com',
  clientId: 'client_123',
  redirectUri: 'https://app.example.com/oauth/callback',
  state,
  codeChallenge,
  resource: 'https://api.tryharbor.ai',
})
```

For CLI, desktop, and server-side tools that want the SDK to handle Harbor API-key minting, use the device login helpers from `@hrbr/client/auth`:

```ts
import { pollHarborDeviceLogin, startHarborDeviceLogin } from '@hrbr/client/auth'

const login = await startHarborDeviceLogin({
  baseUrl: 'https://api.tryharbor.ai',
})

console.log('Open:', login.verificationUriComplete)

let client
for (;;) {
  const result = await pollHarborDeviceLogin({
    baseUrl: 'https://api.tryharbor.ai',
    deviceCode: login.deviceCode,
  })
  if (result.status === 'pending') {
    await new Promise((resolve) => setTimeout(resolve, login.interval * 1000))
    continue
  }
  if (result.status === 'expired') throw new Error('Harbor login expired')
  client = result.client
  break
}

await client.api.getHealth()
```

The device flow mints a temporary switch key first, exchanges it for a workspace-scoped API key, and returns a ready Promise client using `auth: { kind: 'api_key' }`.

## Workspace Composition

Most application code should resolve the workspace from application state or an environment variable, then pass a workspace-bound client through the job:

```ts
const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: process.env.HARBOR_WORKSPACE_ID!,
  auth: { kind: 'api_key', keyProvider: getCurrentHarborApiKey },
})

const workspace = harbor.workspace(process.env.HARBOR_WORKSPACE_ID!)

const run = await workspace.runtime.execute({
  mode: 'exec',
  sources: [{ namespace: 'github' }],
  code: 'return await github.get_repo({ repository_full_name: "zonko-ai/harbor" })',
})
```

The SDK does not persist a workspace cache, perform hidden workspace discovery, read local CLI auth-store state, or hide ambiguity across sessions.

## Generated API

The generated API client is available through `harbor.api` and `@hrbr/client/generated/harbor`:

```ts
import type { Workspace } from '@hrbr/client/generated/harbor'

const health = await harbor.api.getHealth()
const openapi = await harbor.api.getHarborOpenApi()
const workspaces = await harbor.api.listWorkspaces({ limit: 25, include_total: true })
const selected: Workspace = workspaces.data[0]!
const detail = await harbor.api.getWorkspace({ workspace_id: selected.id })
```

Use the composed resource groups first. Keep `harbor.api` for raw protocol access and discovery flows.

## Runtime Results

`runtime.execute` preserves the raw `result` and also returns typed `content`
blocks for cross-language clients:

```ts
const exec = await harbor.runtime.execute({
  code: 'return "hello"',
})

console.log(exec.result)
console.log(exec.content?.[0])
console.log(exec.run_id)
```

`result` can be a string, number, object, array, null, or any JSON-compatible
value returned by the executed code. `content` is the language-friendly view:

- `type: 'text'` carries returned text in `text`.
- `type: 'json'` carries returned JSON in `json`.
- `type: 'skill_bundle'` carries an explicit Harbor skill bundle in `skill`.

Skill bundles are never inferred from arbitrary returned objects. User code must
return the explicit Harbor envelope when it wants the SDK to expose a loadable
skill bundle:

```ts
const exec = await harbor.runtime.execute({
  code: `
    return {
      kind: 'harbor.execute_result',
      result: 'Loaded harbor skill',
      content: [{
        type: 'skill_bundle',
        skill: {
          slug: 'harbor',
          content: '---\\nname: harbor\\n---\\n# Harbor\\n',
          content_hash: 'abc123def456',
          files: []
        }
      }]
    }
  `,
})
```

## Telemetry

Each SDK HTTP request gets a `harbor.client.http` span and a W3C `traceparent` header unless the caller already supplied one. The default Promise client accepts sync or Promise telemetry callbacks so normal application code does not need Effect.

```ts
const harbor = createHarborClient({
  baseUrl: 'https://api.tryharbor.ai',
  workspaceId: process.env.HARBOR_WORKSPACE_ID!,
  auth: { kind: 'api_key', key: process.env.HARBOR_API_KEY! },
  telemetry: {
    event: (event) => console.debug(event),
    warning: (warning) => console.warn(warning),
    span: async (span, operation) => {
      const startedAt = Date.now()
      try {
        return await operation()
      } finally {
        console.debug(span.name, Date.now() - startedAt)
      }
    },
    redact: (value) => value,
  },
})
```

Use the `@hrbr/client/effect` subpath when the whole caller program is Effect-native.
That subpath uses `effect` as an optional peer dependency, so Promise-only
applications do not install or typecheck against Effect. Install the matching
repo-pinned Effect v4 beta in hosts that import `@hrbr/client/effect`.

## Boundary

- External apps should use `@hrbr/client` by default.
- Effect-native apps should use `@hrbr/client/effect` explicitly.
- The generated client is exposed for protocol-level discovery and raw route access.
- Local CLI auth-store helpers are not part of the external SDK root.
- `@hrbr/sdk` remains the system/building-block SDK, not the public application client.
