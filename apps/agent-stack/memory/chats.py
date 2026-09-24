#!/usr/bin/env python3
"""Jarvis session archive + title search. Not a vault dump. Not a Face cron."""
from __future__ import annotations

import importlib.util
import json
import os
import re
from datetime import date, datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
REPO_OH = ROOT / "docs/hive/outer-heaven"
DEFAULT_VAULT_OH = Path.home() / "Documents/My_Billion_Dollar_Vault/00_Outer_Heaven"
CACHE_OH = Path.home() / ".grokbot/outer-heaven"
SESSIONS_REL = Path("CONTENT/os/sessions")
SURFACES = (
    "jarvis",
    "cursor",
    "grok",
    "claude",
    "claude-code",
    "claude-web",
    "chatgpt",
    "codex",
)
RECALL_RE = re.compile(
    r"("
    r"\bwhat did we (?:say|talk|decide|do)\b|"
    r"\b(?:in|from) (?:the )?(?:claude|cursor|chatgpt|grok|groq|codex|jarvis|obsidian)\b|"
    r"\b(?:chats?|sittings?|sessions?)\b.{0,80}\b(?:claude|cursor|chatgpt|grok|groq|codex|jarvis)\b|"
    r"\b(?:last sitting|that sitting|that chat|this chat)\b|"
    r"\bremember when\b"
    r")",
    re.I,
)
ALL_SESSIONS_RE = re.compile(
    r"("
    r"\b(?:all|every)\b.{0,48}\b(?:chats?|sessions?|sittings?|platforms?|surfaces?)\b|"
    r"\b(?:chats?|sessions?)\b.{0,48}\b(?:all|every|platforms?|surfaces?)\b|"
    r"\blook at\b.{0,80}\b(?:last |latest )?(?:chat )?sessions?\b.{0,48}\b(?:all|every|platforms?|surfaces?)\b|"
    r"\blast\b.{0,40}\b(?:chat )?sessions?\b.{0,48}\b(?:all|every)\b.{0,24}\b(?:platforms?|surfaces?)\b|"
    r"\bcan you see (?:the |my |our )?(?:chats?|sessions?|sittings?)\b|"
    r"\bsee (?:the |my |our )?(?:chats?|sessions?)\b.{0,80}\b(?:claude|cursor|chatgpt|grok|groq|codex|obsidian)\b|"
    r"\bthis (?:chat|sitting|conversation|thread)\b|"
    r"\bbetween (?:all )?(?:the )?platforms\b"
    r")",
    re.I,
)
ALL_PLATFORMS_RE = re.compile(
    r"\b(?:all|every)\b.{0,64}\b(?:platforms?|surfaces?)\b|"
    r"\b(?:platforms?|surfaces?)\b.{0,32}\b(?:all|every)\b",
    re.I,
)
LAST_SURFACE_RE = re.compile(
    r"("
    r"\blast\b.{0,48}\b(?:cursor|claude|chatgpt|grok|groq|codex|jarvis)\b"
    r".{0,40}\b(?:chats?|sessions?|sittings?|conversations?|threads?)\b|"
    r"\blast\b.{0,40}\b(?:chats?|sessions?|sittings?|conversations?)\b"
    r".{0,40}\b(?:cursor|claude|chatgpt|grok|groq|codex|jarvis)\b|"
    r"\b(?:see|read|open|show|what).{0,48}\b(?:last|latest|recent)\b"
    r".{0,40}\b(?:chats?|sessions?|sittings?|conversations?)\b|"
    r"\bwhat (?:did )?(?:cursor|claude|chatgpt|grok|codex) (?:did|do|say)\b|"
    r"\b(?:see|show) what (?:cursor|claude|chatgpt|grok|codex)\b|"
    r"\blast (?:cursor|claude|chatgpt|grok|codex) (?:chats?|sessions?|sittings?)\b"
    r")",
    re.I,
)
SESSION_LOOK_RE = re.compile(
    r"("
    r"\b(?:see|read|show|open)\b.{0,72}\b(?:chats?|sessions?|sittings?|conversations?)\b|"
    r"\b(?:cursor|claude|chatgpt|grok|groq|codex)\b.{0,40}\b(?:chats?|sessions?|sittings?)\b"
    r")",
    re.I,
)
SURFACE_NAMES = (
    "claude-code",
    "chatgpt",
    "cursor",
    "claude",
    "codex",
    "grok",
    "jarvis",
)
FOLLOW_RE = re.compile(
    r"^\s*(?:hey\s+)?(?:jarvis[,.]?\s*)?("
    r"what did you (?:just )?say|"
    r"say that again|repeat that|"
    r"what was that"
    r")\s*[.?!]?\s*$",
    re.I,
)
HAPPENED_RE = re.compile(
    r"("
    r"^(?:hey\s+)?(?:jarvis[,.]?\s*)?what happened"
    r"(?:\s*,?\s*jarvis)?"
    r"\s*[.!?]?\s*$"
    r"|"
    r"\bwhat happened\s+(?:yesterday|today|this sitting)\b"
    r"|"
    r"hello(?:\s+jarvis)?[,.]?\s+what happened(?:\s+(?:yesterday|today|this sitting))"
    r"(?:\s*,?\s*jarvis)?"
    r")",
    re.I,
)
TIMELINE_REL = Path("CONTENT/os/sessions/Conversation Timeline.md")
INDEX_REL = Path("CONTENT/os/sessions/Recent Conversations.md")
CURSOR_SESSIONS = ROOT / "scripts/hive/os/cursor-chat-sessions.py"
WIKI_TITLE_RE = re.compile(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]")
SKIP_TITLE_RE = re.compile(
    r"(scheduled-task|system-reminder|^[0-9a-f]{8}-[0-9a-f-]{20,}$|^https?://)",
    re.I,
)
STALE_ASK_RE = re.compile(
    r"("
    r"^(?:hey\s+)?(?:jarvis[,.]?\s*)?what do we know\s*[.?!]?\s*$|"
    r"\bwhat do we know\b.{0,48}\b(?:vault|stack|os|obsidian|hive)\b|"
    r"\bwhat(?:'s| is) in (?:the )?(?:stack|vault|os)\b|"
    r"\bwhat(?:'s| is) stale\b|"
    r"\bsummar(?:y|ise|ize).{0,40}\b(?:vault|obsidian)\b|"
    r"\b(?:what's inside|whats inside|inside)\b.{0,40}\b(?:vault|obsidian)\b|"
    r"\bread (?:exactly )?(?:what(?:'s| is) inside |the )?(?:whole )?(?:vault|obsidian)(?:\s+vault)?\b|"
    r"\bthe whole vault\b"
    r")",
    re.I,
)
ASOF_RE = re.compile(
    r"(?:as-of|date):\s*(\d{4}-\d{2}-\d{2})|"
    r"\b(20\d{2}-\d{2}-\d{2})T|"
    r"\b(\d{4}-\d{2}-\d{2})T\d{2}:",
    re.I,
)
PATH_RE = re.compile(
    r"(?:(?:/Users|/home|/tmp|/var|/opt|~/|[A-Za-z]:\\)[\w./\\-]+|"
    r"(?:apps|scripts|docs|CONTENT|packages)/[\w./-]+)"
)
SECRET_RE = re.compile(r"(api[_-]?key|sk-|Bearer\s+\S+|token=)", re.I)
TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9'-]{2,}", re.I)
SKIP = {"the", "and", "what", "did", "we", "say", "you", "our", "this", "that", "from"}
BODY_MIN_HITS = 3
SCAN_CAP = 2000
TITLE_SCAN_CAP = 240
SESSION_READ_CAP = 120
TITLE_CAP = 5
SURFACE_QUERY_SKIP = set(SURFACES) | {
    "sitting",
    "sittings",
    "chat",
    "chats",
    "session",
    "sessions",
    "about",
    "conversation",
    "conversations",
    "thread",
    "threads",
}
UNICODE_ESC_RE = re.compile(r"\\u([0-9a-fA-F]{4})")
DUMP_TITLE_RE = re.compile(
    r"("
    r"\\u201[cd]"
    r"|``"
    r"|he said \*\*"
    r"|authorized the ask"
    r"|you are lane "
    r"|sequence:\s*\(1\)"
    r"|morning60 commute"
    r")",
    re.I,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


LIVE_HIVE = REPO_OH / ".hive"


def dest_oh_roots(extra: list[Path] | None = None) -> list[Path]:
    """Isolated extra roots stay isolated. Live dests only when extra is None."""
    roots: list[Path] = []
    seen: set[str] = set()

    def add(path: Path | None) -> None:
        if path is None or not path.is_dir():
            return
        key = str(path.resolve()) if path.exists() else str(path)
        if key in seen:
            return
        seen.add(key)
        roots.append(path)

    if extra is not None:
        for path in extra:
            add(Path(path))
        return roots
    add(REPO_OH)
    add(DEFAULT_VAULT_OH)
    add(CACHE_OH)
    return roots


def archive_roots(hive: Path | None, retrieve_roots: list[Path] | None) -> list[Path] | None:
    """Write under test vaults, or live dests when Face hive is the live hive."""
    if retrieve_roots is not None:
        return [Path(p) for p in retrieve_roots]
    if hive is None:
        return dest_oh_roots()
    try:
        if hive.resolve() == LIVE_HIVE.resolve():
            return dest_oh_roots()
    except OSError:
        return None
    return None


def _unescape(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return chr(int(match.group(1), 16))

    return UNICODE_ESC_RE.sub(repl, text or "")


def _clean(text: str) -> str:
    body = PATH_RE.sub("", _unescape(text or ""))
    body = SECRET_RE.sub("", body)
    body = body.replace("`", "")
    body = re.sub(r"\*+", "", body)
    return re.sub(r"\s+", " ", body).strip()


def _bus_line(text: str) -> str:
    """The bus payload. Markdown stays. Secrets and filesystem paths do not."""
    body = PATH_RE.sub("", _unescape(text or ""))
    body = SECRET_RE.sub("", body)
    return re.sub(r"[ \t]+", " ", body).strip()


def _clean_title(text: str) -> str:
    return _clean(text)


def _usable_title(title: str) -> bool:
    body = (title or "").strip()
    if not body or SKIP_TITLE_RE.search(body):
        return False
    if DUMP_TITLE_RE.search(body):
        return False
    if len(body) > 90:
        return False
    return True


def _surface_of(path: Path) -> str:
    if path.parent.name in SURFACES:
        return path.parent.name
    if path.parent.parent.name in SURFACES:
        return path.parent.parent.name
    return path.parent.name


def wants_follow_up(utterance: str) -> bool:
    return bool(FOLLOW_RE.search(utterance or ""))


def wants_all_sessions(utterance: str) -> bool:
    text = utterance or ""
    if ALL_PLATFORMS_RE.search(text) and re.search(
        r"\b(?:chats?|sessions?|sittings?|conversations?)\b", text, re.I
    ):
        return True
    return bool(ALL_SESSIONS_RE.search(text)) and not wants_last_surface(text)


def named_surface(utterance: str) -> str:
    low = (utterance or "").lower().replace("groq", "grok")
    for name in SURFACE_NAMES:
        if re.search(rf"\b{re.escape(name)}\b", low):
            return name
    return ""


def wants_last_surface(utterance: str) -> bool:
    return bool(LAST_SURFACE_RE.search(utterance or ""))


def wants_session_look(utterance: str) -> bool:
    """Leftover chat/session wording. Last and census already won."""
    text = utterance or ""
    if wants_last_surface(text) or wants_all_sessions(text):
        return False
    if wants_what_happened(text) or wants_follow_up(text) or wants_stale_line(text):
        return False
    return bool(SESSION_LOOK_RE.search(text))


def wants_session_recall(utterance: str) -> bool:
    return (
        bool(RECALL_RE.search(utterance or ""))
        and not wants_all_sessions(utterance)
        and not wants_last_surface(utterance)
        and not wants_session_look(utterance)
        and not wants_what_happened(utterance)
        and not wants_follow_up(utterance)
    )


def wants_what_happened(utterance: str) -> bool:
    return bool(HAPPENED_RE.search((utterance or "").strip()))


def wants_stale_line(utterance: str) -> bool:
    return bool(STALE_ASK_RE.search(utterance or ""))


def recalled_day(utterance: str, today: date | None = None) -> date:
    day = today or date.today()
    low = (utterance or "").lower()
    if re.search(r"\byesterday\b", low):
        return date.fromordinal(day.toordinal() - 1)
    found = re.search(r"\b(20\d{2}-\d{2}-\d{2})\b", utterance or "")
    if found:
        try:
            return date.fromisoformat(found.group(1))
        except ValueError:
            return day
    return day


def _tokens(text: str) -> list[str]:
    return [t.group(0).lower() for t in TOKEN_RE.finditer(text or "") if t.group(0).lower() not in SKIP]


def speak_stale_line(roots: list[Path] | None = None) -> str:
    """One as-of line. Missing dates stay unnamed. Do not invent a KPI."""
    used = dest_oh_roots(roots)
    today = date.today().strftime("%b ") + str(date.today().day)
    hot_day = ""
    map_day = ""
    for root in used:
        if not hot_day:
            hot = root / "CONTENT/os/hot.md"
            if hot.is_file():
                try:
                    blob = hot.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    blob = ""
                found = ASOF_RE.search(blob)
                if found:
                    raw = next((g for g in found.groups() if g), "")
                    if raw:
                        hot_day = _short_day(raw)
        if not map_day:
            mapped = root / "CONTENT/VAULT_MAP.md"
            if mapped.is_file():
                try:
                    blob = mapped.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    blob = ""
                found = re.search(r"as-of:\D*(\d{4}-\d{2}-\d{2})", blob, re.I)
                if found:
                    map_day = _short_day(found.group(1))
        if hot_day and map_day:
            break
    bits = []
    if hot_day:
        bits.append(f"Hot is {hot_day}.")
    if map_day:
        bits.append(f"Map is {map_day}.")
    bits.append(f"Today is {today}.")
    return " ".join(bits)


def _short_day(iso: str) -> str:
    try:
        dt = datetime.strptime(iso[:10], "%Y-%m-%d")
    except ValueError:
        return iso[:10]
    return dt.strftime("%b ") + str(dt.day)


def _turn_identity(
    turn_gen: int | None,
    jarvis_chat_id: str | None,
    outcome: str | None,
) -> str:
    bits: list[str] = []
    if turn_gen is not None:
        try:
            bits.append(f"turn_gen: {int(turn_gen)}")
        except (TypeError, ValueError):
            pass
    chat = _clean(jarvis_chat_id or "")
    if chat:
        bits.append(f"jarvis_chat_id: {chat}")
    result = _clean(outcome or "")
    if result:
        bits.append(f"outcome: {result}")
    if not bits:
        return ""
    return " · ".join(bits) + "\n"


def archive_turn(
    *,
    hive: Path | None,
    retrieve_roots: list[Path] | None,
    utterance: str,
    spoken: str,
    verb: str = "converse",
    tool: str = "",
    wires: list | None = None,
    gen: int | None = None,
    turn_gen: int | None = None,
    jarvis_chat_id: str | None = None,
    outcome: str | None = None,
    closed: bool = False,
) -> list[Path]:
    """Write the session block for a turn that still owns the bus.

    `closed` records a turn that already left the bus, including a wall
    timeout stamped WIRE_FAILURE. That close is the receipt. It is not a
    second live turn.
    """
    if hive is not None and not closed:
        path = HERE / "bus_io.py"
        spec = importlib.util.spec_from_file_location("agent_stack_bus_io_chats", path)
        bio = None
        if spec is not None and spec.loader is not None:
            bio = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(bio)
        if bio is not None and hasattr(bio, "act_if_current"):
            if bio.act_if_current(hive, gen, lambda bus: bus) is None:
                return []
    roots = archive_roots(hive, retrieve_roots)
    if roots is None:
        return []
    recorded = turn_gen if turn_gen is not None else gen
    return append_jarvis_turn(
        utterance=utterance,
        spoken=spoken,
        verb=verb,
        tool=tool,
        wires=wires,
        roots=roots,
        turn_gen=recorded,
        jarvis_chat_id=jarvis_chat_id,
        outcome=outcome,
    )


def append_jarvis_turn(
    *,
    utterance: str,
    spoken: str,
    verb: str = "converse",
    tool: str = "",
    wires: list | None = None,
    roots: list[Path] | None = None,
    turn_gen: int | None = None,
    jarvis_chat_id: str | None = None,
    outcome: str | None = None,
) -> list[Path]:
    """Append one Face log row. Skip idle. Never write secrets or paths."""
    user = _clean(utterance)
    if not user or (verb or "").strip().lower() == "idle":
        return []
    line = _bus_line(spoken)
    tool_name = _clean(tool or verb)
    wire_s = ", ".join(_clean(str(w)) for w in (wires or []) if str(w).strip()) or verb
    day = date.today().isoformat()
    stamp = now_iso()
    identity = _turn_identity(turn_gen, jarvis_chat_id, outcome)
    block = (
        f"\n## Evens · {stamp}\n\n{user}\n\n"
        f"## jarvis\n\n{line}\n\n"
        f"verb: {verb} · tool: {tool_name} · wires: {wire_s}\n"
        f"{identity}"
    )
    written: list[Path] = []
    header = (
        "---\n"
        "surface: jarvis\n"
        f"id: {day}\n"
        "archive_type: conversation_text\n"
        f"date: {day}\n"
        "---\n\n"
        f"# Jarvis · {day}\n\n"
        "Face log. Spoken product plus verb/tool/wires. Paths stripped.\n"
    )
    for root in dest_oh_roots(roots):
        dest = root / SESSIONS_REL / "jarvis" / f"{day}.md"
        dest.parent.mkdir(parents=True, exist_ok=True)
        existing = dest.read_text(encoding="utf-8") if dest.is_file() else header
        tmp = dest.with_name(dest.name + ".tmp")
        tmp.write_text(existing + block, encoding="utf-8")
        os.replace(tmp, dest)
        written.append(dest)
    return written


def _speakable_line(line: str) -> str:
    raw = (line or "").strip()
    low = raw.lower()
    if low.startswith("user:"):
        raw = raw.split(":", 1)[-1].strip()
    elif low.startswith("send:"):
        raw = raw.split(":", 1)[-1].strip()
    cleaned = _clean(raw)
    if not cleaned or DUMP_TITLE_RE.search(cleaned):
        return ""
    if len(cleaned) > 180:
        cleaned = cleaned[:177].rsplit(" ", 1)[0] + "…"
    return cleaned


def _title_and_first(path: Path) -> tuple[str, str, str]:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return "", "", ""
    title = ""
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            fm = parts[1]
            body = parts[2]
            found = re.search(r"(?m)^title:\s*[\"']?(.+?)[\"']?\s*$", fm)
            if found:
                title = found.group(1).strip()
    users: list[str] = []
    sends: list[str] = []
    prose = ""
    for raw in body.splitlines():
        line = raw.strip()
        if line.startswith("#"):
            if not title and line.startswith("# "):
                title = line[2:].strip()
            continue
        if not line or line.startswith("[") or line.startswith(">"):
            continue
        if line.lower().startswith("grok, claude"):
            continue
        if line.lower().startswith(("verb:", "tool:", "wires:", "body:")):
            continue
        low = line.lower()
        if low.startswith("user:"):
            bit = _speakable_line(line)
            if bit:
                users.append(bit)
            continue
        if low.startswith("send:"):
            bit = _speakable_line(line)
            if bit and len(bit) <= 180:
                sends.append(bit)
            continue
        if not prose:
            prose = _speakable_line(line) or line[:180]
    title = _clean_title(title)
    if not _usable_title(title):
        title = ""
    first = (users[0] if users else "") or (sends[0] if sends else "") or prose
    return title or path.stem, first[:180], _surface_of(path)


def _session_files(roots: list[Path] | None = None, *, cap: int = SCAN_CAP) -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    for root in dest_oh_roots(roots):
        base = root / SESSIONS_REL
        if not base.is_dir():
            continue
        for surface in SURFACES:
            folder = base / surface
            if not folder.is_dir():
                continue
            for path in folder.rglob("*.md"):
                if not path.is_file() or path.name.lower() == "readme.md":
                    continue
                key = str(path.resolve()) if path.exists() else str(path)
                if key in seen:
                    continue
                seen.add(key)
                files.append(path)
    files.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
    return files[:cap]


def _is_named(query: str, title: str, hits: int) -> bool:
    """True when he named the sitting, not when two common words overlap."""
    q = (query or "").lower()
    t = (title or "").strip().lower()
    if t and len(t) >= 6 and t in q:
        return True
    title_words = _tokens(title)
    query_words = set(_tokens(query))
    if len(title_words) >= 2 and all(w in query_words for w in title_words):
        return True
    overlap = sum(1 for w in title_words if w in query_words)
    return overlap >= 2 and hits >= BODY_MIN_HITS


def speak_last_turn(turns: list | None) -> dict:
    """Repeat the last good spoken line. Skip dark / provider-miss leftovers."""
    for row in reversed(turns or []):
        if not isinstance(row, dict):
            continue
        said = str(row.get("jarvis") or "").strip()
        low = said.lower()
        if not said:
            continue
        if "no live mouth" in low or "returned no text" in low or "ran out of room" in low:
            continue
        return {
            "ok": True,
            "unknown": False,
            "spoken": f"Last I said: {said}",
            "hits": [],
        }
    return {
        "ok": True,
        "unknown": True,
        "spoken": "UNKNOWN. I do not have a prior line this sitting.",
        "hits": [],
    }


def _clip_title(title: str, cap: int = 48) -> str:
    body = _clean(title)
    if len(body) <= cap:
        return body
    return body[: cap - 1].rsplit(" ", 1)[0] + "…"


def _index_rows(roots: list[Path] | None) -> list[tuple[str, str]]:
    """Every index title. Census uses one per surface; search uses all."""
    rows: list[tuple[str, str]] = []
    seen: set[str] = set()
    allowed = set(SURFACES)
    for root in dest_oh_roots(roots):
        path = root / INDEX_REL
        if not path.is_file():
            continue
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for raw in lines:
            line = raw.strip()
            if not line.startswith("|"):
                continue
            cells = [c.strip().strip("`") for c in line.strip("|").split("|")]
            if len(cells) < 3:
                continue
            surface = cells[0].lower()
            if surface not in allowed:
                continue
            title = _clip_title(cells[2], 96)
            if not title or title.lower() in {"title", "---"}:
                continue
            key = f"{surface}:{title.lower()}"
            if key in seen:
                continue
            seen.add(key)
            rows.append((surface, title))
        if rows:
            break
    return rows


def _index_heads(roots: list[Path] | None) -> list[tuple[str, str]]:
    seen: set[str] = set()
    heads: list[tuple[str, str]] = []
    for surface, title in _index_rows(roots):
        if surface in seen:
            continue
        seen.add(surface)
        heads.append((surface, title))
    return heads


def _folder_heads(roots: list[Path] | None) -> list[tuple[str, str]]:
    seen: dict[str, str] = {}
    for path in _session_files(roots, cap=TITLE_SCAN_CAP):
        title, _first, surface = _title_and_first(path)
        if surface in seen or surface not in SURFACES:
            continue
        display = title if _usable_title(title) else ""
        if not display:
            continue
        seen[surface] = _clip_title(display)
        if len(seen) >= 8:
            break
    return list(seen.items())


def _latest_user_ask(path: Path, *, cap: int = 160) -> str:
    last = ""
    try:
        with path.open(encoding="utf-8", errors="replace") as fh:
            for raw in fh:
                try:
                    event = json.loads(raw)
                except json.JSONDecodeError:
                    continue
                if event.get("role") != "user":
                    continue
                content = event.get("message", {}).get("content")
                texts: list[str] = []
                if isinstance(content, str):
                    texts.append(content)
                elif isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and part.get("type") == "text":
                            texts.append(str(part.get("text") or ""))
                blob = "\n".join(texts)
                found = re.search(r"<user_query>(.*?)</user_query>", blob, re.S)
                ask = re.sub(r"\s+", " ", (found.group(1) if found else blob).strip())
                if ask:
                    last = ask[:cap]
    except OSError:
        return ""
    return last


def _live_cursor_ask() -> str:
    if not CURSOR_SESSIONS.is_file():
        return ""
    spec = importlib.util.spec_from_file_location("jarvis_cursor_sessions", CURSOR_SESSIONS)
    if spec is None or spec.loader is None:
        return ""
    try:
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        cfg = mod.load_cfg()
        files = mod.session_files(cfg, "n8n-cursor", False)
        files.sort(key=lambda p: p.stat().st_mtime if p.exists() else 0, reverse=True)
        if not files:
            return ""
        return _latest_user_ask(files[0]) or str(mod.first_ask(files[0]) or "")
    except (OSError, TypeError, AttributeError, KeyError):
        return ""


def speak_named_surfaces(surfaces: list[str] | tuple[str, ...], roots: list[Path] | None = None) -> dict:
    """One title per named surface. Sittings only. Not a CLI install."""
    want = {str(s).lower() for s in surfaces if str(s).strip()}
    heads = [(s, t) for s, t in (_index_heads(roots) or _folder_heads(roots)) if s in want]
    if not heads:
        return {
            "ok": True,
            "unknown": True,
            "spoken": "UNKNOWN. Those sittings are not on this Mac.",
            "hits": [],
        }
    spoken = (
        "Yes: "
        + "; ".join(f"{surface}: {title}" for surface, title in heads)
        + ". I read sittings. I do not install those CLIs."
    )
    if len(spoken) > 320:
        spoken = spoken[:317].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "spoken": spoken,
        "hits": [{"surface": s, "title": t} for s, t in heads],
    }


def speak_all_sessions(utterance: str, roots: list[Path] | None = None) -> dict:
    """One title per surface. Live Cursor sitting when this is the live dest. No dump."""
    _ = utterance
    isolated = roots is not None
    heads = _index_heads(roots) or _folder_heads(roots)
    bits: list[str] = []
    hits: list[dict] = []
    if heads:
        names = ", ".join(surface for surface, _title in heads)
        bits.append(f"Yes: {names}.")
        bits.append("; ".join(f"{surface}: {title}" for surface, title in heads) + ".")
        hits = [{"surface": surface, "title": title} for surface, title in heads]
    if not isolated:
        live = _clip_title(_live_cursor_ask(), 72)
        if live:
            bits.append(f"This Cursor sitting: {live}.")
            hits.append({"surface": "cursor", "title": live, "live": True})
    asks: list[str] = []
    today = date.today().isoformat()
    for root in dest_oh_roots(roots):
        note = root / SESSIONS_REL / "jarvis" / f"{today}.md"
        if note.is_file():
            asks = _jarvis_asks(note)
            if asks:
                break
    if asks and (utterance or "").strip() and wants_all_sessions(utterance):
        bits.append(f"This Orb sitting: {_clip_title(asks[-1], 72)}.")
    if not bits:
        return {
            "ok": True,
            "unknown": True,
            "spoken": "UNKNOWN. I do not have the session index on this Mac.",
            "hits": [],
        }
    bits.append("Name the sitting if you want the body.")
    spoken = " ".join(bits)
    if len(spoken) > 400:
        spoken = spoken[:397].rsplit(" ", 1)[0] + "…"
    return {"ok": True, "unknown": False, "spoken": spoken, "hits": hits}


def _latest_session_file(surface: str, roots: list[Path] | None = None) -> Path | None:
    want = (surface or "").lower()
    for path in _session_files(roots, cap=TITLE_SCAN_CAP):
        if _surface_of(path).lower() == want:
            return path
    return None


def speak_last_surface(utterance: str, roots: list[Path] | None = None) -> dict:
    """Last sitting on one surface. Live Cursor ask when this is the live dest. Not a vault mash."""
    surface = named_surface(utterance) or "cursor"
    isolated = roots is not None
    bits: list[str] = []
    hits: list[dict] = []
    live = ""
    if surface == "cursor" and not isolated:
        live = _clip_title(_live_cursor_ask(), 96)
        if live:
            bits.append(f"Yes: last Cursor sitting. Last you asked: {live}.")
            hits.append({"surface": "cursor", "title": live, "live": True})
    title = ""
    first = ""
    path = _latest_session_file(surface, roots)
    if path is not None:
        raw_title, first, _surf = _title_and_first(path)
        title = raw_title if _usable_title(raw_title) else ""
    if not title:
        for name, head in _index_heads(roots) or _folder_heads(roots):
            if name == surface:
                title = head
                break
    if title:
        label = surface.replace("-", " ")
        snippet = _clean(first) if first else ""
        if live:
            if title.lower() not in live.lower():
                bits.append(f"Index: {title}.")
        elif snippet:
            bits.append(f"Yes: last {label} sitting. {title}. {snippet}")
        else:
            bits.append(f"Yes: last {label} sitting. {title}.")
        hits.append({"surface": surface, "title": title})
    if not bits:
        return {
            "ok": True,
            "unknown": True,
            "spoken": "UNKNOWN. That sitting is not on this Mac.",
            "hits": [],
        }
    bits.append("Name the sitting if you want the body.")
    spoken = " ".join(bits)
    if len(spoken) > 400:
        spoken = spoken[:397].rsplit(" ", 1)[0] + "…"
    return {"ok": True, "unknown": False, "spoken": spoken, "hits": hits}


def speak_session_look(utterance: str, roots: list[Path] | None = None) -> dict:
    if named_surface(utterance):
        return speak_last_surface(utterance, roots)
    return speak_all_sessions(utterance, roots)


def _content_query_words(query: str) -> list[str]:
    return [w for w in _tokens(query) if w not in SURFACE_QUERY_SKIP]


def _session_shaped(query: str) -> bool:
    """A sitting question. A proof question that shares one word with a title is not one."""
    text = query or ""
    return bool(
        wants_session_recall(text)
        or wants_session_look(text)
        or wants_all_sessions(text)
        or wants_last_surface(text)
        or wants_what_happened(text)
        or named_surface(text)
    )


def _exact_index_hit(query: str, roots: list[Path] | None) -> dict | None:
    """The title itself is in the question. One shared word is not a title."""
    q = (query or "").lower().replace("groq", "grok")
    for surface, title in _index_rows(roots):
        display = title if _usable_title(title) else ""
        if display and len(display) >= 6 and display.lower() in q:
            return {
                "ok": True,
                "unknown": False,
                "spoken": f"I have {display} ({surface}). Name the sitting if you want the body.",
                "hits": [{"surface": surface, "title": display, "from": "index"}],
            }
    return None


def _hit_from_index(query: str, roots: list[Path] | None) -> dict | None:
    """Named sitting from the session index. Do not walk the pile first."""
    exact = _exact_index_hit(query, roots)
    if exact is not None:
        return exact
    if not _session_shaped(query):
        return None
    words = _content_query_words(query)
    best = ""
    best_surface = ""
    best_hits = 0
    for surface, title in _index_rows(roots):
        display = title if _usable_title(title) else ""
        if not display:
            continue
        title_hits = sum(1 for w in words if w in display.lower())
        if title_hits > best_hits:
            best_hits = title_hits
            best = display
            best_surface = surface
    if best and best_hits >= 2:
        return {
            "ok": True,
            "unknown": False,
            "spoken": f"I have {best} ({best_surface}). Name the sitting if you want the body.",
            "hits": [{"surface": best_surface, "title": best, "from": "index"}],
        }
    return None


def _unknown_sitting() -> dict:
    return {
        "ok": True,
        "unknown": True,
        "spoken": "UNKNOWN. That sitting is not on this Mac.",
        "hits": [],
    }


def search_sessions(query: str, roots: list[Path] | None = None) -> dict:
    """Titles + first line. Body snippet only when the sitting is named."""
    if wants_all_sessions(query):
        return speak_all_sessions(query, roots)
    if not _session_shaped(query):
        exact = _exact_index_hit(query, roots)
        if exact is not None:
            return exact
        return _unknown_sitting()
    words = _tokens(query)
    content = _content_query_words(query)
    q = (query or "").lower().replace("groq", "grok")
    indexed = _hit_from_index(query, roots)
    if indexed is not None:
        return indexed
    files = _session_files(roots, cap=SESSION_READ_CAP)
    exact: list[tuple[int, str, str, str, Path]] = []
    scored: list[tuple[int, str, str, str, Path]] = []
    seen_title: set[str] = set()
    for path in files:
        title, first, surface = _title_and_first(path)
        display = title if _usable_title(title) else ""
        if not display:
            continue
        key = f"{surface}:{display.lower()}"
        if key in seen_title:
            continue
        seen_title.add(key)
        if len(display) >= 6 and display.lower() in q:
            exact.append((len(display), display, first, surface, path))
            continue
        title_hits = sum(1 for w in words if w in display.lower())
        first_hits = sum(1 for w in words if w in (first or "").lower())
        content_hits = sum(1 for w in content if w in display.lower() or w in (first or "").lower())
        if content and content_hits <= 0:
            continue
        surf_hits = 3 if surface.lower() in q else 0
        hits = title_hits * 10 + first_hits + surf_hits
        if hits <= 0:
            continue
        scored.append((hits, display, first, surface, path))
    if exact:
        exact.sort(key=lambda row: (-row[0], row[1]))
        title, first, surface, path = exact[0][1], exact[0][2], exact[0][3], exact[0][4]
        snippet = _clean(first) or first
        spoken = f"I have {title} ({surface}). {snippet}"
        if len(spoken) > 280:
            spoken = spoken[:277].rsplit(" ", 1)[0] + "…"
        return {
            "ok": True,
            "unknown": False,
            "spoken": spoken,
            "hits": [{"path": str(path.name), "surface": surface, "title": title}],
        }
    scored.sort(key=lambda row: (-row[0], row[1]))
    if not scored:
        return {
            "ok": True,
            "unknown": True,
            "spoken": "UNKNOWN. That sitting is not on this Mac.",
            "hits": [],
        }
    top = scored[:TITLE_CAP]
    named = _is_named(query, top[0][1], top[0][0])
    if named:
        title, first, surface, path = top[0][1], top[0][2], top[0][3], top[0][4]
        snippet = _clean(first) or first
        spoken = f"I have {title} ({surface}). {snippet}"
        if len(spoken) > 280:
            spoken = spoken[:277].rsplit(" ", 1)[0] + "…"
        return {
            "ok": True,
            "unknown": False,
            "spoken": spoken,
            "hits": [{"path": str(path.name), "surface": surface, "title": title}],
        }
    bits = [f"{title} ({surface})" for _, title, _, surface, _ in top[:3]]
    spoken = "I have " + "; ".join(bits) + ". Name the sitting if you want the body."
    return {
        "ok": True,
        "unknown": False,
        "spoken": spoken,
        "hits": [{"title": t, "surface": s} for _, t, _, s, _ in top],
    }


def _wiki_title(cell: str) -> str:
    found = WIKI_TITLE_RE.search(cell or "")
    if found:
        return _clean(found.group(2) or Path(found.group(1)).stem)
    return _clean(cell)


def _jarvis_asks(path: Path) -> list[str]:
    try:
        lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return []
    asks: list[str] = []
    idx = 0
    while idx < len(lines):
        if lines[idx].startswith("## Evens"):
            idx += 1
            chunk: list[str] = []
            while idx < len(lines) and not lines[idx].startswith("## "):
                bit = lines[idx].strip()
                if bit:
                    chunk.append(bit)
                idx += 1
            ask = _clean(" ".join(chunk))
            if ask:
                asks.append(ask)
            continue
        idx += 1
    return asks


def _timeline_titles(path: Path, iso: str) -> list[tuple[str, str]]:
    try:
        rows = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    except OSError:
        return []
    found: list[tuple[str, str]] = []
    seen: set[str] = set()
    prefix = re.compile(rf"^\|\s*{re.escape(iso)}T")
    for raw in rows:
        line = raw.strip()
        if not prefix.match(line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 4:
            continue
        surface = cells[1]
        title = _wiki_title("|".join(cells[3:]))
        if not title or SKIP_TITLE_RE.search(title):
            continue
        key = f"{surface}:{title.lower()}"
        if key in seen:
            continue
        seen.add(key)
        found.append((title, surface))
        if len(found) >= TITLE_CAP:
            break
    return found


def speak_what_happened(utterance: str, roots: list[Path] | None = None) -> dict:
    """Day log from the timeline + today's Jarvis note. Never invent a sitting."""
    day = recalled_day(utterance)
    iso = day.isoformat()
    label = day.strftime("%b ") + str(day.day)
    asks: list[str] = []
    titles: list[tuple[str, str]] = []
    for root in dest_oh_roots(roots):
        note = root / SESSIONS_REL / "jarvis" / f"{iso}.md"
        if note.is_file() and not asks:
            raw_asks = _jarvis_asks(note)
            useful = [a for a in raw_asks if not wants_what_happened(a)]
            asks = (useful or raw_asks)[-3:]
        timeline = root / TIMELINE_REL
        if timeline.is_file() and not titles:
            titles = _timeline_titles(timeline, iso)
        if asks or titles:
            break
    bits: list[str] = []
    if asks:
        listed = "; ".join(asks)
        bits.append(f"This sitting: {listed}.")
    if titles:
        listed = "; ".join(f"{title} ({surface})" for title, surface in titles[:4])
        bits.append(f"{label} on the timeline: {listed}.")
        bits.append("Name the sitting if you want the body.")
    if bits:
        spoken = " ".join(bits)
        if len(spoken) > 320:
            spoken = spoken[:317].rsplit(" ", 1)[0] + "…"
        return {
            "ok": True,
            "unknown": False,
            "spoken": spoken,
            "hits": [{"title": t, "surface": s} for t, s in titles],
        }
    return {
        "ok": True,
        "unknown": True,
        "spoken": f"UNKNOWN. I do not have a day log for {label}.",
        "hits": [],
    }
