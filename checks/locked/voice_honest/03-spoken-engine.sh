#!/usr/bin/env bash
# plain: Asked which voice engine it uses, Jarvis names exactly the engine the voice report names.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, tempfile
os.environ.pop("AGENT_STACK_DRY_TTS", None)
os.environ.setdefault("AGENT_STACK_KOKORO_DIR", os.path.expanduser("~/jarvis-cowork/voice/.kokoro"))
os.environ.setdefault("AGENT_STACK_VOICE_PYTHON", os.path.expanduser("~/jarvis-cowork/voice/.venv-voice/bin/python"))
from mouth import voice as v
v.elevenlabs_key=lambda: ""
from hands import voice_engine as ve
rep=v.voice_report(); r=ve.run({})
assert r['engine']==rep['engine']=='kokoro' and 'kokoro' in r['spoken'].lower(), (r, rep['engine'])
P
