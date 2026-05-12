# Harbor Backend Rebuild

This is a new Harbor backend implementation built inside `harbor-sdk` to
validate that Harbor route contracts can be served by SDK primitives.

It intentionally does not export a public `createHarbor()` SDK surface. The
backend is an app package that composes:

- `@hrbr/tools` for registry/search/describe/invoke.
- `@hrbr/source-core` for source adapters.
- `@hrbr/source-credentials` for credential resolution.
- `@hrbr/source-policy` for invocation policy.
- `@hrbr/runs` for in-memory run and span traces.
- `@hrbr/workspaces`, `@hrbr/sources`, and `@hrbr/client` wire contracts.

## Environment

The backend loads `apps/harbor-backend/.env.<env>` before it starts. Only
non-production environment names are accepted:

- `HARBOR_SDK_BACKEND_ENV=dev`
- `HARBOR_SDK_BACKEND_ENV=staging`

The neighboring Harbor repo was used read-only for environment shape:
`../harbor/.env.dev.example` and `../harbor/.env.staging.example`. Copy the
matching values into this package's ignored `.env.dev` or `.env.staging` file.
This package does not read or write `../harbor/.env.prod`.

Optional local variables:

- `HARBOR_SDK_BACKEND_PORT` defaults to `8787`.
- `INTERNAL_API_SECRET` or `LIGHTHOUSE_API_SECRET` seeds the internal tools
  source credential.
- `EXA_API_KEY` is detected only as a redacted capability signal.

## Run

```sh
HARBOR_SDK_BACKEND_ENV=dev bun run --filter @hrbr/harbor-backend dev
```

For staging Cloudflare validation:

```sh
bun run --filter @hrbr/harbor-backend dev:staging
```

`/health` reports whether the staging Cloudflare coordinates were loaded
without exposing token values. `/cloudflare/staging` performs a live
Cloudflare account API check using the loaded staging env file and returns only
redacted status metadata.
