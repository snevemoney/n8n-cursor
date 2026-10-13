#!/usr/bin/env bash
# plain: There is one skills path: wants_skills and the skills hand are defined once.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_skills\b" brain mouth hands | wc -l) -eq 1 ]
[ $(ls hands/skills*.py | grep -v test_ | wc -l) -eq 1 ]
