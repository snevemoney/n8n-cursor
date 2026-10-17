"""Canvas sig_z37 (tool armory): one searchable catalog of every configured MCP server's tools and its connection state.

refresh: ask each configured server for its tools (read-only tools/list, one at a time, bounded); cache the result.
search: find tools by words across all servers from the cache, saying when the catalog was made and which servers failed.
"""
from __future__ import annotations
import concurrent.futures as cf
import json
import re
import time
from pathlib import Path

CACHE = Path.home() / "Library/Caches/jarvis/mcp-catalog.json"
WORKERS = 1  # live 10-17: in parallel, lazily loaded helper modules raced (AttributeError on 24 of 25 servers)
PER_SERVER_S = 25


def refresh(names: list, list_fn, cache: Path = CACHE) -> dict:
    """list_fn(server) -> {"ok", "tools", "spoken"} (agent_tools.op_mcp_list)."""
    rows = {}

    def one(n):
        try:
            got = list_fn(n)
        except Exception as exc:  # noqa: BLE001 - one bad server never sinks the catalog
            got = {"ok": False, "spoken": f"{type(exc).__name__}"}
        return n, {"ok": bool(got.get("ok")), "tools": list(got.get("tools") or []),
                   "why": "" if got.get("ok") else str(got.get("spoken") or "")[:160]}

    with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        for n, row in ex.map(one, sorted(set(names), key=str.lower)):
            rows[n] = row
    cat = {"made": time.time(), "servers": rows}
    cache.parent.mkdir(parents=True, exist_ok=True)
    cache.write_text(json.dumps(cat, indent=1))
    return cat


def search(query: str, cache: Path = CACHE) -> str:
    try:
        cat = json.loads(cache.read_text())
    except (OSError, ValueError):
        return "No tool catalog yet: refresh it first."
    words = [w for w in re.findall(r"[a-z0-9]+", str(query).lower()) if len(w) > 1]
    hits = [(s, t) for s, row in cat["servers"].items() for t in row["tools"]
            if all(w in f"{s} {t}".lower() for w in words)] if words else []
    made = time.strftime("%m-%d %H:%M", time.localtime(cat["made"]))
    up = sum(1 for r in cat["servers"].values() if r["ok"])
    down = sorted(s for s, r in cat["servers"].items() if not r["ok"])
    head = f"Catalog from {made}: {up} of {len(cat['servers'])} servers answered" + (f" (not answering: {', '.join(down[:8])})" if down else "") + "."
    if not words:
        return head
    if not hits:
        return f"{head} No tool matches {query!r}."
    return f"{head} {len(hits)} match {query!r}:\n" + "\n".join(f"- {s}: {t}" for s, t in hits[:40])
