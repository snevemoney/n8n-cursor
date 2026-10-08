"""learning-engine CLI: adapt / validate / eval / store."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.io_util import read_jsonl, write_json, write_jsonl
from learning_engine.storage.sqlite_index import index_packets
from learning_engine.validator import count_false_full_visual, validate_packet
from learning_engine.errors import PacketValidationError


def cmd_adapt(args: argparse.Namespace) -> int:
    input_path = Path(args.input)
    strict = bool(getattr(args, "strict", False))
    if args.kind == "bookmark":
        report = bookmark_review.convert_report(input_path, strict=strict)
        adapter = "bookmark_review"
    elif args.kind == "corpus":
        report = corpus_reingest.convert_report(input_path, strict=strict)
        adapter = "corpus_reingest"
    elif args.kind in {"youtube-l2", "youtube_l2"}:
        report = youtube_l2.convert_report(input_path, strict=strict)
        adapter = "youtube_l2"
    else:
        raise SystemExit(f"unknown adapter {args.kind}")
    n = write_jsonl(Path(args.output), report["packets"])
    print(
        json.dumps(
            {
                "ok": True,
                "adapter": adapter,
                "packets": n,
                "invalid": len(report["invalid"]),
                "invalid_items": report["invalid"],
                "output": args.output,
            }
        )
    )
    if strict and report["invalid"]:
        return 1
    return 0 if report["packets"] or not report["invalid"] else 1


def cmd_validate(args: argparse.Namespace) -> int:
    packets = list(read_jsonl(Path(args.input)))
    errors: list[str] = []
    valid: list[dict[str, Any]] = []
    for i, packet in enumerate(packets):
        try:
            valid.append(validate_packet(packet, path=f"$[{i}]"))
        except PacketValidationError as exc:
            errors.append(str(exc))
    false_fv = count_false_full_visual(packets)
    report = {
        "ok": not errors and false_fv == 0 and len(valid) >= args.min_packets,
        "packets": len(packets),
        "valid": len(valid),
        "false_full_visual": false_fv,
        "min_packets": args.min_packets,
        "errors": errors,
    }
    if args.output:
        write_json(Path(args.output), report)
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 1


def cmd_store(args: argparse.Namespace) -> int:
    packets = list(read_jsonl(Path(args.packets)))
    n = index_packets(Path(args.sqlite), packets)
    print(json.dumps({"ok": True, "indexed": n, "sqlite": args.sqlite}))
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="learning-engine")
    sub = parser.add_subparsers(dest="cmd", required=True)

    adapt = sub.add_parser("adapt", help="Run an adapter")
    adapt.add_argument("kind", choices=["bookmark", "corpus", "youtube-l2"])
    adapt.add_argument("--input", required=True)
    adapt.add_argument("--output", required=True)
    adapt.add_argument("--strict", action="store_true", help="Fail on the first invalid packet")
    adapt.set_defaults(func=cmd_adapt)

    validate = sub.add_parser("validate", help="Validate packet JSONL")
    validate.add_argument("--input", required=True)
    validate.add_argument("--output", help="Optional JSON report")
    validate.add_argument("--min-packets", type=int, default=0)
    validate.set_defaults(func=cmd_validate)

    store = sub.add_parser("store", help="Index packets into SQLite")
    store.add_argument("--packets", required=True)
    store.add_argument("--sqlite", required=True)
    store.set_defaults(func=cmd_store)

    return parser


def main(argv: list[str] | None = None) -> int:
    # eval is implemented in stage_c.harness to keep live flags in one place
    if argv is None:
        argv = sys.argv[1:]
    if argv and argv[0] == "eval":
        from learning_engine.stage_c.harness import main as harness_main

        return harness_main(argv[1:])
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    sys.exit(main())
