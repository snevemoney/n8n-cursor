#!/usr/bin/env bash
# plain: With no env set and no in-tree cache, the voice finds the shared Kokoro model and voice Python in ~/.jarvis-voice, so any checkout of the Face can speak; env settings still win.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
import os, subprocess, sys, tempfile, pathlib, json
h = pathlib.Path(tempfile.mkdtemp()); k = h/".jarvis-voice"/"kokoro"; k.mkdir(parents=True)
(k/"kokoro-v1.0.int8.onnx").write_bytes(b"0"*1_100_000); (k/"voices-v1.0.bin").write_bytes(b"0")
vb = h/".jarvis-voice"/"venv"/"bin"; vb.mkdir(parents=True); py = vb/"python"; py.write_text("#!/bin/sh\n"); py.chmod(0o755)
code = "import sys;sys.path.insert(0,'.');from mouth import voice as v;import json;print(json.dumps([str(v.CACHE),str(v.VENV_PY),v.kokoro_ready()]))"
env = {k2: v2 for k2, v2 in os.environ.items() if k2 not in ("AGENT_STACK_KOKORO_DIR", "AGENT_STACK_VOICE_PYTHON", "ELEVENLABS_API_KEY", "ELEVEN_LABS_API_KEY")}
env["HOME"] = str(h); env["JARVIS_VOICE_NO_INTREE"] = "1"
c, vp, ready = json.loads(subprocess.run([sys.executable, "-c", code], env=env, capture_output=True, text=True, check=True).stdout)
assert c == str(k) and vp == str(py) and ready, (c, vp, ready)
env["AGENT_STACK_KOKORO_DIR"] = "/tmp/x-kokoro"
c, vp, ready = json.loads(subprocess.run([sys.executable, "-c", code], env=env, capture_output=True, text=True, check=True).stdout)
assert c == "/tmp/x-kokoro", c
P
