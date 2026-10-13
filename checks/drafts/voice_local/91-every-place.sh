#!/usr/bin/env bash
# plain: No other file defines its own Kokoro path: AGENT_STACK_KOKORO_DIR is read only in mouth/voice.py.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rl "AGENT_STACK_KOKORO_DIR" brain mouth hands face | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
