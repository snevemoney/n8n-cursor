#!/usr/bin/env bash
# plain: loop is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"loop\"" brain/online.py
grep -qE "HANDS = \(.*\"loop\"" brain/pipeline.py
grep -qE "tool == \"loop\"" brain/pipeline.py
grep -q "\"loop\"\|loop hand" brain/jev_router.py
