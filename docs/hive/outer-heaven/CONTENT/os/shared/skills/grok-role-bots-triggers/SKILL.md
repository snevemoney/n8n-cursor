---
name: Grok role bots triggers
description: >-
  Use when wiring Grok Bot fleets — role agents, shared skills, cloud computers,
  Slack/Git/Calendar triggers; one chief, one-job specialists.
---
# Grok role bots triggers

**Sources:** Riley Brown fleet patterns; Nate `yt:TMPUUyQC5aM`; Berman `yt:5CSXUsljJ_E`.

## When
Adding triggers or role bots to the hive desk.

## Do
1. Role agents with shared skills. Clear one-job descriptions (email, calendar, research, motion…).
2. One pinned **chief of staff**: delegate-first; only do work if no specialist fits; bring results back.
3. Prefer event triggers (Slack, GitHub, Teams when live) over noisy cron when supported.
4. Split **shared knowledge** (all bots) vs **private desk notes** (chief-only).
5. Specialize tools by role (Cursor cloud agent vs Grok browser) — do not bet one tool for everything.
6. Optional: separate **personal** bot from work chief (Berman) — still no agent mint without yes.
7. Standing routines start paused until confirm ([named-desk-routines](sand-workflow:named-desk-routines)).

## Don't
- Quote funding/user claims
- Second desktop outside Cursor
- Second chief / hundred-agent swarm
- Composio / ClickUp / GoHighLevel as required
- DoorDash / leisure order bots as skills
- Unattended send/pay from browser teach

## Tools
| Need | Path |
|---|---|
| Gmail / Calendar / GitHub | live MCP — **PROVE** |
| Routines | Grok named routines — **PROVE** |
| Cursor cloud agent | coding loop from Grok — **PROVE** when wired |
| Slack/Teams event triggers | **PROVE** if plugin connected; else **BLOCKED** would work if we had Slack/Teams MCP |
| Telegram bridge | **BLOCKED** would work if we had a maintained Telegram bot token path (Berman: not native) |
| Composio mega-connector | **WORKAROUND** optional; prefer native plugins |

## Prompts
**ASR source:** Nate `yt:TMPUUyQC5aM` Whisper LIVE (Klaus-style chief, Motion/Eyes/Coffee/Money/Views specialists).

**Chief card (FACT from tape description)**
```
You are [Name], sole chief of staff — the only bot the operator talks to.
Before doing any task, check whether another Grok bot owns it and delegate first.
Only do the work yourself if no specialist fits. Bring results back here.
Shared wiki: [path]. Private notes (chief-only): [path].
Plugins shared (Gmail/Calendar/GitHub): all bots may use. Composio = optional WORKAROUND for YouTube/Reddit/LinkedIn gaps — prefer native when present.
```

**Specialist card (FACT one-job examples)**
```
One job: [e.g. motion graphics for intros/transitions | researcher | morning planner | social mining | content strategy]
Owns: …
Never: …
Wake: …
Done-when: …
Handoff: chief.
```

**Shared vs private memory (FACT tip #4)**
```
Write SHARED (all bots): company, funnel, connector quirks (e.g. Composio → YT/LinkedIn if used).
Write PRIVATE (this bot only): [prefs, drafts, sensitive].
Confirm what the bot I'm talking to actually knows before long tasks.
Optional: start a thread on one important message, then return to main session.
```

**Routine + Teach a Task (FACT tips #7–8)**
```
Create routine: name · instruction (run skill X / talk to bots Y) · schedule or event (Slack/Git/Teams).
Teach a Task: record screen on shared computer → analyze → skill; reuse saved browser profile (no paste secrets in chat).
School auto-like / saved-login abuse = NEVER.
```

## LIVE enrich 2026-08-24 — Brock Mesarich (`yt:BFZ7lyKYcg8`) FACT
**Fleet pattern (steal):**
| Role | Job | Trigger |
|---|---|---|
| Main / chief | Brain dump → delegate | Chat + morning schedule |
| Inbox triage | Multi-inbox scrape → top 3 + handoffs | Daily schedule (e.g. 8am) |
| Invoice | Style-matched invoice draft + payment track | Event: invoice/payment mail or Slack keyword |
| Meeting / notes | Notes → action items → tracker | End-of-day schedule |
| Content | X/industry scrape → idea list | On-demand or schedule |
| Brand partnerships | Sponsorship threads | Handoff from main/inbox |

**Do**
- Prefer **draft email / draft invoice** then human send (Zubair + Brock FACT HITL).
- Multi-account Gmail when plugin supports it (FACT vs Claude limitation claim — treat as product note).
- Event triggers > noisy cron when the plugin supports them.
- Demo bots with **redacted** client names/$ when screen-sharing.

**Remap / BLOCKED**
| Signal tool | Hive |
|---|---|
| ClickUp boards | GitHub issues / Drive tracker — **WORKAROUND** |
| Granola meeting notes | **BLOCKED** would work if we had Granola MCP — Calendar + manual notes **WORKAROUND** |
| Parallel deep research / monitors | WebSearch + WebFetch + competitor-monitor — **WORKAROUND**; Parallel account **BLOCKED** until connected |
| Zapier MCP (Beehiiv/School) | Native plugins first; Zapier **WORKAROUND** optional |
| Slack invoice trigger | **PROVE** if Slack live; else **BLOCKED** would work if we had Slack MCP |
| Vapi / phone JARVIS calls | **BLOCKED** — do not install |
| Telegram JARVIS bridge | **BLOCKED** — would work if we had maintained bot token |

**Prompt — invoice + inbox pair (HITL)**
```
Create/update Invoice role bot:
- Works with Inbox triage: flag invoice/payment threads only
- Generate invoice from uploaded style PDF sample + lead/amount/SKU from operator or CRM note
- Draft client email with attachment; NEVER send unattended
- Log status to GitHub issue or Drive tracker (ClickUp not required)
- Event trigger when available; else morning routine scan
```

## Official skills/routines docs (2026-08-26)
**FACT.** Skills via `/`. Teach-by-demo ≤10 min, no mic. Routines: 50/Bot, 20-run history. Event triggers use the Cursor account (Slack/GitHub/Linear/Sentry/PagerDuty/Teams). Auto Review: Settings → General → Auto-review.
Shared computer is account-scoped — 17 named Bots are not isolation.
Source: https://docs.x.ai/grok-bot/skills-routines-and-automations

## Matrix 2026-08-26
Teach-a-task: one pass, under 10 minutes, no mic. Routines cap 50/Bot. Do not clone a Monday job 14 times. Event triggers use the Cursor account. hive-smarter-loop.

## WL 138 Tim plugins (`uuUo7gWuH9w`)
Title only. Hive = Grok plugins + Cursor. Do not install Claude Code plugins.


## WL26-100 remaining L2 2026-08-27 — 4Cs HITL (PROVE tape)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

`yt:TL8V41Ea6oM` FACT: coordination / creativity / clarity / coaching. Prompt = job + tool + buckets + output + **boundary**. Visible → efficient → automatic → then delegate. Agent earns send (draft, don't send). Calendar after email is trusted. Microscope a contract (5-col terms table), don't "summarize." Don't upload sensitive personal/medical. Remap Claude Cowork → this skill + Grok bots. **NO-SKILL** Cowork install.

## Tim computer + X 2026-08-28 (`yt:ezANo2RNryU`) FACT
Name which computer (box vs operator local) when the bot should browse or shell. X plugin is **not** live for us (Tim also could not connect it). Disk bookmarks **WORKAROUND**. Slack event routines stay **BLOCKED** until Slack MCP is connected.

## EXTRACT-BATCH-1 2026-09-01 — Riley Grok 4.6 shape (`yt:VWDnptnvFrA`) FULL

**When:** naming a Grok Bot, attaching a routine, or someone wants Claude Co-work / GPT Work as a second stack.
**Anti-triggers:** GenSpark clip = sponsor NO-SKILL; do not mint desks; $ / 7.5× cheaper claims UNVERIFIED.

FACT from `transcripts/VWDnptnvFrA/full.txt`:
- A Grok Bot session is a **named agent** (mini system prompt), not an ephemeral Co-work chat that gets lost in a left rail.
- **Routines live on that bot**, not in a global scheduled pile.
- Plugins + skills are shared; each bot has its own cloud computer.
- Tape: Grok 4.6 led economically-valuable / long professional / legal work, **not** coding benchmarks. Use inside Cursor for coding; Grok Bot for knowledge-work desks.
- Do not install Claude Co-work, GPT Work, Buzz, or Claude Tag as hive OS. We already are named desks + routines-on-desk.

**Bot card**
```
Bot name:
One job:
Routines attached to THIS bot (not global):
Shared plugins: Gmail / Calendar / GitHub
ClickUp → ACTION_LOG.jsonl
Start PAUSED. HITL before send/pay.
```

## EXTRACT-BATCH-1 2026-09-01 — Five Grok Bot use cases (`yt:lRUpu2-KtGQ`) FULL

FACT from `transcripts/lRUpu2-KtGQ/full.txt`: inbox triage → chief; Higgsfield product-ad from phone photos; Firecrawl when YouTube scrape blocked; invoice+inbox pair; meeting notes → tasks; Zapier MCP only for apps not in the plugin list.

Hive remap (do not copy ClickUp/Zapier/Composio/School):
| Signal | Hive |
|---|---|
| ClickUp boards | ACTION_LOG.jsonl / GitHub issue — **WORKAROUND** |
| YouTube / Composio | disk `transcripts/<id>/full.txt` — **WORKAROUND** |
| Firecrawl MCP | **BLOCKED** would work if we had Firecrawl — WebFetch + disk transcripts **WORKAROUND** |
| Granola | **BLOCKED** — Calendar + notes **WORKAROUND** |
| Zapier MCP (Beehiiv/School) | native plugins first; Zapier not required |
| Higgsfield product video | live MCP — **PROVE** |
| Auto-send email/invoice | **NEVER** — [tool-permission-not-prompt](sand-workflow:tool-permission-not-prompt) |

**Inbox + invoice pair (HITL)**
```
Inbox bot: Gmail read → top-priority briefing. Never send.
Invoice bot: draft from style sample; never send. Log status to ACTION_LOG.jsonl.
YouTube competitor titles: use disk transcripts / WebFetch, not Firecrawl.
Higgsfield: phone product shots → ad via connected MCP. Human QA.
```


## Enrich wave-H 2026-09-09 — Berman `5CSXUsljJ_E` (marker: wave-H-20260909-berman)
Packet: `/workspace/research/youtube-daily/repass-20260909/5CSXUsljJ_E/`
- Named role bots (email/calendar/coding/chief) with HITL before external send/delete.
- Cursor CLI/cloud agents orchestrated from Grok for CI loops = RESEARCH-OK / PROVE pattern.


## Repass delta — video-training 20260909 Wave I
- yt:BFZ7lyKYcg8: multi bots + inter-bot messaging + schedule/event triggers + multi-Gmail; invoice auto-trigger = draft+HITL only.


## WL800 title-only cross-ref 2026-09-17

- `yt:w16-JRiCaZ8` company-of-one scale → role bots + triggers, not headcount agents
- `yt:dEBMnnJMmCI` hack catalog → named role bots with HITL before send
- `yt:4hKJ9X6rGFo` sell course → delivery checklist; $ **UNVERIFIED**
- Packet: `packets/signal-miss-backfill-20260917/watch-later/WL800_CLOSE.md`
- No new second face. No invent $.

## Enrich 2026-10-11: company-of-one pods (yt:w16-JRiCaZ8, Brian Casel)
- One chief of staff; per product a pod of head-of-product, growth bot and maintainer bot. Each head writes a weekly report to the chief, who merges them into one portfolio report for the operator.
- Bots orchestrate, they don't create: they spin up cloud coding agents (AMP or Cursor) and drive other tools (e.g. Descript) instead of doing heavy generation themselves. Bake tool and model choices into skills so the operator only says "start a new feature".
- **Growth-bot loop:** read the product's analytics → pitch experiments against one goal (revenue, acquisition, churn) → operator approves → bot runs and tracks them → reports what worked → next pitches use last week's results. Approval stays human. Evens is in building mode, so this is a pattern to hold, not to deploy for selling.
- Portability: keep every skill a plain agent skill so it moves to another harness if this platform fades.
