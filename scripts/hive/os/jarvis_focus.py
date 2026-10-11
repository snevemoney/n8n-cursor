#!/usr/bin/env python3
"""Focus capacity on the existing hive job list.

The Face Focus control stays an attention lock: "focus" / "focus 25", the Orb
Focus button, the frontmost-app clock, one drift callout per episode, the
relief valve, and the stand-down score. This module does not replace those
doors and does not write a mission store.

When that lock fits Matrix mission priority, Focus means one primary outcome
and the critical path that unlocks it. Unrelated work does not receive capacity.
Jobs are read from the hive state.json job list the rest of the hive already uses.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
STATE_PATH = ROOT / "docs/hive/outer-heaven/.hive/state.json"

CLOSED = frozenset({"done", "archived", "cancelled", "canceled", "killed", "ignored"})
SESSION_KEYS = ("locked_app", "minutes", "drifts", "relief", "stand_down", "pump_seconds")
# Founder gate default sentence. It describes the path; it is not a job id.
PATH_SENTENCE = "finish the open outcome before starting another"


def job_id(job: dict[str, Any]) -> str:
    return str(job.get("id") or job.get("name") or "").strip()


def is_open(job: dict[str, Any]) -> bool:
    status = str(job.get("status") or job.get("state") or "open").strip().lower()
    return status not in CLOSED


def load_jobs(path: Path | None = None) -> list[dict[str, Any]]:
    """Read the existing job list. Never writes."""
    source = path or STATE_PATH
    if not source.is_file():
        return []
    try:
        data = json.loads(source.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if not isinstance(data, dict):
        return []
    rows = data.get("jobs")
    if not isinstance(rows, list):
        return []
    return [row for row in rows if isinstance(row, dict)]


def _open_jobs(jobs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [job for job in jobs if job_id(job) and is_open(job)]


def _depends_on(job: dict[str, Any]) -> list[str]:
    raw = job.get("depends_on") or []
    if not isinstance(raw, list):
        return []
    return [str(item).strip() for item in raw if str(item).strip()]


def _marked_primary(job: dict[str, Any]) -> bool:
    if job.get("primary") is True:
        return True
    return str(job.get("role") or "").strip().lower() == "primary"


def _has_named_outcome(job: dict[str, Any]) -> bool:
    return bool(str(job.get("outcome") or job.get("goal") or "").strip())


def _sort_key(job: dict[str, Any]) -> tuple[str, str]:
    """Oldest updated, then id. A newer job does not steal the lock."""
    updated = str(job.get("updated") or job.get("created_at") or "9999-99-99")
    return (updated, job_id(job))


def pick_primary(jobs: list[dict[str, Any]]) -> dict[str, Any] | None:
    """One open outcome. Explicit primary wins. Otherwise the root of the open graph."""
    open_jobs = _open_jobs(jobs)
    if not open_jobs:
        return None
    marked = [job for job in open_jobs if _marked_primary(job)]
    if len(marked) == 1:
        return marked[0]
    pool = marked or open_jobs
    named = [job for job in pool if _has_named_outcome(job)]
    if len(named) == 1:
        return named[0]
    if named:
        pool = named
    depended: set[str] = set()
    by_id = {job_id(job): job for job in open_jobs}
    for job in open_jobs:
        for dep in _depends_on(job):
            if dep in by_id and dep != job_id(job):
                depended.add(dep)
    roots = [job for job in pool if job_id(job) not in depended]
    return _stable_root(roots or pool)


def _stable_root(choices: list[dict[str, Any]]) -> dict[str, Any]:
    """A newer chain does not replace an older open outcome."""
    return sorted(choices, key=_sort_key)[0]


def critical_path(primary: dict[str, Any] | None, jobs: list[dict[str, Any]]) -> list[str]:
    """Bottleneck first, outcome last. A named list on the job is kept."""
    if primary is None:
        return []
    named = primary.get("critical_path")
    if isinstance(named, list):
        path = [str(item).strip() for item in named if str(item).strip() and str(item).strip() != PATH_SENTENCE]
        if path:
            return _open_named_path(path, primary, jobs)
    by_id = {job_id(job): job for job in jobs if job_id(job)}
    if isinstance(named, str):
        text = named.strip()
        if text and text != PATH_SENTENCE and text in by_id:
            return _open_named_path([text], primary, jobs)
    seen: set[str] = set()
    leaves: list[str] = []
    current: dict[str, Any] | None = primary
    while current is not None:
        cid = job_id(current)
        if not cid or cid in seen:
            break
        seen.add(cid)
        nxt = None
        for dep in _depends_on(current):
            candidate = by_id.get(dep)
            if candidate is not None and is_open(candidate) and dep not in seen:
                nxt = candidate
                break
        if nxt is None:
            break
        leaves.append(job_id(nxt))
        current = nxt
    leaves.reverse()
    outcome = job_id(primary)
    if outcome and outcome not in leaves:
        leaves.append(outcome)
    return leaves


def _open_named_path(path: list[str], primary: dict[str, Any], jobs: list[dict[str, Any]]) -> list[str]:
    by_id = {job_id(job): job for job in jobs if job_id(job)}
    kept: list[str] = []
    for step in path:
        job = by_id.get(step)
        if job is None or is_open(job):
            kept.append(step)
    outcome = job_id(primary)
    if outcome and outcome not in kept and is_open(primary):
        kept.append(outcome)
    return kept


def bottleneck(path: list[str]) -> str | None:
    return path[0] if path else None


def _steal_reason(work: dict[str, Any], primary: dict[str, Any] | None, on_path: bool) -> str | None:
    if primary is None or on_path:
        return None
    if work.get("odd_case"):
        return "one odd case does not take the day"
    if not work.get("wants_new_partial"):
        return None
    try:
        partials = int(work.get("partial_count") or 0)
        finished = int(work.get("finished_outcomes") or 0)
    except (TypeError, ValueError):
        return None
    if partials >= 1 and finished < 1:
        return "unfinished partials do not beat the open outcome"
    return None


def capacity_for(work: dict[str, Any] | None, jobs: list[dict[str, Any]]) -> dict[str, Any]:
    """Grant capacity only to the current bottleneck of the one open outcome."""
    item = work or {}
    wid = str(item.get("id") or item.get("name") or "").strip()
    primary = pick_primary(jobs)
    path = critical_path(primary, jobs)
    step = bottleneck(path)
    on_path = bool(wid) and wid in path
    steal = _steal_reason(item, primary, on_path)
    if primary is None:
        return {
            "capacity": False,
            "decision": "NO_PRIMARY",
            "reason": "no open outcome",
            "primary_outcome": None,
            "critical_path": [],
            "bottleneck": None,
        }
    outcome = {
        "id": job_id(primary),
        "name": str(primary.get("outcome") or primary.get("goal") or primary.get("name") or job_id(primary)),
    }
    if steal:
        return {
            "capacity": False,
            "decision": "HOLD",
            "reason": steal,
            "primary_outcome": outcome,
            "critical_path": path,
            "bottleneck": step,
        }
    if wid and wid == step:
        return {
            "capacity": True,
            "decision": "ON_PATH",
            "reason": "bottleneck of the open outcome",
            "primary_outcome": outcome,
            "critical_path": path,
            "bottleneck": step,
        }
    if on_path:
        return {
            "capacity": False,
            "decision": "LATER",
            "reason": "later on the critical path",
            "primary_outcome": outcome,
            "critical_path": path,
            "bottleneck": step,
        }
    return {
        "capacity": False,
        "decision": "HOLD",
        "reason": "unrelated work does not steal capacity",
        "primary_outcome": outcome,
        "critical_path": path,
        "bottleneck": step,
    }


def focus_report(
    jobs: list[dict[str, Any]] | None = None,
    session: dict[str, Any] | None = None,
    work: dict[str, Any] | None = None,
    path: Path | None = None,
) -> dict[str, Any]:
    """Session fields from the Face Focus control pass through unchanged."""
    rows = jobs if jobs is not None else load_jobs(path)
    kept = {key: (session or {})[key] for key in SESSION_KEYS if key in (session or {})}
    gate = capacity_for(work, rows)
    return {
        "focus_control": "unchanged",
        "session": kept,
        **gate,
    }


def _check(label: str, ok: bool, fails: list[str]) -> None:
    if not ok:
        fails.append(label)


def self_test() -> int:
    fails: list[str] = []
    jobs = [
        {"id": "outcome-alpha", "name": "ship the conversation", "status": "working", "outcome": "conversation path", "depends_on": ["step-b"], "updated": "2026-09-01"},
        {"id": "step-b", "status": "working", "depends_on": ["step-c"], "updated": "2026-09-02"},
        {"id": "step-c", "status": "working", "updated": "2026-09-03"},
        {"id": "side-quest", "status": "working", "updated": "2026-09-25"},
        {"id": "closed-old", "status": "done", "primary": True, "updated": "2026-01-01"},
    ]
    report = focus_report(
        jobs,
        session={"locked_app": "Cursor", "minutes": 25, "drifts": 1, "relief": True, "stand_down": False, "pump_seconds": 5},
        work={"id": "step-c"},
    )
    _check("session lock kept", report["session"].get("locked_app") == "Cursor" and report["session"].get("minutes") == 25, fails)
    _check("relief kept", report["session"].get("relief") is True and report["session"].get("pump_seconds") == 5, fails)
    _check("control unchanged", report["focus_control"] == "unchanged", fails)
    _check("one primary", report["primary_outcome"]["id"] == "outcome-alpha", fails)
    _check("path bottleneck first", report["critical_path"] == ["step-c", "step-b", "outcome-alpha"], fails)
    _check("bottleneck has capacity", report["capacity"] is True and report["bottleneck"] == "step-c", fails)

    side = capacity_for({"id": "side-quest"}, jobs)
    _check("unrelated held", side["capacity"] is False and side["reason"] == "unrelated work does not steal capacity", fails)
    later = capacity_for({"id": "outcome-alpha"}, jobs)
    _check("later step waits", later["capacity"] is False and later["decision"] == "LATER", fails)
    prefix = capacity_for({"id": "step"}, jobs)
    _check("prefix is not the step", prefix["capacity"] is False, fails)

    named = [
        {"id": "goal-k", "status": "open", "primary": True, "critical_path": ["leaf-k", "mid-k"], "updated": "2026-09-01"},
        {"id": "leaf-k", "status": "done"},
        {"id": "mid-k", "status": "working"},
        {"id": "other-k", "status": "working", "primary": True, "updated": "2026-09-20"},
    ]
    named_gate = capacity_for({"id": "mid-k"}, named)
    _check("named path kept", named_gate["critical_path"] == ["mid-k", "goal-k"], fails)
    _check("named bottleneck", named_gate["capacity"] is True and named_gate["primary_outcome"]["id"] == "goal-k", fails)

    partials = capacity_for({"id": "fresh-partial", "wants_new_partial": True, "partial_count": 5, "finished_outcomes": 0}, jobs)
    _check("five partials held", partials["capacity"] is False and "partial" in partials["reason"], fails)
    odd = capacity_for({"id": "odd-one", "odd_case": True}, jobs)
    _check("odd case held", odd["capacity"] is False and "odd case" in odd["reason"], fails)

    empty = capacity_for({"id": "anything"}, [{"id": "old", "status": "done"}])
    _check("no invented mission", empty["decision"] == "NO_PRIMARY" and empty["primary_outcome"] is None, fails)
    deep = capacity_for(
        {"id": "deep-leaf"},
        [
            {"id": "kept", "status": "working", "updated": "2026-01-01"},
            {"id": "deep", "status": "working", "updated": "2026-09-01", "depends_on": ["deep-leaf"]},
            {"id": "deep-leaf", "status": "working", "updated": "2026-09-02"},
        ],
    )
    _check("newer chain does not steal", deep["capacity"] is False and deep["primary_outcome"]["id"] == "kept", fails)
    oldest = capacity_for(
        {"id": "newer"},
        [
            {"id": "older", "status": "working", "updated": "2026-01-01"},
            {"id": "newer", "status": "working", "updated": "2026-09-01"},
        ],
    )
    _check("older outcome keeps the lock", oldest["capacity"] is False and oldest["primary_outcome"]["id"] == "older", fails)
    sentence = capacity_for(
        {"id": "only-open"},
        [{"id": "only-open", "status": "working", "critical_path": PATH_SENTENCE}],
    )
    _check("path sentence is not a job", sentence["capacity"] is True and sentence["critical_path"] == ["only-open"], fails)
    described = capacity_for(
        {"id": "only-open"},
        [{"id": "only-open", "status": "working", "critical_path": "finish the disk sentence"}],
    )
    _check("description is not an id", described["bottleneck"] == "only-open" and described["capacity"] is True, fails)

    pair = [
        {"id": "harbor", "status": "working", "goal": "harbor outcome", "depends_on": ["dock"], "updated": "2026-08-01"},
        {"id": "dock", "status": "working", "updated": "2026-08-02"},
        {"id": "studio", "status": "working", "updated": "2026-08-03"},
    ]
    harbor = capacity_for({"id": "dock"}, pair)
    studio = capacity_for({"id": "studio"}, pair)
    _check("second pair bottleneck", harbor["capacity"] is True and harbor["primary_outcome"]["id"] == "harbor", fails)
    _check("second pair unrelated", studio["capacity"] is False and studio["primary_outcome"]["id"] == "harbor", fails)

    if STATE_PATH.is_file():
        before = STATE_PATH.read_bytes()
        loaded = load_jobs()
        after = STATE_PATH.read_bytes()
        _check("state.json unread as a write", before == after and isinstance(loaded, list), fails)

    if fails:
        print("jarvis-focus self-test: FAIL")
        for label in fails:
            print(f"  {label}")
        return 1
    print("jarvis-focus self-test: OK")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--work", help="Work JSON. Capacity is decided against the existing job list.")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    work = json.loads(args.work) if args.work else None
    if work is not None and not isinstance(work, dict):
        print("refuse: work must be an object", file=sys.stderr)
        return 2
    print(json.dumps(focus_report(work=work), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
