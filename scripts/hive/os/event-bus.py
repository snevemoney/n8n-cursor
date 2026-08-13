#!/usr/bin/env python3
"""Event bus v1 — append/read JSONL at ~/.grokbot/os-events.jsonl with dedupe by event_id."""
from __future__ import annotations

import argparse
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_PATH = Path.home() / ".grokbot/os-events.jsonl"

STANDARD_TYPES = frozenset(
    {
        "email.received",
        "email.replied",
        "calendar.event_created",
        "calendar.event_upcoming",
        "file.created",
        "file.modified",
        "transaction.detected",
        "subscription.changed",
        "repo.commit",
        "repo.pr_opened",
        "repo.build_failed",
        "project.state_changed",
        "lead.discovered",
        "lead.responded",
        "content.ready",
        "content.published",
        "analytics.updated",
        "deadline.approaching",
        "security.alert",
        "agent.failed",
        "agent.heartbeat",
        "approval.requested",
        "approval.resolved",
        "hive.watchdog.run",
        "research.requested",
        "research.packet_ready",
        "research.budget_exceeded",
        "agent.knowledge_gap",
    }
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def _read_all(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def append_event(
    event: dict[str, Any],
    *,
    path: Path = DEFAULT_PATH,
) -> tuple[bool, str]:
    """Returns (inserted, event_id). Skips if event_id already exists."""
    path.parent.mkdir(parents=True, exist_ok=True)
    eid = event.get("event_id") or str(uuid.uuid4())
    event = {**event, "event_id": eid}
    if "timestamp" not in event:
        event["timestamp"] = _now_iso()
    existing = {r.get("event_id") for r in _read_all(path)}
    if eid in existing:
        return False, eid
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")
    return True, eid


def emit(
    event_type: str,
    source: str,
    actor: str,
    payload: dict[str, Any] | None = None,
    *,
    priority: str = "P3",
    project_id: str | None = None,
    entity_id: str | None = None,
    sensitivity: str = "internal",
    path: Path = DEFAULT_PATH,
) -> str:
    event = {
        "type": event_type,
        "source": source,
        "actor": actor,
        "priority": priority,
        "payload": payload or {},
        "sensitivity": sensitivity,
    }
    if project_id:
        event["project_id"] = project_id
    if entity_id:
        event["entity_id"] = entity_id
    _, eid = append_event(event, path=path)
    return eid


def tail(path: Path = DEFAULT_PATH, limit: int = 20) -> list[dict[str, Any]]:
    rows = _read_all(path)
    return rows[-limit:]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--emit", metavar="TYPE", help="Emit standard event type")
    ap.add_argument("--source", default="cli")
    ap.add_argument("--actor", default="operator")
    ap.add_argument("--payload", default="{}")
    ap.add_argument("--project-id")
    ap.add_argument("--tail", type=int, default=0, help="Print last N events")
    ap.add_argument("--path", type=Path, default=DEFAULT_PATH)
    args = ap.parse_args()

    if args.tail:
        for row in tail(args.path, args.tail):
            print(json.dumps(row, ensure_ascii=False))
        return 0

    if args.emit:
        if args.emit not in STANDARD_TYPES:
            print(f"Warning: {args.emit} not in STANDARD_TYPES catalog", file=sys.stderr)
        payload = json.loads(args.payload)
        eid = emit(
            args.emit,
            args.source,
            args.actor,
            payload,
            project_id=args.project_id,
            path=args.path,
        )
        print(json.dumps({"event_id": eid, "type": args.emit}, indent=2))
        return 0

    ap.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
