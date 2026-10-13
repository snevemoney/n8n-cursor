#!/usr/bin/env bash
# plain: There is one hard-step tool gate: the old inline tool set check in run_tool is gone and the hard tool list lives in hooks.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
! grep -qE "tool in \{\"send\", \"pay\", \"deploy\", \"book\", \"publish\"\}" brain/pipeline.py
grep -q "HARD_TOOLS" brain/hooks.py
[ $(grep -rE "def (pre_tool|post_tool|stop_check)\b" brain mouth hands | wc -l) -eq 3 ]
