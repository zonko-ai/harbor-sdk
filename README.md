# Harbor SDK

Low-level TypeScript building blocks for creating Harbor-like developer platforms without cloning the Harbor SaaS product surface.

The SDK gives developers control over their own sources, credentials, policies, tools, runs, workflows, and runtime primitives. It intentionally does not expose a `createHarbor()` shortcut. Harbor's hosted product remains a first-party SaaS built on top of these primitives.

## What You Can Build

- A tool registry for first-party APIs, third-party SaaS integrations, MCP servers, or local command adapters.
- A workflow runner that calls those tools with traceable steps.
- A Cloudflare-native execution/runtime layer with `orbit.storage`, `orbit.cache`, `orbit.ai`, `orbit.db`, and `orbit.tools` style primitives.
- A hosted-client integration that talks to Harbor SaaS when a team wants managed workspaces, OAuth, traces, and plugin operations.

## Package Map

| Package | Purpose |
| --- | --- |
| `@hrbr/source-core` | Provider-agnostic source and tool adapter primitives. |
| `@hrbr/source-credentials` | Credential bindings and local credential resolution. |
| `@hrbr/source-mcp` | HTTP MCP adapter for developer-owned MCP servers. |
| `@hrbr/source-policy` | Source availability policy and per-tool allow/block/approval policy. |
| `@hrbr/tools` | Local tool registry, search, describe, schema, invoke, and trace hooks. |
| `@hrbr/runs` | Run and span schemas plus in-memory trace writer. |
| `@hrbr/workflows` | Typed workflow definition and execution helpers. |
| `@hrbr/orbit` | Runtime primitives for storage, cache, AI, DB, tools, jobs, apps, and sockets. |
| `@hrbr/client` | Hosted Harbor client for teams that want to connect to Harbor SaaS. |

## Quick Start

```bash
bun install
bun run typecheck
bun run example:linear-notion
bun run docs:api
```

## Examples

- `examples/sdk-custom-source`: create a custom ticket source, connect a developer-owned MCP endpoint, enforce policy, run a workflow, and inspect traces.
- `examples/tool-registry-linear-notion`: build a local registry with Linear and Notion-style tools, credentials, policy, search, invocation, and run graph output.
- `examples/sdk-orbit-runtime`: use the memory Orbit runtime for storage, cache, AI, tools, sockets, and DB calls.
- `examples/sdk-tool-catalog`: use `@hrbr/client` against hosted Harbor's tool catalog APIs.

## Mini Tutorials

- [Custom source adapter](docs/tutorials/01-custom-source.md)
- [Linear and Notion registry](docs/tutorials/02-linear-notion-registry.md)
- [Orbit runtime](docs/tutorials/03-orbit-runtime.md)
- [Hosted Harbor client](docs/tutorials/04-hosted-client.md)

## Design Boundary

This repo is the SDK layer, not the Harbor product. The SDK provides the low-level contracts needed to build:

- source adapters
- tool registries
- credential stores
- policy evaluators
- trace writers
- workflow runners
- runtime primitives
- hosted Harbor clients

The hosted Harbor SaaS can be rebuilt internally using these primitives, but the public SDK should teach developers how to compose blocks, not how to clone Harbor end to end.

## Development

```bash
bun install
bun run typecheck
bun run test
bun run docs:api
```

The generated API docs are written to `docs/api`.
