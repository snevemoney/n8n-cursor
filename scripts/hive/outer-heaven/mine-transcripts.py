#!/usr/bin/env python3
"""Mine Cursor/Grok/Scorpion transcripts into Outer Heaven chronicle.

Usage:
  python3 scripts/hive/outer-heaven/mine-transcripts.py
  python3 scripts/hive/outer-heaven/mine-transcripts.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib import (  # noqa: E402
    append_chronicle_entry,
    append_index_row,
    file_hash,
    library_root,
    parse_transcript_index,
    strip_secrets,
)

CURSOR_GLOB = Path.home() / ".cursor/projects"
SCORPION_CONV = ROOT / ".scorpion/conversations/conversations.json"
GROK_DIR = Path.home() / ".grokbot"

EXCLUDE_WORKSPACES = {"hub-game-starter"}


def _expand_globs(patterns: list[str]) -> list[Path]:
    out: list[Path] = []
    for pat in patterns:
        pat = os.path.expanduser(pat)
        out.extend(Path(p) for p in glob_paths(pat))
    return out


def glob_paths(pattern: str) -> list[str]:
    import glob

    return glob.glob(pattern, recursive=True)


def extract_export_summary(path: Path, source: str) -> str:
    text = strip_secrets(path.read_text(encoding="utf-8", errors="replace")[:50000])
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return text[:2000]

    snippets: list[str] = []
    if isinstance(data, list):
        for item in data[-3:]:
            if isinstance(item, dict):
                title = item.get("title") or item.get("name") or item.get("id") or "conversation"
                snippets.append(str(title))
    elif isinstance(data, dict):
        for key in ("conversations", "items", "messages", "data"):
            if key in data and isinstance(data[key], list):
                for item in data[key][-3:]:
                    if isinstance(item, dict):
                        t = item.get("title") or item.get("role") or item.get("id")
                        if t:
                            snippets.append(str(t))
                break
        mapping = data.get("mapping")
        if mapping and isinstance(mapping, dict) and not snippets:
            snippets.append(f"ChatGPT export nodes: {len(mapping)}")
    title = path.name
    body = "\n".join(f"- {s}" for s in snippets[:8]) or text[:800]
    return f"{source} export `{title}`:\n{body}"


def mine_export_globs(
    source: str,
    patterns: list[str],
    dry_run: bool,
    seen: set[str],
) -> int:
    env_key = "OUTER_HEAVEN_CHATGPT_EXPORT" if source == "chatgpt" else "OUTER_HEAVEN_CLAUDE_EXPORT"
    env_path = os.environ.get(env_key, "").strip()
    paths: list[Path] = []
    if env_path:
        p = Path(os.path.expanduser(env_path))
        if p.is_file():
            paths = [p]
        elif p.is_dir():
            paths = list(p.rglob("*.json"))
    else:
        paths = [p for p in _expand_globs(patterns) if p.is_file() and p.suffix == ".json"]

    count = 0
    for path in paths:
        if path.stat().st_size > 20_000_000:
            continue
        h = file_hash(path)
        if h in seen:
            continue
        summary = extract_export_summary(path, source)
        if dry_run:
            print(f"Would mine {source} export {path}")
            count += 1
            continue
        append_chronicle_entry(
            source=source,
            workspace=f"{source}-export",
            summary=summary,
            projects=infer_projects(source, summary),
            tags=["auto-mined", source, "export"],
            agents=[source],
            correlation_id=f"oh-{source}-{h}",
        )
        append_index_row(
            library_root() / "TRANSCRIPT_INDEX.md",
            {
                "hash": h,
                "path": str(path),
                "workspace": f"{source}-export",
                "mined_at": datetime.now(timezone.utc).isoformat(),
                "entry": f"oh-{source}-{h}",
            },
        )
        seen.add(h)
        count += 1
        print(f"mined {source} export: {path}")
    if not paths and not dry_run:
        print(f"no {source} exports found (set {env_key} or add files under ~/Downloads/)")
    return count


def mine_chatgpt(dry_run: bool, seen: set[str]) -> int:
    return mine_export_globs(
        "chatgpt",
        [
            str(Path.home() / "Downloads/chatgpt-export*/**/*.json"),
            str(Path.home() / "Downloads/**/conversations.json"),
        ],
        dry_run,
        seen,
    )


def mine_claude(dry_run: bool, seen: set[str]) -> int:
    return mine_export_globs(
        "claude",
        [
            str(Path.home() / "Downloads/claude-export*/**/*.json"),
            str(Path.home() / "Downloads/**/claude*/**/*.json"),
        ],
        dry_run,
        seen,
    )


def workspace_slug(path: Path) -> str:
    parts = path.parts
    try:
        idx = parts.index("projects")
        return parts[idx + 1] if idx + 1 < len(parts) else "unknown"
    except ValueError:
        return path.parent.name


def extract_cursor_summary(jsonl_path: Path, max_lines: int = 200) -> tuple[str, list[str]]:
    user_msgs: list[str] = []
    assistant_msgs: list[str] = []
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
        if isinstance(content, list):
            content = " ".join(
                c.get("text", "") if isinstance(c, dict) else str(c) for c in content
            )
        content = strip_secrets(str(content))[:500]
        if not content:
            continue
        if role in ("user", "human"):
            user_msgs.append(content)
        elif role in ("assistant", "ai"):
            assistant_msgs.append(content)

    first_user = user_msgs[0][:300] if user_msgs else "(no user message)"
    last_asst = assistant_msgs[-1][:300] if assistant_msgs else ""
    summary = f"User: {first_user}"
    if last_asst:
        summary += f"\n\nLast assistant: {last_asst}"

    files: list[str] = []
    text = jsonl_path.read_text(encoding="utf-8", errors="replace")
    files = list(dict.fromkeys(re.findall(r"apps/[a-zA-Z0-9_./-]+", text)))[:15]
    files += list(dict.fromkeys(re.findall(r"scripts/hive/[a-zA-Z0-9_./-]+", text)))[:10]
    return summary[:2000], files[:20]


def mine_cursor(dry_run: bool, seen: set[str]) -> int:
    count = 0
    if not CURSOR_GLOB.is_dir():
        return 0
    for transcript in CURSOR_GLOB.glob("*/agent-transcripts/**/*.jsonl"):
        slug = workspace_slug(transcript)
        if any(ex in slug for ex in EXCLUDE_WORKSPACES):
            continue
        h = file_hash(transcript)
        if h in seen:
            continue
        summary, files = extract_cursor_summary(transcript)
        projects = infer_projects(slug, summary)
        if dry_run:
            print(f"Would mine {transcript} → {projects}")
            count += 1
            continue
        append_chronicle_entry(
            source="cursor",
            workspace=slug,
            summary=summary,
            projects=projects,
            tags=["auto-mined", "cursor"],
            agents=["cursor"],
            files_touched=files,
            correlation_id=f"oh-cursor-{h}",
        )
        append_index_row(
            library_root() / "TRANSCRIPT_INDEX.md",
            {
                "hash": h,
                "path": str(transcript),
                "workspace": slug,
                "mined_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
                "entry": f"oh-cursor-{h}",
            },
        )
        seen.add(h)
        count += 1
        print(f"mined cursor: {transcript.name} ({slug})")
    return count


def mine_scorpion(dry_run: bool, seen: set[str]) -> int:
    if not SCORPION_CONV.is_file():
        return 0
    h = file_hash(SCORPION_CONV)
    if h in seen:
        return 0
    try:
        data = json.loads(SCORPION_CONV.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return 0
    convos = data if isinstance(data, list) else data.get("conversations", [])
    summary_lines = []
    for c in convos[-5:]:
        title = c.get("title") or c.get("id") or "conversation"
        summary_lines.append(f"- {title}")
    summary = "Scorpion UI conversations batch:\n" + "\n".join(summary_lines)
    if dry_run:
        print(f"Would mine scorpion conversations ({len(convos)} total)")
        return 1
    append_chronicle_entry(
        source="scorpion",
        workspace="scorpion-ui",
        summary=summary,
        projects=["n8n-cursor", "scorpion"],
        tags=["auto-mined", "scorpion"],
        agents=["scorpion-ui"],
        correlation_id=f"oh-scorpion-{h}",
    )
    append_index_row(
        library_root() / "TRANSCRIPT_INDEX.md",
        {
            "hash": h,
            "path": str(SCORPION_CONV),
            "workspace": "scorpion-ui",
            "mined_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
            "entry": f"oh-scorpion-{h}",
        },
    )
    print("mined scorpion conversations.json")
    return 1


def mine_grok(dry_run: bool, seen: set[str]) -> int:
    if not GROK_DIR.is_dir():
        return 0
    skip_names = {"credential", "connection", "daemon-credential", "local-exec-daemon-connection"}
    count = 0
    for path in list(GROK_DIR.rglob("*.json")) + list(GROK_DIR.rglob("*.jsonl")):
        if any(s in path.name.lower() for s in skip_names):
            continue
        if path.stat().st_size > 5_000_000:
            continue
        h = file_hash(path)
        if h in seen:
            continue
        text = strip_secrets(path.read_text(encoding="utf-8", errors="replace")[:8000])
        if len(text) < 50:
            continue
        summary = f"Grok Bot log `{path.name}`:\n{text[:1500]}"
        if dry_run:
            print(f"Would mine grok {path}")
            count += 1
            continue
        append_chronicle_entry(
            source="grok",
            workspace="grokbot",
            summary=summary,
            projects=["philanthropic-ai-agent", "n8n-cursor"],
            tags=["auto-mined", "grok"],
            agents=["grok-bot"],
            correlation_id=f"oh-grok-{h}",
        )
        append_index_row(
            library_root() / "TRANSCRIPT_INDEX.md",
            {
                "hash": h,
                "path": str(path),
                "workspace": "grokbot",
                "mined_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
                "entry": f"oh-grok-{h}",
            },
        )
        seen.add(h)
        count += 1
        print(f"mined grok: {path}")
    return count


def infer_projects(slug: str, summary: str) -> list[str]:
    text = (slug + " " + summary).lower()
    mapping = {
        "client-engine": "client-engine",
        "n8n-cursor": "n8n-cursor",
        "philanthropic": "philanthropic-ai-agent",
        "shield-buddies": "shield-buddies",
        "clipengine": "clipengine",
        "scorpion": "n8n-cursor",
    }
    found = []
    for key, repo in mapping.items():
        if key in text and repo not in found:
            found.append(repo)
    return found or ["n8n-cursor"]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    index = library_root() / "TRANSCRIPT_INDEX.md"
    seen = parse_transcript_index(index)
    total = 0
    total += mine_cursor(args.dry_run, seen)
    total += mine_grok(args.dry_run, seen)
    total += mine_scorpion(args.dry_run, seen)
    total += mine_chatgpt(args.dry_run, seen)
    total += mine_claude(args.dry_run, seen)
    print(f"done: {total} new entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
