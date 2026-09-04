#!/usr/bin/env python3
"""Bounded local file search on this Mac. Never dump hive/desk.

Roots: live vault, Documents, this repo. Spotlight (mdfind) when live.
Cite path + a short snippet. Do not invent files.
"""
from __future__ import annotations

import os
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_VAULT = Path.home() / "Documents/My_Billion_Dollar_Vault"
DOCUMENTS = Path.home() / "Documents"
BLOCK_MARKS = (
    "/hive/desk/",
    "\\hive\\desk\\",
    "/.git/",
    "/node_modules/",
    "/.data/",
    "/chatgpt",
    "/.venv",
    "/.kokoro/",
)
QUERY_STRIP = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?"
    r"(?:search|find|look(?:\s+for)?)\s+"
    r"(?:(?:on|in|through)\s+)?"
    r"(?:my\s+)?(?:computer|mac|files?|disk|documents?|vault)?\s*"
    r"(?:for\s+)?",
    re.I,
)
MAX_HITS = 6
SNIP = 160


def _blocked(path: Path) -> bool:
    s = str(path).lower().replace("\\", "/")
    return any(mark in s for mark in BLOCK_MARKS)


def search_roots() -> list[Path]:
    roots: list[Path] = []
    seen: set[str] = set()

    def add(path: Path) -> None:
        raw = path.expanduser()
        if not raw.is_dir():
            return
        key = str(raw)
        if key in seen:
            return
        seen.add(key)
        roots.append(raw)

    add(DEFAULT_VAULT)
    add(DOCUMENTS)
    add(ROOT)
    return roots


def _run(argv: list[str], timeout: float = 8.0) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, capture_output=True, text=True, timeout=timeout)


def clean_query(utterance: str) -> str:
    text = (utterance or "").strip()
    text = QUERY_STRIP.sub("", text).strip(" .?!")
    return text[:120]


def _snippet(path: Path) -> str:
    try:
        if path.stat().st_size > 400_000:
            return ""
        if path.suffix.lower() not in {".md", ".txt", ".json", ".py", ".ts", ".tsx", ".html", ".csv"}:
            return ""
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""
    chunk = re.sub(r"\s+", " ", text).strip()
    return chunk[:SNIP]


def _mdfind(query: str, root: Path) -> list[Path]:
    try:
        proc = _run(["mdfind", "-onlyin", str(root), query], timeout=8.0)
    except (OSError, subprocess.TimeoutExpired):
        return []
    if proc.returncode != 0:
        return []
    out: list[Path] = []
    for line in (proc.stdout or "").splitlines():
        path = Path(line.strip())
        if path.is_file() and not _blocked(path):
            out.append(path)
        if len(out) >= MAX_HITS:
            break
    return out


def _walk_fallback(query: str, root: Path) -> list[Path]:
    words = [w.lower() for w in re.findall(r"[a-z0-9][a-z0-9'-]{2,}", query, re.I)][:4]
    if not words:
        return []
    hits: list[Path] = []
    try:
        for dirpath, dirnames, filenames in os.walk(root):
            low_dir = dirpath.lower().replace("\\", "/")
            if any(mark.strip("/") in low_dir for mark in ("hive/desk", ".git", "node_modules", ".venv")):
                dirnames[:] = []
                continue
            for name in filenames:
                path = Path(dirpath) / name
                if _blocked(path):
                    continue
                blob = name.lower()
                if all(w in blob for w in words) or any(w in blob for w in words):
                    hits.append(path)
                if len(hits) >= MAX_HITS:
                    return hits
    except OSError:
        return hits
    return hits


def search_files(utterance: str, *, roots: list[Path] | None = None) -> dict:
    """Search local files. Never invent a path. Never walk hive/desk."""
    if os.environ.get("AGENT_STACK_FILES_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "files",
            "hits": [],
            "spoken": "UNKNOWN. Local file search is dry. I will not invent files.",
        }
    query = clean_query(utterance)
    if len(query) < 2:
        return {
            "ok": False,
            "unknown": True,
            "wire": "files",
            "hits": [],
            "spoken": "UNKNOWN. Say what to search for on this Mac.",
        }
    used = roots if roots is not None else search_roots()
    found: list[Path] = []
    seen: set[str] = set()
    for root in used:
        rows = _mdfind(query, root) if roots is None else _walk_fallback(query, root)
        for path in rows:
            key = str(path)
            if key in seen or _blocked(path):
                continue
            seen.add(key)
            found.append(path)
            if len(found) >= MAX_HITS:
                break
        if len(found) >= MAX_HITS:
            break
    if not found:
        return {
            "ok": False,
            "unknown": True,
            "wire": "files",
            "hits": [],
            "query": query,
            "spoken": f"UNKNOWN. No local file matched {query!r}. I will not invent a path. Hive/desk stays closed.",
        }
    cites = []
    bits = []
    for path in found:
        rel = str(path)
        snippet = _snippet(path)
        cites.append({"path": rel, "snippet": snippet})
        bits.append(path.name)
    spoken = f"Found {len(found)} local file{'s' if len(found) != 1 else ''}: " + ", ".join(bits) + "."
    if cites[0].get("snippet"):
        spoken += f" First snippet from {Path(cites[0]['path']).name}: {cites[0]['snippet'][:120]}"
    if len(spoken) > 360:
        spoken = spoken[:357].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "wire": "files",
        "hits": cites,
        "query": query,
        "spoken": spoken,
    }
