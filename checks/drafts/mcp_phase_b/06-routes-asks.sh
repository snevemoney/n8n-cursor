#!/usr/bin/env bash
# plain: Asks like list the tools on the X MCP server go to the MCP call hand; which MCP servers still goes to the inventory.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
assert p.model_free_route("List the tools on the codebase-memory-mcp MCP server.")["tool"]=="mcp_call"
assert p.model_free_route("Which MCP servers do you have?")["tool"]=="mcp_inventory"
for u in ["Tell me a short joke.","Good evening Jarvis"]: assert not p.wants_mcp_call(u)
P
