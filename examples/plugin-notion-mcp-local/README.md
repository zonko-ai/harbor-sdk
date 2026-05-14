# Notion MCP Local Plugin Example

This example installs a Harbor-style `notion-mcp` source into the local SDK runtime and demonstrates the OAuth path that MCP sources need.

Run the mock-provider flow:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:notion-mcp-local
```

The script starts a local daemon callback route, creates a PKCE OAuth flow from the committed `notion-mcp` registry metadata, completes the callback with a mock token exchanger, stores tokens encrypted in `.harbor/credentials.enc`, discovers fixture MCP tools, indexes them into `.harbor/harbor.sqlite`, and calls safe read tools first.

Real Notion account setup is intentionally separate from the mock flow. The SDK capability is provider-neutral; a real connection should plug a real token exchanger into the same local OAuth callback path.
