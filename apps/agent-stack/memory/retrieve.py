#!/usr/bin/env python3
"""Vault Q&A: keyword over hot files. Never dump the vault.

Adopt existing path (live vault or repo hive). No second vault. No hive/desk.
No ChatGPT .data. Canon first — cite snippets — UNKNOWN on a miss.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
REPO_OH = ROOT / "docs/hive/outer-heaven"
DEFAULT_VAULT = Path.home() / "Documents/My_Billion_Dollar_Vault"

ALLOW_REL = (
    "OPERATOR_MEMORY.md",
    "NORTH_STAR.md",
    "OS.md",
    "index.md",
    "AGENT_CHEAT_SHEET.md",
    "brief.json",
    "CONTENT/os/hot.md",
    "CONTENT/os/index.md",
    "CONTENT/os/ASKS.md",
    "CONTENT/os/HOST.md",
    "CONTENT/os/DESK-MISSIONS-NOW.md",
    "CONTENT/os/RECEIVE.md",
    "CONTENT/os/jobs.json",
    "CONTENT/os/last-run.md",
    "CONTENT/watch-later/OPERATOR_MEMORY.md",
    "CONTENT/watch-later/STEAL_SHEET.md",
    "CONTENT/watch-later/DEEP_SUMMARIES.md",
    "CONTENT/job-cards/INDEX.md",
    "CONTENT/job-cards/big-boss.md",
    "CONTENT/job-cards/forge.md",
    "CONTENT/job-cards/watchdog.md",
    "CONTENT/job-cards/hitl-operator.md",
    "CONTENT/job-cards/researcher.md",
    "CONTENT/job-cards/communications-manager.md",
)
ALLOW_DIR_GLOBS = (
    ("CONTENT/os", "*.md"),
    ("CONTENT/job-cards", "*.md"),
)
SKIP_NAME_PREFIXES = (
    "DRIFT-RESYNC",
    "TRANSCRIPT",
    "CURSOR_CHATS",
    "GRAPH",
)
INBOX_REL = "CONTENT/os/inbox"
BLOCK_MARKS = (
    "/hive/desk/",
    "\\hive\\desk\\",
    "/.data/",
    ".data/",
    "chatgpt",
    "/node_modules/",
    "/.git/",
    "/cursor_chats/",
    "/_staging/",
)
STOP = {
    "the","a","an","and","or","of","to","in","on","for","is","are","was","be",
    "my","me","i","you","your","our","what","whats","who","when","why","how",
    "does","do","did","about","tell","please","just","from","with","that",
    "this","have","has","say","said","ask","asked",
}
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9'-]{2,}", re.I)
IDENTITY_RE = re.compile(r"\bwho am i\b|\bwho(?:'s| is) (?:evens|the operator)\b", re.I)
NORTH_RE = re.compile(r"north\s*stars?", re.I)
PLAN_RE = re.compile(r"\b(?:the|my|our) plan\b|\bwhat(?:'s| is) the plan\b", re.I)
CANON_NAMES = frozenset({
    "OPERATOR_MEMORY.md","NORTH_STAR.md","OS.md","hot.md","STEAL_SHEET.md",
    "DEEP_SUMMARIES.md","brief.json","jobs.json","AGENT_CHEAT_SHEET.md",
    "index.md","DESK-MISSIONS-NOW.md","HOST.md","RECEIVE.md",
})
FILE_BOOST = {
    "OPERATOR_MEMORY.md": 12, "NORTH_STAR.md": 12, "hot.md": 6, "OS.md": 4,
    "STEAL_SHEET.md": 4, "brief.json": 3, "AGENT_CHEAT_SHEET.md": 3,
}
MAX_FILE = 400_000
MAX_CITES = 3
SNIP = 240


def _blocked(path: Path) -> bool:
    s = str(path).lower().replace("\\", "/")
    return any(mark in s for mark in BLOCK_MARKS)


def _skip_name(name: str) -> bool:
    upper = name.upper()
    return any(upper.startswith(prefix) for prefix in SKIP_NAME_PREFIXES)


def tokens(query: str) -> list[str]:
    out: list[str] = []
    for raw in TOKEN_RE.findall(query or ""):
        word = raw.lower().strip("'")
        if word in STOP or len(word) < 3:
            continue
        if word not in out:
            out.append(word)
    return out


def expand_tokens(query: str) -> list[str]:
    words = tokens(query)
    low = (query or "").lower()
    extras: list[str] = []
    if IDENTITY_RE.search(low):
        extras.extend(["evens", "operator", "louis"])
    if NORTH_RE.search(low):
        extras.extend(["north", "stars", "leverage"])
    if PLAN_RE.search(low):
        extras.extend(["plan", "thesis", "north"])
    if re.search(r"\bbelieve\b", low):
        extras.extend(["north", "stars", "evens"])
    for word in extras:
        if word not in words:
            words.append(word)
    return words


def load_json(path: Path) -> dict:
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def resolve_roots(extra: list[Path] | None = None) -> list[Path]:
    roots: list[Path] = []
    seen: set[str] = set()

    def add(path: Path | None) -> None:
        if path is None:
            return
        raw = path.expanduser()
        if not raw.is_dir():
            return
        key = str(raw)
        if key in seen:
            return
        seen.add(key)
        roots.append(raw)

    for path in extra or []:
        add(path)
    if extra:
        return roots
    stack = load_json(HIVE / "agent-stack.json")
    vault = stack.get("vault") if isinstance(stack.get("vault"), dict) else {}
    oh = Path(str(vault.get("oh") or "")).expanduser()
    root = Path(str(vault.get("path") or "")).expanduser()
    if oh.is_dir():
        add(oh)
    elif root.is_dir():
        add(root / "00_Outer_Heaven")
        add(root)
    else:
        env = (os.environ.get("HIVE_OBSIDIAN_VAULT") or "").strip()
        live = Path(env).expanduser() if env else DEFAULT_VAULT
        add(live / "00_Outer_Heaven")
        add(live)
    add(REPO_OH)
    return roots


def _inbox_files(root: Path) -> list[Path]:
    inbox = root / INBOX_REL
    if not inbox.is_dir():
        return []
    if "docs/hive/outer-heaven" not in str(root).replace("\\", "/"):
        return []
    files = [p for p in inbox.glob("*.md") if p.is_file() and not _blocked(p)]
    files.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
    return files[:5]


def _add_file(path: Path, files: list[Path], seen: set[str]) -> None:
    if not path.is_file() or _blocked(path) or _skip_name(path.name):
        return
    key = str(path)
    if key in seen:
        return
    seen.add(key)
    files.append(path)


def candidate_files(roots: list[Path]) -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    for root in roots:
        for rel in ALLOW_REL:
            _add_file(root / rel, files, seen)
        for folder, pattern in ALLOW_DIR_GLOBS:
            directory = root / folder
            if not directory.is_dir() or _blocked(directory):
                continue
            for path in directory.glob(pattern):
                _add_file(path, files, seen)
        for path in _inbox_files(root):
            _add_file(path, files, seen)
    return files


def _snippet(text: str, words: list[str]) -> str:
    low = text.lower()
    idx = -1
    for word in words:
        idx = low.find(word)
        if idx >= 0:
            break
    if idx < 0:
        idx = 0
    start = text.rfind("\n", 0, idx)
    start = 0 if start < 0 else start + 1
    chunk = re.sub(r"\s+", " ", text[start : start + SNIP + 80]).strip()
    chunk = re.sub(r"^#+\s*", "", chunk)
    return chunk[:SNIP]


def _answer(hits: list[dict]) -> dict:
    if not hits:
        return {"ok": True, "hits": [], "unknown": True, "spoken": "I don't have that in the vault. UNKNOWN."}
    first = hits[0]["snippet"]
    spoken = first if len(first) <= 180 else first[:177].rsplit(" ", 1)[0] + "…"
    cite = hits[0]["path"]
    return {"ok": True, "hits": hits, "unknown": False, "spoken": f"{spoken} Cited {cite}."}


def _score_files(words: list[str], files: list[Path], used_roots: list[Path]) -> dict:
    scored: list[tuple[int, Path, str]] = []
    for path in files:
        try:
            if path.stat().st_size > MAX_FILE:
                continue
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        low = text.lower()
        score = sum(low.count(word) for word in words)
        if score <= 0:
            continue
        score += FILE_BOOST.get(path.name, 0)
        if "north star" in low and any(w in {"north", "stars"} for w in words):
            score += 8
        scored.append((score, path, _snippet(text, words)))
    scored.sort(key=lambda row: (-row[0], str(row[1])))
    hits = []
    seen_rel: set[str] = set()
    for score, path, snippet in scored:
        rel = path.name
        for root in used_roots:
            try:
                rel = str(path.relative_to(root))
                break
            except ValueError:
                continue
        if rel in seen_rel:
            continue
        seen_rel.add(rel)
        hits.append({"path": rel, "snippet": snippet, "score": score})
        if len(hits) >= MAX_CITES:
            break
    return _answer(hits)


def _search_roots(query: str, used_roots: list[Path]) -> dict:
    words = expand_tokens(query)
    if not words:
        return _answer([])
    files = candidate_files(used_roots)
    canon = [p for p in files if p.name in CANON_NAMES]
    rest = [p for p in files if p.name not in CANON_NAMES]
    first = _score_files(words, canon, used_roots)
    if not first.get("unknown"):
        return first
    return _score_files(words, rest, used_roots)


def search(query: str, roots: list[Path] | None = None) -> dict:
    words = expand_tokens(query)
    if not words:
        return _answer([])
    if roots is not None:
        return _search_roots(query, roots)
    repo = _search_roots(query, [REPO_OH] if REPO_OH.is_dir() else [])
    if not repo.get("unknown"):
        return repo
    live = [r for r in resolve_roots() if r != REPO_OH]
    if not live:
        return repo
    return _search_roots(query, live)
