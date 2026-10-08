"""Bookmark REVIEW.csv + STATE.jsonl → research-packet v0.

content_access:
  source=preview-only → preview_only
  source=full-text    → transcript  (the gist/post text was present; not speech)
Adapters never claim full_visual. Evidence is only named CSV/JSONL fields that exist.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any

from learning_engine.adapters.common import (
    collect_packet,
    convert_summary,
    empty_convert_report,
    map_status,
    map_verified,
)
from learning_engine.io_util import write_jsonl
from learning_engine.packet import base_packet, claim, evidence_item

REVIEW_HEADER = [
    "id",
    "author",
    "date",
    "gist",
    "category",
    "lesson",
    "usefulness",
    "disposition",
    "verified",
    "links",
    "source",
]


def _resolve_inputs(input_path: Path) -> tuple[Path, Path | None]:
    if input_path.is_dir():
        review = input_path / "REVIEW.csv"
        state = input_path / "STATE.jsonl"
        if not review.is_file():
            raise FileNotFoundError(f"REVIEW.csv not found under {input_path}")
        return review, state if state.is_file() else None
    if input_path.is_file() and input_path.name.endswith(".csv"):
        sibling = input_path.with_name("STATE.jsonl")
        return input_path, sibling if sibling.is_file() else None
    raise FileNotFoundError(f"expected a directory with REVIEW.csv or a CSV path: {input_path}")


def load_state(path: Path | None) -> dict[str, dict[str, Any]]:
    if path is None or not path.is_file():
        return {}
    by_id: dict[str, dict[str, Any]] = {}
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            if isinstance(row, dict) and row.get("id") is not None:
                by_id[str(row["id"])] = row
    return by_id


def _field_present(row: dict[str, str], name: str) -> bool:
    return name in row and row[name] is not None and str(row[name]) != ""


def row_to_packet(row: dict[str, str], state: dict[str, Any] | None, *, input_ref: str) -> dict[str, Any]:
    signal_id = str(row.get("id") or "").strip()
    if not signal_id:
        raise ValueError("REVIEW.csv row missing id")
    source = (row.get("source") or "").strip()
    if source == "preview-only":
        content_access = "preview_only"
        analysis_scope = "preview_only"
    elif source == "full-text":
        content_access = "transcript"
        analysis_scope = "transcript"
    elif source == "":
        content_access = "none"
        analysis_scope = "none"
    else:
        # unknown source value: do not guess a richer access level
        content_access = "none"
        analysis_scope = "none"

    evidence: list[dict[str, Any]] = []
    for field in REVIEW_HEADER:
        if _field_present(row, field):
            evidence.append(
                evidence_item(
                    kind="field",
                    source_ref=f"REVIEW.csv:{field}",
                    note=f"column present on row {signal_id}",
                )
            )
    if state:
        for key in state:
            evidence.append(
                evidence_item(
                    kind="field",
                    source_ref=f"STATE.jsonl:{key}",
                    note="key present on joined STATE row",
                )
            )

    claims: list[dict[str, Any]] = []
    lesson = (row.get("lesson") or "").strip()
    if lesson:
        claims.append(claim(lesson, ["REVIEW.csv:lesson"]))

    scores: dict[str, Any] = {}
    usefulness = (row.get("usefulness") or "").strip()
    if usefulness:
        scores["usefulness"] = usefulness
    if state and "kw_category" in state:
        scores["kw_category"] = state.get("kw_category")
    if "category" in row and row["category"] != "":
        scores["review_category"] = row["category"]

    source_url = (row.get("links") or "").strip() or None
    source_author = (row.get("author") or "").strip() or None
    retrieved_at = (row.get("date") or "").strip() or None
    processing = map_status(str(state.get("status")) if state and "status" in state else None)
    if state is None:
        processing = "unknown"

    return base_packet(
        signal_id=signal_id,
        source_type="bookmark",
        content_access=content_access,
        analysis_scope=analysis_scope,
        source_text=row.get("gist") or "",
        evidence=evidence,
        verification_state=map_verified(row.get("verified")),
        processing_status=processing,
        lifecycle_state="analyzed" if usefulness or lesson else "extracted",
        scores=scores,
        claims=claims,
        source_url=source_url,
        source_author=source_author,
        retrieved_at=retrieved_at,
        adapter="bookmark_review",
        input_ref=input_ref,
        extra={
            "notes": [
                "source_text is the REVIEW.csv gist only; category/lesson/disposition are scores or claims, not directives"
            ]
        },
    )


def convert_report(input_path: Path, *, strict: bool = False) -> dict[str, Any]:
    review_path, state_path = _resolve_inputs(input_path)
    state_by_id = load_state(state_path)
    report = empty_convert_report()
    with review_path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise ValueError("REVIEW.csv has no header")
        for index, row in enumerate(reader, start=2):
            sid = str(row.get("id") or "").strip() or f"row-{index}"
            ok = collect_packet(
                report,
                f"{review_path}:{sid}",
                lambda r=row, s=sid: row_to_packet(
                    {k: (v if v is not None else "") for k, v in r.items()},
                    state_by_id.get(s),
                    input_ref=str(review_path),
                ),
                strict=strict,
            )
            if strict and not ok:
                break
    return report


def convert(input_path: Path, *, strict: bool = False) -> list[dict[str, Any]]:
    return convert_report(input_path, strict=strict)["packets"]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Convert REVIEW.csv + STATE.jsonl into packets")
    parser.add_argument("--input", required=True, help="Directory with REVIEW.csv, or path to REVIEW.csv")
    parser.add_argument("--output", required=True, help="JSONL output path")
    parser.add_argument("--strict", action="store_true", help="Fail on the first invalid packet")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = convert_report(Path(args.input), strict=args.strict)
    n = write_jsonl(Path(args.output), report["packets"])
    summary = convert_summary("bookmark_review", report, args.output)
    summary["packets"] = n
    print(json.dumps(summary))
    if args.strict and report["invalid"]:
        return 1
    return 0 if report["packets"] or not report["invalid"] else 1


if __name__ == "__main__":
    sys.exit(main())
