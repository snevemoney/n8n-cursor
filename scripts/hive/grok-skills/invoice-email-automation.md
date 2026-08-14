---
name: invoice-email-automation
description: Read invoice/billing emails and draft responses. Client-service for agency-delivery. HITL on send and payment.
---

# Invoice email automation

**Machine:** `invoice-email-automation` · **ICP:** agency-delivery

## When
Agency owner drowning in billing email, payment follow-ups, or invoice threads.

## Handshake
1. `python3 scripts/hive/catalog-demand-match.py --need "invoice email automation"`
2. **Plugin:** Gmail read-only
3. **Writer:** Cursor for skill/routine; Grok drafts only

## Steps
1. Identify invoice/payment threads (Gmail plugin).
2. Draft reply or flag for Money Desk (amounts = their words only).
3. HITL Operator queue: ACTION/WHY/RISK before send.
4. If catalog row exists but not operating → pilot then upgrade.

## HITL
Send · charge · change payment terms · legal commitments

## Never
Autonomous payment · quote $ as proof · skip Money Desk margin on client offers
