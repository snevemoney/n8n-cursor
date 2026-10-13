#!/usr/bin/env bash
# plain: web_search is actually wired: it is in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"web_search\"" brain/online.py
grep -qE "HANDS = \(.*\"web_search\"" brain/pipeline.py
grep -qE "tool == \"web_search\"" brain/pipeline.py
grep -q "web_search" brain/jev_router.py
