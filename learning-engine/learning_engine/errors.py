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
