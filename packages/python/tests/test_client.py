from __future__ import annotations

import asyncio
import json
import os
import unittest
from unittest.mock import patch

import httpx

from harbor_sdk import (
    AsyncHarborClient,
    ExecuteResultJsonContent,
    ExecuteResultSkillBundleContent,
    ExecuteResultTextContent,
    HarborClient,
    HarborClientConfigurationError,
    RuntimeExecuteResult,
)


def execute_response() -> dict:
    return {
        "success": True,
        "data": {
            "result": "ok",
            "mode": "dynamic_worker",
            "run_id": "run_python_sdk",
            "content": [
                {
                    "type": "text",
                    "mime_type": "text/plain; charset=utf-8",
                    "text": "ok",
                },
                {
                    "type": "json",
                    "mime_type": "application/json",
                    "json": {"loaded": True},
                },
                {
                    "type": "skill_bundle",
                    "skill": {
                        "slug": "harbor",
                        "name": "Harbor",
                        "content": "---\nname: harbor\n---\n# Harbor\n",
                        "content_hash": "abc123def456",
                        "files": [
                            {
                                "relative_path": "references/usage.md",
                                "content_base64": "IyBVc2FnZQo=",
                                "content_hash": "def456abc123",
                            }
                        ],
                    },
                },
            ],
        },
    }


class HarborPythonClientTests(unittest.TestCase):
    def test_requires_workspace_id_for_scoped_client(self) -> None:
        with patch.dict(os.environ, {"HARBOR_API_KEY": "hrbr_test"}, clear=True):
            with self.assertRaisesRegex(
                HarborClientConfigurationError,
                "workspace_id",
            ):
                HarborClient()

    def test_sync_runtime_execute_injects_workspace_and_preserves_content(self) -> None:
        requests: list[dict] = []

        def handler(request: httpx.Request) -> httpx.Response:
            requests.append(
                {
                    "path": request.url.path,
                    "authorization": request.headers.get("authorization"),
                    "body": json.loads(request.content.decode("utf-8")),
                }
            )
            return httpx.Response(200, json=execute_response(), request=request)

        client = HarborClient(
            api_key="hrbr_test",
            workspace_id="workspace_test",
            base_url="https://api.example.test",
            http_client=httpx.Client(transport=httpx.MockTransport(handler)),
        )

        result = client.runtime.execute(code='return "ok"')

        self.assertIsInstance(result, RuntimeExecuteResult)
        self.assertEqual(result.result, "ok")
        self.assertEqual(requests[0]["path"], "/plugins/execute")
        self.assertEqual(requests[0]["authorization"], "Bearer hrbr_test")
        self.assertEqual(requests[0]["body"]["workspace_id"], "workspace_test")
        self.assertEqual(requests[0]["body"]["code"], 'return "ok"')
        self.assertIsInstance(result.content[0], ExecuteResultTextContent)
        self.assertEqual(result.content[0].text, "ok")
        self.assertIsInstance(result.content[1], ExecuteResultJsonContent)
        self.assertEqual(result.content[1].json_, {"loaded": True})
        self.assertIsInstance(result.content[2], ExecuteResultSkillBundleContent)
        self.assertEqual(result.content[2].skill.slug, "harbor")
        self.assertEqual(result.content[2].skill.files[0].relative_path, "references/usage.md")

    def test_sync_client_reads_environment_defaults(self) -> None:
        requests: list[dict] = []

        def handler(request: httpx.Request) -> httpx.Response:
            requests.append(
                {
                    "url": str(request.url),
                    "authorization": request.headers.get("authorization"),
                    "body": json.loads(request.content.decode("utf-8")),
                }
            )
            return httpx.Response(200, json=execute_response(), request=request)

        with patch.dict(
            os.environ,
            {
                "HARBOR_API_KEY": "hrbr_env",
                "HARBOR_WORKSPACE_ID": "workspace_env",
                "HARBOR_API_BASE_URL": "https://env.example.test",
            },
            clear=True,
        ):
            client = HarborClient(http_client=httpx.Client(transport=httpx.MockTransport(handler)))
            client.runtime.execute(code="return 1")

        self.assertEqual(requests[0]["authorization"], "Bearer hrbr_env")
        self.assertEqual(requests[0]["url"], "https://env.example.test/plugins/execute")
        self.assertEqual(requests[0]["body"]["workspace_id"], "workspace_env")

    def test_async_runtime_execute_matches_sync_surface(self) -> None:
        async def run() -> None:
            requests: list[dict] = []

            def handler(request: httpx.Request) -> httpx.Response:
                requests.append(
                    {
                        "path": request.url.path,
                        "authorization": request.headers.get("authorization"),
                        "body": json.loads(request.content.decode("utf-8")),
                    }
                )
                return httpx.Response(200, json=execute_response(), request=request)

            client = AsyncHarborClient(
                api_key="hrbr_async",
                workspace_id="workspace_async",
                base_url="https://api.example.test",
                http_client=httpx.AsyncClient(transport=httpx.MockTransport(handler)),
            )

            result = await client.runtime.execute(code='return "async"')

            self.assertEqual(result.result, "ok")
            self.assertEqual(requests[0]["path"], "/plugins/execute")
            self.assertEqual(requests[0]["authorization"], "Bearer hrbr_async")
            self.assertEqual(requests[0]["body"]["workspace_id"], "workspace_async")
            self.assertIsInstance(result.content[0], ExecuteResultTextContent)

        asyncio.run(run())


if __name__ == "__main__":
    unittest.main()
