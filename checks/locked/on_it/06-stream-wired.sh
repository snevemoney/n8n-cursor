#!/usr/bin/env bash
# plain: The face's streamed turn records first_chunk_ms from the first spoken chunk it actually yielded.
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
import inspect
from mouth import turn as t
src=inspect.getsource(t.apply_turn_iter)
assert "first_ms" in src and "spoken_delta" in src, "apply_turn_iter does not time the first chunk"
P
