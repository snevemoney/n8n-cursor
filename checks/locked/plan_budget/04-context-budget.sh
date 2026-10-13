#!/usr/bin/env bash
# plain: Turn context is capped: the brief sent to the model never exceeds the byte budget, short briefs pass unchanged, and the turn applies the cap.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
b=p.CONTEXT_BUDGET_BYTES; assert 4000 <= b <= 32000, b
big="line of context\n"*20000; out=p.fit_budget(big); assert len(out.encode("utf-8"))<=b, len(out.encode())
assert p.fit_budget("short brief")=="short brief"
P
grep -q "provider_brief = fit_budget(" brain/pipeline.py
