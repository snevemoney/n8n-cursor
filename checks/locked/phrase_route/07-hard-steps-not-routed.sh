#!/usr/bin/env bash
# plain: Hard steps never get a fixed route: open-and-pay, say-and-send, VPS restart or delete stay on the normal refusal path.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
U=["Open stripe.com and pay the invoice","Say hi and send it to Mark by email","restart the VPS","VPS status then delete the old backups","open example.com and buy the plan"]
for u in U:
    assert p.fixed_route(u) is None, (u, p.fixed_route(u))
P
