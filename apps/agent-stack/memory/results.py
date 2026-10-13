"""Z11 post-action memory writeback: every finished result lands in a structured long-term ledger.

~/.grok-private/jarvis-results.jsonl (JARVIS_RESULTS_LOG), one row per result from a producing hand:
{ts, hand, ask (<=120 chars), result (<=280 chars), ok, refs}. Capped at MAX_ROWS (oldest dropped).
Recall: "what did you do today" / "what results do you have" reads it back. Never stores keys: rows whose
text looks like a secret are skipped. Tests write to a temp file.
"""
from __future__ import annotations

import json
import os
import re
import sys
import tempfile
import threading
from datetime import datetime, timezone
from pathlib import Path

PRODUCERS = {"drafts", "workbench", "pickup", "web_search", "code_run", "loop", "desk_dispatch", "mcp_call",
             "multistep", "cost_card", "pointer", "plan", "skills"}
MAX_ROWS = 2000
SECRET_RE = re.compile(r"(?:api[_-]?key|bearer\s|sk-[A-Za-z0-9]{8,}|password|passwd|secret\s*[:=])", re.I)
WANT_RE = re.compile(r"\bwhat\s+(?:did|have)\s+you\s+(?:do|done|finish(?:ed)?|get\s+done)\b(?:\s+(?:today|so\s+far|this\s+morning))?|"
                     r"\b(?:your|recent)\s+results\b|\bwhat\s+results\b", re.I)
_LOCK = threading.Lock()


def path() -> Path:
    raw = (os.environ.get("JARVIS_RESULTS_LOG") or "").strip()
    if raw:
        return Path(raw).expanduser()
    if "_pytest" in sys.modules or "unittest" in sys.modules:
        return Path(tempfile.gettempdir()) / f"jarvis-results-test-{os.getpid()}.jsonl"
    return Path.home() / ".grok-private" / "jarvis-results.jsonl"


def wants_results(u: str) -> bool:
    return bool(WANT_RE.search(u or ""))


def write_back(hand: str, ask: str, got: dict) -> bool:
    if hand not in PRODUCERS or not isinstance(got, dict):
        return False
    spoken = " ".join(str(got.get("spoken") or "").split())
    if not spoken or SECRET_RE.search(spoken) or SECRET_RE.search(ask or ""):
        return False
    if re.search(r'say "confirm"', spoken, re.I):
        return False  # only an offer, not a result
    row = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "hand": hand,
           "ask": " ".join((ask or "").split())[:120], "result": spoken[:280], "ok": bool(got.get("ok")),
           "refs": [str(c)[:160] for c in (got.get("cites") or [])][:3]}
    dest = path()
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        with _LOCK:
            with dest.open("a", encoding="utf-8") as fh:
                fh.write(json.dumps(row, ensure_ascii=False) + "\n")
            if dest.stat().st_size > MAX_ROWS * 600:
                lines = dest.read_text(encoding="utf-8").splitlines()[-MAX_ROWS:]
                dest.write_text("\n".join(lines) + "\n", encoding="utf-8")
    except OSError:
        return False
    return True


def recent(limit: int = 6, *, today_only: bool = True) -> list[dict]:
    try:
        rows = [json.loads(l) for l in path().read_text(encoding="utf-8").splitlines() if l.startswith("{")]
    except (OSError, ValueError):
        return []
    if today_only:
        day = datetime.now().astimezone().date()
        rows = [r for r in rows if datetime.fromisoformat(r["ts"]).astimezone().date() == day]
    return rows[-limit:]


def spoken_recent(limit: int = 6) -> str:
    rows = recent(limit)
    if not rows:
        return "I have no finished results logged today."
    bits = [f"{r['hand']}: {r['result'][:110]}" for r in rows]
    return f"My last {len(rows)} results today: " + " | ".join(bits)
