"""Per-request options + `make_request_options` (DESIGN §5a).

`make_request_options` is what every generated method calls to fold the
`extra_headers/extra_query/extra_body/timeout` tail into one object.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import httpx

from ._sentinels import NotGiven, not_given
from ._types import Body, Headers, Query

__all__ = ["RequestOptions", "make_request_options"]


@dataclass
class RequestOptions:
    extra_headers: Optional[Headers] = None
    extra_query: Optional[Query] = None
    extra_body: Optional[Body] = None
    timeout: float | httpx.Timeout | None | NotGiven = not_given
    max_retries: int | NotGiven = not_given
    idempotency_key: Optional[str] = None
    params: dict = field(default_factory=dict)


def make_request_options(
    *,
    extra_headers: Optional[Headers] = None,
    extra_query: Optional[Query] = None,
    extra_body: Optional[Body] = None,
    timeout: float | httpx.Timeout | None | NotGiven = not_given,
    idempotency_key: Optional[str] = None,
    params: Optional[dict] = None,
) -> RequestOptions:
    return RequestOptions(
        extra_headers=extra_headers,
        extra_query=extra_query,
        extra_body=extra_body,
        timeout=timeout,
        idempotency_key=idempotency_key,
        params=params or {},
    )
