---
name: Client delivery checklist
description: >-
  Use at handoff of an automation or site install — client hosts where needed, QA ladder, Loom, 60/30/10, Grok-first with n8n as fallback.
---

# Client delivery checklist

Sources: Nate 60/30/10 and client-hosted n8n; youtube-ai-implement P1 #6.

## When
Handing a paid or trial install to a client.

## Do
1. Prefer Grok plugins + Cursor. Client-hosted n8n only when required.
2. QA ladder: happy path, fail path, mobile, form submit.
3. Loom handover of the outcome, not the canvas.
4. 60/30/10 split of build / harden / document as a planning check.
5. DONE_WHEN with Watchdog click.

## Don't
- Resell n8n as SaaS without license clarity
- Skip HITL on send
- Leave credentials in chat
