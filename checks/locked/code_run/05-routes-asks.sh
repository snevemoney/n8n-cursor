#!/usr/bin/env bash
# plain: Asks to write and run Python code or its tests go to code_run; small talk, file reads and web searches do not.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1
python3 - <<"P"
from brain import pipeline as p
yes=["Write a python function that reverses a string and run its test.","Run this python: print(2+2)","Run the tests for this python snippet"]
no=["Tell me a short joke.","Read the first line of README.md in your repo.","Search the web for the latest stable Python","What is the status of my Hostinger VPS?"]
for u in yes: assert p.wants_code_run(u), u
for u in no: assert not p.wants_code_run(u), u
P
