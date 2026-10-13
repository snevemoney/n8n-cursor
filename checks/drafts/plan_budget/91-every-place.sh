#!/usr/bin/env bash
# plain: There is one budget function and one cost-bucket rule: fit_budget and cost_bucket are defined once.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def fit_budget\b" brain mouth hands memory | wc -l) -eq 1 ]
[ $(grep -rE "def cost_bucket\b" brain mouth hands memory | wc -l) -eq 1 ]
[ $(grep -rE "def wants_plan\b" brain mouth hands | wc -l) -eq 1 ]
