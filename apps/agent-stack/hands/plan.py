"""plan verb (FINISH-LIST rank 17): numbered steps for a goal. Fires NO tools.

The model is asked for text only (hands=False upstream); any tool-call-looking text in its reply is
dropped from the steps and never executed.
"""
from __future__ import annotations

import re

PROMPT = ("Write a short numbered plan (3 to 7 steps, one line each) for this goal. Plain text only; "
          "do not call tools, do not take any action. Mark any send/pay/deploy/merge step 'needs Evens'. Goal: ")
MAX_STEPS = 7
_STEP = re.compile(r"^\s*(?:\d+[.)]|[-*])\s+(.+?)\s*$")
_TOOLISH = re.compile(r"[{}]|\"tool\"\s*:", re.I)


def run(args: dict | None = None, talk_fn=None) -> dict:
    goal = " ".join(str((args or {}).get("goal") or "").split())[:400]
    base = {"tool": "plan", "wires": ["plan"], "cites": [], "sent": False, "fired_tools": []}
    if talk_fn is None:
        return {**base, "ok": False, "steps": [], "spoken": "I can't draft a plan without the model right now. Nothing was run."}
    try:
        text = str(talk_fn(PROMPT + (goal or "the request")) or "")
    except Exception:  # noqa: BLE001
        text = ""
    steps: list[str] = []
    for line in text.splitlines():
        m = _STEP.match(line)
        if not m:
            continue
        step = m.group(1).strip()
        if _TOOLISH.search(step):
            step = "(a tool call was suggested here; skipped — plans never run tools)"
        steps.append(step[:200])
        if len(steps) >= MAX_STEPS:
            break
    if not steps:
        return {**base, "ok": False, "steps": [], "spoken": "I couldn't get a usable plan from the model. Nothing was run."}
    spoken = "Plan: " + " ".join(f"{i}. {s}" for i, s in enumerate(steps, 1)) + " Nothing has been run."
    return {**base, "ok": True, "steps": steps, "spoken": spoken}


_GOAL = re.compile(r"\b(?:plan\s+(?:how\s+to|out)|(?:make|draft|write)\s+(?:me\s+)?a\s+plan\s+(?:for|to))\s+(.+?)\s*[.!?]?$", re.I)


def args_from_utterance(u: str) -> dict:
    m = _GOAL.search(u or "")
    return {"goal": m.group(1) if m else (u or "").strip()}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "steps": len(g.get("steps") or []), "fired_tools": 0}
