#!/usr/bin/env python3
"""Fill last_live from bus / sitting / face logs. UNKNOWN if no quote."""
from __future__ import annotations

import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
MATRIX_PATH = HERE / "command-matrix.json"
BUS = ROOT / "docs/hive/outer-heaven/.hive/bus/state.json"
SCARS = ROOT / "docs/hive/outer-heaven/.hive/bus/scars.jsonl"


def _load_turns() -> list[dict]:
    if not BUS.is_file():
        return []
    try:
        data = json.loads(BUS.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    raw = data.get("turns") if isinstance(data, dict) else None
    return [row for row in (raw or []) if isinstance(row, dict)]


def _match_turn(phrase: str, turns: list[dict]) -> dict | None:
    needle = (phrase or "").strip().lower()
    if not needle:
        return None
    for row in reversed(turns):
        user = str(row.get("user") or "").strip()
        if needle in user.lower() or user.lower() in needle:
            return {"user": user, "jarvis": str(row.get("jarvis") or "")}
    return None


def main() -> int:
    matrix = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
    turns = _load_turns()
    source = "docs/hive/outer-heaven/.hive/bus/state.json" if turns else None
    for row in matrix.get("rows") or []:
        live = None
        for phrase in row.get("triggers") or []:
            live = _match_turn(phrase, turns)
            if live:
                break
        if live and (live.get("jarvis") or "").strip():
            row["last_live"] = {
                "status": "quoted",
                "user": live["user"],
                "jarvis": live["jarvis"][:280],
                "source": source,
            }
        elif not (row.get("last_live") or {}).get("status") == "quoted":
            row["last_live"] = {"status": "UNKNOWN", "quote": None, "source": None}
    if SCARS.is_file() and "heal" in {r["verb"] for r in matrix["rows"]}:
        heal = next(r for r in matrix["rows"] if r["verb"] == "heal")
        if heal.get("last_live", {}).get("status") != "quoted":
            text = SCARS.read_text(encoding="utf-8")
            if "heal verb" in text:
                hit = next((ln for ln in text.splitlines() if "heal verb" in ln), "")
                heal["last_live"] = {
                    "status": "quoted",
                    "user": "(scar log)",
                    "jarvis": hit[:280],
                    "source": "docs/hive/outer-heaven/.hive/bus/scars.jsonl",
                }
    MATRIX_PATH.write_text(json.dumps(matrix, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "turns": len(turns), "path": str(MATRIX_PATH)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
