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
    r"(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}",       # Stripe
    r"(?:hf|npm)_[A-Za-z0-9]{30,}",                      # Hugging Face / npm
    r"(?i:\bbearer\s+[A-Za-z0-9._\-]{20,})",              # Authorization headers
    r"://[^/\s:@]+:[^/\s@]+@",                           # credentials inside a URL
    # KEY=value / key: value. Env-style names count (OPENAI_API_KEY); the value must look key-like
    # (a digit or symbol, or 8+ unbroken chars after '='), so "password: reset" stays a normal note.
    r"(?i:[A-Za-z0-9_]*(?:api[_-]?key|access[_-]?key|token|secret|password|passwd|pwd)\s*[:=]\s*[\"']?"
    r"(?=[^\s\"',;]*[0-9_\-/+=!@#$%^&*.])[^\s\"',;]{4,})",
    r"(?i:[A-Za-z0-9_]*(?:api[_-]?key|access[_-]?key|token|secret|password|passwd|pwd)\s*=\s*[\"']?[^\s\"',;]{8,})",
    r"(?i:\b(?:password|passcode|pin)\s+is\s+(?=\S*\d)\S{4,})",
)
_SECRET_RE = re.compile("|".join(f"(?:{p})" for p in _PATTERNS))

REFUSAL = ("That looks like a secret (a key, token or password), so I didn't save it. "
           "Keep secrets in your keychain or password manager; I only store their names.")


def looks_secret(text: str) -> bool:
    return bool(_SECRET_RE.search(text or ""))


def redact(text: str) -> str:
    return _SECRET_RE.sub("[redacted]", text or "")
