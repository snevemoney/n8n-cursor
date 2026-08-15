# Researcher — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Eval short. Beats: (1) If you build/sell workflows you must evaluate. (2) Definition: “validating your hypothesis with objective proof.” (3) Old habit: change X, rerun, subjectively judge better/worse. (4) n8n eval flow: dataset of six examples with expected category + expected priority → through the model → write AI answers back to Google Sheet → set category/priority → Evaluations tab → run test. (5) Metrics: avg tokens, prompts total, duration, avg priority + category correctness. (6) Six processed; can see which were right/wrong. Timestamp UNKNOWN.

## B. Atomic Knowledge

### Eval = hypothesis + objective proof
- **Claim:** Evaluation is validating a hypothesis with objective proof, not a vibe check.
- **Reasoning:** Builders already have “if I do X, output gets better” — they just judge it subjectively.
- **Mechanism:** Named expected labels vs model output.
- **Evidence:** Definition + contrast with subjective reruns.
- **Conditions:** You have a hypothesis and a labeled set.
- **Exceptions:** No labels → you are still in vibe-check.
- **Action:** Write the hypothesis and the expected fields before changing the prompt.
- **Confidence:** high as his definition.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

### Labeled six-row set → scores
- **Claim:** A six-example sheet with expected category + priority can be run as a test; you get correctness plus cost/latency averages.
- **Reasoning:** Same items through the model; compare to expected; look at misses.
- **Mechanism:** Dataset → model → writeback → eval tab → per-row right/wrong + averages.
- **Evidence:** On-tape run of all six.
- **Conditions:** Expected category and priority exist.
- **Exceptions:** Six is his demo size, not a law.
- **Action:** Steal labeled-set + per-row miss list + token/time averages.
- **Confidence:** high for the demo; n8n-specific UI.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Selling without eval is incomplete. Subjective “looks better” is the failure mode. Cost (tokens) and time sit next to correctness — he wants all three. Hypothesis is first-class.

## D. Procedures
1. State hypothesis (“if I change X, Y improves”).
2. Build a labeled set (here: category + priority).
3. Run the same items through the model.
4. Write outputs next to expected.
5. Score correctness; also record tokens, prompt count, duration.
6. Open the misses, not just the average.

## E. Examples
- **Situation:** Tagger should set category and priority. **Action:** Six labeled rows → run test. **Reasoning:** Objective vs vibe. **Outcome:** All six processed; right/wrong visible; averages for tokens/time/scores. **Lesson:** The unit is the row, not the vibe. Implicit rule: expected fields must exist before “run test.”

## F. Decision Rules
- If you would sell the workflow → you need an eval set.
- If you only reran and “felt” better → not eval.
- Refuse: quoting six-row scores as a general quality FACT.

## G. Contrarian
Rejects “just iterate until it looks good” as sufficient for something you sell.

## H. Assumptions
Google Sheet + n8n eval tab exist. Category/priority is the task. Six rows are enough to demo, not to prove production.
**Desk dissent:** none yet.

## I. Questions
- What were the actual miss rows?
- Who labels the expected set — builder or client?

## J. Connections
- **SYSTEM SYNTHESIS:** `9mqsVK6Iqoc` (classifier branches). `NWbh5ZoEHkA` (score then rerun). `golden-test-loop` · `coverage-loop`. Do not flatten arena scores into this eval tab.

## K. Future-Use
Hypothesis-first labeled set as the default eval shape for any hive classifier.

## Steal / Operate-never

### Machine: hypothesis-plus-labeled-set
- **Epistemic:** SOURCE
- **Workflow / loop:** write hypothesis → labeled rows (expected fields) → run same items → writeback → score correctness + tokens + time → inspect misses
- **Questions / signals:** What would change X improve? Which rows missed?
- **Qualify / frame / objections:** “I ran it again and it looks better” → not eval.
- **Procedure:** D.
- **Example that proves it:** Six rows, expected category+priority, eval tab, right/wrong + averages.
- **Why it works:** Turns a feeling into a miss list.
- **Conditions / exceptions:** Needs labels. Six is a demo N.
- **Operate-never payload:** n8n eval tab as the only allowed eval; quote scores as FACT; ship because average looked fine.
- **Hive run:** `golden-test-loop` · `coverage-loop`
- **Source:** `8IUWeF3B-hk` @ UNKNOWN

**Operate-never**
- Ship on vibe. Quote token averages as FACT. New `icp_id`. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
This is the eval machine for the rest of the Nate corpus. Do not install n8n eval; map to `golden-test-loop`.
