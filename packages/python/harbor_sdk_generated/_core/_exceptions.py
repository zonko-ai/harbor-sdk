"""Typed error hierarchy — symbol-identical to openai-python (DESIGN §5a).

This is RESEARCH §4 #4: `except RateLimitError` instead of `if status == 429`,
with the parsed body and request id attached. Brand-agnostic on purpose — the
catchable names are the cross-SDK drop-in contract.
"""

from __future__ import annotations

from typing import Optional

import httpx

__all__ = [
    "APIError",
    "APIStatusError",
    "APIConnectionError",
    "APITimeoutError",
    "APIResponseValidationError",
    "BadRequestError",
    "AuthenticationError",
    "PermissionDeniedError",
    "NotFoundError",
    "ConflictError",
    "UnprocessableEntityError",
    "RateLimitError",
    "InternalServerError",
    "InvalidWebhookSignatureError",
]


class InvalidWebhookSignatureError(ValueError):
    """Raised when a webhook payload's signature/timestamp can't be verified.

    Standard Webhooks (standardwebhooks.com) scheme — symbol-identical to
    openai-python's `InvalidWebhookSignatureError` so `except` clauses port
    unchanged.
    """


class APIError(Exception):
    message: str
    request: httpx.Request
    body: object | None
    code: Optional[str]
    param: Optional[str]
    type: Optional[str]

    def __init__(
        self, message: str, request: httpx.Request, *, body: object | None = None
    ) -> None:
        super().__init__(message)
        self.message = message
        self.request = request
        self.body = body
        self.code = None
        self.param = None
        self.type = None
        if isinstance(body, dict):
            err = body.get("error", body) if isinstance(body.get("error"), dict) else body
            self.code = err.get("code")
            self.param = err.get("param")
            self.type = err.get("type")


class APIConnectionError(APIError):
    def __init__(
        self, *, message: str = "Connection error.", request: httpx.Request
    ) -> None:
        super().__init__(message, request, body=None)


class APITimeoutError(APIConnectionError):
    def __init__(self, request: httpx.Request) -> None:
        super().__init__(message="Request timed out.", request=request)


class APIStatusError(APIError):
    """Raised for a non-2xx response. Carries the response, status, request id."""

    response: httpx.Response
    status_code: int
    request_id: Optional[str]

    def __init__(
        self, message: str, *, response: httpx.Response, body: object | None
    ) -> None:
        super().__init__(message, response.request, body=body)
        self.response = response
        self.status_code = response.status_code
        self.request_id = response.headers.get("x-request-id")


class APIResponseValidationError(APIError):
    response: httpx.Response
    status_code: int

    def __init__(
        self, response: httpx.Response, body: object | None, *, message: str | None = None
    ) -> None:
        super().__init__(
            message or "Data returned by API invalid for expected schema.",
            response.request,
            body=body,
        )
        self.response = response
        self.status_code = response.status_code


class BadRequestError(APIStatusError):
    status_code = 400


class AuthenticationError(APIStatusError):
    status_code = 401


class PermissionDeniedError(APIStatusError):
    status_code = 403


class NotFoundError(APIStatusError):
    status_code = 404


class ConflictError(APIStatusError):
    status_code = 409


class UnprocessableEntityError(APIStatusError):
    status_code = 422


class RateLimitError(APIStatusError):
    status_code = 429


class InternalServerError(APIStatusError):
    pass


def status_error_for(response: httpx.Response, body: object | None) -> APIStatusError:
    """Map an HTTP status to the precise typed exception (RESEARCH §4 #4)."""
    msg = f"Error code: {response.status_code}"
    cls: dict[int, type[APIStatusError]] = {
        400: BadRequestError,
        401: AuthenticationError,
        403: PermissionDeniedError,
        404: NotFoundError,
        409: ConflictError,
        422: UnprocessableEntityError,
        429: RateLimitError,
    }
    if response.status_code in cls:
        return cls[response.status_code](msg, response=response, body=body)
    if response.status_code >= 500:
        return InternalServerError(msg, response=response, body=body)
    return APIStatusError(msg, response=response, body=body)
