import { startExampleLocalHarbor } from './index.js'

const local = await startExampleLocalHarbor()

console.log(local.server.url)

const shutdown = async () => {
  await local.close()
  process.exit(0)
}

process.once('SIGINT', () => {
  void shutdown()
})
process.once('SIGTERM', () => {
  void shutdown()
})

await new Promise(() => {})
