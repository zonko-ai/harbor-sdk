# Linear MCP Local Plugin Example

This example installs a Harbor-style `linear-mcp` source into the local SDK runtime, indexes MCP tools into `.harbor/harbor.sqlite`, and resolves runtime credentials by source ref and slot.

Run the fixture-backed smoke test:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
```

To test a live MCP endpoint later, provide a bearer token only as an import/setup path:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
LINEAR_MCP_LIVE=1 \
LINEAR_MCP_ACCESS_TOKEN=token_value \
bun run example:linear-mcp-local
```

The example intentionally uses `linear-mcp`, not `linear-graphql`. The default run uses a fixture transport so it stays safe and repeatable; real account connection should plug into the SDK local OAuth helpers when Linear's MCP flow is enabled for the caller.

After this runs, the Flue example can read the same `.harbor` state. Set `HARBOR_INVOKE_PROVIDER=1` there only when you want the agent to dispatch through the live MCP runtime.
