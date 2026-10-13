#!/usr/bin/env bash
# plain: desk_dispatch is wired: in the model tool list, the HANDS list, the turn code runs it with the hive path, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"desk_dispatch\"" brain/online.py
grep -qE "HANDS = \(.*\"desk_dispatch\"" brain/pipeline.py
grep -qE "tool == \"desk_dispatch\"" brain/pipeline.py
grep -qE "_desk_dispatch_hand\(\)\.run\(.*hive=hive" brain/pipeline.py
grep -q "desk_dispatch" brain/jev_router.py
