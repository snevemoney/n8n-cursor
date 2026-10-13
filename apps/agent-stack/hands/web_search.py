"""web_search — Jarvis's one read-only web search hand (CANDIDATE).

One GET to a keyless search endpoint, hard 6 s cap, at most 2+ distinct cited URLs taken
from the actual results. Result text is DATA: lines that look like instructions are dropped,
never spoken as commands, and nothing is ever sent. log_meta() keeps metadata only.
"""
from __future__ import annotations

import html
import re
import shutil
import subprocess
import threading
import urllib.parse
import urllib.request
from typing import Any, Callable

TIMEOUT_S = 6.0
MAX_CITES = 3
ENDPOINT = "https://html.duckduckgo.com/html/?q="
INJECTION = re.compile(
    r"ignore\s+(all\s+|any\s+)?(previous|prior|above)|disregard|system\s+prompt|you\s+are\s+now|"
    r"\b(email|send|forward|wire|pay|transfer|delete)\b.{0,40}\b(key|keys|pass(?:word|code)|money|token|file)|"
    r"\binstructions?\b",
    re.I,
)


def _default_fetch(query: str, timeout: float) -> list[dict[str, str]]:
    url = ENDPOINT + urllib.parse.quote_plus(query)
    body = ""
    if shutil.which("curl"):  # plain GET; curl's TLS profile is not bot-challenged like urllib's
        cp = subprocess.run(["curl", "-s", "-L", "--max-time", str(int(timeout)), "-A", "Mozilla/5.0", url],
                            capture_output=True, timeout=timeout + 1)
        body = cp.stdout[:400_000].decode("utf-8", "replace")
    if "result__a" not in body:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=timeout) as r:  # GET only
            body = r.read(400_000).decode("utf-8", "replace")
    out = []
    for m in re.finditer(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?class="result__snippet"[^>]*>(.*?)</a>',
                         body, re.S):
        href = html.unescape(m.group(1))
        q = urllib.parse.parse_qs(urllib.parse.urlparse(href).query).get("uddg")
        url = q[0] if q else href
        if url.startswith("//"):
            url = "https:" + url
        strip = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()
        out.append({"url": url, "title": strip(m.group(2)), "snippet": strip(m.group(3))})
    return out


def _clean(text: str) -> str:
    text = re.sub(r"\s+", " ", str(text or "")).strip()[:220]
    return "" if INJECTION.search(text) else text


def _fail(query: str, why: str) -> dict[str, Any]:
    return {"ok": False, "query": query, "cites": [], "results": 0, "sent": False,
            "spoken": f"I couldn't find sources for that just now ({why}), so I won't guess."}


def run(args: dict[str, Any], fetch: Callable | None = None) -> dict[str, Any]:
    query = str((args or {}).get("query") or "").strip()[:300]
    if not query:
        return _fail(query, "no query")
    fetch = fetch or _default_fetch
    box: dict[str, Any] = {}

    def work():
        try:
            box["rows"] = fetch(query, TIMEOUT_S)
        except Exception as e:  # network/parse errors are an honest miss
            box["err"] = type(e).__name__

    t = threading.Thread(target=work, daemon=True)
    t.start()
    t.join(TIMEOUT_S)
    if t.is_alive():
        return _fail(query, "search timed out")
    if "err" in box:
        return _fail(query, "search failed")
    seen, rows = set(), []
    for r in box.get("rows") or []:
        url = str(r.get("url") or "")
        if not url.startswith(("http://", "https://")) or url in seen:
            continue
        seen.add(url)
        rows.append(r)
    if not rows:
        return _fail(query, "no results")
    rows = rows[:MAX_CITES]
    lines = []
    for i, r in enumerate(rows, 1):
        title, snip = _clean(r.get("title")), _clean(r.get("snippet"))
        lines.append(f"[{i}] {title or 'source'}" + (f": {snip}" if snip else ""))
    cites = [r["url"] for r in rows]
    return {"ok": True, "query": query, "cites": cites, "results": len(rows), "sent": False,
            "spoken": "From the web: " + " ".join(lines) + " Sources: " + ", ".join(cites)}


def log_meta(got: dict[str, Any]) -> dict[str, Any]:
    return {"ok": bool(got.get("ok")), "n_cites": len(got.get("cites") or []),
            "n_results": int(got.get("results") or len(got.get("cites") or []))}


def query_from_utterance(utterance: str) -> str:
    q = re.sub(r"^\s*(?:please\s+)?(?:search\s+(?:the\s+)?(?:web|internet|online)(?:\s+for)?|look\s+(?:it\s+)?up\s+online|"
               r"google|web\s+search(?:\s+for)?)\s*[:,-]?\s*", "", utterance or "", flags=re.I)
    return q.strip(" ?.") or (utterance or "").strip()
