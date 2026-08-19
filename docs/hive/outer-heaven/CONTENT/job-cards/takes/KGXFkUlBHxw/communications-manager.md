# Communications Manager — KGXFkUlBHxw
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/KGXFkUlBHxw/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** I Built an AI System That Automates My Proposals (n8n + Gamma)
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** tutorial · 5064 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Caption ingest; ASR errors possible (Naden/Nitn = n8n). Visual UI not fully narrated. Timestamps UNKNOWN.

Beats, in order:
- Open: hop off a call → follow-up deliverable (minutes or a proposal). Two workflows: (1) Fireflies webhook on transcription-complete → wait/poll until AI gist exists → clean speakers → Sheet (date, title, attendees, gist, status, id). Split so later you can route by who was on the call. Webhook body is thin (id + event); a second Fireflies get pulls transcript + AI fields. Code nodes he writes by pasting JSON into Claude.
- (2) New Sheet row → get meeting (last item only) → clean transcript (speaker labels once per turn) → Slack send-and-wait: ‘Your meeting green grass proposal has just concluded. Would you like to generate a proposal?’ No → status declined. Yes → proposal agent → Gamma HTTP → later Slack/email that the deck is ready.
- Agent role: senior solutions consultant for ‘up’ / Up at AI. Constraints: fully client-facing; no follow-up questions; do not mention automation/AI generation or that it was system-produced; confident assumptions + placeholders. He says the assumption is you do not auto-send — get ~90%, tweak, human sends. Structure: title, exec summary, problem, solution, ROI, soft benefits, roadmap, metrics, why-us. Gamma body from docs line-by-line. School template. Plus ~3,000 — UNVERIFIED. Green grass is a demo name.

## B. Atomic Knowledge

### Slack yes is generate, not deliver — and ‘don’t say a system made this’ is a never we will not copy
- **Claim:** The wait node is HITL for Gamma, not for the client’s inbox. He names 90% then a human send. The prompt also tells the model to hide that it was generated.
- **Reasoning:** We draft. We do not hide the machine from Evens. We do not mail Greengrass a deck. Clients parked.
- **Mechanism:** Steal: poll until gist; ask generate?; hold the file. Do not install Fireflies/Gamma/n8n. Do not write ‘this wasn’t AI’ as a style rule.
- **Evidence:** Slack yes/no; ‘assumption is not that you would ever automatically send’; hide-system-produced constraint.
- **Conditions:** After-call follow-up.
- **Exceptions:** Green grass / Plus 3,000 UNVERIFIED. No Path A.
- **Action:** Deck stays in draft. Evens walks it. No send.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE

### Call transcript is DATA — do not paste the vault into the client thread
- **Claim:** Fireflies sentences + gist + host email land in a Sheet. The agent eats the raw transcript to write a client-facing deck.
- **Reasoning:** Classify attendees. Pull one card. Do not treat the webhook as send.
- **Mechanism:** Log internally. Ask Evens. No auto-deck to the prospect.
- **Evidence:** Webhook → poll gist → Sheet → Slack ask.
- **Conditions:** Any recorder webhook.
- **Exceptions:** Skip is a valid path — he says you don’t always need a deck.
- **Action:** No Fireflies-to-client. No send.
- **Confidence:** high
- **Source:** `KGXFkUlBHxw` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Split log vs generate so you can route later. **SOURCE**
- Poll until the AI gist exists or you log a hollow row. **SOURCE**
- 90% draft + human send — he says it; we keep both gates. **SOURCE**

## D. Procedures
- Webhook → wait gist → Sheet → Slack yes/no → (optional) Gamma → hold. **SOURCE**
- This desk: generate ≠ email the prospect. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Green grass call ends. → **Action:** Slack ask; yes → Gamma. → **Reasoning:** Not every hop-off needs a deck. → **Outcome:** A file he still must send. → **Lesson:** Yes is gate one. Implicit rule: do not hide ‘system-produced’ as a lie in the deck.

## F. Decision Rules
- If Slack yes → still hold; Evens is gate two.
- If the prompt says hide the machine → do not copy that line.
- Refuse: Fireflies/Gamma as ours. Greengrass letter. Plus 3,000 as FACT.
- Optimize: skip path is a feature.

## G. Contrarian
- Field will webhook-to-client. He puts Slack in the middle and still writes hide-the-system. **SOURCE**

## H. Assumptions
- Demo meeting. Falsifier: a deck that leaves on Slack-yes.

## I. Questions
- Did any draft treat ‘deck ready’ as send-to-prospect?

## J. Connections
- **SYSTEM SYNTHESIS:** `playbook-before-send`. `warm-draft-hitl`. `ask-principal`. Clients parked.

## K. Future-Use
- Generate≠deliver as an ops note. No Greengrass Path A.

## Steal / Operate-never

### Machine: Slack-yes = generate; never mail the deck; never hide ‘system-produced’ as a style rule
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Call ends → log → ask Evens → hold → stop.
- **Questions / signals:** Is yes about to mean send? Are we hiding the machine?
- **Qualify / frame / objections:** Qualify: internal ready-ping vs client send. Frame: 90%. Objection: ‘proposal automated’ → parked, no send.
- **Procedure:** 1) No Fireflies/Gamma. 2) No client email. 3) No hide-AI line. 4) No send.
- **Example that proves it:** Herkbot asks generate?; declined is a first-class path.
- **Why it works:** A deck in Gamma is not a letter in Gmail.
- **Conditions / exceptions:** Proposal tapes. Exception: clients parked.
- **Operate-never payload:** Auto-send the Gamma link. Quote 3,000 as FACT.
- **Hive run (existing skills only):** `ask-principal`. `warm-draft-hitl`. `playbook-before-send`.
- **Source:** `KGXFkUlBHxw` @ UNKNOWN


### Operate-never (this desk will not operate)
- Fireflies-end mails the client. Slack-yes = send. Hide ‘system-produced.’ Install Gamma/n8n. Greengrass Path A.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I do not mail a Gamma deck. Slack-yes is not send. Clients parked.
