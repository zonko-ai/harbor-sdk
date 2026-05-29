"""Omission/removal sentinels — symbol-compatible with openai-python (DESIGN §5a).

`not_given`  : argument was not passed at all (distinct from an explicit `None`).
`omit`       : explicitly remove a header/query value from the request.

Both are falsy so `if value:` treats them as "absent". `NOT_GIVEN` is the
back-compat alias; emit both.
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Literal, TypeVar, Union

_T = TypeVar("_T")


class NotGiven:
    """A sentinel for "no argument supplied". Use `param: T | NotGiven = not_given`."""

    def __bool__(self) -> Literal[False]:
        return False

    def __repr__(self) -> str:
        return "NOT_GIVEN"


not_given = NotGiven()
NOT_GIVEN = not_given  # back-compat alias


class Omit:
    """Explicitly drop a default header/query param: `headers={"X": omit}`."""

    def __bool__(self) -> Literal[False]:
        return False

    def __repr__(self) -> str:
        return "omit"


omit = Omit()

if TYPE_CHECKING:
    Omittable = Union[_T, Omit]
else:
    Omittable = Union

__all__ = ["NotGiven", "not_given", "NOT_GIVEN", "Omit", "omit", "Omittable"]
