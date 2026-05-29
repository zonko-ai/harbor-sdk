"""`with_raw_response` / `with_streaming_response` method wrappers (§5a).

Symbol- and signature-compatible with openai-python. Stainful v0.4 ships
a real `APIResponse[T]` (oracle: openai-python's class), so users can
get response headers + status off any method call:

    response = client.things.with_raw_response.list()
    print(response.status_code, response.headers["x-request-id"])
    things = response.parse()                # the typed model

Under the hood: the wrapper sets a context-var before invoking the
wrapped method; the runtime's `_process_response_data` checks it and,
when set, returns `APIResponse(http_response=..., parsed=model)`
instead of the bare model. The context-var is task-safe (works in
async) and reset in a `finally`, so cross-talk between concurrent
calls / streaming response wrappers is impossible.

`with_streaming_response.*` is still a pass-through today (v1.1
backlog) — streaming responses already expose .http_response via the
Stream object.
"""

from __future__ import annotations

import contextvars
import functools
from typing import Any, Callable, Generic, TypeVar

import httpx

__all__ = [
    "APIResponse",
    "_RAW_RESPONSE_CTX",       # consumed by `_BaseClient._process_response_data`
    "to_raw_response_wrapper",
    "async_to_raw_response_wrapper",
    "to_streamed_response_wrapper",
    "async_to_streamed_response_wrapper",
]

T = TypeVar("T")

# Set to True while the SDK is being called through a `with_raw_response`
# wrapper — the runtime then returns `APIResponse(...)` instead of the bare
# parsed model. ContextVar so concurrent async tasks don't pollute each
# other; reset in the wrapper's `finally`.
_RAW_RESPONSE_CTX: contextvars.ContextVar[bool] = contextvars.ContextVar(
    "stainful_wrap_raw_response", default=False
)


class APIResponse(Generic[T]):
    """Rich response wrapper exposing raw httpx fields + the typed model.

    Symbol-identical to openai-python's `APIResponse`. The `parse()` method
    returns the typed model the SDK already produced (no re-parsing); the
    raw httpx response is available on `.http_response` for everything else
    (headers, status, content, cookies, …).
    """

    http_response: httpx.Response
    _parsed: T

    def __init__(self, *, http_response: httpx.Response, parsed: T) -> None:
        self.http_response = http_response
        self._parsed = parsed

    @property
    def status_code(self) -> int:
        return self.http_response.status_code

    @property
    def headers(self) -> httpx.Headers:
        return self.http_response.headers

    @property
    def url(self) -> httpx.URL:
        return self.http_response.url

    @property
    def request_id(self) -> str | None:
        return self.http_response.headers.get("x-request-id")

    @property
    def content(self) -> bytes:
        return self.http_response.content

    def parse(self) -> T:
        """Return the typed model the SDK already validated for this call."""
        return self._parsed


def to_raw_response_wrapper(
    func: Callable[..., T],
) -> Callable[..., APIResponse[T]]:
    """Wrap an SDK method so it returns `APIResponse[T]` instead of `T`."""

    @functools.wraps(func)
    def wrapped(*args: Any, **kwargs: Any) -> APIResponse[T]:
        token = _RAW_RESPONSE_CTX.set(True)
        try:
            # The runtime sees `_RAW_RESPONSE_CTX` set and returns an
            # `APIResponse[T]` — annotated as `T` so type-checkers stay
            # happy, but the runtime guarantees the wrapper substitution.
            return func(*args, **kwargs)        # type: ignore[return-value]
        finally:
            _RAW_RESPONSE_CTX.reset(token)

    return wrapped


def async_to_raw_response_wrapper(
    func: Callable[..., Any],
) -> Callable[..., Any]:
    @functools.wraps(func)
    async def wrapped(*args: Any, **kwargs: Any) -> Any:
        token = _RAW_RESPONSE_CTX.set(True)
        try:
            return await func(*args, **kwargs)
        finally:
            _RAW_RESPONSE_CTX.reset(token)

    return wrapped


def to_streamed_response_wrapper(
    func: Callable[..., Any],
) -> Callable[..., Any]:
    @functools.wraps(func)
    def wrapped(*args: Any, **kwargs: Any) -> Any:
        return func(*args, **kwargs)

    return wrapped


def async_to_streamed_response_wrapper(
    func: Callable[..., Any],
) -> Callable[..., Any]:
    @functools.wraps(func)
    async def wrapped(*args: Any, **kwargs: Any) -> Any:
        return await func(*args, **kwargs)

    return wrapped
