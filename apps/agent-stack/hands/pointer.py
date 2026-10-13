"""Pointer hand (Z02), matched to Zubair ud7wzdiM0gk 1:56-2:59 and Evens 12:43.

"where do I click to X?" -> locate X ON DEVICE: (1) Accessibility tree of the front app (button/link frames),
(2) on-device Vision OCR of a local temp screenshot (deleted right after) -> a native click-through overlay
draws a red arrow + label on the live screen pointing at it (face/overlay/pointer_arrow.swift) and the real cursor
hovers there (never clicks). Jarvis says where it is. Nothing is uploaded, sent or shown as a screenshot.
If both on-device paths fail, Jarvis says so; an off-device look stays a separate, confirm-gated screen_see ask.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
OVERLAY = STACK / "face" / "overlay"
CACHE = Path.home() / "Library" / "Caches" / "jarvis"
SHOW_SEC = 10  # demo: tag visible 2:09.0-2:19.5
LOOK_LINE = "Let me have a look, sir."
WANT_RE = re.compile(r"\b(?:where\s+(?:do|should|can)\s+i\s+(?:click|tap|press|go)|where(?:'s|\s+is)\s+(?:the\s+)?(?:button|[\w\s'-]{1,40}?"
                     r"\s+(?:button|menu|link|icon|tab|setting|toggle|field))|point\s+(?:to|at|me\s+to)|show\s+me\s+where)\b", re.I)
STOP = set("a an the to on in of for my me i do can you could would should show where is are click tap press button "
           "find point at this that it please hey jarvis new go how which there here sir open turn get make use".split())
SYN = {"create": ["create", "new", "plus", "+"], "reel": ["reel", "reels"], "settings": ["settings", "preferences"],
       "notifications": ["notifications"], "share": ["share"], "post": ["post", "create"]}


def wants_pointer(u: str) -> bool:
    return bool(WANT_RE.search(u or ""))


def keywords(u: str) -> list[str]:
    words = [w for w in re.findall(r"[a-z0-9+]+", (u or "").lower()) if w not in STOP and len(w) > 1]
    out: list[str] = []
    for w in words:
        for k in SYN.get(w, [w]):
            if k not in out:
                out.append(k)
    return out[:8]


def _bin(name: str) -> Path | None:
    src, b = OVERLAY / f"{name}.swift", CACHE / name
    if not src.is_file():
        return b if b.is_file() else None
    if b.is_file() and b.stat().st_mtime >= src.stat().st_mtime:
        return b
    if not shutil.which("swiftc"):
        return None
    CACHE.mkdir(parents=True, exist_ok=True)
    cp = subprocess.run(["swiftc", "-O", str(src), "-o", str(b)], capture_output=True, text=True, timeout=240)
    return b if cp.returncode == 0 and b.is_file() else None


def locate(kws: list[str]) -> dict:
    loc = _bin("jarvis_locate")
    if loc is None or not kws:
        return {"found": False, "why": "locator unavailable" if loc is None else "no keywords"}
    fd, shot = tempfile.mkstemp(prefix="jarvis-pt-", suffix=".png")
    os.close(fd)
    try:
        sc = subprocess.run(["screencapture", "-x", "-m", shot], capture_output=True, text=True, timeout=8)
        cp = subprocess.run([str(loc), ",".join(kws), shot], capture_output=True, text=True, timeout=30)
        try:
            with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
                fh.write(json.dumps({"kws": kws, "sc_rc": sc.returncode, "sc_err": sc.stderr[-200:],
                                     "shot_bytes": os.path.getsize(shot), "loc_rc": cp.returncode,
                                     "out": cp.stdout[-300:], "err": cp.stderr[-300:]}) + "\n")
        except OSError:
            pass
        return json.loads((cp.stdout or "{}").strip().splitlines()[-1] or "{}")
    except subprocess.TimeoutExpired as exc:
        try:
            with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
                fh.write(json.dumps({"timeout": str(exc.cmd)[:120], "err": str(exc.stderr or "")[-300:],
                                     "shot_bytes": os.path.getsize(shot)}) + "\n")
        except OSError:
            pass
        return {"found": False, "why": "locator timed out"}
    except (ValueError, IndexError):
        return {"found": False, "why": "locator gave no answer"}
    finally:
        try:
            os.unlink(shot)  # the local screenshot never leaves the Mac and is deleted at once
        except OSError:
            pass


def draw(x: float, y: float, label: str, seconds: int = SHOW_SEC) -> bool:
    b = _bin("pointer_arrow")
    if b is None:
        return False
    subprocess.Popen([str(b), f"{x:.1f}", f"{y:.1f}", label, str(seconds)], stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)
    return True


def hover(x: float, y: float) -> bool:
    """Move the real cursor onto (x, y) global points. A mouse-moved event only: never a click."""
    import ctypes
    import ctypes.util

    class P(ctypes.Structure):
        _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
    try:
        lib = ctypes.CDLL(ctypes.util.find_library("ApplicationServices")
                          or "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices")
        lib.CGEventCreateMouseEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint32, P, ctypes.c_uint32]
        lib.CGEventCreateMouseEvent.restype = ctypes.c_void_p
        lib.CGEventPost.argtypes = [ctypes.c_uint32, ctypes.c_void_p]
        lib.CFRelease.argtypes = [ctypes.c_void_p]
        ev = lib.CGEventCreateMouseEvent(None, 5, P(float(x), float(y)), 0)  # kCGEventMouseMoved
        if not ev:
            return False
        lib.CGEventPost(0, ev)
        lib.CFRelease(ev)
        return True
    except Exception:  # noqa: BLE001
        return False


def _where(x: float, y: float) -> str:
    """Rough screen region from CoreGraphics display bounds (no AppleScript, no permission prompts)."""
    import ctypes

    class R(ctypes.Structure):
        _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double), ("w", ctypes.c_double), ("h", ctypes.c_double)]
    try:
        cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
        cg.CGMainDisplayID.restype = ctypes.c_uint32
        cg.CGDisplayBounds.argtypes = [ctypes.c_uint32]
        cg.CGDisplayBounds.restype = R
        b = cg.CGDisplayBounds(cg.CGMainDisplayID())
        w, h = b.w or 1920.0, b.h or 1080.0
    except Exception:  # noqa: BLE001
        w, h = 1920.0, 1080.0
    col = "left" if x < w / 3 else "right" if x > 2 * w / 3 else "middle"
    row = "top " if y < h / 3 else "bottom " if y > 2 * h / 3 else ""
    return row + col


def run(utterance: str, *, locate_fn=None, draw_fn=None, hover_fn=None, where_fn=None) -> dict:
    kws = keywords(utterance)
    try:
        got = (locate_fn or locate)(kws)
    except Exception as exc:  # noqa: BLE001 — a locator fault is an honest miss, never a dead turn
        got = {"found": False, "why": f"locator error {type(exc).__name__}"}
    if not got.get("found"):
        why = str(got.get("why") or "")
        return {"ok": True, "found": False, "source": None, "keywords": kws,
                "spoken": f"I looked at your screen on this Mac and can't find {' '.join(kws[:3]) or 'that'}. "
                          + ("Is it on the screen right now?" if "match" in why else f"({why}.)")}
    x, y = float(got["x"]), float(got["y"])
    label = " ".join(str(got.get("label") or kws[0]).split())[:40] or kws[0]
    try:
        drawn = (draw_fn or draw)(x, y, label)
    except Exception:  # noqa: BLE001
        drawn = False
    if hover_fn is not None:  # demo never moves the cursor (storyboards/Z02); hover only when a caller asks
        hover_fn(x, y)
    where = (where_fn or _where)(x, y)
    said = f"There: {label}, {where} of your screen. The red arrow is on it; click it when you're ready."
    if not drawn:
        said = f"It's {label}, {where} of your screen, sir. I couldn't draw the arrow this time."
    return {"ok": True, "found": True, "source": got.get("source"), "x": x, "y": y, "label": label, "drawn": drawn,
            "keywords": kws, "spoken": said}
