#!/usr/bin/env bash
# plain: There are at least 100 labelled turns for calibrating Jev, every label is a real Jev handler, and each row says where it came from.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import json
from brain import jev_router as j
rows=[json.loads(l) for l in open("brain/jev_calibration_set.jsonl") if l.strip()]
assert len(rows)>=100, len(rows)
ok=set(j.HANDLERS)|{"web_search"}
for r in rows: assert r["label"] in ok and r.get("source") and r.get("utterance"), r
P
