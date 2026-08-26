# Publishing Engine — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Build Your First Inbox Agent in 30 Minutes
**Channel:** Nate Herk | AI Automation

## A. Source Map
1. Hook: first inbox agent in n8n.
2. Must start with a Gmail trigger — UI knows nothing else is on the canvas, so it prompts “on message received.”
3. Wireframe next: text classifier on subject + body into four categories.
4. Customer-support example; execute step → error because no AI is connected to the classifier.
5. Connect AI; execute again → works; item goes down customer-support; finance/billing/high-priority/promotion have zero items.
6. CTA: full breakdown.
Timestamp UNKNOWN.

## B. Atomic Knowledge

### Trigger first, then classify
- **Claim:** An inbox agent starts with a real inbound trigger, then a classifier that matches a wireframe’s branches.
- **Reasoning:** Without a trigger there is no inbox. Without branches the model has nowhere to send the item.
- **Mechanism:** Gmail on-message-received → text classifier (subject+body) → four named paths.
- **Evidence:** UI “knows that there's nothing else on our workflow yet and it has to start with a trigger.”
- **Conditions:** Wireframe exists before the nodes. Categories are named.
- **Exceptions:** A chatbot with no inbox is not this machine.
- **Action:** Pack the wireframe + one executed branch. Do not pack “AI email.”
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Missing brain is a checkable fail
- **Claim:** Classifier execute fails until an AI model is attached; then the same step routes correctly.
- **Reasoning:** The node is a router, not a brain. The error is the lesson.
- **Mechanism:** Execute → error → attach model → execute → one item on the right branch.
- **Evidence:** “we get an error… we need to connect AI to this node.”
- **Conditions:** n8n text-classifier node. A test email that is actually support.
- **Exceptions:** A silent misroute with a model attached is a different fail (`8IUWeF3B-hk` eval).
- **Action:** Show the error, then the one-item branch. That is the walkthrough.
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
- Wireframe before canvas.
- The UI can prompt the first node; it cannot invent the four categories.
- Zero items on the other branches is the proof, not a paragraph.

## D. Procedures
- Draw four categories before you add the classifier.
- Start with the inbound trigger the UI offers.
- Execute once expecting the “no AI” error; attach; execute again; screenshot the one-item path.

## E. Examples
- **Situation:** Support email test. **Action:** Gmail trigger → classifier → fail → attach AI → support branch = 1. **Reasoning:** Brain must be plugged in. **Outcome:** Other branches empty. **Lesson:** The pack is error-then-route, not a finished inbox SOP.

## F. Decision Rules
- If there is no wireframe → do not build.
- If execute never failed → you may have skipped the brain check.
- Do not auto-reply from the support branch.

## G. Contrarian
- Field would hide the error. He executes into the error on purpose.

## H. Assumptions
- Theirs: four categories (support, finance/billing, high priority, promotion) are enough. Domain-specific.
- Ours: Gmail trigger is on-tape; we do not stand up their inbox.
- Falsifier: the test email was cherry-picked.

## I. Questions
- What happens on each branch in the long video?
- Is high-priority a category or a tag on top of others?
- Who replies — human or agent?

## J. Connections
- **SYSTEM SYNTHESIS:** Eval of category+priority is `8IUWeF3B-hk`.
- **SYSTEM SYNTHESIS:** Guardrail before send is `NQhsLVmuItA`.

## K. Future-Use
- Unassigned: error-then-route as a walkthrough beat for any classifier.
- Unassigned: four-bucket inbox as a parked SOP, not a hunt.

## Steal / Operate-never

### Machine: wireframe-then-error-then-route
- **Epistemic:** SOURCE
- **Workflow / loop:** name branches → inbound trigger → classifier without brain (expect fail) → attach model → execute → checkable stop = one item on the named branch, zeros elsewhere
- **Questions / signals:** Is the wireframe on screen? Did the first execute error? Which branch got the item?
- **Qualify / frame / objections:** “Inbox agent in 30 minutes” is a hook; the machine is the route proof.
- **Procedure:** Do not connect send. Support branch = draft or flag.
- **Example that proves it:** Support test email routes to customer-support after the AI is attached.
- **Why it works:** Empty sibling branches are objective.
- **Conditions / exceptions:** No test email → no proof. Auto-reply stays off.
- **Operate-never payload:** Auto-send from a branch; stand up their Gmail; n8n-cloud install.
- **Hive run (existing skills only):** `one-channel-deep` (walkthrough of a route we actually ran) · `ask-principal`
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

**Operate-never**
- Auto-reply or auto-send from an inbox branch.
- Publish this as our inbox product.
- Send / pay / deploy / book. New `icp_id`.

## L. Role-Specific Applications
- I package a wireframe + error + one-item branch. I do not ship an inbox agent.
- I will not cut “30 minutes” as a promise.
- Evens publishes. I do not.
