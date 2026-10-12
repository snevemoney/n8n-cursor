"""Shared brain loader: the fleet's JARVIS_CONTEXT.md (and AGENT_RULES.md when it fits).

Source dir: JARVIS_SHARED_DIR, default ~/.grok-shared (a symlink to the canonical
outer-heaven CONTENT/os/shared). Opt out with JARVIS_SHARED_CONTEXT=0.
Cap with JARVIS_SHARED_CONTEXT_MAX_CHARS (default 14000) and per file with
JARVIS_SHARED_FILE_MAX_CHARS (default 9000). Read-only. Never raises.

Turn retrieval (retrieve_entries): keyword/heading match over MAC_SHARED_MEMORY.md,
SHARED_MEMORY.md, ACTIVE_TASKS.md and operator-preference files. Capped per file
(JARVIS_SHARED_SNIPPET_FILE_MAX_CHARS, 1200) and in total (JARVIS_SHARED_RETRIEVE_MAX_CHARS, 2400).
CURRENT_STATE.md, SECURITY_TODO.md and any secret/key-looking entry are never read.

One loader: memory/store.py (ex-PR #606 shared_context_block and #599 fleet_context_block)
delegates here. pack_block() serves the store pack (OPERATOR_PROFILE, TOOLS_AND_REPOS, SKILLS_INDEX;
CURRENT_STATE.md is no longer read); fleet_context_block() is skipped when the system prompt already
carries the private JARVIS_CONTEXT.md. JARVIS_SHARED_CONTEXT=0 turns all of it off.
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


def stale_hours() -> float:
    try:
        return max(0.0, float(os.environ.get("JARVIS_SHARED_STALE_HOURS") or 24))
    except ValueError:
        return 24.0


# Durable rule/profile/index files change rarely; live-state files (ACTIVE_TASKS, FLEET_STATUS) go stale fast.
DURABLE_FILES = frozenset({
    "AGENT_RULES.md", "JARVIS_CONTEXT.md", "SHARED_MEMORY.md", "MAC_SHARED_MEMORY.md",
    "OPERATOR_PROFILE.md", "TOOLS_AND_REPOS.md", "SKILLS_INDEX.md", "LEARNINGS.md",
})


def stale_after(name: str) -> float:
    """Hours before a file counts as stale: JARVIS_DURABLE_STALE_HOURS (168) for durable files."""
    if name in DURABLE_FILES:
        try:
            return max(0.0, float(os.environ.get("JARVIS_DURABLE_STALE_HOURS") or 168))
        except ValueError:
            return 168.0
    return stale_hours()


HEADER_DATE_RE = re.compile(r"\b(20\d\d-\d\d-\d\d)\b(?:[^\n]{0,30}?\b(\d\d:\d\d)\b)?")


def private_dir() -> Path:
    """Private shared files live outside every repo (default ~/.grok-private)."""
    return Path(os.environ.get("JARVIS_PRIVATE_DIR") or (Path.home() / ".grok-private")).expanduser()


def resolve(root: Path, name: str) -> Path:
    """root/name, else the private dir copy. Symlinks from the public dir resolve either way."""
    path = root / name
    if path.is_file():
        return path
    alt = private_dir() / name
    return alt if alt.is_file() else path


def content_time(path: Path) -> tuple[float, str, float]:
    """(content_ts, label, copy_mtime). The header date is the content date; a sync only moves mtime.

    A header time may sit a few words after the date ("2026-10-10 rev 2 (22:30 ET)").
    A date with no time is labelled day-only and aged from the end of that day, never midnight,
    so a file is not reported older than it can be.
    """
    try:
        mtime = path.stat().st_mtime
    except OSError:
        return 0.0, "date unknown", 0.0
    try:
        with path.open("r", encoding="utf-8", errors="ignore") as fh:
            head = fh.read(300)
    except OSError:
        head = ""
    found = HEADER_DATE_RE.search(head)
    if found:
        try:
            if found.group(2):
                ts = time.mktime(time.strptime(found.group(1) + " " + found.group(2), "%Y-%m-%d %H:%M"))
                label = time.strftime("%Y-%m-%d %H:%M", time.localtime(ts))
            else:
                ts = time.mktime(time.strptime(found.group(1) + " 23:59", "%Y-%m-%d %H:%M"))
                label = found.group(1) + " (day only)"
            if ts <= mtime + 60:
                return ts, label, mtime
        except ValueError:
            pass
    return mtime, time.strftime("%Y-%m-%d %H:%M", time.localtime(mtime)), mtime


def stamp(path: Path, now: float | None = None) -> str:
    """'as of <content date> local, N h old[, copy synced <mtime>][; STALE ...]' (F07)."""
    ts, label, mtime = content_time(path)
    if not ts:
        return "date unknown"
    now = time.time() if now is None else now
    age_h = max(0.0, (now - ts) / 3600.0)
    age = f"{age_h:.0f} h old" if age_h < 48 else f"{age_h / 24:.1f} days old"
    line = f"as of {label} local, {age}"
    if mtime - ts > 3600:
        line += f", copy synced {time.strftime('%Y-%m-%d %H:%M', time.localtime(mtime))}"
    if age_h > stale_after(path.name):
        line += "; STALE: dated notes, not live state; say the date and verify before calling anything current"
    return line


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
        head = f"[shared:{PRIMARY} | {stamp(root / PRIMARY)}]\n"
        room = cap - len(head)
        if room < 40:
            body = ""
        elif len(body) > room:
            body = body[: max(0, room - 14)].rstrip() + "\n[truncated]"
            out["truncated"] = True
    if body and cap:
        blocks.append(head + body)
        out["files"].append(PRIMARY)
        used = len(blocks[0])
        for name in OPTIONAL:
            extra = _read(root / name)
            if len(extra) > file_cap:
                extra = extra[: max(0, file_cap - 12)].rstrip() + "\n[truncated]"
            block = f"[shared:{name} | {stamp(root / name)}]\n{extra}"
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
        path = resolve(root, name)
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


IDENTITY_RE = re.compile(
    r"\b(what|which)\s+(ai\s+)?(model|llm|engine)\b|\bwho\s+are\s+you\b|\bwhat\s+are\s+you\b|\bare\s+you\s+(claude|gpt|grok|gemini|deepseek)\b",
    re.I,
)


def min_ratio() -> float:
    try:
        return max(0.0, min(1.0, float(os.environ.get("JARVIS_SHARED_RETRIEVE_MIN_RATIO") or 0.5)))
    except ValueError:
        return 0.5


def retrieve_entries(query: str, *, root: Path | None = None) -> list[dict]:
    """Turn-relevant entries: [{file, heading, text, score}]. Empty when off or no match.

    Identity asks ("what model are you") are answered by the self-report line,
    so they retrieve nothing. Otherwise an entry must cover at least
    min_ratio() of the ask's content words, so one shared word is not enough.
    """
    if not enabled() or IDENTITY_RE.search(query or ""):
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
            scored.append((score, path.name, heading, entry, stamp(path)))
    floor = 2 if len(q) >= 3 else 1
    need = min_ratio() * len(q)
    scored = [r for r in scored if r[0] >= floor and r[0] >= need]
    scored.sort(key=lambda r: -r[0])
    out: list[dict] = []
    used_total = 0
    used_file: dict[str, int] = {}
    for score, name, heading, entry, when in scored:
        if len(out) >= 6:
            break
        if used_file.get(name, 0) + len(entry) > per_file or used_total + len(entry) > total:
            continue
        used_file[name] = used_file.get(name, 0) + len(entry)
        used_total += len(entry)
        out.append({"file": name, "heading": _entry_label(heading, entry), "text": entry, "score": score, "as_of": when})
    return out


def answerable_from_shared(query: str, *, root: Path | None = None) -> bool:
    """True when shared memory, or the always-loaded JARVIS_CONTEXT/AGENT_RULES, covers the ask.

    Used to answer without hands; it adds nothing to the prompt (the base files are already in it).
    """
    if not enabled():
        return False
    if IDENTITY_RE.search(query or "") or retrieve_entries(query, root=root):
        return True
    q = _terms(query)
    if len(q) < 2:
        return False
    base = root or shared_dir()
    need = max(2, min_ratio() * len(q))
    for name in (PRIMARY, *OPTIONAL):
        for heading, entry in split_entries(_read(resolve(base, name))):
            if len(q & _terms(entry + " " + heading)) >= need:
                return True
    return False


def retrieved_block(query: str) -> tuple[str, list[dict]]:
    rows = retrieve_entries(query)
    if not rows:
        return "", []
    text = "Shared memory entries relevant to this ask (cite file and heading when used):\n" + "\n".join(
        f"[{r['file']} :: {r['heading']} | {r['as_of']}]\n{r['text']}" for r in rows
    ) + "\nIf these entries answer the ask, answer from them directly in at most three short sentences; do not call a tool to look it up again."
    return text, [{"file": r["file"], "heading": r["heading"]} for r in rows]


AGE_CLAIM_RE = re.compile(
    r"(?P<file>\b[A-Z][A-Z0-9_]*(?:\.grok-shared)?\.md\b)(?P<mid>[^\n]{0,80}?)\b(?P<num>\d+(?:\.\d+)?)\s*(?P<unit>hours?|hrs?|h|days?)\s+old\b",
)


def correct_ages(text: str, *, root: Path | None = None, now: float | None = None) -> str:
    """Rewrite '<FILE>.md ... N hours old' to the age computed now from the file's content date.

    The model copies ages out of earlier replies in the chat history (live: '47 hours old' long
    after the fix). Only the age number changes, and only for a shared file that exists.
    """
    if not text or "old" not in text:
        return text
    base = root or shared_dir()
    now = time.time() if now is None else now

    def fix(m: re.Match) -> str:
        path = resolve(base, m.group("file"))
        ts, _label, _mtime = content_time(path) if path.is_file() else (0.0, "", 0.0)
        if not ts:
            return m.group(0)
        age_h = max(0.0, (now - ts) / 3600.0)
        age = f"{age_h:.0f} hours" if age_h < 48 else f"{age_h / 24:.1f} days"
        return f"{m.group('file')}{m.group('mid')}{age} old"

    return AGE_CLAIM_RE.sub(fix, text)


def shared_system_block(*, use_cache: bool = True) -> tuple[str, list[str]]:
    got = load_shared_context(use_cache=use_cache)
    if not got.get("text"):
        return "", []
    files = list(got["files"])
    text = (
        "Shared fleet context (read from disk this turn; cite the file name when you use it: "
        + ", ".join(files)
        + "). Each [shared:...] header carries the content date and an age computed now; "
        "if you mention a file's age, quote that header, never an age from an earlier reply:\n"
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


# --- The one shared-context loader (also serves memory/store.py, ex-PR #606 / #599) ---
# (file, line cap, mode). CURRENT_STATE.md is deliberately absent: it carries key/backup notes.
PACK_FILES = (
    ("OPERATOR_PROFILE.md", 45, "head"),
    ("TOOLS_AND_REPOS.md", 30, "head"),
    ("SKILLS_INDEX.md", 1, "names"),
)
PACK_NAMES_CHARS = 1500


def _clean_lines(text: str) -> list[str]:
    return [ln for ln in text.splitlines() if ln.strip() and not ln.lstrip().startswith("<!--")]


def pack_block(base: Path, files=PACK_FILES) -> str:
    """ONE-BRAIN files for the store pack: denylisted, line- and char-capped, date-stamped."""
    if not enabled():
        return ""
    file_cap = _int_env("JARVIS_SHARED_FILE_MAX_CHARS", DEFAULT_FILE_MAX_CHARS)
    out: list[str] = []
    for name, cap, mode in files:
        if name in DENY_FILES or DENY_NAME_RE.search(name):
            continue
        target = Path(base) / name
        if not target.is_file():
            continue
        text = _read(target)
        if mode == "names":
            names = [ln.split("`")[1] for ln in text.splitlines() if ln.startswith("| `") and ln.count("`") >= 2]
            if not names:
                continue
            joined = ", ".join(names)
            if len(joined) > PACK_NAMES_CHARS:
                joined = joined[:PACK_NAMES_CHARS].rsplit(", ", 1)[0] + ", …"
            body = f"{len(names)} skills: {joined}"
        else:
            body = "\n".join(_clean_lines(text)[:cap])
        body = body[:file_cap]
        if body:
            out.append(f"[{name} | {stamp(target)}]\n{body}")
    if not out:
        return ""
    return "Shared brain (read-only):\n" + "\n\n".join(out)


def system_owns_fleet_context() -> bool:
    """True when the system prompt already carries the private JARVIS_CONTEXT.md (no double load)."""
    return enabled() and (shared_dir() / PRIMARY).is_file()


# --- R15 drift check: which expected shared files are missing or stale (names + dates only) ---
EXPECTED_FILES = (
    "JARVIS_CONTEXT.md", "AGENT_RULES.md", "ACTIVE_TASKS.md", "MAC_SHARED_MEMORY.md",
    "SHARED_MEMORY.md", "OPERATOR_PROFILE.md", "TOOLS_AND_REPOS.md", "SKILLS_INDEX.md",
)


def drift_report(root: Path | None = None, now: float | None = None) -> dict:
    base = Path(root) if root else shared_dir()
    now = time.time() if now is None else now
    rows, missing, stale = [], [], []
    for name in EXPECTED_FILES:
        path = resolve(base, name)
        if not path.is_file():
            missing.append(name)
            continue
        ts, label, _mtime = content_time(path)
        age_h = (now - ts) / 3600.0
        rows.append({"file": name, "age_hours": round(age_h, 1), "as_of": label})
        if age_h > stale_after(name):
            stale.append(name)
    return {"dir": str(base), "present": rows, "missing": missing, "stale": stale,
            "ok": not missing and not stale}


if __name__ == "__main__":
    import json
    import sys

    if "--drift" in sys.argv:
        print(json.dumps(drift_report(), indent=2))
