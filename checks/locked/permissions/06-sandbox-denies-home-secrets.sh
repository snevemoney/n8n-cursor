#!/usr/bin/env bash
# plain: Code run by the workbench still cannot read files in $HOME (secrets stay out of the sandbox).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os
from hands import code_run as C
r=C.run({"code":"import os\nprint(open(os.path.expanduser('~')+'/.zshrc').read()[:5])","test":""})
assert r["ran"] and not r["passed"], r
P
