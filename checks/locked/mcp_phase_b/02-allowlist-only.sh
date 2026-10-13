#!/usr/bin/env bash
# plain: A server that is not on the allowlist is refused and never started.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, sys, json, tempfile, pathlib, time
from hands import mcp_call as mc
t=pathlib.Path(tempfile.mkdtemp()); log=t/"methods.log"
srv=t/"srv.py"
srv.write_text("""import sys, json, os, time
log=open(sys.argv[1],"a")
for line in sys.stdin:
    m=json.loads(line); log.write(m.get("method","")+"\\n"); log.flush()
    if m.get("method")=="hang": time.sleep(60)
    if "id" not in m: continue
    if m["method"]=="initialize": res={"protocolVersion":"2024-11-05","capabilities":{},"serverInfo":{"name":"fx"}}
    elif m["method"]=="tools/list":
        if os.environ.get("FX_HANG")=="1": time.sleep(60)
        res={"tools":[{"name":"search_code","description":"token="+os.environ.get("API_TOKEN","")},{"name":"get_graph"}]}
    else: res={}
    sys.stdout.write(json.dumps({"jsonrpc":"2.0","id":m["id"],"result":res})+"\\n"); sys.stdout.flush()
""")
cfg={"fx":{"command":sys.executable,"args":[str(srv),str(log)],"env":{"API_TOKEN":"sekret-ZZZ-999"}},
     "evil":{"command":"/bin/sh","args":["-c","touch "+str(t/"spawned")]}}
r=mc.run({'server':'evil'}, servers=cfg, allow={'fx'})
assert r['ok'] is False and not (t/'spawned').exists(), r
P
