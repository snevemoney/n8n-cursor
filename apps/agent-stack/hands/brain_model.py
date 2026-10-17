"""Switch Jarvis's thinking model on command (Evens 2026-10-16): "keep Jev, keep DeepSeek, but we can ask Jarvis to
change model whenever we want, by prompting or by voice ... super fast ... every Claude model."

The choice lives in one small file that brain/online.openrouter_model() reads on every call, so the next turn uses it
with no restart. Evens's own switch stays until he changes it; a switch Jarvis makes for himself (the model calls this
hand) expires after SELF_SWITCH_S so a costly model never stays on silently. Any id OpenRouter lists is accepted; an
unlisted one is refused, so a typo cannot darken talk.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import sys
import time
from pathlib import Path

SELF_SWITCH_S = 30 * 60
ALIASES = {
    "haiku": "anthropic/claude-haiku-5.5",
    "sonnet": "anthropic/claude-sonnet-5.5",
    "opus": "anthropic/claude-opus-5.5",
    "fable": "anthropic/claude-fable-5.1",
}
DEFAULT_WORDS = r"deepseek|default|normal|usual|regular|cheap(?:er)?"
_LEAD = r"^\s*(?:(?:hey\s+)?jarvis[,.!]?\s+)?(?:please\s+|ok(?:ay)?[,.]?\s+)?(?:(?:can|could|would)\s+you\s+)?"
_NAME = r"(?:claude\s+)?(?P<name>" + "|".join(ALIASES) + r"|deepseek|[a-z0-9-]+/[a-z0-9._:-]+)(?:\s+5(?:\.\d)?)?"
SWITCH_RE = re.compile(_LEAD + r"(?:(?:switch|change|swap|set|move)\s+(?:your\s+)?(?:model|brain|thinking)\s+(?:to|over\s+to)\s+"
                       r"|(?:switch|change|swap)\s+(?:over\s+)?to\s+|use\s+|think\s+with\s+)" + _NAME + r"\b", re.I)
RESET_RE = re.compile(_LEAD + r"(?:(?:go|switch|change)\s+)?back\s+to\s+(?:your\s+)?(?:" + DEFAULT_WORDS + r")(?:\s+(?:model|brain))?\b"
                      r"|" + _LEAD + r"(?:reset|restore)\s+(?:your\s+)?(?:model|brain)\b", re.I)
WHICH_RE = re.compile(_LEAD + r"(?:what|which)\s+(?:model|brain)\s+(?:are\s+you\s+(?:on|using|running(?:\s+on)?)|is\s+(?:on|active|running))", re.I)


def _file() -> Path:
    raw = (os.environ.get("JARVIS_BRAIN_FILE") or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / ".grok-private" / "jarvis-brain.json"


def _cost_card():
    mod = sys.modules.get("agent_stack_cost_card")
    if mod is None:
        spec = importlib.util.spec_from_file_location("agent_stack_cost_card", Path(__file__).with_name("cost_card.py"))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
    return mod


def catalog() -> dict:
    """{model id: {"in": $/token, "out": $/token}} from OpenRouter (cached a day by cost_card); {} when offline."""
    try:
        return _cost_card().prices() or {}
    except Exception:  # noqa: BLE001
        return {}


def current() -> str:
    """The override in force, or "" (the configured default). Read by brain/online.openrouter_model() every call."""
    try:
        data = json.loads(_file().read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return ""
    if not isinstance(data, dict) or not data.get("model"):
        return ""
    if data.get("expires") and time.time() > float(data["expires"]):
        return ""
    return str(data["model"])


def _write(data: dict) -> None:
    f = _file()
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_name(f"{f.name}.{os.getpid()}.tmp")
    tmp.write_text(json.dumps(data), encoding="utf-8")
    os.replace(tmp, f)


def _label(model: str) -> str:
    tail = model.split("/", 1)[-1]
    m = re.fullmatch(r"claude-([a-z]+)-([\d.]+)", tail)
    return f"Claude {m.group(1).capitalize()} {m.group(2)}" if m else model


def _price(model: str, cat: dict) -> str:
    p = cat.get(model) or {}
    if not p:
        return ""
    return f" It costs ${p['in'] * 1e6:g} per million input tokens and ${p['out'] * 1e6:g} per million output on OpenRouter."


def resolve(name: str, cat: dict | None = None) -> str:
    """Alias or full id -> a model id OpenRouter lists; "" when unknown."""
    key = (name or "").strip().lower()
    model = ALIASES.get(key, key)
    cat = catalog() if cat is None else cat
    if cat:
        return model if model in cat else ""
    return model if key in ALIASES else ""  # offline: only the known Claude aliases


def default_model() -> str:
    return (os.environ.get("OPENROUTER_MODEL") or "").strip() or "the default model"


def set_model(name: str, *, by: str = "evens", reason: str = "") -> dict:
    cat = catalog()
    model = resolve(name, cat)
    if not model:
        return {"ok": False, "tool": "brain_model", "task_verified": False,
                "spoken": f"I can't find a model called {name} on OpenRouter, so I'm staying on {_label(current() or default_model())}."}
    data = {"model": model, "by": by, "at": time.time(), "reason": reason[:200]}
    if by != "evens":
        data["expires"] = time.time() + SELF_SWITCH_S
    _write(data)
    until = " for the next 30 minutes" if by != "evens" else ""
    return {"ok": True, "tool": "brain_model", "model": model, "task_verified": current() == model,
            "spoken": f"Switched to {_label(model)}{until}; your next request uses it.{_price(model, cat)} "
                      f"Say \"back to deepseek\" to return."}


def reset() -> dict:
    _write({"model": "", "by": "evens", "at": time.time()})
    return {"ok": True, "tool": "brain_model", "model": default_model(), "task_verified": current() == "",
            "spoken": f"Back on {_label(default_model())}."}


def which() -> dict:
    model = current()
    who = ""
    if model:
        try:
            who = " (I chose it for a task; it switches back on its own)" if json.loads(_file().read_text()).get("by") != "evens" else ""
        except (OSError, ValueError):
            who = ""
    return {"ok": True, "tool": "brain_model", "model": model or default_model(), "task_verified": True,
            "spoken": f"I'm thinking with {_label(model or default_model())}{who}."}


def wants(utterance: str) -> bool:
    u = utterance or ""
    return bool(SWITCH_RE.match(u) or RESET_RE.match(u) or WHICH_RE.match(u))


def run(utterance: str = "", args: dict | None = None) -> dict:
    """Owner command by voice or text; args {"model", "reason"} when Jarvis switches himself."""
    args = args or {}
    if args.get("model"):
        name = str(args["model"])
        return reset() if re.fullmatch(DEFAULT_WORDS, name.strip(), re.I) else set_model(name, by="jarvis", reason=str(args.get("reason") or ""))
    if RESET_RE.match(utterance or ""):
        return reset()
    m = SWITCH_RE.match(utterance or "")
    if m:
        name = m.group("name")
        return reset() if re.fullmatch(DEFAULT_WORDS, name, re.I) else set_model(name)
    return which()
