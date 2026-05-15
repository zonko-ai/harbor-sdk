# Harbor Local

Local Harbor is a repo-local MCP plugin console backed by `@hrbr/sdk/local`.

V1 is offline and MCP-only:

- catalog data comes from the checked-in local MCP seed
- runtime state lives in project-local `.harbor/`
- OAuth and credentials are handled by the SDK local runtime
- no WorkOS, hosted workspace auth, Orbit, workflows, jobs, apps, or Cloudflare runtime is required

## Pages

- **Overview** — runtime status, setup tiles, 30-day usage chart, and recent invocations
- **Plugins** — connected + available plugin cards with a detail modal that exposes tools, schemas, and invocation
- **Traces** — filterable invocation history with a paired detail panel

## Architecture

- `src/` — Bun HTTP server. Wraps `@hrbr/sdk/local` and exposes `/api/*` for the dashboard.
- `web/` — Vite + React + Tailwind v4 dashboard (Geist font, dark theme, lucide icons).
- `public/dist/` — Vite build output. The Bun server serves it as static assets.

## Agent MCP

After installing plugins through the dashboard, agents can connect to Local Harbor's MCP endpoint:

```txt
http://127.0.0.1:7332/mcp
```

The endpoint exposes control-plane tools for catalog listing, source listing, source refresh, tool search, schema lookup, tool invocation, and invocation history. It does not create one MCP tool per connected plugin tool; agents search the local Harbor registry first and then invoke the selected indexed tool.

## Run

```sh
# One-time
bun run --cwd apps/harbor-local install:web

# Build the dashboard
bun run --cwd apps/harbor-local build:web

# Start the local runtime (binds 127.0.0.1:7332)
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
```

For dashboard development with hot reload, run the API server and the Vite dev server side-by-side:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
bun run --cwd apps/harbor-local dev:web   # Vite at http://127.0.0.1:5173, proxies /api and /health to 7332
```
