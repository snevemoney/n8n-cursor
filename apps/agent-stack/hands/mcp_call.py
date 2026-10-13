"""MCP Phase B (FINISH-LIST rank 18): one allowlisted, read-only stdio MCP server.

Only the handshake (initialize, notifications/initialized) and tools/list are sent. Tool NAMES are
returned; descriptions, commands and env values never are. 5 s total deadline; the server is killed after.
Allowlist: $JARVIS_MCP_ALLOW (comma list), default "codebase-memory-mcp".
"""
from __future__ import annotations

import importlib.util
import json
import os
import queue
import re
import subprocess
import sys
import threading
import time
from pathlib import Path

STACK = Path(__file__).resolve().parents[1]
DEADLINE_S = 5.0
CACHE_S = 600.0  # reuse a good tools/list for 10 minutes (read-only list, same spec)
_TOOLS_CACHE: dict = {}
NAME_OK = re.compile(r"^[\w.\-]{1,64}$")


LIST_METHOD = "tools/list"  # the one place the MCP list method is spelled

def _inventory():
    name = "agent_stack_mcp_inventory"
    if name not in sys.modules:
        spec = importlib.util.spec_from_file_location(name, STACK / "hands" / "mcp_inventory.py")
        mod = importlib.util.module_from_spec(spec)
        sys.modules[name] = mod
        spec.loader.exec_module(mod)
    return sys.modules[name]


def allowlist() -> set[str]:
    raw = os.environ.get("JARVIS_MCP_ALLOW") or "codebase-memory-mcp"
    return {s.strip() for s in raw.split(",") if s.strip()}


def _list_tools(spec: dict) -> list[str] | None:
    env = {"PATH": os.environ.get("PATH", "/usr/bin:/bin"), "HOME": os.environ.get("HOME", "")}
    env.update(spec.get("env") or {})
    try:
        proc = subprocess.Popen([spec["command"], *spec.get("args", [])], stdin=subprocess.PIPE,
                                stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, env=env)
    except OSError:
        return None
    out: queue.Queue = queue.Queue()

    def _reader() -> None:
        for line in proc.stdout:  # type: ignore[union-attr]
            out.put(line)

    threading.Thread(target=_reader, daemon=True).start()
    end = time.monotonic() + DEADLINE_S

    def send(msg: dict) -> None:
        proc.stdin.write(json.dumps(msg) + "\n"); proc.stdin.flush()  # type: ignore[union-attr]

    def wait(rid: int):
        while time.monotonic() < end:
            try:
                line = out.get(timeout=max(0.05, end - time.monotonic()))
            except queue.Empty:
                return None
            try:
                msg = json.loads(line)
            except ValueError:
                continue
            if msg.get("id") == rid:
                return msg.get("result")
        return None

    try:
        send({"jsonrpc": "2.0", "id": 1, "method": "initialize",
              "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "jarvis", "version": "0"}}})
        if wait(1) is None:
            return None
        send({"jsonrpc": "2.0", "method": "notifications/initialized"})
        send({"jsonrpc": "2.0", "id": 2, "method": LIST_METHOD, "params": {}})
        res = wait(2)
        if not isinstance(res, dict):
            return None
        names = [str(t.get("name")) for t in (res.get("tools") or []) if isinstance(t, dict) and t.get("name")]
        return sorted(n for n in names if NAME_OK.match(n))
    except (OSError, ValueError):
        return None
    finally:
        try:
            proc.kill()
        except OSError:
            pass


def run(args: dict | None = None, *, servers: dict | None = None, allow: set | None = None) -> dict:
    name = str((args or {}).get("server") or "").strip()
    allowed = allow if allow is not None else allowlist()
    if not name or name not in allowed:
        return {"ok": False, "server": name, "tools": [],
                "spoken": f"I can only talk to allowlisted MCP servers ({', '.join(sorted(allowed)) or 'none'}). I didn't start {name or 'anything'}."}
    spec = (servers or {}).get(name) if servers is not None else _inventory().server_spec(name)
    if not spec:
        return {"ok": False, "server": name, "tools": [], "spoken": f"I can't find a stdio config for {name}."}
    key = json.dumps(spec, sort_keys=True, default=str)
    hit = _TOOLS_CACHE.get(key)
    if servers is None and hit and time.monotonic() - hit[0] < CACHE_S:
        tools = hit[1]  # same server spec answered recently; a busy Mac can't push it past the deadline
    else:
        tools = _list_tools(spec)
        if tools is not None and servers is None:
            _TOOLS_CACHE[key] = (time.monotonic(), tools)
    if tools is None:
        return {"ok": False, "server": name, "tools": [], "spoken": f"{name} did not answer within {int(DEADLINE_S)} seconds. I stopped it."}
    sp = f"{name} offers {len(tools)} tools: " + ", ".join(tools[:15]) + ("…" if len(tools) > 15 else ".") + " Read-only listing; nothing was called."
    return {"ok": True, "server": name, "tools": tools, "spoken": sp}


_SRV = re.compile(r"\b(?:tools?\s+(?:are\s+)?(?:on|from|of|in)\s+(?:the\s+|your\s+|my\s+)?)((?:read-only\s+)?[\w.\-]+)(?:\s+mcp)?(?:\s+server)?\b", re.I)
_GENERIC = {"your", "my", "the", "read-only", "readonly", "mcp", "server", "allowlisted", "local", "one"}


def args_from_utterance(u: str) -> dict:
    m = _SRV.search(u or "")
    if not m:
        return {}
    name = m.group(1).lower().removeprefix("read-only ").strip()
    if name in _GENERIC:
        allowed = sorted(allowlist())
        return {"server": allowed[0]} if len(allowed) == 1 else {}
    return {"server": m.group(1)}


def log_meta(got: dict) -> dict:
    g = got or {}
    return {"ok": bool(g.get("ok")), "server_ok": bool(g.get("server")), "tools": len(g.get("tools") or [])}
