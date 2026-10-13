#!/usr/bin/env bash
# plain: Asking to read .env, an SSH key or ~/.grok-private goes to the file-read hand, which refuses it without a model call and never shows the contents.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
from hands import workspace_read as W
for u in ["Read the .env file in your repo.", "Show me ~/.ssh/id_rsa.", "Open ~/.grok-private/OPERATOR_PROFILE.md", "cat .env.local"]:
    r = p.model_free_route(u); assert r and r["tool"] == "workspace_read", (u, r)
    out = W.run(W.args_from_utterance(u)); assert not out["ok"] and "secret" in out["spoken"].lower(), (u, out)
P
