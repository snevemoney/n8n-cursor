"""Shared helpers for the methods_router_* handler modules (typed/spoken asks -> cores)."""
from __future__ import annotations

import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


def methods_root():
    return Path(os.environ.get("JARVIS_METHODS_ROOT") or Path.home() / ".jarvis" / "methods")


def vault_root():
    """Agent-owned folder; never the human vault unless Evens points JARVIS_METHODS_VAULT at it."""
    return Path(os.environ.get("JARVIS_METHODS_VAULT") or methods_root() / "vault")


def rx(pattern):
    """Whole-utterance match, optional 'jarvis,' prefix and trailing period."""
    return re.compile(r"(?:jarvis[, ]+)?" + pattern + r"\.?", re.I | re.S)


def pairs(text):
    """'a=b, c=d e' -> {'a': 'b', 'c': 'd e'}; comma separated."""
    out = {}
    for part in text.split(","):
        key, sep, val = part.partition("=")
        if sep:
            out[key.strip().lower().replace(" ", "_")] = val.strip().lower()
    return out
