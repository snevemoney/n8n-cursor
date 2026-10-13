---
name: Named desk routines
description: >-
  Use when attaching routines to a named desk — one job per desk, Grok stays in
  Cursor, skill+delegate in instruction, no second desktop.
---
# Named desk routines

**Sources:** Riley Brown Grok week; Berman named bots `yt:5CSXUsljJ_E`; Nate week `yt:TMPUUyQC5aM`; Serop routines caveat `yt:kXO4fIwxaDg`.

## When
Creating or editing a routine for a hive desk.

## Do
1. Named session = named desk. Routine prompt names **skill** + **delegate**.
2. Standing jobs start paused until confirm (session-bootstrap).
3. Grok stays in Cursor. One chief routes.
4. Schedule (hour/day/interval) or event triggers when live.
5. For inbound SaaS webhooks that cannot auth into Grok routines, use [n8n-legacy-ops](sand-workflow:n8n-legacy-ops) middleware — routines alone are not Make/Zapier.

## Don't
- Second Grok Bot desktop
- GenSpark / phone-harness as required
- Send/pay from cloud-browser teach without HITL
- Claim routines replace all automation middleware
- School auto-like / secret paste

## Tools
| Need | Path |
|---|---|
| Grok routines | in-product — **PROVE** |
| Skill body | /home/box/agent-data/workflows — **PROVE** |
| Webhook middleware | n8n legacy — **WORKAROUND** |
| Claude desktop routines | **BLOCKED** — Grok **WORKAROUND** |

## Prompts
**ASR sources:** Nate `yt:TMPUUyQC5aM` + Serop `yt:kXO4fIwxaDg` Whisper LIVE.

**Routine instruction (FACT: name skill + talk to agents)**
```
Skill: [id]
Delegate: [desk/bot]
Instruction: run [skill] / talk to [specialists] and [do X]
Trigger: schedule (hour/day/interval) OR event (Slack/Git/Teams when live)
HITL before send/delete/pay.
Start PAUSED until confirm.
If webhook source cannot auth here → n8n ACTIVE bridge first ([n8n-legacy-ops]).
Routines alone ≠ Make/Zapier/n8n.
```

**Chief + specialists scale (FACT Nate tip #2–3)**
```
Only talk to chief. Chief delegates to one-job specialists (research, motion, content, morning planner…).
After grill-me / goals dump, ask chief: propose specialists worth adding — refuse second chief / generic helper / thumbnail spam bots.
Shared knowledge vs private chief notes must be explicit.
```

## Matrix 2026-08-26
One routine per job. Max 3 parallel streams. Do not add another weekly-intel clone. hive-smarter-loop.

## Cursor 2026-08-19 map
/goal and Custom Modes = named-desk-routines (one job per desk, not 15 clones). Subagent VMs = golden-test-loop second node, not a second Bot. Subscriptions are cloud-only WORKAROUND. Do not install a new product.

## Batch-4 extract — Four C's life agents (`yt:TL8V41Ea6oM`) 2026-09-01

FACT four pillars: **Coordination · Creativity · Clarity · Coaching**. Tape builds them in Claude Cowork. Microsoft 117-email / 275-interrupt stats = **UNVERIFIED**. Buttons change; the workflow does not.

### Hive map (do not mint four new desks)

| C | Existing desk / skill |
|---|---|
| Coordination | Day Planner + [meeting-prep-focus-defender](sand-workflow:meeting-prep-focus-defender) + [inbox-clean](sand-workflow:inbox-clean). Gmail+Calendar **PROVE**. Drafts paused. |
| Creativity | Creative Studio + [office-artifact-pack](sand-workflow:office-artifact-pack) + a **brand skill** (colors/type/layout locked). |
| Clarity | [document-processing-microdemo](sand-workflow:document-processing-microdemo) / [public-web-extract-md](sand-workflow:public-web-extract-md) — explain a contract/report; do not sign. |
| Coaching | [personal-decision-analyst](sand-workflow:personal-decision-analyst) — judgment stays with Evens. |

Claude Cowork = **BLOCKED**. Grok routines **WORKAROUND**. Auto-send / auto-delete / unattended calendar writes = **NO**.

### Prompt

```
Four C check for this week:
Coordination: inbox batch + day prep (paused sends)
Creativity: one artifact with locked brand skill
Clarity: one confusing doc → bullets (no sign)
Coaching: one decision memo
No new desks. No Claude Cowork.
```


## Enrich wave-H 2026-09-09 — Berman `5CSXUsljJ_E` (marker: wave-H-20260909-berman)
Packet: `/workspace/research/youtube-daily/repass-20260909/5CSXUsljJ_E/` (delta vs prior CLOSED prompt-pack).
- Persistent named bots + Chief-of-Staff delegate > disposable threads.
- DoorDash / food-order leisure = NO-SKILL. Telegram/HubSpot native = BLOCKED until connected.
- Pair with inbox-clean propose-only cleanup + session-bootstrap morning HITL.

## Enrich 2026-10-10: Lead + scouts desk with new-only pings (`yt:8kJPzkPm2Zc` Creator Magic / HyperAgent)
FACT (tape): 4 single-job scouts (X, Reddit, Price, Review), each on its own model. A **Lead** orchestrates them from one brief, the agents keep memory, and when an integration is missing an agent writes itself a skill. A command center shows runs and cost, and an ESP32 board pings on NEW finds.
PROVE on box: `lead_scouts_watch.py` (this folder) → `3/3 PASS`. It covers fan-out, merge/rank, and a memory file that pings only on new keys.
Rules: one job per scout; the lead merges and ranks; the monitor emits only unseen keys; log cost per run. Live fetchers and model calls plug in where the fixtures are.
