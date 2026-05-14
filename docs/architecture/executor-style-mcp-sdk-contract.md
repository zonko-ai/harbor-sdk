# Executor-Style MCP SDK Contract

This note locks the target MCP SDK shape before implementation. The reference
is Executor's `@executor-js/plugin-mcp`, especially the SDK files under
`packages/plugins/mcp/src/sdk`.

The goal is not to copy Executor's Effect internals. The goal is to match the
developer experience and boundary:

```ts
import { createHarborLocalRuntime } from "@hrbr/runtime-local/promise"

const harbor = createHarborLocalRuntime({ projectRoot, env: process.env })

await harbor.sources.ensureMcpSources({
  sources: [{ endpoint: "https://mcp.linear.app/mcp" }],
  connect: true,
  refresh: true,
  onAuthorizationUrl: ({ authorizationUrl }) => console.log(authorizationUrl),
})

const hits = await harbor.tools.search({ query: "my Linear issues" })
const result = await harbor.tools.invoke(hits[0].toolId, { assignee: "me" })
```

OAuth-capable MCP sources must not require users to paste provider credentials.
The SDK should open the provider auth URL, receive the local callback, encrypt
the resulting OAuth grant, and resolve it at invocation time.

## Public Surface

The local runtime should expose one MCP lifecycle object and one unified tool
surface:

```ts
interface HarborLocalRuntime {
  readonly sources: HarborLocalSourceRuntime
  readonly credentials: HarborLocalCredentialRuntime
  readonly tools: HarborLocalToolRuntime
}

interface HarborLocalSourceRuntime {
  list(): Promise<readonly HarborLocalSourceRef[]>
  getMcp(sourceId: string): Promise<HarborLocalMcpStoredSource | null>
  upsertMcp(input: HarborLocalMcpSourceInput): Promise<HarborLocalMcpStoredSource>
  connectMcpOAuth(input: HarborLocalMcpOAuthConnectInput): Promise<HarborLocalMcpOAuthConnectHandle>
  refreshMcp(sourceId: string): Promise<HarborLocalMcpRefreshSourceResult>
  setupMcp(input: HarborLocalMcpSetupInput): Promise<HarborLocalMcpSetupResult>
  ensureMcpSources(input: HarborLocalMcpEnsureSourcesInput): Promise<HarborLocalMcpEnsureSourcesResult>
}

interface HarborLocalToolRuntime {
  search(input: HarborToolSearchInput): Promise<readonly HarborToolSearchHit[]>
  schema(toolId: string): Promise<HarborToolSchema>
  invoke(toolId: string, input: unknown, options?: HarborToolInvokeOptions): Promise<unknown>
  runAction(action: HarborLocalRegistryAction, options?: HarborToolInvokeOptions): Promise<HarborLocalRegistryActionResult>
}
```

Examples and agents should consume this surface. They should not build custom
source records, OAuth flows, credential import paths, or MCP adapters directly.

## Source Input

MCP source config is transport-first:

```ts
type HarborMcpSourceInput =
  | {
      transport: "remote"
      name: string
      endpoint: string
      namespace?: string
      remoteTransport?: "streamable-http" | "sse" | "auto"
      headers?: Record<string, HarborMcpCredentialInput>
      queryParams?: Record<string, HarborMcpCredentialInput>
      auth?: HarborMcpAuthInput
    }
  | {
      transport: "stdio"
      name: string
      command: string
      args?: readonly string[]
      env?: Record<string, string>
      cwd?: string
      namespace?: string
    }
```

Stdio must be disabled by default and enabled only for trusted local contexts.
Remote transport defaults to `auto`, trying streamable HTTP before SSE.

## Auth Model

Auth must be modeled as source configuration plus credential bindings, not as
example-specific env reads:

```ts
type HarborMcpAuthInput =
  | { kind: "none" }
  | {
      kind: "header"
      headerName: string
      secretId?: string
      secretSlot?: string
      prefix?: string
    }
  | {
      kind: "oauth2"
      connectionId?: string
      connectionSlot?: string
      clientIdSlot?: string
      clientSecretSlot?: string
    }
```

OAuth-capable MCP sources use `kind: "oauth2"` as the primary flow:

1. `probeEndpoint` sends an unauthenticated MCP `initialize` request.
2. If the response advertises `WWW-Authenticate: Bearer` with resource metadata,
   the runtime discovers OAuth server metadata.
3. `connect(sourceId)` performs dynamic client registration when supported,
   creates PKCE state, opens or returns the authorization URL, receives the
   callback through the local daemon, exchanges the code, and stores encrypted
   grant tokens.
4. `invoke` resolves the current access token through the stored connection and
   passes it into the MCP client transport.

Manual bearer/env import is fallback-only for non-OAuth MCPs, tests, or
developer overrides. Linear MCP and Notion MCP should use OAuth callback by
default.

## Storage Model

The local runtime should store MCP state in normalized tables instead of one
opaque example manifest:

| Concept | Local storage |
| --- | --- |
| Source structural config | `mcp_sources` |
| Auth mode and source-owned slots | `mcp_sources` auth columns |
| Header/query param credential refs | `mcp_source_headers`, `mcp_source_query_params` |
| Tool binding to original MCP tool name | `mcp_tool_bindings` |
| Searchable tool index | existing `tool_index` or a view over bindings |
| OAuth pending flow/client/grant | existing local OAuth tables |
| Encrypted token/secret material | `.harbor/credentials.enc` |

Tool ids are Harbor-facing ids such as `linear_mcp.list_issues` or
`linear-mcp.list_issues`. Tool bindings must preserve the original MCP tool name
so invocation can call `client.callTool({ name, arguments })`.

Every source row, credential binding, and tool binding should carry the owning
workspace/scope identity. Local runtime can start with `local`, but the schema
should not prevent later per-user or hosted scope isolation.

## Lifecycle

`probeEndpoint` should classify:

- connected MCP endpoint
- OAuth-required MCP endpoint
- wrong-shape endpoint
- unreachable endpoint

`addSource` should persist the source even when discovery cannot complete
because auth is missing. That lets UIs and examples show a connect action.

`connect` should only handle authentication. It should not manually install
tools. After connect, callers should run `refreshSource` or let `connect` return
that a refresh is needed.

`refreshSource` should connect with resolved credentials, call MCP `listTools`,
persist durable tool bindings, and update the searchable tool index.

`invoke` should:

- load the stored tool binding and source config
- resolve credentials just-in-time
- acquire or create an MCP client connection
- call the original MCP tool name
- retry once after invalidating the connection cache on transport failure
- route MCP elicitation through the host approval/elicitation handler

## Safety Requirements

Implementation is incomplete until the SDK has tests for:

- OAuth MCP callback flow with encrypted grant storage
- Linear/Notion-style OAuth-protected-resource metadata probing
- source persists when auth blocks discovery
- refresh discovers tools after connect
- invocation resolves OAuth tokens at call time
- no credential leakage across scopes/users
- connection pooling reuses the same source connection for repeated calls
- different sources do not share cached connections accidentally
- destructive MCP annotations become approval requirements
- stdio is rejected unless explicitly enabled
- MCP elicitation is bridged to the host handler

Fixture examples are useful, but they are not a substitute for SDK lifecycle
tests.

## Example Shape

The Linear and Notion examples should not own setup lifecycle logic. They should
declare the MCP URLs and call the SDK:

```ts
import { createHarborLocalRuntime } from "@hrbr/runtime-local/promise"

const harbor = createHarborLocalRuntime({ projectRoot, env: process.env })
await harbor.sources.ensureMcpSources({
  sources: [
    { endpoint: "https://mcp.linear.app/mcp" },
    { endpoint: "https://mcp.notion.com/mcp" },
  ],
  connect: true,
  refresh: true,
})

const result = await harbor.tools.invoke("linear-mcp.list_issues", {
  assignee: "me",
})
```

The Flue example should only point at the same runtime:

```ts
import {
  createHarborLocalRuntime,
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryAgentStepSchema,
} from "@hrbr/runtime-local/promise"

const harbor = createHarborLocalRuntime({ projectRoot, env })
await harbor.sources.ensureMcpSources({
  sources: [
    { endpoint: "https://mcp.linear.app/mcp" },
    { endpoint: "https://mcp.notion.com/mcp" },
  ],
  connect: true,
  refresh: true,
})
const { data: next } = await session.prompt(prompt, {
  result: harborLocalRegistryAgentStepSchema,
})
const output = await harbor.tools.runAction(harborLocalRegistryActionFromAgentStep(next))
```

Flue owns the agent session, model, and the MCP URL list. Harbor SDK owns MCP
source lifecycle, OAuth, credential resolution, refresh, discovery/indexing,
search, schema lookup, policy, invocation, and registry action validation.
Example code may define its final response schema, because that contract belongs
to the app or agent using the SDK.

## First Implementation Target

Implement this first in `@hrbr/runtime-local` using the existing local files:

- `.harbor/harbor.sqlite`
- `.harbor/credentials.enc`
- `.harbor/registry-dev-refs.json`

Keep `@hrbr/source-mcp` as the low-level protocol adapter. The new runtime
surface should orchestrate source lifecycle, auth, storage, and tool registry
behavior above that adapter.
