#!/usr/bin/env bash
# plain: mcp_call is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"mcp_call\"" brain/online.py
grep -qE "HANDS = \(.*\"mcp_call\"" brain/pipeline.py
grep -qE "tool == \"mcp_call\"" brain/pipeline.py
grep -q "mcp_call" brain/jev_router.py
