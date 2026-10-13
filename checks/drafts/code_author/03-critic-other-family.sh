#!/usr/bin/env bash
# plain: The critic is always from a different model family than the builder (deepseek -> mistral, mistral/other -> deepseek).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)/apps/agent-stack"
export PYTHONPATH="$PWD" PYTHONDONTWRITEBYTECODE=1 AGENT_STACK_DRY_TTS=1 AGENT_STACK_CURSOR_DRY=1 JARVIS_TURN_LOG=0
python3 - <<"P"
from hands import code_author as A
for b in ["deepseek/deepseek-chat-v3.1", "mistralai/mistral-small-3.2-24b-instruct", "x-ai/grok-4", "openai/gpt-5"]:
    c = A.critic_for(b); assert A.family(c) != A.family(b), (b, c)
P
