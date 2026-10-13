#!/usr/bin/env bash
# plain: There is one loop registry: wants_loop is defined once and only the loop hand uses JARVIS_LOOPS_FILE.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_loop\b" brain mouth hands | wc -l) -eq 1 ]
[ $(grep -rl "JARVIS_LOOPS_FILE" brain mouth hands | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
