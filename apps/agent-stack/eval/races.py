#!/usr/bin/env python3
"""Repeated dry races. Temp logic only. Never the live Face hive."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Callable

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))
from contracts import silent_state  # noqa: E402

DEFAULT_N = 100


def stale_generation_rejected(*, cancel_gen: int, writer_gen: int) -> bool:
    """Old gen cannot mutate after Stop."""
    return writer_gen <= cancel_gen


def duplicate_action_blocked(*, frame_id: str, prior_frame: str, same_target: bool, ui_changed: bool) -> bool:
    """Same click on an unchanged frame is refused. After a verified transition it may proceed."""
    if ui_changed or frame_id != prior_frame:
        return False
    return same_target


def stop_during_tts(*, tts_gen_at_enqueue: int, tts_gen_now: int, played: bool) -> bool:
    """Stale enqueue must not play after Stop bumps tts_gen."""
    if tts_gen_at_enqueue != tts_gen_now:
        return not played
    return True


def run_repeat(fn: Callable[[int], bool], n: int = DEFAULT_N) -> dict:
    ok = 0
    for i in range(n):
        if fn(i):
            ok += 1
    status = "PASS" if ok == n else "FAIL"
    return {"n_runs": n, "n_ok": ok, "status": status}


def suite(n: int = DEFAULT_N) -> dict:
    """Dry contract repeats. Watch duplicate-action stays UNPROVEN until Bite 4 live ledger."""

    def stale(i: int) -> bool:
        return stale_generation_rejected(cancel_gen=3, writer_gen=2)

    def tts(i: int) -> bool:
        return stop_during_tts(tts_gen_at_enqueue=1, tts_gen_now=2, played=False)

    def think(i: int) -> bool:
        return not silent_state(job_status="done", phase="think", turning=True, spoken="Stopped.")

    stale_row = run_repeat(stale, n)
    tts_row = run_repeat(tts, n)
    think_expect = silent_state(job_status="done", phase="think", turning=True, spoken="Stopped.")
    return {
        "stale_generation_rejected": stale_row,
        "stop_during_tts": tts_row,
        "silent_think_detected": {
            "n_runs": 1,
            "n_ok": 1 if think_expect else 0,
            "status": "PASS" if think_expect else "FAIL",
            "note": "detector must flag THINK after job_status=done",
        },
        "duplicate_action_blocked": {
            "n_runs": 0,
            "n_ok": 0,
            "status": "UNPROVEN",
            "note": "Bite 4 Watch ledger not on this checkout for live prove",
        },
        "recovery_turn": {
            "n_runs": 0,
            "n_ok": 0,
            "status": "UNPROVEN",
            "note": "live Face recovery gated until Bite 3 idle",
        },
        "think_fn_unused": think,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", type=int, default=DEFAULT_N)
    args = parser.parse_args()
    out = suite(args.n)
    out.pop("think_fn_unused", None)
    print(json.dumps(out, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
