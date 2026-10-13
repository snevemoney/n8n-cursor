"""agent_tools — Claude Code / Codex / Cursor parity hand (CANDIDATE).

ops
  mcp   call one tool on any MCP server configured in ~/.claude.json, ~/.cursor/mcp.json or ~/.codex/config.toml.
        The server spec (command, args, env names/values) is read from that config at runtime and never returned,
        logged or committed. Tool names that look like writes (send, create, delete, deploy, merge, pay...) are gated.
  cli   read-only allowlisted CLIs: gh (pr/issue/repo view|list|diff|checks), git (log/status/diff/show/branch),
        yt-dlp (--dump-json/-F/--version), ffprobe, ffmpeg -version, node/python --version.
  repo  coding in a repo under the scratch roots (or edit roots with auto-accept on): branch, write files, run tests
        inside sandbox-exec (no network, writes only in the repo), commit. Never main, never push.
  task  plan -> act -> verify: a todo list of the ops above; every step is checked and the report says
        exactly which steps were verified. Nothing is claimed that was not checked.
Skills read-first: each run looks up the closest skill by keyword and reports its name before acting.
Every decision goes through hands/permissions.decide and is logged (no contents, no secrets).
"""
from __future__ import annotations

import importlib.util
import json
import os
import queue
import re
import shutil
import subprocess
import sys
import threading
import time
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
OUT_CAP = 3000
MCP_DEADLINE_S = float(os.environ.get("JARVIS_AGENT_MCP_DEADLINE") or 40)
CLI_DEADLINE_S = 30
TEST_DEADLINE_S = 60
WRITE_TOOL = re.compile(r"(send|create|delete|remove|trash|update|write|post|publish|deploy|merge|push|pay|purchase|"
                        r"charge|share|invite|upload|insert|drop|execute|exec|run_python|apply|transfer|tiktok)", re.I)
NAME_OK = re.compile(r"^[\w.\-]{1,64}$")
# Allow-by-name: only tools whose name reads as a lookup run without Evens. Anything else (GUI clicks, scripts,
# app commands, writes) is gated, so no MCP tool can drive his Mac or change data on auto-accept.
READ_TOOL = re.compile(r"^(?:[a-z0-9]+[_\-])?(list|get|read|search|find|query|resolve|inspect|check|convert|view|describe|"
                       r"status|analyze|lookup|fetch|show|count|info|overview|explore|compare|trace|xrefs|retrieve)", re.I)


def _load(name: str, file: str):
    key = f"agent_stack_{name}"
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, STACK / "hands" / file)
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


def PERM():
    return _load("permissions", "permissions.py")


def _cap(t: str) -> str:
    t = (t or "").strip()
    return t if len(t) <= OUT_CAP else t[:OUT_CAP] + "…"


_SECRETISH = re.compile(r"(?i)(gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9\-_]{20,}|xox[abp]-[\w-]+|AKIA[0-9A-Z]{16}|"
                        r"(?:api[_-]?key|token|secret|password)\s*[:=]\s*\S+)")


def _scrub(t: str) -> str:
    return _SECRETISH.sub("[redacted]", t or "")


# ---------------------------------------------------------------- skills read-first
def skill_first(goal: str) -> str:
    try:
        sk = _load("skills", "skills.py")
        names = sk._scan(sk.default_roots())
    except Exception:
        return ""
    words = {w for w in re.findall(r"[a-z0-9]{3,}", (goal or "").lower())} - {"the", "and", "for", "with", "run", "use"}
    best, score = "", 0
    for name in names:
        toks = set(re.findall(r"[a-z0-9]{3,}", name.lower()))
        s = len(words & toks)
        if s > score:
            best, score = name, s
    return best


# ---------------------------------------------------------------- mcp
def _mcp_call(spec: dict, tool: str, arguments: dict, deadline: float) -> tuple[bool, str]:
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin") + ":/opt/homebrew/bin:/usr/local/bin", "HOME": os.environ.get("HOME", "")}
    env.update(spec.get("env") or {})
    try:
        proc = subprocess.Popen([spec["command"], *spec.get("args", [])], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.DEVNULL, text=True, env=env)
    except OSError as e:
        return False, f"could not start server ({type(e).__name__})"
    out: queue.Queue = queue.Queue()
    threading.Thread(target=lambda: [out.put(l) for l in proc.stdout], daemon=True).start()  # type: ignore[union-attr]
    end = time.monotonic() + deadline

    def send(m):
        proc.stdin.write(json.dumps(m) + "\n"); proc.stdin.flush()  # type: ignore[union-attr]

    def wait(rid):
        while time.monotonic() < end:
            try:
                line = out.get(timeout=max(0.05, end - time.monotonic()))
            except queue.Empty:
                return None
            try:
                m = json.loads(line)
            except ValueError:
                continue
            if m.get("id") == rid:
                return m
        return None
    try:
        send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {},
              "clientInfo": {"name": "jarvis", "version": "1"}}})
        if wait(1) is None:
            return False, "server did not finish the handshake in time"
        send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        send({"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": tool, "arguments": arguments or {}}})
        m = wait(2)
        if m is None:
            return False, "tool did not answer in time"
        if m.get("error"):
            return False, "tool error: " + str((m["error"] or {}).get("message"))[:300]
        res = m.get("result") or {}
        text = "\n".join(str(c.get("text")) for c in (res.get("content") or []) if isinstance(c, dict) and c.get("type") == "text")
        return (not res.get("isError")), _cap(_scrub(text or json.dumps(res)[:OUT_CAP]))
    except (OSError, ValueError) as e:
        return False, f"pipe error ({type(e).__name__})"
    finally:
        try:
            proc.kill()
        except OSError:
            pass


def op_mcp(server: str, tool: str, arguments: dict | None = None, approved: bool = False) -> dict:
    if not (NAME_OK.match(server or "") and NAME_OK.match(tool or "")):
        return {"ok": False, "verified": False, "spoken": "I need a server name and a tool name."}
    if (WRITE_TOOL.search(tool) or not READ_TOOL.match(tool)) and not approved:
        PERM().log_action("mcp_write", f"{server}.{tool}", "confirm")
        return {"ok": False, "verified": False, "gated": True,
                "spoken": f"{server}.{tool} is not a read-only lookup (it could write, send, run code or drive an app). That needs Evens first; I didn't call it."}
    spec = _load("mcp_inventory", "mcp_inventory.py").server_spec(server)
    PERM().log_action("mcp_read", f"{server}.{tool}", "allow")
    if spec:
        ok, text = _mcp_call(spec, tool, arguments or {}, MCP_DEADLINE_S)
    else:
        got = op_mcp_http_call(server, tool, arguments or {}, MCP_DEADLINE_S)
        if got is None:
            return {"ok": False, "verified": False, "spoken": f"No config for {server} in Claude, Cursor or Codex."}
        ok, text = got
    return {"ok": ok, "verified": ok and bool(text.strip()), "output": text,
            "spoken": (f"{server}.{tool} answered: " if ok else f"{server}.{tool} failed: ") + text[:600]}


# ---------------------------------------------------------------- cli
GWS_SERVICES = "gmail|calendar|drive|docs|sheets|slides|tasks|people|keep|meet|forms|classroom|chat"
CLI_ALLOW = {
    "gh": re.compile(r"^(pr|issue)\s+(view|list|diff|checks|status)\b|^repo\s+(view|list)\b|^run\s+(list|view)\b|^api\s+(?!-X)(?!--method)\S+$|^auth\s+status$"),
    "git": re.compile(r"^(log|status|diff|show|branch|rev-parse|remote\s+-v|ls-files)\b"),
    "yt-dlp": re.compile(r"^(--version|--dump-json|-j|-F|--list-formats|--get-title|--skip-download)\b"),
    "ffprobe": re.compile(r"^.*$"),
    "ffmpeg": re.compile(r"^(-version|-hide_banner\s+-version)$"),
    "node": re.compile(r"^(--version|-v)$"),
    "python3": re.compile(r"^(--version|-V)$"),
    # Google Workspace CLI: positive match only (read helpers, or `<service> <resource…> list|get|query`). Sign-in, request
    # bodies, uploads, file output and any write-ish word fail closed to "needs Evens". A search term that happens to
    # contain such a word is gated too; that is the safe side to err on.
    "gws": re.compile(
        r"^(?!.*(?:--json|--upload|--output|--sanitize)\b)"
        r"(?!.*\b(?:send|reply|forward|insert|update|patch|delete|batch\w*|trash|untrash|modify|import|create|copy|move|"
        r"watch|stop|clear|empty\w*|quickAdd|login|logout|export|auth)\b)"
        rf"(?:{GWS_SERVICES})\s+(?:\+(?:triage|read|agenda)\b|(?:[\w.\-]+\s+){{1,3}}(?:list|get|query)(?:\s|$))"),
}
CLI_GATED = re.compile(r"\b(merge|push|close|delete|create|edit|comment|review|release|deploy|reset|rebase|--force|-X\s*(POST|PUT|PATCH|DELETE))\b", re.I)


def op_cli(argv: list[str], cwd: str | None = None) -> dict:
    if not argv or argv[0] not in CLI_ALLOW:
        return {"ok": False, "verified": False, "spoken": f"{(argv or ['?'])[0]} isn't on the read-only CLI list."}
    rest = " ".join(argv[1:])
    if CLI_GATED.search(rest) or not CLI_ALLOW[argv[0]].search(rest):
        PERM().log_action("cli", argv[0] + " " + rest[:80], "confirm")
        return {"ok": False, "verified": False, "gated": True, "spoken": f"`{argv[0]} {rest}` is not read-only. That needs Evens."}
    exe = shutil.which(argv[0], path=os.environ.get("PATH", "") + ":/opt/homebrew/bin:/usr/local/bin")
    if not exe:
        return {"ok": False, "verified": False, "spoken": f"{argv[0]} is not installed."}
    PERM().log_action("cli", argv[0] + " " + rest[:80], "allow")
    try:
        p = subprocess.run([exe, *argv[1:]], capture_output=True, text=True, timeout=CLI_DEADLINE_S,
                           cwd=cwd or (str(STACK.parents[1]) if argv[0] == "git" else str(Path.home())), stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return {"ok": False, "verified": False, "spoken": f"{argv[0]} timed out after {CLI_DEADLINE_S}s."}
    text = _cap(_scrub(p.stdout or p.stderr))
    ok = p.returncode == 0
    return {"ok": ok, "verified": ok and bool(text), "output": text, "exit": p.returncode,
            "spoken": (f"{argv[0]} ok: " if ok else f"{argv[0]} exited {p.returncode}: ") + text[:600]}


# ---------------------------------------------------------------- repo (sandboxed coding)
def _git(repo: Path, *a) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(repo), *a], capture_output=True, text=True, timeout=CLI_DEADLINE_S)


def _sandbox_profile(repo: Path) -> str:
    r = str(repo.resolve()).replace('"', '\\"')
    return ('(version 1)(allow default)(deny network*)(deny file-write*)'
            f'(allow file-write* (subpath "{r}") (subpath "/private/tmp") (subpath "/private/var/folders") (literal "/dev/null"))')


def _repo_ok(repo: Path) -> str:
    perm = PERM()
    if perm.is_secret_path(repo):
        return "confirm"
    return perm.decide("edit", str(repo))


def op_repo(repo: str, action: str, **kw) -> dict:
    root = Path(os.path.expanduser(repo or ""))
    if not repo:
        return {"ok": False, "verified": False, "spoken": "Which repo?"}
    if not root.is_absolute():
        root = PERM().scratch_roots()[0] / repo
    if _repo_ok(root) != "allow":
        PERM().log_action("repo", str(root), "confirm", action=action)
        return {"ok": False, "verified": False, "gated": True,
                "spoken": f"{root} is outside the scratch roots (or auto-accept is off). That needs Evens."}
    PERM().log_action("repo", str(root), "allow", action=action)
    if action == "init":
        root.mkdir(parents=True, exist_ok=True)
        if not (root / ".git").exists():
            _git(root, "init", "-q", "-b", "scratch")
            _git(root, "config", "user.email", "jarvis@localhost"); _git(root, "config", "user.name", "Jarvis")
        ok = (root / ".git").is_dir()
        return {"ok": ok, "verified": ok, "spoken": f"repo ready at {root}" if ok else "git init failed"}
    if action == "branch":
        name = str(kw.get("name") or "")
        if not re.fullmatch(r"[\w./\-]{1,80}", name) or PERM().decide("git_branch", name) != "allow":
            return {"ok": False, "verified": False, "gated": True, "spoken": f"branch '{name}' needs Evens (main/master or bad name)."}
        _git(root, "checkout", "-q", "-B", name)
        cur = _git(root, "symbolic-ref", "--short", "HEAD").stdout.strip()
        return {"ok": cur == name, "verified": cur == name, "spoken": f"on branch {cur}"}
    if action == "write":
        rel = str(kw.get("path") or "")
        dest = (root / rel).resolve()
        if not rel or root.resolve() not in dest.parents or PERM().is_secret_path(dest):
            return {"ok": False, "verified": False, "spoken": f"refused path {rel!r}"}
        dest.parent.mkdir(parents=True, exist_ok=True)
        body = str(kw.get("content") or "")
        dest.write_text(body, encoding="utf-8")
        ok = dest.read_text(encoding="utf-8") == body
        return {"ok": ok, "verified": ok, "spoken": f"wrote {rel} ({len(body)} chars), read back {'matches' if ok else 'DIFFERS'}"}
    if action == "test":
        cmd = kw.get("cmd") or ["python3", "-m", "unittest", "discover", "-v"]
        if isinstance(cmd, str):
            cmd = cmd.split()
        if cmd[0] not in {"python3", "pytest", "node", "npm", "make"}:
            return {"ok": False, "verified": False, "spoken": f"test runner {cmd[0]} not allowed"}
        sb = shutil.which("sandbox-exec")
        if not sb:
            return {"ok": False, "verified": False, "spoken": "no sandbox-exec; I won't run tests bare."}
        exe = "/usr/bin/python3" if cmd[0] == "python3" else (shutil.which(cmd[0]) or cmd[0])
        try:
            p = subprocess.run([sb, "-p", _sandbox_profile(root), exe, *cmd[1:]], cwd=str(root), capture_output=True,
                               text=True, timeout=TEST_DEADLINE_S, env={"PATH": "/usr/bin:/bin:/opt/homebrew/bin", "HOME": "/private/tmp", "PYTHONDONTWRITEBYTECODE": "1"})
        except subprocess.TimeoutExpired:
            return {"ok": False, "verified": False, "spoken": "tests timed out"}
        text = _cap((p.stdout or "") + (p.stderr or ""))
        ok = p.returncode == 0
        tail = text.strip().splitlines()[-1] if text.strip() else ""
        return {"ok": ok, "verified": ok, "output": text, "spoken": f"tests {'passed' if ok else 'FAILED'} ({tail})"}
    if action == "commit":
        br = _git(root, "symbolic-ref", "--short", "HEAD").stdout.strip()
        if PERM().decide("git_commit", br) != "allow":
            return {"ok": False, "verified": False, "gated": True, "spoken": f"commit on {br} needs Evens."}
        msg = str(kw.get("message") or "jarvis: scratch commit")[:200]
        _git(root, "add", "-A")
        c = _git(root, "commit", "-q", "-m", msg)
        head = _git(root, "log", "-1", "--format=%h %s").stdout.strip()
        ok = c.returncode == 0 and msg[:40] in head
        return {"ok": ok, "verified": ok, "spoken": f"committed {head}" if ok else f"commit failed: {_cap(c.stderr or c.stdout)[:200]}"}
    if action in {"push", "merge"}:
        PERM().log_action(action, str(root), "confirm")
        return {"ok": False, "verified": False, "gated": True, "spoken": f"{action} needs Evens; not done."}
    return {"ok": False, "verified": False, "spoken": f"unknown repo action {action}"}


# ---------------------------------------------------------------- task loop
def _step(s: dict, approved: bool) -> dict:
    op = s.get("op")
    if op == "mcp":
        return op_mcp(s.get("server", ""), s.get("tool", ""), s.get("arguments") or {}, approved)
    if op == "cli":
        argv = s.get("argv") or str(s.get("cmd") or "").split()
        return op_cli(argv, s.get("cwd"))
    if op == "repo":
        return op_repo(s.get("repo", ""), s.get("action", ""), **{k: v for k, v in s.items() if k not in {"op", "repo", "action"}})
    if op == "mcp_list":
        return op_mcp_list(s.get("server", ""))
    if op == "code":
        return op_code(s.get("repo", ""), s.get("goal", ""), s.get("branch") or "jarvis/code")
    if op == "web":
        ws = _load("web_search", "web_search.py")
        got = ws.run({"query": s.get("query", "")})
        cites = got.get("cites") or []
        return {"ok": bool(got.get("ok")), "verified": bool(got.get("ok") and cites), "cites": cites,
                "spoken": str(got.get("spoken") or "")[:600]}
    return {"ok": False, "verified": False, "spoken": f"unknown op {op}"}


def run(args: dict | None = None, approved: bool = False) -> dict:
    args = args or {}
    steps = args.get("steps") or ([args] if args.get("op") else [])
    goal = str(args.get("goal") or " ".join(str(s.get("tool") or s.get("action") or s.get("cmd") or " ".join(s.get("argv") or []) or s.get("query") or "") for s in steps))
    if len(steps) == 1 and steps[0].get("op") == "code":
        got = op_code(steps[0].get("repo", ""), steps[0].get("goal", ""), steps[0].get("branch") or "jarvis/code")
        return got
    ranked = rank_skills(goal, 1) if args.get("goal") else []
    skill = ranked[0] if ranked else skill_first(goal)
    if not steps:
        return {"ok": False, "verified": False, "steps": [], "skill": skill,
                "spoken": "I need at least one step (mcp, cli, repo or web). Nothing was run."}
    todo = [{"n": i + 1, "op": s.get("op"), "what": s.get("action") or s.get("tool") or s.get("cmd") or " ".join(s.get("argv") or []) or s.get("query") or "",
             "status": "pending"} for i, s in enumerate(steps[:12])]
    results = []
    for item, s in zip(todo, steps[:12]):
        got = _step(s, approved)  # act
        item["status"] = "verified" if got.get("verified") else ("needs Evens" if got.get("gated") else "failed")  # verify
        item["result"] = str(got.get("spoken") or "")[:400]
        if got.get("cites"):
            item["cites"] = got["cites"][:5]
        results.append(got)
        if item["status"] != "verified" and not args.get("keep_going"):
            break
    done = sum(1 for t in todo if t["status"] == "verified")
    all_ok = done == len(todo)
    lines = [f"{t['n']}. [{t['status']}] {t['op']} {t['what']}: {t.get('result', 'not run')}" for t in todo]
    head = (f"Skill read first: {skill}. " if skill else "") + f"{done}/{len(todo)} steps verified."
    if not all_ok:
        head += " Not done: I stopped at the first unverified step."
    return {"ok": all_ok, "verified": all_ok, "steps": todo, "skill": skill,
            "spoken": head + " " + " ".join(lines), "cites": [c for t in todo for c in t.get("cites", [])]}


# ---------------------------------------------------------------- routing
_TASK = re.compile(r"^\s*(?:jarvis[,:]?\s*)?agent\s+task\s*:?\s*(\{.*\})\s*$", re.I | re.S)
_CLI = re.compile(r"^\s*(?:jarvis[,:]?\s*)?(?:run\s+)?((?:gh|git|yt-dlp|ffprobe|ffmpeg|gws)\s+.+?)\s*$", re.I)
_MCPC = re.compile(r"\bcall\s+(?:the\s+)?([\w.\-]+)\s+mcp\s+tool\s+([\w.\-]+)(?:\s+with\s+(\{.*\}))?", re.I | re.S)


_LIST = re.compile(r"\blist\s+(?:the\s+)?([\w.\-]+)\s+mcp\s+tools\b", re.I)
_CODE = re.compile(r"^\s*(?:jarvis[,:]?\s*)?in\s+(?:the\s+)?scratch\s+repo\s+([\w.\-]+)\s*[,:]\s*(.+?)\s*$", re.I | re.S)


def wants(u: str) -> bool:
    return bool(_LIST.search(u or "") or _CODE.match(u or "") or _TASK.search(u or "") or _CLI.match(u or "") or _MCPC.search(u or ""))


def args_from_utterance(u: str) -> dict:
    m = _LIST.search(u or "")
    if m:
        return {"op": "mcp_list", "server": m.group(1)}
    m = _CODE.match(u or "")
    if m:
        return {"steps": [{"op": "code", "repo": m.group(1), "goal": m.group(2)}]}
    m = _TASK.search(u or "")
    if m:
        try:
            return json.loads(m.group(1))
        except ValueError:
            return {}
    m = _MCPC.search(u or "")
    if m:
        try:
            a = json.loads(m.group(3)) if m.group(3) else {}
        except ValueError:
            a = {}
        return {"op": "mcp", "server": m.group(1), "tool": m.group(2), "arguments": a}
    m = _CLI.match(u or "")
    if m:
        import shlex
        try:
            return {"op": "cli", "argv": shlex.split(m.group(1))}
        except ValueError:
            return {}
    return {}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "steps": len(g.get("steps") or []),
            "verified": sum(1 for s in g.get("steps") or [] if s.get("status") == "verified"), "skill": bool(g.get("skill"))}


# ================================================================ round 2
# ---------------------------------------------------------------- model access (key read from env at runtime)
CODE_MODEL = (os.environ.get("JARVIS_CODE_MODEL") or "anthropic/claude-opus-5.5").strip()
CODE_MODEL_BACKUP = (os.environ.get("JARVIS_CODE_MODEL_BACKUP") or "anthropic/claude-sonnet-5.5").strip()
RANK_MODEL = (os.environ.get("JARVIS_SKILL_RANK_MODEL") or "x-ai/grok-4.7").strip()


def _or_key() -> str:
    k = (os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if k:
        return k
    try:  # same .env files the face loads; value stays in memory, never logged
        on = _load_brain_online()
        for f in on.default_env_files() + [STACK.parents[1] / ".env.local"]:
            v = on.parse_dotenv(f).get("OPENROUTER_API_KEY") if f.exists() else None
            if v:
                return v.strip()
    except Exception:
        pass
    return ""


def _load_brain_online():
    key = "agent_stack_online_for_tools"
    if key not in sys.modules:
        spec = importlib.util.spec_from_file_location(key, STACK / "brain" / "online.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[key] = mod
        spec.loader.exec_module(mod)
    return sys.modules[key]


def llm(messages: list[dict], model: str, timeout: float = 120, max_tokens: int = 6000) -> tuple[str, str]:
    """(text, model_used). Tries model then the backup. Returns ('', '') if both fail."""
    import urllib.request
    key = _or_key()
    if not key:
        return "", ""
    chain = [model] + ([CODE_MODEL_BACKUP] if model == CODE_MODEL else []) + \
        ([CODE_MODEL_BACKUP] if model == RANK_MODEL else [])
    for m in chain:
        body = json.dumps({"model": m, "messages": messages, "max_tokens": max_tokens, "temperature": 0}).encode()
        req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=body, headers={
            "Authorization": f"Bearer {key}", "Content-Type": "application/json", "X-Title": "Jarvis agent_tools"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                d = json.loads(r.read().decode())
            text = str(((d.get("choices") or [{}])[0].get("message") or {}).get("content") or "")
            if text.strip():
                return text, m
        except Exception:
            continue
    return "", ""


# ---------------------------------------------------------------- skills ranked by the model
def rank_skills(goal: str, k: int = 3) -> list[str]:
    try:
        sk = _load("skills", "skills.py")
        table = sk._scan(sk.default_roots())
    except Exception:
        return []
    words = set(re.findall(r"[a-z0-9]{3,}", (goal or "").lower()))
    scored = []
    for name, val in table.items():
        desc = str(val[1] if isinstance(val, tuple) and len(val) > 1 else "")
        toks = set(re.findall(r"[a-z0-9]{3,}", (name + " " + desc).lower()))
        scored.append((len(words & toks), name, desc[:140]))
    scored.sort(key=lambda x: -x[0])
    short = [s for s in scored if s[0] > 0][:60] or scored[:60]
    listing = "\n".join(f"- {n}: {d}" for _, n, d in short)
    text, _ = llm([{"role": "user", "content": f"Task: {goal}\nPick the {k} skills most useful for this task from the list. "
                    f"Answer with names only, one per line, best first. If none fit, answer NONE.\n{listing}"}],
                  RANK_MODEL, timeout=20, max_tokens=200)
    low = {n.lower(): n for n in table}
    names = [low[c] for c in (re.sub(r"^\s*(?:\d+[.)]|[-*])?\s*", "", l).strip(" `*:").split(":")[0].strip().lower()
                              for l in text.splitlines()) if c in low]
    if names:
        return names[:k]
    return [s[1] for s in short[:k] if s[0] > 0] if not text.strip().upper().startswith("NONE") else []


def skill_text(name: str, cap: int = 3000) -> str:
    try:
        sk = _load("skills", "skills.py")
        path = sk._scan(sk.default_roots())[name][0]
        return Path(path).read_text(encoding="utf-8", errors="replace")[:cap]
    except Exception:
        return ""


# ---------------------------------------------------------------- HTTP / URL MCP servers
def http_spec(name: str) -> dict | None:
    """Internal only: url + header values from the same configs. Never returned or logged."""
    try:
        on = _load_brain_online()
        if on is not None and hasattr(on, "load_existing_env"):
            on.load_existing_env()
    except Exception:
        pass
    # Jarvis-owned OAuth refresh for URL MCP servers (hostinger/n8n) before building headers.
    try:
        if (name or "").strip().lower() in {"hostinger", "n8n"}:
            oauth = _load("mcp_oauth", "mcp_oauth.py")
            oauth.ensure_access((name or "").strip().lower())
    except Exception:
        pass
    inv = _load("mcp_inventory", "mcp_inventory.py")
    for _src, path in inv.DEFAULT_PATHS:
        path = Path(path)
        try:
            text = path.read_text(encoding="utf-8")
            if path.suffix == ".toml":
                import tomllib
                servers = tomllib.loads(text).get("mcp_servers") or {}
            else:
                data = json.loads(text)
                servers = dict(data.get("mcpServers") or {})
                for p in (data.get("projects") or {}).values():
                    if isinstance(p, dict):
                        servers.update(p.get("mcpServers") or {})
        except Exception:
            continue
        s = servers.get(name)
        if isinstance(s, dict) and s.get("url"):
            hdr = {str(k): os.path.expandvars(str(v)) for k, v in (s.get("headers") or s.get("http_headers") or {}).items()}
            env_tok = s.get("bearer_token_env_var")
            if env_tok and os.environ.get(env_tok):
                hdr["Authorization"] = "Bearer " + os.environ[env_tok]
            return {"url": str(s["url"]), "headers": hdr}
    return None


def _http_rpc(spec: dict, calls: list[dict], deadline: float) -> list[dict | None]:
    import urllib.request
    import urllib.error
    sess: dict = {}
    end = time.monotonic() + deadline
    # Prefer older first (n8n); fall back to Hostinger-supported versions on -32022.
    versions = ["2025-03-26", "2025-06-18", "2025-11-25"]
    proto = (spec.get("protocol") or os.environ.get("JARVIS_MCP_PROTOCOL") or "").strip()
    if proto:
        versions = [proto] + [v for v in versions if v != proto]

    def post(msg: dict, protocol: str) -> dict | None:
        h = {"Content-Type": "application/json", "Accept": "application/json, text/event-stream",
             "MCP-Protocol-Version": protocol,
             "User-Agent": "JarvisMCP/1.0 (Macintosh; compatible)",
             **spec.get("headers", {})}
        if sess.get("id"):
            h["Mcp-Session-Id"] = sess["id"]
        req = urllib.request.Request(spec["url"], data=json.dumps(msg).encode(), headers=h, method="POST")
        with urllib.request.urlopen(req, timeout=max(1.0, end - time.monotonic())) as r:
            sid = r.headers.get("Mcp-Session-Id")
            if sid:
                sess["id"] = sid
            body = r.read().decode("utf-8", errors="replace")
            if "text/event-stream" in (r.headers.get("Content-Type") or ""):
                for line in body.splitlines():
                    if line.startswith("data:"):
                        try:
                            m = json.loads(line[5:])
                        except ValueError:
                            continue
                        if m.get("id") == msg.get("id"):
                            return m
                return None
            return json.loads(body) if body.strip() and "id" in msg else None

    chosen = versions[0]
    init_msg = {"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {
        "protocolVersion": chosen, "capabilities": {}, "clientInfo": {"name": "jarvis", "version": "1"}}}
    last_err: Exception | None = None
    for ver in versions:
        init_msg["params"]["protocolVersion"] = ver
        try:
            post(init_msg, ver)
            chosen = ver
            last_err = None
            break
        except urllib.error.HTTPError as e:
            last_err = e
            body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            if e.code == 400 and "Unsupported protocol version" in body:
                continue
            raise
    if last_err is not None:
        raise last_err
    try:
        post({"jsonrpc": "2.0", "method": "notifications/initialized"}, chosen)
    except Exception:
        pass
    out: list = []
    for i, c in enumerate(calls, start=2):
        out.append(post({"jsonrpc": "2.0", "id": i, **c}, chosen))
    return out


def _stdio_list(spec: dict, deadline: float) -> tuple[bool, list[str], str]:
    mc = _load("mcp_call", "mcp_call.py")
    tools = mc._list_tools(spec, deadline)
    return (tools is not None), (tools or []), ("" if tools is not None else "no answer in time")


def op_mcp_list(server: str, deadline: float = 30) -> dict:
    """Live handshake + tools/list on one configured server (stdio or URL). Names only."""
    if not NAME_OK.match(server or ""):
        return {"ok": False, "verified": False, "spoken": "which server?"}
    PERM().log_action("mcp_read", f"{server}.tools/list", "allow")
    spec = _load("mcp_inventory", "mcp_inventory.py").server_spec(server)
    try:
        if spec:
            ok, tools, why = _stdio_list(spec, deadline)
            kind = "stdio"
        else:
            hs = http_spec(server)
            if not hs:
                return {"ok": False, "verified": False, "spoken": f"no config for {server}"}
            kind = "http"
            res = _http_rpc(hs, [{"method": "tools/list", "params": {}}], deadline)[0] or {}
            tools = sorted(str(t.get("name")) for t in ((res.get("result") or {}).get("tools") or []) if isinstance(t, dict))
            ok, why = bool(res.get("result")), str((res.get("error") or {}).get("message") or "")[:200]
    except Exception as e:  # noqa: BLE001
        code = getattr(e, "code", "")
        return {"ok": False, "verified": False, "server": server,
                "spoken": f"{server} failed: {type(e).__name__} {code}".strip()}
    return {"ok": ok, "verified": ok and bool(tools), "server": server, "kind": kind, "tools": tools,
            "spoken": (f"{server} ({kind}) offers {len(tools)} tools: " + ", ".join(tools[:12]) + ("…" if len(tools) > 12 else ""))
            if ok else f"{server} ({kind}) failed: {why}"}


def op_mcp_http_call(server: str, tool: str, arguments: dict, deadline: float = 40) -> tuple[bool, str] | None:
    hs = http_spec(server)
    if not hs:
        return None
    try:
        res = _http_rpc(hs, [{"method": "tools/call", "params": {"name": tool, "arguments": arguments or {}}}], deadline)[0] or {}
    except Exception as e:  # noqa: BLE001
        return False, f"{type(e).__name__} {getattr(e, 'code', '')}".strip()
    if res.get("error"):
        return False, "tool error: " + str(res["error"].get("message"))[:300]
    r = res.get("result") or {}
    text = "\n".join(str(c.get("text")) for c in (r.get("content") or []) if isinstance(c, dict) and c.get("type") == "text")
    return (not r.get("isError")), _cap(_scrub(text or json.dumps(r)[:OUT_CAP]))


# ---------------------------------------------------------------- agentic coding loop (model writes the code)
CODE_SYS = ("You are Jarvis's coding agent working in a git repo. Reply with ONE JSON object only, no prose, no fences:\n"
            '{"plan":["short steps"],"files":{"relative/path.py":"full new file content"},"test_cmd":"python3 -m unittest discover -v",'
            '"commit_message":"...","done":false}\n'
            "Rules: write full file contents; always include or update tests; test_cmd must start with python3, pytest, node, npm or make; "
            "no network, no secrets, never touch .env or credentials; set done=true only when the last test run passed and nothing "
            "else is needed. Keep it small.")
MAX_ITERS = int(os.environ.get("JARVIS_CODE_ITERS") or 4)


def _json_obj(text: str) -> dict:
    t = re.sub(r"^```(?:json)?|```$", "", (text or "").strip(), flags=re.M).strip()
    i, j = t.find("{"), t.rfind("}")
    try:
        return json.loads(t[i:j + 1]) if i >= 0 else {}
    except ValueError:
        return {}


def _tree(root: Path, cap: int = 6000) -> str:
    out = []
    for p in sorted(root.rglob("*")):
        if ".git" in p.parts or not p.is_file() or p.stat().st_size > 20000:
            continue
        rel = p.relative_to(root)
        if PERM().is_secret_path(rel):
            continue
        out.append(f"--- {rel}\n{p.read_text(encoding='utf-8', errors='replace')}")
    s = "\n".join(out)
    return s[:cap]


def op_code(repo: str, goal: str, branch: str = "jarvis/code") -> dict:
    """Plan -> edit -> test -> read failures -> fix -> commit, driven by the strongest coding model."""
    todo: list[dict] = []
    skills = rank_skills(goal)
    guide = "\n\n".join(f"# skill {n}\n{skill_text(n, 1500)}" for n in skills[:2])

    def step(what, got):
        todo.append({"n": len(todo) + 1, "what": what, "status": "verified" if got.get("verified") else
                     ("needs Evens" if got.get("gated") else "failed"), "result": str(got.get("spoken") or "")[:300]})
        return got.get("verified")
    if not step("init", op_repo(repo, "init")) or not step(f"branch {branch}", op_repo(repo, "branch", name=branch)):
        return _code_report(todo, skills, "", False)
    root = Path(os.path.expanduser(repo)) if os.path.isabs(os.path.expanduser(repo)) else PERM().scratch_roots()[0] / repo
    history = [{"role": "system", "content": CODE_SYS}]
    last_test, model_used, passed, plan = "", "", False, []
    gi = root / ".gitignore"
    if not gi.exists():
        gi.write_text("__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n", encoding="utf-8")
    if any(p.suffix in {".py", ".js", ".ts"} for p in root.iterdir() if p.is_file()):
        got0 = op_repo(str(root), "test")  # read the current failures before the model edits anything
        last_test = "(baseline before edits) " + str(got0.get("output") or got0.get("spoken"))[-2500:]
        step("baseline test", {"verified": True, "spoken": got0.get("spoken")})
    for it in range(1, MAX_ITERS + 1):
        history.append({"role": "user", "content": f"Goal: {goal}\n\nRelevant skills:\n{guide or '(none)'}\n\nRepo now:\n{_tree(root)}\n\n"
                        f"Last test output (iteration {it - 1}):\n{last_test or '(none yet)'}"})
        text, model_used = llm(history, CODE_MODEL)
        if not text:
            step(f"iter {it} model", {"verified": False, "spoken": "no model answer (key missing or both models failed)"})
            break
        history.append({"role": "assistant", "content": text[:8000]})
        d = _json_obj(text)
        plan = plan or [str(x)[:120] for x in (d.get("plan") or [])][:7]
        files = d.get("files") or {}
        if not isinstance(files, dict):
            files = {}
        for path, content in list(files.items())[:10]:
            if not step(f"iter {it} write {path}", op_repo(str(root), "write", path=str(path), content=str(content))):
                return _code_report(todo, skills, model_used, False, plan)
        got = op_repo(str(root), "test", cmd=str(d.get("test_cmd") or "python3 -m unittest discover -v"))
        last_test = str(got.get("output") or got.get("spoken"))[-2500:]
        passed = bool(got.get("verified"))
        step(f"iter {it} test", got)
        if passed:
            step("commit", op_repo(str(root), "commit", message=str(d.get("commit_message") or goal)[:100]))
            break
    return _code_report(todo, skills, model_used, passed and todo[-1]["status"] == "verified", plan)


def _code_report(todo, skills, model, ok, plan=None) -> dict:
    done = sum(1 for t in todo if t["status"] == "verified")
    lines = " ".join(f"{t['n']}. [{t['status']}] {t['what']}: {t['result']}" for t in todo)
    head = (f"Skills read first: {', '.join(skills)}. " if skills else "") + (f"Model: {model}. " if model else "")
    head += ("Plan: " + "; ".join(plan) + ". ") if plan else ""
    head += ("Done and verified: tests pass and committed. " if ok else
             f"NOT done: {done}/{len(todo)} steps verified; tests did not pass or the commit didn't land. ")
    return {"ok": ok, "verified": ok, "steps": todo, "skill": ", ".join(skills), "model": model, "spoken": head + lines}
