#!/usr/bin/env bash
# plain: Edits in scratch, sandbox runs, branches/commits off main, read-only MCP and web reads are allowed with no confirm.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); export JARVIS_SCRATCH_ROOTS=$T/scr JARVIS_MODE_FILE=$T/mode.json JARVIS_ACTION_LOG=$T/act.jsonl JARVIS_EDIT_ROOTS=$T/ws
python3 - <<"P"
import os
from hands import permissions as P
s=os.environ["JARVIS_SCRATCH_ROOTS"]
assert P.decide("edit", s+"/a.py")=="allow"
for k in ("run_sandbox","mcp_read","web_read","browser_read"): assert P.decide(k)=="allow", k
assert P.decide("git_branch","jarvis/x")=="allow" and P.decide("git_commit","jarvis/x")=="allow"
P
