#!/usr/bin/env bash
# plain: When the first search engine returns nothing (rate limit or bot check), Jarvis tries a second engine and cites its real URLs instead of saying "no results".
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from hands import web_search as W
W.ENGINES = [lambda q, t: [], lambda q, t: [{"url": "https://www.python.org/downloads/", "title": "Python 3.15.0", "snippet": "stable"}, {"url": "https://docs.python.org/3/", "title": "Docs", "snippet": "3.15"}]]
r = W.run({"query": "latest python"}); assert r["ok"] and r["cites"][0] == "https://www.python.org/downloads/" and "[2]" in r["spoken"], r
W.ENGINES = [lambda q, t: [], lambda q, t: []]
r = W.run({"query": "x"}); assert not r["ok"] and "won't guess" in r["spoken"], r
P
