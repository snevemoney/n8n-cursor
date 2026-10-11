#!/usr/bin/env python3
"""Query-driven vault Q&A. Live Obsidian is the durable read-memory.

Adopt the existing vault. No second vault. No vector DB. No hive/desk dump.
Filter first — cite snippets — UNKNOWN on a miss. Talking does not write notes.
"""
from __future__ import annotations

import json
import os
import re
import threading
import time
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
    "CONTENT/os/Operations Hub.md",
    "CONTENT/os/ASKS.md",
    "CONTENT/os/HOST.md",
    "CONTENT/os/DESK-MISSIONS-NOW.md",
    "CONTENT/os/RECEIVE.md",
    "CONTENT/watch-later/OPERATOR_MEMORY.md",
    "CONTENT/knowledge/PRESCRIPTIVE-SIGNALS.md",
)
APPROVED_PREFIXES = ("CONTENT/",)
ROOT_NOTES = (
    "OPERATOR_MEMORY.md",
    "VAULT_MAP.md",
    "CONTENT/VAULT_MAP.md",
    "NORTH_STAR.md",
    "OUTER_HEAVEN_GLOSSARY.md",
    "WEEKLY_SCOREBOARD.md",
    "CONTENT/LANE.md",
    "CONTENT/topics/live-facts-hive-os.md",
    "CONTENT/os/reports/mentor.md",
)
NAMED_NOTE_RELS = frozenset(ROOT_NOTES)
INBOX_REL = "CONTENT/os/inbox"
BLOCK_MARKS = (
    "/hive/desk/",
    "\\hive\\desk\\",
    ".data",
    "chatgpt",
    "/node_modules/",
    "/.git/",
    "/.obsidian/",
    "/secrets/",
    "/vendor/",
    "/cache/",
    "/__pycache__/",
    "/.trash/",
    "/.smart-env/",
    "/os/sessions/",
    "\\os\\sessions\\",
)
DENY_DIR = {
    ".obsidian",
    ".git",
    ".trash",
    ".smart-env",
    "node_modules",
    "__pycache__",
    "vendor",
    "cache",
    "secrets",
    "hive",
    "sessions",
}
RECENCY_RE = re.compile(
    r"\b(two weeks ago|2 weeks ago|latest|recent|yesterday|today|this week)\b",
    re.I,
)
SCAN_CAP = 800
BODY_SCAN_CAP = 160
BODY_READ_CAP = 80_000
_CANDIDATE_CACHE: dict[str, tuple[float, list[Path]]] = {}
_CANDIDATE_TTL = 2.0
# UF_DATALESS — macOS iCloud placeholder. Do not open; open hydrates and can stall.
UF_DATALESS = 0x00004000
READ_JOIN_S = 0.45
_SEARCH_CACHE: dict[str, tuple[float, tuple, dict]] = {}
_SEARCH_TTL = 12.0
CLOUD_PLACEHOLDER = "Live vault file is a cloud placeholder."
# Mouth never reads these aloud. Pack / model brief still may cite them.
SPEAK_SKIP = ("watch-later", "asks.md", "/inbox/", "\\inbox\\")
LEAK_RE = re.compile(
    r"("
    r"adopted path missing|"
    r"\b\d{1,2}:\d{2}\s+[—\-–]|"
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
    r"on disk:|"
    r"per-agent business cheat|"
    r"business cheat sheets|"
    r"cache ssot|"
    r"methods/|"
    r"grok shared workflow|"
    r"content/business-kits|"
    r"lessons\s*:|"
    r"##\s+when\b|"
    r"\*\*when\*\*|"
    r"watch later funnels|"
    r"catalog bump|"
    r"one-person-marketing|"
    r"`[a-z0-9-]{8,}`|"
    r"\[\[+|"
    r"\bno-skill\b|"
    r"\*\*source:\*\*|"
    r"\bdecisions:"
    r")",
    re.I,
)
# Banned mouth lines. Pack / model only. Never hand these to TTS.
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
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9'-]{2,}|\d{1,4}", re.I)
VAULT_SUMMARY_RE = re.compile(
    r"("
    r"\b(?:summar(?:y|ise|ize)|overview|what(?:'s| is) in|walk me through|map of)\b"
    r".{0,48}\b(?:vault|obsidian)\b"
    r"|"
    r"\b(?:vault|obsidian)\b.{0,48}\b(?:summar(?:y|ise|ize)|overview|as a whole|the whole)\b"
    r"|"
    r"\bevery (?:single )?(?:thing|node|nodes|memory|context).{0,60}\b(?:vault|obsidian)\b|"
    r"\b(?:vault|obsidian).{0,60}\bevery (?:single )?(?:thing|node|nodes|memory|context)\b|"
    r"\bthe whole vault\b"
    r")",
    re.I,
)
MAP_REL = (
    "CONTENT/VAULT_MAP.md",
    "VAULT_MAP.md",
)
MAP_SKIP_ROOMS = {
    "room",
    "what",
    "open first",
    "wiki",
    "01_strategic_intent",
    "patterns",
    "job-cards",
    "watch-later",
    "icp-runbooks",
}
ROOM_SAY = {
    "content": "knowledge",
    "methods": "methods",
    "projects": "projects",
    "themes": "themes",
    "chronicle": "the chronicle",
    "inbox": "inbox",
    "root notes": "root notes",
}
MAX_FILE = 400_000
MAX_CITES = 3
SNIP = 240


def _blocked(path: Path) -> bool:
    s = str(path).lower().replace("\\", "/")
    return any(mark in s for mark in BLOCK_MARKS)


def tokens(query: str) -> list[str]:
    out: list[str] = []
    for raw in TOKEN_RE.findall(query or ""):
        word = re.sub(r"'s$", "", raw.lower().strip("'"))
        if word in STOP or (len(word) < 3 and not word.isdigit()):
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


def configured_dir(raw) -> Path | None:
    """A written vault path only. Empty string must not become cwd."""
    text = str(raw or "").strip()
    if not text or text in {".", "./"}:
        return None
    path = Path(text).expanduser()
    if not path.is_dir():
        return None
    return path


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
    oh = configured_dir(vault.get("oh"))
    root = configured_dir(vault.get("path"))
    if oh is not None:
        add(oh)
    elif root is not None:
        add(root / "00_Outer_Heaven")
        add(root)
    else:
        env = (os.environ.get("HIVE_OBSIDIAN_VAULT") or "").strip()
        live = Path(env).expanduser() if env else DEFAULT_VAULT
        oh_live = live / "00_Outer_Heaven"
        add(oh_live)
        if not oh_live.is_dir():
            add(live)
    add(REPO_OH)
    return roots


def vault_oh_roots() -> list[Path]:
    """About-me corpus: live 00_Outer_Heaven only. No repo hive, no sessions."""
    roots: list[Path] = []
    seen: set[str] = set()

    def add(path: Path | None) -> None:
        if path is None:
            return
        raw = path.expanduser()
        if not raw.is_dir():
            return
        key = str(raw.resolve()) if raw.exists() else str(raw)
        if key in seen:
            return
        seen.add(key)
        roots.append(raw)

    stack = load_json(HIVE / "agent-stack.json")
    vault = stack.get("vault") if isinstance(stack.get("vault"), dict) else {}
    oh = configured_dir(vault.get("oh"))
    root = configured_dir(vault.get("path"))
    if oh is not None:
        add(oh)
        return roots
    if root is not None and (root / "00_Outer_Heaven").is_dir():
        add(root / "00_Outer_Heaven")
        return roots
    env = (os.environ.get("HIVE_OBSIDIAN_VAULT") or "").strip()
    live = Path(env).expanduser() if env else DEFAULT_VAULT
    add(live / "00_Outer_Heaven")
    return roots


def _inbox_files(root: Path) -> list[Path]:
    inbox = root / INBOX_REL
    if not inbox.is_dir():
        return []
    files = [p for p in inbox.glob("*.md") if p.is_file() and not _blocked(p) and not _denied_walk(p, root)]
    files.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
    return files[:5]


def _denied_walk(path: Path, root: Path) -> bool:
    try:
        rel = path.relative_to(root)
    except ValueError:
        rel = path
    for part in rel.parts[:-1]:
        if part in DENY_DIR:
            return True
        if part.startswith(".") and part not in {".", ".."}:
            return True
    return False


def _walk_approved_md(content: Path, root: Path) -> list[Path]:
    found: list[Path] = []
    try:
        walker = os.walk(content, followlinks=False)
    except OSError:
        return found
    for dirpath, dirnames, filenames in walker:
        dirnames[:] = [
            name
            for name in dirnames
            if name not in DENY_DIR and not (name.startswith(".") and name not in {".", ".."})
        ]
        here = Path(dirpath)
        if _denied_walk(here / "x.md", root) or _blocked(here):
            dirnames[:] = []
            continue
        for name in filenames:
            if not name.endswith(".md"):
                continue
            path = here / name
            if not path.is_file() or _denied_walk(path, root) or _blocked(path):
                continue
            found.append(path)
            if len(found) >= SCAN_CAP * 2:
                found.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
                return found[:SCAN_CAP]
    found.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
    return found[:SCAN_CAP]


def logical_rel(path: Path, roots: list[Path] | None = None) -> str:
    used = [Path(r) for r in (roots or []) if r]
    for root in used:
        try:
            return str(path.relative_to(root)).replace("\\", "/")
        except ValueError:
            continue
    text = str(path).replace("\\", "/")
    marker = "/CONTENT/"
    if marker in text:
        return "CONTENT/" + text.split(marker, 1)[1]
    return path.name


def classify_source(path: Path, repo_root: Path | None = None) -> str:
    repo = Path(repo_root or REPO_OH)
    try:
        resolved = str(path.resolve())
        repo_key = str(repo.resolve()) if repo.exists() else str(repo)
    except OSError:
        resolved = str(path)
        repo_key = str(repo)
    repo_key = repo_key.rstrip("/")
    if resolved == repo_key or resolved.startswith(repo_key + "/"):
        return "repo_mirror"
    return "live_vault"


def is_unavailable_placeholder(path: Path) -> bool:
    """True for an iCloud dataless file. Metadata only — do not open it."""
    try:
        st = path.stat()
    except OSError:
        return False
    flags = int(getattr(st, "st_flags", 0) or 0)
    if flags & UF_DATALESS:
        return True
    blocks = int(getattr(st, "st_blocks", 1) or 0)
    if st.st_size > 4096 and blocks == 0:
        return True
    return False


def _open_text(path: Path):
    return path.open("r", encoding="utf-8", errors="ignore")


def read_local_text(path: Path, cap: int) -> tuple[str | None, str | None]:
    """Bounded local read. Skip cloud placeholders instead of hydrating them."""
    if is_unavailable_placeholder(path):
        return None, "dataless"
    box: list = []

    def work() -> None:
        try:
            with _open_text(path) as fh:
                box.append(fh.read(max(0, int(cap))))
        except OSError as exc:
            box.append(exc)

    worker = threading.Thread(target=work, daemon=True, name="vault-read")
    worker.start()
    worker.join(READ_JOIN_S)
    if worker.is_alive():
        return None, "timeout"
    if not box:
        return None, "empty"
    got = box[0]
    if isinstance(got, BaseException):
        return None, "oserror"
    return str(got), None


def clear_search_cache() -> None:
    _SEARCH_CACHE.clear()


def _search_cache_key(query: str, roots: list[Path]) -> str:
    return query + "\0" + "|".join(str(Path(r)) for r in roots)


def _search_source_snapshot(roots: list[Path]) -> tuple:
    """Metadata-only identity for scanned files and possible live counterparts.

    Never open placeholders to validate a cache. Include absent counterparts so
    a newly materialized live note invalidates a previously cached mirror.
    """
    files = candidate_files(roots)
    paths = set(files)
    live_roots = [Path(root) for root in roots if classify_source(Path(root)) == "live_vault"]
    for path in files:
        if classify_source(path) == "live_vault":
            continue
        rel = logical_rel(path, roots)
        if rel not in ROOT_NOTES and rel not in ALLOW_REL and not rel.startswith("CONTENT/"):
            continue
        for root in live_roots:
            twin = root / rel
            try:
                resolved = twin.resolve()
                if resolved.is_relative_to(root.resolve()) and not _blocked(twin) and not _blocked(resolved) and not _denied_walk(twin, root):
                    paths.add(twin)
            except OSError:
                pass
    snapshot = []
    for path in sorted(paths, key=str):
        try:
            stat = path.stat()
            snapshot.append((str(path), str(path.resolve()), stat.st_dev, stat.st_ino,
                             stat.st_size, stat.st_mtime_ns, stat.st_ctime_ns,
                             stat.st_mode, getattr(stat, "st_flags", 0)))
        except OSError:
            snapshot.append((str(path), None))
    return tuple(snapshot)


def _file_score(path: Path, text: str, words: list[str], query: str) -> int:
    score = 0
    path_blob = f"{path.name} {logical_rel(path)}".lower()
    headings = re.findall(r"^#{1,6}\s+(.+)$", text, re.M)
    title_fm = re.search(r"(?im)^(?:title|name):\s*(.+)$", text)
    head_blob = " ".join(headings).lower()
    if title_fm:
        head_blob += " " + title_fm.group(1).lower()
    body = text.lower()
    for word in words:
        if _token_hit(word, path_blob):
            score += 8
        if _token_hit(word, head_blob):
            score += 5
        score += min(_token_count(word, body), 6)
    blob = f"{path_blob} {head_blob} {body}"
    nonces = re.findall(r"\b[a-z0-9]+(?:-[a-z0-9]+){2,}\b", (query or "").lower())
    if nonces and not any(nonce in blob for nonce in nonces):
        return 0
    distinctive = [w for w in words if len(w) >= 8 or any(ch.isdigit() for ch in w)]
    if distinctive:
        if not any(_token_hit(w, blob) for w in distinctive):
            return 0
    else:
        weak = {
            "hive",
            "code",
            "now",
            "note",
            "token",
            "live",
            "disk",
            "file",
            "just",
            "where",
            "does",
            "work",
            "hey",
            "they",
            "them",
        }
        rare = [w for w in words if w not in weak and len(w) >= 4]
        if rare and not any(w in blob for w in rare):
            return 0
        score += sum(2 for w in rare if w in blob)
    rel = logical_rel(path).replace("\\", "/")
    qlow = (query or "").lower()
    lane_ask = bool(
        re.search(
            r"research lane|acquire\s*/\s*grow\s*/\s*cut|\bacquire\b.+\bgrow\b.+\bcut\b",
            qlow,
        )
    )
    if lane_ask:
        if rel.replace("\\", "/").endswith("CONTENT/LANE.md") or path.name == "LANE.md":
            score += 80
        if path.name == "OPERATOR_MEMORY.md" or rel.replace("\\", "/").endswith("OPERATOR_MEMORY.md"):
            score -= 20
    if rel in NAMED_NOTE_RELS or path.name in {
        "OPERATOR_MEMORY.md",
        "NORTH_STAR.md",
        "OUTER_HEAVEN_GLOSSARY.md",
        "WEEKLY_SCOREBOARD.md",
        "VAULT_MAP.md",
    }:
        score += 28
    stem = re.sub(r"[-_]", " ", path.stem.lower())
    score += sum(16 for part in stem.split() if len(part) >= 4 and part in words)
    if path.stem.lower() in words:
        score += 40
    if RECENCY_RE.search(query or ""):
        try:
            age = time.time() - path.stat().st_mtime
        except OSError:
            age = 10**9
        if age < 14 * 86400:
            score += 12
        elif age < 30 * 86400:
            score += 6
    return score


def _dedupe_live_wins(hits: list[dict], roots: list[Path]) -> list[dict]:
    by_rel: dict[str, dict] = {}
    for hit in hits:
        path = Path(str(hit.get("abs") or hit.get("path") or ""))
        rel = str(hit.get("rel") or logical_rel(path, roots))
        source = str(hit.get("source") or classify_source(path))
        row = {**hit, "rel": rel, "source": source, "path": rel}
        prior = by_rel.get(rel)
        if prior is None:
            by_rel[rel] = row
            continue
        if source == "live_vault" and prior.get("source") != "live_vault":
            by_rel[rel] = row
            continue
        if prior.get("source") == "live_vault" and source != "live_vault":
            continue
        if int(row.get("score") or 0) > int(prior.get("score") or 0):
            by_rel[rel] = row
    return list(by_rel.values())


def candidate_files(roots: list[Path]) -> list[Path]:
    key = "|".join(str(Path(r)) for r in roots)
    now = time.time()
    hit = _CANDIDATE_CACHE.get(key)
    if hit and now - hit[0] < _CANDIDATE_TTL:
        return hit[1]
    files: list[Path] = []
    seen: set[str] = set()

    def add(path: Path, root: Path) -> None:
        if not path.is_file() or path.suffix != ".md":
            return
        if _blocked(path) or _denied_walk(path, root):
            return
        try:
            key = str(path.resolve())
        except OSError:
            key = str(path)
        if key in seen:
            return
        seen.add(key)
        files.append(path)

    for root in roots:
        root = Path(root)
        if not root.is_dir():
            continue
        for name in ROOT_NOTES:
            add(root / name, root)
        for rel in ALLOW_REL:
            add(root / rel, root)
        content = root / "CONTENT"
        if content.is_dir():
            for path in _walk_approved_md(content, root):
                add(path, root)
                if len(files) >= SCAN_CAP + len(ALLOW_REL):
                    break
        for path in _inbox_files(root):
            add(path, root)
    _CANDIDATE_CACHE[key] = (now, files)
    return files


def _window(text: str, idx: int) -> str:
    start = text.rfind("\n", 0, idx)
    start = 0 if start < 0 else start + 1
    end = text.find("\n", idx)
    if end < 0:
        end = min(len(text), start + SNIP + 80)
    line = text[start:end]
    if re.match(r"^#{1,6}\s+", line):
        cursor = end
        extra = ""
        while cursor < len(text) and not extra.strip():
            nxt = text.find("\n", cursor + 1)
            extra = text[cursor + 1 : nxt if nxt >= 0 else len(text)]
            cursor = nxt if nxt >= 0 else len(text)
            if nxt < 0:
                break
        line = line + " " + extra
    chunk = re.sub(r"\s+", " ", line).strip()
    chunk = re.sub(r"^#+\s*", "", chunk)
    return chunk[:SNIP]


def _token_hit(word: str, low: str) -> bool:
    """A short number is its own token. It must not match inside a year."""
    if not word:
        return False
    if word.isdigit():
        return re.search(rf"(?<!\d){re.escape(word)}(?!\d)", low or "") is not None
    return word in (low or "")


def _token_count(word: str, low: str) -> int:
    if not word:
        return 0
    if word.isdigit():
        return len(re.findall(rf"(?<!\d){re.escape(word)}(?!\d)", low or ""))
    return (low or "").count(word)


def _window_score(chunk: str, words: list[str]) -> int:
    low = (chunk or "").lower()
    if not chunk:
        return -1
    if re.match(r"^(title|skill|kind|lane|date|id|state)\s*:", chunk.strip(), re.I):
        return -1
    leaked = bool(LEAK_RE.search(chunk))
    distinctive_hit = any(
        (len(word) >= 8 or any(ch.isdigit() for ch in word)) and _token_hit(word, low) for word in words
    )
    if leaked and not distinctive_hit:
        return -1
    score = sum(1 for word in words if _token_hit(word, low))
    for word in words:
        if (len(word) >= 8 or any(ch.isdigit() for ch in word)) and _token_hit(word, low):
            score += 8
    if any(any(ch.isdigit() for ch in word) and _token_hit(word, low) for word in words):
        score += 16
    if "sitting" in words and re.search(r"\bsitting\s*:", low):
        score += 10
    if "evens louis" in low:
        score += 3
    if "hive-os" in low or "hive os" in low:
        score += 2
    if "operator" in low:
        score += 1
    if "evenslouis.ca" in low and "evens louis" not in low:
        score -= 2
    return score


def _snippet(text: str, words: list[str]) -> str:
    """Prefer a speakable name/role/lane window. Skip OPERATOR_MEMORY preamble."""
    distinctive = sorted(
        (w for w in words if len(w) >= 8 or any(ch.isdigit() for ch in w)),
        key=len,
        reverse=True,
    )
    low = text.lower()
    longest = distinctive[0] if distinctive else ""
    best = ""
    best_score = -1
    for word in distinctive or words:
        start_at = 0
        while start_at < len(low):
            idx = low.find(word, start_at)
            if idx < 0:
                break
            chunk = _window(text, idx)
            score = _window_score(chunk, words)
            if longest and _token_hit(longest, (chunk or "").lower()):
                score += 12
            if score > best_score:
                best = chunk
                best_score = score
            start_at = idx + 1
    if best_score >= 0:
        return best
    low = text.lower()
    start_from = 0
    first = ""
    best = ""
    best_score = -1
    while start_from < len(low):
        idx = -1
        for word in words:
            pos = low.find(word, start_from)
            if pos >= 0 and (idx < 0 or pos < idx):
                idx = pos
        if idx < 0:
            break
        chunk = _window(text, idx)
        if not first:
            first = chunk
        score = _window_score(chunk, words)
        if score > best_score:
            best = chunk
            best_score = score
        start_from = idx + 1
    if best_score >= 0:
        return best
    return first or (_window(text, 0) if text else "")


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


def _answer(hits: list[dict], unavailable: list[dict] | None = None) -> dict:
    skipped = [row for row in (unavailable or []) if isinstance(row, dict)]
    brief = model_brief(hits)
    if skipped:
        names = ", ".join(str(row.get("path") or "?") for row in skipped[:4])
        note = f"Unavailable (cloud placeholder): {names}."
        if any(row.get("used_mirror") for row in skipped):
            note += " Using the repo mirror."
        brief = f"{brief}\n{note}".strip() if brief else note
    source = str((hits[0] or {}).get("source") or "") if hits else ""
    if not hits:
        spoken = CLOUD_PLACEHOLDER if skipped else "I don't have that on disk."
        return {
            "ok": True,
            "hits": [],
            "unknown": True,
            "spoken": spoken,
            "brief": brief,
            "source": None,
            "unavailable": skipped,
        }
    spoken_hit = None
    for hit in hits:
        path = str(hit.get("path") or "")
        snippet = re.sub(r"`+", "", str(hit.get("snippet") or ""))
        if _speakable_path(path) and snippet and not is_speak_leak(snippet):
            spoken_hit = {**hit, "snippet": snippet}
            break
    if spoken_hit is None:
        spoken = CLOUD_PLACEHOLDER if skipped else "I don't have a speakable vault line for that."
        return {
            "ok": True,
            "hits": hits,
            "unknown": True,
            "spoken": spoken,
            "brief": brief,
            "source": source or None,
            "unavailable": skipped,
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
        "source": spoken_hit.get("source") or source or None,
        "unavailable": skipped,
    }


def _search_roots(query: str, used_roots: list[Path]) -> dict:
    words = tokens(query)
    if not words:
        return _answer([])
    files = candidate_files(used_roots)
    path_hits: list[Path] = []
    rest: list[Path] = []
    for path in files:
        blob = f"{path.name} {logical_rel(path, used_roots)}".lower()
        if any(word in blob for word in words):
            path_hits.append(path)
        else:
            rest.append(path)
    scan = path_hits + rest[: max(0, BODY_SCAN_CAP - len(path_hits))]
    live_by_rel = {logical_rel(path, used_roots): path for path in files if classify_source(path) == "live_vault"}
    for mirror in scan:
        if classify_source(mirror) == "live_vault":
            continue
        rel = logical_rel(mirror, used_roots)
        if rel not in ROOT_NOTES and rel not in ALLOW_REL and not rel.startswith("CONTENT/"):
            continue
        for live_root in used_roots:
            live_root = Path(live_root)
            if classify_source(live_root) != "live_vault":
                continue
            twin = live_root / rel
            try:
                resolved = twin.resolve()
                if not resolved.is_relative_to(live_root.resolve()):
                    continue
                if _blocked(twin) or _blocked(resolved) or _denied_walk(twin, live_root):
                    continue
                if twin.suffix == ".md" and twin.is_file():
                    live_by_rel.setdefault(rel, twin)
            except OSError:
                continue
    selected = set(scan)
    twins = [live_by_rel[logical_rel(path, used_roots)] for path in scan if classify_source(path) != "live_vault" and logical_rel(path, used_roots) in live_by_rel]
    scan = list(dict.fromkeys(scan + [path for path in twins if path not in selected]))
    scored: list[dict] = []
    unavailable: list[dict] = []
    readable_live_rels: set[str] = set()
    for path in scan:
        try:
            stat = path.stat()
            if stat.st_size > MAX_FILE:
                continue
        except OSError:
            continue
        rel = logical_rel(path, used_roots)
        name_hit = any(word in f"{path.name} {rel}".lower() for word in words)
        cap = MAX_FILE if name_hit or stat.st_size <= BODY_READ_CAP else BODY_READ_CAP
        text, skip = read_local_text(path, cap)
        if skip:
            unavailable.append(
                {
                    "path": rel,
                    "abs": str(path),
                    "reason": skip,
                    "source": classify_source(path),
                    "mtime": int(stat.st_mtime),
                }
            )
            continue
        if classify_source(path) == "live_vault":
            readable_live_rels.add(rel)
        if not text:
            continue
        score = _file_score(path, text, words, query)
        if score <= 0:
            continue
        scored.append(
            {
                "path": rel,
                "rel": rel,
                "abs": str(path),
                "snippet": _snippet(text, words),
                "score": score,
                "source": classify_source(path),
                "mtime": int(stat.st_mtime),
            }
        )
    scored = [row for row in scored if row["source"] == "live_vault" or row["rel"] not in readable_live_rels]
    hits = _dedupe_live_wins(scored, used_roots)
    hits.sort(
        key=lambda h: (int(h.get("score") or 0), 1 if h.get("source") == "live_vault" else 0),
        reverse=True,
    )
    hits = hits[:MAX_CITES]
    hit_rels = {str(h.get("rel") or h.get("path") or "") for h in hits}
    for row in unavailable:
        if row.get("source") == "live_vault" and str(row.get("path") or "") in hit_rels:
            row["used_mirror"] = True
    return _answer(hits, unavailable)


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
    used = [Path(r) for r in roots if r] if roots is not None else resolve_roots()
    if not words:
        return _answer([])
    key = _search_cache_key(query, used)
    now = time.time()
    snapshot = _search_source_snapshot(used)
    hit = _SEARCH_CACHE.get(key)
    if hit and now - hit[0] < _SEARCH_TTL and hit[1] == snapshot:
        return hit[2]
    found = _search_roots(query, used)
    # Misses and failed reads can recover without a metadata change. Do not
    # retain them as if they were stable source evidence.
    if not found.get("unknown") and not found.get("unavailable"):
        _SEARCH_CACHE[key] = (now, snapshot, found)
    else:
        _SEARCH_CACHE.pop(key, None)
    return found


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
    used = roots if roots is not None else (vault_oh_roots() or ([REPO_OH] if REPO_OH.is_dir() else []))
    for root in used:
        path = Path(root) / "CONTENT/os/hot.md"
        if not path.is_file():
            continue
        text, skip = read_local_text(path, BODY_READ_CAP)
        if skip or not text:
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


def wants_vault_summary(utterance: str) -> bool:
    """True when he asked for the map, not a dump and not the school shelf."""
    return bool(VAULT_SUMMARY_RE.search(utterance or ""))


def _map_rooms(text: str) -> list[str]:
    rooms: list[str] = []
    seen: set[str] = set()
    in_table = False
    for raw in (text or "").splitlines():
        line = raw.strip()
        if line.lower().startswith("## rooms"):
            in_table = True
            continue
        if in_table and line.startswith("## "):
            break
        if not in_table or not line.startswith("|"):
            continue
        cells = [c.strip().strip("`") for c in line.split("|") if c.strip()]
        if not cells:
            continue
        name = cells[0]
        if set(name) <= set("-: "):
            continue
        raw = name.lower().strip()
        if raw in {"content", "content/"}:
            key = "content"
        elif raw.startswith("content/"):
            key = raw[len("content/") :].strip("/")
        else:
            key = raw.strip("/")
        if not key or key in MAP_SKIP_ROOMS:
            continue
        spoken = ROOM_SAY.get(key, key.replace("-", " "))
        if not spoken or "/" in spoken or spoken in seen:
            continue
        seen.add(spoken)
        rooms.append(spoken)
        if len(rooms) >= 6:
            break
    return rooms


def speak_vault_summary(roots: list[Path] | None = None) -> str:
    """Two sentences from VAULT_MAP. Never the pile. Never a second wiki."""
    used = resolve_roots() if roots is None else [Path(p) for p in roots]
    body = ""
    present = False
    for root in used:
        root = Path(root)
        if root.is_dir():
            present = True
        for rel in MAP_REL:
            path = root / rel
            if not path.is_file():
                continue
            body, skip = read_local_text(path, BODY_READ_CAP)
            if skip or not body:
                continue
            if body.strip():
                break
        if body and body.strip():
            break
    if not body:
        return "" if roots is not None else "I don't have that on disk."
    rooms = _map_rooms(body)
    if rooms:
        listed = ", ".join(rooms[:-1]) + f", and {rooms[-1]}" if len(rooms) > 1 else rooms[0]
        return (
            f"The vault is Outer Heaven, the living room. On the map: {listed}. "
            "I will not read the pile. Name a room."
        )
    if body:
        return (
            "The vault is Outer Heaven on this Mac. I will not read it aloud. "
            "Name a room or a file."
        )
    return "I don't have that on disk."


def speak_store(
    utterance: str,
    roots: list[Path] | None = None,
    *,
    greet: bool = False,
    can_do: bool = False,
) -> str:
    """Not a mouth. Echo / lanes / wiki stay off TTS. The model speaks."""
    _ = (utterance, roots, greet, can_do)
    return ""
