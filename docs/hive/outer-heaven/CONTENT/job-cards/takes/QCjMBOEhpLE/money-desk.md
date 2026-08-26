# Money Desk — QCjMBOEhpLE
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/QCjMBOEhpLE/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~3372 words. Nate: n8n native Data Tables vs Google Sheets, plus a sales-data agent. Caption-only; timestamp UNKNOWN; visual/click UNKNOWN (n8n UI, tables, tools — unobserved). Beats in order: cold open — sales agent + tools query a native table; “total revenue from Bluetooth speaker” → product-name query + calculator → $546 (he says correct). Data lives in n8n (new Data Tables tab), no internet/API. Workflow + two example datasets free (School later). Pre-rollout: update n8n to see the tab (home: workflows / credentials / executions / data tables). Create table: created-at + updated-at defaults; add columns typed string/number/boolean/date; add rows or import. Delete-all does not reset IDs (deleted from 20, next write starts 21 — “remembers”). Import contacts from Google Sheets via Data Tables node (delete/get/insert/update/upsert — “like Sheets, no credential because we’re not going to the internet”); map columns; types must match or insert fails; refresh shows rows. Use case: Gmail trigger → get-rows filtered email==trigger email → notes into agent (subject/body/name/notes) → personalized reply. Notes were ChatGPT-generated (“founder into AI automation, likes detail, cautious on commitments”). Key: filter/conditions so you do not pass hundreds/thousands of rows (tokens, cost, hallucination). Deterministic path today; later you can expose table tools to the agent (insert/filter/update/delete). Sales example: 20-row Sheets (3 products, 3 days) → write into n8n table → agent + tools + calculator. Q1: products sold Sep 15 → date tool + calc → 10 (six txns summed). Date stored as string because Sheets hyphens. Q2: wireless headphones sold → product-name filter → 12. Q3: average units/day for product ID BS002 → 12 over 3 days = 4. System prompt: master sales analyst; valid product names, date format, product IDs so filters work. Speed card: code node 1–400. Sheets write 400 ≈ 2280ms vs table 2511ms (table not faster this time; he expected it). Hypothesis: bulk Sheets ok, small writes table wins. 60 rows: Sheets 1700ms, table 300ms. 20: Sheets 1700ms floor, table 97ms. 2 rows: Sheets 1600ms, table 11ms. Hundreds comparable (n8n may be slower); one/two rows instant. Extra: Sheets API rate limits / waits / retries; n8n stays internal so he does not see that. Close: free School (JSON + copy-of-sheets). Plus: 200+ members, Agent Zero, 10 hours/10 seconds, One-person AI Automation Agency bonus for annual — UNVERIFIED. Like CTA.

## B. Atomic Knowledge
### Filter-before-you-feed-the-model
- **Claim:** Do not pass hundreds/thousands of table rows into the agent. Filter/condition first (email==trigger, date==X, product==Y), then let a calculator do the arithmetic.
- **Reasoning:** More rows = more tokens, more cost, more hallucination. The Bluetooth $546 and the Sep-15 “10” only work because the tool pulled the matching slice, then calc summed.
- **Mechanism:** Get-rows + condition → optional calc → answer. Give the agent the valid names/IDs/date format so the filter can hit.
- **Evidence:** On-tape $546 / 10 / 12 / 4. Demo numbers UNVERIFIED as a business. ChatGPT notes on the contact row.
- **Conditions:** You have a table and a key you can filter on.
- **Exceptions:** n8n Data Tables / Gmail auto-reply are not ours. Auto-send the drafted email is operate-never.
- **Action:** Steal filter-then-calc. Do not install n8n-cloud. Do not analog $546.
- **Confidence:** high as a procedure
- **Source:** QCjMBOEhpLE @ UNKNOWN
- **Epistemic:** SOURCE
### Internal-table-vs-Sheets-API
- **Claim:** Native tables skip the internet credential and the Sheets rate-limit. Small writes are near-instant (11–97ms vs ~1.6–1.7s Sheets floor). At 400 rows they were comparable; table was even slower once.
- **Reasoning:** Sheets always pays an API floor. Spam Sheets → waits/retries. n8n stays inside the instance — he does not see that limit.
- **Mechanism:** If the job is one/two-row lookup or write, internal store wins latency. If the job is 400-row dump, measure; do not assume native is faster.
- **Evidence:** On-tape 2280 vs 2511 (400); 1700 vs 300 (60); 1700 vs 97 (20); 1600 vs 11 (2). UNVERIFIED as our bench.
- **Conditions:** You are choosing Sheets vs an internal store.
- **Exceptions:** Does not authorize n8n as ours. ID-does-not-reset is a footgun, not a feature we need.
- **Action:** Steal measure-small-vs-bulk. HOLD n8n / School JSON / Plus.
- **Confidence:** high as his card; ms UNVERIFIED
- **Source:** QCjMBOEhpLE @ UNKNOWN
- **Epistemic:** SOURCE
### Types-must-match-or-insert-fails
- **Claim:** Column types (string/number/boolean/date) must match the incoming values or n8n will not insert. Hyphen dates from Sheets are strings, not date type — he stored them as string on purpose.
- **Reasoning:** A silent type mismatch is a failed write, not a wrong sum. Valid-name lists in the system prompt are how the agent fills the filter.
- **Mechanism:** Map columns → check types → give the agent the allowed values/format.
- **Evidence:** On-tape contacts import + sales date-as-string.
- **Conditions:** You are importing from Sheets or a CSV.
- **Exceptions:** Caption-only: we did not see the type-error UI.
- **Action:** Steal type-check. Do not treat the import path as a SKU.
- **Confidence:** high
- **Source:** QCjMBOEhpLE @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: native tables are Sheets-without-the-wire for agent tools. Priority: filter + calc over dump-the-table; measure speed, don’t slogan it. Experience: pre-GA tab; he expected table always faster and the 400-row card surprised him. Contrarian: at bulk, Sheets can tie or win. Uncertainty: rollout not live for everyone yet.

## D. Procedures
Order: update n8n → Data Tables tab → create typed columns → import or type rows (IDs persist after delete) → Data Tables node (no cred) → map + type-match → for agents: one tool per filter key + calculator + system prompt of valid values. Email path: trigger → filter row → notes into draft (HITL send). Speed: time Sheets vs table at your real N. Caption-only: every click UNKNOWN.

## E. Examples
**Situation:** “Revenue from Bluetooth speaker.” **Action:** product-name tool + calculator. **Reasoning:** LLMs fail math; table has the rows. **Outcome:** $546, he says correct. **Lesson:** Filter + calc, not “add the whole sheet to context.” $ UNVERIFIED.

**Situation:** 400-row write. **Action:** time Sheets vs n8n table. **Reasoning:** he thought native always wins. **Outcome:** 2280 vs 2511 — table slower; 2-row card 1600 vs 11. **Lesson:** Measure. Small writes are the native win.

## F. Decision Rules
IF you would dump the table into the prompt → filter first. IF the question is arithmetic → calculator tool. IF types don’t match → insert fails. IF N is 1–60 → he saw native much faster; IF N is 400 → measure. IF Gmail draft → HITL send. IF School JSON / Plus / 200 members / annual agency course → not a SKU. Refuse: n8n-cloud as ours; auto-email.

## G. Contrarian
Rejects “just give the agent the whole database.” Rejects “native is always faster.” Field stays on Sheets API; he shows the rate-limit and the floor.

## H. Assumptions
Pre-GA feature. Demo $ and row counts are toys. ChatGPT wrote the contact notes. Survivorship: one instance. Falsifier: production table is slower or loses data. Speech≠behavior: “you’ll get this free” then Plus upsell. 200 members UNVERIFIED.

## I. Questions
Did Data Tables GA with the same types/ops? What’s the real row cap? Any receipt that filter-then-calc cut token $ we can open?

## J. Connections
SYSTEM SYNTHESIS: calculator-for-math = `NWbh5ZoEHkA`. Filter-before-context = `token-receipt` / `U6k4MeVks_Y` 30% window. Auto-email = `playbook-before-send` HITL. n8n-cloud / School / Plus operate-never.

## K. Future-Use
Unassigned: ID-does-not-reset after delete as a data-footgun. Sheets-floor ~1.6s as a CFO observe if we ever timed a vendor API.

## Steal / Operate-never

### Machine: Filter-then-calculator-not-the-whole-table
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a question about rows → action: filter on a typed key → calc if math → checkable stop: the tool’s slice + a number, not the whole table in context
- **Questions / signals:** What’s the filter key? Do types match? Is N small enough that native latency matters?
- **Qualify / frame / objections:** Frame: internal store vs Sheets API. Objection: “native is always faster” — not at 400 on his card.
- **Procedure:** Typed columns. Valid-value list in the prompt. One tool per key + calc. Draft email is HITL.
- **Example that proves it:** Bluetooth $546; Sep 15 → 10; headphones 12; BS002 avg 4. Speed: 2 rows 11ms vs 1600ms. UNVERIFIED.
- **Why it works:** Dumping rows burns tokens and invites bad math. Small internal writes skip the API floor.
- **Conditions / exceptions:** Works as a pattern. Exception: $546 / ms / 200 members UNVERIFIED. n8n / School / Plus / auto-send operate-never.
- **Operate-never payload:** n8n-cloud · Data Tables as ours · School JSON · Plus / One-person agency · auto-email · $546 as analog
- **Hive run (existing skills only):** `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** QCjMBOEhpLE @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $546 / 10 / 12 / 4 / ms benches / 200 members as FACT or as our analog.
- n8n-cloud / School JSON / Plus / One-person agency as a SKU. Auto-send the Gmail draft.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD n8n Data Tables, School, and Plus. Steal filter-then-calc and measure-small-vs-bulk. Draft email stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
