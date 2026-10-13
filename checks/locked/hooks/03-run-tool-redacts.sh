#!/usr/bin/env bash
# plain: The real run_tool path applies the redaction: a hand that returns a key never gets it to the spoken line.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p
k="sk-"+"Z9y8X7w6V5u4T3s2R1q0P9o8"
r=p.hooked_result({"ok":True,"tool":"status","spoken":"key "+k,"wires":["status"]})
assert k not in r["spoken"], r
P
