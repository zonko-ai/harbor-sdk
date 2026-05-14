# Notion MCP Local Plugin Example

This example installs a Harbor-style `notion-mcp` source into the local SDK runtime and demonstrates the OAuth path that MCP sources need.

Run the mock-provider flow:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:notion-mcp-local
```

The script starts a local daemon callback route, creates a PKCE OAuth flow from the committed `notion-mcp` registry metadata, completes the callback with a mock token exchanger, stores tokens encrypted in `.harbor/credentials.enc`, discovers fixture MCP tools, indexes them into `.harbor/harbor.sqlite`, and calls safe read tools first.

To connect a real Notion MCP account, enable live mode and open the printed authorization URL:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
NOTION_MCP_LIVE=1 \
bun run example:notion-mcp-local
```

The live path uses the SDK auth helpers for dynamic client registration and authorization-code exchange, then stores the resulting token slots encrypted. After this runs, the Flue example can call Notion through the same local runtime when `HARBOR_INVOKE_PROVIDER=1`.
