#!/usr/bin/env bash
# plain: The existing voice tests still pass (product voice is Kokoro/ElevenLabs, never the macOS say voice).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
out=$(python3 -m pytest -q -p no:cacheprovider mouth/test_voice.py 2>&1 || true); echo "$out" | tail -1 | grep -qE "passed" && ! echo "$out" | grep -q FAILED
