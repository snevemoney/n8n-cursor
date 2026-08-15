# Librarian — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** STOP Guessing! Evaluating Your Agents is Easy
**Channel:** Nate Herk | AI Automation
**Kind:** short (~1:31 / ~332 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. If you want to build and sell workflows, you have to learn to evaluate them.
2. Evaluation = validating your hypothesis with objective proof.
3. Old loop: unhappy with results → "if I do X it will be better" (hypothesis) → change → run → subjectively judge better/worse.
4. In n8n: evaluation flow pulls a dataset of six examples with expected category and expected priority.
5. Feed through the model (tag category + priority); write AI answers back to Google Sheet; set category/priority; check in evaluations tab.
6. Run test: six items through the model; averages for tokens, prompts total, duration; average priority and category correctness.
7. Finished: all six processed; can see which were right and which weren't.
Gap: sheet schema, model, scores. Timestamp UNKNOWN. n8n evals on-tape.

## B. Atomic Knowledge

### Eval is hypothesis + objective proof
- **Claim:** Evaluation is validating a hypothesis with objective proof — not a vibe after a change.
- **Reasoning:** The old loop was subjective better/worse; the new loop is expected labels vs model output.
- **Mechanism:** Dataset with expected fields → run → write back → score correctness.
- **Evidence:** "validating your hypothesis with objective proof"
- **Conditions:** You have expected labels
- **Exceptions:** None on tape
- **Action:** File as `golden-test-loop`
- **Confidence:** high as doctrine
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

### Six-row labeled set is enough to start
- **Claim:** He runs six examples with expected category and priority; writes answers back; shows right vs wrong.
- **Reasoning:** Small labeled set beats guessing.
- **Mechanism:** Sheet → model → write-back → evaluations tab averages (tokens, prompts, time, correctness).
- **Evidence:** "data set of six examples with our expected category and our expected priority"
- **Conditions:** Classification-style task
- **Exceptions:** Not claimed as statistically large
- **Action:** Persist small labeled set + write-back; do not require a huge bench
- **Confidence:** high as demo
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Selling workflows requires eval. Hypothesis is "if I do X, output improves." Subjective judge is the failure mode. Right/wrong per row is the picture.

## D. Procedures
1. State hypothesis (if I change X, better).
2. Hold a dataset with expected fields.
3. Run the model over the set.
4. Write outputs back next to expected.
5. Score correctness (+ tokens/time if you want).
6. See which rows failed.
Avoid: change → vibe. Signals: evaluations tab finished; right vs wrong visible.

## E. Examples
**Six-row classifier:** Situation — tagging category + priority. Action — six expected pairs through the model; write-back; run test. Reasoning — objective proof. Outcome — all six processed; some right, some wrong. Lesson — small labeled set + write-back is the machine.

## F. Decision Rules
- If there are no expected labels → you are still in the subjective loop.
- If you only look at averages and not which rows failed → you miss the picture he shows.
- Refuse: n8n evals as the only hive harness; quote token averages as FACT.

## G. Contrarian
Against "just run it again and see if it feels better." Against needing a huge eval farm to start.

## H. Assumptions
Theirs: six rows generalize (not proven). Ours: Google Sheet is on-tape storage, not a second wiki. Falsifier: a task with no expected label (open gen). Keep that exception labeled.

## I. Questions
What were the six examples? What were the scores? Does a long tape add more than classification eval?

## J. Connections
SYSTEM SYNTHESIS → `golden-test-loop`; `NWbh5ZoEHkA` (calc as another objective tool); `oWdJMJp2HgM` (guardrails — different safety vs eval).

## K. Future-Use
Six-row labeled set as a minimum eval object. Unassigned: hive golden tests already exist — map, do not rebuild in n8n.

## Steal / Operate-never

### Machine: hypothesis → labeled set → write-back → right/wrong
- **Epistemic:** SOURCE
- **Workflow / loop:** state "if I do X, better" → run labeled rows → write outputs beside expected → checkable stop = per-row right/wrong (not a vibe)
- **Questions / signals:** What is the hypothesis? Which rows failed?
- **Qualify / frame / objections:** Selling workflows requires this
- **Procedure:** expected category + priority on this demo
- **Example that proves it:** six examples → evaluations tab → right and wrong visible
- **Why it works:** expected labels make the hypothesis checkable
- **Conditions / exceptions:** needs labels; open-gen tasks need a different stop
- **Operate-never payload:** n8n-cloud eval as hive SSOT; token averages as FACT
- **Hive run:** `golden-test-loop` · `tape-self-teach`
- **Source:** `8IUWeF3B-hk` @ UNKNOWN

### Operate-never
- n8n as the hive eval reader. Quote token/time averages as FACT.
- Merge `LESSONS-FROM-TAPE.md`. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
This is our lane: expected labels + write-back + per-row miss. Do not stand up n8n evaluations as a second wiki. Map to existing `golden-test-loop`.
