#!/usr/bin/env bash
# plain: There is one engine decision: voice_report is the only place that picks the engine, and both the voice_engine hand and voice_status_line read it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def voice_report\b" brain mouth hands face | wc -l) -eq 1 ]
grep -q "voice_report()" hands/voice_engine.py
python3 - <<"P"
import inspect
from brain import pipeline as p
assert "voice_report" in inspect.getsource(p.voice_status_line) or "voice_engine" in inspect.getsource(p.voice_status_line)
P
