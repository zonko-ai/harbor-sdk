# Orbit Runtime

Orbit is the runtime primitive layer. It lets a platform expose storage, cache, AI, DB, tools, jobs, apps, and socket helpers to executed code.

```bash
bun run example:orbit-runtime
```

The memory runtime is useful for tests and local examples:

```ts
import { createMemoryOrbitRuntime } from "@hrbr/orbit/runtime"

const orbit = createMemoryOrbitRuntime({
  now: () => new Date(),
})

await orbit.storage.put({ key: "hello.json", data: { ok: true }, encoding: "json" })
await orbit.cache.set("latest", { ok: true }, 60)
```

A real platform can implement the same runtime contract on top of Cloudflare R2, KV, D1, Workers AI, WebSockets, or its own infrastructure.
