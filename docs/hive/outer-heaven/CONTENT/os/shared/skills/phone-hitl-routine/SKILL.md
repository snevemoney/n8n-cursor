---
name: Phone HITL routine
description: >-
  Use when the operator texts a bot from their phone to kick an existing skill —
  nudge only. Triggers: text the desk, mobile ping, Jarvis call, restaurant
  booking by AI. Anti-triggers: outbound voice SDR, unattended
  restaurant/mechanic calls, Instagram DM farms, client SMS send.
---
# Phone → HITL routine

From Eric Grok tutorial + Nate remote/`/loop` pattern (`yt:01jxZN2ZNsc`, `yt:vfWTyEreOEc`). Talk-track for our stack, not Clay/cold-email.

## When
Operator wants “text the desk from my phone” to run something we already have.

## Do
1. Map the text to an **existing** skill or routine (triage, research packet, morning delta).
2. Bot **proposes** the action in Grok chat; operator confirms.
3. Execute only after confirm. Session-bound reminders die with the session unless saved as a real routine.
4. Log the run for Librarian if it produced a durable don’t or recipe.

## Don’t
- Client email/SMS/social send
- Clay / cold-email inbox-swap farms
- Instagram lead farms / DM automations
- Voice-SDR generic
- Quote reply-rate or lead counts as FACT
- New outbound SKU from a tutorial

## Batch-4 extract — Jarvis restaurant call (`yt:whIp1SOahOM`) 2026-09-01

FACT: personal assistant calls a restaurant, hears 7pm full / 8pm open, **checks with the boss**, calls back to confirm. Inbound call asks for a **code** before reading calendar/files. Twilio number on tape. Credit cards / PII withheld by instruction.

### Hive remap

- Outbound voice (restaurant, mechanic, any business) = **BLOCKED** (would work if we had a connected telephony connector). Do not pretend live. Do not install Vapi/Twilio from this tape.
- HITL path: bot **proposes** the booking (time, party, name) in Grok chat → Evens confirms → **operator** places the call, or we log it as a reminder.
- Inbound “call my bot” = same as a mobile text: map to an existing skill, PIN/code before any calendar or file read, never read cards.
- Prompt-pack / paid Skool = ignore. Claude Code Jarvis clone = **BLOCKED**.

### Tools

| Need | Path |
|---|---|
| Grok chat / mobile | in-product — **PROVE** |
| Calendar read | Calendar MCP — **PROVE** |
| Twilio / Vapi outbound | **BLOCKED** would work if we had telephony |
| Auto-book without confirm | **NO** |
| Claude desktop Jarvis | **BLOCKED** |

### Don't (thicken)

- Voice-SDR generic / unattended restaurant calls
- Quote lead counts as FACT
- New outbound SKU from a tutorial

## Wave-M repass 2026-09-09 (`yt:vfWTyEreOEc`)
EN VTT now on disk (was page-recovery). Packet: `/workspace/research/youtube-daily/repass-20260909/vfWTyEreOEc/`. Claude Code install still **BLOCKED**; hive remap unchanged.

## Wave U extract — Eric Grok Bot tutorial re-proof (`yt:01jxZN2ZNsc`) 2026-09-09

Full mp4+en-orig VTT + stills. Confirms phone→existing-skill HITL; always-on cloud PC = Job Runner **WORKAROUND**.
Reply-rate / 8M emails / Pathos results **UNVERIFIED**. Clay / cold-email inbox-swap / client send **BLOCKED**. OpenClaw/Hermes compare = talk-track **NO-SKILL**.
Packet: `/workspace/research/youtube-daily/repass-20260909/01jxZN2ZNsc/`.

## Matt Palmer Dialbot / Bland (`yt:Fmr_72cYZo8`) 2026-09-12

FACT (captions+stills): Grok Bot **Dialbot** template places outbound calls via Bland API + voice ID; secrets via secure vault (not chat); template link `https://x.ai/bot/NJXi2SWEuhNxjOjspMMPi`. Demo call can be awkward — tune prompt. Cost figure $0.07 = UNVERIFIED.

### Hive remap
- This skill stays **inbound phone→HITL nudge** only.
- Outbound Bland telephony = see [dialbot-bland-outbound](sand-workflow:dialbot-bland-outbound).
- SearchPlugins `bland` = none (2026-09-12). GetMcpServerStatus = no Bland server. Twilio-docs ≠ Bland calling.

### Don't (thicken)
- Buy Bland credits / install Bland from a routine without Tier-3 HITL
- Pretend live outbound call when connector missing
- Paste Bland API key in chat


## X bookmarks 2026-09-17 Reception catalog (no install)
Source: `@ElevenLabs` Reception pitch `2100262886916358361` · packet `x-bookmarks/20260917-1048/`.
- Machine: missed-call → answer / FAQ / book / text confirm.
- Steal as: this skill + [speed-to-lead-demo](sand-workflow:speed-to-lead-demo) pattern (HITL, building mode).
- **NO-SKILL install** ElevenLabs Reception / voice-SDR farm as hive face.
- Setup time / lost-customer $ = **UNVERIFIED**.

## Enrich BACKFILL 2026-09-17 — inbox notify (`yt:ff7om2bBLKM`)
Packet: `/workspace/research/youtube-daily/l2-20260915/ff7om2bBLKM/`

FACT: Nat routine DMs operator twice daily with urgent/respond candidates (source used ClickUp).

### Hive remap
- Cleanup summary → propose in Grok chat / Slack; operator confirms before any reply send.
- Phone ping = nudge to open URGENT bucket — not auto-reply.
- Pair [inbox-clean](sand-workflow:inbox-clean) + [inbox-three-buckets](sand-workflow:inbox-three-buckets).
