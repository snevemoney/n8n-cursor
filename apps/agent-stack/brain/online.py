#!/usr/bin/env python3
"""Online Jarvis brain. Local face only. No Ollama. No extractive answer.

Grok (xAI or Grok Bot) thinks. Hive / VPS / Cursor are live wires.
Vault retrieve is extra context, not the product memory.
Missing key or CLI → spoken UNKNOWN naming that wire.
"""
from __future__ import annotations

import json
import os
import shutil
import subprocess
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
SPEAK_CAP = 420
SYS = (
    "You are Jarvis for Evens Louis. Face and mic stay on the 8GB Mac. "
    "You are the online brain. Answer from the live facts and vault snippets. "
    "Vault is one memory among live state, not the whole OS. "
    "Hard steps (send, pay, deploy, book, publish) stay Evens. "
    "Never invent Claude, ChatGPT, Gemini, or Ollama. "
    "If a wire is missing, say UNKNOWN and name it. Speak short."
)


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
            "grok": "live" if grok_api_key() else "dark",
            "grokbot": grokbot,
            "hive": "http",
            "vps": "ssh",
            "cursor": "print" if agent_cmd() else "dark",
            "vault": "context",
        },
        "need": []
        if grok_api_key() or (gw and gw.get("base"))
        else ["XAI_API_KEY or GROK_API_KEY (or GROKBOT_BASE_URL + GROKBOT_TOKEN)"],
    }


def unknown_grok() -> dict:
    gw = grokbot_gateway()
    if gw and gw.get("sealed"):
        spoken = (
            "UNKNOWN. Grok Bot connection is sealed and sendPrompt does not speak a reply. "
            "Set XAI_API_KEY or GROK_API_KEY so I can call Grok and say the answer."
        )
        return {"ok": False, "unknown": True, "wire": "grok", "spoken": spoken, "engine": "unknown"}
    spoken = (
        "UNKNOWN. Grok wire is dark. Set XAI_API_KEY or GROK_API_KEY, "
        "or GROKBOT_BASE_URL and GROKBOT_TOKEN. I will not pretend a jobs.jsonl queue is done."
    )
    return {"ok": False, "unknown": True, "wire": "grok", "spoken": spoken, "engine": "unknown"}


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
    if len(text) > SPEAK_CAP:
        text = text[: SPEAK_CAP - 1].rsplit(" ", 1)[0] + "…"
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
        if len(reply) > SPEAK_CAP:
            reply = reply[: SPEAK_CAP - 1].rsplit(" ", 1)[0] + "…"
        return {"ok": True, "unknown": False, "wire": "grokbot", "engine": "grokbot", "spoken": reply}
    return {
        "ok": False,
        "unknown": True,
        "wire": "grokbot",
        "engine": "grokbot",
        "queued": True,
        "ack": sent,
        "spoken": (
            "UNKNOWN. I called Grok Bot sendPrompt, but that wire does not return a spoken reply. "
            "Set XAI_API_KEY so I can hear Grok and speak the answer. jobs.jsonl is not done."
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


def call_cursor_turn(prompt: str, *, mode: str = "ask") -> dict:
    """Headless Cursor agent on this repo. Jarvis stays the mouth. No --force / --yolo."""
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "engine": "cursor",
            "spoken": "UNKNOWN. Cursor print is dry.",
        }
    cmd = agent_cmd()
    if not cmd:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "engine": "cursor",
            "spoken": "UNKNOWN. Cursor agent CLI is missing.",
        }
    use_mode = mode if mode in ("ask", "plan") else "ask"
    argv = [
        *cmd,
        "-p",
        "--mode",
        use_mode,
        "--trust",
        "--workspace",
        str(ROOT),
        "--output-format",
        "text",
        (prompt or "").strip()[:2000],
    ]
    try:
        proc = subprocess.run(argv, capture_output=True, text=True, timeout=90, cwd=str(ROOT))
    except subprocess.TimeoutExpired:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "engine": "cursor",
            "spoken": "UNKNOWN. Cursor agent timed out.",
        }
    except OSError as exc:
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "engine": "cursor",
            "spoken": f"UNKNOWN. Cursor agent failed: {exc}.",
        }
    text = (proc.stdout or "").strip()
    if not text:
        err = (proc.stderr or "").strip()[:180]
        return {
            "ok": False,
            "unknown": True,
            "wire": "cursor",
            "engine": "cursor",
            "spoken": f"UNKNOWN. Cursor agent returned no text. {err}".strip(),
        }
    if len(text) > SPEAK_CAP:
        text = text[: SPEAK_CAP - 1].rsplit(" ", 1)[0] + "…"
    return {
        "ok": True,
        "unknown": False,
        "wire": "cursor",
        "engine": "cursor",
        "spoken": text,
        "mode": use_mode,
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
