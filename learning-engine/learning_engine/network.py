"""No network by default. Live HTTP is a gated helper, never an import side effect."""

from __future__ import annotations

import os
from typing import Any
from urllib.request import Request

from learning_engine.errors import NetworkDisabled, ProviderRefused

ALLOW_NETWORK_ENV = "LEARNING_ENGINE_ALLOW_NETWORK"
OPT_IN_ENV = "LEARNING_ENGINE_OPT_IN_LIVE"


def network_allowed() -> bool:
    return os.environ.get(ALLOW_NETWORK_ENV, "").strip() in {"1", "true", "yes"}


def opt_in_live() -> bool:
    return os.environ.get(OPT_IN_ENV, "").strip() in {"1", "true", "yes"}


def require_live_call(*, flag: bool, env_var: str) -> str:
    """Refuse unless the CLI/API opt-in flag AND the named env var are set.

    Returns the key. Callers must not print, log, or persist it.
    """
    if not flag and not opt_in_live():
        raise ProviderRefused(
            "live provider refused: pass --opt-in-live (and do not use this in tests/CI)"
        )
    key = os.environ.get(env_var, "").strip()
    if not key:
        raise ProviderRefused(f"live provider refused: {env_var} is not set")
    if not network_allowed() and not flag and not opt_in_live():
        raise NetworkDisabled("network is disabled unless LEARNING_ENGINE_ALLOW_NETWORK=1")
    # flag + key is enough for a live provider; the allow-network env is set by the CLI.
    return key


def guarded_urlopen(request: Request, timeout: float = 30.0) -> Any:
    """urllib wrapper. Raises if the process did not opt into network."""
    if not network_allowed():
        raise NetworkDisabled(
            "network disabled: set LEARNING_ENGINE_ALLOW_NETWORK=1 and --opt-in-live"
        )
    import urllib.request

    return urllib.request.urlopen(request, timeout=timeout)
