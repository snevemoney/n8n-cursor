# Day Planner — 9mqsVK6Iqoc
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/9mqsVK6Iqoc/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short teaser: first inbox agent in n8n. Beats: start with Gmail trigger (26 actions, UI forces a trigger first) → on-message-received; next per wireframe = text classifier on subject+body into four categories; execute step errors because no AI connected; connect AI; re-run; lands in customer-support branch; finance/billing/high-priority/promotion empty. CTA to full course (`HN0oWxbF2bM`). Timestamp UNKNOWN.

## B. Atomic Knowledge
### Trigger first, then classify
- **Claim:** An inbox agent starts with a Gmail message-received trigger; the builder knows it must start with a trigger.
- **Reasoning:** Nothing else on the canvas yet.
- **Mechanism:** Add Gmail → pick on-message-received.
- **Evidence:** “it has to start with a trigger… onssage received.”
- **Conditions:** Empty workflow.
- **Exceptions:** A cron/webhook start is a different machine.
- **Action:** If we ever wire: trigger is the first card, not “build the agent.”
- **Confidence:** high as n8n UI behavior he shows.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

### Classifier without a model is a named fail
- **Claim:** Execute on the text classifier errors until AI is connected; then it routes to customer support.
- **Reasoning:** The node is a model consumer.
- **Mechanism:** Run → error → attach AI → run → one item on the right branch.
- **Evidence:** “we get an error… we need to connect AI to this node.”
- **Conditions:** Classifier node present.
- **Exceptions:** A non-AI rule router would not need this.
- **Action:** The error is the lesson — do not schedule “inbox agent” until the model is attached in a dry-run.
- **Confidence:** high.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Wireframe before nodes. Four buckets (support / finance / billing / high-priority / he also says promotion — five names on tape). Priority: show the happy path after the error. He uses a real email example. Uncertainty: category list is slightly inconsistent on tape (four vs the branches he reads).

## D. Procedures
1. Draw the wireframe (categories).
2. Gmail trigger = message received.
3. Text classifier on subject+body.
4. Attach the model before execute.
5. Confirm one item on the intended branch.
Avoid: auto-reply; treating this teaser as the full inbox course.

## E. Examples
**Missing AI connection:** Situation → classifier on a support email. Action → execute without AI → error → connect → execute. Reasoning → node needs a model. Outcome → customer-support branch = 1; others 0. Lesson → named fail first; then the route.

## F. Decision Rules
- If the classifier has no model → do not call the workflow done.
- If the branch is wrong → fail, do not “send the reply.”
- If this is a teaser → long is `HN0oWxbF2bM`.

## G. Contrarian
Rejects “just add the agent node.” He starts trigger → classifier. Field assumption: drop an agent on Gmail and go.

## H. Assumptions
Theirs: four/five labels are enough. Ours: first Gmail = read+draft, never send. Falsifier: a promotion email routed to support. Survivorship: one happy email.

## I. Questions
Exact category list? What happens after the branch (draft? label?)? Full course `HN0oWxbF2bM`?

## J. Connections
- SYSTEM SYNTHESIS → `HN0oWxbF2bM` (full inbox course) · `morning-day-plan` (urgent/info/ignore — three buckets, not his four) · `send-removed`.

## K. Future-Use
Trigger-then-classifier as a dry-run shape. Unassigned. Do not replace our three Gmail buckets with his four without Evens.

## Steal / Operate-never

### Machine: trigger → classifier (model attached) → one-branch check
- **Epistemic:** SOURCE
- **Workflow / loop:** Gmail message-received → text classifier + model → confirm intended branch has the item → stop (no send)
- **Questions / signals:** Is a trigger first? Is AI connected? Which branch got the item?
- **Qualify / frame / objections:** Error without AI is expected. Auto-reply is never.
- **Procedure:** Dry-run one email. Map to our urgent/info/ignore if we use it. Do not send.
- **Example that proves it:** Situation → support email. Action → classify without AI (fail) then with AI (support=1). Reasoning → model required. Outcome → right path. Lesson → attach, check branch, stop.
- **Why it works:** A branch count is a checkable stop.
- **Conditions / exceptions:** Our morning machine uses three buckets. His four stay on-tape unless Evens changes the skill.
- **Operate-never payload:** Auto-reply; n8n-cloud; teaser as a second course; hunt.
- **Hive run (existing skills only):** `morning-day-plan` · `send-removed` · `golden-test-loop`.
- **Source:** `9mqsVK6Iqoc` @ UNKNOWN

### Operate-never
- Auto-reply / send from the classifier.
- Replace our three buckets without Evens.
- Install n8n-cloud / switch stack.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet against `morning-day-plan` three-bucket Gmail (do not adopt his four). Clients parked.
