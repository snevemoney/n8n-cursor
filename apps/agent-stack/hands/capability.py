"""capability — truthful answers to "can you / do you have X" about Jarvis itself, with no model.

Grok's bad-turns queue (2026-10-15) showed the converse model inventing answers to questions about Jarvis's own
tools: it called the red arrow "a visual indicator, not a functional tool", and said Jarvis "cannot change its own
code by system design". These questions get a fixed, accurate line instead. Asking never acts: no arrow is drawn
and no mission starts from this hand.
"""
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

_ASK = r"(?:(?:do|don't|dont|do\s+not|can|can't|cant|cannot|could|couldn't|are|aren't|have)\s+(?:you|jarvis)|is\s+there)\b"
ARROW_RE = re.compile(_ASK + r".{0,50}\b(?:red\s+arrow|arrow|pointer|point(?:\s+at|\s+to)?\s+(?:things|stuff|controls?))\b", re.I)
SELF_CODE_RE = re.compile(
    r"\b(?:change|edit|modify|update|rewrite|fix|improve|upgrade|patch|reprogram)\b.{0,30}"
    r"\b(?:your(?:\s+own)?\s+(?:code|program|software|source|brain|rules)|yourself)\b"
    r"|\bgive\s+yourself\s+(?:more\s+)?(?:access|permissions?)\b", re.I)
FIX_IT_RE = re.compile(r"^(?:jarvis[, ]+)?(?:can|could|will|would)\s+you\s+(?:please\s+)?(?:(?:fix|repair|sort\s+out)\s+(?:it|this|that)|sort\s+(?:it|this|that)\s+out)"
                       r"(?:\s+(?:now|yourself|for\s+me))*\s*[?.!]*$", re.I)
QUESTION_RE = re.compile(r"\?\s*$|^(?:do|don't|dont|can|can't|could|are|aren't|is|have|will|would)\b", re.I)
GREETING_RE = re.compile(r"^\s*(?:(?:hey|hi|ok|okay|yo)\s+)?jarvis\s*[,:!.]?\s+|^\s*(?:so|and|now|ok|okay|alright)\s*,?\s+", re.I)


def _strip_greeting(u: str) -> str:
    while True:
        nxt = GREETING_RE.sub("", u, count=1).strip()
        if nxt == u:
            return u
        u = nxt

ARROW_LINE = ("Yes. I can put a red arrow on a control: say \"point to\" and the thing, or \"where do I click to\" "
              "and what you want to do. I'm not drawing one now.")
HARD_LINE = "Sends, payments, deploys, merges, deletes and real secrets still ask you first."


def _open_access() -> bool:
    name = "agent_stack_permissions"
    try:
        if name not in sys.modules:
            spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name("permissions.py"))
            mod = importlib.util.module_from_spec(spec); sys.modules[name] = mod; spec.loader.exec_module(mod)
        return bool(sys.modules[name].open_access())
    except Exception:  # noqa: BLE001 — unknown state reads as closed, the safer claim
        return False


def access_line() -> str:
    """The real current state, never a promise: open by default on live, closed after "lock it down"."""
    if _open_access():
        return "Access: open access is on, so I can use your folders, browser, screen, shell and installs; \"lock it down\" closes it. " + HARD_LINE
    return "Access: open access is off. Say \"permission granted\" and it stays on until you say \"lock it down\". " + HARD_LINE


CODE_LINE = ("Code: my coding worker builds in a scratch repo on its own branch; say \"in scratch repo\", the name, "
             "and the goal. My own code in jarvis-main is changed on a branch by Claude, Cursor or Grok, and runs "
             "after you approve it and restart me. I don't edit my live self.")


def wants(utterance: str) -> str:
    """'arrow' | 'self_code' | 'fix_it' | '' — only questions about Jarvis's own abilities."""
    u = _strip_greeting((utterance or "").strip())
    if not u:
        return ""
    if FIX_IT_RE.match(u):
        return "fix_it"
    if SELF_CODE_RE.search(u) and QUESTION_RE.search(u):
        return "self_code"
    if ARROW_RE.search(u) and QUESTION_RE.search(u):
        return "arrow"
    return ""


def run(utterance: str, prior: dict | None = None) -> dict:
    kind = wants(utterance)
    if kind == "arrow":
        spoken = ARROW_LINE
    elif kind == "self_code":
        spoken = "Yes, within limits. " + access_line() + " " + CODE_LINE
    elif kind == "fix_it":
        last = str((prior or {}).get("user") or "").strip()
        said = re.sub(r"\s+", " ", str((prior or {}).get("jarvis") or "")).strip()
        about = (f"The last thing you asked was \"{last[:120]}\"" + (f", and I answered \"{said[:140]}\"." if said else ".")
                 if last else "I don't have the last turn to point at.")
        spoken = (about + " I can't patch my live self mid-conversation. " + CODE_LINE
                  + (" Say \"permission granted\" if it was blocked by access." if not _open_access() else ""))
    else:
        return {"ok": False, "tool": "capability", "spoken": "", "task_verified": False}
    return {"ok": True, "tool": "capability", "kind": kind, "spoken": spoken, "task_verified": True}
