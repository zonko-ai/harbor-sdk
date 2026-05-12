import { createHarborSdkBackendServer } from "./server"
import { loadBackendEnvFile, parseBackendEnv } from "./env"

const env = parseBackendEnv(process.env["HARBOR_SDK_BACKEND_ENV"])
const loadedEnv = await loadBackendEnvFile({ env })
const port = Number(process.env["HARBOR_SDK_BACKEND_PORT"] ?? 8787)
const server = createHarborSdkBackendServer()

Bun.serve({
  port,
  fetch: server.fetch,
})

console.log(
  `Harbor SDK backend (${server.state.env}) listening on http://localhost:${port}`
)
console.log(
  loadedEnv.loaded
    ? `Loaded env file ${loadedEnv.path} (${loadedEnv.keys.length} keys)`
    : `No env file found at ${loadedEnv.path}; using process env/defaults`
)
