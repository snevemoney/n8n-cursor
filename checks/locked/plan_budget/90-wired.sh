#!/usr/bin/env bash
# plain: plan is wired: in the model tool list, the HANDS list, the turn code runs it with a no-tools talk call, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"plan\"" brain/online.py
grep -qE "HANDS = \(.*\"plan\"" brain/pipeline.py
grep -qE "tool == \"plan\"" brain/pipeline.py
grep -q "hands=False" brain/pipeline.py
grep -q "plan" brain/jev_router.py
