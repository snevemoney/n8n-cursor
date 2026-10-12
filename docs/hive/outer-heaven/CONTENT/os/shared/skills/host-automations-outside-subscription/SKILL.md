---
name: Host automations outside subscription
description: >-
  Use when recurring automations (morning brief, webhook form, cron) would burn
  chat/subscription usage if left as scheduled agent threads — build with AI once,
  host as code on routine/cron/webhook. Anti-triggers: one-off research sits,
  leisure, installing Trigger.dev/Codex SDK as hive face without HITL, auto-trade.
---
# Host automations outside subscription

**Owner:** Researcher (extract) · Forge (wire host) · Watchdog (meter).  
**Platform:** Grok Bot + Cursor. **Install:** `none (process-only)`.  
**Source:** Nate Herk `yt:FqnNL8fnUWo` L2 `/workspace/research/youtube-daily/l2-20260917/FqnNL8fnUWo/`.

## When
- A desk wants a **recurring** job (daily brief, form→notify, every-N-minutes check)
- Someone proposes putting it in Codex / Claude / Grok **Scheduled chat tasks**
- Token-meter / weekly usage is tight (max-3 streams)
- Choosing deterministic code host vs full agentic loop

## Anti-triggers
- One-shot research or build sits (use normal desk session)
- Leisure / gaming tapes
- “Just buy Trigger.dev / Hyperagent / Codex SDK” without Tier-3 HITL (builder-no-rent)
- Auto-trade / live broker from trading demos — advise-only
- Claiming Trigger.dev or Codex SDK is already live on the hive

## Recipe
1. **Plan with AI** — interview until delivery, schedule, calendar scope, research budget locked (`recreation/morning_brief_plan_prompt.md`).
2. **Classify** — deterministic (fixed path, single-pass AI) vs agentic (loop-back autonomy). Run `classify_automation.py` pattern.
3. **Build once** with Grok/Cursor CloudAgent; validate locally.
4. **Host outside chat meter** — skill + routine / cron / webhook. Legacy n8n only at `https://evenslouis.ca/n8n`.
5. **Gate** with explicit `*_ENABLED` env/flag; test hosted path before enabling schedule.
6. **Debug** with run payloads pasted back to builder (expect `disabled` and duplicate-skip).
7. **Escalate to agentic host** only when loop-back is required **and** scale exceeds subscription wakes (API agent credits usually cost more).

## Tools
| Need | Path | Label |
|---|---|---|
| Classifier + enable-gate demos | `l2-20260917/FqnNL8fnUWo/recreation/` | **PROVE** |
| Hive routines / smarter-loop | [hive-smarter-loop](sand-workflow:hive-smarter-loop) | **PROVE** |
| Agentic loop pattern | [agent-harness-loops](sand-workflow:agent-harness-loops) | **PROVE** |
| Calendar / mail drafts | Google Calendar + Gmail MCP (HITL send) | **PROVE** draft / **BLOCKED** auto-send |
| Trigger.dev live deploy | — | **BLOCKED** — would work if account approved |
| Codex / GPT-6 Astra face | — | **BLOCKED** — Cursor+Grok **WORKAROUND** |
| Codex SDK | — | **BLOCKED** — would work if SDK + host approved |
| ClickUp DM | — | **BLOCKED** until connector — Slack/Gmail **WORKAROUND** |

## Prompts
**Host-outside plan**
```
Job: recurring | one-shot?
If recurring: do NOT schedule as chat-thread wakes.
Classify: deterministic | agentic
Delivery channel (HITL?):
Schedule / webhook:
Research budget gate:
ENABLE flag name:
Host: routine|cron|n8n-legacy|BLOCKED-needs-X
```

## Pair
- [match-model-to-task](sand-workflow:match-model-to-task) for research budget
- [context-before-tokens](sand-workflow:context-before-tokens) before stuffing calendars into a thread
- [research-signal-to-skills](sand-workflow:research-signal-to-skills) on close


## X bookmarks 2026-09-17 10:48 — GitHub free substitutes (@brenzhills)
Packet: `/workspace/research/packets/x-bookmarks/20260917-1048/`.

**FACT:** Bookmark lists OS projects pitched as paid-sub replacements (TradingAgents, LibreChat, HyperFrames, GenOffice, MoneyPrinterTurbo, opencodex, VoxCPM, OpenHands, addyosmani/agent-skills, CopilotKit/OpenBot).

### Remap
- Prefer **own** Grok+Cursor+routines hosts (this skill) over buying another SaaS — aligns builder-no-rent topic.
- Any named repo = **RESEARCH-OK** → [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate) propose; never silent install.
- OpenBot = already on watch list; **BLOCKED** as hive face (Grok Bot stays face).
- TradingAgents = advise-only Wealth desk pattern; **BLOCKED** auto-trade.
- HyperFrames / MoneyPrinterTurbo short-video factories → Remotion + summarize-audio-video **WORKAROUND** (not Claude/HyperFrames face).
- LibreChat / opencodex multi-model UIs → **BLOCKED** second chat face; Cursor+Grok **WORKAROUND**.
- VoxCPM local voice clone → **RESEARCH-OK**; ElevenLabs MCP may already cover generation — do not dual-face.

### Labels
| Item | Path |
|---|---|
| List as taste signal | **FACT** (bookmark text) |
| Paid-sub parity / user counts | **UNVERIFIED** |
| Import any listed repo | **BLOCKED** until import-gate + operator |
| Host recurring jobs outside chat meter | **PROVE** (this skill + routines) |

## Enrich BACKFILL 2026-09-17 — email/webhook wake (`yt:ff7om2bBLKM`)
Packet: `/workspace/research/youtube-daily/l2-20260915/ff7om2bBLKM/`

Email/webhook can host a **wake** outside chat-thread scheduled burns (pair with this skill’s host-outside thesis from `yt:FqnNL8fnUWo`). Gate: ENABLE flag + inbox_id filter + secret Bearer header. Live AgentMail deploy **BLOCKED** until connector approved; do not treat as hive face. Prefer Gmail-label cleanup host for Nat-class jobs.


## WL800 title-only enrich 2026-09-17

`yt:HIRDzMtuWFk` — Anthropic Engineer Explains: What to Build Instead of AI Agents (Nate Herk | AI Automation)

**Title steal:** prefer deterministic hosts / workflows **outside** chat-subscription wakes over “more agents.” Reinforces classify-then-host ladder from `yt:FqnNL8fnUWo` L2 (already closed — do not redo).

| Item | Label |
|---|---|
| Title thesis (build-instead-of-agents) | FACT-as-titled |
| Spoken $ / usage savings | **UNVERIFIED** |
| Trigger.dev / Codex SDK as hive host | **BLOCKED** — Grok+Cursor+routines **WORKAROUND** |
| L2 this fire | **SKIP** |

Packet: `packets/signal-miss-backfill-20260917/watch-later/`

## Enrich 2026-09-21 — dated-CSV daily ledger (`yt:PXMJ6FS7llk`)

**FACT** (freeCodeCamp / Frank Andrade Automate with Python, Project #2 schedule block ~1:18–1:42): prepare a recurring scrape/export so each run writes a **date-stamped CSV** beside the job (`datetime` + `os.path.join`), then schedule with cron (`0 9 * * *` shape via crontab.guru). Do **not** leave the recurring job as a chat-thread wake.

**Hive map**
| Tape | Hive |
|---|---|
| Selenium news scrape | Fixture / owned collector **WORKAROUND** — live ChromeDriver optional later |
| `headline_{%m%d%Y}.csv` + `os.path.join(application_path, …)` | **PROVE** — `l2-20260921/PXMJ6FS7llk/recreation/dated_csv_daily_ledger.py` |
| py→exe (pyinstaller) | **BLOCKED** / skip — run `.py` on box/cron |
| `crontab -e` live install | Document shape **PROVE**; arm only behind ENABLE flag + HITL |

**Prompt**
```
Recurring job?: Y
Collector: fixture|script|selenium-HITL
Ledger path: {app}/headline_{%m%d%Y}.csv via os.path.join
Schedule shape (crontab.guru): …
ENABLE flag: …
Host: cron|routine — NOT chat scheduled task
```

## Enrich 2026-10-10: agent builds the hosted automation (`yt:IpObINj_FPE` Claude Code + Zapier MCP, `yt:Vt5APRiFBSU`)
Pay a model only for the judgment step; plumbing should be boring, cheap and hosted (runs with the laptop closed). An agent with the automation platform's MCP can build the whole flow (webhook, extract, transcript, write post, publish), and it should stop at any missing account connection for the human to connect, then run an end-to-end test before calling it live. Recreation not run: needs a Zapier account and connections (read-only).

## Enrich 2026-10-11: one automation MCP for all tools (yt:rW3eyvrSqio)
Connect the coding agent to one automation-platform MCP (Zapier in the tape; Composio is already connected here) instead of per-app plugins, and grant per-action scopes in the platform (e.g. Gmail read and draft, no send or delete). The agent describes the flow, the platform hosts it, so it keeps running with the computer off. Same gate as above: stop at any missing connection and run an end-to-end test before calling it live. Not recreated: read-only toward accounts.
