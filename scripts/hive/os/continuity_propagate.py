#!/usr/bin/env python3
"""Project one learned fact through the existing session-store sync.

This is not a daemon and not a new bus. Facts sit beside the session index
the sync already writes (`CONTENT/os/sessions/`). Evens does not carry them.
Jarvis and the named audience read the current version. Other workers get
no file. A later older version is labeled and does not replace current.
The same idempotency key on reconnect is not appended again.

A capability record must name every native adapter. This module refuses
VERIFIED and LIVE; those are not this writer's to award.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
LIB_DIR = HERE.parent / "outer-heaven"
if str(LIB_DIR) not in sys.path:
    sys.path.insert(0, str(LIB_DIR))

from lib import strip_secrets  # noqa: E402

SCHEMA = "hive.continuity.fact/v0"
FACTS_NAME = "continuity-facts.jsonl"
NATIVE_ADAPTERS = (
    "cursor",
    "grok",
    "claude-code",
    "codex",
    "chatgpt",
    "jarvis",
)
ADAPTER_STATES = frozenset(
    {
        "NEEDS_WORK",
        "NO_ACTION",
        "ABSENT",
        "PARTIAL",
        "IMPLEMENTED_UNVERIFIED",
        "AVAILABLE",
    }
)
NEEDS_WORK_STATES = frozenset({"NEEDS_WORK", "PARTIAL", "ABSENT"})
REFUSED_STATES = frozenset({"VERIFIED", "LIVE"})
LEARNER_PLATFORMS = frozenset(NATIVE_ADAPTERS)
BROADCAST = frozenset({"*", "all", "everyone", "all-desks", "17", "evens"})
WORKER_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,40}$")
VALUE_LIMIT = 400


def facts_path(os_root: Path) -> Path:
    return os_root / "sessions" / FACTS_NAME


def projections_dir(os_root: Path) -> Path:
    return os_root / "sessions" / "projections"


def projection_path(os_root: Path, worker: str) -> Path:
    return projections_dir(os_root) / f"{worker}.json"


def read_projection(os_root: Path, worker: str) -> dict[str, Any] | None:
    path = projection_path(os_root, worker)
    if not path.is_file():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def learn_fact(os_root: Path, fact: dict[str, Any]) -> dict[str, Any]:
    """Append one learning if it is new, then rebuild projections."""
    checked = _validate(fact)
    if not checked["ok"]:
        checked["evens_paste"] = False
        return checked
    event = checked["event"]
    path = facts_path(os_root)
    existing = _read_log(path)
    keys = {row.get("idempotency_key") for row in existing}
    duplicated = event["idempotency_key"] in keys
    if not duplicated:
        _append(path, event)
        existing.append(event)
    folded = _fold(existing)
    workers = _write_projections(os_root, folded)
    slot = folded["by_key"].get(event["key"])
    current = slot["current"] if slot else None
    return {
        "ok": True,
        "evens_paste": False,
        "duplicated": duplicated,
        "appended": not duplicated,
        "log_count": len(existing),
        "delivered_to": workers,
        "current": _public_current(current) if current else None,
        "conflicts": list(slot["conflicts"]) if slot else [],
        "adapters_needing_work": (current or {}).get("adapters_needing_work"),
    }


def propagate_root(os_root: Path) -> dict[str, Any]:
    """Rebuild projections from the log. Does not append. Reconnect-safe."""
    existing = _read_log(facts_path(os_root))
    folded = _fold(existing)
    workers = _write_projections(os_root, folded) if existing else _clear_projections(os_root)
    return {
        "ok": True,
        "evens_paste": False,
        "facts": len({row["key"] for row in existing if row.get("key")}),
        "log_count": len(existing),
        "workers": workers,
    }


def _validate(fact: dict[str, Any]) -> dict[str, Any]:
    if not isinstance(fact, dict):
        return {"ok": False, "error": "fact_must_be_object"}
    schema = fact.get("schema") or SCHEMA
    if schema != SCHEMA:
        return {"ok": False, "error": "unknown_schema", "schema": schema}
    kind = str(fact.get("kind") or "fact")
    if kind not in ("fact", "capability"):
        return {"ok": False, "error": "unknown_kind", "kind": kind}
    fact_id = str(fact.get("fact_id") or "").strip()
    key = str(fact.get("key") or "").strip()
    platform = str(fact.get("platform") or "").strip()
    learned_at = str(fact.get("learned_at") or "").strip()
    if not fact_id or not key:
        return {"ok": False, "error": "missing_fact_id_or_key"}
    if platform == "evens" or platform not in LEARNER_PLATFORMS:
        return {"ok": False, "error": "evens_is_not_the_bus" if platform == "evens" else "unknown_platform"}
    if _parse_time(learned_at) is None:
        return {"ok": False, "error": "bad_learned_at"}
    try:
        version = int(fact["version"])
    except (KeyError, TypeError, ValueError):
        return {"ok": False, "error": "bad_version"}
    if version < 1:
        return {"ok": False, "error": "bad_version"}
    value = strip_secrets(str(fact.get("value") or "")).strip()
    if not value:
        return {"ok": False, "error": "missing_value"}
    if len(value) > VALUE_LIMIT:
        return {"ok": False, "error": "value_too_long"}
    audience = fact.get("audience")
    if not isinstance(audience, list) or not audience:
        return {"ok": False, "error": "audience_required"}
    workers: list[str] = []
    for raw in audience:
        worker = str(raw).strip()
        if worker.lower() in BROADCAST:
            return {"ok": False, "error": "broadcast_refused", "worker": worker}
        if not WORKER_RE.match(worker):
            return {"ok": False, "error": "bad_worker", "worker": worker}
        if worker not in workers:
            workers.append(worker)
    adapters_needing_work: list[str] | None = None
    adapters_out: dict[str, str] | None = None
    if kind == "capability":
        adapters = fact.get("adapters")
        if not isinstance(adapters, dict):
            return {"ok": False, "error": "capability_missing_adapters", "missing": list(NATIVE_ADAPTERS)}
        missing = [name for name in NATIVE_ADAPTERS if name not in adapters]
        if missing:
            return {"ok": False, "error": "capability_missing_adapters", "missing": missing}
        extra = [name for name in adapters if name not in NATIVE_ADAPTERS]
        if extra:
            return {"ok": False, "error": "unknown_adapter", "adapters": extra}
        adapters_out = {}
        for name in NATIVE_ADAPTERS:
            state = str(adapters[name]).strip()
            if state in REFUSED_STATES:
                return {"ok": False, "error": "self_certification_refused", "adapter": name, "state": state}
            if state not in ADAPTER_STATES:
                return {"ok": False, "error": "bad_adapter_state", "adapter": name, "state": state}
            adapters_out[name] = state
        adapters_needing_work = [name for name in NATIVE_ADAPTERS if adapters_out[name] in NEEDS_WORK_STATES]
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]
    event: dict[str, Any] = {
        "schema": SCHEMA,
        "kind": kind,
        "fact_id": fact_id,
        "key": key,
        "value": value,
        "platform": platform,
        "learned_at": learned_at,
        "version": version,
        "audience": workers,
        "idempotency_key": f"{fact_id}:{version}:{digest}:{platform}",
    }
    if adapters_out is not None:
        event["adapters"] = adapters_out
        event["adapters_needing_work"] = adapters_needing_work
    return {"ok": True, "event": event}


def _parse_time(value: str) -> datetime | None:
    text = value.strip()
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def _read_log(path: Path) -> list[dict[str, Any]]:
    if not path.is_file():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        rows.append(json.loads(line))
    return rows


def _append(path: Path, event: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, sort_keys=True) + "\n")


def _fold(events: list[dict[str, Any]]) -> dict[str, Any]:
    by_key: dict[str, dict[str, Any]] = {}
    for event in events:
        slot = by_key.setdefault(event["key"], {"current": None, "history": [], "conflicts": []})
        current = slot["current"]
        if current is None:
            slot["current"] = event
            continue
        if event["idempotency_key"] == current["idempotency_key"]:
            continue
        if _same_current(event, current):
            continue
        if _is_newer(event, current):
            slot["history"].append(_marked(current, "historical"))
            slot["current"] = event
            continue
        if event["version"] == current["version"] and event["value"] != current["value"]:
            slot["conflicts"].append(_marked(event, "conflict_not_applied"))
            continue
        slot["conflicts"].append(_marked(event, "rejected_stale"))
    return {"by_key": by_key}


def _same_current(event: dict[str, Any], current: dict[str, Any]) -> bool:
    return (
        event["version"] == current["version"]
        and event["value"] == current["value"]
        and event["platform"] == current["platform"]
    )


def _is_newer(event: dict[str, Any], current: dict[str, Any]) -> bool:
    if event["version"] != current["version"]:
        return event["version"] > current["version"]
    event_at = _parse_time(event["learned_at"])
    current_at = _parse_time(current["learned_at"])
    if event_at is None or current_at is None:
        return False
    return event_at > current_at and event["value"] == current["value"]


def _marked(event: dict[str, Any], outcome: str) -> dict[str, Any]:
    return {
        "fact_id": event["fact_id"],
        "key": event["key"],
        "value": event["value"],
        "version": event["version"],
        "platform": event["platform"],
        "learned_at": event["learned_at"],
        "outcome": outcome,
    }


def _public_current(event: dict[str, Any]) -> dict[str, Any]:
    body = {
        "fact_id": event["fact_id"],
        "key": event["key"],
        "kind": event["kind"],
        "learned_at": event["learned_at"],
        "platform": event["platform"],
        "value": event["value"],
        "version": event["version"],
    }
    if event.get("kind") == "capability":
        body["adapters"] = event.get("adapters") or {}
        body["adapters_needing_work"] = list(event.get("adapters_needing_work") or [])
    return body


def _visible(worker: str, event: dict[str, Any]) -> bool:
    if worker == "jarvis":
        return True
    return worker in (event.get("audience") or [])


def _write_projections(os_root: Path, folded: dict[str, Any]) -> list[str]:
    by_key: dict[str, dict[str, Any]] = folded["by_key"]
    workers: set[str] = {"jarvis"}
    for slot in by_key.values():
        current = slot["current"]
        if current:
            workers.update(current.get("audience") or [])
    dest = projections_dir(os_root)
    dest.mkdir(parents=True, exist_ok=True)
    written: list[str] = []
    for worker in sorted(workers):
        facts: dict[str, Any] = {}
        for key in sorted(by_key):
            slot = by_key[key]
            current = slot["current"]
            if not current or not _visible(worker, current):
                continue
            facts[key] = {
                "conflicts": slot["conflicts"],
                "current": _public_current(current),
                "history": slot["history"],
            }
        if not facts and worker != "jarvis":
            continue
        body = {
            "evens_paste": False,
            "facts": facts,
            "schema": SCHEMA,
            "worker": worker,
        }
        projection_path(os_root, worker).write_text(
            json.dumps(body, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        written.append(worker)
    keep = {f"{worker}.json" for worker in written}
    for existing in dest.glob("*.json"):
        if existing.name not in keep:
            existing.unlink()
    return written


def _clear_projections(os_root: Path) -> list[str]:
    dest = projections_dir(os_root)
    if not dest.is_dir():
        return []
    for existing in dest.glob("*.json"):
        existing.unlink()
    return []
