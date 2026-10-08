"""Keyword-baseline metric definition (FORMATS-SYNTHETIC.md).

flagged := kw_category != "unclassified"
useful  := usefulness ∈ {high, med}
recall  = |flagged ∩ useful| / |useful|
precision = |flagged ∩ useful| / |flagged|
high-only recall = |flagged ∩ high| / |high|
"""

from __future__ import annotations

from typing import Any, Iterable

from learning_engine.constants import KW_UNCLASSIFIED, USEFUL_VALUES


def is_flagged(kw_category: Any) -> bool:
    if kw_category is None:
        return False
    text = str(kw_category).strip()
    if text == "" or text == KW_UNCLASSIFIED:
        return False
    return True


def is_useful(usefulness: Any) -> bool:
    return str(usefulness or "").strip() in USEFUL_VALUES


def is_high(usefulness: Any) -> bool:
    return str(usefulness or "").strip() == "high"


def is_done(status: Any) -> bool:
    return str(status or "").strip().upper() == "DONE"


def score_rows(rows: Iterable[dict[str, Any]]) -> dict[str, Any]:
    """Score labelled rows. Each row needs usefulness, flagged (bool), optional status."""
    rows = list(rows)
    flagged_i = [r for r in rows if r.get("flagged")]
    useful_i = [r for r in rows if is_useful(r.get("usefulness"))]
    high_i = [r for r in rows if is_high(r.get("usefulness"))]
    tp = [r for r in rows if r.get("flagged") and is_useful(r.get("usefulness"))]
    tp_high = [r for r in rows if r.get("flagged") and is_high(r.get("usefulness"))]
    useful_n = len(useful_i)
    flagged_n = len(flagged_i)
    high_n = len(high_i)
    recall = (len(tp) / useful_n) if useful_n else None
    precision = (len(tp) / flagged_n) if flagged_n else None
    high_recall = (len(tp_high) / high_n) if high_n else None
    latencies = [float(r["latency_ms"]) for r in rows if r.get("latency_ms") is not None]
    costs = [float(r["cost_usd"]) for r in rows if r.get("cost_usd") is not None]
    return {
        "n": len(rows),
        "flagged": flagged_n,
        "useful": useful_n,
        "high": high_n,
        "tp": len(tp),
        "tp_high": len(tp_high),
        "recall": recall,
        "precision": precision,
        "high_recall": high_recall,
        "latency_ms_mean": (sum(latencies) / len(latencies)) if latencies else 0.0,
        "cost_usd_sum": sum(costs) if costs else 0.0,
        "cost_usd_mean": (sum(costs) / len(costs)) if costs else 0.0,
    }


def split_done(rows: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    done = [r for r in rows if is_done(r.get("status"))]
    return rows, done
