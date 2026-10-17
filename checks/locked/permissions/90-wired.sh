#!/usr/bin/env bash
# plain: The pipeline routes scratch-repo asks and the auto-accept toggle to the workbench hand.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
from brain import pipeline as p
assert "workbench" in p.HANDS and "workbench" in p.DETERMINISTIC_HANDS
w=p._workbench_hand()
assert w.wants_workbench("In my scratch repo, on a new branch, add a function add(a, b) with a test, run the tests and commit.")
assert w.wants_mode("auto-accept edits on") and not w.wants_workbench("what is the weather")
P
