#!/usr/bin/env bash
# plain: Outside scratch, edits in an allowed workspace wait for confirm until Evens turns auto-accept edits on; turning it off gates them again.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os
from hands import permissions as P, workbench as W
f=os.environ["JARVIS_EDIT_ROOTS"]+"/a.py"
assert P.decide("edit", f)=="confirm"
assert W.wants_mode("turn on auto-accept edits"); r=W.set_mode("turn on auto-accept edits"); assert r["auto_accept_edits"] is True
assert P.decide("edit", f)=="allow"
W.set_mode("turn off auto-accept edits"); assert P.decide("edit", f)=="confirm"
assert P.decide("edit", "/etc/hosts")=="confirm"
P
