#!/usr/bin/env bash
# plain: The inventory only reads config files: no starting servers, no shell, no network, no writes.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
[ -f hands/mcp_inventory.py ]; ! grep -nE "subprocess|urllib|requests|socket|write_text|Popen|os\.system" hands/mcp_inventory.py
