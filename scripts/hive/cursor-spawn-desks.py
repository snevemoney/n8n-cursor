#!/usr/bin/env python3
"""Write or print Cursor Task prompts for tape walks. No Grok. No HTTP.

Default factory wake is five desks via hive-spawn-desks (not this script).
This script is the exception: coverage-loop --video-id or Evens --all-desks.

Usage:
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --video-id <id> --write
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --video-id <id> --print
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --video-id <id> --write --agent Forge
"""
from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path

_HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location(
    "tape_self_teach_mission", _HERE / "tape-self-teach-mission.py"
)
_mission_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_mission_mod)
CORRELATION = _mission_mod.CORRELATION
mission = _mission_mod.mission
targets = _mission_mod.targets

REPO = Path(__file__).resolve().parents[2]
PROMPTS = REPO / "docs/hive/outer-heaven/CONTENT/job-cards/takes/_prompts"
JOBS = {"tape-self-teach"}
DEFAULT_WAKE = (
    "Forge",
    "Watchdog",
    "HITL Operator",
    "Researcher",
    "Communications Manager",
)


def main() -> int:
    ap = argparse.ArgumentParser(description="Cursor spawn prompts — no Grok Bot")
    ap.add_argument("--job", required=True, choices=sorted(JOBS))
    ap.add_argument("--write", action="store_true", help=f"Write {PROMPTS}/{{slug}}.md")
    ap.add_argument("--print", action="store_true", dest="do_print", help="Print prompts to stdout")
    ap.add_argument("--agent", help="One core agent by display name")
    ap.add_argument("--video-id", dest="video_id", help="YouTube id for this tape. Required for a real walk.")
    ap.add_argument(
        "--all-desks",
        action="store_true",
        help="All 17. Required with no --video-id. Default factory wake is the five via hive-spawn-desks.",
    )
    args = ap.parse_args()
    if not args.write and not args.do_print:
        raise SystemExit("Pass --write and/or --print")
    if not args.video_id and not args.all_desks and not args.agent:
        raise SystemExit(
            "Default wake is five desks ("
            + ", ".join(DEFAULT_WAKE)
            + ") via hive-spawn-desks — not this tape job. "
            "Pass --video-id (coverage-loop) or --all-desks."
        )

    rows = targets(args.agent)
    if args.write:
        PROMPTS.mkdir(parents=True, exist_ok=True)

    for name, slug in rows:
        prompt = mission(name, slug, video_id=args.video_id)
        if args.write:
            path = PROMPTS / f"{slug}.md"
            path.write_text(prompt.rstrip() + "\n", encoding="utf-8")
            print(f"wrote {path.relative_to(REPO)}  ({len(prompt.split())} words)")
        if args.do_print:
            print(f"\n===== {name} ({slug}) =====\n")
            print(prompt)

    print(f"\n{len(rows)} Cursor desk prompt(s)  job={args.job}  video_id={args.video_id or 'MISSING'}  {CORRELATION}")
    print(
        "Study = deep-video-learning (A–K then steal). "
        f"Parent launches {len(rows)} Task(generalPurpose) — tape exception "
        "(coverage-loop --video-id or --all-desks). Default factory wake is five. Never sendPrompt."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
