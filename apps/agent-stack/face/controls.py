#!/usr/bin/env python3
"""Scoped stop and Watch for Face. One cancel record per scope and target.

Stop speaking, stop one tool, stop one job, and stop one mission do not
cancel unrelated work. A second request for the same pair returns the
first receipt and does not kill again.

Watch is this same control owner. One local observation per call. No loop,
no sleep, no second bus, no second store. The record lives on the Face bus.
A change is appended to scripts/hive/os/event-bus.py, then Jarvis speaks
the value read back from that event.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import threading
from datetime import datetime, timezone
from pathlib import Path

SCOPES = ("speak", "tool", "job", "mission", "watch")
SOURCE_ID = "local_test_value"
LOCAL_TEST_FILE = "local-test-value.txt"
WATCHING_LINE = "Watching. I'll tell you when it changes."

_STOP = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?"
    r"(?P<verb>stop|cancel|never mind|forget it|shut up)"
    r"(?:\s+(?:the\s+)?(?P<scope>speaking|speech|tool|job|mission|watch|watching)"
    r"(?:\s+(?P<target>\S+))?)?"
    r"\s*[.!?]*\s*$",
    re.I,
)
_WATCH = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?(?:please\s+)?"
    r"watch\s+(?P<target>.+?)\s+and\s+tell\s+me\s+when\s+it\s+changes"
    r"\s*[.!?]*\s*$",
    re.I,
)
_WATCH_STATUS = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?(?:please\s+)?"
    r"(?:what(?:'s| is) the watch status|watch status|is the watch active|is it (?:still )?watching)"
    r"\s*[.!?]*\s*$",
    re.I,
)
_EVENT_BUS = None
_PIPELINE = None

_BOOK: dict[tuple[str, str], dict] = {}
_KILLED: set[str] = set()
_SEQ = 0
_KILLER = None
_LOCK = threading.Lock()


def reset_book() -> None:
    global _SEQ
    with _LOCK:
        _BOOK.clear()
        _KILLED.clear()
        _SEQ = 0


def set_killer(fn) -> None:
    global _KILLER
    with _LOCK:
        _KILLER = fn


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_stop(utterance: str) -> tuple[str, str, str] | None:
    """Return (verb, scope, target). Bare stop/cancel stays scope speak."""
    match = _STOP.match((utterance or "").strip())
    if not match:
        return None
    verb = (match.group("verb") or "stop").lower()
    raw = (match.group("scope") or "speak").lower()
    if raw in ("speaking", "speech"):
        raw = "speak"
    if raw == "watching":
        raw = "watch"
    return verb, raw, (match.group("target") or "")


def parse_watch(utterance: str) -> str | None:
    """Natural 'Watch … and tell me when it changes.' Anything else is not a Watch."""
    match = _WATCH.match((utterance or "").strip())
    if not match:
        return None
    target = (match.group("target") or "").strip()
    return target or None


def parse_watch_status(utterance: str) -> bool:
    return bool(_WATCH_STATUS.match((utterance or "").strip()))


def local_test_path(hive: Path) -> Path:
    return hive / "bus" / LOCAL_TEST_FILE


def read_local_test_value(hive: Path) -> str:
    """Missing file is the slice initial value A. Not a new store."""
    path = local_test_path(hive)
    if not path.is_file():
        return "A"
    text = path.read_text(encoding="utf-8").strip()
    return text or "A"


def set_local_test_value(hive: Path, value: str) -> dict:
    """Write the local source. Does not observe. The Watch must already exist."""
    text = (value or "").strip()
    if not text or any(ch in text for ch in "\n\r") or len(text) > 80:
        return {"ok": False, "error": "value must be one short line"}
    path = local_test_path(hive)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text + "\n", encoding="utf-8")
    return {"ok": True, "source": SOURCE_ID, "value": text}


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _event_bus():
    """Canonical bus. Not a second bus."""
    global _EVENT_BUS
    if _EVENT_BUS is None:
        path = Path(__file__).resolve().parents[3] / "scripts" / "hive" / "os" / "event-bus.py"
        _EVENT_BUS = _load_module("hive_event_bus_watch", path)
    return _EVENT_BUS


def _pipeline():
    global _PIPELINE
    if _PIPELINE is None:
        path = Path(__file__).resolve().parents[1] / "brain" / "pipeline.py"
        _PIPELINE = _load_module("agent_stack_pipeline_watch", path)
    return _PIPELINE


def resolve_event_path(event_path: Path | None = None) -> Path:
    if event_path is not None:
        return event_path
    override = (os.environ.get("WATCH_EVENT_PATH") or "").strip()
    if override:
        return Path(override)
    return _event_bus().DEFAULT_PATH


def _watches(bus: dict) -> dict:
    raw = bus.get("watches")
    return raw if isinstance(raw, dict) else {}


def _active_watch(bus: dict) -> dict | None:
    active = [row for row in _watches(bus).values() if isinstance(row, dict) and row.get("status") == "active"]
    return active[-1] if active else None


def _latest_watch(bus: dict) -> dict | None:
    rows = [row for row in _watches(bus).values() if isinstance(row, dict)]
    return rows[-1] if rows else None


def _watch_for_stop(bus: dict, target: str) -> dict | None:
    named = (target or "").strip()
    watches = _watches(bus)
    if named:
        hit = watches.get(named)
        if isinstance(hit, dict):
            return hit
        for row in watches.values():
            if isinstance(row, dict) and str(row.get("target") or "") == named:
                return row
        return None
    return _active_watch(bus) or _latest_watch(bus)


def _owners(bus: dict) -> tuple[str, str]:
    """Read the mission and session already on the Face bus. Do not open a new mission store."""
    mission = str(bus.get("mission_id") or "").strip()
    if not mission:
        jobs = bus.get("jobs") if isinstance(bus.get("jobs"), dict) else {}
        owner = str(bus.get("tool_owner_job") or "")
        job = jobs.get(owner) if owner else None
        if isinstance(job, dict) and job.get("mission"):
            mission = str(job.get("mission"))
    session = str(bus.get("jarvis_chat_id") or bus.get("session_id") or "face").strip() or "face"
    return mission or "current", session


def _summary(watch: dict | None) -> dict:
    if not isinstance(watch, dict):
        return {"active": False, "status": "absent", "watch_id": None, "current_state": None}
    active = watch.get("status") == "active"
    return {
        "watch_id": watch.get("watch_id"),
        "active": active,
        "status": "active" if active else "stopped",
        "condition": watch.get("condition"),
        "source": watch.get("source"),
        "target": watch.get("target"),
        "owner_mission": watch.get("owner_mission"),
        "owner_session": watch.get("owner_session"),
        "created_at": watch.get("created_at"),
        "last_observation": watch.get("last_observation"),
        "current_state": watch.get("current_state"),
        "notified_value": watch.get("notified_value"),
        "notify_count": int(watch.get("notify_count") or 0),
    }


def _store_watch(bus: dict, watch: dict) -> None:
    watches = _watches(bus)
    watches[str(watch["watch_id"])] = watch
    bus["watches"] = watches
    bus["watch"] = _summary(watch)
    bus["watch_active"] = bool(bus["watch"]["active"])


def watch_status(hive: Path) -> dict:
    """Whether a Watch is active, plus the stored fields. Does not observe."""
    bus = _read_bus(hive)
    watch = _active_watch(bus) or _latest_watch(bus)
    summary = _summary(watch)
    if summary["status"] == "absent":
        spoken = "No watch is active."
    elif summary["active"]:
        spoken = "The watch is active."
    else:
        spoken = "The watch is stopped."
    return {"ok": True, "spoken": spoken, **summary}


def create_watch(hive: Path, *, target: str, utterance: str = "") -> dict:
    """Persist one Watch for the local test source. A second active Watch is the same record."""
    named = (target or "").strip()
    if not named:
        return {"ok": False, "error": "target required", "spoken": ""}
    with _LOCK:
        bus = _read_bus(hive)
        existing = _active_watch(bus)
        if existing and existing.get("source") == SOURCE_ID:
            _store_watch(bus, existing)
            _write_bus(hive, bus)
            return {
                "ok": True,
                "already": True,
                "active": True,
                "spoken": WATCHING_LINE,
                **_summary(existing),
            }
        initial = read_local_test_value(hive)
        mission, session = _owners(bus)
        seq = int(bus.get("watch_seq") or 0) + 1
        bus["watch_seq"] = seq
        watch = {
            "watch_id": f"watch-{seq}",
            "condition": "changes",
            "source": SOURCE_ID,
            "target": named,
            "owner_mission": mission,
            "owner_session": session,
            "created_at": _now(),
            "last_observation": initial,
            "current_state": initial,
            "status": "active",
            "notified_value": None,
            "notify_count": 0,
            "event_id": None,
            "utterance": (utterance or "").strip(),
        }
        _store_watch(bus, watch)
        _write_bus(hive, bus)
        return {"ok": True, "already": False, "active": True, "spoken": WATCHING_LINE, **_summary(watch)}


def _job_snapshot(hive: Path) -> dict:
    world = load_world(hive)
    return {job_id: _job_status(hive, str(job_id), world) for job_id in world["jobs"]}


def _stop_watch_locked(hive: Path, target: str = "") -> dict:
    """Stop one Watch. Jobs and other missions stay as they are."""
    bus = _read_bus(hive)
    watch = _watch_for_stop(bus, target)
    jobs = _job_snapshot(hive)
    if watch is None:
        return {
            "ok": True,
            "verb": "stop",
            "scope": "watch",
            "target": (target or "").strip(),
            "stopped": False,
            "already": False,
            "active": False,
            "killed": False,
            "spoken": "No watch is active.",
            "jobs": jobs,
        }
    if watch.get("status") != "active":
        return {
            "ok": True,
            "verb": "stop",
            "scope": "watch",
            "target": str(watch.get("watch_id") or target),
            "watch_id": watch.get("watch_id"),
            "stopped": False,
            "already": True,
            "active": False,
            "killed": False,
            "spoken": "Stopped.",
            "jobs": jobs,
        }
    watch["status"] = "stopped"
    _store_watch(bus, watch)
    _write_bus(hive, bus)
    return {
        "ok": True,
        "verb": "stop",
        "scope": "watch",
        "target": str(watch.get("watch_id") or ""),
        "watch_id": watch.get("watch_id"),
        "stopped": True,
        "already": False,
        "active": False,
        "killed": False,
        "spoken": "Stopped.",
        "jobs": _job_snapshot(hive),
    }


def stop_watch(hive: Path, target: str = "") -> dict:
    with _LOCK:
        return _stop_watch_locked(hive, target)


def _emit_and_receive(watch: dict, value: str, event_path: Path) -> dict:
    """Append on the canonical bus, then read that row back. That read is Jarvis receiving it."""
    bus_mod = _event_bus()
    event_id = f"watch:{watch['watch_id']}:{value}"
    event = {
        "event_id": event_id,
        "type": "project.state_changed",
        "source": SOURCE_ID,
        "actor": "jarvis",
        "priority": "P2",
        "payload": {
            "watch_id": watch["watch_id"],
            "value": value,
            "source": watch["source"],
            "condition": watch["condition"],
            "owner_mission": watch["owner_mission"],
            "owner_session": watch["owner_session"],
        },
        "sensitivity": "internal",
    }
    _inserted, eid = bus_mod.append_event(event, path=event_path)
    for row in reversed(bus_mod.tail(event_path, 40)):
        if row.get("event_id") == eid:
            return row
    raise RuntimeError("watch event was not on the bus")


def _receipt(hive: Path, turn_input: str, turn_output: str) -> None:
    try:
        _pipeline().write_receipt(hive, turn_input=turn_input, turn_output=turn_output)
    except (OSError, TypeError, AttributeError, RuntimeError):
        return


def ack_notice(hive: Path, event_id: str) -> dict:
    """Face marks one spoken notice delivered so a reload does not say it again."""
    eid = (event_id or "").strip()
    if not eid:
        return {"ok": False, "error": "event_id required"}
    with _LOCK:
        bus = _read_bus(hive)
        notice = bus.get("watch_notice")
        if not isinstance(notice, dict) or notice.get("event_id") != eid:
            return {"ok": True, "delivered": False, "event_id": eid}
        notice["delivered"] = True
        bus["watch_notice"] = notice
        _write_bus(hive, bus)
        return {"ok": True, "delivered": True, "event_id": eid}


def observe_once(hive: Path, *, event_path: Path | None = None) -> dict:
    """One bounded look at the local test value. No loop and no sleep."""
    with _LOCK:
        bus = _read_bus(hive)
        watch = _active_watch(bus)
        if watch is None:
            latest = _latest_watch(bus)
            summary = _summary(latest)
            return {
                "ok": True,
                "active": False,
                "status": summary["status"],
                "changed": False,
                "notified": False,
                "spoken": "",
                "watch_id": summary.get("watch_id"),
                "current_state": summary.get("current_state"),
            }
        value = read_local_test_value(hive)
        previous = str(watch.get("last_observation") or "")
        changed = value != previous
        already = int(watch.get("notify_count") or 0) > 0 and str(watch.get("notified_value") or "") == value
        if not changed:
            return {
                "ok": True,
                "active": True,
                "status": "active",
                "changed": False,
                "notified": False,
                "spoken": "",
                "watch_id": watch.get("watch_id"),
                "current_state": previous,
                "event_id": watch.get("event_id"),
            }
        if already:
            watch["current_state"] = value
            watch["last_observation"] = value
            _store_watch(bus, watch)
            _write_bus(hive, bus)
            return {
                "ok": True,
                "active": True,
                "status": "active",
                "changed": True,
                "notified": False,
                "spoken": "",
                "watch_id": watch.get("watch_id"),
                "current_state": value,
                "event_id": watch.get("event_id"),
            }
        path = resolve_event_path(event_path)
        row = _emit_and_receive(watch, value, path)
        payload = row.get("payload") if isinstance(row.get("payload"), dict) else {}
        spoken = str(payload.get("value") or "")
        if spoken != value:
            return {
                "ok": False,
                "active": True,
                "status": "active",
                "changed": True,
                "notified": False,
                "spoken": "",
                "error": "event value mismatch",
                "watch_id": watch.get("watch_id"),
                "current_state": previous,
            }
        watch["current_state"] = spoken
        watch["last_observation"] = spoken
        watch["notified_value"] = spoken
        watch["notify_count"] = int(watch.get("notify_count") or 0) + 1
        watch["event_id"] = row.get("event_id")
        _store_watch(bus, watch)
        bus["spoken"] = spoken
        bus["phase"] = "speak"
        bus["watch_notice"] = {
            "event_id": row.get("event_id"),
            "spoken": spoken,
            "watch_id": watch.get("watch_id"),
            "delivered": False,
        }
        _write_bus(hive, bus)
    _receipt(hive, f"watch {watch['watch_id']} changed", spoken)
    return {
        "ok": True,
        "active": True,
        "status": "active",
        "changed": True,
        "notified": True,
        "spoken": spoken,
        "watch_id": watch.get("watch_id"),
        "current_state": spoken,
        "event_id": row.get("event_id"),
        "event": row,
    }


def _next_id() -> str:
    global _SEQ
    _SEQ += 1
    return f"cancel-{_SEQ}"


def _read_bus(hive: Path) -> dict:
    path = hive / "bus" / "state.json"
    if not path.is_file():
        return {}
    try:
        data = json.loads(path.read_text(encoding="utf-8") or "{}")
    except json.JSONDecodeError:
        return {}
    return data if isinstance(data, dict) else {}


def _write_bus(hive: Path, bus: dict) -> None:
    path = hive / "bus" / "state.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(bus, indent=2) + "\n", encoding="utf-8")


def _patch(hive: Path, mutator) -> dict:
    bus = _read_bus(hive)
    mutator(bus)
    _write_bus(hive, bus)
    return bus


def load_world(hive: Path) -> dict:
    bus = _read_bus(hive)
    jobs = bus.get("jobs") if isinstance(bus.get("jobs"), dict) else {}
    if not jobs:
        job_id = str(bus.get("job_id") or "current")
        mission_id = str(bus.get("mission_id") or "current")
        jobs = {
            job_id: {
                "mission": mission_id,
                "status": str(bus.get("job_status") or "working"),
            }
        }
    missions: dict[str, dict] = {}
    for job_id, job in jobs.items():
        mission_id = "current"
        if isinstance(job, dict) and job.get("mission"):
            mission_id = str(job.get("mission"))
        missions.setdefault(mission_id, {"jobs": []})["jobs"].append(str(job_id))
    owner = str(bus.get("tool_owner_job") or next(iter(jobs)))
    return {
        "active_tool": str(bus.get("active_tool") or "cursor"),
        "tool_owner_job": owner,
        "jobs": jobs,
        "missions": missions,
    }


def _resolve_target(scope: str, target: str, world: dict) -> str:
    named = (target or "").strip()
    if named:
        return named
    if scope == "speak":
        return "mouth"
    if scope == "tool":
        return str(world["active_tool"])
    if scope == "job":
        return str(world["tool_owner_job"])
    owner = str(world["tool_owner_job"])
    job = world["jobs"].get(owner)
    if isinstance(job, dict) and job.get("mission"):
        return str(job.get("mission"))
    return "current"


def _kill_tool_once(tool_id: str, killer) -> bool:
    if tool_id in _KILLED:
        return False
    _KILLED.add(tool_id)
    if killer is None:
        return False
    return bool(killer(tool_id))


def _mark_job(hive: Path, job_id: str) -> None:
    def mut(bus: dict) -> None:
        jobs = bus.get("jobs")
        if not isinstance(jobs, dict):
            jobs = {}
            bus["jobs"] = jobs
        job = jobs.get(job_id)
        if not isinstance(job, dict):
            job = {}
            jobs[job_id] = job
        job["status"] = "cancelled"

    _patch(hive, mut)


def _job_status(hive: Path, job_id: str, world: dict) -> str:
    bus = _read_bus(hive)
    jobs = bus.get("jobs") if isinstance(bus.get("jobs"), dict) else {}
    job = jobs.get(job_id)
    if isinstance(job, dict) and job.get("status"):
        return str(job.get("status"))
    original = world["jobs"].get(job_id)
    if isinstance(original, dict) and original.get("status"):
        return str(original.get("status"))
    return "working"


def _already(receipt: dict) -> dict:
    prior = dict(receipt)
    prior["already"] = True
    prior["killed"] = False
    return prior


def cancel_once(scope: str, target: str = "", *, hive: Path, killer=None) -> dict:
    """Cancel one named scope. The same scope and target is a no-op the second time.

    The book is claimed under a lock before the killer runs. An overlapping
    call waits, then returns that same cancel_id with already set.
    """
    name = (scope or "").strip().lower()
    if name in ("speaking", "speech"):
        name = "speak"
    if name == "watching":
        name = "watch"
    if name not in SCOPES:
        return {"ok": False, "error": "unknown scope", "scope": name, "spoken": "Stopped."}
    with _LOCK:
        if name == "watch":
            return _stop_watch_locked(hive, target)
        world = load_world(hive)
        resolved = _resolve_target(name, target, world)
        key = (name, resolved)
        if key in _BOOK:
            return _already(_BOOK[key])
        cancel_id = _next_id()
        _BOOK[key] = {
            "ok": True,
            "verb": "stop",
            "scope": name,
            "target": resolved,
            "cancel_id": cancel_id,
            "already": False,
            "killed": False,
            "spoken": "Stopped.",
            "jobs": {},
        }
        use_killer = _KILLER if _KILLER is not None else killer
        killed = False
        if name == "speak":
            _patch(hive, lambda bus: bus.__setitem__("speak", "stopped"))
            spoken = "Stopped speaking."
        elif name == "tool":
            if resolved == world["active_tool"]:
                killed = _kill_tool_once(resolved, use_killer)
            spoken = "Stopped that tool."
        elif name == "job":
            _mark_job(hive, resolved)
            if world["tool_owner_job"] == resolved:
                killed = _kill_tool_once(str(world["active_tool"]), use_killer)
            spoken = "Stopped that job."
        else:
            owned = list(world["missions"].get(resolved, {}).get("jobs") or [])
            for job_id in owned:
                _mark_job(hive, job_id)
            if world["tool_owner_job"] in owned:
                killed = _kill_tool_once(str(world["active_tool"]), use_killer)
            spoken = "Stopped that mission."
        jobs = {job_id: _job_status(hive, str(job_id), world) for job_id in world["jobs"]}
        receipt = {
            "ok": True,
            "verb": "stop",
            "scope": name,
            "target": resolved,
            "cancel_id": cancel_id,
            "already": False,
            "killed": killed,
            "spoken": spoken,
            "jobs": jobs,
        }
        _BOOK[key] = dict(receipt)
        return receipt
