#!/usr/bin/env python3
"""Craft hand. Jarvis drives the 12 ArtCraft apps over their own MCP servers.

One long-lived `<app>-cli mcp` per app: the open document lives in that process.
Loop: inspect → model picks one MCP tool → call → inspect again. Bounded.
A tool call that returns is not success. The post-action inspect is the evidence.
Send / pay / deploy / book / publish / Post stay Evens.
"""
from __future__ import annotations

import atexit
import json
import os
import re
import select
import subprocess
import threading
import time
from pathlib import Path

APPS = (
    "cadcraft",
    "deckcraft",
    "designcraft",
    "effectcraft",
    "filmcraft",
    "gridcraft",
    "lightcraft",
    "pdfcraft",
    "photocraft",
    "soundcraft",
    "vectorcraft",
    "wordcraft",
)
BIN = Path(os.environ.get("CRAFT_BIN_DIR") or Path.home() / ".local" / "bin")
# Relative save paths land here, not in the repo.
WORKDIR = Path(os.environ.get("CRAFT_WORKDIR") or Path.home() / "Documents" / "Craft")
MAX_STEPS = 8
CALL_TIMEOUT = 60.0
# Face holds its wall while craft is open, so the hand owns the ceiling.
BUDGET_SEC = float(os.environ.get("CRAFT_BUDGET_SEC") or 90)
OBSERVE_CAP = 1200
SPEAK_CAP = 280
# Bridge-only tools need a live window. The headless hand never offers them.
BRIDGE_ONLY_RE = re.compile(r"^(ui_|control_call$)|screenshot", re.I)
HARD_RE = re.compile(r"\b(send|e-?mail|mail|share|upload|publish|post|deploy|pay|book|print|sign)\b", re.I)
# Reading a signature or a share list does not sign or share.
READ_ONLY_RE = re.compile(r"\b(list|inspect|get|verify|validate|query)\b", re.I)
# Past this many tools a provider rejects the call or the step drowns in schema.
TOOL_CAP = int(os.environ.get("CRAFT_TOOL_CAP") or 16)
SAVE_RE = re.compile(r"(^|_)(save|export)", re.I)
STOP_AFTER_SAVE = (os.environ.get("CRAFT_STOP_AFTER_SAVE") or "1") != "0"
DESC_CAP = int(os.environ.get("CRAFT_DESC_CAP") or 240)
CORE_RE = re.compile(r"inspect|command|^(new|open|save|export|undo|redo|session|doc_(new|open|save|export|select|close))", re.I)
WORD_RE = re.compile(r"[a-z]{3,}")
# A model that types the step log instead of calling the tool is claiming acts that never ran.
ECHO_RE = re.compile(r"\bStep \d+:|Inspect (before|after)|→ (ok|FAILED)\b", re.I)


from hands.mcp_call import LIST_METHOD as _LIST_METHOD


class CraftError(RuntimeError):
    pass


class _Session:
    """One `<app>-cli mcp` over stdio. JSON-RPC, newline framed."""

    def __init__(self, app: str):
        exe = BIN / f"{app}-cli"
        if not exe.is_file():
            raise CraftError(f"{app}-cli is not installed in {BIN}.")
        WORKDIR.mkdir(parents=True, exist_ok=True)
        self.app = app
        self.lock = threading.Lock()
        self._id = 0
        self._buf = b""
        self.proc = subprocess.Popen(
            [str(exe), "mcp"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            cwd=str(WORKDIR),
        )
        init = self._rpc(
            "initialize",
            {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "jarvis-craft", "version": "1"}},
            timeout=20.0,
        )
        self.instructions = str((init or {}).get("instructions") or "")
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        listed = self._rpc(_LIST_METHOD, {}, timeout=20.0)
        self.tools = [t for t in (listed or {}).get("tools", []) if isinstance(t, dict) and t.get("name")]
        self.inspect_tool = _pick_inspect(self.tools)

    def alive(self) -> bool:
        return self.proc.poll() is None

    def close(self) -> None:
        if self.alive():
            self.proc.terminate()
            try:
                self.proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.proc.kill()
        for pipe in (self.proc.stdin, self.proc.stdout):
            if pipe is not None:
                pipe.close()

    def _send(self, msg: dict) -> None:
        if not self.alive() or self.proc.stdin is None:
            raise CraftError(f"{self.app} MCP exited.")
        self.proc.stdin.write((json.dumps(msg) + "\n").encode("utf-8"))
        self.proc.stdin.flush()

    def _readline(self, deadline: float) -> bytes:
        fd = self.proc.stdout.fileno()
        while b"\n" not in self._buf:
            left = deadline - time.monotonic()
            if left <= 0:
                raise CraftError(f"{self.app} MCP timed out.")
            ready, _, _ = select.select([fd], [], [], left)
            if not ready:
                continue
            chunk = os.read(fd, 65536)
            if not chunk:
                raise CraftError(f"{self.app} MCP exited.")
            self._buf += chunk
        line, self._buf = self._buf.split(b"\n", 1)
        return line

    def _rpc(self, method: str, params: dict, *, timeout: float = CALL_TIMEOUT):
        self._id += 1
        want = self._id
        self._send({"jsonrpc": "2.0", "id": want, "method": method, "params": params})
        deadline = time.monotonic() + timeout
        while True:
            raw = self._readline(deadline).strip()
            if not raw:
                continue
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue
            # Server notifications and stale replies are not our answer.
            if not isinstance(msg, dict) or msg.get("id") != want:
                continue
            if msg.get("error"):
                err = msg["error"]
                raise CraftError(str(err.get("message") if isinstance(err, dict) else err))
            return msg.get("result")

    def call(self, name: str, params: dict) -> dict:
        """Returns {ok, answered, text}. MCP isError is a failure, not a result.

        answered: the app replied at all. "No document open" is still an observation.
        """
        with self.lock:
            try:
                res = self._rpc("tools/call", {"name": name, "arguments": params or {}})
            except CraftError as exc:
                return {"ok": False, "answered": False, "text": str(exc)}
        res = res if isinstance(res, dict) else {}
        parts = []
        for block in res.get("content") or []:
            if isinstance(block, dict) and block.get("type") == "text":
                parts.append(str(block.get("text") or ""))
            elif isinstance(block, dict):
                parts.append(f"[{block.get('type')}]")
        return {"ok": not res.get("isError"), "answered": True, "text": "\n".join(parts).strip()}

    def observe(self) -> dict:
        if not self.inspect_tool:
            return {"ok": False, "answered": False, "text": f"{self.app} has no inspect tool."}
        return self.call(self.inspect_tool, {})


# Words that claim a visible side effect, and the tool names that would prove it.
CLAIM_RE = re.compile(
    r"\b(now\s+open|opened|is\s+open|launched|sent|emailed|posted|published|uploaded|shared)\b",
    re.I,
)
PROOF_TOOL_RE = re.compile(r"open|launch|reveal|show|send|mail|post|publish|upload|share", re.I)


def honest_claim(text: str, steps: list[dict], app: str) -> str:
    """Drop sentences that claim an open/send no tool result confirms."""
    if not text or not CLAIM_RE.search(text):
        return text
    if any(row.get("ok") and PROOF_TOOL_RE.search(str(row.get("tool") or "")) for row in steps or []):
        return text
    # Trim a trailing ", and it's now open in X ..." clause first so the true part survives.
    text = re.sub(r",?\s+and\s+(?:it's|it\s+is|is)\s+now\s+open\b[^.!?]*", "", text, flags=re.I)
    keep = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s and not CLAIM_RE.search(s)]
    ran = ", ".join(str(r.get("tool")) for r in steps or [] if r.get("ok")) or "no tool"
    note = f"I ran {ran} in {app}; no tool opened or sent anything, so I am not claiming that."
    return " ".join(keep + [note]).strip()


def _pick_inspect(tools: list[dict]) -> str:
    names = [str(t["name"]) for t in tools]
    for name in names:
        if "inspect" in name and not BRIDGE_ONLY_RE.search(name):
            return name
    for name in ("session_list", "list_documents"):
        if name in names:
            return name
    return ""


_SESSIONS: dict[str, _Session] = {}
_GUARD = threading.Lock()


def session(app: str) -> _Session:
    with _GUARD:
        live = _SESSIONS.get(app)
        if live is not None and live.alive():
            return live
        live = _Session(app)
        _SESSIONS[app] = live
        return live


@atexit.register
def close_all() -> None:
    with _GUARD:
        for live in _SESSIONS.values():
            live.close()
        _SESSIONS.clear()


def _select_tools(tools: list[dict], task: str) -> list[dict]:
    """Core tools always; the rest ranked by overlap with the task, up to TOOL_CAP.

    Every big Craft app keeps command_list / command_run in core, so a dropped
    tool stays reachable by command id.
    """
    if len(tools) <= TOOL_CAP:
        return tools
    want = set(WORD_RE.findall((task or "").lower()))
    core = [t for t in tools if CORE_RE.search(str(t["name"]))][:TOOL_CAP]

    def score(t: dict) -> int:
        blob = re.sub(r"(?<=[a-z])(?=[A-Z])|_", " ", f"{t['name']} {t.get('description') or ''}")
        words = set(WORD_RE.findall(blob.lower()))
        return len(want & words)

    rest = sorted((t for t in tools if t not in core), key=score, reverse=True)
    return core + rest[: TOOL_CAP - len(core)]


def tool_schemas(live: _Session, task: str = "") -> list[dict]:
    """The app's real MCP tools as OpenRouter functions. Bridge-only tools dropped."""
    rows = []
    usable = [t for t in live.tools if not BRIDGE_ONLY_RE.search(str(t["name"]))]
    for t in _select_tools(usable, task):
        name = str(t["name"])
        schema =t.get("inputSchema") if isinstance(t.get("inputSchema"), dict) else {"type": "object", "properties": {}}
        rows.append(
            {
                "type": "function",
                "function": {
                    "name": name,
                    "description": str(t.get("description") or "")[:DESC_CAP],
                    "parameters": schema,
                },
            }
        )
    return rows


def hard_step(app: str, tool: str, params: dict) -> str:
    """Return a refusal line when this call would leave the Mac, else ""."""
    # `_` is a word char, so split snake_case and camelCase before matching words.
    name = re.sub(r"[_\-.]+|(?<=[a-z])(?=[A-Z])", " ", tool or "")
    blob = json.dumps(params or {}, sort_keys=True)
    if not READ_ONLY_RE.search(name):
        blob = f"{name} {blob}"
    hit = HARD_RE.search(blob)
    if hit:
        return f"That {app} step would {hit.group(1).lower()}. That stays yours. I stopped before it."
    return ""


def _clip(text: str, cap: int) -> str:
    body = (text or "").strip()
    return body if len(body) <= cap else body[: cap - 1].rstrip() + "…"


def _system(app: str, instructions: str) -> str:
    return "\n".join(
        [
            f"You drive {app} through its tools for Jarvis. You are a worker, not the voice.",
            f"{app} notes: {_clip(instructions, 600)}",
            "Call every step you already know in one turn as parallel tool calls; they run in order. File paths are relative to ~/Documents/Craft unless he named one.",
            "Each tool reply carries the app's real inspect after the act. Only tool replies are facts.",
            "When the task is met, call no tool and reply with one short spoken sentence of what the last inspect shows.",
            "Never claim an act you did not call. Send, pay, deploy, book, publish and Post are refused.",
        ]
    )


def _tool_reply(did: dict, after: dict) -> str:
    return f"{'ok' if did['ok'] else 'FAILED'}: {_clip(did['text'], 400)}\nInspect after: {_clip(after['text'], OBSERVE_CAP)}"


def _timed_out(got: dict) -> bool:
    if got.get("ok") is not False and not got.get("unknown"):
        return False
    return "timeout" in str(got.get("spoken") or got.get("error") or "").lower()


def run(args: dict, utterance: str, *, model_fn, session_fn=session, budget_sec: float | None = None) -> dict:
    """Observe → act → observe again, at most MAX_STEPS acts and budget_sec. Returns a hand result.

    model_fn(messages, tools) → {ok, tool, args, call_id, text, error}. Real tool roles:
    each act's result and fresh inspect go back as a `tool` message, never as text to continue.
    """
    deadline = time.monotonic() + (BUDGET_SEC if budget_sec is None else budget_sec)
    app = str((args or {}).get("app") or "").strip().lower()
    task = str((args or {}).get("task") or utterance or "").strip()
    if app not in APPS:
        return {"ok": False, "wire": "craft", "spoken": f"I do not have a Craft app called {app or 'that'}.", "steps": []}
    if not task:
        return {"ok": False, "wire": "craft", "spoken": f"What should I do in {app}?", "steps": []}
    asked = HARD_RE.search(task)
    if asked:
        # Live: "open it and email it" opened the file and dropped the email silently.
        # A hard step in the ask is a proposal, then stop. Not a quiet partial.
        verb = asked.group(1).lower()
        return {
            "ok": True,
            "wire": "craft",
            "refused": verb,
            "spoken": f"That ask includes {verb}, and {verb} stays yours. I did not touch {app}. Say the part without it and I will do that.",
            "steps": [],
        }
    try:
        live = session_fn(app)
    except (CraftError, OSError) as exc:
        return {"ok": False, "wire": "craft", "spoken": f"{app} is dark: {exc}", "steps": []}
    schemas = tool_schemas(live, task)
    allowed = {row["function"]["name"] for row in schemas}
    before = live.observe()
    messages: list[dict] = [
        {"role": "system", "content": _system(app, live.instructions)},
        {"role": "user", "content": f"Task: {task}\nInspect now: {_clip(before.get('text', ''), OBSERVE_CAP)}"},
    ]
    steps: list[dict] = []
    final = ""
    stopped = ""
    model_error = ""
    echoed = False
    for _ in range(MAX_STEPS):
        if time.monotonic() >= deadline:
            stopped = f"I ran out of time in {app} after {len(steps)} step{'s' if len(steps) != 1 else ''}."
            break
        got = model_fn(messages, schemas)
        got = got if isinstance(got, dict) else {}
        if _timed_out(got) and time.monotonic() < deadline:
            # One slow reply is weather, not a dark model. Retry once.
            got = model_fn(messages, schemas)
            got = got if isinstance(got, dict) else {}
        if got.get("ok") is False or got.get("unknown"):
            # A dark or truncated model is not "nothing to do".
            stopped = f"The model behind the {app} hand is dark. I stopped after {len(steps)} step{'s' if len(steps) != 1 else ''}."
            model_error = _clip(str(got.get("error") or got.get("spoken") or ""), 300)
            break
        tool = str(got.get("tool") or "")
        if not tool:
            final = str(got.get("text") or got.get("spoken") or "").strip()
            if ECHO_RE.search(final) or final.lstrip().startswith("{"):
                # Typed state is a claim of acts that never ran.
                if echoed:
                    stopped = f"The {app} model kept describing steps instead of running them. I stopped after {len(steps)}."
                    final = ""
                    break
                echoed = True
                final = ""
                messages.append({"role": "user", "content": "That reply typed results as text. Text runs nothing. Call the tool, or reply with one plain sentence."})
                continue
            break
        batch = [c for c in (got.get("calls") or []) if isinstance(c, dict) and c.get("tool")]
        if not batch:
            batch = [{"tool": tool, "args": got.get("args"), "call_id": got.get("call_id")}]
        # Parallel tool calls run in order in one model round; inspect once after the batch.
        # Profiled live: 5 model rounds x ~4 s was the whole 22-29 s GridCraft turn.
        plan = []
        for n, call in enumerate(batch):
            name = str(call.get("tool") or "")
            params = call.get("args") if isinstance(call.get("args"), dict) else {}
            if name not in allowed:
                stopped = f"The model picked {name}, which {app} does not offer. I stopped."
                break
            refusal = hard_step(app, name, params)
            if refusal:
                stopped = refusal
                break
            plan.append((name, params, str(call.get("call_id") or f"call_{len(steps) + n + 1}")))
        if stopped:
            break
        results = []
        for name, params, call_id in plan:
            did = live.call(name, params)
            results.append((name, params, call_id, did))
            if not did["ok"]:
                break
        after = live.observe()
        messages.append(
            {
                "role": "assistant",
                "content": None,
                "tool_calls": [
                    {"id": cid, "type": "function", "function": {"name": name, "arguments": json.dumps(params)}}
                    for name, params, cid, _did in results
                ],
            }
        )
        for i, (name, params, call_id, did) in enumerate(results):
            last = i == len(results) - 1
            steps.append(
                {"tool": name, "params": params, "ok": did["ok"], "result": did["text"],
                 "after": after["text"] if last else "", "observed": after["answered"]}
            )
            reply = _tool_reply(did, after) if last else f"{'ok' if did['ok'] else 'FAILED'}: {_clip(did['text'], 400)}"
            messages.append({"role": "tool", "tool_call_id": call_id, "content": reply})
        failed = next((r for r in results if not r[3]["ok"]), None)
        if failed:
            stopped = f"{app} refused {failed[0]}: {_clip(failed[3]['text'], 160)}"
            break
        if STOP_AFTER_SAVE and SAVE_RE.search(results[-1][0]) and after["answered"]:
            # A save that ends the batch is the end of the job; skip a narration-only model round (~5 s).
            saved = next((str(v) for v in results[-1][1].values() if isinstance(v, str) and "." in v), "")
            final = f"Done in {app}: ran {', '.join(row['tool'] for row in steps)}" + (f"; saved {saved}." if saved else ".")
            break
    else:
        stopped = f"I hit the {MAX_STEPS}-step limit in {app}."
    acted_ok = all(row["ok"] and row["observed"] for row in steps)
    ok = acted_ok and not stopped
    if stopped:
        spoken = stopped
    elif steps and final:
        spoken = honest_claim(final, steps, app)
    elif steps:
        spoken = f"Ran {', '.join(row['tool'] for row in steps)} in {app}."
    else:
        spoken = honest_claim(final, steps, app) if final else f"I did not change anything in {app}."
    return {
        "ok": ok,
        "wire": "craft",
        "spoken": _clip(spoken, SPEAK_CAP),
        "steps": steps,
        "observed": _clip((steps[-1]["after"] if steps else before.get("text", "")), OBSERVE_CAP),
        "model_error": model_error,
    }
