#!/usr/bin/env bash
# plain: The hooks are wired: run_tool goes through pre_tool, and every tool result passes post_tool and stop_check.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "hooks.pre_tool(" brain/pipeline.py
grep -q "hooks.post_tool(" brain/pipeline.py
grep -q "hooks.stop_check(" brain/pipeline.py
