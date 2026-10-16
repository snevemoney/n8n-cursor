"""task_board — one spoken answer to "what are all my jobs" (owner canvas C01 voice task board, 2026-10-16).

Reads the real state of the long-running work Jarvis owns: coding missions (through their own status, which checks the
worker is alive and is not a reused PID), browser missions (same), and registered read-only loops. Read-only: nothing is
started, stopped or retried here. Each row says what the state file says, never more.
"""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

WANT_RE = re.compile(
    r"^(?:(?:hey\s+)?jarvis\W+|so\s+|ok(?:ay)?\s+)?(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?(?:"
    r"what\s+are\s+(?:all\s+)?(?:my|the|your)\s+(?:jobs|tasks|missions)(?:\s+(?:right\s+)?now)?|"
    r"what(?:'s|\s+is)\s+(?:running|in\s+progress|still\s+running)(?:\s+(?:right\s+)?now)?|"
    r"(?:show|give)\s+(?:me\s+)?(?:the\s+|my\s+)?(?:task|job)\s+board|"
    r"what\s+are\s+you\s+(?:working\s+on|doing)(?:\s+(?:right\s+)?now)?|"
    r"(?:list|show)\s+(?:me\s+)?(?:all\s+)?(?:my\s+|the\s+|your\s+)?(?:jobs|missions|running\s+tasks|background\s+(?:jobs|tasks))|"
    r"any\s+(?:jobs|tasks|missions)\s+(?:running|going)|status\s+of\s+(?:all\s+)?(?:my\s+)?(?:jobs|tasks|missions))"
    r"[\s?.!]*$", re.I)
CODING_DONE = {"COMPLETED", "FAILED", "CANCELLED", "BLOCKED"}
BROWSER_DONE = {"VERIFIED", "PARTIAL", "FAILED", "CANCELLED"}
RECENT_DONE = 3


def wants(utterance: str) -> bool:
    return bool(WANT_RE.match((utterance or "").strip()))


def _read(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def _missions(root: Path, status_fn, done: set) -> tuple[list[dict], list[dict]]:
    live, finished = [], []
    if not root.is_dir():
        return live, finished
    dirs = sorted((d for d in root.iterdir() if d.is_dir() and re.fullmatch(r"[a-f0-9]{32}", d.name)),
                  key=lambda d: d.stat().st_mtime, reverse=True)
    for d in dirs[:40]:
        try:
            state = status_fn(d.name) if status_fn else (_read(d / "result.json") or _read(d / "state.json"))
        except (ValueError, OSError):
            continue
        req = _read(d / "request.json")
        row = {"id": d.name[:8], "status": str(state.get("status") or "unknown").upper(),
               "what": str(req.get("objective") or req.get("goal") or req.get("request") or state.get("objective") or "")[:90],
               "step": str((state.get("progress") or {}).get("what") or "")[:90]}
        (finished if row["status"] in done else live).append(row)
    return live, finished[:RECENT_DONE]


def board(hive: Path, *, coding_status=None, browser_status=None, loops=None, now: datetime | None = None) -> dict:
    hive = Path(hive)
    coding, coding_done = _missions(hive / "coding-missions", coding_status, CODING_DONE)
    browser, browser_done = _missions(hive / "browser-missions", browser_status, BROWSER_DONE)
    now_s = (now or datetime.now()).isoformat(timespec="seconds")
    active_loops = [r for r in (loops or []) if r.get("status") == "active" and str(r.get("expires") or "9999") > now_s]
    parts = []
    for r in coding:
        parts.append(f"coding task {r['id']}" + (f" ({r['what']})" if r["what"] else "") + f" is {r['status'].lower()}"
                     + (f": {r['step']}" if r["step"] else ""))
    for r in browser:
        parts.append(f"browser research {r['id']}" + (f" ({r['what']})" if r["what"] else "") + f" is {r['status'].lower()}")
    for r in active_loops:
        parts.append(f"loop: {r.get('what')} every {r.get('every_min')} min, run {r.get('runs', 0)} of {r.get('max_runs')}")
    done = [f"{kind} {r['id']} {r['status'].lower()}" for kind, rows in (("coding task", coding_done), ("browser research", browser_done))
            for r in rows]
    if not parts:
        spoken = "Nothing is running right now." + (f" Recently finished: {'; '.join(done)}." if done else "")
    else:
        spoken = f"{len(parts)} job{'s' if len(parts) != 1 else ''} going: " + "; ".join(parts) + "." + (
            f" Recently finished: {'; '.join(done)}." if done else "")
    return {"ok": True, "spoken": spoken, "coding": coding, "browser": browser, "loops": active_loops,
            "finished": coding_done + browser_done, "task_verified": True}


# Owner canvas Z64 (mode truth, 2026-10-16): "are you listening", "can you see my screen", "is open access on" are answered
# from the real switches on the bus and the mode file, never by the model.
MODE_RE = re.compile(
    r"^(?:(?:hey\s+)?jarvis\W+|so\s+|ok(?:ay)?\s+)?(?:"
    r"are\s+you\s+(?:listening|watching(?:\s+my\s+screen)?|on|awake|recording|looking\s+at\s+my\s+screen)|"
    r"is\s+(?:the\s+|my\s+)?(?:mic|microphone|camera|webcam|watch|open\s+access|focus(?:\s+lock)?)\s+(?:on|off|live|active|muted)|"
    r"can\s+you\s+(?:see|hear)\s+me|what\s+(?:mode|modes)\s+are\s+you\s+in|"
    r"what(?:'s|\s+is)\s+(?:on|switched\s+on|active)\s+right\s+now|which\s+senses\s+are\s+on)[\s?.!]*$", re.I)


def wants_modes(utterance: str) -> bool:
    return bool(MODE_RE.match((utterance or "").strip()))


def modes(bus: dict, *, open_access: bool) -> dict:
    b = bus if isinstance(bus, dict) else {}
    mic = str(b.get("mic") or ("live" if b.get("phase") == "listen" else "unknown"))
    watch = b.get("watch") if isinstance(b.get("watch"), dict) else {}
    eyes = b.get("eyes") if isinstance(b.get("eyes"), dict) else {}
    focus = b.get("focus") if isinstance(b.get("focus"), dict) else {}
    watching = bool(watch.get("armed") or b.get("watch_active"))
    parts = [
        "the mic is " + ("live" if mic == "live" else "muted" if mic == "mute" else "in an unknown state (the Face owns it)"),
        "screen watch is " + ("on" if watching else "off"),
        "the camera is " + ("on" if eyes.get("active") else "off"),
        "open access is " + ("on" if open_access else "off"),
    ]
    if focus.get("app") or focus.get("active"):
        parts.append(f"focus lock is on {focus.get('app') or 'an app'}")
    spoken = "Right now " + ", ".join(parts[:-1]) + " and " + parts[-1] + "."
    return {"ok": True, "spoken": spoken, "mic": mic, "watch": watching, "eyes": bool(eyes.get("active")),
            "open_access": bool(open_access), "task_verified": True}


# Owner canvas "File / image drop" -> hands (2026-10-16): the drop reached only the model's context. "What did I drop"
# is answered from the real drop record; "read / summarize the file I dropped" is routed to a real read of that file.
DROP_ASK_RE = re.compile(r"^(?:(?:hey\s+)?jarvis\W+)?(?:what|which)\s+(?:file|image|pdf|document|thing)\s+did\s+i\s+(?:just\s+)?(?:drop|drag)"
                         r"(?:\s+(?:in|on\s+you|onto\s+you))?[\s?.!]*$|^(?:what\s+did\s+i\s+(?:just\s+)?(?:drop|drag)(?:\s+in)?)[\s?.!]*$", re.I)
DROP_READ_RE = re.compile(r"\b(?:read|summari[sz]e|open|look\s+at|what(?:'s|\s+is)\s+in)\s+(?:the|that|this|my)\s+(?:file|image|pdf|document|"
                          r"picture|photo|screenshot)\s+(?:i\s+(?:just\s+)?(?:dropped|dragged)|you\s+got)\b", re.I)


def wants_drop(utterance: str) -> str:
    u = (utterance or "").strip()
    return "what" if DROP_ASK_RE.match(u) else "read" if DROP_READ_RE.search(u) else ""


def drop_line(bus: dict) -> dict:
    d = (bus or {}).get("drop") if isinstance((bus or {}).get("drop"), dict) else {}
    if not d.get("name"):
        return {"ok": False, "spoken": "Nothing has been dropped on me yet. Drag a file onto the Orb.", "task_verified": False}
    kb = int(d.get("bytes") or 0) / 1024
    size = f"{kb / 1024:.1f} MB" if kb >= 1024 else f"{kb:.0f} KB"
    when = ""
    try:
        from datetime import timezone
        at = datetime.fromisoformat(str(d.get("captured_at") or "").replace("Z", "+00:00")).astimezone()
        when = " at " + at.strftime("%-I:%M %p") + ("" if at.date() == datetime.now().astimezone().date() else at.strftime(" on %B %-d"))
    except ValueError:
        pass
    kind = {"application/pdf": "a PDF", "image/png": "an image", "image/jpeg": "an image", "image/webp": "an image",
            "text/plain": "a text file", "text/markdown": "a Markdown note", "text/csv": "a spreadsheet"}.get(str(d.get("mime")), "a file")
    return {"ok": True, "spoken": f"You dropped {d['name']}, {kind} of {size}{when}.",
            "path": d.get("path"), "task_verified": True}
