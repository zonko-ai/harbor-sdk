# Harbor SDK

Harbor SDK is a TypeScript toolkit for building local and hosted tool runtimes around MCP plugins, encrypted credentials, OAuth, tool discovery, schema inspection, execution, and traces.

It gives you the primitives behind a Harbor-style plugin platform without requiring Harbor SaaS, WorkOS, Cloudflare, hosted workspaces, or a specific agent framework. You can use it directly from code, wire it into Flue or the Vercel AI SDK, or run the included Local Harbor app to connect real MCP accounts on your machine.

## What It Does

Harbor SDK helps you build systems where agents and applications can:

- install MCP plugin sources from a catalog or a custom MCP URL
- complete local OAuth for MCP providers such as Linear and Notion
- store OAuth grants and credentials encrypted on disk
- discover MCP tools and save them into a local SQLite index
- search tools lexically before choosing one to call
- inspect live input/output schemas before invocation
- invoke tools through the SDK runtime, not by hardcoding provider clients
- run generated JavaScript in the local QuickJS runtime
- record plugin calls and execution history as local traces
- expose connected plugins back to agents through a small Reef-style MCP server

The default local state lives in:

```text
.harbor/harbor.sqlite
.harbor/credentials.enc
.harbor/registry-dev-refs.json
```

`.harbor/` is local runtime state and should not be committed.

## Main Surfaces


| Surface                  | Purpose                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `@hrbr/sdk/local`        | Promise-first local runtime API for MCP setup, OAuth, tool search, invocation, exec, and traces.        |
| `@hrbr/source-mcp`       | HTTP MCP adapter for discovering and calling external MCP servers.                                      |
| `@hrbr/runtime-local`    | Local SQLite, encrypted credentials, OAuth, tool index, QuickJS, and invocation history implementation. |
| `@hrbr/registry-catalog` | Checked-in MCP catalog metadata used by local examples and Local Harbor.                                |
| `apps/harbor-local`      | Local browser console for installing MCP plugins, refreshing tools, invoking tools, and viewing traces. |
| Reef MCP endpoint        | Agent-facing local MCP server with exactly two tools: `inspect` and `exec`.                             |


## Install

This repository currently uses Bun workspaces.

```bash
git clone https://github.com/zonko-ai/harbor-sdk.git
cd harbor-sdk
bun install
```

Local Harbor is currently run from this repo:

```bash
bun run --cwd apps/harbor-local install:web
bun run --cwd apps/harbor-local build:web
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
```

Open:

```text
http://127.0.0.1:7332
```

Use a stable key for `HARBOR_LOCAL_CREDENTIAL_KEY`. It encrypts and decrypts local credentials in `.harbor/credentials.enc`; changing it means previously stored local credentials cannot be read.

## Use Local Harbor

Local Harbor is the fastest way to try the SDK with real MCP accounts.

1. Start the server:
  ```bash
   HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
  ```
2. Open the browser UI:
  ```text
   http://127.0.0.1:7332
  ```
3. Go to Plugins.
4. Install an MCP plugin from the catalog, such as Linear or Notion, or install a custom MCP URL.
5. Complete OAuth when prompted.
6. Refresh the source to discover tools.
7. Search tools, inspect schemas, invoke tools, and view Traces.

Local Harbor is fully local for v1. It does not require hosted Harbor auth, WorkOS, hosted workspaces, Cloudflare runtime, Orbit, workflows, jobs, or apps.

## Connect Agents Through Reef MCP

After plugins are installed through Local Harbor, agents can connect to the local Reef MCP endpoint:

```text
http://127.0.0.1:7332/mcp
```

The endpoint intentionally exposes only two MCP tools:

```text
inspect
exec
```

`inspect` is for planning and discovery. It supports local Harbor inspection calls such as:

```ts
return await hrbr.sources.list()
return await hrbr.tools.search({ query: "linear issues", describe: true })
return await hrbr.tools.schema({ toolId: "linear-mcp.list_issues" })
return await hrbr.exec.toolGuide()
return await hrbr.invocations.list({ namespace: "linear-mcp" })
```

`exec` runs JavaScript in the local QuickJS runtime. Installed MCP namespaces are resolved by the SDK backend:

```ts
const issues = await linearMcp.listIssues({
  limit: 5,
  includeArchived: false,
})

return issues
```

Nested plugin calls made from `exec` are recorded in local invocation history and show up in the Traces page.

Example MCP client config for clients that support HTTP MCP:

```toml
[mcp_servers.reef]
url = "http://127.0.0.1:7332/mcp"
```

For stdio-only clients, use an HTTP-to-stdio bridge such as `mcp-remote`:

```bash
npx -y mcp-remote http://127.0.0.1:7332/mcp
```

## Use The SDK Directly

The local SDK facade is `@hrbr/sdk/local`:

```ts
import { createHarbor, HARBOR_LOCAL_CREDENTIAL_KEY_ENV } from "@hrbr/sdk/local"

const harbor = createHarbor({
  projectRoot: process.cwd(),
  allowLocalNetwork: true,
  env: {
    [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "dev-key",
  },
})

const setup = await harbor.sources.ensureMcpSources({
  sources: [
    {
      endpoint: "https://mcp.linear.app/mcp",
      name: "Linear MCP",
      namespace: "linear-mcp",
      auth: "auto",
    },
  ],
  connect: true,
  refresh: true,
  onAuthorizationUrl: ({ authorizationUrl }) => {
    console.log("Open this URL to connect:", authorizationUrl)
  },
})

if (!setup.ready) {
  console.log(setup.sources)
}

const hits = await harbor.tools.search({
  query: "list issues",
  namespace: "linear-mcp",
})

const schema = await harbor.tools.schema(hits[0].toolId)

const result = await harbor.exec.run(`
  const issues = await linearMcp.listIssues({ limit: 5, includeArchived: false });
  return issues;
`)

const traces = await harbor.invocations.list({ namespace: "linear-mcp" })

console.log({ schema, result, traces })
```

## Examples


| Example                               | What it shows                                                                             |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `examples/plugin-linear-mcp-local`    | Install and call a Linear MCP source through local runtime primitives.                    |
| `examples/plugin-notion-mcp-local`    | Local OAuth flow, encrypted token storage, discovery, and safe read calls for Notion MCP. |
| `examples/ai-sdk-tool-registry-agent` | Use Harbor SDK from a Vercel AI SDK agent with tool search and invocation.                |
| `examples/ai-sdk-local-exec-agent`    | Let an AI SDK agent generate code that runs through Harbor local exec.                    |
| `examples/flue-tool-registry-agent`   | Use Harbor SDK from a Flue agent with registry-style actions.                             |
| `examples/flue-local-exec-agent`      | Use Flue to generate local exec code while Harbor SDK owns plugin execution.              |
| `examples/sdk-custom-source`          | Build a custom source adapter and registry flow.                                          |
| `examples/sdk-orbit-runtime`          | Explore Orbit runtime primitives.                                                         |


## Development

Install dependencies:

```bash
bun install
```

Run typechecks:

```bash
bun run typecheck
```

Run tests:

```bash
bun run test
```

Focused Local Harbor validation:

```bash
bun run --filter @hrbr/harbor-local typecheck
bun test apps/harbor-local/test/server.test.ts
bun run --cwd apps/harbor-local build:web
```

Generate API docs:

```bash
bun run docs:api
```

## License

Proprietary unless a license is added by the project maintainers.

## Roadmap

- Publish npm package
- Add API and GraphQL plugins
- Add Cloudflare runtime with cloud-native features

