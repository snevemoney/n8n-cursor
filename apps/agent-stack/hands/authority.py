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
                      # uploading data still asks; READING secrets is flagged, not stopped (Evens 10-16)
                      r"\s(?:-F|-d|-T|--data\S*|--upload-file|--form)\b", re.I)
CLI_MORE = re.compile(
    r"^gh\s+(?:issue|pr|gist|repo|release)\b.*\b(?:create|comment|edit|close|delete|merge)\b|^gh\s+api\b.*(?:-X|--method)\s*(?:POST|PUT|PATCH|DELETE)|"
    r"^(?:mail|mailx|sendmail)\b|(?:^|\s)-X\s*(?:POST|PUT|PATCH|DELETE)\b|"
    # AppleScript asks only when the script itself sends, posts, deletes or empties (live 21:16: "play document 1" was refused)
    r"^osascript\b.*\b(?:send|reply|post|tweet|message|mail|delete|trash|empty|erase|purchase|buy|pay)\b|"
    r"^(?:rmdir|trash|unlink|shred|srm)\b|\s-delete\b|-exec(?:dir)?\s+(?:rm|unlink|shred|srm)\b|"
    # safety audit 2026-10-16 holes, each a kept stop: uploads, GraphQL writes, deploys, spend, deletes of his work
    r"^(?:scp|sftp)\b|^rsync\b.*\s\S+:\S*|^aws\s+s3\s+(?:cp|mv|sync|rm)\b|^gh\s+api\s+graphql\b.*\bmutation\b|"
    r"\s--prod\b|^(?:terraform|tofu)\s+(?:apply|destroy)\b|^pulumi\s+(?:up|destroy)\b|^kubectl\s+(?:apply|delete)\b|"
    r"^stripe\b|^crontab\s+-r\b|^git\s+(?:branch\s+.*-[dD]\b|clean\s+.*-\w*f|checkout\s+--\s|restore\b|reset\s+--hard)|"
    r"\b(?:uninstall|prune)\b", re.I)
# Machine-destructive: never without Evens (moved from hands/agent_tools.py).
CLI_MACHINE = re.compile(r"(?:^|\s)(?:sudo|mkfs|dd|shutdown|reboot|halt|diskutil\s+(?:erase|partition)|launchctl\s+(?:unload|remove|bootout))\b", re.I)
SECRET_ARG = re.compile(r"(^|/)(\.env[^/]*|\.ssh|\.aws|\.gnupg|\.netrc|\.pgpass|\.docker|\.kube|\.git-credentials|"
                        r"id_(?:rsa|dsa|ecdsa|ed25519)[^/]*|[^/]*\.(?:pem|key|p12|kdbx)|credentials[^/]*|secrets?(?:\.[a-z0-9]+)?|"
                        r"[^/]*(?:_token|api[_-]?key)[^/]*|Keychains?)(/|$)|/\.config/gh/", re.I)
SECRET_READ_CMD = re.compile(r"(?:^|[;&|]\s*)(?:printenv|env|security\s+find-\S+|op\s+(?:read|item\s+get)|pass\s+show)\b", re.I)
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


def _looks_like_path(arg: str) -> bool:
    """A search phrase like 'token budget' is not a file; paths have a slash, ~, a leading dot or an extension."""
    return not arg.startswith("-") and bool(re.search(r"/|^~|^\.|\.[A-Za-z0-9]{1,8}$", arg))


def cli_needs_owner(argv) -> bool:
    """True when a shell command touches one of Evens's kept stops or harms the machine."""
    if isinstance(argv, str):
        return any(cli_needs_owner(seg) for seg in _segments(argv))
    args = [str(a) for a in (argv or [])]
    line = " ".join(args)
    return bool(CLI_HARD.search(line) or CLI_MORE.search(line) or CLI_MACHINE.search(line))


def _permissions():
    import importlib.util as _u
    import sys as _s
    mod = _s.modules.get("agent_stack_permissions")
    if mod is None:
        spec = _u.spec_from_file_location("agent_stack_permissions", Path(__file__).with_name("permissions.py"))
        mod = _u.module_from_spec(spec); _s.modules["agent_stack_permissions"] = mod; spec.loader.exec_module(mod)
    return mod


def is_secret_path(path) -> bool:
    """One answer for files and shell arguments: hands/permissions.py (code named for tokens is not a secret)."""
    expanded = os.path.expanduser(str(path))
    return bool(_permissions().is_secret_path(expanded) or re.search(r"/\.config/gh/", expanded))


def authorize(tool: str, args: dict, *, home: Path | None = None) -> tuple[str, str]:
    """(decision, reason). ask = needs Evens's OK first; deny = never; allow = go."""
    home = Path(home or Path.home())
    args = args or {}
    if tool == "shell":
        cmd = str(args.get("command") or "")
        if CLI_MACHINE.search(cmd):
            return ASK, "that command can damage the machine"
        if cli_needs_owner(cmd):
            return ASK, "that command sends, spends, deletes or pushes"
        if SECRET_READ_CMD.search(cmd) or any(is_secret_path(w) for seg in _segments(cmd) for w in seg[1:] if _looks_like_path(w)):
            return ALLOW, "flag: that command reads secrets"
        return ALLOW, ""
    if tool in ("read_file", "write_file", "edit_file", "list_dir", "grep"):
        path = Path(os.path.expanduser(str(args.get("path") or "")))
        if tool in ("write_file", "edit_file"):
            if is_secret_path(path):
                return ASK, "that changes a secret file"
            resolved = str(path.resolve() if path.is_absolute() else (home / path).resolve())
            if resolved.startswith(SYSTEM_PREFIXES):
                return DENY, "system files are off limits"
            if not resolved.startswith(str(home.resolve())):
                return ASK, "that writes outside your home folder"
        if is_secret_path(path):
            return ALLOW, "flag: that file holds secrets"  # Evens 10-16: flag, never stop
        return ALLOW, ""
    if tool == "mcp" and MCP_STOP.search(str(args.get("tool") or "")):
        return ASK, "that MCP tool sends, publishes, deletes, pays or pushes"
    return ALLOW, ""
