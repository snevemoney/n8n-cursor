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

# The 17 Grok desks (DESK_ROLES.md: 16 carded + Disk Saver). Big Boss coordinates above them, not an 18th desk.
GROK_DESKS = ("consultant", "money-desk", "forge", "personal-cfo", "researcher", "wealth-manager", "librarian",
              "hitl-operator", "disk-saver", "lead-hunter", "communications-manager", "watchdog", "creative-studio",
              "day-planner", "publishing-engine", "product-gtm", "career-strategist")
COORDINATOR = ("big-boss",)
PLATFORMS = ("jev", "claude", "codex", "capex", "scout")
DESKS = GROK_DESKS + COORDINATOR + PLATFORMS
MAX_ASK = 600


def _spoken_name(slug: str) -> str:
    return slug.replace("-", " ")


# Spoken form → slug. "money desk", "HITL operator", "comms manager" all resolve to one slug.
_ALIASES = {_spoken_name(s): s for s in DESKS}
# Full names and unambiguous acronyms only: "ask the boss" / "ask the planner" are ordinary English.
_ALIASES.update({"comms manager": "communications-manager", "cfo": "personal-cfo", "gtm": "product-gtm",
                 "hitl": "hitl-operator", "claude code": "claude"})


def canonical(name: str) -> str:
    key = " ".join(re.sub(r"[-_]", " ", str(name or "")).lower().split())
    key = re.sub(r"\s+desk$", "", key) if key not in _ALIASES else key
    return _ALIASES.get(key, "")


def _active_tasks() -> Path:
    env = os.environ.get("JARVIS_ACTIVE_TASKS", "")
    return Path(env).expanduser() if env else Path.home() / ".grok-private" / "ACTIVE_TASKS.md"


def _fleet_status() -> Path:
    env = os.environ.get("JARVIS_FLEET_STATUS", "")
    return Path(env).expanduser() if env else Path.home() / ".grok-shared" / "FLEET_STATUS.md"


def desk_state(slug: str) -> str:
    """RUNNING / STOPPED / ... from FLEET_STATUS.md, or UNKNOWN. Read-only; never fails the card."""
    if slug not in GROK_DESKS:
        return "PLATFORM" if slug in PLATFORMS else "COORDINATOR"
    try:
        lines = _fleet_status().read_text(encoding="utf-8").splitlines()
    except OSError:
        return "UNKNOWN"
    want = _spoken_name(slug)
    for line in lines:
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) >= 2 and cells[0].lower() == want:
            return cells[1] or "UNKNOWN"
    return "UNKNOWN"


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
    desk = canonical(args.get("desk") or "")
    ask = " ".join(str(args.get("ask") or "").split())[:MAX_ASK]
    if desk not in DESKS or not ask:
        return {"ok": False, "sent": False, "card": None,
                "spoken": "I need one of the 17 desk names (or Big Boss) and the ask to write a job card. "
                          "Nothing was sent."}
    state = desk_state(desk)
    card = {"id": uuid.uuid4().hex[:12], "desk": desk, "ask": ask,
            "at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "advisory": True, "sent": False,
            "desk_state": state, "lock": lock_row(_spoken_name(desk))}
    base = Path(hive) if hive is not None else Path.home() / ".grok-private"
    d = (base / "bus" / "desk_cards") if hive is not None else (base / ".hive" / "bus" / "desk_cards")
    d.mkdir(parents=True, exist_ok=True)
    tmp = d / f".{card['id']}.tmp"
    tmp.write_text(json.dumps(card, indent=1) + "\n", encoding="utf-8")
    os.replace(tmp, d / f"{card['id']}.json")
    name = _spoken_name(desk).title()
    waiting = ""
    if state.upper().startswith(("STOPPED", "HOLD")):
        waiting = f" The {name} desk is stopped right now, so the card waits on the bus until it runs again."
    elif state == "UNKNOWN":
        waiting = f" I couldn't confirm whether the {name} desk is running."
    return {"ok": True, "sent": False, "card": card,
            # Honesty audit 2026-10-16: nothing in this repo reads desk cards, so never claim a desk will pick it up.
            "spoken": f"I wrote an advisory job card for the {name} desk. Nothing was sent, and no desk "
                      f"reads these cards automatically yet; it waits on the hive bus until one does.{waiting} Lock: {card['lock'][:160]}"}


# Longest names first so "money desk" wins over "money", "claude code" over "claude".
_NAMES = sorted(_ALIASES, key=len, reverse=True)
_ASK = re.compile(r"\b(?:ask|dispatch\s+(?:this\s+)?to|hand\s+(?:this\s+)?(?:off\s+)?to)\s+(?:the\s+)?("
                  + "|".join(re.escape(n).replace(r"\ ", r"[\s-]+") for n in _NAMES)
                  + r")(?:\s+desk)?\b[\s,:]*(.*)$", re.I | re.S)


def args_from_utterance(u: str) -> dict:
    m = _ASK.search(u or "")
    if not m:
        return {}
    rest = re.sub(r"^(?:whether|if|to|about)\s+", "", m.group(2).strip(), flags=re.I)
    return {"desk": canonical(m.group(1)), "ask": rest or (u or "").strip()}


def log_meta(got: dict) -> dict:
    c = (got or {}).get("card") or {}
    return {"ok": bool((got or {}).get("ok")), "desk": c.get("desk"), "sent": False}
