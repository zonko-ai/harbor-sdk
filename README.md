# Harbor SDK

Publish-ready workspace for the two public Harbor JavaScript SDK packages:

- `@hrbr/client`: Promise-first Harbor API client for application and integration authors.
- `@hrbr/sdk`: composite system SDK facade for Harbor runtime, platform, plugin, protocol, registry, and control-plane building blocks.

The package contents are generated from the Harbor monorepo publish pipeline. This repository keeps the npm artifacts and examples in the shape developers install and run.

## Layout

| Path | Purpose |
| --- | --- |
| `packages/client` | Generated `@hrbr/client` package with root Promise client, Effect subpath, auth helpers, and generated Harbor protocol client. |
| `packages/sdk` | Generated `@hrbr/sdk` package with namespaced system facades and focused subpaths such as `@hrbr/sdk/platform/local`. |
| `examples/browser-client` | Browser/app integration pattern using caller-owned bearer token state. |
| `examples/client-promise` | Promise client runtime execute example with text, JSON, and skill-bundle result content. |
| `examples/sdk-system` | Root namespace and focused subpath imports from `@hrbr/sdk`. |
| `examples/local-platform` | Local Harbor-compatible server with the SDK-provided local frontend enabled. |

## Local Infra And Frontend

`@hrbr/sdk/platform/local` includes the local infrastructure support that belongs in this SDK repo:

- local project initialization
- local store and run recording
- local Harbor-compatible fetch handler
- local HTTP server
- built-in static local frontend served from that server

The full hosted Harbor dashboard remains product code in the Harbor monorepo. This repo carries the SDK-local frontend surface and examples for exercising it.

## Verify

```sh
bun install
bun run typecheck
bun run smoke
bun run pack:dry-run
```

The local-platform smoke starts a local server, calls it through `@hrbr/client`, confirms the frontend HTML is served, then shuts the server down.

## Publishing

Publish from the package directories after the generated artifacts have been refreshed and verified:

```sh
npm publish ./packages/client --access public
npm publish ./packages/sdk --access public
```

Use the source Harbor monorepo publish smoke before refreshing this repository so stale intermediate tarballs do not get copied here.
