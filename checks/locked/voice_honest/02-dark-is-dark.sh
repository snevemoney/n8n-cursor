#!/usr/bin/env bash
# plain: With no engine installed, the report says dark and Jarvis says it has no voice engine, instead of claiming voice is on.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile
os.environ["AGENT_STACK_KOKORO_DIR"]=tempfile.mkdtemp()
from mouth import voice as v
v.elevenlabs_key=lambda: ""
from hands import voice_engine as ve
assert v.voice_report()['engine']=='dark'
r=ve.run({}); assert r['engine']=='dark' and 'no voice engine' in r['spoken'].lower(), r
from brain import pipeline as p
line=p.voice_status_line().lower(); assert 'voice is on' not in line and ('no voice' in line or 'text only' in line), line
P
