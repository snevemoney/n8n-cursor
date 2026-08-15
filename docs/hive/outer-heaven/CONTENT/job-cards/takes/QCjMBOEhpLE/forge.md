# Forge — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
Nate Herk **n8n Data Tables** tape (pre-GA; update n8n to see the tab). Beats: sales agent + tools query a **native** table (no internet): Bluetooth speaker revenue **$546** UNVERIFIED (sum via calculator) → tables live next to workflows/credentials/executions; columns string/number/boolean/date + created/updated → import from Sheets via Data Tables node (insert/get/update/upsert/delete); **no credential** (in-instance); types must match; deleted IDs **do not reuse** (20 → next is 21) → email personalizer: Gmail trigger → **get rows where email = trigger email** → notes into the agent (ChatGPT-written contact note on tape) → **filter before the model** or you pass hundreds/thousands of rows = tokens + hallucination + $ → tools can do the same ops as Sheets, faster, inside n8n → sales demo: 20 rows / 3 products / 3 days imported; questions: units on Sep 15 (**10**), wireless headphones (**12**), avg/day for ID BS002 (**4**) — date stored as **string** because Sheets had hyphens → system prompt: role + **which tool for what** + **allow-list** of valid product names / date format / IDs → speed test vs Sheets: **400** rows ~**2280 vs 2511 ms** (Sheets slightly faster once); **60** Sheets **1700** vs table **300**; **20** Sheets **1700** vs **97**; **2** Sheets **1600** vs **11** UNVERIFIED — his read: large bulk comparable (n8n maybe slower); small writes instant; Sheets has a ~1.6–1.7s floor; **Sheets rate limits** vs internal tables → Skool JSON + sheet copies; Plus **200+** / One-person agency course UNVERIFIED. Timestamp UNKNOWN. n8n / Sheets / Skool / Plus on-tape.

## B. Atomic Knowledge

### Filter + allow-list before the model; local table beats a chat dump
- **Claim:** Don’t hand the agent the whole table. Condition the get. Tell it valid names/formats. Keep the store next to the workflow when you can.
- **Reasoning:** Hundreds of rows = tokens, $ , and hallucination. Types must match or insert fails.
- **Mechanism:** Get-rows + filter; tool-per-query (date / product / id) + calculator; allow-list in the system prompt.
- **Evidence:** Email lookup by address; three sales questions hitting the right tool; $546 / 10 / 12 / 4 as demo math (UNVERIFIED as business facts).
- **Conditions:** n8n Data Tables as taped (pre-GA).
- **Exceptions:** 400-row write was not faster than Sheets in his first run — bulk ≠ always win.
- **Action:** Steal filter-before-model + allow-list + type-match. Do not migrate hive data into n8n-cloud tables.
- **Confidence:** high on the shape; ms / $546 UNVERIFIED.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE

### Small local writes beat a networked sheet; bulk is a wash
- **Claim:** One/two-row internal writes are ~instant. Sheets sits on a ~1.6s floor and can rate-limit.
- **Reasoning:** No internet hop. Google API quotas.
- **Mechanism:** Side-by-side ms on 400/60/20/2.
- **Evidence:** His live timings (first 400 favored Sheets).
- **Conditions:** His instance, that night.
- **Exceptions:** Large dumps may be similar or slower on n8n.
- **Action:** Steal “don’t spam a sheet API for one-row upserts.” Not a vendor buy.
- **Confidence:** medium (one machine, one night).
- **Source:** `QCjMBOEhpLE` @ UNKNOWN
- **Epistemic:** SOURCE

## C. Mental Models
Native > hop when the data is ours. The agent is a router over filtered tools, not a warehouse. Allow-list is how the filter gets the right string. Deleted IDs that don’t reset are a real footgun. Plus course is the close.

## D. Procedures
1. Do not install/update n8n for this tab. 2. If we query tabular data: filter first. 3. Allow-list enums/date formats in the prompt. 4. Match types on write. 5. Don’t dump the table into the context. 6. Don’t quote ms as FACT.

## E. Examples
**Situation:** “Revenue from Bluetooth speaker.”  
**Action:** Product-name query + calculator.  
**Reasoning:** Filtered rows, then math.  
**Outcome:** $546 (demo).  
**Lesson:** Tool + calc, not “read everything.”

**Situation:** Inbound email.  
**Action:** Get row where email equals trigger.  
**Reasoning:** One contact’s notes, not the book.  
**Outcome:** Personalized reply (demo).  
**Lesson:** Filter is the product.

**Situation:** 2-row write vs Sheets.  
**Action:** Time both.  
**Reasoning:** Hop vs local.  
**Outcome:** 1600ms vs 11ms (claimed).  
**Lesson:** Small local wins; 400-row was a wash.

## F. Decision Rules
- If the agent would see the whole table → add a filter.
- If enums exist → allow-list them.
- If types don’t match → insert will fail.
- If $546 / 10 / 12 / 4 / ms appear → UNVERIFIED.
- If the CTA is Skool JSON / Plus agency course → park.

## G. Contrarian
Field keeps a Sheet as the brain. He moves the table next to the workflow and still uses Sheets as the import source. Field assumes “native is always faster”; his 400-row run said otherwise.

## H. Assumptions
Pre-GA UI. Falsifier: GA tables differ. Demo numbers are toy. We do not run n8n-cloud. Contact note from ChatGPT is not a data-quality win.

## I. Questions
Do we already filter before Grok sees a table, or do we paste sheets?

## J. Connections
SYSTEM SYNTHESIS: `lokbsA5VXOk` allow-list search. `9IzGe0BBj_c` search→details. No n8n-cloud. Hive data stays in our stores.

## K. Future-Use
Filter-before-model on any agent-over-table. Allow-list enums. Don’t assume bulk-local is faster.

## Steal / Operate-never

### Machine: filter the row, allow-list the keys, don’t dump the table
- **Epistemic:** SOURCE
- **Workflow / loop:** need a fact → pick the query tool → condition (email/date/name/id) → calc if needed → answer → stop
- **Questions / signals:** Would this pass a thousand rows? Are types aligned? What’s the date format?
- **Qualify / frame / objections:** Native isn’t always faster at 400 rows. Sheets still rate-limits.
- **Procedure:** No n8n Data Tables migration. No Skool JSON. No Plus course.
- **Example that proves it:** Email filter; three sales queries; 2-row 11ms vs 400-row wash.
- **Why it works:** The model is a bad warehouse. A filter is cheap and true.
- **Conditions / exceptions:** Pre-GA. Timings UNVERIFIED.
- **Operate-never payload:** n8n-cloud as hive DB; quote $546/ms as FACT; agency course.
- **Hive run:** existing stores + allow-list habit. No new skill.
- **Source:** `QCjMBOEhpLE` @ UNKNOWN

### Operate-never
- Move hive data into n8n-cloud tables.
- Quote demo $ / ms as FACT.
- New hunt. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`.

## L. Role-Specific Applications
I will not add n8n Data Tables this session. If I query a table, I filter first. Deploy HITL.
