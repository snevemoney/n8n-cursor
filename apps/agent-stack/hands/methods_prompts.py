"""Prompt-shaping cores (Z104, Z105, X08, X09). Text in, text out; nothing generated or spent."""
from __future__ import annotations

import hashlib
import json
import re
from decimal import Decimal, InvalidOperation

# ---- Z104: structured attribute form -> consistent character -----------------------
# Field values are OUR enumerations (the source packet only says "enumerated fields");
# extend FIELDS with Evens rather than free text so the character stays consistent.
FIELDS = {
    "age_range": ("child", "teen", "young adult", "adult", "middle aged", "senior"),
    "build": ("slim", "average", "athletic", "stocky", "tall"),
    "hair_color": ("black", "brown", "blonde", "red", "gray", "white"),
    "hair_style": ("short", "long", "curly", "braided", "bald"),
    "eye_color": ("brown", "blue", "green", "hazel", "gray"),
    "skin_tone": ("light", "medium", "tan", "brown", "dark"),
    "outfit": ("casual", "business", "sporty", "formal", "workwear"),
    "expression": ("neutral", "smiling", "serious", "surprised"),
}


def character(values, *, free_allowance=None, free_used=0):
    """Validate every field against FIELDS; same values -> same prompt and fingerprint."""
    missing = [k for k in FIELDS if k not in values]
    bad = {k: v for k, v in values.items() if k not in FIELDS or v not in FIELDS.get(k, ())}
    if missing or bad:
        raise ValueError(f"Fix fields: missing {sorted(missing)}, invalid {sorted(bad)}")
    ordered = {k: values[k] for k in FIELDS}
    prompt = "Character: " + ", ".join(f"{k.replace('_', ' ')} {v}" for k, v in ordered.items()) + "."
    left = None if free_allowance is None else max(0, int(free_allowance) - int(free_used))
    return {"prompt": prompt, "fingerprint": hashlib.sha256(json.dumps(ordered).encode()).hexdigest()[:12],
            "free_left": left, "needs_paid_generation": left == 0}


# ---- Z105: minimal-change edit prompt -----------------------------------------------
def minimal_edit(ref, change, *, third_party=False, rights_ok=False):
    ref, change = str(ref).strip(), str(change).strip()
    if not ref or not change or re.search(r"\b(?:and also|as well as|plus)\b|;", change, re.I):
        raise ValueError("Name the reference and exactly one change")
    if third_party and not rights_ok:
        raise PermissionError("Check rights or likeness for third-party material before editing it")
    return f"Keep everything in {ref} exactly the same except {change}."


# ---- X08: short answers as cost control + prepaid hard ceiling ----------------------
def shorten(text, max_sentences=2):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return " ".join(parts[:max_sentences])


def ceiling_gate(spent, next_cost, ceiling):
    """All amounts are supplied by the owner (no prices invented). Refuses to cross the prepaid ceiling."""
    try:
        s, n, c = Decimal(str(spent)), Decimal(str(next_cost)), Decimal(str(ceiling))
    except InvalidOperation:
        raise ValueError("Amounts must be numbers") from None
    if min(s, n, c) < 0:
        raise ValueError("Amounts cannot be negative")
    return {"allowed": s + n <= c, "remaining": str(max(Decimal(0), c - s))}


# ---- X09: operator persona rules ------------------------------------------------------
FILLER = re.compile(r"^\s*(?:certainly|of course|absolutely|sure thing|great question)\b[,!. ]*", re.I)
INTENT = re.compile(r"^\s*(?:i(?:'ll| will| am going to)|let me|i'm going to)\b", re.I)


def persona_lint(reply):
    issues = []
    if FILLER.search(reply):
        issues.append("filler opener")
    if INTENT.search(reply):
        issues.append("states intention instead of result")
    if re.search(r"\bdisagree\b", reply, re.I) and len(reply.strip().splitlines()) > 1:
        issues.append("disagreement longer than one line")
    return issues


def persona_fix(reply):
    out = FILLER.sub("", reply, count=1)
    return out[:1].upper() + out[1:] if out else out
