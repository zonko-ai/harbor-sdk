# Flue Local Exec Agent

This example shows the intended high-level SDK shape:

```ts
const code = await flueGenerateCode(prompt)
const data = await harbor.exec.run(code)
const summary = await flueSummarize(data)
```

Flue does not connect to MCP servers, handle OAuth callbacks, format namespace/tool method names, or manually invoke tools. The Harbor SDK local runtime owns source setup, OAuth refresh, namespace resolution, the exec tool guide, QuickJS execution, and MCP dispatch.

## Run

Install the Flue packages globally if your shell does not already have them:

```bash
npm install -g @flue/cli @flue/runtime
```

Create `examples/flue-local-exec-agent/.env`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key
```

Then run:

```bash
bun run --cwd examples/flue-local-exec-agent flue run local-exec \
  --target node \
  --env .env \
  --payload '{"prompt":"Get latest Linear issues from Harbor Alpha and latest relevant Notion docs/pages, then summarize current project status."}'
```

On first run, the SDK installs the Linear and Notion MCP sources, opens browser OAuth URLs if needed, stores grants encrypted in `.harbor/credentials.enc`, refreshes tools into `.harbor/harbor.sqlite`, and then runs generated code through `harbor.exec.run(code)`.

## Safety

This example is read-only. It fetches Linear and Notion data and summarizes it. It does not create Notion pages, update Linear issues, or enable write confirmation.

## Local State

Runtime state is stored under:

```txt
examples/flue-local-exec-agent/.harbor/
```

Important files:

- `harbor.sqlite`: installed source state and indexed tool bindings.
- `credentials.enc`: encrypted OAuth grants and credentials.
- `registry-dev-refs.json`: local registry references.

Reset local auth and discovery state with:

```bash
rm -rf examples/flue-local-exec-agent/.harbor
```

## Test

The fixture test uses local MCP servers and does not need real Linear, Notion, or Anthropic credentials:

```bash
bun test examples/flue-local-exec-agent/test/e2e.test.ts
```

For manual local smoke tests, the example also accepts fixture endpoints through:

```txt
HARBOR_LINEAR_MCP_ENDPOINT=http://127.0.0.1:<port>
HARBOR_NOTION_MCP_ENDPOINT=http://127.0.0.1:<port>
```

When those are set, the SDK installs the sources with `auth=none` so the run can reach code generation without browser OAuth.
The example also opts into local-network MCP access only for this explicit fixture-endpoint mode.
