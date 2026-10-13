#!/usr/bin/env python3
"""Safari + screen on this Mac. Not Chrome. Not Playwright.

  python3 apps/agent-stack/hands/see.py safari
  python3 apps/agent-stack/hands/see.py grab [--hive PATH]
  python3 apps/agent-stack/hands/see.py open https://example.com
"""
from __future__ import annotations

import argparse
import ctypes
import hashlib
import math
import ctypes.util
import importlib.util
import json
import os
import re
import secrets
import threading
import subprocess
import stat
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
SEE_NAME = "see.jpg"
HTTP_RE = re.compile(r"^https?://", re.I)
HARD_CLICK = re.compile(
    r"\b("
    r"send|pay|deploy|book|publish|checkout|buy now|place order|"
    r"confirm purchase|submit payment|transfer|blue button"
    r")\b",
    re.I,
)
BEFORE_HID = None
YOUTUBE_HOME = "https://www.youtube.com"
WATCH_LATER_URL = "https://www.youtube.com/playlist?list=WL"
OPEN_RE = re.compile(r"\bopen\s+(https?://\S+)", re.I)
YOUTUBE_OPEN_RE = re.compile(
    r"\b(?:(?:go\s+(?:on|to)|open)\s+(?:the\s+)?)?youtube\b",
    re.I,
)
WATCH_LATER_ACT_RE = re.compile(r"\bwatch later\b", re.I)
SCREEN_GRAB_RE = re.compile(
    r"\b("
    r"screenshot|screen\s*shot|screen\s*grab|"
    r"take a (?:screen\s*)?shot|"
    r"grab (?:the |my )?(?:screen|safari|front tab)|"
    r"share (?:me )?(?:my )?screen"
    r")\b",
    re.I,
)
CLICK_RE = re.compile(r"\b(?:click|tap|press)\s+(?:the\s+)?(.+?)(?:\s+button|\s+link)?\s*$", re.I)
TYPE_RE = re.compile(r"\b(?:type|enter|fill)\s+(.+)$", re.I)
SCROLL_RE = re.compile(r"\bscroll\b", re.I)
TABS_RE = re.compile(r"\b(tabs|what(?:'s|s| is) open in safari)\b", re.I)
WAKE_RE = re.compile(r"^(?:hey\s+|hi\s+|hello\s+|yo\s+)?(?:jarvis[,.\s]+)?", re.I)
FACE_URL_RE = re.compile(r"127\.0\.0\.1:4018", re.I)
KEY_PAGE_DOWN = 121
KEY_PAGE_UP = 116
VK_PAGE_DOWN = 0x79
VK_PAGE_UP = 0x74


def _run(argv: list[str], timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, capture_output=True, text=True, timeout=timeout)


def safari_front(*, timeout: float = 12.0) -> dict:
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"NONE\"\n"
        "  set t to current tab of front window\n"
        '  return (name of t) & "\\n" & (URL of t)\n'
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=timeout)
    except subprocess.TimeoutExpired as exc:
        return {"ok": False, "wire": "safari", "spoken": "Safari did not respond in time. The current tab is not verified.", "diagnostic": {"kind": "timeout", "operation": "safari_front", "timeout_seconds": exc.timeout}}
    except OSError as exc:
        return {"ok": False, "wire": "safari", "spoken": "Safari could not be read. The current tab is not verified.", "diagnostic": {"kind": "os_error", "operation": "safari_front", "errno": exc.errno}}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Safari not allowed").strip()[:180]
        return {
            "ok": False,
            "wire": "safari",
            "spoken": f"UNKNOWN. Safari is dark. Allow Terminal to control Safari. {err}",
        }
    raw = (proc.stdout or "").rstrip("\r\n")
    if not raw or raw == "NONE":
        return {"ok": True, "wire": "safari", "open": False, "spoken": "Safari has no window.", "title": "", "url": ""}
    title, _, url = raw.partition("\n")
    title = title.strip()
    url = url.strip()
    spoken = f"The front tab is {title or 'untitled'}."
    return {"ok": True, "wire": "safari", "open": True, "title": title, "url": url, "spoken": spoken}


def safari_activate() -> dict:
    """Bring Safari forward. Does not navigate. Dry Watch skips."""
    if _dry_mac():
        return {"ok": True, "dry": True, "wire": "safari", "spoken": "Watch dry. Safari stay."}
    script = 'tell application "Safari" to activate\n'
    try:
        proc = _run(["osascript", "-e", script], timeout=4.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari activate failed: {exc}."}
    if proc.returncode != 0:
        err = (proc.stderr or "").strip()[:160]
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari activate failed. {err}"}
    return {"ok": True, "wire": "safari", "spoken": "Safari is front."}


POLL_SEC = 0.5
_PLACEHOLDER_TITLE = re.compile(r"^(untitled|sans titre|loading|chargement|sin t[ií]tulo|ohne titel)\W*$|^https?://", re.I)
MAX_READS = 8  # bounded tab reads after one open (never re-opens)


def same_page(wanted: str, seen: str) -> bool:
    """Same scheme-agnostic host (www. ignored) and path (trailing slash ignored); query must match if one was asked."""
    import urllib.parse as up
    a, b = up.urlparse((wanted or "").strip()), up.urlparse((seen or "").strip())
    host = lambda u: (u.hostname or "").lower().removeprefix("www.")
    path = lambda u: (u.path or "/").rstrip("/") or "/"
    if not host(a) or host(a) != host(b) or path(a) != path(b):
        return False
    return not a.query or a.query == b.query


def safari_open(url: str) -> dict:
    target = (url or "").strip()
    if not HTTP_RE.match(target):
        return {"ok": False, "wire": "safari", "spoken": "UNKNOWN. Safari open only takes http or https."}
    script = f'tell application "Safari"\n  activate\n  open location {json.dumps(target)}\nend tell\n'
    try:
        proc = _run(["osascript", "-e", script])
    except subprocess.TimeoutExpired as exc:
        # The browser may have applied the command before its reply stalled.
        # Read back the postcondition once; never duplicate the navigation.
        observed = safari_front(timeout=2.0)
        actual = str(observed.get("url") or "")
        passed = observed.get("ok") is True and observed.get("open") is True and same_page(target, actual)
        return {"ok": passed, "wire": "safari", "spoken": f"Safari URL verified: {actual}" if passed else "Safari navigation timed out. The requested URL is not verified.", "verification": {"scope": "navigation_url", "passed": passed, "expected": target, "observed": actual}, "diagnostic": {"kind": "timeout", "operation": "safari_open", "timeout_seconds": exc.timeout, "recovery": "url_readback"}}
    except OSError as exc:
        return {"ok": False, "wire": "safari", "spoken": "Safari navigation could not start. The requested URL is not verified.", "diagnostic": {"kind": "os_error", "operation": "safari_open", "errno": exc.errno}}
    if proc.returncode != 0:
        err = (proc.stderr or "").strip()[:160]
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari open failed. {err}"}
    deadline = time.monotonic() + 12.0
    actual, title = "", ""
    passed = False
    for _ in range(MAX_READS):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            break
        observed = safari_front(timeout=min(remaining, 4.0))
        actual = str(observed.get("url") or "").strip()
        title = str(observed.get("title") or "").strip()
        passed = observed.get("ok") is True and observed.get("open") is True and same_page(target, actual)
        if passed and ("title" not in observed or (title and not _PLACEHOLDER_TITLE.match(title))):
            break
        if observed.get("ok") is not True:
            break
        time.sleep(POLL_SEC)
    return {
        "ok": passed, "wire": "safari", "url": actual, "requested_url": target, "title": title if passed else "",
        "spoken": (f"Safari URL verified: {actual}. The page title is: {title or 'untitled'}." if passed
                   else "Navigation requested, but the requested Safari URL is not yet verified."),
        "verification": {"scope": "navigation_url", "passed": passed, "expected": target, "observed": actual},
    }


def safari_tabs() -> dict:
    """List front Safari tabs. Uses the logged-in Safari. Cap 8."""
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"NONE\"\n"
        "  set bits to {}\n"
        "  repeat with w in windows\n"
        "    repeat with t in tabs of w\n"
        '      set end of bits to (name of t as text) & " | " & (URL of t as text)\n'
        "    end repeat\n"
        "  end repeat\n"
        "  if (count of bits) is 0 then return \"NONE\"\n"
        "  set AppleScript's text item delimiters to linefeed\n"
        "  return bits as text\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=8.0)
    except subprocess.TimeoutExpired as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "tabs": [], "spoken": "Safari did not respond in time. Its tabs are not verified.", "diagnostic": {"kind": "timeout", "operation": "safari_tabs", "timeout_seconds": exc.timeout}}
    except OSError as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "tabs": [], "spoken": "Safari could not be read. Its tabs are not verified.", "diagnostic": {"kind": "os_error", "operation": "safari_tabs", "errno": exc.errno}}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Safari not allowed").strip()[:160]
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "tabs": [],
            "spoken": f"UNKNOWN. Safari is dark. Allow Terminal to control Safari. {err}",
        }
    raw = (proc.stdout or "").strip()
    if not raw or raw == "NONE":
        return {"ok": True, "wire": "safari", "tabs": [], "spoken": "Safari has no tabs."}
    tabs = [ln.strip() for ln in raw.splitlines() if ln.strip()][:8]
    spoken = "Safari tabs: " + "; ".join(tabs[:4])
    if len(tabs) > 4:
        spoken += f". Plus {len(tabs) - 4} more."
    else:
        spoken += "."
    return {"ok": True, "unknown": False, "wire": "safari", "tabs": tabs, "spoken": spoken}


def safari_js(js: str, *, timeout: float = 8.0) -> dict:
    """Run JavaScript in the front Safari tab. Same session, same logins. Not Chrome."""
    body = (js or "").strip()
    if not body:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Safari JS was empty."}
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"__JARVIS_NO_SAFARI_WINDOW__\"\n"
        f"  set r to do JavaScript {json.dumps(body)} in current tab of front window\n"
        "  if r is missing value then return \"OK\"\n"
        "  return r as text\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=timeout)
    except subprocess.TimeoutExpired as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "Safari's page action timed out. Its outcome is unknown; completion is not verified.", "diagnostic": {"kind": "timeout", "operation": "safari_js", "timeout_seconds": exc.timeout, "action_outcome": "unknown"}}
    except OSError as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "Safari's page action could not be observed. Completion is not verified.", "diagnostic": {"kind": "os_error", "operation": "safari_js", "errno": exc.errno, "action_outcome": "unknown"}}
    if proc.returncode != 0:
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": "Safari could not run the page action. Completion is not verified.",
            "diagnostic": {"kind": "execution_error", "operation": "safari_js", "exit_code": proc.returncode, "action_outcome": "unknown"},
        }
    raw = (proc.stdout or "").strip() or "OK"
    if raw == "__JARVIS_NO_SAFARI_WINDOW__":
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Safari has no window."}
    return {"ok": True, "unknown": False, "wire": "safari", "result": raw, "spoken": f"Safari did it. {raw}"[:240]}


def verify_download_hash(path: Path, expected_sha256: str) -> dict:
    """Independent filesystem observation; never trust the browser's success text."""
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, 'rb') as stream:
        before = os.fstat(stream.fileno())
        if not stat.S_ISREG(before.st_mode):
            return {"passed": False}
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        after = os.fstat(stream.fileno())
        named = path.stat(follow_symlinks=False)
        identity = lambda row: (row.st_dev, row.st_ino, row.st_size, row.st_mtime_ns)
        stable = identity(before) == identity(after) == identity(named)
    return {"passed": stable and digest == expected_sha256.lower(), "sha256": digest, "expected_sha256": expected_sha256.lower(), "bytes": after.st_size, "stable": stable, "verifier": "filesystem_sha256"}


def safari_click(label: str, *, expected_file: str = "", expected_sha256: str = "", expected_url: str = "", cancelled=None) -> dict:
    target = (label or "").strip()
    if not target:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Say what to click in Safari."}
    if HARD_CLICK.search(target):
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": "I will not click send, pay, deploy, book, or publish. That stay with you.",
        }
    if expected_sha256 and (not expected_file or not re.fullmatch(r"[0-9a-fA-F]{64}", expected_sha256)):
        return {"ok": False, "wire": "safari", "spoken": "A valid expected filename and SHA256 are required before verification."}
    expected = None
    if expected_file:
        if Path(expected_file).name != expected_file or expected_file in {".", ".."}:
            return {"ok": False, "wire": "safari", "spoken": "Expected download must be a filename."}
        expected = Path.home() / "Downloads" / expected_file
        if expected.exists():
            return {"ok": False, "wire": "safari", "spoken": "The expected file already exists. A new download cannot be verified."}
    def stopped(action_issued=False):
        if cancelled is None:
            return None
        try:
            is_stopped = cancelled() is True
        except (OSError, ValueError, TypeError):
            is_stopped = True
        if not is_stopped:
            return None
        return {"ok": False, "wire": "safari", "spoken": "Stopped before clicking." if not action_issued else "Stopped verification after clicking. The download may still finish; completion is not verified.", "diagnostic": {"kind": "cancelled", "action_issued": action_issued}}
    stop = stopped()
    if stop:
        return stop
    state_js = "JSON.stringify({url:location.href,origin:performance.timeOrigin,targets:Array.from(document.querySelectorAll('a,button,input,[role=button],label')).map(n=>{let r=n.getBoundingClientRect();let style=getComputedStyle(n);return [n.innerText||n.value||n.getAttribute('aria-label')||'',n.getAttribute('href')||'',r.x,r.y,r.width,r.height,!!n.disabled,n.getAttribute('aria-disabled')||'',style.visibility,style.display];})})"
    observed_at = time.monotonic()
    observed_wall = time.time()
    observation = safari_js(state_js)
    observed_state = str(observation.get("result") or "")
    try:
        state = json.loads(observed_state)
        valid_state = isinstance(state, dict) and isinstance(state.get("targets"), list) and isinstance(state.get("url"), str) and isinstance(state.get("origin"), (int, float))
    except (TypeError, ValueError):
        valid_state = False
    if observation.get("ok") is not True or not valid_state:
        return {"ok": False, "wire": "safari", "spoken": "The browser target could not be freshly observed. No click was performed."}
    readiness_attempts = 0
    readiness_timeouts = 0
    if expected_url and state["url"] == "about:blank":
        # Safari URL readback can precede creation of the loaded document.
        # Retry observation only while browser ownership still matches the request.
        deadline = time.monotonic() + 2.0
        for _ in range(4):
            stop = stopped()
            if stop:
                return stop
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            readiness_attempts += 1
            front = safari_front(timeout=min(0.5, remaining))
            if front.get("ok") is not True:
                if (front.get("diagnostic") or {}).get("kind") == "timeout":
                    readiness_timeouts += 1
                    time.sleep(min(0.15, max(0, deadline - time.monotonic())))
                    continue
                break
            if front.get("url") != expected_url:
                return {"ok": False, "wire": "safari", "spoken": "The active browser page changed. No click was performed.", "diagnostic": {"kind": "stale_page", "expected_url": expected_url, "observed_url": front.get("url"), "action_issued": False}}
            if time.monotonic() >= deadline:
                break
            time.sleep(min(0.15, max(0, deadline - time.monotonic())))
            observed_at = time.monotonic()
            if observed_at >= deadline:
                break
            observed_wall = time.time()
            retry = safari_js(state_js, timeout=deadline - observed_at)
            try:
                refreshed = json.loads(str(retry.get("result") or ""))
                if retry.get("ok") is not True or not isinstance(refreshed, dict) or not isinstance(refreshed.get("targets"), list) or not isinstance(refreshed.get("url"), str) or not isinstance(refreshed.get("origin"), (int, float)):
                    break
                state = refreshed
                observed_state = str(retry["result"])
            except (ValueError, TypeError):
                break
            if state.get("url") != "about:blank":
                break
    if expected_url and state["url"] == "about:blank":
        return {"ok": False, "wire": "safari", "spoken": "Safari has not produced a verifiable page yet. No click was performed.", "diagnostic": {"kind": "document_not_ready", "expected_url": expected_url, "observed_url": state["url"], "action_issued": False, "attempts": readiness_attempts, "url_read_timeouts": readiness_timeouts}}
    if expected_url and state["url"] != expected_url:
        return {"ok": False, "wire": "safari", "spoken": "The active browser page changed. No click was performed.", "diagnostic": {"kind": "stale_page", "expected_url": expected_url, "observed_url": state["url"]}}
    if time.monotonic() - observed_at > 8.0:
        return {"ok": False, "wire": "safari", "spoken": "The browser observation expired. Observe again before clicking.", "diagnostic": {"kind": "stale_observation"}}
    js = (
        "(function(){if(Date.now()>%d||(%s)!==%s)return 'STALE';var t=%s;var nodes=Array.prototype.slice.call("
        "document.querySelectorAll('a,button,input,[role=button],label'));"
        "function norm(s){return (s+'').trim().replace(/\\s+/g,' ').toLowerCase();}"
        "var matches=nodes.filter(function(n){var r=n.getBoundingClientRect();var style=getComputedStyle(n);"
        "if(n.disabled||n.getAttribute('aria-disabled')==='true'||r.width<=0||r.height<=0||style.visibility==='hidden'||style.display==='none')return false;"
        "return norm(n.innerText||n.value||n.getAttribute('aria-label')||'')===norm(t);});"
        "if(!matches.length)return 'NONE';if(matches.length!==1)return 'AMBIGUOUS';"
        "matches[0].click();return 'OK '+t;})()"
        % (int((observed_wall + 8.0) * 1000), state_js, json.dumps(observed_state), json.dumps(target.lower()))
    )
    stop = stopped()
    if stop:
        return stop
    got = safari_js(js)
    observation_ref = {"url": state["url"], "document_origin": state["origin"], "state_hash": hashlib.sha256(observed_state.encode()).hexdigest(), "captured_at": time.time() - (time.monotonic() - observed_at)}
    if readiness_attempts:
        observation_ref["readiness"] = {"attempts": readiness_attempts, "url_read_timeouts": readiness_timeouts}
    got["observation"] = observation_ref
    if got.get("result") == "STALE":
        return {"ok": False, "wire": "safari", "spoken": "The page or target changed after observation. No click was performed. Observe again.", "diagnostic": {"kind": "stale_observation"}, "observation": observation_ref}
    if got.get("result") == "AMBIGUOUS":
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": f"More than one visible control matches {target}. No click was performed.", "diagnostic": {"kind": "ambiguous_target"}, "observation": observation_ref}
    if got.get("result") == "NONE":
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": f"UNKNOWN. Safari found no control named {target}. I will not invent a click.",
            "diagnostic": {"kind": "missing_target", "action_issued": False},
            "observation": observation_ref,
        }
    if got.get("ok") is True and got.get("result") != "OK " + target.lower():
        return {"ok": False, "wire": "safari", "spoken": "The browser did not confirm the bound click. The action is not verified.", "observation": observation_ref}
    if got.get("ok"):
        got["spoken"] = f"Clicked {target} in Safari."
        got["verification"] = {"scope": "click_dispatch", "passed": True, "task_verified": False}
        if expected is not None:
            observed = None
            for attempt in range(33):
                stop = stopped(action_issued=True)
                if stop:
                    return {**stop, "observation": observation_ref}
                try:
                    if expected.is_file() and not expected.is_symlink():
                        stat = expected.stat()
                        if observed == (stat.st_size, stat.st_mtime_ns):
                            if expected_sha256:
                                proof = verify_download_hash(expected, expected_sha256)
                                got["verification"] = {"scope": "download_content_sha256", "filename": expected_file, **proof}
                                if proof.get("passed") is True:
                                    got["spoken"] = f"Downloaded {expected_file}. Its SHA256 matches the expected content."
                                    return got
                                time.sleep(0.25)
                                continue
                            got["verification"] = {"scope": "download_file_created", "passed": True, "filename": expected_file, "bytes": stat.st_size}
                            got["spoken"] = f"Downloaded {expected_file}. The new file is verified in Downloads."
                            return got
                        observed = (stat.st_size, stat.st_mtime_ns)
                except OSError:
                    observed = None
                if attempt < 32:
                    time.sleep(0.25)
            got["ok"] = False
            if not expected_sha256 or not isinstance(got.get("verification"), dict) or got["verification"].get("scope") != "download_content_sha256":
                got["verification"] = {"scope": "download_content_sha256" if expected_sha256 else "download_file_created", "passed": False, "filename": expected_file}
            proof = got.get("verification") or {}
            got["spoken"] = f"The downloaded {expected_file} does not match the expected SHA256." if proof.get("sha256") and proof.get("stable") else f"Clicked {target}, but the expected download is not verified."
    return got


def safari_type(text: str) -> dict:
    value = (text or "").strip()
    if not value:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Say what to type in Safari."}
    if HARD_CLICK.search(value) and re.search(r"\b(send|pay|deploy|publish)\b", value, re.I):
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": "I will not type a send or pay action. That stay with you.",
        }
    js = (
        "(function(){var v=%s;var el=document.activeElement;"
        "if(!el||!('value' in el)){"
        "el=document.querySelector('input:not([type=hidden]),textarea,[contenteditable=true]');}"
        "if(!el)return 'NONE';"
        "if('value' in el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));}"
        "else{el.textContent=v;}return 'OK';})()"
        % json.dumps(value[:500])
    )
    got = safari_js(js)
    if got.get("result") == "NONE":
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": "UNKNOWN. Safari has no field to type into.",
        }
    if got.get("ok"):
        got["spoken"] = "Typed in the front Safari field."
    return got


def ask_plain(utterance: str) -> str:
    text = WAKE_RE.sub("", (utterance or "").strip(), count=1).strip(" .,!")
    return text or "do that"


def wants_url(utterance: str) -> bool:
    """Real URL only when he asked where, or to open a page."""
    return bool(
        re.search(
            r"\b(where|url|open|go (?:on|to)|watch later|youtube|https?://)\b",
            utterance or "",
            re.I,
        )
    )


def safari_line(utterance: str, did: str, *, title: str = "", url: str = "") -> str:
    """What he asked + the human result. Real URL only if he asked where / to open."""
    ask = ask_plain(utterance)
    action = (did or "").strip().rstrip(".")
    action = re.sub(r"Safari scrolled \w+ with (?:page keys|JavaScript)", "I scrolled the tab", action, flags=re.I)
    action = re.sub(r"Safari grabbed the front tab(?: at \S+)?", "I grabbed the front tab", action, flags=re.I)
    action = re.sub(r"\b(?:cgevent|osascript|apple events?|page keys)\b", "", action, flags=re.I)
    action = re.sub(r"\s+", " ", action).strip(" .")
    parts = [f"You asked to {ask}."]
    if action:
        parts.append(action + ".")
    clean_url = (url or "").strip()
    clean_title = (title or "").strip()
    if FACE_URL_RE.search(clean_url) or (clean_title and clean_title.lower() in {"j.a.r.v.i.s."}):
        clean_url = ""
        clean_title = ""
    if wants_url(utterance) and clean_url and clean_url not in action:
        if clean_title and clean_title.lower() not in {"untitled", "sans titre", "j.a.r.v.i.s."}:
            parts.append(f"{clean_title}. {clean_url}")
        else:
            parts.append(clean_url)
    return " ".join(parts)


def _cgevent_page(direction: str = "down") -> dict:
    """HID page keys from this Python. Not osascript keystrokes. Not Safari JS."""
    way = "up" if str(direction or "").lower() == "up" else "down"
    vk = VK_PAGE_UP if way == "up" else VK_PAGE_DOWN
    lib_path = ctypes.util.find_library("ApplicationServices") or (
        "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"
    )
    lib = ctypes.CDLL(lib_path)
    event_ref = ctypes.c_void_p
    source_ref = ctypes.c_void_p
    lib.CGEventSourceCreate.argtypes = [ctypes.c_uint32]
    lib.CGEventSourceCreate.restype = source_ref
    lib.CGEventCreateKeyboardEvent.argtypes = [source_ref, ctypes.c_uint16, ctypes.c_bool]
    lib.CGEventCreateKeyboardEvent.restype = event_ref
    lib.CGEventPost.argtypes = [ctypes.c_uint32, event_ref]
    lib.CGEventPost.restype = None
    lib.CFRelease.argtypes = [ctypes.c_void_p]
    try:
        _run(["osascript", "-e", 'tell application "Safari" to activate'], timeout=4.0)
    except (OSError, subprocess.TimeoutExpired):
        pass
    return _cgevent_page_keys(lib, vk, way)


def _cgevent_page_keys(lib, vk: int, way: str, *, gate=None) -> dict:
    event_ref = ctypes.c_void_p
    source_ref = ctypes.c_void_p
    lib.CGEventSourceCreate.argtypes = [ctypes.c_uint32]
    lib.CGEventSourceCreate.restype = source_ref
    lib.CGEventCreateKeyboardEvent.argtypes = [source_ref, ctypes.c_uint16, ctypes.c_bool]
    lib.CGEventCreateKeyboardEvent.restype = event_ref
    lib.CGEventPost.argtypes = [ctypes.c_uint32, event_ref]
    lib.CGEventPost.restype = None
    lib.CFRelease.argtypes = [ctypes.c_void_p]
    src = lib.CGEventSourceCreate(1)
    down = lib.CGEventCreateKeyboardEvent(src, vk, True)
    up = lib.CGEventCreateKeyboardEvent(src, vk, False)
    if not down or not up:
        if down:
            lib.CFRelease(down)
        if up:
            lib.CFRelease(up)
        if src:
            lib.CFRelease(src)
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "cgevent",
            "spoken": "UNKNOWN. Safari could not scroll.",
        }
    if gate is not None and not gate():
        lib.CFRelease(down)
        lib.CFRelease(up)
        if src:
            lib.CFRelease(src)
        return {"ok": False, "wire": "mac_act", "op": "stop", "spoken": "Stopped. Standing by."}
    lib.CGEventPost(0, down)
    lib.CGEventPost(0, up)
    lib.CFRelease(down)
    lib.CFRelease(up)
    if src:
        lib.CFRelease(src)
    return {
        "ok": True,
        "unknown": False,
        "wire": "safari",
        "path": "cgevent",
        "direction": way,
        "spoken": f"I scrolled the tab {way}",
    }


def safari_scroll_cgevent(direction: str = "down") -> dict:
    try:
        return _cgevent_page(direction)
    except (OSError, AttributeError, TypeError, ValueError) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "cgevent",
            "spoken": f"UNKNOWN. Safari could not scroll. {exc}.",
        }


def safari_scroll_keys(direction: str = "down") -> dict:
    """Page keys via System Events. No Safari JavaScript from Apple Events."""
    way = "up" if str(direction or "").lower() == "up" else "down"
    code = KEY_PAGE_UP if way == "up" else KEY_PAGE_DOWN
    script = (
        'tell application "Safari" to activate\n'
        "delay 0.15\n"
        'tell application "System Events"\n'
        '  if not (exists process "Safari") then return "NONE"\n'
        '  tell process "Safari"\n'
        "    set frontmost to true\n"
        f"    key code {code}\n"
        "  end tell\n"
        "end tell\n"
        'return "OK"\n'
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "keys",
            "spoken": f"UNKNOWN. Safari could not scroll. {exc}.",
        }
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "System Events not allowed").strip()[:180]
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "keys",
            "spoken": (
                "UNKNOWN. Safari could not scroll. Allow Accessibility for "
                f"Terminal. {err}"
            ),
        }
    raw = (proc.stdout or "").strip()
    if raw == "NONE":
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "keys",
            "spoken": "UNKNOWN. Safari is not running.",
        }
    return {
        "ok": True,
        "unknown": False,
        "wire": "safari",
        "path": "keys",
        "direction": way,
        "spoken": f"I scrolled the tab {way}",
    }


def safari_scroll(direction: str = "down") -> dict:
    """CGEvent page keys first. osascript keys, then JS, only if that is dark."""
    way = "up" if str(direction or "").lower() == "up" else "down"
    hid = safari_scroll_cgevent(way)
    if hid.get("ok"):
        return hid
    keys = safari_scroll_keys(way)
    if keys.get("ok"):
        return keys
    dy = -600 if way == "up" else 600
    got = safari_js(f"window.scrollBy(0,{dy}); 'OK';")
    if got.get("ok"):
        got["path"] = "js"
        got["direction"] = way
        got["spoken"] = f"I scrolled the tab {way}"
        return got
    return {
        "ok": False,
        "unknown": True,
        "wire": "safari",
        "path": "unknown",
        "cgevent": hid,
        "keys": keys,
        "js": got,
        "spoken": "UNKNOWN. Safari could not scroll.",
    }


def safari_extract_links() -> dict:
    """Read http(s) anchors from the front Safari tab. Do not invent URLs."""
    js = (
        "(function(){"
        "var nodes=Array.prototype.slice.call(document.querySelectorAll('a[href]'));"
        "var out=[],seen={};"
        "for(var i=0;i<nodes.length&&out.length<12;i++){"
        "var href=nodes[i].href||'';"
        "var t=((nodes[i].innerText||nodes[i].textContent||'')+'').replace(/\\s+/g,' ').trim().slice(0,80);"
        "if(!href||seen[href])continue;"
        "seen[href]=1;"
        "out.push(t+' | '+href);"
        "}"
        "return out.length?out.join('\\n'):'NONE';"
        "})()"
    )
    got = safari_js(js)
    if not got.get("ok"):
        return got
    raw = str(got.get("result") or "").strip()
    if raw in {"NONE", "OK", ""}:
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "raw": "",
            "spoken": "UNKNOWN. Front Safari tab listed no links.",
        }
    return {"ok": True, "unknown": False, "wire": "safari", "raw": raw, "spoken": "Safari listed links from the front tab."}


def safari_visible_titles() -> dict:
    """Visible YouTube-style titles on the front Safari tab. Empty means UNKNOWN."""
    js = (
        "(function(){"
        "var sel='a#video-title, ytd-playlist-video-renderer #video-title, ytd-video-renderer #video-title';"
        "var nodes=document.querySelectorAll(sel);"
        "var out=[],seen={};"
        "for(var i=0;i<nodes.length&&out.length<8;i++){"
        "var t=((nodes[i].innerText||nodes[i].getAttribute('title')||'')+'').replace(/\\s+/g,' ').trim();"
        "if(!t||t.length<2||seen[t])continue;"
        "seen[t]=1;"
        "out.push(t.slice(0,100));"
        "}"
        "return out.length?out.join('\\n'):'NONE';"
        "})()"
    )
    got = safari_js(js)
    if not got.get("ok"):
        return got
    raw = str(got.get("result") or "").strip()
    if raw in {"NONE", "OK", ""}:
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "titles": [],
            "spoken": "UNKNOWN. Front Safari tab listed no visible titles.",
        }
    titles = [ln.strip() for ln in raw.splitlines() if ln.strip()][:8]
    return {
        "ok": True,
        "unknown": False,
        "wire": "safari",
        "titles": titles,
        "raw": raw,
        "spoken": "Safari listed visible titles from the front tab.",
    }


def safari_act(utterance: str, hive: Path | None = None) -> dict:
    """Route a spoken Safari action onto the logged-in Safari. Not Chrome. Not Grok Bot."""
    text = (utterance or "").strip()
    dest = hive if hive is not None else HIVE
    if WATCH_LATER_ACT_RE.search(text):
        got = safari_open(WATCH_LATER_URL)
        if not got.get("ok"):
            return got
        got["spoken"] = safari_line(text, "Watch Later is open", url=got.get("url") or WATCH_LATER_URL)
        return got
    if YOUTUBE_OPEN_RE.search(text):
        got = safari_open(YOUTUBE_HOME)
        if not got.get("ok"):
            return got
        got["spoken"] = safari_line(text, "YouTube is open", url=got.get("url") or YOUTUBE_HOME)
        return got
    open_hit = OPEN_RE.search(text)
    if open_hit:
        target = open_hit.group(1).rstrip(".,)")
        got = safari_open(target)
        if not got.get("ok"):
            return got
        got["spoken"] = safari_line(text, "That page is open", url=got.get("url") or target)
        return got
    if SCREEN_GRAB_RE.search(text):
        got = snapshot(hive=dest, grab=True)
        safari = got.get("safari") if isinstance(got.get("safari"), dict) else {}
        screen = got.get("screen") if isinstance(got.get("screen"), dict) else {}
        got["spoken"] = safari_line(
            text,
            "I grabbed the front tab",
            title=str(safari.get("title") or ""),
            url=str(safari.get("url") or ""),
        )
        return got
    if TABS_RE.search(text) and not CLICK_RE.search(text):
        got = safari_tabs()
        got["spoken"] = safari_line(text, got.get("spoken") or "Safari listed tabs")
        return got
    click_hit = CLICK_RE.search(text)
    if click_hit:
        got = safari_click(click_hit.group(1).strip(" ."))
        got["spoken"] = safari_line(text, got.get("spoken") or "Safari clicked")
        return got
    if SCROLL_RE.search(text):
        got = safari_scroll("up" if re.search(r"\bup\b", text, re.I) else "down")
        front = safari_front() if got.get("ok") else {}
        got["spoken"] = safari_line(
            text,
            got.get("spoken") or "Safari tried to scroll",
            title=str(front.get("title") or ""),
            url=str(front.get("url") or ""),
        )
        return got
    type_hit = TYPE_RE.search(text)
    if type_hit:
        got = safari_type(type_hit.group(1).strip(" ."))
        got["spoken"] = safari_line(text, got.get("spoken") or "Safari typed")
        return got
    got = safari_front()
    got["spoken"] = safari_line(text, got.get("spoken") or "Safari front tab", title=got.get("title") or "", url=got.get("url") or "")
    return got


def safari_window_bounds() -> tuple[float, float, float, float] | None:
    """Safari window in global points (left, top, right, bottom). None if dark."""
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"NONE\"\n"
        "  set b to bounds of front window\n"
        '  return (item 1 of b as text) & "," & (item 2 of b as text) & "," '
        '& (item 3 of b as text) & "," & (item 4 of b as text)\n'
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=4.0)
    except (OSError, subprocess.TimeoutExpired):
        return None
    raw = (proc.stdout or "").strip()
    if proc.returncode != 0 or not raw or raw == "NONE":
        return None
    bits = [p.strip() for p in raw.replace("{", "").replace("}", "").split(",")]
    if len(bits) != 4:
        return None
    try:
        a, b, c, d = (float(bits[0]), float(bits[1]), float(bits[2]), float(bits[3]))
    except ValueError:
        return None
    # Safari/Finder bounds are left, top, right, bottom.
    if c > a and d > b and (c - a) >= 80 and (d - b) >= 80:
        return (a, b, c, d)
    if c >= 80 and d >= 80:
        return (a, b, a + c, b + d)
    return None


def grab_screen(hive: Path, bounds: tuple[float, float, float, float] | None = None) -> dict:
    dest = hive / "bus" / SEE_NAME
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    argv = ["screencapture", "-x", "-t", "jpg"]
    rect = None
    if bounds is not None and len(bounds) == 4:
        x0, y0, x1, y1 = (float(bounds[0]), float(bounds[1]), float(bounds[2]), float(bounds[3]))
        width = max(1.0, x1 - x0)
        height = max(1.0, y1 - y0)
        argv.extend(["-R", f"{int(x0)},{int(y0)},{int(width)},{int(height)}"])
        rect = {"x": x0, "y": y0, "w": width, "h": height}
    argv.append(str(dest))
    try:
        proc = _run(argv, timeout=20.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "see", "spoken": f"UNKNOWN. Screen grab failed: {exc}."}
    if proc.returncode != 0 or not dest.is_file():
        err = (proc.stderr or proc.stdout or "no file").strip()[:160]
        return {
            "ok": False,
            "wire": "see",
            "spoken": (
                "UNKNOWN. Screen grab is dark. Allow Screen Recording for "
                f"Terminal. {err}"
            ),
        }
    out = {
        "ok": True,
        "wire": "see",
        "path": str(dest),
        "bytes": dest.stat().st_size,
        "spoken": "I grabbed the screen.",
    }
    if rect:
        out["frame_bounds"] = rect
    return out


def desktop_capture_bounds() -> tuple[float, float, float, float] | None:
    """Union of actual Quartz display rectangles; no guessed fallback."""
    class Size(ctypes.Structure):
        _fields_ = [("width", ctypes.c_double), ("height", ctypes.c_double)]
    class Rect(ctypes.Structure):
        _fields_ = [("origin", _CGPoint), ("size", Size)]
    try:
        lib = ctypes.CDLL(ctypes.util.find_library("ApplicationServices"))
        lib.CGGetActiveDisplayList.argtypes = [ctypes.c_uint32, ctypes.POINTER(ctypes.c_uint32), ctypes.POINTER(ctypes.c_uint32)]
        lib.CGGetActiveDisplayList.restype = ctypes.c_int32
        lib.CGDisplayBounds.argtypes = [ctypes.c_uint32]
        lib.CGDisplayBounds.restype = Rect
        displays = (ctypes.c_uint32 * 32)()
        count = ctypes.c_uint32()
        if lib.CGGetActiveDisplayList(32, displays, ctypes.byref(count)) or not count.value:
            return None
        rects = [lib.CGDisplayBounds(displays[i]) for i in range(count.value)]
        if any(r.size.width <= 0 or r.size.height <= 0 for r in rects):
            return None
        return (min(r.origin.x for r in rects), min(r.origin.y for r in rects),
                max(r.origin.x + r.size.width for r in rects),
                max(r.origin.y + r.size.height for r in rects))
    except (OSError, AttributeError, TypeError):
        return None


def snapshot(*, hive: Path, grab: bool) -> dict:
    safari = safari_front()
    app = frontmost_app()
    screen = None
    def invalid(kind: str, spoken: str) -> dict:
        rejected = {**screen, "frame_id": "", "state": {}} if isinstance(screen, dict) else screen
        return {"ok": False, "wire": "see", "safari": safari, "screen": rejected,
                "frame_id": "", "state": {}, "spoken": spoken,
                "diagnostic": {"kind": kind, "action_frame_valid": False}}
    foreground = str(app.get("app") or "").strip()
    if not app.get("ok") or not foreground:
        return invalid("foreground_unavailable", "I couldn't identify the foreground app. No action frame was captured.")
    safari_foreground = foreground.lower() == "safari"
    if safari_foreground and not safari.get("ok"):
        return invalid("safari_observation_unavailable", "I couldn't observe the foreground Safari window. No action frame was captured.")
    box = safari_window_bounds() if safari_foreground and safari.get("open") else desktop_capture_bounds()
    if grab and box is None:
        return {"ok": False, "wire": "see", "frame_id": "", "state": {},
                "spoken": "Display capture geometry is unavailable. No action frame was captured."}
    captured_tab = safari if safari_foreground else {}
    text_binding = _watch_policy().text_state_fingerprint(read_focused_text(app.get("focus"))) if grab else None
    screen = grab_screen(hive, bounds=box) if grab else None
    if grab:
        if not isinstance(screen, dict) or not screen.get("ok") or not screen.get("path"):
            return invalid("capture_unavailable", "I couldn't capture the foreground app. No action frame is available.")
        try:
            image = Path(str(screen["path"]))
            if not image.is_file() or image.stat().st_size <= 0:
                return invalid("capture_unavailable", "The screen capture is missing or empty. No action frame is available.")
        except OSError:
            return invalid("capture_unavailable", "I couldn't read the screen capture. No action frame is available.")
        after = frontmost_app()
        if (not after.get("ok") or str(after.get("app") or "").strip().lower() != foreground.lower()
                or after.get("focus") != app.get("focus")):
            return invalid("foreground_changed", "The foreground app changed during capture. I need a fresh observation.")
        if text_binding != _watch_policy().text_state_fingerprint(read_focused_text(after.get("focus"))):
            return invalid("field_changed", "The field value or selection changed during capture. I need a fresh observation.")
    lines = [safari.get("spoken") or "Safari unknown."] if safari_foreground else []
    if screen:
        lines.append(screen.get("spoken") or "Screen unknown.")
    frame = ""
    state = {}
    if screen and screen.get("path"):
        try:
            from hands.watch_frame import stamp_see
        except ImportError:
            spec = importlib.util.spec_from_file_location(
                "agent_stack_watch_frame_snap",
                Path(__file__).resolve().parent / "watch_frame.py",
            )
            stamp_see = None
            if spec is not None and spec.loader is not None:
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                stamp_see = getattr(mod, "stamp_see", None)
        if stamp_see is not None:
            row = stamp_see(
                Path(str(screen.get("path"))),
                safari=captured_tab,
                app=str((app or {}).get("app") or ""),
                window=str(captured_tab.get("title") or ""),
                focus=app.get("focus"),
                text_binding=text_binding,
            )
            if not row.get("bytes"):
                return invalid("capture_unavailable", "The screen capture became unavailable. I need a fresh observation.")
            frame = str(row.get("frame_id") or "")
            state = row.get("state") if isinstance(row.get("state"), dict) else {}
            if screen.get("frame_bounds"):
                state = {**state, "frame_bounds": screen.get("frame_bounds")}
            screen = {**screen, "frame_id": frame, "state": state}
    return {
        "ok": bool(app.get("ok")) and (not safari_foreground or bool(safari.get("ok"))) and (not grab or bool(frame)),
        "wire": "see",
        "safari": safari,
        "screen": screen,
        "frame_id": frame,
        "state": state,
        "spoken": " ".join(lines),
    }


def _dry_mac() -> bool:
    return os.environ.get("AGENT_STACK_DRY_WATCH") == "1" or os.environ.get("AGENT_STACK_DRY_MAC") == "1"


_AX_FOCUS_TTL = 60.0
_AX_FOCUS_LIMIT = 128


def _ax_library():
    lib = ctypes.CDLL(ctypes.util.find_library("ApplicationServices"))
    for name, args, result in (
        ("AXUIElementCreateSystemWide", [], ctypes.c_void_p),
        ("AXUIElementCopyAttributeValue", [ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)], ctypes.c_int32),
        ("AXUIElementGetPid", [ctypes.c_void_p, ctypes.POINTER(ctypes.c_int)], ctypes.c_int32),
        ("AXUIElementGetTypeID", [], ctypes.c_ulong),
        ("CFGetTypeID", [ctypes.c_void_p], ctypes.c_ulong),
        ("CFStringGetTypeID", [], ctypes.c_ulong),
        ("CFStringGetLength", [ctypes.c_void_p], ctypes.c_long),
        ("CFStringGetCharacters", [ctypes.c_void_p, _CFRange, ctypes.POINTER(ctypes.c_uint16)], None),
        ("AXValueGetType", [ctypes.c_void_p], ctypes.c_int32),
        ("AXValueGetValue", [ctypes.c_void_p, ctypes.c_int32, ctypes.c_void_p], ctypes.c_bool),
        ("CFStringCreateWithCharacters", [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint16), ctypes.c_long], ctypes.c_void_p),
        ("AXUIElementIsAttributeSettable", [ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_bool)], ctypes.c_int32),
        ("AXUIElementSetAttributeValue", [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p], ctypes.c_int32),
        ("CFStringGetCString", [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_long, ctypes.c_uint32], ctypes.c_bool),
        ("CFStringCreateWithCString", [ctypes.c_void_p, ctypes.c_char_p, ctypes.c_uint32], ctypes.c_void_p),
        ("CFEqual", [ctypes.c_void_p, ctypes.c_void_p], ctypes.c_bool),
        ("CFRetain", [ctypes.c_void_p], ctypes.c_void_p),
        ("CFRelease", [ctypes.c_void_p], None),
        ("AXUIElementSetMessagingTimeout", [ctypes.c_void_p, ctypes.c_float], ctypes.c_int32),
    ):
        function = getattr(lib, name)
        function.argtypes, function.restype = args, result
    return lib


def _ax_copy(lib, element, attribute):
    key = lib.CFStringCreateWithCString(None, attribute.encode("utf-8"), 0x08000100)
    if not key:
        return None
    value = ctypes.c_void_p()
    try:
        error = lib.AXUIElementCopyAttributeValue(element, key, ctypes.byref(value))
        if error or not value.value:
            if value.value:
                lib.CFRelease(value.value)
            return None
        return value.value
    finally:
        lib.CFRelease(key)


def _ax_identity(lib, element, pid, kind):
    """Opaque process-local IDs for retained native objects, never titles/hashes.

    Shared across dynamic observer modules in this Face process. Restart/expiry
    loses the lease, requiring a new observation. CFEqual binds the actual AX
    object; a model-provided title or field label cannot fabricate its identity.
    """
    with _AX_FOCUS_LOCK:
        rows = getattr(threading, "_jarvis_ax_focus_refs", None)
        if rows is None:
            rows = []
            setattr(threading, "_jarvis_ax_focus_refs", rows)
        now = time.monotonic()
        for row in list(rows):
            if now - row["seen"] > _AX_FOCUS_TTL:
                rows.remove(row)
                row["lib"].CFRelease(row["ref"])
        for row in rows:
            if row["pid"] == pid and row["kind"] == kind and lib.CFEqual(row["ref"], element):
                row["seen"] = now
                return row["id"]
        while len(rows) >= _AX_FOCUS_LIMIT:
            old = rows.pop(0)
            old["lib"].CFRelease(old["ref"])
        token = secrets.token_hex(24)
        retained = lib.CFRetain(element)
        if not retained:
            return ""
        rows.append({"id": token, "ref": retained, "lib": lib, "pid": pid, "kind": kind, "seen": now})
        return token


def _native_focus(pid):
    refs = []
    try:
        lib = _ax_library()
        system = lib.AXUIElementCreateSystemWide()
        if not system:
            return {}
        refs.append(system)
        if lib.AXUIElementSetMessagingTimeout(system, 1.0):
            return {}
        application = _ax_copy(lib, system, "AXFocusedApplication")
        if not application:
            return {}
        refs.append(application)
        actual = ctypes.c_int()
        if lib.AXUIElementGetPid(application, ctypes.byref(actual)) or actual.value != pid:
            return {}
        window = _ax_copy(lib, application, "AXFocusedWindow")
        if not window:
            return {}
        refs.append(window)
        if lib.CFGetTypeID(window) != lib.AXUIElementGetTypeID():
            return {}
        window_id = _ax_identity(lib, window, pid, "window")
        if not window_id:
            return {}
        field = _ax_copy(lib, application, "AXFocusedUIElement")
        field_id = ""
        role = ""
        if field:
            refs.append(field)
            if lib.CFGetTypeID(field) == lib.AXUIElementGetTypeID():
                field_window = _ax_copy(lib, field, "AXWindow")
                if field_window:
                    refs.append(field_window)
                    if lib.CFGetTypeID(field_window) == lib.AXUIElementGetTypeID() and lib.CFEqual(window, field_window):
                        field_id = _ax_identity(lib, field, pid, "element")
                        value = _ax_copy(lib, field, "AXRole")
                        if value:
                            refs.append(value)
                            if lib.CFGetTypeID(value) == lib.CFStringGetTypeID():
                                buffer = ctypes.create_string_buffer(256)
                                if lib.CFStringGetCString(value, buffer, len(buffer), 0x08000100):
                                    role = buffer.value.decode("utf-8")
                        subrole = _ax_copy(lib, field, "AXSubrole")
                        if subrole:
                            refs.append(subrole)
                            if lib.CFGetTypeID(subrole) == lib.CFStringGetTypeID():
                                buffer = ctypes.create_string_buffer(256)
                                if lib.CFStringGetCString(subrole, buffer, len(buffer), 0x08000100) and buffer.value == b"AXSecureTextField":
                                    role = "AXSecureTextField"
        return {"pid": pid, "window": window_id, "element": field_id, "role": role}
    except (OSError, AttributeError, TypeError, ValueError):
        return {}
    finally:
        if refs:
            for reference in reversed(refs):
                lib.CFRelease(reference)


# Initialization is serialized across reloaded observer modules as well.
with threading._active_limbo_lock:
    if not hasattr(threading, "_jarvis_ax_focus_lock"):
        setattr(threading, "_jarvis_ax_focus_lock", threading.RLock())
    _AX_FOCUS_LOCK = getattr(threading, "_jarvis_ax_focus_lock")


def frontmost_app() -> dict:
    script = (
        'tell application "System Events"\n'
        "  if (count of application processes) is 0 then return \"NONE\"\n"
        "  set p to first application process whose frontmost is true\n"
        '  return (name of p) & linefeed & (unix id of p as text)\n'
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=4.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "mac_act", "spoken": f"UNKNOWN. Front app is dark. {exc}."}
    pieces = (proc.stdout or "").strip().rsplit("\n", 1)
    name = pieces[0]
    try:
        pid = int(pieces[1]) if len(pieces) == 2 else 0
    except ValueError:
        pid = 0
    if proc.returncode != 0 or not name or name == "NONE" or pid <= 0:
        return {"ok": False, "wire": "mac_act", "app": "", "spoken": "UNKNOWN. Front app is dark."}
    return {"ok": True, "wire": "mac_act", "app": name, "focus": _native_focus(pid), "spoken": f"Front app is {name}."}


def _screen_bounds() -> tuple[float, float, float, float]:
    script = 'tell application "Finder" to get bounds of window of desktop'
    try:
        proc = _run(["osascript", "-e", script], timeout=4.0)
    except (OSError, subprocess.TimeoutExpired):
        return (0.0, 0.0, 1440.0, 900.0)
    raw = (proc.stdout or "").strip()
    bits = [p.strip() for p in raw.replace("{", "").replace("}", "").split(",")]
    if len(bits) != 4:
        return (0.0, 0.0, 1440.0, 900.0)
    try:
        x0, y0, x1, y1 = (float(bits[0]), float(bits[1]), float(bits[2]), float(bits[3]))
    except ValueError:
        return (0.0, 0.0, 1440.0, 900.0)
    return (x0, y0, x1, y1)


def _frame_bounds_from_hive(hive: Path | None) -> tuple[float, float, float, float] | None:
    if hive is None:
        return None
    path = Path(hive) / "bus" / "state.json"
    if not path.is_file():
        return None
    try:
        bus = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
    screen = watch.get("screen") if isinstance(watch.get("screen"), dict) else {}
    state = watch.get("state") if isinstance(watch.get("state"), dict) else {}
    raw = state.get("frame_bounds") or screen.get("frame_bounds")
    if not isinstance(raw, dict):
        return None
    try:
        x = float(raw.get("x"))
        y = float(raw.get("y"))
        w = float(raw.get("w"))
        h = float(raw.get("h"))
    except (TypeError, ValueError):
        return None
    if w < 80 or h < 80:
        return None
    return (x, y, x + w, y + h)


def _map_point(
    x: float,
    y: float,
    bounds: tuple[float, float, float, float] | None = None,
) -> tuple[float, float]:
    x0, y0, x1, y1 = bounds if bounds is not None else _screen_bounds()
    width = max(1.0, x1 - x0)
    height = max(1.0, y1 - y0)
    if 0.0 <= x <= 1.0 and 0.0 <= y <= 1.0:
        img_x = x * width
        img_y = y * height
    else:
        img_x = x
        img_y = y
    # Screenshot and Quartz event coordinates both start at the top-left.
    return (x0 + img_x, y0 + img_y)


class _CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]


def mac_click(
    x: float,
    y: float,
    *,
    hive: Path | None = None,
    gen: int | None = None,
    gate=None,
    frame_bounds=None,
) -> dict:
    stopped = {
        "ok": False,
        "wire": "mac_act",
        "op": "stop",
        "spoken": "Stopped. Standing by.",
    }
    if hive is not None and not _mac_act_proven(hive=hive, gen=gen, gate=gate):
        return stopped
    hook = BEFORE_HID
    if hook is not None:
        hook()
    if hive is not None and not _mac_act_proven(hive=hive, gen=gen, gate=gate):
        return stopped
    if _dry_mac():
        return {"ok": True, "dry": True, "wire": "mac_act", "op": "click", "spoken": "Watch dry. click not sent."}
    bounds = None
    if isinstance(frame_bounds, dict):
        try:
            bx, by, bw, bh = (float(frame_bounds[k]) for k in ("x", "y", "w", "h"))
            if all(math.isfinite(v) for v in (bx, by, bw, bh, bx + bw, by + bh)) and bw >= 80 and bh >= 80:
                bounds = (bx, by, bx + bw, by + bh)
        except (TypeError, ValueError, KeyError):
            pass
    if bounds is None:
        return {"ok": False, "wire": "mac_act", "reason": "missing_capture_geometry",
                "action_issued": False,
                "spoken": "The screenshot has no verified display bounds. I did not click."}
    try:
        nx, ny = float(x), float(y)
    except (TypeError, ValueError):
        nx, ny = float("nan"), float("nan")
    if not (math.isfinite(nx) and math.isfinite(ny) and 0 <= nx <= 1 and 0 <= ny <= 1):
        return {"ok": False, "wire": "mac_act", "reason": "invalid_capture_target",
                "action_issued": False, "spoken": "The click target is outside the captured frame. I did not click."}
    px, py = _map_point(nx, ny, bounds)
    lib_path = ctypes.util.find_library("ApplicationServices") or (
        "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"
    )
    lib = ctypes.CDLL(lib_path)
    event_ref = ctypes.c_void_p
    lib.CGEventCreateMouseEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint32, _CGPoint, ctypes.c_uint32]
    lib.CGEventCreateMouseEvent.restype = event_ref
    lib.CGEventPost.argtypes = [ctypes.c_uint32, event_ref]
    lib.CGEventPost.restype = None
    lib.CFRelease.argtypes = [ctypes.c_void_p]
    loc = _CGPoint(px, py)
    down = lib.CGEventCreateMouseEvent(None, 1, loc, 0)
    up = lib.CGEventCreateMouseEvent(None, 2, loc, 0)
    if not down or not up:
        if down:
            lib.CFRelease(down)
        if up:
            lib.CFRelease(up)
        return {"ok": False, "wire": "mac_act", "spoken": "UNKNOWN. Mouse click is dark. Allow Accessibility."}
    if hive is not None and not _mac_act_proven(hive=hive, gen=gen, gate=gate):
        lib.CFRelease(down)
        lib.CFRelease(up)
        return stopped
    lib.CGEventPost(0, down)
    lib.CGEventPost(0, up)
    lib.CFRelease(down)
    lib.CFRelease(up)
    return {"ok": True, "wire": "mac_act", "op": "click", "spoken": "I clicked."}


def _borrow_ax_field(focus):
    if not isinstance(focus, dict):
        return None, None
    with _AX_FOCUS_LOCK:
        for row in getattr(threading, "_jarvis_ax_focus_refs", []):
            if (row["kind"] == "element" and row["id"] == focus.get("element")
                    and row["pid"] == focus.get("pid")
                    and time.monotonic() - row["seen"] <= _AX_FOCUS_TTL):
                lib = row["lib"]
                # Retained refs may predate an observer reload. Configure new
                # APIs on their owning library before passing native pointers.
                for name, args, result in (
                    ("CFStringGetLength", [ctypes.c_void_p], ctypes.c_long),
                    ("CFStringGetCharacters", [ctypes.c_void_p, _CFRange, ctypes.POINTER(ctypes.c_uint16)], None),
                    ("CFStringCreateWithCharacters", [ctypes.c_void_p, ctypes.POINTER(ctypes.c_uint16), ctypes.c_long], ctypes.c_void_p),
                    ("AXValueGetTypeID", [], ctypes.c_ulong),
                    ("AXValueGetType", [ctypes.c_void_p], ctypes.c_int32),
                    ("AXValueGetValue", [ctypes.c_void_p, ctypes.c_int32, ctypes.c_void_p], ctypes.c_bool),
                    ("AXUIElementIsAttributeSettable", [ctypes.c_void_p, ctypes.c_void_p, ctypes.POINTER(ctypes.c_bool)], ctypes.c_int32),
                    ("AXUIElementSetAttributeValue", [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_void_p], ctypes.c_int32),
                ):
                    function = getattr(lib, name)
                    function.argtypes, function.restype = args, result
                return lib, lib.CFRetain(row["ref"])
    return None, None


class _CFRange(ctypes.Structure):
    _fields_ = [("location", ctypes.c_long), ("length", ctypes.c_long)]


def read_focused_text(focus) -> dict | None:
    """Independent structured reread; raw field text is never a receipt/log."""
    if not isinstance(focus, dict) or focus.get("role") not in {"AXTextField", "AXTextArea", "AXComboBox"}:
        return None
    lib, field = _borrow_ax_field(focus)
    if not field:
        return None
    refs = [field]
    try:
        value = _ax_copy(lib, field, "AXValue")
        if not value:
            return None
        refs.append(value)
        if lib.CFGetTypeID(value) != lib.CFStringGetTypeID():
            return None
        length = lib.CFStringGetLength(value)
        if length < 0:
            return None
        buffer = (ctypes.c_uint16 * length)()
        lib.CFStringGetCharacters(value, _CFRange(0, length), buffer)
        text = bytes(buffer).decode("utf-16-le")
        selection = _ax_copy(lib, field, "AXSelectedTextRange")
        if not selection:
            return None
        refs.append(selection)
        selected = _CFRange()
        if (lib.CFGetTypeID(selection) != lib.AXValueGetTypeID()
                or lib.AXValueGetType(selection) != 4
                or not lib.AXValueGetValue(selection, 4, ctypes.byref(selected))):
            return None
        return {"value": text, "selection": {"location": selected.location, "length": selected.length}}
    except (OSError, AttributeError, TypeError, ValueError):
        return None
    finally:
        for reference in reversed(refs):
            lib.CFRelease(reference)


def _type_into_focused_field(body: str, *, hive: Path, gen: int, gate) -> dict:
    """Literal AXValue replacement on the observed object, never Return.

    Unsupported fields fail without synthetic keystroke fallback. Dispatch is
    still unverified until an independent field-value reread proves its result.
    """
    def no_input(reason):
        return {"ok": False, "wire": "mac_act", "op": "type", "action_issued": False,
                "reason": reason, "spoken": "I couldn't enter literal text in this field. Nothing was typed."}
    observed = frontmost_app()
    focus = observed.get("focus") if isinstance(observed, dict) else None
    if not isinstance(focus, dict):
        return no_input("field_identity_unavailable")
    lib, field = _borrow_ax_field(focus)
    if not field:
        return no_input("field_identity_expired")
    key = None
    value = None
    emitting = False
    try:
        before_text = read_focused_text(focus)
        expected_value = _watch_policy().expected_inserted_value(before_text, body)
        if expected_value is None:
            return no_input("field_text_state_unavailable")
        key = lib.CFStringCreateWithCString(None, b"AXValue", 0x08000100)
        editable = ctypes.c_bool()
        if not key or lib.AXUIElementIsAttributeSettable(field, key, ctypes.byref(editable)) or not editable.value:
            return no_input("literal_text_entry_unsupported")
        # CFString length is UTF-16 code units, not Python Unicode characters.
        encoded = expected_value.encode("utf-16-le")
        units = len(encoded) // 2
        buffer = (ctypes.c_uint16 * units).from_buffer_copy(encoded)
        value = lib.CFStringCreateWithCharacters(None, buffer, units)
        if not value:
            return no_input("text_allocation_failed")
        current = frontmost_app()
        if (not current.get("ok") or current.get("focus") != focus
                or read_focused_text(focus) != before_text
                or not _mac_act_proven(hive=hive, gen=gen, gate=gate)):
            return no_input("field_binding_changed")
        emitting = True
        error = lib.AXUIElementSetAttributeValue(field, key, value)
        if error:
            return {"ok": False, "wire": "mac_act", "op": "type", "execution_uncertain": True,
                    "reason": "literal_text_entry_failed",
                    "spoken": "Text entry failed. The field may have changed; I will not repeat it."}
        return {"ok": True, "wire": "mac_act", "op": "type", "action_issued": True,
                "submitted": False, "task_verified": False,
                "spoken": "Literal text entry sent. The field contents are not yet verified.",
                "verification": {"scope": "input_dispatch", "task_verified": False,
                    "expected_text_sha256": hashlib.sha256(body.encode("utf-8")).hexdigest()}}
    except (OSError, AttributeError, TypeError, ValueError) as exc:
        if emitting:
            return {"ok": False, "wire": "mac_act", "op": "type", "execution_uncertain": True,
                    "reason": "literal_text_entry_failed", "spoken": "Text entry is uncertain. I will not repeat it."}
        return no_input("literal_text_entry_unavailable")
    finally:
        for reference in (value, key, field):
            if reference:
                lib.CFRelease(reference)


def mac_type(text: str, *, hive: Path | None = None, gen: int | None = None, gate=None) -> dict:
    body = str(text or "")
    if not body:
        return {"ok": False, "wire": "mac_act", "spoken": "UNKNOWN. Say what to type."}
    if "\0" in body:
        return {"ok": False, "wire": "mac_act", "op": "type", "action_issued": False,
                "spoken": "This text contains a character the input transport cannot accept. Nothing was typed."}
    if HARD_CLICK.search(body):
        return {
            "ok": False,
            "wire": "mac_act",
            "spoken": "Proposal only. I will not send, pay, deploy, book, or publish.",
        }
    if hive is not None:
        if BEFORE_HID is not None:
            BEFORE_HID()
        if not _mac_act_proven(hive=hive, gen=gen, gate=gate):
            return {"ok": False, "wire": "mac_act", "op": "stop", "spoken": "Stopped. Standing by."}
    if _dry_mac():
        return {"ok": True, "dry": True, "wire": "mac_act", "op": "type", "spoken": "Watch dry. type not sent."}
    if hive is not None:
        if not _mac_act_proven(hive=hive, gen=gen, gate=gate):
            return {"ok": False, "wire": "mac_act", "op": "stop", "spoken": "Stopped. Standing by."}
        return _type_into_focused_field(body, hive=hive, gen=gen, gate=gate)
    # Internal legacy contextless primitive; public mac_act denies native use
    # without an observed/reserved Watch context.
    # argv keeps user text out of AppleScript syntax and preserves Unicode,
    # whitespace and the full requested value. Entry is not submission proof.
    script = ('on run argv\n'
              '  set inputText to item 1 of argv\n'
              '  tell application "System Events" to keystroke inputText\n'
              'end run\n')
    if hive is not None and not _mac_act_proven(hive=hive, gen=gen, gate=gate):
        return {"ok": False, "wire": "mac_act", "op": "stop", "spoken": "Stopped. Standing by."}
    try:
        proc = _run(["osascript", "-e", script, body], timeout=6.0)
    except subprocess.TimeoutExpired:
        return {"ok": False, "wire": "mac_act", "execution_uncertain": True,
                "spoken": "Typing timed out. Text may have been entered; I will not repeat it."}
    except OSError:
        return {"ok": False, "wire": "mac_act", "spoken": "Typing could not start."}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Accessibility").strip()[:160]
        return {
            "ok": False,
            "wire": "mac_act",
            "execution_uncertain": True,
            "spoken": "Typing failed. Text may have been entered; the result is unverified.",
        }
    return {"ok": True, "wire": "mac_act", "op": "type", "action_issued": True,
            "spoken": "Text entry sent. The field contents are not yet verified.",
            "task_verified": False, "verification": {"scope": "input_dispatch",
                "task_verified": False, "expected_text_sha256": hashlib.sha256(body.encode("utf-8")).hexdigest()}}


def mac_scroll(direction: str = "down", *, hive: Path | None = None, gen: int | None = None, gate=None) -> dict:
    if hive is not None:
        if BEFORE_HID is not None:
            BEFORE_HID()
        if not _mac_act_proven(hive=hive, gen=gen, gate=gate):
            return {"ok": False, "wire": "mac_act", "op": "stop", "spoken": "Stopped. Standing by."}
    if _dry_mac():
        return {"ok": True, "dry": True, "wire": "mac_act", "op": "scroll", "spoken": "Watch dry. scroll not sent."}
    way = "up" if str(direction or "").lower() == "up" else "down"
    vk = VK_PAGE_UP if way == "up" else VK_PAGE_DOWN
    lib_path = ctypes.util.find_library("ApplicationServices") or (
        "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"
    )
    hid = _cgevent_page_keys(ctypes.CDLL(lib_path), vk, way,
                              gate=(lambda: _mac_act_proven(hive=hive, gen=gen, gate=gate)) if hive is not None else None)
    if hid.get("op") == "stop":
        return hid
    if hid.get("ok"):
        hid["wire"] = "mac_act"
        hid["op"] = "scroll"
        hid["spoken"] = f"I scrolled {way}."
        return hid
    return {
        "ok": False,
        "wire": "mac_act",
        "op": "scroll",
        "spoken": "UNKNOWN. Scroll is dark. Allow Accessibility.",
    }


def _watch_policy():
    path = Path(__file__).resolve().parent / "watch_frame.py"
    spec = importlib.util.spec_from_file_location("agent_stack_watch_driver_policy", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("Watch policy is unavailable")
    source = spec.loader.get_source(spec.name)
    if source is None:
        raise RuntimeError("Watch policy source is unavailable")
    mod = importlib.util.module_from_spec(spec)
    exec(compile(source, str(path), "exec"), mod.__dict__)
    return mod


def _mac_act_proven(*, hive: Path | None, gen: int | None, gate, consume: bool = False) -> bool:
    proof = gate() if gate is not None else True
    if not proof:
        return False
    command = str(proof.get("command_sha256") or "") if isinstance(proof, dict) else ""
    if isinstance(proof, dict) and not command:
        return False
    if hive is None and gen is None:
        # Standalone calls are simulator-only. Native input belongs to a
        # current observed/reserved Watch action, not an implicit front app.
        return _dry_mac()
    if hive is None or gen is None:
        return False
    path = Path(__file__).resolve().parent.parent / "memory" / "bus_io.py"
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io_see", path)
    if spec is None or spec.loader is None:
        return False
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    frame = _watch_policy()
    # Permission is app-specific. A different foreground app must not inherit
    # an authorized reservation after focus changes during model/driver work.
    foreground = ""
    native_focus = None
    native_text_binding = None
    if not _dry_mac():
        observed = frontmost_app()
        if not isinstance(observed, dict) or not observed.get("ok"):
            return False
        foreground = frame.normalize_watch_app(str(observed.get("app") or ""))
        if not foreground:
            return False
        native_focus = observed.get("focus")
        if (not isinstance(native_focus, dict) or not isinstance(native_focus.get("pid"), int)
                or native_focus["pid"] <= 0 or not native_focus.get("window")):
            return False
        if (isinstance(proof, dict) and proof.get("operation") == "type"
                and (not native_focus.get("element") or native_focus.get("role") not in {"AXTextField", "AXTextArea", "AXComboBox"})):
            return False
        if isinstance(proof, dict) and proof.get("operation") == "type":
            native_text_binding = frame.text_state_fingerprint(read_focused_text(native_focus))
            if native_text_binding is None:
                return False
    allowed = {"value": False}
    def check(bus):
        watch = bus.get("watch") if isinstance(bus.get("watch"), dict) else {}
        ledger = watch.get("ledger") if isinstance(watch.get("ledger"), dict) else {}
        def eligible(row):
            return (isinstance(row, dict) and row.get("gen") == gen
                and frame.watch_app_allowed(watch, str(row.get("app") or ""))
                and (not foreground or frame.normalize_watch_app(str(row.get("app") or "")) == foreground)
                and (not command or row.get("command_sha256") == command)
                and (native_focus is None or row.get("focus") == native_focus)
                and (native_text_binding is None or row.get("text_binding") == native_text_binding))
        if not watch.get("armed"):
            return bus
        if isinstance(proof, dict) and proof.get("dispatch_nonce"):
            row = ledger.get(proof.get("reservation_key"))
            allowed["value"] = (eligible(row) and row.get("phase") == "emitting"
                and row.get("dispatch_nonce") == proof["dispatch_nonce"])
        else:
            matches = [(key, row) for key, row in ledger.items()
                if eligible(row) and row.get("phase") == "reserved"]
            allowed["value"] = len(matches) == 1 if command else bool(matches)
            if consume and allowed["value"]:
                if not isinstance(proof, dict) or not command:
                    allowed["value"] = False
                    return bus
                key, row = matches[0]
                nonce = secrets.token_hex(24)
                ledger[key] = dict(row, phase="emitting", dispatch_nonce=nonce)
                proof.update(reservation_key=key, dispatch_nonce=nonce)
        return bus
    return mod.act_if_current(hive, gen, check) is not None and allowed["value"]


def _release_unissued_dispatch(hive: Path, gen: int, proof: dict) -> None:
    """Only a known no-input failure may restore a reservation for retry.

    Timeout/partial input/exception keeps ownership consumed: replay is unsafe.
    The bus lock, not a process-local flag, owns dispatch across callers.
    """
    path = Path(__file__).resolve().parent.parent / "memory" / "bus_io.py"
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io_release", path)
    if spec is None or spec.loader is None:
        return
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    def release(bus):
        watch = bus.get("watch") or {}
        ledger = watch.get("ledger") or {}
        row = ledger.get(proof.get("reservation_key"))
        if (isinstance(row, dict) and row.get("gen") == gen
                and row.get("phase") == "emitting"
                and row.get("dispatch_nonce") == proof.get("dispatch_nonce")
                and row.get("command_sha256") == proof.get("command_sha256")):
            restored = dict(row, phase="reserved")
            restored.pop("dispatch_nonce", None)
            ledger[proof["reservation_key"]] = restored
        return bus
    mod.act_if_current(hive, gen, release)


def mac_act(
    op: str,
    *,
    x: float | None = None,
    y: float | None = None,
    text: str = "",
    direction: str = "down",
    hive: Path | None = None,
    gen: int | None = None,
    gate=None,
    frame_bounds=None,
) -> dict:
    name = str(op or "").strip().lower()
    stopped = {
        "ok": False,
        "wire": "mac_act",
        "op": "stop",
        "spoken": "Stopped. Standing by.",
    }
    if name == "stop":
        return {"ok": True, "wire": "mac_act", "op": "stop", "spoken": "Watch stopped."}
    proof = {}
    if hive is not None or gen is not None:
        command = _watch_policy().command_fingerprint({"op": name, "x": x, "y": y,
            "text": text, "direction": direction, "_bound_frame_bounds": frame_bounds})
        proof["command_sha256"] = command
        proof["operation"] = name
        previous_gate = gate
        def bound_gate():
            if previous_gate is not None and not previous_gate():
                return False
            return proof
        gate = bound_gate
    if not _mac_act_proven(hive=hive, gen=gen, gate=gate, consume=True):
        return stopped
    if name == "click":
        result = mac_click(
            0.5 if x is None else float(x),
            0.5 if y is None else float(y),
            hive=hive,
            gen=gen,
            gate=gate,
            frame_bounds=frame_bounds,
        )
    elif name == "type":
        result = mac_type(text, hive=hive, gen=gen, gate=gate)
    elif name == "scroll":
        result = mac_scroll(direction, hive=hive, gen=gen, gate=gate)
    else:
        result = {"ok": False, "wire": "mac_act", "spoken": "UNKNOWN. Watch only clicks, types, scrolls, or stops."}
    if (not result.get("ok") and not result.get("execution_uncertain")
            and hive is not None and gen is not None and proof.get("dispatch_nonce")):
        _release_unissued_dispatch(hive, gen, proof)
    return result


def see_block(snap: dict) -> str:
    safari = snap.get("safari") if isinstance(snap.get("safari"), dict) else {}
    screen = snap.get("screen") if isinstance(snap.get("screen"), dict) else None
    lines = [
        "See (this Mac, Safari only):",
        f"Safari title: {safari.get('title') or 'none'}",
        f"Safari url: {safari.get('url') or 'none'}",
    ]
    if screen and screen.get("path"):
        lines.append(f"Evens's screen image: {screen['path']}")
        lines.append("Look at that image. That is what he is seeing.")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser(description="Jarvis Safari + screen")
    ap.add_argument("cmd", choices=("safari", "grab", "open", "snapshot"))
    ap.add_argument("url", nargs="?")
    ap.add_argument("--hive", default=str(HIVE))
    args = ap.parse_args()
    hive = Path(args.hive)
    if args.cmd == "safari":
        out = safari_front()
    elif args.cmd == "grab":
        out = grab_screen(hive)
    elif args.cmd == "open":
        out = safari_open(args.url or "")
    else:
        out = snapshot(hive=hive, grab=True)
    print(json.dumps(out, indent=2))
    return 0 if out.get("ok") else 2


if __name__ == "__main__":
    if os.environ.get("AGENT_STACK_SEE_SELF_TEST") == "1":
        print(json.dumps({"ok": True, "dry": True}))
        raise SystemExit(0)
    raise SystemExit(main())
