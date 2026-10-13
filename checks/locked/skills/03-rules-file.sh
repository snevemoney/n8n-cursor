#!/usr/bin/env bash
# plain: A short JARVIS.md rules file exists (2 KB or less) and the turn prompt loads it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ -f JARVIS.md ] && [ $(wc -c < JARVIS.md) -le 2048 ]
python3 -c "from brain import pipeline as p; t=p.jarvis_rules(); assert t and t.strip()==open(\"JARVIS.md\").read().strip()"
grep -q "jarvis_rules()" brain/pipeline.py
