#!/usr/bin/env bash
# plain: The promise guard is actually wired: the turn code in brain/pipeline.py calls it before the reply is committed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "promise_guard(" brain/pipeline.py
grep -q "def promise_guard" mouth/persona.py
