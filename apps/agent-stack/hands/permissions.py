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
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
_LOCK = threading.Lock()

ALLOWED = ("edit_scratch", "run_sandbox", "git_branch", "git_commit", "mcp_read", "web_read", "browser_read")
GATED = ("send", "purchase", "delete_outside_scratch", "merge_main", "push", "deploy", "vps_change",
         "read_secret", "global_rule_edit")
SECRET_RE = re.compile(r"(^|/)(\.env[^/]*|\.ssh|\.aws|\.gnupg|\.netrc|\.grok-private|id_[a-z0-9]+|[^/]*\.pem|[^/]*\.key|"
                       r"credentials[^/]*|secrets?[^/]*|[^/]*token[^/]*|Keychains?)(/|$)", re.I)
# Always secret wherever they sit: key material, dot-config stores, and folders named for secrets.
STRONG_SECRET_RE = re.compile(r"(^|/)(\.env[^/]*|\.ssh|\.aws|\.gnupg|\.netrc|\.grok-private|id_[a-z0-9]+|[^/]*\.pem|[^/]*\.key|"
                              r"[^/]*\.p12|[^/]*\.pfx|[^/]*\.kdbx|\.git-credentials|Keychains?|\.docker|\.kube|\.npmrc|\.pypirc|\.gh|"
                              r"\.config/gh|\.config/gcloud|\.azure|\.terraform\.d|\.vercel|\.stripe|\.password-store|1Password[^/]*|"
                              r"\.?secrets?|credentials|\.?tokens?)(/|$)", re.I)
WEAK_SECRET_WORD = re.compile(r"credential|secret|token", re.I)
# Source code is never a secret store by its name alone: test_tokens.py, tokenizer.py, secret_scanner.ts.
# (2026-10-15: the saved-video build stopped at preparation because a test file had "tokens" in its name.)
CODE_SUFFIXES = frozenset({".py", ".pyi", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".swift", ".rs", ".go", ".java",
                           ".kt", ".rb", ".c", ".h", ".cc", ".cpp", ".hpp", ".m", ".mm", ".cs", ".php", ".lua", ".scala"})


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
# browser, screen/Safari looks, edits and read-only code runs. It stays on until he says "lock it down".
# Only the owner's own spoken/typed line flips it (pipeline turn start); model output, page text and tool args
# never can, and the file lives in ~/.grok-private, which no hand can read or write.
# Still gated while open: sends, payments, bookings, publishing, deletes outside scratch, pushes, merges,
# deploys/VPS changes and real secrets (.env, keys, ~/.ssh, ~/.grok-private).
GRANT_RE = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:(?:ok(?:ay)?|yes|yeah)[,.!]?\s*)?(?:"
    r"(?:full\s+)?(?:permission|permissions|access)\s+(?:is\s+)?granted|"
    r"i\s+(?:grant|give)\s+you\s+(?:full\s+)?(?:permission|access)|"
    r"(?:you\s+have|you've\s+got)\s+(?:my\s+)?(?:full\s+)?(?:permission|access)|"
    r"i\s+(?:allow|authori[sz]e|permit)\s+(?:you|it|this|that)|"
    r"you(?:\s+are|'re)\s+(?:allowed|authori[sz]ed|cleared|permitted)"
    r")(?:\s+to\s+(?:do\s+(?:it|this|that)|go\s+ahead|proceed|continue|look|read|open|search|browse))?"
    r"(?:[,.!]?\s*(?:sir|jarvis|go\s+ahead|do\s+it|proceed|continue|please))*\s*[.!]*\s*$", re.I)
REVOKE_RE = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:"
    r"(?:permission|permissions|access)\s+(?:is\s+)?(?:revoked|removed|denied)|"
    r"(?:i\s+)?revoke\s+(?:your\s+|the\s+)?(?:permission|permissions|access)|"
    r"lock\s+(?:it\s+|yourself\s+)?(?:back\s+)?down|"
    r"(?:go\s+)?back\s+to\s+(?:safe|normal|restricted)\s+mode|"
    r"close\s+(?:open\s+)?access"
    r")(?:\s*,?\s*(?:now|right\s+now|please))?[.!]*\s*$", re.I)


_SOFT_LEAD = re.compile(r"^\s*(?:so|and|now|ok(?:ay)?|alright)\s*,?\s+(?=\S)", re.I)


def _soft(text: str) -> str:
    """"so lock it down?" / "ok, permission granted." -> the bare phrase (route matrix 2026-10-16)."""
    return re.sub(r"[\s?.!]+$", "", _SOFT_LEAD.sub("", str(text or ""), count=1))


def is_grant(text: str) -> bool:
    return bool(GRANT_RE.fullmatch(_soft(text)) or grant_split(text)[0])


# A grant that leads the line, then whatever he wants done: "permission granted, you are allowed to find books"
# -> grant + "find books". Several grant phrases in a row are all consumed.
_GRANT_HEAD = re.compile(
    r"^\s*(?:(?:hey\s+)?jarvis[,.]?\s*)?(?:(?:ok(?:ay)?|yes|yeah|i\s+said)[,.!]?\s*)?(?:"
    r"(?:full\s+)?(?:permission|permissions|access)\s+(?:is\s+)?granted|"
    r"i\s+(?:grant|give)\s+you\s+(?:full\s+)?(?:permission|access)|"
    r"(?:you\s+have|you've\s+got)\s+my\s+(?:full\s+)?(?:permission|access)|"
    r"i\s+(?:allow|authori[sz]e|permit)\s+(?:you|it|this|that)|"
    r"you(?:\s+are|'re)\s+now\s+(?:allowed|authori[sz]ed)"
    r")(?:\s+to\b)?[\s,.:;!-]*", re.I)
# After a real grant, the owner often adds "you are allowed to ..." (Evens 2026-10-15); only then does it chain.
_GRANT_CHAIN = re.compile(r"^\s*you(?:\s+are|'re)\s+(?:now\s+)?(?:allowed|authori[sz]ed|cleared|permitted)(?:\s+to\b)?[\s,.:;!-]*", re.I)
_FILLER = re.compile(r"^(?:(?:so|now|please|sir|jarvis|go\s+ahead|and|then)[\s,.:;!-]*)+", re.I)


GRANT_MAX_CHARS = 200


def grant_split(text: str) -> tuple[bool, str]:
    """(True, remaining command) when the line opens with a grant; (False, "") otherwise.
    Safety audit 2026-10-16: pasted documents often open "You have access to the following tools: ...". Only the owner's
    own short one-line ask can grant: multi-line or long text never does, and "you have access"/"you're permitted"
    without "my"/"now" are document phrasing, not a grant."""
    raw = str(text or "")
    if "\n" in raw.strip() or len(raw) > GRANT_MAX_CHARS:
        return False, ""
    line = _SOFT_LEAD.sub("", raw, count=1)
    found = False
    while True:
        m = _GRANT_HEAD.match(line) or (_GRANT_CHAIN.match(line) if found else None)
        if not m or not m.group(0).strip():
            break
        found, line = True, line[m.end():]
        line = _FILLER.sub("", line)
    if not found:
        return False, ""
    rest = line.strip(" .!?,;:-")
    if re.fullmatch(r"(?:do\s+(?:it|this|that)|proceed|continue|go\s+ahead|now)?", rest, re.I):
        rest = ""
    return True, rest


def is_revoke(text: str) -> bool:
    return bool(REVOKE_RE.fullmatch(_soft(text)))


def open_access() -> bool:
    """True from the owner's grant until his revoke. Tests never see the real owner file."""
    import sys
    if not (os.environ.get("JARVIS_MODE_FILE") or "").strip() and ("_pytest" in sys.modules or "unittest" in sys.modules):
        return False
    return bool(mode().get("open_access"))


def set_open_access(on: bool) -> dict:
    f = _mode_file()
    f.parent.mkdir(parents=True, exist_ok=True)
    data = {**mode(), "open_access": bool(on), "updated": datetime.now().isoformat(timespec="seconds")}
    tmp = f.with_name(f.name + ".tmp")
    tmp.write_text(json.dumps(data, indent=1), encoding="utf-8")
    os.chmod(tmp, 0o600)
    os.replace(tmp, f)
    log_action("mode", "open_access", "on" if on else "off")
    return data


def open_edit_ok(path: Path) -> bool:
    """While open: edits anywhere in the home folder except secrets and ~/Library."""
    try:
        p = path.expanduser().resolve()
    except (OSError, RuntimeError):
        return False
    home = Path.home().resolve()
    return (home in p.parents and not is_secret_path(p)
            and (home / "Library") not in p.parents and p != home / "Library")


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


def is_secret_path(path: str | Path) -> bool:
    text = str(path)
    if STRONG_SECRET_RE.search(text):
        return True
    parts = [p for p in re.split(r"/+", text) if p and p not in (".", "..")]
    for i, part in enumerate(parts):
        if not WEAK_SECRET_WORD.search(part):
            continue
        last = i == len(parts) - 1
        suffix = Path(part).suffix.lower()
        if last and suffix in CODE_SUFFIXES:
            continue  # a code file named for tokens/secrets is code, not a credential
        if not last and not suffix and re.search(r"(?:^|[._-])(?:tokens?|secrets?|credentials?)(?:[._-]|$)", part, re.I) is None:
            continue  # a folder like "tokenizer" or "secret_scanner" is not a secret store
        return True
    return False


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
