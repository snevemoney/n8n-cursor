#!/usr/bin/env python3
"""Read-only Calendar, Mail, and Spotlight. Never send. Never tccutil."""
from __future__ import annotations

import os
import re
import signal
import subprocess
import time
from pathlib import Path

HOME = Path.home()
_CAL_CACHE: dict[str, tuple[float, dict]] = {}
_CAL_TTL = 90.0


def _run(argv: list[str], timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    """Bounded run. Kill the whole process group on timeout — a TCC-stalled
    osascript helper must not hold the pipes open past the cap."""
    proc = subprocess.Popen(
        argv,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        start_new_session=True,
    )
    try:
        out, err = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        try:
            os.killpg(proc.pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError, OSError):
            proc.kill()
        try:
            out, err = proc.communicate(timeout=2.0)
        except subprocess.TimeoutExpired:
            out, err = "", ""
        raise subprocess.TimeoutExpired(argv, timeout, output=out, stderr=err)
    return subprocess.CompletedProcess(argv, proc.returncode, out, err)


def _deny(app: str, err: str) -> dict:
    line = f"Allow Terminal to control {app}."
    extra = (err or "").strip()[:120]
    if extra:
        line = f"{line} {extra}"
    return {"ok": False, "state": "denied", "wire": app.lower(), "spoken": line}


WEEKDAYS = ("monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday")


def day_scope(utterance: str = "") -> tuple[str, int]:
    """Label + day offset from today. Default today."""
    low = " ".join((utterance or "").lower().split())
    if re.search(r"\btomorrow\b", low):
        return "Tomorrow", 1
    from datetime import date

    today = date.today().weekday()
    for i, name in enumerate(WEEKDAYS):
        if re.search(rf"\b{name}s?\b", low):
            return name.title(), (i - today) % 7
    return "Today", 0


def clear_calendar_cache() -> None:
    _CAL_CACHE.clear()


def calendar_today(cap: int = 5, utterance: str = "") -> dict:
    """Read events for one day. Never offer a day we cannot fetch."""
    label, offset = day_scope(utterance)
    limit = max(1, min(int(cap or 5), 8))
    key = f"{label}|{offset}|{limit}"
    now = time.time()
    hit = _CAL_CACHE.get(key)
    if hit and now - hit[0] < _CAL_TTL and str((hit[1] or {}).get("state") or "") in {"live", "empty"}:
        return dict(hit[1])
    script = (
        f"set dayStart to (current date)\n"
        f"set time of dayStart to 0\n"
        f"set dayStart to dayStart + ({int(offset)} * days)\n"
        f"set bits to {{}}\n"
        "tell application \"Calendar\"\n"
        "  try\n"
        "    set evs to (every event of every calendar whose "
        "start date ≥ dayStart and start date < dayStart + 1 * days)\n"
        "    repeat with e in evs\n"
        "      set end of bits to (time string of (start date of e)) & \" \" & (summary of e)\n"
        f"      if (count of bits) ≥ {limit} then exit repeat\n"
        "    end repeat\n"
        "    if (count of bits) is 0 then return \"EMPTY\"\n"
        "    set AppleScript's text item delimiters to \"||\"\n"
        "    return \"OK:\" & (bits as text)\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=12.0)
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "state": "slow",
            "wire": "calendar",
            "spoken": f"Calendar is still opening. I do not have {label.lower()}'s events yet.",
        }
    except OSError as exc:
        return _deny("Calendar", str(exc))
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return _deny("Calendar", body.replace("DENY:", "", 1))
    def _keep(row: dict) -> dict:
        if str(row.get("state") or "") in {"live", "empty"}:
            _CAL_CACHE[key] = (time.time(), dict(row))
        return row

    if body == "EMPTY" or body.endswith(":EMPTY"):
        return _keep({
            "ok": True,
            "state": "empty",
            "wire": "calendar",
            "spoken": f"Nothing on {label.lower()}'s calendar.",
            "events": [],
        })
    raw = body.split(":", 1)[-1].strip() if body.startswith("OK:") else body
    events = [bit.strip() for bit in raw.split("||") if bit.strip()][:limit]
    if not events:
        return _keep({
            "ok": True,
            "state": "empty",
            "wire": "calendar",
            "spoken": f"Nothing on {label.lower()}'s calendar.",
            "events": [],
        })
    spoken = f"{label}: " + "; ".join(events) + "."
    return _keep({
        "ok": True,
        "state": "live",
        "wire": "calendar",
        "spoken": spoken,
        "events": events,
    })


def frontmost_app(timeout: float = 4.0) -> dict:
    """Front app + window title. Read-only. TCC deny is a named state, not a crash."""
    script = (
        "tell application \"System Events\"\n"
        "  try\n"
        "    set p to first process whose frontmost is true\n"
        "    set appName to name of p\n"
        "    set winTitle to \"\"\n"
        "    try\n"
        "      set winTitle to name of front window of p\n"
        "    end try\n"
        "    return \"OK:\" & appName & \"||\" & winTitle\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=timeout)
    except subprocess.TimeoutExpired:
        return {"ok": False, "state": "slow", "wire": "screen", "app": "", "title": ""}
    except OSError as exc:
        return {**_deny("System Events", str(exc)), "app": "", "title": ""}
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return {**_deny("System Events", body.replace("DENY:", "", 1)), "app": "", "title": ""}
    raw = body.split(":", 1)[-1] if body.startswith("OK:") else body
    app, _, title = raw.partition("||")
    return {
        "ok": True,
        "state": "live",
        "wire": "screen",
        "app": app.strip(),
        "title": title.strip(),
    }


def mail_unread() -> dict:
    script = (
        "tell application \"Mail\"\n"
        "  try\n"
        "    set n to unread count of inbox\n"
        "    return \"OK:\" & n\n"
        "  on error errMsg\n"
        "    return \"DENY:\" & errMsg\n"
        "  end try\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=10.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return _deny("Mail", str(exc))
    body = (proc.stdout or proc.stderr or "").strip()
    if proc.returncode != 0 or body.startswith("DENY:") or "not allowed" in body.lower():
        return _deny("Mail", body.replace("DENY:", "", 1))
    raw = body.split(":", 1)[-1].strip() if ":" in body else body
    spoken = f"Mail inbox unread: {raw}."
    return {"ok": True, "state": "live", "wire": "mail", "spoken": spoken, "unread": raw}


def files_search(query: str, cap: int = 5) -> dict:
    q = " ".join((query or "").split())
    skip = {"find", "search", "file", "files", "show", "my", "the", "a", "an", "please"}
    words = [w for w in q.split() if w.lower() not in skip]
    look = " ".join(words) if words else q
    if not look or look.lower() in {"files", "file"}:
        return {
            "ok": True,
            "state": "live",
            "wire": "files",
            "spoken": "Name what to find on disk.",
            "hits": [],
        }
    try:
        proc = _run(["mdfind", "-onlyin", str(HOME), look], timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "ok": False,
            "state": "denied",
            "wire": "files",
            "spoken": f"Spotlight did not run. {exc}.",
            "hits": [],
        }
    paths = [ln.strip() for ln in (proc.stdout or "").splitlines() if ln.strip()][:cap]
    if not paths:
        return {
            "ok": True,
            "state": "live",
            "wire": "files",
            "spoken": f"No Spotlight hits for {look}.",
            "hits": [],
        }
    names = [Path(p).name for p in paths]
    spoken = "Disk: " + "; ".join(names) + "."
    return {"ok": True, "state": "live", "wire": "files", "spoken": spoken, "hits": paths}
