# Communications Manager — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
**Title (PACKET):** Build Your First Inbox Agent in 30 Minutes
**Speaker / channel:** Nate Herk | AI Automation
**Kind:** short · 327 words · captions in `full.txt` only · timestamps **UNKNOWN** (no VTT used).
**Gaps:** Visual-only UI clicks not fully narrated. Caption ingest; some ASR errors (Naden/Nitn = n8n).

Beats, in order:
- Start with Gmail trigger: add first step → Gmail → UI prompts On message received because the canvas is empty.
- Next per wireframe: text classifier on subject + body into four categories.
- Execute step errors until an AI model is connected to the classifier.
- After connect: email routes to customer support; finance/billing/high priority/promotion have zero items.
- CTA: full breakdown via play button. Long-form sister `HN0oWxbF2bM`.

## B. Atomic Knowledge

### Classifier after the trigger, not a sender
- **Claim:** First inbox agent = Gmail on-message-received → text classifier on subject/body → branch (support / finance / billing / high priority / promotion).
- **Reasoning:** Wireframe first; UI forces a trigger; classifier needs a connected model or it errors.
- **Mechanism:** Trigger → classify → path. Demo email goes to customer support.
- **Evidence:** Error without AI; then “it output it in the customer support branch.”
- **Conditions:** Gmail connected. Four (or five) labels predefined.
- **Exceptions:** Classification is not a reply and not a send. High-priority branch is still a path, not an auto-page.
- **Action:** Steal classify-and-branch. Do not steal auto-reply.
- **Confidence:** high as a build recipe
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Empty canvas forces a trigger
- **Claim:** n8n knows the canvas is empty and prompts the message-received trigger among 26 Gmail actions.
- **Reasoning:** Workflows start with a trigger.
- **Mechanism:** UI prompt.
- **Evidence:** “it knows that there's nothing else on our workflow yet and it has to start with a trigger.”
- **Conditions:** Empty canvas.
- **Exceptions:** Later steps are not triggers.
- **Action:** Start inbox work from inbound, not from a blast node.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
- Inbox agent on this short is a router, not a correspondent. **INFERENCE**
- Wireframe before nodes. **SOURCE**
- Error = missing brain on the classifier. **SOURCE**

## D. Procedures
- Gmail trigger (message received) → text classifier (subject+body) → labeled branches. **SOURCE**
- If classifier errors: connect the model, re-execute. **SOURCE**
- This desk: classify inbound; draft on the right branch; do not send. **SYSTEM SYNTHESIS**

## E. Examples
- **Situation:** Build first inbox agent. → **Action:** Gmail trigger + classifier; first execute fails; connect AI; support email routes correctly. → **Reasoning:** Wireframe paths. → **Outcome:** One item on support, zero on others. → **Lesson:** Router first. Implicit rule: no reply node on this short.

## F. Decision Rules
- If there is no trigger → you are not in the inbox machine.
- If there is no model on the classifier → it will fail.
- Refuse: auto-reply on any branch.
- Optimize for correct path, not a sent ack.

## G. Contrarian
- Field jumps to auto-reply. This short never sends. **INFERENCE**

## H. Assumptions
- Four/five categories are his demo set. “30 minutes” is title UNVERIFIED. Falsifier: mis-routed high-priority.

## I. Questions
- What happens on each branch in the long-form? Any send node later?

## J. Connections
- **SYSTEM SYNTHESIS:** `HN0oWxbF2bM` (full inbox course). `send-removed` (first Gmail = read+draft). `NQhsLVmuItA` (guardrails before send).

## K. Future-Use
- Four-way inbound taxonomy as a classify card.

## Steal / Operate-never

### Machine: Inbound trigger → classify → branch; no reply
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** Mail lands → classify subject+body into labeled paths → draft only on the path that fired → **stop**. No ack.
- **Questions / signals:** Which path? Is a model connected? Did anyone reply?
- **Qualify / frame / objections:** Qualify: router vs correspondent. Frame: classify. Objection: “just auto-reply support” → refuse.
- **Procedure:** 1) Search Gmail. 2) Classify. 3) Draft on the right desk/path (CI → Forge). 4) Do not send.
- **Example that proves it:** Support email → support branch, other branches empty.
- **Why it works:** A wrong path is cheaper than a wrong send. The short’s error is a missing brain, not a missing mailer.
- **Conditions / exceptions:** Labels exist. Exceptions: empty labels → hold.
- **Operate-never payload:** Auto-reply on a branch. Promotion-path blast.
- **Hive run (existing skills only):** `send-removed` · `warm-draft-hitl`. CI mail → Forge.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN


### Operate-never (this desk will not operate)
- Auto-reply from a classifier branch.
- Gmail **send**. Connector write. Scheduled send. Auto-send. Ack-reply. Mass-DM. Postcard. Waitlist blast.
- Quote tape $ / student counts / job-loss % / ROI hours as FACT in a letter.
- New hunt ICP. Unpark Normand. Clients parked — no Path A this week.
- Install on-tape vendors (Vapi, Claude, Codex, ChatGPT, Gemini, Coda, Abacus, Skool, n8n-cloud). Stack stays Cursor + Grok. On-tape names stay on-tape.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. New `icp_id`.

## L. Role-Specific Applications
- I classify. I draft. I do not send. CI → Forge, not a customer thread. Clients parked.
