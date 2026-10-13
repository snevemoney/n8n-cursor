#!/usr/bin/env bash
# plain: If a probe that passes in the baseline stops passing, the eval exits non-zero (this is what fails the PR).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import json, subprocess, sys
from eval import eval_probes as e
b=set(json.load(open("eval/baseline.json"))["passing"])
broken=lambda u: None  # a router that sends everything to the model
rc=e.main(["--router-for-test"], router=broken)
assert rc!=0, rc
assert e.main([]) == 0
P
