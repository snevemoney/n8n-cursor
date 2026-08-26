# Librarian — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** Build Your First Inbox Agent in 30 Minutes
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:24 / ~327 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. How to build first inbox agent in n8n: start with a Gmail trigger.
2. Add first step → Gmail → UI knows nothing else exists so it must start with a trigger → prompts On Message Received.
3. Next per wireframe: AI text classifier on subject+body into four categories.
4. Customer-support example; execute step → error because AI is not connected.
5. Connect AI; execute again → works; email goes down customer-support branch (one item); finance, billing, high priority, promotion have zero.
6. CTA: full breakdown.
Gap: the four category definitions, wireframe image, long course `HN0oWxbF2bM`. Timestamp UNKNOWN. n8n/Gmail on-tape.

## B. Atomic Knowledge

### Trigger-first, then classify
- **Claim:** Inbox agent starts with Gmail on-message-received; next node is a text classifier on subject+body into named branches.
- **Reasoning:** UI forces a trigger when the canvas is empty; wireframe already named four categories.
- **Mechanism:** Gmail trigger → text classifier → branch per category.
- **Evidence:** "we have to start this process with a Gmail trigger" / "AI classifier node to read the subject and body"
- **Conditions:** Empty canvas; Gmail creds (not shown)
- **Exceptions:** None on tape
- **Action:** File trigger→classify; send stays off this short
- **Confidence:** high as demo
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Classifier fails closed without a model
- **Claim:** Execute without connected AI errors; after connect, the email takes the customer-support path and other branches get zero items.
- **Reasoning:** The miss is a missing brain, not a bad category.
- **Mechanism:** Text classifier requires an attached model.
- **Evidence:** "we get an error. And the reason why is because we need to connect AI to this node."
- **Conditions:** n8n text classifier node
- **Exceptions:** None
- **Action:** File fail-closed; do not treat the error as a product fail
- **Confidence:** high
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Wireframe before nodes. Empty canvas must start with a trigger. Empty branches (zero items) are a successful negative. Inbox agent is classify-and-route, not send.

## D. Procedures
1. Add Gmail trigger (message received).
2. Add text classifier; name categories from the wireframe.
3. Attach a model or expect an error.
4. Execute; confirm the item on the right branch and zeros on the others.
Avoid: auto-reply/send. Signals: one item on support, zero on finance/billing/high-priority/promotion.

## E. Examples
**Support email route:** Situation — customer-support example email. Action — trigger + classifier; first execute errors; connect AI; re-run. Reasoning — model required. Outcome — support branch=1, others=0. Lesson — fail-closed then route; zeros are proof.

## F. Decision Rules
- If no trigger → UI will not let you start (this tape).
- If classifier has no model → error, not a silent misroute.
- Refuse: inbox agent that sends; n8n-cloud; Gmail send.

## G. Contrarian
Against starting mid-canvas without a trigger. Against treating empty branches as failure.

## H. Assumptions
Theirs: four categories are the right inbox ontology (not argued). Ours: this is a teaser of `HN0oWxbF2bM`. Falsifier: a later tape that sends from the same agent — keep send-removed.

## I. Questions
Exact four category prompts? What happens after the branch? Long-course HITL?

## J. Connections
SYSTEM SYNTHESIS → `HN0oWxbF2bM` (inbox course); `send-removed`; `8IUWeF3B-hk` (eval after classify).

## K. Future-Use
Fail-closed-without-model as an atom for any classifier node. Unassigned: hive mail stays read+draft.

## Steal / Operate-never

### Machine: trigger → classify → empty branches as proof
- **Epistemic:** SOURCE
- **Workflow / loop:** Gmail on-receive → text classifier (subject+body) → attach model → execute → checkable stop = correct branch has the item AND others are zero
- **Questions / signals:** Is AI connected? Which branch has the item?
- **Qualify / frame / objections:** "First inbox agent" is classify-and-route, not a sender
- **Procedure:** wireframe categories first
- **Example that proves it:** support email → error without model → support=1, others=0
- **Why it works:** zeros prove the router, not just the hit
- **Conditions / exceptions:** n8n text classifier; Gmail on-tape
- **Operate-never payload:** auto-send/reply; n8n-cloud; inbox-agent SKU
- **Hive run:** `send-removed` · `channel-walk`
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

### Operate-never
- Gmail send / auto-reply. n8n-cloud. Inbox-agent as hive SKU.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File trigger→classify and fail-closed. Do not file a send step that is not on this short. Point to the long course without flattening.
