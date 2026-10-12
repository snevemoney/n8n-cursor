"""Shared brain loader: the fleet's JARVIS_CONTEXT.md (and AGENT_RULES.md when it fits).

Source dir: JARVIS_SHARED_DIR, default ~/.grok-shared (a symlink to the canonical
outer-heaven CONTENT/os/shared). Opt out with JARVIS_SHARED_CONTEXT=0.
Cap with JARVIS_SHARED_CONTEXT_MAX_CHARS (default 14000) and per file with
JARVIS_SHARED_FILE_MAX_CHARS (default 9000). Read-only. Never raises.

Turn retrieval (retrieve_entries): keyword/heading match over MAC_SHARED_MEMORY.md,
SHARED_MEMORY.md, ACTIVE_TASKS.md and operator-preference files. Capped per file
(JARVIS_SHARED_SNIPPET_FILE_MAX_CHARS, 1200) and in total (JARVIS_SHARED_RETRIEVE_MAX_CHARS, 2400).
CURRENT_STATE.md, SECURITY_TODO.md and any secret/key-looking entry are never read.

Overlap with main: PR #606 (memory/store.py shared_context_block) loads the *public* repo copy
of os/shared (CURRENT_STATE head, OPERATOR_PROFILE, TOOLS_AND_REPOS, SKILLS_INDEX) into the
store pack, gated by the same JARVIS_SHARED_CONTEXT=0. Same flag, same meaning ("0" = off);
this module also accepts false/off/no. This module reads the *private* ~/.grok-shared and
retrieves only turn-relevant entries, so on merge both stay; see PROOF.md for the plan.
"""
from __future__ import annotations

import os
import re
import time
from pathlib import Path

PRIMARY = "JARVIS_CONTEXT.md"
OPTIONAL = ("AGENT_RULES.md",)
DEFAULT_MAX_CHARS = 14000
DEFAULT_FILE_MAX_CHARS = 9000
RETRIEVE_FILES = ("MAC_SHARED_MEMORY.md", "SHARED_MEMORY.md", "ACTIVE_TASKS.md")
PREFERENCE_RE = re.compile(r"(?:operator|preference|prefs)", re.I)
# Never read: leaked-key / backup-gap notes must never be spoken.
DENY_FILES = {"CURRENT_STATE.md", "SECURITY_TODO.md"}
DENY_NAME_RE = re.compile(r"secur|secret|credential|\bkeys?\b|token|password", re.I)
DENY_ENTRY_RE = re.compile(
    r"api[ _-]?key|secret|password|passphrase|token|credential|leak|sk-[a-z0-9]|bearer\s", re.I
)
STOP = set(
    "about above after again also and any are ask been before being but can could did does doing done "
    "each for from had has have having her here him his how into its just like make more most much must "
    "need now only other our out over own please same should some such than that the their them then "
    "there these they this those through too under until very was were what when where which while who "
    "why will with would you your jarvis tell know want right using used thing things file files rule "
    "rules said says".split()
)
_CACHE: dict = {}
_CACHE_SEC = 30.0


def shared_dir() -> Path:
    raw = (os.environ.get("JARVIS_SHARED_DIR") or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / ".grok-shared"


def enabled() -> bool:
    return (os.environ.get("JARVIS_SHARED_CONTEXT") or "1").strip().lower() not in {"0", "false", "off", "no"}


def max_chars() -> int:
    try:
        return max(0, int(os.environ.get("JARVIS_SHARED_CONTEXT_MAX_CHARS") or DEFAULT_MAX_CHARS))
    except ValueError:
        return DEFAULT_MAX_CHARS


def _int_env(name: str, default: int) -> int:
    try:
        return max(0, int(os.environ.get(name) or default))
    except ValueError:
        return default


def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore").strip()
    except OSError:
        return ""


def load_shared_context(*, use_cache: bool = True) -> dict:
    """{"text", "files": [names], "dir", "chars", "truncated"}. Empty text when off or missing."""
    empty = {"text": "", "files": [], "dir": "", "chars": 0, "truncated": False}
    if not enabled():
        return {**empty, "disabled": True}
    root = shared_dir()
    cap = max_chars()
    key = (str(root), cap)
    now = time.monotonic()
    hit = _CACHE.get(key)
    if use_cache and hit and now - hit[0] < _CACHE_SEC:
        return dict(hit[1])
    out = dict(empty, dir=str(root))
    file_cap = _int_env("JARVIS_SHARED_FILE_MAX_CHARS", DEFAULT_FILE_MAX_CHARS)
    body = _read(root / PRIMARY)[:file_cap] if file_cap else ""
    if body and cap:
        blocks: list[str] = []
        head = f"[shared:{PRIMARY}]\n"
        room = cap - len(head)
        if len(body) > room:
            body = body[: max(0, room - 14)].rstrip() + "\n[truncated]"
            out["truncated"] = True
        blocks.append(head + body)
        out["files"].append(PRIMARY)
        used = len(blocks[0])
        for name in OPTIONAL:
            extra = _read(root / name)
            if len(extra) > file_cap:
                extra = extra[: max(0, file_cap - 12)].rstrip() + "\n[truncated]"
            block = f"[shared:{name}]\n{extra}"
            if extra and used + 2 + len(block) <= cap:
                blocks.append(block)
                out["files"].append(name)
                used += 2 + len(block)
        out["text"] = "\n\n".join(blocks)
        out["chars"] = len(out["text"])
    _CACHE[key] = (now, dict(out, files=list(out["files"])))
    return out


def _terms(text: str) -> set[str]:
    words = re.findall(r"[a-z0-9][a-z0-9_-]{3,}", (text or "").lower())
    return {w for w in words if w not in STOP}


def retrieval_files(root: Path) -> list[Path]:
    names = list(RETRIEVE_FILES)
    try:
        for p in sorted(root.glob("*.md")):
            if PREFERENCE_RE.search(p.stem) and p.name not in names:
                names.append(p.name)
    except OSError:
        pass
    out = []
    for name in names:
        if name in DENY_FILES or DENY_NAME_RE.search(name):
            continue
        path = root / name
        if path.is_file():
            out.append(path)
    return out


def split_entries(text: str) -> list[tuple[str, str]]:
    """(heading, entry) for each top-level bullet or table row, under its nearest heading."""
    heading = ""
    rows: list[tuple[str, str]] = []
    cur: list[str] = []

    def flush():
        if cur:
            rows.append((heading, "\n".join(cur).strip()))
            cur.clear()

    for line in (text or "").splitlines():
        if re.match(r"^#{1,6}\s", line):
            flush()
            heading = re.sub(r"^#+\s*", "", line).strip()
        elif re.match(r"^[-*]\s|^\d+\.\s", line):
            flush()
            cur.append(line)
        elif line.startswith("|") and not re.match(r"^\|[\s|:-]+\|?$", line):
            flush()
            cur.append(line)
            flush()
        elif cur and line.strip():
            cur.append(line)
        else:
            flush()
    flush()
    return [(h, e) for h, e in rows if e]


def _entry_label(heading: str, entry: str) -> str:
    bold = re.search(r"\*\*([^*]{3,80})\*\*", entry)
    head = (heading.split("—")[0].strip() or "top")[:60]
    return f"{head} > {bold.group(1).strip()[:60]}" if bold else head


def retrieve_entries(query: str, *, root: Path | None = None) -> list[dict]:
    """Turn-relevant entries: [{file, heading, text, score}]. Empty when off or no match."""
    if not enabled():
        return []
    q = _terms(query)
    if not q:
        return []
    base = root or shared_dir()
    per_file = _int_env("JARVIS_SHARED_SNIPPET_FILE_MAX_CHARS", 1200)
    total = _int_env("JARVIS_SHARED_RETRIEVE_MAX_CHARS", 2400)
    scored = []
    for path in retrieval_files(base):
        for heading, entry in split_entries(_read(path)):
            if DENY_ENTRY_RE.search(entry):
                continue
            hits = q & _terms(entry + " " + heading)
            if not hits:
                continue
            score = len(hits) + (1 if q & _terms(heading) else 0)
            scored.append((score, path.name, heading, entry))
    floor = 2 if len(q) >= 3 else 1
    scored = [r for r in scored if r[0] >= floor]
    scored.sort(key=lambda r: -r[0])
    out: list[dict] = []
    used_total = 0
    used_file: dict[str, int] = {}
    for score, name, heading, entry in scored:
        if len(out) >= 6:
            break
        if used_file.get(name, 0) + len(entry) > per_file or used_total + len(entry) > total:
            continue
        used_file[name] = used_file.get(name, 0) + len(entry)
        used_total += len(entry)
        out.append({"file": name, "heading": _entry_label(heading, entry), "text": entry, "score": score})
    return out


def retrieved_block(query: str) -> tuple[str, list[dict]]:
    rows = retrieve_entries(query)
    if not rows:
        return "", []
    text = "Shared memory entries relevant to this ask (cite file and heading when used):\n" + "\n".join(
        f"[{r['file']} :: {r['heading']}]\n{r['text']}" for r in rows
    )
    return text, [{"file": r["file"], "heading": r["heading"]} for r in rows]


def shared_system_block(*, use_cache: bool = True) -> tuple[str, list[str]]:
    got = load_shared_context(use_cache=use_cache)
    if not got.get("text"):
        return "", []
    files = list(got["files"])
    text = (
        "Shared fleet context (read from disk this turn; cite the file name when you use it: "
        + ", ".join(files)
        + "):\n"
        + got["text"]
    )
    return text, files


def model_self_report(model: str, primary: str = "", provider: str = "OpenRouter") -> str:
    """One honest line: the model id actually answering this request."""
    mid = (model or "").strip()
    if not mid:
        return ""
    line = (
        f"Runtime fact: this reply is generated by the model `{mid}` via {provider}. "
        "If asked what model you are or run on, name exactly that id. "
        "Do not claim to be Claude, GPT, Gemini or any other model."
    )
    first = (primary or "").strip()
    if first and first != mid:
        line += f" The configured primary `{first}` did not answer; `{mid}` is the fallback that fired."
    return line
