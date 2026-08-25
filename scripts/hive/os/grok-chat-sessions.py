#!/usr/bin/env python3
"""List or read local Grok Bot desk threads. Do not dump all.

Mac HOST only. Cloud checkout cannot see this folder.

Usage:
  python3 scripts/hive/os/grok-chat-sessions.py list [--desk Forge] [--limit 20]
  python3 scripts/hive/os/grok-chat-sessions.py read --id <uuid>
"""
from __future__ import annotations

import argparse
import base64
import binascii
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

CFG_PATH = Path(__file__).resolve().parent / "grok-chat-sessions.json"
SECRET_RE = re.compile(
    r"(?i)("
    r"[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}"
    r"|sk-[A-Za-z0-9_\-]{12,}"
    r"|ghp_[A-Za-z0-9]{20,}"
    r"|github\|user_[A-Z0-9]+"
    r"|user_01[A-Z0-9]{20,}"
    r")"
)
WS_RE = re.compile(r"\s+")


def load_cfg() -> dict:
    return json.loads(CFG_PATH.read_text(encoding="utf-8"))


def persistence_root(cfg: dict) -> Path:
    return Path(cfg["root"]).expanduser()


def decode_blob_key(stem: str) -> str | None:
    raw = stem.upper()
    pad = (-len(raw)) % 8
    try:
        return base64.b32decode(raw + "=" * pad, casefold=True).decode("utf-8")
    except (binascii.Error, UnicodeDecodeError, ValueError):
        return None


def sanitize(text: str) -> str:
    cleaned = SECRET_RE.sub("[redacted]", text)
    return WS_RE.sub(" ", cleaned).strip()


def load_json_blob(path: Path) -> dict:
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    except (OSError, json.JSONDecodeError):
        return {}
    return data if isinstance(data, dict) else {}


def iter_blobs(root: Path) -> list[tuple[Path, str]]:
    out: list[tuple[Path, str]] = []
    if not root.is_dir():
        return out
    for path in root.glob("*.blob"):
        key = decode_blob_key(path.stem)
        if key:
            out.append((path, unquote(key)))
    return out


def load_roster(cfg: dict, blobs: list[tuple[Path, str]]) -> dict[str, dict]:
    suffix = cfg.get("roster_suffix") or ".roster.last-roster"
    for path, key in blobs:
        if not key.endswith(suffix):
            continue
        rows = (load_json_blob(path).get("value") or {}).get("rows") or []
        out: dict[str, dict] = {}
        for row in rows:
            if not isinstance(row, dict):
                continue
            rid = str(row.get("id") or "")
            if rid:
                out[rid] = row
        return out
    return {}


def replica_id(cfg: dict, key: str) -> str | None:
    infix = cfg.get("replica_infix") or ".transcript.replicas."
    if infix not in key:
        return None
    return key.rsplit(".", 1)[-1]


def first_ask(entries: list, limit: int) -> str:
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        kind = entry.get("kind")
        if kind == "message" and entry.get("role") == "user":
            content = entry.get("content")
            if isinstance(content, str) and content.strip():
                return sanitize(content)[:limit]
        if kind == "send-message":
            message = entry.get("message")
            content = ""
            if isinstance(message, dict):
                raw = message.get("content") or message.get("text") or ""
                content = raw if isinstance(raw, str) else ""
            elif isinstance(message, str):
                content = message
            if content.strip():
                return sanitize(content)[:limit]
    return ""


def ms_to_iso(ms: object) -> str:
    try:
        value = int(ms)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return ""
    if value > 10_000_000_000:
        value = value / 1000
    try:
        return datetime.fromtimestamp(value, tz=timezone.utc).isoformat()
    except (OSError, OverflowError, ValueError):
        return ""


def miss_payload(root: Path) -> dict:
    return {
        "miss": True,
        "path": str(root),
        "reason": (
            "Grok Bot persistence folder missing on this host. "
            "Cloud cannot see ~/Library/Application Support/Grok Bot/. "
            "This CLI is Mac HOST only."
        ),
    }


def collect_threads(cfg: dict) -> tuple[Path, list[dict], str | None]:
    root = persistence_root(cfg)
    if not root.is_dir():
        return root, [], "missing-folder"
    blobs = iter_blobs(root)
    roster = load_roster(cfg, blobs)
    ask_limit = int(cfg.get("ask_limit") or 160)
    threads: list[dict] = []
    for path, key in blobs:
        tid = replica_id(cfg, key)
        if not tid:
            continue
        payload = load_json_blob(path).get("value") or {}
        entries = payload.get("entries") if isinstance(payload.get("entries"), list) else []
        row = roster.get(tid) or {}
        last_entry = row.get("lastEntry") if isinstance(row.get("lastEntry"), dict) else {}
        ask = first_ask(entries, ask_limit)
        if not ask and isinstance(last_entry.get("text"), str):
            ask = sanitize(last_entry["text"])[:ask_limit]
        activity = row.get("lastActivityAt") or payload.get("persistedAt")
        threads.append(
            {
                "id": tid,
                "desk": row.get("name") or "",
                "title": row.get("title") or "",
                "mtime": datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
                "activity": ms_to_iso(activity),
                "bytes": path.stat().st_size,
                "entries": len(entries),
                "ask": ask,
            }
        )
    threads.sort(key=lambda t: t.get("activity") or t["mtime"], reverse=True)
    return root, threads, None


def cmd_list(cfg: dict, desk: str | None, limit: int) -> int:
    root, threads, err = collect_threads(cfg)
    if err == "missing-folder":
        print(json.dumps(miss_payload(root), indent=2))
        return 2
    if desk:
        needle = desk.lower()
        threads = [
            t
            for t in threads
            if needle in (t.get("desk") or "").lower() or needle in t["id"]
        ]
    cap = limit if limit > 0 else int(cfg.get("default_list_limit") or 20)
    sliced = threads[:cap]
    print(
        json.dumps(
            {
                "miss": False,
                "root": str(root),
                "shown": len(sliced),
                "total_matching": len(threads),
                "limit": cap,
                "threads": sliced,
            },
            indent=2,
        )
    )
    return 0


def format_entries(entries: list, max_chars: int) -> tuple[str, bool]:
    lines: list[str] = []
    for entry in entries:
        if not isinstance(entry, dict):
            continue
        kind = entry.get("kind")
        if kind == "message":
            role = entry.get("role") or "unknown"
            content = entry.get("content")
            text = content if isinstance(content, str) else ""
            if text.strip():
                lines.append(f"{role}: {sanitize(text)}")
            continue
        if kind == "send-message":
            message = entry.get("message")
            text = ""
            if isinstance(message, dict):
                raw = message.get("content") or message.get("text") or ""
                text = raw if isinstance(raw, str) else ""
            elif isinstance(message, str):
                text = message
            if text.strip():
                lines.append(f"send: {sanitize(text)}")
    blob = "\n".join(lines)
    truncated = len(blob) > max_chars
    return blob[:max_chars], truncated


def cmd_read(cfg: dict, thread_id: str) -> int:
    if not thread_id:
        raise SystemExit("read requires --id")
    root = persistence_root(cfg)
    if not root.is_dir():
        print(json.dumps(miss_payload(root), indent=2))
        return 2
    blobs = iter_blobs(root)
    roster = load_roster(cfg, blobs)
    hits: list[tuple[Path, str]] = []
    for path, key in blobs:
        tid = replica_id(cfg, key)
        if tid and thread_id in tid:
            hits.append((path, tid))
    if not hits:
        raise SystemExit(f"no Grok thread matching {thread_id}")
    exact = [h for h in hits if h[1] == thread_id]
    if len(hits) > 1 and not exact:
        ids = sorted({tid for _, tid in hits})
        raise SystemExit(f"ambiguous id {thread_id}; matches {ids[:8]}")
    path, tid = exact[0] if exact else hits[0]
    payload = load_json_blob(path).get("value") or {}
    entries = payload.get("entries") if isinstance(payload.get("entries"), list) else []
    max_chars = int(cfg.get("read_max_chars") or 80000)
    text, truncated = format_entries(entries, max_chars)
    row = roster.get(tid) or {}
    print(
        json.dumps(
            {
                "miss": False,
                "id": tid,
                "desk": row.get("name") or "",
                "title": row.get("title") or "",
                "bytes": path.stat().st_size,
                "entries": len(entries),
                "truncated": truncated,
                "text": text,
            },
            indent=2,
        )
    )
    return 0


def main() -> int:
    cfg = load_cfg()
    ap = argparse.ArgumentParser(
        description="Read local Grok Bot desk threads (one at a time). Mac HOST only."
    )
    sub = ap.add_subparsers(dest="cmd", required=True)
    lp = sub.add_parser("list", help="List recent desk threads (do not dump all)")
    lp.add_argument("--desk", help="Desk name or id substring")
    lp.add_argument("--limit", type=int, default=int(cfg.get("default_list_limit") or 20))
    rp = sub.add_parser("read", help="Read one desk thread by id")
    rp.add_argument("--id", required=True)
    args = ap.parse_args()
    if args.cmd == "list":
        return cmd_list(cfg, args.desk, args.limit)
    return cmd_read(cfg, args.id)


if __name__ == "__main__":
    raise SystemExit(main())
