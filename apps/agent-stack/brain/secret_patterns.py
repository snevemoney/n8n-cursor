"""One secret detector for every redactor (privacy audit 2026-10-16). Pure regexes, no I/O.

Before this, five sites (tool-result hooks, agent_tools, chats, results write-back, pasted-secret routing) each had
their own list and each missed different keys: github_pat_, sk-proj-/sk-ant-/sk-or-v1-, xapp-, AWS secret keys, JWTs,
PEM private keys, URL passwords, Stripe sk_live_, Hugging Face hf_, KEY=value lines. Load by path:
    spec_from_file_location("agent_stack_secret_patterns", STACK / "brain" / "secret_patterns.py")
"""
from __future__ import annotations

import re

# Values that are secrets by their shape alone.
TOKEN_RE = re.compile(
    r"-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z0-9 ]*PRIVATE KEY-----|$)"
    r"|\bgithub_pat_[A-Za-z0-9_]{20,}|\bgh[pousr]_[A-Za-z0-9]{20,}"
    r"|\bsk-(?:proj-|ant-|or-v1-|svcacct-|admin-)?[A-Za-z0-9_\-]{16,}"
    r"|\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}|\bwhsec_[A-Za-z0-9]{16,}"
    r"|\bxox[abprs]-[A-Za-z0-9\-]{10,}|\bxapp-[A-Za-z0-9\-]{10,}"
    r"|\b(?:AKIA|ASIA)[0-9A-Z]{16}\b|\bAIza[0-9A-Za-z_\-]{30,}|\bya29\.[A-Za-z0-9_\-]{20,}"
    r"|\bhf_[A-Za-z0-9]{20,}|\bxai-[A-Za-z0-9_\-]{16,}|\bglpat-[A-Za-z0-9_\-]{16,}|\bnpm_[A-Za-z0-9]{30,}"
    r"|\beyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}"
    r"|(?i:\bbearer)\s+[A-Za-z0-9._\-]{16,}"
)
# A password inside a URL: keep the scheme, user and host, drop the password.
URL_CRED_RE = re.compile(r"(?P<pre>[a-z][a-z0-9+.\-]*://[^/\s:@]+:)(?P<pw>[^@\s/]+)(?P<at>@)", re.I)
# NAME=value / name: value where the name says it is a secret.
ASSIGN_RE = re.compile(
    r"(?P<name>\b[A-Za-z0-9_.\-]*(?:api[_\-]?key|secret|token|passw(?:or)?d|passwd|private[_\-]?key|access[_\-]?key|"
    r"client[_\-]?secret|auth)[A-Za-z0-9_.\-]*)(?P<sep>\s*[:=]\s*[\"']?)(?P<val>[^\s\"',;]{6,})", re.I)
# "my password is Hunter2Pass!"
SPOKEN_PW_RE = re.compile(r"(?P<lead>\b(?:password|passcode|pin)\s+(?:is|was)\s+)(?P<val>\S{4,})", re.I)

MASK = "[redacted]"


def has_secret(text) -> bool:
    t = text if isinstance(text, str) else ""
    return bool(TOKEN_RE.search(t) or URL_CRED_RE.search(t) or ASSIGN_RE.search(t) or SPOKEN_PW_RE.search(t))


def redact(text):
    """Replace every secret value; names, hosts and the surrounding words stay readable."""
    if not isinstance(text, str) or not text:
        return text
    out = TOKEN_RE.sub(MASK, text)
    out = URL_CRED_RE.sub(lambda m: m.group("pre") + MASK + m.group("at"), out)
    out = ASSIGN_RE.sub(lambda m: m.group("name") + m.group("sep") + (m.group("val") if m.group("val") == MASK else MASK), out)
    return SPOKEN_PW_RE.sub(lambda m: m.group("lead") + MASK, out)


def first_secret(text):
    """(name_hint, value) for the first secret value, or None."""
    t = text if isinstance(text, str) else ""
    m = TOKEN_RE.search(t)
    if m:
        return None, m.group(0)
    m = ASSIGN_RE.search(t)
    if m:
        return m.group("name"), m.group("val")
    m = URL_CRED_RE.search(t)
    if m:
        return "url_password", m.group("pw")
    return None
