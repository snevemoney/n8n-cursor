#!/usr/bin/env python3
"""4×4 session store. Grok, Claude, ChatGPT, and Cursor each read all four.

Does not dump full JSONL or Grok blobs into git. Does not install vendor apps.
Does not call Claude/ChatGPT APIs. Local read-only extractors only.

Usage:
  python3 scripts/hive/os/session-matrix.py write [--limit 8] [--no-vault]
  python3 scripts/hive/os/session-matrix.py write --heads-json fixture.json --out-root DIR
  python3 scripts/hive/os/session-matrix.py print
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
LIB_DIR = REPO / "scripts/hive/outer-heaven"
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

from lib import strip_secrets  # noqa: E402

ASK_LIMIT = 160
BULLET_CAP = 500
SECRET_RE = re.compile(
    r"(?i)("
    r"[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}"
    r"|sk-[A-Za-z0-9_\-]{12,}"
    r"|ghp_[A-Za-z0-9]{20,}"
    r")"
)
WS_RE = re.compile(r"\s+")

SURFACES = ("cursor", "grok", "claude", "chatgpt")
FOUR_X_FOUR = (
    "Grok, Claude, ChatGPT, and Cursor each read Grok, Claude, ChatGPT, and Cursor. "
    "Same brain. Same session store."
)

OFFICIAL = {
    "memory": FOUR_X_FOUR,
    "obsidian": FOUR_X_FOUR,
    "paste": FOUR_X_FOUR,
    "actions": FOUR_X_FOUR,
    "surfaces": FOUR_X_FOUR,
}

CLAUDE_SESSIONS = Path.home() / "Library/Application Support/Claude/claude-code-sessions"
CLAUDE_HISTORY = Path.home() / ".claude/history.jsonl"
CHATGPT_CONV = Path.home() / "Library/Application Support/com.openai.chat"
CODEX_INDEX = Path.home() / ".codex/session_index.jsonl"


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def today() -> str:
    return datetime.now().strftime("%Y-%m-%d")


def clean_ask(text: str, limit: int = ASK_LIMIT) -> str:
    blob = SECRET_RE.sub("[redacted]", strip_secrets(text or ""))
    blob = WS_RE.sub(" ", blob).strip()
    return blob[:limit]


def repo_os_root(repo: Path) -> Path:
    return repo / "docs/hive/outer-heaven/CONTENT/os"


def repo_attach_os_root(repo: Path) -> Path:
    """Path Evens named out loud: CONTENT/os/sessions (repo root, not docs/hive/...)."""
    return repo / "CONTENT" / "os"


def vault_os_root() -> Path | None:
    vc_path = HERE / "vault-config.py"
    if not vc_path.is_file():
        return None
    spec = importlib.util.spec_from_file_location("vault_config", vc_path)
    if spec is None or spec.loader is None:
        return None
    vc = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(vc)
    voh = vc.vault_outer_heaven()
    if not voh:
        return None
    return Path(voh) / "CONTENT" / "os"


def _load_py(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def collect_cursor_heads(limit: int) -> list[dict[str, Any]]:
    path = HERE / "cursor-chat-sessions.py"
    if not path.is_file():
        return []
    mod = _load_py("cursor_chat_sessions", path)
    cfg = mod.load_cfg()
    files = mod.session_files(cfg, "n8n-cursor", False)
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    rows: list[dict[str, Any]] = []
    for fp in files[:limit]:
        st = fp.stat()
        rows.append(
            {
                "surface": "cursor",
                "id": fp.parent.name,
                "project": mod.workspace_slug(fp.parents[2].name),
                "mtime": datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).isoformat(),
                "ask": clean_ask(mod.first_ask(fp)),
            }
        )
    return rows


def collect_grok_heads(limit: int) -> list[dict[str, Any]]:
    path = HERE / "grok-chat-sessions.py"
    if not path.is_file():
        return []
    mod = _load_py("grok_chat_sessions", path)
    cfg = mod.load_cfg()
    root, threads, err = mod.collect_threads(cfg)
    if err == "missing-folder":
        return [{"surface": "grok", "miss": True, "path": str(root)}]
    rows: list[dict[str, Any]] = []
    for thread in threads[:limit]:
        rows.append(
            {
                "surface": "grok",
                "id": thread.get("id") or "",
                "desk": thread.get("desk") or "",
                "title": thread.get("title") or "",
                "mtime": thread.get("activity") or thread.get("mtime") or "",
                "ask": clean_ask(str(thread.get("ask") or "")),
            }
        )
    return rows


def collect_claude_heads(limit: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if CLAUDE_SESSIONS.is_dir():
        files = sorted(
            CLAUDE_SESSIONS.rglob("local_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        for path in files[:limit]:
            try:
                data = json.loads(path.read_text(encoding="utf-8", errors="replace"))
            except (OSError, json.JSONDecodeError):
                continue
            if not isinstance(data, dict):
                continue
            sid = str(data.get("sessionId") or path.stem)
            title = clean_ask(str(data.get("title") or sid))
            created = data.get("lastActivityAt") or data.get("createdAt")
            mtime = ""
            if isinstance(created, (int, float)):
                mtime = datetime.fromtimestamp(int(created) / 1000, tz=timezone.utc).isoformat()
            else:
                mtime = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat()
            rows.append(
                {
                    "surface": "claude",
                    "id": sid,
                    "title": title,
                    "mtime": mtime,
                    "ask": title,
                    "path": str(path),
                }
            )
    if rows:
        return rows
    if CLAUDE_HISTORY.is_file():
        lines = CLAUDE_HISTORY.read_text(encoding="utf-8", errors="replace").splitlines()
        for line in reversed(lines):
            if len(rows) >= limit:
                break
            try:
                data = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(data, dict):
                continue
            sid = str(data.get("sessionId") or "")
            ask = clean_ask(str(data.get("display") or ""))
            rows.append(
                {
                    "surface": "claude",
                    "id": sid or f"history-{len(rows)}",
                    "title": ask,
                    "mtime": str(data.get("timestamp") or ""),
                    "ask": ask,
                    "path": str(CLAUDE_HISTORY),
                }
            )
    return rows


def collect_chatgpt_heads(limit: int) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not CHATGPT_CONV.is_dir():
        return rows
    folders = sorted(CHATGPT_CONV.glob("conversations-v3-*"))
    files: list[Path] = []
    for folder in folders:
        files.extend(folder.glob("*.data"))
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    for path in files[:limit]:
        rows.append(
            {
                "surface": "chatgpt",
                "id": path.stem,
                "title": f"ChatGPT conversation {path.stem[:13]}",
                "mtime": datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
                "ask": "Local ChatGPT conversation on this Mac.",
                "path": str(path),
            }
        )
    return rows


def collect_codex_heads(limit: int) -> list[dict[str, Any]]:
    if not CODEX_INDEX.is_file():
        return []
    rows: list[dict[str, Any]] = []
    lines = CODEX_INDEX.read_text(encoding="utf-8", errors="replace").splitlines()
    parsed: list[dict[str, Any]] = []
    for line in lines:
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict) and data.get("id"):
            parsed.append(data)
    parsed.sort(key=lambda d: str(d.get("updated_at") or ""), reverse=True)
    for data in parsed[:limit]:
        title = clean_ask(str(data.get("thread_name") or data["id"]))
        rows.append(
            {
                "surface": "chatgpt",
                "id": str(data["id"]),
                "title": title,
                "mtime": str(data.get("updated_at") or ""),
                "ask": title,
                "path": str(CODEX_INDEX),
            }
        )
    return rows


def collect_all(limit: int) -> dict[str, list[dict[str, Any]]]:
    chatgpt = collect_chatgpt_heads(limit)
    if len(chatgpt) < limit:
        chatgpt.extend(collect_codex_heads(max(0, limit - len(chatgpt))))
    return {
        "cursor": collect_cursor_heads(limit),
        "grok": [r for r in collect_grok_heads(limit) if not r.get("miss")],
        "claude": collect_claude_heads(limit),
        "chatgpt": chatgpt,
    }


def heads_from_json(path: Path) -> dict[str, list[dict[str, Any]]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    out: dict[str, list[dict[str, Any]]] = {s: [] for s in SURFACES}
    for surface in SURFACES:
        for row in raw.get(surface) or []:
            item = dict(row)
            item["surface"] = surface
            item["ask"] = clean_ask(str(item.get("ask") or item.get("title") or ""))
            item["title"] = item.get("title") or item["ask"]
            out[surface].append(item)
    return out


def next_said_path(inbox: Path, date: str) -> Path:
    n = 1
    while True:
        path = inbox / f"{date}-said-{n}.md"
        if not path.exists():
            return path
        n += 1


def latest_said_rel(inbox: Path) -> str:
    said = sorted(inbox.glob("*-said-*.md"), reverse=True)
    if not said:
        return "(none yet)"
    return f"inbox/{said[0].name}"


def render_session_index(
    cursor: list[dict[str, Any]],
    grok: list[dict[str, Any]],
    *,
    at: str,
    said_rel: str,
) -> str:
    def rows(items: list[dict[str, Any]], kind: str) -> list[str]:
        lines = []
        for it in items:
            if it.get("miss"):
                lines.append(f"- MISS — Grok persistence missing at `{it.get('path')}`")
                continue
            extra = it.get("desk") or it.get("project") or ""
            ask = it.get("ask") or "(no ask)"
            lines.append(
                f"- `{it.get('id')}` · {kind}"
                + (f" · {extra}" if extra else "")
                + f" · {it.get('mtime') or ''} — {ask}"
            )
        return lines or [f"- (no {kind} heads on this host)"]

    return "\n".join(
        [
            "---",
            "tags: [os]",
            f"at: {at}",
            "---",
            "",
            "# SESSION-INDEX",
            "",
            "#os",
            "",
            "> [!tip] Desk read path",
            "> [[hot]] → [[index]] → [[GRAPH]] → latest `said-*` → this note. "
            "Then one id via `cursor-chat-sessions` / `grok-chat-sessions`. "
            "Do not ask Evens to paste. Do not dump transcripts.",
            "",
            f"Latest overlay: `{said_rel}` · [[PASTE-PACK]] is for ChatGPT/Claude only.",
            "",
            "## Cursor heads",
            "",
            *rows(cursor, "cursor"),
            "",
            "```",
            "python3 scripts/hive/os/cursor-chat-sessions.py list --project n8n-cursor --limit 20",
            "python3 scripts/hive/os/cursor-chat-sessions.py read --id <uuid>",
            "```",
            "",
            "## Grok heads",
            "",
            *rows(grok, "grok"),
            "",
            "```",
            "python3 scripts/hive/os/grok-chat-sessions.py list --limit 20",
            "python3 scripts/hive/os/grok-chat-sessions.py read --id <uuid>",
            "```",
            "",
            "[[GRAPH]] · [[hot]] · [[HOST]] · [[CURSOR_CHAT_SESSIONS]] · [[PASTE-PACK]]",
            "",
        ]
    )


def render_paste_pack(
    cursor: list[dict[str, Any]],
    grok: list[dict[str, Any]],
    *,
    at: str,
    said_rel: str,
) -> str:
    def bullets(items: list[dict[str, Any]]) -> list[str]:
        lines = []
        for it in items[:8]:
            if it.get("miss"):
                lines.append(f"- Grok MISS at `{it.get('path')}`")
                continue
            who = it.get("desk") or it.get("project") or it.get("surface")
            lines.append(f"- `{it.get('id')}` ({who}) — {it.get('ask') or '(no ask)'}")
        return lines or ["- (none on this host)"]

    return "\n".join(
        [
            "---",
            "tags: [os]",
            f"at: {at}",
            "---",
            "",
            "# PASTE-PACK",
            "",
            "#os",
            "",
            FOUR_X_FOUR,
            "",
            "## Official sentences",
            "",
            f"- **Memory:** {OFFICIAL['memory']}",
            f"- **Obsidian:** {OFFICIAL['obsidian']}",
            f"- **Paste vs repo:** {OFFICIAL['paste']}",
            f"- **Actions:** {OFFICIAL['actions']}",
            f"- **Wired:** {OFFICIAL['surfaces']}",
            "",
            "## Current overlay",
            "",
            f"Read `{said_rel}` and `docs/MATRIX.md` if this app can see the repo. "
            "Do not install ChatGPT / Claude / Codex into this factory. "
            "Do not scoop dirty `hive/desk`. Publish / send / pay / deploy / book stay Evens.",
            "",
            "## Latest Cursor heads (ids only)",
            "",
            *bullets(cursor),
            "",
            "## Latest Grok heads (ids only)",
            "",
            *bullets(grok),
            "",
            "## What this pack cannot do",
            "",
            "- This pack is not a live tool bridge. If the app has the repo, use native tools "
            "(Claude artifacts/projects, ChatGPT canvas/memory, Codex CLI in-repo).",
            "- Remotion encode stays Grok desktop or Mac. Refresh: "
            "`python3 scripts/hive/os/session-matrix.py write` on the Mac.",
            "",
            f"Generated {at}. [[SESSION-INDEX]] · [[hot]] · [[HOST]]",
            "",
        ]
    )


def render_said(
    cursor: list[dict[str, Any]],
    grok: list[dict[str, Any]],
    *,
    at: str,
    date: str,
    stem: str,
) -> str:
    c_n = sum(1 for r in cursor if not r.get("miss"))
    g_n = sum(1 for r in grok if not r.get("miss"))
    items = [
        FOUR_X_FOUR,
        f"Shared store `CONTENT/os/sessions/` — Cursor {c_n} · Grok {g_n} plus Claude and ChatGPT namespaces.",
        "Read `sessions/INDEX.md`. Dirty `hive/desk` stays local. Publish HITL.",
    ]
    return "\n".join(
        [
            "---",
            "kind: report",
            "skill: said",
            "desk: librarian",
            "host: cursor",
            "tab: learn",
            f"at: {at}",
            f"date: {date}",
            "---",
            "",
            f"# Overlay — {stem}",
            "",
            "Session matrix catch-up. This overlay wins over older `said-*` for memory / surfaces.",
            "",
            "## ITEMS",
            "",
            *[f"- {it}" for it in items],
            "",
            "## NOTE",
            "",
            OFFICIAL["memory"],
            "",
        ]
    )


def prepend_hot(path: Path, bullet: str, *, existing: str | None = None) -> str:
    raw = existing if existing is not None else (path.read_text(encoding="utf-8") if path.is_file() else "")
    bullets = [ln for ln in raw.splitlines() if ln.startswith("- ")]
    fresh = f"- {clean_ask(bullet, 200)}"
    if fresh not in bullets:
        bullets.insert(0, fresh)
    while bullets and sum(len(b) + 1 for b in bullets) > BULLET_CAP:
        bullets.pop()
    return "\n".join(
        [
            "---",
            "tags: [os]",
            "---",
            "",
            "# hot",
            "",
            "#os",
            "",
            "> [!tip] Read me first",
            "> Latest state. If this answers it, do not crawl the wiki.",
            "",
            *bullets,
            "",
            "[[GRAPH]] · [[index]] · [[SESSION-INDEX]] · [[last-run]]",
            "",
        ]
    )


def write_text(path: Path, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body if body.endswith("\n") else body + "\n", encoding="utf-8")


def stub_md(row: dict[str, Any]) -> str:
    title = row.get("title") or row.get("ask") or row.get("id") or "session"
    return "\n".join(
        [
            "---",
            f"surface: {row.get('surface')}",
            f"id: {row.get('id')}",
            f"date: {row.get('mtime') or ''}",
            f"path: {row.get('path') or ''}",
            "---",
            "",
            f"# {clean_ask(str(title), 120)}",
            "",
            FOUR_X_FOUR,
            "",
            f"{row.get('ask') or title}",
            "",
        ]
    )


def render_four_index(by_surface: dict[str, list[dict[str, Any]]], *, at: str) -> str:
    lines = [
        "---",
        "tags: [os]",
        f"at: {at}",
        "---",
        "",
        "# sessions INDEX",
        "",
        "#os",
        "",
        FOUR_X_FOUR,
        "",
        "| surface | id | title | date | path |",
        "|---|---|---|---|---|",
    ]
    for surface in SURFACES:
        for row in by_surface.get(surface) or []:
            title = (row.get("title") or row.get("ask") or "").replace("|", "/")
            rel = f"sessions/{surface}/{row.get('id')}.md"
            lines.append(
                f"| {surface} | `{row.get('id')}` | {title[:80]} | {row.get('mtime') or ''} | `{rel}` |"
            )
    lines += ["", f"[[hot]] · [[GRAPH]] · [[HOST]]", ""]
    return "\n".join(lines)


def write_session_store(os_root: Path, by_surface: dict[str, list[dict[str, Any]]], *, at: str) -> dict[str, int]:
    store = os_root / "sessions"
    counts: dict[str, int] = {}
    for surface in SURFACES:
        folder = store / surface
        folder.mkdir(parents=True, exist_ok=True)
        n = 0
        for row in by_surface.get(surface) or []:
            sid = str(row.get("id") or "").replace("/", "-")
            if not sid:
                continue
            write_text(folder / f"{sid}.md", stub_md(row))
            n += 1
        counts[surface] = n
    write_text(store / "INDEX.md", render_four_index(by_surface, at=at))
    write_text(
        store / "INDEX.json",
        json.dumps({"at": at, "law": FOUR_X_FOUR, "rows": [
            {**row, "surface": surface}
            for surface in SURFACES
            for row in (by_surface.get(surface) or [])
        ]}, indent=2) + "\n",
    )
    pointer = "\n".join(
        [
            "---",
            "tags: [os]",
            "---",
            "",
            "# SESSION-INDEX",
            "",
            FOUR_X_FOUR,
            "",
            "SSOT: [[sessions/INDEX]] — `CONTENT/os/sessions/INDEX.md`.",
            "",
            "[[hot]] · [[GRAPH]] · [[HOST]]",
            "",
        ]
    )
    write_text(os_root / "SESSION-INDEX.md", pointer)
    return counts


def write_attach_index(repo: Path, by_surface: dict[str, list[dict[str, Any]]], *, at: str) -> Path:
    attach = repo_attach_os_root(repo) / "sessions"
    attach.mkdir(parents=True, exist_ok=True)
    write_text(attach / "INDEX.md", render_four_index(by_surface, at=at))
    write_text(
        attach / "README.md",
        "\n".join(
            [
                FOUR_X_FOUR,
                "",
                "Canonical store: `docs/hive/outer-heaven/CONTENT/os/sessions/`.",
                "Vault: `/Users/evenslouis/Documents/My_Billion_Dollar_Vault/00_Outer_Heaven/CONTENT/os/sessions/`.",
                "",
            ]
        ),
    )
    return attach / "INDEX.md"


def write_bundle(
    os_root: Path,
    cursor: list[dict[str, Any]],
    grok: list[dict[str, Any]],
    *,
    at: str,
    date: str,
    by_surface: dict[str, list[dict[str, Any]]] | None = None,
) -> dict[str, str]:
    packed = by_surface or {"cursor": cursor, "grok": grok, "claude": [], "chatgpt": []}
    inbox = os_root / "inbox"
    inbox.mkdir(parents=True, exist_ok=True)
    said_path = next_said_path(inbox, date)
    said_rel = f"inbox/{said_path.name}"
    stem = said_path.stem
    write_text(said_path, render_said(packed.get("cursor") or [], packed.get("grok") or [], at=at, date=date, stem=stem))
    counts = write_session_store(os_root, packed, at=at)
    paste = render_paste_pack(packed.get("cursor") or [], packed.get("grok") or [], at=at, said_rel=said_rel)
    write_text(os_root / "PASTE-PACK.md", paste)
    write_text(inbox / "PASTE-PACK-LATEST.md", paste)
    if os_root.resolve() == repo_os_root(REPO).resolve():
        write_attach_index(REPO, packed, at=at)
        write_text(REPO / "PASTE-PACK.md", paste)
    hot_path = os_root / "hot.md"
    write_text(
        hot_path,
        prepend_hot(
            hot_path,
            f"{at} · {FOUR_X_FOUR} Store `sessions/` cursor={counts.get('cursor', 0)} grok={counts.get('grok', 0)} claude={counts.get('claude', 0)} chatgpt={counts.get('chatgpt', 0)}.",
        ),
    )
    return {
        "said": str(said_path),
        "index": str(os_root / "sessions" / "INDEX.md"),
        "paste": str(os_root / "PASTE-PACK.md"),
        "hot": str(hot_path),
        **{f"n_{k}": str(v) for k, v in counts.items()},
    }


def collect_live(limit: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    packed = collect_all(limit)
    return packed["cursor"], packed["grok"]


def _targets(args: argparse.Namespace) -> list[Path]:
    if args.out_root:
        return [Path(args.out_root)]
    targets = [repo_os_root(Path(args.repo))]
    if not args.no_vault:
        v = vault_os_root()
        if v:
            targets.append(v)
    return targets


def cmd_write(args: argparse.Namespace) -> int:
    packed = heads_from_json(Path(args.heads_json)) if args.heads_json else collect_all(args.limit)
    at = now_iso()
    date = today()
    wrote: list[dict[str, str]] = []
    for root in _targets(args):
        wrote.append(
            write_bundle(
                root,
                packed.get("cursor") or [],
                packed.get("grok") or [],
                at=at,
                date=date,
                by_surface=packed,
            )
        )
    print(
        json.dumps(
            {
                "at": at,
                "law": FOUR_X_FOUR,
                "counts": {s: len(packed.get(s) or []) for s in SURFACES},
                "wrote": wrote,
            },
            indent=2,
        )
    )
    return 0


def cmd_print(args: argparse.Namespace) -> int:
    packed = heads_from_json(Path(args.heads_json)) if args.heads_json else collect_all(args.limit)
    said_rel = latest_said_rel(repo_os_root(Path(args.repo)) / "inbox")
    print(
        render_paste_pack(
            packed.get("cursor") or [],
            packed.get("grok") or [],
            at=now_iso(),
            said_rel=said_rel,
        ),
        end="",
    )
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="4x4 session store — sync all four surfaces")
    ap.add_argument("--repo", default=str(REPO), help="Repo root (worktree-safe)")
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--heads-json", help="Fixture instead of live disk")
    ap.add_argument("--out-root", help="Write only this CONTENT/os root (tests)")
    ap.add_argument("--no-vault", action="store_true", help="Do not write the live Obsidian vault")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("write", help="Write said overlay + sessions store + INDEX")
    sub.add_parser("sync", help="Refresh all four namespaces from disk (alias of write)")
    sub.add_parser("print", help="Print PASTE-PACK to stdout")
    args = ap.parse_args()
    if args.cmd in ("write", "sync"):
        return cmd_write(args)
    return cmd_print(args)


if __name__ == "__main__":
    raise SystemExit(main())
