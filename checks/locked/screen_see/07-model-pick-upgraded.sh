#!/usr/bin/env bash
# plain: Even when the model picks a Safari grab for a my-screen ask, run_tool answers from the whole screen, not the tab.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import inspect
from brain import pipeline as p
src=inspect.getsource(p._run_tool_inner)
i=src.index("ROUTE_SCREEN_RE.search(utterance"); assert "screen_see" in src[i:i+300]
P
