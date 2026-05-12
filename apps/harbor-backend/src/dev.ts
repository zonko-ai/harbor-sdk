import { createHarborSdkBackendServer } from "./server"
import { loadBackendEnvFile, parseBackendEnv } from "./env"
import { registerDefaultOrbitOnCloudflare } from "./orbit-registration"

const env = parseBackendEnv(process.env["HARBOR_SDK_BACKEND_ENV"])
const loadedEnv = await loadBackendEnvFile({ env })
const port = Number(process.env["HARBOR_SDK_BACKEND_PORT"] ?? 8787)
const server = createHarborSdkBackendServer()

let orbitRegistration:
  | { readonly ok: true; readonly url: string }
  | { readonly ok: false; readonly error: string }
  | null = null
if (env === "staging" || process.env["HARBOR_SDK_REGISTER_ORBIT"] === "1") {
  try {
    const registered = await registerDefaultOrbitOnCloudflare(server.state)
    orbitRegistration = { ok: true, url: registered.url }
  } catch (error) {
    orbitRegistration = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

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
if (orbitRegistration) {
  console.log(
    orbitRegistration.ok
      ? `Registered default Orbit app on Cloudflare: ${orbitRegistration.url}`
      : `Default Orbit Cloudflare registration failed: ${orbitRegistration.error}`
  )
}
