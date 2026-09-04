#!/usr/bin/env python3
"""Safari + screen on this Mac. Not Chrome. Not Playwright.

  python3 apps/agent-stack/hands/see.py safari
  python3 apps/agent-stack/hands/see.py grab [--hive PATH]
  python3 apps/agent-stack/hands/see.py open https://example.com
"""
from __future__ import annotations

import argparse
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
OPEN_RE = re.compile(r"\bopen\s+(https?://\S+)", re.I)
CLICK_RE = re.compile(r"\b(?:click|tap|press)\s+(?:the\s+)?(.+?)(?:\s+button|\s+link)?\s*$", re.I)
TYPE_RE = re.compile(r"\b(?:type|enter|fill)\s+(.+)$", re.I)
SCROLL_RE = re.compile(r"\bscroll\b", re.I)
TABS_RE = re.compile(r"\b(tabs?|what(?:'s|s| is) open in safari)\b", re.I)


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


def safari_scroll(direction: str = "down") -> dict:
    dy = -600 if str(direction or "").lower() == "up" else 600
    got = safari_js(f"window.scrollBy(0,{dy}); 'OK';")
    if got.get("ok"):
        got["spoken"] = f"Scrolled {('up' if dy < 0 else 'down')} in Safari."
    return got


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


def safari_act(utterance: str) -> dict:
    """Route a spoken Safari action onto the logged-in Safari. Not Chrome. Not Grok Bot."""
    text = (utterance or "").strip()
    open_hit = OPEN_RE.search(text)
    if open_hit:
        return safari_open(open_hit.group(1).rstrip(".,)"))
    if TABS_RE.search(text) and not CLICK_RE.search(text):
        return safari_tabs()
    click_hit = CLICK_RE.search(text)
    if click_hit:
        return safari_click(click_hit.group(1).strip(" ."))
    if SCROLL_RE.search(text):
        return safari_scroll("up" if re.search(r"\bup\b", text, re.I) else "down")
    type_hit = TYPE_RE.search(text)
    if type_hit:
        return safari_type(type_hit.group(1).strip(" ."))
    return safari_front()


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
