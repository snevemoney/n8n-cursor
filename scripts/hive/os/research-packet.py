#!/usr/bin/env python3
"""Research Packet — temporary JIT learning artifact for agent handoffs."""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
import subprocess
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
PACKET_DIR = Path.home() / ".grokbot" / "research-packets"
SCHEMA_PATH = ROOT / "schemas" / "os" / "research_packet.schema.json"


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")[:48] or "packet"


def _load_event_bus():
    spec = importlib.util.spec_from_file_location(
        "event_bus", Path(__file__).resolve().parent / "event-bus.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod.emit


def create_packet(
    question: str,
    requested_by: str,
    *,
    budget_tier: str = "standard",
    project_id: str | None = None,
    correlation_id: str | None = None,
) -> dict[str, Any]:
    packet_id = f"rp-{_slug(question[:30])}-{uuid.uuid4().hex[:8]}"
    now = _now_iso()
    return {
        "packet_id": packet_id,
        "question": question,
        "requested_by": requested_by,
        "assigned_to": "Researcher",
        "budget_tier": budget_tier,
        "sources": {"documents": 0, "web_pages": 0, "videos": 0, "social_posts": 0, "papers": 0},
        "source_types": [],
        "source_refs": [],
        "findings": [],
        "disagreements": [],
        "conflicting_evidence": [],
        "recommended_approach": "",
        "known_failure_modes": [],
        "remaining_uncertainty": [],
        "relevant_versions": [],
        "action_ready": False,
        "freshness": {
            "checked_at": now,
            "stale_after": (datetime.now(timezone.utc) + timedelta(days=30)).replace(microsecond=0).isoformat(),
        },
        "correlation_id": correlation_id or packet_id,
        "project_id": project_id,
    }


def validate_packet(packet: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for key in ("packet_id", "question", "requested_by", "budget_tier", "findings", "action_ready", "freshness"):
        if key not in packet:
            errors.append(f"missing required field: {key}")
    tier = packet.get("budget_tier")
    if tier not in ("quick", "standard", "deep", "exceptional"):
        errors.append(f"invalid budget_tier: {tier}")
    for i, f in enumerate(packet.get("findings") or []):
        if "finding" not in f or "confidence" not in f:
            errors.append(f"findings[{i}] missing finding or confidence")
    return errors


def save_packet(packet: dict[str, Any]) -> Path:
    PACKET_DIR.mkdir(parents=True, exist_ok=True)
    path = PACKET_DIR / f"{packet['packet_id']}.json"
    path.write_text(json.dumps(packet, indent=2) + "\n", encoding="utf-8")
    return path


def load_packet(packet_id: str) -> dict[str, Any]:
    path = PACKET_DIR / f"{packet_id}.json"
    if not path.is_file():
        alt = PACKET_DIR / f"{packet_id}" if packet_id.endswith(".json") else None
        if alt and alt.is_file():
            path = alt
        else:
            raise SystemExit(f"Packet not found: {packet_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def merge_finding(packet: dict[str, Any], finding: str, confidence: float, *, label: str = "INFERENCE", sources: list[str] | None = None) -> dict[str, Any]:
    packet["findings"].append(
        {
            "finding": finding,
            "confidence": confidence,
            "label": label,
            "sources": sources or [],
        }
    )
    return packet


def finalize_packet(packet: dict[str, Any], *, recommended: str, action_ready: bool = True) -> dict[str, Any]:
    packet["recommended_approach"] = recommended
    packet["action_ready"] = action_ready
    packet["freshness"]["checked_at"] = _now_iso()
    if packet["findings"]:
        avg = sum(f["confidence"] for f in packet["findings"]) / len(packet["findings"])
        if avg >= 0.75 and recommended:
            packet["action_ready"] = True
    return packet


def emit_ready(packet: dict[str, Any]) -> str:
    emit = _load_event_bus()
    return emit(
        "research.packet_ready",
        "research-packet.py",
        packet.get("assigned_to", "Researcher"),
        {
            "packet_id": packet["packet_id"],
            "requested_by": packet["requested_by"],
            "action_ready": packet.get("action_ready"),
        },
        project_id=packet.get("project_id"),
    )


def register_mission(packet: dict[str, Any], agent: str = "Researcher") -> dict[str, Any]:
    tool = ROOT / "scripts" / "hive" / "grok-hive-tool.py"
    if not tool.is_file():
        return {"ok": False, "error": "grok-hive-tool.py missing"}
    summary = f"Research packet: {packet['question'][:120]} — action_ready={packet.get('action_ready')}"
    params = json.dumps(
        {
            "correlationId": packet.get("correlation_id"),
            "jobType": "research.packet",
            "status": "done" if packet.get("action_ready") else "pending",
            "summary": summary[:500],
            "payload": {"packet_id": packet["packet_id"], "requested_by": packet["requested_by"]},
        }
    )
    proc = subprocess.run(
        [sys.executable, str(tool), "--grok-agent", agent, "--tool", "scorpion_register_outcome", "--params", params],
        capture_output=True,
        text=True,
        timeout=120,
    )
    return {"ok": proc.returncode == 0, "stdout": proc.stdout[:500], "stderr": proc.stderr[:300]}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--create", nargs=2, metavar=("QUESTION", "REQUESTED_BY"))
    ap.add_argument("--tier", default="standard")
    ap.add_argument("--project-id")
    ap.add_argument("--show", metavar="PACKET_ID")
    ap.add_argument("--validate", metavar="PACKET_ID")
    ap.add_argument("--validate-fixture", action="store_true")
    ap.add_argument("--finalize", metavar="PACKET_ID")
    ap.add_argument("--recommended", default="")
    ap.add_argument("--emit", metavar="PACKET_ID")
    ap.add_argument("--register", metavar="PACKET_ID")
    args = ap.parse_args()

    if args.validate_fixture:
        p = create_packet("fixture test question", "Forge", budget_tier="quick")
        p = merge_finding(p, "Official docs confirm API v2", 0.95, label="FACT", sources=["https://example.com/docs"])
        p = finalize_packet(p, recommended="Use API v2 with retry wrapper", action_ready=True)
        errs = validate_packet(p)
        if errs:
            for e in errs:
                print(f"FAIL: {e}")
            return 1
        print("research-packet validate-fixture: OK")
        return 0

    if args.create:
        p = create_packet(args.create[0], args.create[1], budget_tier=args.tier, project_id=args.project_id)
        path = save_packet(p)
        print(json.dumps({"saved": str(path), "packet": p}, indent=2))
        return 0

    if args.show:
        print(json.dumps(load_packet(args.show), indent=2))
        return 0

    if args.validate:
        errs = validate_packet(load_packet(args.validate))
        if errs:
            for e in errs:
                print(f"FAIL: {e}")
            return 1
        print("OK")
        return 0

    if args.finalize:
        p = load_packet(args.finalize)
        p = finalize_packet(p, recommended=args.recommended or p.get("recommended_approach", ""))
        save_packet(p)
        print(json.dumps(p, indent=2))
        return 0

    if args.emit:
        p = load_packet(args.emit)
        eid = emit_ready(p)
        print(json.dumps({"event_id": eid, "packet_id": p["packet_id"]}, indent=2))
        return 0

    if args.register:
        p = load_packet(args.register)
        print(json.dumps(register_mission(p), indent=2))
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
