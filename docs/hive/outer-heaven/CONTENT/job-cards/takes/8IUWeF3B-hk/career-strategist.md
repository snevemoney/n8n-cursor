# Career Strategist — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (1:31, 332 words). Beats: (1) if you want to build and sell workflows, learn to evaluate them (2) evaluation = validating your hypothesis with objective proof (3) old loop: unhappy with output → “if I do X it gets better” → change → subjectively judge better/worse (4) n8n eval flow: dataset of six examples with expected category + expected priority (5) feed through the model that tags category/priority (6) write AI answers back to the Google Sheet (7) evaluations tab → run test (8) collects average tokens, prompts total, duration, average priority/category correctness (9) six items processed; you can see which were right/wrong. Title: stop guessing.

## B. Atomic Knowledge

### Evaluation is hypothesis + objective proof
- **Claim:** Evaluation means validating a hypothesis with objective proof, not a vibe after one run.
- **Reasoning:** The builder already has a hypothesis (“if I do X, output improves”); they usually score it by feeling.
- **Mechanism:** labeled set → run → write back → scores.
- **Evidence:** “validating your hypothesis with objective proof.” @ UNKNOWN
- **Conditions:** You have expected labels.
- **Exceptions:** Tasks with no label (taste-only) — he does not solve those here.
- **Action:** Write the expected answer before the change.
- **Confidence:** high as his definition.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

### Six labeled rows beat a subjective rerun
- **Claim:** A six-example sheet with expected category/priority plus a test run tells you which items failed and the average correctness.
- **Reasoning:** You can see right vs wrong, not just “feels better.”
- **Mechanism:** dataset → model → sheet writeback → eval tab metrics (tokens, time, scores).
- **Evidence:** “six examples with our expected category and our expected priority” / “which ones were right and which ones weren’t.” @ UNKNOWN
- **Conditions:** Classification-like tasks.
- **Exceptions:** Open-ended generation without a key.
- **Action:** Keep a tiny labeled set next to any classifier you would sell or trust.
- **Confidence:** high as demo.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Selling without eval is guessing. Tokens and latency are part of the score, not only correctness. Subjective judge is the default failure mode of builders.

## D. Procedures
1. State hypothesis (if I change X, Y improves).
2. Hold a labeled set (here: category + priority).
3. Run the same set through the model.
4. Write outputs back.
5. Read per-item right/wrong + averages (tokens, time, correctness).
Avoid: one-off “looks better.”  
When to change: when the score moves, not when the vibe moves.

## E. Examples
**Situation:** Classifier for category and priority.  
**Action:** Six expected rows; run test; inspect misses.  
**Reasoning:** Objective proof.  
**Outcome:** Finished; per-item visibility.  
**Lesson:** A sellable workflow needs a score. Implicit rule: do not sell a classifier you have only eyeballed.

## F. Decision Rules
- If you will sell it, evaluate it.
- If you only have a vibe, you do not have a result.
- Optimize for labeled misses you can fix.

## G. Contrarian
Rejects “run it again and see if you like it” as evaluation.

## H. Assumptions
**Theirs:** Six rows are enough; sheet expected values are gold. **Ours:** tiny N; labels can be wrong. Not a job-eval of Evens. Falsifier: high score on a bad label set.

## I. Questions
- What is a passing correctness average for him?
- How does he eval generative (non-label) workflows?

## J. Connections
- SYSTEM SYNTHESIS → `golden-test-loop` / `coverage-loop`.
- SYSTEM SYNTHESIS → `NWbh5ZoEHkA` (live score).
- SYSTEM SYNTHESIS → `interview-gym` same-day rubric.

## K. Future-Use
Unassigned: six-row eval sheet as a pattern for any desk output that has an expected shape.

## Steal / Operate-never

### Machine: hypothesis → labeled set → scored rerun
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** write “if I do X, Y improves” → lock expected rows → run → read misses + tokens/time → keep or revert → stop
- **Questions / signals:** What would prove this change? Which of the six failed?
- **Qualify / frame / objections:** “Looks better” is not a pass. If they want to sell, show the eval tab.
- **Procedure:** Sheet with expected category/priority (or analog). No vibe-only ship.
- **Example that proves it:** Six-row classifier test (E).
- **Why it works:** A hypothesis you cannot miss-count is just hope (B/C).
- **Conditions / exceptions:** Needs labels. Taste work still needs a human director.
- **Operate-never payload:** Selling unevaluated agents as a hive SKU; quoting token averages as FACT; quit-job.
- **Hive run:** `golden-test-loop` · `coverage-loop` · `interview-gym` (rubric)
- **Source:** `8IUWeF3B-hk` @ UNKNOWN

### Operate-never
- Sell a workflow with only a vibe score.
- Quote token/time averages as FACT.
- Employment send, quit-job, unpark clients.
- Merge LESSONS. Auto-write `SKILL.md`.

## L. Role-Specific Applications
Employment still covers baseline. Career analog: a mock or a raise packet needs a labeled rubric (what “good” was) and a miss list, not “I thought it went well.” Gym is the eval tab. Clients parked.
