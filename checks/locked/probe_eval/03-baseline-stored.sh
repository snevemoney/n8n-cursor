#!/usr/bin/env bash
# plain: A baseline is stored in the repo and today's routing passes at least the 9 hands that exist (files, repo, Downloads, web, browser, screen, VPS, say).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import json
b=json.load(open("eval/baseline.json"))
assert isinstance(b["passing"], list) and len(b["passing"])>=9, b
P
python3 eval/eval_probes.py --json | python3 -c "import sys,json;d=json.load(sys.stdin);assert d['passed']>=9, d['passed']"
