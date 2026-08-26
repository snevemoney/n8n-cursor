# Librarian — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.
**Title:** n8n's NEW Native Data Tables Just Made Building Agents So Much Easier
**Channel:** Nate Herk | AI Automation
**Kind:** video (~3372 words)
**Captions:** yt-dlp — timestamp UNKNOWN (no VTT unless noted)
**Walked:** 2026-08-14 librarian re-walk. Did not merge `LESSONS-FROM-TAPE.md`. Clients parked. Did not overwrite `takes/librarian.md` (18-tape SSOT).

## A. Source Map
1. Sales-data agent with **native n8n Data Tables** (no internet/API): “total revenue Bluetooth speaker?” → product-name query + calculator → **$546** (he says correct). New home tab next to workflows/credentials/executions. Pre-GA recording; update n8n to see it.
2. Create table: default `createdAt`/`updatedAt`; add columns typed **string / number / boolean / date**; manual rows or import. Data Tables **node**: delete/get/insert/update/upsert — “permanently save across executions.” No credential (local to instance). Types must match or insert refuses. Delete-all does **not** reset IDs (next write continues, e.g. 21 after wiping 1–20).
3. Contacts path: Google Sheets → Data Table (map columns). Email agent: Gmail trigger → **get rows + filter** email = trigger from → notes into the writer. Example notes from ChatGPT (“founder, likes detail, cautious on commitments”). Point: **filter** or you dump hundreds/thousands of rows into the model (tokens, cost, hallucination). Deterministic get+filter **or** expose table tools to the agent (later).
4. Sales sheet (20 rows, 3 products, 3 days) → table. Agent tools: date query / product-name / product-ID + calculator. Demos: units on 2025-09-15 = **10**; wireless headphones qty = **12**; avg BS002 per day = **4** (12/3). Dates stored as **string** because the sheet used hyphenated text, not date type — tell the model the format. System prompt: role + when to use each tool + **valid enum values** (3 names, date format, 3 IDs).
5. Speed bake-off vs Google Sheets (same 1-col numbers): **400 rows** Sheets ~2280 ms vs table ~2511 ms (table not faster — he is surprised; prior runs table won). Hypothesis: bulk Sheets OK, small writes table wins. **60:** Sheets 1700 vs table 300. **20:** Sheets 1700 (floor?) vs table 97. **2:** Sheets 1600 vs table **11 ms**. Large hundreds ≈ comparable (n8n maybe slower); one/two rows ≈ instant. Sheets can **RPM**; table stays internal so he does not expect waits/retries.
6. Free JSON + sheet copies in Skool; Plus CTA (200 members / courses — UNVERIFIED).
Gap: the agent graph, table UI. Timestamp UNKNOWN. n8n/Sheets/Skool/Plus on-tape. $546 is demo data.

## B. Atomic Knowledge

### Filter/enum in-instance; do not dump the table into the model
- **Claim:** Native tables = persist across executions without an HTTP credential. Agent accuracy here came from **typed columns + filtered gets + calculator + enum/format in the prompt**, not from “the table is magic.” Small writes beat Sheets on latency; fat writes can tie or lose. IDs do not rewind after delete.
- **Reasoning:** Dumping all rows is tokens + hallucination; Sheets has a latency floor and RPM.
- **Mechanism:** Create typed table → import/map → get+filter or tool-per-dimension → calculator for math → prompt lists legal values/formats.
- **Evidence:** 546 / 10 / 12 / 4; 11 ms vs 1600 ms for 2 rows; 400-row table slower once.
- **Conditions:** Pre-GA; update required. String vs date is a format trap.
- **Exceptions:** 400-row run falsified “always faster.”
- **Action:** Steal filter+enum+calculator + latency-by-batch. Do not treat n8n-cloud as hive. Demo $ UNVERIFIED.
- **Confidence:** high as a pattern; ms are one machine
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared + demonstrated (transcript-implied)
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** 400-row hypothesis fail; he retested 60/20/2
- **Speech ≠ behavior:** “new tables made agents so much easier” vs the work is still filter/enum/prompt

## C. Mental Models
Local > chatty API when you can. Math belongs on a calculator tool. Types and formats are the join key. Always-faster is a hypothesis until batched.

## D. Procedures
1. Update n8n; open Data Tables; type columns to the source.
2. Import with mapped types; do not assume IDs reset.
3. Prefer get+filter (or dimension tools) over “give the agent the whole table.”
4. Put legal names/IDs/date format in the system prompt.
5. Use a calculator for sums/averages.
6. If replacing Sheets, bake-off **your** batch sizes; expect Sheets RPM on spam.
Avoid: Skool JSON as SSOT; n8n-cloud; $546 as a business fact.

## E. Examples
**Bluetooth $546:** Situation — revenue ask. Action — name query + calculator. Outcome — correct (he says). Lesson — retrieve then math.

**400 vs 2 rows:** Situation — speed claim. Action — timed writes. Outcome — 400 comparable/slower; 2 rows 11 vs 1600 ms. Lesson — batch size is the variable; he kept the surprising 400.

## F. Decision Rules
- IF the agent needs one contact → filter on the trigger key.
- IF the sheet date is hyphen-text → store string and teach the format.
- IF writes are 1–20 rows → table likely wins latency.
- IF writes are hundreds → measure; do not assume.
- Refuse: Plus; n8n as hive infra; demo revenue as FACT.

## G. Contrarian
Against “native always faster than Sheets” (he falsified it at 400). Against dumping the DB into context.

## H. Assumptions
Pre-GA UI may have changed. Complements `lcNN3X9gXls` (table hacks, later). Caption-only.

## I. Questions
Limits/quotas on native tables? Multi-user instance isolation?

## J. Connections
SYSTEM SYNTHESIS → `lcNN3X9gXls`; `9mqsVK6Iqoc` (classifier needs a model); hive: do not dump.

## K. Future-Use
Filter+enum+calculator + batch-size bake-off + ID-does-not-reset as atoms.

## Steal / Operate-never

### Machine: typed local table → filter/enum tools → calculator; bake-off batch size
- **Epistemic:** SOURCE
- **Workflow / loop:** type columns → import → tool-per-dimension or get+filter → calculator → checkable stop = a known number (546/10/12/4) or a timed write vs Sheets
- **Questions / signals:** Whole table or one key? Date type or hyphen string? Batch of 2 or 400?
- **Qualify / frame / objections:** No credential because it never left the instance.
- **Procedure:** D above.
- **Example that proves it:** Speaker revenue; 2-row 11 ms; 400-row surprise.
- **Why it works:** Less context, less RPM, explicit math.
- **Conditions / exceptions:** Pre-GA; 400-row exception kept.
- **Operate-never payload:** n8n-cloud; Skool JSON as hive; $546 as FACT; Plus.
- **Hive run:** Same pattern on whatever store we already have — do not install n8n-cloud.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

### Operate-never
- n8n-cloud as hive. Quote demo $ as FACT. Merge LESSONS. Send / pay / deploy / book / publish.

## L. Role-Specific Applications
File the 400-row falsifier so “native is faster” cannot flatten. Keep enum+filter as the actual steal.
