#!/usr/bin/env python3
"""Filter one product-factory key. Append one roadblock row after a mess.

Usage:
  python3 scripts/hive/product-factory.py get --key primitives
  python3 scripts/hive/product-factory.py get --key roadblocks
  python3 scripts/hive/product-factory.py get --key promotion
  python3 scripts/hive/product-factory.py get --primitive login
  python3 scripts/hive/product-factory.py add-roadblock --id rb-... --date 2026-08-15 \\
    --symptom "..." --cause "..." --never-again "..." --source "path" \\
    --related-primitive payments --status open
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PF = ROOT / "docs/hive/outer-heaven/CONTENT/knowledge/product-factory"
PRIMITIVES = PF / "primitives.json"
ROADBLOCKS = PF / "roadblocks.json"
PROMOTION = PF / "PROMOTION.md"
ALLOWED = ("primitives", "roadblocks", "promotion")
PRIMITIVE_IDS = ("login", "payments", "social-share", "promotion")
RB_STATUSES = ("open", "recorded", "stale")
RELATED = (*PRIMITIVE_IDS, "none")


def _load(path: Path) -> dict:
    if not path.is_file():
        raise SystemExit(f"missing {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def cmd_get(args: argparse.Namespace) -> int:
    if args.primitive:
        data = _load(PRIMITIVES)
        rows = [p for p in data.get("primitives") or [] if p.get("id") == args.primitive]
        if not rows:
            print(f"refuse: no primitive {args.primitive}", file=sys.stderr)
            return 2
        print(json.dumps(rows[0], indent=2))
        return 0
    if args.key not in ALLOWED:
        print(f"refuse: key must be one of {', '.join(ALLOWED)}", file=sys.stderr)
        return 2
    if args.key == "promotion":
        print(PROMOTION.read_text(encoding="utf-8"))
        return 0
    path = PRIMITIVES if args.key == "primitives" else ROADBLOCKS
    print(json.dumps(_load(path), indent=2))
    return 0


def cmd_add_roadblock(args: argparse.Namespace) -> int:
    data = _load(ROADBLOCKS)
    rows = list(data.get("roadblocks") or [])
    if any(r.get("id") == args.id for r in rows):
        print(f"refuse: id {args.id} already exists", file=sys.stderr)
        return 2
    related = None if args.related_primitive in (None, "none") else args.related_primitive
    row = {
        "id": args.id,
        "date": args.date,
        "symptom": args.symptom,
        "cause": args.cause,
        "never_again": args.never_again,
        "related_primitive": related,
        "source": args.source,
        "status": args.status,
    }
    rows.append(row)
    data["roadblocks"] = rows
    data["updated"] = date.today().isoformat()
    _save(ROADBLOCKS, data)
    print(json.dumps(row, indent=2))
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Filter one product-factory key. Never dump state.json.")
    sub = ap.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("get", help="Print one registry slice")
    g.add_argument("--key", choices=ALLOWED)
    g.add_argument("--primitive", choices=PRIMITIVE_IDS)

    a = sub.add_parser("add-roadblock", help="Append one JSON row after a mess")
    a.add_argument("--id", required=True)
    a.add_argument("--date", required=True)
    a.add_argument("--symptom", required=True)
    a.add_argument("--cause", required=True)
    a.add_argument("--never-again", required=True, dest="never_again")
    a.add_argument("--source", required=True)
    a.add_argument("--related-primitive", choices=RELATED, default="none")
    a.add_argument("--status", choices=RB_STATUSES, default="open")

    args = ap.parse_args()
    if args.cmd == "get":
        if not args.key and not args.primitive:
            print("refuse: pass --key or --primitive", file=sys.stderr)
            return 2
        return cmd_get(args)
    if args.cmd == "add-roadblock":
        return cmd_add_roadblock(args)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
