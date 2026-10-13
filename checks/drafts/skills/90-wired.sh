#!/usr/bin/env bash
# plain: skills is actually wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"skills\"" brain/online.py
grep -qE "HANDS = \(.*\"skills\"" brain/pipeline.py
grep -qE "tool == \"skills\"" brain/pipeline.py
grep -q "skills" brain/jev_router.py
