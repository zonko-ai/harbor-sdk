# Local Plugin Authoring

Local plugin examples show the same shape Harbor uses for hosted sources, without copying the hosted control plane into the SDK. The useful boundary is:

- source metadata and manifests live in the repo
- installed source/tool records live in `.harbor/harbor.sqlite`
- secret values live encrypted in `.harbor/credentials.enc`
- registry dev refs live in `.harbor/registry-dev-refs.json`
- generated `.harbor` state should not be committed

## Plugin Manifest Shape

For MCP plugins, prefer the SDK MCP helper. It keeps the source definition, auth method, discovery, local install, credential import, and invocation path in one reusable SDK surface:

```ts
const plugin = {
  slug: "linear-mcp",
  namespace: "linear-mcp",
  displayName: "Linear MCP",
  endpoint: "https://mcp.linear.app/mcp",
  auth: { method: "bearer", envName: "LINEAR_MCP_ACCESS_TOKEN" },
}

await installHarborLocalMcpPlugin({
  projectRoot,
  plugin,
})
```

Lower-level manifest helpers such as `generateHarborLocalPluginPackageManifest` and `installHarborLocalPluginManifest` still exist for non-MCP plugin examples or custom package formats.

## Source Config Shape

MCP examples should start from registry metadata:

- `slug`: registry identity, such as `linear-mcp` or `notion-mcp`
- `default_namespace`: tool namespace stored in the local index
- `config.mcp_endpoint`: HTTP MCP endpoint
- `config.oauth_discovery`: authorization metadata when the source needs OAuth

The local examples use committed registry catalog entries from `@hrbr/registry-catalog`. This keeps SDK examples aligned with hosted Harbor source records.

## Tools And Indexing

Discover and invoke tools through the SDK local MCP runtime:

```ts
const runtime = await createHarborLocalMcpPluginRuntime({
  projectRoot,
  plugin,
})

const hits = runtime.index.search({ query: "list my issues", namespace: "linear-mcp" })
const schema = runtime.index.schema("linear-mcp.list_issues")
const result = await runtime.index.call({
  toolId: "linear-mcp.list_issues",
  input: { assignee: "me", limit: 5 },
})
```

The example call path should be `search -> schema/describe -> call`, matching what a tool registry agent will do.

## Credentials

Environment variables are only an import path. Runtime calls should resolve credentials by source ref and slot:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
```

Use `HARBOR_LOCAL_CREDENTIAL_KEY` as the local vault key. Secret values go into `.harbor/credentials.enc`; callers use `createHarborLocalCredentialResolverFromEnv(projectRoot)` and request slots such as `access_token`.

Auth should be selected in the plugin definition, not inside the agent. Current local MCP helper auth methods are:

- `none`: fixture or public MCP source
- `bearer`: imports an env value into encrypted local storage and resolves it as a bearer token slot
- `oauth2`: resolves locally stored OAuth grant tokens from encrypted storage

## Linear MCP Flow

Run:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
```

For a real Linear MCP account, import a bearer token and call the live endpoint:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
LINEAR_MCP_LIVE=1 \
LINEAR_MCP_ACCESS_TOKEN=lin_or_mcp_token \
bun run example:linear-mcp-local
```

The Linear example uses `linear-mcp`, namespace `linear-mcp`, and a fixture MCP transport by default. It indexes read and write-shaped Linear MCP tools but only smoke-calls `linear-mcp.list_issues`.

Do not use `linear-graphql` for this example.

## Notion MCP OAuth Flow

Run:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:notion-mcp-local
```

The Notion example starts a local daemon callback route, creates a PKCE OAuth flow from the `notion-mcp` registry entry, completes it with a mock token exchanger, stores `access_token` and `refresh_token` encrypted, discovers MCP tools, indexes them, and calls safe read tools first:

- `notion-mcp.notion-search`
- `notion-mcp.notion-fetch`

Write tools are indexed for discoverability but should stay gated by confirmation in agents and docs.

For a real Notion MCP account, enable the live OAuth flow and open the printed authorization URL:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
NOTION_MCP_LIVE=1 \
bun run example:notion-mcp-local
```

The live path performs dynamic client registration when the registry metadata exposes a registration endpoint, exchanges the authorization code through the SDK auth helper, and stores the resulting token slots encrypted.

## Flue Agent Flow

The Flue example consumes the same local runtime state. It uses Anthropic and only invokes provider-backed tools when explicitly enabled:

```sh
ANTHROPIC_API_KEY=sk-ant-... \
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
HARBOR_INVOKE_PROVIDER=1 \
bun --cwd examples/flue-tool-registry-agent run run
```

Flue handles the agent session. Harbor SDK handles local plugin registry state, tool lookup, credential resolution, and MCP invocation.

## Hosted Harbor Mapping

The local runtime mirrors the hosted concepts that plugin authors need:

| Hosted Harbor | Local SDK Runtime |
| --- | --- |
| `plugin_sources` | `source_refs` |
| `plugin_tools` | `tool_index` |
| `plugin_credentials` | `.harbor/credentials.enc` plus `credential_metadata` |
| `oauth_clients` | `oauth_clients` |
| `oauth_pending_flows` | `oauth_pending_flows` |
| `oauth_grants` | `oauth_grants` |

Hosted-only workspace administration, billing, global OAuth app configuration, dashboards, and remote execution stay outside these examples.
