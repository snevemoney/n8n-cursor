#!/usr/bin/env python3
"""Backfill BUSINESS_CATALOG.json from business-lanes.json + business-types.json."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LANES_PATH = ROOT / "scripts/hive/business-lanes.json"
TYPES_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/watch-later/business-types.json"
OUT_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"

MACHINE_AGENTS: dict[str, list[str]] = {
    "review-to-book": ["Lead Hunter", "Consultant", "Forge", "Communications Manager"],
    "clip-factory": ["Publishing Engine", "Creative Studio", "Lead Hunter"],
    "private-book-install": ["Lead Hunter", "Consultant", "Forge", "Watchdog"],
    "orchestrated-site-brief": ["Consultant", "Forge", "Creative Studio", "Product GTM"],
    "product-ad-from-photo": ["Creative Studio", "Publishing Engine", "Money Desk"],
    "inbox-to-task-routing": ["Communications Manager", "Day Planner", "Big Boss"],
    "invoice-email-automation": ["Money Desk", "Communications Manager", "HITL Operator"],
    "meeting-to-task-routing": ["Day Planner", "Consultant", "Communications Manager"],
    "folder-to-deck": ["Consultant", "Creative Studio", "Product GTM"],
    "meeting-deck": ["Consultant", "Creative Studio", "Product GTM"],
    "howto-deck": ["Publishing Engine", "Creative Studio", "Product GTM"],
    "list-anneal": ["Lead Hunter", "Researcher", "Consultant"],
    "motion-pipeline": ["Creative Studio", "Forge"],
    "default": ["Big Boss", "Consultant", "Forge"],
}

MACHINE_TYPE: dict[str, str] = {
    "demand-validate": "meta",
    "morning-ceo-desk": "operator-run",
    "wiki-ingest": "meta",
    "agent-job-card": "meta",
    "session-bootstrap": "meta",
    "golden-test-loop": "meta",
    "click-live-site": "meta",
    "paid-slice": "operator-run",
    "clip-factory": "operator-run",
    "folder-to-deck": "client-service",
    "product-ad-from-photo": "operator-run",
    "inbox-to-task-routing": "operator-run",
    "invoice-email-automation": "client-service",
}


def _agents_for(machine: str) -> list[str]:
    return MACHINE_AGENTS.get(machine, MACHINE_AGENTS["default"])


def _type_for(machine: str, icp_id: str) -> str:
    if icp_id == "us":
        return "meta" if machine in ("wiki-ingest", "agent-job-card", "session-bootstrap") else "operator-run"
    return MACHINE_TYPE.get(machine, "client-service")


def main() -> int:
    lanes_data = json.loads(LANES_PATH.read_text(encoding="utf-8"))
    types_data = json.loads(TYPES_PATH.read_text(encoding="utf-8"))
    entries: list[dict] = []
    seen: set[str] = set()

    for lane in lanes_data.get("lanes", []):
        lid = lane["id"]
        lifecycle = "operating" if lane.get("status") == "active" else "catalog"
        if lane.get("status") == "planned":
            lifecycle = "catalog"
        if lane.get("status") == "reserved":
            lifecycle = "catalog"
        entry = {
            "id": f"lane__{lid}",
            "name": lane.get("name", lid),
            "parent_model_id": lid,
            "machine": "portfolio-lane",
            "icp_id": None,
            "geo": "remote",
            "type": "operator-run" if lid in ("hive-os", "amazon-own-store") else "client-service",
            "lifecycle": lifecycle,
            "lane_id": lid if lifecycle == "operating" else None,
            "research_depth": "ready" if lifecycle == "operating" else "thin",
            "primary_agents_default": lane.get("primary_agents", []),
            "product_state": lane.get("product_state", "operator"),
            "pilot": {"status": "grandfathered" if lifecycle == "operating" else "none", "path": None},
            "source": "business-lanes.json",
        }
        entries.append(entry)
        seen.add(entry["id"])

    geos = ["Greater Montreal", "remote"]
    for machine_id, meta in types_data.get("machines", {}).items():
        icps = meta.get("icps") or ["us"]
        for icp_id in icps:
            for geo in geos:
                cid = f"{machine_id}__{icp_id}__{geo.replace(' ', '-').lower()}"
                if cid in seen:
                    continue
                seen.add(cid)
                entries.append(
                    {
                        "id": cid,
                        "name": f"{machine_id} — {icp_id} ({geo})",
                        "parent_model_id": machine_id,
                        "machine": machine_id,
                        "icp_id": icp_id,
                        "geo": geo,
                        "type": _type_for(machine_id, icp_id),
                        "lifecycle": "catalog",
                        "lane_id": None,
                        "research_depth": "ready",
                        "primary_agents_default": _agents_for(machine_id),
                        "required_plugins": ["higgsfield"] if machine_id == "product-ad-from-photo" else [],
                        "required_skills": meta.get("skills", []),
                        "serves_lanes": ["dropship", "amazon-own-store"]
                        if machine_id == "product-ad-from-photo"
                        else [],
                        "pilot": {"status": "none", "path": None, "kind": None},
                        "source": meta.get("source", "business-types.json"),
                        "path": meta.get("path"),
                    }
                )

    # Grok Bot use cases video machines (yt:lRUpu2-KtGQ)
    grok_machines = [
        ("inbox-to-task-routing", "us", "operator-run", ["Communications Manager", "Day Planner"]),
        ("product-ad-from-photo", "dropship", "operator-run", ["Creative Studio", "Publishing Engine"]),
        ("invoice-email-automation", "agency-delivery", "client-service", ["Money Desk", "Communications Manager"]),
        ("meeting-to-task-routing", "agency-delivery", "client-service", ["Day Planner", "Consultant"]),
    ]
    for mid, icp, typ, agents in grok_machines:
        for geo in geos:
            cid = f"{mid}__{icp}__{geo.replace(' ', '-').lower()}"
            if cid in seen:
                continue
            seen.add(cid)
            entries.append(
                {
                    "id": cid,
                    "name": f"{mid} — {icp} ({geo})",
                    "parent_model_id": mid,
                    "machine": mid,
                    "icp_id": icp,
                    "geo": geo,
                    "type": typ,
                    "lifecycle": "catalog",
                    "lane_id": None,
                    "research_depth": "ready",
                    "primary_agents_default": agents,
                    "required_plugins": ["higgsfield"] if mid == "product-ad-from-photo" else [],
                    "pilot": {"status": "none", "path": None},
                    "source": "yt:lRUpu2-KtGQ",
                }
            )

    # Deck machines
    for mid, typ in [("meeting-deck", "client-service"), ("howto-deck", "operator-run")]:
        cid = f"{mid}__ai-partner-websites__remote"
        if cid not in seen:
            seen.add(cid)
            entries.append(
                {
                    "id": cid,
                    "name": f"{mid} — ai-partner (remote)",
                    "parent_model_id": "folder-to-deck",
                    "machine": mid,
                    "icp_id": "ai-partner-websites",
                    "geo": "remote",
                    "type": typ,
                    "lifecycle": "catalog",
                    "lane_id": None,
                    "research_depth": "ready",
                    "primary_agents_default": _agents_for("folder-to-deck"),
                    "pilot": {"status": "none", "path": None},
                    "source": "folder-to-deck",
                }
            )

    catalog = {
        "version": "1.0.0",
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "operator": lanes_data.get("operator", "Evens Louis"),
        "rules": [
            "Catalog is SSOT; business-lanes.json is operating subset only",
            "Upgrade requires pilot PASS on parent_model (or grandfathered) + operator yes",
            "No priority field — equal Big Boss coverage for operating lanes",
            "Combinator rows start lifecycle=catalog until upgraded",
        ],
        "lifecycle_states": ["catalog", "researching", "building", "operating"],
        "entries": entries,
        "stats": {
            "total": len(entries),
            "operating": sum(1 for e in entries if e.get("lifecycle") == "operating"),
            "catalog": sum(1 for e in entries if e.get("lifecycle") == "catalog"),
        },
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(catalog, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
