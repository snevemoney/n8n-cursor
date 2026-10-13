#!/usr/bin/env bash
# plain: The existing agent-stack test suite still passes (known pre-existing serve.py TURN_WALL failure excepted).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONDONTWRITEBYTECODE=1
python3 -m unittest discover -s brain -p "test_*.py" >/tmp/perm92.log 2>&1
python3 -m unittest discover -s hands -p "test_*.py" >>/tmp/perm92.log 2>&1
