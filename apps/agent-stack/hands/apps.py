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
                     r"(open|launch|start|run|bring\s+up|fire\s+up|pull\s+up|put\s+on|play|switch\s+to|go\s+to|focus|quit|close|"
                     r"ouvre|ouvrir|lance|lancer|ferme|fermer|quitte|quitter)\s+(?:up\s+)?(?:the\s+|my\s+|l'|le\s+|la\s+)?"
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


# Spoken names for apps whose bundle name differs (routing audit 2026-10-16: "open code" opened Xcode).
APP_ALIASES = {"vscode": "visualstudiocode", "vs": "visualstudiocode", "code": "visualstudiocode", "chrome": "googlechrome",
               "settings": "systemsettings", "quicktime": "quicktimeplayer", "activity": "activitymonitor", "finalcut": "finalcutpro",
               "logic": "logicpro",
               # live 10-16: "open my browser" fell through to a note search; his browser is Safari
               "browser": "safari", "webbrowser": "safari", "internet": "safari", "theinternet": "safari"}


def resolve(name: str, bundles: dict[str, Path] | None = None) -> tuple[str, Path] | None:
    apps = _bundles() if bundles is None else bundles
    if not apps:
        return None
    want = _norm(name)
    want = APP_ALIASES.get(want, want)
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


# Read-only desktop state (owner canvas "Mac apps + displays"): which apps run, which windows are open, how many screens.
LIST_RE = re.compile(r"^(?:(?:hey\s+)?jarvis\W+|so\s+)?(?:(?:can|could|would)\s+you\s+(?:please\s+)?|i\s+need\s+you\s+to\s+)?(?:please\s+)?(?:"
                     r"(?P<apps>(?:what|which)\s+apps?\s+(?:are|is)\s+(?:running|open)|(?:list|show)\s+(?:me\s+)?(?:the\s+|my\s+)?(?:running|open)\s+apps)"
                     r"|(?P<windows>(?:what|which)\s+windows\s+(?:are|do\s+i\s+have)\s+open|(?:list|show)\s+(?:me\s+)?(?:the\s+|my\s+)?open\s+windows)"
                     r"|(?P<displays>how\s+many\s+(?:displays|monitors|screens)\s+(?:do\s+i\s+have|are\s+(?:connected|plugged\s+in))"
                     r"|(?:list|show)\s+(?:me\s+)?(?:my\s+|the\s+)?(?:displays|monitors)))"
                     r"(?:\s+(?:right\s+)?now|\s+on\s+my\s+mac|\s+for\s+me|,?\s+please)?[\s?.!]*$", re.I)
_LIST_CMD = {
    "apps": ["osascript", "-e", 'tell application "System Events" to get name of every application process whose background only is false'],
    "windows": ["osascript", "-e", 'tell application "System Events" to get name of every window of (every application process '
                                   'whose background only is false)'],
    "displays": ["system_profiler", "SPDisplaysDataType", "-json"],
}


def list_kind(utterance: str) -> str:
    m = LIST_RE.match((utterance or "").strip())
    return next((k for k in ("apps", "windows", "displays") if m and m.group(k)), "")


def _spoken_list(kind: str, out: str) -> tuple[str, list[str]]:
    if kind == "displays":
        import json as _json
        try:
            gpus = _json.loads(out or "{}").get("SPDisplaysDataType") or []
        except ValueError:
            return "I couldn't read the display list.", []
        names = [d.get("_name") or "display" for g in gpus for d in (g.get("spdisplays_ndrvs") or [])]
        return (f"{len(names)} display{'s' if len(names) != 1 else ''}: {', '.join(names)}." if names
                else "macOS reported no displays."), names
    names = [n.strip() for n in re.split(r",\s*", (out or "").replace("{", "").replace("}", "")) if n.strip() and n.strip() != "missing value"]
    if kind == "apps":
        return (f"{len(names)} apps running: {', '.join(names[:20])}." if names else "No foreground apps reported."), names
    return (f"{len(names)} windows open: {', '.join(names[:15])}." if names else "No open windows reported."), names


def run_list(kind: str, *, runner=None) -> dict:
    """Read-only. Off the Mac nothing runs and the result says so; the listing is the observation itself."""
    if runner is None and not _live():
        return {"ok": False, "tool": "apps", "list": kind, "outcome": "NOT_EXECUTED", "execution_status": "NOT_EXECUTED", "executed": False, "task_verified": False,
                "spoken": f"I can't list your {kind} from here: that read only runs on the Mac."}
    run_fn = runner or (lambda c: subprocess.run(c, capture_output=True, text=True, timeout=15))
    try:
        cp = run_fn(_LIST_CMD[kind])
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "tool": "apps", "list": kind, "executed": True, "task_verified": False,
                "spoken": f"Listing {kind} failed: {type(exc).__name__}."}
    if cp.returncode != 0:
        err = (cp.stderr or cp.stdout or "").strip()[:160]
        return {"ok": False, "tool": "apps", "list": kind, "executed": True, "task_verified": False,
                "spoken": f"macOS refused the {kind} read: {err or 'no detail'}. Accessibility or Automation may need allowing."}
    spoken, names = _spoken_list(kind, cp.stdout)
    return {"ok": True, "tool": "apps", "list": kind, "items": names, "executed": True, "task_verified": True, "spoken": spoken}


# Sites he names like apps (live 10-16: "open LinkedIn" got a made-up "LinkedIn is open" with nothing opened).
SITES = {"linkedin": "https://www.linkedin.com", "youtube": "https://www.youtube.com", "twitter": "https://x.com",
         "x": "https://x.com", "github": "https://github.com", "notion": "https://www.notion.so", "gmail": "https://mail.google.com",
         "google": "https://www.google.com", "wikipedia": "https://www.wikipedia.org", "openrouter": "https://openrouter.ai",
         "hostinger": "https://hpanel.hostinger.com", "instagram": "https://www.instagram.com", "tiktok": "https://www.tiktok.com",
         "facebook": "https://www.facebook.com", "reddit": "https://www.reddit.com", "chatgpt": "https://chatgpt.com",
         "claude": "https://claude.ai", "figma": "https://www.figma.com", "canva": "https://www.canva.com",
         "spotify": "https://open.spotify.com"}
_SITE_TAIL = re.compile(r"\s+(?:in|on|with)\s+(?:safari|the\s+browser|my\s+browser|chrome)$|\s+(?:website|site|web\s*page)$", re.I)


def site_url(raw: str) -> str:
    return SITES.get(_norm(_SITE_TAIL.sub("", (raw or "").strip())), "")


def wants(utterance: str) -> bool:
    if list_kind(utterance):
        return True
    m = OPEN_RE.match((utterance or "").strip())
    if not m or NOT_APP_RE.search(m.group(2)):
        return False
    return resolve(m.group(2)) is not None or bool(site_url(m.group(2)))


def _live() -> bool:
    return sys.platform == "darwin" and "pytest" not in sys.modules and "unittest" not in sys.modules \
        and not os.environ.get("PYTEST_CURRENT_TEST")


def _observe_running(app: str) -> bool | None:
    """What macOS reports, not what the launch command returned. None = could not observe."""
    try:
        cp = subprocess.run(["osascript", "-e", "on run argv", "-e", "return application (item 1 of argv) is running", "-e", "end run", app],
                            capture_output=True, text=True, timeout=5)  # name as an argument, never in the script source
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


def run(utterance: str, *, bundles: dict[str, Path] | None = None, runner=None, observe=None, check=None) -> dict:
    """Launch exit and observed app state are separate facts; only the observed state verifies the task.

    Off the Mac (or under tests without an injected runner) nothing runs, and the result says so. An injected
    runner without an injected observer never certifies completion: test doubles are not live Mac evidence."""
    observe = observe or check  # check= is the older name for the same observer
    kind = list_kind(utterance)
    if kind:
        return run_list(kind, runner=runner)
    m = OPEN_RE.match((utterance or "").strip())
    if not m:
        return {"ok": False, "tool": "apps", "spoken": "Which app should I open?", "task_verified": False}
    verb, raw = m.group(1).lower(), m.group(2).strip()
    in_browser = bool(_SITE_TAIL.search(raw))  # "open Spotify on my browser": the site, not the installed app
    hit = None if in_browser and site_url(raw) else resolve(raw, bundles)
    url = site_url(raw) if hit is None and verb not in ("quit", "close", "ferme", "fermer", "quitte", "quitter") else ""
    if url:
        if runner is None and not _live():
            return {"ok": False, "tool": "apps", "app": "Safari", "url": url, "execution_status": "NOT_EXECUTED", "executed": False,
                    "task_verified": False, "spoken": "Nothing was opened: app control only runs on the Mac."}
        run_fn = runner or (lambda c: subprocess.run(c, capture_output=True, text=True, timeout=15))
        try:
            cp = run_fn(["open", "-a", "Safari", url])
            ok = cp.returncode == 0
        except (OSError, subprocess.TimeoutExpired):
            ok = False
        name = _SITE_TAIL.sub("", raw).strip()
        return {"ok": ok, "tool": "apps", "app": "Safari", "url": url, "executed": True,
                "execution_status": "EXECUTED" if ok else "FAILED", "task_verified": False,
                "spoken": (f"I asked Safari to open {name}." if ok else f"Safari didn't open {name}.")}
    if hit is None:
        names = sorted((bundles if bundles is not None else _bundles()).keys())
        close = difflib.get_close_matches(raw, names, n=3, cutoff=0.5)
        return {"ok": False, "tool": "apps", "task_verified": False,
                "spoken": f"I couldn't find an app called {raw} on your Mac." + (f" Closest: {', '.join(close)}." if close else "")}
    app, path = hit
    quit_ = verb in ("quit", "close", "ferme", "fermer", "quitte", "quitter")
    # Privacy audit 2026-10-16: the bundle name is passed as an argument, never pasted into AppleScript source (a folder
    # named with a quote and a newline could run "do shell script").
    cmd = (["osascript", "-e", "on run argv", "-e", "tell application (item 1 of argv) to quit", "-e", "end run", app]
           if quit_ else ["open", "-a", str(path)])
    if runner is None and not _live():
        return {"ok": False, "tool": "apps", "app": app, "path": str(path), "outcome": "NOT_EXECUTED", "execution_status": "NOT_EXECUTED", "executed": False,
                "task_verified": False, "spoken": f"Nothing was {'quit' if quit_ else 'opened'}: app control only runs on the Mac."}
    run_fn = runner or (lambda c: subprocess.run(c, capture_output=True, text=True, timeout=15))
    try:
        cp = run_fn(cmd)
        launched, err = cp.returncode == 0, (cp.stderr or cp.stdout or "").strip()[:160]
        stdout, stderr = (cp.stdout or "").strip()[:300], (cp.stderr or "").strip()[:300]
    except (OSError, subprocess.TimeoutExpired) as exc:
        launched, err, stdout, stderr = False, type(exc).__name__, "", type(exc).__name__
    if not launched:
        return {"ok": False, "tool": "apps", "app": app, "executed": True, "execution_status": "FAILED", "command_ok": False,
                "stdout": stdout, "stderr": stderr, "task_verified": False,
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
    return {"ok": True, "tool": "apps", "app": app, "path": str(path), "executed": True, "execution_status": "EXECUTED", "command_ok": True,
            "stdout": stdout, "stderr": stderr, "observed_running": state, "waiting_owner": quit_ and state is True, "task_verified": verified, "spoken": spoken}
