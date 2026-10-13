#!/usr/bin/env bash
# plain: If the screen cannot be grabbed (no Screen Recording permission), Jarvis says so plainly.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import tempfile, pathlib, json
from hands import screen_see as sc
h=pathlib.Path(tempfile.mkdtemp())
img=h/"g.jpg"; img.write_bytes(b"\xff\xd8\xff" + b"0"*2000)
seen={}
def grab(hive, bounds=None):
    seen["bounds"]=bounds; return {"ok":True,"path":str(img)}
def vision(prompt, images):
    seen["images"]=images; return "A code editor with a terminal on the right."
r=sc.run({}, hive=h, grab_fn=lambda hive, bounds=None: {'ok':False,'spoken':'UNKNOWN. Screen grab is dark. Allow Screen Recording for Terminal.'}, vision_fn=vision)
assert r['ok'] is False and 'screen recording' in r['spoken'].lower(), r
P
