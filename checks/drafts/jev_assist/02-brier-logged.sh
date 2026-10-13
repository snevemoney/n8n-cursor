#!/usr/bin/env bash
# plain: Calibration computes a Brier score and accuracy over the labelled set, stores them, and the ASSIST log row carries the Brier score.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 eval/jev_calibrate.py >/dev/null
python3 - <<"P"
import json, tempfile, pathlib
c=json.load(open("eval/jev_calibration.json"))
assert c["n"]>=100 and 0.0<=c["brier"]<=1.0 and 0.0<=c["accuracy"]<=1.0 and "threshold" in c and "assist_ok" in c, c
from brain import jev_router as j
h=pathlib.Path(tempfile.mkdtemp())
row=j.log_assist(h, "run status", {"handler":"status","confidence":0.9}, used=True, ms=3)
assert row["brier"]==c["brier"] and row["mode"]=="ASSIST" and row["authoritative"] is False, row
line=(h/"bus"/"jev-router.jsonl").read_text(); assert "run status" not in line, "utterance text logged"
P
