"""Per-turn JSONL log. One line per finished turn. Ids, counts and names only; no prompt or reply text.

Path: JARVIS_TURN_LOG (a file path; "0"/"off" disables). Default <repo>/logs/jarvis-turns.jsonl,
the same gitignored logs/ dir the Face keeper writes to.
"""
from __future__ import annotations

import json
import os
import threading
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_PATH = ROOT / "logs" / "jarvis-turns.jsonl"
_LOCK = threading.Lock()


def log_path() -> Path | None:
    raw = (os.environ.get("JARVIS_TURN_LOG") or "").strip()
    if raw.lower() in {"0", "off", "false", "no"}:
        return None
    return Path(raw).expanduser() if raw else DEFAULT_PATH


def build_row(*, started: float, ended: float, events: list[dict], talk: dict | None, inject: dict | None,
              first_ms: int | None = None) -> dict:
    tools: list[str] = []
    for ev in events:
        verb = str(ev.get("verb") or "")
        if verb and verb not in tools and verb != "think":
            tools.append(verb)
    final = events[-1] if events else {}
    talk = talk if isinstance(talk, dict) and float(talk.get("t") or 0) >= started else {}
    inject = inject if isinstance(inject, dict) and float(inject.get("t") or 0) >= started else {}
    return {
        "ts": datetime.fromtimestamp(ended, timezone.utc).isoformat().replace("+00:00", "Z"),
        "model": talk.get("model") or None,
        "primary_model": talk.get("primary") or None,
        "fallback": bool(talk.get("fallback")),
        "latency_ms": int((ended - started) * 1000),
        "talk_latency_ms": talk.get("latency_ms"),
        # Loop on_it: time to the first spoken chunk, and the tool's own time (numbers only, never text).
        "first_chunk_ms": int(first_ms) if first_ms is not None else None,
        "tool_ms": next((int(ev["tool_ms"]) for ev in reversed(events) if isinstance(ev.get("tool_ms"), (int, float))), None),
        "est_tokens_in": talk.get("est_tokens_in"),
        "est_tokens_out": talk.get("est_tokens_out"),
        "injected_context": list(talk.get("injected") or inject.get("files") or []),
        "retrieved": [
            {"file": str(r.get("file") or ""), "heading": str(r.get("heading") or "")[:120]}
            for r in (talk.get("retrieved") or []) if isinstance(r, dict)
        ],
        "tools": tools,
        "verb": final.get("verb"),
        "ok": bool(final.get("ok", True)),
        "outcome": final.get("outcome"),
        "gen": final.get("gen"),
        "finish_reason": talk.get("finish_reason") or None,
        # Soft-deadline resume: counts/ages only (stored, used, said_chars, parts, age_s), never text.
        "resume": {k: v for k, v in (talk.get("resume") or {}).items() if k in {"stored", "used", "said_chars", "parts", "age_s"}} or None,
    }


def append(row: dict, path: Path | None = None) -> Path | None:
    dest = path or log_path()
    if dest is None:
        return None
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        with _LOCK, dest.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    except OSError:
        return None
    return dest
