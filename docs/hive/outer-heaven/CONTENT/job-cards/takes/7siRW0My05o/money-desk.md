# Money Desk — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4170 words. Nate + Azim: first AAS Plus hackathon winner — $5,000, 3 weeks, brief = voice agent + n8n backend. Azim ~6 months in, high school, no prior tech, learned from Nate/YouTube; Bolt was new ~2 months prior. Caption-only; timestamp UNKNOWN. Beats in order: Seolassium mental-health web app — custom Bolt frontend, 9 n8n workflows (‘nine biggest pains’), Vapi host, Firebase email/password + user ids. Onboarding: name/email/phone/TZ/password → verify → five questions (what brings you, etc.) so the companion is not generic. Home: start session / progress / customize. Start session → n8n → personalize agent from details → Vapi outbound call (‘expect a call soon’). Live call (Nate): stressed at work, uncomfortable sharing, asks for breaths; agent (male, no gender pref set) pauses, inhale/hold/exhale, not aggressive; Nate ends. After hangup: separate agent condenses transcript+summary into the user profile for the next call. Workflows chronological: (1) onboarding webhook → code extract → profile-manager agent (Sheet tool maps fields) → second agent customizes prefs (e.g. morning+evening rows). Nate: Bolt/Lovable just POST the webhook URL on button. (2) on-demand call webhook — linear, lots of IF, ‘keeps you in control,’ not very autonomous. Safety check first: crisis → emergency path (real world would alert services). No emergency → caution-score twins → mental-health AI loads Sheet by user id. New user: write prompt → agent creates Vapi assistant. Existing: get assistant → prompt writer updates → recreate/update assistant. Then two HTTP agents place the call and dynamically fetch an available phone number (mark busy). Poll every 30s until call ended → notify web app → reload user → agent merges current profile + transcript/summary → mark number free. (3–5) morning / evening / Sunday = same graph, schedule trigger not button. (6) preference-changed webhook → extract user id → master + two sub-agents (overall profile vs each preference sub-profile). (7) weekly report (in progress): Fri 8–6 hourly, cycle users, pull every preference profile, email (Gmail demo; real world = CRM). Nate: because the order is fixed, do **not** give those hops to an agent as tools — linear = fewer ways to mess up. They skip the rest of the nine; templates in Plus. Frontend light because audience is n8n. Plans: Azim unsure — HIPAA/data-protection/funding to give it away free; has a voice-agent agency; this is a passion demo clients can call; own YouTube + new School (templates, 1:1). Nate: even if it never ships, portfolio. Close: Plus templates; like CTA. $5k / hundreds of participants UNVERIFIED.

## B. Atomic Knowledge
### Linear-beats-autonomous-when-the-order-is-fixed
- **Claim:** On-demand call and weekly report stay IF-heavy and linear. Nate’s praise: you stay in control. Don’t hand a fixed sequence to an agent as tools — more ways to mess up.
- **Reasoning:** Nine workflows were ‘nine pains’ but the win is guardrails: safety branch, 30s poll, number busy/free, new vs existing Vapi assistant.
- **Mechanism:** Webhook in → extract → named IFs → one agent hop when a prompt must be written → HTTP out. Schedule clones the same graph.
- **Evidence:** On-tape crisis path; 30s poll; morning/evening/Sunday copies; weekly Gmail demo.
- **Conditions:** The path is the same every time.
- **Exceptions:** n8n / Vapi / Bolt / Firebase / Plus templates / auto-dial / emergency-services are not ours. HIPAA is a stop, not a SKU.
- **Action:** Steal linear-when-order-is-fixed. Do not ship a therapist. Do not auto-dial.
- **Confidence:** high as a design rule
- **Source:** 7siRW0My05o @ UNKNOWN
- **Epistemic:** SOURCE
### Profile-writes-then-the-call-reads
- **Claim:** Onboarding agents write Sheets (core + preference rows). The call graph reads by user id, rewrites the Vapi prompt, then a post-call agent merges transcript+summary back. More calls = tighter personalization.
- **Reasoning:** Frontend is Bolt+Firebase; backend is nine webhooks. Preference change has two sub-agents so each knows what it edits.
- **Mechanism:** Write path and read path share a key (user id). Post-call update is a separate hop, not the same agent that dialed.
- **Evidence:** On-tape five onboarding Qs; Nate’s live breath session; male voice default.
- **Conditions:** You have a stateful companion, not a one-shot bot.
- **Exceptions:** Mental-health + outbound Vapi is operate-never for us. Sheets as PHI store is a footgun he does not solve.
- **Action:** Steal write-then-read key. Do not store therapy notes. Clients parked.
- **Confidence:** high as a data loop; domain forbidden
- **Source:** 7siRW0My05o @ UNKNOWN
- **Epistemic:** SOURCE
### Prize-and-HIPAA-are-not-a-launch
- **Claim:** $5k + 6-months-in high-school story is the inspire card. Azim will not launch without HIPAA/funding; Nate says keep it as a call-this demo for an agency.
- **Reasoning:** Hundreds of participants, 3-week brief (voice + n8n). Plus paywall for the nine JSONs.
- **Mechanism:** Portfolio ≠ product. Compliance is the hard step, HITL, not a weekend Bolt.
- **Evidence:** On-tape $5,000 / HIPAA / agency / new School. All UNVERIFIED as business facts.
- **Conditions:** A hackathon tape.
- **Exceptions:** Do not analog $5k. Do not unpark a health ICP. Vapi/Bolt/n8n not ours.
- **Action:** Steal portfolio-as-demo. HOLD the prize and the app.
- **Confidence:** high as a money-desk read
- **Source:** 7siRW0My05o @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: a $5k win is linear guardrails + personalization loop, not a swarm. Priority: safety IF before dial; number pool; post-call writeback. Experience: Nate on a live outbound; Azim 6 months. Contrarian: weekly report must stay linear. Uncertainty: HIPAA/funding — Azim has no launch plan.

## D. Procedures
His order: Bolt form → webhook → Sheet profile → (later) webhook → safety → load profile → create/update Vapi → checkout a number → dial → poll 30s → merge transcript → free number. Scheduled prefs copy the graph. Our order: do not build this. Steal linear+safety-first. Caption-only: every click UNKNOWN.

## E. Examples
**Situation:** Nate starts a session. **Action:** n8n personalizes + Vapi outbound. **Reasoning:** button is a webhook. **Outcome:** call in ~1 min; breath script; hangup writes profile. **Lesson:** Frontend is a trigger; the graph is the product.

**Situation:** Crisis language. **Action:** safety node before the companion. **Reasoning:** real world would page services. **Outcome:** emergency branch exists (not demoed live). **Lesson:** The IF is the product; we will not operate it.

**Situation:** Friday weekly email. **Action:** fixed hop order, Gmail demo. **Reasoning:** same every week. **Outcome:** Nate: don’t tool-ify it. **Lesson:** Linear when the order cannot change.

## F. Decision Rules
IF order is fixed → linear, not tools-on-an-agent. IF outbound voice / health / crisis → operate-never. IF $5k / 200–3000 members / HIPAA-as-weekend → UNVERIFIED / stop. Refuse: Vapi / n8n / Bolt / Firebase / Plus templates as ours; auto-dial; health ICP.

## G. Contrarian
Rejects ‘autonomous agent’ as the hackathon aesthetic. Rejects launching a therapist from a 3-week Bolt. Rejects giving a fixed weekly sequence to an agent.

## H. Assumptions
Prize $ and participant count UNVERIFIED. Live call is a demo, not a patient. Sheets as the store. Vapi/HIPAA unsolved. Survivorship: one winner. Falsifier: safety branch never fires correctly. Speech≠behavior: ‘help people at no charge’ then Plus + his School + agency consults.

## I. Questions
Did the emergency path ever page a human? Any checkout we can open from the agency demo? What’s actually in the other five workflows?

## J. Connections
SYSTEM SYNTHESIS: linear-when-fixed = `jZgcWCzxh1I` stay-down-the-ladder. Safety IF = `oWdJMJp2HgM` fail-branch. Write-then-read = `lcNN3X9gXls` prompt-table. Vapi/Bolt/n8n/health = operate-never. $5k → UNVERIFIED.

## K. Future-Use
Unassigned: number-pool busy/free as a concurrency guard. Poll-until-ended as a webhook-less vendor pattern.

## Steal / Operate-never

### Machine: Linear-safety-then-writeback-not-a-swarm
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a button or a clock → action: safety IF → load profile by id → one prompt-write hop → checkout a resource → do the thing → poll until done → write back → free the resource → checkable stop: the Sheet row changed and the number is free
- **Questions / signals:** Is the order fixed? What’s the safety fail-branch? What resource must not double-book?
- **Qualify / frame / objections:** Frame: nine linear pains beat one autonomous blob. Objection: ‘ship the therapist’ — HIPAA is the hard step.
- **Procedure:** Do not dial. Do not store PHI. Do not analog $5k. Steal linear+pool+writeback for non-health graphs.
- **Example that proves it:** Nate breath call; 30s poll; morning/evening copies; weekly stays linear. $5k UNVERIFIED.
- **Why it works:** Fixed order plus a safety IF is how a 6-month builder won. Autonomy is more ways to be wrong.
- **Conditions / exceptions:** Works as a graph shape. Exception: Vapi / n8n / Bolt / health / auto-dial / $5k as FACT operate-never.
- **Operate-never payload:** Vapi · n8n-cloud · Bolt · Firebase · Plus templates · auto-dial · health ICP · $5k analog
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails` · `website-offer-funnel` (Path A still parked)
- **Source:** 7siRW0My05o @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $5,000 / hundreds of participants as FACT or as our analog.
- Build/dial a mental-health agent. Vapi / n8n / Bolt / Firebase as ours. Unpark a health ICP. Plus templates as a SKU.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD the hackathon app, Vapi, and Plus templates. Steal linear-when-fixed and checkout-a-number. Health/outbound stay operate-never. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
