#!/usr/bin/env python3
"""Calendar, Mail, and invoice from real Mac/vault wires.

Do not invent meetings, unread counts, clients, or dollar amounts.
If a wire is dark, say UNKNOWN and name the wire.
Invoice create/send stays Evens. Vault retrieve only.
"""
from __future__ import annotations

import importlib.util
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
INVOICE_INVENT = re.compile(r"\b(create|make|draft|send)\b.*\binvoice|\binvoice\b.*\b(create|make|draft|send)\b", re.I)

_RETRIEVE = None


def _retrieve():
    global _RETRIEVE
    if _RETRIEVE is not None:
        return _RETRIEVE
    path = Path(__file__).resolve().parent.parent / "memory" / "retrieve.py"
    spec = importlib.util.spec_from_file_location("agent_stack_retrieve_inbox", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    _RETRIEVE = mod
    return mod


def _run(argv: list[str], timeout: float = 8.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, capture_output=True, text=True, timeout=timeout)


def _osascript(script: str, timeout: float = 8.0) -> subprocess.CompletedProcess[str]:
    return _run(["osascript", "-e", script], timeout=timeout)


def calendar_events(when: str = "today") -> dict:
    """Today or tomorrow from Calendar.app. Cap 5. Never invent events."""
    if os.environ.get("AGENT_STACK_INBOX_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "calendar",
            "events": [],
            "spoken": "UNKNOWN. Calendar.app is dry. I will not invent meetings.",
        }
    day = "tomorrow" if str(when or "").strip().lower() == "tomorrow" else "today"
    offset = " + (1 * days)" if day == "tomorrow" else ""
    script = (
        'tell application "Calendar"\n'
        "  set dayStart to (current date)" + offset + "\n"
        "  set hours of dayStart to 0\n"
        "  set minutes of dayStart to 0\n"
        "  set seconds of dayStart to 0\n"
        "  set dayEnd to dayStart + (1 * days)\n"
        "  set bits to {}\n"
        "  repeat with cal in calendars\n"
        "    try\n"
        "      set evs to (every event of cal whose start date ≥ dayStart and start date < dayEnd)\n"
        "      repeat with e in evs\n"
        '        set end of bits to (summary of e as text) & " @ " & (time string of (start date of e))\n'
        "      end repeat\n"
        "    end try\n"
        "  end repeat\n"
        "  if (count of bits) is 0 then return \"NONE\"\n"
        "  set AppleScript's text item delimiters to linefeed\n"
        "  return bits as text\n"
        "end tell\n"
    )
    try:
        proc = _osascript(script, timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "calendar",
            "events": [],
            "spoken": f"UNKNOWN. Calendar.app failed: {exc}. I will not invent meetings.",
        }
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Calendar not allowed").strip()[:180]
        return {
            "ok": False,
            "unknown": True,
            "wire": "calendar",
            "events": [],
            "spoken": f"UNKNOWN. Calendar.app is dark. Allow Terminal to control Calendar. {err}",
        }
    raw = (proc.stdout or "").strip()
    if not raw or raw == "NONE":
        return {
            "ok": True,
            "unknown": False,
            "wire": "calendar",
            "events": [],
            "when": day,
            "spoken": f"Calendar.app has no events {day}.",
        }
    events = [ln.strip() for ln in raw.splitlines() if ln.strip()][:5]
    spoken = f"Calendar.app {day}: " + "; ".join(events) + "."
    return {
        "ok": True,
        "unknown": False,
        "wire": "calendar",
        "events": events,
        "when": day,
        "spoken": spoken,
    }


def calendar_today() -> dict:
    return calendar_events("today")


def mail_unread() -> dict:
    """Unread inbox count from Mail.app. Never invent a count."""
    if os.environ.get("AGENT_STACK_INBOX_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "mail",
            "unread": None,
            "spoken": "UNKNOWN. Mail.app is dry. I will not invent unread mail.",
        }
    script = 'tell application "Mail"\n  return (unread count of inbox) as text\nend tell\n'
    try:
        proc = _osascript(script, timeout=8.0)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "mail",
            "unread": None,
            "spoken": f"UNKNOWN. Mail.app failed: {exc}. I will not invent unread mail.",
        }
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "Mail not allowed").strip()[:180]
        return {
            "ok": False,
            "unknown": True,
            "wire": "mail",
            "unread": None,
            "spoken": f"UNKNOWN. Mail.app is dark. Allow Terminal to control Mail. {err}",
        }
    raw = (proc.stdout or "").strip()
    if not raw.isdigit():
        return {
            "ok": False,
            "unknown": True,
            "wire": "mail",
            "unread": None,
            "spoken": "UNKNOWN. Mail.app returned no unread count. I will not invent mail.",
        }
    count = int(raw)
    spoken = f"Mail.app inbox has {count} unread." if count != 1 else "Mail.app inbox has 1 unread."
    return {"ok": True, "unknown": False, "wire": "mail", "unread": count, "spoken": spoken}


def invoice_lookup(utterance: str = "", retrieve_roots: list[Path] | None = None) -> dict:
    """Vault retrieve only. Never invent a client or amount. Create/send stays Evens."""
    text = (utterance or "").strip()
    if INVOICE_INVENT.search(text):
        return {
            "ok": False,
            "unknown": True,
            "wire": "invoice",
            "spoken": (
                "UNKNOWN. I will not invent or send an invoice, client, or amount. "
                "Invoice is vault retrieve only. Send stays with you."
            ),
        }
    found = _retrieve().search(text or "invoice unpaid", retrieve_roots)
    cites = found.get("hits") or []
    if found.get("unknown") or not cites:
        return {
            "ok": False,
            "unknown": True,
            "wire": "invoice",
            "cites": [],
            "spoken": "UNKNOWN. Invoice wire is vault retrieve. Nothing matched. I will not invent a client or amount.",
        }
    top = cites[0] if isinstance(cites[0], dict) else {}
    snippet = str(top.get("snippet") or "").strip()
    path = str(top.get("path") or "vault")
    if not snippet:
        return {
            "ok": False,
            "unknown": True,
            "wire": "invoice",
            "cites": cites,
            "spoken": "UNKNOWN. Invoice wire is vault retrieve. Nothing matched. I will not invent a client or amount.",
        }
    spoken = f"Vault invoice note from {path}: {snippet}"
    if len(spoken) > 280:
        spoken = spoken[:277].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "wire": "invoice",
        "cites": cites,
        "spoken": spoken,
    }
