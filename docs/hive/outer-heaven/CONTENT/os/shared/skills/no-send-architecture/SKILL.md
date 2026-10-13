---
name: No send architecture
description: >-
  Use on any workflow with Send — remove auto-send; HITL only; if send exists assume it will send.
---

# No send architecture

Sources: Nate lesson 7 tool-permission-not-prompt; sacred HITL rules.

## When
Designing email, social, SMS, or CRM automations.

## Do
1. Draft-only paths by default.
2. Remove or hard-gate Send behind HITL Operator / operator yes.
3. Assume any present Send will fire someday.

## Don't
- "Never send" prose while a Send button remains live
- Client send without dual HITL where required
