"""Z12 reflex gate: five quick decisions per utterance, model-free, ~1 ms (Zubair D5v4UuvtUXc).

  lane        which hand family takes it (jev picker label + model-free route), with p
  finished    is he done talking (no trailing 'and/so/um', no dangling comma), p
  addressed   is he talking TO Jarvis (vs narrating / talking to someone else), p
  needs_tool  does it need a tool (a model-free hand claims it), p
  vault_hit   is it about his own stuff (my/our + personal nouns, or a vault/notes word), p

Numbers only go to the turn log (never text). The pane uses the same 'finished' rule to wait a beat
longer before sending a voice turn that is clearly mid-sentence. No decision here can approve a hard step.
"""
from __future__ import annotations

import re

TRAIL_RE = re.compile(r"(?:\b(?:and|so|but|or|because|then|um+|uh+|er+|like|with|to|the|a|my|of)|,|\.\.\.|-)\s*$", re.I)
OTHER_ADDR_RE = re.compile(r"^\s*(?:hey|hi|yo|ok(?:ay)?)?\s*(?:mom|dad|babe|honey|guys|zubair|siri|alexa|google)\b"
                           r"|\b(?:he|she|they)\s+(?:said|says|told)\b|\bi\s+was\s+(?:just\s+)?(?:saying|telling)\b", re.I)
JARVIS_RE = re.compile(r"\bjarvis\b|\b(?:can|could|would|will)\s+you\b|\b(?:please|tell me|show me|what|who|where|when|why|how)\b|[?]\s*$", re.I)
IMPERATIVE_RE = re.compile(r"^\s*(?:please\s+)?(?:open|read|list|show|start|stop|cancel|check|find|draft|write|run|remember|forget|"
                           r"search|research|look|tell|give|make|set|turn|switch|play|send|hand|use|do)\b", re.I)
PERSONAL_RE = re.compile(r"\b(?:my|our|mine)\s+(?:\w+\s+)?(?:notes?|vault|tasks?|calendar|meetings?|emails?|inbox|files?|docs?|leads?|"
                         r"invoices?|clients?|projects?|boards?|memory|token|plan|goals?)\b|\b(?:vault|second brain|what did i|active_tasks|cowork)\b", re.I)


def finished_p(u: str) -> float:
    t = (u or "").strip()
    if not t:
        return 0.0
    if TRAIL_RE.search(t):
        return 0.15
    if len(t.split()) <= 1 and not t.endswith(("?", "!", ".")):
        return 0.6
    return 0.95 if t.endswith(("?", ".", "!")) else 0.85


def addressed_p(u: str) -> float:
    t = (u or "").strip()
    if not t:
        return 0.0
    if OTHER_ADDR_RE.search(t) and not re.search(r"\bjarvis\b", t, re.I):
        return 0.2
    if re.search(r"\bjarvis\b", t, re.I):
        return 0.99
    if IMPERATIVE_RE.search(t) or JARVIS_RE.search(t):
        return 0.9
    return 0.6


def decide(u: str, *, route=None, lane_fn=None) -> dict:
    lane, lane_p = "converse", 0.5
    if lane_fn is not None:
        try:
            got = lane_fn(u) or {}
            lane, lane_p = str(got.get("handler") or lane), float(got.get("confidence") or lane_p)
        except Exception:  # noqa: BLE001
            pass
    tool = None
    if route is not None:
        try:
            tool = (route(u) or {}).get("tool")
        except Exception:  # noqa: BLE001
            tool = None
    if tool:
        lane, lane_p = str(tool), max(lane_p, 0.9)
    return {"lane": lane, "lane_p": round(lane_p, 2), "finished": finished_p(u), "addressed": addressed_p(u),
            "needs_tool": 0.95 if tool else (0.6 if IMPERATIVE_RE.search(u or "") else 0.15),
            "vault_hit": 0.85 if PERSONAL_RE.search(u or "") else 0.1}
