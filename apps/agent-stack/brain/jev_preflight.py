#!/usr/bin/env python3
"""Jev SHADOW preflight for Jarvis. Off unless JARVIS_JEV_PREFLIGHT=1.

Records what the shared judgment boundary (scripts/hive/eng/judgment.py
`evaluate`) would say about a turn: lane, action, hard-step flag. It writes
one line to the hive bus and returns. It never changes the spoken reply,
never picks the tool, never approves a hard step, and never opens a socket
(judgment.py keeps the OpenRouter call behind HIVE_OPENROUTER_CALL, which we
do not set). Jev is a preflight, not Jarvis's brain.
"""
from __future__ import annotations

import importlib.util
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
JUDGMENT_PATH = ROOT / "scripts" / "hive" / "eng" / "judgment.py"
FLAG = "JARVIS_JEV_PREFLIGHT"
MODE = "SHADOW"
PACK = "route.select"
ROLE = "big_boss"
LOG_NAME = "jev-preflight.jsonl"
_JUDGMENT = None


def enabled() -> bool:
    return os.environ.get(FLAG, "") == "1"


def _judgment():
    global _JUDGMENT
    if _JUDGMENT is None:
        spec = importlib.util.spec_from_file_location("hive_eng_judgment", JUDGMENT_PATH)
        if spec is None or spec.loader is None:
            return None
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        _JUDGMENT = mod
    return _JUDGMENT


def build_request(utterance: str, *, tool: str, hard_step: bool) -> dict[str, Any]:
    """Bounded route request. Hard steps go to the human lane, never to Jev."""
    req: dict[str, Any] = {
        "role": ROLE,
        "verb": "route",
        "pack": PACK,
        "evidence": [{"kind": "turn", "tool": tool, "chars": len(utterance or "")}],
    }
    if hard_step:
        req["authority_required"] = True
    return req


def advise(utterance: str, *, tool: str, hard_step: bool) -> dict[str, Any]:
    """Return an advisory record. Never raises."""
    base = {"mode": MODE, "pack": PACK, "tool": tool, "hard_step": bool(hard_step), "authoritative": False}
    try:
        mod = _judgment()
        if mod is None:
            return {**base, "lane": "unavailable", "action": "NO_ACTION", "reason": "judgment.py not loadable"}
        decision = mod.evaluate(build_request(utterance, tool=tool, hard_step=hard_step))
    except Exception as exc:  # advisory only: a broken preflight must not break a turn
        return {**base, "lane": "error", "action": "NO_ACTION", "reason": type(exc).__name__}
    return {
        **base,
        "lane": decision.get("lane"),
        "action": decision.get("action"),
        "reason": decision.get("reason"),
        "jev_allowed": bool(decision.get("jev_allowed")),
    }


def record(hive: Path, utterance: str, *, tool: str, hard_step: bool) -> dict[str, Any] | None:
    """When enabled, append one advisory line to hive/bus/jev-preflight.jsonl."""
    if not enabled():
        return None
    row = advise(utterance, tool=tool, hard_step=hard_step)
    row["timestamp"] = datetime.now(timezone.utc).isoformat()
    try:
        path = Path(hive) / "bus" / LOG_NAME
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(row, ensure_ascii=True) + "\n")
    except OSError:
        pass
    return row
