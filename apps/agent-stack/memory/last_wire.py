#!/usr/bin/env python3
"""Jarvis-visible last hand. Not spoken. Not hive/desk.

Sir hears the human line. Heal / try-again reads this row.
Overwrite each hand. Scars.jsonl is the history.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

NAME = "last-wire.json"


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def path_for(hive: Path) -> Path:
    return hive / "bus" / NAME


def _clean_wire(raw: dict | None) -> dict:
    src = raw if isinstance(raw, dict) else {}
    out = {}
    for key in ("path", "scar", "url", "error"):
        val = src.get(key)
        if val is None or val == "":
            out[key] = None
        else:
            out[key] = str(val)[:300]
    return out


def write(
    hive: Path,
    *,
    verb: str,
    ok: bool,
    human_line: str,
    wire: dict | None = None,
    utterance: str = "",
) -> dict:
    row = {
        "verb": (verb or "").strip()[:40],
        "ok": bool(ok),
        "human_line": (human_line or "").strip()[:240],
        "wire": _clean_wire(wire),
        "utterance": (utterance or "").strip()[:240],
        "at": now_iso(),
    }
    dest = path_for(hive)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(row, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
    return row


def read(hive: Path) -> dict:
    dest = path_for(hive)
    if not dest.is_file():
        return {}
    try:
        data = json.loads(dest.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def inspect_line(row: dict | None) -> str:
    """One spoken wire line. Only when Evens asked what failed."""
    last = row if isinstance(row, dict) else {}
    if not last:
        return "No last wire on disk."
    w = last.get("wire") if isinstance(last.get("wire"), dict) else {}
    bits = [f"Last hand: {last.get('verb') or 'none'}."]
    if w.get("path"):
        bits.append(f"path={w['path']}.")
    if w.get("scar"):
        bits.append(f"scar {w['scar']}.")
    if w.get("url"):
        bits.append(str(w["url"]))
    if w.get("error"):
        bits.append(str(w["error"])[:160])
    if last.get("ok") is False and len(bits) == 1:
        bits.append("It failed.")
    elif last.get("ok") and len(bits) == 1:
        bits.append("It succeeded.")
    return " ".join(bits)
