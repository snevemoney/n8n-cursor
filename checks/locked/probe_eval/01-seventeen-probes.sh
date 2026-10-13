#!/usr/bin/env bash
# plain: The eval holds exactly the 17 test asks from the live probe, each with the hand it should go to.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import json
d=json.load(open("eval/probes17.json"))
asks=[p["ask"] for p in d["probes"]]
assert len(asks)==17 and len(set(asks))==17, len(asks)
need={"What MCP servers or tools can you call right now? List them.","Search the web: what is the latest stable Python release?","Say hello out loud.","Read the first line of README.md in your repo.","What is the status of my Hostinger VPS?"}
assert need<=set(asks), need-set(asks)
assert all(p.get("expect") and p.get("cap") for p in d["probes"])
P
