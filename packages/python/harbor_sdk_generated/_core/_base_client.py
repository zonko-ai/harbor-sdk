"""HTTP engine: retries, auth injection, idempotency, typed-error mapping.

This is where RESEARCH §4 capabilities #2 (retries w/ backoff+jitter +
Retry-After), #3 (timeouts), #4 (typed errors), #5 (request id), #11
(idempotency keys on retried writes) actually live. Generated resource code is
thin glue over `_get/_post/...`.
"""

from __future__ import annotations

import random
import secrets
import time
from typing import Any, Optional

import httpx

from ._exceptions import (
    APIConnectionError,
    APIResponseValidationError,
    APITimeoutError,
    status_error_for,
)
from ._request_options import RequestOptions
from ._sentinels import NotGiven

__all__ = ["SyncAPIClient", "AsyncAPIClient"]

_RETRY_STATUSES = {408, 409, 429}
_MAX_RETRY_DELAY = 8.0
_INITIAL_RETRY_DELAY = 0.5


class _BaseClient:
    # set by Sync/AsyncAPIClient subclasses; declared here for type-checkers
    _client: Any

    def __init__(
        self,
        *,
        base_url: str | httpx.URL,
        timeout: Any = None,
        max_retries: int = 2,
        auth_query: Optional[dict] = None,
        auth_headers: Optional[dict] = None,
    ) -> None:
        self._base_url = httpx.URL(str(base_url).rstrip("/") + "/")
        self._timeout = 60.0 if isinstance(timeout, NotGiven) or timeout is None else timeout
        self._max_retries = max_retries
        self._auth_query = auth_query or {}
        self._auth_headers = auth_headers or {}

    # --- request assembly --------------------------------------------------
    @staticmethod
    def _is_file(v: Any) -> bool:
        return (
            isinstance(v, (bytes, bytearray, tuple))
            or hasattr(v, "read")  # file-like / IO
        )

    def _build_request(
        self, method: str, path: str, options: RequestOptions, json_body: Any,
        multipart: bool = False, binary: bool = False,
        files: Any = None,
    ) -> httpx.Request:
        url = self._base_url.join(path.lstrip("/"))
        params = dict(self._auth_query)
        params.update(options.params or {})
        if options.extra_query:
            params.update(options.extra_query)
        headers = {"Accept": "application/json", **self._auth_headers}
        if options.extra_headers:
            headers.update({k: v for k, v in options.extra_headers.items() if v})
        timeout = (
            self._timeout
            if isinstance(options.timeout, NotGiven) or options.timeout is None
            else options.timeout
        )
        body = json_body if json_body is not None else options.extra_body
        # build_request (not httpx.Request) carries per-request timeout via
        # request.extensions; works identically for sync + async clients.
        if binary:
            # raw octet-stream upload (S3 PUT object, GitHub release asset,
            # …). `body` is bytes / bytes-like / a file-like reader; we send
            # it verbatim with the octet-stream content-type.
            headers.setdefault("Content-Type", "application/octet-stream")
            return self._client.build_request(
                method, url, params=params, headers=headers,
                content=body,
                timeout=httpx.Timeout(timeout),
            )
        if files is not None:
            # Multi-content auto-detect path: emitter pre-extracted the
            # file-like values via `extract_files(body, paths)`. `body`
            # carries the non-file scalars (as `data`), `files` carries
            # the multipart parts. httpx sets the content-type with
            # boundary itself. Oracle: openai-python's `skills.create`.
            return self._client.build_request(
                method, url, params=params, headers=headers,
                data=body if isinstance(body, dict) else None,
                files=files,
                timeout=httpx.Timeout(timeout),
            )
        if multipart and isinstance(body, dict):
            # Single-content multipart (e.g. transcriptions): split
            # file-like values into `files`, scalars into `data`.
            files_dict = {k: v for k, v in body.items() if self._is_file(v)}
            data = {k: v for k, v in body.items() if not self._is_file(v)}
            return self._client.build_request(
                method, url, params=params, headers=headers,
                data=data or None, files=files_dict or None,
                timeout=httpx.Timeout(timeout),
            )
        return self._client.build_request(
            method, url, params=params, headers=headers,
            json=body if body is not None else None,
            timeout=httpx.Timeout(timeout),
        )

    def _should_retry(self, response: httpx.Response) -> bool:
        return (
            response.status_code in _RETRY_STATUSES
            or response.status_code >= 500
        )

    def _retry_delay(self, response: Optional[httpx.Response], attempt: int) -> float:
        if response is not None:
            ra = response.headers.get("retry-after")
            if ra and ra.isdigit():
                return min(float(ra), _MAX_RETRY_DELAY)
        # exponential backoff + full jitter
        base = min(_INITIAL_RETRY_DELAY * (2 ** attempt), _MAX_RETRY_DELAY)
        return base * (0.5 + random.random() / 2)

    def _prepare_retry(self, request: httpx.Request) -> None:
        # auto idempotency key so retried writes are safe (RESEARCH §4 #11)
        if request.method in ("POST", "PATCH") and "idempotency-key" not in (
            k.lower() for k in request.headers
        ):
            request.headers["idempotency-key"] = f"stainful-retry-{secrets.token_hex(16)}"

    def _parse_body(self, response: httpx.Response) -> object | None:
        try:
            return response.json()
        except (ValueError, httpx.DecodingError):
            return response.text or None

    def _process_response_data(
        self, *, data: Any, cast_to: Any, response: httpx.Response
    ) -> Any:
        from ._response import APIResponse, _RAW_RESPONSE_CTX

        wrap_raw = _RAW_RESPONSE_CTX.get()
        if cast_to is None:
            return APIResponse(http_response=response, parsed=data) if wrap_raw else data
        if cast_to is bytes:                       # binary download endpoint
            content = response.content
            return APIResponse(http_response=response, parsed=content) if wrap_raw else content
        import pydantic

        # TypeAdapter handles: plain BaseModel subclasses, parametrized
        # generics (`SyncCursorPage[Widget]`), and type forms like
        # `Annotated[Union[Variant0, Variant1], Field(discriminator="type")]`
        # — the discriminated-union response shape from real specs (e.g.
        # openai audio.transcriptions returns a tagged-union object).
        # If `cast_to` isn't a pydantic-acceptable form, TypeAdapter
        # construction raises `pydantic.PydanticSchemaGenerationError`; fall
        # through and return raw data so non-modeled responses still work.
        try:
            adapter: Any = pydantic.TypeAdapter(cast_to)
        except pydantic.PydanticSchemaGenerationError:
            return APIResponse(http_response=response, parsed=data) if wrap_raw else data
        try:
            model: Any = adapter.validate_python(data)
        except pydantic.ValidationError as exc:
            raise APIResponseValidationError(
                response, data, message=str(exc)
            ) from exc
        try:
            object.__setattr__(
                model, "_request_id", response.headers.get("x-request-id")
            )
        except (AttributeError, ValueError):
            pass
        # `with_raw_response.*` is active — bundle the raw httpx.Response
        # alongside the typed model so callers get headers/status/...
        if wrap_raw:
            return APIResponse(http_response=response, parsed=model)
        return model


class SyncAPIClient(_BaseClient):
    def __init__(self, *, http_client: httpx.Client | None = None, **kw: Any) -> None:
        super().__init__(**kw)
        self._client = http_client or httpx.Client()

    def _request(
        self, method: str, path: str, *, options: RequestOptions,
        cast_to: Any, json_body: Any = None,
        stream: bool = False, stream_cls: type | None = None,
        multipart: bool = False, binary: bool = False,
        files: Any = None,
    ) -> Any:
        request = self._build_request(
            method, path, options, json_body,
            multipart=multipart, binary=binary, files=files,
        )
        last_exc: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                response = self._client.send(request, stream=stream)
            except httpx.TimeoutException:
                last_exc = APITimeoutError(request)
            except httpx.HTTPError:
                last_exc = APIConnectionError(request=request)
            else:
                if response.is_success:
                    if stream and stream_cls is not None:
                        return stream_cls(
                            cast_to=cast_to, response=response, client=self
                        )
                    return self._process_response_data(
                        data=self._parse_body(response),
                        cast_to=cast_to, response=response,
                    )
                if stream:
                    response.read()  # drain so the error body is available
                if attempt < self._max_retries and self._should_retry(response):
                    time.sleep(self._retry_delay(response, attempt))
                    self._prepare_retry(request)
                    continue
                raise status_error_for(response, self._parse_body(response))
            if attempt < self._max_retries:
                time.sleep(self._retry_delay(None, attempt))
                self._prepare_retry(request)
                continue
            assert last_exc is not None
            raise last_exc
        raise RuntimeError("unreachable")  # pragma: no cover

    def _get(self, path: str, *, options: RequestOptions, cast_to: Any) -> Any:
        return self._request("GET", path, options=options, cast_to=cast_to)

    def _delete(self, path: str, *, options: RequestOptions, cast_to: Any) -> Any:
        return self._request("DELETE", path, options=options, cast_to=cast_to)

    def _post(self, path: str, *, body: Any = None, options: RequestOptions,
              cast_to: Any, stream: bool = False,
              stream_cls: type | None = None,
              multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return self._request("POST", path, options=options, cast_to=cast_to,
                             json_body=body, stream=stream,
                             stream_cls=stream_cls,
                             multipart=multipart, binary=binary,
                             files=files)

    def _put(self, path: str, *, body: Any = None, options: RequestOptions,
             cast_to: Any,
             multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return self._request("PUT", path, options=options, cast_to=cast_to,
                             json_body=body,
                             multipart=multipart, binary=binary,
                             files=files)

    def _patch(self, path: str, *, body: Any = None, options: RequestOptions,
               cast_to: Any,
               multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return self._request("PATCH", path, options=options, cast_to=cast_to,
                             json_body=body,
                             multipart=multipart, binary=binary,
                             files=files)

    def _get_api_list(
        self, path: str, *, page: type, options: RequestOptions,
        pagination_cfg: dict | None = None,
    ) -> Any:
        result = self._request("GET", path, options=options, cast_to=page)
        return result._init_pagination(self, path, page, options, pagination_cfg)

    def _paginate_next(self, path, page, options, info, pagination_cfg=None):
        from .pagination import merge_options

        return self._get_api_list(
            path, page=page, options=merge_options(options, info),
            pagination_cfg=pagination_cfg,
        )


class AsyncAPIClient(_BaseClient):
    def __init__(self, *, http_client: httpx.AsyncClient | None = None,
                 **kw: Any) -> None:
        super().__init__(**kw)
        self._client = http_client or httpx.AsyncClient()

    async def _request(
        self, method: str, path: str, *, options: RequestOptions,
        cast_to: Any, json_body: Any = None,
        stream: bool = False, stream_cls: type | None = None,
        multipart: bool = False, binary: bool = False,
        files: Any = None,
    ) -> Any:
        import asyncio

        request = self._build_request(
            method, path, options, json_body,
            multipart=multipart, binary=binary, files=files,
        )
        last_exc: Exception | None = None
        for attempt in range(self._max_retries + 1):
            try:
                response = await self._client.send(request, stream=stream)
            except httpx.TimeoutException:
                last_exc = APITimeoutError(request)
            except httpx.HTTPError:
                last_exc = APIConnectionError(request=request)
            else:
                if response.is_success:
                    if stream and stream_cls is not None:
                        return stream_cls(
                            cast_to=cast_to, response=response, client=self
                        )
                    return self._process_response_data(
                        data=self._parse_body(response),
                        cast_to=cast_to, response=response,
                    )
                if stream:
                    await response.aread()
                if attempt < self._max_retries and self._should_retry(response):
                    await asyncio.sleep(self._retry_delay(response, attempt))
                    self._prepare_retry(request)
                    continue
                raise status_error_for(response, self._parse_body(response))
            if attempt < self._max_retries:
                await asyncio.sleep(self._retry_delay(None, attempt))
                self._prepare_retry(request)
                continue
            assert last_exc is not None
            raise last_exc
        raise RuntimeError("unreachable")  # pragma: no cover

    async def _get(self, path: str, *, options: RequestOptions,
                    cast_to: Any) -> Any:
        return await self._request("GET", path, options=options, cast_to=cast_to)

    async def _delete(self, path: str, *, options: RequestOptions,
                       cast_to: Any) -> Any:
        return await self._request("DELETE", path, options=options, cast_to=cast_to)

    async def _post(self, path: str, *, body: Any = None, options: RequestOptions,
                     cast_to: Any, stream: bool = False,
                     stream_cls: type | None = None,
                     multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return await self._request("POST", path, options=options, cast_to=cast_to,
                                   json_body=body, stream=stream,
                                   stream_cls=stream_cls,
                                   multipart=multipart, binary=binary,
                                   files=files)

    async def _put(self, path: str, *, body: Any = None, options: RequestOptions,
                    cast_to: Any,
                    multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return await self._request("PUT", path, options=options, cast_to=cast_to,
                                   json_body=body,
                                   multipart=multipart, binary=binary,
                                   files=files)

    async def _patch(self, path: str, *, body: Any = None, options: RequestOptions,
                      cast_to: Any,
                      multipart: bool = False, binary: bool = False,
              files: Any = None) -> Any:
        return await self._request("PATCH", path, options=options, cast_to=cast_to,
                                   json_body=body,
                                   multipart=multipart, binary=binary,
                                   files=files)

    async def _get_api_list(
        self, path: str, *, page: type, options: RequestOptions,
        pagination_cfg: dict | None = None,
    ) -> Any:
        result = await self._request("GET", path, options=options, cast_to=page)
        return result._init_pagination(self, path, page, options, pagination_cfg)

    async def _paginate_next(self, path, page, options, info, pagination_cfg=None):
        from .pagination import merge_options

        return await self._get_api_list(
            path, page=page, options=merge_options(options, info),
            pagination_cfg=pagination_cfg,
        )
