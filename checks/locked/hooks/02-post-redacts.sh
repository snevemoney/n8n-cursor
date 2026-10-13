#!/usr/bin/env bash
# plain: Secret-looking strings (API keys, GitHub tokens, bearer tokens) are redacted from any tool output before Jarvis speaks or logs it.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import hooks as h
keys=["sk-"+"A1b2C3d4E5f6G7h8I9j0K1l2","ghp_"+"abcdefghijklmnopqrstuvwxyz0123456789","Bearer "+"eyJhbGciOiJIUzI1NiJ9.abcdefghijk"]
r=h.post_tool({"ok":True,"spoken":"here: "+" and ".join(keys),"text":keys[0]})
import json; s=json.dumps(r)
for k in keys: assert k not in s, k
assert "[redacted]" in r["spoken"]
P
