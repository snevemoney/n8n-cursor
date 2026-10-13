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


def _ddg(query: str, timeout: float) -> list[dict[str, str]]:
    """DuckDuckGo HTML results (first engine)."""
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


UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"


def _bing_target(url: str) -> str:
    """Bing wraps results in /ck/a?...&u=a1<base64url>; unwrap to the real URL (ads stay on bing.com and are skipped)."""
    import base64
    pr = urllib.parse.urlparse(url)
    if pr.netloc.endswith("bing.com") and pr.path.startswith("/ck/a"):
        u = (urllib.parse.parse_qs(pr.query).get("u") or [""])[0]
        if u.startswith("a1"):
            try:
                raw = u[2:]
                return base64.urlsafe_b64decode(raw + "=" * (-len(raw) % 4)).decode("utf-8", "replace")
            except Exception:
                return url
    return url


def parse_bing(body: str) -> list[dict[str, str]]:
    """Bing result blocks -> url/title/snippet. Ad/tracking links (bing.com) are skipped. Text is data."""
    strip = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()
    out = []
    for blk in re.findall(r'<li class="b_algo".*?</li>', body or "", re.S):
        m = re.search(r'<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', blk, re.S)
        if not m:
            continue
        url = _bing_target(html.unescape(m.group(1)))
        if not url.startswith(("http://", "https://")) or "bing.com" in urllib.parse.urlparse(url).netloc:
            continue
        p = re.search(r"<p[^>]*>(.*?)</p>", blk, re.S)
        out.append({"url": url, "title": strip(m.group(2)), "snippet": strip(p.group(1)) if p else ""})
    return out


def _bing(query: str, timeout: float) -> list[dict[str, str]]:
    """Bing HTML results (second engine), GET only."""
    # Bing's plain-HTML page drifts on filler words ("current version of X" -> banking), so send keywords only.
    stop = {"what", "whats", "what's", "is", "are", "the", "of", "a", "an", "who", "which", "right", "now", "please",
            "tell", "me", "current", "currently", "today", "for", "on", "in", "my"}
    kw = " ".join(w for w in re.findall(r"[\w.#+-]+", query) if w.lower() not in stop) or query
    url = "https://www.bing.com/search?setlang=en-US&q=" + urllib.parse.quote_plus(kw)
    if shutil.which("curl"):
        cp = subprocess.run(["curl", "-s", "-L", "--max-time", str(max(1, int(timeout))), "-A", UA, url],
                            capture_output=True, timeout=timeout + 1)
        return parse_bing(cp.stdout[:600_000].decode("utf-8", "replace"))
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return parse_bing(r.read(600_000).decode("utf-8", "replace"))


def parse_brave(body: str) -> list[dict[str, str]]:
    """Brave Search web snippets -> url/title/snippet (text is data)."""
    strip = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<!--.*?-->|<[^>]+>", "", s or "", flags=re.S))).strip()
    out = []
    for blk in re.split(r'<div class="snippet [^"]*" data-pos="\d+" data-type="web"', body or "")[1:]:
        m = re.search(r'<a href="(https?://[^"]+)"', blk)
        t = re.search(r'search-snippet-title[^"]*" title="([^"]*)"', blk)
        c = re.search(r'<div class="content [^"]*">(.*?)</div>', blk, re.S)
        if not m or "brave.com" in urllib.parse.urlparse(m.group(1)).netloc:
            continue
        snip = re.sub(r"^\d+ \w+ ago -\s*", "", strip(c.group(1)) if c else "")
        out.append({"url": html.unescape(m.group(1)), "title": html.unescape(t.group(1)) if t else "", "snippet": snip})
    return out


def _brave(query: str, timeout: float) -> list[dict[str, str]]:
    """Brave Search HTML results (second engine), GET only."""
    url = "https://search.brave.com/search?q=" + urllib.parse.quote_plus(query)
    cp = subprocess.run(["curl", "-s", "-L", "--max-time", str(max(1, int(timeout))), "-A", UA, url],
                        capture_output=True, timeout=timeout + 1)
    return parse_brave(cp.stdout[:900_000].decode("utf-8", "replace"))


def _openrouter_web(query: str, timeout: float) -> list[dict[str, str]]:
    """Third engine: OpenRouter's web plugin (Exa) returns real cited URLs when the HTML engines bot-check
    this Mac. Read-only lookup through the key already loaded for the brain; the key is never printed."""
    import json as _json
    import os as _os
    key = (_os.environ.get("OPENROUTER_API_KEY") or "").strip()
    if not key or timeout < 1.0:
        return []
    # perplexity/sonar searches natively (~1.5 s live) and returns url_citation annotations; the generic web
    # plugin on other models took 4-10 s and missed the 6 s cap under load.
    model = _os.environ.get("JARVIS_WEB_MODEL") or "perplexity/sonar"
    body = {"model": model, "max_tokens": 120,
            "messages": [{"role": "user", "content": "Answer in one sentence from the web: " + query}]}
    if not model.startswith("perplexity/"):
        body["plugins"] = [{"id": "web", "max_results": MAX_CITES}]
    req = urllib.request.Request("https://openrouter.ai/api/v1/chat/completions", data=_json.dumps(body).encode(),
                                 headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        msg = (_json.loads(r.read(400_000)).get("choices") or [{}])[0].get("message") or {}
    answer = re.sub(r"\[([^\]]*)\]\([^)]*\)|\[\d+\]|\*\*", lambda m: m.group(1) or "", str(msg.get("content") or "")).strip()
    out, seen = [], set()
    for a in msg.get("annotations") or []:
        c = a.get("url_citation") or {}
        if str(c.get("url") or "").startswith(("http://", "https://")) and c["url"] not in seen and len(out) < MAX_CITES:
            seen.add(c["url"])
            out.append({"url": c["url"], "title": str(c.get("title") or ""),
                        "snippet": answer if not out else str(c.get("content") or "")[:220]})
    return out


# DuckDuckGo first, then Brave, then OpenRouter's web plugin when both HTML engines bot-check or rate-limit.
# Bing's plain page from curl returned off-topic results live, so it is not used.
ENGINES = [_ddg, _brave, _openrouter_web]


def _default_fetch(query: str, timeout: float) -> list[dict[str, str]]:
    """Ask every engine in ENGINES at once inside one time budget; the earliest engine in ENGINES order
    with relevant results wins once it is in (a bot-checked HTML engine no longer eats the others' time)."""
    import time as _t
    end = _t.time() + timeout
    box: dict[int, list] = {}
    done = threading.Event()

    def one(i, eng):
        try:
            rows = eng(query, max(0.5, end - _t.time() - 0.2)) or []
        except Exception:
            rows = []
        box[i] = rows if rows and _relevant(query, rows) else []
        done.set()

    for i, eng in enumerate(ENGINES):
        threading.Thread(target=one, args=(i, eng), daemon=True).start()
    while _t.time() < end:
        for i in sorted(box):  # first relevant answer to land wins (lowest engine index on a tie)
            if box[i]:
                return box[i]
        if len(box) == len(ENGINES):
            return []
        done.wait(max(0.0, min(0.1, end - _t.time()))); done.clear()
    for i in range(len(ENGINES)):
        if box.get(i):
            return box[i]
    return []


def _relevant(query: str, rows: list[dict[str, str]]) -> bool:
    """At least one top result mentions a real query word (drops engines that answered a different question)."""
    stop = {"what", "is", "the", "of", "a", "an", "who", "which", "current", "latest", "now", "for", "in", "on", "and", "my"}
    words = {w.lower() for w in re.findall(r"[\w.#+-]{3,}", query)} - stop
    if not words:
        return True
    text = " ".join((r.get("title", "") + " " + r.get("snippet", "") + " " + r.get("url", "")).lower() for r in rows[:3])
    return any(w in text for w in words)


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
