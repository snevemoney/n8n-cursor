"""Turn-path adapter for the methods_* cores. Independently testable; turn.py only calls wants()/run().

Z99 (pasted secret) is checked first. Every other ask must match one anchored phrase in
methods_router_cfg / methods_router_vault (whole utterance), so ordinary conversation is never hijacked."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import methods_config as mc  # noqa: E402
import methods_router_cfg as _cfg  # noqa: E402
import methods_router_vault as _vault  # noqa: E402

HANDLERS = _cfg.HANDLERS + _vault.HANDLERS


def _match(text):
    text = (text or "").strip()
    # Explicit quoting disambiguates free-form topics/custom workload names
    # without treating declarative ordinary speech as a command.
    for phrase, mid, fn, key in (("memory recall", "X31", _vault.x31_recall, "topic"),
                                 ("vault search", "X17", _vault.x17, "q"),
                                 ("cheap route for", "Z112", _cfg.z112, "kind"),
                                 ("graduate", "X46", _vault.x46, "daily")):
        explicit = re.fullmatch(r"(?:jarvis[, ]+)?" + re.escape(phrase) + r" ([\"'])(.+)\1\.?", text, re.I)
        if explicit:
            groups = {key: explicit.group(2)}
            if fn is _vault.x46:
                groups["dec"] = None
            return mid, fn, groups
    for mid, pattern, fn in HANDLERS:
        m = pattern.fullmatch(text)
        if m:
            groups = m.groupdict()
            # A command's argument must describe that command's domain, rather
            # than merely satisfy the syntax of a normal sentence.
            if fn is _cfg.z110_enable and groups["name"].lower() not in mc.CATALOG:
                continue
            if fn is _cfg.z112:
                kind = groups["kind"].lower()
                if kind not in {"summary", "summaries", "classification", "classify", "routing", "route", "extraction", "extract", "coding", "code", "reasoning", "research", "chat", "routine", "frontier"}:
                    continue
            if fn in (_vault.x17, _vault.x31_recall):
                key = "q" if fn is _vault.x17 else "topic"
                arg = groups[key].strip().rstrip(".")
                quoted = len(arg) > 1 and arg[0] == arg[-1] and arg[0] in ('"', "'")
                if not quoted and re.search(r"\b(?:is|are|was|were|isn't|aren't|wasn't|weren't)\b", arg, re.I):
                    continue
                if quoted:
                    groups[key] = arg[1:-1]
            if fn is _vault.x46 and not groups.get("dec"):
                target = groups["daily"].rstrip(".")
                if not (re.search(r"\d{4}-\d{2}-\d{2}", target) or target.lower() in {"daily", "today", "yesterday"} or target.endswith(".md") or "/" in target):
                    continue
            return mid, fn, groups
    return None


def wants(text):
    return mc.find_secret(text or "") is not None or _match(text) is not None


def _result(ok, spoken, wires, secret=False):
    return {"ok": ok, "tool": "methods_router", "spoken": spoken, "sent": False, "task_verified": False,
            "cites": [], "wires": wires, "secret": secret}


def run(text, *, env_file=None):
    if mc.find_secret(text or "") is not None:
        env_file = Path(env_file or os.environ.get("JARVIS_ENV_LOCAL") or Path.home() / ".jarvis" / ".env.local")
        try:
            got = mc.route_secret(text, env_file)
        except Exception:  # Never echo storage errors or release the secret to another handler.
            return _result(False, "I withheld that input. Secret storage failed; nothing was sent to a model.", ["secret_storage_failed"], secret=True)
        return _result(got["ok"], got["spoken"], ["secret_to_env_local"], secret=True)
    mid, fn, groups = _match(text)
    try:
        return _result(True, fn(groups), [f"methods_{mid.lower()}"])
    except (ValueError, PermissionError, OSError, KeyError) as e:
        return _result(False, f"{str(e).rstrip('.')}. Nothing was changed.", [f"methods_{mid.lower()}"])
