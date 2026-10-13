"""desk_dispatch (FINISH-LIST rank 12): advisory job cards on the hive bus. Nothing is ever sent.

A card = {id, desk, ask, at, advisory: true, sent: false, lock}. `lock` quotes the desk's current
ACTIVE_TASKS row (JARVIS_ACTIVE_TASKS or ~/.grok-private/ACTIVE_TASKS.md) so the desk sees who owns what.
"""
from __future__ import annotations

import json
import os
import re
import time
import uuid
from pathlib import Path

DESKS = ("jev", "watchdog", "forge", "librarian", "consultant", "claude", "codex", "capex", "scout")
MAX_ASK = 600


def _active_tasks() -> Path:
    env = os.environ.get("JARVIS_ACTIVE_TASKS", "")
    return Path(env).expanduser() if env else Path.home() / ".grok-private" / "ACTIVE_TASKS.md"


def lock_row(desk: str) -> str:
    try:
        lines = _active_tasks().read_text(encoding="utf-8").splitlines()
    except OSError:
        return "no ACTIVE_TASKS row (file not readable)"
    pat = re.compile(rf"\b{re.escape(desk)}\b", re.I)
    for line in lines:
        if line.startswith("|") and pat.search(line) and not set(line) <= set("|- "):
            return line.strip()[:400]
    return f"no ACTIVE_TASKS row for {desk}"


def run(args: dict | None = None, hive: Path | None = None) -> dict:
    args = args or {}
    desk = str(args.get("desk") or "").strip().lower()
    ask = " ".join(str(args.get("ask") or "").split())[:MAX_ASK]
    if desk not in DESKS or not ask:
        return {"ok": False, "sent": False, "card": None,
                "spoken": "I need a desk name and the ask to write a job card. Nothing was sent."}
    card = {"id": uuid.uuid4().hex[:12], "desk": desk, "ask": ask,
            "at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "advisory": True, "sent": False,
            "lock": lock_row(desk)}
    base = Path(hive) if hive is not None else Path.home() / ".grok-private"
    d = base / ".hive" / "bus" / "desk_cards"
    d.mkdir(parents=True, exist_ok=True)
    tmp = d / f".{card['id']}.tmp"
    tmp.write_text(json.dumps(card, indent=1) + "\n", encoding="utf-8")
    os.replace(tmp, d / f"{card['id']}.json")
    return {"ok": True, "sent": False, "card": card,
            "spoken": f"I wrote an advisory job card for the {desk.capitalize()} desk. Nothing was sent; "
                      f"the desk picks it up from the hive bus. Lock: {card['lock'][:160]}"}


_ASK = re.compile(rf"\b(?:ask|dispatch\s+(?:this\s+)?to|hand\s+(?:this\s+)?to)\s+(?:the\s+)?({'|'.join(DESKS)})(?:\s+desk)?\b[\s,:]*(.*)$", re.I | re.S)


def args_from_utterance(u: str) -> dict:
    m = _ASK.search(u or "")
    if not m:
        return {}
    rest = re.sub(r"^(?:whether|if|to|about)\s+", "", m.group(2).strip(), flags=re.I)
    return {"desk": m.group(1).lower(), "ask": rest or (u or "").strip()}


def log_meta(got: dict) -> dict:
    c = (got or {}).get("card") or {}
    return {"ok": bool((got or {}).get("ok")), "desk": c.get("desk"), "sent": False}
