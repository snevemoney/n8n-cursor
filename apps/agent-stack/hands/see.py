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
