"""The operator's computer tool, shaped like the computer-use tools Claude and Codex are trained on (Evens 2026-10-16:
"learn how to control a screen, how a floating cursor works, and clicks ... if it did a mistake it can go back and fix
what it did on the screen").

- One tool, standard actions: screenshot, left_click, right_click, double_click, mouse_move, left_click_drag, scroll,
  type, key, wait, cursor_position.
- Every action that changes the screen returns a fresh screenshot of the same display, so the agent always sees the
  result of what it just did and can correct it (undo, go back, close, retry).
- Coordinates are pixels of the screenshot it was given; this module maps them to global mouse points, so a display
  that is not the main one, or a scaled image, never shifts a click.
- The blue Jarvis cursor glides to the target before a click lands (the visible floating cursor).
"""
from __future__ import annotations

import time

MAX_W = 1280  # screenshots are sent at most this wide: the size computer-use models are most accurate at
ACTIONS = ("screenshot", "left_click", "right_click", "double_click", "triple_click", "mouse_move", "left_click_drag", "scroll", "type",
           "key", "wait", "cursor_position")
CHANGES_SCREEN = {"left_click", "right_click", "double_click", "triple_click", "left_click_drag", "scroll", "type", "key"}


def image_scale(display: dict) -> float:
    """Image pixels per mouse point for this display's screenshot."""
    return min(1.0, MAX_W / float(display["w"]))


def to_global(display: dict, px: float, py: float) -> tuple[int, int]:
    """A pixel of the (scaled) screenshot of `display` -> the global mouse point."""
    s = image_scale(display)
    return int(round(display["x"] + px / s)), int(round(display["y"] + py / s))


def to_image(display: dict, gx: float, gy: float) -> tuple[int, int]:
    s = image_scale(display)
    return int(round((gx - display["x"]) * s)), int(round((gy - display["y"]) * s))


def hands_request(action: str, a: dict, display: dict) -> dict | None:
    """The Jarvis Hands request for one action (None for actions that need no input event)."""
    if action in ("left_click", "right_click", "double_click", "triple_click", "mouse_move"):
        x, y = to_global(display, a["coordinate"][0], a["coordinate"][1])
        if action == "mouse_move":
            return {"op": "move", "x": x, "y": y}
        return {"op": "click", "x": x, "y": y, "count": {"double_click": 2, "triple_click": 3}.get(action, 1),
                "button": "right" if action == "right_click" else "left"}
    if action == "left_click_drag":
        x, y = to_global(display, *a["start_coordinate"])
        x2, y2 = to_global(display, *a["coordinate"])
        return {"op": "drag", "x": x, "y": y, "x2": x2, "y2": y2}
    if action == "scroll":
        amount = int(a.get("scroll_amount") or 3)
        direction = str(a.get("scroll_direction") or "down")
        req = {"op": "scroll", "dy": -amount if direction == "down" else amount if direction == "up" else 0,
               "dx": -amount if direction == "right" else amount if direction == "left" else 0}
        if a.get("coordinate"):
            req["x"], req["y"] = to_global(display, *a["coordinate"])
        return req
    if action == "type":
        return {"op": "type", "text": str(a.get("text") or "")}
    if action == "key":
        return {"op": "key", "keys": str(a.get("text") or a.get("keys") or "")}
    return None


def settle(action: str) -> None:
    """Give the screen a moment to change before the after-shot (pages and menus animate)."""
    time.sleep(0.6 if action in ("left_click", "double_click", "triple_click", "key", "type") else 0.3)
