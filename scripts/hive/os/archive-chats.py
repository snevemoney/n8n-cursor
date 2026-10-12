#!/usr/bin/env python3
"""Archive locally discoverable chats onto one Obsidian timeline.

Surfaces:
  grok         — all Grok Bot desk threads (not 17 stubs)
  claude       — Desktop local-agent first prompts
  claude-code  — ~/.claude/projects jsonl
  claude-web   — optional --export conversations.json
  cursor       — timeline pointers into CURSOR_CHATS (no body copy)
  chatgpt/codex — already archived; included in TIMELINE only

Does not copy Grok .blob files. Does not overwrite notes that are already
full archives except to refresh our own archive_type notes.

Usage:
  python3 scripts/hive/os/archive-chats.py
  python3 scripts/hive/os/archive-chats.py --surface grok
  python3 scripts/hive/os/archive-chats.py --export ~/Downloads/conversations.json
  python3 scripts/hive/os/archive-chats.py --dry-run
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
LIB_DIR = REPO / "scripts/hive/outer-heaven"
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

def load_vault_config():
    path = HERE / "vault-config.py"
    spec = importlib.util.spec_from_file_location("vault_config", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_vc = load_vault_config()
cache_root = _vc.cache_root
vault_outer_heaven = _vc.vault_outer_heaven


def load_claude_imp():
    path = LIB_DIR / "import-claude-chats.py"
    spec = importlib.util.spec_from_file_location("import_claude_chats", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


claude_imp = load_claude_imp()

FOUR_X_FOUR = (
    "Independent workers. Shared typed state, shared contract, shared evidence. "
    "Slack #hive is a feed, not engineering truth."
)
GROK_MAX_CHARS = 80000
FM_RE = re.compile(r"^---\n(.*?)\n---", re.S)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def slugify(text: str, max_len: int = 40) -> str:
    s = re.sub(r"[^a-zA-Z0-9._-]+", "-", (text or "").strip()).strip("-").lower()
    return (s[:max_len] or "unassigned")


def dest_roots() -> list[Path]:
    """Write targets: cache then vault."""
    roots = [cache_root()]
    voh = vault_outer_heaven()
    if voh and voh not in roots:
        roots.append(voh)
    return roots


def read_roots() -> list[Path]:
    """Read targets: vault first (Obsidian SSOT), then cache."""
    roots: list[Path] = []
    voh = vault_outer_heaven()
    if voh:
        roots.append(voh)
    cache = cache_root()
    if cache not in roots:
        roots.append(cache)
    return roots


def load_grok_mod():
    path = HERE / "grok-chat-sessions.py"
    spec = importlib.util.spec_from_file_location("grok_chat_sessions_archive", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def parse_frontmatter(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    m = FM_RE.match(text)
    if not m:
        return out
    for line in m.group(1).splitlines():
        if ":" not in line:
            continue
        key, val = line.split(":", 1)
        out[key.strip()] = val.strip().strip('"').strip("'")
    return out


def first_heading(text: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def parse_updated(raw: str) -> datetime | None:
    raw = (raw or "").strip()
    if not raw:
        return None
    if raw.isdigit():
        n = int(raw)
        if n > 1e12:
            n = n / 1000
        try:
            return datetime.fromtimestamp(n, tz=timezone.utc)
        except (OSError, OverflowError, ValueError):
            return None
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        return None


def write_text(path: Path, body: str, dry_run: bool) -> None:
    if dry_run:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body if body.endswith("\n") else body + "\n", encoding="utf-8")


def archive_header(
    *,
    surface: str,
    sid: str,
    title: str,
    date: str,
    desk: str = "",
    source: str,
    extra: dict[str, str] | None = None,
) -> str:
    lines = [
        "---",
        f"surface: {surface}",
        f"id: {sid}",
        f"date: {date}",
        f"title: {json.dumps(title)[:200]}",
        "archive_type: conversation_text",
        f"source: {source}",
    ]
    if desk:
        lines.append(f"desk: {desk}")
    for k, v in (extra or {}).items():
        lines.append(f"{k}: {v}")
    lines += ["---", "", f"# {title}", "", FOUR_X_FOUR, ""]
    return "\n".join(lines)


# --- Grok -----------------------------------------------------------------


def archive_grok(dry_run: bool) -> list[dict]:
    grok = load_grok_mod()
    cfg = grok.load_cfg()
    root, threads, err = grok.collect_threads(cfg)
    if err == "missing-folder":
        print(f"archive-chats grok: MISS {root}")
        return []
    blobs = grok.iter_blobs(root)
    by_id: dict[str, Path] = {}
    for path, key in blobs:
        tid = grok.replica_id(cfg, key)
        if tid:
            by_id[tid] = path
    rows: list[dict] = []
    for thread in threads:
        tid = str(thread.get("id") or "")
        if not tid:
            continue
        blob = by_id.get(tid)
        entries: list = []
        if blob:
            payload = grok.load_json_blob(blob).get("value") or {}
            entries = payload.get("entries") if isinstance(payload.get("entries"), list) else []
        text, truncated = grok.format_entries(entries, GROK_MAX_CHARS)
        desk = str(thread.get("desk") or "unassigned")
        title = str(thread.get("title") or thread.get("ask") or tid)[:160]
        date = str(thread.get("activity") or thread.get("mtime") or now_iso())
        body = archive_header(
            surface="grok",
            sid=tid,
            title=title,
            date=date,
            desk=desk,
            source="grok-archive",
            extra={"truncated": str(truncated).lower(), "entries": str(len(entries))},
        )
        if text:
            body += "## Transcript\n\n" + text + "\n"
        else:
            ask = str(thread.get("ask") or "").strip()
            body += "## Transcript\n\n" + (ask or "(no local text)") + "\n"
        rel = Path("CONTENT/os/sessions/grok") / slugify(desk) / f"{tid}.md"
        for dest_root in dest_roots():
            write_text(dest_root / rel, body, dry_run)
        rows.append(
            {
                "surface": "grok",
                "desk": desk,
                "id": tid,
                "title": title,
                "date": date,
                "rel": str(rel),
            }
        )
    print(f"archive-chats grok: {len(rows)} threads from {root}")
    return rows


# --- Claude ---------------------------------------------------------------


def extract_conversations_zip(zip_path: Path) -> Path | None:
    dest = zip_path.parent / f"{zip_path.stem}-unpacked"
    dest.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(dest)
    except zipfile.BadZipFile:
        print(f"archive-chats: not a zip {zip_path}")
        return None
    named = [
        p
        for p in dest.rglob("*.json")
        if "conversation" in p.name.lower() and p.stat().st_size > 20
    ]
    if named:
        return named[0]
    jsons = [p for p in dest.rglob("*.json") if p.stat().st_size > 20]
    if len(jsons) == 1:
        return jsons[0]
    if jsons:
        return dest
    return None


def resolve_claude_export(path: Path | None) -> Path | None:
    """Accept conversations.json, a zip, a folder, or Claude's one-time manifest."""
    if path is None:
        return None
    path = path.expanduser()
    search_dirs = [path if path.is_dir() else path.parent]
    extra = Path.home() / "Downloads/claude-export-2026-09-11"
    if extra not in search_dirs:
        search_dirs.append(extra)
    downloads = Path.home() / "Downloads"
    if downloads not in search_dirs:
        search_dirs.append(downloads)

    if path.is_dir():
        for cand in list(path.rglob("conversations.json")) + list(path.rglob("conversations*.json")):
            if cand.is_file() and cand.stat().st_size > 100:
                return cand
        zips = sorted(path.glob("conversations*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
        if zips:
            return extract_conversations_zip(zips[0])
        return None

    if not path.is_file():
        return None

    if path.suffix.lower() == ".zip":
        return extract_conversations_zip(path)

    if path.suffix.lower() != ".json":
        return None

    head = path.read_text(encoding="utf-8", errors="replace")[:8000].lstrip()
    if head.startswith("["):
        return path
    try:
        data = json.loads(head if head.startswith("{") and '"data_files"' in head else path.read_text(encoding="utf-8", errors="replace"))
    except json.JSONDecodeError:
        return path

    if isinstance(data, dict) and data.get("data_files"):
        wanted = None
        for item in data.get("data_files") or []:
            if item.get("category") == "conversations":
                wanted = item.get("filename") or "conversations-000.zip"
                break
        if wanted:
            for folder in search_dirs:
                z = folder / wanted
                if z.is_file() and z.stat().st_size > 100:
                    return extract_conversations_zip(z)
        print(f"archive-chats: manifest seen, waiting for {wanted} in {extra}")
        return None
    return path


def load_web_export(path: Path | None) -> list[dict]:
    resolved = resolve_claude_export(path)
    if resolved is None:
        return []
    if resolved.is_dir():
        recs: list[dict] = []
        for f in sorted(resolved.rglob("*.json")):
            recs.extend(claude_imp.parse_conversations_export(f))
        return recs
    return claude_imp.parse_conversations_export(resolved)


def archive_claude(dry_run: bool, export: Path | None) -> list[dict]:
    rows: list[dict] = []
    recs: list[dict] = []
    if claude_imp.CLAUDE_PROJECTS.is_dir():
        for path in sorted(claude_imp.CLAUDE_PROJECTS.rglob("*.jsonl")):
            rec = claude_imp.parse_claude_jsonl(path)
            if rec:
                recs.append(rec)
    if claude_imp.LOCAL_AGENT.is_dir():
        seen = {r["chat_id"] for r in recs}
        for path in sorted(claude_imp.LOCAL_AGENT.rglob("local_*.json")):
            rec = claude_imp.parse_desktop_local(path)
            if not rec:
                continue
            cli = rec.get("cli_session_id")
            if rec["chat_id"] in seen or (cli and cli in seen):
                continue
            recs.append(rec)
    if export:
        recs.extend(load_web_export(export))
    for rec in recs:
        surface = {
            "claude-code": "claude-code",
            "claude-desktop-local": "claude",
            "claude-web-export": "claude-web",
        }.get(rec["source"], "claude")
        sid = rec["chat_id"]
        title = rec["title"]
        date = rec["updated"].isoformat()
        extra = {"messageCount": str(rec["message_count"]), "path": rec["path"]}
        body = archive_header(
            surface=surface,
            sid=sid,
            title=title,
            date=date,
            source=rec["source"],
            extra=extra,
        )
        if rec["user_msgs"]:
            body += "## What you asked\n\n" + "\n\n---\n\n".join(
                f"- {m[:800]}" for m in rec["user_msgs"][:10]
            ) + "\n\n"
        if rec["assistant_msgs"]:
            body += "## Assistant (excerpts)\n\n" + "\n\n---\n\n".join(
                f"- {m[:800]}" for m in rec["assistant_msgs"][-5:]
            ) + "\n"
        rel = Path("CONTENT/os/sessions") / surface / f"{sid}.md"
        alias_rel = Path("CLAUDE_CHATS") / claude_imp.slugify(rec["project"], 40) / (
            f"{rec['updated'].strftime('%Y%m%d')}-{claude_imp.slugify(title)}-{sid[:8]}.md"
        )
        alias = (
            f"---\nalias: true\nsurface: {surface}\nid: {sid}\n"
            f"points_to: {rel.as_posix()}\n---\n\n"
            f"# {title}\n\n"
            f"Body moved to [[00_Outer_Heaven/{rel.as_posix().removesuffix('.md')}]].\n"
        )
        for dest_root in dest_roots():
            write_text(dest_root / rel, body, dry_run)
            write_text(dest_root / alias_rel, alias, dry_run)
        rows.append(
            {
                "surface": surface,
                "desk": "",
                "id": sid,
                "title": title,
                "date": date,
                "rel": str(rel),
            }
        )
    print(f"archive-chats claude*: {len(rows)} notes")
    return rows


# --- Timeline / coverage --------------------------------------------------


def cursor_rows() -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()
    for root in read_roots():
        chats = root / "CURSOR_CHATS"
        if not chats.is_dir():
            continue
        for path in chats.rglob("*.md"):
            if path.name in {"README.md", "GRAPH_GUIDE.md"}:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            fm = parse_frontmatter(text)
            sid = fm.get("chatId") or path.stem
            if sid in seen:
                continue
            seen.add(sid)
            title = fm.get("title") or first_heading(text) or sid
            dt = parse_updated(fm.get("updated") or "") or datetime.fromtimestamp(
                path.stat().st_mtime, tz=timezone.utc
            )
            try:
                rel = path.relative_to(root)
            except ValueError:
                rel = path
            rows.append(
                {
                    "surface": "cursor",
                    "desk": fm.get("workspace") or path.parent.name,
                    "id": sid,
                    "title": title[:160],
                    "date": dt.isoformat(),
                    "rel": str(rel),
                }
            )
        if rows:
            break
    return rows


def existing_session_rows(surface: str) -> list[dict]:
    rows: list[dict] = []
    seen: set[str] = set()
    for root in read_roots():
        folder = root / "CONTENT/os/sessions" / surface
        if not folder.is_dir():
            continue
        for path in folder.rglob("*.md"):
            if path.name in {
                "README.md",
                "INDEX.md",
                "TIMELINE.md",
                "Recent Conversations.md",
                "Conversation Timeline.md",
                "Archive Coverage.md",
            }:
                continue
            text = path.read_text(encoding="utf-8", errors="replace")
            fm = parse_frontmatter(text)
            if surface in {"chatgpt", "codex"}:
                pass
            elif fm.get("archive_type") != "conversation_text" and fm.get("source") not in {
                "claude-code",
                "grok-archive",
                "claude-desktop-local",
                "claude-web-export",
            }:
                continue
            sid = fm.get("id") or path.stem
            key = f"{surface}:{sid}:{path.name}"
            if key in seen:
                continue
            seen.add(key)
            title = fm.get("title") or first_heading(text) or sid
            date = fm.get("date") or fm.get("archive_date") or fm.get("updated") or ""
            if not date:
                date = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat()
            try:
                rel = path.relative_to(root)
            except ValueError:
                rel = path
            rows.append(
                {
                    "surface": surface,
                    "desk": fm.get("desk") or "",
                    "id": sid,
                    "title": title[:160],
                    "date": date,
                    "rel": str(rel),
                }
            )
        if rows:
            break
    return rows


def wikilink(rel: str, title: str) -> str:
    target = rel.replace(".md", "").lstrip("/")
    if not target.startswith("00_Outer_Heaven/"):
        target = f"00_Outer_Heaven/{target}"
    safe = title.replace("|", "/").replace("[", "(").replace("]", ")")
    return f"[[{target}|{safe[:80]}]]"


def build_timeline(all_rows: list[dict]) -> str:
    def sort_key(row: dict) -> str:
        return str(row.get("date") or "")

    rows = sorted(all_rows, key=sort_key, reverse=True)
    lines = [
        "---",
        "tags: [os, chat-timeline]",
        f"at: {now_iso()}",
        "---",
        "",
        "# Chat TIMELINE",
        "",
        FOUR_X_FOUR,
        "",
        "Dated door for **chats**. Project time stays on [[00_Outer_Heaven/CHRONICLE/Project Timeline]].",
        "Coverage: [[00_Outer_Heaven/CONTENT/os/sessions/Archive Coverage]]. Heads: [[00_Outer_Heaven/CONTENT/os/sessions/Recent Conversations]].",
        "",
        "| date | surface | desk | title |",
        "|------|---------|------|-------|",
    ]
    for row in rows:
        date = str(row.get("date") or "")[:19]
        desk = row.get("desk") or ""
        title = wikilink(str(row["rel"]), str(row.get("title") or row.get("id") or "?"))
        lines.append(f"| {date} | {row['surface']} | {desk} | {title} |")
    lines += ["", f"Rows: **{len(rows)}**.", ""]
    return "\n".join(lines)


def build_coverage(counts: dict[str, int], grok_desks: int) -> str:
    return "\n".join(
        [
            "---",
            "tags: [os, chat-archive]",
            f"at: {now_iso()}",
            "---",
            "",
            "# Chat archive coverage",
            "",
            FOUR_X_FOUR,
            "",
            "Open the dated list: [[00_Outer_Heaven/CONTENT/os/sessions/Conversation Timeline]]. Latest heads: [[00_Outer_Heaven/CONTENT/os/sessions/Recent Conversations]].",
            "",
            "## Counts (this Mac, local disk)",
            "",
            f"- **cursor** — {counts.get('cursor', 0)} (pointers into `CURSOR_CHATS/`; bodies stay there)",
            f"- **grok** — {counts.get('grok', 0)} local threads from Mac persistence "
            f"(17 roster desks; {grok_desks} desk labels on disk)",
            f"- **claude** — {counts.get('claude', 0)} Desktop local-agent prompts",
            f"- **claude-code** — {counts.get('claude-code', 0)} Claude Code jsonl sessions",
            f"- **claude-web** — {counts.get('claude-web', 0)} from the account `conversations.json`",
            f"- **chatgpt** — {counts.get('chatgpt', 0)} local app conversations",
            f"- **codex** — {counts.get('codex', 0)} local Codex sessions",
            "",
            "## Gaps (honest)",
            "",
            "- **claude.ai** — `Downloads/conversations.json` ingested. Rows with no text were skipped. Re-export if you want a later dump.",
            "- **ChatGPT older-than-local** — need the official data-export ZIP (as already noted Sep 10).",
            "- **Grok** — Mac `sand-client-persistence` only. Cloud cannot see this folder.",
            "- Attachments and tool logs are not embedded. Some ChatGPT messages were truncated at import.",
            "",
            "## Refresh",
            "",
            "```bash",
            "python3 scripts/hive/os/archive-chats.py",
            "```",
            "",
            "`session-matrix.py write` refreshes the heads table only. It will not overwrite notes marked `archive_type: conversation_text`.",
            "",
        ]
    )


def patch_index_doors(dry_run: bool) -> None:
    door = (
        "Doors: [[00_Outer_Heaven/CONTENT/os/sessions/Conversation Timeline]] · "
        "[[00_Outer_Heaven/CONTENT/os/sessions/Archive Coverage]] — dated archive. "
        "Table below is latest heads only."
    )
    for root in dest_roots():
        path = root / "CONTENT/os/sessions/Recent Conversations.md"
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        if "00_Outer_Heaven/CONTENT/os/sessions/Conversation Timeline" in text:
            continue
        text = text.replace(
            "Doors: [[TIMELINE]] · [[00_Outer_Heaven/CONTENT/os/sessions/Archive Coverage]] — dated archive. Table below is latest heads only.",
            door,
        )
        text = text.replace(
            FOUR_X_FOUR + "\n\n| surface",
            FOUR_X_FOUR + "\n\n" + door + "\n\n| surface",
            1,
        )
        write_text(path, text, dry_run)


def alias_note(*, surface: str, sid: str, title: str, points_to: str, reason: str) -> str:
    target = points_to.replace(".md", "").lstrip("/")
    if not target.startswith("00_Outer_Heaven/"):
        target = f"00_Outer_Heaven/{target}"
    return (
        "---\n"
        "alias: true\n"
        "archive_type: archive_alias\n"
        f"surface: {surface}\n"
        f"id: {sid}\n"
        f"points_to: {points_to}\n"
        "---\n\n"
        f"# {title}\n\n"
        f"{reason}\n\n"
        f"Body: [[{target}]].\n"
    )


def replace_leftover_stubs(grok_rows: list[dict], claude_rows: list[dict], dry_run: bool) -> dict[str, int]:
    """Turn session-matrix leftover stubs into aliases so write cannot recreate them."""
    grok_by_id = {str(r.get("id") or ""): r for r in grok_rows}
    changed = {"grok": 0, "claude": 0}
    for dest_root in dest_roots():
        grok_dir = dest_root / "CONTENT/os/sessions/grok"
        if grok_dir.is_dir():
            for path in grok_dir.glob("*.md"):
                if path.name in {
                    "README.md",
                    "INDEX.md",
                    "Recent Conversations.md",
                    "Conversation Timeline.md",
                    "Archive Coverage.md",
                }:
                    continue
                text = path.read_text(encoding="utf-8", errors="replace")
                fm = parse_frontmatter(text)
                if fm.get("archive_type") in {"conversation_text", "archive_alias"}:
                    continue
                sid = fm.get("id") or path.stem
                row = grok_by_id.get(sid)
                if row:
                    points = str(row["rel"])
                    title = str(row.get("title") or sid)
                else:
                    matches = [p for p in grok_dir.rglob(path.name) if p != path]
                    if not matches:
                        continue
                    try:
                        points = str(matches[0].relative_to(dest_root))
                    except ValueError:
                        points = str(matches[0])
                    title = first_heading(text) or sid
                write_text(
                    path,
                    alias_note(
                        surface="grok",
                        sid=sid,
                        title=title,
                        points_to=points,
                        reason="Desk transcript (not this stub).",
                    ),
                    dry_run,
                )
                changed["grok"] += 1
        claude_dir = dest_root / "CONTENT/os/sessions/claude"
        if claude_dir.is_dir():
            for path in claude_dir.glob("*.md"):
                if path.name in {
                    "README.md",
                    "INDEX.md",
                    "Recent Conversations.md",
                    "Conversation Timeline.md",
                    "Archive Coverage.md",
                }:
                    continue
                text = path.read_text(encoding="utf-8", errors="replace")
                fm = parse_frontmatter(text)
                if fm.get("archive_type") in {"conversation_text", "archive_alias"}:
                    continue
                sid = fm.get("id") or path.stem
                title = fm.get("title") or first_heading(text) or sid
                write_text(
                    path,
                    alias_note(
                        surface="claude",
                        sid=sid,
                        title=title,
                        points_to="CONTENT/os/sessions/Conversation Timeline.md",
                        reason="Title-only `claude-code-sessions` stub. Not a transcript.",
                    ),
                    dry_run,
                )
                changed["claude"] += 1
    print(f"archive-chats leftover stubs → aliases: {changed}")
    return changed


def write_cursor_pointers(rows: list[dict], dry_run: bool) -> int:
    """Thin pointer notes in sessions/cursor/. Bodies stay in CURSOR_CHATS."""
    n = 0
    for row in rows:
        sid = str(row.get("id") or "").replace("/", "-")
        if not sid:
            continue
        rel = str(row.get("rel") or "")
        title = str(row.get("title") or sid)
        date = str(row.get("date") or now_iso())
        desk = str(row.get("desk") or "")
        body = (
            "---\n"
            "surface: cursor\n"
            f"id: {sid}\n"
            f"date: {date}\n"
            f"title: {json.dumps(title)[:200]}\n"
            "archive_type: cursor_pointer\n"
            f"points_to: {rel}\n"
        )
        if desk:
            body += f"desk: {desk}\n"
        body += (
            "---\n\n"
            f"# {title}\n\n"
            f"{FOUR_X_FOUR}\n\n"
            f"Body: {wikilink(rel, title)}.\n"
        )
        for dest_root in dest_roots():
            write_text(dest_root / "CONTENT/os/sessions/cursor" / f"{sid}.md", body, dry_run)
        n += 1
    print(f"archive-chats cursor pointers: {n}")
    return n


def sync_vault_archives_to_cache(dry_run: bool) -> dict[str, int]:
    """ChatGPT/Codex already live in the vault. Mirror them to the cache home."""
    voh = vault_outer_heaven()
    cache = cache_root()
    copied = {"chatgpt": 0, "codex": 0, "index": 0}
    if not voh or voh == cache:
        return copied
    for surface in ("chatgpt", "codex"):
        src = voh / "CONTENT/os/sessions" / surface
        dst = cache / "CONTENT/os/sessions" / surface
        if not src.is_dir():
            continue
        for path in src.glob("*.md"):
            dest = dst / path.name
            if dest.is_file():
                continue
            write_text(dest, path.read_text(encoding="utf-8", errors="replace"), dry_run)
            copied[surface] += 1
    src_index = voh / "CONTENT/os/sessions/Recent Conversations.md"
    dst_index = cache / "CONTENT/os/sessions/Recent Conversations.md"
    if src_index.is_file() and not dst_index.is_file():
        write_text(dst_index, src_index.read_text(encoding="utf-8", errors="replace"), dry_run)
        copied["index"] += 1
    print(f"archive-chats cache sync: {copied}")
    return copied


def write_claude_web_readme(dry_run: bool) -> None:
    body = (
        "---\nsurface: claude-web\narchive_type: cursor_pointer\n---\n\n"
        "# claude.ai chats\n\n"
        "Empty until Evens drops Settings → Privacy → Export.\n\n"
        "```bash\n"
        "python3 scripts/hive/os/archive-chats.py --export ~/Downloads/conversations.json\n"
        "```\n"
    )
    for root in dest_roots():
        write_text(root / "CONTENT/os/sessions/claude-web/README.md", body, dry_run)


def write_cursor_readme(dry_run: bool) -> None:
    body = (
        "---\nsurface: cursor\narchive_type: cursor_pointer\n---\n\n"
        "# Cursor sessions\n\n"
        "Bodies live in [[00_Outer_Heaven/CURSOR_CHATS_INDEX]]. "
        "This folder keeps heads from `session-matrix`. The dated list is "
        "[[00_Outer_Heaven/CONTENT/os/sessions/Conversation Timeline]].\n"
    )
    for root in dest_roots():
        write_text(root / "CONTENT/os/sessions/cursor/README.md", body, dry_run)
    grok_readme = (
        "---\nsurface: grok\n---\n\n"
        "# Grok sessions\n\n"
        "Real transcripts live in desk folders: `grok/{desk-slug}/{id}.md`.\n"
        "Root `{id}.md` files are aliases so `session-matrix` heads keep working.\n"
        "Dated list: [[00_Outer_Heaven/CONTENT/os/sessions/Conversation Timeline]].\n"
    )
    for root in dest_roots():
        write_text(root / "CONTENT/os/sessions/grok/README.md", grok_readme, dry_run)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--surface", help="grok | claude | timeline (default: all)")
    ap.add_argument("--export", type=Path, help="claude.ai conversations.json")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    want = (args.surface or "all").lower()
    grok_rows: list[dict] = []
    claude_rows: list[dict] = []
    if want in {"all", "grok"}:
        grok_rows = archive_grok(args.dry_run)
    if want in {"all", "claude", "claude-code"}:
        claude_rows = archive_claude(args.dry_run, args.export)

    chatgpt = existing_session_rows("chatgpt")
    codex = existing_session_rows("codex")
    grok_all = grok_rows or existing_session_rows("grok")
    claude_desk = [r for r in claude_rows if r["surface"] == "claude"] or existing_session_rows("claude")
    claude_code = [r for r in claude_rows if r["surface"] == "claude-code"] or existing_session_rows(
        "claude-code"
    )
    claude_web = [r for r in claude_rows if r["surface"] == "claude-web"] or existing_session_rows(
        "claude-web"
    )
    cursor = cursor_rows()
    all_rows = chatgpt + codex + grok_all + claude_desk + claude_code + claude_web + cursor
    timeline = build_timeline(all_rows)
    counts = {
        "cursor": len(cursor),
        "grok": len(grok_all),
        "claude": len(claude_desk),
        "claude-code": len(claude_code),
        "claude-web": len(claude_web),
        "chatgpt": len(chatgpt),
        "codex": len(codex),
    }
    desks = len({r.get("desk") for r in grok_all if r.get("desk")})
    coverage = build_coverage(counts, desks)
    for root in dest_roots():
        write_text(root / "CONTENT/os/sessions/Conversation Timeline.md", timeline, args.dry_run)
        write_text(root / "CONTENT/os/sessions/Archive Coverage.md", coverage, args.dry_run)
    write_cursor_readme(args.dry_run)
    write_claude_web_readme(args.dry_run)
    if want in {"all", "cursor", "timeline"}:
        write_cursor_pointers(cursor, args.dry_run)
    if want in {"all", "grok", "claude", "claude-code"}:
        replace_leftover_stubs(grok_all, claude_rows or claude_desk + claude_code, args.dry_run)
    if want in {"all", "timeline"}:
        sync_vault_archives_to_cache(args.dry_run)
    patch_index_doors(args.dry_run)
    print("archive-chats timeline:", counts, "→", dest_roots())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
