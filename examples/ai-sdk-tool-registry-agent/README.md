# AI SDK Tool Registry Agent

This example uses the Vercel AI SDK directly. It does not use Flue.

The division of responsibility is:

1. Vercel AI SDK calls Anthropic and returns Zod-validated registry steps.
2. Harbor SDK installs Linear/Notion MCP sources, handles OAuth, refreshes tools, searches the local registry, invokes MCP tools, and enforces write policy.
3. The model treats MCP outputs as opaque observations and decides the next registry action.

The original Flue example remains at `examples/flue-tool-registry-agent`.

## Run

The example automatically loads `.env` from its own directory. Create `examples/ai-sdk-tool-registry-agent/.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key
HARBOR_CONFIRM_NOTION_WRITE=0
# optional
AI_SDK_ANTHROPIC_MODEL=claude-sonnet-4-6
# optional: reuse an existing authenticated .harbor directory
HARBOR_LOCAL_PROJECT_ROOT=../flue-tool-registry-agent
```

Run from the repo root:

```bash
bun run --cwd examples/ai-sdk-tool-registry-agent run
```

Or pass a custom prompt:

```bash
bun run --cwd examples/ai-sdk-tool-registry-agent main.ts "find my open Linear issues assigned to me"
```

By default, this example stores local Harbor state in its own `.harbor/` directory. If you already authenticated in another example, set `HARBOR_LOCAL_PROJECT_ROOT` to that example directory and keep the same `HARBOR_LOCAL_CREDENTIAL_KEY`. Then Harbor SDK will reuse the existing encrypted credentials instead of starting OAuth again.

On first run without a shared project root, Harbor SDK may print Linear/Notion OAuth URLs. Open them, complete auth, and the SDK stores grants encrypted under `.harbor/credentials.enc`.

## Safety

Write tools are blocked unless `HARBOR_CONFIRM_NOTION_WRITE=1`. Keep this at `0` while testing read/search flows.

## Local State

Runtime state is stored under:

```txt
examples/ai-sdk-tool-registry-agent/.harbor/
```

Reset local auth and discovery state with:

```bash
rm -rf examples/ai-sdk-tool-registry-agent/.harbor
```

## Test

The fixture test uses local MCP servers and does not require real Linear, Notion, Anthropic, or OAuth credentials:

```bash
bun test examples/ai-sdk-tool-registry-agent/test/e2e.test.ts
```
