"""Pure logic for the pointer hand: no screen, no subprocess, no network. Everything here is unit-tested.

Displays are dicts {index, x, y, w, h, main} in global top-left points (CoreGraphics space, y down).
"""
from __future__ import annotations

import math
import re

AGREE_PT = 80.0        # two locators within this many points are the same control
TAKEOVER_PT = 40.0     # the real mouse moved more than this while we waited -> Evens took the wheel
VISION_MIN_CONF = 0.7
AX_MIN_SCORE, AX_STRONG_SCORE = 3, 5
MIN_CALL_SEC = 2.0     # do not start a model call with less than this left in the budget

DESTRUCTIVE_RE = re.compile(
    r"\b(?:close|delete|remove|erase|discard|send|submit|post|publish|pay|buy|purchase|order|quit|log\s?out|sign\s?out|reset|format|"
    r"empty\s+trash|uninstall|unsubscribe|don'?t\s+save|transfer|deploy|merge|wipe|terminate|force\s+quit)\b", re.I)
STRICT_CONFIRM_RE = re.compile(r"^\s*confirm\s*[.!]*\s*$", re.I)


def contains(d: dict, x: float, y: float, inset: float = 0.0) -> bool:
    return d["x"] + inset <= x < d["x"] + d["w"] - inset and d["y"] + inset <= y < d["y"] + d["h"] - inset


def _dist(d: dict, x: float, y: float) -> float:
    dx = max(d["x"] - x, 0.0, x - (d["x"] + d["w"]))
    dy = max(d["y"] - y, 0.0, y - (d["y"] + d["h"]))
    return math.hypot(dx, dy)


def choose_display(displays: list[dict], cursor: tuple) -> dict | None:
    """The display under the cursor; off every display -> the nearest one (ties go to the main display)."""
    if not displays:
        return None
    x, y = cursor
    for d in displays:
        if contains(d, x, y):
            return d
    return min(displays, key=lambda d: (_dist(d, x, y), not d.get("main")))


def on_any_display(displays: list[dict], x: float, y: float) -> bool:
    return any(contains(d, x, y) for d in displays)


def capture_args(d: dict) -> list[str]:
    """screencapture region for one display. A global rect, because `-D n` numbering is not CoreGraphics list order."""
    return ["-R", f"{int(round(d['x']))},{int(round(d['y']))},{int(round(d['w']))},{int(round(d['h']))}"]


def valid_box(box):
    """Vision coordinates must form a finite nonempty normalized rectangle."""
    if not isinstance(box,list) or len(box)!=4 or any(type(v) not in (int,float) for v in box):return False
    if not all(math.isfinite(v) and 0<=v<=1000 for v in box):return False
    y0,x0,y1,x1=box
    return y0<y1 and x0<x1


def box_to_global(box: list, d: dict) -> dict:
    """Vision box [ymin, xmin, ymax, xmax] normalized 0-1000 over display d -> global centre and size in points."""
    y0, x0, y1, x1 = [min(max(float(v), 0.0), 1000.0) / 1000.0 for v in box]
    return {"x": d["x"] + (x0 + x1) / 2 * d["w"], "y": d["y"] + (y0 + y1) / 2 * d["h"],
            "w": (x1 - x0) * d["w"], "h": (y1 - y0) * d["h"]}


def to_appkit(x: float, y: float, main_height: float) -> tuple:
    """Global top-left point -> AppKit bottom-left point (the same flip pointer_arrow/pointer_cursor do in Swift)."""
    return (x, main_height - y)


def crop_origin(cx: float, cy: float, disp_w: float, disp_h: float, size: float) -> tuple:
    """Top-left of a size x size crop centred on (cx, cy), kept inside the display (display-local points)."""
    return (min(max(cx - size / 2, 0), max(disp_w - size, 0)), min(max(cy - size / 2, 0), max(disp_h - size, 0)))


def retina_scale(pixel_w: float, point_w: float) -> float:
    return pixel_w / point_w if pixel_w and point_w else 1.0


def is_destructive(label: str) -> bool:
    return bool(DESTRUCTIVE_RE.search(label or ""))


def confirm_line(label: str) -> str:
    if is_destructive(label):
        return (f"The arrow is on the {label}, and that can't easily be undone. Say exactly \"confirm\" and I click it once; "
                "\"yes\" or anything else drops it.")
    return f"The arrow is on the {label}. Say \"confirm\" and I click it once; anything else drops it."


def strict_confirm(utterance: str) -> bool:
    return bool(STRICT_CONFIRM_RE.match(utterance or ""))


def user_took_over(start: tuple, now: tuple | None, tol: float = TAKEOVER_PT) -> bool:
    """True when the real mouse is no longer where we left it. No reading counts as a takeover: never click on a guess."""
    if now is None:
        return True
    return math.hypot(now[0] - start[0], now[1] - start[1]) > tol


def rank_candidates(cands: list[dict], kws: list[str], disp: dict) -> dict | None:
    """Pick one target from AX / vision / OCR candidates, or None. Only candidates on Evens's display count.
    AX with an exact hit > confident vision > weak AX > OCR (exact keyword only). Reports whether a second source agrees."""
    ok: list[tuple[int, dict]] = []
    for c in cands:
        if not contains(disp, c["x"], c["y"], 2.0):
            continue
        src = c.get("source")
        if src == "ax" and float(c.get("score") or 0) >= AX_MIN_SCORE:
            ok.append((0 if float(c["score"]) >= AX_STRONG_SCORE else 2, c))
        elif src == "vision" and float(c.get("confidence") or 0) >= VISION_MIN_CONF:
            ok.append((1, c))
        elif src == "ocr" and str(c.get("label") or "").strip().lower() in kws:
            ok.append((3, c))
    if not ok:
        return None
    ok.sort(key=lambda t: t[0])
    best = ok[0][1]
    agreed = any(o is not best and o.get("source") != best.get("source") and math.hypot(o["x"] - best["x"], o["y"] - best["y"]) <= AGREE_PT
                 for _, o in ok[1:])
    return dict(best, agreed=agreed)


def remaining(deadline: float, now: float) -> float:
    return max(deadline - now, 0.0)


def ask_models(call, models: list, budget: float, per_call: float, clock) -> tuple:
    """Try models in order inside one total time budget. call(model, timeout) -> text. Returns (text|None, errors)."""
    start, errs = clock(), []
    for m in models:
        left = budget - (clock() - start)
        if left < MIN_CALL_SEC:
            break
        try:
            return call(m, min(per_call, left)), errs
        except Exception as exc:  # noqa: BLE001 — a model fault is an honest miss; the next model gets the remaining time
            errs.append(f"{m}: {type(exc).__name__}")
    return None, errs


def bin_state(src_mtime: float | None, bin_mtime: float | None) -> str:
    """Compiled overlay binary vs its Swift source: 'missing' (compile now), 'stale' (use it, recompile in the background), 'fresh'."""
    if bin_mtime is None:
        return "missing"
    return "stale" if src_mtime is not None and bin_mtime < src_mtime else "fresh"
