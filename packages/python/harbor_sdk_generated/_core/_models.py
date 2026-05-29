"""Pydantic v2 base for generated response models (DESIGN §5).

`_request_id` exposes the `x-request-id` of the originating response
(RESEARCH §4 #5). Generated models subclass this; field aliasing lets the
wire name (`currentTime`) differ from the idiomatic Python name
(`current_time`) the emitter chooses.
"""

from __future__ import annotations

from typing import Any, Optional

import pydantic

__all__ = ["BaseModel", "to_jsonable", "extract_files"]


def extract_files(
    body: dict, paths: list[list[str]],
) -> list[tuple[str, Any]]:
    """Walk `body` at each `path`, lift out file-like values, return them
    as a list of `(wire_name, value)` tuples — and **mutate** `body` to
    remove them. Oracle: openai-python's `_utils.extract_files`. The
    runtime then sends multipart with `files=<list>` and `data=<body>`.

    Each path is a sequence of dict keys / `<array>` sentinels. A
    `<array>` segment means "iterate over the list at this position" —
    used for `files: List[FileTypes]` shapes (List of file uploads).

    A file-like value is anything our multipart `_is_file` recognizes:
    `bytes`, `bytearray`, `IO[bytes]`-likes, or `(filename, data[,
    content_type])` tuples.
    """
    out: list[tuple[str, Any]] = []
    for path in paths:
        _extract_at(body, list(path), [], out)
    return out


def _is_file(v: Any) -> bool:
    return (
        isinstance(v, (bytes, bytearray, tuple))
        or hasattr(v, "read")
    )


def _extract_at(
    cur: Any, remaining: list, name_parts: list[str],
    out: list[tuple[str, Any]],
) -> None:
    """Recursive descent. `cur` is the current node; `remaining` is the
    rest of the path; `name_parts` is the wire-name accumulator
    (for `<array>` segments, we emit `<name>[]`).
    """
    if not remaining:
        # Reached a leaf — extract if file-like.
        if _is_file(cur):
            out.append(("".join(name_parts), cur))
        return
    seg = remaining[0]
    rest = remaining[1:]
    if seg == "<array>":
        if isinstance(cur, list):
            # Walk each list element. Wire name uses `[]` per
            # multipart convention.
            for item in cur:
                _extract_at(item, rest, name_parts + ["[]"], out)
            # Also support the case where the user passed a single
            # file to a List[FileTypes] field (a real ergonomic
            # mistake we forgive).
            if _is_file(cur):
                out.append(("".join(name_parts) + "[]", cur))
        elif _is_file(cur):
            # Single-file shorthand for an array slot.
            out.append(("".join(name_parts) + "[]", cur))
        return
    # Object segment — descend into the dict and pop the file out of it
    # when found.
    if not isinstance(cur, dict) or seg not in cur:
        return
    next_name = name_parts + [seg] if not name_parts else name_parts + [f"[{seg}]"]
    val = cur[seg]
    if not rest and _is_file(val):
        # Pop the file-like value out of the parent dict so it doesn't
        # also appear in the JSON-encoded data part.
        out.append(("".join(next_name), val))
        del cur[seg]
        return
    if rest and rest[0] == "<array>" and isinstance(val, list):
        # Special case for `files: [...]` — extract every list element
        # and clear the parent's slot so it doesn't ALSO get encoded.
        for item in val:
            _extract_at(item, rest[1:], next_name + ["[]"], out)
        if any(_is_file(item) for item in val):
            del cur[seg]
        return
    _extract_at(val, rest, next_name, out)


def to_jsonable(obj: Any) -> Any:
    """Recursively turn request inputs (models / lists / dicts) into JSON.

    Accepts pydantic models *or* plain dicts (the Stainless-style typed-dict
    input), so generated method kwargs serialize correctly either way.
    """
    if isinstance(obj, pydantic.BaseModel):
        return obj.model_dump(by_alias=True, exclude_none=True)
    if isinstance(obj, dict):
        return {k: to_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [to_jsonable(v) for v in obj]
    return obj


class BaseModel(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(
        populate_by_name=True,   # accept both wire alias and python name
        extra="allow",           # forward-compatible: unknown fields don't break
    )

    # Set by the client after construction; not a wire field.
    _request_id: Optional[str] = pydantic.PrivateAttr(default=None)

    # --- Stainless drop-in helpers ----------------------------------------
    # `.to_dict()` / `.to_json()` are the symbols Stainless customers reach
    # for; we route them to pydantic v2's `model_dump` / `model_dump_json`
    # with `by_alias=True` (Stainless's default: emit the wire name). Users
    # who want python-name keys can still call `model_dump()` directly.

    def to_dict(self, **kwargs: object) -> dict:
        """Serialize to a dict with wire field names. Drop-in alias for
        `pydantic.BaseModel.model_dump(by_alias=True, exclude_unset=True)`
        — matches the Stainless surface; extra kwargs flow to pydantic."""
        kwargs.setdefault("by_alias", True)
        kwargs.setdefault("exclude_unset", True)
        return self.model_dump(**kwargs)              # type: ignore[arg-type]

    def to_json(self, **kwargs: object) -> str:
        """Serialize to a JSON string with wire field names. Drop-in alias
        for `pydantic.BaseModel.model_dump_json(by_alias=True,
        exclude_unset=True)`."""
        kwargs.setdefault("by_alias", True)
        kwargs.setdefault("exclude_unset", True)
        return self.model_dump_json(**kwargs)         # type: ignore[arg-type]
