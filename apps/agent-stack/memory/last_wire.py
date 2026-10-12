#!/usr/bin/env python3
"""Jarvis-visible last hand. Not spoken. Not hive/desk.

Sir hears the human line. Heal / try-again reads this row.
Overwrite each hand. Scars.jsonl is the history.
"""
from __future__ import annotations

import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

NAME = "last-wire.json"
HERE = Path(__file__).resolve().parent


def _bus_io():
    path = HERE / "bus_io.py"
    spec = importlib.util.spec_from_file_location("agent_stack_bus_io_wire", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


BUS_IO = _bus_io()


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def path_for(hive: Path) -> Path:
    return hive / "bus" / NAME


def _clean_wire(raw: dict | None) -> dict:
    src = raw if isinstance(raw, dict) else {}
    out = {}
    for key in (
        "path",
        "scar",
        "url",
        "error",
        "job_id",
        "source",
        "outcome",
        "evidence",
        "provider",
        "model",
        "tool",
        "finish_reason",
    ):
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
    retried: bool = False,
    gen: int | None = None,
    closed: bool = False,
) -> dict:
    row = {
        "verb": (verb or "").strip()[:40],
        "ok": bool(ok),
        "human_line": (human_line or "").strip()[:240],
        "wire": _clean_wire(wire),
        "utterance": (utterance or "").strip()[:240],
        "retried": bool(retried),
        "at": now_iso(),
    }
    dest = path_for(hive)
    held = {"ok": False}

    def apply(bus: dict) -> dict:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(row, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
        held["ok"] = True
        return bus

    if closed and BUS_IO is not None and hasattr(BUS_IO, "mutate_bus"):
        # The fence has set cancel_gen on this generation. act_if_current
        # would drop the receipt. Write it only while this gen still owns the bus.
        def settle(bus: dict) -> dict:
            if gen is not None:
                try:
                    token = int(gen)
                except (TypeError, ValueError):
                    return bus
                if int(BUS_IO.bus_gen(bus)) != token:
                    return bus
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(json.dumps(row, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
            held["ok"] = True
            return bus

        BUS_IO.mutate_bus(hive, settle)
        return row if held["ok"] else {}
    if BUS_IO is not None and hasattr(BUS_IO, "act_if_current"):
        if BUS_IO.act_if_current(hive, gen, apply) is None or not held["ok"]:
            return {}
        return row
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
    if w.get("outcome"):
        bits.append(f"outcome={w['outcome']}.")
    if w.get("source"):
        bits.append(f"source={w['source']}.")
    if w.get("job_id"):
        bits.append(f"job={w['job_id']}.")
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
