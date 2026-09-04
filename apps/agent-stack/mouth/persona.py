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
PUNCT_RE = re.compile(r"[^a-z0-9\s]+", re.I)
SPACE_RE = re.compile(r"\s+")

FAILURE_TEMPLATE = (
    "Ah, it seems something went wrong. Naturally, it isn't my fault, sir, "
    "but I shall investigate regardless."
)

WIT = {
    "can": "The short list, then.",
    "cursor": "The repo, not a rumor.",
    "pro": "Checking your professional skills.",
    "brief": "Checking your professional skills.",
    "bus": "Checking your professional skills.",
    "search": "Safari, not folklore.",
    "watch_later": "The live tab, not a guess.",
    "news": "Disk only. I do not invent headlines.",
    "calendar": "Calendar.app, not my imagination.",
    "mail": "Mail.app, then the count.",
    "files": "Local disk, not a scoop.",
    "safari": "Safari, as requested.",
    "life": "The store, not gossip.",
    "today": "The store, not a mood.",
    "skills": "On-disk slugs only.",
    "status": "Wires, not vibes.",
    "heal": "Scars first.",
    "make": "A skill on disk, or UNKNOWN.",
    "invoice": "Vault retrieve only.",
    "build": "Building it now.",
    "skill": "Loading the slug.",
    "converse": "As requested.",
    "refuse": "That stays with you.",
    "stop": "Noted.",
    "greet": "Present.",
    "mode": "Switched.",
    "crumb": "I need the rest.",
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

DEFAULT_WIT = "As requested."


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
        return REPEAT_WIT.get(key) or f"Again, sir. {WIT.get(key, DEFAULT_WIT)}"
    return WIT.get(key, DEFAULT_WIT)


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
    payload = strip_blame(strip_waiting(spoken or ""))
    if not payload:
        return payload
    if ALREADY_WRAPPED_RE.match(payload) or FAILURE_TEMPLATE in payload:
        return payload
    if is_failure(payload):
        return f"{FAILURE_TEMPLATE} {payload}"
    repeat = proven_repeat(utterance, turns, store_lines, scars, verb)
    beat = witty_beat(verb, repeat=repeat)
    if payload.lower().startswith(beat.lower()):
        return f"Sir. {payload}"
    return f"Sir. {beat} {payload}"
