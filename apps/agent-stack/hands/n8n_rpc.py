"""Jarvis's own n8n MCP (env-token http spec from agent_tools). Full-text results (no 3 KB cap) for workflow building."""
from __future__ import annotations

import importlib.util, json
from pathlib import Path

_A = None


def _at():
    global _A
    if _A is None:
        s = importlib.util.spec_from_file_location("n8n_agent_tools", Path(__file__).with_name("agent_tools.py"))
        _A = importlib.util.module_from_spec(s); s.loader.exec_module(_A)
    return _A


def rpc(method: str, params: dict, deadline: float = 90) -> dict:
    a = _at(); hs = a.http_spec("n8n")
    if not hs:
        return {"error": {"message": "no n8n config"}}
    return a._http_rpc(hs, [{"method": method, "params": params}], deadline)[0] or {}


def call(tool: str, args: dict | None = None, deadline: float = 120) -> tuple[bool, str]:
    r = rpc("tools/call", {"name": tool, "arguments": args or {}}, deadline)
    if r.get("error"):
        return False, str(r["error"].get("message"))
    res = r.get("result") or {}
    txt = "\n".join(str(c.get("text")) for c in (res.get("content") or []) if isinstance(c, dict) and c.get("type") == "text")
    return (not res.get("isError")), (txt or json.dumps(res.get("structuredContent") or res)[:20000])
