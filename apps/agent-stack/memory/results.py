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
    note_for(row)
    return True


VAULT_INBOX = Path.home() / "Documents" / "My_Billion_Dollar_Vault" / "00_Outer_Heaven" / "JARVIS-INBOX"
TITLE = {"code_run": "Code run", "web_search": "Research", "drafts": "Draft", "workbench": "Build", "mcp_call": "Tool run",
         "pickup": "Picked up", "multistep": "Task", "skills": "Skill run", "craft": "Made", "desk_dispatch": "Desk handoff"}


def card_title(row: dict) -> str:
    return f"{TITLE.get(row['hand'], row['hand'].replace('_', ' ').title())} \u2014 {row['ask'][:60]}"


def note_for(row: dict) -> str:
    """Demo whIp1SOahOM 20:04: each finished result also lands in the second brain as its own note."""
    if os.environ.get("PYTEST_CURRENT_TEST") or os.environ.get("JARVIS_RESULTS_LOG") or not VAULT_INBOX.parent.is_dir():
        return ""
    try:
        VAULT_INBOX.mkdir(exist_ok=True)
        slug = re.sub(r"[^\w -]+", "", row["ask"])[:48].strip() or row["hand"]
        dest = VAULT_INBOX / f"{row['ts'][:10]} {row['ts'][11:16].replace(':', '')} {row['hand']} - {slug}.md"
        refs = "".join(f"\n- {r}" for r in row.get("refs") or [])
        dest.write_text(f"---\ntype: jarvis-result\nhand: {row['hand']}\nts: {row['ts']}\ntags: [jarvis-inbox]\n---\n"
                        f"# {card_title(row)}\n\n**Asked:** {row['ask']}\n\n{row['result']}\n" + (f"\n**Refs:**{refs}\n" if refs else ""),
                        encoding="utf-8")
        return str(dest)
    except OSError:
        return ""


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
