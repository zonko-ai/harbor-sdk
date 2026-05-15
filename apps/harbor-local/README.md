# Harbor Local

Local Harbor is a repo-local MCP plugin console backed by `@hrbr/sdk/local`.

V1 is offline and MCP-only:

- catalog data comes from the checked-in local MCP seed
- runtime state lives in project-local `.harbor/`
- OAuth and credentials are handled by the SDK local runtime
- no WorkOS, hosted workspace auth, Orbit, workflows, jobs, apps, or Cloudflare runtime is required

Run:

```sh
HARBOR_LOCAL_CREDENTIAL_KEY=dev-key bun run --cwd apps/harbor-local dev
```

The app binds to `127.0.0.1` and defaults to port `7332`.

Open `http://127.0.0.1:7332` for:

- Overview: local runtime health, state path, catalog count, source count, and recent traces
- Plugins: catalog install, custom MCP URL install, OAuth connect, source refresh, tool search, schema inspection, and invocation
- Traces: persisted local tool invocation history and raw trace details
