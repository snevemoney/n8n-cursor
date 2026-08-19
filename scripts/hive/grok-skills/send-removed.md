---
name: send-removed
description: >-
  Strip Send from Comms and HITL surfaces. First Gmail is read+draft.
  Do not rely on never-send prose. Never ack-reply. Cursor plus Grok Bot.
---

# Send removed

**Stack:** Cursor + Grok Bot. HITL + Comms. Architecture, not a prompt.

**Spine:** `send-removed` → `confirm-then-actuate` → `input-required-gate`. One HITL system.

## When
Any Gmail, Twilio, n8n, or cookbook path that still has Send, restricted send, or ack-reply.

## Steps
1. Inventory the surface. If it has Send, treat Send as absent. Do not click it.
2. First Gmail = read + classify + draft. Stop. Hand the draft to HITL as a card.
3. Cookbook / routine / scenario must say **send removed**, not restricted send.
4. No “Received, thanks.” No low-risk auto-ack. Urgent → draft only.
5. Evens sends from his inbox after `confirm-then-actuate`.

## Stop
Send / pay / deploy / book / publish = operator. This skill never sends.

## Never
Restricted-send matrix · ack-reply send path · mass-DM · auto-pin · Gmail-fire because the draft exists · Claude Cowork/Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus

**Merged 2026-08-14:** `lRUpu2-KtGQ` “send on my behalf” on-tape ⊥ invoice path “draft so I send.” Keep the mismatch. Hive = draft only. `I7mpF7_pnPM` no mass-DM.
