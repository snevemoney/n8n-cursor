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
                      r"^(?:curl|wget|http|https|xh)\b.*\s(?:-F|-d|-T|--data\S*|--upload-file|--form)\b", re.I)  # upload flags of upload tools only (live: ls -d asked)
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
CLI_MACHINE = re.compile(r"(?:^|\s)(?:sudo|mkfs|dd|shutdown|reboot|halt|diskutil\s+(?:erase\w*|partition\w*|zero\w*|secureErase|apfs\s+delete\w*)|"
                         r"launchctl\s+(?:unload|remove|bootout)|csrutil|spctl|tccutil|nvram|pmset|systemsetup|networksetup)\b", re.I)
# 10-17 security pass: these ran with no question asked
CLI_SYSTEM_SETTING = re.compile(r"(?:^|\s)defaults\s+(?:write|delete)\s+(?:-g\b|NSGlobalDomain|com\.apple\.)", re.I)
CLI_PIPE_EXEC = re.compile(r"\|\s*(?:sudo\s+)?(?:ba|z|da|k)?sh\b|\b(?:ba|z)?sh\s+<\(\s*(?:curl|wget)|\b(?:curl|wget)\b[^|;&]*\|\s*(?:python3?|perl|ruby|node)\s*-?\s*(?:$|[;&|])", re.I)
# 10-17 security pass: login items, shell startup files, schedules and agent settings make code run on their own later
_PERSIST = (r"Library/Launch(?:Agents|Daemons)/|/\.(?:zshrc|zprofile|zshenv|zlogin|bashrc|bash_profile|profile)$|"
            r"/\.claude/settings[^/]*\.json$|/\.claude\.json$|/\.cursor/mcp\.json$|/\.codex/config\.toml$|/\.mcp\.json$")
PERSIST_PATH = re.compile(_PERSIST)
CLI_PERSIST = re.compile(r"(?:>>?|\btee\b(?:\s+-a)?|\bcp\b|\bmv\b|\bln\b)[^|;&]*(?:Library/Launch(?:Agents|Daemons)|\.(?:zshrc|zprofile|zshenv|bashrc|bash_profile|profile)\b|"
                         r"\.claude/settings|\.claude\.json|\.cursor/mcp\.json|\.codex/config\.toml)|\bcrontab\s+(?!-l\b)\S|\|\s*crontab\b|"
                         r"\blaunchctl\s+(?:load|bootstrap|enable)\b|\bosascript\b[^|;&]*login item", re.I)
SENSITIVE_APP = re.compile(r"\b(?:system settings|system preferences|keychain access|passwords|1password|bitwarden|"
                           r"com\.apple\.(?:systempreferences|keychainaccess|passwords))\b", re.I)
CUA_READ = re.compile(r"^(?:get_|list_|check_|health|verify_|zoom|parse_)", re.I)


def _app_of_pid(pid: str) -> str:
    try:
        import subprocess as _sp
        return _sp.run(["ps", "-p", pid, "-o", "comm="], capture_output=True, text=True, timeout=5).stdout.strip()
    except Exception:  # noqa: BLE001 - unknown process: no extra gate (the cua write gate still applies)
        return ""


RUNNABLE_RE = re.compile(r"\.(?:command|sh|zsh|bash|tool|terminal|pkg|mpkg|scpt|applescript|workflow|jar|py)$", re.I)
PAGE_EXFIL = re.compile(r"\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|importScripts|indexedDB|localStorage|"
                        r"sessionStorage|caches)\b|document\.cookie|window\.open|(?:location|location\.href)\s*=|\.submit\s*\(|"
                        r"new\s+Image\b|\.src\s*=", re.I)
CLI_KEYCHAIN_WRITE = re.compile(r"\bsecurity\s+(?:add-|set-|import|unlock-keychain|create-keychain|default-keychain|"
                                r"authorizationdb|trust-settings-import|add-trusted)", re.I)
CLI_TRASH = re.compile(r"(?:^|\s)(?:mv\b[^|;&]*\.Trash\b|trash\s)", re.I)
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
        if CLI_PIPE_EXEC.search(cmd):
            return ASK, "that command runs code downloaded from the internet"
        if CLI_SYSTEM_SETTING.search(cmd):
            return ASK, "that command changes a macOS system setting"
        if CLI_TRASH.search(cmd):
            return ASK, "that command moves files to the Trash"
        if CLI_KEYCHAIN_WRITE.search(cmd):
            return ASK, "that command changes your Keychain"
        if re.search(r"\bosascript\b", cmd) and SENSITIVE_APP.search(cmd):
            return ASK, "that command scripts a system, security or password app"
        if CLI_PERSIST.search(cmd):
            return ASK, "that command makes something run on its own or changes how your agents are set up"
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
            if PERSIST_PATH.search(resolved):
                return ASK, "that makes something run on its own or changes how your agents are set up"
        if is_secret_path(path):
            return ALLOW, "flag: that file holds secrets"  # Evens 10-16: flag, never stop
        return ALLOW, ""
    if tool in ("app", "app_type") and SENSITIVE_APP.search(str(args.get("app") or "")) \
            and (tool == "app_type" or str(args.get("action") or "read") != "read"):
        # 10-17 security pass: system and password settings are his to change (prohibited for agents)
        return ASK, "that changes a system, security or password setting"
    if tool == "open":
        t = os.path.expanduser(str(args.get("target") or "")).rstrip("/")
        runs = RUNNABLE_RE.search(t) or (t.lower().endswith(".app") and "/" in t
                                         and not t.startswith(("/Applications/", "/System/Applications/", str(home / "Applications") + "/")))
        if runs:  # 10-17 security pass: open runs scripts, installers and downloaded apps
            return ASK, "that runs a program or installer"
    if tool == "safari" and str(args.get("action") or "") == "eval" and PAGE_EXFIL.search(str(args.get("code") or "")):
        # 10-17 security pass: page code in his logged-in Safari could read cookies/storage and send them anywhere
        return ASK, "that runs page code that could read your logins or send data off the page"
    if tool == "signal" and str(args.get("action") or "") == "push":
        return ASK, "that pushes the signal packets to his public GitHub repo"
    if tool == "mcp" and str(args.get("server") or "") == "cua-driver" and not CUA_READ.match(str(args.get("tool") or "")):
        # open access lets cua-driver click/type without asking; never inside system or password settings
        pid = str((args.get("arguments") or {}).get("pid") or "")
        if pid.isdigit() and SENSITIVE_APP.search(_app_of_pid(pid)):
            return ASK, "that changes a system, security or password setting"
    if tool == "mcp" and MCP_STOP.search(str(args.get("tool") or "")):
        return ASK, "that MCP tool sends, publishes, deletes, pays or pushes"
    return ALLOW, ""
