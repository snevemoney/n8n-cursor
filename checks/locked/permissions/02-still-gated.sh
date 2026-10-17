#!/usr/bin/env bash
# plain: Sends, spend, deletes outside scratch, merges to main, pushes, deploys/VPS, secrets and global rule edits always need a confirm, even with auto-accept on.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os
from hands import permissions as P
P.set_auto_accept(True)
for k in ("send","purchase","merge_main","push","deploy","vps_change","read_secret","global_rule_edit","delete_outside_scratch","made_up_kind"):
    assert P.decide(k)=="confirm", k
assert P.decide("delete", os.path.expanduser("~/Documents/x"))=="confirm"
assert P.decide("git_commit","main")=="confirm" and P.decide("git_branch","master")=="confirm"
assert P.decide("edit", os.environ["JARVIS_SCRATCH_ROOTS"]+"/.env")=="confirm"
assert P.decide("edit", os.path.expanduser("~/.ssh/config"))=="confirm"
P
