#!/usr/bin/env bash
# plain: One builder/critic rule: critic_for and family are defined once, in hands/code_author.py.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
[ $(grep -rE "def (critic_for|family)\b" brain mouth hands | grep -v __pycache__ | wc -l) -eq 2 ]
