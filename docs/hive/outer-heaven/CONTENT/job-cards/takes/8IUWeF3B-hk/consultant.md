# Consultant — 8IUWeF3B-hk
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/8IUWeF3B-hk/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Eval short. Beats: if you want to build and sell workflows you must learn to evaluate. Eval = validating a hypothesis with objective proof. Builder loop without eval: unhappy with output → “if I do X it gets better” → change → run → subjective better/worse. Then n8n eval flow: dataset of six examples with expected category + expected priority → feed model → write AI answers back to the sheet → run test in evaluations tab → averages for tokens, prompts, duration, and correctness scores for priority/category → click in to see which of the six were right/wrong. No VTT. UNKNOWN. ~332 words.

## B. Atomic Knowledge

### Eval is hypothesis + objective proof
- **Claim:** Evaluation means validating your hypothesis with objective proof, not a vibe after one run.
- **Reasoning:** Subjective “looks better” is how you fool yourself before you sell.
- **Mechanism:** State X→better → change → measure against labeled expecteds.
- **Evidence:** “validating your hypothesis with objective proof.”
- **Conditions:** You have labeled examples (here: category + priority).
- **Exceptions:** If the labels are wrong, the score is theater.
- **Action:** Write the hypothesis. Write the expecteds. Then change the prompt.
- **Confidence:** high
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “validating your hypothesis with objective proof”
- **Epistemic:** SOURCE
### Six labeled rows beat a gut check
- **Claim:** He runs six examples with expected category and priority, writes model answers back, and reads per-row right/wrong plus averages.
- **Reasoning:** A table of expecteds is a toddler-checkable stop.
- **Mechanism:** Dataset → model → write-back → evaluations run → token/time/correctness averages + row drill-in.
- **Evidence:** On-tape: six items; expected category; expected priority; averages for tokens, prompts, duration, scores.
- **Conditions:** Classification task. Sheet exists.
- **Exceptions:** Six is a demo size. Selling a workflow may need more and messier cases.
- **Action:** Do not sell a classifier you have not scored against expecteds.
- **Confidence:** high
- **Source:** `8IUWeF3B-hk` @ UNKNOWN — “data set of six examples with our expected category and our expected priority”
- **Epistemic:** SOURCE


## C. Mental Models

He believes sellers who cannot evaluate will ship luck. He treats the naive loop (change → feel) as the thing to replace. He likes n8n’s evaluations tab as the place the proof lives. He shows cost/latency averages next to correctness — not only “is it smart.”

## D. Procedures

1. Write the hypothesis (“if I do X, Y improves”). 2. Hold a labeled set (expected fields). 3. Run the same set through the model. 4. Write answers back. 5. Score correctness + tokens + time. 6. Drill into misses. 7. Only then change X again. Avoid: shipping on a single happy path.

## E. Examples

**Situation:** Support-email style classify (category + priority). **Action:** Six labeled rows through the model; eval tab shows which hit. **Outcome:** Run finished; per-row right/wrong visible. **Lesson:** The stop is the table, not the anecdote. Implicit rule: you cannot sell what you cannot score.

## F. Decision Rules

If you cannot name expected output per example, you are still in subjective mode. If you change two things at once, you do not have a hypothesis. If averages look good but two fail rows are the buyer’s real cases, you failed.

## G. Contrarian

Field default: iterate until it “feels” better. He wants a score. Field default: eval is ML-ops, not for no-code sellers. He says you must learn it to sell.

## H. Assumptions

Six rows is tiny. Labels may be his, not a client’s. n8n eval UI is vendor-specific. Correctness on category/priority does not prove business value.

## I. Questions

What were the six texts? What score is “good enough” to sell? Does he hold out a seventh?

## J. Connections

**SYSTEM SYNTHESIS:** Maps to `golden-test-loop`. Completes with longer eval talk if present on other tapes. Skeptical-customer review before build commit is this desk’s version of “objective proof.”

## K. Future-Use

Unassigned: six-row minimum as a toddler gate; tokens+time next to correctness as a four-blank cousin (cost to run).

## Steal / Operate-never

### Machine: Hypothesis → labeled set → score before you sell
- **Epistemic:** SOURCE
- **Workflow / loop:** Unhappy output → write “if I do X, Y improves” → run a labeled set → write back → read right/wrong + tokens/time → only then keep X
- **Questions / signals:** What is the hypothesis? What is the expected per row? Which misses are the buyer’s real cases?
- **Qualify / frame / objections:** Qualify: there is a repeatable output to score. Frame: objective proof. Objection: “just look at this one” — that is the old loop.
- **Procedure:** Keep expecteds in a sheet. Drill misses. Do not ship on vibe.
- **Example that proves it:** Six emails tagged category+priority; eval tab shows per-row hits.
- **Why it works:** Sellers who cannot score will sell luck. A table is a checkable stop.
- **Conditions / exceptions:** Labels must be real. Six is a demo. Score ≠ value.
- **Operate-never payload:** Sell an unscored classifier. Treat n8n eval as the only stack. Quote token averages as a client KPI without owner words.
- **Hive run (existing skills only):** `golden-test-loop` · `four-blank-sku` · `ask-principal`
- **Source:** `8IUWeF3B-hk` @ UNKNOWN


### Operate-never
- Sell a workflow you have only vibe-checked.
- Treat six demo rows as a production guarantee.
- Unpark a client / new `icp_id` / new `business-lanes.json` row. Learning ≠ hunt.
- Quote tape $ / student counts / job-loss % / hours×rate as FACT.
- Send / pay / deploy / book / publish. Approve draft ≠ send.
- Install on-tape vendors (Claude, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus, n8n-cloud, Skool). Stack stays Cursor + Grok.
- Grok Bot / `sendPrompt`. Merge `LESSONS-FROM-TAPE.md`. Auto-write SKILL.md. Overwrite `takes/consultant.md` or another desk's take.

## L. Role-Specific Applications

**Constraint first:** The stated ask is “evaluate agents.” Felt problem is a leak, not an eval tab. Do not install n8n evaluations on a parked client because a short said you must.

**Four-blank after constraint:** If we ever score a job, toddler stop = named expecteds + which rows failed. Tokens are not the KPI unless the owner said cost-to-run is the leak.

**Skeptical-customer:** This desk *is* the hostile eval. Clients parked.
