---
name: Booking embed
description: >-
  use this when adding Cal.com booking with confirmation webhook into the hive
  automation path
---
# Booking embed

## Steps
1. Confirm Cal.com (or equivalent) event types with the operator.
2. Embed booking on the agreed page (React component or inline).
3. On confirmation, webhook → automation/n8n or Grok lane for CRM/notify — do not invent a second money desk.
4. Test a real booking in preview; verify timezone America/Toronto if operator-facing.
5. Document env secrets; never commit API keys.

## Done when
- Preview booking completes
- Confirmation path verified
- Secrets only in host env
