"""Typed failures for the validator and live-call guards."""

from __future__ import annotations


class PacketValidationError(ValueError):
    def __init__(self, message: str, path: str = "") -> None:
        self.path = path
        super().__init__(f"{path}: {message}" if path else message)


class NetworkDisabled(RuntimeError):
    """Default path: no sockets. Live providers must opt in explicitly."""


class ProviderRefused(RuntimeError):
    """Live provider missing opt-in flag and/or API key."""


class IndexSchemaError(RuntimeError):
    """SQLite index schema is older or unknown. Never drop tables silently."""

    def __init__(
        self,
        message: str,
        *,
        path: str | None = None,
        line: int | None = None,
        cleanup_warning: str | None = None,
    ) -> None:
        super().__init__(message)
        self.path = path
        self.line = line
        self.cleanup_warning = cleanup_warning


class LockedError(IndexSchemaError):
    """Another process holds the index lock. Do not touch the database."""

    def __init__(self, path: str | None = None) -> None:
        super().__init__("locked", path=path)


class JsonlError(ValueError):
    """JSONL read/parse failure with a path and optional line number."""

    def __init__(self, message: str, *, path: str, line: int | None = None) -> None:
        super().__init__(message)
        self.path = path
        self.line = line
        self.cleanup_warning: str | None = None
