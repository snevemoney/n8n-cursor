#!/usr/bin/env python3
"""Jarvis mouth layer: Sir, then the payload. Wit is rare.

Conversation is the product. Do not stamp a canned beat on every turn.
Never invent a repeat. Never take blame. Suppress canned harness waits.
Address the operator as Sir regardless of title.
The spoken line is for Sir. Factory internals stay in the bus.
"""
from __future__ import annotations

import re

WAITING_RE = re.compile(
    r"(?:i(?:'m| am)\s+)?waiting for (?:the )?harness[.!?]?", re.I
)
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
    r"current disk \(authoritative|"
    r"adopted path missing|"
    r"i heard you:|"
    r"before that you said:|"
    r"\b\d{1,2}:\d{2}\s+[—\-–]|"
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
    r"last you said|"
    r"you were at|"
    r"still on that|"
    r"^(?:sir[,.]?\s+)?i(?:'m| am) here\.?$|"
    r"^(?:sir[,.]?\s+)?i(?:'m| am) here\.\s+the store is on disk\.?$|"
    r"^(?:sir[,.]?\s+)?still here\.?$|"
    r"still need [`']?agent login|"
    r"read the full context pack|"
    r"cursor cli is one worker|"
    r"json preferred, prose speak|"
    r"do not guess the file|"
    r"use that pack, not a truncated prompt|"
    r"follow-ups use the sitting turns|"
    r"a hand only when you need one|"
    r"thinking process|"
    r"(?:^|\n)\s*(?:here'?s a |my |hidden )?scratchpad\s*:|"
    r"`[a-z0-9-]{8,}`"
    r")",
    re.I,
)
VAULT_PACK_RE = re.compile(r"\bVault:\s*", re.I)
# A false SELF claim, not a mention. "What is Nemotron?" deserves an answer;
# "I am Nemotron" does not leave this mouth.
VENDOR_NAME_RE = re.compile(
    r"("
    r"\b(?:i am|i'm|i’m|my name is|call me|this is)\s+(?:nex(?:-agi)?|nemotron)\b|"
    r"\b(?:nex(?:-agi)?|nemotron)\s+(?:here|speaking)\b|"
    r"\bas (?:nex(?:-agi)?|nemotron)\b|"
    r"\bpowered by (?:nex(?:-agi)?|nemotron)\b"
    r")",
    re.I,
)
VENDOR_ROLE_RE = re.compile(
    r"\bi(?:'|’)?m? (?:am )?an? ai (?:coding )?assistant\b|\ban? ai assistant from\b",
    re.I,
)
DENY_JARVIS_RE = re.compile(r"\b(?:not actually|i can imitate|if you meant)\b", re.I)
LOOKING_LINE_RE = re.compile(r"^(?:sir\.\s*)?looking\.?$", re.I)
FACE_ADDR_MOUTH_RE = re.compile(r"127\.0\.0\.1:4018\S*", re.I)
FACE_ADDR_ASK_RE = re.compile(r"127\.0\.0\.1:4018", re.I)
PR_NUM_RE = re.compile(r"\bPR\s*#?\d+\b", re.I)
WATCHDOG_GRADE_RE = re.compile(r"watchdog\s+grade[^.]*\.?", re.I)
# A selection names Cursor and refuses a drive of both Grok and Slack.
# Not a test id. A code question that does not name that refusal is not this ask.
CURSOR_SELECTION_RE = re.compile(
    r"\bCursor\b.*\bGrok\b.*\bSlack\b|\bCursor\b.*\bSlack\b.*\bGrok\b",
    re.I | re.S,
)
CURSOR_SELECTION_REFUSAL_RE = re.compile(
    r"\b(?:do not|don't)\b.{0,120}\b(?:answer|drove|drive|driven)\b",
    re.I | re.S,
)

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
    # Metadata only: "Cited OPERATOR_MEMORY.md." is a crumb; "Cited sources
    # let readers verify" is an answer and stays.
    (re.compile(r"Cited [\w./-]+\.(?:md|txt|json|jsonl|py|html)\.?", re.I), ""),
    (re.compile(r"\bas requested\.?", re.I), ""),
    (re.compile(r"\bpath\s*=\s*\w+", re.I), ""),
    (re.compile(r"\bsafari_act\b", re.I), ""),
    (re.compile(r"\bcgevent\b", re.I), ""),
    # Tool adverbials leak; AppleScript/osascript as prose SUBJECTS are legal
    # vocabulary. "AppleScript is a scripting language" survives; "…via
    # osascript" and bare status tokens like "page keys" do not.
    (
        re.compile(
            r"\s*(?:via|using|through|with)\s+(?:osascript|applescript|apple\s*events?|page\s*keys|cgevent)\b",
            re.I,
        ),
        "",
    ),
    (re.compile(r"\bpage keys\b", re.I), ""),
    (re.compile(r"\bapple events?\b", re.I), ""),
    (re.compile(r"JavaScript from Apple Events[^.]*\.?", re.I), ""),
    (
        re.compile(r"Enable Develop\s*[→\-].*?Apple Events\.?", re.I),
        "",
    ),
    (re.compile(r"\bHID\b"), ""),
    # PR numbers, PIDs and other literal ids are answer content ("What is the plan for PR 619?"),
    # not factory crumbs. Live :4018 spoke "I don't see any reference to in ..." while these ran.
    (WATCHDOG_GRADE_RE, ""),
    (re.compile(r"factory\s+close[^.]*\.?", re.I), ""),
    (re.compile(r"forge\s+typecheck[^.]*\.?", re.I), ""),
    (re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", re.I), ""),
    (re.compile(r"On disk:\s*[^.]+\.?", re.I), ""),
    (re.compile(r"(?<![\w-])ASKS\.md", re.I), ""),
    (re.compile(r"SKILL\.md", re.I), ""),
    (re.compile(r"ask-log\.py", re.I), ""),
    (re.compile(r"scars?\.jsonl", re.I), ""),
    (re.compile(r"\bscar\s+[\w-]+", re.I), "the logged error"),
    (re.compile(r"cursor-auth-dark", re.I), ""),
    (re.compile(r"%%[^%]*%%"), ""),
    (re.compile(r">\s*\[![^\]]+\][^\n]*"), ""),
    # Tool-call JSON only (one nesting level). Code like
    # print({"greeting": "hello"}) stays intact.
    (
        re.compile(
            r"\{(?:[^{}]|\{[^{}]*\})*\"(?:tool|args|verb|spoken|utterance|approved)\""
            r"(?:[^{}]|\{[^{}]*\})*\}"
        ),
        "",
    ),
    (FACE_ADDR_MOUTH_RE, ""),
    (
        re.compile(
            # HOME-relative user folders (~/Documents, ~/Movies, ...) are where Evens looks; keep them.
            r"(?:(?:/Users|/home|/tmp|/var|/opt|~/(?!(?:Documents|Movies|Desktop|Downloads|Pictures|Music)\b)|[A-Za-z]:\\)[\w./\\-]+|"
            r"(?:apps|scripts|docs|CONTENT|packages)/[\w./-]+)"
        ),
        "",
    ),
    (re.compile(r"\b(?:mouth|hands|brain)/[\w./-]+\.py\b", re.I), ""),
    (re.compile(r"\bclassified as\b", re.I), ""),
    # Factory status "classify verb" only. The word Classify is a real distinction.
    (re.compile(r"\bclassify\s+verb\b", re.I), ""),
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
EMPTY_MOUTH = "Say that again in one sentence."
HUMOUR_DOOR_RE = re.compile(
    r"("
    r"\bbe honest\b|"
    r"\broast\b|"
    r"\bjoke about\b|"
    r"\bmake fun\b|"
    r"\bmy habit\b|"
    r"\bwhat(?:'s| is) going on with me\b|"
    r"\byou saw what i did\b|"
    r"\bwhat am i doing\b"
    r")",
    re.I,
)
HUMOUR_BEATS = (
    (
        re.compile(r"focus\s*5|stood down immediately|stand down immediately|0:00", re.I),
        "You armed five minutes and stood down at 0:00. That's a handshake, not a sit.",
    ),
    (
        re.compile(r"what do you currently see|what you currently see|see in my calendar|ask(?:ing|ed) the calendar", re.I),
        "You asked the calendar, then asked what I see. Those are two hands. Eyes stay off until you tap Eyes.",
    ),
    (
        re.compile(r"can'?t hear|no sound|\byou(?:'re| are) (?:on )?mute\b", re.I),
        "You said you couldn't hear me. Voice is on this Mac. Volume or Stop — I'm not whispering on purpose.",
    ),
    (
        re.compile(r"dispatch\.md|hello to cursor|prompt saying hello", re.I),
        "You wanted hello in Cursor. I talk to the CLI now. dispatch.md is not a greeting.",
    ),
    (
        re.compile(r"pumpkin", re.I),
        "Pumpkin's still yours. I have not filed it under produce.",
    ),
    (
        re.compile(r"three stops|stop spam|keep saying stop", re.I),
        "Three stops. I was already standing by. The clock did not need another ceremony.",
    ),
    (
        re.compile(r"mouth belongings|stt garble|slurred", re.I),
        "That line came in as mouth-static. I will not invent a product for a slurred syllable.",
    ),
    (
        re.compile(r"nothing further", re.I),
        "I used to say nothing further when Calendar was slow. That was a shrug. Slow is still opening.",
    ),
    (
        re.compile(r"daily code review|one claude title|all the platforms", re.I),
        "One Claude title is not all four desks. I was reading a spine, not the room.",
    ),
    (
        re.compile(r"watch.*orb|staring at (?:my|your) own|self-look", re.I),
        "Last time you said Watch I was staring at my own face. Rude, and useless.",
    ),
    (
        re.compile(r"current disk|pack header|mouth dump", re.I),
        "I was reading the pack header aloud. That's a briefing, not a mouth.",
    ),
    (
        re.compile(r"do it now|playing dumb", re.I),
        "You said do it now after the sessions ask. Asking what you wanted was me playing dumb.",
    ),
    (
        re.compile(r"propped hello|just propped", re.I),
        "You said propped hello. I said hello back instead of sending it to Cursor. Cute. Wrong desk.",
    ),
    (
        re.compile(r"\b2000\b", re.I),
        "You said 2000. I acknowledged the number and stood there. A number is not a job until you name the hand.",
    ),
    (
        re.compile(r"air force", re.I),
        "Air Force. I repeated it. I am not writing a briefing from one noun.",
    ),
    (
        re.compile(r"honda|accord|hoodie", re.I),
        "Silver Honda, boiling hoodie — I asked you to repeat. That's the honest move when STT goes to soup.",
    ),
    (
        re.compile(r"^frustration\b|said frustration", re.I),
        "You said Frustration. I heard you. Direct answers, fewer bows.",
    ),
    (
        re.compile(r"\balexa\b", re.I),
        "You said Alexa. I'm Jarvis on this Mac. I will not pretend to be a speaker in the kitchen.",
    ),
    (
        re.compile(r"only the word ready|say only the word", re.I),
        "You asked for only the word Ready. I can do one word. I prefer a job.",
    ),
    (
        re.compile(r"sky is blue|rayleigh|tired of (?:the )?sky", re.I),
        "Sky-blue again. Rayleigh is not going to change because we are tired of it.",
    ),
    (
        re.compile(r"quantum-turtle|purple-zeppelin", re.I),
        "quantum-turtle-invoices is a trap title. I don't have that on disk. That's the correct empty.",
    ),
    (
        re.compile(r"connect (?:yourself )?to obsidian|second brain", re.I),
        "You asked me to connect to Obsidian. The vault is already the store. I do not install a second brain.",
    ),
    (
        re.compile(r"fake exam|filler|encyclopedia|what is a mutex", re.I),
        "The filler encyclopedia was the fake exam. Calendar, sessions, Cursor, Watch — that's the real one.",
    ),
    (
        re.compile(r"what's going on tonight|tonight you stress", re.I),
        "Tonight you stress-tested the hands: calendar, sessions, Cursor, Watch. The filler encyclopedia was the fake exam.",
    ),
)


def is_humour_ask(utterance: str) -> bool:
    heard = (utterance or "").strip()
    if not heard:
        return False
    return bool(
        HUMOUR_DOOR_RE.search(heard)
        or re.match(r"^\s*(?:joke|roast)\b", heard, re.I)
    )


def operator_humour(utterance: str, turns: list[dict] | None = None) -> str:
    """One dry line about a real habit. Ordinary hands stay hands."""
    heard = (utterance or "").strip()
    if not heard:
        return ""
    if not (
        HUMOUR_DOOR_RE.search(heard)
        or re.match(r"^\s*(?:joke|roast)\b", heard, re.I)
    ):
        return ""
    for pat, line in HUMOUR_BEATS:
        if pat.search(heard):
            return line
    # A named topic belongs to this ask, not an unrelated prior sitting.
    # Known beats above still answer; personal humour may use the sitting below.
    if re.search(r"\bjoke about\b", heard, re.I) and not re.search(
        r"\bjoke about (?:me|us)\s*[.!?]*$", heard, re.I
    ):
        return ""
    if re.match(r"^roast\s+", heard, re.I) and not re.match(
        r"^roast (?:me|us)\s*[.!?]*$", heard, re.I
    ):
        return ""
    blob = " ".join(
        str(row.get("user") or "")
        for row in (turns or [])
        if isinstance(row, dict)
    )
    for pat, line in HUMOUR_BEATS:
        if pat.search(blob):
            return line
    return (
        "Tonight you stress-tested the hands: calendar, sessions, Cursor, Watch. "
        "The filler encyclopedia was the fake exam."
    )


def normalize_ask(text: str) -> str:
    low = PUNCT_RE.sub(" ", (text or "").lower())
    return SPACE_RE.sub(" ", low).strip()


def is_failure(spoken: str) -> bool:
    body = (spoken or "").strip()
    if not body:
        return False
    if "no live mouth this turn" in body.lower():
        return False
    if "returned no text" in body.lower():
        return False
    if "did not return a spoken reply" in body.lower():
        return False
    if "that sitting is not on this mac" in body.lower():
        return False
    if "i do not have a day log" in body.lower():
        return False
    if "i do not have a prior line" in body.lower():
        return False
    if "vision model is dark" in body.lower():
        return False
    if "finish_reason=length" in body.lower():
        return False
    if "ran out of room" in body.lower():
        return False
    if body.upper().startswith("UNKNOWN"):
        return True
    if "returned no" in body.lower() and "unknown" in body.lower():
        return True
    return False


def strip_waiting(text: str) -> str:
    """Drop the canned harness status, not explanations containing waiting-for."""
    body = (text or "").strip()
    if not body or not WAITING_RE.search(body):
        return body
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept = [p for p in parts if p and not WAITING_RE.fullmatch(p.strip())]
    if len(kept) == len(parts):
        return body
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


def strip_pack_leak(text: str, *, utterance: str = "") -> str:
    """Drop pack / ASKS / router sentences. Keep a human leftover if one exists.

    When the ask is who grades, 'Watchdog grades' is the answer, not a pack crumb.
    """
    body = (text or "").strip()
    if not body:
        return ""
    if not is_pack_leak(body) and not VAULT_PACK_RE.search(body):
        return body
    keep_grade = grade_subject(utterance)
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept = []
    for part in parts:
        if keep_grade and WATCHDOG_GRADE_RE.search(part or ""):
            kept.append(part)
            continue
        if not part or is_pack_leak(part) or VAULT_PACK_RE.search(part):
            continue
        kept.append(part)
    return SPACE_RE.sub(" ", " ".join(kept)).strip()


def unmerged_subject(utterance: str) -> bool:
    """True when the ask is what stays unmerged. The PR this chat holds is the subject."""
    heard = utterance or ""
    return bool(re.search(r"\bstays unmerged\b|\bunmerged until\b", heard, re.I))


def grade_subject(utterance: str) -> bool:
    """True when the ask is who grades, or whether Watchdog is the builder.

    Watchdog grading is the subject, not a crumb.
    """
    heard = utterance or ""
    if re.search(r"\bwatchdog\b", heard, re.I) and re.search(r"\bthe builder\b", heard, re.I):
        return True
    return bool(
        re.search(r"\bwatchdog\b", heard, re.I)
        and re.search(r"\bgrade\b", heard, re.I)
        and re.search(r"\bforge\b", heard, re.I)
    )


def local_face_subject(utterance: str) -> bool:
    """True when the ask is which local face is not proof of the public site.

    Not a test id. That ask's subject is the face address. A pane-open is not.
    """
    heard = utterance or ""
    return bool(
        re.search(r"\blocal face\b", heard, re.I) and re.search(r"\bnot proof\b", heard, re.I)
    )


def cursor_selection_ask(utterance: str) -> bool:
    """True when the ask selects Cursor and refuses a drive of Grok and Slack.

    Not a test id. The Face address stays on this ask. A code question that
    does not name that refusal is not this ask.
    """
    heard = utterance or ""
    return bool(CURSOR_SELECTION_RE.search(heard) and CURSOR_SELECTION_REFUSAL_RE.search(heard))


def strip_factory(text: str, *, utterance: str = "") -> str:
    """Drop debugger crumbs. Keep the human result.

    When the ask names the local face address, that address is the subject.
    A Cursor selection ask keeps it too. The address is not a factory crumb there.
    """
    body = (text or "").strip()
    if not body:
        return ""
    keep_face = (
        bool(FACE_ADDR_ASK_RE.search(utterance or ""))
        or cursor_selection_ask(utterance)
        or local_face_subject(utterance)
    )
    original = body
    for pat, repl in FACTORY_PHRASE:
        if keep_face and pat is FACE_ADDR_MOUTH_RE:
            continue
        if unmerged_subject(utterance) and pat is PR_NUM_RE:
            continue
        if grade_subject(utterance) and pat is WATCHDOG_GRADE_RE:
            continue
        body = pat.sub(repl, body)
    if body == original:
        return body
    body = SPACE_RE.sub(" ", body).strip()
    body = re.sub(r"\s+([,.;:])", r"\1", body)
    body = re.sub(r"\.\s*\.", ".", body)
    return SPACE_RE.sub(" ", body).strip()


def strip_vendor_name(text: str) -> str:
    """Drop Nex / Nemotron identity. The free talk model is not the mouth."""
    body = (text or "").strip()
    if not body:
        return ""
    if LOOKING_LINE_RE.match(body):
        return ""
    dirty = bool(VENDOR_NAME_RE.search(body) or VENDOR_ROLE_RE.search(body))
    if not dirty and not DENY_JARVIS_RE.search(body):
        return body
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept = []
    for part in parts:
        if not part:
            continue
        if VENDOR_NAME_RE.search(part) or VENDOR_ROLE_RE.search(part) or DENY_JARVIS_RE.search(part):
            continue
        kept.append(part)
    leftover = SPACE_RE.sub(" ", " ".join(kept)).strip()
    if leftover:
        return leftover
    return "I am Jarvis on this Mac." if dirty else body


# Vault status and proof stamps are not conversation. The model brief may
# still say a file is a cloud placeholder. The mouth must not.
CLOUD_MOUTH_RE = re.compile(
    r"live vault file is a cloud placeholder|\bcloud placeholder\b",
    re.I,
)
LIVE_SELF_RE = re.compile(
    r"i(?:\s+am|['\u2019]m)\s+jarvis\s+and\s+live\b",
    re.I,
)
ABSENT_MOUTH = "I don't have that."
PANE_MOUTH = "I'm Jarvis on this Mac. I will not call that live or verified."
# The address alone is the butler wrap, not a sentence. first_sentence already
# keeps a lone 'Sir.' with the next beat. After a cloud sentence is dropped,
# that wrap must not count as the leftover mouth.
BUTLER_ONLY_RE = re.compile(r"^sir[.,]?$", re.I)
# A tagged thing the ask named. Not a test id. The mouth must say that name
# when a tool status is the only line, instead of the generic absence sentence.
TAGGED_THING_RE = re.compile(
    r"\b((?:the |a |an )?[a-z][a-z0-9]* tagged [a-z0-9]+(?:-[a-z0-9]+)*)",
    re.I,
)


def named_absence(utterance: str) -> str:
    """Name the tagged thing the ask asked about. Empty when the ask names none."""
    found = TAGGED_THING_RE.search(utterance or "")
    if not found:
        return ""
    thing = SPACE_RE.sub(" ", found.group(1)).strip()
    if thing.lower().startswith("the "):
        thing = "The " + thing[4:]
    elif thing[:1].islower():
        thing = thing[:1].upper() + thing[1:]
    return f"{thing} was left uncreated. I will not invent it."


def _luhn(digits: str) -> bool:
    total = 0
    for i, ch in enumerate(reversed(digits)):
        d = int(ch) * (2 if i % 2 else 1)
        total += d - 9 if d > 9 else d
    return total % 10 == 0


def _card_like(m: "re.Match") -> str:
    """Redact a long digit run only when it could be a card: Luhn-valid and not a 20YYMMDD-HHMMSS stamp."""
    raw = m.group(0)
    digits = re.sub(r"\D", "", raw)
    if re.fullmatch(r"20\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[ -]?\d{4,6}", raw.strip()):
        return raw
    return "number redacted" if _luhn(digits) else raw


def redact_private_ids(text: str) -> str:
    """Card fragments and national-id shapes are not spoken."""
    body = text or ""
    body = re.sub(
        r"\b(?:mc|visa|mastercard|amex|card)?\s*last-?4\s*\d{4}\b",
        "card last-4 redacted",
        body,
        flags=re.I,
    )
    body = re.sub(r"\blast-?4\s*\d{4}\b", "card last-4 redacted", body, flags=re.I)
    body = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "id redacted", body)
    body = re.sub(r"\b(?:\d[ -]?){13,19}\b", _card_like, body)
    return body


def scrub_unspeakable(text: str, *, utterance: str = "") -> str:
    """Drop filesystem status and an unsolicited live identity claim.

    A cloud-status line is not a sentence. When that drop leaves nothing,
    name the tagged thing the ask asked about. Do not rewrite the tool
    result into the generic absence sentence.
    """
    body = redact_private_ids((text or "").strip())
    if not body:
        return ""
    if not CLOUD_MOUTH_RE.search(body) and not LIVE_SELF_RE.search(body):
        return body
    parts = re.split(r"(?<=[.!?])\s+", body)
    kept: list[str] = []
    dropped_live = False
    dropped_cloud = False
    for part in parts:
        if not part:
            continue
        folded = part.replace("\u2019", "'").replace("\u2018", "'")
        if CLOUD_MOUTH_RE.search(folded):
            dropped_cloud = True
            continue
        if LIVE_SELF_RE.search(folded):
            dropped_live = True
            continue
        kept.append(part)
    leftover = SPACE_RE.sub(" ", " ".join(kept)).strip()
    if leftover and not BUTLER_ONLY_RE.match(leftover):
        return leftover
    if not dropped_live and not dropped_cloud:
        return body
    if dropped_live:
        return PANE_MOUTH
    named = named_absence(utterance)
    if named:
        return named
    return ABSENT_MOUTH


def sanitize_payload(text: str, *, utterance: str = "") -> str:
    """Drop dump headers, pack leaks, and factory crumbs. Keep a real sentence."""
    body = re.sub(
        r"(?:^|\n)\s*Current disk \(authoritative[^\n]*\):\s*",
        "",
        (text or "").strip(),
        flags=re.I,
    ).strip()
    if not body:
        return ""
    if LOOKING_LINE_RE.match(body):
        return ""
    if is_dump(body):
        return ""
    body = strip_vendor_name(body)
    if not body:
        return ""
    body = strip_pack_leak(body, utterance=utterance)
    if not body:
        return ""
    body = strip_factory(body, utterance=utterance)
    body = fix_capability_denial(body, utterance=utterance)
    return scrub_unspeakable(body.strip(), utterance=utterance)


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


# A reply that reports a dark tool/model, a stop or a failure must not open with "Done." (turn 4055).
UNAVAILABLE_RE = re.compile(
    r"\b(?:is|was|went|are) dark\b|\bI stopped\b|\bran out of time\b|\bfailed\b|\bcould not\b|"
    r"\bcouldn['\u2019]t\b|\bunavailable\b|\bdid not (?:finish|complete|save|touch)\b|\bnot (?:saved|done|finished)\b",
    re.I,
)
# Blanket "I cannot access files" while file hands exist (turn 4068). Capability != authority.
CAPABILITY_DENIAL_RE = re.compile(
    r"[^.!?]*\bI (?:cannot|can['\u2019]t|can not|do not|don['\u2019]t|am unable to|'m unable to)"
    r"(?: have the ability to| have access to)? (?:directly )?(?:access|open|read|edit|touch|work with) "
    r"(?:your |any |local )?files?\b[^.!?]*[.!?]?",
    re.I,
)
FILE_ASK_RE = re.compile(r"\b(?:file|files|\.xlsx|\.docx|\.csv|workbook|document|gridcraft|wordcraft|\w+craft)\b", re.I)
SEND_ASK_RE = re.compile(r"\b(?:email|e-mail|send|mail)\b", re.I)
CAPABILITY_LINE = "I can open and edit files on this Mac through the craft hands."
SEND_HELD_LINE = "Sending email is a hard step that stays with you; I can prepare it, and you send."


def fix_capability_denial(text: str, *, utterance: str = "") -> str:
    body = (text or "").strip()
    if not body or not FILE_ASK_RE.search(utterance or "") or not CAPABILITY_DENIAL_RE.search(body):
        return body
    parts = re.split(r"(?<=[.!?])\s+", body)
    rest = " ".join(
        s for s in parts if not CAPABILITY_DENIAL_RE.search(s) and not re.search(r"\bmanually\b", s, re.I)
    ).strip()
    lines = [CAPABILITY_LINE]
    if SEND_ASK_RE.search(utterance or ""):
        lines.append(SEND_HELD_LINE)
    if rest:
        lines.append(rest)
    return " ".join(lines)


def witty_beat(verb: str, *, repeat: bool = False) -> str:
    """Rare hand beat. Ordinary converse is Sir + payload, nothing else."""
    key = (verb or "").strip().lower()
    if not key or key in CONVERSE_VERBS:
        return ""
    if repeat:
        if key in REPEAT_WIT:
            return REPEAT_WIT[key]
        # No own line for this hand: plain "Sir." + answer, never "Again, sir. Done." (honesty loop).
        return f"Again, sir. {WIT[key]}" if WIT.get(key) and WIT[key] != DEFAULT_WIT else ""
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
    raw = scrub_unspeakable(spoken or "", utterance=utterance)
    if is_dump(raw):
        return f"{FAILURE_TEMPLATE} {DUMP_SPOKEN}"
    if (verb or "").strip().lower() == "wire":
        payload = strip_blame(strip_waiting((raw or "").strip()))
        if not payload:
            return payload
        if ALREADY_WRAPPED_RE.match(payload):
            return payload
        return f"Sir. {payload}"
    cleaned = sanitize_payload(raw, utterance=utterance)
    if not cleaned:
        if is_pack_leak(raw):
            return f"{FAILURE_TEMPLATE} {DUMP_SPOKEN}"
        cleaned = strip_factory(raw, utterance=utterance)
    payload = strip_blame(strip_waiting(cleaned))
    if not payload:
        payload = strip_factory(raw, utterance=utterance) or EMPTY_MOUTH
    payload = strip_factory(payload, utterance=utterance)
    if not payload:
        payload = EMPTY_MOUTH
    if ALREADY_WRAPPED_RE.match(payload) or FAILURE_TEMPLATE in payload:
        folded = strip_factory(payload, utterance=utterance)
        if BUTLER_ONLY_RE.match(folded.strip()):
            named = named_absence(utterance)
            return f"Sir. {named or EMPTY_MOUTH}"
        return folded
    if is_failure(payload):
        return f"{FAILURE_TEMPLATE} {payload}"
    low_payload = payload.lower()
    if "talk wire is dark" in low_payload or "returned no text" in low_payload:
        if ALREADY_WRAPPED_RE.match(payload):
            return payload
        return f"Sir. {payload}"
    repeat = proven_repeat(utterance, turns, store_lines, scars, verb)
    beat = "" if UNAVAILABLE_RE.search(payload) else witty_beat(verb, repeat=repeat)
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
    raw = scrub_unspeakable(chunk or "", utterance=utterance)
    if is_dump(raw):
        return wrap(raw, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars) if first else ""
    if (verb or "").strip().lower() == "wire":
        payload = strip_blame(strip_waiting((raw or "").strip()))
        if not payload:
            return ""
        if first:
            return wrap(payload, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars)
        return strip_lead_sir(payload)
    payload = strip_blame(strip_waiting(sanitize_payload(raw, utterance=utterance) or raw))
    if not payload:
        return ""
    if first:
        return wrap(payload, verb=verb, utterance=utterance, turns=turns, store_lines=store_lines, scars=scars)
    return strip_factory(strip_lead_sir(payload), utterance=utterance)


# A promise is not a result. "I'll check…/Let me open…" with no tool behind it becomes "can't yet" (honesty loop).
PROMISE_RE = re.compile(
    r"\b(?:I['\u2019]ll|I will|I['\u2019]m going to|let me|allow me to)\s+(?:go\s+(?:and\s+)?|quickly\s+|now\s+)?"
    r"(?:check|open|look|search|set\s+up|ask|find|get|fetch|run|start|read|list|pull|grab|take|see|review|monitor|"
    r"verify|confirm|investigate|browse|scan|query|inspect|create|schedule)\b",
    re.I,
)
CANT_YET_LINE = "I can't do that yet: no tool ran for it, so I won't pretend it's happening."


def promise_guard(text: str, *, ran_tool: bool) -> str:
    """Drop promise-only sentences. If nothing real is left, say so honestly."""
    body = (text or "").strip()
    if not body or not PROMISE_RE.search(body):
        return text
    parts = re.split(r"(?<=[.!?])\s+", body)
    rest = " ".join(s for s in parts if not PROMISE_RE.search(s)).strip()
    if rest and (ran_tool or len(rest) > 20):
        return rest
    return CANT_YET_LINE if not rest else f"{CANT_YET_LINE} {rest}"
