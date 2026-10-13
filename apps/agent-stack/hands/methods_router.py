"""Turn-path adapter for the methods_* cores. Independently testable; turn.py only calls wants()/run()."""
from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import methods_config as mc  # noqa: E402


def wants(text):
    """Z99: a pasted secret is intercepted before any model or log sees more of it."""
    return mc.find_secret(text or "") is not None


def run(text, *, env_file=None):
    env_file = Path(env_file or os.environ.get("JARVIS_ENV_LOCAL") or Path.home() / ".jarvis" / ".env.local")
    got = mc.route_secret(text, env_file)
    return {"ok": got["ok"], "tool": "methods_router", "spoken": got["spoken"], "sent": False,
            "task_verified": False, "cites": [], "wires": ["secret_to_env_local"]}
