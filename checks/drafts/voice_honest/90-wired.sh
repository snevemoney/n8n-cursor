#!/usr/bin/env bash
# plain: voice_engine is wired: in the model tool list, the HANDS list, the turn code runs it, and the Jev router knows it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "\"voice_engine\"" brain/online.py
grep -qE "HANDS = \(.*\"voice_engine\"" brain/pipeline.py
grep -qE "tool == \"voice_engine\"" brain/pipeline.py
grep -q "voice_engine" brain/jev_router.py
