#!/usr/bin/env python3
"""Jarvis never-again bank. One row per mess. Do not repeat it.

Versioned heals: apps/agent-stack/memory/scars.json
Live hits: .hive/bus/scars.jsonl (not committed)
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BANK = HERE / "scars.json"
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
LIVE = HIVE / "bus" / "scars.jsonl"


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_bank() -> list[dict]:
    if not BANK.is_file():
        return []
    try:
        data = json.loads(BANK.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    rows = data.get("scars") if isinstance(data, dict) else None
    return [row for row in (rows or []) if isinstance(row, dict) and row.get("id")]


def fingerprint(text: str) -> str:
    low = re.sub(r"\s+", " ", (text or "").strip().lower())
    return low[:180]


def lookup(text: str, bank: list[dict] | None = None) -> dict | None:
    blob = fingerprint(text)
    if not blob:
        return None
    for row in bank if bank is not None else load_bank():
        marks = row.get("match") or []
        if not isinstance(marks, list):
            continue
        if any(str(mark).lower() in blob for mark in marks if mark):
            return row
    return None


def record(
    *,
    scar_id: str,
    symptom: str,
    cause: str = "",
    live: Path | None = None,
) -> dict:
    """Append one live hit. Do not rewrite the versioned bank from 4018."""
    dest = live if live is not None else LIVE
    row = {
        "id": scar_id,
        "at": now_iso(),
        "symptom": (symptom or "").strip()[:300],
        "cause": (cause or "").strip()[:300],
    }
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=True) + "\n")
    return row


def hits_for(scar_id: str, live: Path | None = None) -> int:
    path = live if live is not None else LIVE
    if not path.is_file():
        return 0
    n = 0
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(row, dict) and row.get("id") == scar_id:
                n += 1
    except OSError:
        return 0
    return n


def blocks_cursor(live: Path | None = None) -> bool:
    """After one cursor-auth-dark hit, do not call agent -p again this sitting."""
    return hits_for("cursor-auth-dark", live) >= 1


def spoken_heal(scar: dict) -> str:
    never = str(scar.get("never_again") or "").strip()
    ident = str(scar.get("id") or "scar")
    if never:
        return f"Scar {ident} already saved. {never}"
    return f"Scar {ident} already saved. I will not repeat that error."


def record_from_spoken(spoken: str, *, live: Path | None = None) -> dict | None:
    scar = lookup(spoken)
    if scar is None:
        if (spoken or "").strip().upper().startswith("UNKNOWN"):
            scar = {
                "id": "repeat-unknown",
                "never_again": "Do not re-call the same dark wire for the same UNKNOWN.",
                "heal": "repeat_guard",
            }
        else:
            return None
    record(
        scar_id=str(scar.get("id") or "repeat-unknown"),
        symptom=spoken,
        cause="bus spoken",
        live=live,
    )
    return scar


def heal_prompt(scars: list[dict]) -> str:
    lines = [
        "You are the Jarvis fix agent on this repo. Face stays 127.0.0.1:4018.",
        "Fix apps/agent-stack so these scars never repeat. No --force / --yolo.",
        "Do not send, pay, deploy, book, or publish. Do not spawn Grok Bot.",
        "Scars:",
    ]
    for row in scars[:8]:
        lines.append(
            f"- {row.get('id')}: {row.get('symptom') or ''} NEVER-AGAIN: {row.get('never_again') or ''}"
        )
    return "\n".join(lines)
