"""Z09 meeting pre-brief: 10-30 min before a calendar event, Jarvis offers prep; "prep me" pulls his notes.

tick(): read today's Calendar (macos_read.calendar_today, read-only), find the next event starting in
WINDOW_MIN, and once per event put an offer on the bus (bus.prebrief {gen, line}); the Orb shows and speaks it
like a focus nudge. prep(): next event title -> local notes search (memory/retrieve) -> spoken brief with sources.
Never sends, never books, never edits the calendar.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from pathlib import Path

WINDOW_MIN = (10, 30)
TIME_RE = re.compile(r"^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?\s+(.+)$")
WANT_RE = re.compile(r"\b(?:prep|prepare|brief)\s+me(?:\s+for\s+(?:my\s+|the\s+)?(?:next\s+)?(?:meeting|call|sync|event)\b|\s*[.!?]*$)|\bpre-?brief\b|\b(?:prep|notes)\s+for\s+(?:my\s+)?(?:next\s+)?(?:meeting|call|sync)\b|"
                     r"^\s*(?:yes|yeah|sure)[,.]?\s+(?:prep|pull|brief)\b", re.I)


def wants_prep(u: str) -> bool:
    return bool(WANT_RE.search(u or ""))


def parse_events(rows: list[str], day: datetime) -> list[tuple[datetime, str]]:
    out = []
    for r in rows or []:
        m = TIME_RE.match(str(r))
        if not m:
            continue
        h, mi, ap, title = int(m.group(1)), int(m.group(2)), (m.group(3) or "").lower(), m.group(4).strip()
        if ap == "pm" and h < 12:
            h += 12
        if ap == "am" and h == 12:
            h = 0
        out.append((day.replace(hour=h, minute=mi, second=0, microsecond=0), title))
    return sorted(out)


def next_event(events, now: datetime, lo: int = 0, hi: int = 24 * 60):
    for at, title in events:
        mins = (at - now).total_seconds() / 60
        if lo <= mins <= hi:
            return at, title, int(round(mins))
    return None


def _state(hive: Path) -> Path:
    return Path(hive) / "bus" / "prebrief-offered.json"


_ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
_TENS = "_ _ twenty thirty forty fifty sixty".split()


def words(n: int) -> str:
    if n < 20:
        return _ONES[max(0, n)]
    t, o = divmod(n, 10)
    return _TENS[t] + ("-" + _ONES[o] if o else "") if t < 7 else str(n)


def offer_line(at: datetime, title: str, mins: int, *, notes_fn=None) -> str:
    """Demo U-LXFzu6sGU 6:46-7:00 (storyboards/Z09): header line, then the butler line with the minutes in words,
    an honest notes check, and a two-option offer."""
    found = 0
    try:
        found = int(notes_fn(title)) if notes_fn else 0
    except Exception:  # noqa: BLE001
        found = 0
    head = f"\U0001F4CB Prep \u2014 {title} at {at.strftime('%a %b %-d, %-I:%M %p')}"
    when = "today" if at.date() == datetime.now().date() else at.strftime("%A")
    on_file = (f"I found {found} note{'s' if found != 1 else ''} on it in your vault."
               if found else "Nothing on file about agenda items or attendees for this one, I'm afraid.")
    return (f"{head}\nRight, sir. You've got the {title} at {at.strftime('%-I:%M')} {when} \u2014 that's in {words(mins)} minutes. "
            f"{on_file} Shall I pull your last three notes on it so we can spot what's likely on the table, "
            "or would you prefer I draft a standing brief template for it? Say \u201cprep me\u201d.")


def tick(hive: Path, *, cal_fn, mutate_fn, now: datetime | None = None, notes_fn=None) -> str | None:
    now = now or datetime.now()
    got = cal_fn() or {}
    if not got.get("ok"):
        return None
    hit = next_event(parse_events(got.get("events") or [], now), now, *WINDOW_MIN)
    if not hit:
        return None
    at, title, mins = hit
    key = f"{at.isoformat()}|{title}"
    try:
        offered = json.loads(_state(hive).read_text())
    except (OSError, ValueError):
        offered = {}
    if key in offered:
        return None
    line = offer_line(at, title, mins, notes_fn=notes_fn)

    def put(bus: dict) -> dict:
        pb = bus.get("prebrief") if isinstance(bus.get("prebrief"), dict) else {}
        bus["prebrief"] = {"gen": int(pb.get("gen") or 0) + 1, "line": line, "title": title, "at": at.isoformat()}
        return bus

    mutate_fn(Path(hive), put)
    offered = {k: v for k, v in offered.items() if v >= now.date().isoformat()}
    offered[key] = now.date().isoformat()
    _state(hive).parent.mkdir(parents=True, exist_ok=True)
    _state(hive).write_text(json.dumps(offered))
    return line


def prep(utterance: str, *, cal_fn, search_fn, now: datetime | None = None) -> dict:
    now = now or datetime.now()
    got = cal_fn() or {}
    if not got.get("ok"):
        return {"ok": False, "spoken": str(got.get("spoken") or "I can't read your calendar right now, so I don't know the next meeting.")}
    hit = next_event(parse_events(got.get("events") or [], now), now, -15)
    if not hit:
        return {"ok": True, "spoken": "Nothing else on today's calendar to prep for."}
    at, title, mins = hit
    words = " ".join(w for w in re.findall(r"[A-Za-z0-9][\w'-]+", title) if len(w) > 2 and w.lower() not in {"with", "the", "and", "meeting", "call", "sync"})
    found = search_fn(words or title) or {}
    hits = [h for h in (found.get("hits") or []) if isinstance(h, dict)][:3]
    when = f"in {mins} minutes" if mins >= 0 else f"{-mins} minutes ago"
    if not hits:
        return {"ok": True, "spoken": f"Your {at.strftime('%-I:%M %p')} \u201c{title}\u201d ({when}): I found no notes on it in your vault."}
    bits = [f"{Path(str(h.get('file') or h.get('path') or 'note')).name}: {' '.join(str(h.get('snippet') or h.get('text') or '').split())[:140]}"
            for h in hits]
    return {"ok": True, "cites": [str(h.get("file") or h.get("path") or "") for h in hits],
            "spoken": f"Prep for your {at.strftime('%-I:%M %p')} \u201c{title}\u201d ({when}). From your notes: " + " | ".join(bits)}
