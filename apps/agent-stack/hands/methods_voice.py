"""Voice and camera cores (Z108, X06, X07, X10, X19, X20, X21). No audio or camera I/O here.

Hardware, GUI and live-mic fidelity are blockers; these are the testable state machines.
"""
from __future__ import annotations

import math
import re

WAKE = re.compile(r"\bhey[, ]+jarvis\b", re.I)
CAPTURE_SEC = 5.0          # X06/X10 source: fixed 5 s window after the wake word
FOLLOW_UP_SEC = 12.0       # our choice for the Z108 conversation window; tune with Evens


# ---- Z108 / X06 / X10: wake word, sleep state, three-state HUD ----------------------
def hud_state(awake, speaking):
    """X10 HUD labels; speaking wins."""
    return "SPEAKING" if speaking else ("LISTENING" if awake else "STANDBY")


def hear(state, text, now, *, speaking=False):
    """state = {'awake_until': float}. Side talk while asleep is ignored (Z108)."""
    awake = now < state.get("awake_until", 0.0)
    if speaking:  # never react to Jarvis's own voice or side talk mid-reply
        return {**state}, {"action": "ignore", "hud": "SPEAKING", "orb": "speaking"}
    m = WAKE.search(text)
    if m:
        cmd = text[m.end():].strip(" ,.")
        new = {**state, "awake_until": now + CAPTURE_SEC + FOLLOW_UP_SEC}
        return new, {"action": "command" if cmd else "wake", "command": cmd, "hud": "LISTENING", "orb": "awake"}
    if awake:
        return {**state}, {"action": "command", "command": text.strip(), "hud": "LISTENING", "orb": "awake"}
    return {**state}, {"action": "ignore", "hud": "STANDBY", "orb": "asleep"}


def capture_window(utterance_sec):
    """X10 GUESS made explicit: a fixed 5 s capture cuts long commands."""
    return {"captured_sec": min(utterance_sec, CAPTURE_SEC), "truncated": utterance_sec > CAPTURE_SEC}


# ---- X07: edge-tts parameters (rate -8 %, pitch -6 Hz) --------------------------------
def edge_tts_args(voice="en-GB-ThomasNeural", rate_pct=-8, pitch_hz=-6):
    if not re.fullmatch(r"[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural", voice) or abs(rate_pct) > 50 or abs(pitch_hz) > 50:
        raise ValueError("Unsupported voice or out-of-range prosody")
    return ["--voice", voice, f"--rate={rate_pct:+d}%", f"--pitch={pitch_hz:+d}Hz"]


# ---- X19: hand-anchored widget scale from landmarks ------------------------------------
def hand_scale(thumb_tip, index_tip, wrist, middle_base, *, lo=0.4, hi=2.0):
    """Openness = thumb-index gap / palm size, mapped to [lo, hi]. Points are (x, y)."""
    palm = math.dist(wrist, middle_base)
    if palm <= 0:
        raise ValueError("Degenerate hand landmarks")
    openness = max(0.0, min(1.0, math.dist(thumb_tip, index_tip) / palm / 1.5))
    return {"openness": round(openness, 3), "scale": round(lo + (hi - lo) * openness, 3), "anchor": index_tip}


# ---- X20 / X21: desk-view camera ---------------------------------------------------------
def desk_view(state, event, **kw):
    """Voice-toggled second camera: closed -> open -> asked -> closed (after the answer)."""
    s = state or "closed"
    if event == "toggle" and s == "closed":
        return "open", {"camera": "on"}
    if event == "ask" and s == "open":
        if not kw.get("frame") or not str(kw.get("question", "")).strip():
            raise ValueError("A frame and a question are both needed")
        return "asked", {"to_model": {"frame": kw["frame"], "question": kw["question"].strip()}}
    if event == "answer" and s == "asked":
        return "closed", {"camera": "off", "answer": kw.get("answer", "")}
    if event == "close":
        return "closed", {"camera": "off"}
    raise ValueError(f"Event {event!r} is not valid while {s}")


def compare(identified, specs, keys, *, want=None):
    """X21: after a live-frame ID, compare against a known item by spec, with the reason and next step."""
    if identified not in specs:
        return {"ok": False, "spoken": f"I do not have specs for {identified}; show me the label or name it."}
    if want is None:
        rows = ", ".join(f"{k} {specs[identified].get(k)}" for k in keys)
        return {"ok": True, "spoken": f"That looks like {identified}. {rows}. Want me to compare it with another?"}
    if want not in specs:
        return {"ok": False, "spoken": f"I do not have specs for {want}."}
    diff = [(k, specs[identified].get(k), specs[want].get(k)) for k in keys if specs[identified].get(k) != specs[want].get(k)]
    why = "; ".join(f"{k}: {a} vs {b}" for k, a, b in diff) or "no difference on the listed specs"
    return {"ok": True, "differences": diff, "spoken": f"{identified} vs {want}: {why}. Shall I note it for the project?"}
