#!/usr/bin/env bash
# plain: There is one MCP client: only hands/mcp_call.py speaks JSON-RPC to MCP servers, and it reuses the inventory for server names.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rl "tools/list" brain mouth hands | grep -v test_ | grep -v __pycache__ | wc -l) -eq 1 ]
grep -q "mcp_inventory" hands/mcp_call.py
