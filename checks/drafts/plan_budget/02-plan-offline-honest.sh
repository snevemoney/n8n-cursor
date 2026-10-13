#!/usr/bin/env bash
# plain: Without a model, Jarvis says it cannot draft the plan right now instead of inventing one.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import plan as pl
r=pl.run({"goal":"x"}, talk_fn=None); assert r["ok"] is False and r["steps"]==[] and "plan" in r["spoken"].lower(), r
P
