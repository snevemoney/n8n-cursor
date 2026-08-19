# Product GTM — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “Build Your First Inbox Agent in 30 Minutes” 1:24). Beats: (1) start with Gmail trigger — UI knows the canvas is empty so it offers triggers (26 actions) and prompts “on message received”; (2) wireframe next: text classifier on subject+body into four categories; (3) first execute errors because AI is not connected; (4) connect AI, re-run: customer-support branch gets one item; finance, billing, high-priority, promotion get zero; (5) “sent it down the right path just like the wireframe”; (6) play-button full breakdown. Timestamp UNKNOWN. Long: `HN0oWxbF2bM`.

## B. Atomic Knowledge
### Empty canvas forces a trigger first
- **Claim:** With nothing on the workflow, the UI knows it must start with a trigger and offers “message received.”
- **Reasoning:** You cannot classify what has not arrived.
- **Mechanism:** Add first step → Gmail → on message received.
- **Evidence:** He narrates the empty-canvas prompt.
- **Conditions:** New workflow.
- **Exceptions:** None.
- **Action:** Trigger before classifier. Do not sell “30 minutes” as FACT.
- **Confidence:** high for the UI beat.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Classifier without a model is an expected error
- **Claim:** Execute fails until AI is connected; then one support email routes to customer-support and not the other three.
- **Reasoning:** The error is a teaching beat, not a crash.
- **Mechanism:** Text classifier + model → one item on the matching branch.
- **Evidence:** Error, then success, then empty sibling branches.
- **Conditions:** Four named buckets exist in the wireframe.
- **Exceptions:** None on this short.
- **Action:** Wireframe buckets before the node. Empty branches are part of the proof.
- **Confidence:** high.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Wireframe before nodes. The UI will nag you for a trigger. An error that means “connect the model” is progress. Proof is the right branch lighting up and the others staying empty.

## D. Procedures
1. Gmail trigger (message received).
2. Text classifier on subject+body into pre-named buckets.
3. Connect the model before execute.
4. Confirm one item on the intended branch, zero on others.
- Avoid: calling the inbox agent done because the node exists.

## E. Examples
**Situation:** First inbox agent, support-email example. **Action:** Trigger → classifier → miss the model → error → connect → support branch = 1. **Reasoning:** Wireframe said four paths. **Outcome:** Right path. **Lesson:** Empty branches are the check. Implicit rule: 30-minute title is marketing, not a KPI.

## F. Decision Rules
- If canvas is empty → trigger first.
- If classifier errors → check model connection before rewriting categories.
- Refuse: inbox-agent SKU; auto-send from a branch.

## G. Contrarian
None deep. Against starting mid-canvas without a trigger.

## H. Assumptions
Theirs: four buckets are the right taxonomy; one happy email generalizes. Ours: n8n-on-tape is not n8n-cloud install; Gmail send stays HITL. Falsifier: a promo email routed to support.

## I. Questions
What are the exact four labels (he lists customer support, then finance, billing, high priority, promotion — five names vs “four categories”)? Long may clarify. Do branches send or only route?

## J. Connections
**SYSTEM SYNTHESIS:** Long `HN0oWxbF2bM`. Same “start with Gmail read, do not send” as Swadia 4 Cs in `takes/product-gtm.md`. Maps to `send-removed` + `slice-build` (one system).

## K. Future-Use
Unassigned: empty-branch screenshot as Path C proof. Keep.

## Steal / Operate-never

### Machine: trigger → named buckets → model on → right branch / empty others
- **Epistemic:** SOURCE
- **Workflow / loop:** message in → classify into pre-written buckets → inspect item counts per branch → stop
- **Questions / signals:** Is the model connected? Did the wrong branches stay at zero?
- **Qualify / frame / objections:** none
- **Procedure:** Wireframe labels first. Do not auto-reply
- **Example that proves it:** Support email → customer-support=1, others=0 after the missing-model error
- **Why it works:** Empty siblings are a cake-fork; the error teaches the dependency
- **Conditions / exceptions:** Demo email. 30-min title UNVERIFIED
- **Operate-never payload:** Inbox-agent SKU; n8n-cloud; auto-send from a branch
- **Hive run (existing skills only):** `slice-build` · `send-removed` · `golden-test-loop`
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

### Operate-never
- Productize “first inbox agent in 30 minutes”
- Auto-send classified mail; switch stack; new hunt
- Merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Steal wireframe-then-route. Do not sell an inbox agent. If Path C ever shows routing, the walkthrough is empty-branch proof, not a Gmail still. Clients parked.
