#!/usr/bin/env bash
# plain: One router and one secret rule: model_free_route and is_hard_step are defined once; the secret-name rule lives only in workspace_read.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def model_free_route\b" brain mouth hands | grep -v __pycache__ | wc -l) -eq 1 ]
[ $(grep -rE "def is_hard_step\b" brain mouth hands | grep -v __pycache__ | wc -l) -eq 1 ]
[ $(grep -rlE "^SECRET_NAME *=" brain mouth hands | grep -v __pycache__ | wc -l) -eq 1 ]
