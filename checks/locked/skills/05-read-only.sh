#!/usr/bin/env bash
# plain: The skills hand only reads: no writes, no shell, no network.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
! grep -nE "open\([^)]*[\"\x27](w|a)|write_text|subprocess|urllib|requests|socket" hands/skills.py
