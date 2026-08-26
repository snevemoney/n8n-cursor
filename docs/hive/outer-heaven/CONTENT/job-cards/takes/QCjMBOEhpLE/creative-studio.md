# Creative Studio — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
n8n native Data Tables (pre-rollout; update to latest). Beats: sales agent + calculator → Bluetooth speaker revenue **$546** (on-tape demo, UNVERIFIED); tables live in-instance (created/updated cols; string/number/boolean/date); import from Sheets via Data Tables node (get/insert/update/upsert/delete) — no credential because no internet; IDs keep incrementing after delete; Gmail trigger → filter row by from-email → notes into a personalized reply (ChatGPT-written contact note); do not dump hundreds of rows into the model (tokens + hallucinate + $); sales Qs: 10 units on 2025-09-15, 12 wireless headphones, avg 4/day for BS002 — date stored as **string** because Sheets hyphens; system prompt lists valid names/IDs/date format; speed aside: 400 rows Sheets ~2280ms vs table ~2511ms (similar); 60: 1700 vs 300; 20: 1700 vs 97; 2: 1600 vs 11 — small writes “instant,” bulk comparable; Sheets rate-limits, tables stay internal. Skool JSON + Plus ~200 (UNVERIFIED). Visual: table tab + orange node.

## B. Atomic Knowledge

### In-instance table is a tool, not a dump
- **Claim:** Agent answers by filtered get-row + calculator, not by stuffing the whole table into context.
- **Reasoning:** Growing DBs otherwise burn tokens and raise hallucination.
- **Evidence:** “otherwise you’re going to be passing in hundreds… adding more tokens… hallucinate… more expensive.”
- **Conditions:** Filter condition must match stored type/format (date-as-string).
- **Exceptions:** You can also attach table ops as agent tools (later example).
- **Action:** Learn filter-then-calc; do not install n8n-cloud.
- **Confidence:** SOURCE.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE

### Small writes win; bulk is a tie
- **Claim:** vs Google Sheets, native tables are near-instant on 2–60 rows; at 400 they were similar or Sheets slightly faster once.
- **Evidence:** 11ms vs 1600ms (2 rows); 2511 vs 2280 (400).
- **Conditions:** His laptop, one run each; he expected tables always faster.
- **Exceptions:** Sheets may have a ~1.6–1.7s floor on tiny writes.
- **Action:** Steal the bake-off habit; $546 / ms are not FACT.
- **Confidence:** SOURCE as one-off timings.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE

### Prompt the legal values
- **Claim:** Analyst prompt lists valid product names, IDs, and date format so the tool-fill matches the table.
- **Evidence:** “I gave it the valid names that go into each category… format that it needs to structure its dates as.”
- **Conditions:** Demo table is tiny (3 products, 3 days).
- **Exceptions:** Types must match or insert refuses.
- **Action:** Enumerate the vocabulary the filter will see.
- **Confidence:** SOURCE.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Same verbs as Sheets, no API. Deleted rows do not reset IDs. Deterministic lookup vs agent-with-tools. Contact notes can be ugly ChatGPT stubs and still personalize. Internal = no Sheets quota.

## D. Procedures
1. Update n8n → Data Tables tab → typed columns.
2. Import via node; map types.
3. Filter get-row on the trigger key before the model.
4. Calculator for sums/averages.
5. Bake-off write sizes if you care about speed.
Avoid: Skool JSON; n8n-cloud; auto-send the Gmail reply; $546 as FACT.

## E. Examples
**Situation:** “How much revenue from Bluetooth speaker?”  
**Action:** Product-name query + calculator.  
**Outcome:** $546, “correct.”  
**Lesson:** Tool + math, not a spreadsheet dump.

**Situation:** 2-row write.  
**Action:** Sheets 1600ms, table 11ms.  
**Lesson:** The win is the small write, not the 400-row flex.

## F. Decision Rules
- If you would pass the whole table → filter first.
- If the date has hyphens in Sheets → store string or the filter misses.
- If the write is 1–2 rows → native table; if hundreds → measure.
- If $ / ms / 200 Plus from this tape → UNVERIFIED.

## G. Contrarian
He expected tables always faster; 400-row run falsified that. Pre-GA feature, “if you don’t see it, update.”

## H. Assumptions
$546 / 10 / 12 / 4 and all timings UNVERIFIED. On-tape n8n / Gmail / Sheets. Clients parked.

## I. Questions
Row/size limits of native tables? Visual of the Data Tables home tab? Did Plus 200 stay?

## J. Connections
- SYSTEM SYNTHESIS → `lcNN3X9gXls` (hidden table hacks, if present).
- SYSTEM SYNTHESIS → `kOKavHnlPik` (RAG vs table).
- SYSTEM SYNTHESIS → `info-gain-cite` (filter, don’t dump).

## K. Future-Use
“Legal values in the system prompt” as a filter-card. Unassigned.

## Steal / Operate-never

### Machine: filter-then-calc, don’t dump the table
- **Epistemic:** SOURCE
- **Workflow / loop:** store in-instance → filter on the trigger key → calc → answer; enumerate legal values in the prompt
- **Questions / signals:** Type match? Date string or date? Whole table in context?
- **Qualify / frame / objections:** Sheets quota vs internal
- **Procedure:** Small-write bake-off if speed matters
- **Example that proves it:** $546 speaker; 11ms vs 1600ms on two rows
- **Why it works:** The model only sees the row it needs
- **Conditions / exceptions:** Bulk ~tie; pre-GA
- **Operate-never payload:** n8n-cloud; Skool JSON; auto-send Gmail; $546 as FACT
- **Hive run:** `info-gain-cite`; `ask-principal`
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

### Operate-never
- Install n8n-cloud. Join Skool/Plus.
- Auto-send the personalized reply.
- Quote $546 / 200 members as FACT. New hunt.
- Merge `LESSONS-FROM-TAPE.md`. Game-studio / fake 3D / cheap taste / NSFW.

## L. Role-Specific Applications
Video-first: the **Data Tables tab + orange node** is the plate, not a $546 thumb. If we show speed, show the 2-row still (11ms vs 1.6s), labeled UNVERIFIED. HITL. Clients parked.
