#!/usr/bin/env python3
"""Scoped stop for Face. One cancel record per scope and target.

Stop speaking, stop one tool, stop one job, and stop one mission do not
cancel unrelated work. A second request for the same pair returns the
first receipt and does not kill again.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

SCOPES = ("speak", "tool", "job", "mission")

_STOP = re.compile(
    r"^(?:hey\s+)?(?:jarvis[,.\s]+)?"
    r"(?P<verb>stop|cancel|never mind|forget it|shut up)"
    r"(?:\s+(?:the\s+)?(?P<scope>speaking|speech|tool|job|mission)"
    r"(?:\s+(?P<target>\S+))?)?"
    r"\s*[.!]?\s*$",
    re.I,
)

_BOOK: dict[tuple[str, str], dict] = {}
_KILLED: set[str] = set()
_SEQ = 0
_KILLER = None


def reset_book() -> None:
    global _SEQ
    _BOOK.clear()
    _KILLED.clear()
    _SEQ = 0


def set_killer(fn) -> None:
    global _KILLER
    _KILLER = fn


def parse_stop(utterance: str) -> tuple[str, str] | None:
    match = _STOP.match((utterance or "").strip())
    if not match:
        return None
    raw = (match.group("scope") or "speak").lower()
    if raw in ("speaking", "speech"):
        raw = "speak"
    return raw, (match.group("target") or "")


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


def cancel_once(scope: str, target: str = "", *, hive: Path, killer=None) -> dict:
    """Cancel one named scope. The same scope and target is a no-op the second time."""
    name = (scope or "").strip().lower()
    if name in ("speaking", "speech"):
        name = "speak"
    if name not in SCOPES:
        return {"ok": False, "error": "unknown scope", "scope": name, "spoken": "Stopped."}
    world = load_world(hive)
    resolved = _resolve_target(name, target, world)
    key = (name, resolved)
    if key in _BOOK:
        prior = dict(_BOOK[key])
        prior["already"] = True
        prior["killed"] = False
        return prior
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
        "cancel_id": _next_id(),
        "already": False,
        "killed": killed,
        "spoken": spoken,
        "jobs": jobs,
    }
    _BOOK[key] = dict(receipt)
    return receipt
