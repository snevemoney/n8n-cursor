#!/usr/bin/env python3
"""Verify business-lanes.json stays in sync with BUSINESS_CATALOG operating rows."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
LANES_PATH = ROOT / "scripts/hive/business-lanes.json"
PS_DIR = ROOT / "scripts/hive/product-state"
PL_DIR = ROOT / "scripts/hive/lane-pl"


def check() -> list[str]:
    errors: list[str] = []
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    lanes_data = json.loads(LANES_PATH.read_text(encoding="utf-8"))

    entries = {e["id"]: e for e in catalog.get("entries", [])}
    lane_entries = {
        e.get("lane_id"): e
        for e in catalog.get("entries", [])
        if e.get("lifecycle") == "operating" and e.get("lane_id")
    }

    active_lanes = [l for l in lanes_data.get("lanes", []) if l.get("status") == "active"]
    active_ids = {l["id"] for l in active_lanes}

    for lane in active_lanes:
        lid = lane["id"]
        cat_id = lane.get("catalog_id") or f"lane__{lid}"
        if cat_id not in entries:
            errors.append(f"lane {lid}: catalog_id {cat_id} missing from catalog")
            continue
        cat = entries[cat_id]
        if cat.get("lifecycle") != "operating":
            errors.append(f"lane {lid}: catalog entry {cat_id} lifecycle={cat.get('lifecycle')} not operating")
        if cat.get("lane_id") != lid:
            errors.append(f"lane {lid}: catalog lane_id back-link mismatch ({cat.get('lane_id')})")

        ps = lane.get("product_state")
        if ps and ps not in ("clipengine", "operator", "proofcheck", "sentinel", "trendspotter"):
            if not (PS_DIR / f"{ps}.json").is_file():
                errors.append(f"lane {lid}: product-state file missing scripts/hive/product-state/{ps}.json")

        if not (PL_DIR / f"{lid}.json").is_file() and lid in ("ai-partner-websites", "amazon-own-store", "hive-os"):
            pass  # grandfathered may exist
        elif lane.get("catalog_id") and not (PL_DIR / f"{lid}.json").is_file():
            errors.append(f"lane {lid}: lane-pl stub missing scripts/hive/lane-pl/{lid}.json")

    for lid, cat in lane_entries.items():
        if lid not in active_ids:
            errors.append(f"catalog operating {cat['id']} lane_id={lid} not active in business-lanes.json")

    # Orphan catalog lane__ rows
    for e in catalog.get("entries", []):
        if e.get("id", "").startswith("lane__") and e.get("lifecycle") == "operating":
            lid = e.get("lane_id") or e["id"].replace("lane__", "")
            if lid not in active_ids:
                errors.append(f"catalog lane row {e['id']} operating but lane {lid} not active")

    return errors


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    errors = check()
    if args.json:
        print(json.dumps({"ok": not errors, "errors": errors}, indent=2))
    elif errors:
        print("FAIL: catalog-lanes sync", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
    else:
        print("OK: business-lanes.json ↔ BUSINESS_CATALOG in sync")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
