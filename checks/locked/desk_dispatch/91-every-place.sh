#!/usr/bin/env bash
# plain: There is one desk-card writer: wants_desk_dispatch is defined once and only the dispatch hand writes desk_cards.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_desk_dispatch\b" brain mouth hands | wc -l) -eq 1 ]
[ $(grep -rl "desk_cards" brain mouth hands | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
