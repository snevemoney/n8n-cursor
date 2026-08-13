#!/usr/bin/env python3
"""Export every Cursor chat on this Mac into Outer Heaven vault.

Sources:
  1. ~/.cursor/projects/*/agent-transcripts/**/*.jsonl (full text)
  2. ~/Library/Application Support/Cursor/.../conversation-search.db (titles + dates)
  3. workspaceStorage state.vscdb composer.composerData (composer names/subtitles)

Usage:
  export HIVE_OBSIDIAN_VAULT=~/Documents/My_Billion_Dollar_Vault
  python3 scripts/hive/outer-heaven/export-all-cursor-chats.py
  python3 scripts/hive/outer-heaven/export-all-cursor-chats.py --include-all-workspaces
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    append_chronicle_entry,
    file_hash,
    library_root,
    parse_transcript_index,
    strip_secrets,
)

CURSOR_PROJECTS = Path.home() / ".cursor/projects"
CONV_DB = (
    Path.home()
    / "Library/Application Support/Cursor/User/globalStorage/conversation-search.db"
)
WS_STORAGE = Path.home() / "Library/Application Support/Cursor/User/workspaceStorage"
EXCLUDE_DEFAULT = {"hub-game-starter"}


def slugify(text: str, max_len: int = 48) -> str:
    s = re.sub(r"[^a-zA-Z0-9._-]+", "-", text.strip()).strip("-").lower()
    return (s[:max_len] or "chat")


def workspace_slug_from_path(path: Path) -> str:
    parts = path.parts
    try:
        idx = parts.index("projects")
        raw = parts[idx + 1] if idx + 1 < len(parts) else "unknown"
    except ValueError:
        raw = path.parent.name
    raw = raw.replace("Users-evenslouis-", "").replace(
        "Library-Mobile-Documents-com-apple-CloudDocs-", "icloud-"
    )
    if len(raw) > 60:
        raw = raw[:60]
    return raw or "unknown"


def build_workspace_folder_map() -> dict[str, str]:
    mapping: dict[str, str] = {}
    if not WS_STORAGE.is_dir():
        return mapping
    for folder in WS_STORAGE.iterdir():
        wj = folder / "workspace.json"
        if not wj.is_file():
            continue
        try:
            data = json.loads(wj.read_text(encoding="utf-8"))
            folder_uri = data.get("folder") or data.get("workspace") or ""
            if folder_uri.startswith("file://"):
                p = Path(folder_uri.replace("file://", ""))
                mapping[folder.name] = p.name
        except (json.JSONDecodeError, OSError):
            continue
    return mapping


def load_conversation_index() -> dict[str, dict]:
    if not CONV_DB.is_file():
        return {}
    conn = sqlite3.connect(CONV_DB)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, updated_at, source, is_archived FROM conversations"
    )
    out: dict[str, dict] = {}
    for cid, title, updated_at, source, archived in cur.fetchall():
        out[str(cid)] = {
            "title": (title or "").strip(),
            "updated_at": updated_at,
            "source": source,
            "archived": bool(archived),
        }
    conn.close()
    return out


def load_composer_heads() -> dict[str, dict]:
    """composerId -> metadata from all workspace DBs."""
    heads: dict[str, dict] = {}
    if not WS_STORAGE.is_dir():
        return heads
    for folder in WS_STORAGE.iterdir():
        db = folder / "state.vscdb"
        if not db.is_file():
            continue
        try:
            conn = sqlite3.connect(db)
            cur = conn.cursor()
            cur.execute(
                "SELECT value FROM ItemTable WHERE key='composer.composerData' LIMIT 1"
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                continue
            data = json.loads(row[0])
            for comp in data.get("allComposers") or []:
                if comp.get("type") != "head":
                    continue
                cid = comp.get("composerId")
                if not cid:
                    continue
                heads[str(cid)] = {
                    "name": comp.get("name") or "",
                    "subtitle": comp.get("subtitle") or "",
                    "workspace_hash": folder.name,
                    "created_at": comp.get("createdAt"),
                    "updated_at": comp.get("lastUpdatedAt"),
                    "lines_added": comp.get("totalLinesAdded"),
                    "files_changed": comp.get("filesChangedCount"),
                }
        except (sqlite3.Error, json.JSONDecodeError, OSError):
            continue
    return heads


def extract_jsonl_chat(jsonl_path: Path, max_lines: int = 5000) -> dict:
    user_msgs: list[str] = []
    assistant_msgs: list[str] = []
    chat_id = jsonl_path.stem
    for line in jsonl_path.read_text(encoding="utf-8", errors="replace").splitlines()[:max_lines]:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError:
            continue
        role = obj.get("role") or obj.get("type") or ""
        content = obj.get("content") or obj.get("text") or ""
        if isinstance(content, dict) and "content" in content:
            inner = content.get("content")
            if isinstance(inner, list):
                content = " ".join(
                    c.get("text", "") if isinstance(c, dict) else str(c) for c in inner
                )
        if isinstance(content, list):
            parts = []
            for c in content:
                if isinstance(c, dict):
                    if c.get("type") == "text" and c.get("text"):
                        parts.append(str(c["text"]))
                    elif c.get("type") == "tool_use":
                        parts.append(f"[tool:{c.get('name','?')}]")
                else:
                    parts.append(str(c))
            content = " ".join(parts)
        if isinstance(obj.get("message"), dict):
            msg = obj["message"]
            inner = msg.get("content")
            if isinstance(inner, list):
                content = " ".join(
                    c.get("text", "") if isinstance(c, dict) else str(c) for c in inner
                )
            elif inner:
                content = str(inner)
        content = strip_secrets(str(content))
        if not content.strip():
            continue
        # Strip XML wrappers from user queries
        content = re.sub(r"</?user_query>", "", content)
        content = re.sub(r"<timestamp>[^<]*</timestamp>", "", content).strip()
        if role in ("user", "human"):
            user_msgs.append(content[:800])
        elif role in ("assistant", "ai"):
            assistant_msgs.append(content[:800])

    mtime = datetime.fromtimestamp(jsonl_path.stat().st_mtime, tz=timezone.utc)
    files = list(
        dict.fromkeys(
            re.findall(r"(?:apps|scripts/hive|docs/hive)/[a-zA-Z0-9_./-]+", jsonl_path.read_text(encoding="utf-8", errors="replace"))
        )
    )[:25]

    title = ""
    for u in user_msgs:
        clean = u.replace("\n", " ").strip()
        if len(clean) > 20 and not clean.startswith("{"):
            title = clean[:120]
            break

    return {
        "chat_id": chat_id,
        "title": title,
        "user_msgs": user_msgs,
        "assistant_msgs": assistant_msgs,
        "message_count": len(user_msgs) + len(assistant_msgs),
        "updated_at": mtime.isoformat(),
        "files_touched": files,
        "path": str(jsonl_path),
    }


def write_chat_note(
    out_dir: Path,
    *,
    workspace: str,
    chat_id: str,
    title: str,
    meta: dict,
    body_sections: list[str],
    dry_run: bool,
) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    date_prefix = ""
    ts = meta.get("updated_at") or meta.get("updated_at_ms")
    if isinstance(ts, int):
        date_prefix = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).strftime("%Y%m%d")
    elif isinstance(ts, str) and len(ts) >= 10:
        date_prefix = ts[:10].replace("-", "")

    fname = f"{date_prefix}-{slugify(title or chat_id[:8])}-{chat_id[:8]}.md"
    path = out_dir / fname
    if path.is_file() and not dry_run:
        return path

    header = f"""---
chatId: {chat_id}
workspace: {workspace}
source: cursor
title: {json.dumps(title or chat_id)[:200]}
updated: {meta.get('updated_at', '')}
messageCount: {meta.get('message_count', 0)}
archived: {str(meta.get('archived', False)).lower()}
---

# {title or chat_id}

**Workspace:** `{workspace}`  
**Chat ID:** `{chat_id}`  
**Messages:** {meta.get('message_count', '?')}  
**Path:** `{meta.get('path', 'index-only')}`

"""
    content = header + "\n\n".join(body_sections) + "\n"
    if not dry_run:
        path.write_text(content, encoding="utf-8")
    return path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument(
        "--include-all-workspaces",
        action="store_true",
        help="Include hub-game-starter and other excluded workspaces",
    )
    ap.add_argument("--skip-chronicle", action="store_true")
    args = ap.parse_args()

    lib = library_root()
    chats_root = lib / "CURSOR_CHATS"
    index_path = lib / "CURSOR_CHATS_INDEX.md"
    exclude = set() if args.include_all_workspaces else EXCLUDE_DEFAULT

    conv_index = load_conversation_index()
    composer_heads = load_composer_heads()
    ws_map = build_workspace_folder_map()

    seen_hashes = parse_transcript_index(lib / "TRANSCRIPT_INDEX.md")
    jsonl_by_id: dict[str, Path] = {}
    if CURSOR_PROJECTS.is_dir():
        for p in CURSOR_PROJECTS.glob("*/agent-transcripts/**/*.jsonl"):
            jsonl_by_id[p.stem] = p

    exported = 0
    index_rows: list[str] = []
    matched_ids: set[str] = set()

    # 1) Full agent-transcript jsonl exports
    for chat_id, jsonl_path in sorted(jsonl_by_id.items(), key=lambda x: x[1].stat().st_mtime):
        workspace = workspace_slug_from_path(jsonl_path)
        if any(ex in workspace for ex in exclude):
            continue
        parsed = extract_jsonl_chat(jsonl_path)
        db_meta = conv_index.get(chat_id, {})
        title = db_meta.get("title") or parsed["title"] or chat_id
        comp = composer_heads.get(chat_id, {})

        sections = []
        if parsed["user_msgs"]:
            sections.append("## What you asked\n\n" + "\n\n---\n\n".join(f"- {m[:600]}" for m in parsed["user_msgs"][:8]))
        if parsed["assistant_msgs"]:
            sections.append("## Assistant (excerpts)\n\n" + "\n\n---\n\n".join(f"- {m[:600]}" for m in parsed["assistant_msgs"][-5:]))
        if parsed["files_touched"]:
            sections.append("## Files touched\n\n" + "\n".join(f"- `{f}`" for f in parsed["files_touched"]))
        if comp.get("name"):
            sections.append(f"## Composer meta\n\n- Name: {comp.get('name')}\n- Subtitle: {comp.get('subtitle')}")

        meta = {
            **parsed,
            **db_meta,
            "title": title,
            "path": str(jsonl_path),
        }
        out_dir = chats_root / slugify(workspace, 40)
        note = write_chat_note(out_dir, workspace=workspace, chat_id=chat_id, title=title, meta=meta, body_sections=sections, dry_run=args.dry_run)
        matched_ids.add(chat_id)
        index_rows.append(f"| {workspace} | {title[:60]} | {chat_id[:8]} | {note.name} |")
        exported += 1

        h = file_hash(jsonl_path)
        if not args.skip_chronicle and not args.dry_run and h not in seen_hashes:
            summary = parsed["user_msgs"][0][:500] if parsed["user_msgs"] else title
            if parsed["assistant_msgs"]:
                summary += f"\n\nLast: {parsed['assistant_msgs'][-1][:400]}"
            append_chronicle_entry(
                source="cursor",
                workspace=workspace,
                summary=summary[:2000],
                projects=[workspace.replace("-", "")],
                tags=["auto-mined", "cursor", "full-export"],
                agents=["cursor"],
                files_touched=parsed["files_touched"],
                correlation_id=f"oh-cursor-{h}",
            )
            seen_hashes.add(h)

    # 2) Conversation index entries without jsonl (older composer / missing files)
    for cid, meta in conv_index.items():
        if cid in matched_ids:
            continue
        title = meta.get("title") or composer_heads.get(cid, {}).get("name") or cid
        comp = composer_heads.get(cid, {})
        ws_hash = comp.get("workspace_hash", "")
        workspace = ws_map.get(ws_hash, "unknown-workspace")
        if any(ex in workspace for ex in exclude):
            continue
        sections = ["## Index-only (no local transcript file)\n\nThis chat is listed in Cursor's conversation index but has no `agent-transcripts/*.jsonl` on disk."]
        if comp:
            sections.append(
                f"## Composer meta\n\n- Name: {comp.get('name')}\n- Subtitle: {comp.get('subtitle')}\n- Lines added: {comp.get('lines_added')}"
            )
        note_meta = {**meta, "message_count": 0, "path": "conversation-search.db", "updated_at_ms": meta.get("updated_at")}
        out_dir = chats_root / slugify(workspace, 40)
        note = write_chat_note(out_dir, workspace=workspace, chat_id=cid, title=title, meta=note_meta, body_sections=sections, dry_run=args.dry_run)
        index_rows.append(f"| {workspace} | {title[:60]} | {cid[:8]} | {note.name} | index-only |")
        exported += 1

    # 3) Composer heads not in conv index or jsonl
    for cid, comp in composer_heads.items():
        if cid in matched_ids or cid in conv_index:
            continue
        title = comp.get("name") or cid
        ws_hash = comp.get("workspace_hash", "")
        workspace = ws_map.get(ws_hash, "unknown-workspace")
        if any(ex in workspace for ex in exclude):
            continue
        sections = [f"## Composer meta only\n\n- Subtitle: {comp.get('subtitle')}\n- Files changed: {comp.get('files_changed')}"]
        note_meta = {"message_count": 0, "path": "composer.composerData", "updated_at_ms": comp.get("updated_at")}
        out_dir = chats_root / slugify(workspace, 40)
        note = write_chat_note(out_dir, workspace=workspace, chat_id=cid, title=title, meta=note_meta, body_sections=sections, dry_run=args.dry_run)
        index_rows.append(f"| {workspace} | {title[:60]} | {cid[:8]} | {note.name} | composer-only |")
        exported += 1

    if not args.dry_run:
        readme = chats_root / "README.md"
        readme.write_text(
            "# Cursor chat archive\n\n"
            f"Exported **{exported}** chats from this Mac on {datetime.now(timezone.utc).isoformat()}.\n\n"
            "- Full text: `agent-transcripts/*.jsonl`\n"
            "- Titles/dates: `conversation-search.db`\n"
            "- Re-export: `python3 scripts/hive/outer-heaven/export-all-cursor-chats.py --include-all-workspaces`\n\n"
            "See `../CURSOR_CHATS_INDEX.md` for master table.\n",
            encoding="utf-8",
        )
        index_body = (
            "# Cursor chats master index\n\n"
            f"Total exported: **{exported}** · Local jsonl on disk: **{len(jsonl_by_id)}** · "
            f"Conversation index: **{len(conv_index)}**\n\n"
            "| Workspace | Title | Chat ID | Note |\n"
            "|-----------|-------|---------|------|\n"
            + "\n".join(index_rows[:500])
            + "\n"
        )
        index_path.write_text(index_body, encoding="utf-8")

    print(f"export-all-cursor-chats: {exported} notes → {chats_root}")
    print(f"  jsonl on disk: {len(jsonl_by_id)}")
    print(f"  conversation-search.db: {len(conv_index)}")
    print(f"  composer heads: {len(composer_heads)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
