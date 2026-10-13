"""Resume a reply that the soft turn deadline cut short.

When a streamed reply is stopped at TURN_SOFT_SEC, the pipeline keeps the ask and the words
already said here, in process memory only (never written to disk, the bus or any log). A
follow-up "continue" takes that entry and asks the model to go on from the exact stop point.
Logs only see meta(): counts and ages, no text. Env: JARVIS_RESUME=0 off, JARVIS_RESUME_TTL_SEC.
"""
from __future__ import annotations

import os
import re
import threading
import time

CONTINUE_RE = re.compile(
    r"^\s*(?:(?:ok(?:ay)?|yes|yeah|sure|please|jarvis|sir|so)[,.!\s]+)*"
    r"(?:continue|go on|keep going|carry on|finish(?: (?:it|that|up|your answer))?|"
    r"pick (?:it )?up(?: where you (?:stopped|left off))?|continue where you (?:stopped|left off))"
    r"(?:[,\s]+(?:please|jarvis|sir))*\s*[.!?]*\s*$",
    re.I,
)
_LOCK = threading.Lock()
_STATE: dict[str, dict] = {}


def enabled() -> bool:
    return os.environ.get("JARVIS_RESUME", "1").strip().lower() not in {"0", "off", "false", "no"}


def ttl_sec() -> float:
    try:
        return max(10.0, float(os.environ.get("JARVIS_RESUME_TTL_SEC") or 600.0))
    except ValueError:
        return 600.0


def is_continue(text: str) -> bool:
    return bool(CONTINUE_RE.match(text or ""))


def strip_wrap(text: str, wrap: str) -> str:
    body = (text or "").strip()
    if wrap and body.endswith(wrap):
        body = body[: -len(wrap)].strip()
    return body


def store(key: str, *, ask: str, said: str, model: str = "", parts: int = 1) -> dict | None:
    if not enabled() or not (ask or "").strip():
        return None
    entry = {"ask": ask.strip(), "said": (said or "").strip(), "model": model or "", "parts": int(parts), "at": time.monotonic()}
    with _LOCK:
        _STATE[str(key)] = entry
    return entry


def pending(key: str, *, now: float | None = None) -> dict | None:
    with _LOCK:
        entry = _STATE.get(str(key))
        if entry and ((now if now is not None else time.monotonic()) - entry["at"]) > ttl_sec():
            _STATE.pop(str(key), None)
            entry = None
    return dict(entry) if entry else None


def take(key: str) -> dict | None:
    entry = pending(key)
    if entry:
        with _LOCK:
            _STATE.pop(str(key), None)
    return entry


def clear(key: str) -> None:
    with _LOCK:
        _STATE.pop(str(key), None)


def continue_prompt(entry: dict) -> str:
    said = entry.get("said") or ""
    return (
        "Continue your previous answer. It was cut off for time.\n"
        f"The question was: {entry.get('ask') or ''}\n"
        "What you already said, word for word:\n"
        f"<<<\n{said}\n>>>\n"
        "Go on from exactly where that stops, with the next sentence. Do not repeat, summarize or "
        "restate anything already said. No greeting, no apology, no preamble."
    )


def joined(entry: dict, more: str) -> str:
    return f"{(entry.get('said') or '').strip()} {(more or '').strip()}".strip()


def meta(entry: dict | None, *, used: bool = False, stored: bool = False) -> dict:
    """Metadata for the turn log. Counts only; never the ask or the words."""
    if not entry:
        return {"stored": stored, "used": used}
    return {
        "stored": stored,
        "used": used,
        "said_chars": len(entry.get("said") or ""),
        "parts": int(entry.get("parts") or 1),
        "age_s": round(max(0.0, time.monotonic() - float(entry.get("at") or time.monotonic())), 1),
    }
