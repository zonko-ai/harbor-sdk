"""Resource bases — `SyncAPIResource` / `AsyncAPIResource` (DESIGN §5a).

A resource holds the client and forwards the HTTP verbs. Generated resource
classes (e.g. `Agency`) subclass these; nested resources compose, giving the
`client.agency.retrieve(...)` domain-shaped surface (RESEARCH §4 #9).
"""

from __future__ import annotations

from ._base_client import AsyncAPIClient, SyncAPIClient

__all__ = ["SyncAPIResource", "AsyncAPIResource"]


class SyncAPIResource:
    def __init__(self, client: SyncAPIClient) -> None:
        self._client = client
        self._get = client._get
        self._post = client._post
        self._put = client._put
        self._patch = client._patch
        self._delete = client._delete
        self._get_api_list = client._get_api_list


class AsyncAPIResource:
    def __init__(self, client: AsyncAPIClient) -> None:
        self._client = client
        self._get = client._get
        self._post = client._post
        self._put = client._put
        self._patch = client._patch
        self._delete = client._delete
        self._get_api_list = client._get_api_list
