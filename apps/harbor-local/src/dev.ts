import { createHarborLocalServer } from "./server"
import { readHarborLocalServerEnv } from "./env"

const env = readHarborLocalServerEnv()
const server = createHarborLocalServer({ env })

Bun.serve({
  hostname: env.host,
  port: env.port,
  fetch: server.fetch,
})

console.log(`Harbor Local listening on http://${env.host}:${env.port}`)
console.log(`Project state: ${env.projectRoot}/.harbor`)
