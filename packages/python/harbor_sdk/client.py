from __future__ import annotations

import os
from typing import Literal

import httpx

from harbor_sdk_generated import AsyncHarbor as _AsyncGeneratedHarbor
from harbor_sdk_generated import Harbor as _GeneratedHarbor
from harbor_sdk_generated._core._sentinels import NotGiven, not_given
from harbor_sdk_generated._core._types import Body, Headers, Query

from .types import (
    RuntimeExecuteParamsExecutionInputs,
    RuntimeExecuteParamsSources,
    RuntimeExecuteResult,
)

_DEFAULT_BASE_URL = "https://api.tryharbor.ai"


class HarborClientConfigurationError(ValueError):
    """Raised when a Harbor client is missing required configuration."""


def _required_config(
    *,
    explicit: str | None,
    env_name: str,
    option_name: str,
    description: str,
) -> str:
    value = explicit if explicit is not None else os.environ.get(env_name)
    if value is None or value.strip() == "":
        raise HarborClientConfigurationError(
            f"HarborClient requires {description}. Pass {option_name}=... "
            f"or set {env_name}."
        )
    return value


def _resolve_base_url(base_url: str | httpx.URL | None) -> str | httpx.URL:
    return (
        base_url
        or os.environ.get("HARBOR_API_BASE_URL")
        or os.environ.get("HARBOR_SDK_BASE_URL")
        or _DEFAULT_BASE_URL
    )


class HarborRuntimeClient:
    def __init__(self, generated: _GeneratedHarbor, workspace_id: str) -> None:
        self._generated = generated
        self._workspace_id = workspace_id

    def execute(
        self,
        *,
        code: str,
        execution_inputs: list[RuntimeExecuteParamsExecutionInputs] | NotGiven = not_given,
        mode: Literal["exec", "workflow"] | NotGiven = not_given,
        origin_cwd: str | NotGiven = not_given,
        run_id: str | NotGiven = not_given,
        sand_session_id: str | NotGiven = not_given,
        sources: list[RuntimeExecuteParamsSources] | NotGiven = not_given,
        timeout_ms: float | NotGiven = not_given,
        extra_headers: Headers | None = None,
        extra_query: Query | None = None,
        extra_body: Body | None = None,
        timeout: float | httpx.Timeout | None | NotGiven = not_given,
    ) -> RuntimeExecuteResult:
        response = self._generated.runtime.execute(
            code=code,
            workspace_id=self._workspace_id,
            execution_inputs=execution_inputs,
            mode=mode,
            origin_cwd=origin_cwd,
            run_id=run_id,
            sand_session_id=sand_session_id,
            sources=sources,
            timeout_ms=timeout_ms,
            extra_headers=extra_headers,
            extra_query=extra_query,
            extra_body=extra_body,
            timeout=timeout,
        )
        return response.data


class AsyncHarborRuntimeClient:
    def __init__(self, generated: _AsyncGeneratedHarbor, workspace_id: str) -> None:
        self._generated = generated
        self._workspace_id = workspace_id

    async def execute(
        self,
        *,
        code: str,
        execution_inputs: list[RuntimeExecuteParamsExecutionInputs] | NotGiven = not_given,
        mode: Literal["exec", "workflow"] | NotGiven = not_given,
        origin_cwd: str | NotGiven = not_given,
        run_id: str | NotGiven = not_given,
        sand_session_id: str | NotGiven = not_given,
        sources: list[RuntimeExecuteParamsSources] | NotGiven = not_given,
        timeout_ms: float | NotGiven = not_given,
        extra_headers: Headers | None = None,
        extra_query: Query | None = None,
        extra_body: Body | None = None,
        timeout: float | httpx.Timeout | None | NotGiven = not_given,
    ) -> RuntimeExecuteResult:
        response = await self._generated.runtime.execute(
            code=code,
            workspace_id=self._workspace_id,
            execution_inputs=execution_inputs,
            mode=mode,
            origin_cwd=origin_cwd,
            run_id=run_id,
            sand_session_id=sand_session_id,
            sources=sources,
            timeout_ms=timeout_ms,
            extra_headers=extra_headers,
            extra_query=extra_query,
            extra_body=extra_body,
            timeout=timeout,
        )
        return response.data


class HarborClient:
    """Synchronous workspace-scoped Harbor client."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        workspace_id: str | None = None,
        base_url: str | httpx.URL | None = None,
        timeout: float | httpx.Timeout | None | NotGiven = not_given,
        max_retries: int = 2,
        http_client: httpx.Client | None = None,
    ) -> None:
        resolved_api_key = _required_config(
            explicit=api_key,
            env_name="HARBOR_API_KEY",
            option_name="api_key",
            description="an API key",
        )
        self.workspace_id = _required_config(
            explicit=workspace_id,
            env_name="HARBOR_WORKSPACE_ID",
            option_name="workspace_id",
            description="a workspace_id",
        )
        self.generated = _GeneratedHarbor(
            api_key=resolved_api_key,
            base_url=_resolve_base_url(base_url),
            timeout=timeout,
            max_retries=max_retries,
            http_client=http_client,
        )
        self.health = self.generated.health
        self.runtime = HarborRuntimeClient(self.generated, self.workspace_id)


class AsyncHarborClient:
    """Asynchronous workspace-scoped Harbor client."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        workspace_id: str | None = None,
        base_url: str | httpx.URL | None = None,
        timeout: float | httpx.Timeout | None | NotGiven = not_given,
        max_retries: int = 2,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        resolved_api_key = _required_config(
            explicit=api_key,
            env_name="HARBOR_API_KEY",
            option_name="api_key",
            description="an API key",
        )
        self.workspace_id = _required_config(
            explicit=workspace_id,
            env_name="HARBOR_WORKSPACE_ID",
            option_name="workspace_id",
            description="a workspace_id",
        )
        self.generated = _AsyncGeneratedHarbor(
            api_key=resolved_api_key,
            base_url=_resolve_base_url(base_url),
            timeout=timeout,
            max_retries=max_retries,
            http_client=http_client,
        )
        self.health = self.generated.health
        self.runtime = AsyncHarborRuntimeClient(self.generated, self.workspace_id)
