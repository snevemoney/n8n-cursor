---
name: Nate five buy workflows
description: >-
  Use when picking demo SKUs — lead qual, support, voice reception, document
  processing, employee onboarding; one buyer + one metric; verify before pitch.
merged_from: [speed-to-lead-demo]
---
# Nate five buy workflows

**Sources:** Nate Herk `yt:tgjYMym_0-c` (The 5 Most Valuable AI Automations to Sell in 2026); prior buy-list; youtube-ai-implement.  
**Remap:** Hyper Agent / Claude Code demos → Grok-first + Cursor; n8n = legacy fallback only ([client-delivery-checklist-grok-first](sand-workflow:client-delivery-checklist-grok-first)).

## When
Choosing which automation demos to build next for AI Partner / portfolio.

## The five (FACT from tape ranking criteria: recent buyer demand, real deployments, clear buyer, measurable result)
1. **Lead qualification + follow-up** — enrich → score vs company rules → CRM → follow-up/book. Metric: response time + % qualified that book. HITL low-confidence.
2. **Customer support resolution** — answer from approved sources → safe actions → escalate with summary/sources/actions. Metric: correct resolves without human + reopen rate.
3. **Voice receptionist / missed-call recovery** — qualify, book, calendar/CRM; disclose AI; route urgent/uncertain. Metric: recovered bookings + cost/booking. Voice productize = careful; no new voice-SDR ICP without yes.
4. **Document-to-system processing** — ingest → extract → validate → draft in system → human approve money moves. Metric: field accuracy + drafts needing no correction. Boring = beautiful.
5. **Employee service / onboarding** — policy Q&A, IT/HR requests, role-based access requests as drafts. Metric: time-to-ready + fewer missed tasks. Approvals stay human.

## Do
1. Pick **one buyer, one process, one measurable outcome** — specialist steakhouse, not buffet of 30 demos.
2. Interview the person doing the work; walk ≥3 real examples (not perfect SOP).
3. Map triggers / systems / data / rule-vs-judgment / exceptions / approvals / success metrics.
4. Prefer document-processing or speed-to-lead first for beginners; map to existing microdemos.
5. Re-verify public buy-list before treating order as FACT. Survey $/adoption % on tape = **UNVERIFIED** without [claim-verifier](sand-workflow:claim-verifier).

## Don't
- Clone School funnel / Hyper Agent as ours
- Quote income, job-loss %, or vendor survey stats as FACT
- 10 agents talking to each other for lead routing
- Voice-SDR productize without operator yes
- Greenfield n8n estate as default

## Tools
| Need | Path |
|---|---|
| Lead / CRM demo | Gmail + Calendar + existing speed-to-lead demos — **PROVE** |
| Support / docs | Drive + GitHub — **PROVE** |
| Document microdemo | document-processing-microdemo — **PROVE** |
| Voice receptionist | **BLOCKED** would work if we had a connected voice/telephony connector (Vapi etc.) — do not pretend live |
| Delivery | [client-delivery-checklist-grok-first](sand-workflow:client-delivery-checklist-grok-first) — **PROVE** |
| n8n | [n8n-legacy-ops](sand-workflow:n8n-legacy-ops) legacy only — **WORKAROUND** |

## Prompts
**ASR source:** `yt:tgjYMym_0-c` Whisper LIVE. Ranking criteria FACT: recent buyer demand · real deployments · clear buyer · measurable result. Survey % = UNVERIFIED.

**Five buys map**
```
Map Nate five to hive SKUs + workflow ids:
1 Lead qualification + follow-up — enrich→score vs company rules→CRM→follow-up/book
   Metric: response time + % qualified that book. HITL low-confidence / unusual.
2 Customer support — approved sources → safe actions → escalate w/ summary+sources+actions+next steps
   Metric: correct resolves without human + reopen rate (wrong answers ≠ success).
3 Voice receptionist / missed-call or after-hours — disclose AI; qualify; book; calendar/CRM; route urgent/uncertain
   Metric: recovered bookings + cost/booking. Voice productize BLOCKED without connected telephony (no Vapi install).
4 Document-to-system — ingest→extract→validate→draft (invoice/PO match)→human approves money
   Metric: field accuracy + drafts needing no correction. Boring = beautiful.
5 Employee service / onboarding — policy Q&A; role-based access/equipment/training as drafts; manager approvals
   Metric: time-to-ready + fewer missed tasks.
For each: buyer · process · metric · hive path · PROVE/WORKAROUND/BLOCKED
ONE portfolio pick for [vertical]. No $/% as FACT. No 10-agent lead swarm.
```

**Process interview (FACT from close)**
```
Interview the person doing the work. Walk ≥3 REAL recent examples (not perfect SOP).
Map: triggers · systems · data · decisions that follow rules vs need AI judgment · exceptions · approvals · success metrics.
Adapt to THEIR stack/permissions — no one-size-fits-all. Dummy data OK for portfolio.
Beginner default: document processing (easy test) OR lead routing if you know CRMs OR missed-call if you know local services.
Steakhouse rule: one buyer, one process, one measurable outcome — not a buffet of 30 demos.
```

**Lead-qual HVAC/cleaning portfolio (FACT vertical tip)**
```
Vertical: [commercial cleaning | HVAC]
Capture + enrich + score + CRM record + territory/service route + short score explanation to salesperson.
Low-confidence → person (do not discard). Track response time + qualified→book %.
One reliable workflow; clear rules; human handoff; clean CRM — not multi-agent theater.
```

## LIVE enrich 2026-08-24
- **Premium scroll marketing site** (Nate ScrollCraft `yt:QUI6Ug4cHnE`) is a **delivery SKU pattern**, not a 6th “buy automation” — route via website-build-pipeline + cinematic-site-recipe + client-delivery-checklist-grok-first. **$10K** = UNVERIFIED.
- **Inbox→invoice→tracker** (Brock `yt:BFZ7lyKYcg8`) maps to buy #1/#4 adjacent (follow-up + document/invoice processing) — Grok role bots + HITL send; ClickUp not required.
- Zubair JARVIS phone receptionist (`yt:Acw0NtkyNtM`) = voice buy #3 shape but **BLOCKED** without telephony — do not pitch as live.

## Nondilutive funding scan adjacent 2026-08-29 (`yt:L8pR2YAV8Fw`) watch-page PROVE
Not a 6th buy-automation SKU. Adjacent Money-desk scan: Canada grants / loans / wage subsidies / tax credits / procurement — keep equity (non-dilutive).
- Match programs → draft only. Official pages over a SaaS pitch.
- No Happly.ai signup or Chrome extension without operator **yes**.
- Money spend / paid SaaS = **Tier 3 propose-first**. $ traction claims **UNVERIFIED**.
- Route via `nondilutive-funding-scan`. Do not auto-submit grant forms. Do not store API keys in notes.

## Enrich wave-P 2026-09-09 — Fable 5.1 + one-person biz (marker: wave-P-20260909-fable51)
Packets: `repass-20260909/FBVNS1l5Vb8/`, `repass-20260909/LVAHYV4Xrto/`
- Prompt habits: done-criteria → effort dial → prove-its-work → subagent parallel; audit over-prescriptive skills (`recreation/FABLE51_PROMPT_HABITS_CHECKLIST.md`).
- One-person AI partner: 3 buckets · paid audit ladder · dogfood · race to 10 nos · niche from wins (`recreation/ONE_PERSON_AI_BIZ_CHECKLIST.md`).
**PROVE:** VTT+checklists on disk. **WORKAROUND:** Grok+Cursor (Claude/Fable face optional). **BLOCKED:** treating Nate $ / Skool as FACT. $ **UNVERIFIED**.

## Wave U extract — Nate sell Claude workflows (`yt:zpS6JGJNaGg`) 2026-09-09

Agency trap → AI-person path → one number in {time saved, mistakes cut, money made}. Cool demos ≠ moved number.
Host $ / $1M playbook **UNVERIFIED**. Skool/opt-in **NO-SKILL**. Unattended client automation **BLOCKED**.
Packet: `/workspace/research/youtube-daily/repass-20260909/zpS6JGJNaGg/`.

## Wave T addendum 2026-09-09 (`yt:vY0EzTP-7EA`)
Positioning tape: constraint-first consultant / in-house AI person (not new SKUs). Pair with five-buy list via `recreation/CONSTRAINT_CONSULTANT_CARD.md`. Claude/School **BLOCKED**; tape $ **UNVERIFIED**. Packet `…/vY0EzTP-7EA/`.

## WAVE_X_REPASS_20260909
Source tape CLOSED PARTIAL with VTT+stills: `yt:tgjYMym_0-c` → `recreation/NATE_FIVE_BUY_GATE.md`. Voice telephony still **BLOCKED**; Hyperagent/Skool **NO-SKILL**.

## Wave Y 2026-09-09 (`yt:IVx8OSMbTss`)
- Six P SaaS course verified PARTIAL alongside saas-sprint-six-ps; live store still BLOCKED

---

## Merged from `speed-to-lead-demo` (2026-10-11)

- Original description: Use when building or grading an inquire-to-book proof — form, qualify, calendar, owner alert, HITL drafts only — or when closing OpenAI Cloud Agents / Codex cloud speed-to-lead tapes. Anti-triggers: cold blast, voice-SDR first demo, OpenAI billing from a routine, second hive face.
- Unique content carried: inquire-to-book proof rubric (form→qualify→calendar→owner alert, HITL drafts); full body below

# Speed to lead demo

Sources: Nate buy-list #1; youtube-ai-implement P0; nate-five-buy-workflows brief; `yt:JFWq93b4_Oo` Bart Slodyczka OpenAI Cloud Agents (2026-09-12).

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
