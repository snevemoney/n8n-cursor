#!/usr/bin/env python3
"""Event bus v1 — append/read JSONL at ~/.grokbot/os-events.jsonl with dedupe by event_id."""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_HIVE_STATE_PATH = Path(__file__).resolve().parents[1] / "hive-state.py"
_hive_spec = importlib.util.spec_from_file_location("hive_state_cohort", _HIVE_STATE_PATH)
if _hive_spec is None or _hive_spec.loader is None:
    raise RuntimeError(f"cannot load {_HIVE_STATE_PATH}")
hive_state = importlib.util.module_from_spec(_hive_spec)
_hive_spec.loader.exec_module(hive_state)

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


# Versioned continuity on this bus. Grok desk projections and Jarvis primary/isolated
# are consumers. There is no second bus and no second Grok gateway.
GROK_DESK_CONSUMER = "grok-desk"
JARVIS_PRIMARY = "jarvis-primary"
JARVIS_ISOLATED = "jarvis-isolated"
JARVIS_ENTITY = "jarvis-bus"
_MUTATION_FIELDS = (
    "entity_id",
    "entity_type",
    "state_version",
    "changed_at",
    "source_platform",
    "source_session",
    "writer",
    "supersedes_version",
    "payload",
)
_CONSUMER_RESULTS = frozenset({"APPLIED", "REJECTED", "CONFLICT", "STALE"})


def payload_identity(payload: Any) -> str:
    raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)
    return hashlib.sha256(raw.encode()).hexdigest()[:16]


def _cohort(metric: str, *, path: Path | None, **fields: int) -> None:
    if path is None or not path.is_file():
        return
    data = hive_state.load(path)
    hive_state.bump_cohort(data, metric, **fields)
    hive_state.save(data, path)


def _is_paste(mutation: dict[str, Any]) -> bool:
    platform = str(mutation.get("source_platform") or "").lower()
    via = str(mutation.get("via") or "").lower()
    writer = str(mutation.get("writer") or "").lower()
    return platform == "paste" or via == "paste" or "paste-pack" in writer


def _mutation_record(mutation: dict[str, Any]) -> dict[str, Any]:
    missing = [key for key in _MUTATION_FIELDS if key not in mutation]
    if missing:
        raise SystemExit(f"continuity mutation missing {', '.join(missing)}")
    payload = mutation.get("payload")
    return {
        "entity_id": str(mutation["entity_id"]),
        "entity_type": str(mutation["entity_type"]),
        "state_version": int(mutation["state_version"]),
        "changed_at": str(mutation["changed_at"]),
        "source_platform": str(mutation["source_platform"]),
        "source_session": str(mutation["source_session"]),
        "writer": str(mutation.get("writer") or mutation.get("provenance") or ""),
        "provenance": str(mutation.get("provenance") or mutation.get("writer") or ""),
        "supersedes_version": mutation.get("supersedes_version"),
        "payload": payload,
        "payload_id": str(mutation.get("payload_id") or payload_identity(payload)),
    }


def _continuity_rows(path: Path) -> list[dict[str, Any]]:
    return [row for row in _read_all(path) if row.get("type") == "continuity.state"]


def published_versions(entity_id: str, path: Path) -> list[dict[str, Any]]:
    rows = [
        row
        for row in _continuity_rows(path)
        if row.get("entity_id") == entity_id and row.get("phase") == "PUBLISHED"
    ]
    rows.sort(key=lambda row: int(row.get("state_version") or 0))
    return rows


def authoritative(entity_id: str, path: Path) -> dict[str, Any] | None:
    rows = published_versions(entity_id, path)
    return rows[-1] if rows else None


def _applied_rows(consumer: str, entity_id: str, path: Path) -> dict[int, dict[str, Any]]:
    found: dict[int, dict[str, Any]] = {}
    for row in _continuity_rows(path):
        if row.get("consumer") != consumer or row.get("entity_id") != entity_id:
            continue
        if row.get("phase") != "APPLIED":
            continue
        found[int(row.get("state_version") or 0)] = row
    return found


def _applied_row(consumer: str, entity_id: str, path: Path) -> dict[str, Any] | None:
    found = _applied_rows(consumer, entity_id, path)
    if not found:
        return None
    return found[max(found)]


def _acked(consumer: str, entity_id: str, version: int, path: Path) -> bool:
    for row in _continuity_rows(path):
        if (
            row.get("consumer") == consumer
            and row.get("entity_id") == entity_id
            and row.get("phase") == "ACKNOWLEDGED"
            and int(row.get("state_version") or 0) == version
        ):
            return True
    return False


def _append_phase(record: dict[str, Any], phase: str, *, path: Path, consumer: str | None = None, result: str | None = None) -> dict[str, Any]:
    event = {
        "type": "continuity.state",
        "phase": phase,
        "entity_id": record["entity_id"],
        "entity_type": record["entity_type"],
        "state_version": record["state_version"],
        "changed_at": record["changed_at"],
        "source_platform": record["source_platform"],
        "source_session": record["source_session"],
        "writer": record["writer"],
        "provenance": record["provenance"],
        "supersedes_version": record["supersedes_version"],
        "payload_id": record["payload_id"],
        "payload": record["payload"],
    }
    if consumer:
        event["consumer"] = consumer
    if result:
        event["result"] = result
    event_id = f"{record['entity_id']}:{record['state_version']}:{record['payload_id']}:{phase}:{consumer or '-'}"
    event["event_id"] = event_id
    inserted, eid = append_event(event, path=path)
    event["event_id"] = eid
    event["inserted"] = inserted
    return event


def publish_state(mutation: dict[str, Any], *, path: Path = DEFAULT_PATH, cohort_path: Path | None = None) -> dict[str, Any]:
    if _is_paste(mutation):
        _cohort("manual_Evens_bus_count", path=cohort_path, count=1)
        return {"phase": "REJECTED", "result": "REJECTED", "reason": "paste is not the bus", "inserted": False}
    record = _mutation_record(mutation)
    existing = [
        row
        for row in published_versions(record["entity_id"], path)
        if int(row.get("state_version") or 0) == record["state_version"]
    ]
    if existing and existing[-1].get("payload_id") != record["payload_id"]:
        _cohort("conflict_rate", path=cohort_path, conflicts=1, applies=1)
        conflict = _append_phase(record, "CONFLICT", path=path, result="CONFLICT")
        conflict["result"] = "CONFLICT"
        conflict["reason"] = "equal version with incompatible content"
        return conflict
    if existing:
        prior = dict(existing[-1])
        prior["result"] = "PUBLISHED"
        prior["duplicate"] = True
        prior["inserted"] = False
        return prior
    newest = authoritative(record["entity_id"], path)
    if newest and int(newest.get("state_version") or 0) > record["state_version"]:
        _cohort("stale_apply_rate", path=cohort_path, stale=1, applies=1)
        stale = _append_phase(record, "STALE", path=path, result="STALE")
        stale["result"] = "STALE"
        stale["reason"] = "older version cannot overwrite newer"
        return stale
    published = _append_phase(record, "PUBLISHED", path=path)
    published["phase"] = "PUBLISHED"
    published["result"] = "PUBLISHED"
    return published


def receive_state(consumer: str, mutation: dict[str, Any], *, path: Path = DEFAULT_PATH) -> dict[str, Any]:
    record = _mutation_record(mutation)
    received = _append_phase(record, "RECEIVED", path=path, consumer=consumer)
    received["phase"] = "RECEIVED"
    received["consumer"] = consumer
    return received


def apply_state(
    consumer: str,
    mutation: dict[str, Any],
    *,
    path: Path = DEFAULT_PATH,
    cohort_path: Path | None = None,
) -> dict[str, Any]:
    """One of APPLIED, REJECTED, CONFLICT, STALE. Duplicate delivery does not apply twice."""
    if _is_paste(mutation):
        _cohort("manual_Evens_bus_count", path=cohort_path, count=1)
        return {"result": "REJECTED", "reason": "paste is not the bus", "consumer": consumer, "inserted": False}
    record = _mutation_record(mutation)
    auth = authoritative(record["entity_id"], path)
    applied = _applied_row(consumer, record["entity_id"], path)
    applied_version = int(applied.get("state_version") or 0) if applied else -1
    auth_version = int(auth.get("state_version") or 0) if auth else -1
    _cohort("stale_apply_rate", path=cohort_path, applies=1)
    if auth is None:
        return {"result": "REJECTED", "reason": "nothing published", "consumer": consumer, "inserted": False}
    if record["state_version"] < auth_version or (applied is not None and record["state_version"] < applied_version):
        _cohort("stale_apply_rate", path=cohort_path, stale=1)
        stale = _append_phase(record, "STALE", path=path, consumer=consumer, result="STALE")
        stale["result"] = "STALE"
        return stale
    same_published = next(
        (
            row
            for row in published_versions(record["entity_id"], path)
            if int(row.get("state_version") or 0) == record["state_version"]
        ),
        None,
    )
    if same_published and same_published.get("payload_id") != record["payload_id"]:
        _cohort("conflict_rate", path=cohort_path, conflicts=1, applies=1)
        conflict = _append_phase(record, "CONFLICT", path=path, consumer=consumer, result="CONFLICT")
        conflict["result"] = "CONFLICT"
        conflict["reason"] = "equal version with incompatible content"
        return conflict
    if applied and applied_version == record["state_version"] and applied.get("payload_id") == record["payload_id"]:
        _cohort("duplicate_apply_rate", path=cohort_path, duplicates=1, applies=1)
        return {
            "result": "APPLIED",
            "duplicate": True,
            "consumer": consumer,
            "entity_id": record["entity_id"],
            "state_version": record["state_version"],
            "payload_id": record["payload_id"],
            "inserted": False,
        }
    if record["state_version"] != auth_version or (same_published or {}).get("payload_id") != record["payload_id"]:
        return {"result": "REJECTED", "reason": "version is not the published payload", "consumer": consumer, "inserted": False}
    applied_event = _append_phase(record, "APPLIED", path=path, consumer=consumer, result="APPLIED")
    applied_event["result"] = "APPLIED"
    applied_event["duplicate"] = False
    return applied_event


def acknowledge(
    consumer: str,
    entity_id: str,
    *,
    path: Path = DEFAULT_PATH,
    cohort_path: Path | None = None,
) -> dict[str, Any]:
    applied = _applied_row(consumer, entity_id, path)
    if not applied:
        return {"result": "REJECTED", "reason": "nothing applied", "consumer": consumer}
    record = _mutation_record(applied)
    if _acked(consumer, entity_id, record["state_version"], path):
        return {"phase": "ACKNOWLEDGED", "result": "ACKNOWLEDGED", "duplicate": True, "consumer": consumer, "inserted": False}
    acked = _append_phase(record, "ACKNOWLEDGED", path=path, consumer=consumer, result="ACKNOWLEDGED")
    acked["phase"] = "ACKNOWLEDGED"
    acked["result"] = "ACKNOWLEDGED"
    try:
        changed = datetime.fromisoformat(str(record["changed_at"]).replace("Z", "+00:00"))
        lag_ms = int((datetime.now(timezone.utc) - changed).total_seconds() * 1000)
    except ValueError:
        lag_ms = 0
    if lag_ms < 0:
        lag_ms = 0
    _cohort("propagation_latency", path=cohort_path, samples=1, total_ms=lag_ms)
    acked["latency_ms"] = lag_ms
    return acked


def projection_synced(consumer: str, entity_id: str, *, path: Path = DEFAULT_PATH) -> bool:
    auth = authoritative(entity_id, path)
    if not auth:
        return False
    return _acked(consumer, entity_id, int(auth.get("state_version") or 0), path)


def write_projection(consumer: str, entity_id: str, dest: Path, *, path: Path = DEFAULT_PATH) -> dict[str, Any]:
    """A projection file without a consumer ack is not synced."""
    auth = authoritative(entity_id, path)
    body = {
        "entity_id": entity_id,
        "consumer": consumer,
        "synced": projection_synced(consumer, entity_id, path=path),
        "authoritative": auth,
    }
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(body, indent=2) + "\n", encoding="utf-8")
    return body


def _replay_published(
    consumer: str,
    published_row: dict[str, Any],
    *,
    path: Path,
    cohort_path: Path | None = None,
) -> dict[str, Any]:
    """Apply one already-published version in order. Does not move the head backwards."""
    record = _mutation_record(published_row)
    applied_by_version = _applied_rows(consumer, record["entity_id"], path)
    version = record["state_version"]
    already = applied_by_version.get(version)
    if already and already.get("payload_id") == record["payload_id"]:
        _cohort("duplicate_apply_rate", path=cohort_path, duplicates=1, applies=1)
        return {
            "result": "APPLIED",
            "duplicate": True,
            "consumer": consumer,
            "entity_id": record["entity_id"],
            "state_version": version,
            "payload_id": record["payload_id"],
            "inserted": False,
        }
    if already and already.get("payload_id") != record["payload_id"]:
        _cohort("conflict_rate", path=cohort_path, conflicts=1, applies=1)
        return {"result": "CONFLICT", "consumer": consumer, "inserted": False, "state_version": version}
    highest = max(applied_by_version) if applied_by_version else -1
    if highest >= 0 and version < highest:
        _cohort("stale_apply_rate", path=cohort_path, stale=1, applies=1)
        return {"result": "STALE", "consumer": consumer, "inserted": False, "state_version": version}
    if highest >= 0 and version != highest + 1:
        return {"result": "REJECTED", "reason": "catch-up gap", "consumer": consumer, "inserted": False}
    event = _append_phase(record, "APPLIED", path=path, consumer=consumer, result="APPLIED")
    event["result"] = "APPLIED"
    event["duplicate"] = False
    return event


def catch_up(consumer: str, *, path: Path = DEFAULT_PATH, entity_id: str | None = None, cohort_path: Path | None = None) -> list[dict[str, Any]]:
    """Reconnect applies published versions in order, once."""
    entities: list[str] = []
    for row in published_versions_all(path):
        eid = str(row.get("entity_id") or "")
        if entity_id and eid != entity_id:
            continue
        if eid and eid not in entities:
            entities.append(eid)
    results: list[dict[str, Any]] = []
    for eid in entities:
        for row in published_versions(eid, path):
            results.append(_replay_published(consumer, row, path=path, cohort_path=cohort_path))
    return results


def published_versions_all(path: Path) -> list[dict[str, Any]]:
    rows = [row for row in _continuity_rows(path) if row.get("phase") == "PUBLISHED"]
    rows.sort(key=lambda row: (str(row.get("entity_id") or ""), int(row.get("state_version") or 0)))
    return rows


def consequential_write(
    consumer: str,
    mutation: dict[str, Any],
    *,
    path: Path = DEFAULT_PATH,
    cohort_path: Path | None = None,
) -> dict[str, Any]:
    """A stale consumer cannot publish the next authoritative mutation."""
    record = _mutation_record(mutation)
    auth = authoritative(record["entity_id"], path)
    applied = _applied_row(consumer, record["entity_id"], path)
    auth_version = int(auth.get("state_version") or 0) if auth else -1
    cursor = int(applied.get("state_version") or 0) if applied else -1
    if auth is not None and cursor < auth_version:
        _cohort("stale_apply_rate", path=cohort_path, stale=1, applies=1)
        return {
            "result": "STALE",
            "reason": "stale consumer cannot drive a consequential write",
            "consumer": consumer,
            "inserted": False,
        }
    return publish_state(mutation, path=path, cohort_path=cohort_path)


def publish_grok_desk(
    desk: str,
    payload: dict[str, Any],
    *,
    state_version: int,
    source_session: str,
    writer: str,
    changed_at: str | None = None,
    path: Path = DEFAULT_PATH,
    projection_path: Path | None = None,
    cohort_path: Path | None = None,
    supersedes_version: int | None = None,
) -> dict[str, Any]:
    entity_id = f"grok-desk:{desk}"
    mutation = {
        "entity_id": entity_id,
        "entity_type": "grok_desk_projection",
        "state_version": state_version,
        "changed_at": changed_at or _now_iso(),
        "source_platform": "grok",
        "source_session": source_session,
        "writer": writer,
        "provenance": writer,
        "supersedes_version": supersedes_version if supersedes_version is not None else (state_version - 1 if state_version else None),
        "payload": payload,
    }
    published = publish_state(mutation, path=path, cohort_path=cohort_path)
    projection = None
    if projection_path is not None and published.get("result") == "PUBLISHED":
        projection = write_projection(GROK_DESK_CONSUMER, entity_id, projection_path, path=path)
    return {"published": published, "projection": projection, "synced": bool(projection and projection.get("synced"))}


def publish_jarvis(
    payload: dict[str, Any],
    *,
    state_version: int,
    source_session: str,
    writer: str,
    path: Path = DEFAULT_PATH,
    cohort_path: Path | None = None,
    supersedes_version: int | None = None,
    changed_at: str | None = None,
) -> dict[str, Any]:
    """Primary Jarvis consumer on this bus. Isolated catch-up uses the same log."""
    mutation = {
        "entity_id": JARVIS_ENTITY,
        "entity_type": "jarvis_bus",
        "state_version": state_version,
        "changed_at": changed_at or _now_iso(),
        "source_platform": "jarvis",
        "source_session": source_session,
        "writer": writer,
        "provenance": writer,
        "supersedes_version": supersedes_version if supersedes_version is not None else (state_version - 1 if state_version else None),
        "payload": payload,
    }
    published = publish_state(mutation, path=path, cohort_path=cohort_path)
    if published.get("result") != "PUBLISHED":
        return {"published": published, "applied": None}
    applied = apply_state(JARVIS_PRIMARY, mutation, path=path, cohort_path=cohort_path)
    return {"published": published, "applied": applied}


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
