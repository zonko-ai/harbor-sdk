# Linear and Notion Registry

This example shows the platform SDK shape for a developer-owned tool registry. Linear and Notion are modeled as normal source adapters. The registry composes sources, credentials, policy, invocation, search, and traces.

```bash
bun run example:linear-notion
```

The important pieces are:

- `defineSourceAdapter` for each provider.
- `createMemoryCredentialStore` and `createCredentialResolver` for local credentials.
- `createToolPolicy` for allow/block/approval decisions.
- `createToolRegistry` for `search`, `describe`, `schema`, `invoke`, and `call`.
- `createMemoryTraceWriter` for run graph inspection.

In production, replace the mocked `invokeTool` bodies with real Linear GraphQL and Notion API calls. The registry contract does not change.
