#!/usr/bin/env bash
# plain: memory is actually wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"memory\"" brain/online.py
grep -qE "HANDS = \(.*\"memory\"" brain/pipeline.py
grep -qE "tool == \"memory\"" brain/pipeline.py
grep -q "memory" brain/jev_router.py
