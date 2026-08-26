# Researcher — 7siRW0My05o
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/7siRW0My05o/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~4170 words). Title: This Vapi + n8n Voice Agent Won $5,000 in Just 21 Days. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Plus hackathon: 3 weeks, brief = voice agent + n8n backend. Winner Azim/Zane (captions flip the name), ~6 months in, high school, no prior tech; Bolt + YouTube. Hundreds entered. $5,000 UNVERIFIED. Nate: “everyone thinks agency; apparently the answer is Plus.” (2) Product: mental-health web app (Soulassium / “Seolassium” in captions). Bolt frontend, Firebase auth (email/password, user ids), 9 n8n workflows, Vapi outbound voice. Onboarding: name/email/phone/timezone/password → 5 intake Qs so the companion is not generic. Main: start session / progress / customize. Click start → n8n personalizes agent from profile → Vapi outbound call. Live demo: Nate stressed-at-work; agent does breath work; male voice, pauses, “not aggressive.” (3) After hangup: separate agent condenses transcript+summary into the user profile for the next call. (4) Workflow 1 — onboarding webhook: webhook → code extract → Profile Manager agent (Google Sheet) → second agent writes preference sheets (morning/evening). Nate: drop webhook URL into Bolt “on this button, POST here.” (5) Workflow 2 — on-demand call (the “master”): webhook → **safety check** (crisis → emergency path that “in the real world would alert emergency services”) → caution-score twin branches → mental-health agent loads Sheet by user id. New user: write prompt → create Vapi assistant. Existing: get assistant → rewrite prompt → update/recreate. Two HTTP agents place the call and **dynamically fetch available phone numbers**. Poll every **30s** until ended → notify web app → merge transcript/summary into profile → mark number free again. Linear + conditionals; Nate praises “not very autonomous / keeps you in control.” (6) Three more near-clones on schedule triggers (morning / evening / Sunday). (7) Preference-changed webhook: user id → master → two sub-agents (overall profile vs each preference sub-profile). (8) Weekly report (in progress): Fri 8a–6p hourly, walk users × preference sheets → email; he would use a CRM not Gmail. Nate: because the order is fixed, **do not give those steps as agent tools** — linear = fewer mess-ups. They skip the rest of the nine; templates in Plus. (9) Launch: Azim says HIPAA + data protection + funding to give it away free; not sure he will ship. Nate: even unlaunched it is a portfolio call-demo for a voice-agent agency. Azim: own YT, consults, new Skool, templates. **Do not flatten** vs other Vapi/instance-MCP tapes. Mental-health + “alert emergency services” is a claim, not a verified crisis system. All $ / “hundreds” / HIPAA readiness UNVERIFIED.

## B. Atomic Knowledge

### Linear guardrails beat an autonomous therapist
- **Claim:** The winning shape is webhook → safety branch → Sheet lookup → create-or-update Vapi prompt → checkout a phone number → poll-until-ended → write-back. Not a free-roaming agent.
- **Reasoning:** Fixed order (onboard, call, report) should stay a pipeline. Tools-for-every-step give the model room to skip or double-write.
- **Mechanism:** Nine workflows; on-demand vs three schedule clones; preference webhook; weekly report as a for-each, not a tool-bag.
- **Evidence:** Nate: “doesn’t seem very autonomous… keeps you in control.” Report: “wouldn’t make much sense to make all of those a tool.”
- **Conditions:** Hackathon voice+n8n brief. Sheets as the store.
- **Exceptions:** Safety branch is the one place they *want* a hard divert. Crisis “would alert emergency services” is **not shown**.
- **Action:** Steal linear-over-autonomous for high-stakes flows. Operate-never: Vapi, mental-health product, fake 911 path.
- **Confidence:** high as the design lesson; crisis path unobserved.
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** “nine biggest pains of my life” (unspecified)
- **Speech ≠ behavior:** “real world would alert emergency services” vs demo that only does breath work.

### Profile write-back is the personalization loop
- **Claim:** Intake + every call transcript/summary update a Sheet profile (and preference sub-profiles). The next Vapi assistant is rewritten from that pile. New vs existing users are different create/update paths.
- **Reasoning:** A generic voice bot loses the hackathon; a per-user prompt that compounds is the product.
- **Mechanism:** Firebase identity → Sheet rows → prompt writer → Vapi create/update → after-call merge agent.
- **Evidence:** “the more you use this… the smarter… about you.” Preference change hits two sub-agents so each sheet has one job.
- **Conditions:** Demo onboarding only. No long-run proof.
- **Exceptions:** HIPAA / public launch blocked by his own admission.
- **Action:** Steal write-back-then-rewrite. Do not store client therapy notes. No new ICP.
- **Confidence:** high as the loop; quality of “smarter” UNVERIFIED.
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none named on write-back
- **Speech ≠ behavior:** none.

### Resource checkout (phone numbers) is a lock
- **Claim:** Numbers are marked unavailable for the live call and released after the 30s poll says ended. HTTP agents fetch a free number so two calls don’t collide.
- **Reasoning:** Voice vendors have a finite caller-id pool. A linear lock is cheaper than hoping the API queues.
- **Mechanism:** Fetch available → occupy → poll → notify UI → merge profile → free number.
- **Evidence:** Nate calls out the 30s poll and the unavailable/available flip as “error handling guardrails.”
- **Conditions:** Vapi + his number pool. Unobserved at scale.
- **Exceptions:** Schedule clones reuse the same idea on a different trigger.
- **Action:** Steal occupy/release for any scarce outbound resource. Hive: no Vapi buy.
- **Confidence:** high as the pattern.
- **Source:** `7siRW0My05o` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown
- **Speech ≠ behavior:** none.

## C. Mental Models
Frontend (Bolt) is a form that POSTs to a webhook; the “app” is nine n8n graphs. High-stakes domains need a safety fork *and* still are not shippable without compliance. Portfolio > product when HIPAA is the wall. Linear + Sheet + poll beats a therapist-shaped agent. Plus-as-the-answer is a channel CTA, not a business law.

## D. Procedures
1. Bolt (or any UI) → webhook on submit.
2. Extract fields → Profile Manager writes the identity Sheet → preference agent writes schedule sheets.
3. On call: safety check first. Crisis = dedicated path (he did not demo 911).
4. Load profile by user id. New = create Vapi assistant; existing = get + rewrite + update.
5. Checkout a phone number; place outbound; poll ~30s until ended; notify UI; merge transcript; release number.
6. Clone that graph onto morning/evening/Sunday schedules.
7. Preference edits = two narrow agents, not one god-agent.
8. Fixed-order reports = pipeline, not tools.
9. Hive: no Vapi, no Plus JSON, no mental-health client, no send. `ask-principal` on anything that calls a human.

## E. Examples
- **Situation:** Nate onboards + starts session. **Action:** n8n → Vapi outbound. **Outcome:** breath-work call, natural pauses. **Lesson:** demo quality ≠ compliance.
- **Situation:** After hangup. **Action:** transcript+summary → profile. **Outcome:** next call is supposed to be sharper. **Lesson:** write-back is the product.
- **Situation:** Weekly report. **Action:** linear walk of four sheets then email. **Outcome:** Nate: don’t tool-ify a fixed order. **Lesson:** autonomy is a bug when the sequence is known.
- **Situation:** Ship it? **Action:** Azim names HIPAA + funding. **Outcome:** parked. **Lesson:** hackathon win ≠ production.

## F. Decision Rules
- IF the sequence is known → linear graph, not a tool-bag agent.
- IF a resource is scarce (caller IDs) → occupy / poll / release.
- IF new vs existing objects → split create vs update, don’t one-shot both.
- IF the domain is crisis/health → safety fork *and* do not ship without real compliance (he said so).
- IF the UI is Bolt/Lovable → webhook URL is the join, not a native integration.
- Refuse: Vapi spend; Plus template as hive source; quote $5k as FACT; new ICP; mental-health outbound.

## G. Contrarian
A high-school Plus member winning $5k is the ad. “Alert emergency services” is spoken, not built on camera. Firebase + Google Sheets is not a HIPAA architecture. Nate converts the unshipped app into an agency leave-behind. Captions disagree on Azim vs Zane.

## H. Assumptions
$5,000, “hundreds” of entries, 6 months, 9 workflows, 30s poll, HIPAA gap = **UNVERIFIED** (HIPAA-needed is his claim; treat as warning, not a cert).
**Desk dissent:** Steal linear + checkout + write-back. Operate-never the voice-therapy product and Vapi.

## I. Questions
- What did the other eight / remaining workflows do?
- Did the emergency path ever fire with a real escalation target?
- Number-pool size?
- Azim vs Zane — which name is right?

## J. Connections
- **SYSTEM SYNTHESIS:** instance-MCP / Vapi tapes (operate-never send) · `ehg4fhydTgs` (remote vs cookies) · `jZgcWCzxh1I` (don’t climb autonomy without pain). Skills: `ask-principal` · `send-removed` · `input-required-gate` · `inbox-to-task-routing`.

## K. Future-Use
Linear-over-autonomous. Occupy/release. Profile write-back. Webhook-as-frontend-join. Safety-fork-then-pipeline. Portfolio-when-compliance-blocks.

## Steal / Operate-never

### Machine: linear-voice-pipeline-with-locks
- **Epistemic:** SOURCE
- **Workflow / loop:** UI POST → extract → sheet profile → safety fork → create-or-update assistant from profile → checkout number → place call → poll ended → merge transcript → release number → optional schedule clones
- **Questions / signals:** Is the order fixed? Is the number free? New or existing assistant? Did safety fire?
- **Qualify / frame / objections:** Demo ≠ HIPAA. Crisis path unobserved. $5k is a prize, not a price analog.
- **Procedure:** D.
- **Example that proves it:** On-demand master + 30s poll + number lock; report kept linear.
- **Why it works:** Control lives in the graph. Personalization lives in the write-back, not in a smarter model.
- **Conditions / exceptions:** Vapi/Sheets on-tape. Hive does not call humans or store therapy notes.
- **Operate-never payload:** Vapi; Plus JSON; mental-health outbound; quote $5k as FACT; new ICP.
- **Hive run (existing skills only):** `ask-principal` · `send-removed` · `input-required-gate`
- **Source:** `7siRW0My05o` @ UNKNOWN

**Operate-never**
- Install Vapi / ship a therapy bot / fake 911. Join Plus for the JSON. Quote tape $ as FACT. New `icp_id`. Send / pay / deploy.

## L. Role-Specific Applications
Catalog the linear+lock+write-back machine. Do not hunt a mental-health ICP. Do not treat Plus hackathon as a hive offer.
