# Big Boss — HN0oWxbF2bM
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/HN0oWxbF2bM/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Nate Herk, 37:33, PACKET 8953 words, captions `en-orig`. Timestamp UNKNOWN on `full.txt`. Visual-only gaps: Excalidraw wireframe, n8n canvas, Gmail labels, Open Router key screen, sample-email sheet, classifier branches, Mr. Doomsday draft, executions tab.

Beats, in order:

1. Promise: by the end, an inbox agent that classifies and labels. Step-by-step, no-code, then you can scale to a “full inbox manager.”
2. **Wireframe first** (he “strongly encourage[s]” this before any system). Three tools: n8n (14-day trial, then ~$25/mo — **$ UNVERIFIED**), Gmail (Outlook “same idea, different clicks”), Open Router.
3. Trigger: new Gmail. Payload: from, time, subject, body, metadata. Classifier reads subject + body → four buckets: customer support, finance/billing, high priority, promotion. Each branch is the operator’s choice: label all; then reply **or** draft **or** notify-only **or** nothing.
4. Build: blank workflow → Gmail “on message received.” Credential. Poll every minute. Sample “issue logging into dashboard.” **Simplify off** or you only get a snippet. **Pin data** so refresh does not re-pull.
5. Text classifier: expression with subject + body variables. Four categories matching Gmail labels. Descriptions from his sheet (keywords: error, issue, help…). Tune when it over- or under-fires. First execute fails — no model yet.
6. Open Router: account, add credits (~$5 to play — **UNVERIFIED**), API key named “inbox demo,” paste into n8n, green “connection tested.” Demo model 4.1 mini. Classifier sends the sample down support. Pin the classifier output (do not re-spend).
7. Support branch: Gmail “add label to message” via message ID from the trigger. Execute; label appears. Pin. AI agent: define-below subject/body, system prompt (he whispers a ChatGPT draft: “Nate’s AI assistant,” AAS, escalate to nateherk88@gmail.com). Separate brain: Claude 3.7 on the agent, 4.1 mini on classify. Play → troubleshooting reply + sign-off. Gmail **reply** (not send), text not HTML, append-attribution **off**. Full-workflow retest on a second support sample (~15 seconds). Prompt had bold markdown — he strips it so the sign-off is not bold.
8. Scale note: same pattern on other branches. RAG / external knowledge deferred; he points at other videos.
9. Finance sample: “incorrect charge on invoice.” Classify → finance. Copy the label node, change label (he misspells finance once). Notify billing: Slack/ClickUp/WhatsApp/Telegram possible; he uses Gmail to keep the demo small. **No AI** — hardcoded template + variables (from name, time via `{{$now.format}}`, address, subject). Attribution off after he shows the footer leak.
10. High priority: copy label. Agent “Mr. Doomsday” (rude) — joke. **Create draft** + thread ID + `to` from trigger (first draft missing recipient). Subject “test” does not show on a reply-thread. Reason for draft: you would not want that tone to go out; tweak then send.
11. Promotion: “new features, 25% off.” Label + **mark as read** (he says he does not care; unread/read wording on tape is the mark-read action so it leaves headspace).
12. **Activate** the workflow or the trigger does not poll while you sleep. Executions tab is the background log. Suggested scale: logger at the end of every path (sheet/Airtable: time, path, result) so you see patterns without reading raw executions.
13. Close: free Skool template + Google guide + sample emails. Plus: 200+ members, Agent Zero, 10 hours to 10 seconds, one-person agency track, weekly live. **Counts / $ UNVERIFIED.**

Off-topic / not skipped: self-host Google guide; ChatGPT as prompt factory; True Horizon vs demo credential; “don’t even think about using this key”; Mr. Doomsday bit; Plus close.

## B. Atomic Knowledge

### Wireframe the buckets before a node
- **Claim:** Map trigger → classifier → named branches → per-branch action **before** opening n8n. He teaches this in the paid course too.
- **Reasoning:** “You have to have all of the steps of the process mapped out clearly before you actually start building.”
- **Mechanism:** Visual diagram. Four generic categories for the demo. Operator chooses reply / draft / notify / nothing per branch.
- **Evidence:** Full Excalidraw pass, then a blank canvas that follows it.
- **Conditions:** You know the inbox types you actually get.
- **Exceptions:** Outlook is “follow along,” not the same clicks.
- **Action:** Scope is the wireframe. One system this take is not “full inbox manager.”
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “wireframe this out… before we actually hop into [n8n]”
- **Epistemic:** SOURCE

### Classifier descriptions are living prompts
- **Claim:** Categories need concise, specific descriptions (symptoms + keywords). When it over- or under-fires, you edit the description — you do not add a fifth mystery bucket first.
- **Reasoning:** The model only knows what you wrote. Monitoring is part of the system.
- **Mechanism:** Four labels in Gmail = four categories in the node. Sheet of definitions. Execute → one item on the winning branch.
- **Evidence:** Support definition read aloud (login errors, bugs, keywords).
- **Conditions:** Labels exist before you name categories.
- **Exceptions:** He does not show a misfire-and-tune loop on tape — only the instruction.
- **Action:** Tune the prompt when the path is wrong. That is the maintenance.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “if you realize… classifying things as customer support way too often, then you’d come in here”
- **Epistemic:** SOURCE

### Pin so you do not re-spend
- **Claim:** Pin trigger, classifier, and agent outputs so a refresh does not re-call the model or re-fetch mail.
- **Reasoning:** Tokens and time. “If we accidentally lose it we don’t have to rerun AI and spend more money.”
- **Mechanism:** Pin button / `P`. Unpin only when you want a live full-run.
- **Evidence:** He pins after every successful step; unpins before the second support e2e.
- **Conditions:** Demo and build. Production uses the live trigger.
- **Exceptions:** Pinned data can lie if you forget to unpin before a real test.
- **Action:** `golden-test-loop` — keep the fixture; spend on purpose.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “pin data… we don’t lose that and have to go pull it in again”
- **Epistemic:** SOURCE

### Simplify-off or you classify a snippet
- **Claim:** Gmail “simplify” returns a short snippet. Long bodies get truncated. Turn it off.
- **Reasoning:** Classifier and agent need the real text.
- **Mechanism:** Toggle off → fetch test event again → full text + metadata.
- **Evidence:** First fetch is a snippet; second is “way more information.”
- **Conditions:** Bodies longer than the snippet.
- **Exceptions:** Short subjects may look fine either way — he still leaves it off.
- **Action:** Full text is a checkable stop before classify.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “this is just going to give you a short summary”
- **Epistemic:** SOURCE

### Support can reply; the interesting fork is draft vs notify
- **Claim:** He builds auto-**reply** on support for the demo, then shows finance = notify-only (no model), high-priority = **draft**, promo = label + mark-read. He says you may want draft or notify-only instead of instant reply.
- **Reasoning:** “You’re in full control of what you want to happen.” Finance should not let a model talk to billing. High-priority tone can be wrong — draft is the gate.
- **Mechanism:** Same label pattern; different last mile. Reply node vs create-draft (+ thread id + `to`) vs templated notify vs mark-read.
- **Evidence:** Two live support replies; finance template with `$now`; Doomsday draft missing `to` the first time; promo mark-read without opening the mail.
- **Conditions:** Demo inbox. He later says his own system drafts/replies more — not shown.
- **Exceptions:** Attribution footer leaks if you forget the toggle (he shows it).
- **Action:** Hive: label + **draft**. Do not send. Finance = notify a human.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “I don’t know if we want to instant reply… draft… notify someone else”
- **Epistemic:** SOURCE

### Variables beat a model when the message is a template
- **Claim:** Finance notify is hardcoded + Gmail variables (name, time, address, subject). No agent.
- **Reasoning:** Save “AI processing power.” The billing team needs facts, not a paragraph.
- **Mechanism:** Expression fields. `{{$now}}` + `.format` for date/time.
- **Evidence:** “New billing email from Nate Herklman” + cheers. Fake `billing@ample.com` bounces — template still filled.
- **Conditions:** The facts already exist on the trigger.
- **Exceptions:** If you need a summary of a long thread, a model might return — he does not add one.
- **Action:** Do not put a model on a mail-merge.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “we’re going to save some AI processing power and basically custom make this message with variables”
- **Epistemic:** SOURCE

### Activate or it does not run while you sleep
- **Claim:** Test mode does not poll. Active workflow “regularly check[s] Gmail” in the background. Executions tab is where those runs live.
- **Reasoning:** People follow the build and leave it in test.
- **Mechanism:** Toggle active → confirmation copy about regular checks.
- **Evidence:** Editing-room addendum at the end.
- **Conditions:** Credentials and branches already safe.
- **Exceptions:** Activating auto-reply is the danger — that is why draft is the hive last mile.
- **Action:** Do not activate a send path. Activation is a deploy-shaped HITL.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “if you leave this as test mode, this Gmail trigger will not actually be pulling”
- **Epistemic:** SOURCE

### Logger at the end of every path
- **Claim:** After each branch, write time / path / result to a sheet (or Airtable). Raw executions exist; a front-end is how you see patterns and where to tweak.
- **Reasoning:** Scale = observe, then edit prompts, models, or missing nodes.
- **Mechanism:** He recommends it; he does not build it on this tape.
- **Evidence:** Spoken close, plus “I wanted this one to be super simple.”
- **Conditions:** More than a demo inbox.
- **Exceptions:** Executions tab is enough for a one-branch dry run.
- **Action:** Definition of done for a second slice — not this take.
- **Confidence:** high that he wants it; not built here
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “having some sort of logger”
- **Epistemic:** SOURCE

### Turn off “sent by n8n”
- **Claim:** Reply/send appends attribution unless you add the option and turn it off. Draft create may not have the toggle (he says it “naturally won’t come in”).
- **Reasoning:** The footer tells the recipient it is automation.
- **Mechanism:** Add option → append attribution → off. He shows the leak on the finance mail, then fixes it.
- **Evidence:** On-tape footer, then the toggle.
- **Conditions:** Gmail send/reply nodes.
- **Exceptions:** Draft path may omit it.
- **Action:** If we ever draft, still do not send. Attribution is his costume; ours is HITL.
- **Confidence:** high
- **Source:** `HN0oWxbF2bM` @ UNKNOWN — “this was automatically sent by [n8n]”
- **Epistemic:** SOURCE

## C. Mental Models

- **Picture it, then click.** Wireframe is the system; the canvas is the implementation. **SOURCE**
- **Four buckets, four last miles.** Classify is shared; action is local. **SOURCE**
- **You are in control.** Reply / draft / notify / ignore is a choice, not a default. **SOURCE**
- **Pin is money.** Re-running the model is a waste you can refuse. **SOURCE**
- **Billing does not get a bot voice.** Notify a human. **SOURCE**
- **Draft is how you keep a bad tone off the wire.** Doomsday is the joke that proves it. **SOURCE**
- **Promo is not work.** Label and clear it from the unread pile. **SOURCE**
- **Active ≠ test.** Sleep-running is a deliberate switch. **SOURCE**
- **Course → Skool → Plus.** Magnet. **INFERENCE**
- **Hive already has `send-removed`.** This tape is the why. **SYSTEM SYNTHESIS**

## D. Procedures

1. **Wireframe:** trigger, four (or N) buckets, last mile per bucket (reply / draft / notify / nothing).
2. **Labels first** in the inbox, then name the same categories on the classifier.
3. **Trigger + simplify off + pin** a real sample.
4. **Classifier:** subject + body, descriptions with keywords, model attached, execute, pin the winning branch.
5. **Tune descriptions** when over/under. Do not skip this after go-live.
6. **Support (hive):** label + **draft**. Do not reply-send.
7. **Finance:** label + notify a human with variables. No model.
8. **High-priority:** label + draft (human edits).
9. **Promo:** label + archive/mark so it leaves the pile. No reply.
10. **Attribution off** on any mail node that can send.
11. **Do not activate** a send path. Activation is HITL / `ask-principal`.
12. **Logger** (next slice): time, path, result.

**Qualify / frame:** inbox ops for `us` only. Not a client SKU. Not Nate’s Plus.
**Objections:** “He sent the support reply on tape” — he also named draft and notify as first-class options; Doomsday is why draft exists.
**Avoid:** Open Router / n8n-cloud / Skool as hive stack; auto-reply; auto-send finance; quote $25/mo / 14-day / 200 members as FACT.
**When to change:** misfires → edit descriptions; billing mail in support → tighten finance keywords; any send temptation → stop.

## E. Examples

**Situation:** Sample “issue logging into dashboard.”  
**Action:** Simplify off, pin, classify → support, label, agent reply, attribution off, e2e ~15s on a second sample.  
**Reasoning:** One branch fully proved.  
**Outcome:** Labeled + replied in-thread.  
**Lesson:** The demo ships send. Hive steals the branch shape and swaps send for draft. Implicit rule: the last mile is a choice.

**Situation:** “Incorrect charge on invoice.”  
**Action:** Classify finance, copy label node, Gmail notify with variables, no agent. Footer leaks, then attribution off.  
**Reasoning:** Billing team needs facts; a model is waste and risk.  
**Outcome:** Template filled; dest mailbox fake.  
**Lesson:** Mail-merge is not an agent.

**Situation:** High-priority outage mail + Mr. Doomsday.  
**Action:** Rude draft; first draft missing `to`; add recipient; subject “test” unused on a reply thread.  
**Reasoning:** You would not want that to go out.  
**Outcome:** Draft in thread, human would send.  
**Lesson:** Draft is the gate. Implicit rule: tone experiments never auto-send.

**Situation:** Promo 25% off.  
**Action:** Label + mark-read without opening.  
**Reasoning:** Headspace.  
**Outcome:** Unread pile clear.  
**Lesson:** Some buckets deserve no words.

## F. Decision Rules

- If it is not on the wireframe → do not add the node yet.
- If simplify is on → off, re-fetch, then classify.
- If you might re-run → pin.
- If the path is finance → notify a human, no model reply.
- If the path is support or high-priority → **draft** (hive). He showed send; we do not operate send.
- If the path is promo → no reply.
- If they want “full inbox manager” this sitting → no. One branch first.
- If the workflow is still in test → it will not poll. Do not “fix” that by activating a send path.
- Optimize: classify + label + draft on one bucket.
- Refuse: auto-reply, Open Router as ours, Plus as a SKU.

## G. Contrarian

- Against “just start in the builder”: wireframe first.
- Against “every branch needs an agent”: finance is variables; promo is mark-read.
- Against “send is the demo so send is the product”: he names draft and notify in the same breath as send.
- Against leaving attribution on: the footer is a tell.
- Field assumes inbox agent = auto-reply. He builds control, then sells send in the support demo anyway.

## H. Assumptions

**His:** n8n + Gmail + Open Router is the right OS; four generic buckets cover a beginner; 4.1 mini is “good enough” to classify; ChatGPT can write the system prompt; Skool template is the conversion; Plus is the upsell.

**Ours:** Captions complete enough (8953 words). $25/mo, 14-day, $5 credits, 200 members **UNVERIFIED**. Domain: his inbox course, not a client mailbox. Hive: Cursor + Grok; `send-removed` already law.

**Falsifiers:** Classifier silently mis-routes billing to support and auto-replies. Pin hides a stale sample and you ship the wrong path. Activate-in-test confusion causes missed mail (or surprise sends).

**Disagreement (keep labeled):** We will not operate auto-reply or his n8n/Open Router stack. The **wireframe → four last miles → pin → draft/notify** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What does his *real* inbox do on support — draft or send? He alludes, does not show.
- Logger schema — which columns besides time/path/result?
- How often do the four descriptions need retune? No data.
- Outlook path — is there a sibling tape? Do not invent.
- RAG “later” — which ids? He says he will tag; not bound here.

## J. Connections

- **SYSTEM SYNTHESIS** → `send-removed` / `ask-principal`: draft, never send.
- **SYSTEM SYNTHESIS** → `slice-build`: one branch (support draft) this take, not four live sends.
- **SYSTEM SYNTHESIS** → `golden-test-loop`: pin, re-run on purpose.
- **SYSTEM SYNTHESIS** → `agent-as-hire`: wireframe is the SOP before connectors.
- **SYSTEM SYNTHESIS** → `agent-job-card`: finance never speaks; promo never speaks.
- Do not unpark a client mailbox.

## K. Future-Use

- Logger front-end for Watchdog (unassigned).
- Description-tune loop as a coverage item (unassigned).
- Variable-only notify as a Communications template (unassigned).
- Activate-toggle as an explicit deploy HITL card (unassigned).
- Four-bucket taxonomy as a starting wireframe for any classify job (unassigned).

## Steal / Operate-never

### Machine: Wireframe four buckets → classify + label → last mile is draft or notify, never send
- **Epistemic:** SOURCE (build) / SYSTEM SYNTHESIS (hive last mile)
- **Workflow / loop:** trigger (new mail) → wireframe buckets + last miles → labels exist → fetch with simplify off → pin → classify on subject+body → label → support/high-priority **draft** · finance **notify human** · promo **no reply** → attribution off → do not activate a send path → logger later.
- **Questions / signals:** “What are the four buckets?” “Reply, draft, notify, or nothing?” “Is simplify off?” “Did we pin?” “Is this billing?” “Is the workflow active — and should it be?”
- **Qualify / frame / objections:** `us` inbox ops, not a client SKU. “He sent support on tape” → he also taught draft/notify; Doomsday is the why. “Just buy Plus” → magnet.
- **Procedure:** D steps 1–11. Checkable stops: (1) wireframe exists, (2) full body not snippet, (3) winning branch labeled, (4) no send node in the hive copy, (5) finance has no agent.
- **Example that proves it:** Support e2e sends in 15s (demo); finance is a variable letter; Doomsday is a draft missing `to` the first time; promo is mark-read. Lesson: last mile is the product.
- **Why it works:** Shared classify, local action. Pin saves spend. Templates beat models for facts. Draft keeps tone off the wire. Conditions: Gmail-shaped inbox, human still owns send. Exceptions: he activates send in the course; logger not built; $ UNVERIFIED.
- **Conditions / exceptions:** Cursor + Grok only. n8n / Open Router / Skool / ChatGPT stay on tape. Clients parked.
- **Operate-never payload:** Auto-reply; auto-send finance; activate a send path; quote $25/mo / 14-day / 200 members as FACT; Nate Plus / Skool template as a hive SKU.
- **Hive run (existing skills only):** `send-removed` · `ask-principal` · `slice-build` · `golden-test-loop` · `agent-as-hire` · `agent-job-card`
- **Source:** `HN0oWxbF2bM` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- Auto-reply Gmail / auto-send finance / activate a send path
- Install n8n-cloud / Open Router / Claude / ChatGPT / Skool as ours
- Quote $25/mo / 14-day / $5 credits / 200 members as FACT
- Nate Plus / inbox course as a hive SKU
- New `icp_id` / unpark Normand / client mailbox
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not turn on an inbox that talks.

- **Done** this take: wireframe + classify + label + **draft** on support only. Finance notify. No send. No activate.
- **Delegate without being asked:** Forge copies the branch shape in Cursor (not his n8n). Communications owns draft voice. Watchdog checks simplify-off, pin, and “no send node.” Money Desk does not let a model speak to billing.
- **Skeptical review:** “Full inbox manager” is the course promise, not this week’s system. I will not approve Open Router because the key turned green.
- **One system this take:** one bucket, draft only.
- Live hunt stays parked. Plus is not a lane.
