---
name: Nate five buy workflows
description: >-
  Use when picking demo SKUs — lead qual, support, voice reception, document
  processing, employee onboarding; one buyer + one metric; verify before pitch.
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
