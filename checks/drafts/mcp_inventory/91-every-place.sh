#!/usr/bin/env bash
# plain: There is one MCP inventory path: wants_mcp_inventory is defined once and only the inventory hand parses MCP configs.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ $(grep -rE "def wants_mcp_inventory\b" brain mouth hands | wc -l) -eq 1 ]
[ $(grep -rlE "mcp_servers|mcpServers" brain mouth hands --include=*.py | grep -v test_ | wc -l) -eq 1 ]
