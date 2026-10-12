"""Refuse OpenClaw mutate/start when the expected home is gone.

Audit 2026-09-12: /root/.openclaw is missing. Live JSON is
/opt/philanthropy/openclaw/openclaw.json. Do not write a second home.
Do not start the gateway unless Evens sets OPENCLAW_ALLOW_START=1.
Do not mutate unless Evens sets OPENCLAW_ALLOW_MUTATE=1.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

GHOST_HOME = Path("/root/.openclaw")
LIVE_JSON = Path("/opt/philanthropy/openclaw/openclaw.json")
AUDIT = "docs/hive/outer-heaven/CONTENT/os/jarvis/OPENCLAW-RESURRECTION-AUDIT.md"


def refuse_mutate(action: str = "mutate OpenClaw") -> None:
    if os.environ.get("OPENCLAW_ALLOW_MUTATE") == "1":
        return
    print(f"REFUSE: {action}.")
    print(f"Ghost home {GHOST_HOME} is missing on OuterHeaven (2026-09-12 audit).")
    print(f"Live config (not Jarvis memory): {LIVE_JSON}")
    print(f"See {AUDIT}. Set OPENCLAW_ALLOW_MUTATE=1 only after Evens reviews.")
    raise SystemExit(2)


def refuse_start(action: str = "start OpenClaw gateway") -> None:
    if os.environ.get("OPENCLAW_ALLOW_START") == "1":
        return
    print(f"REFUSE: {action}.")
    print("Gateway stays down until Evens reviews the audit and binds loopback.")
    print(f"See {AUDIT}. Set OPENCLAW_ALLOW_START=1 only after that.")
    raise SystemExit(2)
