"""Canvas sig_z36 (cost by feature): one page of what Jarvis's jobs really cost, from the billed amounts.

Source: each operator job's state.json (cost_usd = OpenRouter's billed usage, summed per call) and messages.json
(which tools the job used). Nothing is estimated: a job with no billed cost shows as $0 and is counted as such.
A job that used several tools counts fully under each of them, so the per-tool column overlaps (said on the page).
"""
from __future__ import annotations
import collections
import json
import time
from pathlib import Path


def _jobs(tasks: Path, since: float) -> list:
    out = []
    for d in tasks.iterdir() if tasks.is_dir() else []:
        try:
            st = json.loads((d / "state.json").read_text())
        except (OSError, ValueError):
            continue
        at = float(st.get("started") or 0)
        if at < since:
            continue
        try:
            msgs = json.loads((d / "messages.json").read_text())
        except (OSError, ValueError):
            msgs = []
        tools = sorted({c.get("function", {}).get("name", "?") for m in msgs if isinstance(m, dict)
                        for c in (m.get("tool_calls") or []) if isinstance(c, dict)} - {"say", "done", "plan"})
        ask = next((str(m.get("content")) for m in msgs if isinstance(m, dict) and m.get("role") == "user"
                    and isinstance(m.get("content"), str) and not m["content"].startswith("(")), "")
        out.append({"cost": float(st.get("cost_usd") or 0), "kind": st.get("kind") or "unrouted",
                    "model": st.get("model") or "?", "tools": tools, "ask": " ".join(ask.split())[:80], "at": at})
    return out


def report(tasks: Path, days: int = 7, now: float | None = None) -> str:
    now = now or time.time()
    jobs = _jobs(tasks, now - days * 86400)
    total = sum(j["cost"] for j in jobs)

    def table(title, key):
        agg = collections.defaultdict(lambda: [0, 0.0])
        for j in jobs:
            for k in key(j):
                agg[k][0] += 1
                agg[k][1] += j["cost"]
        rows = sorted(agg.items(), key=lambda kv: -kv[1][1])
        return [f"## {title}", "", "| | jobs | billed $ |", "|---|---|---|",
                *[f"| {k} | {n} | {c:.4f} |" for k, (n, c) in rows], ""]

    lines = [f"# Jarvis cost by feature — last {days} days", "",
             f"{len(jobs)} jobs, **${total:.2f} billed** (OpenRouter usage; jobs with no billed cost count as $0). "
             f"Made {time.strftime('%Y-%m-%d %H:%M', time.localtime(now))}.", ""]
    lines += table("By kind of work", lambda j: [j["kind"]])
    lines += table("By model", lambda j: [j["model"]])
    lines += table("By tool (a job counts under every tool it used, so this column overlaps)", lambda j: j["tools"] or ["no tool"])
    top = sorted(jobs, key=lambda j: -j["cost"])[:5]
    lines += ["## Costliest jobs (a job can hold a whole conversation; the quote is its first request)", "", *[f"- ${j['cost']:.4f} · {j['kind']} · {j['model']} · “{j['ask']}”" for j in top], ""]
    return "\n".join(lines)
