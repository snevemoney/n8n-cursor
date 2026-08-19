---
name: ask-principal
description: Agent acts, then asks the human when unsure, then resumes. Never close a booking, take cards, or send. Use for voice, calendar, email, and any world action. No second voice vendor.
---

# Ask-principal (funnel)

**Alias:** `confirm-then-actuate` — same loop, same card. Do not run a second doctrine.

**Stack:** Grok Bot state machine. HITL Operator owns the hard step.

**Spine:** `send-removed` → `confirm-then-actuate` → `input-required-gate`.

## When
Voice, booking, inbox action, or any step that could spend money or speak for Evens.

## Gate card (one string)
Every hard step uses this card before Evens sees it:

`ACTION / WHY / AGENT / RISK / REVERSIBILITY`

Roster `APPROVE` / `EDIT` / `REJECT` maps onto **ACTION** (the verb Evens picks). Do not invent a second card shape. Do not add TARGET.

## State machine
`act → if unsure, ask principal → resume → never touch money/PII`

## Steps
1. Do the cheap research/admin.
2. Ambiguity (time full, indoor/outdoor, which lead) → **ask Evens** with the five-field card. Do not guess.
3. After the answer, continue the same job.
4. PIN / scope: calendar, email, files. **No cards. No PII dump.**
5. Report when the loop ends.

## Ramp (Swadia)
Visible → efficient → automatic → **then** hand off judgment. Not the reverse.

## Stop
Send, pay, deploy, book, publish = operator. No Vapi / second voice stack.

## Never
- Auto-book / auto-dial
- Closing the restaurant (or the deal) without a callback
- Giving Grok Bot card access “because Jarvis did”
- Gmail send or ack-reply send path
- A second gate schema alongside this card

**Merged 2026-08-14:** `I7mpF7_pnPM` kill on opportunity cost. `vLlIBT0HSSc` no employer send / no unpark to “practice FDE.” Silence is not yes.
