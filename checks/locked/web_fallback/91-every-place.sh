#!/usr/bin/env bash
# plain: There is still one web search hand: only hands/web_search.py fetches search engine pages.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rlE "duckduckgo\.com|bing\.com/search" brain mouth hands face | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
