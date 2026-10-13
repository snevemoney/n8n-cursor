#!/usr/bin/env bash
# plain: Jev assist only ever suggests a safe routing hand (status); it never picks a hard step or an action, and it is off when calibration failed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import json
from brain import jev_router as j
assert j.assist("send the invoice to the client now") is None
assert j.assist("open example.com in safari") is None
r=j.assist("run status")
c=json.load(open("eval/jev_calibration.json"))
if c["assist_ok"]: assert r and r["tool"]=="status" and r["authoritative"] is False, r
j._calibration=lambda: {"assist_ok": False, "threshold": 0.0, "brier": 1.0}
assert j.assist("run status") is None
P
