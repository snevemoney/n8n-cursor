#!/usr/bin/env bash
# plain: There is one durable memory path: wants_memory is defined once and no second remember store exists.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_memory\b" brain mouth hands | wc -l) -eq 1 ]
[ $(grep -rlE "JARVIS_MEMORY_FILE" brain mouth hands | grep -v test_ | wc -l) -eq 1 ]
