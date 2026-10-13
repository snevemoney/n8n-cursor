#!/usr/bin/env bash
# plain: Every turn log row carries a cost bucket: free for model-free turns, cheap for small models, frontier for big ones.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import time
from memory import turn_log as t
s=time.time()
r=t.build_row(started=s, ended=s+1, events=[{"verb":"workspace_read","ok":True}], talk=None, inject=None)
assert r["cost_bucket"]=="free", r["cost_bucket"]
r=t.build_row(started=s, ended=s+1, events=[{"verb":"converse","ok":True}], talk={"t":s+0.5,"model":"grok-4-fast-mini"}, inject=None)
assert r["cost_bucket"]=="cheap", r["cost_bucket"]
r=t.build_row(started=s, ended=s+1, events=[{"verb":"converse","ok":True}], talk={"t":s+0.5,"model":"grok-4"}, inject=None)
assert r["cost_bucket"]=="frontier", r["cost_bucket"]
P
