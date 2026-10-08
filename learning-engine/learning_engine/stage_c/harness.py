"""Stage C evaluation harness.

Reports recall, precision, high-only recall, counts, per-item latency and cost
as JSON, for all rows and DONE-only rows, plus the same slices excluding
packets flagged caption_gap / transcript_disagreement / transcript_quality.
"""

from __future__ import annotations

import argparse
import json
import sqlite3
import sys
import uuid
from pathlib import Path
from typing import Any

from learning_engine.constants import (
    KEYWORD_REPLAY_KIND,
    KEYWORD_REPLAY_REFERENCE,
    LIVE_MAX_ITEMS_DEFAULT,
    SOURCE_TEXT_UNAVAILABLE,
)
from learning_engine.errors import IndexSchemaError, LockedError, ProviderRefused
from learning_engine.io_util import read_jsonl, write_json, write_jsonl
from learning_engine.network import require_live_call
from learning_engine.stage_c.contract import Judgment, Provider, evaluate
from learning_engine.stage_c.providers.jev import KEY_ENV as JEV_KEY_ENV
from learning_engine.stage_c.providers.openai_decisions import KEY_ENV as OPENAI_KEY_ENV
from learning_engine.stage_c.labelled import labelled_to_packet, load_labelled
from learning_engine.stage_c.metrics import score_rows, split_done, split_held_out
from learning_engine.stage_c.providers.jev import JevOpenRouterProvider
from learning_engine.stage_c.providers.keyword import KeywordReplayProvider, KeywordRulesProvider
from learning_engine.stage_c.providers.lexicon import LexiconProvider
from learning_engine.stage_c.providers.openai_decisions import OpenAIDecisionsProvider
from learning_engine.storage.sqlite_index import index_harness_result, index_judgments, start_run

PACKET_FLAGS = ("caption_gap", "transcript_disagreement", "transcript_quality")


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


def apply_live_max_items(opt_in_live: bool, max_items: int | None) -> int | None:
    if opt_in_live and max_items is None:
        return LIVE_MAX_ITEMS_DEFAULT
    return max_items


def reviewer_summary(packet: dict[str, Any]) -> str:
    derived = packet.get("derived") if isinstance(packet.get("derived"), dict) else {}
    return str(derived.get("reviewer_summary") or "")


def provider_reads_reviewer_summary(provider: Provider) -> bool:
    reads = getattr(provider, "reads", ("source_text",))
    return any(token in {"reviewer_summary", "derived.reviewer_summary"} for token in reads)


def is_leaky_run(provider: Provider, packets: list[dict[str, Any]]) -> bool:
    if not provider_reads_reviewer_summary(provider):
        return False
    return any(reviewer_summary(p) for p in packets)


def packet_flag_names(packet: dict[str, Any]) -> list[str]:
    flags: list[str] = []
    if packet.get("caption_gap"):
        flags.append("caption_gap")
    if packet.get("transcript_disagreement"):
        flags.append("transcript_disagreement")
    if packet.get("transcript_quality"):
        flags.append("transcript_quality")
    if packet.get("injection_suspect"):
        flags.append("injection_suspect")
    return flags


def provider_source_text_unavailable(provider: Provider, packets: list[dict[str, Any]]) -> bool:
    reads = getattr(provider, "reads", ("source_text",))
    if "source_text" not in reads:
        return False
    if not packets:
        return False
    return all(not str(packet.get("source_text") or "").strip() for packet in packets)


def not_applicable_slice(n: int) -> dict[str, Any]:
    return {"n": n, "status": SOURCE_TEXT_UNAVAILABLE}


def flag_counts(packets: list[dict[str, Any]]) -> dict[str, int]:
    counts = {name: 0 for name in (*PACKET_FLAGS, "injection_suspect")}
    for packet in packets:
        for name in packet_flag_names(packet):
            counts[name] = counts.get(name, 0) + 1
    return counts


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
    run_id: str | None = None,
) -> dict[str, Any]:
    selected = rows[:max_items] if max_items is not None else rows
    judged: list[dict[str, Any]] = []
    items: list[dict[str, Any]] = []
    packets: list[dict[str, Any]] = []
    rid = run_id or str(uuid.uuid4())
    for row in selected:
        packet = row.get("packet") or labelled_to_packet(row)
        packets.append(packet)
        judgment: Judgment = evaluate(provider, packet)
        payload = judgment.to_json()
        payload["run_id"] = rid
        payload["source_type"] = packet.get("source_type")
        judged.append(payload)
        flags = packet_flag_names(packet)
        items.append(
            {
                "signal_id": row.get("signal_id"),
                "usefulness": row.get("usefulness"),
                "status": row.get("status"),
                "flagged": judgment.flagged,
                "label": judgment.label,
                "latency_ms": judgment.latency_ms,
                "cost_usd": judgment.cost_usd if judgment.cost_usd is not None else 0.0,
                "packet_flags": flags,
            }
        )
    all_rows, done_rows = split_done(items)
    unflagged = [r for r in items if not r.get("packet_flags")]
    done_unflagged = [r for r in done_rows if not r.get("packet_flags")]
    leaky = is_leaky_run(provider, packets)
    kind = getattr(provider, "kind", None)
    if kind is None and getattr(provider, "name", "") == "keyword_replay":
        kind = KEYWORD_REPLAY_KIND
    unavailable = provider_source_text_unavailable(provider, packets)
    report: dict[str, Any] = {
        "provider": getattr(provider, "name", "unknown"),
        "run_id": rid,
        "n_input": len(rows),
        "n_scored": len(items),
        "leaky": leaky,
        "flagged_packets": flag_counts(packets),
        "items": items,
    }
    if unavailable:
        report["status"] = SOURCE_TEXT_UNAVAILABLE
        report["all"] = not_applicable_slice(len(all_rows))
        report["done_only"] = not_applicable_slice(len(done_rows))
        report["all_excluding_flagged"] = not_applicable_slice(len(unflagged))
        report["done_only_excluding_flagged"] = not_applicable_slice(len(done_unflagged))
    else:
        report["all"] = score_rows(all_rows)
        report["done_only"] = score_rows(done_rows)
        report["all_excluding_flagged"] = score_rows(unflagged)
        report["done_only_excluding_flagged"] = score_rows(done_unflagged)
    if kind:
        report["provider_kind"] = kind
    if getattr(provider, "name", "") == "keyword_replay":
        report["reference"] = dict(KEYWORD_REPLAY_REFERENCE)
    if leaky:
        report["leaky_label"] = "LEAKY"
        report["leaky_reason"] = "provider reads derived.reviewer_summary (reviewer-authored, not source)"
    if getattr(provider, "name", "") == "lexicon_gate":
        dev, held = split_held_out(items)
        if unavailable:
            report["dev"] = not_applicable_slice(len(dev))
            report["held_out"] = not_applicable_slice(len(held))
        else:
            report["dev"] = score_rows(dev)
            report["held_out"] = score_rows(held)
        report["split"] = {"seed": 0, "train_frac": 0.7, "dev_n": len(dev), "held_out_n": len(held)}
    return {"report": report, "judgments": judged, "run_id": rid}


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
    parser.add_argument("--run-id", help="Optional run id (default: new uuid)")
    parser.add_argument("--opt-in-live", action="store_true", help="Required for Jev / OpenAI")
    parser.add_argument("--max-items", type=int, default=None, help="Hard cap on scored items")
    parser.add_argument("--max-input-tokens", type=int, default=4000, help="Hard cap per live call")
    return parser


def _live_key_env(provider: str) -> str | None:
    key = provider.strip().lower()
    if key in {"jev", "jev_openrouter"}:
        return JEV_KEY_ENV
    if key in {"openai", "openai_decisions"}:
        return OPENAI_KEY_ENV
    return None


def _refuse(message: str) -> int:
    print(json.dumps({"ok": False, "error": message}), file=sys.stderr)
    return 2


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    live_key = _live_key_env(args.provider)
    if live_key is not None:
        if not args.opt_in_live:
            return _refuse("live provider refused: pass --opt-in-live")
        try:
            require_live_call(flag=True, env_var=live_key)
        except ProviderRefused as exc:
            return _refuse(str(exc))
    max_items = apply_live_max_items(bool(args.opt_in_live), args.max_items)
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
    try:
        result = run_eval(provider, rows, max_items=max_items, run_id=args.run_id)
        if args.sqlite:
            start_run(Path(args.sqlite), result["run_id"], provider=result["report"]["provider"])
            index_judgments(Path(args.sqlite), result["judgments"], run_id=result["run_id"])
            index_harness_result(Path(args.sqlite), result["run_id"], result["report"])
    except ProviderRefused as exc:
        return _refuse(str(exc))
    except LockedError as exc:
        payload: dict[str, Any] = {"ok": False, "error": "locked"}
        if exc.path:
            payload["path"] = exc.path
        print(json.dumps(payload, ensure_ascii=False), file=sys.stderr)
        return 1
    except (IndexSchemaError, sqlite3.OperationalError) as exc:
        print(json.dumps({"ok": False, "error": str(exc)}), file=sys.stderr)
        return 1
    write_json(Path(args.output), result["report"])
    if args.judgments:
        write_jsonl(Path(args.judgments), result["judgments"])
    summary = {
        "ok": True,
        "output": args.output,
        "provider": result["report"]["provider"],
        "run_id": result["run_id"],
        "leaky": result["report"].get("leaky", False),
    }
    if result["report"].get("provider_kind"):
        summary["provider_kind"] = result["report"]["provider_kind"]
    if result["report"].get("leaky"):
        summary["leaky_label"] = "LEAKY"
    print(json.dumps(summary))
    return 0


if __name__ == "__main__":
    sys.exit(main())
