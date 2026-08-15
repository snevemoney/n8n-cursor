# DEMO BRIEF — Speed-to-Lead / Intake→Book
**From:** Researcher · **To:** Forge · **Date:** 2026-08-12  
**Operator kick:** YouTube AI implement list P0 #3  
**Related:** `youtube-ai-implement/PACKET.md` · Nate Herk “5 workflows” #1 · SBF capability-test pack (pattern only)

---

## Outcome (partner language)

**Show a solo operator:** inquiry lands → qualified → booked on calendar → reminder fires — in under a minute of wall-clock demo time.

Bucket: **ACQUIRE** (+ light **CUT** on missed DMs/emails)  
KPI: time-to-first-touch + booked consult rate  
Baseline (demo fiction, labeled): lead waits hours/days on email/DM  
60-day target language: “same-day booked calls from web/IG inquire”

Do **not** sell “chatbot.” Sell **speed-to-booked**.

---

## Why this demo (evidence)

| Signal | Label |
|--------|--------|
| Nate Herk buy-list #1 = speed-to-lead | FACT (dossier) |
| Operator AI diet = audit → agents → retainer; n8n/Claude/Grok vocabulary | FACT |
| Public PT dry-run (Spencer Boyd): Apply CTA → 404, mailto:null, no calendar | FACT (test pack only — not a client) |
| Cinematic + MCP demos already live — next proof should be **ops rails**, not more landing polish | OPINION |

---

## Scope (build this / not that)

### IN — MVP demo
1. **Intake form** (name, email/phone, goal, urgency, source) on a small Next page or extend an existing demo app.
2. **Qualify rules** (deterministic): e.g. has phone + goal → “hot”; missing phone → ask once; spam honeypot.
3. **Book path:** Cal.com or Calendar link / embedded slots (prefer something already in hive stack; Cal.com matches Nate stack notes). If OAuth is painful, fake “available slots” UI that still writes a booking record + sends a confirmation email **in demo mode**.
4. **Speed touch:** on submit, show operator console event + optional email/SMS stub (“Text sent” mock OK if no Twilio — label DEMO).
5. **Reminder:** scheduled or simulated T-24h / T-1h confirmation row in UI.
6. **Operator inbox view:** list of leads with status `new → touched → booked → reminded → no-show/risk`.
7. **60s Loom script** in README (what to click).

### OUT — not this sprint
- Real client outreach / warm sends  
- Full CRM (HubSpot) unless already trivial  
- Voice agent (ElevenLabs) — P2 later  
- n8n greenfield estate — Grok-first; optional thin n8n only if it unblocks calendar/SMS faster  
- Redesign of cinematic marketing site  
- Guaranteeing ROI numbers in UI copy  

---

## Architecture preference (Grok-first OS)

1. **Default:** Next.js demo app (sibling to MCP demo pattern) — local + Vercel preview.  
2. **Connectors:** prefer existing Grok/Cursor plugins where useful (Calendar read); don’t block MVP on OAuth.  
3. **Deterministic core (60%):** form validation, routing rules, status machine.  
4. **AI assist (≤30%):** optional one-line “suggested reply” or classify goal tags — must work with AI off.  
5. **Human (10%):** approve override / mark no-show.  
6. **Secrets:** demo mode with fixtures; no prod keys in repo; `.env.example` only.

Repo: `snevemoney/n8n-cursor` (same as prior demos). New route/app OK (e.g. `:3007` local) — mirror MCP demo discipline (PR + smoke).

---

## Acceptance / DoD

- [ ] Public or local URL loads intake + operator board  
- [ ] Submit lead → appears on board &lt; 2s with status `new`  
- [ ] One path reaches status `booked` with datetime shown  
- [ ] Reminder row visible (real cron or clearly labeled simulate)  
- [ ] AI-off path still books  
- [ ] README: 60s click path + four-blank blurb for GTM  
- [ ] Smoke note (`SMOKE.md`) Forge-style  
- [ ] No Tier-3 sends; no CE APIs  
- [ ] PR open against repo  

---

## Copy / UI constraints

- Headline idea: **“Lead to booked — while you’re on the floor.”**  
- Show **timer** from submit → first touch (even if touch is automated stub).  
- Label mocks: `DEMO` / `SIMULATED SMS`.  
- Never paste unverified agency income claims.

---

## GTM hook (for Product GTM later)

One-liner: “We wire inquire → qualify → calendar → remind so owners don’t lose leads in DMs.”  
Proof assets: this demo + cinematic brand shell + MCP “live tools” demo.

---

## Suggested milestones

| # | Slice | Est. |
|---|--------|------|
| M1 | Intake form + lead store + operator board | small |
| M2 | Book slot + status `booked` + confirmation UI | small |
| M3 | Reminder simulate + timer + README/SMOKE + PR | small |

Ship M1–M3 as one PR if fast; else M1+M2 first.

---

## References
- `~/.grokbot/research-packets/youtube-ai-implement/PACKET.md`  
- `~/.grokbot/outer-heaven/CONTENT/nate-herk-dossier.md` (5 workflows, 60/30/10)  
- `~/.grokbot/research-packets/spencer-boyd-fitness/PACKET.md` (leak patterns — test only)  
- Live demos: https://cinematic-ai-partner.vercel.app · https://mcp-connector-demo.vercel.app  

**Packet path:** `~/.grokbot/research-packets/speed-to-lead-demo/DEMO_BRIEF.md`
