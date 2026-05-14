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
OPENAI_API_KEY="your-api-key"
HARBOR_LINEAR_LOCAL_ROOT="../plugin-linear-mcp-local"
HARBOR_NOTION_LOCAL_ROOT="../plugin-notion-mcp-local"
EOF

bun --cwd examples/flue-tool-registry-agent run dev
```

The starter uses `openai/gpt-5.5` and the Node target. The local registry roots are relative to this example directory.
