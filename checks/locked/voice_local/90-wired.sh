#!/usr/bin/env bash
# plain: The shared-cache lookup is the one CACHE / VENV_PY definition in mouth/voice.py that the TTS worker and voice_engine both read.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -cE "^CACHE = " mouth/voice.py) -eq 1 ] && [ $(grep -cE "^VENV_PY = " mouth/voice.py) -eq 1 ]
grep -q "jarvis-voice" mouth/voice.py
