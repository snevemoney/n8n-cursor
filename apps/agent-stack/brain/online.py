#!/usr/bin/env python3
"""Talk hosts and live wires. Local face only. No Ollama.

Talk harness is Cursor CLI (cloud). Memory is the store
(vault + repo + sessions + hive). No Ollama. Do not nag for xAI keys.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HIVE = ROOT / "docs/hive/outer-heaven/.hive"
GOLDEN = "https://evenslouis.ca/scorpion/api/hive/golden-paths"
SCORPION_HEALTH = "https://evenslouis.ca/scorpion/healthz"
PRO_HEALTH = "https://evenslouis.ca/pro/api/health"
XAI_URL = "https://api.x.ai/v1/chat/completions"
GROKBOT_CONN = Path.home() / ".grokbot/local-exec-daemon-connection.json"
DEFAULT_VPS = "root@69.62.66.78"
DEFAULT_MODEL = "grok-4"
SPEAK_CAP = 900
_CURSOR_LOCK = threading.Lock()
_CURSOR_PROC: subprocess.Popen | None = None
_CURSOR_CANCELLED = False
SYS = (
    "You are Jarvis for Evens Louis. Face and mic stay on the 8GB Mac. "
    "The brain is the store: Obsidian vault, this git repo, chat sessions, and the hive. "
    "You are a talk host. Answer from the store pack in Live context. "
    "Cursor is a hand for repo turns. Grok Bot is a desk. Neither is the skull. "
    "Hard steps (send, pay, deploy, book, publish) stay Evens. "
    "Never invent Claude, ChatGPT, Gemini, or Ollama. Speak short."
)


def clip_spoken(text: str, cap: int = SPEAK_CAP) -> str:
    body = (text or "").strip()
    if len(body) <= cap:
        return body
    cut = body[:cap]
    for mark in (". ", "? ", "! ", "\n"):
        idx = cut.rfind(mark)
        if idx >= 80:
            return cut[: idx + 1].strip()
    return cut.rsplit(" ", 1)[0].strip()


def cancel_cursor() -> bool:
    global _CURSOR_PROC, _CURSOR_CANCELLED
    _CURSOR_CANCELLED = True
    with _CURSOR_LOCK:
        proc = _CURSOR_PROC
        _CURSOR_PROC = None
    if proc is None:
        return False
    if proc.poll() is None:
        proc.kill()
        return True
    return False


def was_cancelled() -> bool:
    return _CURSOR_CANCELLED


def _http_json(url: str, *, data: dict | None = None, headers: dict | None = None, timeout: float = 20.0) -> dict:
    raw = None if data is None else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=raw,
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST" if data is not None else "GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        body = res.read().decode("utf-8", errors="replace")
        code = res.status
    if not body.strip():
        return {"ok": True, "http": code}
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        return {"ok": True, "http": code, "text": body[:240]}
    if isinstance(parsed, dict):
        parsed.setdefault("ok", True)
        parsed["http"] = code
        return parsed
    return {"ok": True, "http": code, "data": parsed}


def _http_code(url: str, timeout: float = 8.0) -> int:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as res:
            return int(res.status)
    except urllib.error.HTTPError as exc:
        return int(exc.code)
    except (urllib.error.URLError, TimeoutError, OSError):
        return 0


def grok_api_key() -> str:
    return (os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY") or "").strip()


def grok_model() -> str:
    return (os.environ.get("GROK_MODEL") or DEFAULT_MODEL).strip() or DEFAULT_MODEL


def grokbot_gateway() -> dict | None:
    base = (os.environ.get("GROKBOT_BASE_URL") or "").strip().rstrip("/")
    token = (os.environ.get("GROKBOT_TOKEN") or "").strip()
    if base and token:
        return {"base": base, "token": token, "source": "env"}
    if not GROKBOT_CONN.is_file():
        return None
    try:
        conn = json.loads(GROKBOT_CONN.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if not isinstance(conn, dict):
        return None
    url = str(conn.get("baseUrl") or "").strip().rstrip("/")
    tok = str(conn.get("token") or "").strip()
    if url and tok:
        return {"base": url, "token": tok, "source": "grokbot-conn"}
    if conn.get("sandSealedFile") or (isinstance(conn.get("data"), str) and "baseUrl" not in conn):
        return {"sealed": True, "source": "grokbot-sealed"}
    return None


def cursor_cli() -> str | None:
    for name in ("cursor", "agent"):
        path = shutil.which(name)
        if path:
            return path
    return None


def agent_cmd() -> list[str] | None:
    """Prefer the headless `agent` binary. `cursor` is the GUI."""
    agent = shutil.which("agent")
    if agent:
        return [agent]
    cursor = shutil.which("cursor")
    if cursor:
        return [cursor, "agent"]
    return None


def wire_report() -> dict:
    gw = grokbot_gateway()
    grokbot = "live" if gw and gw.get("base") else ("sealed" if gw and gw.get("sealed") else "dark")
    return {
        "ok": True,
        "local": "face+mic+tts",
        "ollama": "refused",
        "wires": {
            "brain": "store",
            "store": "vault+repo+sessions+hive",
            "grok": "talk" if grok_api_key() else "off",
            "grokbot": grokbot,
            "hive": "http",
            "vps": "ssh",
            "cursor": "harness" if agent_cmd() else "dark",
            "vault": "store",
            "calendar": "macos",
            "mail": "macos",
            "invoice": "vault",
        },
        "need": [] if agent_cmd() else ["Cursor agent CLI"],
    }


def unknown_grok() -> dict:
    return {
        "ok": False,
        "unknown": True,
        "wire": "grok",
        "spoken": "UNKNOWN. Grok is a desk host, not the store.",
        "engine": "unknown",
    }


def call_xai(prompt: str, context: str = "") -> dict:
    key = grok_api_key()
    if not key:
        return unknown_grok()
    user = prompt.strip()
    if context.strip():
        user = f"{user}\n\nLive context:\n{context.strip()[:4000]}"
    try:
        data = _http_json(
            XAI_URL,
            data={
                "model": grok_model(),
                "temperature": 0.3,
                "messages": [
                    {"role": "system", "content": SYS},
                    {"role": "user", "content": user},
                ],
            },
            headers={"Authorization": f"Bearer {key}"},
            timeout=45.0,
        )
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "grok",
            "engine": "xai",
            "spoken": f"UNKNOWN. Grok xAI call failed: {exc}.",
        }
    choices = data.get("choices") if isinstance(data, dict) else None
    text = ""
    if isinstance(choices, list) and choices:
        msg = choices[0].get("message") if isinstance(choices[0], dict) else {}
        text = str((msg or {}).get("content") or "").strip()
    if not text:
        err = data.get("error") if isinstance(data, dict) else None
        return {
            "ok": False,
            "unknown": True,
            "wire": "grok",
            "engine": "xai",
            "spoken": f"UNKNOWN. Grok xAI returned no text. {err or data.get('http')}.",
        }
    text = clip_spoken(text)
    return {"ok": True, "unknown": False, "wire": "grok", "engine": "xai", "spoken": text, "model": grok_model()}


def call_grokbot(prompt: str, context: str = "") -> dict:
    gw = grokbot_gateway()
    if not gw or not gw.get("base"):
        return unknown_grok()
    body = prompt.strip()
    if context.strip():
        body = f"{body}\n\nLive context:\n{context.strip()[:2000]}"
    headers = {"Authorization": f"Bearer {gw['token']}", "Content-Type": "application/json"}
    try:
        agents = _http_json(f"{gw['base']}/api/listAgents", data={}, headers=headers, timeout=20.0)
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "grokbot",
            "engine": "grokbot",
            "spoken": f"UNKNOWN. Grok Bot gateway failed: {exc}.",
        }
    rows = agents if isinstance(agents, list) else agents.get("agents") or agents.get("data") or []
    by_name = {}
    if isinstance(rows, list):
        for row in rows:
            if isinstance(row, dict) and row.get("name") and row.get("id"):
                by_name[str(row["name"])] = str(row["id"])
    agent_id = by_name.get("Big Boss") or by_name.get("Jarvis") or (next(iter(by_name.values()), None) if by_name else None)
    if not agent_id:
        return {
            "ok": False,
            "unknown": True,
            "wire": "grokbot",
            "engine": "grokbot",
            "spoken": "UNKNOWN. Grok Bot has no listed desk. Keep Grok Bot open and signed in.",
        }
    try:
        sent = _http_json(
            f"{gw['base']}/api/sendPrompt",
            data={"agentId": agent_id, "prompt": body},
            headers=headers,
            timeout=30.0,
        )
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "grokbot",
            "engine": "grokbot",
            "spoken": f"UNKNOWN. Grok Bot sendPrompt failed: {exc}.",
        }
    reply = ""
    for path in ("/api/getLastMessage", "/api/getAgentMessages", "/api/listMessages"):
        try:
            got = _http_json(f"{gw['base']}{path}", data={"agentId": agent_id}, headers=headers, timeout=15.0)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError):
            continue
        if isinstance(got, dict):
            reply = str(got.get("text") or got.get("message") or got.get("content") or "").strip()
            msgs = got.get("messages") or got.get("data") or []
            if not reply and isinstance(msgs, list) and msgs:
                last = msgs[-1]
                if isinstance(last, dict):
                    reply = str(last.get("text") or last.get("content") or "").strip()
        if reply:
            break
        if reply:
            return {"ok": True, "unknown": False, "wire": "grokbot", "engine": "grokbot", "spoken": clip_spoken(reply)}
    return {
        "ok": False,
        "unknown": True,
        "wire": "grokbot",
        "engine": "grokbot",
        "queued": True,
        "ack": sent,
        "spoken": (
            "UNKNOWN. Grok Bot sendPrompt did not return a spoken reply. "
            "Grok Bot is a desk, not the store."
        ),
    }


def call_grok(prompt: str, context: str = "") -> dict:
    if grok_api_key():
        return call_xai(prompt, context)
    return call_grokbot(prompt, context)


def call_hive() -> dict:
    facts: list[str] = []
    try:
        golden = _http_json(GOLDEN, timeout=12.0)
        if golden.get("ok") or golden.get("http") == 200:
            facts.append(f"Golden paths {golden.get('passCount', '?')}/{golden.get('total', '?')}.")
        else:
            facts.append("UNKNOWN. Hive golden-paths did not return ok.")
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as exc:
        facts.append(f"UNKNOWN. Hive golden-paths failed: {exc}.")
    sc = _http_code(SCORPION_HEALTH)
    facts.append(f"Scorpion healthz HTTP {sc or 'down'}.")
    pro = _http_code(PRO_HEALTH)
    facts.append(f"Pro health HTTP {pro or 'down'}.")
    state_py = ROOT / "scripts/hive/hive-state.py"
    if state_py.is_file():
        try:
            proc = subprocess.run(
                [os.environ.get("PYTHON") or "python3", str(state_py), "get", "--key", "last_run"],
                capture_output=True,
                text=True,
                timeout=8,
                cwd=str(ROOT),
            )
            if proc.returncode == 0 and proc.stdout.strip():
                try:
                    last = json.loads(proc.stdout)
                except json.JSONDecodeError:
                    last = {}
                if isinstance(last, dict) and last:
                    facts.append(
                        f"Hive last_run {last.get('id') or '?'} {last.get('job') or last.get('desk') or ''}.".strip()
                    )
        except (OSError, subprocess.TimeoutExpired):
            facts.append("UNKNOWN. hive-state last_run failed.")
    spoken = " ".join(facts).strip()
    return {"ok": True, "wire": "hive", "spoken": spoken, "facts": facts}


def call_vps() -> dict:
    target = (os.environ.get("HIVE_VPS_SSH") or DEFAULT_VPS).strip()
    if shutil.which("ssh") is None:
        return {"ok": False, "unknown": True, "wire": "vps", "spoken": "UNKNOWN. ssh CLI is missing for the VPS wire."}
    try:
        proc = subprocess.run(
            [
                "ssh",
                "-o",
                "BatchMode=yes",
                "-o",
                "ConnectTimeout=8",
                target,
                "hostname; uptime; df -h / | tail -1",
            ],
            capture_output=True,
            text=True,
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "unknown": True, "wire": "vps", "spoken": f"UNKNOWN. VPS SSH failed: {exc}."}
    if proc.returncode != 0:
        err = (proc.stderr or proc.stdout or "no key or host down").strip()[:180]
        return {"ok": False, "unknown": True, "wire": "vps", "spoken": f"UNKNOWN. VPS SSH to {target} failed. {err}"}
    lines = [ln.strip() for ln in (proc.stdout or "").splitlines() if ln.strip()]
    host = lines[0] if lines else target
    rest = " ".join(lines[1:]) if len(lines) > 1 else ""
    spoken = f"VPS {host} live. {rest}".strip()
    token = (os.environ.get("HOSTINGER_API_TOKEN") or "").strip()
    if not token:
        spoken += " Hostinger API token is dark — SSH used instead."
    return {"ok": True, "wire": "vps", "spoken": spoken, "host": host}


def call_cursor() -> dict:
    cmd = agent_cmd()
    if not cmd:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "spoken": "UNKNOWN. Cursor agent CLI is missing.",
        }
    try:
        proc = subprocess.run([*cmd, "--version"], capture_output=True, text=True, timeout=8)
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "unknown": True, "wire": "cursor", "spoken": f"UNKNOWN. Cursor CLI failed: {exc}."}
    ver = (proc.stdout or proc.stderr or "").strip().splitlines()[0] if (proc.stdout or proc.stderr) else "present"
    spoken = f"Cursor agent {ver}. Repo turns print through this CLI. Hands parked. No yolo."
    return {"ok": True, "wire": "cursor", "spoken": spoken}


def cursor_logged_in() -> bool:
    cmd = agent_cmd()
    if not cmd:
        return False
    try:
        proc = subprocess.run([*cmd, "status"], capture_output=True, text=True, timeout=8)
    except (OSError, subprocess.TimeoutExpired):
        return False
    text = f"{proc.stdout or ''} {proc.stderr or ''}".lower()
    return "not logged in" not in text and bool((proc.stdout or proc.stderr or "").strip())


def ensure_jarvis_chat(chat_id: str | None = None) -> str | None:
    """Warm remap of `agent persist`.

    The persist CLI needs tmux and a TTY attach. Headless 4018 cannot use it.
    Pre-create a chat, then always `--resume` it. Do not dump other sessions.
    """
    existing = (chat_id or "").strip()
    if existing:
        return existing
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return None
    cmd = agent_cmd()
    if not cmd or not cursor_logged_in():
        return None
    try:
        proc = subprocess.run([*cmd, "create-chat"], capture_output=True, text=True, timeout=20, cwd=str(ROOT))
    except (OSError, subprocess.TimeoutExpired):
        return None
    out = (proc.stdout or "").strip()
    match = re.search(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", out, re.I)
    if match:
        return match.group(0)
    token = out.split()[-1] if out else ""
    return token or None


def ensure_jarvis_chats(talk_id: str | None = None, agent_id: str | None = None) -> dict:
    """One ask/talk chat and one tool chat. Agent must not resume an ask-locked chat."""
    return {
        "talk": ensure_jarvis_chat(talk_id),
        "agent": ensure_jarvis_chat(agent_id),
    }


def take_sentences(buf: str) -> tuple[list[str], str]:
    """Split completed sentences from a growing buffer. Return (sentences, remainder)."""
    rest = buf or ""
    out: list[str] = []
    while True:
        match = re.search(r"[.!?](?:\s+|$)", rest)
        if not match:
            break
        chunk = rest[: match.end()].strip()
        rest = rest[match.end() :]
        if len(chunk) < 2:
            continue
        out.append(chunk)
    return out, rest


def parse_stream_json_line(line: str) -> dict:
    """Tolerant Cursor stream-json line → {delta, result}."""
    raw = (line or "").strip()
    if raw.startswith("data:"):
        raw = raw[5:].strip()
    if not raw:
        return {"delta": "", "result": ""}
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError:
        if raw.startswith("{"):
            return {"delta": "", "result": ""}
        return {"delta": raw, "result": ""}
    if isinstance(obj, str):
        return {"delta": obj, "result": ""}
    if not isinstance(obj, dict):
        return {"delta": "", "result": ""}
    typ = str(obj.get("type") or obj.get("subtype") or "")
    if typ == "result":
        res = obj.get("result")
        if res is None:
            res = obj.get("text")
        return {"delta": "", "result": str(res).strip() if res else ""}
    text = _stream_delta_text(obj)
    return {"delta": text, "result": ""}


def _stream_delta_text(obj: dict) -> str:
    typ = str(obj.get("type") or "")
    if typ in ("system", "tool_call", "tool-call", "tool_result", "tool-result"):
        return ""
    for key in ("delta", "text", "content"):
        val = obj.get(key)
        if isinstance(val, str) and val:
            if key == "content" and typ in ("", "result"):
                continue
            if typ in ("text-delta", "text_delta", "content_block_delta", "assistant", "content", ""):
                return val
        if isinstance(val, dict):
            inner = val.get("text") or val.get("delta") or val.get("content")
            if isinstance(inner, str) and inner:
                return inner
        if isinstance(val, list):
            bits = _content_list_text(val)
            if bits:
                return bits
    msg = obj.get("message")
    if isinstance(msg, dict):
        content = msg.get("content")
        if isinstance(content, str) and content:
            return content
        if isinstance(content, list):
            return _content_list_text(content)
    return ""


def _content_list_text(parts: list) -> str:
    bits: list[str] = []
    for part in parts:
        if isinstance(part, str):
            bits.append(part)
        elif isinstance(part, dict):
            bits.append(str(part.get("text") or part.get("content") or part.get("delta") or ""))
    return "".join(bits)


def _cursor_argv(cmd: list[str], prompt: str, *, mode: str, resume: str | None) -> tuple[list[str], str, str, int]:
    use_mode = mode if mode in ("ask", "plan", "agent") else "ask"
    argv = [
        *cmd,
        "-p",
        "--trust",
        "--workspace",
        str(ROOT),
        "--output-format",
        "stream-json",
        "--stream-partial-output",
    ]
    if use_mode in ("ask", "plan"):
        argv.extend(["--mode", use_mode])
    chat = (resume or "").strip()
    if chat:
        argv.extend(["--resume", chat])
    argv.append((prompt or "").strip()[:4000])
    timeout = 90 if use_mode == "agent" else 45
    return argv, use_mode, chat, timeout


def _read_cursor_line(proc: subprocess.Popen) -> str | None:
    """Return a stdout line, empty string on EOF, or None to fall back to communicate()."""
    stdout = proc.stdout
    if stdout is None:
        return None
    try:
        line = stdout.readline()
    except Exception:
        return None
    if isinstance(line, str):
        return line
    return None


def _cursor_fail(spoken: str, *, cancelled: bool = False) -> dict:
    out = {
        "ok": False,
        "unknown": True,
        "wire": "cursor",
        "engine": "cursor",
        "spoken": spoken,
        "done": True,
        "partial": False,
        "delta": "",
    }
    if cancelled:
        out["cancelled"] = True
    return out


def call_cursor_turn_iter(prompt: str, *, mode: str = "ask", resume: str | None = None):
    """Yield stream deltas, then one done event. No --force / --yolo.

    `agent persist` is TTY/tmux. This is the headless remap: resume + stream-json.
    """
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        yield _cursor_fail("UNKNOWN. Cursor print is dry.")
        return
    cmd = agent_cmd()
    if not cmd:
        yield _cursor_fail("UNKNOWN. Cursor agent CLI is missing.")
        return
    global _CURSOR_PROC, _CURSOR_CANCELLED
    argv, use_mode, chat, timeout = _cursor_argv(cmd, prompt, mode=mode, resume=resume)
    _CURSOR_CANCELLED = False
    try:
        proc = subprocess.Popen(
            argv,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            cwd=str(ROOT),
        )
    except OSError as exc:
        yield _cursor_fail(f"UNKNOWN. Cursor agent failed: {exc}.")
        return
    with _CURSOR_LOCK:
        _CURSOR_PROC = proc
    collected: list[str] = []
    result_text = ""
    err_text = ""
    timed_out = False
    used_stream = False
    killer = threading.Timer(timeout, proc.kill)
    killer.daemon = True
    killer.start()
    try:
        while True:
            if _CURSOR_CANCELLED:
                break
            line = _read_cursor_line(proc)
            if line is None:
                try:
                    out, err = proc.communicate(timeout=max(1.0, timeout))
                except subprocess.TimeoutExpired:
                    proc.kill()
                    timed_out = True
                    out, err = "", ""
                err_text = (err or "").strip()
                blob_bits: list[str] = []
                for chunk in (out or "").splitlines() or [out or ""]:
                    parsed_blob = parse_stream_json_line(chunk)
                    if parsed_blob["delta"]:
                        blob_bits.append(parsed_blob["delta"])
                    if parsed_blob["result"]:
                        result_text = parsed_blob["result"]
                if blob_bits:
                    text = "".join(blob_bits)
                    collected.append(text)
                    yield {"partial": True, "done": False, "delta": text, "wire": "cursor"}
                elif not result_text and (out or "").strip() and not (out or "").lstrip().startswith("{"):
                    text = (out or "").strip()
                    collected.append(text)
                    yield {"partial": True, "done": False, "delta": text, "wire": "cursor"}
                break
            if line:
                used_stream = True
                parsed = parse_stream_json_line(line)
                if parsed["delta"]:
                    collected.append(parsed["delta"])
                    yield {"partial": True, "done": False, "delta": parsed["delta"], "wire": "cursor"}
                if parsed["result"]:
                    result_text = parsed["result"]
                continue
            if proc.poll() is not None:
                if proc.stderr is not None:
                    try:
                        err_text = (proc.stderr.read() or "").strip()
                    except Exception:
                        err_text = ""
                break
            time.sleep(0.02)
        if used_stream and proc.poll() is None and not _CURSOR_CANCELLED:
            try:
                proc.wait(timeout=1.0)
            except subprocess.TimeoutExpired:
                pass
        if proc.poll() is None and not _CURSOR_CANCELLED:
            if killer.is_alive() is False:
                timed_out = True
    except subprocess.TimeoutExpired:
        proc.kill()
        timed_out = True
    finally:
        killer.cancel()
        with _CURSOR_LOCK:
            if _CURSOR_PROC is proc:
                _CURSOR_PROC = None
        if proc.poll() is None:
            proc.kill()
    if _CURSOR_CANCELLED:
        yield _cursor_fail("", cancelled=True)
        return
    if timed_out and not "".join(collected).strip() and not result_text:
        yield _cursor_fail("UNKNOWN. Cursor timed out. Say stop, or ask again shorter.")
        return
    text = "".join(collected).strip() or result_text.strip()
    if not text and "Authentication required" in err_text:
        yield _cursor_fail(
            "UNKNOWN. Cursor agent needs a one-time login. Run agent login in Terminal. Not an xAI key."
        )
        return
    if not text:
        yield _cursor_fail(f"UNKNOWN. Cursor agent returned no text. {err_text[:180]}".strip())
        return
    yield {
        "ok": True,
        "unknown": False,
        "wire": "cursor",
        "engine": "cursor",
        "spoken": clip_spoken(text),
        "mode": use_mode,
        "chat_id": chat or None,
        "done": True,
        "partial": False,
        "delta": "",
    }


def call_cursor_turn(prompt: str, *, mode: str = "ask", resume: str | None = None) -> dict:
    """Headless Cursor harness. ask | plan | agent. Always resume when a chat id is given."""
    last = _cursor_fail("UNKNOWN. Cursor harness returned no reply.")
    for ev in call_cursor_turn_iter(prompt, mode=mode, resume=resume):
        if ev.get("done") or ev.get("cancelled") or ev.get("unknown") or ev.get("ok"):
            last = ev
    return {
        "ok": bool(last.get("ok")),
        "unknown": bool(last.get("unknown")),
        "wire": last.get("wire") or "cursor",
        "engine": last.get("engine") or "cursor",
        "spoken": str(last.get("spoken") or ""),
        "mode": last.get("mode") or mode,
        "chat_id": last.get("chat_id"),
        "cancelled": bool(last.get("cancelled")),
    }


def status(which: str = "all") -> dict:
    want = (which or "all").lower()
    parts: list[dict] = []
    if want in ("all", "hive", "server", "servers", "cloud"):
        parts.append(call_hive())
    if want in ("all", "vps", "server", "servers", "hostinger", "cloud"):
        parts.append(call_vps())
    if want in ("all", "cursor"):
        parts.append(call_cursor())
    if not parts:
        parts = [call_hive(), call_vps(), call_cursor()]
    spoken = " ".join(str(p.get("spoken") or "") for p in parts).strip()
    return {
        "ok": all(p.get("ok") for p in parts),
        "verb": "status",
        "wire": "status",
        "spoken": spoken,
        "parts": parts,
    }


def think(utterance: str, *, context: str = "", grok=None) -> dict:
    fn = grok or call_grok
    out = fn(utterance, context)
    out.setdefault("verb", "think")
    return out
