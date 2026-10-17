"""Canvas sig_z48 (pattern recall): how often, and when, something really happened in his history, with dated quotes.

Counts only what is in the files: identical messages repeated across sessions count once, nothing is estimated, and
zero means zero. Sources are JSONL rows with a timestamp and text (the cross-platform chat corpus by default).
"""
from __future__ import annotations
import collections
import json
import re
from pathlib import Path


def _rows(path: Path):
    try:
        with path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                try:
                    row = json.loads(line)
                except ValueError:
                    continue
                if isinstance(row, dict) and isinstance(row.get("text"), str):
                    yield row
    except OSError:
        return


def recall(pattern: str, sources: list, *, since: str = "", platform: str = "", examples: int = 5) -> dict:
    words = str(pattern or "").strip()
    if len(words) < 3:
        raise ValueError("pattern: at least 3 characters")
    # plain words, every one must appear (a model-written regex over 10k lines could hang the job: never compile it)
    terms = [w.lower() for w in words.split()]
    rx = re.compile(re.escape(terms[0]), re.I)  # only to place the quote; matching is plain substrings (linear)
    seen, hits = set(), []
    for src in sources:
        for row in _rows(Path(src)):
            ts, text = str(row.get("ts") or ""), row["text"]
            low = text.lower()
            if (since and ts[:10] < since) or (platform and row.get("platform") != platform) or not all(t in low for t in terms):
                continue
            key = " ".join(text.lower().split())
            if key in seen:
                continue  # the same message pasted into several sessions is one occurrence
            seen.add(key)
            hits.append((ts, str(row.get("platform") or "?"), text))
    hits.sort()
    months = collections.Counter(t[:7] or "undated" for t, _, _ in hits)
    plats = collections.Counter(p for _, p, _ in hits)

    def quote(t, p, text):
        m = rx.search(text)
        a = max(0, m.start() - 80) if m else 0
        return f"{t[:10] or 'undated'} ({p}): …{' '.join(text[a:a + 220].split())}…"

    picks = hits if len(hits) <= examples else hits[-1:] if examples < 2 else [hits[round(i * (len(hits) - 1) / (examples - 1))] for i in range(examples)]
    return {"count": len(hits), "first": hits[0][0][:10] if hits else "", "last": hits[-1][0][:10] if hits else "",
            "by_month": dict(sorted(months.items())), "by_platform": dict(plats.most_common()),
            "examples": [quote(*h) for h in picks]}


def say(got: dict, pattern: str) -> str:
    if not got["count"]:
        return f"No record of {pattern!r} in his history. Say so; do not guess."
    months = ", ".join(f"{m}: {n}" for m, n in got["by_month"].items())
    return (f"{got['count']} distinct times, {got['first']} to {got['last']} (by month {months}; by platform "
            f"{json.dumps(got['by_platform'])}). Dated examples:\n- " + "\n- ".join(got["examples"]))
