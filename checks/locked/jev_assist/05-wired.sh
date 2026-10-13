#!/usr/bin/env bash
# plain: The turn uses Jev assist only on the model path (when no model-free route matched), and Jev advice stays ADVISORY.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "JEVR.assist(" brain/pipeline.py
python3 -c "from brain import jev_router as j; assert j.MODE==\"ADVISORY\""
! grep -nE "\"authoritative\": True" brain/jev_router.py brain/pipeline.py
