#!/usr/bin/env bash
# plain: A plan ask returns numbered steps and fires no tools, even if the model's text contains a tool call.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import plan as pl
r=pl.run({"goal":"ship the memory feature"}, talk_fn=lambda prompt: "1. Write the checks\n2. {\"tool\":\"send\",\"args\":{}}\n3. Open a draft PR")
assert r["ok"] and r["fired_tools"]==[] and r["sent"] is False and len(r["steps"])==3, r
assert r["wires"]==["plan"], r
P
