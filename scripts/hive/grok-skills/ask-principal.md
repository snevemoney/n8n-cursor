---
name: ask-principal
description: Agent acts, then asks the human when unsure, then resumes. Never close a booking, take cards, or send. Use for voice, calendar, email, and any world action. No second voice vendor.
---

# Ask-principal (funnel)

**Stack:** Grok Bot state machine. HITL Operator owns the hard step.

## When
Voice, booking, inbox action, or any step that could spend money or speak for Evens.

## State machine
`act → if unsure, ask principal → resume → never touch money/PII`

## Steps
1. Do the cheap research/admin.
2. Ambiguity (time full, indoor/outdoor, which lead) → **ask Evens**. Do not guess.
3. After the answer, continue the same job.
4. PIN / scope: calendar, email, files. **No cards. No PII dump.**
5. Report when the loop ends.

## Ramp (Swadia)
Visible → efficient → automatic → **then** hand off judgment. Not the reverse.

## Stop
Send, pay, deploy, book, publish = operator. No Vapi / second voice stack.

## Anti-patterns
- Auto-book / auto-dial
- Closing the restaurant (or the deal) without a callback
- Giving Grok Bot card access “because Jarvis did”
