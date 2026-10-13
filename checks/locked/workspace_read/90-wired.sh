#!/usr/bin/env bash
# plain: workspace_read is actually wired: the model can call it (it is in the tool list) and the turn code runs it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"workspace_read\"" brain/online.py
grep -qE "HANDS = \(.*\"workspace_read\"" brain/pipeline.py
grep -qE "tool == \"workspace_read\"|name == \"workspace_read\"" brain/pipeline.py
grep -q "workspace_read" brain/jev_router.py
