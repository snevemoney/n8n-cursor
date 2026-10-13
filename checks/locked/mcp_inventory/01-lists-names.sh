#!/usr/bin/env bash
# plain: Asked which MCP servers it has, Jarvis lists the server names found in the Claude, Cursor and Codex configs (including per-project ones).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, json
from hands import mcp_inventory as mi
d=pathlib.Path(tempfile.mkdtemp())
(d/"claude.json").write_text(json.dumps({"mcpServers":{"alpha":{"command":"npx","args":["a"],"env":{"API_TOKEN":"sekret-AAA-123"}}},"projects":{"/x":{"mcpServers":{"beta":{"url":"https://h/?key=sekret-BBB-456"}}}}}))
(d/"mcp.json").write_text(json.dumps({"mcpServers":{"gamma":{"command":"g","env":{"K":"sekret-CCC-789"}}}}))
(d/"config.toml").write_text("[mcp_servers.delta]\ncommand = \"d\"\nenv = { TOKEN = \"sekret-DDD-000\" }\n")
paths=[("claude",d/"claude.json"),("cursor",d/"mcp.json"),("codex",d/"config.toml")]
r=mi.run({}, paths=paths)
assert r['ok'] is True, r
assert sorted(s['name'] for s in r['servers'])==['alpha','beta','delta','gamma'], r
P
