# Librarian — lcNN3X9gXls
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/lcNN3X9gXls/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** 3 Hidden Data Table Hacks for Smarter AI Agents
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3791 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Native n8n Data Tables so agents skip Sheets/Airtable hops. Three “secret” hacks. Prior tables video assumed.
2. **Hack 1 — models + prompts table:** research agent matches `workflow = research agent`; row holds chat model, user prompt, system prompt. Client edits the table, not the canvas. Demo industry: **dentists**. Share a template without the system-prompt IP (variable, not the text). OpenRouter model is a variable. Live swap: Claude 3.7 + Tavily instead of Perplexity — 3.7 also called Perplexity (he calls that autonomy). Same pattern on a newsletter: planning vs editor rows; user prompt can stay dynamic from Tavily; models (GPT-5 mini) shared. Bonus: daily sync n8n↔Sheets (n8n primary = dump/clear/rewrite Sheets; Sheets primary = delete n8n rows, reload). Tables are a weak frontend (no copy-paste, four types, no dropdowns) — Sheets dropdowns prevent model-name typos.
3. **Hack 2 — action + error logs:** production needs fail/why/what-worked so you can tweak. Patterns → keep or **guardrail**. Media-agent Sheets columns (timestamp, workflow, input, output, actions, tokens) → same columns in a table. Agent option **return intermediate steps** (Add option). Telegram: “lunch with Michael Scott 3pm” → think → contact agent → think → calendar; invited real email. Code node cleans tokens. Error logger: date/time/message/node + workflow name; settings → error workflow; context vars (`now`, execution ID, workflow ID/name). Slack/Telegram notify optional.
4. **Hack 3/4/5 — evals:** dataset of input + expected; write actual + score. Tesla operating income **declined 42%** both sides, score **5**, then a **4** (UNVERIFIED). Isolate **one** variable per run (model/prompt/tools). Metrics: avg tokens, time, correctness — optimize speed/cost/quality.
5. Plus CTA: 200+ members, three courses (UNVERIFIED).
Gap: graphs, table UI. Timestamp UNKNOWN. n8n/Sheets/Plus on-tape. Complements `QCjMBOEhpLE`.

## B. Atomic Knowledge

### Prompts and models live in one keyed table, not on the canvas
- **Claim:** Match on workflow name; drag variables into the agent. Hide the system prompt when you share a template. Client-safe frontend = the table (or a Sheets dropdown sync).
- **Reasoning:** IP lives in the prompt; canvas edits scare clients; one place to change industry/model/tool.
- **Mechanism:** Data Table get + filter → OpenRouter model + system/user vars.
- **Evidence:** dentists research; Tavily swap; newsletter planning vs editor.
- **Conditions:** n8n tables lack dropdowns — Sheets sync if humans type model IDs.
- **Exceptions:** User prompt may stay dynamic from the prior node.
- **Action:** File keyed-prompt table + IP-hide. Do not make n8n the hive wiki. Dentists parked.
- **Confidence:** high as a config-pointer machine
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 3.7 also hit Perplexity after Tavily swap
- **Speech ≠ behavior:** “secret hacks” vs prior tables video + Plus CTA

### Intermediate-step logs → patterns → one-variable evals
- **Claim:** Return intermediate steps, persist actions/tokens, log errors with workflow ID. Evals write expected vs actual. Change one lever per run.
- **Reasoning:** You cannot tweak what you cannot see; “run 33” is useless without the variable you changed.
- **Mechanism:** intermediate steps → table; error workflow; eval dataset + correctness score.
- **Evidence:** Michael Scott lunch path; Tesla 42% score 5 then 4.
- **Conditions:** 42% / scores UNVERIFIED.
- **Exceptions:** None named.
- **Action:** File log→pattern→guardrail + isolate-one-variable. Do not self-grade live send.
- **Confidence:** high
- **Source:** `lcNN3X9gXls` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** chat-model error day (ignore those rows)
- **Speech ≠ behavior:** “third hack” vs “fourth or fifth”

## C. Mental Models
Config as data. IP in the prompt. Patterns are either keep or guardrail. Isolate one variable. Tables are storage, not a frontend.

## D. Procedures
1. Key rows by workflow name; never hardcode model/prompt on the canvas if a human will change them.
2. Share templates with variables, not the system-prompt text.
3. Sync to Sheets if you need dropdowns.
4. Toggle return intermediate steps; write actions + tokens; add an error workflow with workflow ID.
5. Eval: input + expected → actual + score; one change per run.
Avoid: n8n-cloud as hive; dentists as ICP; 42% as FACT; Plus as room.

## E. Examples
**Tavily swap:** Situation — one table cell. Action — change model + tool name. Outcome — Tavily fires; 3.7 also called Perplexity. Lesson — autonomy can ignore your single-tool intent.

**Michael Scott lunch:** Situation — Telegram. Action — think/contact/think/calendar. Outcome — event + email. Lesson — intermediate steps are the log.

## F. Decision Rules
- IF a client must not open the canvas → table or Sheets frontend.
- IF you share a template → hide the system prompt.
- IF you cannot name the one variable you changed → the eval is noise.
- Refuse: n8n as wiki; Plus; dentists hunt; 42% as FACT.

## G. Contrarian
Against Sheets-as-the-only-memory. Against “just add a vector store” when the leak is config/logging/eval.

## H. Assumptions
Complements `QCjMBOEhpLE` (native tables). Caption-only. Plus 200 UNVERIFIED.

## I. Questions
Did the daily sync ever collide? Who owns the error Slack?

## J. Connections
SYSTEM SYNTHESIS → `QCjMBOEhpLE`; `oWdJMJp2HgM` (fail is a path); golden-test-loop.

## K. Future-Use
Keyed-config table + intermediate-step log + one-variable eval as atoms.

## Steal / Operate-never

### Machine: keyed config table + intermediate logs + one-variable eval
- **Epistemic:** SOURCE
- **Workflow / loop:** key by workflow → humans edit the table → persist intermediate steps + errors → eval expected/actual → checkable stop = a named variable and a score you can replay
- **Questions / signals:** Who edits prompts? Can they typo the model? What failed last week?
- **Qualify / frame / objections:** IP lives in the prompt; tables are a weak UI.
- **Procedure:** D above.
- **Example that proves it:** dentists/Tavily swap; Michael Scott path; Tesla 42% write-back.
- **Why it works:** Config, memory, and grades are data, not canvas archaeology.
- **Conditions / exceptions:** 42% UNVERIFIED; dropdowns need Sheets.
- **Operate-never payload:** n8n-cloud; dentists ICP; 42% as FACT; Plus; live send from a client-editable table.
- **Hive run:** Job cards / files as the keyed table. Do not install n8n tables as the wiki.
- **Source:** `lcNN3X9gXls` @ UNKNOWN

### Operate-never
- n8n-cloud as hive. Client-editable table that can send. Dentists as ICP. Quote 42% as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the third hack (eval write-back) next to `QCjMBOEhpLE`. Do not make n8n the wiki.
