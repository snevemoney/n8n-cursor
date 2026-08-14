#!/usr/bin/env python3
"""Write or print Cursor Task prompts for the 17 desks. No Grok. No HTTP.

Usage:
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --write
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --print
  python3 scripts/hive/cursor-spawn-desks.py --job tape-self-teach --write --agent Forge
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


def main() -> int:
    ap = argparse.ArgumentParser(description="Cursor spawn prompts — no Grok Bot")
    ap.add_argument("--job", required=True, choices=sorted(JOBS))
    ap.add_argument("--write", action="store_true", help=f"Write {PROMPTS}/{{slug}}.md")
    ap.add_argument("--print", action="store_true", dest="do_print", help="Print prompts to stdout")
    ap.add_argument("--agent", help="One core agent by display name")
    args = ap.parse_args()
    if not args.write and not args.do_print:
        raise SystemExit("Pass --write and/or --print")

    rows = targets(args.agent)
    if args.write:
        PROMPTS.mkdir(parents=True, exist_ok=True)

    for name, slug in rows:
        prompt = mission(name, slug)
        if args.write:
            path = PROMPTS / f"{slug}.md"
            path.write_text(prompt.rstrip() + "\n", encoding="utf-8")
            print(f"wrote {path.relative_to(REPO)}  ({len(prompt.split())} words)")
        if args.do_print:
            print(f"\n===== {name} ({slug}) =====\n")
            print(prompt)

    print(f"\n{len(rows)} Cursor desk prompt(s)  job={args.job}  {CORRELATION}")
    print("Parent launches 17 Task(generalPurpose) in one message. Never sendPrompt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
