#!/usr/bin/env bash
# plain: With the Kokoro model installed and no ElevenLabs key, text-to-speech returns real Kokoro WAV audio (bytes > 0) and the report says kokoro.
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
assert v.voice_report()['engine']=='kokoro', v.voice_report()['engine']
a,m=v.tts_audio('Good evening, sir.'); assert len(a)>1000 and m=='audio/wav' and a[:4]==b'RIFF', (len(a),m)
P
