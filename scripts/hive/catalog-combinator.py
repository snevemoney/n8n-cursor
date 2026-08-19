#!/usr/bin/env python3
"""Expand BUSINESS_CATALOG with compatibility filter — skip nonsense machine×icp pairs."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
TYPES_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/business-types.json"

DEFAULT_GEOS = ["Greater Montreal", "Toronto", "remote", "US-remote"]

# machine -> allowed icp_ids (None = use machine's icps from business-types)
COMPAT: dict[str, list[str] | None] = {
    "review-to-book": ["local-clinic"],
    "clip-factory": ["creator-longform", "us"],
    "private-book-install": ["local-pro", "owner-coach-fitness", "law-adj", "restaurant"],
    "missed-call-book": ["restaurant", "local-pro"],
    "orchestrated-site-brief": ["exec-coach", "us"],
    "client-delivery-kit": ["agency-delivery"],
    "list-anneal": ["industrial-smb", "mktg-software"],
    "product-ad-from-photo": ["dropship", "amazon-own-store", "us"],
    "inbox-to-task-routing": ["us", "hive-os"],
    "invoice-email-automation": ["agency-delivery"],
    "meeting-to-task-routing": ["agency-delivery", "us"],
    "meeting-deck": ["exec-coach", "agency-delivery", "local-pro", "local-clinic"],
    "howto-deck": ["us", "creator-longform"],
    "folder-to-deck": ["us", "agency-delivery", "exec-coach"],
    "motion-pipeline": ["us"],
    "wiki-ingest": ["us"],
    "demand-validate": ["us"],
}

SKIP_ICPS_FOR_CLIENT_MACHINES = {"us", "dropship", "amazon-own-store", "hive-os"}


def _allowed_icps(machine: str, meta: dict, all_icps: list[str]) -> list[str]:
    if machine in COMPAT:
        allowed = COMPAT[machine]
        if allowed is not None:
            return allowed
    meta_icps = meta.get("icps")
    if meta_icps:
        return list(meta_icps)
    # client-service machines should not cross to internal icps
    if machine in ("review-to-book", "private-book-install", "missed-call-book"):
        return [i for i in all_icps if i not in SKIP_ICPS_FOR_CLIENT_MACHINES and i != "us"]
    return all_icps


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--target", type=int, default=500)
    ap.add_argument("--geos", nargs="*", default=DEFAULT_GEOS)
    args = ap.parse_args()

    if not CATALOG_PATH.is_file():
        raise SystemExit("Run migrate-business-catalog.py first")

    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    types_data = json.loads(TYPES_PATH.read_text(encoding="utf-8"))
    entries = catalog.get("entries", [])
    seen = {e["id"] for e in entries}

    machines = list(types_data.get("machines", {}).keys())
    all_icps = [i["id"] for i in types_data.get("icps", [])]

    added = 0
    skipped = 0
    for machine in machines:
        meta = types_data.get("machines", {}).get(machine, {})
        icps = _allowed_icps(machine, meta, all_icps)
        for icp_id in icps:
            for geo in args.geos:
                cid = f"{machine}__{icp_id}__{geo.replace(' ', '-').lower()}"
                if cid in seen:
                    continue
                seen.add(cid)
                entries.append(
                    {
                        "id": cid,
                        "name": f"{machine} — {icp_id} ({geo})",
                        "parent_model_id": machine,
                        "machine": machine,
                        "icp_id": icp_id,
                        "geo": geo,
                        "type": "client-service" if icp_id not in SKIP_ICPS_FOR_CLIENT_MACHINES else "operator-run",
                        "lifecycle": "catalog",
                        "lane_id": None,
                        "research_depth": "thin",
                        "primary_agents_default": [],
                        "pilot": {"status": "none", "path": None},
                        "source": "catalog-combinator",
                    }
                )
                added += 1
                if len(entries) >= args.target:
                    break
            if len(entries) >= args.target:
                break
        if len(entries) >= args.target:
            break

    catalog["entries"] = entries[: args.target] if args.target else entries
    catalog["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    catalog["stats"] = {
        "total": len(catalog["entries"]),
        "operating": sum(1 for e in catalog["entries"] if e.get("lifecycle") == "operating"),
        "catalog": sum(1 for e in catalog["entries"] if e.get("lifecycle") == "catalog"),
        "combinator_added": added,
        "combinator_skipped_incompatible": skipped,
    }

    if args.write:
        CATALOG_PATH.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
        print(f"Wrote {len(catalog['entries'])} entries (+{added})")
    else:
        print(json.dumps(catalog["stats"], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
