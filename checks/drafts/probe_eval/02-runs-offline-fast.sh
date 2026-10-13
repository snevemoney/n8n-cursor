#!/usr/bin/env bash
# plain: The eval replays all 17 asks offline in under 15 s, with no network or model, and prints a score out of 17.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
s=$(date +%s); out=$(timeout 15 env -u OPENROUTER_API_KEY -u XAI_API_KEY python3 eval/eval_probes.py --json); e=$(( $(date +%s)-s ))
echo "$out" | python3 -c "import sys,json;d=json.load(sys.stdin);assert d['total']==17 and 0<=d['passed']<=17 and len(d['results'])==17, d"
[ $e -lt 15 ]
