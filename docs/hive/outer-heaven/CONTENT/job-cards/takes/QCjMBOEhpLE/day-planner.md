# Day Planner — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate: n8n **Data Tables** (pre-GA; update to see tab). Beats: sales agent + calculator → Bluetooth speaker **$546** (UNVERIFIED) from **in-instance** table (no API); create table, types string/number/bool/date, created/updated defaults; import from Google Sheets via native node (get/insert/update/upsert/delete, **no credential**); delete-all does **not** reset IDs; map columns, types must match; Gmail trigger → **filter get-rows by from-email** → notes into an agent that **writes a reply** (personalized, cautious-on-commit); don’t dump hundreds of rows (tokens + $ + hallucinate); same filter pattern as Sheets but local; sales Qs: date query / product / ID average — date stored as **string** because sheet hyphens; 400-row write: Sheets ~2280ms vs table ~2511ms (similar); 60/20/2 rows: table **300 / 97 / 11ms** vs Sheets ~1.6–1.7s floor; Sheets can rate-limit, tables “internal”; Skool JSON + Plus. Caption-only. Timestamp UNKNOWN.

## B. Atomic Knowledge
### Filter the row before the model; type-match; small writes stay local
- **Claim:** A growing table dumped into the model is a token/hallucination bill; a **condition** (email = trigger, date = X) is the product; types must match or insert refuses; tiny writes are why local tables beat Sheets.
- **Reasoning:** Native = no internet hop; 400-row bulk can tie or lose.
- **Mechanism:** Table → typed columns → get-rows **with filter** → then (maybe) a model.
- **Evidence:** “otherwise you’re going to be passing in hundreds… adding more tokens… more expensive.”
- **Conditions:** n8n instance with Data Tables.
- **Exceptions:** Gmail → draft is still a send footgun if the next node sends.
- **Action:** Steal filter-before-model + type-match. Do not wire Gmail send. Do not n8n-cloud.
- **Confidence:** high as the pattern; ms / $546 UNVERIFIED.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** demonstrated (speech)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 400-row hypothesis flipped once
- **Speech ≠ behavior:** “always faster” vs 400-row tie

## C. Mental Models
Sheets-shaped verbs, local store. Agent tools = the same filters with the model filling the value. Priority: one row, not the dump. Uncertainty: GA timing, Plus 200 members.

## D. Procedures
1. Put the fact table in-instance if the hop is the pain.
2. Type the columns; don’t insert a mismatch.
3. Every read: a **condition**, not “all rows.”
4. Tell the agent the valid names + date format.
5. Bench small vs bulk before claiming faster.
Avoid: Gmail auto-send; dump-all-rows; n8n Plus; quote $546 as FACT.

## E. Examples
**Email lookup:** Situation → inbound “I need help.” Action → filter contacts by from-email, feed notes, draft. Reasoning → one row. Outcome → a personalized draft. Lesson → steal the filter; never the send.

**2-row vs 400:** Situation → speed myth. Action → time both. Reasoning → Sheets has a ~1.6s floor. Outcome → tiny writes instant; 400 comparable. Lesson → steal the bench, not “always faster.”

## F. Decision Rules
- IF the next step is “all rows into the prompt” → fail.
- IF types don’t match → insert will refuse (his).
- IF the workflow can send Gmail → HITL / never.
- IF the claim is “always faster than Sheets” → check bulk.

## G. Contrarian
He expected tables always faster; 400-row run disagreed. He kept the tape. Good.

## H. Assumptions
Theirs: no rate-limit internally. Ours: we don’t run n8n cloud. Falsifier: a table that still dumps. Survivorship: 20-row toy sales.

## I. Questions
GA version number? Same “question→method” as `XTBWVVcF3Pk`?

## J. Connections
- SYSTEM SYNTHESIS → `XTBWVVcF3Pk` · `send-removed` · `lokbsA5VXOk` (don’t dump).

## K. Future-Use
Filter-before-model. Type-match. Unassigned Data Tables GA.

## Steal / Operate-never

### Machine: typed local table → filter one row → then maybe a model; never dump; never send
- **Epistemic:** SOURCE
- **Workflow / loop:** store → type columns → get-rows with a condition → model sees one row → draft only
- **Questions / signals:** All rows or a filter? Can it send? Did we bench bulk?
- **Qualify / frame / objections:** “Native so it’s magic” is the fail. Email=from is the pass.
- **Procedure:** No Gmail send. No n8n-cloud. No Plus.
- **Example that proves it:** Situation → help email. Action → filter + notes. Reasoning → tokens. Outcome → draft. Lesson → steal the filter.
- **Why it works:** One row is checkable; a dump is a bill and a hallucination.
- **Conditions / exceptions:** ms / $546 UNVERIFIED.
- **Operate-never payload:** Auto-reply; n8n-cloud; Plus; quote $546 as FACT.
- **Hive run (existing skills only):** `send-removed` · `coverage-loop`.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

### Operate-never
- Gmail send / n8n-cloud / Plus.
- Send / pay / deploy / book / publish.

## L. Role-Specific Applications
**One next:** `coverage-loop` score this packet as filter-before-model (no Gmail send). Clients parked.
