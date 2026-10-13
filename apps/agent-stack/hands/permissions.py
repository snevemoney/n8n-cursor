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
    return bool(SECRET_RE.search(str(path)))


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
