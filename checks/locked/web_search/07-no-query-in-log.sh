#!/usr/bin/env bash
# plain: The turn log keeps metadata only for search turns: no query text, no snippets.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import web_search as w
m=w.log_meta({"ok":True,"query":"my private thing","cites":["https://a/x","https://b/y"],"spoken":"secret snippet"})
s=str(m); assert "private" not in s and "snippet" not in s and m.get("n_cites")==2, m
P
