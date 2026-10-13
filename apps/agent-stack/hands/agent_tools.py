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
    if WRITE_TOOL.search(tool) and not approved:
        PERM().log_action("mcp_write", f"{server}.{tool}", "confirm")
        return {"ok": False, "verified": False, "gated": True,
                "spoken": f"{server}.{tool} looks like a write (send, create, delete, deploy...). That needs Evens first; I didn't call it."}
    spec = _load("mcp_inventory", "mcp_inventory.py").server_spec(server)
    if not spec:
        return {"ok": False, "verified": False, "spoken": f"No stdio config for {server} in Claude, Cursor or Codex."}
    PERM().log_action("mcp_read", f"{server}.{tool}", "allow")
    ok, text = _mcp_call(spec, tool, arguments or {}, MCP_DEADLINE_S)
    return {"ok": ok, "verified": ok and bool(text.strip()), "output": text,
            "spoken": (f"{server}.{tool} answered: " if ok else f"{server}.{tool} failed: ") + text[:600]}


# ---------------------------------------------------------------- cli
CLI_ALLOW = {
    "gh": re.compile(r"^(pr|issue)\s+(view|list|diff|checks|status)\b|^repo\s+(view|list)\b|^run\s+(list|view)\b|^api\s+(?!-X)(?!--method)\S+$|^auth\s+status$"),
    "git": re.compile(r"^(log|status|diff|show|branch|rev-parse|remote\s+-v|ls-files)\b"),
    "yt-dlp": re.compile(r"^(--version|--dump-json|-j|-F|--list-formats|--get-title|--skip-download)\b"),
    "ffprobe": re.compile(r"^.*$"),
    "ffmpeg": re.compile(r"^(-version|-hide_banner\s+-version)$"),
    "node": re.compile(r"^(--version|-v)$"),
    "python3": re.compile(r"^(--version|-V)$"),
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
                           cwd=cwd or str(Path.home()), stdin=subprocess.DEVNULL)
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
                               text=True, timeout=TEST_DEADLINE_S, env={"PATH": "/usr/bin:/bin:/opt/homebrew/bin", "HOME": str(root)})
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
    skill = skill_first(goal)
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
_CLI = re.compile(r"^\s*(?:jarvis[,:]?\s*)?(?:run\s+)?((?:gh|git|yt-dlp|ffprobe|ffmpeg)\s+.+?)\s*$", re.I)
_MCPC = re.compile(r"\bcall\s+(?:the\s+)?([\w.\-]+)\s+mcp\s+tool\s+([\w.\-]+)(?:\s+with\s+(\{.*\}))?", re.I | re.S)


def wants(u: str) -> bool:
    return bool(_TASK.search(u or "") or _CLI.match(u or "") or _MCPC.search(u or ""))


def args_from_utterance(u: str) -> dict:
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
