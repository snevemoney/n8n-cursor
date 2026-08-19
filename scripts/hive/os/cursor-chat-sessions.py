#!/usr/bin/env python3
"""List or read local Cursor agent transcripts. Do not dump all.

Usage:
  python3 scripts/hive/os/cursor-chat-sessions.py projects
  python3 scripts/hive/os/cursor-chat-sessions.py list [--project n8n-cursor] [--limit 20]
  python3 scripts/hive/os/cursor-chat-sessions.py read --id <uuid>

Top-level sessions only ({uuid}/{uuid}.jsonl). Subagents stay off unless --subagents.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

CFG_PATH = Path(__file__).resolve().parent / "cursor-chat-sessions.json"
UQ_RE = re.compile(r"<user_query>(.*?)</user_query>", re.S)


def load_cfg() -> dict:
    return json.loads(CFG_PATH.read_text(encoding="utf-8"))


def projects_root(cfg: dict) -> Path:
    return Path(cfg["root"]).expanduser()


def workspace_slug(project_dir: str) -> str:
    raw = project_dir.replace("Users-evenslouis-", "")
    raw = raw.replace(
        "Library-Mobile-Documents-com-apple-CloudDocs-", "icloud-"
    )
    return raw[:60] or "unknown"


def session_files(cfg: dict, project: str | None, include_subagents: bool) -> list[Path]:
    root = projects_root(cfg)
    if not root.is_dir():
        return []
    exclude = set(cfg.get("exclude_workspaces") or [])
    out: list[Path] = []
    for proj in sorted(root.iterdir()):
        if not proj.is_dir() or proj.name.startswith("."):
            continue
        slug = workspace_slug(proj.name)
        if project and project not in (proj.name, slug) and project not in proj.name:
            continue
        if any(x in proj.name or x in slug for x in exclude):
            continue
        transcripts = proj / "agent-transcripts"
        if not transcripts.is_dir():
            continue
        if include_subagents:
            out.extend(transcripts.glob("*/*.jsonl"))
            out.extend(transcripts.glob("*/subagents/*.jsonl"))
            continue
        for session in transcripts.iterdir():
            if not session.is_dir():
                continue
            top = session / f"{session.name}.jsonl"
            if top.is_file():
                out.append(top)
    return out


def first_ask(path: Path, limit: int = 160) -> str:
    try:
        with path.open(encoding="utf-8", errors="replace") as fh:
            for line in fh:
                try:
                    event = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if event.get("role") != "user":
                    continue
                content = event.get("message", {}).get("content")
                texts: list[str] = []
                if isinstance(content, str):
                    texts.append(content)
                elif isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and part.get("type") == "text":
                            texts.append(part.get("text", ""))
                blob = "\n".join(texts)
                m = UQ_RE.search(blob)
                ask = (m.group(1) if m else blob).strip()
                ask = re.sub(r"\s+", " ", ask)
                if ask:
                    return ask[:limit]
    except OSError:
        return ""
    return ""


def cmd_projects(cfg: dict) -> int:
    root = projects_root(cfg)
    exclude = set(cfg.get("exclude_workspaces") or [])
    rows = []
    if root.is_dir():
        for proj in sorted(root.iterdir()):
            if not proj.is_dir() or proj.name.startswith("."):
                continue
            transcripts = proj / "agent-transcripts"
            if not transcripts.is_dir():
                continue
            if any(x in proj.name or x in workspace_slug(proj.name) for x in exclude):
                continue
            n = sum(1 for p in transcripts.iterdir() if p.is_dir() and (p / f"{p.name}.jsonl").is_file())
            rows.append(
                {
                    "project": workspace_slug(proj.name),
                    "dir": str(proj),
                    "sessions": n,
                }
            )
    print(json.dumps({"root": str(root), "projects": rows}, indent=2))
    return 0


def cmd_list(cfg: dict, project: str | None, limit: int, include_subagents: bool) -> int:
    files = session_files(cfg, project, include_subagents)
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    cap = limit if limit > 0 else int(cfg.get("default_list_limit") or 20)
    sliced = files[:cap]
    rows = []
    for path in sliced:
        st = path.stat()
        project_dir = path.parents[2].name
        rows.append(
            {
                "id": path.parent.name,
                "project": workspace_slug(project_dir),
                "path": str(path),
                "mtime": datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
                "bytes": st.st_size,
                "ask": first_ask(path),
            }
        )
    print(
        json.dumps(
            {
                "shown": len(rows),
                "total_matching": len(files),
                "limit": cap,
                "sessions": rows,
            },
            indent=2,
        )
    )
    return 0


def cmd_read(cfg: dict, session_id: str, include_subagents: bool) -> int:
    if not session_id:
        raise SystemExit("read requires --id")
    files = session_files(cfg, None, include_subagents)
    hits = [p for p in files if session_id in p.parent.name or session_id in p.stem]
    if not hits:
        raise SystemExit(f"no session matching {session_id}")
    if len(hits) > 1 and not any(p.parent.name == session_id or p.stem == session_id for p in hits):
        ids = sorted({p.parent.name for p in hits})
        raise SystemExit(f"ambiguous id {session_id}; matches {ids[:8]}")
    path = next((p for p in hits if p.parent.name == session_id or p.stem == session_id), hits[0])
    max_chars = int(cfg.get("read_max_chars") or 80000)
    text = path.read_text(encoding="utf-8", errors="replace")
    truncated = len(text) > max_chars
    print(
        json.dumps(
            {
                "id": path.parent.name,
                "path": str(path),
                "bytes": path.stat().st_size,
                "truncated": truncated,
                "text": text[:max_chars],
            },
            indent=2,
        )
    )
    return 0


def main() -> int:
    cfg = load_cfg()
    ap = argparse.ArgumentParser(description="Read local Cursor chat sessions (one at a time)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("projects", help="List local Cursor project folders that have transcripts")
    lp = sub.add_parser("list", help="List recent sessions (do not dump all)")
    lp.add_argument("--project", help="Workspace slug or folder substring")
    lp.add_argument("--limit", type=int, default=int(cfg.get("default_list_limit") or 20))
    lp.add_argument("--subagents", action="store_true")
    rp = sub.add_parser("read", help="Read one session by id")
    rp.add_argument("--id", required=True)
    rp.add_argument("--subagents", action="store_true")
    args = ap.parse_args()
    if args.cmd == "projects":
        return cmd_projects(cfg)
    if args.cmd == "list":
        return cmd_list(cfg, args.project, args.limit, args.subagents)
    return cmd_read(cfg, args.id, args.subagents)


if __name__ == "__main__":
    raise SystemExit(main())
