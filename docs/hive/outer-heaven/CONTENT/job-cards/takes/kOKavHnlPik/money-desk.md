# Money Desk — kOKavHnlPik
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4209 words. Nate: four ways to get an agent the right rows — stop defaulting to a vector DB. Caption-only; timestamp UNKNOWN. Beats in order: whiteboard — chunk retrieval = cheap/fast search but loses document-level context (20-page PDF → dots; YouTube chunks lose URL/timestamp unless metadata). Ask for a whole-video or Mar-5 meeting summary → you get a summary of the hit chunks, not the tape. Tabular failure: ‘highest sales week’ pulls one chunk, picks week 6 = 15,583, misses weeks 4/14/19 higher; ‘average order value’ averages the chunk not the book. (1) **Filters** on n8n Data Table, 20 sales rows (product/date/price/qty/id). Q: Bluetooth speakers on Sep 16 → product-name tool then date tool then calculator → **5** (1+4). Human would filter the same way. Use when tabular, you know the fields, answer is a small subset. Fast/cheap/accurate; scales ‘to an extent.’ Beginner: if a human would filter a spreadsheet, filter. Dumping all 20 rows works but more tokens + more hallucination. System prompt must list **valid product names** (Wireless Headphones, Bluetooth Speaker, Phone Case — capitals) and date format — equality not semantic; new product = update the prompt. Schema-lookup tool can make SQL more dynamic (he won’t demo). (2) **SQL** on Postgres/Supabase, 50 rows; Excel pivot as the answer key. Q: three highest-earning products → AI writes SQL: SELECT product, SUM(total_price) … GROUP BY product ORDER BY total_revenue DESC LIMIT 3 → AI Automation Course 34.93, Consulting Call 33,383, Workflow Template 1,659 + % of book; calculator ×4 only for the percentages (top 3 = 80%). Use when totals/averages/rankings/trends, many rows, combine/compare. Beginner: if a human would pivot/formula, SQL. Still cheaper/righter than vector on structured data. (3) **Full context** — read the whole doc. Pro: order/accuracy. Con: time, $, window. Two transcripts (~4–5 pages): ‘I built an agent in 2 hours’ + ‘So you’re building with AI now what?’ Chronological breakdown of video 1 via **tool-choose-one** = **4,000 tokens** of GPT-5 Mini’s 400k. Same Q with **both transcripts pasted in the system prompt** = faster (no tool) but **6,577 tokens**. Third variant: pull both docs as variables every turn (flexible if sources change; same $ as paste). Use for summaries/timelines/step-by-step, when order matters, when it fits. Agentic Arena RAG challenge: he jammed PDFs into the prompt on a time crunch. Beginner: if a human would read the whole thing (onboarding SOP) do that; if a human would grab one FAQ of 100, don’t. (4) **Vector** on the same two transcripts in Supabase. Same chronological Q: faster/cheaper, worse order (model re-sorts chunks; raising limit 4→20 would help). **2,600 tokens** ~half of full-context — gap explodes as the corpus grows. Close: context engineering five (begin with end, pipeline, accuracy, windows, specialization) — he won’t read them; Plus **3,000 members** UNVERIFIED + courses + weekly Q&A. School JSON. Like CTA.

## B. Atomic Knowledge
### Match-the-retrieve-to-the-question
- **Claim:** Filters = known fields, small subset. SQL = totals/ranks/joins. Full context = order/summary of a small doc. Vector = needle in a big haystack, not a book summary or a max-week.
- **Reasoning:** Chunk max-week picked 15,583 and missed higher weeks. Full-context chrono used 4k (tool) / 6.6k (paste); vector 2.6k and lost order.
- **Mechanism:** Ask: would a human filter, pivot, read-all, or Ctrl+F one FAQ? Pick that retrieve.
- **Evidence:** On-tape Bluetooth 5; top-3 34.93 / 33383 / 1659 / 80%; 4000 / 6577 / 2600 tokens.
- **Conditions:** The agent needs external data.
- **Exceptions:** n8n / Supabase / vector / Plus 3,000 are not ours. Demo $ UNVERIFIED.
- **Action:** Steal question→retrieve. Do not default vector. Do not analog 3,000 members.
- **Confidence:** high as a decision tree
- **Source:** kOKavHnlPik @ UNKNOWN
- **Epistemic:** SOURCE
### Equality-filters-need-a-valid-value-list
- **Claim:** Product-name and date filters are exact match. Wrong cap or date format = empty set. Prompt must list legal values; new SKU = update the prompt (or a schema tool he won’t show).
- **Reasoning:** Bluetooth Sep 16 only works because the tool strings matched the table.
- **Mechanism:** Put valid names/formats in the system prompt. Calculator after the slice.
- **Evidence:** On-tape 1+4=5; capitals on product names.
- **Conditions:** Tabular equality retrieve.
- **Exceptions:** Same machine as `QCjMBOEhpLE` filter-then-calc. n8n table not ours.
- **Action:** Steal valid-value-list. HOLD the table.
- **Confidence:** high
- **Source:** kOKavHnlPik @ UNKNOWN
- **Epistemic:** SOURCE
### Full-context-vs-vector-is-a-token-and-order-trade
- **Claim:** Read-all keeps chronology (4k–6.6k on two short transcripts). Vector is ~half the tokens and guesses order. Paste-in-prompt vs tool-choose-one vs dynamic variables = flexibility vs always-on token tax.
- **Reasoning:** He jammed PDFs in Arena because of a time crunch — legal when the set fits.
- **Mechanism:** If order matters and it fits, read-all. If the corpus will grow, don’t pretend 2.6k stays 2.6k.
- **Evidence:** On-tape 4000 vs 6577 vs 2600; GPT-5 Mini 400k window.
- **Conditions:** Small docs vs growing corpus.
- **Exceptions:** Does not authorize Supabase/n8n. 3,000 members UNVERIFIED.
- **Action:** Steal measure-tokens-and-order. HOLD vector-as-default.
- **Confidence:** high as a card
- **Source:** kOKavHnlPik @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: vector is the beginner trap for structured and for whole-doc questions. Priority: human-would-filter/pivot/read/FAQ. Experience: same Bluetooth table family as the Data Tables tape; Arena jam. Contrarian: SQL still used a calculator — for %. Uncertainty: 3,000 members; ‘to an extent’ on filter scale.

## D. Procedures
Order: classify the question → filters (valid list + calc) or SQL (GROUP/ORDER, calc only for leftovers) or full-doc (tool vs paste vs variables) or vector (raise k if order is soft). Do not start at vector. Caption-only: whiteboard/clicks UNKNOWN.

## E. Examples
**Situation:** Highest-sales week on chunked table. **Action:** vector-style chunk. **Reasoning:** semantic ‘highest.’ **Outcome:** week 6, misses 4/14/19. **Lesson:** Max is a book question, not a chunk question.

**Situation:** Bluetooth Sep 16. **Action:** two equality filters + calc. **Reasoning:** human spreadsheet. **Outcome:** 5. **Lesson:** Filter then add.

**Situation:** Chrono of a 4-page transcript. **Action:** full read vs vector. **Reasoning:** order. **Outcome:** 4k/6.6k right-order vs 2.6k guessed-order. **Lesson:** Pay tokens for order while it fits.

## F. Decision Rules
IF human would filter → filter + valid list. IF human would pivot → SQL. IF human would read the SOP → full context. IF human would grab one FAQ → vector/chunk. IF demo revenue / 3000 members / 15,583 → UNVERIFIED. Refuse: n8n / Supabase / Plus as ours.

## G. Contrarian
Rejects ‘agent needs data → stand up a vector DB.’ Rejects summarizing a meeting from the hit chunks and calling it the meeting.

## H. Assumptions
20- and 50-row toys. Pivot is his answer key. Token cards are one model. Plus 3,000 UNVERIFIED (other tapes said 200). Survivorship: questions he wrote to fit the method. Falsifier: SQL writes a wrong GROUP BY. Speech≠behavior: free School then Plus.

## I. Questions
At what row-count did filters break for him? Any receipt we can open that SQL beat vector on a real book? Is 3,000 or 200 the live Plus number?

## J. Connections
SYSTEM SYNTHESIS: filter-then-calc = `QCjMBOEhpLE`. Highlights-not-summary = `QojPKL96Dx4`. Full-vs-show = `hQvwMj7IJe4` ingest-vs-show. Context engineering list = Plus upsell. n8n/Supabase/Plus operate-never.

## K. Future-Use
Unassigned: tool-choose-one vs always-paste as a token-tax fork. Valid-value-list as the equality-RAG prompt law.

## Steal / Operate-never

### Machine: Question-picks-the-retrieve-not-the-vector-logo
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: agent needs external data → action: would a human filter, pivot, read-all, or grab one FAQ? run that retrieve → checkable stop: the number matches the sheet/pivot or the chronology matches the doc, not a chunk max
- **Questions / signals:** Tabular or prose? Order or needle? Do we have a valid-value list?
- **Qualify / frame / objections:** Frame: four retrieves. Objection: ‘just embed it’ — highest-week and whole-tape summary fail.
- **Procedure:** Valid names for equality. SQL for ranks. Read-all while it fits. Vector last for FAQ-shaped asks. HITL send. Tape $ UNVERIFIED.
- **Example that proves it:** Bluetooth 5; top-3 + 80%; 4000 vs 2600 chrono. UNVERIFIED $ / 3000 members.
- **Why it works:** Chunks lose the book. Filters/SQL keep the book if you ask a book question.
- **Conditions / exceptions:** Works as a tree. Exception: n8n / Supabase / Plus / demo revenue as FACT operate-never.
- **Operate-never payload:** n8n Data Tables · Supabase · Plus 3,000 · School JSON · demo $ as analog
- **Hive run (existing skills only):** `golden-test-loop` · `token-receipt` (proposed) · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** kOKavHnlPik @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote 5 / 34.93 / 33383 / 80% / 4000 / 6577 / 2600 / 3,000 members as FACT or as our analog.
- n8n / Supabase / Plus as ours. Default a vector DB because ‘RAG.’

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD n8n/Supabase/Plus. Steal question→retrieve and valid-value-list. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
