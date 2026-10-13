#!/usr/bin/env bash
# plain: A web search answers with at least 2 distinct cited source URLs taken from the actual results, never invented ones.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import web_search as w
fake=lambda q,timeout: [{"url":"https://python.org/downloads","title":"Python","snippet":"Python 3.14.0 is the latest"},{"url":"https://docs.python.org/3/whatsnew","title":"Whats new","snippet":"3.14"},{"url":"https://python.org/downloads","title":"dup","snippet":"x"}]
r=w.run({"query":"latest stable python"}, fetch=fake)
assert r["ok"] and len(set(r["cites"]))>=2 and set(r["cites"])<={"https://python.org/downloads","https://docs.python.org/3/whatsnew"}, r
P
