#!/usr/bin/env bash
# plain: The search hand is read-only: one GET-style search, no posting, no forms, no logins, no keys printed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
test -f hands/web_search.py
! grep -nE "method=.POST|\.post\(|submit|login|password|print\(.*(KEY|TOKEN)" hands/web_search.py
