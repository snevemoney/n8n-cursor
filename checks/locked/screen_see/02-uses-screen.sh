#!/usr/bin/env bash
# plain: The screen hand grabs the whole display (no tab bounds), sends that image to the vision model, and answers from what the model saw.
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
r=sc.run({}, hive=h, grab_fn=grab, vision_fn=vision)
assert r['ok'] and seen['bounds'] is None and seen['images'][0].startswith('data:image/'), (r, seen.get('bounds'))
assert 'code editor' in r['spoken'] and 'screen' in r['wires'] and r['source']=='screen', r
P
