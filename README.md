<div align="center">

<img src="docs/assets/harbor-logo.png" alt="Harbor" width="220" />

# Harbor SDK

**A TypeScript toolkit for building local and hosted tool runtimes around MCP plugins.**

OAuth, encrypted credentials, tool discovery, schema inspection, sandboxed
execution, and traces — without depending on a hosted Harbor, WorkOS,
Cloudflare, or any particular agent framework.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-fbf0df?logo=bun&logoColor=black)](https://bun.sh/)
[![MCP](https://img.shields.io/badge/Model_Context_Protocol-1.x-1f6feb)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-Proprietary-blueviolet)](#license)
[![Status](https://img.shields.io/badge/Status-Pre--release-orange)](#roadmap)

</div>

---

<div align="center">
  <img src="docs/assets/local-harbor-demo.gif" alt="Local Harbor demo" width="860" />
</div>

---

## Table of Contents

- [Why Harbor SDK](#why-harbor-sdk)
- [Key Features](#key-features)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Quickstart](#quickstart)
- [Local Harbor (browser console)](#local-harbor-browser-console)
- [Connect Agents over MCP](#connect-agents-over-mcp)
- [Use the SDK Directly](#use-the-sdk-directly)
- [Packages](#packages)
- [Examples](#examples)
- [Local State Layout](#local-state-layout)
- [Environment Reference](#environment-reference)
- [Project Layout](#project-layout)
- [Development](#development)
- [Security Model](#security-model)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why Harbor SDK

Most "agent + tools" stacks force a choice between:

1. **Hardcoding provider clients** into the agent (fragile, no audit trail), or
2. **Adopting a hosted platform** (vendor lock-in, identity coupling, network egress).

Harbor SDK is the middle path. It packages the primitives behind a Harbor-style
plugin platform — OAuth, credential storage, MCP discovery, tool indexing,
schema validation, sandboxed code execution, and persisted traces — as a
TypeScript library that runs **entirely on your machine** by default.

You can:

- run it standalone with the bundled **Local Harbor** browser console,
- embed it into a Flue or Vercel AI SDK agent,
- expose it back to agents as a small MCP server (`inspect` + `exec`),
- or wire it into a hosted runtime when you're ready.

---

## Key Features

| Capability | What you get |
| --- | --- |
| **MCP plugin install** | One-call setup for catalog entries (Linear, Notion, …) and custom MCP URLs. |
| **Local OAuth** | PKCE-based browser flow with a loopback callback server. No hosted broker required. |
| **Encrypted credentials** | AES-GCM at rest in `.harbor/credentials.enc`, keyed by a single env variable. |
| **Tool discovery** | Pulls MCP `tools/list`, normalises schemas, and persists into local SQLite. |
| **Lexical tool search** | FTS-backed search over indexed tools to keep agent context small. |
| **Schema inspection** | Live JSON Schema for every tool, with read/write hints. |
| **Safe invocation** | Single `tools.invoke(toolId, input)` call routed through the source adapter. |
| **Sandboxed exec** | QuickJS WASM runtime for generated JavaScript with bound MCP namespaces. |
| **Local traces** | Every plugin call (and nested call from `exec`) is persisted with input/output, timing, and errors. |
| **Browser console** | Local Harbor app: catalog browser, plugin detail with tools and schema viewer, traces table, dark/light themes. |
| **Agent surface** | Reef-style MCP endpoint that exposes only `inspect` + `exec` to keep tool budgets minimal. |

---

## Architecture at a Glance

```
┌────────────────────────────────────────────────────────────────────────┐
│                            Your agent / IDE                            │
│  (Claude Code, Cursor, Codex, Vercel AI SDK, Flue, custom orchestrator)│
└────────────────┬─────────────────────────────────┬─────────────────────┘
                 │ MCP HTTP                        │ direct TS import
                 ▼                                 ▼
        ┌─────────────────┐               ┌──────────────────┐
        │  Reef endpoint  │               │   @hrbr/sdk      │
        │ inspect / exec  │               │  (createHarbor)  │
        └────────┬────────┘               └────────┬─────────┘
                 │                                 │
                 ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       @hrbr/runtime-local                              │
│  • OAuth & credential vault (AES-GCM)                                  │
│  • MCP source adapters (@hrbr/source-mcp)                              │
│  • Tool index (SQLite + FTS)                                           │
│  • Invocation history & traces                                         │
│  • QuickJS sandbox for `exec`                                          │
└────────────────────────────────────────────────────────────────────────┘
                 │
                 ▼
    .harbor/  (per-project, gitignored runtime state)
```

The same SDK surface targets a **Cloudflare runtime** for hosted deployments
(`@hrbr/runtime-cloudflare`) — your application code doesn't change when you
graduate from local to hosted.

---

## Quickstart

> **Prerequisites:** [Bun](https://bun.sh/) 1.3+, a POSIX shell, and a browser.

```bash
git clone https://github.com/zonko-ai/harbor-sdk.git
cd harbor-sdk
bun install
```

Build the Local Harbor browser console once:

```bash
bun run --cwd apps/harbor-local install:web
bun run --cwd apps/harbor-local build:web
```

Start the local runtime (binds `127.0.0.1:7332`):

```bash
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
```

Open the console:

```text
http://127.0.0.1:7332
```

> **Heads up:** `HARBOR_LOCAL_CREDENTIAL_KEY` is the AES key used to encrypt and
> decrypt `.harbor/credentials.enc`. Use a **stable, per-machine value** —
> rotating it invalidates every previously stored OAuth grant and API key.

---

## Local Harbor (browser console)

Local Harbor is the fastest way to evaluate the SDK against real MCP servers.

**Pages**

- **Overview** — runtime health, setup tiles, 30-day usage chart, and recent invocations.
- **Plugins** — search, connected and available cards with an icon-tinted hover beam, plus a per-plugin detail page exposing tools, schemas, and a JSON invoker.
- **Traces** — filterable invocation history with a paired detail panel showing inputs, outputs, errors, and the raw trace.

**Typical flow**

1. Open the console and switch to **Plugins**.
2. Pick a catalog entry (e.g. Linear, Notion) or paste a custom MCP URL.
3. Complete OAuth in the popup; tokens are sealed into the local vault.
4. Refresh the source — tools are pulled from `tools/list` and indexed.
5. Search tools, expand a row to view its schema, paste JSON input, and click **Invoke**.
6. Open **Traces** for full request/response history.

Local Harbor is **fully offline**. There is no hosted auth, no telemetry, no
WorkOS, no workspace concept — just `.harbor/` and your browser.

---

## Connect Agents over MCP

After plugins are installed locally, point any MCP-capable agent at:

```text
http://127.0.0.1:7332/mcp
```

The endpoint exposes exactly **two** tools, by design:

| Tool | Purpose |
| --- | --- |
| `inspect` | Read-only planning & discovery. Wraps SDK methods such as `sources.list`, `tools.search`, `tools.schema`, `exec.toolGuide`, and `invocations.list`. |
| `exec` | Runs JavaScript inside the local QuickJS sandbox. Installed MCP namespaces are bound as variables (e.g. `linearMcp`, `notionMcp`). |

**Example client config** (clients that support HTTP MCP):

```toml
[mcp_servers.reef]
url = "http://127.0.0.1:7332/mcp"
```

**Bridge for stdio-only clients:**

```bash
npx -y mcp-remote http://127.0.0.1:7332/mcp
```

**Inside `exec`:**

```ts
const issues = await linearMcp.listIssues({ limit: 5, includeArchived: false })
return issues
```

Every nested plugin call made from `exec` is recorded in invocation history and
shows up on the **Traces** page.

---

## Use the SDK Directly

The local facade is `@hrbr/sdk/local`. It returns a promise-first runtime
object with `sources`, `tools`, `exec`, and `invocations` namespaces.

```ts
import { createHarbor, HARBOR_LOCAL_CREDENTIAL_KEY_ENV } from "@hrbr/sdk/local"

const harbor = createHarbor({
  projectRoot: process.cwd(),
  allowLocalNetwork: true,
  env: {
    [HARBOR_LOCAL_CREDENTIAL_KEY_ENV]: "dev-key",
  },
})

// 1. Install one or more MCP sources. OAuth runs automatically when needed.
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
  console.log("Pending sources:", setup.sources)
}

// 2. Search the local tool index.
const hits = await harbor.tools.search({
  query: "list issues",
  namespace: "linear-mcp",
})

// 3. Inspect the schema before calling.
const schema = await harbor.tools.schema(hits[0].toolId)

// 4. Either invoke directly...
const direct = await harbor.tools.invoke(hits[0].toolId, {
  limit: 5,
  includeArchived: false,
})

// 5. ...or run generated code through the sandbox.
const exec = await harbor.exec.run(`
  const issues = await linearMcp.listIssues({ limit: 5, includeArchived: false })
  return issues
`)

// 6. Inspect everything that was called.
const traces = await harbor.invocations.list({ namespace: "linear-mcp" })

console.log({ schema, direct, exec, traces })
```

> Both `tools.invoke` and `exec.run` route through the same source adapter and
> produce identical trace entries — you can swap between them without losing
> the audit trail.

---

## Packages

| Package | Description |
| --- | --- |
| **`@hrbr/sdk`** | Top-level facade. Re-exports `createHarbor` from `@hrbr/sdk/local` (local runtime), `@hrbr/sdk/core` (shared types), and `@hrbr/sdk/testing` (fakes). |
| **`@hrbr/runtime-local`** | The local runtime: SQLite catalog, AES-GCM credential vault, OAuth, tool index, QuickJS sandbox, invocation history. |
| **`@hrbr/runtime-cloudflare`** | Same SDK surface backed by Cloudflare Durable Objects, KV, and Workers AI. |
| **`@hrbr/source-mcp`** | HTTP and stdio MCP source adapter built on `@modelcontextprotocol/sdk`. |
| **`@hrbr/source-credentials`** | Pluggable secret slot bindings (header, query, body) shared by source adapters. |
| **`@hrbr/source-policy`** | Read/write policy hints used to gate destructive tool invocations. |
| **`@hrbr/registry-catalog`** | Checked-in metadata for the local MCP catalog (Linear, Notion, etc.). |
| **`@hrbr/orbit`** | Storage / fetch / AI primitives that back `exec` runtimes. |
| **`@hrbr/plugins`**, **`@hrbr/sources`**, **`@hrbr/tools`** | Shared domain types. |
| **`@hrbr/runs`** | Run + trace records persisted by the runtime. |
| **`apps/harbor-local`** | Bun HTTP API + Vite/React/Tailwind v4 dashboard. |

Run `bun pm ls --filter '@hrbr/*'` to inspect the full workspace graph.

---

## Examples

| Example | What it shows |
| --- | --- |
| `examples/plugin-linear-mcp-local` | End-to-end Linear MCP install and call from the local runtime. |
| `examples/plugin-notion-mcp-local` | Notion OAuth, encrypted storage, discovery, and safe reads. |
| `examples/ai-sdk-tool-registry-agent` | Vercel AI SDK agent with Harbor as the tool registry. |
| `examples/ai-sdk-local-exec-agent` | AI SDK agent that generates code executed by `exec.run`. |
| `examples/flue-tool-registry-agent` | Flue agent driving Harbor through registry-style actions. |
| `examples/flue-local-exec-agent` | Flue generates code; Harbor owns plugin execution and traces. |
| `examples/sdk-custom-source` | Build a non-MCP source adapter and register it. |
| `examples/sdk-tool-catalog` | Hand-roll a tool catalog without touching MCP. |
| `examples/sdk-orbit-runtime` | Explore Orbit (storage/fetch/AI) primitives. |
| `examples/tool-registry-linear-notion` | Compose Linear and Notion in one registry. |

Every example is runnable with `bun run example:<name>` (see `package.json`).

---

## Local State Layout

By default the runtime stores per-project state under `.harbor/` in your
current working directory:

```text
.harbor/
├── harbor.sqlite           # plugin sources, tool index, invocation history
├── credentials.enc         # AES-GCM-encrypted secret vault
└── registry-dev-refs.json  # local dev references for the MCP catalog
```

- `.harbor/` is **runtime state**. Add it to `.gitignore` (Local Harbor does this for you).
- To start clean, delete the directory — the next `createHarbor()` call recreates it.
- To move state between machines, copy the directory **and** re-export the same
  `HARBOR_LOCAL_CREDENTIAL_KEY`. Without the key, the vault cannot be opened.

---

## Environment Reference

| Variable | Default | Description |
| --- | --- | --- |
| `HARBOR_LOCAL_CREDENTIAL_KEY` | _(required)_ | AES-GCM key for the credential vault. Use a stable, per-machine value. |
| `HARBOR_LOCAL_PROJECT_DIR` | `process.cwd()` | Root directory for `.harbor/` state. |
| `HARBOR_LOCAL_HOST` | `127.0.0.1` | Host for the Bun API server and the dashboard. |
| `HARBOR_LOCAL_PORT` | `7332` | Port for the Bun API server. |
| `HARBOR_LOCAL_OAUTH_PORT` | _(ephemeral)_ | Optional pinned port for the OAuth callback server. |

Local Harbor binds to `127.0.0.1` only. To expose it to other devices on your
network, terminate TLS in front of the Bun server — do **not** flip the host
flag without auth in front.

---

## Project Layout

```text
harbor-sdk/
├── apps/
│   └── harbor-local/        # Bun API + Vite/React dashboard (this app)
├── packages/
│   ├── sdk/
│   │   ├── sdk/             # @hrbr/sdk facade
│   │   ├── runtime-local/   # @hrbr/runtime-local
│   │   ├── runtime-cloudflare/
│   │   ├── source-mcp/      # MCP adapter
│   │   ├── source-credentials/
│   │   ├── source-policy/
│   │   ├── registry-catalog/
│   │   ├── orbit/           # storage / fetch / AI primitives
│   │   ├── tools/, sources/, plugins/, runs/, …
│   └── workflows/
├── examples/                # runnable end-to-end recipes
├── docs/
│   ├── api/                 # TypeDoc API reference
│   ├── architecture/        # Design notes
│   ├── tutorials/
│   └── assets/
└── README.md
```

---

## Development

```bash
# install workspace
bun install

# typecheck everything (packages, examples, apps)
bun run typecheck

# unit tests (SDK packages + workflows)
bun run test

# scoped to Local Harbor
bun run --filter @hrbr/harbor-local typecheck
bun test apps/harbor-local/test/server.test.ts
bun run --cwd apps/harbor-local build:web

# generate API docs
bun run docs:api
```

For dashboard development with hot reload, run the API server and the Vite dev
server side by side:

```bash
# terminal A — API on 7332
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev

# terminal B — Vite on 5173, proxies /api and /health to 7332
bun run --cwd apps/harbor-local dev:web
```

---

## Security Model

- **Vault encryption** — credentials are sealed with AES-GCM using a key derived from `HARBOR_LOCAL_CREDENTIAL_KEY`. The key never leaves the process and is not persisted.
- **No outbound telemetry** — the local runtime makes no network calls beyond the MCP endpoints you install, the OAuth providers you connect, and `fetch()` you initiate from `exec`.
- **Loopback-only by default** — the API server and dashboard bind to `127.0.0.1`.
- **Sandboxed exec** — `exec.run` evaluates code in a QuickJS WASM VM with an allow-listed surface. Plugin namespaces are injected as proxies; arbitrary `import` and `fs` access are not exposed.
- **Write hints** — sources can mark tools as destructive via `source-policy`; the SDK exposes `confirmWrites` on `tools.invoke` so agent-level gates can be enforced before calls.

The local runtime is intended for **single-user development machines**. Hosting
it on a shared host without an auth layer in front is not supported.

---

## Troubleshooting

<details>
<summary><strong>Port 7332 already in use</strong></summary>

```bash
lsof -nP -iTCP:7332 -sTCP:LISTEN
# kill the stale process or override the port
HARBOR_LOCAL_PORT=7333 bun run --cwd apps/harbor-local dev
```
</details>

<details>
<summary><strong>OAuth popup never returns</strong></summary>

The OAuth callback server listens on a loopback port. Check that your browser
isn't blocking `127.0.0.1:*` redirects, and verify the provider's redirect URI
allow-list includes the loopback URL the SDK printed. Some browser extensions
(strict ad/script blockers) interfere with the callback — try a clean profile.
</details>

<details>
<summary><strong>"Credential vault could not be opened"</strong></summary>

You're using a different `HARBOR_LOCAL_CREDENTIAL_KEY` than when the vault was
created. Either re-export the original key, or delete `.harbor/credentials.enc`
to reset (and re-run OAuth for every connected source).
</details>

<details>
<summary><strong>Tools missing after install</strong></summary>

The MCP source might not have returned `tools/list` yet. Open the plugin's
detail page in Local Harbor and click **Refresh tools**, or call
`harbor.sources.refreshMcp(sourceId)` from code.
</details>

<details>
<summary><strong>Stale dashboard after rebuild</strong></summary>

Your browser is caching `index.html`. Hard-refresh (⌘ + Shift + R on macOS,
Ctrl + F5 on Windows/Linux), or check Network → "Disable cache" in DevTools.
</details>

---

## Roadmap

- [ ] Publish public npm packages
- [ ] First-class API + GraphQL source adapters
- [ ] Cloudflare-hosted runtime with workspace-scoped credential vault
- [ ] Out-of-the-box agent recipes for Claude Code, Cursor, and Codex
- [ ] Pluggable trace exporters (OpenTelemetry, file, S3)
- [ ] Signed plugin manifests

---

## License

Proprietary unless a license is added by the project maintainers.

---

<div align="center">

Built by the Harbor team. Issues and feature requests welcome on the issue tracker.

</div>
