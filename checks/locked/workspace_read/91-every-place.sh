#!/usr/bin/env bash
# plain: There is only one file reader for answers: no second ad-hoc reader elsewhere in brain/ or mouth/.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
hits=$(grep -rlE "def (workspace_read|read_workspace_file|_read_repo_file)\b" brain mouth hands | grep -v "^hands/workspace_read.py$" || true)
[ -z "$hits" ] || { echo "duplicate reader: $hits" >&2; exit 1; }
