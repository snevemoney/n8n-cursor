"""Pointer hand (Z02), matched to Zubair ud7wzdiM0gk 1:56-2:59 and Evens 12:43.

"where do I click to X?" -> locate X ON DEVICE: (1) Accessibility tree of the front app (button/link frames),
(2) on-device Vision OCR of a local temp screenshot (deleted right after) -> a native click-through overlay
draws a red arrow + label on the live screen pointing at it (face/overlay/pointer_arrow.swift) and the real cursor
hovers there (never clicks). Jarvis says where it is.
Round 3 (Evens 15:23): primary locator is a vision box from a silent capture of the display under his cursor (sent to the
vision model, deleted locally at once); OCR is only a fallback for an exact word. Not found -> Jarvis says so, no arrow.
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


def live() -> bool:
    """Real screen side effects (capture, vision call, arrow, cursor, click) only inside the running Face (serve.py).
    15:43 repeats: mouth/test_turn.py's apply_turn("click next") reached the real hand and drew arrows every test run."""
    return (Path(sys.argv[0] or "").name == "serve.py" and not os.environ.get("PYTEST_CURRENT_TEST")
            and os.environ.get("JARVIS_POINTER_OFF") != "1")


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
    if not live():
        return {"found": False, "why": "pointer is off outside the live Face"}
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
    if not live():
        return False
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
    if where and where not in ("left", "right", "middle") and not re.match(r"(?:top|bottom) ", where):
        return where if re.match(r"(?:in|on|at|near|under|above)\b", where) else f"in the {where}"
    return {"left": "on the left of your screen", "right": "on the right of your screen", "middle": "in the middle of your screen"}.get(
        where, f"at the {where} of your screen")


def run(utterance: str, *, locate_fn=None, draw_fn=None, hover_fn=None, where_fn=None) -> dict:
    kws = keywords(utterance)
    try:
        got = locate_fn(kws) if locate_fn else locate_smart(utterance, kws)
    except Exception as exc:  # noqa: BLE001 — a locator fault is an honest miss, never a dead turn
        got = {"found": False, "why": f"locator error {type(exc).__name__}"}
    if not got.get("found"):
        dock = dock_hint(kws)
        if dock:
            return dock
        why = str(got.get("why") or "")
        short = re.split(r"(?<=[.!?])\s", why.strip())[0].rstrip(".") if why else ""
        short = re.sub(r"^.*?\bbut\s+", "", short, flags=re.I)
        short = re.sub(r"\bthe (?:screenshot|image|screen)\b", "your screen", short, flags=re.I)
        short = short[:1].upper() + short[1:]
        return {"ok": True, "found": False, "source": None, "keywords": kws, "drawn": False,
                "spoken": "I looked at your screen and couldn't find that, so I'm not pointing anywhere. "
                          + (f"{short}." if short and "match" not in why else "Is it on the screen right now?")}
    x, y = float(got["x"]), float(got["y"])
    raw = " ".join(str(got.get("label") or kws[0]).split())[:40] or kws[0]
    label = raw if got.get("source") == "vision" and raw else function_name(raw, str(got.get("role") or ""), kws, str(got.get("source") or ""))
    try:
        drawn = (draw_fn or draw)(x, y, label)
    except Exception:  # noqa: BLE001
        drawn = False
    if hover_fn is not None:  # demo never moves the cursor (storyboards/Z02); hover only when a caller asks
        hover_fn(x, y)
    where = got.get("where") if got.get("source") == "vision" and got.get("where") else (where_fn or _where)(x, y)
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


def close_button(owner: str = "") -> dict:
    if not live():
        return {"found": False, "why": "pointer is off outside the live Face"}
    b = _bin("jarvis_winclose")
    if b is None:
        return {"found": False, "why": "window locator unavailable"}
    fd, shot = tempfile.mkstemp(prefix="jarvis-pt-", suffix=".png")
    os.close(fd)
    try:
        _grab(shot)
        cp = subprocess.run([str(b), SKIP_OWNERS, shot] + ([owner] if owner else []), capture_output=True, text=True, timeout=15)
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
        m = re.search(r"\b(?:on|of)\s+(?:the|my|that)?\s*([A-Za-z][\w .-]{1,30}?)\s+window\b", utterance or "", re.I)
        want = m.group(1).strip() if m and m.group(1).lower() not in ("that", "this", "the", "front") else ""
        got = (close_fn or close_button)(want) if want else (close_fn or close_button)()
        if got.get("found"):
            return {"found": True, "x": float(got["x"]), "y": float(got["y"]), "source": got.get("source"),
                    "label": f"Close button on the {got.get('owner') or 'front'} window"}
        why = str(got.get("why") or "no window")
        if want and why == "no window":
            why = f"no full {want} window is on screen (a Stage Manager thumbnail has no real close button); bring it forward first"
        return {"found": False, "why": why}
    kws = [k for k in keywords(utterance) if k not in {"close", "dismiss", "x"}]
    if not kws:
        return {"found": False, "why": "tell me what to click"}
    t = last_target()
    if t and any(k in str(t.get("label") or "").lower() for k in kws):
        return dict(t, found=True, source="last arrow")  # the arrow is already on it
    got = locate_fn(kws) if locate_fn else locate_smart(utterance, kws)
    if not got.get("found"):
        return {"found": False, "why": f"I can't find {' '.join(kws[:3])} on your screen"}
    raw = " ".join(str(got.get("label") or kws[0]).split())[:40] or kws[0]
    return {"found": True, "x": float(got["x"]), "y": float(got["y"]), "source": got.get("source"),
            "label": raw if got.get("source") == "vision" else function_name(raw, str(got.get("role") or ""), kws, str(got.get("source") or ""))}


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
    if not exe.is_file():  # never auto-rebuild: a rebuild changes the ad-hoc signature and drops his Accessibility switch
        subprocess.run(["bash", str(APP_BUILD)], capture_output=True, timeout=240)
    return CLICK_APP if exe.is_file() else None


def _via_app(args: list[str], wall: float = 12.0) -> dict:
    """Launch the helper through LaunchServices so macOS checks Jarvis Click.app's own grant (not python's)."""
    if not live():
        return {"ok": False, "why": "pointer is off outside the live Face"}
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
    if run_fn is None:
        if not live():
            return {"ok": False, "clicked": False, "spoken": "I didn't click: the pointer is off outside the live Face."}
        pre = click_preflight()
        if not pre.get("post_event_allowed"):
            return {"ok": False, "clicked": False, "why": "post_event_denied", "binary": str(CLICK_APP),
                    "spoken": PERMISSION_LINE.format(app=str(CLICK_APP))}
        # the visible Jarvis cursor is drawn from the Face, same path as the arrow Evens sees (15:43: the helper's window never showed)
        try:
            hx, hy = cursor_display()["cursor"]
        except Exception:  # noqa: BLE001
            hx, hy = x, y
        cur = _bin("pointer_cursor")
        if cur is not None:
            subprocess.Popen([str(cur), f"{hx:.1f}", f"{hy:.1f}", f"{x:.1f}", f"{y:.1f}"], stdout=subprocess.DEVNULL,
                             stderr=subprocess.DEVNULL, start_new_session=True)
            import time as _t
            _t.sleep(1.05)  # glide 0.75 s + pulse 0.3 s, then the real click lands
        got = _via_app([f"{x:.1f}", f"{y:.1f}", label, f"{hx:.1f}", f"{hy:.1f}"])
    else:
        got = run_fn([f"{x:.1f}", f"{y:.1f}", label])
    if got.get("ok"):
        return {"ok": True, "clicked": True, "spoken": f"Clicked the {label}."}
    if got.get("why") == "post_event_denied":
        return {"ok": False, "clicked": False, "why": "post_event_denied", "binary": str(CLICK_APP),
                "spoken": PERMISSION_LINE.format(app=str(CLICK_APP))}
    return {"ok": False, "clicked": False, "spoken": f"I didn't click: {got.get('why') or 'the click failed'}."}


def dock_hint(kws: list[str]) -> dict | None:
    """An installed app named in the ask whose icon is in a hidden Dock: point at the Dock edge, say so, no guessing."""
    if not live():
        return None
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


# ---------------------------------------------------------------- icon targets (round 3): vision box on the display Evens is on
# Text OCR can't see icon-only controls ("+", Dock icons) and grabbed wrong words ("NEW" for "create a reel"). Evens asked
# (15:23) for a vision model on a silent capture of the display under his cursor: it returns the target's box, or "not found"
# and Jarvis says so. OCR is only a fallback when the vision call itself is unavailable, and then only for an exact word.
VISION_MODEL = os.environ.get("JARVIS_POINTER_VISION_MODEL", "google/gemini-2.0-flash-001")


class _R(__import__("ctypes").Structure):
    _fields_ = [("x", __import__("ctypes").c_double), ("y", __import__("ctypes").c_double),
                ("w", __import__("ctypes").c_double), ("h", __import__("ctypes").c_double)]


def cursor_display() -> dict:
    """{index (1-based for screencapture -D), x, y, w, h} of the display under the mouse, from CoreGraphics (no prompt)."""
    import ctypes

    class P(ctypes.Structure):
        _fields_ = [("x", ctypes.c_double), ("y", ctypes.c_double)]
    cg = ctypes.CDLL("/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics")
    cg.CGEventCreate.restype = ctypes.c_void_p
    cg.CGEventCreate.argtypes = [ctypes.c_void_p]
    cg.CGEventGetLocation.restype = P
    cg.CGEventGetLocation.argtypes = [ctypes.c_void_p]
    cg.CGDisplayBounds.argtypes = [ctypes.c_uint32]
    cg.CGDisplayBounds.restype = _R
    ev = cg.CGEventCreate(None)
    pt = cg.CGEventGetLocation(ev)
    ids = (ctypes.c_uint32 * 16)()
    n = ctypes.c_uint32(0)
    cg.CGGetActiveDisplayList(16, ids, ctypes.byref(n))
    for i in range(n.value):
        b = cg.CGDisplayBounds(ids[i])
        if b.x <= pt.x < b.x + b.w and b.y <= pt.y < b.y + b.h:
            return {"index": i + 1, "x": b.x, "y": b.y, "w": b.w, "h": b.h, "cursor": (pt.x, pt.y)}
    b = cg.CGDisplayBounds(ids[0]) if n.value else _R(0, 0, 1920, 1080)
    return {"index": 1, "x": b.x, "y": b.y, "w": b.w, "h": b.h, "cursor": (pt.x, pt.y)}


VISION_PROMPT = ("You see a screenshot of the user's screen. The user asked: \"{ask}\". Find the ONE on-screen control they should "
                 "click for that. First check the app or site the ask names (e.g. Instagram, Safari) is actually visible; if it is not, "
                 "reply found false. It may be an icon with no text (a '+' means create/new, a gear means settings, Dock icons are apps). "
                 "Reply with JSON only: {{\"found\": true|false, \"box_2d\": [ymin, xmin, ymax, xmax] normalized 0-1000, TIGHT around the clickable icon or button itself (not the field or row next to it), "
                 "\"label\": \"short function name like 'Create button' or 'Safari icon'\", \"where\": \"e.g. left sidebar\", "
                 "\"app_visible\": true|false, \"confidence\": 0-1}}. If the control is not clearly visible, reply {{\"found\": false, \"why\": \"...\"}}. Never guess.")


def _vision_call(data_url: str, prompt: str, key: str, model: str = VISION_MODEL, timeout: float = 20) -> str:
    import urllib.request
    body = {"model": model, "temperature": 0, "max_tokens": 300,
            "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"url": data_url}}]}]}
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json",
                                          "HTTP-Referer": "http://127.0.0.1:4018", "X-Title": "Jarvis pointer"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())["choices"][0]["message"]["content"]


def locate_vision(utterance: str, *, key: str = "", call_fn=None, disp=None) -> dict:
    """Silent capture of the display under the cursor -> vision box -> global points. Screenshot deleted at once."""
    import base64
    import time as _t
    if call_fn is None and not live():
        return {"found": False, "error": True, "why": "pointer is off outside the live Face"}
    key = key or os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key and call_fn is None:
        return {"found": False, "error": True, "why": "vision key is dark"}
    d = disp or cursor_display()
    fd, shot = tempfile.mkstemp(prefix="jarvis-pv-", suffix=".png")
    os.close(fd)
    small = shot[:-4] + ".jpg"
    t0 = _t.time()
    try:
        if live():
            subprocess.run(["pkill", "-f", "Caches/jarvis/pointer_arrow"], capture_output=True)
            _t.sleep(0.12)
            subprocess.run(["screencapture", "-x", "-D", str(d["index"]), "-t", "png", shot], capture_output=True, timeout=8)
        if live():
            subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "70", "-Z", "1280", shot, "--out", small], capture_output=True, timeout=8)
            url = "data:image/jpeg;base64," + base64.b64encode(Path(small).read_bytes()).decode()
        else:
            url = "data:image/jpeg;base64,"  # tests: injected call_fn, no capture
        prompt = VISION_PROMPT.format(ask=(utterance or "")[:200])
        raw, errs = None, []
        for mdl in ([None] if call_fn else [VISION_MODEL, "google/gemini-2.5-flash-lite", "google/gemini-2.5-flash"]):
            try:
                raw = call_fn(url, prompt) if call_fn else _vision_call(url, prompt, key, mdl)
                break
            except Exception as exc:  # noqa: BLE001
                body = getattr(exc, "read", lambda: b"")()[:160].decode("utf-8", "replace") if hasattr(exc, "read") else ""
                errs.append(f"{mdl}: {type(exc).__name__} {getattr(exc, 'code', '')} {body}")
        if raw is None:
            try:
                with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
                    fh.write(json.dumps({"vision_errors": errs}) + "\n")
            except OSError:
                pass
            raise RuntimeError("all vision models failed")
        m = re.search(r"\{.*\}", raw or "", re.S)
        got = json.loads(m.group(0)) if m else {}
        if isinstance(got, dict):
            got["_ask"] = utterance
        got["refine"] = _refine(got, shot, d, call_fn=call_fn, key=key) if isinstance(got, dict) and got.get("found") else None
    except Exception as exc:  # noqa: BLE001 — network/model fault: caller may fall back
        return {"found": False, "error": True, "why": f"vision unavailable ({type(exc).__name__})"}
    finally:
        for f in (shot, small):
            try:
                os.unlink(f)
            except OSError:
                pass
    try:
        with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
            fh.write(json.dumps({"vision": got, "display": d.get("index"), "t_vision": round(_t.time() - t0, 2), "ts": _t.time()}) + "\n")
    except OSError:
        pass
    box = got.get("box_2d") if isinstance(got, dict) else None
    if not (got.get("found") and isinstance(box, list) and len(box) == 4) or float(got.get("confidence") or 0) < 0.7 \
            or got.get("app_visible") is False:
        return {"found": False, "why": str(got.get("why") or "not clearly on your screen")}
    y0, x0, y1, x1 = [float(v) / 1000.0 for v in box]
    x = d["x"] + (x0 + x1) / 2 * d["w"]
    y = d["y"] + (y0 + y1) / 2 * d["h"]
    ref = got.get("refine")
    if isinstance(ref, dict):
        if not ref.get("on_control"):
            return {"found": False, "why": "a closer look didn't confirm the control is there"}
        x, y = ref["x"], ref["y"]
    return {"found": True, "x": x, "y": y, "w": (x1 - x0) * d["w"], "h": (y1 - y0) * d["h"], "label": str(got.get("label") or ""),
            "where": str(got.get("where") or ""), "role": "vision", "source": "vision", "display": d}


def locate_smart(utterance: str, kws: list[str]) -> dict:
    """Vision first (icons, right display); OCR only if vision is unavailable, and only an exact keyword word."""
    v = locate_vision(utterance)
    if v.get("found") or not v.get("error"):
        return v
    o = locate(kws)
    if o.get("found") and str(o.get("label") or "").strip().lower() in kws:
        return o
    return {"found": False, "why": v.get("why") or "no exact match"}


REFINE_PT = 240  # second look: a 240x240 pt crop around the first box, re-asked for a tight box (fixes 16 pt / 25 px misses)
REFINE_PROMPT = ("This is a zoomed crop of the user's screen. Find the {label} (what the user wants: \"{ask}\"). Reply JSON only: "
                 "{{\"found\": true|false, \"box_2d\": [ymin, xmin, ymax, xmax] normalized 0-1000 within THIS crop, tight around the "
                 "clickable control itself}}. If that control is not in this crop, reply {{\"found\": false}}.")


def refine_box(first: dict, crop_png: str, crop_origin: tuple, crop_pts: float, ask: str, call) -> dict:
    """Pure part (testable): ask the model about the crop and map its box back to global points."""
    import base64
    url = "data:image/png;base64," + base64.b64encode(Path(crop_png).read_bytes()).decode()
    raw = call(url, REFINE_PROMPT.format(label=str(first.get("label") or "control"), ask=(ask or "")[:160]))
    m = re.search(r"\{.*\}", raw or "", re.S)
    got = json.loads(m.group(0)) if m else {}
    box = got.get("box_2d")
    if not (got.get("found") and isinstance(box, list) and len(box) == 4):
        return {"on_control": False}
    y0, x0, y1, x1 = [float(v) / 1000.0 for v in box]
    return {"on_control": True, "x": crop_origin[0] + (x0 + x1) / 2 * crop_pts, "y": crop_origin[1] + (y0 + y1) / 2 * crop_pts,
            "box": box}


def _refine(got: dict, shot: str, d: dict, *, call_fn=None, key: str = "") -> dict | None:
    box = got.get("box_2d")
    if not (isinstance(box, list) and len(box) == 4):
        return None
    y0, x0, y1, x1 = [float(v) / 1000.0 for v in box]
    cx, cy = (x0 + x1) / 2 * d["w"], (y0 + y1) / 2 * d["h"]  # display-local points
    ox = min(max(cx - REFINE_PT / 2, 0), max(d["w"] - REFINE_PT, 0))
    oy = min(max(cy - REFINE_PT / 2, 0), max(d["h"] - REFINE_PT, 0))
    try:
        wpx = int(subprocess.run(["sips", "-g", "pixelWidth", shot], capture_output=True, text=True).stdout.split()[-1])
    except (ValueError, IndexError):
        return None
    sc = wpx / d["w"]
    crop = shot[:-4] + "-crop.png"
    try:
        subprocess.run(["sips", "-c", str(int(REFINE_PT * sc)), str(int(REFINE_PT * sc)), "--cropOffset", str(int(oy * sc)), str(int(ox * sc)),
                        shot, "--out", crop], capture_output=True, timeout=8)
        call = call_fn or (lambda u, p: _vision_call(u, p, key, "google/gemini-2.5-flash"))
        r = refine_box(got, crop, (d["x"] + ox, d["y"] + oy), REFINE_PT, got.get("_ask", ""), call)
        try:
            with open(Path.home() / "jarvis-main" / "logs" / "pointer-debug.log", "a") as fh:
                fh.write(json.dumps({"refine": r, "first_center": [d["x"] + cx, d["y"] + cy]}) + "\n")
        except OSError:
            pass
        return r
    except Exception:  # noqa: BLE001 — refine is a check; a fault keeps the first box
        return None
    finally:
        try:
            os.unlink(crop)
        except OSError:
            pass


CURSOR_DEMO_RE = re.compile(r"\bshow\s+(?:me\s+)?(?:your|the)\s+(?:jarvis\s+)?cursor\b", re.I)


def cursor_demo() -> dict:
    """Harmless demo Evens can say: Jarvis's cursor glides from his pointer to the middle of that display and pulses. No click."""
    if not live():
        return {"ok": False, "spoken": "My cursor only runs in the live Face."}
    d = cursor_display()
    hx, hy = d["cursor"]
    tx, ty = d["x"] + d["w"] / 2, d["y"] + d["h"] / 2
    cur = _bin("pointer_cursor")
    if cur is None:
        return {"ok": False, "spoken": "I couldn't build my cursor overlay."}
    subprocess.Popen([str(cur), f"{hx:.1f}", f"{hy:.1f}", f"{tx:.1f}", f"{ty:.1f}"], stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True)
    return {"ok": True, "spoken": "Watch the screen your mouse is on: my blue Jarvis cursor is gliding to the middle now. Nothing gets clicked."}
