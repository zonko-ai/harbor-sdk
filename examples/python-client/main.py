from __future__ import annotations

import json
from typing import Any

import httpx

from harbor_sdk import (
    ExecuteResultJsonContent,
    ExecuteResultSkillBundleContent,
    ExecuteResultTextContent,
    HarborClient,
)


def execute_response() -> dict[str, Any]:
    return {
        "success": True,
        "data": {
            "result": "Loaded harbor-example skill",
            "mode": "dynamic_worker",
            "run_id": "run_python_example",
            "content": [
                {
                    "type": "text",
                    "mime_type": "text/plain; charset=utf-8",
                    "text": "Loaded harbor-example skill",
                },
                {
                    "type": "json",
                    "mime_type": "application/json",
                    "json": {"loaded": True},
                },
                {
                    "type": "skill_bundle",
                    "skill": {
                        "slug": "harbor-example",
                        "content": "---\nname: harbor-example\n---\n# Harbor Example\n",
                        "content_hash": "example-hash",
                        "files": [],
                    },
                },
            ],
        },
    }


def handler(request: httpx.Request) -> httpx.Response:
    body = json.loads(request.content.decode("utf-8"))
    if request.url.path != "/plugins/execute":
        return httpx.Response(404, json={"success": False}, request=request)
    if body.get("workspace_id") != "workspace_local":
        return httpx.Response(400, json={"success": False}, request=request)
    return httpx.Response(200, json=execute_response(), request=request)


client = HarborClient(
    api_key="hrbr_local",
    workspace_id="workspace_local",
    base_url="https://api.example.test",
    http_client=httpx.Client(transport=httpx.MockTransport(handler)),
)

result = client.runtime.execute(code='return "Loaded harbor-example skill"')

print(result.result)
for block in result.content or []:
    if isinstance(block, ExecuteResultTextContent):
        print(block.text)
    elif isinstance(block, ExecuteResultJsonContent):
        print(block.json_)
    elif isinstance(block, ExecuteResultSkillBundleContent):
        print(block.skill.slug)
