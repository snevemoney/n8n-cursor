# Money Desk — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~5064 words. Nate: hop off a sales call → Fireflies log → Slack yes/no → Gamma proposal. Caption-only; timestamp UNKNOWN. Beats in order: two workflows on purpose (scale/route later — minutes vs proposal vs other). WF1: Fireflies webhook (prod URL in Fireflies developer settings, ‘transcription complete’). Body is thin: meeting ID + event type, **no transcript**. Wait, then Fireflies get-meeting — sentences[] = transcript; title/host/keywords; AI gist/action items **lag** the transcript, so wait + if(gist exists) else loop (poll). Code node: speakers array — he pastes incoming JSON to Claude (‘write an n8n code node’) and iterates. Sheet append: now, title, attendees, gist, status NA, meeting ID. WF2: new-row trigger; limit last item (two meetings same second). Fetch meeting again; code node speaker-run (Nate Herk once until next speaker, not every sentence). Slack send-and-wait: ‘Green Grass proposal concluded — generate?’ Yes → agent; No → status `generation declined`. Agent role: senior AI solutions consultant / sales engineer for **UpAI**; constraints: client-facing, no follow-up Qs, **don’t mention automation/AI/system-produced**, confident assumptions + placeholders. **Assumption: never auto-send — 90% then human.** Structure: title, exec, problem, proposed, ROI, intangibles, roadmap, success metrics, why UpAI. Gamma generate API: copy curl, header auth, line-by-line required/optional; `inputText` = agent block; `textMode=preserve`; custom theme ID (copy from Gamma ⋮); replace() newlines/quotes so JSON doesn’t break; auto-share view/comment to his email. Slack ‘deck generating’; sheet **update** (not append) match meeting ID → `generated`. Email: ‘Automated vendor onboarding… Greengrass’ — exec recapture **~350+ hrs/yr, $28k, 0% error** UNVERIFIED; problem hours/week; four-part solution; ROI weekly/annual; **graph he wouldn’t send** (colors don’t match); intangibles; **4-week cycle ‘maybe true maybe not’**; why-UpAI (he’d rather RAG past projects). Manual path: paste meeting ID on a form if you declined. Set-node C = A or B (form vs natural) so later nodes don’t reference a path that didn’t run — standardize transcript + meeting ID. Second deck is same structure, different AI. Close: Plus **3,000** members UNVERIFIED (other tapes 200). Auto-send / $28k / 350 hrs / Gamma as ours = operate-never.

## B. Atomic Knowledge
### Webhook-is-thin-gist-lags-poll
- **Claim:** Fireflies ‘transcription complete’ sends ID, not the transcript. Immediate get-meeting misses AI gist. Wait + if(gist) else loop. Speakers via Claude-written code. Sheet status NA until later.
- **Reasoning:** Two WFs so later you can route (minutes vs deck) without baking Gamma into the log.
- **Mechanism:** If you ever log a call: poll until gist, unique ID, status column. Do not stand up Fireflies/n8n.
- **Evidence:** On-tape Green Grass row; poll loop; speakers-from-Claude.
- **Conditions:** A call-end webhook.
- **Exceptions:** Fireflies / n8n / sheet as ours operate-never.
- **Action:** Steal poll-until-gist. HOLD the stack.
- **Confidence:** high as a procedure
- **Source:** KGXFkUlBHxw @ UNKNOWN
- **Epistemic:** SOURCE
### Slack-yes-then-ninety-then-human
- **Claim:** Send-and-wait is the gate. Agent writes the proposal; Gamma paints it; he emails himself a comment link. Graph wrong, 4-week maybe-not, $28k/350 hrs invented-confident. Never auto-send.
- **Reasoning:** Prompt: don’t say AI; structure or it randomizes; replace() so quotes don’t break Gamma JSON; theme ID from Gamma UI.
- **Mechanism:** HITL is the product. $ and hours on the slide are UNVERIFIED until a human edits.
- **Evidence:** On-tape Green Grass deck; Slack yes; graph he flags.
- **Conditions:** A proposal after a call.
- **Exceptions:** Gamma / UpAI / $28k / 350 hrs / auto-send operate-never. Clients parked.
- **Action:** Steal HITL + 90%. Do not send. Do not analog $.
- **Confidence:** high
- **Source:** KGXFkUlBHxw @ UNKNOWN
- **Epistemic:** SOURCE
### Set-C-so-A-or-B-can-feed-phase-two
- **Claim:** Form (paste ID) and sheet-trigger never run in one execution. Later nodes cannot look at both. Set-node C = transcript + meeting ID from whichever ran.
- **Reasoning:** Without C, adding a second path breaks the first.
- **Mechanism:** If two triggers share a tail, standardize inputs. Caption-only: clicks UNKNOWN.
- **Evidence:** On-tape Excalidraw A/B→C; second deck from form.
- **Conditions:** A two-path WF.
- **Exceptions:** n8n as ours operate-never.
- **Action:** Steal A-or-B-into-C. HOLD n8n.
- **Confidence:** high as a pattern
- **Source:** KGXFkUlBHxw @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: split log vs act; HITL then 90% deck. Priority: poll gist, Slack gate, preserve text, don’t send. Experience: Green Grass Gamma; graph fail. Contrarian: two WFs over one. Uncertainty: 350 hrs / $28k / 4 weeks / 3,000 members.

## D. Procedures
His order: Fireflies webhook → wait/poll gist → sheet → Slack yes → structured agent → Gamma preserve+theme → self-email → status generated; form path via set C. Our order: do not stand up. Steal poll, HITL, A-or-B-into-C. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Test Fireflies ends. **Action:** wait, poll gist, append NA. **Reasoning:** webhook is thin. **Outcome:** Green Grass row. **Lesson:** ID first, gist later.

**Situation:** Slack yes. **Action:** agent + Gamma. **Reasoning:** 90% not send. **Outcome:** 350 hrs / $28k / bad graph. **Lesson:** Human edits $ and charts.

**Situation:** Declined then want a deck. **Action:** form + meeting ID. **Reasoning:** set C. **Outcome:** second deck. **Lesson:** Standardize or the tail breaks.

## F. Decision Rules
IF gist missing → wait, don’t write. IF Slack no → declined, don’t Gamma. IF $28k / 350 / 4 weeks / 3,000 → UNVERIFIED. Refuse: Fireflies/n8n/Gamma as ours; auto-send; analog $.

## G. Contrarian
Rejects one mega-WF. Rejects auto-send. Rejects ‘AI mentioned on a client deck.’

## H. Assumptions
One test meeting (just him). $28k is the agent. Plus 3,000 vs 200 on other tapes. Survivorship: he already had Fireflies+Gamma. Falsifier: gist never lands. Speech≠behavior: ‘never auto-send’ + auto-share email.

## I. Questions
What’s live Gamma $ per deck? Any checkout we can open from a Green Grass send? Did anyone ship A-or-B-into-C without n8n?

## J. Connections
SYSTEM SYNTHESIS: HITL 90% = `playbook-before-send`. Poll-until-ready = `irg-2IfAjpo` expiry. A-or-B-into-C = `QojPKL96Dx4` standardize. $ on slide UNVERIFIED. Fireflies/n8n/Gamma operate-never.

## K. Future-Use
Unassigned: meeting-ID as the only unique key. replace() before any LLM-into-JSON API.

## Steal / Operate-never

### Machine: Poll-gist-Slack-yes-ninety-human
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: call ends → action: wait until gist; log ID; human yes/no; structured 90% deck → checkable stop: a human opens the deck and the $ / graph / weeks before anyone else sees it
- **Questions / signals:** Is the gist there? Did a human say yes? Would we send this graph?
- **Qualify / frame / objections:** Frame: 90% not send. Objection: ‘350 hrs / $28k’ — agent invented, UNVERIFIED.
- **Procedure:** Do not stand up Fireflies/n8n/Gamma. HITL send. Tape $ UNVERIFIED. Clients parked.
- **Example that proves it:** Green Grass; Slack yes; bad graph; form-replay via set C. UNVERIFIED $.
- **Why it works:** Webhook is thin. Gist lags. The deck lies until a human edits.
- **Conditions / exceptions:** Works as a gate. Exception: Fireflies / n8n / Gamma / $28k as FACT / auto-send operate-never.
- **Operate-never payload:** Fireflies · n8n · Gamma · UpAI · auto-send · $28k / 350 hrs as analog
- **Hive run (existing skills only):** `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** KGXFkUlBHxw @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 350 hrs / $28k / 0% error / 4 weeks / 3,000 members as FACT or as our analog.
- Fireflies / n8n / Gamma as ours. Auto-send the deck. New client from this tape.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Fireflies, n8n, and Gamma. Steal poll-until-gist, Slack-yes, 90%-then-human, A-or-B-into-C. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
