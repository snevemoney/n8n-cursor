"""Stage C evaluation harness.

Reports recall, precision, high-only recall, counts, per-item latency and cost
as JSON, for all rows and DONE-only rows.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from learning_engine.io_util import read_jsonl, write_json, write_jsonl
from learning_engine.stage_c.contract import Judgment, Provider, evaluate
from learning_engine.stage_c.labelled import labelled_to_packet, load_labelled
from learning_engine.stage_c.metrics import score_rows, split_done
from learning_engine.stage_c.providers.jev import JevOpenRouterProvider
from learning_engine.stage_c.providers.keyword import KeywordReplayProvider, KeywordRulesProvider
from learning_engine.stage_c.providers.lexicon import LexiconProvider
from learning_engine.stage_c.providers.openai_decisions import OpenAIDecisionsProvider
from learning_engine.storage.sqlite_index import index_judgments


def resolve_provider(
    name: str,
    *,
    mode: str = "replay",
    opt_in_live: bool = False,
    max_input_tokens: int = 4000,
) -> Provider:
    key = name.strip().lower()
    if key in {"keyword", "keyword_replay", "keyword-baseline"}:
        if mode == "rules":
            return KeywordRulesProvider()
        if mode != "replay":
            raise ValueError("keyword --mode must be replay or rules")
        return KeywordReplayProvider()
    if key in {"keyword_rules", "keyword-rules"}:
        return KeywordRulesProvider()
    if key in {"lexicon", "lexicon_gate", "lexicon-baseline"}:
        return LexiconProvider()
    if key in {"jev", "jev_openrouter"}:
        return JevOpenRouterProvider(opt_in_live=opt_in_live, max_input_tokens=max_input_tokens)
    if key in {"openai", "openai_decisions"}:
        return OpenAIDecisionsProvider(opt_in_live=opt_in_live, max_input_tokens=max_input_tokens)
    raise ValueError(f"unknown provider: {name}")


def _rows_from_packets(packets: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for packet in packets:
        scores = packet.get("scores") if isinstance(packet.get("scores"), dict) else {}
        rows.append(
            {
                "signal_id": packet.get("signal_id"),
                "usefulness": scores.get("usefulness") or packet.get("usefulness"),
                "kw_category": scores.get("kw_category"),
                "status": packet.get("ledger_status")
                or scores.get("status")
                or (
                    "DONE"
                    if packet.get("processing_status") == "ok"
                    else packet.get("processing_status")
                ),
                "packet": packet,
            }
        )
    return rows


def run_eval(
    provider: Provider,
    rows: list[dict[str, Any]],
    *,
    max_items: int | None = None,
) -> dict[str, Any]:
    selected = rows[:max_items] if max_items is not None else rows
    judged: list[dict[str, Any]] = []
    items: list[dict[str, Any]] = []
    for row in selected:
        packet = row.get("packet") or labelled_to_packet(row)
        judgment: Judgment = evaluate(provider, packet)
        payload = judgment.to_json()
        judged.append(payload)
        items.append(
            {
                "signal_id": row.get("signal_id"),
                "usefulness": row.get("usefulness"),
                "status": row.get("status"),
                "flagged": judgment.flagged,
                "label": judgment.label,
                "latency_ms": judgment.latency_ms,
                "cost_usd": judgment.cost_usd if judgment.cost_usd is not None else 0.0,
            }
        )
    all_rows, done_rows = split_done(items)
    # DONE-only: if no row has an explicit DONE status, still report the slice
    # (empty done set → n=0). Keyword replay on REVIEW+STATE will have status.
    report = {
        "provider": getattr(provider, "name", "unknown"),
        "n_input": len(rows),
        "n_scored": len(items),
        "all": score_rows(all_rows),
        "done_only": score_rows(done_rows),
        "items": items,
    }
    return {"report": report, "judgments": judged}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Stage C evaluation harness")
    parser.add_argument("--provider", required=True, help="keyword | lexicon | jev | openai")
    parser.add_argument(
        "--mode",
        default="replay",
        help="keyword only: replay (stored kw_category) or rules (different baseline)",
    )
    parser.add_argument("--review", help="REVIEW.csv for labelled keyword metric")
    parser.add_argument("--state", help="STATE.jsonl joined by id")
    parser.add_argument("--packets", help="Packet JSONL (uses scores.usefulness / scores.kw_category)")
    parser.add_argument("--output", required=True, help="JSON report path")
    parser.add_argument("--judgments", help="Optional judgments JSONL path")
    parser.add_argument("--sqlite", help="Optional SQLite index path")
    parser.add_argument("--opt-in-live", action="store_true", help="Required for Jev / OpenAI")
    parser.add_argument("--max-items", type=int, default=None, help="Hard cap on scored items")
    parser.add_argument("--max-input-tokens", type=int, default=4000, help="Hard cap per live call")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.provider in {"jev", "jev_openrouter", "openai", "openai_decisions"} and not args.opt_in_live:
        print(
            json.dumps({"ok": False, "error": "live provider refused: pass --opt-in-live"}),
            file=sys.stderr,
        )
        return 2
    provider = resolve_provider(
        args.provider,
        mode=args.mode,
        opt_in_live=args.opt_in_live,
        max_input_tokens=args.max_input_tokens,
    )
    if args.review:
        rows = load_labelled(Path(args.review), Path(args.state) if args.state else None)
        for row in rows:
            row["packet"] = labelled_to_packet(row)
    elif args.packets:
        packets = list(read_jsonl(Path(args.packets)))
        rows = _rows_from_packets(packets)
    else:
        raise SystemExit("provide --review REVIEW.csv or --packets packets.jsonl")
    result = run_eval(provider, rows, max_items=args.max_items)
    write_json(Path(args.output), result["report"])
    if args.judgments:
        write_jsonl(Path(args.judgments), result["judgments"])
    if args.sqlite:
        index_judgments(Path(args.sqlite), result["judgments"])
    print(json.dumps({"ok": True, "output": args.output, "provider": result["report"]["provider"]}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
