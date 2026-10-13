#!/usr/bin/env bash
# plain: If the test fails in the sandbox, Jarvis says so and does not commit.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os, subprocess
from hands import workbench as W
fake=lambda m,p: "```python\ndef add(a, b):\n    return a - b\n```\n```python\nassert add(2, 3) == 5\n```"
r=W.run("In my scratch repo, on a new branch, add a function add(a, b) with a test, run the tests and commit.", chat=fake)
assert r["committed"] is False and r["passed"] is False and "did not commit" in r["spoken"], r
P
