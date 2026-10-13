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
           "find point at this that it please hey jarvis new go how which there here sir open turn get make use and or on with button icon".split())
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


class _Grab:
    def __init__(self, rc: int, err: str = "") -> None:
        self.returncode, self.stderr = rc, err


def _grab(shot: str, wall: float = 6.0) -> _Grab:
    """Local screenshot for on-device OCR. Under launchd, screencapture can write the file and then hang;
    take the file as soon as it is complete and stop the process."""
    import time as _t
    pr = subprocess.Popen(["screencapture", "-x", "-m", "-t", "png", shot], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    end, last = _t.time() + wall, -1
    while _t.time() < end:
        if pr.poll() is not None:
            return _Grab(pr.returncode)
        size = os.path.getsize(shot) if os.path.exists(shot) else 0
        if size > 0 and size == last:
            with open(shot, "rb") as fh:
                fh.seek(-12, 2)
                if b"IEND" in fh.read():
                    pr.kill()
                    return _Grab(0, "taken before exit")
        last = size
        _t.sleep(0.08)
    pr.kill()
    return _Grab(-9, "screencapture wall")


def locate(kws: list[str]) -> dict:
    loc = _bin("jarvis_locate")
    if loc is None or not kws:
        return {"found": False, "why": "locator unavailable" if loc is None else "no keywords"}
    fd, shot = tempfile.mkstemp(prefix="jarvis-pt-", suffix=".png")
    os.close(fd)
    try:
        import time as _t
        subprocess.run(["pkill", "-f", "Caches/jarvis/pointer_arrow"], capture_output=True)  # our own arrow hides the text from OCR
        _t.sleep(0.12)
        t0 = _t.time()
        sc = _grab(shot)
        t1 = _t.time()
        cp = subprocess.run([str(loc), ",".join(kws), shot], capture_output=True, text=True, timeout=30)
        try:
            with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
                fh.write(json.dumps({"kws": kws, "sc_rc": sc.returncode, "sc_err": sc.stderr[-200:],
                                     "shot_bytes": os.path.getsize(shot), "t_shot": round(t1 - t0, 2), "t_loc": round(_t.time() - t1, 2), "ts": _t.time(), "loc_rc": cp.returncode,
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


KIND = {"AXButton": "button", "AXMenuButton": "button", "AXPopUpButton": "menu", "AXLink": "link", "AXMenuItem": "menu item",
        "AXTab": "tab", "AXRadioButton": "tab", "AXCheckBox": "toggle", "AXCell": "item", "AXImage": "icon"}
GOAL_RE = re.compile(r"\b(?:to|for|and)\s+((?:open|create|make|add|start|turn|change|find|see|edit|share|post|upload|go|get|set|switch|"
                     r"delete|remove|save|send|write|view|check)\b[^?.!]{0,60})", re.I)


def function_name(label: str, role: str, kws: list[str], source: str) -> str:
    """Demo 2:09: the tag names the control's function ("Create button"), not raw page text."""
    words = [w for w in re.findall(r"[A-Za-z0-9+&'-]+", label or "") if w]
    hit = next((k for k in kws if any(k == w.lower() or k + "s" == w.lower() for w in words)), None)
    if not words or (len(words) == 1 and words[0] in "+"):
        name = (kws[0] if kws else "this").capitalize()
    else:
        name = " ".join(words[:3])
        name = name[0].upper() + name[1:]
    if hit is None and kws and kws[0] in SYN and len(words) <= 1:
        name = kws[0].capitalize()
    kind = KIND.get(role or "", "")
    if not kind:
        kind = "button" if source == "ax" else ("section" if len(words) == 1 else "")
    return f"{name} {kind}".strip()


def next_step(utterance: str, func: str) -> str:
    m = GOAL_RE.search(utterance or "")
    goal = re.sub(r"\bmy\b", "your", m.group(1).strip(), flags=re.I) if m else ""
    return f"click it to {goal}" if goal else f"click the {func} to carry on"


def place(where: str) -> str:
    return {"left": "on the left of your screen", "right": "on the right of your screen", "middle": "in the middle of your screen"}.get(
        where, f"at the {where} of your screen")


def run(utterance: str, *, locate_fn=None, draw_fn=None, hover_fn=None, where_fn=None) -> dict:
    kws = keywords(utterance)
    try:
        got = (locate_fn or locate)(kws)
    except Exception as exc:  # noqa: BLE001 — a locator fault is an honest miss, never a dead turn
        got = {"found": False, "why": f"locator error {type(exc).__name__}"}
    if not got.get("found"):
        dock = dock_hint(kws)
        if dock:
            return dock
        why = str(got.get("why") or "")
        return {"ok": True, "found": False, "source": None, "keywords": kws,
                "spoken": f"I looked at your screen on this Mac and can't find {' '.join(kws[:3]) or 'that'}. "
                          + ("Is it on the screen right now?" if "match" in why else f"({why}.)")}
    x, y = float(got["x"]), float(got["y"])
    raw = " ".join(str(got.get("label") or kws[0]).split())[:40] or kws[0]
    label = function_name(raw, str(got.get("role") or ""), kws, str(got.get("source") or ""))
    try:
        drawn = (draw_fn or draw)(x, y, label)
    except Exception:  # noqa: BLE001
        drawn = False
    if hover_fn is not None:  # demo never moves the cursor (storyboards/Z02); hover only when a caller asks
        hover_fn(x, y)
    where = (where_fn or _where)(x, y)
    remember(x, y, label)
    said = f"The {label} {place(where)}; {next_step(utterance, label)}. The red arrow is on it."
    if not drawn:
        said = f"It's {label}, {where} of your screen, sir. I couldn't draw the arrow this time."
    return {"ok": True, "found": True, "source": got.get("source"), "x": x, "y": y, "label": label, "raw_label": raw, "drawn": drawn,
            "keywords": kws, "spoken": said}


# ---------------------------------------------------------------- Z02 part 2: Jarvis clicks it himself, after "confirm"
# Evens 17:48/18:25 live: "Could you click X on that to close it" -> "I can't click". Now: "click it" / "click X" resolves a
# target on device (last arrow, a named label, or the front window's close dot), draws the arrow on it, and arms a one-shot
# confirm. Only an explicit "confirm" on the next turn posts ONE left click (face/overlay/jarvis_click.swift). Never keys.
LAST = CACHE / "pointer_last.json"
LAST_TTL = 120
SKIP_OWNERS = "jarvis,jarvis orb,window server,dock,control center,notification center"
CLICK_RE = re.compile(r"^\s*(?:hey\s+)?(?:jarvis[,.]?\s*)?(?:(?:can|could|would|will)\s+you\s+)?(?:please\s+)?(?:go\s+ahead\s+and\s+)?"
                      r"(?:click|tap|press)\b(?:\s+(?:on|it|that|this|the|for\s+me|x|[\w'+%-]+)){0,10}[\s?.!]*$", re.I)
CLOSE_X_RE = re.compile(r"\b(?:click|tap|press|hit)\s+(?:on\s+)?(?:the\s+)?x\b|\bclose\s+(?:it|that|this|the\s+window)\b", re.I)
IT_RE = re.compile(r"^\s*(?:hey\s+)?(?:jarvis[,.]?\s*)?(?:(?:can|could|would|will)\s+you\s+)?(?:please\s+)?(?:click|tap|press)\s+(?:on\s+)?(?:it|that|this|there)(?:\s+for\s+me)?[\s?.!]*$", re.I)


def wants_click(u: str) -> bool:
    return bool(CLICK_RE.search(u or "")) or bool(CLOSE_X_RE.search(u or "") and re.search(r"\b(?:click|tap|press|close)\b", u or "", re.I))


def remember(x: float, y: float, label: str) -> None:
    import time as _t
    try:
        CACHE.mkdir(parents=True, exist_ok=True)
        LAST.write_text(json.dumps({"x": x, "y": y, "label": label, "at": _t.time()}))
    except OSError:
        pass


def last_target() -> dict | None:
    import time as _t
    try:
        d = json.loads(LAST.read_text())
        return d if _t.time() - float(d.get("at") or 0) <= LAST_TTL else None
    except (OSError, ValueError):
        return None


def close_button() -> dict:
    b = _bin("jarvis_winclose")
    if b is None:
        return {"found": False, "why": "window locator unavailable"}
    fd, shot = tempfile.mkstemp(prefix="jarvis-pt-", suffix=".png")
    os.close(fd)
    try:
        _grab(shot)
        cp = subprocess.run([str(b), SKIP_OWNERS, shot], capture_output=True, text=True, timeout=15)
        return json.loads((cp.stdout or "{}").strip().splitlines()[-1] or "{}")
    except (subprocess.TimeoutExpired, ValueError, IndexError):
        return {"found": False, "why": "window locator gave no answer"}
    finally:
        try:
            os.unlink(shot)
        except OSError:
            pass


def click_target(utterance: str, *, locate_fn=None, close_fn=None) -> dict:
    """Where a click would land: {found, x, y, label, why}. Nothing is clicked here."""
    if IT_RE.search(utterance or ""):
        t = last_target()
        return dict(t, found=True, source="last arrow") if t else {"found": False, "why": "no arrow is up; tell me what to click"}
    if CLOSE_X_RE.search(utterance or ""):
        got = (close_fn or close_button)()
        if got.get("found"):
            return {"found": True, "x": float(got["x"]), "y": float(got["y"]), "source": got.get("source"),
                    "label": f"Close button on the {got.get('owner') or 'front'} window"}
        return {"found": False, "why": str(got.get("why") or "no window")}
    kws = [k for k in keywords(utterance) if k not in {"close", "dismiss", "x"}]
    if not kws:
        return {"found": False, "why": "tell me what to click"}
    t = last_target()
    if t and any(k in str(t.get("label") or "").lower() for k in kws):
        return dict(t, found=True, source="last arrow")  # the arrow is already on it
    got = (locate_fn or locate)(kws)
    if not got.get("found"):
        return {"found": False, "why": f"I can't find {' '.join(kws[:3])} on your screen"}
    raw = " ".join(str(got.get("label") or kws[0]).split())[:40] or kws[0]
    return {"found": True, "x": float(got["x"]), "y": float(got["y"]), "source": got.get("source"),
            "label": function_name(raw, str(got.get("role") or ""), kws, str(got.get("source") or ""))}


def click_arm(utterance: str, *, locate_fn=None, close_fn=None, draw_fn=None) -> dict:
    t = click_target(utterance, locate_fn=locate_fn, close_fn=close_fn)
    if not t.get("found"):
        return {"found": False, "spoken": f"I won't click blind: {t.get('why')}."}
    try:
        (draw_fn or draw)(t["x"], t["y"], t["label"], 30)
    except Exception:  # noqa: BLE001
        pass
    remember(t["x"], t["y"], t["label"])
    return {"found": True, "x": t["x"], "y": t["y"], "label": t["label"], "source": t.get("source")}


CLICK_APP = Path.home() / "Applications" / "Jarvis Click.app"  # Jarvis's own helper; holds the one Accessibility grant
APP_BUILD = OVERLAY / "build_click_app.sh"


def _click_app() -> Path | None:
    exe = CLICK_APP / "Contents" / "MacOS" / "jarvis_click"
    src = OVERLAY / "jarvis_click.swift"
    if not exe.is_file() or (src.is_file() and src.stat().st_mtime > exe.stat().st_mtime):
        subprocess.run(["bash", str(APP_BUILD)], capture_output=True, timeout=240)
    return CLICK_APP if exe.is_file() else None


def _via_app(args: list[str], wall: float = 12.0) -> dict:
    """Launch the helper through LaunchServices so macOS checks Jarvis Click.app's own grant (not python's)."""
    app = _click_app()
    if app is None:
        return {"ok": False, "why": "click helper isn't built"}
    fd, res = tempfile.mkstemp(prefix="jarvis-click-", suffix=".json")
    os.close(fd)
    try:
        os.unlink(res)
        import time as _t
        subprocess.run(["open", "-g", "-n", "-a", str(app), "--args", *args, "--out", res], capture_output=True, timeout=wall)
        end = _t.time() + wall
        while _t.time() < end:
            if os.path.exists(res) and os.path.getsize(res) > 0:
                _t.sleep(0.05)
                return json.loads(Path(res).read_text())
            _t.sleep(0.05)
        return {"ok": False, "why": "click helper gave no answer"}
    except (subprocess.TimeoutExpired, ValueError, OSError):
        return {"ok": False, "why": "click helper gave no answer"}
    finally:
        try:
            os.unlink(res)
        except OSError:
            pass


def click_preflight() -> dict:
    return _via_app(["--check"])


PERMISSION_LINE = ("I didn't click: macOS hasn't switched on Accessibility for Jarvis Click. In System Settings, Privacy & Security, "
                   "Accessibility, turn on Jarvis Click ({app}), then ask me again. Nothing was clicked.")


def click_do(x: float, y: float, label: str, *, run_fn=None) -> dict:
    """Jarvis's floating cursor glides to (x, y), pulses, one left click, Evens's cursor restored. Only after confirm."""
    got = (run_fn or _via_app)([f"{x:.1f}", f"{y:.1f}", label])
    if got.get("ok"):
        return {"ok": True, "clicked": True, "spoken": f"Clicked the {label}."}
    if got.get("why") == "post_event_denied":
        return {"ok": False, "clicked": False, "why": "post_event_denied", "binary": str(CLICK_APP),
                "spoken": PERMISSION_LINE.format(app=str(CLICK_APP))}
    return {"ok": False, "clicked": False, "spoken": f"I didn't click: {got.get('why') or 'the click failed'}."}


def dock_hint(kws: list[str]) -> dict | None:
    """An installed app named in the ask whose icon is in a hidden Dock: point at the Dock edge, say so, no guessing."""
    for k in kws:
        name = k.capitalize()
        app = next((p for p in (f"/Applications/{name}.app", f"/System/Applications/{name}.app",
                                f"/System/Cryptexes/App/System/Applications/{name}.app") if os.path.isdir(p)), None)
        if not app:
            continue
        try:
            hidden = subprocess.run(["defaults", "read", "com.apple.dock", "autohide"], capture_output=True, text=True, timeout=3).stdout.strip() == "1"
        except (OSError, subprocess.TimeoutExpired):
            hidden = False
        if not hidden:
            return None
        import ctypes

        class R(ctypes.Structure):
            _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double), ("w", ctypes.c_double), ("h", ctypes.c_double)]
        try:
            cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
            cg.CGMainDisplayID.restype = ctypes.c_uint32
            cg.CGDisplayBounds.argtypes = [ctypes.c_uint32]
            cg.CGDisplayBounds.restype = R
            bd = cg.CGDisplayBounds(cg.CGMainDisplayID())
            x, y = bd.x + bd.w / 2, bd.y + bd.h - 6
        except Exception:  # noqa: BLE001
            return None
        drawn = draw(x, y, f"Dock: {name}")
        return {"ok": True, "found": True, "source": "dock", "x": x, "y": y, "label": f"Dock: {name}", "drawn": drawn, "keywords": kws,
                "spoken": f"{name} is in your Dock, which is hidden at the bottom of your screen. Push the pointer to the bottom edge "
                          f"where the arrow is and click the {name} icon."}
    return None
