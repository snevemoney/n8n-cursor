"""capability — truthful answers to "can you / do you have X" about Jarvis itself, with no model.

Grok's bad-turns queue (2026-10-15) showed the converse model inventing answers to questions about Jarvis's own
tools: it called the red arrow "a visual indicator, not a functional tool", and said Jarvis "cannot change its own
code by system design". These questions get a fixed, accurate line instead. Asking never acts: no arrow is drawn
and no mission starts from this hand.
"""
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

_ASK = r"(?:do|don't|dont|do\s+not|can|can't|cant|cannot|could|couldn't|are|aren't|is\s+there|have)\s+(?:you|jarvis)\b"
ARROW_RE = re.compile(_ASK + r".{0,50}\b(?:red\s+arrow|arrow|pointer|point(?:\s+at|\s+to)?\s+(?:things|stuff|controls?))\b", re.I)
SELF_CODE_RE = re.compile(
    r"\b(?:change|edit|modify|update|rewrite|fix|improve|upgrade|patch|reprogram)\b.{0,30}"
    r"\b(?:your(?:\s+own)?\s+(?:code|program|software|source|brain|rules)|yourself)\b"
    r"|\bgive\s+yourself\s+(?:more\s+)?(?:access|permissions?)\b", re.I)
FIX_IT_RE = re.compile(r"^(?:jarvis[, ]+)?(?:can|could|will|would)\s+you\s+(?:please\s+)?(?:fix|repair|sort\s+out)\s+(?:it|this|that)"
                       r"(?:\s+(?:now|yourself|for\s+me))*\s*[?.!]*$", re.I)
QUESTION_RE = re.compile(r"\?\s*$|^(?:jarvis[, ]+)?(?:do|don't|dont|can|can't|could|are|aren't|is|have|will|would)\b", re.I)

# Registry entries are supplied by the dispatcher, not inferred by the conversational model.
def wants(utterance):
    u=(utterance or '').strip()
    if FIX_IT_RE.fullmatch(u): return 'fix_it'
    if SELF_CODE_RE.search(u) and QUESTION_RE.search(u): return 'self_code'
    if ARROW_RE.search(u) and QUESTION_RE.search(u): return 'arrow'
    return ''


def run(utterance, prior=None, executors=None):
    available=set(executors or ())
    kind=wants(utterance)
    if kind=='arrow':
        spoken=('Yes. The pointer executor can draw a red arrow on a visible control. Tell me what to point to. No arrow was drawn by this answer.'
                if 'pointer' in available else 'The pointer executor is unavailable in this runtime. No arrow was drawn.')
    elif kind=='self_code':
        spoken=('I can prepare code changes on an isolated branch with the coding worker. Tests and review must precede a live update. '
                if 'agent_tools' in available else 'The coding executor is unavailable in this runtime. ')
        spoken+='Wider file or system access needs a specific scope and approval; asking this question has not changed access or edited code.'
    elif kind=='fix_it':
        last=str((prior or {}).get('user') or '').strip()
        spoken=(('Your previous request was: '+last[:180]+'. ') if last else '')
        spoken+='No repair has run from this reply. Please name the behavior to repair or the project and goal; I can then use an available executor.'
    else:return {'ok':False,'spoken':'','task_verified':False}
    return {'ok':True,'tool':'capability','spoken':spoken,'task_verified':False,'capability_evidence':{'executors':sorted(available)}}
