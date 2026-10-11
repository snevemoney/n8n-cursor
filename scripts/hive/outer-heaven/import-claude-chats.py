#!/usr/bin/env python3
"""Import Claude Code + Desktop sessions (and optional claude.ai export) into CLAUDE_CHATS.

Sources on this Mac:
  1. ~/.claude/projects/**/*.jsonl          — Claude Code transcripts
  2. ~/Library/Application Support/Claude/local-agent-mode-sessions/**/local_*.json
  3. ~/Library/Application Support/Claude/claude-code-sessions/**/local_*.json
  4. --export conversations.json            — official claude.ai account data export

Web / Desktop *regular* chats are not in a stable local schema. IndexedDB on this
box is UI cache (titles/ids), not `chat_messages` / `sender: human`. Drop the
account export next to the vault or pass --export.

Usage:
  python3 scripts/hive/outer-heaven/import-claude-chats.py --dry-run
  python3 scripts/hive/outer-heaven/import-claude-chats.py
  python3 scripts/hive/outer-heaven/import-claude-chats.py --export ~/Downloads/conversations.json
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import library_root, strip_secrets  # noqa: E402

CLAUDE_PROJECTS = Path.home() / ".claude/projects"
DESKTOP_ROOT = Path.home() / "Library/Application Support/Claude"
LOCAL_AGENT = DESKTOP_ROOT / "local-agent-mode-sessions"
CODE_SESSIONS = DESKTOP_ROOT / "claude-code-sessions"

NOISE_MARKERS = (
    "<task-notification>",
    "<local-command-caveat>",
    "<command-name>",
    "<command-message>",
    "<local-command-stdout>",
)

THEME_RULES: list[tuple[str, list[str]]] = [
    ("hive-mind", ["openclaw", "telegram", "philanthropy", "outer heaven", "council", "grok", "hive"]),
    ("n8n-ops", ["n8n", "workflow", "webhook", "evenslouis", "caddy", "docker compose"]),
    ("scorpion-ops", ["scorpion", "golden path", "smoke", "cockpit", "observatory"]),
    ("client-engine-money", ["client engine", "/pro", "deal", "stripe", "treasury", "crm"]),
    ("after-effects", ["after effects", "aftereffects", "motion graphics", "premiere"]),
    ("gaming-mac", ["unity", "godot", "game dev", "hub-game", "gaming"]),
    ("creative-personal", ["creative", "personal", "video edit", "lucky paradox"]),
]

PROJECT_FROM_CWD = [
    ("n8n-cursor", "n8n-cursor"),
    ("philanthropic-ai-agent", "philanthropic-ai-agent"),
    ("client-engine", "client-engine"),
    ("shield-buddies", "shield-buddies"),
    ("clipengine", "clipengine"),
    ("proof-qc-assist", "proof-qc-assist"),
    ("outer-heaven", "philanthropic-ai-agent"),
]

MANAGED_START = "<!-- link-claude-chats:managed -->"
MANAGED_END = "<!-- /link-claude-chats:managed -->"


def slugify(text: str, max_len: int = 48) -> str:
    s = re.sub(r"[^a-zA-Z0-9._-]+", "-", text.strip()).strip("-").lower()
    return (s[:max_len] or "chat")


def word_hit(haystack: str, keyword: str) -> bool:
    if " " in keyword or keyword.startswith("/"):
        return keyword in haystack
    return re.search(rf"(?<![a-z0-9]){re.escape(keyword)}(?![a-z0-9])", haystack) is not None


def match_themes(*texts: str) -> list[str]:
    hay = " ".join(t.lower() for t in texts if t)
    scores: dict[str, int] = {}
    for theme_id, keywords in THEME_RULES:
        n = sum(1 for kw in keywords if word_hit(hay, kw))
        if n:
            scores[theme_id] = n
    ranked = sorted(scores, key=lambda k: (-scores[k], k))
    return ranked[:4] or ["unclassified"]


def project_from_cwd(cwd: str) -> str:
    low = (cwd or "").lower().replace("\\", "/")
    for needle, pid in PROJECT_FROM_CWD:
        if needle in low:
            return pid
    return "claude-misc"


def is_noise_prompt(text: str) -> bool:
    if not text or not text.strip():
        return True
    if any(m in text for m in NOISE_MARKERS):
        return True
    stripped = text.lstrip()
    if stripped.startswith("{") and "tool_use" in stripped[:200]:
        return True
    return False


def flatten_content(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
            elif isinstance(item, dict):
                if item.get("type") in {"tool_result", "tool_use", "image", "thinking"}:
                    continue
                if item.get("type") == "text":
                    parts.append(str(item.get("text") or ""))
                elif "text" in item:
                    parts.append(str(item["text"]))
        return "\n".join(p for p in parts if p)
    if isinstance(content, dict):
        return flatten_content(content.get("text") or content.get("content"))
    return str(content)


def parse_iso(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except ValueError:
        return None


def parse_claude_jsonl(path: Path) -> dict | None:
    if path.name.startswith("agent-"):
        return None
    if "vercel-plugin" in path.parts:
        return None
    user_msgs: list[str] = []
    assistant_msgs: list[str] = []
    title = ""
    cwd = ""
    session_id = path.stem
    timestamps: list[datetime] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not isinstance(rec, dict):
            continue
        rtype = rec.get("type")
        session_id = rec.get("sessionId") or session_id
        cwd = rec.get("cwd") or cwd
        dt = parse_iso(rec.get("timestamp"))
        if dt:
            timestamps.append(dt)
        if rtype in {"custom-title", "ai-title"} and rec.get("title"):
            title = str(rec["title"])
        if rtype == "user":
            msg = rec.get("message") if isinstance(rec.get("message"), dict) else {}
            text = flatten_content(msg.get("content"))
            if is_noise_prompt(text):
                continue
            user_msgs.append(strip_secrets(text.strip()))
        elif rtype == "assistant":
            msg = rec.get("message") if isinstance(rec.get("message"), dict) else {}
            text = flatten_content(msg.get("content"))
            if text.strip():
                assistant_msgs.append(strip_secrets(text.strip()))
    if not user_msgs and not assistant_msgs:
        return None
    if not title:
        for u in user_msgs:
            clean = u.replace("\n", " ").strip()
            if len(clean) > 20:
                title = clean[:120]
                break
    updated = max(timestamps) if timestamps else datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc)
    return {
        "chat_id": session_id,
        "title": title or session_id[:8],
        "user_msgs": user_msgs,
        "assistant_msgs": assistant_msgs,
        "cwd": cwd,
        "project": project_from_cwd(cwd or str(path)),
        "source": "claude-code",
        "updated": updated,
        "path": str(path),
        "message_count": len(user_msgs) + len(assistant_msgs),
    }


def parse_desktop_local(path: Path) -> dict | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    except (json.JSONDecodeError, OSError):
        return None
    if not isinstance(data, dict):
        return None
    sid = str(data.get("sessionId") or path.stem)
    title = str(data.get("title") or "").strip()
    initial = str(data.get("initialMessage") or "").strip()
    cwd = str(data.get("cwd") or "")
    created = data.get("createdAt") or data.get("lastActivityAt")
    updated = datetime.now(timezone.utc)
    if isinstance(created, (int, float)) and created > 1e12:
        updated = datetime.fromtimestamp(created / 1000, tz=timezone.utc)
    elif isinstance(created, (int, float)) and created > 1e9:
        updated = datetime.fromtimestamp(created, tz=timezone.utc)
    user_msgs = [strip_secrets(initial)] if initial and not is_noise_prompt(initial) else []
    # Title-only Desktop stubs (hundreds of "Vps health check") are not chats.
    if not user_msgs:
        return None
    return {
        "chat_id": sid,
        "title": title or (user_msgs[0][:120] if user_msgs else sid[:8]),
        "user_msgs": user_msgs,
        "assistant_msgs": [],
        "cwd": cwd,
        "project": project_from_cwd(cwd or str(path)),
        "source": "claude-desktop-local",
        "updated": updated,
        "path": str(path),
        "message_count": len(user_msgs),
        "cli_session_id": data.get("cliSessionId") or "",
        "model": data.get("model") or "",
    }


def parse_conversations_export(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8", errors="replace"))
    items = raw if isinstance(raw, list) else raw.get("conversations") or raw.get("chats") or []
    out: list[dict] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        msgs = item.get("chat_messages") or item.get("messages") or []
        user_msgs: list[str] = []
        assistant_msgs: list[str] = []
        for m in msgs:
            if not isinstance(m, dict):
                continue
            sender = (m.get("sender") or m.get("role") or "").lower()
            text = strip_secrets(str(m.get("text") or m.get("content") or "").strip())
            if not text:
                continue
            if sender in {"human", "user"}:
                user_msgs.append(text)
            elif sender in {"assistant", "claude"}:
                assistant_msgs.append(text)
        if not user_msgs and not assistant_msgs:
            continue
        cid = str(item.get("uuid") or item.get("conversation_uuid") or item.get("id") or "")
        updated = parse_iso(item.get("updated_at") or item.get("created_at")) or datetime.now(timezone.utc)
        title = str(item.get("name") or item.get("title") or "")
        if not title and user_msgs:
            title = user_msgs[0].replace("\n", " ")[:120]
        out.append(
            {
                "chat_id": cid or slugify(title)[:12],
                "title": title or cid[:8],
                "user_msgs": user_msgs,
                "assistant_msgs": assistant_msgs,
                "cwd": "",
                "project": "claude-web",
                "source": "claude-web-export",
                "updated": updated,
                "path": str(path),
                "message_count": len(user_msgs) + len(assistant_msgs),
            }
        )
    return out


def dest_note_path(root: Path, rec: dict) -> Path:
    date_prefix = rec["updated"].strftime("%Y%m%d")
    fname = f"{date_prefix}-{slugify(rec['title'])}-{rec['chat_id'][:8]}.md"
    return root / "CLAUDE_CHATS" / slugify(rec["project"], 40) / fname


def render_note(rec: dict) -> str:
    themes = match_themes(rec["title"], "\n".join(rec["user_msgs"]), "\n".join(rec["assistant_msgs"][-3:]))
    theme_yaml = ", ".join(f'"[[THEMES/{t}]]"' for t in themes)
    project = rec["project"]
    title = rec["title"].replace('"', "'")
    sections: list[str] = []
    if rec["user_msgs"]:
        bullets = "\n\n---\n\n".join(f"- {m[:800]}" for m in rec["user_msgs"][:10])
        sections.append(f"## What you asked\n\n{bullets}")
    if rec["assistant_msgs"]:
        bullets = "\n\n---\n\n".join(f"- {m[:800]}" for m in rec["assistant_msgs"][-5:])
        sections.append(f"## Assistant (excerpts)\n\n{bullets}")
    if rec.get("cli_session_id") or rec.get("model"):
        sections.append(
            "## Desktop meta\n\n"
            f"- CLI session: `{rec.get('cli_session_id') or ''}`\n"
            f"- Model: `{rec.get('model') or ''}`\n"
        )
    links = [
        f"- [[PROJECTS/{project}]]" if project not in {"claude-misc", "claude-web"} else "",
        *[f"- [[THEMES/{t}]]" for t in themes],
    ]
    sections.append(
        f"{MANAGED_START}\n## Related\n\n" + "\n".join(x for x in links if x) + f"\n{MANAGED_END}"
    )
    header = f"""---
chatId: {rec["chat_id"]}
workspace: {project}
source: {rec["source"]}
title: {json.dumps(title)[:200]}
updated: {rec["updated"].isoformat()}
messageCount: {rec["message_count"]}
projects: ["[[PROJECTS/{project}]]"]
themes: [{theme_yaml}]
tags: [claude]
---

# {title}

**Workspace:** `{project}`  
**Chat ID:** `{rec["chat_id"]}`  
**Messages:** {rec["message_count"]}  
**Path:** `{rec["path"]}`
"""
    return header + "\n\n".join(sections) + "\n"


def write_note(rec: dict, dry_run: bool) -> list[Path]:
    written: list[Path] = []
    body = render_note(rec)
    for root in dest_roots():
        path = dest_note_path(root, rec)
        written.append(path)
        if dry_run:
            continue
        if path.is_file() and path.read_text(encoding="utf-8") == body:
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(body, encoding="utf-8")
    return written


def collect_sessions(export_path: Path | None) -> list[dict]:
    recs: list[dict] = []
    seen: set[str] = set()
    if CLAUDE_PROJECTS.is_dir():
        for path in sorted(CLAUDE_PROJECTS.rglob("*.jsonl")):
            rec = parse_claude_jsonl(path)
            if not rec or rec["chat_id"] in seen:
                continue
            seen.add(rec["chat_id"])
            recs.append(rec)
    for folder in (LOCAL_AGENT, CODE_SESSIONS):
        if not folder.is_dir():
            continue
        for path in sorted(folder.rglob("local_*.json")):
            rec = parse_desktop_local(path)
            if not rec:
                continue
            cli = rec.get("cli_session_id")
            if rec["chat_id"] in seen or (cli and cli in seen):
                # Prefer the jsonl transcript; keep desktop title if jsonl title is weak.
                continue
            seen.add(rec["chat_id"])
            recs.append(rec)
    if export_path and export_path.is_file():
        for rec in parse_conversations_export(export_path):
            if rec["chat_id"] in seen:
                continue
            seen.add(rec["chat_id"])
            recs.append(rec)
    recs.sort(key=lambda r: r["updated"])
    return recs


def write_index(recs: list[dict], dry_run: bool) -> None:
    rows = [
        f"| {r['source']} | {r['project']} | {r['title'][:60].replace('|', ' ')} | {r['chat_id'][:8]} |"
        for r in recs
    ]
    body = (
        "# Claude chats master index\n\n"
        f"Total imported: **{len(recs)}** · "
        f"code={sum(1 for r in recs if r['source']=='claude-code')} · "
        f"desktop-local={sum(1 for r in recs if r['source']=='claude-desktop-local')} · "
        f"web-export={sum(1 for r in recs if r['source']=='claude-web-export')}\n\n"
        "Regular claude.ai chats are **not** on this Mac until you drop the account "
        "`conversations.json` and re-run with `--export`.\n\n"
        "| Source | Project | Title | ID |\n"
        "|--------|---------|-------|----|\n"
        + "\n".join(rows)
        + "\n"
    )
    readme = (
        "# Claude chat archive\n\n"
        f"Imported **{len(recs)}** local Claude sittings on "
        f"{datetime.now(timezone.utc).isoformat()}.\n\n"
        "- Claude Code: `~/.claude/projects/**/*.jsonl`\n"
        "- Desktop local-agent / code-session metadata: "
        "`~/Library/Application Support/Claude/`\n"
        "- Web chats: pass `--export conversations.json` from claude.ai **Settings → Privacy → Export**\n\n"
        "See `../CLAUDE_CHATS_INDEX.md`.\n"
    )
    if dry_run:
        return
    for root in dest_roots():
        chats = root / "CLAUDE_CHATS"
        chats.mkdir(parents=True, exist_ok=True)
        (chats / "README.md").write_text(readme, encoding="utf-8")
        (root / "CLAUDE_CHATS_INDEX.md").write_text(body, encoding="utf-8")


def dest_roots() -> list[Path]:
    roots = [library_root()]
    vault = Path.home() / "Documents/My_Billion_Dollar_Vault/00_Outer_Heaven"
    if vault.is_dir() and vault not in roots:
        roots.append(vault)
    return roots


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--export", type=Path, help="claude.ai conversations.json from account export")
    args = ap.parse_args()

    recs = collect_sessions(args.export)
    by_source: dict[str, int] = {}
    for r in recs:
        by_source[r["source"]] = by_source.get(r["source"], 0) + 1
        write_note(r, args.dry_run)
    write_index(recs, args.dry_run)
    print(f"import-claude-chats: {len(recs)} notes → {dest_roots()}")
    for src, n in sorted(by_source.items()):
        print(f"  {src}: {n}")
    if args.export and not args.export.is_file():
        print(f"  export missing: {args.export}")
    if not any(r["source"] == "claude-web-export" for r in recs):
        print("  web chats: none (IndexedDB is cache-only; use --export)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
