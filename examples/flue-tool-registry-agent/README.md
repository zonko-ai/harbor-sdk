# Flue Tool Registry Agent

This Flue agent consumes Harbor SDK local MCP sources. It does not define fake Linear or Notion tools. The agent declares the Linear MCP and Notion MCP URLs in `main.ts`; the Harbor SDK installs missing sources, connects OAuth when needed, refreshes existing OAuth grants, and discovers tools into `.harbor/harbor.sqlite`.

At runtime the model owns orchestration and `@hrbr/runtime-local/promise` owns the registry mechanics:

1. The model asks the SDK bridge to `search` tools.
2. The model asks for `schema` before building non-trivial inputs.
3. `harbor.tools.runAction(...)` invokes the selected MCP tool and returns the raw MCP output as an observation.
4. The model reads that observation and decides the next action.
5. Notion write tools are blocked unless `HARBOR_CONFIRM_NOTION_WRITE=1`.

The example code does not implement OAuth storage, MCP discovery, SQLite search, credential resolution, write gating, provider-specific MCP output parsing, or hand-rolled MCP fixture protocol handling. Those reusable pieces live in the Harbor SDK; the Flue harness is in `main.ts`.

The SDK usage in the agent is ordinary promise-style application code:

```ts
import {
  createHarborLocalRuntime,
  harborLocalRegistryActionFromAgentStep,
  harborLocalRegistryAgentStepSchema,
} from "@hrbr/runtime-local/promise"

const harbor = createHarborLocalRuntime({ projectRoot: process.cwd(), env })
const setup = await harbor.sources.ensureMcpSources({
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
const result = await harbor.tools.runAction(harborLocalRegistryActionFromAgentStep(next), { confirmWrites })
```

The SDK owns registry action validation and conversion. This example only keeps
the final answer schema because that shape is specific to this Flue agent.

## Fixture E2E

Fixture mode is test-only. The test starts real local MCP servers through `@hrbr/source-mcp/testing`, creates encrypted fixture OAuth credentials, and indexes fixture MCP tools without opening a browser.

```sh
bun test examples/flue-tool-registry-agent/test/e2e.test.ts
```

## Real Linear And Notion OAuth

On first run, the SDK opens browser OAuth URLs for any source that is not connected yet. After each provider redirects back to the local callback, the SDK stores grant tokens encrypted in `.harbor/credentials.enc` and refreshes the MCP tool index. Later runs reuse the stored grants.

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key \
bun run --cwd examples/flue-tool-registry-agent flue run tool-registry \
  --target node \
  --id local-test \
  --env .env \
  --payload '{"prompt":"find my Linear issues"}'
```

Expected prompts:

- If Linear or Notion is not connected, the terminal prints an authorization URL. Open it, approve access, and wait for the local callback to complete.
- If a source is already connected, the SDK skips OAuth and refreshes the tool index.
- If a source cannot be installed, connected, or refreshed, the agent receives that source setup status as an observation and reports it instead of inventing tool results.

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
