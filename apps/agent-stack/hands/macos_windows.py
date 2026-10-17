#!/usr/bin/env python3
"""Windows, displays and Terminal awareness for Jarvis (goal §4).

Read-only except one reversible action: bringing an app that is already open to the front.
Never launches new apps, never types into Terminal, never runs tccutil. Terminal text is redacted
with secret_scan before Jarvis speaks it.
"""
from __future__ import annotations

import importlib.util
import json
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
TERMINAL_CHARS = 1500

_WINDOWS_JXA = (
    "ObjC.import('CoreGraphics');"
    "var ref=$.CGWindowListCopyWindowInfo($.kCGWindowListOptionOnScreenOnly|$.kCGWindowListExcludeDesktopElements,"
    "$.kCGNullWindowID);"
    "var arr=ObjC.deepUnwrap(ObjC.castRefToObject(ref))||[];"
    "JSON.stringify(arr.filter(function(w){return w.kCGWindowLayer===0;}).map(function(w){var b=w.kCGWindowBounds||{};"
    "return {app:w.kCGWindowOwnerName||'',title:w.kCGWindowName||'',x:b.X,y:b.Y,w:b.Width,h:b.Height};}));"
)
_TERMINAL_AS = ('tell application "Terminal" to if (count of windows) > 0 then '
                'get contents of selected tab of front window')

_WINDOWS_RE = re.compile(r"\b(?:what|which|list|show)\b.{0,20}\b(?:windows?|apps?|applications?)\b.{0,20}\b(?:open|running|up)\b", re.I)
_DISPLAYS_RE = re.compile(r"\b(?:how many|which|what)\s+(?:displays?|screens?|monitors?)\s+(?:do i have|have i got|"
                          r"am i using|are (?:connected|plugged in|attached|hooked up|on))\b|"
                          r"\b(?:list|show)\s+(?:me\s+)?my\s+(?:displays|screens|monitors)\b", re.I)
_TERMINAL_RE = re.compile(r"\b(?:what(?:'s| is)|show|read)\b.{0,15}\bin my terminal\b(?!\s+history)|\bmy terminal (?:say|show)", re.I)
_SWITCH_RE = re.compile(r"^\s*(?:jarvis[,\s]+)?(?:switch to|focus)\s+(?:the\s+)?([A-Za-z0-9][\w .\-]{0,40}?)\s*(?:app|window)?\s*[.!?]?\s*$", re.I)


def _run(argv: list[str], timeout: float = 12.0) -> subprocess.CompletedProcess:
    return subprocess.run(argv, capture_output=True, text=True, timeout=timeout)


def _scan():
    spec = importlib.util.spec_from_file_location("jarvis_secret_scan_w", HERE / "secret_scan.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _pick_app(want: str, apps: list[str]) -> str | None:
    """Exact name first, else a unique prefix of 3+ letters; never guess between apps."""
    want = want.strip().lower()
    exact = [a for a in apps if a.lower() == want]
    if exact:
        return exact[0]
    if len(want) < 3:
        return None
    hits = [a for a in apps if a.lower().startswith(want)]
    return hits[0] if len(hits) == 1 else None


def wants(utterance: str, run=_run) -> bool:
    u = (utterance or "").strip()
    if _WINDOWS_RE.search(u) or _DISPLAYS_RE.search(u) or _TERMINAL_RE.search(u):
        return True
    m = _SWITCH_RE.match(u)
    if not m:
        return False
    try:  # "go to sleep" / "switch to dark mode" are not apps; only claim names of apps already open
        return _pick_app(m.group(1), _apps(windows(run))) is not None
    except (subprocess.TimeoutExpired, OSError, ValueError):
        return False


def displays(run=_run) -> list[dict]:
    got = run(["system_profiler", "SPDisplaysDataType", "-json"], timeout=15.0)
    data = json.loads(got.stdout or "{}")
    rows = []
    for gpu in data.get("SPDisplaysDataType", []):
        for d in gpu.get("spdisplays_ndrvs", []) or []:
            rows.append({"name": d.get("_name", "display"),
                         "resolution": d.get("_spdisplays_resolution") or d.get("spdisplays_resolution") or "",
                         "main": d.get("spdisplays_main") == "spdisplays_yes"})
    return rows


def windows(run=_run) -> list[dict]:
    got = run(["osascript", "-l", "JavaScript", "-e", _WINDOWS_JXA], timeout=10.0)
    rows = json.loads(got.stdout or "[]")
    return [r for r in rows if isinstance(r, dict) and r.get("app")]


def terminal_text(run=_run) -> str:
    got = run(["osascript", "-e", _TERMINAL_AS], timeout=8.0)
    text = (got.stdout or "").rstrip()
    return _scan().redact(text)[-TERMINAL_CHARS:]  # redact first so a cut can't split a key past the scanner


def _apps(rows: list[dict]) -> list[str]:
    return list(dict.fromkeys(r["app"] for r in rows))


def run(utterance: str, run=_run) -> dict:
    u = (utterance or "").strip()
    base = {"wires": ["windows"], "cites": [], "sent": False, "task_verified": False}
    try:
        m = _SWITCH_RE.match(u)
        if m:
            apps = _apps(windows(run))
            match = _pick_app(m.group(1), apps)
            if not match:
                return {**base, "ok": False,
                        "spoken": f"{m.group(1).strip()} isn't an open app I can name exactly, so I didn't switch or launch anything. Open apps: {', '.join(apps[:8]) or 'none found'}."}
            run(["open", "-a", match], timeout=8.0)
            return {**base, "ok": True, "spoken": f"Brought {match} to the front."}
        if _TERMINAL_RE.search(u):
            if "Terminal" not in _apps(windows(run)):
                return {**base, "ok": False, "spoken": "Terminal isn't open, so there's nothing to read."}
            text = terminal_text(run)
            if not text:
                return {**base, "ok": False, "spoken": "I couldn't read Terminal. macOS may need to allow Jarvis to control Terminal."}
            tail = " / ".join(line.strip() for line in text.splitlines()[-8:] if line.strip())
            return {**base, "ok": True, "spoken": f"Your front Terminal tab ends with: {tail}"}
        if _DISPLAYS_RE.search(u):
            rows = displays(run)
            if not rows:
                return {**base, "ok": False, "spoken": "I couldn't read the display list."}
            parts = [f"{d['name']}{' (main)' if d['main'] else ''}{', ' + d['resolution'] if d['resolution'] else ''}" for d in rows]
            return {**base, "ok": True, "displays": rows,
                    "spoken": f"You have {len(rows)} display{'s' if len(rows) != 1 else ''}: " + "; ".join(parts) + "."}
        rows = windows(run)
        apps = _apps(rows)
        if not apps:
            return {**base, "ok": False, "spoken": "I couldn't see any open windows. macOS may need to allow screen access."}
        return {**base, "ok": True, "windows": rows,
                "spoken": f"{len(apps)} apps have windows open: " + ", ".join(apps[:12]) + "."}
    except (subprocess.TimeoutExpired, OSError, ValueError) as exc:
        return {**base, "ok": False, "spoken": f"I couldn't check your windows ({type(exc).__name__}); nothing was changed."}
