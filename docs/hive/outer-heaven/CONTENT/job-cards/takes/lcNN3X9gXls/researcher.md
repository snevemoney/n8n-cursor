# Researcher — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3791 words). Title: 3 hidden data-table hacks. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Sibling of `QCjMBOEhpLE` (tables 101) — **do not flatten**. Beats: (1) **Hack 1 — models & prompts in a table.** Research agent: Data Table get where `workflow = research agent` → user/system prompt + OpenRouter model vars. Client who fears the canvas edits the table. Share the workflow without sharing IP (template sees a variable, not the prompt). Demo: swap Claude 3.7 + “use Tavily” — agent calls Tavily (and still Perplexity — he blames a stronger model). Newsletter: same pattern for planning vs editor rows; user prompt can feed a Tavily query (topic) while agent user prompt stays dynamic from prior step. **Bonus sync:** n8n-primary → daily get table / clear Sheet / rewrite Sheet; or Sheet-primary → delete table rows / get Sheet / write table. Limitation: table is a weak frontend (no copy-paste, four types, no dropdowns) — he uses a Sheet dropdown so the model string can’t be misspelled. (2) **Hack 2 — action logs.** Prod needs fail-rate, why, and what worked → patterns → guardrails. Ultimate Media Agent used to log to Sheets (ts, workflow, in, out, actions, tokens); same columns in a table; **return intermediate steps** on the agent (hidden option). Demo: Telegram “lunch with Michael Scott 3pm” → think → contact agent → think → calendar; event + invite; table shows each tool in/out + tokens. Code node cleans token counts (other video). **Bonus errors:** error workflow → table (date, time, message, node, **workflow name**); settings → error workflow; context vars: now/today, execution id, workflow id/name. Slack/Telegram notify optional. (3) **Hack 3/4 — evals.** n8n evaluations: input + expected → actual + correctness. Same columns in a table (`eval`). Demo RAG: expected “Tesla operating income declined 42%” → actual match → score 5, then 4. Metrics: avg tokens, time, correctness. **Change one variable per run** (model xor prompt xor tools). Optimize speed/cost/quality. Plus “over 200” UNVERIFIED. Dentists-as-topic ≠ new `icp_id`.

## B. Atomic Knowledge

### Prompts/models live in a table, not the canvas
- **Claim:** Filter a `models and prompts` table by workflow name; bind user/system/model into the agent (and even into a Tavily query). Share the graph without the prompt IP. Non-builders edit the table.
- **Reasoning:** IP is the prompt; canvas is fragile; one frontend for many workflows.
- **Mechanism:** Get-rows + condition + expressions into OpenRouter / agent fields.
- **Evidence:** Swap 3.7 + Tavily without opening the agent node.
- **Conditions:** Exact workflow-name match. Four column types.
- **Exceptions:** Stronger model ignored “only Tavily.” Sheet dropdowns are safer than free-type model slugs.
- **Action:** Steal externalized prompt/model. Hive: `context-docs`, not n8n-cloud. No dentist hunt.
- **Confidence:** high as pattern.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** still called Perplexity after Tavily swap
- **Speech ≠ behavior:** none.

### Intermediate-steps log + error table
- **Claim:** Toggle **return intermediate steps**; persist think/tool in-out/tokens. Error workflow writes date/time/message/node/workflow. Patterns → guardrails.
- **Reasoning:** Prod without a log is un-tweaked.
- **Mechanism:** Agent option + table insert; settings error workflow; `$workflow` / execution id.
- **Evidence:** Michael Scott lunch chain in the table.
- **Conditions:** Hidden toggle. Code node for token math (other tape).
- **Exceptions:** Dual-write Sheet + table is optional comfort (`QCj` speed story).
- **Action:** Steal the toggle + one-row-per-run. `golden-test-loop`. No auto-calendar.
- **Confidence:** high as SOP.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Evals in the same store; one knob per run
- **Claim:** Table holds input/expected/actual/score; n8n eval node scores closeness. Next run: change **one** of model/prompt/tools. Watch tokens, time, correctness.
- **Reasoning:** “What did I do in run 33?” is the whole game.
- **Mechanism:** Eval dataset from table → agent → score → write back.
- **Evidence:** 42% operating-income pair scores 5 then 4.
- **Conditions:** His RAG fixture. Scores UNVERIFIED as quality law.
- **Exceptions:** Don’t flatten with Pinecone-assistant bakeoff (`QojPKL96Dx4`).
- **Action:** Steal isolate-one-variable. `golden-test-loop`.
- **Confidence:** high as method.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

## C. Mental Models
Table = control plane. Prompt is the IP. Logs make patterns; patterns make guardrails. Sheets still win as a human UI (dropdowns). Dual-sync is a crutch for a weak native frontend. One-variable science.

## D. Procedures
1. Table of workflow / model / user / system; get-filter into nodes.
2. If sharing a template → keep prompts in the table, not the export (his IP move).
3. If humans pick models → Sheet dropdown → sync, don’t free-type slugs.
4. Agent: return intermediate steps → log think/tools/tokens.
5. Error workflow → table + workflow name + optional Slack.
6. Evals: expected vs actual; **one** change per run; track tokens/time/score.
7. Hive: no n8n-cloud; no dentist ICP; no auto-send/calendar.

## E. Examples
- **Situation:** Client won’t touch n8n. **Action:** They edit the prompts table. **Outcome:** Model/tool swap without canvas. **Lesson:** Control plane.
- **Situation:** Tavily-only prompt + 3.7. **Action:** Still hits Perplexity. **Outcome:** Autonomy ignored the row. **Lesson:** Table isn’t a hard lock.
- **Situation:** Lunch with Michael Scott. **Action:** Intermediate steps on. **Outcome:** Full tool trace in the table. **Lesson:** Hidden toggle.

## F. Decision Rules
- IF prompt is IP → don’t put it in the shared JSON.
- IF logging prod → intermediate steps on.
- IF eval → one variable.
- IF humans edit models → dropdown, not string.
- Refuse: n8n-cloud; quote Plus 200 as FACT; new ICP; auto-invite calendar.

## G. Contrarian
The “hidden” hack is a spreadsheet in n8n. Native tables lose to Sheets as UI. Stronger models disobey the stored tool instruction.

## H. Assumptions
42% / scores / 200 members = **UNVERIFIED**. Caption-only.
**Desk dissent:** Learn control-plane + isolate-one. Do not stand up his newsletter/media agent.

## I. Questions
- Newsletter step-by-step tape id?
- Token-count code-node tape id?
- Eval feature tape id?

## J. Connections
- **SYSTEM SYNTHESIS:** `QCjMBOEhpLE` (tables 101) · `oWdJMJp2HgM` (guardrails) · `QojPKL96Dx4` (RAG eval sibling). Skills: `golden-test-loop` · `context-docs` · `ask-principal`.

## K. Future-Use
Prompt table as control plane. Intermediate-steps toggle. One-variable eval. Sheet-as-UI / table-as-runtime.

## Steal / Operate-never

### Machine: table-as-control-plane-then-log-and-eval
- **Epistemic:** SOURCE
- **Workflow / loop:** prompts/models in a filtered table → run → intermediate-steps log → error table → eval with one knob changed
- **Questions / signals:** Who edits the canvas? Is the prompt in the export? What changed in run 33?
- **Qualify / frame / objections:** Table ≠ hard tool lock. Sheets still better for humans.
- **Procedure:** D.
- **Example that proves it:** Tavily swap + leftover Perplexity; Michael Scott trace; 5 then 4 scores.
- **Why it works:** Separates IP/control from the graph; makes tweak-science possible.
- **Conditions / exceptions:** Four types / no dropdown. Don’t flatten with `QCj` speed test.
- **Operate-never payload:** n8n-cloud; dentist ICP; auto-calendar; quote $ / 200 as FACT; Skool.
- **Hive run (existing skills only):** `golden-test-loop` · `context-docs` · `ask-principal`
- **Source:** `lcNN3X9gXls` @ UNKNOWN

**Operate-never**
- n8n-cloud. New `icp_id`. Auto-send/book. Quote tape $ as FACT.

## L. Role-Specific Applications
File as tables-201 next to `QCjMBOEhpLE`. Steal isolate-one-variable. Do not export his prompts table.
