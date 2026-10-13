#!/usr/bin/env bash
# plain: On a tool ask (a web search that takes 2 s), Jarvis says 'On it.' first, in under 1.5 s, and the final answer follows.
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
evs=run("Search the web: latest stable Python")
t0,e0=evs[0]
assert t0<1.5 and e0.get("partial") and e0.get("spoken_delta")=="On it.", (t0,e0.get("spoken_delta"))
assert evs[-1][1].get("done") and "a.example" in str(evs[-1][1].get("spoken")) and "On it" not in str(evs[-1][1].get("spoken")), evs[-1]
P
