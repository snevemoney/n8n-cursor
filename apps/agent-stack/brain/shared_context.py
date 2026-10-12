"""Shared brain loader: the fleet's JARVIS_CONTEXT.md (and AGENT_RULES.md when it fits).

Source dir: JARVIS_SHARED_DIR, default ~/.grok-shared (a symlink to the canonical
outer-heaven CONTENT/os/shared). Opt out with JARVIS_SHARED_CONTEXT=0.
Cap with JARVIS_SHARED_CONTEXT_MAX_CHARS (default 14000). Read-only. Never raises.
"""
from __future__ import annotations

import os
import time
from pathlib import Path

PRIMARY = "JARVIS_CONTEXT.md"
OPTIONAL = ("AGENT_RULES.md",)
DEFAULT_MAX_CHARS = 14000
_CACHE: dict = {}
_CACHE_SEC = 30.0


def shared_dir() -> Path:
    raw = (os.environ.get("JARVIS_SHARED_DIR") or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / ".grok-shared"


def enabled() -> bool:
    return (os.environ.get("JARVIS_SHARED_CONTEXT") or "1").strip().lower() not in {"0", "false", "off", "no"}


def max_chars() -> int:
    try:
        return max(0, int(os.environ.get("JARVIS_SHARED_CONTEXT_MAX_CHARS") or DEFAULT_MAX_CHARS))
    except ValueError:
        return DEFAULT_MAX_CHARS


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    except OSError:
        return ""


def load_shared_context(*, use_cache: bool = True) -> dict:
    """{"text", "files": [names], "dir", "chars", "truncated"}. Empty text when off or missing."""
    empty = {"text": "", "files": [], "dir": "", "chars": 0, "truncated": False}
    if not enabled():
        return {**empty, "disabled": True}
    root = shared_dir()
    cap = max_chars()
    key = (str(root), cap)
    now = time.monotonic()
    hit = _CACHE.get(key)
    if use_cache and hit and now - hit[0] < _CACHE_SEC:
        return dict(hit[1])
    out = dict(empty, dir=str(root))
    body = _read(root / PRIMARY)
    if body and cap:
        blocks: list[str] = []
        head = f"[shared:{PRIMARY}]\n"
        room = cap - len(head)
        if len(body) > room:
            body = body[: max(0, room - 14)].rstrip() + "\n[truncated]"
            out["truncated"] = True
        blocks.append(head + body)
        out["files"].append(PRIMARY)
        used = len(blocks[0])
        for name in OPTIONAL:
            extra = _read(root / name)
            block = f"[shared:{name}]\n{extra}"
            if extra and used + 2 + len(block) <= cap:
                blocks.append(block)
                out["files"].append(name)
                used += 2 + len(block)
        out["text"] = "\n\n".join(blocks)
        out["chars"] = len(out["text"])
    _CACHE[key] = (now, dict(out, files=list(out["files"])))
    return out


def shared_system_block(*, use_cache: bool = True) -> tuple[str, list[str]]:
    got = load_shared_context(use_cache=use_cache)
    if not got.get("text"):
        return "", []
    files = list(got["files"])
    text = (
        "Shared fleet context (read from disk this turn; cite the file name when you use it: "
        + ", ".join(files)
        + "):\n"
        + got["text"]
    )
    return text, files

