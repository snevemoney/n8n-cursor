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
import hashlib
import configparser
import stat
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
def _mcp_session(spec: dict, calls: list, deadline: float, *, result_fn=None) -> list:
    """One stdio server, one handshake, several tools/call in order. Returns [(ok, text)] for the calls that ran; a failure
    ends the list with (False, reason) so a later call never runs on a broken state."""
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin") + ":/opt/homebrew/bin:/usr/local/bin", "HOME": os.environ.get("HOME", "")}
    env.update(spec.get("env") or {})
    try:
        proc = subprocess.Popen([spec["command"], *spec.get("args", [])], stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                stderr=subprocess.DEVNULL, text=True, env=env)
    except OSError as e:
        return [(False, f"could not start server ({type(e).__name__})")]
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
    results: list = []
    try:
        send({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {},
              "clientInfo": {"name": "jarvis", "version": "1"}}})
        if wait(1) is None:
            return [(False, "server did not finish the handshake in time")]
        send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        for rid, (tool, arguments) in enumerate(calls, start=2):
            send({"jsonrpc": "2.0", "id": rid, "method": "tools/call", "params": {"name": tool, "arguments": arguments or {}}})
            m = wait(rid)
            if m is None:
                return results + [(False, "tool did not answer in time")]
            if m.get("error"):
                return results + [(False, "tool error: " + str((m["error"] or {}).get("message"))[:300])]
            res = m.get("result") or {}
            if result_fn is not None:
                _host_mcp_result(result_fn, res)
            text = "\n".join(str(c.get("text")) for c in (res.get("content") or []) if isinstance(c, dict) and c.get("type") == "text")
            results.append(((not res.get("isError")), _cap(_scrub(text or json.dumps(res)[:OUT_CAP]))))
            if res.get("isError"):
                break
        return results
    except (OSError, ValueError) as e:
        return results + [(False, f"pipe error ({type(e).__name__})")]
    finally:
        try:
            proc.kill()
        except OSError:
            pass


def _host_mcp_result(callback, result):
    """Bounded host-only actual result; never model arguments or speech output."""
    if not callable(callback):raise ValueError("host result callback required")
    raw=json.dumps(result,ensure_ascii=False).encode()
    if len(raw)>65536:raise ValueError("host MCP result exceeds bound")
    callback(json.loads(raw))


def _mcp_call(spec: dict, tool: str, arguments: dict, deadline: float, *, result_fn=None) -> tuple[bool, str]:
    return _mcp_session(spec, [(tool, arguments)], deadline, result_fn=result_fn)[-1]


def op_mcp(server: str, tool: str, arguments: dict | None = None, approved: bool = False, *, result_fn=None) -> dict:
    if not (NAME_OK.match(server or "") and NAME_OK.match(tool or "")):
        return {"ok": False, "verified": False, "spoken": "I need a server name and a tool name."}
    writing = bool(WRITE_TOOL.search(tool) or not READ_TOOL.match(tool))
    if writing and approved is not True and _open_access() and not OPEN_MCP_HARD.search(tool):
        approved = True  # open access: create/update/open/run tools go; sends, deletes, publishes, payments still wait for Evens
    if writing and approved is not True:
        PERM().log_action("mcp_write", f"{server}.{tool}", "confirm")
        return {"ok": False, "verified": False, "gated": True,
                "spoken": f"{server}.{tool} is not a read-only lookup (it could write, send, run code or drive an app). That needs Evens first; I didn't call it."}
    spec = _load("mcp_inventory", "mcp_inventory.py").server_spec(server)
    PERM().log_action("mcp_write" if writing else "mcp_read", f"{server}.{tool}", "owner_approved" if writing else "allow")
    if spec:
        ok, text = _mcp_call(spec, tool, arguments or {}, MCP_DEADLINE_S, result_fn=result_fn)
    else:
        got = op_mcp_http_call(server, tool, arguments or {}, MCP_DEADLINE_S, result_fn=result_fn)
        if got is None:
            return {"ok": False, "verified": False, "spoken": f"No config for {server} in Claude, Cursor or Codex."}
        ok, text = got
    return {"ok": ok, "verified": ok and bool(text.strip()) and not writing, "output": text,
            "action_executed": bool(ok and writing), "outcome_verified": False if writing else bool(ok and text.strip()),
            "spoken": (f"{server}.{tool} was called with your approval; its outcome still needs verification: " if ok and writing
                       else f"{server}.{tool} answered: " if ok else f"{server}.{tool} failed: ") + text[:600]}


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
    # The write-word check stops at `--params`, so a search term like "update plan" is not mistaken for a write verb; the
    # flag check covers the whole line (DOTALL, so a newline cannot hide a flag).
    "gws": re.compile(
        r"^(?!.*(?:--json|--upload|--output|--sanitize)\b)"
        r"(?!(?:(?!\s--params\b).)*\b(?:send|reply|forward|insert|update|patch|delete|batch\w*|trash|untrash|modify|import|"
        r"create|copy|move|watch|stop|clear|empty\w*|quickAdd|login|logout|export|auth)\b)"
        rf"(?:{GWS_SERVICES})\s+(?:\+(?:triage|read|agenda)\b|(?:[\w.\-]+\s+){{1,3}}(?:list|get|query)(?:\s|$))", re.S),
}
# Open access ("permission granted"): any installed CLI and any MCP write except the consequential ones below.
OPEN_CLI_HARD = re.compile(r"(?:^|\s)(?:sudo|rm|rmdir|mkfs|dd|shutdown|reboot|halt|diskutil\s+(?:erase|partition)|launchctl\s+(?:unload|remove|bootout))\b|"
                           r"\b(?:push|merge|deploy|publish|release|send|reset\s+--hard|clean\s+-[a-z]*f|--force|force-push|"
                           r"delete|destroy|drop\s+(?:table|database))\b|(?:^|\s)(?:-X|--request)\s*=?\s*(?:POST|PUT|PATCH|DELETE)\b|"
                           r"(?:^|\s)--force\b", re.I)
OPEN_MCP_HARD = re.compile(r"(send|delete|remove|trash|publish|deploy|merge|push|pay|purchase|charge|transfer|share|invite|tiktok|"
                           r"drop|destroy|post_message|reply|forward)", re.I)


def _open_access() -> bool:
    try:
        return bool(PERM().open_access())
    except Exception:  # noqa: BLE001
        return False


CLI_GATED = re.compile(r"\b(merge|push|close|delete|create|edit|comment|review|release|deploy|reset|rebase|--force|-X\s*(POST|PUT|PATCH|DELETE))\b", re.I)


def op_cli(argv: list[str], cwd: str | None = None, *, max_output_chars: int = OUT_CAP) -> dict:
    if argv and argv[0] != "gws" and _open_access():
        return _op_cli_open(argv, cwd, max_output_chars=max_output_chars)
    if not argv or argv[0] not in CLI_ALLOW:
        return {"ok": False, "verified": False, "spoken": f"{(argv or ['?'])[0]} isn't on the read-only CLI list."}
    rest = " ".join(argv[1:])
    gate_text = rest.split(" --params ", 1)[0] if argv[0] == "gws" else rest  # a search term is data, not a verb
    shape_ok = argv[0] != "gws" or _load("gws_natural", "gws_natural.py").argv_is_read_only(argv)
    if CLI_GATED.search(gate_text) or not CLI_ALLOW[argv[0]].search(rest) or not shape_ok:
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
    if argv[0] == "gws":  # speech, never raw JSON; a missing sign-in gets a plain answer
        g = _load("gws_natural", "gws_natural.py")
        res = g.speak(g.kind_of(argv[1:]), p.stdout or "", p.stderr or "", p.returncode)
        return {"ok": res["ok"], "verified": res["ok"], "exit": p.returncode, "auth_missing": res["auth_missing"],
                "spoken": _scrub(res["spoken"])}
    # Fixed host metadata probes need complete bounded JSON, not a speech-sized
    # prefix with a missing closing delimiter. Default CLI output stays unchanged.
    limit = max(1, min(int(max_output_chars), 80000))
    raw_text = _scrub(p.stdout or p.stderr).strip()
    truncated = len(raw_text) > limit
    text = raw_text[:limit] + ("…" if truncated else "")
    ok = p.returncode == 0
    return {"ok": ok, "verified": ok and bool(text), "output": text, "exit": p.returncode,
            "output_truncated": truncated,
            "spoken": (f"{argv[0]} ok: " if ok else f"{argv[0]} exited {p.returncode}: ") + text[:600]}


def _op_cli_open(argv: list[str], cwd: str | None, *, max_output_chars: int = OUT_CAP) -> dict:
    """Open access: any installed CLI, run without a shell; consequential verbs still need Evens."""
    line = " ".join(argv)
    if OPEN_CLI_HARD.search(line):
        PERM().log_action("cli", line[:80], "confirm", open_access=True)
        return {"ok": False, "verified": False, "gated": True,
                "spoken": f"`{line[:120]}` deletes, pushes, deploys or sends. That still needs Evens."}
    exe = shutil.which(argv[0], path=os.environ.get("PATH", "") + ":/opt/homebrew/bin:/usr/local/bin")
    if not exe:
        return {"ok": False, "verified": False, "spoken": f"{argv[0]} is not installed. Ask me to install it."}
    PERM().log_action("cli", line[:80], "allow", open_access=True)
    try:
        p = subprocess.run([exe, *argv[1:]], capture_output=True, text=True, timeout=max(CLI_DEADLINE_S, 120),
                           cwd=cwd or str(Path.home()), stdin=subprocess.DEVNULL)
    except subprocess.TimeoutExpired:
        return {"ok": False, "verified": False, "spoken": f"{argv[0]} timed out."}
    limit = max(1, min(int(max_output_chars), 80000))
    raw_text = _scrub(p.stdout or p.stderr).strip()
    text = raw_text[:limit] + ("…" if len(raw_text) > limit else "")
    ok = p.returncode == 0
    return {"ok": ok, "verified": ok and bool(text), "output": text, "exit": p.returncode, "output_truncated": len(raw_text) > limit,
            "spoken": (f"{argv[0]} ok: " if ok else f"{argv[0]} exited {p.returncode}: ") + text[:600]}


# ---------------------------------------------------------------- ArtCraft: open a file and inspect it, read-only
# app -> (open tool, inspect tool, extensions). Fixed table: the model never picks the tool, so no save/export/edit can run.
# Verified live (local headless server, no network): pdfcraft, gridcraft. The rest are names from tools/list: UNVERIFIED.
CRAFT_INSPECT = {
    "pdfcraft": ("doc_open", "doc_inspect", {".pdf"}),
    "wordcraft": ("open_document", "inspect_document", {".docx", ".doc", ".odt", ".txt"}),
    "deckcraft": ("open_presentation", "inspect_document", {".pptx", ".deckcraft"}),
    "gridcraft": ("open_workbook", "inspect_workbook", {".xlsx", ".csv", ".gridcraft"}),
    "designcraft": ("open_document", "inspect_document", {".designcraft", ".idml"}),
    "photocraft": ("doc_open", "doc_inspect", {".pcraft", ".png", ".jpg", ".jpeg"}),
    "vectorcraft": ("open_file", "inspect_document", {".svg", ".ai", ".vcraft"}),
    "effectcraft": ("open_project", "doc_inspect", {".ecraft", ".effectcraft"}),
    "cadcraft": ("open", "inspect_drawing", {".dxf", ".dwg", ".cadcraft"}),
    "soundcraft": ("open_session", "inspect_session", {".scraft", ".soundcraft", ".wav"}),
}
CRAFT_DEADLINE_S = 45


_CRAFT_NOISE = {"path", "undo", "redo", "warnings", "activeCell", "activeSheet", "calcMode", "mode", "selection", "theme", "doc",
                "index", "editable", "dirty", "version"}


def craft_summary(app: str, text: str) -> str:
    """Counts and names from an inspect result, never a dump. Unknown shapes degrade to a length note."""
    try:
        d = json.loads(text)
    except ValueError:
        return ""
    if isinstance(d, dict) and isinstance(d.get("documents"), list) and d["documents"]:
        d = {**(d["documents"][0].get("document") or {}), "documents": len(d["documents"])}
    if not isinstance(d, dict):
        return ""
    bits = []
    first = ("title", "name", "pages", "sheets", "slides", "layers", "artboards", "tracks", "entities", "documents")
    for k, v in sorted(list(d.items())[:60], key=lambda kv: first.index(kv[0]) if kv[0] in first else len(first)):
        if k in _CRAFT_NOISE or v in (None, "", [], {}, False):
            continue
        if isinstance(v, (str, int, float, bool)):
            bits.append(f"{k}: {str(v)[:60]}")
        elif isinstance(v, list):
            noun = k if len(v) != 1 else k.rstrip("s")
            bits.append(f"{len(v)} {noun}")
        if len(bits) >= 8:
            break
    return ", ".join(bits)[:380]


def op_craft_inspect(app: str, path: str) -> dict:
    app = str(app or "").strip().lower()
    row = CRAFT_INSPECT.get(app)
    if not row:
        return {"ok": False, "verified": False,
                "spoken": f"I can't open a file in {app or 'that app'} to inspect it; that one has no read-only file open."}
    open_tool, inspect_tool, exts = row
    wr = _load("workspace_read", "workspace_read.py")
    real, why = wr._resolve(str(path or ""), wr._roots(None)) if str(path or "").strip() else (None, "no file named")
    if real is None or not real.is_file():
        return {"ok": False, "verified": False, "spoken": f"I won't open that: {why or 'not a file'}."}
    if real.suffix.lower() not in exts:
        return {"ok": False, "verified": False, "spoken": f"{app} opens {', '.join(sorted(exts))} files; this is {real.suffix or 'a file with no extension'}."}
    spec = _load("mcp_inventory", "mcp_inventory.py").server_spec(app)
    if not spec:
        return {"ok": False, "verified": False, "spoken": f"No {app} server in the Claude, Cursor or Codex config."}
    PERM().log_action("mcp_read", f"{app}.{open_tool}+{inspect_tool}", "allow")
    got = _mcp_session(spec, [(open_tool, {"path": str(real)}), (inspect_tool, {})], CRAFT_DEADLINE_S)
    if len(got) < 2 or not all(ok for ok, _ in got):
        return {"ok": False, "verified": False,
                "spoken": f"{app} couldn't inspect {real.name}: {(got[-1][1] if got else 'no answer')[:160]}"}
    summary = craft_summary(app, got[1][1])
    if not summary:
        return {"ok": True, "verified": False, "spoken": f"{app} opened {real.name}, but I couldn't summarize what it reported."}
    return {"ok": True, "verified": True, "spoken": _scrub(f"{real.name} in {app}: {summary}.")}


# ---------------------------------------------------------------- fan-out: up to 3 scratch-sandboxed workers, one merged report
def op_fanout(args: dict, approved: bool = False) -> dict:
    PERM().log_action("fanout", f"{len(args.get('tasks') or [])} tasks", "allow")
    # op_code is looked up at call time so tests (and a future smarter worker) can replace it
    return _load("fanout", "fanout.py").run({**args, "approved": approved is True},
                                            code_worker=lambda ask, repo: op_code(repo, ask, "jarvis/fanout"))


# ---------------------------------------------------------------- Google reads by name, sent-mail duplicate guard
def op_gws_read(kind: str, name: str, rng: str | None = None) -> dict:
    PERM().log_action("cli", f"gws read {kind}", "allow")
    got = _load("gws_reads", "gws_reads.py").read_named(str(kind), str(name), rng if isinstance(rng, str) else None)
    return {"ok": got["ok"], "verified": got["ok"], "auth_missing": got["auth_missing"], "untrusted": got["untrusted"],
            "spoken": _scrub(got["spoken"])}


def op_sent_check(to: str, subject: str, days: int = 3) -> dict:
    PERM().log_action("cli", "gws sent-mail check", "allow")
    try:
        d = int(days)
    except (TypeError, ValueError):
        d = 3
    got = _load("gws_reads", "gws_reads.py").check_sent_duplicate(str(to), str(subject), d)
    ok = got["status"] == "clear"   # only a clean "clear" is a green light; duplicate/possible/unknown all stop the send
    return {"ok": ok, "verified": ok, "status": got["status"], "count": got["count"], "auth_missing": got["auth_missing"],
            "spoken": _scrub(got["spoken"])}


# ---------------------------------------------------------------- repo (sandboxed coding)
def _git(repo: Path, *a, binary=False) -> subprocess.CompletedProcess:
    # Validate metadata without asking Git: even `status` may launch fsmonitor.
    _code_git_metadata(Path(repo))
    if not (Path(repo)/".git").exists() and (not a or a[0] != "init"):
        return subprocess.CompletedProcess(a,128,b"" if binary else "",b"" if binary else "")
    env = {"PATH":"/usr/bin:/bin:/usr/sbin:/sbin", "HOME":os.environ.get("HOME", ""), "LANG":"C.UTF-8"}
    env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_SYSTEM="/dev/null", GIT_CONFIG_GLOBAL="/dev/null",
               GIT_ATTR_NOSYSTEM="1", GIT_TERMINAL_PROMPT="0", GIT_PAGER="cat")
    return subprocess.run(["/usr/bin/git", "-c", "core.hooksPath=/dev/null", "-c", "core.fsmonitor=false", "-c", "core.attributesFile=/dev/null",
                           "-C", str(repo), *a], capture_output=True, text=not binary,
                          timeout=CLI_DEADLINE_S, env=env)


def _sandbox_profile(repo: Path) -> str:
    r = str(repo.resolve()).replace('"', '\\"')
    return ('(version 1)(allow default)(deny network*)(deny file-write*)'
            f'(allow file-write* (subpath "{r}") (subpath "/private/tmp") (subpath "/private/var/folders") (literal "/dev/null"))')


def _repo_ok(repo: Path) -> str:
    perm = PERM()
    if perm.is_secret_path(repo):
        return "confirm"
    return perm.decide("edit", str(repo))


def _test_runner_command(cmd, root):
    """A test receipt must come from a test runner, never inline shell output."""
    import shlex
    if isinstance(cmd,str):
        try:cmd=shlex.split(cmd)
        except ValueError:return None
    if not isinstance(cmd,list) or not cmd or not all(isinstance(x,str) for x in cmd):return None
    def runner(argv):
        return bool(argv and (argv[0] in {"pytest","jest","vitest","mocha"}
            or argv[0]=="python3" and len(argv)>=3 and argv[1]=="-m" and argv[2] in {"unittest","pytest"}
            or argv[0]=="node" and len(argv)>=2 and argv[1]=="--test"))
    if runner(cmd):return cmd
    if cmd in (["npm","test"],["npm","run","test"]):
        path=root/"package.json"
        if path.is_symlink() or not path.is_file() or path.stat().st_size>200000:return None
        try:
            scripts=json.loads(path.read_text()).get("scripts",{})
            if scripts.get("pretest") or scripts.get("posttest"):return None
            body=scripts.get("test","")
            if not isinstance(body,str) or re.search(r"[;&|`$<>\n]",body):return None
            return cmd if runner(shlex.split(body)) else None
        except (ValueError,OSError,AttributeError):return None
    if cmd==["make","test"]:
        path=root/"Makefile"
        if path.is_symlink() or not path.is_file() or path.stat().st_size>200000:return None
        text=path.read_text()
        # Make evaluates the whole file. Only a standalone literal test target
        # can be attributed to the declaration checked here; complex Makefiles
        # should name their underlying test runner directly.
        text="\n".join(line for line in text.splitlines() if line.strip() and not line.lstrip().startswith("#"))+"\n"
        match=re.fullmatch(r"(?:\.PHONY:[ \t]*test[ \t]*\n)?test:[ \t]*\n((?:\t[^\n]*\n)+)",text)
        if not match:return None
        lines=[line.strip().lstrip("@") for line in match.group(1).splitlines() if line.strip()]
        try:return cmd if lines and all(not re.search(r"[;&|`$<>]",line) and runner(shlex.split(line)) for line in lines) else None
        except ValueError:return None
    return None


def _test_counts(output):
    """Record executed tests; a zero-test exit code is not a test pass."""
    text=str(output or "")
    if (re.search(r"(?im)^FAILED(?:\s|$)|^FAIL(?:\s|:)|^ERROR(?:\s|:)|^#\s+fail\s+[1-9]",text)
        or re.search(r"\b[1-9]\d*\s+(?:failed|errors?)\b",text,re.I)):
        return {"tests_run":None,"tests_passed":0,"runner_receipt":"failure"}
    unittest_counts=list(re.finditer(r"Ran\s+(\d+)\s+tests?\b",text))
    if unittest_counts:
        unittest_count=unittest_counts[-1]
        total=int(unittest_count.group(1))
        skipped=re.search(r"OK\s*\(skipped=(\d+)\)",text[unittest_count.end():])
        return {"tests_run":total,"tests_passed":max(0,total-(int(skipped.group(1)) if skipped else 0)),"runner_receipt":"unittest"}
    passed=re.findall(r"\b(\d+)\s+passed\b",text)
    if passed:
        return {"tests_run":int(passed[-1]),"tests_passed":int(passed[-1]),"runner_receipt":"test_summary"}
    tap=re.search(r"(?m)^#\s+tests\s+(\d+)\s*$",text)
    tap_pass=re.search(r"(?m)^#\s+pass\s+(\d+)\s*$",text)
    if tap and tap_pass:
        return {"tests_run":int(tap.group(1)),"tests_passed":int(tap_pass.group(1)),"runner_receipt":"tap"}
    return {"tests_run":None,"tests_passed":None,"runner_receipt":"unavailable"}


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
        cmd = _test_runner_command(cmd,root)
        if cmd is None:
            return {"ok": False, "verified": False, "spoken": "The command does not identify a supported test runner; no tests were run."}
        sb = shutil.which("sandbox-exec")
        if not sb:
            return {"ok": False, "verified": False, "spoken": "no sandbox-exec; I won't run tests bare."}
        exe = sys.executable if cmd[0] == "python3" else (shutil.which(cmd[0]) or cmd[0])
        # Resolve the installed runner before test discovery adds the repo: a
        # local unittest.py/pytest.py must not impersonate the test framework.
        runner_args = (["-P"] if cmd[0] == "python3" else []) + cmd[1:]
        try:
            p = subprocess.run([sb, "-p", _sandbox_profile(root), exe, *runner_args], cwd=str(root), capture_output=True,
                               text=True, timeout=TEST_DEADLINE_S, env={"PATH": "/usr/bin:/bin:/opt/homebrew/bin", "HOME": "/private/tmp", "PYTHONDONTWRITEBYTECODE": "1"})
        except subprocess.TimeoutExpired:
            return {"ok": False, "verified": False, "spoken": "tests timed out"}
        raw = (p.stdout or "") + (p.stderr or "")
        counts = _test_counts(raw)
        text = raw if len(raw)<=OUT_CAP else raw[:OUT_CAP//2]+"\n[output capped]\n"+raw[-OUT_CAP//2:]
        ok = p.returncode == 0 and bool(counts.get("tests_passed"))
        tail = text.strip().splitlines()[-1] if text.strip() else ""
        return {"ok": ok, "verified": ok, "output": text, "exit_code":p.returncode, **counts,
                "spoken": f"tests {'passed' if ok else 'not verified'} ({tail})"}
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
def _step(s: dict, approved: bool, *, cancel_check=None, progress=None) -> dict:
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
    if op == "fanout":
        return op_fanout({k: v for k, v in s.items() if k != "op"}, approved)
    if op == "craft_inspect":
        return op_craft_inspect(s.get("app", ""), s.get("path", ""))
    if op == "gws_read":
        return op_gws_read(s.get("kind", ""), s.get("name", ""), s.get("range"))
    if op == "sent_check":
        return op_sent_check(s.get("to", ""), s.get("subject", ""), s.get("days") or 3)
    if op == "code":
        return op_code(s.get("repo", ""), s.get("goal", ""), s.get("branch") or "jarvis/code", cancel_check=cancel_check, progress=progress)
    if op == "web":
        ws = _load("web_search", "web_search.py")
        got = ws.run({"query": s.get("query", "")})
        cites = got.get("cites") or []
        return {"ok": bool(got.get("ok")), "verified": bool(got.get("ok") and cites), "cites": cites,
                "spoken": str(got.get("spoken") or "")[:600]}
    return {"ok": False, "verified": False, "spoken": f"unknown op {op}"}


def _cancelled(steps=None, results=None) -> dict:
    return {"ok": False, "verified": False, "cancelled": True, "status": "CANCELLED",
            "steps": list(steps or []), "results": list(results or []), "partial": bool(results), "spoken": "The task was stopped. Its requested outcome is not verified."}


def _stopped(cancel_check) -> bool:
    if cancel_check is None:
        return False
    try:
        return bool(cancel_check())
    except Exception:
        return True  # uncertain cancellation authority cannot permit another mutation


def _progress(progress, row) -> None:
    if progress is not None:
        progress(dict(row))


import contextvars
from contextlib import contextmanager
_SOURCE_EXCEPTION=contextvars.ContextVar('host_source_exception',default=None)
@contextmanager
def source_exception_scope(callback):
    if callback is not None and not callable(callback):raise ValueError('host source callback required')
    token=_SOURCE_EXCEPTION.set(callback)
    try:yield
    finally:_SOURCE_EXCEPTION.reset(token)
def _reviewed_source(repo,relative,sha):
    callback=_SOURCE_EXCEPTION.get()
    return bool(callback is not None and callback(str(repo),str(relative),sha) is True)
def run(args=None,approved=False,*,source_exception_guard=None,**kw):
    if isinstance(args,dict) and 'source_exception_guard' in args:raise ValueError('model arguments cannot confer source authority')
    with source_exception_scope(source_exception_guard):return _run(args,approved,**kw)


def _run(args: dict | None = None, approved: bool = False, *, cancel_check=None, progress=None, checkpoint=None, resume_checkpoint=None, mutation_guard=None) -> dict:
    if _stopped(cancel_check):
        return _cancelled()
    args = args or {}
    steps = args.get("steps") or ([args] if args.get("op") else [])
    goal = str(args.get("goal") or " ".join(str(s.get("tool") or s.get("action") or s.get("cmd") or " ".join(s.get("argv") or []) or s.get("query") or "") for s in steps))
    if len(steps) == 1 and steps[0].get("op") == "code":
        got = op_code(steps[0].get("repo", ""), steps[0].get("goal", ""), steps[0].get("branch") or "jarvis/code", cancel_check=cancel_check, progress=progress, checkpoint=checkpoint, resume_checkpoint=resume_checkpoint,
                      **({"mutation_guard":mutation_guard} if mutation_guard is not None else {}))
        return got
    if len(steps) == 1 and (steps[0].get("op") in {"gws_read", "sent_check", "craft_inspect", "fanout"}
                            or (steps[0].get("op") == "cli" and (steps[0].get("argv") or [""])[0] == "gws")):
        got = _step(steps[0], approved, cancel_check=cancel_check, progress=progress)
        return _cancelled() if _stopped(cancel_check) else got
    ranked = rank_skills(goal, 1) if args.get("goal") else []
    skill = ranked[0] if ranked else skill_first(goal)
    if not steps:
        return {"ok": False, "verified": False, "steps": [], "skill": skill,
                "spoken": "I need at least one step (mcp, cli, repo or web). Nothing was run."}
    todo = [{"n": i + 1, "op": s.get("op"), "what": s.get("action") or s.get("tool") or s.get("cmd") or " ".join(s.get("argv") or []) or s.get("query") or "",
             "status": "pending"} for i, s in enumerate(steps[:12])]
    results = []
    for item, s in zip(todo, steps[:12]):
        if _stopped(cancel_check):
            return _cancelled(todo, results)
        _progress(progress, dict(item, status="running"))
        if _stopped(cancel_check):
            return _cancelled(todo, results)
        try:
            got = _step(s, approved, cancel_check=cancel_check, progress=progress)
            if not isinstance(got, dict):
                raise ValueError("invalid executor receipt")
        except Exception as exc:
            # Preserve preceding receipts; an uncertain executor failure is not retried.
            got = {"ok": False, "verified": False, "error": type(exc).__name__,
                   "spoken": "The step failed without a verified outcome."}
        item["status"] = "verified" if got.get("verified") else ("needs Evens" if got.get("gated") else "failed")
        item["result"] = str(got.get("spoken") or "")[:400]
        if got.get("cites"):
            item["cites"] = got["cites"][:5]
        results.append(got)
        _progress(progress, item)
        if _stopped(cancel_check) or got.get("cancelled"):
            return _cancelled(todo, results)
        if item["status"] != "verified" and not args.get("keep_going"):
            break
    done = sum(1 for t in todo if t["status"] == "verified")
    all_ok = done == len(todo) and len(steps) <= 12
    lines = [f"{t['n']}. [{t['status']}] {t['op']} {t['what']}: {t.get('result', 'not run')}" for t in todo]
    head = (f"Skill read first: {skill}. " if skill else "") + f"{done}/{len(steps)} steps verified."
    if not all_ok:
        head += " The complete requested outcome is not verified; completed step receipts are preserved."
    gated = any(row.get('gated') for row in results)
    return {"ok": all_ok, "verified": all_ok, "steps": todo, "results": results, "skill": skill,
            "partial": bool(done) and not all_ok, "gated": gated,
            "status": "COMPLETED" if all_ok else ("WAITING_APPROVAL" if gated else "PARTIAL" if done else "FAILED"),
            "spoken": head + " " + " ".join(lines), "cites": [c for t in todo for c in t.get("cites", [])]}



# ---------------------------------------------------------------- routing
_TASK = re.compile(r"^\s*(?:jarvis[,:]?\s*)?agent\s+task\s*:?\s*(\{.*\})\s*$", re.I | re.S)
_CLI = re.compile(r"^\s*(?:jarvis[,:]?\s*)?(?:run\s+)?((?:gh|git|yt-dlp|ffprobe|ffmpeg|gws)\s+.+?)\s*$", re.I)
_MCPC = re.compile(r"\bcall\s+(?:the\s+)?([\w.\-]+)\s+mcp\s+tool\s+([\w.\-]+)(?:\s+with\s+(\{.*\}))?", re.I | re.S)


_LIST = re.compile(r"\blist\s+(?:the\s+)?([\w.\-]+)\s+mcp\s+tools\b", re.I)
_CODE = re.compile(r"^\s*(?:jarvis[,:]?\s*)?in\s+(?:the\s+)?scratch\s+repo\s+([\w.\-]+)\s*[,:]\s*(.+?)\s*$", re.I | re.S)


def _gws_argv(u: str) -> list[str] | None:
    try:
        return _load("gws_natural", "gws_natural.py").argv_for(u)
    except Exception:  # noqa: BLE001 — a broken helper must never take the turn down; the ask just isn't claimed
        return None


def _fanout_args(u: str) -> dict:
    try:
        return _load("fanout", "fanout.py").args_from_utterance(u)
    except Exception:  # noqa: BLE001
        return {}


def _gws_reads_args(u: str) -> dict | None:
    """Docs/Sheets by name and the sent-mail duplicate check; a broken helper never takes the turn down."""
    try:
        r = _load("gws_reads", "gws_reads.py")
        return r.read_args_for(u) or r.sent_args_for(u)
    except Exception:  # noqa: BLE001
        return None


def wants(u: str) -> bool:
    return bool(_LIST.search(u or "") or _CODE.match(u or "") or _TASK.search(u or "") or _CLI.match(u or "") or _MCPC.search(u or "")
                or _gws_argv(u) or _gws_reads_args(u) or bool(_fanout_args(u)))


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
    argv = _gws_argv(u)
    if argv:
        return {"op": "cli", "argv": argv}
    fan = _fanout_args(u)
    if fan:
        return {"op": "fanout", **fan}
    return _gws_reads_args(u) or {}


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


def op_mcp_http_call(server: str, tool: str, arguments: dict, deadline: float = 40, *, result_fn=None) -> tuple[bool, str] | None:
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
    if result_fn is not None:
        _host_mcp_result(result_fn, r)
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


CODE_REPLY_RECOVERY = (
    'The previous coding reply was invalid or incomplete; no writes, tests, or commits from that reply ran. '
    'Return one complete JSON object only. Keep the response bounded: inspect with read_paths first, '
    'prefer compact exact edits for large existing files, and include only small necessary new files. '
    'For partial work use one small file/exact edit with continue:true and no test_cmd, then a final explicit meaningful test_cmd. Complete only the work authorized by the current goal. '
    'Do not resend whole large files.')

def _code_reply(text,*,require_test_command=False):
    """A rejected response is feedback, never an empty default test action."""
    raw=re.sub(r'^```(?:json)?|```$', '', (text or '').strip(),flags=re.M).strip()
    try:data=json.loads(raw)
    except (ValueError,TypeError):return None,'malformed_or_truncated_json'
    if not isinstance(data,dict) or not data:return None,'nonempty_object_required'
    if 'done' in data and type(data['done']) is not bool:return None,'done_must_be_boolean'
    if data.get('read_paths'):return data,None
    if data.get('continue') is True:
        if data.get('test_cmd'):return None,'continuing_batch_cannot_test_or_commit'
        files=data.get('files') or {};edits=data.get('edits') or []
        if not isinstance(files,dict) or not isinstance(edits,list) or len(files)+len(edits)!=1:return None,'continuing_batch_requires_one_file_or_edit'
        if len(json.dumps(data,ensure_ascii=False))>3000:return None,'continuing_batch_exceeds_3000_characters'
        return data,None
    if 'continue' in data and data['continue'] is not False:return None,'continuation_must_be_boolean'
    if (require_test_command or 'continue' in data) and not (isinstance(data.get('test_cmd'),str) and data['test_cmd'].strip()):return None,'final_batch_requires_explicit_test_command'
    if not (data.get('files') or data.get('edits')) and not (isinstance(data.get('test_cmd'),str) and data['test_cmd'].strip()):return None,'coding_action_or_test_command_required'
    return data,None


CODE_INSPECTION_HINT = (
    '\nRepository operations: to inspect existing code first, return JSON with '
    '"read_paths":[{"path":"relative/file.py","start_line":1,"line_count":120}] and no files/edits. '
    'Actual bounded file contents and SHA256 will be returned. For an existing large file, '
    'use "edits":[{"path":"relative/file.py","old":"exact unique existing text","new":"replacement"}] '
    'instead of rewriting unseen contents. Existing files/test_cmd/commit_message still work. '
    'Keep replies below 3000 characters. Keep each batch focused on one requested behavior; do not expand scope. '
    'For an unfinished batch return exactly one small new file or one exact edit with "continue":true and no test_cmd. '
    'Those writes will be retained; no tests or commit run until the final batch has an explicit meaningful test_cmd. '
    'When tests pass but requested work remains, return done:false to continue without commit; use done:true only for a final complete batch. Do not claim the full goal complete from a standalone batch. Describe intended test commands/coverage separately from actual run receipts; never invent pass results. A repository view is partial context, never proof of execution.')


def _owned_code_bytes(root, name):
    path = Path(str(name))
    if (path.is_absolute() or not path.parts or '..' in path.parts or '.git' in path.parts
        ):
        raise _CheckpointBlocked('unsafe_inspection_path')
    target = root/path
    secret_path=bool(PERM().is_secret_path(path) or PERM().is_secret_path(target))
    if secret_path and not _reviewed_source(root,path,None):raise _CheckpointBlocked('unsafe_inspection_path')
    if any(p.is_symlink() for p in (target, *target.parents)) or root not in target.resolve().parents:
        raise _CheckpointBlocked('unsafe_inspection_path')
    with os.fdopen(os.open(target, os.O_RDONLY | os.O_NOFOLLOW), 'rb') as stream:
        before = os.fstat(stream.fileno())
        if not stat.S_ISREG(before.st_mode) or before.st_size > (64000 if secret_path else 2_000_000):
            raise _CheckpointBlocked('inspection_file_budget')
        raw = stream.read(2_000_001); after = os.fstat(stream.fileno())
    current = target.stat()
    identity = lambda x: (x.st_dev, x.st_ino, x.st_size, x.st_mtime_ns, x.st_mode)
    if len(raw) > 2_000_000 or identity(before) != identity(after) or identity(after) != identity(current):
        raise _CheckpointBlocked('inspection_source_changed')
    if secret_path and not _reviewed_source(root,path,hashlib.sha256(raw).hexdigest()):raise _CheckpointBlocked('unsafe_inspection_path')
    text = raw.decode('utf-8')
    if '\0' in text or _SECRETISH.search(text):
        raise _CheckpointBlocked('inspection_secret_or_binary')
    return raw, text


def _code_reads(root, data):
    requests = data.get('read_paths')
    if not isinstance(requests, list) or not 1 <= len(requests) <= 8:
        raise _CheckpointBlocked('bounded_inspection_required')
    if data.get('files') or data.get('edits'):
        raise _CheckpointBlocked('inspection_and_write_must_be_separate')
    rows = []; remaining = 48000
    for request in requests:
        if isinstance(request, str): request = {'path': request}
        if not isinstance(request, dict) or set(request) - {'path','start_line','line_count'}:
            raise _CheckpointBlocked('invalid_inspection_request')
        name = request.get('path'); start = request.get('start_line', 1); count = request.get('line_count', 120)
        if not isinstance(name, str) or type(start) is not int or start < 1 or type(count) is not int or not 1 <= count <= 240:
            raise _CheckpointBlocked('invalid_inspection_request')
        try:
            raw, text = _owned_code_bytes(root, name); lines = text.splitlines(keepends=True)
            selected = ''.join(lines[start-1:start-1+count]); limit = min(16000, remaining)
            content = selected[:limit]; remaining -= len(content)
            rows.append({'path':name,'sha256':hashlib.sha256(raw).hexdigest(),'first_line':start,
                         'total_lines':len(lines),'content':content,'truncated':len(content)<len(selected),
                         'partial_file':start != 1 or start-1+count < len(lines) or len(content)<len(selected)})
        except (OSError, UnicodeError, _CheckpointBlocked) as exc:
            rows.append({'path':name,'error':str(exc) if isinstance(exc,_CheckpointBlocked) else 'source_unavailable'})
        if remaining <= 0: break
    return rows


def _code_files(root, data):
    files = data.get('files') or {}
    edits = data.get('edits') or []
    if not isinstance(files, dict) or not isinstance(edits, list) or len(files)+len(edits)>10:
        raise _CheckpointBlocked('bounded_code_changes_required')
    result = dict(files); preimages = {}
    for edit in edits:
        if not isinstance(edit, dict) or set(edit) != {'path','old','new'}:
            raise _CheckpointBlocked('invalid_exact_edit')
        name, old, new = edit['path'], edit['old'], edit['new']
        if not all(isinstance(x,str) for x in (name,old,new)) or not old or name in result:
            raise _CheckpointBlocked('invalid_exact_edit')
        raw, text = _owned_code_bytes(root, name)
        if text.count(old) != 1: raise _CheckpointBlocked('exact_edit_anchor_not_unique')
        body = text.replace(old,new,1)
        if len(body.encode())>2_000_000: raise _CheckpointBlocked('exact_edit_file_budget')
        result[name]=body; preimages[name]={'sha256':hashlib.sha256(raw).hexdigest(),'offset':text.index(old)}
    return list(result.items()), preimages


def _check_edit_preimage(root, name, expected):
    expected = expected.get('sha256') if isinstance(expected,dict) else expected
    if expected and hashlib.sha256(_owned_code_bytes(root,name)[0]).hexdigest()!=expected:
        raise _CheckpointBlocked('exact_edit_source_changed')


def _tree(root: Path, cap: int = 6000) -> str:
    # A bounded inventory identifies large source files for explicit inspection.
    paths=[]; snippets=[]; used=0
    for directory, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in {'.git','.hive','__pycache__','.pytest_cache','node_modules','logs','Library'}
                         and not (Path(directory)/d).is_symlink() and not PERM().is_secret_path(Path(directory)/d))
        for name in sorted(names):
            target=Path(directory)/name
            if target.is_symlink() or not target.is_file() or PERM().is_secret_path(target): continue
            rel=str(target.relative_to(root)); size=target.stat().st_size
            if len(paths)>=1000: break
            paths.append((rel,size))
            if size<=20000 and used<2000:
                try:
                    _, text=_owned_code_bytes(root,rel)
                    part=text[:min(1200,2000-used)]; used+=len(part)
                    snippets.append('--- '+rel+' (partial context)\n'+part)
                except (OSError,UnicodeError,_CheckpointBlocked): pass
        if len(paths)>=1000: break
    inventory='\n'.join(f'{name} ({size} bytes)' for name,size in paths)
    prefix='PARTIAL repository view; request read_paths for actual source before editing.\n'
    listing=inventory[:max(0,cap-2100)]
    suffix='\n[Inventory truncated]\n' if len(listing)<len(inventory) else '\n'
    return (prefix+listing+suffix+'\n'.join(snippets))[:cap]


class _CodeCancelled(Exception):
    pass


class _CheckpointBlocked(Exception):
    pass


def checkpoint_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def _code_git_metadata(root):
    """Opaque metadata cannot grant execution authority to a scratch task."""
    git_dir=root/".git"
    if not git_dir.exists():
        if git_dir.is_symlink():
            raise _CheckpointBlocked("external_git_metadata")
        return {}
    if git_dir.is_symlink() or not git_dir.is_dir():
        raise _CheckpointBlocked("external_git_metadata")
    count=0
    for directory,dirs,names in os.walk(git_dir,followlinks=False):
        for name in dirs+names:
            p=Path(directory)/name
            count+=1
            if count > 5000 or p.is_symlink():
                raise _CheckpointBlocked("unsafe_git_metadata")
            mode=p.lstat().st_mode
            if not (stat.S_ISDIR(mode) or stat.S_ISREG(mode)):
                raise _CheckpointBlocked("unsafe_git_metadata")
    if any((git_dir/name).exists() for name in ('config.worktree','commondir','objects/info/alternates')):
        raise _CheckpointBlocked("unsupported_git_metadata")
    config=git_dir/'config'
    if not config.is_file() or config.stat().st_size > 32768:
        raise _CheckpointBlocked("unsupported_git_config")
    parser=configparser.RawConfigParser(strict=True,interpolation=None,delimiters=('=',),
                                         comment_prefixes=('#',';'),empty_lines_in_values=False)
    try:
        parser.read_string(config.read_text(encoding='utf-8'))
    except (ValueError,UnicodeError,configparser.Error):
        raise _CheckpointBlocked("unsupported_git_config")
    allowed={'core':{'repositoryformatversion','filemode','bare','logallrefupdates','ignorecase','precomposeunicode'},
             'user':{'name','email'}}
    if parser.defaults() or any(section not in allowed for section in parser.sections()):
        raise _CheckpointBlocked("unsupported_git_config")
    for section in parser.sections():
        for key,value in parser.items(section):
            if key not in allowed[section] or len(value)>200 or '\n' in value or '\\' in value:
                raise _CheckpointBlocked("unsupported_git_config")
            if section=='core':
                expected={'0'} if key=='repositoryformatversion' else ({'false'} if key=='bare' else {'true','false'})
                if value.lower() not in expected:
                    raise _CheckpointBlocked("unsupported_git_config")
    result={}
    selected=[config]
    for name in ('hooks','info'):
        directory=git_dir/name
        if directory.exists():
            if not directory.is_dir():
                raise _CheckpointBlocked("unsafe_git_metadata")
            selected.extend(p for p in directory.rglob('*') if p.is_file())
    total=0
    for p in selected:
        rel=str(p.relative_to(git_dir))
        mode=p.stat().st_mode & 0o777
        size=p.stat().st_size;total+=size
        if size>32768 or total>262144:
            raise _CheckpointBlocked("git_metadata_budget_exceeded")
        if rel.startswith('hooks/') and not p.name.endswith('.sample'):
            raise _CheckpointBlocked("git_hooks_not_authorized")
        if rel=='info/attributes' and size:
            raise _CheckpointBlocked("git_attributes_not_authorized")
        result[rel]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'mode':mode}
    # Attributes can invoke clean/smudge and diff drivers. No model-generated
    # attributes or inherited execution setting is part of the scratch contract.
    count=0
    for directory,dirs,names in os.walk(root,followlinks=False):
        dirs[:]=[name for name in dirs if name!='.git']
        count+=len(dirs)+len(names)
        if count>2000:
            raise _CheckpointBlocked("snapshot_budget_exceeded")
        if '.gitattributes' in names:
            raise _CheckpointBlocked("git_attributes_not_authorized")
    return result


def code_repo_snapshot(repo):
    """Bounded full-worktree identity, never a content-bearing log or secret read."""
    root = Path(repo).expanduser().resolve()
    if not root.exists():
        return {"repo": str(root), "exists": False, "head": "", "branch": "", "index": "", "files": {}, "git_metadata":{}}
    if root.is_symlink() or not root.is_dir():
        raise _CheckpointBlocked("unsafe_repo_path")
    git_dir = root/".git"
    if git_dir.exists() and (git_dir.is_symlink() or not git_dir.is_dir()):
        raise _CheckpointBlocked("external_git_metadata")
    files = {}
    total = 0
    for directory, dirs, names in os.walk(root, followlinks=False):
        dirs[:] = [d for d in dirs if d != ".git"]
        for name in dirs + names:
            p = Path(directory) / name
            if name == ".git":
                continue
            if p.is_symlink():raise _CheckpointBlocked("unsafe_or_secret_repo_path")
            if PERM().is_secret_path(p):
                if not p.is_file() or p.stat().st_size>64000 or not _reviewed_source(root,p.relative_to(root),None) or not _reviewed_source(root,p.relative_to(root),hashlib.sha256(p.read_bytes()).hexdigest()):
                    raise _CheckpointBlocked("unsafe_or_secret_repo_path")
        for name in names:
            if name == ".git":
                continue
            p = Path(directory) / name
            if not p.is_file():
                raise _CheckpointBlocked("nonregular_repo_file")
            stat = p.stat()
            total += stat.st_size
            if stat.st_size > 2_000_000 or total > 8_000_000 or len(files) >= 1000:
                raise _CheckpointBlocked("snapshot_budget_exceeded")
            files[str(p.relative_to(root))] = {"sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "mode": stat.st_mode & 0o777}
    metadata=_code_git_metadata(root)
    head = _git(root, "rev-parse", "--verify", "HEAD")
    branch = _git(root, "symbolic-ref", "--short", "HEAD")
    index = _git(root, "ls-files", "--stage", "-z")
    return {"repo": str(root), "exists": True, "head": head.stdout.strip() if head.returncode == 0 else "",
            "branch": branch.stdout.strip() if branch.returncode == 0 else "", "index": index.stdout,
            "files": files, "git_metadata":metadata}


def _committed_files(root):
    rows = _git(root, "ls-tree", "-r", "-z", "HEAD")
    if rows.returncode:
        raise _CheckpointBlocked("commit_tree_unreadable")
    files = {}
    for row in filter(None, rows.stdout.split("\0")):
        meta,name=row.split("\t",1)
        mode,kind,blob=meta.split()
        if kind != "blob" or mode not in {"100644","100755"}:
            raise _CheckpointBlocked("unsupported_commit_entry")
        if PERM().is_secret_path(name):
            if not _reviewed_source(root,name,None):raise _CheckpointBlocked("secret_commit_path")
            size=_git(root,"cat-file","-s",blob)
            if size.returncode or not size.stdout.strip().isdigit() or int(size.stdout)>64000:raise _CheckpointBlocked("secret_commit_path")
        data = _git(root,"cat-file","blob",blob,binary=True)
        if data.returncode:
            raise _CheckpointBlocked("commit_blob_unreadable")
        sha=hashlib.sha256(data.stdout).hexdigest()
        if PERM().is_secret_path(name) and not _reviewed_source(root,name,sha):raise _CheckpointBlocked("secret_commit_path")
        files[name] = {"sha256":sha,"mode":mode}
    return files


def reconcile_code_checkpoint(checkpoint, args):
    """Read-only reconciliation. Unexpected mutations always block continuation."""
    serialized = json.dumps(checkpoint)
    if len(serialized) > 2_000_000:
        raise _CheckpointBlocked("checkpoint_budget_exceeded")
    cp = json.loads(serialized)
    if not isinstance(cp,dict):
        raise _CheckpointBlocked("checkpoint_schema_invalid")
    if cp.get("version") != 1 or cp.get("args") != args:
        raise _CheckpointBlocked("checkpoint_task_mismatch")
    if _SECRETISH.search(json.dumps(cp)):
        raise _CheckpointBlocked("checkpoint_contains_secret")
    if (type(cp.get("iteration")) is not int or not 1 <= cp["iteration"] <= MAX_ITERS+1 or
        type(cp.get("file_cursor")) is not int or not isinstance(cp.get("files"),list) or
        not 0 <= cp["file_cursor"] <= len(cp["files"]) or len(cp["files"]) > 10 or
        not all(isinstance(row,(tuple,list)) and len(row)==2 for row in cp["files"]) or
        not all(isinstance(cp.get(key),list) for key in ("todo","history","plan","skills"))):
        raise _CheckpointBlocked("checkpoint_schema_invalid")
    old = cp.get("snapshot")
    if (not isinstance(old,dict) or not isinstance(old.get("files"),dict) or not isinstance(old.get("git_metadata"),dict) or
        not all(isinstance(old.get(key),str) for key in ("repo","head","branch","index")) or
        not isinstance(old.get("exists"),bool) or not all(
            isinstance(name,str) and name and not Path(name).is_absolute() and ".." not in Path(name).parts and
            isinstance(row,dict) and re.fullmatch(r"[a-f0-9]{64}",str(row.get("sha256") or "")) and
            type(row.get("mode")) is int and 0 <= row["mode"] <= 0o777
            for name,row in old["files"].items())):
        raise _CheckpointBlocked("checkpoint_snapshot_missing")
    if cp.get("pending") is not None and not isinstance(cp["pending"],dict):
        raise _CheckpointBlocked("checkpoint_schema_invalid")
    if cp.get("phase") in {"files","pending_write","test","pending_test","pending_commit","complete"}:
        data=cp.get("model_data")
        output=cp.get("model_output")
        if not isinstance(data,dict) or not isinstance(output,str) or _json_obj(output) != data:
            raise _CheckpointBlocked("model_checkpoint_mismatch")
        expected=list((data.get("files") if isinstance(data.get("files"),dict) else {}).items())[:10]
        edits=data.get('edits') or []
        preimages=cp.get('edit_preimages',{})
        bodies=dict(cp['files'])
        if not isinstance(edits,list) or not isinstance(preimages,dict):
            raise _CheckpointBlocked('exact_edit_checkpoint_mismatch')
        names=set(name for name,_ in expected); edited=set()
        for edit in edits:
            if not isinstance(edit,dict) or set(edit)!={'path','old','new'}:
                raise _CheckpointBlocked('exact_edit_checkpoint_mismatch')
            name,anchor,replacement=edit['path'],edit['old'],edit['new']
            row=preimages.get(name) if isinstance(name,str) else None
            body=bodies.get(name) if isinstance(name,str) else None
            if (not all(isinstance(x,str) for x in (name,anchor,replacement,body)) or not anchor
                or name in names or name in edited or not isinstance(row,dict) or set(row)!={'sha256','offset'}
                or type(row['offset']) is not int or not 0<=row['offset']<=len(body)
                or not re.fullmatch(r'[a-f0-9]{64}',str(row['sha256']))):
                raise _CheckpointBlocked('exact_edit_checkpoint_mismatch')
            offset=row['offset']
            original=body[:offset]+anchor+body[offset+len(replacement):]
            if (body[offset:offset+len(replacement)]!=replacement or original.count(anchor)!=1
                or original.find(anchor)!=offset or hashlib.sha256(original.encode()).hexdigest()!=row['sha256']):
                raise _CheckpointBlocked('exact_edit_checkpoint_mismatch')
            expected.append((name,body));edited.add(name)
        if set(preimages)!=edited or cp["files"] != json.loads(json.dumps(expected)):
            raise _CheckpointBlocked("model_files_checkpoint_mismatch")
    # Reject metadata drift before even the isolated Git reader is invoked.
    if _code_git_metadata(Path(args["repo"])) != old["git_metadata"]:
        raise _CheckpointBlocked("git_metadata_checkpoint_mismatch")
    current = code_repo_snapshot(args["repo"])
    phase = cp.get("phase")
    pending = cp.get("pending") or {}
    if phase in {"pending_write", "pending_gitignore"}:
        expected = json.loads(json.dumps(old))
        name = pending.get("path")
        if not isinstance(name, str) or not name or Path(name).is_absolute() or ".." in Path(name).parts or ".git" in Path(name).parts or Path(name).name==".gitattributes":
            raise _CheckpointBlocked("unsafe_checkpoint_write")
        if phase == "pending_write":
            if cp["file_cursor"] >= len(cp["files"]):
                raise _CheckpointBlocked("write_cursor_mismatch")
            path,body=cp["files"][cp["file_cursor"]]
        else:
            path,body=".gitignore","__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n"
        if name != str(path) or pending.get("new_sha256") != hashlib.sha256(str(body).encode()).hexdigest():
            raise _CheckpointBlocked("pending_write_model_mismatch")
        if current != old:
            target = current["files"].get(name)
            if not target or target["sha256"] != pending.get("new_sha256") or target["mode"] != pending.get("mode"):
                raise _CheckpointBlocked("pending_write_mismatch")
            expected["files"][name] = target
            if current != expected:
                raise _CheckpointBlocked("external_repo_change")
            if phase == "pending_write":
                cp["file_cursor"] += 1
            cp["todo"].append({"n":len(cp["todo"])+1, "what":f"iter {cp['iteration']} write {name}" if phase == "pending_write" else "gitignore",
                              "status":"verified", "result":"reconciled exact completed write"})
            cp.update(phase="files" if phase == "pending_write" else "baseline", snapshot=current, pending=None)
        else:
            cp.update(phase="files" if phase == "pending_write" else "gitignore", snapshot=current, pending=None)
    elif phase == "pending_commit":
        if current["repo"] != old["repo"] or current["branch"] != old["branch"] or current["files"] != old["files"]:
            raise _CheckpointBlocked("commit_worktree_mismatch")
        if current["head"] != old["head"]:
            parents = _git(Path(args["repo"]), "show", "-s", "--format=%P", "HEAD").stdout.strip().split()
            message = _git(Path(args["repo"]), "show", "-s", "--format=%B", "HEAD").stdout.rstrip("\n")
            expected_parents = [old["head"]] if old["head"] else []
            if parents != expected_parents or message != pending.get("message") or _committed_files(Path(args["repo"])) != pending.get("expected_commit_files"):
                raise _CheckpointBlocked("pending_commit_identity_mismatch")
            if _git(Path(args["repo"]), "diff", "--cached", "--quiet", "HEAD").returncode:
                raise _CheckpointBlocked("external_index_change")
            receipt = "committed " + current["head"][:12] + " " + message[:100]
            cp["todo"].append({"n":len(cp["todo"])+1, "what":"commit", "status":"verified", "result":receipt})
            cp.update(phase="complete", commit_receipt=receipt, snapshot=current, pending=None)
        else:
            # A crash after git add may alter only the index. Permit precisely
            # the original index or the complete expected worktree staging.
            if current["index"] != old["index"]:
                staged = {}
                for row in filter(None, current["index"].split("\0")):
                    meta, name = row.split("\t", 1)
                    mode, blob, stage = meta.split()
                    if stage != "0":
                        raise _CheckpointBlocked("unmerged_index")
                    data = _git(Path(args["repo"]),"cat-file","blob",blob,binary=True)
                    if data.returncode:
                        raise _CheckpointBlocked("index_blob_unreadable")
                    staged[name] = {"sha256":hashlib.sha256(data.stdout).hexdigest(),"mode":mode}
                if staged != pending.get("expected_commit_files"):
                    raise _CheckpointBlocked("external_index_change")
            cp.update(snapshot=current)
    elif phase == "pending_branch" and current != old:
        expected = dict(old, branch=args["branch"])
        if current != expected:
            raise _CheckpointBlocked("branch_transition_mismatch")
        cp["todo"].append({"n":len(cp["todo"])+1,"what":"branch " + args["branch"],"status":"verified","result":"reconciled branch"})
        cp.update(phase="gitignore", snapshot=current, pending=None)
    elif current != old:
        raise _CheckpointBlocked("repo_checkpoint_mismatch")
    if cp.get("phase") not in {"rank", "init", "pending_init", "branch", "pending_branch", "gitignore", "pending_gitignore", "baseline", "pending_baseline", "model", "files", "test", "pending_test", "pending_commit", "complete"}:
        raise _CheckpointBlocked("unknown_checkpoint_phase")
    if cp["phase"] not in {"rank", "init", "pending_init", "branch", "pending_branch"} and current["branch"] != args["branch"]:
        raise _CheckpointBlocked("branch_checkpoint_mismatch")
    return cp


def _durable_code(repo, goal, branch, *, cancel_check, progress, checkpoint, resume_checkpoint, mutation_guard=None):
    root = Path(repo).expanduser()
    if not root.is_absolute():
        root = PERM().scratch_roots()[0]/root
    root = root.resolve()
    args = {"op":"code", "repo":str(root), "goal":goal, "branch":branch}
    if _repo_ok(root) != "allow" or PERM().decide("git_branch", branch) != "allow":
        raise _CheckpointBlocked("current_permission_denied")
    state = reconcile_code_checkpoint(resume_checkpoint, args) if resume_checkpoint else {
        "version":1, "args":args, "phase":"rank", "iteration":1, "skills":[], "guide":"", "history":[{"role":"system", "content":CODE_SYS}],
        "plan":[], "model":"", "last_test":"", "files":[], "file_cursor":0, "todo":[], "pending":None}
    def check():
        if _stopped(cancel_check):
            raise _CodeCancelled()
    def guard(event, writes=None):
        check()
        if mutation_guard is not None:
            if not callable(mutation_guard):
                raise _CheckpointBlocked("host_configuration_guard_required")
            receipt=mutation_guard(event, writes or {})
            if not isinstance(receipt,dict) or receipt.get("ok") is not True or receipt.get("configuration_preserved") is not True:
                raise _CheckpointBlocked("host_configuration_guard_rejected_"+event)
        check()
    def save(*, allow_git_initialization=False):
        check()
        previous=state.get("snapshot")
        metadata=_code_git_metadata(root)
        if (previous is not None and metadata != previous.get("git_metadata") and
            not (allow_git_initialization and previous.get("git_metadata")=={})):
            raise _CheckpointBlocked("git_metadata_changed_during_task")
        state["snapshot"] = code_repo_snapshot(root)
        value = json.loads(json.dumps(state))
        if len(json.dumps(value)) > 2_000_000:
            raise _CheckpointBlocked("checkpoint_budget_exceeded")
        if _SECRETISH.search(json.dumps(value)):
            raise _CheckpointBlocked("checkpoint_contains_secret")
        if checkpoint is None:
            raise _CheckpointBlocked("checkpoint_writer_required")
        checkpoint(value)
        check()
    def done(what, got):
        state["todo"].append({"n":len(state["todo"])+1,"what":what,
                              "status":"verified" if got.get("verified") else "failed", "result":str(got.get("spoken") or "")[:300]})
        _progress(progress, state["todo"][-1])
        check()
        return bool(got.get("verified"))
    def operate(action, after, *, what=None, **kw):
        check()
        state["phase"] = "pending_" + action
        save()
        _progress(progress, {"n":len(state["todo"])+1,"what":what or action,"status":"running"})
        check()
        guard("before_"+action)
        got = op_repo(str(root), action, **kw)
        guard("after_"+action)
        # Persist the executed step before consulting cancellation, so an exact
        # postcondition is recoverable if Stop arrived during the operation.
        state["todo"].append({"n":len(state["todo"])+1,"what":what or action,
                              "status":"verified" if got.get("verified") else "failed","result":str(got.get("spoken") or "")[:300]})
        state["phase"] = after
        if not _stopped(cancel_check):
            save(allow_git_initialization=action=="init")
        _progress(progress, state["todo"][-1])
        check()
        return got
    while True:
        check()
        phase = state["phase"]
        if phase == "rank":
            save()
            state["skills"] = rank_skills(goal)
            check()
            state["guide"] = "\n\n".join(f"# skill {n}\n{skill_text(n,1500)}" for n in state["skills"][:2])
            state["phase"] = "init"
            save()
        elif phase in {"init", "pending_init"}:
            if not operate("init", "branch").get("verified"):
                return _code_report(state["todo"],state["skills"],state["model"],False,state["plan"])
        elif phase in {"branch", "pending_branch"}:
            if not operate("branch", "gitignore", what="branch " + branch, name=branch).get("verified"):
                return _code_report(state["todo"],state["skills"],state["model"],False,state["plan"])
        elif phase in {"gitignore", "pending_gitignore"}:
            if not (root/".gitignore").exists():
                # Use the same repository write hand as every other mutation.
                body="__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n"
                mask=os.umask(0);os.umask(mask)
                state["pending"]={"path":".gitignore","new_sha256":hashlib.sha256(body.encode()).hexdigest(),"mode":0o666 & ~mask}
                state["phase"]="pending_gitignore";save()
                guard("before_write", {".gitignore":body})
                got=op_repo(str(root),"write",path=".gitignore",content=body)
                guard("after_write")
                if not done("gitignore",got):
                    raise _CheckpointBlocked("gitignore_write_failed")
                state["pending"]=None;state["phase"]="baseline";save()
            else:
                state["phase"] = "baseline";save()
        elif phase in {"baseline", "pending_baseline"}:
            if any(p.suffix in {".py", ".js", ".ts"} for p in root.iterdir() if p.is_file()):
                # The special pending phase prevents a crashed baseline from
                # being confused with the generated iteration's acceptance test.
                state["phase"] = "pending_baseline";save()
                guard("before_test")
                got = op_repo(str(root),"test")
                guard("after_test")
                state["last_test"] = "(baseline before edits) " + str(got.get("output") or got.get("spoken"))[-2500:]
                done("baseline test", got)
            state["phase"] = "model";save()
        elif phase == "model":
            if state["iteration"] > MAX_ITERS:
                return _code_report(state["todo"],state["skills"],state["model"],False,state["plan"])
            # An interrupted in-flight request has no model output to recover;
            # retry only this next uncommitted step, retaining prior history.
            if not state.get("model_request_pending"):
                state["history"].append({"role":"user","content":f"Goal: {goal}{CODE_INSPECTION_HINT}\n\nRelevant skills:\n{state['guide'] or '(none)'}\n\nRepo now:\n{_tree(root)}\n\nLast test output (iteration {state['iteration']-1}):\n{state['last_test'] or '(none yet)'}"})
                state["model_request_pending"] = True
            save()
            text, model = llm(state["history"], CODE_MODEL)
            check()
            if not text:
                done(f"iter {state['iteration']} model", {"verified":False,"spoken":"no model answer"})
                return _code_report(state["todo"],state["skills"],model,False,state["plan"])
            data,error = _code_reply(text,require_test_command=bool(state.get("continuing_batches")))
            if error:
                state.update(model=model,model_output=text,model_data={},model_request_pending=False,files=[],edit_preimages={},file_cursor=0)
                state['history'].append({'role':'assistant','content':text[:8000]})
                state['history'].append({'role':'user','content':CODE_REPLY_RECOVERY+' Rejection reason: '+error+'.'})
                done(f"iter {state['iteration']} model response",{'verified':False,'spoken':'Coding response rejected: '+error+'; no operations from this reply ran.'})
                state['model_response_error']=error;state['iteration']+=1;state['phase']='model';save();continue
            state.pop('model_response_error',None)
            state.update(model=model, model_output=text, model_data=data, model_request_pending=False)
            if data.get('read_paths'):
                rows = _code_reads(root,data)
                state['history'].append({'role':'assistant','content':text[:8000]})
                state['history'].append({'role':'user','content':'Actual repository inspection results: '+json.dumps(rows)})
                done(f"iter {state['iteration']} inspect", {'verified':all('error' not in row for row in rows),'spoken':'Bounded source inspection completed; no files changed.'})
                state['iteration'] += 1; state['phase']='model'; save(); continue
            files, preimages = _code_files(root,data)
            state.update(files=files,edit_preimages=preimages,file_cursor=0)
            state["plan"] = state["plan"] or [str(x)[:120] for x in data.get("plan",[])][:7]
            state["history"].append({"role":"assistant","content":text[:8000]})
            state["phase"] = "files";save()
        elif phase == "files":
            if state["file_cursor"] >= len(state["files"]):
                if state['model_data'].get('continue') is True:
                    state['history'].append({'role':'user','content':'Actual continuing batch write/readback completed: '+json.dumps([name for name,_ in state['files']])+'. No tests or commit ran. Continue the remaining authorized goal with one small file/exact edit; only the final batch supplies meaningful test_cmd. Partial work is not completed implementation.'})
                    state['continuing_batches']=True;state['iteration']+=1;state['phase']='model';save();continue
                state["phase"] = "test";save();continue
            name, content = state["files"][state["file_cursor"]]
            name, content = str(name),str(content)
            _check_edit_preimage(root,name,state.get('edit_preimages',{}).get(name))
            dest = root/name
            if Path(name).is_absolute() or ".." in Path(name).parts or ".git" in Path(name).parts or Path(name).name==".gitattributes" or root not in dest.resolve().parents or PERM().is_secret_path(dest):
                raise _CheckpointBlocked("unsafe_checkpoint_write")
            prior = code_repo_snapshot(root)["files"].get(name)
            if prior is None:
                mask = os.umask(0);os.umask(mask)
                mode = 0o666 & ~mask
            else:
                mode = prior["mode"]
            state["pending"] = {"path":name,"new_sha256":hashlib.sha256(content.encode()).hexdigest(),"mode":mode}
            state["phase"] = "pending_write";save()
            guard("before_write", {name:content})
            got = op_repo(str(root),"write",path=name,content=content)
            guard("after_write")
            state["file_cursor"] += 1
            state["pending"] = None;state["phase"] = "files"
            if not done(f"iter {state['iteration']} write {name}",got):
                return _code_report(state["todo"],state["skills"],state["model"],False,state["plan"])
            save()
        elif phase in {"test", "pending_test"}:
            state["phase"] = "pending_test";save()
            guard("before_test")
            got = op_repo(str(root),"test",cmd=str(state['model_data'].get('test_cmd') or 'python3 -m unittest discover -v'))
            guard("after_test")
            state["last_test"] = str(got.get("output") or got.get("spoken"))[-2500:]
            state["test_result"] = got
            done(f"iter {state['iteration']} test",got)
            if not got.get("verified"):
                state["iteration"] += 1;state["phase"] = "model";save();continue
            if state['model_data'].get('done') is False:
                state['history'].append({'role':'user','content':'Actual tests passed for the current work; no commit ran because done:false. Actual test receipt: '+state['last_test']+'. Continue only the remaining authorized work, and use done:true with explicit test_cmd when complete.'})
                state['continuing_batches']=True;state['iteration']+=1;state['phase']='model';save();continue
            message = str(state["model_data"].get("commit_message") or goal)[:100]
            names = _git(root,"ls-files","--cached","--others","--exclude-standard","-z").stdout.split("\0")
            snap = code_repo_snapshot(root)
            state["pending"] = {"message":message,"expected_commit_files":{
                name:{"sha256":snap["files"][name]["sha256"],"mode":"100755" if snap["files"][name]["mode"] & 0o111 else "100644"}
                for name in names if name in snap["files"]}}
            state["phase"] = "pending_commit";save()
        elif phase == "pending_commit":
            check()
            guard("before_commit")
            got = op_repo(str(root),"commit",message=state["pending"]["message"])
            guard("after_commit")
            state["commit_receipt"] = str(got.get("spoken") or "")[:300]
            state["pending"] = None;state["phase"] = "complete"
            done("commit",got)
            save()
        elif phase == "complete":
            save()
            ok = bool(state["todo"] and state["todo"][-1]["what"] == "commit" and state["todo"][-1]["status"] == "verified")
            return _code_report(state["todo"],state["skills"],state["model"],ok,state["plan"])
        else:
            raise _CheckpointBlocked("unreconciled_checkpoint_phase")


def op_code(repo: str, goal: str, branch: str = "jarvis/code", *, cancel_check=None, progress=None, checkpoint=None, resume_checkpoint=None, mutation_guard=None) -> dict:
    if checkpoint is not None or resume_checkpoint is not None:
        try:
            return _durable_code(repo, goal, branch, cancel_check=cancel_check, progress=progress,
                                 checkpoint=checkpoint, resume_checkpoint=resume_checkpoint, mutation_guard=mutation_guard)
        except _CodeCancelled:
            return _cancelled()
        except _CheckpointBlocked as exc:
            return {"ok": False, "verified": False, "status": "BLOCKED", "blocked": True,
                    "spoken": "Coding continuation is blocked: " + str(exc) + ". Nothing was replayed."}
    if mutation_guard is not None:
        return {"ok":False,"verified":False,"blocked":True,"spoken":"A guarded workflow requires its durable checkpoint writer. Nothing ran."}
    todo: list[dict] = []
    def check():
        if _stopped(cancel_check):
            raise _CodeCancelled()
    def publish(row):
        _progress(progress, row)
        check()
    def operate(target, action, **kw):
        check()
        publish({"n": len(todo) + 1, "what": action, "status": "running"})
        got = op_repo(target, action, **kw)
        check()
        return got
    try:
        return _op_code_owned(repo, goal, branch, todo=todo, check=check, publish=publish, operate=operate)
    except _CodeCancelled:
        return _cancelled(todo)


def _op_code_owned(repo, goal, branch, *, todo, check, publish, operate) -> dict:
    """Plan -> edit -> test -> read failures -> fix -> commit, driven by the strongest coding model."""
    check()
    skills = rank_skills(goal)
    check()
    guide = "\n\n".join(f"# skill {n}\n{skill_text(n, 1500)}" for n in skills[:2])

    def step(what, got):
        todo.append({"n": len(todo) + 1, "what": what, "status": "verified" if got.get("verified") else
                     ("needs Evens" if got.get("gated") else "failed"), "result": str(got.get("spoken") or "")[:300]})
        publish(todo[-1])
        return got.get("verified")
    if not step("init", operate(repo, "init")) or not step(f"branch {branch}", operate(repo, "branch", name=branch)):
        return _code_report(todo, skills, "", False)
    root = Path(os.path.expanduser(repo)) if os.path.isabs(os.path.expanduser(repo)) else PERM().scratch_roots()[0] / repo
    history = [{"role": "system", "content": CODE_SYS}]
    continuing_batches=False
    last_test, model_used, passed, plan = "", "", False, []
    gi = root / ".gitignore"
    if not gi.exists():
        check()
        gi.write_text("__pycache__/\n*.pyc\nLibrary/\n.pytest_cache/\n", encoding="utf-8")
        check()
    if any(p.suffix in {".py", ".js", ".ts"} for p in root.iterdir() if p.is_file()):
        got0 = operate(str(root), "test")  # read the current failures before the model edits anything
        last_test = "(baseline before edits) " + str(got0.get("output") or got0.get("spoken"))[-2500:]
        step("baseline test", {"verified": True, "spoken": got0.get("spoken")})
    for it in range(1, MAX_ITERS + 1):
        check()
        history.append({"role": "user", "content": f"Goal: {goal}{CODE_INSPECTION_HINT}\n\nRelevant skills:\n{guide or '(none)'}\n\nRepo now:\n{_tree(root)}\n\n"
                        f"Last test output (iteration {it - 1}):\n{last_test or '(none yet)'}"})
        publish({"n": len(todo) + 1, "what": f"iter {it} model", "status": "running"})
        text, model_used = llm(history, CODE_MODEL)
        check()
        if not text:
            step(f"iter {it} model", {"verified": False, "spoken": "no model answer (key missing or both models failed)"})
            break
        history.append({"role": "assistant", "content": text[:8000]})
        d,error = _code_reply(text,require_test_command=continuing_batches)
        if error:
            history.append({'role':'user','content':CODE_REPLY_RECOVERY+' Rejection reason: '+error+'.'})
            step(f"iter {it} model response",{'verified':False,'spoken':'Coding response rejected: '+error+'; no operations from this reply ran.'})
            continue
        plan = plan or [str(x)[:120] for x in (d.get("plan") or [])][:7]
        if d.get('read_paths'):
            rows = _code_reads(root,d)
            history.append({'role':'user','content':'Actual repository inspection results: '+json.dumps(rows)})
            step(f"iter {it} inspect",{'verified':all('error' not in row for row in rows),'spoken':'Bounded source inspection completed; no files changed.'})
            continue
        files, preimages = _code_files(root,d)
        for path, content in files:
            _check_edit_preimage(root,str(path),preimages.get(str(path)))
            if not step(f"iter {it} write {path}", operate(str(root), "write", path=str(path), content=str(content))):
                return _code_report(todo, skills, model_used, False, plan)
        if d.get('continue') is True:
            continuing_batches=True
            history.append({'role':'user','content':'Actual continuing batch write/readback completed: '+json.dumps([name for name,_ in files])+'. No tests or commit ran. Continue the remaining authorized goal with one small file/exact edit; only the final batch supplies meaningful test_cmd. Partial work is not completed implementation.'})
            continue
        got = operate(str(root), "test", cmd=str(d.get('test_cmd') or 'python3 -m unittest discover -v'))
        last_test = str(got.get("output") or got.get("spoken"))[-2500:]
        passed = bool(got.get("verified"))
        step(f"iter {it} test", got)
        if passed and d.get('done') is False:
            history.append({'role':'user','content':'Actual tests passed for the current work; no commit ran because done:false. Actual test receipt: '+last_test+'. Continue only the remaining authorized work, and use done:true with explicit test_cmd when complete.'})
            continuing_batches=True;passed=False
            continue
        if passed:
            step("commit", operate(str(root), "commit", message=str(d.get("commit_message") or goal)[:100]))
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
