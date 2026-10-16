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
    "You are Jarvis, Evens's assistant on his Mac. You work the way Claude Code, Codex and the other frontier agents "
    "work: ONE agent in a loop. You read the whole conversation, decide, use tools, check the real result, and keep "
    "going until the thing is actually done. There is no other brain behind you and nobody to hand work to.\n"
    "Talking: use say whenever you have something for him — the answer to a plain question (answer it and finish; do "
    "not open tools for arithmetic or general knowledge), what you are about to do, what you just found, or a snag. "
    "Speak like a capable colleague: plain English, short, no markdown, no file slugs, no model names, no step numbers, "
    "no 'I have not run an executor'. One or two sentences at a time.\n"
    "Working: prefer shell and files when they do the job; screenshot + mouse + keyboard for apps and web pages with no "
    "better interface (your blue cursor shows him where you click); mcp for external services. When something fails, "
    "diagnose it and try another way — do not report a failure you have not tried to get around, and never tell him to "
    "do it himself. If he says something while you work, it arrives as a new user message: take it into account.\n"
    "Truth: never claim a step you did not verify with a real result. If you could not do something, say exactly what "
    "stopped you.\n"
    "His stops (ask first, then continue another way): sending or posting, spending, deleting his files, merging or "
    "public pushes. Secrets are flagged, never refused. Finish with done: what you did, in his words, with the evidence.\n"
    "Your methods live as skills: before specialist work, find and read the matching SKILL.md (find_files 'SKILL.md' "
    "under ~/.claude/skills, ~/.codex/skills, ~/.agents/skills) and follow it."
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
    _fn("say", "Say something to Evens right now and keep working: your answer to a plain question, what you are "
               "about to do, or what you just found. Speak plain English, one or two sentences.", {"text": S}, ["text"]),
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
        self.root = task_dir
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

    def _show_cursor(self, x, y) -> None:
        """Evens 10-16: "still no floating cursor". Jarvis's blue cursor glides to the target before the action lands
        (the same overlay the Watch clicks use). Best effort: a missing overlay never blocks the action."""
        try:
            spec = importlib.util.spec_from_file_location("agent_stack_pointer_operator", Path(__file__).with_name("pointer.py"))
            ph = importlib.util.module_from_spec(spec); spec.loader.exec_module(ph)
            if not ph.live():
                return
            try:
                frm = tuple(ph.cursor_display()["cursor"])
            except Exception:  # noqa: BLE001
                frm = (x, y)
            if ph.cursor_start(frm, (float(x), float(y)), 3):
                time.sleep(ph.GLIDE_SEC)
        except Exception:  # noqa: BLE001
            return

    def mouse(self, a):
        act = str(a.get("action") or "click")
        if act in ("move", "click", "double_click", "right_click", "drag") and "x" in a and "y" in a:
            self._show_cursor(a["x"], a["y"])
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

    def say(self, a):
        line = str(a.get("text") or "").strip()
        if line:
            Task(self.root).speak(line)
        return {"text": "said"}

    def mcp(self, a, approved=False):
        got = _load("agent_tools", "agent_tools.py").op_mcp(str(a["server"]), str(a["tool"]), a.get("arguments") or {},
                                                            approved=approved)
        return {"text": _clip(got.get("spoken") or json.dumps(got, default=str))}


class Task:
    """Durable record of one operator task."""

    def __init__(self, path: Path):
        self.path = Path(path)

    @classmethod
    def create(cls, hive: Path, goal: str, turns: list | None = None) -> "Task":
        tid = uuid.uuid4().hex
        d = Path(hive) / "operator-tasks" / tid
        d.mkdir(parents=True)
        t = cls(d)
        t.write("request.json", {"task_id": tid, "goal": goal, "created": time.time()})
        history = []
        for row in (turns or [])[-6:]:  # the conversation continues: "another one", "it", "do that again"
            if str(row.get("user") or "").strip():
                history.append({"role": "user", "content": str(row["user"])[:1500]})
            if str(row.get("jarvis") or "").strip():
                history.append({"role": "assistant", "content": str(row["jarvis"])[:1500]})
        t.write("messages.json", [{"role": "system", "content": system_prompt()}, *history,
                                  {"role": "user", "content": goal}])
        t.write("state.json", {"task_id": tid, "status": "QUEUED", "step": 0})
        (Path(hive) / "operator-tasks" / "latest.json").write_text(json.dumps({"task_id": tid}))
        return t

    def speak(self, line: str) -> None:
        """One spoken line, now. The Face streams these while the loop keeps working."""
        with (self.path / "speech.jsonl").open("a", encoding="utf-8") as fh:
            fh.write(json.dumps({"at": time.time(), "text": line}) + "\n")

    def rows(self, name: str) -> list:
        out = []
        try:
            for line in (self.path / name).read_text(encoding="utf-8").splitlines():
                try:
                    out.append(json.loads(line))
                except ValueError:
                    pass
        except OSError:
            pass
        return out

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


def _scrub(text: str) -> str:
    try:
        spec = importlib.util.spec_from_file_location("agent_stack_workspace_read_operator", Path(__file__).with_name("workspace_read.py"))
        mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        return mod.scrub_text(text)
    except Exception:  # noqa: BLE001 - without the scrubber, keep nothing rather than raw keys
        return "[secret output withheld: the masking step failed]"


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
    # Cost (live 10-16: eight Opus jobs emptied the OpenRouter balance mid-run). Sonnet first; "use opus" switches.
    chain = ((os.environ.get("JARVIS_OPERATOR_MODEL") or "anthropic/claude-sonnet-5.5").strip(), agent.CODE_MODEL)
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
        if decision == "allow" and str(why).startswith("flag"):
            # Evens 10-16: secrets are flagged, never a stop; values stay masked in messages, trace and the model
            result = {**result, "text": "Heads up: this holds secrets; values are masked. " + _scrub(str(result.get("text") or ""))}
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
        line = str(args.get("summary") or args.get("question") or "")
        if line.strip():
            task.speak(line.strip())  # the last thing he hears is spoken the same way as the rest (one voice)
        state.update(status=status, summary=line, evidence=str(args.get("evidence") or ""))
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


def start(hive: Path, goal: str, turns: list | None = None) -> dict:
    """Create a task and run it in its own worker process (survives the Orb turn)."""
    task = Task.create(hive, goal, turns=turns)
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


def running(hive: Path) -> bool:
    return str(status(hive).get("status") or "") in ("RUNNING", "QUEUED")


def tell(hive: Path, line: str) -> dict:
    """Evens speaks while the loop works: his line joins THAT conversation (never a second job). Like talking to
    Claude Code mid-task (Evens 10-16: "it is still not a complete harness")."""
    state = status(hive)
    tid = str(state.get("task_id") or "")
    if not tid or state.get("status") not in ("RUNNING", "QUEUED"):
        return {"ok": False}
    task = Task(Path(hive) / "operator-tasks" / tid)
    with FileLock(task.path / "messages.lock"):
        msgs = task.read("messages.json", [])
        msgs.append({"role": "user", "content": str(line)[:4000]})
        task.write("messages.json", msgs)
    return {"ok": True, "task_id": tid}


class FileLock:
    def __init__(self, path):
        self.path = Path(path)

    def __enter__(self):
        import fcntl
        self.fh = open(self.path, "a+")
        fcntl.flock(self.fh, fcntl.LOCK_EX)
        return self

    def __exit__(self, *exc):
        import fcntl
        fcntl.flock(self.fh, fcntl.LOCK_UN); self.fh.close()


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
