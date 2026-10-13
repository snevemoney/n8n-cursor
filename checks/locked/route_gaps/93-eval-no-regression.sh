#!/usr/bin/env bash
# plain: The 17-probe replay eval has no regressions against the stored baseline (score may only go up).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 eval/eval_probes.py >/dev/null
