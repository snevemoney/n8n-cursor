#!/usr/bin/env bash
# plain: A repeated hand reply never opens 'Sir. Again, sir. Done.'; hands without their own line get plain 'Sir.' plus the answer.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from mouth import persona as m
for v in ["workspace_read","web_search","status","unknown_hand"]:
    b=m.witty_beat(v, repeat=True); assert "Done." not in b and not b.startswith("Again, sir. Done"), (v,b)
P
