---
name: Inbox clean (Demkinn #20)
description: >-
  Use when inbox overload — classify, batch archive propose, draft replies paused,
  sponsor/lead scoring labels; HITL on send/delete.
---
# Inbox clean (Demkinn #20)

**Owner desk:** Communications Manager  
**Lane:** hive-os  
**Sources:** demkinn skills/20; Berman `yt:5CSXUsljJ_E` (email agent + classification).

## When
Inbox overload sitting; overnight leftovers; sponsor/PR triage.

## Do
1. **Easy archive batch** — OOO, one-off notifications; propose archive, confirm once.
2. **Low-effort batch** — need eyes, not reply; short summaries; archive after glance.
3. **Action queue** — thread + prior context + Drive/CRM if connected; suggest next action / draft reply (paused).
4. **Labels + scores** — sponsor spam vs quality score; PR / internal-ops labels for later retrieve.
5. Learn standing rules over time (“always archive X”) — still HITL until trusted.
6. Optional routine: weekday morning batch + capped daytime interval (Berman pattern) — start paused.

## Don't
- Unattended delete / auto-send
- DoorDash browser-order as part of inbox skill
- Quote inbox volume claims as FACT

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

## Tools
| Need | Path |
|---|---|
| Gmail | Gmail MCP — **PROVE** (CONNECTED) |
| Drive context | Drive MCP — **PROVE** |
| Calendar conflicts from mail | Calendar MCP — **PROVE** |
| HubSpot / CRM enrich | **BLOCKED** would work if we had HubSpot MCP connected |
| Auto-send | NEVER |

## Prompts
**Inbox pass**
```
Window: [overnight | last 24h]
1) Easy-archive propose (list + one confirm)
2) Low-effort batch summaries
3) Action items with draft replies PAUSED
4) Labels: sponsor-score · PR · ops
HITL on sends/deletes. Teach standing archive rules only after confirm.
```

**Sponsor score**
```
Score inbound sponsor mail 1–5 with reasons. Auto-archive only after owner
approves the rule. Never send.
```

## Enrich wave-H 2026-09-09 — Berman `5CSXUsljJ_E` (marker: wave-H-20260909-berman)
Packet: `/workspace/research/youtube-daily/repass-20260909/5CSXUsljJ_E/`
Email: easy-archive propose → low-effort batch → action drafts PAUSED. Weekly cleanup propose-only risk buckets. DoorDash NO-SKILL. Telegram/HubSpot/Fathom partial BLOCKED/WORKAROUND.

## Enrich BACKFILL 2026-09-17 — Nate Grok bot emails (`yt:ff7om2bBLKM`)
Packet: `/workspace/research/youtube-daily/l2-20260915/ff7om2bBLKM/`

FACT: Nat bot labels Gmail into primary / notifications / outreach / urgent (+ newsletters); stars primary+urgent; **no drafts**; twice-daily routine + phone-adjacent notify.

### Hive remap
- Prefer existing labels (01 Action · 07 Newsletters · 04 Business/Sales · 10 Accounts/Security · RECEIPTS) — see `recreation/gmail_label_remap_proof.json`.
- Notify → Slack / Gmail draft / [phone-hitl-routine](sand-workflow:phone-hitl-routine) — not ClickUp-required.
- AgentMail per-bot send inbox = **BLOCKED** as second email face; session-bootstrap HOLD stands.
- Label classifier file demo **PROVE**; live apply/send **HITL**.

### Don't thicken
- Unattended send from bot-owned mailbox
- Mint AgentMail / second email SKU
- Auto-trade from email-woken bots
