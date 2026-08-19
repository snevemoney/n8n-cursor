# Money Desk — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3791 words. Nate: three ‘secret’ Data Tables hacks after the prior tables video. Caption-only; timestamp UNKNOWN. Beats in order: (1) Store models + prompts in a table; research-agent demo — Data Tables node match workflow==research agent → drag user prompt / system prompt / chat model into the agent + OpenRouter. Frontend for a client who won’t open the canvas (change model/prompt in the table). Share the workflow without sharing IP: template gets the variable, not the prompt text. Live edit: swap Claude 3.7 Sonnet + ‘use Tavily’ vs Perplexity; rerun uses Tavily + Sonnet; Sonnet also called Perplexity (more tools). Same pattern on a newsletter graph: planning-agent row (model/user/system) — user prompt into Tavily topic; system+model into planning + section-writer (GPT-5 mini on tape). Editor-agent is a second row (model+system, no user). Bonus sync: n8n-primary = get n8n rows → clear Sheet → write back daily; Sheet-primary = delete n8n rows → get Sheet → write n8n. Limitation: n8n table is a weak frontend (no copy-all, four types only, no dropdowns) — he hardcoded model dropdowns in Sheets so nobody misspells. (2) Agent logs/actions in a table (was Sheets: timestamp, workflow, input, output, actions, tokens, total). Replace Sheet nodes; in the agent Add option → Return intermediate steps (hidden; ‘game changer’). Telegram: calendar event today 3pm lunch with Michael Scott → contact agent → calendar agent; Calendar shows event + email; table row: think → contact (in/out) → think → calendar; tokens + prompt model. Code node cleans token count (prior video). Bonus: error logger table (date/time/error message/error node + workflow name); settings → error workflow; context vars: now/today/execution id/workflow id+name; Slack/Telegram notify optional. (3/4) Evals on native tables instead of Sheets: input / expected / actual / score. RAG eval: dataset from table → agent (KB 3×, calculator 2×) → eval node correctness. Tesla operating income declined 42% → actual matched → score 5; next row score 4. Key: know what run 33 changed; isolate one variable per run (model or prompt or tools). Metrics: avg tokens, avg time, correctness — optimize speed/cost/quality. Close: Plus 200 members, Agent Zero, 10h/10s, One-person agency annual — UNVERIFIED.

## B. Atomic Knowledge
### Prompts-live-in-the-table-not-the-canvas
- **Claim:** Match workflow==row, then drag model/user/system in as variables. Client edits the table. Shared template sees the variable, not the IP prompt.
- **Reasoning:** Canvas-scared client + prompt-as-IP. Newsletter uses two rows (planning vs editor) so each hop has its own model/prompt.
- **Mechanism:** One row per agent hop. Filter on workflow name. Sheets dropdown if spelling matters; n8n types are four and no pills.
- **Evidence:** On-tape dentists research; Sonnet+Tavily swap; GPT-5 mini on newsletter; Tesla 42% eval.
- **Conditions:** You have more than one agent hop and a prompt you don’t want in the JSON export.
- **Exceptions:** n8n / OpenRouter / Perplexity / Tavily / client-on-the-table are not ours. Auto-run the newsletter is operate-never.
- **Action:** Steal prompt-out-of-export. HOLD n8n tables as a SKU.
- **Confidence:** high as a pattern
- **Source:** lcNN3X9gXls @ UNKNOWN
- **Epistemic:** SOURCE
### Return-intermediate-steps-or-you-are-blind
- **Claim:** Toggle Return intermediate steps or you only get the final string. Logs (think/tool in-out/tokens) are how you see patterns and write the next guardrail.
- **Reasoning:** Michael Scott lunch: think → contact → think → calendar. Yesterday’s duplicate test row is still in the table.
- **Mechanism:** Same columns as the old Sheet. Error workflow + workflow name/id. Notify is optional and HITL if it pages a human.
- **Evidence:** On-tape Telegram + Calendar + token columns. Hidden add-option.
- **Conditions:** The agent is in production.
- **Exceptions:** Auto-create calendar / auto-Slack errors = HITL. Do not log secrets.
- **Action:** Steal intermediate-steps. Do not auto-book lunch.
- **Confidence:** high
- **Source:** lcNN3X9gXls @ UNKNOWN
- **Epistemic:** SOURCE
### Evals-one-variable-per-run
- **Claim:** Dataset = input + expected; write actual + score back. Change one of model/prompt/tools per run or you cannot attribute run 33.
- **Reasoning:** Tesla 42% → score 5 then 4. Average tokens/time/correctness are the three knobs.
- **Mechanism:** Native table as the dataset instead of Sheets. Isolate. Track what changed.
- **Evidence:** On-tape RAG agent, KB×3, calc×2, scores 5 and 4.
- **Conditions:** You will change the graph more than once.
- **Exceptions:** Scores are his grader, UNVERIFIED. n8n eval feature is not ours.
- **Action:** Steal one-variable-per-run. HOLD the eval product.
- **Confidence:** high as a rule
- **Source:** lcNN3X9gXls @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: tables make agents tunable without opening the canvas. Priority: IP-out-of-export; logs; one-variable evals. Experience: prior tables + media-agent + eval videos. Contrarian: n8n table is a bad frontend — Sheets dropdowns win for models. Uncertainty: 200 members UNVERIFIED.

## D. Procedures
Order: table of workflow/model/user/system → get-row filter → variables into agent/OpenRouter. Optional daily sync n8n↔Sheets (pick a primary). Logs: enable intermediate steps → write row. Errors: error workflow + context vars. Evals: input/expected table → run → score → change one knob. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Client must not open n8n. **Action:** they edit the models-and-prompts table. **Reasoning:** one filter row. **Outcome:** Sonnet+Tavily swap without touching nodes. **Lesson:** Frontend ≠ canvas.

**Situation:** Lunch with Michael Scott. **Action:** intermediate steps on. **Reasoning:** otherwise no tool trace. **Outcome:** think/contact/think/calendar + tokens. **Lesson:** The toggle is the log.

**Situation:** Tesla 42% eval. **Action:** expected vs actual. **Reasoning:** isolate variables next run. **Outcome:** 5 then 4. **Lesson:** Score without a changelog is trivia.

## F. Decision Rules
IF you would paste the system prompt into a shared JSON → put it in a table/variable. IF production → intermediate steps + error table. IF eval → one variable per run. IF n8n table spelling risk → Sheets dropdown as the frontend (his limit). IF Plus/200/agency course → not a SKU. Refuse: n8n-cloud; auto-calendar; auto-newsletter.

## G. Contrarian
Rejects ‘the prompt lives in the node.’ Rejects evals without a changelog. Rejects n8n table as a nice UI.

## H. Assumptions
Demo agents (dentists, Michael Scott, Tesla 42%) are toys. Duplicate yesterday row. Sync-every-day is a pattern not a receipt. Survivorship: his instance. Falsifier: table types can’t hold the prompt. Speech≠behavior: free prior video then Plus.

## I. Questions
Any receipt that prompt-in-table stopped an IP leak we can open? What’s the real eval grader? Did clients actually edit the table?

## J. Connections
SYSTEM SYNTHESIS: filter-then-variable = `QCjMBOEhpLE`. Intermediate steps = golden-test-loop evidence. One-variable = `eRS3CmvrOvA` reproduce-before-list. n8n/Plus/auto-calendar operate-never.

## K. Future-Use
Unassigned: Sheets-as-frontend / n8n-as-runtime split. Prompt-as-IP when sharing a template.

## Steal / Operate-never

### Machine: Prompt-table-plus-intermediate-steps-plus-one-knob-evals
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: agent in prod or shared → action: prompts/models in a row; intermediate steps logged; eval with one changed knob → checkable stop: you can say what run 33 changed and show the tool trace
- **Questions / signals:** Where does the prompt live? Are intermediate steps on? What one variable moved?
- **Qualify / frame / objections:** Frame: table is the frontend, canvas is the engine. Objection: ‘n8n table is enough UI’ — he uses Sheets dropdowns for models.
- **Procedure:** One row per hop. Filter. Log. Error workflow. Isolate evals. HITL calendar/Slack/send.
- **Example that proves it:** Sonnet+Tavily swap; Michael Scott lunch trace; Tesla 42% scores 5 then 4. UNVERIFIED.
- **Why it works:** You cannot improve what you cannot see, and you cannot share a graph that contains the IP prompt.
- **Conditions / exceptions:** Works as a pattern. Exception: n8n / Plus / 200 / auto-book / auto-send operate-never.
- **Operate-never payload:** n8n-cloud · Plus / 200 members · auto-calendar · auto-newsletter · Tesla 42% as FACT
- **Hive run (existing skills only):** `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** lcNN3X9gXls @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 200 members / Tesla 42% / scores 5–4 as FACT or as our analog.
- n8n-cloud / Plus as a SKU. Auto-create calendar. Auto-send error Slack to a client.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD n8n Data Tables and Plus. Steal prompt-out-of-export, intermediate-steps, one-variable-per-run. Calendar/send stay HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
