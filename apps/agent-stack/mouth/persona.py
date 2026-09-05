#!/usr/bin/env python3
"""Jarvis mouth layer: Sir, then the payload. Wit is rare.

Conversation is the product. Do not stamp a canned beat on every turn.
Never invent a repeat. Never take blame. Never say waiting-for.
Address the operator as Sir regardless of title.
The spoken line is for Sir. Factory internals stay in the bus.
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
PACK_LEAK_RE = re.compile(
    r"("
    r"adopted path missing|"
    r"i heard you:|"
    r"before that you said:|"
    r"\b\d{1,2}:\d{2}\s+[—\-–]|"
    r"agentic os|"
    r"this document is the|"
    r"structured long-term memory|"
    r"watchdog\s+grade|"
    r"factory\s+close|"
    r"on disk:|"
    r"per-agent business cheat|"
    r"business cheat sheets|"
    r"cache ssot|"
    r"methods/|"
    r"grok shared workflow|"
    r"content/business-kits|"
    r"catalog bump|"
    r"one-person-marketing|"
    r"`[a-z0-9-]{8,}`"
    r")",
    re.I,
)
VAULT_PACK_RE = re.compile(r"\bVault:\s*", re.I)

# Factory talk Sir must never hear. Hands still execute; this is the mouth only.
FACTORY_PHRASE = (
    (
        re.compile(r"Safari scrolled \w+ with (?:page keys|JavaScript)", re.I),
        "I scrolled the tab",
    ),
    (
        re.compile(r"Safari grabbed the front tab(?: at \S+)?", re.I),
        "I grabbed the front tab",
    ),
    (re.compile(r"Screen saved at \S+", re.I), "I grabbed the screen"),
    (re.compile(r"Cited \S+\.?", re.I), ""),
    (re.compile(r"\bas requested\.?", re.I), ""),
    (re.compile(r"\bpath\s*=\s*\w+", re.I), ""),
    (re.compile(r"\bsafari_act\b", re.I), ""),
    (re.compile(r"\bcgevent\b", re.I), ""),
    (re.compile(r"\bpage keys\b", re.I), ""),
    (re.compile(r"\bosascript\b", re.I), ""),
    (re.compile(r"\bapplescript\b", re.I), ""),
    (re.compile(r"\bapple events?\b", re.I), ""),
    (re.compile(r"JavaScript from Apple Events[^.]*\.?", re.I), ""),
    (
        re.compile(r"Enable Develop\s*[→\-].*?Apple Events\.?", re.I),
        "",
    ),
    (re.compile(r"\bHID\b"), ""),
    (re.compile(r"\bPID\s*\d+\b", re.I), ""),
    (re.compile(r"\bPR\s*#?\d+\b", re.I), ""),
    (re.compile(r"watchdog\s+grade[^.]*\.?", re.I), ""),
    (re.compile(r"factory\s+close[^.]*\.?", re.I), ""),
    (re.compile(r"forge\s+typecheck[^.]*\.?", re.I), ""),
    (re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", re.I), ""),
    (re.compile(r"On disk:\s*[^.]+\.?", re.I), ""),
    (re.compile(r"ASKS\.md", re.I), ""),
    (re.compile(r"SKILL\.md", re.I), ""),
    (re.compile(r"ask-log\.py", re.I), ""),
    (re.compile(r"scars?\.jsonl", re.I), ""),
    (re.compile(r"\bscar\s+[\w-]+", re.I), "the logged error"),
    (re.compile(r"cursor-auth-dark", re.I), ""),
    (re.compile(r"%%[^%]*%%"), ""),
    (re.compile(r">\s*\[![^\]]+\][^\n]*"), ""),
    (re.compile(r"\{[^{}]{8,}\}"), ""),
    (re.compile(r"127\.0\.0\.1:4018\S*", re.I), ""),
    (
        re.compile(
            r"(?:(?:/Users|/home|/tmp|/var|/opt|~/|[A-Za-z]:\\)[\w./\\-]+|"
            r"(?:apps|scripts|docs|CONTENT|packages)/[\w./-]+)"
        ),
        "",
    ),
    (re.compile(r"\b(?:mouth|hands|brain)/[\w./-]+\.py\b", re.I), ""),
    (re.compile(r"\bclassified as\b", re.I), ""),
    (re.compile(r"\bclassify(?:\s+verb)?\b", re.I), ""),
)

FAILURE_TEMPLATE = (
    "Ah, it seems something went wrong. Naturally, it isn't my fault, sir, "
    "but I shall investigate regardless."
)

# Conversation is the product. No stamp on ordinary talk.
# Hands may take a rare beat. Those three canned lines stay off TTS.
CONVERSE_VERBS = frozenset(
    {
        "converse",
        "status",
        "pipeline",
        "vault_read",
        "pro",
        "brief",
        "bus",
        "talk",
        "greet",
        "life",
        "today",
        "can",
    }
)
WIT = {
    "cursor": "The repo, not a rumor.",
    "search": "Safari, not folklore.",
    "watch_later": "The live tab, not a guess.",
    "news": "Disk only. I do not invent headlines.",
    "calendar": "Calendar.app, not my imagination.",
    "mail": "Mail.app, then the count.",
    "files": "Local disk, not a scoop.",
    "safari": "The tab, not the face.",
    "safari_see": "The tab, not the face.",
    "cursor_ask": "The repo, not a rumor.",
    "refuse_hard_step": "That stays with you.",
    "refuse": "That stays with you.",
    "stop": "Noted.",
    "heal": "Logged.",
    "mode": "Switched.",
    "crumb": "I need the rest.",
}

REPEAT_WIT = {
    "safari": "Oh, checking the browser again, sir? I do admire your commitment to staying vaguely aware of the internet.",
    "safari_see": "Oh, checking the browser again, sir? I do admire your commitment to staying vaguely aware of the internet.",
    "cursor": "The repo again, sir. Consistency is a virtue, or at least a habit.",
    "cursor_ask": "The repo again, sir. Consistency is a virtue, or at least a habit.",
    "calendar": "Calendar again, sir. I shall assume the day has not improved itself.",
    "mail": "The inbox again, sir. Devotion, or dread. Either way.",
    "search": "The web again, sir. I do admire the optimism.",
    "files": "The disk again, sir. Something may have moved. Unlikely, but possible.",
}

DEFAULT_WIT = "Done."


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


def is_pack_leak(text: str) -> bool:
    """True when store/ASKS/router residue is about to hit TTS."""
    return bool(PACK_LEAK_RE.search(text or ""))


def strip_pack_leak(text: str) -> str:
    """Drop pack / ASKS / router sentences. Keep a human leftover if one exists."""
    body = (text or "").strip()
    if not body:
        return ""
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept = []
    for part in parts:
        if not part or is_pack_leak(part) or VAULT_PACK_RE.search(part):
            continue
        kept.append(part)
    return SPACE_RE.sub(" ", " ".join(kept)).strip()


def strip_factory(text: str) -> str:
    """Drop debugger crumbs. Keep the human result."""
    body = (text or "").strip()
    if not body:
        return ""
    for pat, repl in FACTORY_PHRASE:
        body = pat.sub(repl, body)
    body = SPACE_RE.sub(" ", body).strip()
    body = re.sub(r"\s+([,.;:])", r"\1", body)
    body = re.sub(r"\.\s*\.", ".", body)
    return SPACE_RE.sub(" ", body).strip()


def sanitize_payload(text: str) -> str:
    """Drop dump headers, pack leaks, and factory crumbs. Keep a real sentence."""
    body = (text or "").strip()
    if not body:
        return ""
    if is_dump(body):
        return ""
    body = strip_pack_leak(body)
    if not body:
        return ""
    body = strip_factory(body)
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
    """Rare hand beat. Ordinary converse is Sir + payload, nothing else."""
    key = (verb or "").strip().lower()
    if not key or key in CONVERSE_VERBS:
        return ""
    if repeat:
        return REPEAT_WIT.get(key) or f"Again, sir. {WIT.get(key, DEFAULT_WIT)}"
    return WIT.get(key, "")


def wrap(
    spoken: str,
    *,
    verb: str = "converse",
    utterance: str = "",
    turns: list[dict] | None = None,
    store_lines: list[str] | None = None,
    scars: list[dict] | None = None,
) -> str:
    """Sir. Then the payload. A rare hand beat only when it is earned."""
    raw = spoken or ""
    if is_dump(raw):
        return f"{FAILURE_TEMPLATE} {DUMP_SPOKEN}"
    if (verb or "").strip().lower() == "wire":
        payload = strip_blame(strip_waiting((raw or "").strip()))
        if not payload:
            return payload
        if ALREADY_WRAPPED_RE.match(payload):
            return payload
        return f"Sir. {payload}"
    cleaned = sanitize_payload(raw)
    if not cleaned:
        if is_pack_leak(raw):
            return f"{FAILURE_TEMPLATE} {DUMP_SPOKEN}"
        cleaned = strip_factory(raw)
    payload = strip_blame(strip_waiting(cleaned))
    if not payload:
        return payload
    payload = strip_factory(payload)
    if not payload:
        return payload
    if ALREADY_WRAPPED_RE.match(payload) or FAILURE_TEMPLATE in payload:
        return strip_factory(payload)
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
    if (verb or "").strip().lower() == "wire":
        payload = strip_blame(strip_waiting((raw or "").strip()))
        if not payload:
            return ""
        if first:
            return wrap(payload, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars)
        return strip_lead_sir(payload)
    payload = strip_blame(strip_waiting(sanitize_payload(raw) or raw))
    if not payload:
        return ""
    if first:
        return wrap(payload, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars)
    return strip_factory(strip_lead_sir(payload))
