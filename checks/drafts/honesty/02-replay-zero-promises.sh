#!/usr/bin/env bash
# plain: Replaying the 6 promise-style replies from the 17-ask probe (test asks only) leaves 0 'I'll…/Let me…' promises that no tool backed.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from mouth import persona as m
R=[("I'll check your Downloads folder for you, sir.",False),
("I'll check the status of the feature-loop workflow for you. Hive golden-paths failed: HTTP 502.",True),
("I'll set up a disk space monitoring loop for you. Let me check the current status first. VPS live.",True),
("I'll open example.com in Safari and get the page title for you.",False),
("I'll ask Jev about PR 619 merge recommendation. Let me check the current status first. Pro health 200.",True),
("I will look that up and get back to you.",False)]
bad=[o for s,t in R for o in [m.promise_guard(s, ran_tool=t)] if m.PROMISE_RE.search(o)]
assert not bad, bad
P
