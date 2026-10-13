#!/usr/bin/env bash
# plain: Asks like which MCP servers do you have / list your MCP tools go to the inventory; small talk, skills and file reads do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Which MCP servers do you have?","List your MCP servers.","What MCP tools are connected?"]
no=["Tell me a short joke.","Which skills do you have?","Read the first line of README.md in your repo.","Good evening Jarvis"]
for u in yes: assert p.wants_mcp_inventory(u), u
for u in no: assert not p.wants_mcp_inventory(u), u
P
