---
name: E-sign packet (HITL)
description: >-
  Use when GTM/Money Desk need proposal→signature — generate PDF via office pack;
  human sends/signs in browser. No agent auto-sign or auto-pay.
---
# E-sign packet (HITL)

**Owners:** Product GTM · Money Desk
**Path:** **WORKAROUND** — office-artifact-pack PDF + Drive + box browser DocuSign/SignWell UI.  
**BLOCKED** for auto-send API — **it would work if operator picked an e-sign vendor + Tier 3 approval**.

## Steps
1. Generate proposal/SOW PDF (office-artifact-pack).
2. Upload Drive; operator reviews.
3. Operator (or HITL Operator desk) sends/signs in vendor UI on box — agent does not sign alone.
4. File signed PDF + lane id into packet / ledger.

## Never
- Agent pays or agent signs alone
- Secrets in chat
- Skip Tier 3 on money documents
