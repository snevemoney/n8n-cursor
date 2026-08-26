#!/usr/bin/env python3
"""Validate and append hive knowledge atoms (jsonl). Does not crawl the 146."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE = ROOT / "docs/hive/outer-heaven/CONTENT/knowledge"
ATOMS_DIR = KNOWLEDGE / "atoms" / "by-video"
SCHEMA_PATH = KNOWLEDGE / "atoms" / "schema.json"

REQUIRED = (
    "id",
    "version",
    "concept",
    "claim",
    "reasoning",
    "mechanism",
    "evidence",
    "conditions",
    "exceptions",
    "action",
    "confidence",
    "evidence_type",
    "knowledge_type",
    "modality",
    "evidence_status",
    "source_video_id",
    "timestamp",
    "speaker",
    "domain",
    "stage",
    "objective",
    "requires",
    "before",
    "conflicts_with",
    "supports",
    "layer_tag",
)

KNOWLEDGE_TYPES = frozenset({"declared", "demonstrated", "implicit", "synthesis"})
MODALITIES = frozenset(
    {"speech", "screen", "click", "navigation", "visual", "timing", "failure", "edit-signal"}
)
EVIDENCE_STATUS = frozenset({"observed", "transcript-implied", "unobserved", "UNKNOWN"})
LAYER_TAGS = frozenset({"SOURCE", "INFERENCE", "SYNTHESIS"})
EVIDENCE_TYPES = frozenset(
    {"quote", "demo", "metric", "anecdote", "failure", "edit-signal", "unknown"}
)
LIST_FIELDS = frozenset({"requires", "before", "conflicts_with", "supports"})


def load_objects(path: Path) -> list[dict[str, Any]]:
    text = path.read_text().strip()
    if not text:
        return []
    if path.suffix == ".json" and not path.name.endswith(".jsonl"):
        data = json.loads(text)
        if isinstance(data, list):
            return [x for x in data if isinstance(x, dict)]
        if isinstance(data, dict):
            return [data]
        raise SystemExit(f"unsupported JSON in {path}")
    out: list[dict[str, Any]] = []
    for i, line in enumerate(text.splitlines(), 1):
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{path}:{i}: {exc}") from exc
        if not isinstance(obj, dict):
            raise SystemExit(f"{path}:{i}: expected object")
        out.append(obj)
    return out


def validate_atom(obj: dict[str, Any], *, caption_only: bool) -> list[str]:
    errors: list[str] = []
    missing = [k for k in REQUIRED if k not in obj]
    if missing:
        errors.append(f"missing {missing}")
    if obj.get("knowledge_type") not in KNOWLEDGE_TYPES:
        errors.append(f"knowledge_type {obj.get('knowledge_type')!r}")
    if obj.get("modality") not in MODALITIES:
        errors.append(f"modality {obj.get('modality')!r}")
    if obj.get("evidence_status") not in EVIDENCE_STATUS:
        errors.append(f"evidence_status {obj.get('evidence_status')!r}")
    if obj.get("layer_tag") not in LAYER_TAGS:
        errors.append(f"layer_tag {obj.get('layer_tag')!r}")
    if obj.get("evidence_type") not in EVIDENCE_TYPES:
        errors.append(f"evidence_type {obj.get('evidence_type')!r}")
    if not isinstance(obj.get("version"), int) or obj["version"] < 1:
        errors.append("version must be int >= 1")
    for key in LIST_FIELDS:
        if key in obj and not isinstance(obj[key], list):
            errors.append(f"{key} must be a list")
    if caption_only:
        clickish = obj.get("modality") in {"click", "screen", "navigation", "visual"}
        if clickish and obj.get("evidence_status") == "observed":
            errors.append(
                "caption-only: click/screen/navigation/visual cannot be evidence_status=observed"
            )
    return errors


def emit(video_id: str, atoms: list[dict[str, Any]], *, dry_run: bool) -> Path:
    dest = ATOMS_DIR / f"{video_id}.jsonl"
    if dry_run:
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    existing_ids: set[str] = set()
    if dest.exists():
        for row in load_objects(dest):
            existing_ids.add(str(row.get("id", "")))
    with dest.open("a") as fh:
        for atom in atoms:
            aid = str(atom.get("id", ""))
            if aid in existing_ids:
                raise SystemExit(f"duplicate atom id already on disk: {aid}")
            fh.write(json.dumps(atom, ensure_ascii=False) + "\n")
            existing_ids.add(aid)
    return dest


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Validate/append knowledge atoms. Does not scan the 146 packets."
    )
    parser.add_argument("--file", type=Path, help="JSON or JSONL of atom object(s)")
    parser.add_argument("--video-id", help="Target by-video/{id}.jsonl (required to append)")
    parser.add_argument("--validate", action="store_true", help="Validate only; do not write")
    parser.add_argument("--schema", action="store_true", help="Print schema path and required fields")
    parser.add_argument(
        "--caption-only",
        action="store_true",
        default=True,
        help="Reject observed click/visual atoms (default: on)",
    )
    parser.add_argument(
        "--full-video",
        action="store_true",
        help="Allow evidence_status=observed on visual/click (HITL later)",
    )
    args = parser.parse_args()
    caption_only = not args.full_video

    if args.schema:
        print(SCHEMA_PATH)
        print("required:", ", ".join(REQUIRED))
        return

    if args.file is None:
        parser.error("nothing to do: pass --file or --schema (will not crawl packets/)")

    atoms = load_objects(args.file)
    if not atoms:
        raise SystemExit(f"no atoms in {args.file}")

    failed = 0
    for i, atom in enumerate(atoms, 1):
        errs = validate_atom(atom, caption_only=caption_only)
        if args.video_id and atom.get("source_video_id") not in (None, args.video_id):
            errs.append(f"source_video_id {atom.get('source_video_id')!r} != --video-id")
        if errs:
            failed += 1
            print(f"atom[{i}] {atom.get('id', '?')}: {'; '.join(errs)}", file=sys.stderr)

    if failed:
        raise SystemExit(f"FAIL {failed}/{len(atoms)}")

    if args.validate or not args.video_id:
        print(f"OK {len(atoms)} atom(s)")
        return

    dest = emit(args.video_id, atoms, dry_run=False)
    print(dest)


if __name__ == "__main__":
    main()
