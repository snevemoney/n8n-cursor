"""Canvas sig_z52_batch6 (gate as MCP): any agent asks Evens a yes/no, pick-one or 1-5 question through one MCP tool.

No pop-up: the question becomes one line in Decisions Needed (the list he already answers in a word, read by the
morning brief); he writes his answer after "answer:" and get_decision returns it, checked against the options.
Run as a stdio MCP server: python3 gate_mcp.py   (env JARVIS_DECISIONS_FILE overrides the list, for tests)
"""
from __future__ import annotations
import hashlib
import json
import os
import re
import sys
import time
from pathlib import Path

DEFAULT = Path.home() / "ArtCraft Studio/00 Private/Studio Operations/Decisions Needed.md"
KINDS = ("yes_no", "pick_one", "scale")


def _file() -> Path:
    return Path(os.environ.get("JARVIS_DECISIONS_FILE") or DEFAULT)


def _options(kind: str, options) -> list:
    if kind == "yes_no":
        return ["yes", "no"]
    if kind == "scale":
        return [str(n) for n in range(1, 6)]
    opts = [" ".join(str(o).split()) for o in (options or []) if str(o).strip()]
    if not 2 <= len(opts) <= 6 or any("/" in o or "\n" in o for o in opts):
        raise ValueError("pick_one needs 2 to 6 short options, without '/'")
    return opts


def ask(question: str, kind: str, options=None, by: str = "an agent") -> dict:
    q = " ".join(str(question or "").split())
    if kind not in KINDS or not 5 <= len(q) <= 300:
        raise ValueError(f"kind is one of {KINDS}; question is 5-300 characters")
    opts = _options(kind, options)
    gid = "GATE-" + hashlib.sha1(f"{q}|{time.time()}".encode()).hexdigest()[:6]
    who = re.sub(r"[^\w .-]", "", str(by))[:30] or "an agent"
    line = f"- {time.strftime('%Y-%m-%d %H:%M')} ({who}) {gid}: {q} [{' / '.join(opts)}] answer: \n"
    with _file().open("a", encoding="utf-8") as f:
        f.write(line)
    return {"id": gid, "options": opts, "status": "asked", "where": "Decisions Needed"}


def _match(said: str, opts: list):
    """Exact option, else the one option whose first word he started with ('yes, go ahead' is yes); else None."""
    norm = lambda t: re.sub(r"[^\w ]", "", t.lower()).split()
    exact = [o for o in opts if norm(o) == norm(said)]
    first = [o for o in opts if norm(said)[:1] == norm(o)[:1]]
    return (exact or (first if len(first) == 1 else [None]))[0]


def get(gid: str) -> dict:
    if not re.fullmatch(r"GATE-[0-9a-f]{6}", str(gid or "")):
        raise ValueError("id looks like GATE-1a2b3c")
    for line in _file().read_text(encoding="utf-8").splitlines():
        m = re.search(re.escape(gid) + r": .* \[(.+)\] answer:(.*)$", line)
        if m:
            opts, said = [o.strip() for o in m.group(1).split(" / ")], m.group(2).strip()
            if not said:
                return {"id": gid, "status": "waiting", "options": opts}
            pick = _match(said, opts)
            return ({"id": gid, "status": "answered", "answer": pick, "his_words": said} if pick else
                    {"id": gid, "status": "unclear", "his_words": said, "options": opts})
    return {"id": gid, "status": "not_found"}


TOOLS = [
    {"name": "ask_decision", "description": "Ask Evens one decision without interrupting him: kind yes_no, pick_one "
     "(2-6 options) or scale (1-5). Returns an id; he answers in his Decisions Needed list.",
     "inputSchema": {"type": "object", "required": ["question", "kind"], "properties": {
         "question": {"type": "string"}, "kind": {"type": "string", "enum": list(KINDS)},
         "options": {"type": "array", "items": {"type": "string"}}, "from": {"type": "string"}}}},
    {"name": "get_decision", "description": "His answer to an ask_decision id: waiting, answered (one of the options), "
     "or unclear (his words did not match an option; ask again, never guess).",
     "inputSchema": {"type": "object", "required": ["id"], "properties": {"id": {"type": "string"}}}},
]


def handle(msg: dict):
    method, mid, p = msg.get("method"), msg.get("id"), msg.get("params") or {}
    if mid is None:
        return None  # notifications get no reply
    if method == "initialize":
        res = {"protocolVersion": p.get("protocolVersion") or "2025-06-18", "capabilities": {"tools": {}},
               "serverInfo": {"name": "jarvis-gate", "version": "1"}}
    elif method == "tools/list":
        res = {"tools": TOOLS}
    elif method == "tools/call":
        a = p.get("arguments") or {}
        try:
            out = (ask(a.get("question"), a.get("kind"), a.get("options"), a.get("from") or "an agent")
                   if p.get("name") == "ask_decision" else get(a.get("id")) if p.get("name") == "get_decision"
                   else {"error": "unknown tool"})
            res = {"content": [{"type": "text", "text": json.dumps(out)}], "isError": "error" in out}
        except (ValueError, OSError) as exc:
            res = {"content": [{"type": "text", "text": str(exc)}], "isError": True}
    elif method == "ping":
        res = {}
    else:
        return {"jsonrpc": "2.0", "id": mid, "error": {"code": -32601, "message": f"no method {method}"}}
    return {"jsonrpc": "2.0", "id": mid, "result": res}


def main() -> None:
    for line in sys.stdin:
        try:
            msg = json.loads(line)
        except ValueError:
            continue
        out = handle(msg)
        if out is not None:
            sys.stdout.write(json.dumps(out) + "\n"); sys.stdout.flush()


if __name__ == "__main__":
    main()
