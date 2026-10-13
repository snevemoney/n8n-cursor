#!/usr/bin/env bash
# plain: There is one screen-describe path: the hand reuses see.grab_screen and wants_screen_see is defined once.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "grab_screen" hands/screen_see.py
[ $(grep -rE "def wants_screen_see\b" brain mouth hands | wc -l) -eq 1 ]
