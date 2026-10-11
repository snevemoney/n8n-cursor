---
name: Personal X writer
description: >-
  Use when drafting X/social in the operator's voice — Demkinn #4 narrow writer
  skill.
---
# Personal X writer (Demkinn #4)

Owner: Creative Studio. Gap → runnable. **HITL: ASK before any public post.**

## When
Operator (or Publishing) asks for an X/social draft in Evens’s voice.

## Steps
1. Load strongest post samples from vault / recent X (match the channel you’re writing for).
2. Match hook length and tone; note dislike phrases (no lecture voice, no price theater, no fake metrics).
3. Input = **raw research only**. Never invent facts.
4. Draft 1–3 options. Remotion lock: if the post promises animate / map / coded walkthrough, say Remotion owns the cut — do not invent CSS.
5. Stop at draft. Surface to operator for HITL. Do not post.

## Done when
Draft options exist as an artifact the operator can approve or kill.

## Never
- Auto-send / auto-post
- Invent facts or numbers
- Mint agents
- Client-facing send without HITL

## Tools
| Need | Path |
|---|---|
| Draft | Grok — **PROVE** |
| X post | **BLOCKED** needsAuth — draft only |

## Prompts
**X draft**
```
Voice:
Draft posts. HITL publish. No jailbreak tone.
```

## 2026-10-11 enrich — PLM ledger + 4-axis pre-write score (L2 yt:YuOSyRj3sXg, Nicolas Cole)
Before drafting in the operator's voice, pull from (and append to) a **personal-language-model ledger** and score the piece on 4 axes — tier (commodity/personality/original), hook (commodity/personality/timely), shelf-life (timely/timeless), voice-dials (word choice / sentence length / sentence structure). The robot only **audits and recombines approved language**; it never invents facts or a "side."
- Run [personal-language-model-writing](sand-workflow:personal-language-model-writing) `plm_kit.py`: `audit(draft, ledger)` flags AI_PICKED_WRONG_SIDE / UNOWNED_COMMODITY / VOICE_DIALS_OFF → SLOP_RISK, `recombine` builds new lists from approved lines only.
- The **1% voice fix** (Cole): change one dial (e.g. add two "according to <source>" lines) rather than rewriting — flips "this isn't me" to "sounds like me."
- LLM rewrite to the target dials runs via Cursor cloud agent (OpenRouter in Cursor); HITL before any post, as always.
