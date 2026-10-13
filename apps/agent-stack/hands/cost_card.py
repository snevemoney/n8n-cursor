"""Cost card (Z14, metered brain): what Jarvis's replies cost, by class, from the turn log.

Classes: reply (talk model), tool (a hand answered, no model), web (web_search: sonar call + per-search fee),
code (code_author / workbench / drafts builder calls). Prices come from OpenRouter's public model list
(no key; cached 24 h in ~/Library/Caches/jarvis/or-prices.json). Tokens are the turn log's estimates, so the
$ is an ESTIMATE and is always said as one. Your keys, pay-per-use, no subscription. Read-only.
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CACHE = Path.home() / "Library" / "Caches" / "jarvis" / "or-prices.json"
WANT_RE = re.compile(r"\b(?:cost\s+card|what\s+(?:did|does|do)\s+(?:that|this|it|you|replies?)\s+cost|how\s+much\s+(?:have\s+you|did\s+you|"
                     r"do\s+you)\s+(?:spend|spent|cost)|(?:today'?s|my)\s+(?:spend|costs?|bill)|cost\s+(?:so\s+far|today))\b", re.I)
WEB_FEE = 0.005      # perplexity/sonar per-request web_search fee (OpenRouter list)
WEB_TOKENS = 400     # one sonar lookup, prompt + answer (estimate)
CODE_TOKENS = (900, 500)  # one builder call (in, out), estimate
CLASS_OF = {"web_search": "web", "code_run": "code", "workbench": "code", "drafts": "code", "pickup": "code"}


def wants_cost(u: str) -> bool:
    return bool(WANT_RE.search(u or ""))


def prices(fetch=None) -> dict:
    try:
        hit = json.loads(CACHE.read_text())
        if time.time() - float(hit.get("t", 0)) < 86400 and hit.get("p"):
            return hit["p"]
    except (OSError, ValueError):
        pass
    try:
        raw = fetch() if fetch else urllib.request.urlopen("https://openrouter.ai/api/v1/models", timeout=4).read()
        data = json.loads(raw)["data"]
        p = {m["id"]: {"in": float(m["pricing"].get("prompt") or 0), "out": float(m["pricing"].get("completion") or 0)} for m in data}
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        CACHE.write_text(json.dumps({"t": time.time(), "p": p}))
        return p
    except Exception:  # noqa: BLE001
        return {}


def row_cost(r: dict, p: dict) -> tuple[str, float]:
    verb = str(r.get("verb") or "")
    cls = CLASS_OF.get(verb) or ("reply" if r.get("model") and r.get("model") != "none" else "tool")
    usd = 0.0
    m = p.get(str(r.get("model") or ""))
    if m:
        usd += (r.get("est_tokens_in") or 0) * m["in"] + (r.get("est_tokens_out") or 0) * m["out"]
    if cls == "web":
        s = p.get("perplexity/sonar", {"in": 1e-6, "out": 1e-6})
        usd += WEB_FEE + WEB_TOKENS * s["in"]
    elif cls == "code":
        b = p.get("deepseek/deepseek-chat-v3.1", {"in": 2.5e-7, "out": 9.5e-7})
        usd += CODE_TOKENS[0] * b["in"] + CODE_TOKENS[1] * b["out"]
    return cls, usd


def card(rows: list[dict], p: dict, *, since: datetime) -> dict:
    out = {c: {"n": 0, "usd": 0.0} for c in ("reply", "tool", "web", "code")}
    for r in rows:
        try:
            ts = datetime.fromisoformat(str(r.get("ts")).replace("Z", "+00:00"))
        except ValueError:
            continue
        if ts < since:
            continue
        cls, usd = row_cost(r, p)
        out[cls]["n"] += 1
        out[cls]["usd"] += usd
    return out


def _rows(path: Path) -> list[dict]:
    rows = []
    try:
        with path.open("rb") as fh:
            fh.seek(max(0, path.stat().st_size - 3_000_000))
            for line in fh.read().decode("utf-8", "replace").splitlines():
                if line.startswith("{"):
                    try:
                        rows.append(json.loads(line))
                    except ValueError:
                        pass
    except OSError:
        pass
    return rows


def run(utterance: str = "", *, log: Path | None = None, now: datetime | None = None, fetch=None) -> dict:
    now = now or datetime.now(timezone.utc)
    local_midnight = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    rows = _rows(log or ROOT / "logs" / "jarvis-turns.jsonl")
    if not rows:
        return {"ok": False, "spoken": "I have no turn log to price yet."}
    p = prices(fetch)
    last = rows[-1]
    last_cls, last_usd = row_cost(last, p)
    day = card(rows, p, since=local_midnight.astimezone(timezone.utc))
    total = sum(v["usd"] for v in day.values())
    n = sum(v["n"] for v in day.values())
    parts = [f"{c} {v['n']} (${v['usd']:.3f})" for c, v in day.items() if v["n"]]
    src = "OpenRouter list prices" if p else "no live price list, so model rows are $0"
    return {"ok": True, "card": day, "total_usd": round(total, 4), "turns": n,
            "spoken": (f"Cost card, an estimate from logged token counts and {src}: today {n} turns, about ${total:.2f} — "
                       + ", ".join(parts) + f". The last turn was a {last_cls} turn, about ${last_usd:.4f}. "
                       "Pay-per-use on your own keys; no subscription.")}
