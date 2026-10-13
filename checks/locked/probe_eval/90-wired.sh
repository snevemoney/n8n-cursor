#!/usr/bin/env bash
# plain: The eval scores the real routing: the turn code and the eval both call model_free_route.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "model_free_route(spoken_in)" brain/pipeline.py
grep -q "model_free_route" eval/eval_probes.py
