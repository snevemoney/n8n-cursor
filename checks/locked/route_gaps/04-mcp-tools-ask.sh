#!/usr/bin/env bash
# plain: "List the tools on your read-only MCP server" goes to mcp_call (tool list), not the server inventory.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
for u in ["List the tools on your read-only MCP server.", "What tools are on your MCP server?", "Show the tools on my markitdown MCP server."]:
    r = p.model_free_route(u); assert r and r["tool"] == "mcp_call", (u, r)
assert p.model_free_route("What MCP servers can you call right now? List them.")["tool"] == "mcp_inventory"
P
