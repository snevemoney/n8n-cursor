# Forge — HN0oWxbF2bM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **zero-to-inbox-agent**, no-code n8n. Tools: n8n (~$25/mo after 14-day UNVERIFIED), Gmail, OpenRouter. Wireframe first: Gmail “message received” → text classifier (subject+body) → four labels: **CS / finance / high-priority / promotion**. Per-branch *you* choose: label, auto-reply, draft, notify, or ignore. Live: simplify **off** (need full text); pin test mail; classifier needs a model (error until OpenRouter + $5 credits UNVERIFIED); 4.1 mini classify, Claude 3.7 on CS agent. Categories = exact Gmail label names + concise defs + keywords; tune when it over/under-fires. CS: add-label → agent → **reply** (not send), attribution off; markdown bold in prompt leaked into the mail — strip it. Finance: copy label node; **no AI** — variable notify to billing@. High-priority: label + **create draft** on thread (need `to` or it drafts to you); “Alex handles these.” Promo: label + mark unread. Pin to avoid re-paying. Caption-only. n8n / OpenRouter / Skool on-tape.

## B. Atomic Knowledge

### Wireframe the branches; classifier is a router; pin the paid step
- **Claim:** One inbox flow is four products. Descriptions must be specific-and-short + keywords. Same model isn’t required on classify vs write.
- **Reasoning:** You decide what “classified” means. Promo shouldn’t get a writer.
- **Mechanism:** Trigger poll (every minute demo) → classifier expression subject+text → four outputs → Gmail add-label by message ID.
- **Evidence:** Login-issue → CS; invoice → finance; high-pri → draft; promo → unread.
- **Conditions:** Gmail labels exist first. Self-host Google OAuth = extra guide.
- **Exceptions:** Outlook clicks differ.
- **Action:** Steal branch-by-intent + pin. Do not auto-reply real mail. Do not install n8n-cloud/OpenRouter as hive.
- **Confidence:** high.
- **Source:** `HN0oWxbF2bM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** classifier without a brain; draft missing `to`
- **Speech ≠ behavior:** wireframe offers draft-or-reply; CS path he *sends*

### High-stakes = draft; cheap paths = no model
- **Claim:** High-priority gets a human (draft in-thread). Finance notify is concatenated variables. Promo is triage only. CS auto-reply is the dangerous demo.
- **Reasoning:** Don’t spend tokens to tell billing what the subject already says. Don’t let promo wake you.
- **Mechanism:** Reply uses trigger message ID. Draft = create draft + thread ID + `to`. Attribution off.
- **Evidence:** Second CS run ~15s; bold sign-off fixed by editing the prompt.
- **Conditions:** His sample-sheet defs.
- **Exceptions:** RAG later — not this tape.
- **Action:** Steal draft-for-hot, notify-without-AI, unread-for-noise. Send HITL. Do not quote $25/$5 as FACT.
- **Confidence:** high.
- **Source:** `HN0oWxbF2bM` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** bold leak; draft without recipient
- **Speech ≠ behavior:** “full inbox manager” vs four generic buckets

## C. Mental Models
Wireframe is the product. Labels are the API between AI and Gmail. Pin is money. Prompt punctuation shows up in the customer’s inbox.

## D. Procedures
1. Do not install n8n-cloud or OpenRouter as hive.
2. Do not auto-reply anyone. Do not send Skool.
3. Do not quote $25 / $5 as FACT.
4. Wireframe trigger → classes → per-class action (reply|draft|notify|ignore).
5. Create Gmail labels first. Simplify off. Pin.
6. Classifier defs + keywords; retune from misses.
7. Hot path = draft + human. Noise = label/unread. Billing = template notify.
8. Attribution off. Strip markdown you don’t want in the mail.
9. Send HITL.

## E. Examples
**Situation:** Classifier execute with no model.  
**Action:** Error → OpenRouter key + 4.1 mini.  
**Reasoning:** Node is empty without a brain.  
**Outcome:** CS branch fires.  
**Lesson:** Connect the model before you debug the prompt.

**Situation:** High-priority.  
**Action:** Label + draft on thread. First draft lacked `to`.  
**Reasoning:** Human must see it before send.  
**Outcome:** Draft appears on the thread after `to`.  
**Lesson:** Draft fields are not optional.

**Situation:** Promo.  
**Action:** Label + unread.  
**Reasoning:** He doesn’t care.  
**Outcome:** Inbox quieter.  
**Lesson:** Not every class needs a writer.

## F. Decision Rules
- IF you can’t draw the four exits → don’t open n8n.
- IF money/legal/hot → draft, don’t reply.
- IF the class is noise → no model after the router.
- IF you’ll re-run → pin.
- IF send → HITL / refuse.

## G. Contrarian
Field wants one mega inbox agent. He wants four exits and sometimes *zero* AI after the label. Field auto-sends CS; hive will not.

## H. Assumptions
n8n + Gmail + OpenRouter. Tape $ UNVERIFIED. Sample mails are fake. Clients parked.

## I. Questions
What’s hive’s real label set? Do we already refuse auto-reply everywhere?

## J. Connections
SYSTEM SYNTHESIS: `pxzo2lXhWJE` draft-not-send. `bxGE_LXPyAU` status branches. Send HITL. Cursor + Grok.

## K. Future-Use
Classifier as router. Draft for hot. No-AI notify. Pin. No auto-reply.

## Steal / Operate-never

### Machine: mail in → classify → label → (reply HITL | draft | notify | unread)
- **Epistemic:** SOURCE
- **Workflow / loop:** Gmail received (full text) → text classifier → add-label → branch action
- **Questions / signals:** Which of four? Does a human need to see it? Is a model wasted here?
- **Qualify / frame / objections:** One flow, four products. Prompt bold becomes customer bold.
- **Procedure:** No n8n-cloud/OpenRouter hive. No auto-reply. No Skool. Tape $ UNVERIFIED.
- **Example that proves it:** CS send (don’t copy); high-pri draft; finance variables; promo unread.
- **Why it works:** Router + cheap exits. Pin saves the bill.
- **Conditions / exceptions:** Labels must pre-exist. Outlook differs.
- **Operate-never payload:** Auto-reply; OpenRouter as hive brain; $25 as FACT; Skool.
- **Hive run:** none. Send HITL.
- **Source:** `HN0oWxbF2bM` @ UNKNOWN

### Operate-never
- Do not auto-reply email.
- Do not install n8n-cloud or OpenRouter as hive.
- Do not quote $25 / $5 as FACT.
- Do not send Skool.
- Clients parked. Send HITL.

## L. Role-Specific Applications
Forge steals **four-exit inbox**, **draft-for-hot**, **no-model notify**. We do not stand up his CS auto-replier. Cursor + Grok.
