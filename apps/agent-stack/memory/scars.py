#!/usr/bin/env python3
"""Jarvis never-again bank. One row per mess. Do not repeat it.

Versioned heals: apps/agent-stack/memory/scars.json
Live hits: .hive/bus/scars.jsonl (not committed)

Live rows carry expires_at + resolved. blocks_cursor is not permanent:
expired or resolved hits do not block the next Cursor turn.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
BANK = HERE / "scars.json"
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
LIVE = HIVE / "bus" / "scars.jsonl"
DEFAULT_TTL_SEC = 15 * 60


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_iso(raw: str) -> datetime | None:
    text = (raw or "").strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        stamp = datetime.fromisoformat(text)
    except ValueError:
        return None
    if stamp.tzinfo is None:
        stamp = stamp.replace(tzinfo=timezone.utc)
    return stamp.astimezone(timezone.utc)


def _plus_iso(seconds: int) -> str:
    when = datetime.now(timezone.utc) + timedelta(seconds=max(0, int(seconds)))
    return when.strftime("%Y-%m-%dT%H:%M:%SZ")


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


def _iter_live(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    rows: list[dict] = []
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(row, dict) and row.get("id"):
                rows.append(row)
    except OSError:
        return []
    return rows


def latest_for(scar_id: str, live: Path | None = None) -> dict | None:
    last = None
    for row in _iter_live(live if live is not None else LIVE):
        if row.get("id") == scar_id:
            last = row
    return last


def is_active(row: dict | None) -> bool:
    if not isinstance(row, dict):
        return False
    if row.get("resolved") is True:
        return False
    expires = _parse_iso(str(row.get("expires_at") or ""))
    if expires is None:
        return False
    if expires <= datetime.now(timezone.utc):
        return False
    return True


def record(
    *,
    scar_id: str,
    symptom: str,
    cause: str = "",
    live: Path | None = None,
    expires_at: str | None = None,
    resolved: bool = False,
    ttl_sec: int = DEFAULT_TTL_SEC,
) -> dict:
    """Append one live hit. Do not rewrite the versioned bank from 4018."""
    dest = live if live is not None else LIVE
    row = {
        "id": scar_id,
        "at": now_iso(),
        "symptom": (symptom or "").strip()[:300],
        "cause": (cause or "").strip()[:300],
        "resolved": bool(resolved),
        "expires_at": (expires_at or "").strip() or _plus_iso(ttl_sec),
    }
    dest.parent.mkdir(parents=True, exist_ok=True)
    with dest.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(row, ensure_ascii=True) + "\n")
    return row


def resolve(scar_id: str, live: Path | None = None) -> dict:
    """Mark the latest hit resolved. Append-only. Do not delete scars.json."""
    last = latest_for(scar_id, live)
    return record(
        scar_id=scar_id,
        symptom=str((last or {}).get("symptom") or scar_id),
        cause="resolved",
        live=live,
        resolved=True,
        expires_at=now_iso(),
    )


def hits_for(scar_id: str, live: Path | None = None) -> int:
    path = live if live is not None else LIVE
    return sum(1 for row in _iter_live(path) if row.get("id") == scar_id)


def blocks_cursor(live: Path | None = None) -> bool:
    """True only while the latest cursor-auth-dark hit is unexpired and unresolved."""
    return is_active(latest_for("cursor-auth-dark", live))


def spoken_heal(scar: dict) -> str:
    _ = scar
    return "I already logged that error. I will not repeat it."


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
