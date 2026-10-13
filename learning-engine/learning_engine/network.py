"""No network by default.

A live HTTP call needs the explicit CLI/API opt-in flag AND the matching API
key. Environment variables never authorize a call by themselves.
`LEARNING_ENGINE_OPT_IN_LIVE` is not a bypass. Providers do not flip a
network-allow env var.
"""

from __future__ import annotations

import os
from typing import Any
from urllib.request import Request

from learning_engine.errors import NetworkDisabled, ProviderRefused


def require_live_call(*, flag: bool, env_var: str) -> str:
    """Refuse unless the explicit opt-in flag AND the named key env var are set.

    `flag` is the constructor / `--opt-in-live` argument. An env var cannot
    stand in for it. Returns the key. Callers must not print, log, or persist it.
    """
    if not flag:
        raise ProviderRefused(
            "live provider refused: pass --opt-in-live (and do not use this in tests/CI)"
        )
    key = os.environ.get(env_var, "").strip()
    if not key:
        raise ProviderRefused(f"live provider refused: {env_var} is not set")
    return key


def guarded_urlopen(request: Request, timeout: float = 30.0, *, authorized: bool = False) -> Any:
    """urllib wrapper. `authorized=True` only after require_live_call succeeded."""
    if not authorized:
        raise NetworkDisabled(
            "network disabled: live call requires --opt-in-live and the API key"
        )
    import urllib.request

    return urllib.request.urlopen(request, timeout=timeout)
