"""learning-engine CLI: adapt / validate / eval / store."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters import bookmark_review, corpus_reingest, youtube_l2
from learning_engine.adapters.common import convert_summary
from learning_engine.io_util import read_jsonl, write_json, write_jsonl
from learning_engine.constants import DISK_CHECK_SKIPPED
from learning_engine.storage.sqlite_index import index_packets, rebuild_from_jsonl
from learning_engine.validator import FULL_VISUAL_NEEDS_ROOT, count_false_full_visual, validate_packet
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
    summary = convert_summary(adapter, report, args.output, strict=strict)
    summary["packets"] = n
    print(json.dumps(summary))
    if strict and report["invalid"]:
        return 1
    return 0 if report["packets"] or not report["invalid"] else 1


def _emit_cli_error(exc: BaseException, *, path: Path | str | None = None) -> int:
    payload: dict[str, Any] = {"ok": False, "error": str(exc)}
    src = getattr(exc, "path", None) or path
    if src is not None:
        payload["path"] = str(src)
    line = getattr(exc, "line", None)
    if line is not None:
        payload["line"] = line
    warning = getattr(exc, "cleanup_warning", None)
    if warning:
        payload["cleanup_warning"] = warning
    print(json.dumps(payload, ensure_ascii=False), file=sys.stderr)
    return 1


def cmd_validate(args: argparse.Namespace) -> int:
    input_path = Path(args.input)
    try:
        packets = list(read_jsonl(input_path))
    except Exception as exc:
        return _emit_cli_error(exc, path=input_path)
    errors: list[str] = []
    warnings: list[str] = []
    valid: list[dict[str, Any]] = []
    root = Path(args.root) if getattr(args, "root", None) else None
    if root is None:
        warnings.append(DISK_CHECK_SKIPPED)
    for i, packet in enumerate(packets):
        try:
            valid.append(validate_packet(packet, path=f"$[{i}]", root=root, warnings=warnings))
        except PacketValidationError as exc:
            errors.append(str(exc))
    fv_needs_root = root is None and any(FULL_VISUAL_NEEDS_ROOT in err for err in errors)
    false_fv: Any
    if fv_needs_root:
        false_fv = "unchecked_no_root"
    else:
        false_fv = count_false_full_visual(packets, root=root)
    report = {
        "ok": not errors and false_fv == 0 and len(valid) >= args.min_packets,
        "packets": len(packets),
        "valid": len(valid),
        "false_full_visual": false_fv,
        "min_packets": args.min_packets,
        "errors": errors,
        "warnings": warnings,
    }
    if args.output:
        try:
            write_json(Path(args.output), report)
        except Exception as exc:
            return _emit_cli_error(exc, path=args.output)
    print(json.dumps(report, indent=2))
    return 0 if report["ok"] else 1


def cmd_store(args: argparse.Namespace) -> int:
    sqlite_path = Path(args.sqlite)
    packets_path = Path(args.packets)
    try:
        if getattr(args, "rebuild", False):
            summary = rebuild_from_jsonl(sqlite_path, packets_path)
            print(json.dumps(summary))
            return 0 if summary.get("ok") else 1
        packets = list(read_jsonl(packets_path))
        n = index_packets(sqlite_path, packets)
        print(json.dumps({"ok": True, "indexed": n, "sqlite": args.sqlite}))
        return 0
    except Exception as exc:
        return _emit_cli_error(exc, path=packets_path)


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
    validate.add_argument("--root", help="Evidence root; image/video refs must exist on disk")
    validate.set_defaults(func=cmd_validate)

    store = sub.add_parser("store", help="Index packets into SQLite (derived; JSONL is source of truth)")
    store.add_argument("--packets", required=True)
    store.add_argument("--sqlite", required=True)
    store.add_argument(
        "--rebuild",
        action="store_true",
        help="Replace packet rows only for source_types present in the JSONL; leave other types and judgments",
    )
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
