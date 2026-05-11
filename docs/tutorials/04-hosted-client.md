# Hosted Harbor Client

Use `@hrbr/client` when an app wants to talk to hosted Harbor SaaS instead of running its own registry/runtime.

```ts
import { createHarborClient } from "@hrbr/client"

const harbor = createHarborClient({
  apiUrl: process.env.HRBR_API_URL ?? "https://api.tryharbor.ai",
  apiKey: process.env.HRBR_API_KEY!,
  workspaceId: process.env.HRBR_WORKSPACE_ID!,
})

const matches = await harbor.tools.search({ query: "send email", limit: 5 })
```

This is the client SDK path. The platform SDK path is the lower-level package set used by `examples/tool-registry-linear-notion` and `examples/sdk-custom-source`.
