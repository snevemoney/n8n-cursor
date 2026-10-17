"""Z52 (D5v4UuvtUXc 8:47-9:27): a send/spend request whose required slots neither the ask nor the vault fills
-> ONE compact question naming the missing slots ("A deal for whom, sir - and covering what?"), nothing improvised.
Deterministic, no model."""
from __future__ import annotations

import re

ACT_RE = re.compile(r"\b(?:create|make|draw\s+up|prepare|send|issue|draft|write\s+up|set\s+up|start|open|log)\b", re.I)
NOUN_RE = re.compile(r"\b(invoice|deal|contract|quote|proposal|estimate|payment|refund|wire|transfer|purchase\s+order|po)\b", re.I)
WHO_RE = re.compile(r"\b(?:for|to|with|from)\s+(?:my\s+client\s+|client\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[\w.+-]+@[\w.-]+)")
WHAT_RE = re.compile(r"\$\s?\d|\b\d+(?:\.\d+)?\s*(?:dollars|usd|cad|k)\b|\b(?:covering|for\s+the|for\s+(?:his|her|their)|regarding|re:|about)\s+\w+", re.I)


def ask_for(u: str) -> dict | None:
    u = u or ""
    noun = NOUN_RE.search(u)
    if not noun or not ACT_RE.search(u):
        return None
    clean = re.sub(r"^\s*(?:hey\s+)?jarvis[,.]?\s*", "", u, flags=re.I)
    who = WHO_RE.search(clean)
    what = WHAT_RE.search(clean)
    missing = [k for k, v in (("who", who), ("what", what)) if not v]
    if not missing:
        return None
    n = noun.group(1).lower()
    art = "An" if n[0] in "aeiou" else "A"
    if missing == ["who", "what"]:
        q = f"{art} {n} for whom, sir \u2014 and covering what?"
    elif missing == ["who"]:
        q = f"{art} {n} for whom, sir?"
    else:
        q = f"{art} {n} for {who.group(1)} covering what, sir?"
    return {"noun": n, "missing": missing, "spoken": q}
