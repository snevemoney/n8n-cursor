# Product GTM — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Short (title: “STOP Guessing! Evaluating Your Agents is Easy” 1:31). Beats: (1) if you want to build and sell workflows, you must learn to evaluate; (2) evaluation = validating your hypothesis with objective proof; (3) usual loop: unhappy with results → “if I do X it gets better” → change → run → *subjective* better/worse; (4) n8n eval flow: dataset of six examples with expected category + expected priority → through the model → write answers back to Google Sheet → set category/priority → evaluations tab → run test; (5) collects average tokens, prompts total, duration, average priority/category correctness; (6) six processed; you can see which were right and wrong. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Eval is hypothesis + objective proof (required to sell)
- **Claim:** Building/selling workflows requires evaluation: validate a hypothesis with objective proof, not a vibe.
- **Reasoning:** The default loop is subjective “better/worse,” which is guessing.
- **Mechanism:** Expected labels in a sheet → run N items → scores + per-row right/wrong.
- **Evidence:** He defines eval, then runs six rows.
- **Conditions:** You have expected category and priority for each example.
- **Exceptions:** Subjective loop is what people do when they skip eval.
- **Action:** Do not sell a workflow you have only vibe-checked.
- **Confidence:** high as doctrine.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

### Six-row sheet is enough to see misses
- **Claim:** A six-example set with expected category/priority produces token/time averages and per-row correctness.
- **Reasoning:** You can click in and see which failed.
- **Mechanism:** Dataset → model → sheet writeback → evaluations run.
- **Evidence:** “Processed all six… which ones were right and which ones weren’t.”
- **Conditions:** Labels exist before the run.
- **Exceptions:** None.
- **Action:** Expected column first. Averages without per-row misses are incomplete.
- **Confidence:** high for the demo; N=6 is his, not a law.
- **Source:** `8IUWeF3B-hk` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Selling without eval is guessing. Hypothesis is “X will make output better.” Objective proof is expected vs actual on a sheet. Tokens/time are secondary; correctness is the point. He wants builders who sell to have this habit.

## D. Procedures
1. Write a hypothesis (if I change X, output improves).
2. Hold a dataset with expected fields.
3. Run the same items through the model; write answers back.
4. Read per-row right/wrong *and* averages (tokens, prompts, duration, scores).
- Avoid: subjective re-run as the only judge (the “until satisfied” fail from `EuzYhzB0vbI`).

## E. Examples
**Situation:** Tagger should set category + priority. **Action:** Six labeled rows → run test → see misses. **Reasoning:** Objective proof. **Outcome:** Finished; per-row visible. **Lesson:** The sheet is the walkthrough. Implicit rule: you cannot sell what you cannot score.

## F. Decision Rules
- If you want to sell → eval first.
- If you only have a vibe → that is a hypothesis, not proof.
- Refuse: shipping on “looks better.”

## G. Contrarian
Against subjective iterate-and-feel. Against “eval is advanced / later.”

## H. Assumptions
Theirs: six rows and two expected fields are enough; n8n evaluations tab is the venue. Ours: do not productize n8n eval as a SKU; hive already has `golden-test-loop`. Falsifier: high average score, all misses on the one category that matters.

## I. Questions
What were the six examples? What is a passing average? Not on tape.

## J. Connections
**SYSTEM SYNTHESIS:** Direct map to `golden-test-loop` and `EuzYhzB0vbI` (X metric = Y; “until satisfied” is weak). Required spine before `outcome-offer-funnel` spend.

## K. Future-Use
Unassigned: token/time averages as a cost line on a Path C dashboard. Keep; not this week.

## Steal / Operate-never

### Machine: hypothesis → labeled set → per-row right/wrong
- **Epistemic:** SOURCE
- **Workflow / loop:** state “if X then better” → run labeled examples → write actuals → inspect misses → keep or change X
- **Questions / signals:** What is the expected column? Which rows failed?
- **Qualify / frame / objections:** If they want to buy a workflow with no sheet → not ready
- **Procedure:** Expected labels before the demo. Do not self-grade a still
- **Example that proves it:** Six rows, expected category+priority, evaluations tab shows right/wrong
- **Why it works:** Selling needs a number a stranger can check; vibe is not that number
- **Conditions / exceptions:** Needs labels. N=6 is his demo size
- **Operate-never payload:** n8n eval product; “easy eval” course magnet
- **Hive run (existing skills only):** `golden-test-loop` · `outcome-offer-funnel`
- **Source:** `8IUWeF3B-hk` @ UNKNOWN

### Operate-never
- Productize n8n evaluations; quote token averages as FACT
- Sell a workflow with only a vibe-check
- Switch stack; new hunt; merge LESSONS; auto-write SKILL.md

## L. Role-Specific Applications
Eval is a GTM gate: no launch spend before a checkable sheet. Walkthrough = per-row misses, not a green average. Sentence still needs a numbered outcome — eval is how we know the proof is not a screenshot. Clients parked.
