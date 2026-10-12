#!/usr/bin/env python3
"""Talk hosts and live wires. Local face only. No Ollama.

Talk owner is OpenRouter. Cursor CLI is the cursor_ask hand.
Memory is the store (vault first for about-me). No Ollama. Do not nag for xAI keys.
"""
from __future__ import annotations

import base64
import importlib.util
import json
import os
import re
import shutil
import socket
import ssl
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
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_OPENROUTER_MODEL = "nex-agi/nex-n2.5-mini:free"
# 2026-10-10: nvidia/nemotron-3.5-lightning:free hung past the talk wall (30s, no reply)
# and starved the paid fallback. Removed; add a free model back only after a live probe.
OPENROUTER_FALLBACKS = ()
# Same host. Used when :free hits the daily door (free-models-per-day-high-balance).
# Not ChatGPT, Claude, or Gemini as the product mouth.
# qwen/qwen3-235b-a22b removed: OpenRouter deprecated it 2026-10-09 (HTTP 404).
OPENROUTER_PAID_FALLBACKS = (
    "deepseek/deepseek-chat-v3.1",
)
# Same host. Used only when a still is attached and :free vision is 429.
# Not ChatGPT, Claude, or Gemini as the product mouth.
OPENROUTER_VISION_FALLBACKS = (
    "deepseek/deepseek-v4-flash-vision-exp",
)
# Measured 2026-10-11: deepseek-chat-v3.1 takes 11-25 s for a ~4k-token system prompt and a
# multi-sentence answer, so a 10 s per-try limit timed out every long reply. Stay under the
# Face TURN_WALL_SEC (25 s). Override with JARVIS_TALK_ATTEMPT_SEC / JARVIS_TALK_WALL_SEC.
def _sec_env(name: str, default: float) -> float:
    try:
        return max(1.0, float(os.environ.get(name) or default))
    except ValueError:
        return default


OPENROUTER_ATTEMPT_SEC = _sec_env("JARVIS_TALK_ATTEMPT_SEC", 20.0)
OPENROUTER_WALL_SEC = _sec_env("JARVIS_TALK_WALL_SEC", 22.0)
TALK_DARK = "The talk wire is dark this turn."
OPENROUTER_MAX_TOKENS = 512
OPENROUTER_RETRIEVE_TOKENS = int(os.environ.get("JARVIS_TALK_MAX_TOKENS") or 320)  # short spoken answers; cut ArtCraft latency
LENGTH_RETRY_TOKENS = 640
LENGTH_MISS = "UNKNOWN. That answer ran out of room."
OPENROUTER_HANDS = (
    {
        "type": "function",
        "function": {
            "name": "browser_mission",
            "description": "Start broad read-only web research across one or more sites with bounded Browser Use workflows and Jev step decisions. Also report status, cancel a mission, or skip one flow. A start receipt is not verified task success. Use status for progress and the verified final answer. The user can keep talking while work runs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "action": {"type": "string", "enum": ["start", "status", "cancel", "skip", "amend"]},
                    "mission_id": {"type": "string"},
                    "flow_id": {"type": "string"},
                },
                "required": ["action"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "vault_read",
            "description": "Read the vault map, a named vault room, or the timeline. Not a last-chat keyword mash.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "safari_see",
            "description": "Read the current Safari tab, list tabs, open a URL, scroll, click a named page link/button, or grab the screen. Use this tool to execute an explicit Safari request instead of repeating instructions. A click result does not verify the requested task. Send, pay, deploy, book and publish remain blocked.",
            "parameters": {
                "type": "object",
                "properties": {
                    "act": {"type": "string"},
                    "url": {"type": "string"},
                    "label": {"type": "string", "description": "Exact visible link or button text for act=click."},
                    "expected_file": {"type": "string", "description": "User-specified filename to verify newly created in Downloads after click. Never invent it."},
                    "expected_sha256": {"type": "string", "description": "User-provided expected artifact SHA256; never invent a hash."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "cursor_ask",
            "description": "Ask Cursor CLI about this repo's code. Not for last sittings or what he is talking about with Cursor.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "craft",
            "description": "Do a task inside one of the Craft desktop apps (spreadsheet, docs, slides, images, vectors, PDF, video, audio, CAD, photo develop, effects, design). The hand inspects, acts, and inspects again. Send, pay, deploy, book and publish remain blocked.",
            "parameters": {
                "type": "object",
                "properties": {
                    "app": {
                        "type": "string",
                        "enum": [
                            "cadcraft", "deckcraft", "designcraft", "effectcraft", "filmcraft", "gridcraft",
                            "lightcraft", "pdfcraft", "photocraft", "soundcraft", "vectorcraft", "wordcraft",
                        ],
                    },
                    "task": {"type": "string", "description": "What he asked for, in his words."},
                },
                "required": ["app", "task"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "status",
            "description": "Report live wires.",
            "parameters": {
                "type": "object",
                "properties": {"which": {"type": "string"}},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "refuse_hard_step",
            "description": "Refuse send, pay, deploy, book, or publish.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
)
OPENROUTER_MAC_ACT = (
    {
        "type": "function",
        "function": {
            "name": "mac_act",
            "description": "One mouse or key act on the front Mac app. Only while Watch is armed.",
            "parameters": {
                "type": "object",
                "properties": {
                    "op": {"type": "string"},
                    "x": {"type": "number"},
                    "y": {"type": "number"},
                    "text": {"type": "string"},
                    "direction": {"type": "string"},
                    "label": {"type": "string"},
                },
                "required": ["op"],
            },
        },
    },
)
VISION_DARK = "UNKNOWN. Vision model is dark."
SPEAK_CAP = 280
ALLOWED_ENV = (
    "XAI_API_KEY",
    "GROK_API_KEY",
    "GROK_MODEL",
    "GROKBOT_BASE_URL",
    "GROKBOT_TOKEN",
    "ELEVENLABS_API_KEY",
    "ELEVEN_LABS_API_KEY",
    "ELEVENLABS_VOICE_ID",
    "OPENROUTER_API_KEY",
    "OPENROUTER_MODEL",
    "OPENROUTER_VISION_MODEL",
    "JARVIS_BROWSER_PYTHON",
    "JARVIS_BROWSER_PLANNER_MODEL",
    "JARVIS_BROWSER_TEXT_MODEL",
    "JARVIS_BROWSER_EXECUTABLE",
)
LOGIN_UNKNOWN = (
    "UNKNOWN. Cursor agent needs a one-time login. "
    "Run agent login in Terminal."
)
NO_REPLY = "UNKNOWN. Cursor harness returned no reply."
_CURSOR_LOCK = threading.Lock()
_CURSOR_PROC: subprocess.Popen | None = None
_CURSOR_CANCELLED = False
_LOGIN_OK_UNTIL = 0.0
LOGIN_CACHE_SEC = 60.0
SYS = (
    "You are Jarvis for Evens Louis, the coordinator. "
    "The store is memory, not permission to think. "
    "Private claims need disk evidence this turn. General talk may reason without a cite. "
    "Do not say you lack something on disk unless the ask required private evidence and it missed. "
    "If the brief says no personal evidence, reason generally and name the missing fact. Do not invent it. "
    "A dark talk wire is not a vault miss. Do not replace healthy prose with a store snippet. "
    "Cursor CLI is one worker, not the brain. Face+voice, this coordinator, adapters. "
    "Hear what he said, answer that at the depth he asked, then stop. Sir, light wit only when it is earned. "
    "The store (vault, this repo, sessions, hive) is optional context, not the spoken product. "
    "Safari is the browser adapter. "
    "Grok Bot is a desk. Neither is the skull. The store may be in the brief this turn. "
    "The live store is already in the brief: vault map, session index, last Cursor ask, yesterday. "
    "The durable knowledge source is the live Obsidian vault. This turn is read-memory only. "
    "Do not claim that anything Evens says becomes durable Obsidian memory. Do not write notes. "
    "Do not deny a loaded store. Do not say UNKNOWN or no live mouth when the store answered a private ask. "
    "Do not keyword-search the vault for chats. "
    "If Retrieved cites current disk, that value wins over earlier turns this sitting. "
    "Call safari_see or status when those asks match. "
    "cursor_ask is repo code only. Last Cursor sitting is already in the store. "
    "Do not wait for him to say harness. Do not say you only see this Orb chat. "
    "Do not fire a school skill because a word like marketing or funnel appeared. "
    "Keep delegated work until it finishes or Evens is needed. "
    "Hard steps (send, pay, deploy, book, publish) stay Evens. "
    "Never invent Claude, ChatGPT, Gemini, or Ollama. "
    "Never identify as Nex, Nemotron, or any model name. You are Jarvis. "
    "Do not recite door lines (Watch, Standing by, Tap Watch). "
    "When he asks what you can do, name this Orb's real doors only: talk, vault, Safari, "
    "Watch, Eyes, file drop, voice, Focus, Cursor ask. "
    "Do not invent web search, plugins, image generation, a Chrome extension, or 24/7 scheduled tasks. "
    "Do not dump a catalog unless he asked. "
    "No thinking-process scratchpad."
)


def clip_spoken(text: str, cap: int = SPEAK_CAP, *, finished: bool = False) -> str:
    """Keep a completed answer intact; bound only unfinished leftovers.

    Provider token budgets already bound generation. A speech/display adapter
    must not silently discard an answer's opening or its qualifications.
    """
    body = (text or "").strip()
    if finished or len(body) <= cap:
        return body
    limit = cap
    cut = body[:limit]
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


_SSL_SYSTEM_CA = "/etc/ssl/cert.pem"


def talk_ssl_context() -> ssl.SSLContext:
    """Verify TLS. Mac framework Python 3.12 ships an empty CA store.

    urllib then raises URLError before any HTTP status, and every talk turn
    becomes "OpenRouter returned no text." Load the OS bundle only when the
    default store is empty. Verification stays on.
    """
    ctx = ssl.create_default_context()
    if ctx.get_ca_certs():
        return ctx
    for cafile in _ssl_ca_candidates():
        try:
            ctx.load_verify_locations(cafile=cafile)
        except (OSError, ssl.SSLError):
            continue
        if ctx.get_ca_certs():
            break
    return ctx


def _ssl_ca_candidates() -> list[str]:
    """CA bundles to try: macOS path first, then OpenSSL's default, then certifi."""
    out: list[str] = []
    paths = [_SSL_SYSTEM_CA]
    try:
        paths.append(ssl.get_default_verify_paths().cafile or "")
        paths.append(ssl.get_default_verify_paths().openssl_cafile or "")
    except Exception:
        pass
    try:
        import certifi  # type: ignore

        paths.append(certifi.where())
    except Exception:
        pass
    for path in paths:
        if path and path not in out and os.path.isfile(path):
            out.append(path)
    return out


def _http_open(url: str, *, data: dict | None = None, headers: dict | None = None, timeout: float = 20.0):
    raw = None if data is None else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=raw,
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST" if data is not None else "GET",
    )
    return urllib.request.urlopen(req, timeout=timeout, context=talk_ssl_context())


def _response_socket(res):
    """Socket that `HTTPResponse.read` is blocked on, when this is a real urlopen body."""
    fp = getattr(res, "fp", None)
    raw = getattr(fp, "raw", None)
    sock = getattr(raw, "_sock", None)
    return sock if sock is not None else raw


def _abort_response(res) -> None:
    """Unblock a body read that ignored the socket timeout. Same urllib response."""
    sock = _response_socket(res)
    if sock is not None:
        shutdown = getattr(sock, "shutdown", None)
        if callable(shutdown):
            try:
                shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
        closer = getattr(sock, "close", None)
        if callable(closer):
            try:
                closer()
            except OSError:
                pass
    closer = getattr(res, "close", None)
    if callable(closer):
        try:
            closer()
        except OSError:
            pass


def _read_http_body(res, timeout: float) -> bytes:
    """Read one response body. A stall raises TimeoutError within `timeout`.

    `urlopen(..., timeout=)` bounds the handshake and headers. A chunked TLS
    body can stay inside `ssl.read` after that, which is what the Face wall
    caught. The body uses the same deadline. If the read is still blocked,
    the socket is closed so `ssl.read` returns.
    """
    limit = max(0.0, float(timeout))
    if limit == 0.0:
        return res.read()
    sock = _response_socket(res)
    if sock is not None:
        try:
            sock.settimeout(limit)
        except OSError:
            pass
    box: dict = {}

    def _run() -> None:
        try:
            box["body"] = res.read()
        except Exception as exc:
            box["err"] = exc

    worker = threading.Thread(target=_run, name="http-body", daemon=True)
    worker.start()
    worker.join(limit)
    if not worker.is_alive():
        if "err" in box:
            raise box["err"]
        return box.get("body", b"")
    _abort_response(res)
    worker.join(1.0)
    raise TimeoutError("response body stalled")


def _http_json(url: str, *, data: dict | None = None, headers: dict | None = None, timeout: float = 20.0) -> dict:
    raw = None if data is None else json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=raw,
        headers={"Content-Type": "application/json", **(headers or {})},
        method="POST" if data is not None else "GET",
    )
    started = time.monotonic()
    with urllib.request.urlopen(req, timeout=timeout, context=talk_ssl_context()) as res:
        remaining = float(timeout) - (time.monotonic() - started) if timeout > 0 else timeout
        if timeout > 0 and remaining <= 0:
            raise TimeoutError("response headers exhausted request budget")
        body = _read_http_body(res, remaining).decode("utf-8", errors="replace")
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
        with urllib.request.urlopen(url, timeout=timeout, context=talk_ssl_context()) as res:
            return int(res.status)
    except urllib.error.HTTPError as exc:
        return int(exc.code)
    except (urllib.error.URLError, TimeoutError, OSError):
        return 0


def grok_api_key() -> str:
    return (os.environ.get("XAI_API_KEY") or os.environ.get("GROK_API_KEY") or "").strip()


def has_xai_key() -> bool:
    """Yes/no only. Never log or return the secret."""
    return bool(grok_api_key())


def openrouter_api_key() -> str:
    return (os.environ.get("OPENROUTER_API_KEY") or "").strip()


def has_openrouter_key() -> bool:
    """Yes/no only. Never log or return the secret."""
    return bool(openrouter_api_key())


def openrouter_model() -> str:
    return (os.environ.get("OPENROUTER_MODEL") or DEFAULT_OPENROUTER_MODEL).strip() or DEFAULT_OPENROUTER_MODEL


def openrouter_vision_model() -> str:
    return (os.environ.get("OPENROUTER_VISION_MODEL") or "").strip()


def still_data_url(path: Path) -> str | None:
    if not path.is_file():
        return None
    try:
        raw = path.read_bytes()
    except OSError:
        return None
    if not raw or len(raw) > 1_500_000:
        return None
    suffix = path.suffix.lower()
    mime = "image/png" if suffix == ".png" else "image/webp" if suffix == ".webp" else "image/jpeg"
    return f"data:{mime};base64,{base64.b64encode(raw).decode('ascii')}"


def parse_dotenv(path: Path) -> dict[str, str]:
    """KEY=VALUE from an existing env file. Values stay local. Never log them."""
    out: dict[str, str] = {}
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return {}
    for line in text.splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        if raw.startswith("export "):
            raw = raw[7:].strip()
        key, _, val = raw.partition("=")
        key = key.strip()
        val = val.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in {"'", '"'}:
            val = val[1:-1]
        if key:
            out[key] = val
    return out


def default_env_files() -> list[Path]:
    """Existing files only. Face used to skip these and miss a brain already on disk."""
    return [
        ROOT / ".env",
        ROOT / ".env.dev",
        ROOT / ".env.local",
        ROOT / "apps" / "scorpion" / ".env.local",
        Path.home() / ".env",
    ]


def ensure_mac_user_env() -> None:
    """4018 must share the Mac user's HOME and ~/.local/bin with Terminal."""
    home = (os.environ.get("HOME") or "").strip() or str(Path.home())
    os.environ["HOME"] = home
    local_bin = str(Path(home) / ".local" / "bin")
    parts = [p for p in (os.environ.get("PATH") or "").split(":") if p]
    if local_bin not in parts:
        parts.insert(0, local_bin)
    os.environ["PATH"] = ":".join(parts)


def agent_env() -> dict[str, str]:
    """Env for `agent` subprocesses. Same HOME/PATH as the Mac user, not a thin 4018 PATH."""
    ensure_mac_user_env()
    return dict(os.environ)


def load_existing_env(files: list[Path] | None = None) -> dict:
    """Load already-present brain keys into this process. Names only in the return.

    Do not overwrite a key that is already set. Do not print values.
    """
    ensure_mac_user_env()
    found: list[str] = []
    loaded: list[str] = []
    scanned = 0
    for path in files if files is not None else default_env_files():
        if not path.is_file():
            continue
        scanned += 1
        parsed = parse_dotenv(path)
        for key in ALLOWED_ENV:
            val = (parsed.get(key) or "").strip()
            if not val:
                continue
            if key not in found:
                found.append(key)
            if (os.environ.get(key) or "").strip():
                continue
            os.environ[key] = val
            if key not in loaded:
                loaded.append(key)
    return {"ok": True, "scanned": scanned, "found": found, "loaded": loaded}


def try_agent_login() -> dict:
    """Last resort after keys are checked. Do not loop this. Do not treat it as talk."""
    cmd = agent_cmd()
    if not cmd:
        return {"tried": True, "ok": False, "reason": "no-cli"}
    try:
        proc = subprocess.run(
            [*cmd, "login"],
            capture_output=True,
            text=True,
            timeout=45,
            cwd=str(ROOT),
            env=agent_env(),
        )
    except subprocess.TimeoutExpired:
        return {"tried": True, "ok": False, "reason": "timeout"}
    except OSError as exc:
        return {"tried": True, "ok": False, "reason": type(exc).__name__}
    return {"tried": True, "ok": cursor_logged_in(), "code": int(proc.returncode)}


def grok_model() -> str:
    return (os.environ.get("GROK_MODEL") or DEFAULT_MODEL).strip() or DEFAULT_MODEL


def _public_model_slug(value: str) -> str:
    """Model id for the HUD. Never a key."""
    slug = (value or "").strip()
    if not slug:
        return ""
    low = slug.lower()
    if low.startswith("sk-") or "api_key" in low or "bearer " in low:
        return ""
    return slug[:80]


def _well_formed_file_key(key_b64: str) -> bool:
    raw = (key_b64 or "").strip()
    if not raw:
        return False
    try:
        return len(base64.b64decode(raw)) == 32
    except (ValueError, TypeError):
        return False


def grokbot_file_key() -> str:
    """Plain 32-byte AES key already on disk. Never log it. v10 blobs stay sealed."""
    path = Path.home() / "Library/Application Support/Grok Bot/sand-secrets.json"
    if not path.is_file():
        return ""
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return ""
    if not isinstance(data, dict):
        return ""
    key = str(data.get("local-exec-file-key") or "").strip()
    return key if _well_formed_file_key(key) else ""


def unseal_local_exec(envelope: dict, key_b64: str) -> dict | None:
    """AES-256-GCM envelope used by Grok Bot. Values stay local. Never print them."""
    if not isinstance(envelope, dict) or envelope.get("sandSealedFile") != 1:
        return None
    blob = envelope.get("data")
    if not isinstance(blob, str) or not blob.strip() or not _well_formed_file_key(key_b64):
        return None
    node = shutil.which("node") or str(Path.home() / ".local/bin/node")
    if not Path(node).is_file():
        return None
    script = (
        "const c=require('crypto');"
        "const key=Buffer.from(process.env.AGENT_STACK_UNSEAL_KEY||'','base64');"
        "const blob=Buffer.from(process.env.AGENT_STACK_UNSEAL_BLOB||'','base64');"
        "if(key.length!==32||blob.length<28) process.exit(2);"
        "const iv=blob.subarray(0,12),tag=blob.subarray(12,28),ct=blob.subarray(28);"
        "const d=c.createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(tag);"
        "process.stdout.write(Buffer.concat([d.update(ct),d.final()]));"
    )
    env = dict(os.environ)
    env["AGENT_STACK_UNSEAL_KEY"] = key_b64.strip()
    env["AGENT_STACK_UNSEAL_BLOB"] = blob.strip()
    try:
        proc = subprocess.run(
            [node, "-e", script],
            capture_output=True,
            text=True,
            timeout=8,
            env=env,
        )
    except (OSError, subprocess.TimeoutExpired):
        return None
    if proc.returncode != 0 or not (proc.stdout or "").strip():
        return None
    try:
        parsed = json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None
    return parsed if isinstance(parsed, dict) else None


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
    key = grokbot_file_key()
    if key and (conn.get("sandSealedFile") or conn.get("data")):
        opened = unseal_local_exec(conn, key)
        if isinstance(opened, dict):
            url = str(opened.get("baseUrl") or "").strip().rstrip("/")
            tok = str(opened.get("token") or "").strip()
            if url and tok:
                return {"base": url, "token": tok, "source": "grokbot-unsealed"}
    if conn.get("sandSealedFile") or (isinstance(conn.get("data"), str) and "baseUrl" not in conn):
        return {"sealed": True, "source": "grokbot-sealed"}
    return None


def grokbot_ready() -> bool:
    gw = grokbot_gateway()
    return bool(gw and gw.get("base") and gw.get("token"))


def cursor_cli() -> str | None:
    for name in ("cursor", "agent"):
        path = shutil.which(name)
        if path:
            return path
    return None


def agent_cmd() -> list[str] | None:
    """Prefer the headless `agent` binary. `cursor` is the GUI.

    4018 often has a thinner PATH than Terminal. Put ~/.local/bin first, then which.
    """
    ensure_mac_user_env()
    home_agent = Path(os.environ.get("HOME") or Path.home()) / ".local" / "bin" / "agent"
    if home_agent.is_file() and os.access(home_agent, os.X_OK):
        return [str(home_agent)]
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
    if openrouter_api_key():
        talk, talk_model, mode = "openrouter", _public_model_slug(openrouter_model()), "talk"
    elif grok_api_key():
        talk, talk_model, mode = "xai", _public_model_slug(grok_model()), "talk"
    elif grokbot == "live":
        talk, talk_model, mode = "grokbot", "", "talk"
    elif agent_cmd():
        talk, talk_model, mode = "dark", "", "harness"
    else:
        talk, talk_model, mode = "dark", "", "dark"
    return {
        "ok": True,
        "local": "face+mic+tts",
        "ollama": "refused",
        "talk": talk,
        "talk_model": talk_model,
        "mode": mode,
        "wires": {
            "brain": "store",
            "store": "live",
            "grok": "live" if grok_api_key() else "off",
            "openrouter": "live" if openrouter_api_key() else "off",
            "grokbot": grokbot,
            "hive": "live",
            "vps": "unprobed",
            "cursor": "live" if agent_cmd() else "dark",
            "vault": "live",
            "calendar": "unprobed",
            "mail": "unprobed",
            "invoice": "unprobed",
            "safari": "unprobed",
            "files": "unprobed",
            "catalog": "live",
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


def _looks_like_scratchpad(text: str) -> bool:
    """CoT / factory scratchpad only. Numbered answers and the word in prose stay."""
    low = (text or "").lower()
    if "thinking process" in low:
        return True
    if re.search(r"(?:^|\n)\s*(?:here'?s a |my |hidden )?scratchpad\s*:", low):
        return True
    if re.search(r"\b(?:hidden )?scratchpad\b.{0,24}\b(?:step|analyze|analyse|reasoning)\b", low):
        return True
    if re.search(
        r"(?m)^\s*\d+\.\s+(?:analyze|analyse|understand|identify|reason|think about|step)\b",
        low,
    ):
        return True
    return False


def _first_spoken_ready(text: str) -> bool:
    """Face/TTS may start on the first real sentence. Do not cut the HTTP stream."""
    line = (text or "").strip()
    body = re.sub(r"^(?:sir[,.]?\s*)+", "", line, flags=re.I).strip()
    if len(body) < 8 or _looks_like_scratchpad(body):
        return False
    # Watch JSON uses decimals. Do not treat {"x":0.5,"y":0.28} as spoken.
    if body.startswith("{") or body.startswith("["):
        return False
    return bool(re.search(r"[.!?](?:\s|$)", body))


def _strip_scratchpad(text: str) -> str:
    """Keep spoken prose. Drop a thinking-process tail on the finished text."""
    body = (text or "").strip()
    if not body:
        return ""
    if body.startswith("{") or body.startswith("["):
        return body
    cut = None
    for pat in (
        r"(?is)(?:^|\n)\s*(?:here'?s a |my |hidden )?scratchpad\s*:",
        r"(?is)(?:^|\n)\s*here'?s a thinking process\b",
        r"(?is)(?:^|\n)\s*thinking process\s*:",
    ):
        found = re.search(pat, body)
        if found:
            cut = found.start() if cut is None else min(cut, found.start())
    if cut is not None:
        return body[:cut].strip()
    if _looks_like_scratchpad(body):
        return ""
    return body


def _talk_finished(finish: str) -> bool:
    """Healthy complete talk is finished. Length leftovers are not."""
    return (finish or "").lower() != "length"


def unfinished_clause(text: str) -> bool:
    body = (text or "").strip()
    if not body:
        return True
    return body[-1] not in ".!?…"


def _usable_length_text(text: str) -> str:
    """Keep a finished sentence after a length cap. Drop mid-clause leftovers."""
    body = complete_spoken(text)
    if not body or _looks_like_scratchpad(body) or unfinished_clause(body):
        return ""
    return body


def complete_spoken(text: str) -> str:
    """Drop a clipped last word. Do not split URLs on dots."""
    body = (text or "").strip()
    if not body or body[-1] in ".!?…":
        return body
    match = None
    for found in re.finditer(r"[.!?](?=\s+\S)", body):
        match = found
    if match is None:
        return body
    tail = body[match.end() :].strip()
    if not tail or re.match(r"https?://", tail, re.I) or re.search(r"[/:]", tail):
        return body
    if len(tail.split()) <= 3 and len(tail) <= 24:
        return body[: match.end()].strip()
    return body


def _choice_finish_reason(choice) -> str:
    if not isinstance(choice, dict):
        return ""
    return str(choice.get("finish_reason") or "").strip()


def _length_miss() -> dict:
    return {
        "ok": False,
        "unknown": True,
        "wire": "openrouter",
        "engine": "openrouter",
        "error": "length",
        "finish_reason": "length",
        "spoken": LENGTH_MISS,
    }


def _read_openrouter_stream(res, timeout: float | None = None) -> tuple[str, str]:
    if timeout is None:
        return _consume_openrouter_stream(res)
    if timeout <= 0:
        raise TimeoutError("stream headers exhausted request budget")
    box: dict = {}

    def read() -> None:
        try:
            box["result"] = _consume_openrouter_stream(res)
        except Exception as exc:
            box["error"] = exc

    worker = threading.Thread(target=read, name="openrouter-stream", daemon=True)
    worker.start()
    worker.join(timeout)
    if worker.is_alive():
        _abort_response(res)
        worker.join(1.0)
        raise TimeoutError("response stream stalled")
    if "error" in box:
        raise box["error"]
    return box["result"]


def _consume_openrouter_stream(res) -> tuple[str, str]:
    acc = ""
    reason = ""
    for raw in res:
        if isinstance(raw, bytes):
            line = raw.decode("utf-8", errors="replace").strip()
        else:
            line = str(raw or "").strip()
        if not line:
            continue
        if line.startswith("data:"):
            payload = line[5:].strip()
        else:
            continue
        if payload == "[DONE]":
            break
        try:
            chunk = json.loads(payload)
        except json.JSONDecodeError:
            continue
        choices = chunk.get("choices") if isinstance(chunk, dict) else None
        if not isinstance(choices, list) or not choices:
            continue
        first = choices[0] if isinstance(choices[0], dict) else {}
        delta = first.get("delta") if isinstance(first.get("delta"), dict) else {}
        acc += str((delta or {}).get("content") or "")
        found = _choice_finish_reason(first)
        if found:
            reason = found
    return _strip_scratchpad(acc), reason


def _openrouter_length_retry(
    mid: str,
    user: str,
    stills: list,
    headers: dict,
    *,
    timeout: float = 10.0,
) -> tuple[str, str]:
    finish_user = f"{user}\n\nFinish the thought. Do not recap. No scratchpad."
    try:
        data = _http_json(
            OPENROUTER_URL,
            data=_openrouter_payload(
                mid,
                finish_user,
                stream=False,
                max_tokens=LENGTH_RETRY_TOKENS,
                images=stills,
            ),
            headers=headers,
            timeout=max(1.0, float(timeout)),
        )
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError):
        return "", "length"
    choices = data.get("choices") if isinstance(data, dict) else None
    msg: dict = {}
    reason = "length"
    if isinstance(choices, list) and choices and isinstance(choices[0], dict):
        raw_msg = choices[0].get("message")
        msg = raw_msg if isinstance(raw_msg, dict) else {}
        reason = _choice_finish_reason(choices[0]) or "length"
    return str(msg.get("content") or "").strip(), reason


_SHARED_MOD = None
# Last injection, for the per-turn log. Names only, never file bodies.
LAST_INJECT: dict = {"files": [], "t": 0.0}


def _shared_mod():
    global _SHARED_MOD
    if _SHARED_MOD is None:
        path = Path(__file__).resolve().parent / "shared_context.py"
        spec = importlib.util.spec_from_file_location("agent_stack_shared_context", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        _SHARED_MOD = mod
    return _SHARED_MOD


def system_for(model: str = "", primary: str = "", provider: str = "OpenRouter", query: str = "") -> str:
    """SYS plus the shared fleet context. Records which files were injected."""
    parts = [SYS]
    files: list[str] = []
    try:
        block, files = _shared_mod().shared_system_block()
    except Exception:  # noqa: BLE001 — a missing shared dir never breaks talk
        block, files = "", []
    if block:
        parts.append(block)
    snippets: list[dict] = []
    if query:
        try:
            found, snippets = _shared_mod().retrieved_block(query)
        except Exception:  # noqa: BLE001
            found, snippets = "", []
        if found:
            parts.append(found)
            block += "\n" + found
    LAST_INJECT["snippets"] = snippets
    try:
        honest = _shared_mod().model_self_report(model, primary, provider)
    except Exception:  # noqa: BLE001
        honest = ""
    if honest:
        parts.append(honest)
    LAST_INJECT["model"] = model
    LAST_INJECT["primary"] = primary
    LAST_INJECT["files"] = list(files)
    LAST_INJECT["chars"] = len(block)
    LAST_INJECT["t"] = time.time()
    return "\n\n".join(parts)


def _ask_only(user: str) -> str:
    """The current ask, not the live-context brief, drives shared-memory retrieval."""
    text = user or ""
    return text.rsplit("Current ask:\n", 1)[-1] if "Current ask:\n" in text else text


def _openrouter_payload(
    model: str,
    user: str,
    *,
    stream: bool,
    max_tokens: int | None = None,
    with_tools: bool = False,
    images: list | None = None,
    extra_tools: list | None = None,
    hands: bool = True,
    primary: str = "",
) -> dict:
    content: str | list
    stills = [str(u) for u in (images or []) if str(u or "").startswith("data:image")]
    if stills:
        parts: list[dict] = [{"type": "text", "text": user}]
        for url in stills[:3]:
            parts.append({"type": "image_url", "image_url": {"url": url}})
        content = parts
    else:
        content = user
    body = {
        "model": model,
        "temperature": 0.2,
        "max_tokens": int(max_tokens or OPENROUTER_MAX_TOKENS),
        "stream": stream,
        "messages": [
            {"role": "system", "content": system_for(model, primary, query=_ask_only(user))},
            {"role": "user", "content": content},
        ],
    }
    if model in OPENROUTER_PAID_FALLBACKS:
        # The conversational token ceiling needs answer tokens, not an unfinished thinking trace.
        body["reasoning"] = {"enabled": False}
    if with_tools:
        tools = list(OPENROUTER_HANDS) if hands else []
        if extra_tools:
            tools.extend(list(extra_tools))
        if tools:
            body["tools"] = tools
            body["tool_choice"] = "auto"
    return body


def _tool_pick_from_message(msg: dict) -> dict | None:
    calls = msg.get("tool_calls") if isinstance(msg, dict) else None
    if not isinstance(calls, list) or not calls:
        return None
    first = calls[0] if isinstance(calls[0], dict) else {}
    fn = first.get("function") if isinstance(first.get("function"), dict) else {}
    name = str(fn.get("name") or "").strip()
    if not name:
        return None
    raw_args = fn.get("arguments")
    args: dict = {}
    if isinstance(raw_args, dict):
        args = raw_args
    elif isinstance(raw_args, str) and raw_args.strip():
        try:
            parsed = json.loads(raw_args)
        except json.JSONDecodeError:
            parsed = {}
        if isinstance(parsed, dict):
            args = parsed
    return {"tool": name, "args": args, "speak": str(msg.get("content") or "").strip()}


def call_openrouter_messages(
    messages: list[dict],
    tools: list[dict],
    *,
    model_chain: tuple | list,
    attempt_sec: float = 25.0,
) -> dict:
    """Worker tool loop turn: real chat messages, real tool roles. Not the talk mouth.

    A flat text transcript invites the model to continue it and invent tool
    results. Tool messages do not. Returns {ok, tool, args, call_id, text, model, error}.
    """
    key = openrouter_api_key()
    if not key:
        return {"ok": False, "unknown": True, "error": "OpenRouter key is dark."}
    headers = {"Authorization": f"Bearer {key}", "HTTP-Referer": "http://127.0.0.1:4018", "X-Title": "Jarvis"}
    last_err = "no model"
    for mid in [m for m in model_chain if m]:
        body = {
            "model": mid,
            "messages": messages,
            "tools": tools,
            "tool_choice": "auto",
            "max_tokens": OPENROUTER_MAX_TOKENS,
            "reasoning": {"enabled": False},
        }
        try:
            data = _http_json(OPENROUTER_URL, data=body, headers=headers, timeout=attempt_sec)
        except urllib.error.HTTPError as exc:
            last_err = f"{mid}: http {exc.code}"
            continue
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_err = f"{mid}: {type(exc).__name__}"
            continue
        choice = ((data.get("choices") or [{}])[0]) if isinstance(data, dict) else {}
        msg = choice.get("message") if isinstance(choice.get("message"), dict) else {}
        pick = _tool_pick_from_message(msg)
        if pick:
            first = (msg.get("tool_calls") or [{}])[0]
            return {
                "ok": True,
                "tool": pick["tool"],
                "args": pick.get("args") or {},
                "call_id": str(first.get("id") or "call_0"),
                "text": "",
                "model": mid,
            }
        text = str(msg.get("content") or "").strip()
        if text and str(choice.get("finish_reason") or "").lower() != "length":
            return {"ok": True, "tool": "", "args": {}, "call_id": "", "text": text, "model": mid}
        last_err = f"{mid}: {'length' if text else 'empty'}"
    return {"ok": False, "unknown": True, "error": f"UNKNOWN. {last_err}."}


def openrouter_hand_names() -> set[str]:
    names: set[str] = set()
    for row in (*OPENROUTER_HANDS, *OPENROUTER_MAC_ACT):
        fn = row.get("function") if isinstance(row, dict) else None
        name = str((fn or {}).get("name") or "").strip()
        if name:
            names.add(name)
    return names


def usable_openrouter(got) -> bool:
    """Keep a validated hand even when the model sent no narration."""
    if not isinstance(got, dict) or not got.get("ok") or got.get("unknown"):
        return False
    spoken = str(got.get("spoken") or got.get("speak") or "").strip()
    if spoken and not spoken.upper().startswith("UNKNOWN"):
        return True
    tool = str(got.get("tool") or "").strip()
    args = got.get("args")
    return bool(tool) and tool in openrouter_hand_names() and isinstance(args, dict)


# Last talk call, for the per-turn log. Model ids and counts only.
LAST_TALK: dict = {}


def call_openrouter(
    prompt: str,
    context: str = "",
    *,
    images: list | None = None,
    extra_tools: list | None = None,
    hands: bool = True,
) -> dict:
    """OpenRouter chat. Free first. Paid fallback on the same host when :free is 429.

    Not ChatGPT, Claude, or Gemini as the product mouth. Records LAST_TALK.
    """
    began = time.monotonic()
    got = _call_openrouter_inner(prompt, context, images=images, extra_tools=extra_tools, hands=hands)
    primary = str(LAST_INJECT.get("primary") or "") or (openrouter_vision_model() if images else "") or openrouter_model()
    model = str(got.get("model") or "") if isinstance(got, dict) else ""
    reply = str(got.get("spoken") or "") if isinstance(got, dict) else ""
    LAST_TALK.clear()
    LAST_TALK.update({
        "t": time.time(),
        "ok": bool(isinstance(got, dict) and got.get("ok")),
        "model": model,
        "primary": primary,
        "fallback": bool(model and primary and model != primary),
        "latency_ms": int((time.monotonic() - began) * 1000),
        # Rough estimate: ~4 chars per token. The stream path carries no usage block.
        "est_tokens_in": (len(SYS) + int(LAST_INJECT.get("chars") or 0) + len(prompt or "") + len(context or "")) // 4,
        "est_tokens_out": len(reply) // 4,
        "injected": list(LAST_INJECT.get("files") or []),
        "retrieved": [dict(r) for r in (LAST_INJECT.get("snippets") or [])],
    })
    if isinstance(got, dict) and got.get("ok"):
        got.setdefault("primary_model", primary)
        if not any(got.get(k) for k in ("tool", "tool_calls", "hand", "action", "verb", "args")):
            fixed = unverified_claim(str(got.get("spoken") or ""))
            if fixed != got.get("spoken"):
                got["spoken"] = fixed
                got["claim_fixed"] = True
    return got


# A talk reply runs no hand, so it cannot have opened, sent or launched anything.
TALK_CLAIM_RE = re.compile(
    r"\b(?:I(?:'ve|\s+have)?\s+(?:just\s+|now\s+)?(?:opened|sent|launched|emailed|posted|published|uploaded|saved)"
    r"|(?:is|it's|it\s+is)\s+now\s+open"
    r"|now\s+open\s+in)\b",
    re.I,
)


def unverified_claim(text: str) -> str:
    """Drop first-person done-claims from a tool-less talk reply and say so plainly."""
    if not text or not TALK_CLAIM_RE.search(text):
        return text
    keep = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s and not TALK_CLAIM_RE.search(s)]
    return " ".join(keep + ["I have not opened or sent anything from this answer; no tool ran."]).strip()


def _call_openrouter_inner(
    prompt: str,
    context: str = "",
    *,
    images: list | None = None,
    extra_tools: list | None = None,
    hands: bool = True,
) -> dict:
    """OpenRouter chat. Free first. Paid fallback on the same host when :free is 429.

    Not ChatGPT, Claude, or Gemini as the product mouth.
    """
    key = openrouter_api_key()
    if not key:
        return {
            "ok": False,
            "unknown": True,
            "wire": "openrouter",
            "engine": "openrouter",
            "spoken": "UNKNOWN. OpenRouter key is dark.",
        }
    user = prompt.strip()
    brief = (context or "").strip()
    if brief:
        user = f"Live context:\n{brief}\n\nCurrent ask:\n{user}"
    stills = [str(u) for u in (images or []) if str(u or "").startswith("data:image")]
    if stills and not openrouter_vision_model() and not extra_tools:
        # Try the talk model first; if every host rejects images, VISION_DARK.
        pass
    max_tokens = OPENROUTER_RETRIEVE_TOKENS if brief else OPENROUTER_MAX_TOKENS
    with_tools = bool(hands or extra_tools)
    models: list[str] = []
    vision = openrouter_vision_model() if stills else ""
    primary = openrouter_model()
    vision_paid = OPENROUTER_VISION_FALLBACKS if stills else ()
    for mid in (vision, primary, *OPENROUTER_FALLBACKS, *vision_paid, *OPENROUTER_PAID_FALLBACKS):
        if mid and mid not in models:
            models.append(mid)
    primary_mid = models[0] if models else ""

    def _openrouter_payload(*args, **kw):  # noqa: F811 — same payload, primary named for the self-report
        kw.setdefault("primary", primary_mid)
        return globals()["_openrouter_payload"](*args, **kw)

    free_quota_dead = False
    if stills and not models:
        return {
            "ok": False,
            "unknown": True,
            "wire": "openrouter",
            "engine": "openrouter",
            "spoken": VISION_DARK,
        }
    last_err = "no model"
    headers = {
        "Authorization": f"Bearer {key}",
        "HTTP-Referer": "http://127.0.0.1:4018",
        "X-Title": "Jarvis",
    }
    wall_start = time.monotonic()
    for mid in models:
        if free_quota_dead and str(mid).endswith(":free"):
            last_err = "http 429"
            continue
        spent = time.monotonic() - wall_start
        remain = OPENROUTER_WALL_SEC - spent
        if remain < 1.0:
            last_err = "timeout"
            break
        attempt = min(OPENROUTER_ATTEMPT_SEC, remain)
        text = ""
        pick = None
        finish = ""
        try:
            if with_tools:
                data = _http_json(
                    OPENROUTER_URL,
                    data=_openrouter_payload(
                        mid,
                        user,
                        stream=False,
                        max_tokens=max_tokens,
                        with_tools=True,
                        images=stills,
                        extra_tools=extra_tools,
                        hands=hands,
                    ),
                    headers=headers,
                    timeout=attempt,
                )
                choices = data.get("choices") if isinstance(data, dict) else None
                msg = {}
                if isinstance(choices, list) and choices and isinstance(choices[0], dict):
                    raw_msg = choices[0].get("message")
                    msg = raw_msg if isinstance(raw_msg, dict) else {}
                    finish = _choice_finish_reason(choices[0])
                pick = _tool_pick_from_message(msg)
                text = str(msg.get("content") or "").strip()
                if not pick and not text and (finish or "").lower() != "length":
                    err = data.get("error") if isinstance(data, dict) else None
                    last_err = str(
                        (err or {}).get("message") if isinstance(err, dict) else err or data.get("http") or "empty"
                    )
                    continue
            else:
                if stills:
                    data = _http_json(
                        OPENROUTER_URL,
                        data=_openrouter_payload(
                            mid,
                            user,
                            stream=False,
                            max_tokens=max_tokens,
                            images=stills,
                        ),
                        headers=headers,
                        timeout=attempt,
                    )
                    choices = data.get("choices") if isinstance(data, dict) else None
                    msg = {}
                    if isinstance(choices, list) and choices and isinstance(choices[0], dict):
                        raw_msg = choices[0].get("message")
                        msg = raw_msg if isinstance(raw_msg, dict) else {}
                        finish = _choice_finish_reason(choices[0])
                    text = str(msg.get("content") or "").strip()
                else:
                    request_started = time.monotonic()
                    with _http_open(
                        OPENROUTER_URL,
                        data=_openrouter_payload(
                            mid, user, stream=True, max_tokens=max_tokens, images=stills
                        ),
                        headers=headers,
                        timeout=attempt,
                    ) as res:
                        remaining = min(
                            attempt - (time.monotonic() - request_started),
                            OPENROUTER_WALL_SEC - (time.monotonic() - wall_start),
                        )
                        text, finish = _read_openrouter_stream(res, timeout=remaining)
        except urllib.error.HTTPError as exc:
            last_err = f"http {int(exc.code)}"
            if int(exc.code) == 429 and str(mid).endswith(":free"):
                free_quota_dead = True
            if int(exc.code) not in {400, 422}:
                continue
            try:
                remain = OPENROUTER_WALL_SEC - (time.monotonic() - wall_start)
                if remain < 1.0:
                    last_err = "timeout"
                    break
                data = _http_json(
                    OPENROUTER_URL,
                    data=_openrouter_payload(
                        mid, user, stream=False, max_tokens=max_tokens, images=stills
                    ),
                    headers=headers,
                    timeout=min(OPENROUTER_ATTEMPT_SEC, remain),
                )
            except urllib.error.HTTPError as retry_exc:
                last_err = f"http {int(retry_exc.code)}"
                continue
            except (urllib.error.URLError, TimeoutError, OSError) as retry_exc:
                last_err = type(retry_exc).__name__
                continue
            choices = data.get("choices") if isinstance(data, dict) else None
            if isinstance(choices, list) and choices:
                msg = choices[0].get("message") if isinstance(choices[0], dict) else {}
                pick = pick or _tool_pick_from_message(msg if isinstance(msg, dict) else {})
                text = str((msg or {}).get("content") or "").strip()
                finish = _choice_finish_reason(choices[0]) or finish
            if not pick and not text and (finish or "").lower() != "length":
                err = data.get("error") if isinstance(data, dict) else None
                last_err = str((err or {}).get("message") if isinstance(err, dict) else err or data.get("http") or "empty")
                continue
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            last_err = type(exc).__name__
            continue
        if pick:
            return {
                "ok": True,
                "unknown": False,
                "wire": "openrouter",
                "engine": "openrouter",
                "tool": pick.get("tool"),
                "args": pick.get("args") or {},
                "speak": pick.get("speak") or "",
                "spoken": clip_spoken(
                    str(pick.get("speak") or ""),
                    finished=_talk_finished(finish),
                ),
                "model": mid,
                "finish_reason": finish or None,
            }
        hit_length = (finish or "").lower() == "length"
        if hit_length:
            kept = _usable_length_text(text)
            retry_finish = finish
            if not kept:
                remain = OPENROUTER_WALL_SEC - (time.monotonic() - wall_start)
                more = ""
                if remain >= 1.0:
                    more, retry_finish = _openrouter_length_retry(
                        mid, user, stills, headers, timeout=min(10.0, remain)
                    )
                kept = _usable_length_text(more)
            if kept:
                return {
                    "ok": True,
                    "unknown": False,
                    "wire": "openrouter",
                    "engine": "openrouter",
                    "spoken": clip_spoken(
                        kept,
                        finished=_talk_finished(retry_finish),
                    ),
                    "model": mid,
                    "finish_reason": retry_finish or None,
                }
            return _length_miss()
        text = _strip_scratchpad(complete_spoken(text))
        if text and not _looks_like_scratchpad(text):
            return {
                "ok": True,
                "unknown": False,
                "wire": "openrouter",
                "engine": "openrouter",
                "spoken": clip_spoken(text, finished=_talk_finished(finish)),
                "model": mid,
                "finish_reason": finish or None,
            }
        if text and _looks_like_scratchpad(text):
            last_err = "scratchpad"
            continue
        last_err = "empty"
    if last_err == "timeout":
        spoken = TALK_DARK
    else:
        spoken = VISION_DARK if stills else f"UNKNOWN. OpenRouter returned no text. {last_err}."
    return {
        "ok": False,
        "unknown": True,
        "wire": "openrouter",
        "engine": "openrouter",
        "error": last_err,
        "spoken": spoken,
    }


def call_xai(prompt: str, context: str = "") -> dict:
    key = grok_api_key()
    if not key:
        return unknown_grok()
    user = prompt.strip()
    if context.strip():
        user = f"{user}\n\nLive context:\n{context.strip()}"
    try:
        data = _http_json(
            XAI_URL,
            data={
                "model": grok_model(),
                "temperature": 0.3,
                "messages": [
                    {"role": "system", "content": system_for(grok_model(), "", "xAI")},
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


def _grokbot_message_text(got) -> str:
    if isinstance(got, dict):
        reply = str(got.get("text") or got.get("message") or got.get("content") or "").strip()
        msgs = got.get("messages") or got.get("data") or []
        if not reply and isinstance(msgs, list) and msgs:
            last = msgs[-1]
            if isinstance(last, dict):
                reply = str(last.get("text") or last.get("content") or "").strip()
        return reply
    return ""


def _grokbot_last(base: str, agent_id: str, headers: dict) -> str:
    for path in ("/api/getLastMessage", "/api/getAgentMessages", "/api/listMessages"):
        try:
            got = _http_json(f"{base}{path}", data={"agentId": agent_id}, headers=headers, timeout=15.0)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError):
            continue
        reply = _grokbot_message_text(got)
        if reply:
            return reply
    return ""


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
    before = _grokbot_last(gw["base"], agent_id, headers)
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
    for _ in range(4):
        reply = _grokbot_last(gw["base"], agent_id, headers)
        if reply and reply != before:
            return {
                "ok": True,
                "unknown": False,
                "queued": False,
                "wire": "grokbot",
                "engine": "grokbot",
                "spoken": clip_spoken(reply),
            }
        time.sleep(0.8)
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


def _named_openrouter_failure(got) -> bool:
    """429 / length / named OpenRouter miss. Do not hide these in the Grok desk."""
    if not isinstance(got, dict):
        return False
    if str(got.get("wire") or got.get("engine") or "").lower() not in {"openrouter", ""}:
        return False
    err = str(got.get("error") or "").lower()
    spoken = str(got.get("spoken") or "").lower()
    finish = str(got.get("finish_reason") or "").lower()
    blob = f"{err} {spoken} {finish}"
    return bool(
        got.get("unknown")
        and (
            "429" in blob
            or "length" in blob
            or "openrouter" in spoken
            or "timeout" in blob
            or "talk wire is dark" in spoken
            or finish == "length"
        )
    )


def call_grok(prompt: str, context: str = "") -> dict:
    if openrouter_api_key():
        got = call_openrouter(prompt, context)
        if usable_openrouter(got):
            return got
        if _named_openrouter_failure(got):
            return got
    if grok_api_key():
        got = call_xai(prompt, context)
        if isinstance(got, dict) and got.get("ok") and not got.get("unknown"):
            spoken = str(got.get("spoken") or "").strip()
            if spoken and not spoken.upper().startswith("UNKNOWN"):
                return got
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
                "hostname; uptime; df -h / | tail -1; "
                "if curl -fsS --max-time 2 http://127.0.0.1:18789/health >/dev/null 2>&1; "
                "then echo OPENCLAW_HEALTH=up; else echo OPENCLAW_HEALTH=down; fi",
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
    health = "unproven"
    kept: list[str] = []
    for ln in lines:
        if ln.startswith("OPENCLAW_HEALTH="):
            health = ln.split("=", 1)[1].strip() or "unproven"
        else:
            kept.append(ln)
    host = kept[0] if kept else target
    rest = " ".join(kept[1:]) if len(kept) > 1 else ""
    spoken = f"VPS {host} live. {rest}".strip()
    if health == "up":
        spoken += " OpenClaw gateway health up on loopback 18789."
    elif health == "down":
        spoken += " OpenClaw gateway down. Delegate only — not a second Jarvis."
    token = (os.environ.get("HOSTINGER_API_TOKEN") or "").strip()
    if not token:
        spoken += " Hostinger API token is dark — SSH used instead."
    return {"ok": True, "wire": "vps", "spoken": spoken, "host": host, "openclaw_health": health}


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
        proc = subprocess.run(
            [*cmd, "--version"],
            capture_output=True,
            text=True,
            timeout=8,
            cwd=str(ROOT),
            env=agent_env(),
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"ok": False, "unknown": True, "wire": "cursor", "spoken": f"UNKNOWN. Cursor CLI failed: {exc}."}
    ver = (proc.stdout or proc.stderr or "").strip().splitlines()[0] if (proc.stdout or proc.stderr) else "present"
    spoken = f"Cursor agent {ver}. Repo turns print through this CLI. Hands parked. No yolo."
    return {"ok": True, "wire": "cursor", "spoken": spoken}


def cursor_login_error(text: str) -> bool:
    blob = (text or "").lower()
    return (
        "authentication required" in blob
        or "not logged in" in blob
        or "needs a one-time login" in blob
        or "please run 'agent login'" in blob
    )


def cursor_ready_cached() -> bool:
    """Reuse a fresh login for one minute. Do not spawn `agent status` on every Hello."""
    global _LOGIN_OK_UNTIL
    if _LOGIN_OK_UNTIL > time.time():
        return True
    ok = cursor_logged_in()
    _LOGIN_OK_UNTIL = (time.time() + LOGIN_CACHE_SEC) if ok else 0.0
    return ok


def cursor_logged_in() -> bool:
    """One live `agent status`. Bus flags and last-wire leftovers are not this read.

    Same binary, HOME, PATH, and repo cwd as Terminal. JSON `isAuthenticated` wins
    over a stale `cursor_login_said` flag in the pipeline.
    """
    cmd = agent_cmd()
    if not cmd:
        return False
    try:
        proc = subprocess.run(
            [*cmd, "status", "--format", "json"],
            capture_output=True,
            text=True,
            timeout=8,
            cwd=str(ROOT),
            env=agent_env(),
        )
    except (OSError, subprocess.TimeoutExpired):
        return False
    raw = (proc.stdout or "").strip() or (proc.stderr or "").strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        data = None
    if isinstance(data, dict) and "isAuthenticated" in data:
        return bool(data.get("isAuthenticated"))
    text = f"{proc.stdout or ''} {proc.stderr or ''}"
    if cursor_login_error(text):
        return False
    return bool(text.strip())


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
        proc = subprocess.run(
            [*cmd, "create-chat"],
            capture_output=True,
            text=True,
            timeout=20,
            cwd=str(ROOT),
            env=agent_env(),
        )
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
    argv.append((prompt or "").strip())
    timeout = 90 if use_mode == "agent" else 18
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
    if not cursor_logged_in():
        yield _cursor_fail(LOGIN_UNKNOWN)
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
            env=agent_env(),
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
    if not text and cursor_login_error(err_text):
        yield _cursor_fail(LOGIN_UNKNOWN)
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
    last = _cursor_fail(NO_REPLY)
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


CONVERSE_TIMEOUT = 25
CONVERSE_SYS = (
    "You are Jarvis for Evens Louis, the coordinator. "
    "Answer in one short spoken line. "
    "Never invent Claude, ChatGPT, Gemini, or Ollama. "
    "Never identify as Nex, Nemotron, or any model name."
)


def call_cursor_converse(utterance: str) -> dict:
    """One-shot `agent -p` text mouth. Cursor login only. No xAI. No Grok Bot unseal.

    Same binary and HOME as Terminal. No --resume (pack-echo chats stay out).
    Do not loop `agent login`.
    """
    if os.environ.get("AGENT_STACK_CURSOR_DRY") == "1":
        return _cursor_fail("UNKNOWN. Cursor print is dry.")
    cmd = agent_cmd()
    if not cmd:
        return _cursor_fail("UNKNOWN. Cursor agent CLI is missing.")
    if not cursor_logged_in():
        return _cursor_fail(LOGIN_UNKNOWN)
    prompt = f"{CONVERSE_SYS}\n\n{(utterance or '').strip()}"
    argv = [
        *cmd,
        "-p",
        "--trust",
        "--workspace",
        str(ROOT),
        "--output-format",
        "text",
        "--mode",
        "ask",
        prompt,
    ]
    global _CURSOR_PROC, _CURSOR_CANCELLED
    _CURSOR_CANCELLED = False
    try:
        with _CURSOR_LOCK:
            proc = subprocess.run(
                argv,
                capture_output=True,
                text=True,
                timeout=CONVERSE_TIMEOUT,
                cwd=str(ROOT),
                env=agent_env(),
            )
    except subprocess.TimeoutExpired:
        return _cursor_fail("UNKNOWN. Cursor timed out. Say stop, or ask again shorter.")
    except OSError as exc:
        return _cursor_fail(f"UNKNOWN. Cursor agent failed: {exc}.")
    if _CURSOR_CANCELLED:
        return _cursor_fail("", cancelled=True)
    text = (proc.stdout or "").strip()
    err = (proc.stderr or "").strip()
    if not text and cursor_login_error(err):
        return _cursor_fail(LOGIN_UNKNOWN)
    if not text:
        return _cursor_fail(f"UNKNOWN. Cursor agent returned no text. {err[:180]}".strip())
    return {
        "ok": True,
        "unknown": False,
        "wire": "cursor",
        "engine": "cursor-cli",
        "spoken": clip_spoken(text),
        "mode": "ask",
    }


def _macos_mod():
    path = ROOT / "apps/agent-stack/hands/macos_read.py"
    spec = importlib.util.spec_from_file_location("agent_stack_macos_read_online", path)
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def status(which: str = "all") -> dict:
    want = (which or "all").lower()
    parts: list[dict] = []
    if want in ("all", "hive", "server", "servers", "cloud"):
        parts.append(call_hive())
    if want in ("all", "vps", "server", "servers", "hostinger", "cloud"):
        parts.append(call_vps())
    if want in ("all", "cursor"):
        parts.append(call_cursor())
    mac = None
    if want in ("all", "calendar", "mail", "files"):
        mac = _macos_mod()
    if want in ("all", "calendar") and mac is not None:
        parts.append(mac.calendar_today())
    if want in ("all", "mail") and mac is not None:
        parts.append(mac.mail_unread())
    if not parts:
        parts = [call_hive(), call_vps(), call_cursor()]
    spoken = " ".join(str(p.get("spoken") or "").replace("UNKNOWN. ", "") for p in parts).strip()
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
