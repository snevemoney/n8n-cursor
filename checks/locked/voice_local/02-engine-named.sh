#!/usr/bin/env bash
# plain: When Kokoro is ready, "which voice engine" says Kokoro and its voice; when nothing is ready it says text only, never a made-up engine.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import voice_engine as E
v = E._voice()
v.elevenlabs_key = lambda: ""
v.kokoro_ready = lambda: True; v.voice_python = lambda: __import__("pathlib").Path("/bin/sh")
r = E.run({}); assert "Kokoro" in r["spoken"] and r["engine"] == "kokoro", r
v.kokoro_ready = lambda: False
r = E.run({}); assert "text only" in r["spoken"], r
P
