"""Shared type aliases — symbol-compatible with openai-python (DESIGN §5a)."""

from __future__ import annotations

from typing import IO, Any, Mapping, Optional, Tuple, Union

from ._sentinels import Omit, Omittable

# A header value may be explicitly removed with `omit`.
Headers = Mapping[str, Union[str, Omit]]
Query = Mapping[str, object]
Body = object

# A multipart file field — symbol-compatible with openai-python: raw bytes,
# a binary file object, or a (filename, content[, content_type]) tuple.
FileTypes = Union[
    IO[bytes],
    bytes,
    Tuple[Optional[str], Union[IO[bytes], bytes]],
    Tuple[Optional[str], Union[IO[bytes], bytes], Optional[str]],
]

__all__ = ["Headers", "Query", "Body", "FileTypes", "Omittable", "Any"]
