"""Turn-path adapter for the methods_* cores. Independently testable; turn.py only calls wants()/run().

Z99 (pasted secret) is checked first. Every other ask must match one anchored phrase in
methods_router_cfg / methods_router_vault (whole utterance), so ordinary conversation is never hijacked."""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import methods_config as mc  # noqa: E402
import methods_router_cfg as _cfg  # noqa: E402
import methods_router_vault as _vault  # noqa: E402

HANDLERS = _cfg.HANDLERS + _vault.HANDLERS


def _match(text):
    text = (text or "").strip()
    for mid, pattern, fn in HANDLERS:
        m = pattern.fullmatch(text)
        if m:
            return mid, fn, m.groupdict()
    return None


def wants(text):
    return mc.find_secret(text or "") is not None or _match(text) is not None


def _result(ok, spoken, wires, secret=False):
    return {"ok": ok, "tool": "methods_router", "spoken": spoken, "sent": False, "task_verified": False,
            "cites": [], "wires": wires, "secret": secret}


def run(text, *, env_file=None):
    if mc.find_secret(text or "") is not None:
        env_file = Path(env_file or os.environ.get("JARVIS_ENV_LOCAL") or Path.home() / ".jarvis" / ".env.local")
        got = mc.route_secret(text, env_file)
        return _result(got["ok"], got["spoken"], ["secret_to_env_local"], secret=True)
    mid, fn, groups = _match(text)
    try:
        return _result(True, fn(groups), [f"methods_{mid.lower()}"])
    except (ValueError, PermissionError, OSError, KeyError) as e:
        return _result(False, f"{str(e).rstrip('.')}. Nothing was changed.", [f"methods_{mid.lower()}"])
