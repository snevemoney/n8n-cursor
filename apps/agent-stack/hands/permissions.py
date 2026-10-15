"""Jarvis permission modes (Evens 2026-10-13 12:00), modelled on Claude Code / Codex / Cursor.

ALLOWED without a confirm: edit files inside allowed workspaces (scratch roots always; other edit roots only when
auto-accept edits is on), run code and tests in the sandbox, git branches and commits (never main, never push),
read-only MCP calls, web and browser reads.
GATED (explicit confirm from Evens, always): sends/messages, purchases/spend, deletes outside scratch, merges to
main, any push, deploys/VPS changes, reading secrets, global rule edits.
Every decision is logged to logs/jarvis-actions.jsonl (kind, target, decision; never file contents or secrets).
"""
from __future__ import annotations

import json
import os
import re
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
_LOCK = threading.Lock()

ALLOWED = ("edit_scratch", "run_sandbox", "git_branch", "git_commit", "mcp_read", "web_read", "browser_read")
GATED = ("send", "purchase", "delete_outside_scratch", "merge_main", "push", "deploy", "vps_change",
         "read_secret", "global_rule_edit")
SECRET_RE = re.compile(r"(^|/)(\.env[^/]*|\.ssh|\.aws|\.gnupg|\.netrc|\.grok-private|id_[a-z0-9]+|[^/]*\.pem|[^/]*\.key|"
                       r"credentials[^/]*|secrets?[^/]*|[^/]*token[^/]*|Keychains?)(/|$)", re.I)


def _mode_file() -> Path:
    raw = (os.environ.get("JARVIS_MODE_FILE") or "").strip()
    return Path(raw).expanduser() if raw else Path.home() / ".grok-private" / "jarvis-mode.json"


def mode() -> dict:
    try:
        data = json.loads(_mode_file().read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (OSError, ValueError):
        return {}


def auto_accept_edits() -> bool:
    return bool(mode().get("auto_accept_edits"))


def set_auto_accept(on: bool) -> dict:
    f = _mode_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    data = {**mode(), "auto_accept_edits": bool(on), "updated": datetime.now().isoformat(timespec="seconds")}
    f.write_text(json.dumps(data, indent=1), encoding="utf-8")
    log_action("mode", "auto_accept_edits", "on" if on else "off")
    return data


# Open access (Evens 2026-10-15): "permission granted" lifts the false-positive limits on files, folders, the
# browser, screen/Safari looks, edits and read-only code runs. It lasts one hour (OPEN_ACCESS_TTL_SECONDS) or until he says "lock it down".
# Only the owner's own spoken/typed line flips it (pipeline turn start); model output, page text and tool args
# never can, and the file lives in ~/.grok-private, which no hand can read or write.
# Still gated while open: sends, payments, bookings, publishing, deletes outside scratch, pushes, merges,
# deploys/VPS changes and real secrets (.env, keys, ~/.ssh, ~/.grok-private).
# Grant phrases (security review 2026-10-15): only first-person lines addressed to Jarvis. Bare "access granted",
# "you're cleared/allowed/permitted", "you have access", "I allow it" are everyday/TV speech and never grant.
_GRANT_CORE = (
    r"(?:full\s+)?(?:permission|permissions)\s+(?:is\s+)?granted|"
    r"full\s+access\s+(?:is\s+)?granted|"
    r"i\s+(?:grant|give)\s+you\s+(?:full\s+)?(?:permission|permissions|access)|"
    r"i\s+(?:allow|authori[sz]e|permit)\s+you")
GRANT_RE = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:(?:ok(?:ay)?|yes|yeah)[,.!]?\s*)?(?:" + _GRANT_CORE +
    r")(?:\s+to\s+(?:do\s+(?:it|this|that)|go\s+ahead|proceed|continue|look|read|open|search|browse))?"
    r"(?:[,.!]?\s*(?:sir|jarvis|go\s+ahead|do\s+it|proceed|continue|please))*\s*[.!]*\s*$", re.I)
REVOKE_RE = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:"
    r"(?:permission|permissions|access)\s+(?:is\s+)?(?:revoked|removed|denied)|"
    r"(?:i\s+)?revoke\s+(?:your\s+|the\s+)?(?:permission|permissions|access)|"
    r"lock\s+(?:it\s+|yourself\s+)?(?:back\s+)?down|"
    r"(?:go\s+)?back\s+to\s+(?:safe|normal|restricted)\s+mode|"
    r"close\s+(?:open\s+)?access"
    r")(?:[,.!]?\s*(?:please|sir|now|thanks|thank\s+you|jarvis))*[.!]*\s*$", re.I)
OPEN_ACCESS_TTL_SECONDS = 3600  # a grant lasts one hour, then closes on its own


def is_grant(text: str) -> bool:
    return bool(GRANT_RE.fullmatch(text or "") or grant_split(text)[0])


# A grant that leads the line, then whatever he wants done: "permission granted, you are allowed to find books"
# -> grant + "find books". Several grant phrases in a row are all consumed.
_GRANT_HEAD = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:(?:ok(?:ay)?|yes|yeah|i\s+said)[,.!]?\s*)?(?:" + _GRANT_CORE +
    r")(?:\s+to\b)?[\s,.:;!-]*", re.I)
_FILLER = re.compile(r"^(?:(?:so|now|please|sir|jarvis|go\s+ahead|and|then|"
                     r"you(?:'re|\s+are)\s+(?:now\s+)?(?:allowed|authori[sz]ed|permitted)\s+to)[\s,.:;!-]*)+", re.I)


_COMMAND_START = re.compile(
    r"(?:find|read|open|search|look|show|list|check|browse|fetch|get|download|install|run|use|scan|explore|go\s+through|"
    r"play|watch|summari[sz]e|compare|fix|change|edit|write|make|create|build|start|continue|help|tell|give|access|do|"
    # consequential verbs still meet their own confirm/hard-step gate downstream; the grant only opens folders/tools
    r"send|email|message|reply|schedule|book|post|delete|move|copy|save|upload|share|print|organi[sz]e|clean)\b", re.I)


def grant_split(text: str) -> tuple[bool, str]:
    """(True, remaining command) when the line opens with a grant; (False, "") otherwise."""
    line = str(text or "")
    found = False
    while True:
        m = _GRANT_HEAD.match(line)
        if not m or not m.group(0).strip():
            break
        found, line = True, line[m.end():]
        line = _FILLER.sub("", line)
    if not found:
        return False, ""
    rest = line.strip(" .!?,;:-")
    if re.fullmatch(r"(?:do\s+(?:it|this|that)|proceed|continue|go\s+ahead|now)?", rest, re.I):
        rest = ""
    if rest and not _COMMAND_START.match(rest):
        return False, ""  # "permission granted, captain" / "I allow you to leave early" is talk, not a grant (re-review N1)
    return True, rest


def is_revoke(text: str) -> bool:
    return bool(REVOKE_RE.fullmatch(text or ""))


def open_access() -> bool:
    """True from the owner's grant until his revoke. Tests never see the real owner file."""
    import sys
    if not (os.environ.get("JARVIS_MODE_FILE") or "").strip() and ("_pytest" in sys.modules or "unittest" in sys.modules):
        return False
    data = mode()
    if not data.get("open_access"):
        return False
    try:  # no expiry recorded (pre-2026-10-15 grant) or past it -> closed
        return datetime.now() < datetime.fromisoformat(str(data.get("expires") or ""))
    except ValueError:
        return False


def set_open_access(on: bool) -> dict:
    f = _mode_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now()
    data = {**mode(), "open_access": bool(on), "updated": now.isoformat(timespec="seconds")}
    if on:
        data["expires"] = (now + timedelta(seconds=OPEN_ACCESS_TTL_SECONDS)).isoformat(timespec="seconds")
    else:
        data.pop("expires", None)
    tmp = f.with_name(f.name + ".tmp")
    tmp.write_text(json.dumps(data, indent=1), encoding="utf-8")
    os.chmod(tmp, 0o600)
    os.replace(tmp, f)
    if bool(mode().get("open_access")) != bool(on):  # a revoke that did not land must not pass silently
        raise OSError("open access mode file did not take the change")
    log_action("mode", "open_access", "on" if on else "off")
    return data


def open_edit_ok(path: Path) -> bool:
    """While open: edits anywhere in the home folder except secrets and ~/Library."""
    try:
        p = path.expanduser().resolve()
    except (OSError, RuntimeError):
        return False
    home = Path.home().resolve()
    if home not in p.parents or is_secret_path(p):
        return False
    first = p.relative_to(home).parts[0]
    # shell/agent/tool config (~/.zshrc, ~/.claude, ~/.config, ~/.mcp.json …) and ~/Library run code on next start
    return not first.startswith(".") and first != "Library"


def scratch_roots() -> list[Path]:
    raw = (os.environ.get("JARVIS_SCRATCH_ROOTS") or "").strip()
    items = [p for p in raw.split(":") if p] if raw else [str(Path.home() / "jarvis-scratch")]
    return [Path(p).expanduser().resolve() for p in items]


def edit_roots() -> list[Path]:
    raw = (os.environ.get("JARVIS_EDIT_ROOTS") or "").strip()
    return [Path(p).expanduser().resolve() for p in raw.split(":") if p]


def _inside(path: Path, roots: list[Path]) -> bool:
    p = path.expanduser().resolve()
    return any(p == r or r in p.parents for r in roots)


# Name-only words ("token", "secret", "credentials") also appear in ordinary test modules such as
# tests/test_literal_tokens_and_budget.py. A test source file is code, not a credential store, so the
# word alone does not make it secret. Strong shapes (.env, .pem, .key, id_*, .ssh, Keychains...) still match.
_TEST_SOURCE_RE = re.compile(r"^(test_[\w.-]*\.(py|cjs|mjs|js|ts)|[\w.-]*_test\.py|[\w.-]*\.(test|spec)\.(cjs|mjs|js|ts))$", re.I)


def is_secret_path(path: str | Path) -> bool:
    text = str(path)
    if not SECRET_RE.search(text):
        return False
    parts = [p for p in text.split("/") if p]
    if parts and _TEST_SOURCE_RE.match(parts[-1]):
        # a test module's own name never makes it secret; its folders still can (secrets/, .ssh/ ...)
        return bool(SECRET_RE.search("/".join(parts[:-1])))
    return True


def decide(kind: str, target: str = "") -> str:
    """'allow' or 'confirm'. Unknown kinds are gated."""
    if kind in GATED:
        return "confirm"
    if kind == "edit":
        p = Path(target)
        if is_secret_path(p):
            return "confirm"
        if _inside(p, scratch_roots()):
            return "allow"
        if _inside(p, edit_roots()) and auto_accept_edits():
            return "allow"
        if open_access() and open_edit_ok(p):
            return "allow"
        return "confirm"
    if kind == "delete":
        return "allow" if _inside(Path(target), scratch_roots()) and not is_secret_path(target) else "confirm"
    if kind == "git_commit" or kind == "git_branch":
        return "confirm" if re.fullmatch(r"(main|master)", str(target or "").strip()) else "allow"
    return "allow" if kind in ALLOWED else "confirm"


def _log_path() -> Path | None:
    raw = (os.environ.get("JARVIS_ACTION_LOG") or "").strip()
    if raw.lower() in {"0", "off"}:
        return None
    if raw:
        return Path(raw).expanduser()
    import sys
    if "_pytest" in sys.modules or "unittest" in sys.modules:
        import tempfile
        return Path(tempfile.gettempdir()) / f"jarvis-actions-test-{os.getpid()}.jsonl"
    return ROOT / "logs" / "jarvis-actions.jsonl"


def log_action(kind: str, target: str, decision: str, **meta) -> None:
    dest = _log_path()
    if dest is None:
        return
    row = {"ts": datetime.now(timezone.utc).isoformat(timespec="seconds"), "kind": kind,
           "target": str(target)[:200], "decision": decision}
    row.update({k: v for k, v in meta.items() if isinstance(v, (int, float, bool)) or (isinstance(v, str) and len(v) <= 120)})
    try:
        dest.parent.mkdir(parents=True, exist_ok=True)
        with _LOCK, dest.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(row, sort_keys=True) + "\n")
    except OSError:
        pass
