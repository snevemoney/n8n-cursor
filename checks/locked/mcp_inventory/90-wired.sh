#!/usr/bin/env bash
# plain: mcp_inventory is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"mcp_inventory\"" brain/online.py
grep -qE "HANDS = \(.*\"mcp_inventory\"" brain/pipeline.py
grep -qE "tool == \"mcp_inventory\"" brain/pipeline.py
grep -q "mcp_inventory" brain/jev_router.py
