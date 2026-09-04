#!/usr/bin/env python3
"""The Jarvis brain is the store: vault + repo + sessions + hive.

Cursor and Grok are hosts. This module only packs existing paths.
It does not dump hive/desk, ChatGPT .data, or full transcripts.
"""
from __future__ import annotations

import importlib.util
import json
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
SESSIONS_CAP = 3
ASK_CAP = 120
_SESSION_CACHE: dict = {"at": 0.0, "lines": []}
CACHE_SEC = 45.0


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def hive_block(hive: Path) -> str:
    stack = load_json(hive / "agent-stack.json")
    bus = load_json(hive / "bus" / "state.json")
    state = load_json(hive / "state.json")
    vault = stack.get("vault") if isinstance(stack.get("vault"), dict) else {}
    vault_path = str(vault.get("oh") or vault.get("path") or "").strip()
    repo = str(stack.get("repo") or ROOT).strip()
    lines = [
        "Store (this is the brain):",
        f"Vault: {vault_path or 'adopted path missing'}",
        f"Repo: {repo}",
        f"Hive: {stack.get('name') or 'hive'}",
    ]
    if bus.get("phase") or bus.get("job_status"):
        lines.append(f"Bus phase {bus.get('phase') or 'idle'} job {bus.get('job_status') or 'done'}.")
    last = state.get("last_run") if isinstance(state.get("last_run"), dict) else {}
    if last:
        lines.append(f"Hive last_run {last.get('id') or last.get('job') or last.get('desk') or '?'}.")
    return "\n".join(lines)


def session_lines(limit: int = SESSIONS_CAP) -> list[str]:
    """Titles / first asks only. Never dump JSONL."""
    now = time.time()
    cached = _SESSION_CACHE.get("lines") or []
    if cached and now - float(_SESSION_CACHE.get("at") or 0) < CACHE_SEC:
        return list(cached)
    lines: list[str] = []
    cur_path = ROOT / "scripts/hive/os/cursor-chat-sessions.py"
    cur = _load("agent_stack_cursor_chats", cur_path)
    if cur is not None:
        try:
            cfg = cur.load_cfg()
            files = cur.session_files(cfg, "n8n-cursor", False)
            files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
            for path in files[:limit]:
                ask = str(cur.first_ask(path, ASK_CAP) or "").strip()
                if ask:
                    lines.append(f"Cursor sitting: {ask}")
        except (OSError, KeyError, TypeError, AttributeError):
            pass
    grok_path = ROOT / "scripts/hive/os/grok-chat-sessions.py"
    grok = _load("agent_stack_grok_chats", grok_path)
    if grok is not None and hasattr(grok, "collect_threads"):
        try:
            _root, threads, err = grok.collect_threads(grok.load_cfg())
            if not err:
                for row in (threads or [])[:limit]:
                    if not isinstance(row, dict):
                        continue
                    ask = str(row.get("ask") or row.get("title") or "").strip()
                    if not ask:
                        continue
                    desk = str(row.get("desk") or "desk").strip() or "desk"
                    lines.append(f"Hive sitting ({desk}): {ask[:ASK_CAP]}")
        except (OSError, KeyError, TypeError, AttributeError, ValueError):
            pass
    _SESSION_CACHE["at"] = now
    _SESSION_CACHE["lines"] = list(lines)
    return lines


def sessions_block(*, live: bool) -> str:
    if not live:
        return ""
    rows = session_lines()
    if not rows:
        return "Chat sessions: none listed (filter held; no dump)."
    return "Chat sessions (titles only):\n" + "\n".join(rows)


def store_pack(hive: Path, *, live_sessions: bool) -> str:
    parts = [hive_block(hive)]
    sessions = sessions_block(live=live_sessions)
    if sessions:
        parts.append(sessions)
    return "\n\n".join(parts)
