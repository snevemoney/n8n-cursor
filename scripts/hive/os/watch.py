#!/usr/bin/env python3
"""Event and state watch for a goal already in motion.

Called when a progress event arrives. It does not sleep, does not poll, and
does not start a process. The live Face campaign watcher (`watch_bus` in the
Face capture driver, listener pid 8217) is a different process. This module
does not replace it and does not type on Face.

Healthy progress stays quiet. Completion marks the open dependency done and
starts the next one that is already unblocked. A stall is investigated here.
Exact facts (pid, row count, finished) are read from the event. They are not
sent to Jev.
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

STALL_SECONDS = 90
FACE_TYPER_IDS = frozenset(
    {
        "face-typer",
        "face_typer",
        "second-typer",
        "second_typer",
        "type-on-face",
        "drive.mjs",
        "capture.py",
    }
)


def _parse_time(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value.strip():
        return None
    text = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _age_seconds(last: Any, now: Any) -> float | None:
    start = _parse_time(last)
    end = _parse_time(now)
    if start is None or end is None:
        return None
    return (end - start).total_seconds()


def _int(value: Any) -> int | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return int(value)


def _snapshot(state: dict[str, Any] | None, event: dict[str, Any] | None) -> dict[str, Any]:
    snap: dict[str, Any] = {}
    if isinstance(state, dict):
        snap.update(state)
    if isinstance(event, dict):
        snap.update(event)
    return snap


def _dependencies(raw: Any) -> list[dict[str, Any]]:
    if not isinstance(raw, list):
        return []
    rows: list[dict[str, Any]] = []
    previous: str | None = None
    for item in raw:
        if isinstance(item, str) and item.strip():
            dep_id = item.strip()
            rows.append(
                {
                    "id": dep_id,
                    "depends_on": [previous] if previous else [],
                    "started": False,
                    "done": False,
                }
            )
            previous = dep_id
            continue
        if not isinstance(item, dict) or not str(item.get("id") or "").strip():
            continue
        depends = item.get("depends_on") or []
        if isinstance(depends, str):
            depends = [depends]
        rows.append(
            {
                "id": str(item["id"]).strip(),
                "depends_on": [str(dep) for dep in depends if str(dep).strip()],
                "started": item.get("started") is True,
                "done": item.get("done") is True,
            }
        )
    return rows


def _face_typer(dep_id: str) -> bool:
    return dep_id.strip().lower() in FACE_TYPER_IDS


def _start_next(deps: list[dict[str, Any]], current: str) -> tuple[list[dict[str, Any]], list[str], str | None]:
    updated = [dict(item) for item in deps]
    marked = False
    if current:
        for item in updated:
            if item["id"] == current:
                item["done"] = True
                marked = True
    if not marked:
        for item in updated:
            if item["started"] and not item["done"]:
                item["done"] = True
                break
    started: list[str] = []
    refused: str | None = None
    for item in updated:
        if item["done"] or item["started"]:
            continue
        ready = all(
            any(row["id"] == need and row["done"] for row in updated) for need in item["depends_on"]
        )
        if not ready:
            continue
        if _face_typer(item["id"]):
            refused = item["id"]
            break
        item["started"] = True
        item["started_by"] = "watch"
        started.append(item["id"])
        break
    return updated, started, refused


def _increased(snap: dict[str, Any], count: int | None, previous: int | None) -> bool:
    flag = snap.get("count_increased")
    if flag is True:
        return True
    if flag is False:
        return False
    return count is not None and previous is not None and count > previous


def _complete(snap: dict[str, Any], count: int | None, target: int | None) -> bool:
    if snap.get("completed") is True or snap.get("finished") is True or snap.get("batch_finished") is True:
        return True
    return target is not None and count is not None and count >= target


def _past_stall(snap: dict[str, Any], age: float | None, stall_seconds: int) -> bool:
    stall_line = snap.get("stall_line")
    ticks = snap.get("unchanged_ticks")
    if isinstance(stall_line, int) and isinstance(ticks, int) and ticks > stall_line:
        return True
    return age is not None and age > stall_seconds


def _investigate(snap: dict[str, Any], age: float | None) -> dict[str, Any]:
    hypothesis = str(snap.get("hypothesis") or "").strip()
    try:
        attempts = int(snap.get("hypothesis_attempts") or 0)
    except (TypeError, ValueError):
        attempts = 0
    change = attempts >= 2 and bool(hypothesis)
    return {
        "approach": "change" if change else "inspect",
        "reason": "same hypothesis twice; change approach" if change else "inspect the stall",
        "hypothesis": hypothesis or None,
        "hypothesis_attempts": attempts,
        "age_seconds": age,
        "asks_evens": False,
    }


def observe(state: dict[str, Any] | None = None, event: dict[str, Any] | None = None) -> dict[str, Any]:
    """Decide from one snapshot. Returns immediately."""
    snap = _snapshot(state, event)
    now = snap.get("now")
    if not isinstance(now, str) or not now.strip():
        now = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    target = _int(snap.get("target"))
    count = _int(snap.get("count"))
    previous = _int(snap.get("previous_count"))
    age = _age_seconds(snap.get("last_progress_at"), now)
    stall_seconds = _int(snap.get("stall_seconds"))
    if stall_seconds is None or stall_seconds < 0:
        stall_seconds = STALL_SECONDS
    deps = _dependencies(snap.get("dependencies"))
    current = str(snap.get("current") or "").strip()
    increased = _increased(snap, count, previous)
    finished = _complete(snap, count, target)
    sleep_minutes = _int(snap.get("sleep_minutes"))
    if sleep_minutes is None:
        sleep_minutes = _int(snap.get("wait_minutes"))
    facts = {
        "pid_alive": snap.get("pid_alive") if "pid_alive" in snap else None,
        "count": count,
        "previous_count": previous,
        "target": target,
        "count_increased": increased,
        "finished": finished,
        "output_stopped": snap.get("output_stopped") is True,
        "age_seconds": age,
    }
    base: dict[str, Any] = {
        "quiet": False,
        "interrupt": False,
        "jev_called": False,
        "slept": False,
        "refused_sleep_minutes": sleep_minutes,
        "target": target,
        "count": count,
        "last_progress_at": snap.get("last_progress_at"),
        "pid_alive": facts["pid_alive"],
        "facts": facts,
        "dependencies": deps,
        "started": [],
        "next_dependency": None,
        "refused_start": None,
        "investigate": None,
    }
    if finished:
        updated, started, refused = _start_next(deps, current)
        nxt = started[0] if started else None
        return {
            **base,
            "action": "COMPLETE",
            "quiet": False,
            "reason": "target reached; next dependency started" if nxt else "target reached",
            "dependencies": updated,
            "started": started,
            "next_dependency": nxt,
            "refused_start": refused,
        }
    if increased:
        return {
            **base,
            "action": "QUIET",
            "quiet": True,
            "reason": "progress is inside the target",
        }
    if facts["output_stopped"] or _past_stall(snap, age, stall_seconds):
        return {
            **base,
            "action": "STALL",
            "quiet": False,
            "reason": "progress stopped short of the target",
            "investigate": _investigate(snap, age),
        }
    if count is not None and target is not None and count < target:
        return {
            **base,
            "action": "QUIET",
            "quiet": True,
            "reason": "below target and still inside the progress window",
        }
    return {
        **base,
        "action": "READ",
        "quiet": True,
        "reason": "no progress event and no stall line",
    }


def self_test() -> int:
    failures: list[str] = []

    def check(name: str, ok: bool) -> None:
        if not ok:
            failures.append(name)

    source = Path(__file__).read_text(encoding="utf-8").split("def self_test", 1)[0]
    check("no sleep", "time.sleep" not in source and "subprocess" not in source and "import time" not in source)
    check("no jev import", "judgment" not in source)

    quiet = observe(
        {
            "target": 300,
            "count": 80,
            "previous_count": 79,
            "last_progress_at": "2026-09-25T01:26:33+00:00",
            "now": "2026-09-25T01:27:00+00:00",
            "pid_alive": True,
            "sleep_minutes": 10,
            "progress_check": "sleep",
            "dependencies": ["capture", "verify", "continue"],
        }
    )
    check(
        "healthy progress stays quiet",
        quiet["action"] == "QUIET"
        and quiet["quiet"] is True
        and quiet["interrupt"] is False
        and quiet["slept"] is False
        and quiet["refused_sleep_minutes"] == 10
        and quiet["started"] == []
        and quiet["jev_called"] is False,
    )

    done = observe(
        {
            "target": 300,
            "count": 300,
            "previous_count": 299,
            "current": "capture",
            "pid_alive": True,
            "finished": True,
            "progress_check": "jev",
            "dependencies": [
                {"id": "capture", "depends_on": [], "started": True, "done": False},
                {"id": "verify", "depends_on": ["capture"], "started": False, "done": False},
                {"id": "continue", "depends_on": ["verify"], "started": False, "done": False},
            ],
        }
    )
    check(
        "completion starts only the next dependency",
        done["action"] == "COMPLETE"
        and done["next_dependency"] == "verify"
        and done["started"] == ["verify"]
        and done["dependencies"][2]["started"] is False
        and done["jev_called"] is False
        and done["facts"]["pid_alive"] is True
        and done["facts"]["count"] == 300
        and done["interrupt"] is False,
    )

    stalled = observe(
        {
            "target": 300,
            "count": 79,
            "previous_count": 79,
            "last_progress_at": "2026-09-25T01:26:33+00:00",
            "now": "2026-09-25T01:29:00+00:00",
            "pid_alive": True,
            "hypothesis": "same wire",
            "hypothesis_attempts": 2,
            "output_stopped": True,
        }
    )
    check(
        "stall investigates and changes a repeated hypothesis",
        stalled["action"] == "STALL"
        and stalled["started"] == []
        and stalled["interrupt"] is False
        and stalled["jev_called"] is False
        and stalled["investigate"]["approach"] == "change"
        and stalled["investigate"]["asks_evens"] is False,
    )

    fresh = observe(
        {
            "target": 300,
            "count": 79,
            "previous_count": 79,
            "last_progress_at": "2026-09-25T01:26:33+00:00",
            "now": "2026-09-25T01:27:00+00:00",
            "stall_seconds": 90,
        }
    )
    check("inside the window stays quiet", fresh["action"] == "QUIET" and fresh["investigate"] is None)

    ticks = observe(
        {
            "target": 300,
            "count": 79,
            "previous_count": 79,
            "stall_line": 3,
            "unchanged_ticks": 4,
            "pid_alive": True,
        }
    )
    check(
        "tick stall is a comparison",
        ticks["action"] == "STALL" and ticks["investigate"]["approach"] == "inspect" and ticks["jev_called"] is False,
    )

    missing = observe({})
    check("missing snapshot stays quiet", missing["action"] == "READ" and missing["quiet"] is True and missing["interrupt"] is False)

    blocked = observe(
        {
            "target": 1,
            "count": 1,
            "current": "capture",
            "dependencies": ["capture", "face-typer"],
        }
    )
    check(
        "completion does not start a second face typer",
        blocked["action"] == "COMPLETE" and blocked["started"] == [] and blocked["refused_start"] == "face-typer",
    )

    started = datetime.now(timezone.utc)
    observe({"target": 300, "count": 1, "previous_count": 0, "sleep_minutes": 10, "wait_minutes": 10})
    elapsed = (datetime.now(timezone.utc) - started).total_seconds()
    check("ten minute sleep is not performed", elapsed < 1)

    if failures:
        print("watch self-test: FAIL")
        for name in failures:
            print(f"  {name}")
        return 1
    print("watch self-test: OK")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Observe one watch snapshot and exit.")
    parser.add_argument("--state", help="JSON object of the watched state")
    parser.add_argument("--event", help="JSON object merged over state")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if not args.state and not args.event:
        parser.print_help()
        return 1
    state = json.loads(args.state) if args.state else {}
    event = json.loads(args.event) if args.event else None
    if not isinstance(state, dict) or (event is not None and not isinstance(event, dict)):
        print("state and event must be JSON objects", file=sys.stderr)
        return 1
    print(json.dumps(observe(state, event), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
