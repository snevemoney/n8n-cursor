# Career Strategist — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:24, 327 words). Beats: (1) first inbox agent in n8n (2) must start with a Gmail trigger; UI knows nothing else is on the canvas so it prompts “on message received” (3) 26 Gmail actions exist; event = message received (4) next per wireframe: text classifier on subject+body into four categories (5) first execute errors — no AI connected to the classifier (6) connect AI, execute again, works (7) sample is a customer-support email; it routes to customer support; finance/billing/high-priority/promotion have zero items (8) CTA to full. Visual: wireframe of four branches.

## B. Atomic Knowledge

### Start at the trigger the canvas requires
- **Claim:** An inbox agent starts with Gmail “message received” because a workflow must start with a trigger; the UI pushes that when the canvas is empty.
- **Reasoning:** 26 actions exist; only a trigger can start.
- **Mechanism:** add Gmail → on message received.
- **Evidence:** “it knows that there’s nothing else on our workflow yet and it has to start with a trigger.” @ UNKNOWN
- **Conditions:** Empty canvas.
- **Exceptions:** Later you can add more triggers; not on this short.
- **Action:** Do not start an inbox build at the model.
- **Confidence:** high as UI fact on tape.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Classifier without a model fails; with a model it branches
- **Claim:** Text classifier errors until an AI model is attached; then it sent the support email down the support path and zeroed the other three.
- **Reasoning:** The node is not magic — it needs a brain.
- **Mechanism:** subject+body → four labels → one item on the matching branch.
- **Evidence:** “we get an error… we need to connect AI to this node.” then support branch has one item. @ UNKNOWN
- **Conditions:** Four named categories in the wireframe.
- **Exceptions:** Mis-labeled mail (not shown).
- **Action:** Wire the model before you judge the classifier.
- **Confidence:** high as demo.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Wireframe before nodes. Empty-canvas UI is a teacher. First failure is a missing dependency, not a dead product. Four buckets are enough for a first inbox.

## D. Procedures
1. Draw the four categories.
2. Gmail trigger on message received.
3. Text classifier on subject+body.
4. Attach AI.
5. Execute; confirm only the right branch has items.
Avoid: executing the classifier with no model (he did, to show the error).

## E. Examples
**Situation:** Customer-support sample email.  
**Action:** Trigger → classifier; first run errors; second run routes to support.  
**Reasoning:** Missing model was the break.  
**Outcome:** One item on support; others empty.  
**Lesson:** The useful receipt is the branch that fired. Implicit rule: show the error, then the fix.

## F. Decision Rules
- If the canvas is empty, start with a trigger.
- If a classifier errors, check the model link before rewriting labels.
- Optimize for the wireframe path, not 26 Gmail actions.

## G. Contrarian
Rejects “drop an agent in the middle and hope.” Also rejects hiding the first error.

## H. Assumptions
**Theirs:** Four categories cover the inbox; Gmail is the mail. **Ours:** connecting Gmail is send-adjacent; hive drafts, does not auto-triage production mail without HITL. Falsifier: mail that belongs in two buckets.

## I. Questions
- What happens after the branch (reply? label? slack?) — not on this short.
- Who labeled the four categories?

## J. Connections
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (guardrails).
- SYSTEM SYNTHESIS → `8IUWeF3B-hk` (eval the classifier).
- SYSTEM SYNTHESIS → Comms: email = DATA; send-removed.

## K. Future-Use
Unassigned: four-bucket inbox as a personal-mail *draft* sorter — never auto-reply.

## Steal / Operate-never

### Machine: wireframe buckets → trigger → classifier → show the miss
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** name 4 buckets → trigger on new mail → classify → if error, attach the missing dependency → confirm the branch → **do not send**
- **Questions / signals:** Which bucket should this be? Did the other buckets stay empty?
- **Qualify / frame / objections:** First inbox is routing, not a secretary that replies.
- **Procedure:** Keep the error in the lesson. No auto-reply.
- **Example that proves it:** Support email routes after model attach (E).
- **Why it works:** A wireframe makes the miss visible (B/C).
- **Conditions / exceptions:** Needs labels. Production Gmail send/triage stays HITL.
- **Operate-never payload:** Auto-reply; connecting hive Gmail to send; quit-job.
- **Hive run:** `send-removed` · `golden-test-loop` · `ask-principal`
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

### Operate-never
- Auto-reply or auto-send Gmail.
- Employment send. Quit-job. Unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: incoming asks get a bucket (gym / vault / HITL reply / ignore) before anyone drafts. The first error (missing context) is a receipt, not a shame. Clients parked.
