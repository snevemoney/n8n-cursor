---
name: Speed to lead demo
description: >-
  Use when building or grading an inquire-to-book proof — form, qualify,
  calendar, owner alert, HITL drafts only — or when closing OpenAI Cloud Agents
  / Codex cloud speed-to-lead tapes. Anti-triggers: cold blast, voice-SDR first
  demo, OpenAI billing from a routine, second hive face.
---
# Speed to lead demo

Sources: Nate buy-list #1; youtube-ai-implement P0; speed-to-lead-demo brief; `yt:JFWq93b4_Oo` Bart Slodyczka OpenAI Cloud Agents (2026-09-12).

## When
Need a clickable proof that inquire → qualify → book → owner alert works (AI Partner Path A). Also when studying OpenAI Codex cloud / Agents API speed-to-lead tapes.

## Do
1. Form intake → qualify rules → calendar hold → owner alert.
2. Drafts only — HITL before any client email.
3. Prefer Grok plugins + local scripts; client-hosted n8n only if required (`https://evenslouis.ca/n8n` only — never n8ncloud).
4. Ship clickable demo + 60s Loom script (demo-walk-script).
5. Watchdog clicks the live path (verify-then-done).

## OpenAI Cloud Agents tape (`yt:JFWq93b4_Oo`) 2026-09-12

FACT method (captions+stills): platform.openai.com Agents = **agent** + **environment** + **session** (no cross-session memory). Form → n8n webhook → HTTP create-session; MCP via n8n for Gmail/Calendar; optional customer↔session_id DB for reply loop. Packet: `/workspace/research/youtube-daily/l2-20260912/JFWq93b4_Oo/`.

### Hive remap
| Tape piece | Hive path |
|---|---|
| OpenAI Agents API / Codex cloud | **WORKAROUND** Cursor CloudAgent + Grok Bot webhook/routine — not OpenAI as hive face |
| n8n Gmail/Calendar MCP | **PROVE** user-Gmail + user-Google-calendar MCP already connected |
| Form webhook → create session | **WORKAROUND** Grok webhook routine or mandatory-host n8n canary |
| OpenAI platform billing / Astra | **BLOCKED** would work if we had OpenAI Agents billing + API key (Tier-3 HITL) |
| Auto-send client email | **NO** — HITL drafts only (building mode) |

### Don't (thicken)
- Add OpenAI billing from a research routine
- Treat OpenAI Agents as a second hive face
- Auto-send Gmail without HITL
- Invent $10 credit / Astra cost as FACT

## Don’t
- Cold blast / auto-send
- Voice-SDR as the first demo
- Fake close rates
- Greenfield n8ncloud

## Enrich 2026-10-11 (signals-2mo-backlog, yt:-VXrYRBCdCU Oliver Rasmussen, full transcript)
- **Booking-agent prompt blocks:** start from a prompt that already converts and have the model split it into labelled blocks. The two blocks that matter: (1) **acknowledge first**: respond to what the customer actually said ("tooth pain for two days") before any question, never "happy to help, where to next?"; (2) **three-question conversation flow** that moves toward a decision. Capture name and contact at the very end. FAQ goes in a knowledge block.
- **Universal booking flow:** collect the details, then say a person will call to confirm. The point is that the lead feels handled within seconds, so they don't go to a competitor. Works for any clinic or store without a live calendar integration.
- **Skillify the demo:** turn the prompt-building step into a skill ("point it at any business"), then add a research step (site crawl → FAQ + call brief) and a lookalike chat UI (WhatsApp-style) so the owner recognises it. Key for the demo backend: short-expiry key (1 day), small credit cap.
- **Show-up step:** the day before the call, phone with one real research question ("are you closed Sundays?") to prove the demo is being built and get a small yes; reminder 2 h before; if they're 5 min late, use the calendar "email guests" ping.
- **Per-booked-appointment pricing (reference only, building mode):** cost per appointment = cost per lead ÷ booking rate (tape: ~$166 at 30% ⇒ ~$50/lead); price a little under it (tape: $100/booked appointment). Checked in `recreations/20261011/run1030/pricing_math.py` PASS: $12k/month at $100 needs 120 bookings, i.e. ~40 per client if 3 clients, so the tape's "2–3 clients" claim needs high-volume clinics. Income/close-rate claims UNVERIFIED.
- Hive remap: GoHighLevel Conversation AI + WhatsApp Business deploy is **BLOCKED** (needs client WhatsApp Business + Meta business account, and Evens is not selling yet). Prompt blocks + acknowledge-first rule are **PROVE** in the existing demo path; drafts stay HITL.
