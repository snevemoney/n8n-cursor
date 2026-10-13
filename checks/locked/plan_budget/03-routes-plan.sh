#!/usr/bin/env bash
# plain: Asks like plan how to... / make a plan for... go to the plan verb; small talk, what is the plan, and file reads do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
for u in ["Plan how to ship the memory feature.","Make a plan for the soak test.","Draft a plan to clean up the worktrees."]:
    assert p.wants_plan(u), u
for u in ["Tell me a short joke.","What is the plan?","Read the first line of README.md in your repo.","Good evening Jarvis"]:
    assert not p.wants_plan(u), u
P
