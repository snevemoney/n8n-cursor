#!/usr/bin/env python3
"""Smallest vault Q&A: keyword over an allow-list. Never dump the vault.

Adopt existing path (live vault or repo hive). No second vault. No hive/desk.
No ChatGPT .data. Filter first — cite snippets — UNKNOWN on a miss.
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
LANES = ROOT / "scripts/hive/business-lanes.json"

ALLOW_REL = (
    "OPERATOR_MEMORY.md",
    "CONTENT/os/hot.md",
    "CONTENT/os/index.md",
    "CONTENT/os/ASKS.md",
    "CONTENT/os/HOST.md",
    "CONTENT/os/DESK-MISSIONS-NOW.md",
    "CONTENT/os/RECEIVE.md",
    "CONTENT/watch-later/OPERATOR_MEMORY.md",
    "CONTENT/knowledge/PRESCRIPTIVE-SIGNALS.md",
)
INBOX_REL = "CONTENT/os/inbox"
BLOCK_MARKS = (
    "/hive/desk/",
    "\\hive\\desk\\",
    ".data",
    "chatgpt",
    "/node_modules/",
    "/.git/",
)
# Mouth never reads these aloud. Pack / model brief still may cite them.
SPEAK_SKIP = ("watch-later", "asks.md", "/inbox/", "\\inbox\\")
LEAK_RE = re.compile(
    r"("
    r"adopted path missing|"
    r"\b\d{1,2}:\d{2}\s+[—\-–]|"
    r"agentic os|"
    r"youtuber said|"
    r"\[paste|"
    r"i heard you:|"
    r"before that you said:|"
    r"this document is the|"
    r"structured long-term memory|"
    r"watchdog\s+grade|"
    r"factory\s+close|"
    r"forge\s+typecheck|"
    r"overlay\s+`?said-|"
    r"origin/main|"
    r"publish\s+hitl|"
    r"\d{4}-\d{2}-\d{2}T\d{2}:|"
    r"on disk:"
    r")",
    re.I,
)
# speak_life built this and speak_store glued it onto every dark-cursor turn.
# Pack / model only. Mouth must never use it as the default spoken line.
LANES_DEFAULT = (
    "You are Evens Louis. On disk: Website / AI Partner services, "
    "Operator Amazon store, Hive / agent automation platform."
)
GREET_SPOKEN = "I'm here."
CAN_DO_SPOKEN = (
    "I read the vault, look at the Safari tab, brief a school skill, "
    "or report status. Hard steps stay with you."
)
STORE_SPOKEN = "I'm here. The store is on disk."
STOP = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "to",
    "in",
    "on",
    "for",
    "is",
    "are",
    "was",
    "be",
    "my",
    "me",
    "i",
    "you",
    "your",
    "our",
    "what",
    "whats",
    "who",
    "when",
    "why",
    "how",
    "does",
    "do",
    "did",
    "about",
    "tell",
    "please",
    "just",
    "from",
    "with",
    "that",
    "this",
    "have",
    "has",
    "say",
    "said",
    "ask",
    "asked",
}
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9'-]{2,}", re.I)
MAX_FILE = 400_000
MAX_CITES = 3
SNIP = 240


def _blocked(path: Path) -> bool:
    s = str(path).lower().replace("\\", "/")
    return any(mark in s for mark in BLOCK_MARKS)


def tokens(query: str) -> list[str]:
    out: list[str] = []
    for raw in TOKEN_RE.findall(query or ""):
        word = raw.lower().strip("'")
        if word in STOP or len(word) < 3:
            continue
        if word not in out:
            out.append(word)
    return out


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
    # Repo os inbox only — do not walk a dirty vault hive/desk tree.
    if "docs/hive/outer-heaven" not in str(root).replace("\\", "/"):
        return []
    files = [p for p in inbox.glob("*.md") if p.is_file() and not _blocked(p)]
    files.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
    return files[:5]


def candidate_files(roots: list[Path]) -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    for root in roots:
        for rel in ALLOW_REL:
            path = root / rel
            if path.is_file() and not _blocked(path):
                key = str(path)
                if key not in seen:
                    seen.add(key)
                    files.append(path)
        for path in _inbox_files(root):
            key = str(path)
            if key not in seen:
                seen.add(key)
                files.append(path)
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


def is_speak_leak(text: str) -> bool:
    """True when a snippet is pack / ASKS / video crumb, not a mouth line."""
    return bool(LEAK_RE.search(text or ""))


def _speakable_path(path: str) -> bool:
    s = (path or "").lower().replace("\\", "/")
    return not any(mark in s for mark in SPEAK_SKIP)


def model_brief(hits: list[dict]) -> str:
    """Short cite list for the model. Never hand this string to TTS."""
    lines: list[str] = []
    for hit in hits[:MAX_CITES]:
        if not isinstance(hit, dict):
            continue
        path = str(hit.get("path") or "").strip()
        snippet = str(hit.get("snippet") or "").strip()
        if path and snippet:
            lines.append(f"{path}: {snippet[:160]}")
    return "\n".join(lines)


def _answer(hits: list[dict]) -> dict:
    brief = model_brief(hits)
    if not hits:
        return {
            "ok": True,
            "hits": [],
            "unknown": True,
            "spoken": "I don't have that in the vault. UNKNOWN.",
            "brief": brief,
        }
    spoken_hit = None
    for hit in hits:
        path = str(hit.get("path") or "")
        snippet = str(hit.get("snippet") or "")
        if _speakable_path(path) and snippet and not is_speak_leak(snippet):
            spoken_hit = hit
            break
    if spoken_hit is None:
        return {
            "ok": True,
            "hits": hits,
            "unknown": True,
            "spoken": "I don't have a speakable vault line for that.",
            "brief": brief,
        }
    first = str(spoken_hit.get("snippet") or "")
    first = re.sub(r"#{1,6}\s*", "", first)
    first = re.sub(r"\s+", " ", first).strip()
    spoken = first if len(first) <= 180 else first[:177].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "hits": hits,
        "unknown": False,
        "spoken": spoken,
        "brief": brief,
    }


def _search_roots(query: str, used_roots: list[Path]) -> dict:
    words = tokens(query)
    if not words:
        return _answer([])
    files = candidate_files(used_roots)
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


def life_card(roots: list[Path] | None = None) -> dict:
    """Long-term facts from vault + lanes. Never invent age, people, or dollars."""
    lanes = load_json(LANES)
    operator = str(lanes.get("operator") or "Evens Louis").strip() or "Evens Louis"
    active = []
    for row in lanes.get("lanes") or []:
        if isinstance(row, dict) and str(row.get("status") or "") == "active":
            name = str(row.get("name") or row.get("id") or "").strip()
            if name:
                active.append(name)
    found = search("Evens Louis operator people family age birthday", roots)
    cites = found.get("hits") or []
    blob = " ".join(str(h.get("snippet") or "") for h in cites if isinstance(h, dict))
    age_known = bool(re.search(r"\b(\d{1,3})\s*(?:years old|yo)\b|\bborn\b|\bbirthday\b", blob, re.I))
    people_known = bool(re.search(r"\b(wife|son|daughter|partner|friend|mom|dad)\b", blob, re.I))
    bits = [f"You are {operator}."]
    if active:
        bits.append("Active businesses: " + ", ".join(active) + ".")
    else:
        bits.append("UNKNOWN. Business lanes file had no active lane.")
    if age_known:
        bits.append(blob[:180])
    else:
        bits.append("UNKNOWN. Age is not in the allow-listed vault files. I will not invent it.")
    if not people_known:
        bits.append("UNKNOWN. People notes are not in the allow-listed vault files.")
    spoken = " ".join(bits)
    if len(spoken) > 400:
        spoken = spoken[:397].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": not (active or age_known or people_known),
        "wire": "life",
        "operator": operator,
        "businesses": active,
        "cites": cites,
        "spoken": spoken,
    }


def news_signals(query: str, roots: list[Path] | None = None) -> dict:
    """News and signals from allow-listed disk only. Never invent headlines."""
    words = tokens(query)
    skip = {"news", "headlines", "signals", "latest", "today", "hive", "prescriptive"}
    extra = [w for w in words if w not in skip]
    look = " ".join(extra) if extra else "signals"
    found = search(look, roots)
    hits = found.get("hits") if isinstance(found.get("hits"), list) else []
    lanes = load_json(LANES)
    active: list[str] = []
    for row in lanes.get("lanes") or []:
        if isinstance(row, dict) and str(row.get("status") or "") == "active":
            name = str(row.get("name") or row.get("id") or "").strip()
            if name:
                active.append(name)
    bits = ["From disk only. I will not invent headlines."]
    if hits and not found.get("unknown"):
        bits.append(str(found.get("spoken") or "").strip())
    else:
        bits.append("UNKNOWN. No news or signals snippet on the allow-listed store.")
    if active:
        bits.append("Active lanes on disk: " + ", ".join(active[:4]) + ". Those are lanes, not headlines.")
    spoken = " ".join(b for b in bits if b)
    if len(spoken) > 420:
        spoken = spoken[:417].rsplit(" ", 1)[0] + "…"
    return {
        "ok": bool(hits) and not found.get("unknown"),
        "unknown": not hits or bool(found.get("unknown")),
        "wire": "news",
        "hits": hits,
        "lanes": active,
        "spoken": spoken,
    }


def search(query: str, roots: list[Path] | None = None) -> dict:
    words = tokens(query)
    if not words:
        return _answer([])
    if roots is not None:
        return _search_roots(query, roots)
    # Repo hot path first. Live vault only on a miss — Documents can stall.
    repo = _search_roots(query, [REPO_OH] if REPO_OH.is_dir() else [])
    if not repo.get("unknown"):
        return repo
    live = [r for r in resolve_roots() if r != REPO_OH]
    if not live:
        return repo
    return _search_roots(query, live)


def is_lanes_default(text: str) -> bool:
    """True when the mouth is about to repeat the business-lanes greeting."""
    body = (text or "").lower()
    if LANES_DEFAULT.lower() in body:
        return True
    return "on disk: website / ai partner" in body


def speak_life(roots: list[Path] | None = None) -> str:
    """Operator + active lanes. Pack / model only. Mouth uses speak_store."""
    life = life_card(roots)
    name = str(life.get("operator") or "Evens").strip() or "Evens"
    lanes = [str(x).strip() for x in (life.get("businesses") or []) if str(x).strip()]
    bits = [f"You are {name}."]
    if lanes:
        bits.append("On disk: " + ", ".join(lanes[:3]) + ".")
    return " ".join(bits)


def speak_hot(roots: list[Path] | None = None) -> str:
    """First clean dash line from hot.md. Skip factory / ASKS / leak crumbs."""
    used = roots if roots is not None else ([REPO_OH] if REPO_OH.is_dir() else [])
    for root in used:
        path = Path(root) / "CONTENT/os/hot.md"
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        for line in text.splitlines():
            raw = line.strip()
            if not raw.startswith("- "):
                continue
            body = raw[2:].strip()
            if is_speak_leak(body) or body.startswith("[!"):
                continue
            body = re.sub(r"`+", "", body)
            if len(body) > 140:
                body = body[:137].rsplit(" ", 1)[0] + "…"
            if is_speak_leak(body):
                continue
            return body
    return ""


def speak_store(
    utterance: str,
    roots: list[Path] | None = None,
    *,
    greet: bool = False,
    can_do: bool = False,
) -> str:
    """Short butler line. Life/lanes/hot stay off TTS. Search stays on `brief`."""
    _ = (utterance, roots)
    if greet:
        return GREET_SPOKEN
    if can_do:
        return CAN_DO_SPOKEN
    return STORE_SPOKEN
