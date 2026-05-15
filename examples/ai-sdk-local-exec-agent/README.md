# AI SDK Local Exec Agent

This example uses the Vercel AI SDK directly. It does not use Flue.

The intended shape is:

```ts
const { object: generated } = await generateObject({ model, schema, prompt })
const data = await harbor.exec.run(generated.code)
const { object: summary } = await generateObject({ model, schema, prompt: summarize(data) })
```

Harbor SDK owns source setup, OAuth refresh, namespace resolution, the generated exec tool guide, QuickJS execution, MCP dispatch, credentials, and policy.

The original Flue example remains at `examples/flue-local-exec-agent`.

## Run

The example automatically loads `.env` from its own directory. If that file does not exist, it also falls back to `examples/flue-local-exec-agent/.env` and reuses `examples/flue-local-exec-agent/.harbor/` when present.

Create `examples/ai-sdk-local-exec-agent/.env` when you want isolated state:

```bash
ANTHROPIC_API_KEY=sk-ant-...
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key
# optional
AI_SDK_ANTHROPIC_MODEL=claude-sonnet-4-6
# optional: reuse an existing authenticated .harbor directory
HARBOR_LOCAL_PROJECT_ROOT=../flue-tool-registry-agent
```

Run from the repo root:

```bash
bun run --cwd examples/ai-sdk-local-exec-agent run
```

Or pass a custom prompt:

```bash
bun run --cwd examples/ai-sdk-local-exec-agent main.ts "Get latest Linear issues from Harbor Alpha and latest relevant Notion docs/pages, then summarize current project status."
```

By default, this example stores local Harbor state in its own `.harbor/` directory. If you already authenticated in another example, set `HARBOR_LOCAL_PROJECT_ROOT` to that example directory and keep the same `HARBOR_LOCAL_CREDENTIAL_KEY`. Then Harbor SDK will reuse the existing encrypted credentials instead of starting OAuth again. When `examples/flue-local-exec-agent/.harbor/` exists and no explicit project root is set, this example uses it automatically.

On first run without a shared project root, Harbor SDK installs Linear and Notion MCP sources, opens OAuth URLs when needed, stores encrypted grants, refreshes tools into `.harbor/harbor.sqlite`, and then runs generated code through `harbor.exec.run(code)`.

## Safety

This example is read-only. The generated code is instructed to fetch Linear and Notion data and summarize it. It does not create Notion pages, update Linear issues, or enable write confirmation.

## Local State

Runtime state is stored under:

```txt
examples/ai-sdk-local-exec-agent/.harbor/
```

Reset local auth and discovery state with:

```bash
rm -rf examples/ai-sdk-local-exec-agent/.harbor
```

## Test

The fixture test uses local MCP servers and does not require real Linear, Notion, Anthropic, or OAuth credentials:

```bash
bun test examples/ai-sdk-local-exec-agent/test/e2e.test.ts
```

For manual fixture smoke tests, set:

```txt
HARBOR_LINEAR_MCP_ENDPOINT=http://127.0.0.1:<port>
HARBOR_NOTION_MCP_ENDPOINT=http://127.0.0.1:<port>
```

When those are set, the SDK installs the sources with `auth=none` and opts into local-network MCP access only for explicit fixture endpoint mode.
