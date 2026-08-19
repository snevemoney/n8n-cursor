# Big Boss — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map

Long (PACKET: 15:17, 3,791 words, captions `en-orig`). Timestamp UNKNOWN on `full.txt` (no VTT in the take). Visual-only gaps: n8n data-table UI, models-and-prompts rows, Telegram/calendar demo, eval scores, and Google Sheet dropdowns are described, not seen. Speaker: Nate Herk. Points at a prior data-tables video.

Beats, in order:

1. Hook: n8n data tables store data inside n8n so agents need not call Sheets / Airtable.
2. **Hack 1 — models and prompts in a table.** Research agent: before the agent, a data-table node matches `workflow = research agent`. Columns: workflow, chat model, user prompt, system prompt. Client can change model/prompt without opening the canvas (“worried they might break something”). Share the workflow; the prompt stays in the table (IP). Demo: dentists research; swap Sonnet + Tavily vs Perplexity via Open Router. Stronger model also called Perplexity on its own (“power of autonomous agents”).
3. Same pattern on a newsletter system: table drives Tavily topic, planning + section-writer models, editor system prompt. Frontend controls behavior without opening the graph. Prompts are IP and a backup.
4. **Bonus — two-way sync.** n8n-primary: daily get rows → clear Sheet → rewrite. Sheet-primary: delete n8n rows → get Sheet → write back. Limitation: n8n tables are a weak frontend (no copy-paste, four types, no dropdowns). He hardcoded model dropdowns in Sheets to stop misspelling.
5. **Hack 2 — agent logs / actions.** Production needs fail rate, why, and what worked; patterns → tweak or guardrail. Ultimate Media Agent (sibling tape): timestamp, workflow, input, output, actions, tokens. Replace Sheet nodes with a data-table node. Toggle **return intermediate steps**. Demo: Telegram “lunch with Michael Scott at 3pm” → think → contact agent → think → calendar agent. Calendar shows the event + email. Log shows each tool in/out and tokens. Code node cleans token counts.
6. **Bonus — error logger.** Error workflow → data table (date, time, message, node, **which workflow**). Optional Slack/Telegram. Settings → error workflow. Context vars: now, today, execution ID, workflow ID/name.
7. **Hack 3 (he says fourth or fifth) — evals.** Dataset: input, expected, actual, score. Hook the table to a RAG agent. Demo: Tesla operating income −42%; score 5 then 4. Metrics: tokens, time, correctness. **Change only one variable per run** (model or prompt or tools). Optimize speed / cost / quality.
8. Close: Plus community **200+** members **UNVERIFIED**; courses (Agent Zero, 10 hours to 10 seconds, one-person AI agency).

Off-topic / not skipped: dentists as the research industry; Michael Scott as the calendar prop; tagging many prior videos.

## B. Atomic Knowledge

### Prompts and models live outside the graph
- **Claim:** Store chat model, user prompt, and system prompt in a table keyed by workflow. The canvas reads variables. A non-builder can change behavior without opening nodes. Sharing the graph does not leak the prompt IP.
- **Reasoning:** IP of a template lives in the system prompt. Clients fear breaking the canvas. One frontend beats digging through workflows.
- **Mechanism:** Filter row by workflow name → drag variables into agent / Open Router / Tavily.
- **Evidence:** Dentists research swap (Sonnet + Tavily); newsletter topic + planner/writer/editor rows.
- **Conditions:** Row key must be exact. Exceptions: n8n table UI is a bad frontend (typos, no dropdowns) — he syncs Sheets for that.
- **Action:** Hive analog is a visible job card / skill, not a client-editable prod table. Do not give a parked client a prompt tab.
- **Confidence:** high for the split; medium that hiding the prompt is a product.
- **Source:** `lcNN3X9gXls` @ UNKNOWN — “control the system prompts and the chat models… without having to get into the workflow”
- **Epistemic:** SOURCE

### Log intermediate steps or you cannot tweak
- **Claim:** Production logging (input, output, actions, tokens, errors) is how you see fail/success patterns and build guardrails.
- **Reasoning:** Agents do not emit the trail unless you turn on intermediate steps. Patterns are “beautiful” because they are either a keep or a fence.
- **Mechanism:** Return intermediate steps → write table → optional error workflow with workflow name + execution id.
- **Evidence:** Media-agent think → contact → calendar; yesterday’s duplicate test row. Error sheet he already had.
- **Conditions:** Works when someone reads the log. Exceptions: he still uses a code node to clean tokens; the toggle is “hidden.”
- **Action:** Watchdog wants the trail, not the sprite. Log is a review surface, not auto-send.
- **Confidence:** high
- **Source:** `lcNN3X9gXls` @ UNKNOWN — “return intermediate steps” / “records of everything the agent's doing”
- **Epistemic:** SOURCE

### Evals: one variable per run
- **Claim:** Run datasets (input / expected / actual / score) over time. Each new run, change **only one** variable (model, prompt, or tools) so you know what moved the score.
- **Reasoning:** “What did I do in run 33?” without a log of the knob is superstition.
- **Mechanism:** Eval table → agent → correctness score → write back. Watch average tokens, time, score.
- **Evidence:** Tesla −42% match scores 5 then 4. He names speed / cost / quality as the three to optimize.
- **Conditions:** Expected answers must exist. Exceptions: RAG demo is not a client delivery.
- **Action:** `golden-test-loop`. Isolate the knob. Do not “upgrade everything” and call it better.
- **Confidence:** high
- **Source:** `lcNN3X9gXls` @ UNKNOWN — “every single time you do another run, only change one variable”
- **Epistemic:** SOURCE

### Autonomous extra tool use is a smell, not a win
- **Claim:** After he swapped to Sonnet and Tavily, the agent also called Perplexity because it “decided that it needs to do more research.” He calls that the power of autonomous agents.
- **Reasoning:** A stronger model may volunteer tools you did not name in the new prompt.
- **Mechanism:** Open Router + multiple tools attached.
- **Evidence:** He notices Perplexity still fired after the Tavily swap.
- **Conditions:** Useful only if a human reviews the extra call. Exceptions: tape treats it as a flex.
- **Action:** Volunteer tool use stays operate-never as ship. Same smell as unsupervised extra video on `IlNwjnIzrOo`.
- **Confidence:** high that it happened; low that it is net-positive.
- **Source:** `lcNN3X9gXls` @ UNKNOWN — “it decided that it needs to do more research using its other tools”
- **Epistemic:** SOURCE

## C. Mental Models

- **Table is the control plane; canvas is the engine.** Non-builders touch the table. **SOURCE**
- **Prompt is the IP.** Share the graph, keep the text. **SOURCE**
- **Patterns in logs are the product.** Fail patterns become guardrails; win patterns become keeps. **SOURCE**
- **One knob per experiment.** Otherwise you cannot attribute. **SOURCE**
- **Sheets as a better frontend** when the native table cannot dropdown. **SOURCE**
- **Dentists / Michael Scott / media agent are props.** Not ICPs. **INFERENCE**
- **Client-editable prod prompts are a leak we will not operate.** Job card is the analog. **SYSTEM SYNTHESIS**

## D. Procedures

1. Name the workflow row (one key per agent/job).
2. Put model + system prompt (+ user prompt if static) in a visible place Evens can read — card/skill, not a client tab.
3. Graph reads variables; humans do not hunt nodes for the sentence.
4. Turn on a trail: intermediate actions + tokens + errors, tagged with workflow name.
5. Someone **reads** the trail on a cadence. Patterns → rewrite SOP or add a fence.
6. Eval: fixed dataset, expected answers, score written back.
7. Next run: change one knob only. Record which knob.
8. Checkable stop: you can answer “what changed in run N?”
9. Do not treat volunteer extra-tool calls as the deliverable.

**Qualify / frame:** n8n feature tape + Plus close. Dentists are a cell value.
**Objections:** “Give the client the table” — parked clients do not get prod prompts. “Autonomy found more research” — that is an unreviewed extra.
**Avoid:** n8n data tables as hive OS; Telegram media army; quoting 200 members as FACT.
**When to change:** if the key is misspelled, the wrong brain loads — that is why he wanted dropdowns.

## E. Examples

**Situation:** Client must not open the canvas.  
**Action:** They edit the models-and-prompts row; workflow pulls Sonnet + Tavily.  
**Reasoning:** Fear of breaking nodes.  
**Outcome:** Behavior changes without a graph edit. Extra Perplexity call still happens.  
**Lesson:** Control plane works; autonomy still volunteers. Implicit rule: review extras.

**Situation:** “Lunch with Michael Scott at 3pm” in Telegram.  
**Action:** Think → contact → think → calendar; log every hop; event appears with email.  
**Reasoning:** Intermediate steps make the trail.  
**Outcome:** Calendar + a row you can audit.  
**Lesson:** Done includes the log, not just the event. Implicit rule: we do not operate Telegram send.

**Situation:** RAG eval, Tesla −42%.  
**Action:** Expected vs actual → score 5, then 4 on the next row.  
**Reasoning:** Dataset + one scorer.  
**Outcome:** A table of runs. He insists one variable per run.  
**Lesson:** Score without a knob log is theater. Implicit rule: isolate.

## F. Decision Rules

- If a human must change model/prompt → change a named row/card, not a buried node.
- If the system is in production → log actions + errors or it is not in production.
- If you run an eval → one knob.
- If the agent fires an unrequested tool → do not ship that hop.
- If the native table cannot prevent typos → do not pretend it is a client UI.
- Optimize: visible prompt + trail + one-knob eval. Refuse: client-editable prod, n8n-as-OS, dentist hunt.

## G. Contrarian

- Against “the workflow file is the product”: the prompt table is the product (his view).
- Against “Sheets is legacy”: he still uses Sheets as the better frontend and the old logger.
- Against “autonomy is always a win”: he smiles at the extra Perplexity call; we treat it as a smell.
- Field assumes more nodes = smarter. He moves intelligence into rows.

## H. Assumptions

**His:** n8n tables replace Sheets/Airtable; clients should edit rows; hiding prompts is a feature; Plus courses are the close; 200 members is social proof.

**Ours:** Captions complete enough (3,791 words). UI / scores / calendar **UNVERIFIED**. Member count **UNVERIFIED**. Domain-specific: n8n creator ops. Dentists ≠ `local-clinic` hunt. Cursor + Grok; his n8n/Telegram/Open Router stay on tape.

**Falsifiers:** Client edits a row and breaks prod. Logs nobody reads. One-knob eval still does not predict live quality. Intermediate-steps toggle vanishes.

**Disagreement (keep labeled):** We will not operate n8n data tables or a client prompt UI. The **control-plane**, **trail**, and **one-knob eval** machines are still stolen. **SYSTEM SYNTHESIS**

## I. Questions

- Who reads the media-agent log, and on what cadence?
- Did the extra Perplexity call improve the dentists report? (Not judged.)
- What is the sibling Ultimate Media Agent id? Confirm before pairing (`IlNwjnIzrOo` / `jBanaNBY-sM` are candidates — do not invent).
- Error workflow: does it page a human or only write a row?

## J. Connections

- **SYSTEM SYNTHESIS** → `agent-job-card` / `agent-as-hire` (prompt lives in the card).
- **SYSTEM SYNTHESIS** → `golden-test-loop` (one variable; keep only what passes).
- **SYSTEM SYNTHESIS** → `wiki-ingest` (error/action log as pages, not a Sheet).
- **SYSTEM SYNTHESIS** → `ask-principal` (Telegram / calendar / send stay HITL).
- **SYSTEM SYNTHESIS** → `IlNwjnIzrOo` (named artifact + volunteer extra work).
- Do not unpark `local-clinic` because the user-prompt cell said dentists.

## K. Future-Use

- Intermediate-step trail as a Watchdog review format (unassigned).
- Workflow-name on every error row as a Librarian provenance field (unassigned).
- Sheets-dropdown vs free-text as a HITL “don’t let them typo the model” note (unassigned).

## Steal / Operate-never

### Machine: Visible prompt row → action trail → one-knob eval
- **Epistemic:** SOURCE (three hacks) / SYSTEM SYNTHESIS (hive mapping)
- **Workflow / loop:** trigger (agent job exists) → put model+prompt in a named card → graph/desk reads the card → log intermediate actions + errors → human reads patterns → eval dataset → change one knob → keep only if score/trail says so.
- **Questions / signals:** “Where is the system prompt?” “What did run N change?” “Which extra tool fired?”
- **Qualify / frame / objections:** n8n hacks tape. Client-editable table is his frontend, not ours. Objection: share-without-prompt-IP — we do not sell hidden-prompt templates.
- **Procedure:** D steps 1–8. Checkable stops: (1) prompt visible to Evens, (2) trail exists, (3) run N has one named knob.
- **Example that proves it:** Swap Tavily in the row → agent uses Tavily and also volunteers Perplexity. Lesson: control plane works; autonomy still needs a reject.
- **Why it works:** You cannot manage what is buried in nodes or unlogged. Conditions: someone reads. Exceptions: native table is a bad UI; we will not give it to a client.
- **Conditions / exceptions:** Cursor + Grok only. No n8n/Telegram/Skool. Clients parked.
- **Operate-never payload:** Client-editable prod prompts; media-agent Telegram; dentist hunt; tape $ / 200 members as FACT.
- **Hive run (existing skills only):** `agent-job-card` · `agent-as-hire` · `golden-test-loop` · `wiki-ingest` · `ask-principal` · `slice-build`.
- **Source:** `lcNN3X9gXls` @ UNKNOWN

**Operate-never (this desk will not operate — still walked the tape):**

- n8n data tables / Telegram media army / Open Router as hive OS
- Client-editable prod prompts / hide-IP-in-a-table as a SKU
- Install Claude / ChatGPT / Gemini / Codex / Coda / Vapi / Abacus / Skool
- Quote 200 members / Plus as FACT
- New `icp_id` (dentists) / unpark Normand / rotate hunt
- Grok Bot `sendPrompt` · send / pay / deploy / book / publish
- Merge `LESSONS-FROM-TAPE.md` · write packet `LEARNED.md` (Researcher owns that)

## L. Role-Specific Applications

I manage; I do not hand a parked client a prompt table.

- **Done** on an agent slice: named prompt in a card + a trail + one-knob eval. A swapped model with an unreviewed extra tool is not done.
- **Delegate without being asked:** Watchdog reads the trail; Forge isolates the knob; Librarian files the prompt; I do not add a data-table desk.
- **Skeptical review:** “Three hidden hacks” is a YouTube bundle. I will not approve a dentist research agent or a Telegram calendar send.
- **One system this take:** one visible prompt row for one desk. Not three hacks.
- Live hunt stays parked.
