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
                     r"\b(?:your|recent)\s+results\b|\bwhat\s+results\b|"
                     r"\bwhat\s+(?:did|have)\s+we\s+(?:work(?:ed)?\s+on|do|done|get\s+done|cover(?:ed)?)\b|"
                     r"\b(?:recap|summary|summari[sz]e)\s+(?:of\s+)?(?:today|my\s+day|the\s+day)\b|"
                     r"\bwhat\s+did\s+(?:the|that|your)\s+last\s+(?:search|run|job|task|step)\s+(?:find|return|get|say)\b|"
                     r"\bshow\s+(?:me\s+)?the\s+results\s+from\s+(?:earlier|before|today|this\s+morning)\b|"
                     r"\bwhat\s+did\s+you\s+just\s+(?:do|run|finish)\b|\bshow\s+(?:me\s+)?(?:the\s+)?last\s+(?:tool\s+)?(?:receipt|result)s?\b", re.I)
DID = {"drafts": "draft", "web_search": "web search", "code_run": "code run", "loop": "loop job", "vault_read": "note pull-up",
       "cost_card": "meter check", "approval": "approval record", "pointer": "pointer", "workspace_read": "file read",
       "memory": "memory save or recall", "multistep": "multi-step job", "plan": "plan", "browser_mission": "browser mission",
       "desk_dispatch": "desk job card", "prebrief": "meeting prep", "mcp_call": "MCP call", "skills": "skill read",
       "pickup": "pickup", "results_recall": "recap"}
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


def _secret_patterns():
    """The shared detector (brain/secret_patterns.py), loaded by path like every other module here."""
    import importlib.util as _u
    import sys as _sys
    from pathlib import Path as _P
    name = "agent_stack_secret_patterns"
    if name not in _sys.modules:
        spec = _u.spec_from_file_location(name, _P(__file__).resolve().parents[1] / "brain" / "secret_patterns.py")
        mod = _u.module_from_spec(spec); spec.loader.exec_module(mod); _sys.modules[name] = mod  # publish only when built
    return _sys.modules[name]


def write_back(hand: str, ask: str, got: dict) -> bool:
    if hand not in PRODUCERS or not isinstance(got, dict) or got.get("read_only_summary"):
        return False
    spoken = " ".join(str(got.get("spoken") or "").split())
    sp = _secret_patterns()
    if not spoken or SECRET_RE.search(spoken) or SECRET_RE.search(ask or "") or sp.has_secret(spoken) or sp.has_secret(ask or ""):
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


ICON = {"web_search": "\U0001F50E", "mcp_call": "\U0001F527", "drafts": "\U0001F4C4", "code_run": "\U0001F4BB", "workbench": "\U0001F4BB",
        "cost_card": "\U0001F4B0", "pointer": "\U0001F449", "pickup": "\U0001F4CB", "multistep": "\u2705", "loop": "\u23F0"}
_ID = re.compile(r"\b[A-Z]{2,6}-\d{2,4}(?:-\d{1,4})?\b")
_MONEY = re.compile(r"(?:\$|CA\$|US\$)\s?\d[\d,]*(?:\.\d+)?|\b\d+(?:\.\d+)?\s?(?:cents|%)")
_URL = re.compile(r"https?://[^\s)\]>\"']+")


def card_fields(row: dict) -> list[str]:
    """Demo whIp 20:09 card: 'Quote — X · $2,500 · Drive: link · Doc: link'. Pull the same kinds of fields out of the result."""
    text = row.get("result", "")
    out: list[str] = []
    for rx in (_ID, _MONEY):
        for m in rx.findall(text):
            if m not in out:
                out.append(m)
    for u in _URL.findall(text) + [r for r in row.get("refs") or [] if str(r).startswith(("http", "/"))]:
        tag = "Doc" if "docs.google" in u else "Drive" if "drive.google" in u else ("File" if u.startswith("/") else u.split("/")[2])
        item = f"{tag}: {u}"
        if item not in out:
            out.append(item)
    return out[:6]


def card_title(row: dict) -> str:
    return f"{ICON.get(row['hand'], '\u2022')} {TITLE.get(row['hand'], row['hand'].replace('_', ' ').title())} \u2014 {row['ask'][:60]}"


def note_for(row: dict) -> str:
    """Demo whIp1SOahOM 20:04: each finished result also lands in the second brain as its own note."""
    if os.environ.get("PYTEST_CURRENT_TEST") or os.environ.get("JARVIS_RESULTS_LOG") or not VAULT_INBOX.parent.is_dir():
        return ""
    try:
        VAULT_INBOX.mkdir(exist_ok=True)
        slug = re.sub(r"[^\w -]+", "", row["ask"])[:48].strip() or row["hand"]
        local = datetime.fromisoformat(row["ts"]).astimezone()
        dest = VAULT_INBOX / f"{local:%Y-%m-%d %H%M} {row['hand']} - {slug}.md"
        refs = "".join(f"\n- {r}" for r in row.get("refs") or [])
        dest.write_text(f"---\ntype: jarvis-result\nhand: {row['hand']}\nts: {row['ts']}\ntags: [jarvis-inbox]\n---\n"
                        f"# {card_title(row)}\n\n**Asked:** {row['ask']}\n\n" + "".join(f"- {f}\n" for f in card_fields(row))
                        + f"\n{row['result']}\n" + (f"\n**Refs:**{refs}\n" if refs else ""),
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


def _times(n: int) -> str:
    return {1: "once", 2: "twice"}.get(n, f"{n} times")


def spoken_today(rows: list[dict] | None = None, top: int = 4) -> str:
    """Z58 (whIp 11:08): 'what did we work on today?' -> a short recap of today's finished work, newest first."""
    rows = rows if rows is not None else recent(MAX_ROWS)
    rows = [r for r in rows if r.get("ok", True)]
    if not rows:
        return "Nothing finished is logged today yet, sir."
    groups: dict[str, list[dict]] = {}
    for r in reversed(rows):
        groups.setdefault(str(r.get("hand") or "other"), []).append(r)
    bits = []
    for hand, rs in list(groups.items())[:top]:
        asks = list(dict.fromkeys(re.sub(r"^(?:hey\s+)?jarvis[,.]?\s*", "", str(r.get("ask") or ""), flags=re.I).strip().rstrip(".?!") for r in rs))
        n = len(asks)
        noun = DID.get(hand, hand.replace("_", " "))
        noun = noun if n == 1 else (noun[:-1] + "ies" if noun.endswith("y") and not noun.endswith("ey") else noun + ("es" if noun.endswith(("sh", "ch")) else "s"))
        bits.append(f"{n} {noun}" + (f", latest \"{asks[0][:60]}\"" if asks and asks[0] else ""))
    more = len(groups) - len(bits)
    first = str(rows[0].get("ts") or "")[11:16]
    return (f"Today, sir, we finished {len({str(r.get('ask')) for r in rows})} distinct jobs. Most recent first: " + "; ".join(bits) + (f"; and {more} other kinds" if more > 0 else "")
            + ". The full list is in your JARVIS INBOX.")


def spoken_recent(limit: int = 6) -> str:
    rows = recent(limit)
    if not rows:
        return "I have no finished results logged today."
    bits = [f"{r['hand']}: {r['result'][:110]}" for r in rows]
    return f"My last {len(rows)} results today: " + " | ".join(bits)
