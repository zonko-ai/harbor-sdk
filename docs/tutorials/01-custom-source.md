# Custom Source Adapter

A source adapter is the smallest useful unit in the platform SDK. It names a namespace, exposes tool definitions, and handles invocation.

```ts
import { defineSourceAdapter } from "@hrbr/source-core"

export const tickets = defineSourceAdapter({
  namespace: "tickets",
  displayName: "Tickets",
  listTools: async () => [
    {
      name: "create",
      displayName: "Create ticket",
      description: "Create a support ticket.",
      inputSchema: {
        type: "object",
        required: ["title"],
        properties: { title: { type: "string" } },
      },
      kind: "custom",
    },
  ],
  invokeTool: async (name, input, ctx) => {
    if (name !== "create") throw new Error(`Unknown tool: ${name}`)
    const apiKey = ctx?.credentials?.require("api_key")
    return { id: "ticket_123", title: input["title"], authenticated: Boolean(apiKey) }
  },
})
```

Run the full example:

```bash
bun run example:custom-source
```
