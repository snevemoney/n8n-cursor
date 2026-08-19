---
name: no-show-follow-up
description: >-
  After a booked callback they missed. Draft one reschedule note.
  ask-principal. No auto-book. No second slot without Evens. Cursor
  plus Grok Bot.
---

# No-show follow-up

**Stack:** Cursor + Grok Bot. Comms drafts SMS/email. HITL + `ask-principal`. Evens books or they rebook on *their* CTA.

## When
A Path A callback/consult was booked on **their** calendar (or a window Evens confirmed) and they did not show. Not for unsent drafts. Not for our Calendly.

## Steps
1. Confirm the missed slot from their calendar or Evens’ notes. Do not invent a no-show.
2. Draft **one** reschedule note (email or SMS they already use): leak still true, two windows offered as text, they pick. Evens voice.
3. `ask-principal` — Evens chooses channel and whether to offer a second slot.
4. Dual HITL if email: APPROVE DRAFT → APPROVE SEND. SMS draft = same gates.
5. **Do not** open Calendly, create a new event, or fire a reminder sequence.
6. If they rebook and show → resume `private-book-install` / `proof-30-60-90`. If they miss twice → park. `HUNT_LOG.md` `stage=parked` if Evens says so.

## Stop
Book / send / SMS fire = operator. This skill drafts. It does not book.

## Never
Auto-book the next slot · auto-dial the no-show · second voice vendor · consumer Calendly theater on a trade callback · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus · operate farms.
