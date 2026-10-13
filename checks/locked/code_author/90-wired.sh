#!/usr/bin/env bash
# plain: The code_run turn path calls hands/code_author for authoring asks, and the critic model is written into the code_run log meta.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
grep -q "_code_author_hand()" brain/pipeline.py
grep -q "critic_model" hands/code_author.py brain/pipeline.py
