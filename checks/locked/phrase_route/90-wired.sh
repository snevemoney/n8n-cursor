#!/usr/bin/env bash
# plain: Fixed routing is actually wired: the turn code calls fixed_route before the model pick, and the say tool is handled.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "fixed_route(spoken_in)" brain/pipeline.py
grep -q 'tool == "say"' brain/pipeline.py
