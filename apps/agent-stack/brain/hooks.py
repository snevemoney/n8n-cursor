"""In-process tool hooks (FINISH-LIST rank 9). Pure functions, no I/O.

pre_tool  -- blocks hard-step tools before they run, whatever the model picked.
post_tool -- redacts secret-looking strings from every tool result.
stop_check -- a reply that claims work with no tool evidence is not verified.
"""
from __future__ import annotations

import re

HARD_TOOLS = frozenset({"send", "pay", "deploy", "book", "publish"})

SECRET_RE = re.compile(
    r"(sk-[A-Za-z0-9_\-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|xox[abpr]-[A-Za-z0-9\-]{10,}|"
    r"AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_\-]{30,}|(?i:bearer)\s+[A-Za-z0-9._\-]{16,})"
)
CLAIM_RE = re.compile(
    r"\b(done|completed|finished|i(?:'ve| have)?\s+(?:checked|ran|run|sent|looked|verified|read|opened|searched))\b",
    re.I,
)
NO_EVIDENCE_TOOLS = frozenset({"", "converse"})


def pre_tool(tool: str, utterance: str = "") -> dict:
    tool = str(tool or "")
    if tool in HARD_TOOLS:
        return {"allow": False, "reason": "hard_step_tool", "tool": tool}
    return {"allow": True, "reason": "", "tool": tool}


def _secret_patterns():
    """The shared detector (brain/secret_patterns.py), loaded by path like every other module here."""
    import importlib.util as _u
    import sys as _sys
    from pathlib import Path as _P
    name = "agent_stack_secret_patterns"
    if name not in _sys.modules:
        spec = _u.spec_from_file_location(name, _P(__file__).resolve().parents[1] / "brain" / "secret_patterns.py")
        mod = _u.module_from_spec(spec); _sys.modules[name] = mod; spec.loader.exec_module(mod)
    return _sys.modules[name]


def redact(text):
    if not isinstance(text, str):
        return text
    return _secret_patterns().redact(SECRET_RE.sub("[redacted]", text))


def _scrub(value):
    if isinstance(value, str):
        return redact(value)
    if isinstance(value, dict):
        return {k: _scrub(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_scrub(v) for v in value]
    if isinstance(value, tuple):
        return tuple(_scrub(v) for v in value)
    return value


def post_tool(result):
    if not isinstance(result, dict):
        return result
    return _scrub(result)


def stop_check(result):
    if not isinstance(result, dict):
        return result
    out = dict(result)
    wires = [w for w in (out.get("wires") or []) if w]
    tool = str(out.get("tool") or "")
    if wires and tool not in NO_EVIDENCE_TOOLS:
        out["evidence"] = True
    elif CLAIM_RE.search(str(out.get("spoken") or "")):
        out["evidence"] = False
        out["task_verified"] = False
    return out
