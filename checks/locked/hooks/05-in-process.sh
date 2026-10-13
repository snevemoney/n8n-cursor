#!/usr/bin/env bash
# plain: The hooks run in-process with no network, shell or file writes.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
! grep -nE "subprocess|urllib|requests|socket|write_text|open\(" brain/hooks.py
