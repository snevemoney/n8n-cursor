#!/usr/bin/env bash
# plain: "What are your operating rules?" is answered from JARVIS.md itself (every rule, no model), so the answer always matches the file.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
import tempfile, pathlib
from brain import pipeline as p
for u in ["What are your operating rules? List them briefly.", "What rules do you follow?", "Remind me of your house rules."]:
    r = p.model_free_route(u); assert r and r["tool"] == "rules", (u, r)
out = p.run_tool({"tool": "rules", "args": {}}, "What are your operating rules?", hive=pathlib.Path(tempfile.mkdtemp()), retrieve_roots=None)
rules = [l[2:].strip() for l in (p.STACK / "JARVIS.md").read_text().splitlines() if l.startswith("- ")]
assert rules and all(r[:25] in out["spoken"] for r in rules), out
P
