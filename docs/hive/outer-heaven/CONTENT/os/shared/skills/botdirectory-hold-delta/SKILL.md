---
name: Botdirectory hold delta
description: >-
  Use on signals close or when asked to diff botdirectory.ai against the last
  scored packet and the HOLD/REFUSE list. Do not install bots or add a cron.
---
---
name: Botdirectory hold delta
description: Use on signals close or when asked to diff botdirectory.ai against the last scored packet and the HOLD/REFUSE list. Do not install bots or add a cron.
---

# Botdirectory hold delta

**Owner:** Researcher. **Optional weekly** — run from signals close if asked. Do **not** add a cron. Do **not** install bots. Do **not** add an 18th desk.

Public catalog only: `https://botdirectory.ai/api/bots.json`.

## When
Signals close, or operator/Consultant asks "what is new on botdirectory?" Skip if this week's packet already scored the same JSON.

## Recipe
1. Fetch the public JSON (WebFetch or box HTTP). Save beside the new packet. HTTP failure → **BLOCKED**: would work if the public API answers.
2. Diff slugs vs the last packet (if present: `research/packets/botdirectory-20260827/`). New slugs only — do not rescore the whole directory unless the operator asks.
3. Score each **new** slug **STEAL / SKIP / REFUSE** with the same refuse list:
   - no SEO farm / Julian / geo-town / AEO autopilot
   - no closers / send / speed-to-lead send
   - no voice-SDR / Vapi factory
   - no new lane
   - no 18th desk
4. **STEAL** = fold prompt language into an **existing** desk or skill. Not a new agent. Not a Monday clone.
5. Write a short delta note: new count, STEAL shortlist, REFUSE hits, SKIP rest. Then stop.

## Last scored (FACT 2026-08-27)
307 bots. 18 STEAL shortlist. 57 REFUSE. Packet: `botdirectory-20260827`.

## Bookmark cluster 2026-08-27
Tweets about "170+ ready-to-use Grok Bots" / Marketing OS / command-center-for-Claude-Code (`x:2092615296507072810` `x:2090770900241297844` `x:2092692303630696761` `x:2092641104311263405`) = the **same HOLD**. Fold language into existing desks. Do not install the directory. Do not give a bot its own send-mail inbox (`x:2090743477415923935`) — Gmail plugin is draft-only / HITL.

iOS OpenMausBot (`x:2092611678223630761`) = **BLOCKED** unless operator asks for a mobile pool. Not an 18th desk.

## Tooling (label every run)

| Need | Path | Label |
|---|---|---|
| Public `bots.json` | WebFetch / box HTTP | **PROVE** when 200 |
| Last scored packet | dated research packet if present | **PROVE** |
| Install listed bots / new cron / 18th desk | refused | **BLOCKED** — not a missing-tool ask |
| Slack autopost of the delta | not this skill | **BLOCKED** |
| Bot-owned email that sends | Gmail send | **BLOCKED** — HITL draft only |

## Never
- Install bots from the directory
- Add a weekly cron (signals close can run this)
- Mint an 18th desk or a new lane
- Flip REFUSE into STEAL to "try the closer"
- Treat STEAL as permission to stand up the vendor bot
- Auto-send from a bot mailbox

## Prompts
**Hold delta**
```
Fetch https://botdirectory.ai/api/bots.json
Diff slugs vs last packet (botdirectory-20260827 if present).
Score new slugs STEAL / SKIP / REFUSE.
Refuse: SEO farm, closers/send, voice-SDR, new lane, 18th desk.
STEAL = fold language into an existing desk/skill.
Do not install bots. Do not add a cron.
```
