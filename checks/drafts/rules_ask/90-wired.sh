#!/usr/bin/env bash
# plain: rules is wired: in the HANDS list, the model-free router, and the turn code runs it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
grep -qE "HANDS = \(.*\"rules\"" brain/pipeline.py
grep -qE "tool == \"rules\"" brain/pipeline.py
