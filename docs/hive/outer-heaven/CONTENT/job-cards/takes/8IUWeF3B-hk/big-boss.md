# Big Boss — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Short (PACKET: 1:31, 332 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: the six-row dataset, the Google Sheet write-back, the evaluations tab scores, and which of the six were right/wrong are narrated, not seen. No $ on tape.

Beats, in order:

1. Claim: if you want to build and sell workflows, you have to learn to evaluate them.
2. Definition: evaluation = “validating your hypothesis with objective proof.”
3. Contrast: while building, you are unhappy with results; you think “if I do X, output gets better” — that is the hypothesis; you change; you rerun; you **subjectively** judge better/worse.
4. Cut to n8n (on-tape: “nen”). Evaluation flow.
5. Dataset: **six** examples with expected **category** and expected **priority**.
6. Flow: pull examples → feed the AI model that is supposed to tag category + priority → “set outputs” writes the AI answers back into the Google Sheet → set category and priority so the evaluations tab can check them.
7. He opens evaluations and hits **run test**.
8. Six items go through the model. The run collects averages: tokens used, prompts total, how long it took, plus average correctness for priority and category.
9. Run finishes. He clicks in: all six processed; he can see which were right and which were not.

Off-topic / not skipped: selling workflows as the reason to learn eval; Google Sheet as the dataset/store; token/time averages sitting next to correctness.

## B. Atomic Knowledge

### Eval is hypothesis + objective proof, not a vibe
- **Claim:** Evaluation means validating a hypothesis with objective proof — not “I think it’s better.”
- **Reasoning:** Builders already have hypotheses (“if I do X…”). They usually score them by feel.
- **Mechanism:** Named expected fields vs model output; a score, not a shrug.
- **Evidence:** He defines eval, then contrasts it with subjective better/worse after a change.
- **Conditions:** You need expected answers. Without a dataset, you are still in the vibe loop.
- **Exceptions:** Tape does not show a hypothesis that failed the eval and what he changed next.
- **Action:** Definition of done for a change = score movement on a known set, not “looks better.”
- **Confidence:** high
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “validating your hypothesis with objective proof”
- **Epistemic:** SOURCE

### Subjective rerun is the default failure mode
- **Claim:** The normal loop is: unhappy → guess X → change → rerun → feel better or worse.
- **Reasoning:** That loop cannot be sold or repeated. Two people will disagree on “better.”
- **Mechanism:** No dataset, no expected labels, no write-back.
- **Evidence:** He asks the viewer to remember being unhappy and judging subjectively.
- **Conditions:** Early tinkering may still use feel. Selling/shipping is when he says eval is required.
- **Exceptions:** He does not ban subjective taste for creative work; this tape is classification.
- **Action:** If the job is tag/priority, refuse vibe-as-done.
- **Confidence:** high
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “you basically subjectively judge, is it better or worse”
- **Epistemic:** SOURCE

### Tiny labeled set + write-back + score
- **Claim:** Six labeled examples (expected category, expected priority) are enough to run a test.
- **Reasoning:** Objective proof needs expecteds. Write-back makes the model’s answers inspectable.
- **Mechanism:** Dataset → model → Google Sheet outputs → evaluations tab → run test → per-row right/wrong + averages (tokens, prompts, time, correctness).
- **Evidence:** He narrates six items, expected fields, write-back, and the finished run with right/wrong.
- **Conditions:** Labels must be trusted. Six is the count on tape, not a law.
- **Exceptions:** No rewrite loop after a miss on this short. Sheet/n8n stay on tape.
- **Action:** Checkable stop = N labeled rows scored, with which rows failed named.
- **Confidence:** high for the demo; medium that six is enough
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “six examples with our expected category and our expected priority”
- **Epistemic:** SOURCE

### Sell requires eval
- **Claim:** Building and selling workflows requires learning to evaluate them.
- **Reasoning:** A buyer cannot buy a vibe. A second run needs a score or you are guessing again.
- **Mechanism:** He leads with sell, then teaches eval. The demo is a classifier, not a sold agent.
- **Evidence:** First sentence of the short.
- **Conditions:** His frame is sell-workflows. Hive may steal eval without selling agents.
- **Exceptions:** No sold eval package on this short. $ **not present**.
- **Action:** Do not treat “I ran it once” as sellable or shippable.
- **Confidence:** high he said it; medium as a business rule
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “if you want to build and sell workflows, you have to learn how to evaluate them”
- **Epistemic:** SOURCE

## C. Mental Models

- **Hypothesis is cheap; proof is a labeled set.** **SOURCE**
- **Feel is the amateur loop; score is the adult loop.** **SOURCE**
- **Six is enough to start.** He does not wait for a hundred rows. **SOURCE**
- **Write-back is part of eval.** If you cannot see the model’s answers next to expecteds, you cannot score. **SOURCE**
- **Tokens/time sit next to correctness.** Cost and latency are part of the report, not afterthoughts. **SOURCE**
- **“Sell” is why he cares, not the hive SKU.** **INFERENCE**
- **Right/wrong per row beats an average alone.** He clicks in to see which failed. **SOURCE**

## D. Procedures

1. **Name the hypothesis:** “If I change X, output gets better.”
2. **Refuse the vibe loop** as done: change → rerun → feel is not proof.
3. **Build a tiny labeled set:** rows with expected fields (here, category + priority).
4. **Run the same model** over every row.
5. **Write answers back** next to expecteds (his sheet).
6. **Score:** correctness per field, plus tokens / prompts / time.
7. **Open the misses.** Click into which rows were wrong.
8. **Only then** decide if the hypothesis held. Tape stops before the next change.

**Qualify / frame:** this is a classifier eval demo, not a client delivery. Selling workflows is his motive, not ours.
**Objections:** “I already ran it and it looked good” — answer with: expecteds, N rows, named misses.
**Avoid:** installing n8n eval / Google Sheets as hive OS. On-tape tools stay on tape.
**When to change:** if there are no expected labels, you are not evaluating. If you only have an average and no miss list, you are not done.

## E. Examples

**Situation:** Builder is unhappy with agent output.  
**Action:** They guess X, change, rerun, judge by feel.  
**Reasoning:** That is the default loop he wants replaced.  
**Outcome:** Subjective better/worse.  
**Lesson:** Feel is a hypothesis, not eval. Implicit rule: no expecteds = no proof.

**Situation:** He has six rows with expected category and priority.  
**Action:** Eval flow pulls the set, runs the tagger, writes AI answers to the sheet, runs the test.  
**Reasoning:** Objective proof needs expecteds and write-back.  
**Outcome:** Averages (tokens, prompts, time, correctness) + per-row right/wrong.  
**Lesson:** Tiny labeled set is enough to start. Implicit rule: open the misses, do not stop at the average.

**Situation:** The run finishes and he clicks in.  
**Action:** He inspects which of the six were right and which were not.  
**Reasoning:** An average hides the bad row.  
**Outcome:** He can see failures (visual-only; not listed in captions).  
**Lesson:** Named misses are the next hypothesis. Implicit rule: eval without a miss list is still a vibe.

## F. Decision Rules

- If there is no hypothesis → do not run a test for theater.
- If there are no expected labels → you are in the subjective loop.
- If you only report an average → open the failed rows before calling it done.
- If you want to sell/ship a workflow → eval is required on his tape; hive still requires a known-good pile.
- Optimize: speed of “six labeled rows → score + miss list.”
- Refuse (on this desk): “looks better” as done; n8n-eval as a SKU; quote sell-workflows as a hunt.

## G. Contrarian

- Against “just rerun it until it feels right”: that is the loop he names and rejects.
- Against “you need a huge eval harness”: six rows + a sheet is the demo.
- Against “correctness is the only number”: he also keeps tokens, prompts, time.
- Field assumes eval is advanced. He treats it as the price of selling.

## H. Assumptions

**His:** Six labeled rows generalize; sheet write-back is the right store; n8n evaluations tab is the OS; selling workflows is the reason to care; category+priority is a fair stand-in for “agents.”

**Ours:** Captions complete enough (332 words). Which rows failed is **UNVERIFIED** (not listed). No $. Domain-specific: text classification, not taste/creative.

**Falsifiers:** Six rows overfit and prod fails. Labels are wrong. Write-back lies. Token averages look fine while the two high-priority misses ship.

**Disagreement (keep labeled):** Hive will not operate n8n-cloud eval or sell “agent eval” as a SKU. The **hypothesis → labeled set → score + named misses** machine is still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- What were the six texts, and which failed? Not in captions.
- After a miss, what does he change? Not on this short.
- Who labeled the expecteds — him or a client?
- Is six a habit or a demo minimum?
- Sibling long: PACKET does not bind an id.
- Cost of the eval run — tokens mentioned as a metric, not a $.

## J. Connections

- **SYSTEM SYNTHESIS** → `golden-test-loop`: untrusted workers; keep only what a cheap check passes.
- **SYSTEM SYNTHESIS** → doctrine rule 8: working once proves almost nothing; known-good pile.
- **SYSTEM SYNTHESIS** → doctrine rule 6: reject 70% done; Forge/Watchdog report checks run.
- **SYSTEM SYNTHESIS** → `click-live-site`: open the artifact; do not accept “looks good.”
- **SYSTEM SYNTHESIS** → `agent-job-card`: eval owns/never belongs on the worker, not in chat.
- Do not force a Path A client out of a six-row classifier.

## K. Future-Use

- Tokens/time next to correctness as a Watchdog report line (unassigned).
- “Named misses” as the only legal next hypothesis (unassigned).
- Six-row starter set as a Forge smoke habit (unassigned).
- Sell-requires-eval as a Consultant objection, not a SKU (unassigned).

## Steal / Operate-never

### Machine: Hypothesis → tiny labeled set → write-back → score + named misses
- **Epistemic:** SOURCE (demo) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** unhappy/change idea → write the hypothesis → N rows with expected fields → run the same worker → write answers next to expecteds → score correctness + cost/time → open which rows failed → only then keep or change. Checkable stop = miss list, not “looks better.”
- **Questions / signals:** “What is the hypothesis?” “Where are the expecteds?” “How many rows?” “Which rows failed?” “What did tokens/time do?”
- **Qualify / frame / objections:** Classifier eval, not a client SKU. “Sell workflows” is his motive. Objection: I already ran it — answer with expecteds + named misses.
- **Procedure:** D steps 1–8. Checkable stops: (1) written hypothesis, (2) N labeled rows, (3) write-back, (4) scores, (5) named misses.
- **Example that proves it:** Six examples with expected category + priority → run test → averages for tokens/prompts/time/correctness → click in to see which of six were wrong. Lesson: six is enough to start; the miss list is the product.
- **Why it works:** Feel cannot be repeated or sold. Expecteds make proof cheap. Write-back makes misses inspectable. Conditions: trusted labels, a discrete output (tags), a human who opens failures. Exceptions: no post-miss rewrite on tape; creative taste is not this demo; sheet/n8n stay on tape.
- **Conditions / exceptions:** Cursor + Grok only. n8n evaluations + Google Sheets stay on tape. Clients parked. No new hunt.
- **Operate-never payload:** Vibe-as-done; n8n-eval as hive OS; sell-workflows hunt; quote any $ as FACT (none spoken).
- **Hive run (existing skills only):** `golden-test-loop` · `click-live-site` (open the result, don’t trust the average) · `agent-job-card` (owns/never includes “no vibe-done”) · `slice-build` (one eval slice) · `ask-principal` (nothing ships itself).
- **Source:** `8IUWeF3B-hk` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- “Looks better” as done
- n8n evaluations + Google Sheets as hive OS
- Install Claude / Codex / ChatGPT / Gemini / Coda / Vapi / Abacus / Skool
- Quote any $ as FACT
- New `icp_id` / unpark Normand / “sell eval” hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not chat a score into existence.

- **Done** on an eval slice: written hypothesis + labeled rows + scores + **named misses**. An average without a miss list is not done.
- **Delegate without being asked:** Watchdog owns the known-good pile. Forge fails the slice if the check was only planned. Researcher writes the hypothesis in the packet. I do not accept “we ran it.”
- **Skeptical review:** “Evaluating is easy” is the short’s job. I will not approve a sell-workflows lane because a six-row tab went green.
- **One system this take:** one labeled-set loop. Not “sell agents.”
- Live hunt stays parked. I do not rotate to classifier-shops because Nate hit run test.
