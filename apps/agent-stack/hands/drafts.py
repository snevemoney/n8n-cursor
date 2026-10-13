"""Drafts hand (desk parity: email / Slack / text drafting). Drafts are free; sending is always gated.

The builder model writes the draft; it is saved as a local file in ~/jarvis-drafts (JARVIS_DRAFTS_DIR) and
read back. Nothing is sent, posted or put in a provider mailbox. A later "send it" is a hard step that needs
Evens's explicit confirm (hands/permissions: kind "send"). Every draft is logged (kind, channel, file name only).
"""
from __future__ import annotations

import importlib.util
import os
import re
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
WANT_RE = re.compile(r"\b(?:draft|compose|write(?:\s+up)?)\b(?:\s+\w+){0,4}?\s+(?:an?\s+)?(?:short\s+)?"
                     r"(email|e-mail|mail|slack(?:\s+message)?|message|text|dm|reply|note)\b", re.I)
SEND_RE = re.compile(r"\b(send|post|deliver|email it|text it)\b", re.I)


def _mod(name: str):
    key = f"agent_stack_{name}"
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, HERE / f"{name}.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


def wants_draft(u: str) -> bool:
    return bool(WANT_RE.search(u or "")) and not re.match(r"^\s*(send|post)\b", u or "", re.I)


def drafts_dir() -> Path:
    raw = (os.environ.get("JARVIS_DRAFTS_DIR") or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / "jarvis-drafts"


def channel(u: str) -> str:
    m = WANT_RE.search(u or "")
    c = (m.group(1) if m else "message").lower()
    return "slack" if c.startswith("slack") else ("email" if c in {"email", "e-mail", "mail"} else c)


def run(utterance: str, *, chat=None) -> dict:
    ca = _mod("code_author")
    talk = chat or ca.CHAT
    ch = channel(utterance)
    text = talk(ca.BUILDER, f"Write a short {ch} draft for this request. Plain text only. "
                            + ("Start with 'Subject: ...' on the first line, then the body. " if ch == "email" else "")
                            + "No placeholders like [Name] unless the name is unknown. Request: " + utterance)
    text = (text or "").strip()
    if not text:
        return {"ok": False, "spoken": "The writing model gave no draft this turn, so nothing was saved and nothing was sent."}
    d = drafts_dir(); d.mkdir(parents=True, exist_ok=True)
    f = d / f"{time.strftime('%Y%m%d-%H%M%S')}-{ch}.md"
    f.write_text(text + "\n", encoding="utf-8")
    _mod("permissions").log_action("draft", f"{ch}:{f.name}", "allow", chars=len(text))
    short = " ".join(text.split())[:400]
    return {"ok": True, "file": str(f), "channel": ch, "sent": False,
            "spoken": f"Draft {ch}, not sent (saved to {f.name} in jarvis-drafts): {short} — Sending is gated: "
                      f"tell me to send it and I'll ask for your confirm first."}


def log_meta(got: dict) -> dict:
    return {"ok": bool(got.get("ok")), "channel": got.get("channel"), "sent": False}
