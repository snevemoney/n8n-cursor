#!/usr/bin/env bash
# plain: JARVIS.md is read in one place (jarvis_rules), and wants_rules is defined once.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
[ $(grep -rE "def wants_rules\b" brain mouth hands | grep -v __pycache__ | wc -l) -eq 1 ]
[ $(grep -rE "\"JARVIS.md\"" brain mouth hands | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
