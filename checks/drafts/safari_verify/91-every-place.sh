#!/usr/bin/env bash
# plain: One URL-match rule: same_page is defined once.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def same_page\b" brain mouth hands | grep -v __pycache__ | wc -l) -eq 1 ]
