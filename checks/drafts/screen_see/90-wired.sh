#!/usr/bin/env bash
# plain: screen_see is wired: in the model tool list, the HANDS list, the turn code runs it with the hive and vision, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"screen_see\"" brain/online.py
grep -qE "HANDS = \(.*\"screen_see\"" brain/pipeline.py
grep -qE "tool == \"screen_see\"" brain/pipeline.py
grep -qE "_screen_see_hand\(\)\.run\(.*hive=hive" brain/pipeline.py
grep -q "screen_see" brain/jev_router.py
