# Local Plugin Source Model

This note anchors SDK-local plugin examples to Harbor's real source model without
copying the hosted control plane into the SDK.

## Reference Model

Hosted Harbor stores plugin state in Cloudflare D1 tables:

| Hosted Harbor concept | SDK-local equivalent |
| --- | --- |
| `plugin_sources` installed source rows | `source_refs` in `.harbor/harbor.sqlite` |
| `plugin_tools` discovered/indexed tools | `tool_index` in `.harbor/harbor.sqlite` |
| `plugin_credentials` encrypted source credentials | `.harbor/credentials.enc` plus `credential_metadata` |
| `oauth_clients`, `oauth_grants`, `oauth_pending_flows` | opt-in local OAuth records in `.harbor/harbor.sqlite` |
| registry dev/source references | `.harbor/registry-dev-refs.json` |

The SDK examples should use this mapping to teach the primitives while staying
clear of hosted-only workspace admin, billing, OAuth app administration, and
dashboard behavior.

## Source Choices

- Linear examples use `linear-mcp`, namespace `linear-mcp`.
- Do not use `linear-graphql` or `linear_graphql` in these examples.
- Notion examples use `notion-mcp`, namespace `notion-mcp`, after local OAuth
  support exists.

## Local Runtime Expectations

- Plugin examples install package/source/tool metadata into the local runtime
  store before running.
- Tools are called through the local tool index, not by ad hoc env reads.
- Secrets enter through setup/import commands and are stored encrypted before
  execution.
- QuickJS/local execution resolves credentials by source ref and slot.
- OAuth support is optional and source-enabled, not a required dependency for
  every local plugin.
