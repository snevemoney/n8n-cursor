#!/usr/bin/env bash
# plain: The new routes are live in the one model-free router the turn and the probe eval both use.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "def model_free_route" brain/pipeline.py
grep -qE "op.*status|\"status\"" hands/workspace_read.py
python3 -c "from brain import pipeline as p; assert p.model_free_route('Is my working tree clean?')['tool']=='workspace_read'"
