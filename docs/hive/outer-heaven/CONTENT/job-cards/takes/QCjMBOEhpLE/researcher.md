# Researcher — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Caption-only (`full.txt`, ~3372 words). Title: n8n native data tables. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Pre-GA recording — “update to latest.” Beats: (1) Sales agent + native table tools: “revenue from Bluetooth speaker” → product-name query + calculator → **$546** (UNVERIFIED). Data lives in n8n **Data tables** tab; no internet/API. Free workflow + two datasets via Skool. (2) Create table: default `created at` / `updated at`; add columns typed **string / number / boolean / date**. Manual rows or import. (3) Data Tables **node**: persist across executions; ops like Sheets — delete/get/insert/update/upsert. No credential (in-instance). Map columns; **types must match** or insert fails. Delete-all does **not** reset IDs (empty looks reset; next write starts at 21). (4) Contacts: Sheets → table; Gmail trigger → **get rows + filter email = from** → notes into agent user prompt (subject/body/name/notes) → personalized reply. Deterministic lookup so you don’t dump hundreds/thousands of rows (tokens, hallucination, $). Same ops can be **agent tools**. Notes were ChatGPT-generated about himself. (5) Sales: 20 rows / 3 products / 3 days. Agent tools: date query, product-name, product-ID + calculator. Qs: units on Sep 15 → 10; wireless headphones → 12; avg BS002 per day → 4. Date column stored as **string** because Sheets hyphens. System prompt: role + which tool + **valid names/IDs + date format**. (6) Speed: code node 1–400. Sheets write 400 ≈ **2280 ms** vs table **2511 ms** (table slower — surprises him). 60: Sheets ~1700 vs table ~300. 20: ~1700 vs ~97. 2: ~1600 vs **11**. Hypothesis: Sheets has ~1.6–1.7s floor; small writes table ≈ instant; bulk hundreds comparable / table may lose. No Sheets **rate limits** / waits/retries when internal. (7) Plus “over 200” / courses UNVERIFIED. Sibling `lcNN3X9gXls` (table hacks) — do not flatten.

## B. Atomic Knowledge

### In-instance table = Sheets verbs without the wire
- **Claim:** Native tables persist across executions; CRUD/upsert like Sheets; no credential because it never leaves n8n.
- **Reasoning:** Faster small writes, no API rate limit, agent can query locally.
- **Mechanism:** Data tables tab + node; type-matched columns; IDs monotonic.
- **Evidence:** “you’re not going to the internet.”
- **Conditions:** Version with the tab (pre-rollout tape). Types must match.
- **Exceptions:** 400-row write was **slower** than Sheets once. Keep that fail.
- **Action:** Steal in-instance store for small/hot data. Do not migrate hive to n8n-cloud.
- **Confidence:** high as feature tour; ms UNVERIFIED.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 400-row table slower
- **Speech ≠ behavior:** “always faster” hypothesis died on first 400.

### Filter before the model
- **Claim:** Get-rows with a condition (email = trigger from) so the agent sees one contact’s notes, not the whole table. Dumping hundreds/thousands = tokens, $ , more hallucination.
- **Reasoning:** Deterministic narrow, then LLM write.
- **Mechanism:** Gmail → filter get → notes in user prompt → “friendly personalized” system.
- **Evidence:** “otherwise… passing in hundreds… more expensive.”
- **Conditions:** Key exists (email). Growing DB.
- **Exceptions:** He also shows agent-chosen tools with conditions the model fills (date/name/id).
- **Action:** Steal filter-then-LLM. Hive: `inbox-to-task-routing` shape; no auto-send.
- **Confidence:** high as method.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Type and format are part of the tool contract
- **Claim:** Insert fails on type mismatch. Date-with-hyphens stored as **string**. System prompt lists valid product names/IDs and the date format the tools expect.
- **Reasoning:** The model fills the filter value; it must match stored shape.
- **Mechanism:** Prompt enumerates allowed values + format; tools expose one condition each.
- **Evidence:** Sep 15 filled as `2025-09-15` because he told it the format.
- **Conditions:** Demo-sized enum (3 products). Won’t scale without a lookup tool.
- **Exceptions:** Real catalogs need a search, not a hardcoded list.
- **Action:** Steal “enum + format in the tool prompt.” Don’t hardcode a live catalog.
- **Confidence:** high as demo scar.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** unobserved
- **Speech ≠ behavior:** none.

### Small writes win; bulk is a wash; Sheets has a floor
- **Claim:** His timings: 2 rows 11 vs 1600 ms; 20: 97 vs 1700; 60: 300 vs 1700; 400: 2511 vs 2280 (table lost). Sheets ~1.6s floor; no internal rate limit.
- **Reasoning:** Network/API tax dominates tiny writes; bulk evens out.
- **Mechanism:** Same 1–n payload to Sheets vs table.
- **Evidence:** He reruns to test the hypothesis after the 400 surprise.
- **Conditions:** His instance that day. ms UNVERIFIED.
- **Exceptions:** First 400 contradicted “table always faster.”
- **Action:** Steal size-dependent pick. Do not quote ms as FACT.
- **Confidence:** medium (one machine, speech).
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 400-row surprise
- **Speech ≠ behavior:** none.

## C. Mental Models
Local > wire for hot small data. Narrow then generate. Types are contracts. Prompt the allowed values. Measure; don’t assume native is faster. Calculator tool for sums (don’t trust the LLM to add). IDs remember. Plus/Skool packaging.

## D. Procedures
1. Update n8n until Data tables exists.
2. Type columns; import with matching types.
3. Don’t assume delete resets IDs.
4. Prefer filtered get (or tool-with-condition) over “pass the table.”
5. If the model fills filters: put allowed values + formats in the system prompt.
6. Time Sheets vs table at *your* batch size (his 400 lost).
7. Hive: no Skool JSON; no auto-email; no n8n-cloud.

## E. Examples
- **Situation:** Bluetooth revenue. **Action:** Name query + calculator. **Outcome:** $546 he says correct. **Lesson:** Tool+calc, not “agent math.”
- **Situation:** Inbound “I need help.” **Action:** Filter contact by from-email; notes into prompt. **Outcome:** Cautious-commitment reply. **Lesson:** One row in context.
- **Situation:** 400-row write. **Action:** Time both. **Outcome:** Table slower. **Lesson:** Hypothesis died; he kept testing 60/20/2.

## F. Decision Rules
- IF lookup key exists → filter before LLM.
- IF batch is 1–60 rows → he expects table to win; IF ~400 → measure.
- IF date has hyphens from Sheets → string + format in prompt.
- IF types don’t match → insert won’t run.
- Refuse: n8n-cloud; quote $546/ms as FACT; auto-send the Gmail reply; new ICP.

## G. Contrarian
Native isn’t always faster (400). Deterministic path can beat “give the agent the whole DB.” Calculator is a first-class tool.

## H. Assumptions
$546, all ms, Plus 200 = **UNVERIFIED**. Pre-GA UI. Demo enums.
**Desk dissent:** Learn filter-then-LLM. Do not stand up n8n tables as hive source of truth.

## I. Questions
- Table limits / backup / multi-instance?
- Sibling `lcNN3X9gXls` hacks vs this tour?
- Does ID-never-reset bite production?

## J. Connections
- **SYSTEM SYNTHESIS:** `lcNN3X9gXls` (remaining hacks) · `lokbsA5VXOk` (vendor memory) · `oWdJMJp2HgM` (guard before send). Skills: `inbox-to-task-routing` · `golden-test-loop` · `send-removed`.

## K. Future-Use
Filter-then-LLM. Type/format contract. Size-dependent Sheets vs local. ID monotonic scar.

## Steal / Operate-never

### Machine: filter-row-then-llm
- **Epistemic:** SOURCE
- **Workflow / loop:** persist locally → get/filter on a key → one row into the prompt → optional calc tool → (hive) draft only
- **Questions / signals:** Type match? Date format? Batch size? Are we dumping the table?
- **Qualify / frame / objections:** Native ≠ always faster. Enum in the prompt is a demo trick.
- **Procedure:** D.
- **Example that proves it:** Gmail→one contact; 400-row table loss; $546 via calc.
- **Why it works:** Narrow context + typed store + measured I/O.
- **Conditions / exceptions:** Pre-GA. $ / ms UNVERIFIED.
- **Operate-never payload:** n8n-cloud; Skool JSON; auto-send; quote $546 as FACT; new ICP.
- **Hive run (existing skills only):** `inbox-to-task-routing` · `send-removed` · `golden-test-loop`
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

**Operate-never**
- Install n8n-cloud / his templates. Auto-send. Quote tape $ as FACT. New `icp_id`.

## L. Role-Specific Applications
File filter-then-LLM and the 400-row fail. Do not pick n8n tables as the hive DB.
