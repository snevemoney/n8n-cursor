"""Jarvis operator: one model-driven tool loop over general computer capabilities (Evens 2026-10-15).

The model gets the goal and a small set of primitive tools, picks one, the harness runs it, the real result goes
back, and it repeats until done, blocked or out of budget. No per-app or per-sentence routes. Every call passes
hands/authority.py first; a refusal is returned to the model as data so it can choose another way.

Durable: each task lives in <hive>/operator-tasks/<id>/ (request.json, messages.json, trace.jsonl, state.json,
control.json), so it survives restarts and can be resumed or stopped. Runs as its own worker process.
Usage: python3 hands/operator.py run <task_dir>
"""
from __future__ import annotations

import base64
import html
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.request
import uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
STACK = HERE.parent
MAX_STEPS = int(os.environ.get("JARVIS_OPERATOR_STEPS") or 80)
TIME_BUDGET_S = float(os.environ.get("JARVIS_OPERATOR_SECONDS") or 1800)
OUT_CHARS = 8000
HANDS_APP = Path.home() / "Applications" / "Jarvis Hands.app"
TERMINAL = {"done", "ask_owner"}

SYSTEM = (
    "You are Jarvis, operating Evens's Mac directly to finish the goal yourself. Use the tools; read real results "
    "before claiming anything. Prefer shell/CLI and files when they can do the job; use screenshot + mouse + keyboard "
    "for apps with no better interface; use mcp for external services. When a tool fails, diagnose and try another "
    "way. Some actions need Evens's OK (sending, spending, deleting his files, merging or public pushes, secrets): if "
    "one is refused, find another way or call ask_owner. Finish with done, stating what you did and the evidence "
    "(paths, command output, what you saw). Never claim a step you did not verify. "
    "Your methods live as skills: before specialist work, find and read the matching SKILL.md (find_files "
    "'SKILL.md' under ~/.claude/skills, ~/.codex/skills, ~/.agents/skills) and follow it; e.g. app-teardown-rea "
    "for reverse engineering apps with the REA MCP server (mcp server 'rea')."
)


def _fn(name, desc, props, required=()):
    return {"type": "function", "function": {"name": name, "description": desc,
            "parameters": {"type": "object", "properties": props, "required": list(required)}}}


S, I, B = {"type": "string"}, {"type": "integer"}, {"type": "boolean"}
TOOLS = [
    _fn("read_file", "Read a text file (or a line range).", {"path": S, "start_line": I, "max_lines": I}, ["path"]),
    _fn("write_file", "Create or overwrite a file with content.", {"path": S, "content": S}, ["path", "content"]),
    _fn("edit_file", "Replace one exact text occurrence in a file.", {"path": S, "old": S, "new": S}, ["path", "old", "new"]),
    _fn("list_dir", "List a folder.", {"path": S}, ["path"]),
    _fn("find_files", "Find files by name glob under a folder.", {"pattern": S, "under": S}, ["pattern"]),
    _fn("grep", "Search file contents for a regex under a path.", {"pattern": S, "path": S}, ["pattern", "path"]),
    _fn("shell", "Run a shell command (zsh) and get stdout, stderr, exit code. background=true for long jobs.",
        {"command": S, "timeout_s": I, "background": B}, ["command"]),
    _fn("job", "Output and status of a background shell job.", {"job_id": S}, ["job_id"]),
    _fn("web_search", "Search the internet.", {"query": S}, ["query"]),
    _fn("fetch_url", "Download a public web page as text.", {"url": S}, ["url"]),
    _fn("screenshot", "See the main screen. The image arrives next; its pixels are screen points for mouse.", {}),
    _fn("mouse", "Mouse at screen points: move, click, double_click, right_click, drag (to x2,y2), scroll (dy).",
        {"action": S, "x": I, "y": I, "x2": I, "y2": I, "dy": I}, ["action"]),
    _fn("keyboard", "Type text, or press keys like 'cmd+s', 'return', 'cmd+shift+4'.", {"text": S, "keys": S}),
    _fn("open", "Open an app by name or a file/folder/URL with its default app.", {"target": S}, ["target"]),
    _fn("mcp", "Call a tool on a connected MCP server.", {"server": S, "tool": S, "arguments": {"type": "object"}},
        ["server", "tool"]),
    _fn("ask_owner", "Stop and ask Evens a question or for an OK.", {"question": S}, ["question"]),
    _fn("done", "Finish: summary of what was done and the evidence.", {"summary": S, "evidence": S}, ["summary"]),
]


def _load(name, file):
    mod = sys.modules.get("op_" + name)
    if mod is None:
        spec = importlib.util.spec_from_file_location("op_" + name, HERE / file)
        mod = importlib.util.module_from_spec(spec)
        sys.modules["op_" + name] = mod
        spec.loader.exec_module(mod)
    return mod


def _clip(text, n=OUT_CHARS):
    text = str(text or "")
    return text if len(text) <= n else text[: n // 2] + f"\n…[{len(text) - n} chars cut]…\n" + text[-n // 2:]


def _path(p, cwd):
    p = Path(os.path.expanduser(str(p or "")))
    return p if p.is_absolute() else Path(cwd) / p


class Tools:
    """Executors. Each returns {'text': str, 'image': optional data URL}. ctx carries cwd and the task folder."""

    def __init__(self, task_dir: Path):
        self.dir = task_dir
        self.state_file = task_dir / "tools_state.json"
        st = json.loads(self.state_file.read_text()) if self.state_file.exists() else {}
        self.cwd = st.get("cwd") or str(Path.home())
        self.jobs = st.get("jobs") or {}

    def _save(self):
        self.state_file.write_text(json.dumps({"cwd": self.cwd, "jobs": self.jobs}))

    def read_file(self, a):
        p = _path(a["path"], self.cwd)
        lines = p.read_text(errors="replace").splitlines()
        start = max(1, int(a.get("start_line") or 1))
        n = int(a.get("max_lines") or 400)
        body = "\n".join(f"{i}\t{l}" for i, l in enumerate(lines[start - 1:start - 1 + n], start))
        return {"text": _clip(f"{p} ({len(lines)} lines)\n{body}")}

    def write_file(self, a):
        p = _path(a["path"], self.cwd)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(str(a["content"]))
        ok = p.read_text() == str(a["content"])
        return {"text": f"wrote {p} ({len(str(a['content']))} chars); read back {'matches' if ok else 'DIFFERS'}"}

    def edit_file(self, a):
        p = _path(a["path"], self.cwd)
        text = p.read_text()
        n = text.count(str(a["old"]))
        if n != 1:
            return {"text": f"edit refused: the old text occurs {n} times in {p} (needs exactly 1)"}
        p.write_text(text.replace(str(a["old"]), str(a["new"])))
        return {"text": f"edited {p}"}

    def list_dir(self, a):
        p = _path(a["path"], self.cwd)
        rows = sorted(p.iterdir(), key=lambda c: c.name.lower())
        return {"text": _clip(f"{p} ({len(rows)} entries)\n" + "\n".join(c.name + ("/" if c.is_dir() else "") for c in rows[:500]))}

    def find_files(self, a):
        under = _path(a.get("under") or self.cwd, self.cwd)
        cp = subprocess.run(["find", str(under), "-name", str(a["pattern"]), "-not", "-path", "*/.git/*"],
                            capture_output=True, text=True, timeout=60)
        hits = cp.stdout.splitlines()
        return {"text": _clip(f"{len(hits)} matches\n" + "\n".join(hits[:300]))}

    def grep(self, a):
        cp = subprocess.run(["grep", "-rIn", "--exclude-dir=.git", "-E", str(a["pattern"]), str(_path(a["path"], self.cwd))],
                            capture_output=True, text=True, timeout=60)
        return {"text": _clip(cp.stdout or "no matches")}

    def shell(self, a):
        cmd = str(a["command"])
        if a.get("background"):
            jid = uuid.uuid4().hex[:8]
            log = self.dir / f"job-{jid}.log"
            with open(log, "w") as fh:
                pr = subprocess.Popen(["/bin/zsh", "-lc", cmd], cwd=self.cwd, stdout=fh, stderr=subprocess.STDOUT,
                                      start_new_session=True)
            self.jobs[jid] = {"pid": pr.pid, "log": str(log), "command": cmd}
            self._save()
            return {"text": f"started background job {jid} (pid {pr.pid}); check it with job"}
        mark = "__JARVIS_CWD__"
        try:
            cp = subprocess.run(["/bin/zsh", "-lc", f"{cmd}\nprintf '\\n{mark}%s' \"$PWD\""], cwd=self.cwd,
                                capture_output=True, text=True, timeout=int(a.get("timeout_s") or 120))
        except subprocess.TimeoutExpired:
            return {"text": "timed out; rerun with background=true for long commands"}
        out, _, where = cp.stdout.rpartition(mark)
        if where.strip() and Path(where.strip()).is_dir():
            self.cwd = where.strip()  # cd persists between commands, like a terminal
            self._save()
        else:
            out = cp.stdout
        return {"text": _clip(f"exit {cp.returncode} (cwd {self.cwd})\n{out}\n{('stderr:\n' + cp.stderr) if cp.stderr else ''}")}

    def job(self, a):
        j = self.jobs.get(str(a["job_id"]))
        if not j:
            return {"text": "no such job"}
        try:
            os.kill(int(j["pid"]), 0)
            running = True
        except OSError:
            running = False
        return {"text": _clip(("running" if running else "finished") + "\n" + Path(j["log"]).read_text(errors="replace"))}

    def web_search(self, a):
        got = _load("web_search", "web_search.py").run(str(a["query"]))
        return {"text": _clip(got.get("spoken") or json.dumps(got, default=str))}

    def fetch_url(self, a):
        url = str(a["url"])
        if not _load("web_search", "web_search.py").public_url(url):
            return {"text": "refused: only public http(s) pages"}
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Jarvis"})
        raw = urllib.request.urlopen(req, timeout=20).read(2_000_000).decode("utf-8", "replace")
        text = re.sub(r"(?is)<(script|style).*?</\1>", " ", raw)
        text = html.unescape(re.sub(r"(?s)<[^>]+>", " ", text))
        return {"text": _clip(re.sub(r"\s+", " ", text).strip())}

    def screenshot(self, a):
        shot = Path(tempfile.mkstemp(suffix=".png")[1])
        try:
            subprocess.run(["screencapture", "-x", "-m", str(shot)], check=True, timeout=10)
            info = subprocess.run(["osascript", "-l", "JavaScript", "-e",
                                   "ObjC.import('AppKit');var f=$.NSScreen.mainScreen.frame;f.size.width+'x'+f.size.height"],
                                  capture_output=True, text=True, timeout=10).stdout.strip()
            w = int(float(info.split("x")[0])) if "x" in info else 1440
            subprocess.run(["sips", "-Z", str(w), "-s", "format", "jpeg", str(shot), "--out", str(shot) + ".jpg"],
                           capture_output=True, timeout=20)
            data = base64.b64encode(Path(str(shot) + ".jpg").read_bytes()).decode()
            return {"text": f"screenshot of the main screen ({info} points); image pixels = mouse points",
                    "image": "data:image/jpeg;base64," + data}
        except (subprocess.SubprocessError, OSError) as exc:
            return {"text": f"screenshot failed: {exc}. Screen Recording permission may be missing for Jarvis."}
        finally:
            for f in (shot, Path(str(shot) + ".jpg")):
                try:
                    f.unlink()
                except OSError:
                    pass

    def _hands(self, req):
        if not (HANDS_APP / "Contents" / "MacOS" / "jarvis_hands").exists():
            return {"text": "mouse/keyboard helper is not installed (face/overlay/build_hands_app.sh)"}
        fd, res = tempfile.mkstemp(suffix=".json")
        os.close(fd)
        os.unlink(res)
        subprocess.run(["open", "-g", "-n", "-a", str(HANDS_APP), "--args", "--do", json.dumps(req), "--out", res],
                       capture_output=True, timeout=15)
        end = time.time() + 10
        while time.time() < end:
            if os.path.exists(res) and os.path.getsize(res) > 0:
                time.sleep(0.05)
                got = json.loads(Path(res).read_text())
                os.unlink(res)
                return {"text": json.dumps(got)}
            time.sleep(0.05)
        return {"text": "mouse/keyboard helper gave no answer"}

    def mouse(self, a):
        act = str(a.get("action") or "click")
        if act == "move":
            return self._hands({"op": "move", "x": a["x"], "y": a["y"]})
        if act in ("click", "double_click", "right_click"):
            return self._hands({"op": "click", "x": a["x"], "y": a["y"], "count": 2 if act == "double_click" else 1,
                                "button": "right" if act == "right_click" else "left"})
        if act == "drag":
            return self._hands({"op": "drag", "x": a["x"], "y": a["y"], "x2": a["x2"], "y2": a["y2"]})
        if act == "scroll":
            return self._hands({"op": "scroll", "dy": a.get("dy", -5)})
        return {"text": f"unknown mouse action {act}"}

    def keyboard(self, a):
        if a.get("keys"):
            return self._hands({"op": "key", "keys": str(a["keys"])})
        return self._hands({"op": "type", "text": str(a.get("text") or "")})

    def open(self, a):
        t = str(a["target"])
        looks_path = t.startswith(("/", "~", ".")) or "://" in t
        argv = ["open", os.path.expanduser(t)] if looks_path else ["open", "-a", t]
        cp = subprocess.run(argv, capture_output=True, text=True, timeout=20)
        return {"text": f"exit {cp.returncode} {cp.stderr.strip()}".strip()}

    def mcp(self, a, approved=False):
        got = _load("agent_tools", "agent_tools.py").op_mcp(str(a["server"]), str(a["tool"]), a.get("arguments") or {},
                                                            approved=approved)
        return {"text": _clip(got.get("spoken") or json.dumps(got, default=str))}


class Task:
    """Durable record of one operator task."""

    def __init__(self, path: Path):
        self.path = Path(path)

    @classmethod
    def create(cls, hive: Path, goal: str) -> "Task":
        tid = uuid.uuid4().hex
        d = Path(hive) / "operator-tasks" / tid
        d.mkdir(parents=True)
        t = cls(d)
        t.write("request.json", {"task_id": tid, "goal": goal, "created": time.time()})
        t.write("messages.json", [{"role": "system", "content": SYSTEM}, {"role": "user", "content": goal}])
        t.write("state.json", {"task_id": tid, "status": "QUEUED", "step": 0})
        (Path(hive) / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": tid}))
        return t

    def read(self, name, default=None):
        f = self.path / name
        return json.loads(f.read_text()) if f.exists() else default

    def write(self, name, obj):
        tmp = self.path / (name + ".tmp")
        tmp.write_text(json.dumps(obj, default=str))
        tmp.replace(self.path / name)

    def trace(self, row):
        with open(self.path / "trace.jsonl", "a") as fh:
            fh.write(json.dumps({**row, "at": time.time()}, default=str) + "\n")

    def cancelled(self) -> bool:
        return bool((self.read("control.json", {}) or {}).get("cancel"))


def _authority():
    return _load("authority", "authority.py")


def _model_fn():
    online_spec = importlib.util.spec_from_file_location("op_online", STACK / "brain" / "online.py")
    online = sys.modules.get("op_online")
    if online is None:
        online = importlib.util.module_from_spec(online_spec)
        sys.modules["op_online"] = online
        online_spec.loader.exec_module(online)
    if hasattr(online, "load_existing_env"):
        online.load_existing_env()
    agent = _load("agent_tools", "agent_tools.py")  # the coding chain Jarvis already uses (models unchanged)
    chain = (agent.CODE_MODEL, agent.CODE_MODEL_BACKUP)
    return lambda messages, tools: online.call_openrouter_messages(messages, tools, model_chain=chain, max_tokens=12000,
                                                                   allow_reasoning=True, attempt_sec=120.0)


def step_once(task: Task, tools: Tools, model_fn) -> str | None:
    """One model turn plus its tool calls. Returns a terminal status or None to continue."""
    messages = task.read("messages.json")
    got = model_fn(messages, TOOLS)
    if not got.get("ok"):
        task.trace({"event": "model_error", "error": got.get("error")})
        return "MODEL_UNAVAILABLE"
    calls = got.get("calls") or ([{"tool": got["tool"], "args": got.get("args") or {}, "call_id": got.get("call_id") or "call_0"}]
                                 if got.get("tool") else [])
    if not calls:  # plain text with no tool call: treat as the final answer
        task.write("state.json", {**task.read("state.json"), "status": "DONE", "summary": got.get("text", ""), "evidence": ""})
        return "DONE"
    messages.append({"role": "assistant", "content": got.get("text") or None, "tool_calls": [
        {"id": c["call_id"], "type": "function", "function": {"name": c["tool"], "arguments": json.dumps(c["args"])}} for c in calls]})
    images, terminal = [], None
    for c in calls:
        name, args = c["tool"], c["args"] or {}
        decision, why = _authority().authorize(name, args)
        if name in TERMINAL:
            result = {"text": "ok"}
            terminal = ("DONE" if name == "done" else "WAITING_OWNER", args)
        elif decision == "deny":
            result = {"text": f"refused: {why}. Choose another way."}
        elif decision == "ask":
            result = {"text": f"needs Evens's OK first: {why}. Not run. Find another way or call ask_owner."}
        elif not hasattr(Tools, name) or name.startswith("_"):
            result = {"text": f"unknown tool {name}"}
        else:
            try:
                result = getattr(tools, name)(args)
            except Exception as exc:  # noqa: BLE001 — every failure is data for the model
                result = {"text": f"error: {type(exc).__name__}: {exc}"}
        task.trace({"event": "tool", "tool": name, "args": args, "decision": decision, "result": result.get("text", "")[:2000]})
        messages.append({"role": "tool", "tool_call_id": c["call_id"], "content": result.get("text", "")})
        if result.get("image"):
            images.append(result["image"])
    for img in images[-1:]:  # only the newest screenshot rides along
        messages.append({"role": "user", "content": [{"type": "text", "text": "Screenshot from the screenshot tool:"},
                                                     {"type": "image_url", "image_url": {"url": img}}]})
    task.write("messages.json", messages)
    if terminal:
        status, args = terminal
        state = task.read("state.json")
        state.update(status=status, summary=str(args.get("summary") or args.get("question") or ""),
                     evidence=str(args.get("evidence") or ""))
        task.write("state.json", state)
        return status
    return None


def run(task_dir: Path, *, model_fn=None, max_steps: int = MAX_STEPS, budget_s: float = TIME_BUDGET_S) -> dict:
    task = Task(task_dir)
    tools = Tools(task.path)
    model_fn = model_fn or _model_fn()
    state = task.read("state.json")
    state.update(status="RUNNING", pid=os.getpid(), started=state.get("started") or time.time())
    task.write("state.json", state)
    start = time.monotonic()
    while True:
        state = task.read("state.json")
        if task.cancelled():
            status = "CANCELLED"
        elif state["step"] >= max_steps:
            status = "STEP_LIMIT"
        elif time.monotonic() - start > budget_s:
            status = "TIME_LIMIT"
        else:
            state["step"] += 1
            task.write("state.json", state)
            status = step_once(task, tools, model_fn)
            if status is None:
                continue
        state = task.read("state.json")
        state.update(status=status, finished=time.time())
        task.write("state.json", state)
        return state


def start(hive: Path, goal: str) -> dict:
    """Create a task and run it in its own worker process (survives the Orb turn)."""
    task = Task.create(hive, goal)
    log = open(task.path / "worker.log", "w")
    subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run", str(task.path)], stdout=log,
                     stderr=subprocess.STDOUT, start_new_session=True, cwd=str(Path.home()))
    return {"task_id": task.path.name, "path": str(task.path)}


def resume(hive: Path, task_id: str) -> dict:
    task = Task(Path(hive) / "operator-tasks" / task_id)
    state = task.read("state.json")
    if state.get("status") in ("RUNNING",):
        return {"task_id": task_id, "status": "RUNNING"}
    task.write("control.json", {"cancel": False})
    state.update(status="QUEUED")
    task.write("state.json", state)
    log = open(task.path / "worker.log", "a")
    subprocess.Popen([sys.executable, str(Path(__file__).resolve()), "run", str(task.path)], stdout=log,
                     stderr=subprocess.STDOUT, start_new_session=True, cwd=str(Path.home()))
    return {"task_id": task_id, "status": "QUEUED"}


def cancel(hive: Path, task_id: str) -> None:
    Task(Path(hive) / "operator-tasks" / task_id).write("control.json", {"cancel": True})


def status(hive: Path, task_id: str | None = None) -> dict:
    root = Path(hive) / "operator-tasks"
    if not task_id:
        latest = root / "latest.json"
        task_id = json.loads(latest.read_text())["task_id"] if latest.exists() else ""
    if not task_id or not (root / task_id).exists():
        return {"status": "NONE"}
    task = Task(root / task_id)
    return {**task.read("state.json"), "goal": task.read("request.json", {}).get("goal", "")}


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "run":
        print(json.dumps(run(Path(sys.argv[2])), default=str))
