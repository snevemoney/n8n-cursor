#!/usr/bin/env python3
"""Safari + screen on this Mac. Not Chrome. Not Playwright.

  python3 apps/agent-stack/hands/see.py safari
  python3 apps/agent-stack/hands/see.py grab [--hive PATH]
  python3 apps/agent-stack/hands/see.py open https://example.com
"""
from __future__ import annotations

import argparse
import ctypes
import ctypes.util
import json
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
SEE_NAME = "see.jpg"
HTTP_RE = re.compile(r"^https?://", re.I)
HARD_CLICK = re.compile(
    r"\b("
    r"send|pay|deploy|book|publish|checkout|buy now|place order|"
    r"confirm purchase|submit payment|transfer"
    r")\b",
    re.I,
)
YOUTUBE_HOME = "https://www.youtube.com"
WATCH_LATER_URL = "https://www.youtube.com/playlist?list=WL"
OPEN_RE = re.compile(r"\bopen\s+(https?://\S+)", re.I)
YOUTUBE_OPEN_RE = re.compile(r"\b(?:go\s+(?:on|to)|open)\s+(?:the\s+)?youtube\b", re.I)
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
TABS_RE = re.compile(r"\b(tabs?|what(?:'s|s| is) open in safari)\b", re.I)
WAKE_RE = re.compile(r"^(?:hey\s+|hi\s+|hello\s+|yo\s+)?(?:jarvis[,.\s]+)?", re.I)
FACE_URL_RE = re.compile(r"127\.0\.0\.1:4018", re.I)
KEY_PAGE_DOWN = 121
KEY_PAGE_UP = 116
VK_PAGE_DOWN = 0x79
VK_PAGE_UP = 0x74


def _run(argv: list[str], timeout: float = 12.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, capture_output=True, text=True, timeout=timeout)


def safari_front() -> dict:
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"NONE\"\n"
        "  set t to current tab of front window\n"
        '  return (name of t) & "\\n" & (URL of t)\n'
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script])
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari AppleScript failed: {exc}."}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Safari not allowed").strip()[:180]
        return {
            "ok": False,
            "wire": "safari",
            "spoken": f"UNKNOWN. Safari is dark. Allow Terminal to control Safari. {err}",
        }
    raw = (proc.stdout or "").strip()
    if not raw or raw == "NONE":
        return {"ok": True, "wire": "safari", "open": False, "spoken": "Safari has no window.", "title": "", "url": ""}
    title, _, url = raw.partition("\n")
    title = title.strip()
    url = url.strip()
    spoken = f"Safari: {title or 'untitled'}. {url}".strip()
    return {"ok": True, "wire": "safari", "open": True, "title": title, "url": url, "spoken": spoken}


def safari_open(url: str) -> dict:
    target = (url or "").strip()
    if not HTTP_RE.match(target):
        return {"ok": False, "wire": "safari", "spoken": "UNKNOWN. Safari open only takes http or https."}
    script = f'tell application "Safari"\n  activate\n  open location {json.dumps(target)}\nend tell\n'
    try:
        proc = _run(["osascript", "-e", script])
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari open failed: {exc}."}
    if proc.returncode != 0:
        err = (proc.stderr or "").strip()[:160]
        return {"ok": False, "wire": "safari", "spoken": f"UNKNOWN. Safari open failed. {err}"}
    return {"ok": True, "wire": "safari", "spoken": f"Opened in Safari. {target}", "url": target}


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
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "tabs": [], "spoken": f"UNKNOWN. Safari tabs failed: {exc}."}
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


def safari_js(js: str) -> dict:
    """Run JavaScript in the front Safari tab. Same session, same logins. Not Chrome."""
    body = (js or "").strip()
    if not body:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Safari JS was empty."}
    script = (
        'tell application "Safari"\n'
        "  if (count of windows) is 0 then return \"NONE\"\n"
        f"  set r to do JavaScript {json.dumps(body)} in current tab of front window\n"
        "  if r is missing value then return \"OK\"\n"
        "  return r as text\n"
        "end tell\n"
    )
    try:
        proc = _run(["osascript", "-e", script], timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": f"UNKNOWN. Safari JavaScript failed: {exc}."}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "JS not allowed").strip()[:160]
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": f"UNKNOWN. Safari JavaScript is dark. Enable Develop → Allow JavaScript from Apple Events. {err}",
        }
    raw = (proc.stdout or "").strip() or "OK"
    if raw == "NONE":
        return {"ok": False, "unknown": True, "wire": "safari", "spoken": "UNKNOWN. Safari has no window."}
    return {"ok": True, "unknown": False, "wire": "safari", "result": raw, "spoken": f"Safari did it. {raw}"[:240]}


def safari_click(label: str) -> dict:
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
    js = (
        "(function(){var t=%s;var nodes=Array.prototype.slice.call("
        "document.querySelectorAll('a,button,input,[role=button],label'));"
        "var el=nodes.find(function(n){var s=((n.innerText||n.value||n.getAttribute('aria-label')||'')+'')"
        ".toLowerCase();return s.indexOf(t)>=0;});"
        "if(!el)return 'NONE';el.click();return 'OK '+t;})()"
        % json.dumps(target.lower())
    )
    got = safari_js(js)
    if got.get("result") == "NONE":
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "spoken": f"UNKNOWN. Safari found no control named {target}. I will not invent a click.",
        }
    if got.get("ok"):
        got["spoken"] = f"Clicked {target} in Safari."
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


def safari_line(utterance: str, did: str, *, title: str = "", url: str = "") -> str:
    """What he asked + what Safari did. Real URL only. No router 'as requested'."""
    ask = ask_plain(utterance)
    action = (did or "").strip().rstrip(".")
    parts = [f"You asked to {ask}."]
    if action:
        parts.append(action + ".")
    clean_url = (url or "").strip()
    clean_title = (title or "").strip()
    if FACE_URL_RE.search(clean_url):
        clean_url = ""
        clean_title = ""
    if clean_url and clean_url not in action:
        if clean_title and clean_title.lower() not in {"untitled", "sans titre", "j.a.r.v.i.s."}:
            parts.append(f"Front tab: {clean_title}. {clean_url}")
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
            "spoken": "UNKNOWN. CGEvent could not build a page key.",
        }
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
        "spoken": f"Safari scrolled {way} with page keys",
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
            "spoken": f"UNKNOWN. CGEvent page keys failed: {exc}.",
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
            "spoken": f"UNKNOWN. Safari page keys failed: {exc}.",
        }
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "System Events not allowed").strip()[:180]
        return {
            "ok": False,
            "unknown": True,
            "wire": "safari",
            "path": "keys",
            "spoken": (
                "UNKNOWN. Safari page keys are dark. Allow Accessibility for "
                f"Terminal or the Python running 4018. {err}"
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
        "spoken": f"Safari scrolled {way} with page keys",
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
        got["spoken"] = f"Safari scrolled {way} with JavaScript"
        return got
    return {
        "ok": False,
        "unknown": True,
        "wire": "safari",
        "path": "unknown",
        "cgevent": hid,
        "keys": keys,
        "js": got,
        "spoken": (
            "UNKNOWN. Safari scroll is dark. CGEvent page keys, System Events keystrokes, "
            "and JavaScript from Apple Events all failed."
        ),
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
        got["spoken"] = safari_line(text, f"Safari opened {WATCH_LATER_URL}", url=got.get("url") or WATCH_LATER_URL)
        return got
    if YOUTUBE_OPEN_RE.search(text):
        got = safari_open(YOUTUBE_HOME)
        got["spoken"] = safari_line(text, f"Safari opened {YOUTUBE_HOME}", url=got.get("url") or YOUTUBE_HOME)
        return got
    open_hit = OPEN_RE.search(text)
    if open_hit:
        target = open_hit.group(1).rstrip(".,)")
        got = safari_open(target)
        got["spoken"] = safari_line(text, f"Safari opened {target}", url=got.get("url") or target)
        return got
    if SCREEN_GRAB_RE.search(text):
        got = snapshot(hive=dest, grab=True)
        safari = got.get("safari") if isinstance(got.get("safari"), dict) else {}
        screen = got.get("screen") if isinstance(got.get("screen"), dict) else {}
        did = "Safari grabbed the front tab"
        if screen.get("path"):
            did += f" at {screen['path']}"
        got["spoken"] = safari_line(text, did, title=str(safari.get("title") or ""), url=str(safari.get("url") or ""))
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


def grab_screen(hive: Path) -> dict:
    dest = hive / "bus" / SEE_NAME
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    try:
        proc = _run(["screencapture", "-x", "-t", "jpg", str(dest)], timeout=20.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "wire": "see", "spoken": f"UNKNOWN. Screen grab failed: {exc}."}
    if proc.returncode != 0 or not dest.is_file():
        err = (proc.stderr or proc.stdout or "no file").strip()[:160]
        return {
            "ok": False,
            "wire": "see",
            "spoken": (
                "UNKNOWN. Screen grab is dark. Allow Screen Recording for "
                f"Terminal or the Python running 4018. {err}"
            ),
        }
    return {
        "ok": True,
        "wire": "see",
        "path": str(dest),
        "bytes": dest.stat().st_size,
        "spoken": f"Screen saved at {dest}.",
    }


def snapshot(*, hive: Path, grab: bool) -> dict:
    safari = safari_front()
    screen = grab_screen(hive) if grab else None
    lines = [safari.get("spoken") or "Safari unknown."]
    if screen:
        lines.append(screen.get("spoken") or "Screen unknown.")
    return {
        "ok": bool(safari.get("ok")) and (screen is None or bool(screen.get("ok"))),
        "wire": "see",
        "safari": safari,
        "screen": screen,
        "spoken": " ".join(lines),
    }


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
