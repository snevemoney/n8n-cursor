#!/usr/bin/env bash
# plain: There is one code execution path: wants_code_run is defined once and only hands/code_run.py runs user code.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_code_run\b" brain mouth hands | wc -l) -eq 1 ]
! grep -rnE "\bexec\(|\beval\(" brain/pipeline.py hands/code_run.py
