#!/usr/bin/env python3
"""Upgrade catalog SKU to operating lane (pilot PASS + operator yes)."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "docs/hive/outer-heaven/CONTENT/BUSINESS_CATALOG.json"
LANES_PATH = ROOT / "scripts/hive/business-lanes.json"
PILOTS_ROOT = ROOT / "docs/hive/outer-heaven/CONTENT/pilots"
PL_DIR = ROOT / "scripts/hive/lane-pl"
PS_DIR = ROOT / "scripts/hive/product-state"


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def _pilot_status(parent_model_id: str) -> tuple[str, str | None]:
    pilot_dir = PILOTS_ROOT / parent_model_id
    pilot_md = pilot_dir / "PILOT.md"
    if not pilot_md.is_file():
        return "none", None
    text = pilot_md.read_text(encoding="utf-8")
    for line in text.splitlines():
        if line.lower().startswith("status:"):
            status = line.split(":", 1)[1].strip().upper()
            return status, str(pilot_dir.relative_to(ROOT / "docs/hive/outer-heaven"))
    return "unknown", str(pilot_dir.relative_to(ROOT / "docs/hive/outer-heaven"))


def _ensure_pl_stub(lane_id: str, name: str, owner_agent: str) -> Path:
    PL_DIR.mkdir(parents=True, exist_ok=True)
    pl_path = PL_DIR / f"{lane_id}.json"
    if not pl_path.is_file():
        stub = {
            "lane_id": lane_id,
            "name": name,
            "created": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "currency": "CAD",
            "revenue_mtd": 0,
            "expense_mtd": 0,
            "cogs": {"model": 0, "hosting": 0, "hitl_hours": 0},
            "gross_margin_target": 0.4,
            "kpi": None,
            "baseline": None,
            "owner_agent": owner_agent,
            "notes": "Stub — Money Desk updates on operator request",
        }
        _write_json(pl_path, stub)
    return pl_path


def _ensure_product_state(lane_id: str, entry: dict, lane_name: str) -> Path:
    PS_DIR.mkdir(parents=True, exist_ok=True)
    ps_path = PS_DIR / f"{lane_id}.json"
    agents = entry.get("primary_agents_default") or []
    owner = agents[0] if agents else "Big Boss"
    if not ps_path.is_file():
        state = {
            "project_id": lane_id,
            "display_name": lane_name,
            "lifecycle": "beta",
            "agent_state": "READY",
            "owner_agent": owner,
            "priority": "P2",
            "blocked": False,
            "requires_human": False,
            "offer_validated": False,
            "next_milestone": "first pilot loop complete",
            "dependencies": ["operator"],
            "allowed_agents": agents,
            "suppressed_agents": [],
            "expected_output": f"Operating lane {lane_id} from catalog {entry.get('id')}",
            "definition_of_done": "pilot PASS + first revenue or proof URL live",
            "catalog_id": entry.get("id"),
            "parent_model_id": entry.get("parent_model_id"),
            "lane_id": lane_id,
            "resources": {"repo": "n8n-cursor"},
            "last_action": f"catalog-lane-upgrade {datetime.now(timezone.utc).strftime('%Y-%m-%d')}",
            "next_action": "Money Desk sets KPI baseline",
        }
        _write_json(ps_path, state)
    return ps_path


def _resolve_entry(
    entries: list[dict],
    *,
    sku_id: str | None,
    lane_id: str | None,
    parent_model: str | None,
) -> tuple[dict, str]:
    if parent_model:
        matches = [
            e
            for e in entries
            if e.get("parent_model_id") == parent_model or e.get("machine") == parent_model
        ]
        if not matches:
            raise SystemExit(f"No catalog rows for parent_model={parent_model}")
        # Prefer remote geo SKU for lane naming
        entry = next((e for e in matches if e.get("geo") == "remote"), matches[0])
        lid = lane_id or parent_model.replace("_", "-")
        return entry, lid

    if sku_id:
        for e in entries:
            if e["id"] == sku_id:
                lid = lane_id or e.get("parent_model_id") or e["id"].split("__")[0]
                return e, lid
        raise SystemExit(f"SKU not found: {sku_id}")

    if lane_id:
        for e in entries:
            if e.get("lane_id") == lane_id or e["id"] == f"lane__{lane_id}":
                return e, lane_id
        raise SystemExit(f"No catalog entry for lane_id={lane_id}")

    raise SystemExit("Provide --sku-id, --lane-id, or --parent-model")


def upgrade(
    *,
    sku_id: str | None,
    lane_id: str | None,
    parent_model: str | None,
    operator_yes: bool,
    dry_run: bool,
) -> dict:
    catalog = _load_json(CATALOG_PATH)
    lanes_data = _load_json(LANES_PATH)
    entries = catalog.get("entries", [])

    entry, lane_id = _resolve_entry(
        entries, sku_id=sku_id, lane_id=lane_id, parent_model=parent_model
    )

    parent = entry.get("parent_model_id") or entry.get("machine") or lane_id
    pilot_status, pilot_path = _pilot_status(str(parent))
    entry_pilot = (entry.get("pilot") or {}).get("status", "none")

    allowed_pilot = pilot_status in ("PASS", "GRANDFATHERED") or entry_pilot == "grandfathered"
    if not allowed_pilot:
        return {
            "ok": False,
            "error": f"Pilot not PASS (status={pilot_status}). Run pilot at CONTENT/pilots/{parent}/ first.",
            "pilot_path": pilot_path,
        }
    if not operator_yes:
        return {
            "ok": False,
            "error": "Operator yes required (--operator-yes). HITL gate.",
            "pilot_status": pilot_status,
        }

    lane_name = entry.get("name", lane_id)
    agents = entry.get("primary_agents_default") or []
    owner_agent = agents[0] if agents else "Big Boss"

    new_lane = {
        "id": lane_id,
        "name": lane_name,
        "status": "active",
        "description": f"Upgraded from catalog SKU {entry['id']}",
        "operator_role": "Operator-owned",
        "primary_agents": agents,
        "product_state": lane_id,
        "catalog_id": entry["id"],
        "parent_model_id": parent,
        "notes": f"Upgraded {datetime.now(timezone.utc).strftime('%Y-%m-%d')} from {entry['id']}",
    }

    existing = {l["id"]: l for l in lanes_data.get("lanes", [])}
    if lane_id in existing:
        existing[lane_id].update(new_lane)
    else:
        lanes_data.setdefault("lanes", []).append(new_lane)

    entry["lifecycle"] = "operating"
    entry["lane_id"] = lane_id
    entry["pilot"] = {"status": pilot_status or "grandfathered", "path": pilot_path}

    # Mark sibling SKUs under same parent as served by this lane (catalog link only)
    if parent_model:
        for e in entries:
            if (e.get("parent_model_id") == parent_model or e.get("machine") == parent_model) and e["id"] != entry["id"]:
                e.setdefault("served_by_lane", lane_id)

    pl_path = _ensure_pl_stub(lane_id, lane_name, owner_agent)
    ps_path = _ensure_product_state(lane_id, entry, lane_name)

    result = {
        "ok": True,
        "lane_id": lane_id,
        "sku_id": entry["id"],
        "catalog_id": entry["id"],
        "parent_model_id": parent,
        "pilot_status": pilot_status,
        "pl_stub": str(pl_path.relative_to(ROOT)),
        "product_state": str(ps_path.relative_to(ROOT)),
        "dry_run": dry_run,
    }

    if not dry_run:
        _write_json(LANES_PATH, lanes_data)
        catalog["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        catalog["entries"] = entries
        catalog["stats"] = {
            "total": len(entries),
            "operating": sum(1 for e in entries if e.get("lifecycle") == "operating"),
            "catalog": sum(1 for e in entries if e.get("lifecycle") == "catalog"),
            "building": sum(1 for e in entries if e.get("lifecycle") == "building"),
        }
        _write_json(CATALOG_PATH, catalog)

    return result


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sku-id", help="Catalog entry id")
    ap.add_argument("--lane-id", help="Target lane id")
    ap.add_argument("--parent-model", help="Upgrade parent model to one lane")
    ap.add_argument("--operator-yes", action="store_true", help="HITL operator approval")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    result = upgrade(
        sku_id=args.sku_id,
        lane_id=args.lane_id,
        parent_model=args.parent_model,
        operator_yes=args.operator_yes,
        dry_run=args.dry_run,
    )
    print(json.dumps(result, indent=2))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
