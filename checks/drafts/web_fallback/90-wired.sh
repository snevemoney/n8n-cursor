#!/usr/bin/env bash
# plain: The live search path uses the engine list: _default_fetch walks ENGINES (DuckDuckGo first, then Bing).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "^ENGINES = " hands/web_search.py
python3 -c "from hands import web_search as W; assert len(W.ENGINES) >= 2 and W._default_fetch.__doc__ and 'ENGINES' in W._default_fetch.__doc__"
