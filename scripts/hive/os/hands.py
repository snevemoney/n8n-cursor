#!/usr/bin/env python3
"""Mac mouse driver. ctypes → CoreGraphics. No pyobjc. No cliclick.

Tests must pass dry_run=True (or VOICE_OS_DRY_HANDS=1). Live HID needs
Accessibility for the Python process that runs voice-os.py.
"""
from __future__ import annotations

import ctypes
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"

CG_PATH = "/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics"
CF_PATH = "/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation"
AS_PATH = "/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices"

kCGHIDEventTap = 0
kCGEventLeftMouseDown = 1
kCGEventLeftMouseUp = 2
kCGEventRightMouseDown = 3
kCGEventRightMouseUp = 4
kCGMouseButtonLeft = 0
kCGMouseButtonRight = 1


class CGPoint(ctypes.Structure):
    _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]


class CGSize(ctypes.Structure):
    _fields_ = [("width", ctypes.c_double), ("height", ctypes.c_double)]


class CGRect(ctypes.Structure):
    _fields_ = [("origin", CGPoint), ("size", CGSize)]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _libs():
    if sys.platform != "darwin":
        return None
    try:
        cg = ctypes.CDLL(CG_PATH)
        cf = ctypes.CDLL(CF_PATH)
        try:
            ax = ctypes.CDLL(AS_PATH)
        except OSError:
            ax = None
        return cg, cf, ax
    except OSError:
        return None


def ax_trusted() -> bool | None:
    libs = _libs()
    if not libs or not libs[2]:
        return None
    try:
        fn = libs[2].AXIsProcessTrusted
        fn.restype = ctypes.c_bool
        fn.argtypes = []
        return bool(fn())
    except Exception:
        return None


def display_size() -> tuple[int, int] | None:
    libs = _libs()
    if not libs:
        return None
    try:
        fn = libs[0].CGDisplayBounds
        fn.argtypes = [ctypes.c_uint32]
        fn.restype = CGRect
        rect = fn(0)
        width = int(rect.size.width)
        height = int(rect.size.height)
        if width > 0 and height > 0:
            return width, height
    except Exception:
        return None
    return None


def to_pixels(
    *,
    x: float | None = None,
    y: float | None = None,
    nx: float | None = None,
    ny: float | None = None,
    screen_w: float | None = None,
    screen_h: float | None = None,
) -> tuple[int, int] | None:
    size = display_size()
    width = int(size[0]) if size else int(screen_w or 0)
    height = int(size[1]) if size else int(screen_h or 0)
    if x is not None and y is not None:
        px, py = int(round(float(x))), int(round(float(y)))
    elif nx is not None and ny is not None:
        if width <= 0 or height <= 0:
            return None
        px = int(round(float(nx) * (width - 1)))
        py = int(round(float(ny) * (height - 1)))
    else:
        return None
    if width > 0:
        px = max(0, min(px, width - 1))
    if height > 0:
        py = max(0, min(py, height - 1))
    return px, py


def _post_move(cg, px: int, py: int) -> None:
    point = CGPoint(float(px), float(py))
    warp = cg.CGWarpMouseCursorPosition
    warp.argtypes = [CGPoint]
    warp.restype = ctypes.c_int32
    warp(point)


def _post_click(cg, cf, px: int, py: int, button: str) -> None:
    point = CGPoint(float(px), float(py))
    create = cg.CGEventCreateMouseEvent
    create.argtypes = [ctypes.c_void_p, ctypes.c_uint32, CGPoint, ctypes.c_uint32]
    create.restype = ctypes.c_void_p
    post = cg.CGEventPost
    post.argtypes = [ctypes.c_uint32, ctypes.c_void_p]
    post.restype = None
    release = cf.CFRelease
    release.argtypes = [ctypes.c_void_p]
    release.restype = None
    try:
        _post_move(cg, px, py)
    except Exception:
        pass
    if button == "right":
        down_t, up_t, btn = kCGEventRightMouseDown, kCGEventRightMouseUp, kCGMouseButtonRight
    else:
        down_t, up_t, btn = kCGEventLeftMouseDown, kCGEventLeftMouseUp, kCGMouseButtonLeft
    down = create(None, down_t, point, btn)
    if down:
        post(kCGHIDEventTap, down)
        release(down)
    time.sleep(0.02)
    up = create(None, up_t, point, btn)
    if up:
        post(kCGHIDEventTap, up)
        release(up)


def execute(
    *,
    action: str,
    x: float | None = None,
    y: float | None = None,
    nx: float | None = None,
    ny: float | None = None,
    screen_w: float | None = None,
    screen_h: float | None = None,
    dry_run: bool = True,
    hive: Path = HIVE,
) -> dict[str, Any]:
    action = (action or "").strip().lower()
    if action in ("left_click", "tap", "press"):
        action = "click"
    if action not in ("click", "move", "right_click"):
        return {"ok": False, "error": f"unknown hands action {action}"}
    pixels = to_pixels(x=x, y=y, nx=nx, ny=ny, screen_w=screen_w, screen_h=screen_h)
    if pixels is None:
        return {"ok": False, "error": "need x,y or nx,ny (plus screen size if the display is unknown)"}
    px, py = pixels
    row: dict[str, Any] = {
        "ok": True,
        "action": action,
        "x": px,
        "y": py,
        "dry_run": bool(dry_run),
        "driver": "none",
        "ax_trusted": ax_trusted(),
        "display": list(display_size() or ()),
        "ts": now_iso(),
    }
    if dry_run:
        row["driver"] = "dry_run"
        _log(hive, row)
        return row
    libs = _libs()
    if not libs:
        row["ok"] = False
        row["error"] = "CoreGraphics unavailable (need this Mac)"
        _log(hive, row)
        return row
    cg, cf, _ax = libs
    try:
        if action == "move":
            _post_move(cg, px, py)
        else:
            _post_click(cg, cf, px, py, "right" if action == "right_click" else "left")
        row["driver"] = "coregraphics"
    except Exception as exc:
        row["ok"] = False
        row["error"] = str(exc)
        row["driver"] = "failed"
    _log(hive, row)
    return row


def _log(hive: Path, row: dict) -> None:
    path = hive / "bus" / "hands.jsonl"
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row) + "\n")
    except OSError:
        pass
