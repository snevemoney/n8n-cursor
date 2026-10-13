#!/usr/bin/env bash
# plain: There is one assist path: assist is defined once and calibration lives in eval/jev_calibrate.py only.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def assist\b" brain mouth hands | wc -l) -eq 1 ]
[ -f eval/jev_calibrate.py ]
