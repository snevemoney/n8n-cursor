#!/usr/bin/env bash
# plain: Asks like what voice engine are you using go to the voice engine answer; 'say hello out loud' still speaks; small talk does not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
for u in ["What voice engine are you using?","Which TTS engine is speaking right now?","What voice are you using?"]:
    assert p.wants_voice_engine(u), u
for u in ["Tell me a short joke.","Say hello out loud.","Good evening Jarvis","Open example.com in the browser"]:
    assert not p.wants_voice_engine(u), u
assert p.model_free_route("Say hello out loud.")["tool"]=="say"
P
