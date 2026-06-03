# Harbor Python SDK

Python client SDK for Harbor's workspace-scoped control plane.

The package is split into two layers:

- `harbor_sdk`: hand-authored public client facade for application developers.
- `harbor_sdk_generated`: generated protocol client produced from the shared
  Harbor OpenAPI and Stainless-compatible config.

## Usage

```python
from harbor_sdk import HarborClient

client = HarborClient(
    api_key="hrbr_...",
    workspace_id="workspace_...",
)

result = client.runtime.execute(code='return "ok"')
print(result.result)

for block in result.content or []:
    if block.type == "text":
        print(block.text)
    elif block.type == "json":
        print(block.json_)
    elif block.type == "skill_bundle":
        print(block.skill.slug)
```

Async callers use the same surface:

```python
from harbor_sdk import AsyncHarborClient

client = AsyncHarborClient(
    api_key="hrbr_...",
    workspace_id="workspace_...",
)

result = await client.runtime.execute(code='return "ok"')
```

`api_key` defaults to `HARBOR_API_KEY`. `workspace_id` defaults to
`HARBOR_WORKSPACE_ID`. API-key clients require a workspace id at construction;
there is no hidden workspace lookup.

## Regeneration

The generated layer is refreshed from the repo root:

```bash
HARBOR_STAINFUL_BIN=tmp/protocol/python/.venv/bin/stainful bun run protocol:generate:python
```

Do not edit `harbor_sdk_generated` by hand. Change the shared OpenAPI/Stainless
inputs or the generator script instead.
