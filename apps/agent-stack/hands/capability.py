"""capability — truthful answers to "can you / do you have X" about Jarvis itself, with no model.

Grok's bad-turns queue (2026-10-15) showed the converse model inventing answers to questions about Jarvis's own
tools: it called the red arrow "a visual indicator, not a functional tool", and said Jarvis "cannot change its own
code by system design". These questions get a fixed, accurate line instead. Asking never acts: no arrow is drawn
and no mission starts from this hand.
"""
from __future__ import annotations

import re

_ASK = r"(?:do|don't|dont|do\s+not|can|can't|cant|cannot|could|couldn't|are|aren't|is\s+there|have)\s+(?:you|jarvis)\b"
ARROW_RE = re.compile(_ASK + r".{0,50}\b(?:red\s+arrow|arrow|pointer|point(?:\s+at|\s+to)?\s+(?:things|stuff|controls?))\b", re.I)
SELF_CODE_RE = re.compile(
    r"\b(?:change|edit|modify|update|rewrite|fix|improve|upgrade|patch|reprogram)\b.{0,30}"
    r"\b(?:your(?:\s+own)?\s+(?:code|program|software|source|brain|rules)|yourself)\b"
    r"|\bgive\s+yourself\s+(?:more\s+)?(?:access|permissions?)\b", re.I)
FIX_IT_RE = re.compile(r"^(?:jarvis[, ]+)?(?:can|could|will|would)\s+you\s+(?:please\s+)?(?:fix|repair|sort\s+out)\s+(?:it|this|that)"
                       r"(?:\s+(?:now|yourself|for\s+me))*\s*[?.!]*$", re.I)
QUESTION_RE = re.compile(r"\?\s*$|^(?:jarvis[, ]+)?(?:do|don't|dont|can|can't|could|are|aren't|is|have|will|would)\b", re.I)

ARROW_LINE = ("Yes. I can put a red arrow on a control: say \"point to\" and the thing, or \"where do I click to\" "
              "and what you want to do. I'm not drawing one now.")
ACCESS_LINE = ("Access: say \"permission granted\" and open access stays on until you say \"lock it down\". "
               "Sends, payments, deploys, merges and real secrets still ask you first.")
CODE_LINE = ("Code: my coding worker builds in a scratch repo on its own branch; say \"in scratch repo\", the name, "
             "and the goal. My own code in jarvis-main is changed on a branch by Claude, Cursor or Grok, and runs "
             "after you approve it and restart me. I don't edit my live self.")


def wants(utterance: str) -> str:
    """'arrow' | 'self_code' | 'fix_it' | '' — only questions about Jarvis's own abilities."""
    u = (utterance or "").strip()
    if not u:
        return ""
    if FIX_IT_RE.match(u):
        return "fix_it"
    if SELF_CODE_RE.search(u) and QUESTION_RE.search(u):
        return "self_code"
    if ARROW_RE.search(u) and QUESTION_RE.search(u):
        return "arrow"
    return ""


def run(utterance: str) -> dict:
    kind = wants(utterance)
    if kind == "arrow":
        spoken = ARROW_LINE
    elif kind == "self_code":
        spoken = "Yes, within limits. " + ACCESS_LINE + " " + CODE_LINE
    elif kind == "fix_it":
        spoken = ("I can't patch my live self mid-conversation. " + CODE_LINE
                  + " Tell me what went wrong and I'll write it down for that fix.")
    else:
        return {"ok": False, "tool": "capability", "spoken": "", "task_verified": False}
    return {"ok": True, "tool": "capability", "kind": kind, "spoken": spoken, "task_verified": True}
