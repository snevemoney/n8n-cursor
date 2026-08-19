# Creative Studio — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Sister to `QCjMBOEhpLE`. Three “hidden” Data Table hacks. (1) **Models & prompts table** — filter `workflow = research agent`; client edits model/prompt without opening the canvas; share the template, keep the system prompt as IP (variable only); OpenRouter model string + tool name swapped live (3.7 Sonnet + Tavily; agent also kept Perplexity — “more powerful decided it needed more”); newsletter planning/editor rows; Sheets↔table daily sync both directions; table UI is weak (no dropdowns — Sheets has model pills so you cannot typo). (2) **Action logs** — production: fail rate, why, what works, patterns → guardrails; Ultimate Media Agent: timestamp/workflow/in/out/actions/tokens; toggle **return intermediate steps**; Telegram “lunch with Michael Scott 3pm” → think → contact agent → think → calendar; error logger table + error workflow (date, message, node, workflow name/id, execution id) + Slack/Telegram. (3) **Evals in-table** — input / expected / actual / score; RAG eval Tesla “operating income declined 42%” → 5 then 4; **change one variable per run**; optimize speed/cost/quality. Plus ~200 (UNVERIFIED). Visual: tables, calendar event, eval scores.

## B. Atomic Knowledge

### Prompt/model live outside the canvas
- **Claim:** A filtered row can drive system prompt, user prompt, and chat model so a non-builder (or a shared template) never sees the IP.
- **Evidence:** “a lot of the IP of a workflow… lives in the system prompt… people would get access to this variable, but they wouldn’t be actually getting this system prompt.”
- **Conditions:** Exact string match on workflow name; OpenRouter (on-tape) takes the model cell.
- **Exceptions:** Stronger models may ignore “use only Tavily” and call extra tools.
- **Action:** Steal the split; do not put hive prompts in n8n-cloud.
- **Confidence:** SOURCE.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE

### Intermediate steps are the log
- **Claim:** Without “return intermediate steps,” you only get the final sentence. With it, you see think/tool/in/out/tokens and can pattern-guardrail.
- **Evidence:** “normally your agents won’t output all of this information… once I did, it was a game changer.”
- **Conditions:** Code node cleans tokens; error workflow is a second table.
- **Exceptions:** Duplicate test rows (he ran lunch twice).
- **Action:** Log actions + errors in one place; hive does not auto- Slack.
- **Confidence:** SOURCE.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE

### One-variable evals
- **Claim:** Evals only teach if run 33 remembers model/prompt/tools and you change one thing.
- **Evidence:** “only change one variable. Isolate one variable so you know how it actually affects the workflow.”
- **Conditions:** Expected vs actual → correctness score; track avg tokens/time.
- **Exceptions:** Score 5 then 4 on similar Tesla facts — the number is a similarity, not truth.
- **Action:** `golden-test-loop`; do not treat 5 as FACT.
- **Confidence:** SOURCE.
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Patterns are beautiful (good or an edge to rail). Table is a frontend for scared clients. Sheets dropdowns beat typed model IDs. Dentists as a research topic is a demo, not a hunt.

## D. Procedures
1. Models/prompts table; filter on workflow key; map cells into agent/OpenRouter.
2. Optional daily sync table↔Sheets (Sheets as the typed UI).
3. Return intermediate steps → write actions/tokens.
4. Error workflow → error table (+ notify HITL).
5. Eval table; one knob per run.
Avoid: n8n-cloud; Plus; auto-calendar; dentist hunt; 42% as FACT.

## E. Examples
**Situation:** Swap Sonnet + Tavily in the table, re-run.  
**Action:** Agent calls Tavily and still Perplexity.  
**Lesson:** The cell is a suggestion to an autonomous model.

**Situation:** “Lunch with Michael Scott.”  
**Action:** Think → contact → calendar; row appears.  
**Lesson:** The log is the product of the hidden toggle.

## F. Decision Rules
- If a client must not open the canvas → table (or Sheets dropdown) is the UI.
- If you share a template → do not paste the real system prompt into the export.
- If you cannot name what changed in run 33 → the eval is theater.
- If 200 Plus / 42% from this tape → UNVERIFIED.

## G. Contrarian
Native tables are a bad frontend (no pills); he still uses them as the in-instance store and Sheets as the picker.

## H. Assumptions
200 Plus, Tesla 42%, token counts UNVERIFIED. On-tape n8n / OpenRouter / Telegram. Clients parked.

## I. Questions
What does the media-agent actions blob look like raw? Visual of the eval 5 vs 4? Sync cron on screen?

## J. Connections
- SYSTEM SYNTHESIS → `QCjMBOEhpLE` (tables 101).
- SYSTEM SYNTHESIS → `jBanaNBY-sM` (Ultimate Media Agent).
- SYSTEM SYNTHESIS → `golden-test-loop`; `oWdJMJp2HgM` (guardrails from patterns).

## K. Future-Use
“Return intermediate steps” as a hidden-toggle card. Unassigned.

## Steal / Operate-never

### Machine: table-driven prompt, log the steps, one-knob eval
- **Epistemic:** SOURCE
- **Workflow / loop:** row per agent → run → intermediate-step log → pattern → one-variable eval → maybe a rail
- **Questions / signals:** Can the client edit without breaking the graph? What did run 33 change?
- **Qualify / frame / objections:** Sharing the JSON ≠ sharing the IP if the prompt lives in the table
- **Procedure:** Sheets dropdown if typos matter; error table + HITL notify
- **Example that proves it:** Tavily swap; Michael Scott lunch log; Tesla 5 then 4
- **Why it works:** Behavior, memory, and score live next to the agent, not in a buried node
- **Conditions / exceptions:** Strong models ignore “only this tool”
- **Operate-never payload:** n8n-cloud; auto-invite calendar; dentist hunt; 42% as FACT
- **Hive run:** `golden-test-loop`; `ask-principal`
- **Source:** `lcNN3X9gXls` @ UNKNOWN

### Operate-never
- Install n8n-cloud. Join Plus. Auto-create calendar events.
- New hunt. Quote 42% / 200 as FACT.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the **models-and-prompts grid** is the plate (a bible the client can touch). Do not export hive system prompts inside a shared JSON. HITL. Clients parked.
