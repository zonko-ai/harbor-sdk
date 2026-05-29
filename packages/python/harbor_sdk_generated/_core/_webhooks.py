"""Webhook signature verification — **Standard Webhooks** scheme
(https://www.standardwebhooks.com/), as used by openai-python, Vercel,
Resend, and a growing list of providers. Vendored into generated SDKs
under `<pkg>/_core/_webhooks.py`.

Wire format pinned by the oracle (openai-python/.../resources/webhooks/
webhooks.py):

  • Headers:    `webhook-signature`, `webhook-timestamp`, `webhook-id`
  • Signed payload:   f"{webhook_id}.{timestamp}.{body}"
  • Signature header: space-separated list of `v1,<base64>` (legacy form
    without the `v1,` prefix is accepted too)
  • HMAC:       SHA-256, base64-encoded
  • Secret:     if it starts with `whsec_`, base64-decode the remainder;
                otherwise UTF-8 bytes
  • Compare:    `hmac.compare_digest`, any signature in the header may match
  • Replay:     timestamp must be within ±tolerance seconds (default 300)

`InvalidWebhookSignatureError` lives in `_exceptions` so it sits next to
the other typed errors and is exportable from the SDK root.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any, Mapping

from ._exceptions import InvalidWebhookSignatureError

__all__ = ["verify_signature", "unwrap_event", "get_required_header"]


def get_required_header(headers: Mapping[str, str] | Any, name: str) -> str:
    """Lookup `name` case-insensitively from a httpx-style headers mapping.

    Accepts `dict`, `httpx.Headers`, anything with `__getitem__` / `.get`.
    Raises `InvalidWebhookSignatureError` if missing — matches the oracle.
    """
    # httpx.Headers handles case-insensitivity itself; for plain dicts we
    # walk keys ourselves so users can pass either.
    getter = getattr(headers, "get", None)
    if callable(getter):
        v = getter(name)
        if v is None:
            v = getter(name.lower())
        if v is None:
            v = getter(name.title())
        if v is not None:
            return str(v)
    target = name.lower()
    for k, v in (headers.items() if hasattr(headers, "items") else []):
        if str(k).lower() == target:
            return str(v)
    raise InvalidWebhookSignatureError(
        f"Missing required header: {name}"
    )


def _decode_secret(secret: str) -> bytes:
    if secret.startswith("whsec_"):
        return base64.b64decode(secret[6:])
    return secret.encode()


def verify_signature(
    payload: str | bytes,
    headers: Mapping[str, str] | Any,
    *,
    secret: str,
    tolerance: int = 300,
) -> None:
    """Standard Webhooks signature + timestamp verify. Raises on mismatch.

    `tolerance` is the replay window in seconds (default 5 minutes, matches
    the oracle).
    """
    if not secret:
        raise ValueError(
            "The webhook secret must be provided via `secret=`."
        )

    signature_header = get_required_header(headers, "webhook-signature")
    timestamp = get_required_header(headers, "webhook-timestamp")
    webhook_id = get_required_header(headers, "webhook-id")

    try:
        ts = int(timestamp)
    except ValueError:
        raise InvalidWebhookSignatureError(
            "Invalid webhook timestamp format"
        ) from None

    now = int(time.time())
    if now - ts > tolerance:
        raise InvalidWebhookSignatureError("Webhook timestamp is too old")
    if ts > now + tolerance:
        raise InvalidWebhookSignatureError("Webhook timestamp is too new")

    # `v1,<base64>` (preferred) — accept legacy bare-base64 too.
    signatures: list[str] = []
    for part in signature_header.split():
        signatures.append(part[3:] if part.startswith("v1,") else part)

    body = payload.decode("utf-8") if isinstance(payload, bytes) else payload
    signed = f"{webhook_id}.{timestamp}.{body}"
    expected = base64.b64encode(
        hmac.new(
            _decode_secret(secret), signed.encode(), hashlib.sha256
        ).digest()
    ).decode()

    if not any(hmac.compare_digest(expected, s) for s in signatures):
        raise InvalidWebhookSignatureError(
            "The given webhook signature does not match the expected signature"
        )


def unwrap_event(
    payload: str | bytes,
    headers: Mapping[str, str] | Any,
    *,
    secret: str,
    event_type: Any,
    tolerance: int = 300,
) -> Any:
    """Verify + JSON-parse + validate the payload into `event_type`.

    `event_type` is either a single pydantic model or an `Annotated[Union[
    …], PropertyInfo(discriminator=…)]` discriminated union — both are
    validated through `pydantic.TypeAdapter` so the generated emitter
    doesn't need to discriminate manually.
    """
    import pydantic

    verify_signature(payload, headers, secret=secret, tolerance=tolerance)
    body = payload.decode("utf-8") if isinstance(payload, bytes) else payload
    data = json.loads(body)
    return pydantic.TypeAdapter(event_type).validate_python(data)
