#!/usr/bin/env bash
# plain: safari_open uses same_page for its verification, and the deterministic "open <url>" route still reaches safari_see.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
grep -q "same_page(" hands/see.py
python3 -c "from brain import pipeline as p; r=p.model_free_route('Open example.com in the browser and tell me the page title.'); assert r['tool']=='safari_see', r"
