#!/usr/bin/env bash
# plain: The latency log stays metadata only: no utterance, no spoken text, no 'On it.' in the row.
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
import json
from memory import turn_log as L
r=L.build_row(started=1.0, ended=2.0, events=[{"verb":"web_search","spoken":"secret answer","spoken_delta":"On it.","tool_ms":5}], talk={}, inject={}, first_ms=3)
s=json.dumps(r); assert "secret" not in s and "On it" not in s, s
P
