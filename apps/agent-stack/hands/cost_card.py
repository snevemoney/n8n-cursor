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
LAST_RE = re.compile(r"\b(?:what\s+(?:did|was)|how\s+much\s+(?:did|was))\s+(?:the\s+|that\s+|this\s+|your\s+)?(?:last|previous|that|this)?\s*"
                     r"(?:answer|reply|response|turn|one|it)?\s*(?:cost|costs?)\b|\bcost\s+of\s+(?:that|the\s+last|your\s+last)\s+(?:answer|reply|turn)\b", re.I)
WANT_RE = re.compile(r"\b(?:cost\s+card|what\s+(?:did|does|do)\s+(?:that|this|it|you|replies?)\s+cost|how\s+much\s+(?:have\s+you|did\s+you|"
                     r"do\s+you)\s+(?:spend|spent|cost)|(?:today'?s|my)\s+(?:spend|costs?|bill)|cost\s+(?:so\s+far|today)|cost\s+guide|the\s+meter|"
                     r"what\s+(?:does|do|did)\s+(?:each|every|all)\s+(?:\w+\s+){0,4}?cost|how\s+much\s+(?:does|do)\s+(?:each|every|you|jarvis)\b[^?]{0,40}cost|"
                     r"(?:cost|price)\s+(?:of|per)\s+(?:each|every)\b)\b", re.I)
WEB_FEE = 0.005      # perplexity/sonar per-request web_search fee (OpenRouter list)
WEB_TOKENS = 400     # one sonar lookup, prompt + answer (estimate)
CODE_TOKENS = (900, 500)  # one builder call (in, out), estimate
CLASS_OF = {"web_search": "web", "code_run": "code", "workbench": "code", "drafts": "code", "pickup": "code"}


def wants_cost(u: str) -> bool:
    return bool(WANT_RE.search(u or "") or LAST_RE.search(u or ""))


def last_turn(rows: list[dict]) -> dict:
    """The answer he is asking about: the newest turn that is not itself a cost question."""
    for r in reversed(rows):
        if r.get("verb") != "cost_card" and "cost_card" not in (r.get("tools") or []):
            return r
    return {}


def last_turn_spoken(r: dict) -> dict:
    """Only real numbers: OpenRouter's metered usage for that turn, or 'no model call'. Never an estimate."""
    model = str(r.get("model") or "")
    ts = str(r.get("ts") or "")
    if not r:
        return {"ok": False, "spoken": "I have no previous turn in the log to price."}
    if not model or model == "none":
        tools = ", ".join(r.get("tools") or []) or str(r.get("verb") or "a hand")
        return {"ok": True, "metered": True, "usd": 0.0, "row_ts": ts,
                "spoken": f"That last answer cost nothing: no model was called; {tools} answered on this Mac (turn log {ts})."}
    usd = r.get("usage_cost_usd")
    if usd is None:
        return {"ok": True, "metered": False, "usd": None, "row_ts": ts,
                "spoken": f"That last answer used {model}, but OpenRouter sent no usage report for it, so I don't have its real cost "
                          "and I won't guess a number."}
    return {"ok": True, "metered": True, "usd": float(usd), "row_ts": ts, "gen_id": r.get("usage_gen_id"),
            "spoken": f"That last answer cost ${float(usd):.6f} on {model}: {r.get('usage_tokens_in')} tokens in, "
                      f"{r.get('usage_tokens_out')} out, per OpenRouter's usage report for that turn (turn log {ts})."}


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
    if r.get("usage_cost_usd") is not None:
        usd += float(r["usage_cost_usd"])  # OpenRouter's metered cost beats any estimate
    elif m:
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


METER = Path.home() / "Documents" / "My_Billion_Dollar_Vault" / "00_Outer_Heaven" / "JARVIS-INBOX" / "THE-METER-EVERYDAY.md"
ROWS = [("reply", "Answers you, by voice or text", "A spoken or typed reply from the talk model."),
        ("tool", "Notes, tools, calendar, files", "A hand answers on this Mac; no model call."),
        ("web", "Live web research", "One sourced search (sonar) plus its request fee."),
        ("code", "Code, drafts and builds", "A builder model call that writes or reviews.")]


def meter_page(day: dict, busy: float, src: str) -> str:
    """Demo U-LX 9:37: a 'The meter, everyday' page with what Jarvis does -> typical cost. Built from real logs."""
    import os
    if os.environ.get("PYTEST_CURRENT_TEST") or not METER.parent.parent.is_dir():
        return ""
    lines = ["# THE METER \u00b7 EVERYDAY", "", f"_Typical cost per thing Jarvis does, from today's turn log and {src}. Estimates._", "",
             "| What Jarvis does | | Typical cost | Today |", "|---|---|---|---|"]
    for cls, name, note in ROWS:
        v = day.get(cls) or {"n": 0, "usd": 0.0}
        each = (v["usd"] / v["n"] * 100) if v["n"] else 0.0
        cost = "FREE" if v["n"] and each < 0.005 else (f"~{each:.2f}\u00a2" if v["n"] else "n/a")
        lines.append(f"| **{name}** | {note} | {cost} | {v['n']} \u00d7, ${v['usd']:.3f} |")
    lines += ["| **Instant reflexes** | Five quick decisions per ask, no model. | FREE | every turn |", "",
              f"**A busy day** (20 answers, 5 actions, 1 research) costs about **{busy * 100:.0f}\u00a2**. Pay-per-use on your own keys; no subscription.", ""]
    try:
        METER.parent.mkdir(exist_ok=True)
        METER.write_text("\n".join(lines), encoding="utf-8")
        return str(METER)
    except OSError:
        return ""


def run(utterance: str = "", *, log: Path | None = None, now: datetime | None = None, fetch=None) -> dict:
    now = now or datetime.now(timezone.utc)
    local_midnight = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
    rows = _rows(log or ROOT / "logs" / "jarvis-turns.jsonl")
    if not rows:
        return {"ok": False, "spoken": "I have no turn log to price yet."}
    if LAST_RE.search(utterance or "") and not WANT_RE.search(re.sub(LAST_RE, "", utterance or "")):
        r = last_turn(rows)
        got = last_turn_spoken(r)
        got["row"] = {k: r.get(k) for k in ("ts", "gen", "model", "usage_tokens_in", "usage_tokens_out", "usage_cost_usd", "usage_gen_id")}
        return got
    p = prices(fetch)
    last = rows[-1]
    last_cls, last_usd = row_cost(last, p)
    day = card(rows, p, since=local_midnight.astimezone(timezone.utc))
    total = sum(v["usd"] for v in day.values())
    n = sum(v["n"] for v in day.values())
    parts = [f"{c} {v['n']} (${v['usd']:.3f})" for c, v in day.items() if v["n"]]
    src = "OpenRouter list prices" if p else "no live price list, so model rows are $0"
    # demo U-LXFzu6sGU 9:37 "The meter, everyday": typical cost per thing Jarvis does, plus a busy day
    label = {"reply": "a spoken answer", "web": "live web research", "code": "a code or draft build", "tool": "a notes, tool or calendar action"}
    def each(c):
        v = day[c]
        if not v["n"]:
            return None
        cents = v["usd"] / v["n"] * 100
        return f"{label[c]} about {cents:.2f} cents" if cents >= 0.005 else f"{label[c]} free"
    meter = [x for x in (each(c) for c in ("reply", "web", "code", "tool")) if x]
    busy = 20 * (day["reply"]["usd"] / max(1, day["reply"]["n"])) + 5 * (day["tool"]["usd"] / max(1, day["tool"]["n"])) \
        + 1 * (day["web"]["usd"] / max(1, day["web"]["n"]))
    page = meter_page(day, busy, src)
    return {"ok": True, "card": day, "cites": [page] if page else [], "total_usd": round(total, 4), "turns": n,
            "meter": meter, "busy_day_usd": round(busy, 3),
            "spoken": ("The meter, typical cost each: " + "; ".join(meter) + ". Instant reflexes are free; they use no model. "
                       f"A busy day (20 answers, 5 actions, 1 research) is about {busy * 100:.0f} cents. "
                       f"Cost card, an estimate from logged token counts and {src}: today {n} turns, about ${total:.2f} — "
                       + ", ".join(parts) + f". The last turn was a {last_cls} turn, about ${last_usd:.4f}. "
                       "Pay-per-use on your own keys; no subscription.")}
