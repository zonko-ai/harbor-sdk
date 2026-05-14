# Local Plugin Authoring

Local plugin examples show the same shape Harbor uses for hosted sources, without copying the hosted control plane into the SDK. The useful boundary is:

- source metadata and manifests live in the repo
- installed source/tool records live in `.harbor/harbor.sqlite`
- secret values live encrypted in `.harbor/credentials.enc`
- registry dev refs live in `.harbor/registry-dev-refs.json`
- generated `.harbor` state should not be committed

## Plugin Manifest Shape

Use `generateHarborLocalPluginPackageManifest` to turn discovered tool metadata into a local package manifest:

```ts
const manifest = generateHarborLocalPluginPackageManifest({
  name: "linear-mcp",
  version: "0.1.0",
  owner: { name: "Harbor SDK" },
  source: {
    kind: "local",
    path: "examples/plugin-linear-mcp-local",
    entrypoint: "src/index.ts",
  },
  tools,
  auth: { required: false, slots: [] },
  scopes: ["linear:read"],
  policies: ["confirm before calling write tools"],
  docs: { readme: "README.md" },
  tests: ["bun run example:linear-mcp-local"],
  changelog: ["Initial local plugin example."],
})
```

Install it with `installHarborLocalPluginManifest`. The install creates local source refs and tool-index rows, so later code can search and call tools through the runtime rather than hand-wiring a demo registry.

## Source Config Shape

MCP examples should start from registry metadata:

- `slug`: registry identity, such as `linear-mcp` or `notion-mcp`
- `default_namespace`: tool namespace stored in the local index
- `config.mcp_endpoint`: HTTP MCP endpoint
- `config.oauth_discovery`: authorization metadata when the source needs OAuth

The local examples use committed registry catalog entries from `@hrbr/registry-catalog`. This keeps SDK examples aligned with hosted Harbor source records.

## Tools And Indexing

Discover tools through the source adapter, convert them into local tool records, then rebuild a searchable index from SQLite:

```ts
const discoveredTools = await mcpSource.listTools({ credentials })
const install = await installHarborLocalPluginManifest({ projectRoot, manifest })
const localIndex = await buildHarborLocalToolIndexFromSqlite(projectRoot, {
  callTool: async (input, tool) => ({
    toolId: input.toolId,
    output: await mcpSource.invokeTool(tool.name, input.input, { credentials }),
  }),
})
```

The example call path should be `search -> schema/describe -> call`, matching what a tool registry agent will do.

## Credentials

Environment variables are only an import path. Runtime calls should resolve credentials by source ref and slot:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
```

Use `HARBOR_LOCAL_CREDENTIAL_KEY` as the local vault key. Secret values go into `.harbor/credentials.enc`; callers use `createHarborLocalCredentialResolverFromEnv(projectRoot)` and request slots such as `access_token`.

## Linear MCP Flow

Run:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
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
