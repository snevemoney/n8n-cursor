"""apps — open, switch to or quit any installed Mac app by name (Evens 2026-10-15: "open any desktop app I want").

Resolves loose names ("the Notes app", "final cut", "wordcraft") against real .app bundles in the standard
Applications folders, then uses LaunchServices (`open -a`). Opening or switching is not gated. Quitting asks
the app to quit normally (it can still prompt to save); force-quit is never used.
"""
from __future__ import annotations

import difflib
import os
import re
import subprocess
import sys
import time
from pathlib import Path

APP_DIRS = ("/Applications", "/Applications/Utilities", "/System/Applications", "/System/Applications/Utilities",
            "~/Applications", "/System/Library/CoreServices/Applications")
OPEN_RE = re.compile(r"^(?:hey\s+)?(?:jarvis[, ]+)?(?:(?:can|could|would)\s+you\s+)?(?:please\s+)?"
                     r"(open|launch|start|run|bring\s+up|fire\s+up|switch\s+to|go\s+to|focus|quit|close)\s+(?:up\s+)?(?:the\s+|my\s+)?"
                     r"(?:app\s+|application\s+)?(.{1,60}?)(?:\s+(?:app|application))?(?:\s+for\s+me|\s+please|\s+now)?[.!?]*$", re.I)
NOT_APP_RE = re.compile(r"(?:^|\s)(?:/|~/)|\.(?:com|org|net|io|ai|ca|dev|app/|html?|pdf|md|txt|py|json|png|jpe?g|epub|docx?)\b|"
                        r"\b(?:folder|file|files|document|website|site|url|link|tab|page|repo|repository|downloads|desktop|"
                        r"documents|it|this|that|them|the\s+door|window|ticket|issue|pr|pull\s+request|account|email|mail\s+to)\b", re.I)


def _bundles() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for raw in APP_DIRS:
        root = Path(raw).expanduser()
        if not root.is_dir():
            continue
        try:
            for p in root.iterdir():
                if p.suffix == ".app":
                    found.setdefault(p.stem, p)
                elif p.is_dir() and not p.name.startswith("."):  # one level of vendor folders (e.g. Adobe, ArtCraft)
                    try:
                        for q in p.iterdir():
                            if q.suffix == ".app":
                                found.setdefault(q.stem, q)
                    except OSError:
                        continue
        except OSError:
            continue
    return found


def _norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower())


def resolve(name: str, bundles: dict[str, Path] | None = None) -> tuple[str, Path] | None:
    apps = _bundles() if bundles is None else bundles
    if not apps:
        return None
    want = _norm(name)
    if not want:
        return None
    by_norm = {_norm(k): k for k in apps}
    if want in by_norm:
        k = by_norm[want]; return k, apps[k]
    starts = sorted((k for n, k in by_norm.items() if n.startswith(want)), key=len)
    if starts:
        return starts[0], apps[starts[0]]
    contains = sorted((k for n, k in by_norm.items() if want in n), key=len)
    if contains and len(want) >= 3:
        return contains[0], apps[contains[0]]
    close = difflib.get_close_matches(want, list(by_norm), n=1, cutoff=0.78)
    if close:
        k = by_norm[close[0]]; return k, apps[k]
    return None


def wants(utterance: str) -> bool:
    m = OPEN_RE.match((utterance or "").strip())
    if not m or NOT_APP_RE.search(m.group(2)):
        return False
    return resolve(m.group(2)) is not None


def _live() -> bool:
    return sys.platform == "darwin" and "pytest" not in sys.modules and "unittest" not in sys.modules \
        and not os.environ.get("PYTEST_CURRENT_TEST")


def _observe_running(app: str) -> bool | None:
    """What macOS reports, not what the launch command returned. None = could not observe."""
    try:
        cp = subprocess.run(["osascript", "-e", f'application "{app}" is running'], capture_output=True, text=True, timeout=5)
    except (OSError, subprocess.TimeoutExpired):
        return None
    out = (cp.stdout or "").strip().lower()
    return True if out == "true" else False if out == "false" else None


def _settle(observe, app: str, want: bool, tries: int = 6, pause: float = 0.5) -> bool | None:
    seen = None
    for i in range(tries):
        seen = observe(app)
        if seen is want:
            return seen
        if i + 1 < tries:
            time.sleep(pause)
    return seen


def run(utterance: str, *, bundles: dict[str, Path] | None = None, runner=None, observe=None) -> dict:
    """Launch exit and observed app state are separate facts; only the observed state verifies the task.

    Off the Mac (or under tests without an injected runner) nothing runs, and the result says so. An injected
    runner without an injected observer never certifies completion: test doubles are not live Mac evidence."""
    m = OPEN_RE.match((utterance or "").strip())
    if not m:
        return {"ok": False, "tool": "apps", "spoken": "Which app should I open?", "task_verified": False}
    verb, raw = m.group(1).lower(), m.group(2).strip()
    hit = resolve(raw, bundles)
    if hit is None:
        names = sorted((bundles if bundles is not None else _bundles()).keys())
        close = difflib.get_close_matches(raw, names, n=3, cutoff=0.5)
        return {"ok": False, "tool": "apps", "task_verified": False,
                "spoken": f"I couldn't find an app called {raw} on your Mac." + (f" Closest: {', '.join(close)}." if close else "")}
    app, path = hit
    quit_ = verb in ("quit", "close")
    cmd = (["osascript", "-e", f'tell application "{app}" to quit'] if quit_ else ["open", "-a", str(path)])
    if runner is None and not _live():
        return {"ok": False, "tool": "apps", "app": app, "path": str(path), "outcome": "NOT_EXECUTED", "executed": False,
                "task_verified": False, "spoken": f"Nothing was {'quit' if quit_ else 'opened'}: app control only runs on the Mac."}
    run_fn = runner or (lambda c: subprocess.run(c, capture_output=True, text=True, timeout=15))
    try:
        cp = run_fn(cmd)
        launched, err = cp.returncode == 0, (cp.stderr or cp.stdout or "").strip()[:160]
    except (OSError, subprocess.TimeoutExpired) as exc:
        launched, err = False, type(exc).__name__
    if not launched:
        return {"ok": False, "tool": "apps", "app": app, "executed": True, "command_ok": False, "task_verified": False,
                "spoken": f"{app} didn't {'quit' if quit_ else 'open'}: {err or 'macOS refused'}."}
    if observe is None and runner is None:
        observe = _observe_running
    state = _settle(observe, app, not quit_) if observe is not None else None
    verified = state is (not quit_)
    if verified:
        spoken = f"{app} has quit." if quit_ else f"{app} is open."
    elif state is None:
        spoken = f"macOS accepted the {'quit' if quit_ else 'open'} command for {app}, but I couldn't confirm it."
    else:
        spoken = (f"I asked {app} to quit, but it's still running (it may be asking to save)." if quit_
                  else f"macOS accepted the open command, but {app} isn't running yet.")
    return {"ok": True, "tool": "apps", "app": app, "path": str(path), "executed": True, "command_ok": True,
            "observed_running": state, "task_verified": verified, "spoken": spoken}
