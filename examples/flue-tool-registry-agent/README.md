# Flue Tool Registry Agent

This is a Flue starter agent that consumes the Harbor SDK local runtime registry. It does not define fake Linear or Notion tools in the agent. It reads installed tools from the `.harbor/harbor.sqlite` state produced by the local plugin examples.

Prepare local plugin state first:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:linear-mcp-local
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run example:notion-mcp-local
```

Then run Flue locally after adding a real model key to `.env`:

```sh
cat > examples/flue-tool-registry-agent/.env <<'EOF'
ANTHROPIC_API_KEY="your-api-key"
HARBOR_LOCAL_CREDENTIAL_KEY="dev-key"
HARBOR_LINEAR_LOCAL_ROOT="../plugin-linear-mcp-local"
HARBOR_NOTION_LOCAL_ROOT="../plugin-notion-mcp-local"
EOF

bun --cwd examples/flue-tool-registry-agent run dev
```

The starter uses `anthropic/claude-sonnet-4-6` and the Node target. The local registry roots are relative to this example directory.

To dispatch through live Linear or Notion MCP tools instead of the safe local preview stub, connect credentials in the plugin examples first, then add:

```sh
HARBOR_INVOKE_PROVIDER="1"
```

Flue owns the agent harness/session/model. Harbor SDK owns local plugin state, encrypted credential resolution, tool search, schema lookup, and MCP invocation.
