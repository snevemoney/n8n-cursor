# Career Strategist — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Video (14:32, 3372 words). Caption ingest. Beats in order: (1) sales agent + native n8n data tables: Bluetooth speaker revenue $546 via product query + calculator — no internet (UNVERIFIED demo) (2) pre-GA; update n8n; types string/number/boolean/date; created/updated columns (3) import from Google Sheets via data-table node (insert/get/update/upsert/delete); no credential — in-instance; types must match; deleted IDs do not reuse (starts at 21) (4) Gmail → filter contacts by from-email → notes into agent → personalized reply (notes from ChatGPT about himself) (5) filter or you dump hundreds of rows = tokens, cost, hallucination (6) tools can be the table ops; deterministic path shown first (7) sales sheet → table → date/product/id tools + calculator; Sep 15 qty 10; headphones 12; BS002 avg 4/day (8) system prompt: valid names per field so the model fills filters correctly; date stored as string because the sheet had hyphens (9) free JSON + sheet copies in Skool. Visual/click: UNKNOWN. Rest of tape is more of the same prompt/tool listing.

## B. Atomic Knowledge

### Filter the row before the model, or you pay for the dump
- **Claim:** As the table grows, pull the matching row (email = from, date = X, product = Y) then let the model write. Dumping hundreds/thousands of rows is tokens, cost, and more hallucination.
- **Reasoning:** The table is in-process; the model is not a database.
- **Mechanism:** Get-rows + condition; or tools the agent chooses with a calculator for math.
- **Evidence:** “otherwise, you’re going to be passing in hundreds, potentially thousands of rows into the AI… more expensive.” @ UNKNOWN
- **Conditions:** A key you can filter on.
- **Exceptions:** He also shows tool-mode where the agent picks the query.
- **Action:** Design the filter (or the tool that is the filter) before the prompt.
- **Confidence:** high as hygiene
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none

### Native store is not Sheets — types and IDs bite
- **Claim:** No API credential because it is in n8n. Column types must match or insert fails. IDs keep counting after delete. Dates that look like dates may be strings if the sheet had hyphens — tell the agent the format.
- **Reasoning:** Harness details are the job.
- **Mechanism:** Map columns; list valid names in the system prompt.
- **Evidence:** “you just have to make sure that the data types match up. Otherwise it won’t let you insert” @ UNKNOWN
- **Conditions:** Import or agent-written filters.
- **Exceptions:** Manual row entry also works.
- **Action:** Match types; document valid keys; do not assume ID reset.
- **Confidence:** high as demo
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none

## C. Mental Models
In-instance data is a new tab, not a personality. Calculator for sums, not the LLM. Personalization is a notes field, not “AI knows you.” Pre-GA features need a version update. Valid-name lists keep tools from inventing products.

## D. Procedures
1. Update n8n until Data Tables exists.
2. Create table; set types; import or type rows.
3. For a reply: trigger → get row where key = trigger key → pass notes only.
4. For Q&A: named query tools + calculator; list legal values in the prompt.
5. Refresh the table UI after writes.
6. Do not send the reply from the demo without HITL (he executes the writer, not a career send).

Questions: What is the filter key? Type match? Legal values? Signals: whole-table dump. Qualify: data already in the instance.

## E. Examples
**Situation:** Inbound “I need help” from a known email.  
**Action:** Filter contact; notes say founder, detailed, cautious; draft a no-rush reply.  
**Reasoning:** Notes are the personalization.  
**Outcome:** Spoken draft.  
**Lesson:** One row, not the book.

**Situation:** “Average BS002 per day?”  
**Action:** Product-id tool + calculator 12/3=4.  
**Reasoning:** Math outside the prose model.  
**Outcome:** 4, he says correct.  
**Lesson:** Tool + calc.

## F. Decision Rules
- IF the table can be filtered → do not dump it.
- IF insert fails → check types.
- IF the agent must fill a filter → give legal values and formats.
- IF you need a sum → calculator, not “just add it up in prose.”

## G. Contrarian
Rejects “the agent should see the whole database to be smart.”

## H. Assumptions
**Theirs:** $546 / 10 / 12 / 4 are correct; feature will GA. **Ours:** Demo $ UNVERIFIED. On-tape n8n/Sheets stay on-tape. Falsifier: filter returns the wrong Nate. Speech≠behavior: “permanently save” vs tutorial deletes.

## I. Questions
- What is the size limit of a native table?
- Who else can see instance tables?
- Did he ever send the personalized email?

## J. Connections
- SYSTEM SYNTHESIS → `lcNN3X9gXls` (data-table hacks sister).
- SYSTEM SYNTHESIS → `oWdJMJp2HgM` (do not send raw PII into the model — here, do not send the whole table).
- SYSTEM SYNTHESIS → `send-removed`.

## K. Future-Use
Unassigned: filter-before-model as a token/career hygiene rule. Valid-value lists in standing files. Not a hunt. Not an n8n data-table migrate.

## Steal / Operate-never

### Machine: one-row filter + calc, not a table dump
- **Epistemic:** SOURCE + SYSTEM SYNTHESIS
- **Workflow / loop:** need a fact or a personalization → identify the key → get that row (or a named query tool) → math in a calculator → model writes from the slice
- **Questions / signals:** Whole table in the prompt? Type mismatch? Legal names listed?
- **Qualify / frame / objections:** Native store ≠ smarter agent. Objection to “just import Sheets”: types and IDs.
- **Procedure:** Map columns. Document formats. HITL before any send.
- **Example that proves it:** Email notes from one contact; BS002 average via calc (E).
- **Why it works:** Dump is cost and hallucination; the table is the source of truth (B/C).
- **Conditions / exceptions:** Pre-GA UI. Visual UNKNOWN.
- **Operate-never payload:** Migrating hive data into n8n; sending the Gmail; quoting $546 as FACT.
- **Hive run (existing skills only):** `context-docs` · `send-removed` · `golden-test-loop`
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

### Operate-never
- Install n8n / migrate Sheets. Cursor + Grok only.
- Send the personalized email.
- Unpark clients / new `icp_id`.
- Auto-write `SKILL.md`. Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
Employment still covers baseline. The career habit is “give the model the matching row, not the warehouse.” Gym valid-value lists. Do not stand up n8n data tables as a hive OS.
