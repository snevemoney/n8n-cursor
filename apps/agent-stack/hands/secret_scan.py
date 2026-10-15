"""Shared secret-shape detector for anything Jarvis persists (memory, drafts, notes).

Matches the shapes of real credentials, never stores or prints the match. Callers refuse the write and
tell the owner to keep secrets in the keychain or password manager (AGENT_RULES 5, 8b).
"""
from __future__ import annotations

import re

_PATTERNS = (
    r"gh[pousr]_[A-Za-z0-9]{20,}",                      # GitHub tokens
    r"github_pat_[A-Za-z0-9_]{20,}",
    r"sk-(?:ant-|proj-|or-)?[A-Za-z0-9\-_]{20,}",        # OpenAI / Anthropic / OpenRouter style keys
    r"xox[abprs]-[A-Za-z0-9-]{8,}",                      # Slack
    r"AKIA[0-9A-Z]{16}",                                 # AWS access key id
    r"AIza[0-9A-Za-z\-_]{30,}",                          # Google API key
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",               # PEM private keys
    r"eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}",  # JWT
    r"(?i:\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|token|secret|password|passwd|pwd)\s*[:=]\s*\S{4,})",
)
_SECRET_RE = re.compile("|".join(f"(?:{p})" for p in _PATTERNS))

REFUSAL = ("That looks like a secret (a key, token or password), so I didn't save it. "
           "Keep secrets in your keychain or password manager; I only store their names.")


def looks_secret(text: str) -> bool:
    return bool(_SECRET_RE.search(text or ""))


def redact(text: str) -> str:
    return _SECRET_RE.sub("[redacted]", text or "")
