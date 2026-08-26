# LEARNED — KGXFkUlBHxw
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~555 lines). Title: I Built an AI System That Automates My Proposals (n8n + Gamma). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Post-call deliverable (minutes/proposal) used to be the job. Two workflows: **log meeting** (Fireflies webhook → Sheet: date, title, attendees, gist, ID, status) vs **slide creation** (new row → human approve → proposal agent → Gamma API). Split for scale/routing later. (2) WF1: Fireflies developer settings, production webhook, “transcription complete.” Webhook body is thin (meeting ID + event) — must HTTP Fireflies for transcript. **Wait + poll**: AI gist/summary not ready at transcript-done; if missing, wait and loop. Code node: speakers array. He writes code by pasting incoming JSON into Claude → n8n code → run → correct. Sheet append: now, title, attendees, gist, status `NA`, meeting ID. (3) WF2: Sheet new-row trigger; limit last item (two meetings same time). Fireflies again → code cleans transcript as speaker-blocks (not per-sentence name spam). Slack send-and-wait: “generate proposal?” Yes → agent; No → status `generation declined`. Agent role: senior solutions consultant; client-facing; no follow-up Qs; don’t mention AI/system; confident assumptions + placeholders; **never auto-send to client — 90% then human**. Structure: title, exec, problem, solution, ROI, intangibles, roadmap, success metrics, why-us. (4) Gamma HTTP: docs → copy curl → line-by-line required/optional. `inputText` = agent blob; `textMode` = **preserve**; `themeId` from Gamma “copy theme ID for API.” Replace newlines/quotes so JSON doesn’t break. Auto-share view/comment + email himself. Slack “deck generating”; Sheet **update** (not append) match meeting ID → `generated`. Demo Greengrass vendor-onboarding: 350+ hrs / $28k / 0% error (UNVERIFIED); graph he says is wrong — 90% not send-ready. Optional: agent + past-project DB for last slide. (5) Manual path: paste meeting ID on form if you declined. **Set-node C = A or B**: standardize `transcript` + `meetingId` so later nodes don’t reference a path that didn’t run. Plus/Skool. **Do not flatten** vs other n8n builder tapes (`a5sJNwfZ528`, `TDHFkSTJ30`). All $ UNVERIFIED.

## B. Atomic Knowledge

### Split log vs generate; poll until gist exists
- **Claim:** Webhook ≠ transcript. Transcript-done ≠ AI summary. Wait + if-gist-else-loop. Thin webhook is why the second Fireflies call exists.
- **Reasoning:** Scale later (route by who the meeting was with) if log is its own WF.
- **Mechanism:** Fireflies settings → production URL + transcription-complete; poll gist.
- **Evidence:** Spoken wait/if; Sheet row with gist + ID.
- **Conditions:** Fireflies-specific timing. Caption-only — poll interval UNKNOWN.
- **Exceptions:** none that skip the wait.
- **Action:** Steal poll-until-enrichment. No Fireflies spend.
- **Confidence:** high as the scar.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** gist-not-ready (the reason for the loop)
- **Speech ≠ behavior:** “automates my proposals” vs Slack yes + human tweak + don’t send.

### Standardize A-or-B before the agent
- **Claim:** Form-replay and natural trigger cannot both fire. Downstream must read one Set node (transcript + meeting ID), not “whichever path ran.”
- **Reasoning:** n8n refs to unexecuted nodes break.
- **Mechanism:** Set C = A or B; agent uses `json.transcript`.
- **Evidence:** Excalidraw A/B/C talk; decline-then-form path.
- **Conditions:** Two entry paths into one generator.
- **Exceptions:** Single-path WF doesn’t need C.
- **Action:** Steal input-standardize. `input-required-gate`.
- **Confidence:** high as the builder rule.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** spoken “would break without this node”
- **Speech ≠ behavior:** none.

### Gamma preserve + replace + 90% not send
- **Claim:** Agent writes structured text; Gamma `preserve` + theme ID + JSON-sanitize. Auto-email the link to himself. Graph/colors can be wrong. Client never sees first draft.
- **Reasoning:** Unstructured AI decks drift; JSON quotes/newlines kill the HTTP body.
- **Mechanism:** Docs curl → field-by-field; Slack notify; Sheet update on ID.
- **Evidence:** Greengrass deck; he flags the graph; $28k / 350h UNVERIFIED.
- **Conditions:** Gamma API + n8n HTTP. Hive: Gamma on-tape only.
- **Exceptions:** Manual Gamma UI if no API.
- **Action:** Steal preserve + sanitize + HITL send. No Gamma key.
- **Confidence:** high as the HTTP recipe.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** graph mismatch
- **Speech ≠ behavior:** “ready to go slide deck” vs “edit this graph / not perfect.”

## C. Mental Models
Webhook payload is a pointer. Poll for the *derived* field. Split WFs for later routes. One Set node beats dual refs. 90% + human. Code nodes = paste-JSON-to-LLM loop. Update ≠ append (match ID).

## D. Procedures
1. Fireflies webhook = ID only → wait → get meeting → poll gist.
2. Clean speakers; append Sheet `NA`.
3. New-row WF: limit 1; clean speaker-block transcript; Slack yes/no.
4. Agent: structure + no-AI-tell + placeholders; Gamma preserve + replace + theme; email self.
5. Update status `generated` / `declined`.
6. Form + Set C for replay.
7. Human edit; send HITL.

## E. Examples
- **Situation:** Test Fireflies, one speaker. **Action:** poll + speakers code. **Outcome:** Sheet row. **Lesson:** gist lag.
- **Situation:** Greengrass. **Action:** yes → Gamma. **Outcome:** 350h/$28k story + bad graph. **Lesson:** 90%.
- **Situation:** Declined then wanted it. **Action:** form + meeting ID. **Outcome:** same generator via Set C. **Lesson:** standardize inputs.

## F. Decision Rules
- IF gist missing → wait, don’t proceed.
- IF two paths → Set C.
- IF JSON body → replace quotes/newlines.
- IF client-facing → no “this was generated.”
- Refuse: auto-send deck; Gamma/Fireflies spend; Skool JSON; flatten other n8n tapes; new ICP.

## G. Contrarian
“Automates proposals” is log + poll + Slack + LLM + Gamma + email-self. Plus CTA at the end. Numbers in the deck are agent-invented (350h / 28k / 0% error).

## H. Assumptions
350+ hours, $28k, 0% error, four-week roadmap = **UNVERIFIED** (agent-written).
**Desk dissent:** n8n+Gamma vs hive Cursor+Grok. Keep `a5sJNwfZ528` (include-answer) and `TDHFkKSTJ30` (changelog-lie) unflattened.

## I. Questions
- Poll wait duration?
- Same Fireflies family as other meeting tapes?
- Gamma share-to-email = their account or client?

## J. Connections
- **SYSTEM SYNTHESIS:** n8n builder tapes · Slack HITL · proposal pricing (`Lg5TYWPSg6M`). Skills: `input-required-gate` · `ask-principal` · `warm-draft-hitl` · `send-removed` · `workflow-compiler`.

## K. Future-Use
Poll-until-derived. WF split for routes. Set-node A-or-B. Gamma preserve + JSON replace. 90% deck. Speaker-block transcript clean.

## Stolen machines

### Machine: log-poll-approve-preserve-hitl
- **Epistemic:** SOURCE
- **Workflow / loop:** webhook pointer → wait/poll gist → Sheet log → new-row → Slack yes/no → structured agent → Gamma preserve/sanitize → email self → Sheet update → human edit → send HITL
- **Questions / signals:** Is gist there? Which path ran? Did JSON break? Is the graph lying?
- **Qualify / frame / objections:** Automation ≠ sent proposal.
- **Procedure:** D.
- **Example that proves it:** gist poll; Greengrass bad graph; form replay via Set C.
- **Why it works:** Derived fields lag; dual paths need a bus; decks need a human.
- **Conditions / exceptions:** Fireflies/Gamma on-tape. Hive: no those vendors.
- **Operate-never payload:** Auto-send to client; quote 350h/$28k as FACT; Skool JSON; new ICP.
- **Hive run (existing skills only):** `input-required-gate` · `warm-draft-hitl` · `send-removed` · `workflow-compiler`
- **Source:** `KGXFkUlBHxw` @ UNKNOWN

**Operate-never**
- Send Gamma to a client. Fireflies/Gamma keys. New `icp_id`. Send / pay / deploy.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
