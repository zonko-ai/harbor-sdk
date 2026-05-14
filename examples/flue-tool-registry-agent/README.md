# Flue Tool Registry Agent

This Flue agent consumes Harbor SDK local MCP sources. It does not define fake Linear or Notion tools. The setup flow installs real Linear MCP and Notion MCP source records, connects OAuth when live mode is enabled, discovers tools into `.harbor/harbor.sqlite`, and the agent uses `search -> schema -> invoke`.

## Fixture E2E

Use fixture mode for local development and tests. It creates encrypted fixture OAuth credentials and indexes fixture MCP tools without opening a browser.

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd examples/flue-tool-registry-agent setup:e2e
bun test examples/flue-tool-registry-agent/test/e2e.test.ts
```

## Real Linear And Notion OAuth

Live mode opens browser OAuth URLs for Linear MCP and Notion MCP, one after the other. After each provider redirects back to the local callback, the SDK stores grant tokens encrypted in `.harbor/credentials.enc` and refreshes the MCP tool index.

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
HARBOR_MCP_LIVE_OAUTH=1 \
bun run --cwd examples/flue-tool-registry-agent setup:e2e
```

Expected prompts:

- The terminal prints a Linear MCP authorization URL. Open it, approve access, and wait for the local callback to complete.
- The terminal then prints a Notion MCP authorization URL. Open it, approve access, and wait for the local callback to complete.
- The command prints indexed source summaries for `linear-mcp` and `notion-mcp`.

## Run With Anthropic

Create `examples/flue-tool-registry-agent/.env`:

```sh
ANTHROPIC_API_KEY="your-anthropic-key"
HARBOR_LOCAL_CREDENTIAL_KEY="dev-key"
HARBOR_CONFIRM_NOTION_WRITE="0"
```

Run a read-and-plan pass first:

```sh
bun run --cwd examples/flue-tool-registry-agent run
```

To allow the Notion write tool after reviewing the behavior, set:

```sh
HARBOR_CONFIRM_NOTION_WRITE="1"
```

Then rerun the agent. Linear reads do not require write confirmation; Notion create/update tools do.

## Local Runtime Files

The setup command writes local runtime state under `examples/flue-tool-registry-agent/.harbor/`:

- `harbor.sqlite`: source records, MCP tool bindings, and searchable tool index rows.
- `credentials.enc`: encrypted OAuth grant tokens.
- `runtime.json`: local daemon metadata while a callback daemon is running.

Do not commit `.harbor/`, `.env`, OAuth grants, tokens, or user data.

To reset local auth and indexed tools:

```sh
rm -rf examples/flue-tool-registry-agent/.harbor
```
