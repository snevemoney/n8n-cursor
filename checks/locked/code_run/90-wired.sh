#!/usr/bin/env bash
# plain: code_run is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"code_run\"" brain/online.py
grep -qE "HANDS = \(.*\"code_run\"" brain/pipeline.py
grep -qE "tool == \"code_run\"" brain/pipeline.py
grep -q "code_run" brain/jev_router.py
