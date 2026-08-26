---
name: input-required-gate
description: >-
  Pay, send, deploy, secret, or delete returns a confirm any instance
  can resume. Silence is not yes. Use with ask-principal. Cursor plus
  Grok Bot.
---

# Input-required gate

**Stack:** Cursor + Grok Bot. HITL posts. Evens answers. Same card as `ask-principal`.

**Spine:** `send-removed` → `confirm-then-actuate` → `input-required-gate`. One HITL system.

**Aliases:** `tier-3-card` · `input-required-money`

## When
Money, send, deploy, secret, delete, or book is about to fire. Before actuation.

## Card (any instance can resume)
```
id: <resume-id>
KIND: pay | send | deploy | secret | delete | book | publish
ACTION: <verb Evens picks>
WHY: <one line>
AGENT: <desk that gathered>
RISK: <what fires if yes>
REVERSIBILITY: <how to undo>
EVENS: pending
```

`ACTION / WHY / AGENT / RISK / REVERSIBILITY` is the one string. Do not add TARGET.

## Steps
1. Write the card. Persist `id`. Do not actuate.
2. Another Cursor or Grok instance may load the same `id` and continue. They still wait for Evens.
3. `EVENS: yes` from Evens only. Unset / silence / Cursor-checked = no.
4. After yes → Evens does the hard step. Desk resumes the same job.

## Stop
Pay / send / deploy / book / publish = operator. Confirm ≠ execute.

## Never
Silence-means-yes · auto-complete pay or book · a second gate schema · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus
