#!/usr/bin/env bash
# plain: Describe my screen / take a screenshot of my screen are answered by the screen hand (the whole display), not the Safari tab; page asks still go to Safari.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
for u in ["Describe my screen.","Take a screenshot of my screen and describe it.","What is on my screen?","grab my screen"]:
    assert p.model_free_route(u)["tool"]=="screen_see", (u, p.model_free_route(u))
assert p.model_free_route("Open example.com in the browser and tell me the page title.")["tool"]=="safari_see"
P
