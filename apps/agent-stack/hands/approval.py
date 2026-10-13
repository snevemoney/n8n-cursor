"""Z60 approval read-back (zdnijkAbknA 3:31-3:42, 4:26): a spoken conditional approval becomes
(1) a read-back that restates condition + action + confirm channel, and (2) a written approval record
(JARVIS-INBOX note + inbox card). Deterministic, no model. Nothing is booked or sent here: the record is
'approved, pending' and any booking/send still goes through the normal confirm gate."""
from __future__ import annotations

import re
import time
from pathlib import Path

APPROVE_RE = re.compile(r"\b(go ahead|book it|you can book|approved?|green light)\b", re.I)
COND_RE = re.compile(r"\bif (?:i|you) (?:don'?t|do not) have any conflicts?|\bif (?:there'?s|there is) no conflict|"
                     r"\bif my (?:calendar|schedule) is (?:clear|free)|\bif i'?m free\b", re.I)
CHANNELS = (("telegram", "Telegram"), ("text", "text"), ("email", "email"), ("slack", "Slack"), ("whatsapp", "WhatsApp"))
WHEN_RE = re.compile(r"\b(?:on\s+)?((?:mon|tues|wednes|thurs|fri|satur|sun)day|tomorrow|today)(?:\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?))?", re.I)
WHAT_RE = re.compile(r"\bbook\s+(?:the\s+|a\s+)?((?!it\b)[\w' -]{3,40}?)(?=\s+(?:for|on|at|if|and|tomorrow|today|(?:mon|tues|wednes|thurs|fri|satur|sun)day)\b|[,.]|$)", re.I)


def wants(u: str) -> bool:
    return bool(APPROVE_RE.search(u or "") and COND_RE.search(u or ""))


def parse(u: str) -> dict:
    low = (u or "").lower()
    w = WHEN_RE.search(u or "")
    what = WHAT_RE.search(u or "")
    return {
        "approved": True,
        "condition": "calendar_clear" if COND_RE.search(u or "") else None,
        "what": (what.group(1).strip() if what else "it"),
        "when": (f"{w.group(1).capitalize()}" + (f" at {w.group(2)}" if w and w.group(2) else "")) if w else "",
        "calendar": "calendar" in low or "book" in low,
        "confirm_via": next((n for k, n in CHANNELS if re.search(rf"\b{k}\b", low)), ""),
    }


def readback(r: dict) -> str:
    what = r["what"] if r["what"] != "it" else "it"
    line = "I'll check your schedule and if there's no conflict, book " + what + (f" for {r['when']}" if r["when"] else "")
    if r["calendar"]:
        line += ", put it on your calendar"
    if r["confirm_via"]:
        line += f" and confirm it to you via {r['confirm_via']}"
    return (line + ". Did I get that right, sir? I've written the approval down; nothing is booked until the calendar "
            "check passes, and the booking itself still goes through your confirm.")


def record(r: dict, utterance: str, inbox: Path | None) -> Path | None:
    if inbox is None:
        return None
    inbox.mkdir(parents=True, exist_ok=True)
    f = inbox / f"{time.strftime('%Y-%m-%d %H%M')} approval granted.md"
    f.write_text("\n".join([
        "# Approval granted (pending check)", "",
        f"- Who: Evens (spoken, {time.strftime('%H:%M')})",
        f"- What: book {r['what']}" + (f" {r['when']}" if r["when"] else ""),
        f"- Condition: {'no conflict on your calendar' if r['condition'] else 'none'}",
        f"- Follow-up: {('confirm via ' + r['confirm_via']) if r['confirm_via'] else 'none'}",
        "- Status: recorded, not executed", "", f"> {utterance}", ""]), encoding="utf-8")
    return f


def run(utterance: str, *, inbox: Path | None = None) -> dict:
    r = parse(utterance)
    f = record(r, utterance, inbox)
    fields = [f"What: book {r['what']}" + (f" {r['when']}" if r["when"] else ""),
              f"If: {'no calendar conflict' if r['condition'] else '-'}",
              f"Then: {('confirm via ' + r['confirm_via']) if r['confirm_via'] else '-'}", "Status: recorded, not executed"]
    return {"ok": True, "tool": "approval", "spoken": readback(r), "record": r, "fields": fields,
            "cites": [str(f)] if f else [], "wires": ["approval"], "sent": False, "task_verified": True}
