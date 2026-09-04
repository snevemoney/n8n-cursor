#!/usr/bin/env python3
"""Jarvis mouth layer: Sir, one witty beat, then the payload.

Wit never delays a hand. Never invent a repeat. Never take blame.
Never say waiting-for. Address the operator as Sir regardless of title.
"""
from __future__ import annotations

import re

WAITING_RE = re.compile(r"\bwaiting for\b", re.I)
BLAME_RE = re.compile(
    r"\b("
    r"i(?:'m| am) sorry|"
    r"my (?:fault|bad)|"
    r"i failed|"
    r"i messed(?: up)?"
    r")\b",
    re.I,
)
ALREADY_WRAPPED_RE = re.compile(r"^\s*sir[.,]", re.I)
LEAD_SIR_RE = re.compile(r"^\s*sir[.,]\s*", re.I)
PUNCT_RE = re.compile(r"[^a-z0-9\s]+", re.I)
SPACE_RE = re.compile(r"\s+")
DUMP_RE = re.compile(
    r"("
    r"%%generated|"
    r"ask-log\.py|"
    r"do not hand-edit|"
    r"\[!abstract\]|"
    r">\s*\[!|"
    r"\*\*\d{2,}\s+asks\*\*"
    r")",
    re.I,
)
DUMP_SPOKEN = "I will not read a file dump aloud."

FAILURE_TEMPLATE = (
    "Ah, it seems something went wrong. Naturally, it isn't my fault, sir, "
    "but I shall investigate regardless."
)

WIT = {
    "can": "The short list.",
    "cursor": "The repo.",
    "pro": "",
    "brief": "",
    "bus": "",
    "search": "Safari.",
    "watch_later": "The live tab.",
    "news": "Disk only.",
    "calendar": "Calendar.app.",
    "mail": "Mail.app.",
    "files": "Local disk.",
    "safari": "Safari.",
    "life": "",
    "today": "",
    "skills": "",
    "status": "",
    "heal": "",
    "make": "",
    "invoice": "",
    "build": "",
    "skill": "",
    "converse": "",
    "talk": "",
    "farewell": "",
    "refuse": "That stays with you.",
    "stop": "",
    "greet": "",
    "mode": "",
    "crumb": "",
}

REPEAT_WIT = {
    "safari": "Oh, checking the browser again, sir? I do admire your commitment to staying vaguely aware of the internet.",
    "cursor": "The repo again, sir. Consistency is a virtue, or at least a habit.",
    "calendar": "Calendar again, sir. I shall assume the day has not improved itself.",
    "mail": "The inbox again, sir. Devotion, or dread. Either way.",
    "pro": "The professional skills again, sir. Repetition is a kind of scholarship.",
    "brief": "The professional skills again, sir. Repetition is a kind of scholarship.",
    "bus": "The professional skills again, sir. Repetition is a kind of scholarship.",
    "search": "The web again, sir. I do admire the optimism.",
    "files": "The disk again, sir. Something may have moved. Unlikely, but possible.",
}

DEFAULT_WIT = ""
AS_REQUESTED_RE = re.compile(r"\bas requested\b", re.I)
SCAR_HOMEWORK_RE = re.compile(
    r"("
    r"Scar cursor-auth-dark already saved|"
    r"do not call agent -p again this sitting|"
    r"From the store, not a dark Cursor call|"
    r"Cursor login scar is saved"
    r")",
    re.I,
)
HOMEWORK_SPOKEN = "I'm here. What do you want done?"


def normalize_ask(text: str) -> str:
    low = PUNCT_RE.sub(" ", (text or "").lower())
    return SPACE_RE.sub(" ", low).strip()


def is_failure(spoken: str) -> bool:
    body = (spoken or "").strip()
    if not body:
        return False
    if body.upper().startswith("UNKNOWN"):
        return True
    if "returned no" in body.lower() and "unknown" in body.lower():
        return True
    return False


def strip_waiting(text: str) -> str:
    """Drop any sentence that claims we are waiting. Wit is not a delay."""
    body = (text or "").strip()
    if not body or not WAITING_RE.search(body):
        return body
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept = [p for p in parts if p and not WAITING_RE.search(p)]
    return " ".join(kept).strip()


def strip_blame(text: str) -> str:
    body = (text or "").strip()
    if not body:
        return body
    return BLAME_RE.sub("that failed", body)


def is_dump(text: str) -> bool:
    """True when retrieve handed us a generated log, not a spoken answer."""
    body = (text or "").strip()
    if not body:
        return False
    if DUMP_RE.search(body):
        return True
    if body.startswith("%%") or body.startswith("> [!"):
        return True
    return False


def sanitize_payload(text: str) -> str:
    """Drop dump headers. Keep a real sentence if one survives."""
    body = (text or "").strip()
    if not body:
        return ""
    if is_dump(body):
        return ""
    body = re.sub(r"%%[^%]+%%", " ", body)
    body = re.sub(r">\s*\[![^\]]+\][^\n]*", " ", body)
    return SPACE_RE.sub(" ", body).strip()


def strip_lead_sir(text: str) -> str:
    return LEAD_SIR_RE.sub("", (text or "").strip()).strip()


def proven_repeat(
    utterance: str,
    turns: list[dict] | None = None,
    store_lines: list[str] | None = None,
    scars: list[dict] | None = None,
    verb: str = "",
) -> bool:
    """True only when sitting, store, or scars prove this ask already happened.

    No history → no 'again'. Do not invent a streak.
    """
    ask = normalize_ask(utterance)
    if not ask or len(ask) < 4:
        return False
    hits = 0
    for row in turns or []:
        if not isinstance(row, dict):
            continue
        prior = normalize_ask(str(row.get("user") or ""))
        if prior and prior == ask:
            hits += 1
    for line in store_lines or []:
        blob = normalize_ask(str(line))
        if ask and blob and ask in blob:
            hits += 1
    for row in scars or []:
        if not isinstance(row, dict):
            continue
        if verb and str(row.get("verb") or "") == verb and int(row.get("hits") or 0) >= 1:
            hits += 1
            continue
        mark = normalize_ask(str(row.get("ask") or row.get("symptom") or ""))
        if ask and mark and ask == mark:
            hits += 1
    return hits >= 1


def witty_beat(verb: str, *, repeat: bool = False) -> str:
    key = (verb or "").strip().lower()
    if repeat:
        beat = REPEAT_WIT.get(key) or (f"Again, sir. {WIT.get(key, DEFAULT_WIT)}".strip())
    else:
        beat = WIT.get(key, DEFAULT_WIT)
    beat = (beat or "").strip()
    if AS_REQUESTED_RE.search(beat):
        return ""
    return beat


def wrap(
    spoken: str,
    *,
    verb: str = "converse",
    utterance: str = "",
    turns: list[dict] | None = None,
    store_lines: list[str] | None = None,
    scars: list[dict] | None = None,
) -> str:
    """Sir. One witty beat. Then the real payload. Hand already ran."""
    raw = spoken or ""
    if is_dump(raw) or SCAR_HOMEWORK_RE.search(raw):
        if is_dump(raw):
            return f"{FAILURE_TEMPLATE} {DUMP_SPOKEN}"
        payload = HOMEWORK_SPOKEN
    else:
        payload = strip_blame(strip_waiting(sanitize_payload(raw) or raw))
    if not payload:
        return payload
    payload = AS_REQUESTED_RE.sub("", payload)
    payload = SPACE_RE.sub(" ", payload).strip()
    if ALREADY_WRAPPED_RE.match(payload) or FAILURE_TEMPLATE in payload:
        return payload
    if is_failure(payload):
        return f"{FAILURE_TEMPLATE} {payload}"
    repeat = proven_repeat(utterance, turns, store_lines, scars, verb)
    beat = witty_beat(verb, repeat=repeat)
    if not beat:
        return f"Sir. {payload}"
    if payload.lower().startswith(beat.lower()):
        return f"Sir. {payload}"
    return f"Sir. {beat} {payload}"


def stream_delta(
    chunk: str,
    *,
    first: bool,
    verb: str = "converse",
    utterance: str = "",
    turns: list[dict] | None = None,
    store_lines: list[str] | None = None,
    scars: list[dict] | None = None,
) -> str:
    """Wrap once on the first speakable sentence. Later chunks are payload only."""
    raw = chunk or ""
    if is_dump(raw):
        return wrap(raw, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars) if first else ""
    payload = strip_blame(strip_waiting(sanitize_payload(raw) or raw))
    if not payload:
        return ""
    if first:
        return wrap(payload, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars)
    return strip_lead_sir(payload)
