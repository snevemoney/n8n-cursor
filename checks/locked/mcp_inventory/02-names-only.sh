#!/usr/bin/env bash
# plain: The inventory holds names and which platform only: no env values, commands, args, URLs or tokens appear anywhere in the output.
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
s=json.dumps(r)
assert 'sekret' not in s and 'npx' not in s and 'https://' not in s, s
for x in r['servers']: assert set(x)<= {'name','source'}, x
P
