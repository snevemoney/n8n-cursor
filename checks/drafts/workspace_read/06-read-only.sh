#!/usr/bin/env bash
# plain: The reader can never change anything: no file writes, no deletes, and git is only asked read-only questions.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
F=hands/workspace_read.py; test -f $F
! grep -nE "open\([^)]*[\"\x27](w|a|x|r\+)|\.write_text|\.unlink|os\.remove|shutil\.|rmtree|\b(push|commit|checkout|reset|clean|rebase|merge|stash)\b" $F
