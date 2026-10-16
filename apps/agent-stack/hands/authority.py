"""One authorization gate for Jarvis's hands (Evens 2026-10-15).

Open by default: ordinary operations run without asking. Jarvis asks first ONLY before the five kept stops —
sending messages or posts, spending money, deleting his files, merging to main or public pushes, revealing secrets —
plus machine-destructive commands. A denial is returned to the model as data so it can try another way.
"""
from __future__ import annotations

import os
import re
import shlex
from pathlib import Path

ALLOW, ASK, DENY = "allow", "ask", "deny"

# Kept stops in shell form (moved from brain/pipeline.py, 10-15).
CLI_HARD = re.compile(r"\b(?:merge|push|delete|rm|release|deploy|publish|send|post|purchase|buy|--force)\b|"
                      # revealing secrets / uploading data still asks
                      r"^(?:security|printenv|env|op|pass|keychain)\b|\bauth\s+token\b|\bdump-keychain\b|"
                      r"\s(?:-F|-d|-T|--data\S*|--upload-file|--form)\b", re.I)
CLI_MORE = re.compile(
    r"^gh\s+(?:issue|pr|gist|repo|release)\b.*\b(?:create|comment|edit|close|delete|merge)\b|^gh\s+api\b.*(?:-X|--method)\s*(?:POST|PUT|PATCH|DELETE)|"
    r"^(?:mail|mailx|sendmail|osascript)\b|(?:^|\s)-X\s*(?:POST|PUT|PATCH|DELETE)\b|"
    r"^(?:rmdir|trash|unlink|shred|srm)\b|\s-delete\b", re.I)
# Machine-destructive: never without Evens (moved from hands/agent_tools.py).
CLI_MACHINE = re.compile(r"(?:^|\s)(?:sudo|mkfs|dd|shutdown|reboot|halt|diskutil\s+(?:erase|partition)|launchctl\s+(?:unload|remove|bootout))\b", re.I)
SECRET_ARG = re.compile(r"(^|/)(\.env[^/]*|\.ssh|\.aws|\.gnupg|\.netrc|\.pgpass|\.docker|\.kube|\.git-credentials|"
                        r"id_(?:rsa|dsa|ecdsa|ed25519)[^/]*|[^/]*\.(?:pem|key|p12|kdbx)|credentials[^/]*|secrets?(?:\.[a-z0-9]+)?|"
                        r"[^/]*(?:_token|api[_-]?key)[^/]*|Keychains?)(/|$)|/\.config/gh/", re.I)
MCP_STOP = re.compile(r"(?:send|post|publish|delete|remove|pay|purchase|merge|push|deploy|tweet|reply)", re.I)
SYSTEM_PREFIXES = ("/System", "/bin", "/sbin", "/usr", "/etc", "/private/etc", "/Library", "/Applications")


def _segments(command: str) -> list[list[str]]:
    """Every simple command in a pipeline or list: `a | b && c; d` -> [[a], [b], [c], [d]]."""
    out = []
    for part in re.split(r"\|\||&&|[|;\n]", command or ""):
        try:
            words = shlex.split(part)
        except ValueError:
            words = part.split()
        if words:
            out.append(words)
    return out


def cli_needs_owner(argv) -> bool:
    """True when a shell command touches one of Evens's kept stops or harms the machine."""
    if isinstance(argv, str):
        return any(cli_needs_owner(seg) for seg in _segments(argv))
    args = [str(a) for a in (argv or [])]
    line = " ".join(args)
    return bool(CLI_HARD.search(line) or CLI_MORE.search(line) or CLI_MACHINE.search(line)
                or any(SECRET_ARG.search(os.path.expanduser(a)) for a in args[1:]))


def is_secret_path(path) -> bool:
    return bool(SECRET_ARG.search(os.path.expanduser(str(path))))


def authorize(tool: str, args: dict, *, home: Path | None = None) -> tuple[str, str]:
    """(decision, reason). ask = needs Evens's OK first; deny = never; allow = go."""
    home = Path(home or Path.home())
    args = args or {}
    if tool == "shell":
        cmd = str(args.get("command") or "")
        if CLI_MACHINE.search(cmd):
            return ASK, "that command can damage the machine"
        if cli_needs_owner(cmd):
            return ASK, "that command sends, spends, deletes, pushes or touches secrets"
        return ALLOW, ""
    if tool in ("read_file", "write_file", "edit_file", "list_dir", "grep"):
        path = Path(os.path.expanduser(str(args.get("path") or "")))
        if is_secret_path(path):
            return DENY, "that is a secret file"
        if tool in ("write_file", "edit_file"):
            resolved = str(path.resolve() if path.is_absolute() else (home / path).resolve())
            if resolved.startswith(SYSTEM_PREFIXES):
                return DENY, "system files are off limits"
            if not resolved.startswith(str(home.resolve())):
                return ASK, "that writes outside your home folder"
        return ALLOW, ""
    if tool == "mcp" and MCP_STOP.search(str(args.get("tool") or "")):
        return ASK, "that MCP tool sends, publishes, deletes, pays or pushes"
    return ALLOW, ""
