"""Intent first (Evens 2026-10-16: "it doesn't understand the intent of the prompts it is receiving and that's why it
responds random false positives"). A phrase pattern only proposes a hand. Before that hand runs, a model reads Evens's
line with the last turns and says whether the hand is what he meant; if not, the pick is dropped and the normal model
turn answers with full context. Kept-stop refusals, confirms and stop never wait on a model. If the classifier is
unreachable the pattern pick stands, so an outage behaves exactly like before this gate.

The classifier is not the product mouth: it never speaks, it returns one label.
"""
from __future__ import annotations

import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Callable

PRIOR_TURNS = 2
EXEMPT_TOOLS = frozenset({"refuse_hard_step", "stop", "hush", "cancel"})
MODEL_CHAIN = (os.environ.get("JARVIS_INTENT_MODEL") or "anthropic/claude-haiku-5.5",)
ATTEMPT_SEC = 6.0
INTENTS = ("command", "question", "chat", "status_ask", "correction", "permission")

SYSTEM = (
    "You read one line Evens said to his Mac assistant Jarvis, with the last turns for context. A phrase matcher proposed "
    "a hand (a tool) for it. Decide what Evens actually meant and whether running that hand now is what he wants.\n"
    "pick_matches is false when: the line is talk, a quote, a story, a negation (\"don't...\", \"I don't care about...\"), "
    "a how-to or why question, a report of the past, or a correction of the previous reply that the proposed hand would "
    "not fix; or the hand does a different job than the one he asked for; or the line is a fragment with no clear ask. "
    "Speech-to-text can mishear words (\"a narrow\" for \"an arrow\", \"printer\" for \"pointer\"): judge the meaning. "
    "Call the intent tool once."
)
TOOL = [{"type": "function", "function": {
    "name": "intent", "description": "What Evens meant and whether the proposed hand serves it.",
    "parameters": {"type": "object", "required": ["intent", "meant", "pick_matches"], "additionalProperties": False,
                   "properties": {"intent": {"type": "string", "enum": list(INTENTS)},
                                  "meant": {"type": "string", "description": "what he wants, under 15 words"},
                                  "pick_matches": {"type": "boolean"}}}}}]


def _online():
    """brain/online.py by file path (launchd runs the stack without package imports); the pipeline's copy if loaded."""
    mod = sys.modules.get("agent_stack_online")
    if mod is None:
        spec = importlib.util.spec_from_file_location("agent_stack_online", Path(__file__).with_name("online.py"))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


def _describe(tool: str) -> str:
    try:
        rows = _online().OPENROUTER_HANDS
    except Exception:  # noqa: BLE001 - a missing description only shortens the prompt
        rows = ()
    for row in rows or ():
        fn = row.get("function") or {}
        if fn.get("name") == tool:
            return str(fn.get("description") or "")[:240]
    return ""


def render(utterance: str, pick: dict, prior: list) -> str:
    tool = str(pick.get("tool") or "")
    args = {k: v for k, v in (pick.get("args") or {}).items() if not str(k).startswith("_")}
    lines = [f"JARVIS: {str(t.get('jarvis') or '')[:240]}" if i % 2 else f"EVENS: {str(t.get('user') or '')[:240]}"
             for t in prior for i in (0, 1)]
    return "\n".join([
        "Recent turns:", *(lines or ["(none)"]),
        "", f"Evens now says: {utterance}",
        f"Proposed hand: {tool} {json.dumps(args)[:200] if args else ''}".rstrip(),
        f"What that hand does: {_describe(tool) or tool.replace('_', ' ')}",
        *([f"Its fixed reply would be: {str(pick.get('speak'))[:200]}"] if pick.get("speak") else []),
    ])


def classify_with_model(utterance: str, pick: dict, prior: list) -> dict | None:
    got = _online().call_openrouter_messages(
        [{"role": "system", "content": SYSTEM}, {"role": "user", "content": render(utterance, pick, prior)}], TOOL,
        model_chain=MODEL_CHAIN, attempt_sec=ATTEMPT_SEC, max_tokens=300)
    return got.get("args") if got.get("ok") and got.get("tool") == "intent" else None


def gate(utterance: str, pick: dict | None, prior: list | None, *, classify: Callable | None = None) -> dict | None:
    """The pick when Evens meant it (or when it must not wait); None when the model says he meant something else."""
    if not pick or str(pick.get("tool") or "") in EXEMPT_TOOLS or (pick.get("args") or {}).get("_confirmed"):
        return pick
    if (os.environ.get("JARVIS_INTENT_GATE") or "1").strip() == "0":
        return pick
    if classify is None and os.environ.get("PYTEST_CURRENT_TEST"):
        return pick  # suites never call a model; the gate's own tests inject the classifier
    try:
        verdict = (classify or classify_with_model)(utterance, pick, list(prior or [])[-PRIOR_TURNS:])
    except Exception:  # noqa: BLE001 - an unreachable classifier must not make Jarvis worse than the pattern alone
        return pick
    if not isinstance(verdict, dict) or not isinstance(verdict.get("pick_matches"), bool):
        return pick
    return pick if verdict["pick_matches"] else None
