#!/usr/bin/env bash
# plain: Each turn log row records latency_ms and first_chunk_ms (whole ms, first <= total), plus tool_ms for tool turns.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
T=$(mktemp -d); trap "rm -rf $T" EXIT; export T
timeout 90 python3 - <<"P"
import os, time
from pathlib import Path
from brain import pipeline as p
ws=p._web_search_hand()
def slow(a, fetch=None):
    time.sleep(2.0); return {"ok": True, "query": "q", "cites": ["https://a.example/1","https://b.example/2"], "results": 2, "sent": False, "spoken": "From the web: [1] A [2] B Sources: https://a.example/1, https://b.example/2"}
ws.run=slow
no_model=lambda *a, **k: {"spoken": "Because they make up everything.", "ok": True}
def run(u):
    t=time.monotonic(); evs=[]
    for ev in p.apply_pipeline_iter(u, hive=Path(os.environ["T"]), retrieve_roots=[], talk_fn=no_model):
        evs.append((round(time.monotonic()-t,2), ev))
    return evs
from memory import turn_log as L
r=L.build_row(started=100.0, ended=103.5, events=[{"verb":"web_search","ok":True,"tool_ms":2100}], talk={}, inject={}, first_ms=420)
assert r["latency_ms"]==3500 and r["first_chunk_ms"]==420 and r["tool_ms"]==2100, r
r2=L.build_row(started=100.0, ended=101.0, events=[{"verb":"converse"}], talk={}, inject={})
assert r2.get("first_chunk_ms") is None and r2["latency_ms"]==1000, r2
P
