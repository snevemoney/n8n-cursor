# LEARNED — kOKavHnlPik
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/kOKavHnlPik/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~4209 words). Title: Once You Know This, Building RAG Agents Becomes Easy in n8n. Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) “Agent answers wrong” → too many levers; start from **end questions + what it must look at**. Four retrieval methods in one n8n graph: **filters**, **SQL**, **full context** (two flavors), **vector**. People jump to vectors first; that’s the bug. (2) Whiteboard: chunk retrieval = cheap/fast search, **loses document-level context**. 20-page PDF → dots; YouTube chunks without video/URL/timestamp unless metadata (other tapes). “Summarize the meeting” → summarizes *hit chunks*, not the meeting. Tabular failure: “highest sales week” / “AOV” on a chunk that misses week 4/14/19. (3) **Filters** — n8n Data Table, 20 sales rows. Q: Bluetooth speakers on Sept 16. Agent: product-name filter then date filter then calculator → **5** (1+4). Human-in-a-sheet would do the same. Use when tabular, you know the fields, answer is a small subset. Fast/cheap/accurate; scales “to an extent.” Beginner rule: **if a human would filter a spreadsheet, filter.** Prompt must list **exact** product strings (caps) and date format — equality, not semantic. New category = update the prompt. (4) **SQL** — Postgres/Supabase, 50 rows. Pivot in Excel as the key. Q: three highest-earning products. Agent writes `SELECT product, SUM(total_price) … GROUP BY … ORDER BY … LIMIT 3`. Hits course 34.93 / consulting 33383 / template 1659 (his numbers) + % via calculator ×4; top three ~80% revenue. Use for totals/averages/rankings/trends, many rows, combine/compare. DBs are built for this; still cheaper/more accurate than vectors on structured data. Rule: **if a human would pivot/formula, SQL.** Schema+examples still in the prompt; optional schema-lookup tool mentioned, not shown. (5) **Full context** — two YT transcripts (~4–5 pages). Chronological breakdown of “agent in 2 hours.” Tool-choose-one-doc: **~4k tokens** / GPT-5 Mini 400k window. Same docs pasted in system prompt: **~6577**, faster (no tool), always pays both docs. Third flavor: set nodes inject both docs as variables every turn (same cost as paste, easier to swap sources). Use for summaries/timelines/order-matters / small-enough-to-fit. Agentic Arena RAG challenge: he jammed PDFs into the prompt under time. Rule: **if a human would read the whole doc, so should the agent.** FAQ-from-100 = don’t. (6) **Vector** — same two transcripts in Supabase. Same chronological Q: faster/cheaper (**~2600 tokens**, ~half of full), order guessed from 4 chunks; raising limit to 20 would help. Gap vs full-context **explodes** as the corpus grows. (7) Closes on “five” context-engineering bullets (begin with end, pipeline, accuracy, windows, specialization) — not read aloud. Plus 3,000 members UNVERIFIED. **Do not flatten** vs `ZwQ8rJhVCr4` (four-method) · `QojPKL96Dx4` (Assistant) · `Fu6vOfzFmcw` · `QrJhdTbK3TU` · `lokbsA5VXOk` · `KVFfApQZhE4`. This tape is the *chooser* lecture with live token counts. All $ / token counts / 80% UNVERIFIED.

## B. Atomic Knowledge

### Pick retrieval by the human gesture
- **Claim:** Filter if you’d filter a sheet. SQL if you’d pivot. Full-read if you’d read the whole doc. Vector if you’d grab one FAQ from a hundred. Defaulting to vectors is how you get a wrong max/average.
- **Reasoning:** Chunks are local. Spreadsheet questions are global. Order-sensitive stories need the whole string.
- **Mechanism:** Four agents in one workflow; same “what should it look at?” test.
- **Evidence:** Chunk misses higher-sales weeks; Bluetooth 5 via two equality filters; SQL top-3 matches his pivot; vector chrono is cheaper and unordered.
- **Conditions:** Tiny tables (20/50) and two short transcripts. Not a scale study.
- **Exceptions:** Metadata tagging (other tapes) can put video/URL/time on chunks — he points off-tape.
- **Action:** Steal the four-way chooser. Keep other RAG rows unflattened.
- **Confidence:** high as the chooser; numbers UNVERIFIED.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** vector chrono slop (expected)
- **Speech ≠ behavior:** none.

### Equality filters need a closed vocabulary in the prompt
- **Claim:** Product = “Bluetooth speaker” with his capitals. Wrong spelling = zero rows. Same for date format. SQL still wants table/column examples unless you add a schema tool (not demoed).
- **Reasoning:** Filters are not embeddings. The agent must emit the exact token the table has.
- **Mechanism:** System prompt lists valid products + date shape.
- **Evidence:** He pauses on that prompt so you see it isn’t magic.
- **Conditions:** n8n Data Table / Postgres as shown.
- **Exceptions:** Schema-lookup tool would loosen this — unshown.
- **Action:** Steal closed-vocab + format. `golden-test-loop` on a known row.
- **Confidence:** high.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown (he designed around the fail)
- **Speech ≠ behavior:** none.

### Full-context has three cost knobs
- **Claim:** (1) Tools to pick one doc. (2) Both docs in the system prompt — always-on tokens, no tool latency. (3) Set-node inject — same tokens as (2), swap sources without editing the prompt. Arena jam = (2) under time.
- **Reasoning:** Flexibility vs paying for unused docs vs maintainability.
- **Mechanism:** ~4k vs ~6577 vs vector ~2600 on the same chrono Q (his counts).
- **Evidence:** “faster because it didn’t have to call a tool, but… more expensive.”
- **Conditions:** Two ~5-page transcripts; GPT-5 Mini 400k window claim UNVERIFIED.
- **Exceptions:** Hybrid chunk+full mentioned, not built.
- **Action:** Steal the three knobs. Don’t jam a hive wiki into a prompt because Arena.
- **Confidence:** high as the knob set; tokens UNVERIFIED.
- **Source:** `kOKavHnlPik` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none
- **Speech ≠ behavior:** “five things” of context engineering unread on tape.

## C. Mental Models
Wrong answer is usually wrong *context*, not a dumb model. Vectors lose the whole and the table. Limit tokens in = limit hallucination surface. Human gesture is the chooser. Prompt-listed enums are part of the schema.

## D. Procedures
1. Write the questions the agent will get and what a careful human would open.
2. Tabular + known fields → filter; list legal values + date format in the prompt.
3. Aggregations / many rows → SQL; put schema+examples in the prompt (or a schema tool).
4. Small ordered docs → full read; pick tool vs paste vs inject.
5. Large FAQ-like corpus → vector; raise `limit` if order/coverage is thin; add metadata on other tapes.
6. Check the answer against a sheet/pivot (`golden-test-loop`).
7. Hive: no new vector vendor; no Plus download; keep five other RAG rows.

## E. Examples
- **Situation:** Highest-sales week on chunks. **Action:** vector-style retrieve. **Outcome:** picks a local max, misses weeks 4/14/19. **Lesson:** chunk ≠ table.
- **Situation:** Bluetooth on Sept 16. **Action:** two filters + calc. **Outcome:** 5. **Lesson:** equality + closed vocab.
- **Situation:** Top-3 products. **Action:** SQL sum/group/order/limit. **Outcome:** matches pivot; calc for percents. **Lesson:** let the DB do the math.
- **Situation:** Chrono of a video. **Action:** full vs vector. **Outcome:** full ordered @ ~4–6.5k; vector cheaper @ ~2.6k and guessed order. **Lesson:** pay for order when order is the job.

## F. Decision Rules
- IF a human would filter → filter, not embed.
- IF a human would pivot → SQL, not embed.
- IF a human would read the whole thing → full context (and pick a cost knob).
- IF a human would grab one FAQ → vector.
- IF you add a product name → update the prompt enum.
- Refuse: “just use a vector DB”; Plus 3000 as FACT; flatten other RAG tapes; new ICP.

## G. Contrarian
The title says RAG becomes easy; the body says *don’t* RAG (vector) first. Token counts are one-run demos on toy tables. “GPT-5 Mini 400k” is a spoken model card. Plus pitch is the closer, not part of the chooser.

## H. Assumptions
Token counts, revenue figures, 80%, 3,000 members, window sizes = **UNVERIFIED**.
**Desk dissent:** This is the chooser lecture. `ZwQ8rJhVCr4` stays its own four-method row if it differs in setup. Assistant/Drive/Gemini/Responses stay open.

## I. Questions
- Is this the same recording family as `ZwQ8rJhVCr4` or a remake?
- Schema-lookup tool — where is that tape?
- Hybrid chunk+full — ever built on channel?

## J. Connections
- **SYSTEM SYNTHESIS:** `ZwQ8rJhVCr4` · `QojPKL96Dx4` · `Fu6vOfzFmcw` · `QrJhdTbK3TU` · `lokbsA5VXOk` · `KVFfApQZhE4` · `lcNN3X9gXls`. Skills: `info-gain-cite` · `golden-test-loop` · `wiki-ingest`.

## K. Future-Use
Human-gesture chooser. Closed-vocab filters. SQL-for-pivots. Three full-context knobs. Vector-when-FAQ. Chunk-breaks-tables.

## Stolen machines

### Machine: human-gesture-retriever
- **Epistemic:** SOURCE
- **Workflow / loop:** list the questions → name the human gesture (filter / pivot / whole-doc / one-FAQ) → pick filters | SQL | full (tool/paste/inject) | vector → put enums/schema in the prompt → check against a sheet
- **Questions / signals:** Is the answer global (max/avg) or local (one FAQ)? Does order matter? Will a misspelled product silently zero?
- **Qualify / frame / objections:** Toy n; other RAG products stay rows. Don’t jam the hive wiki because Arena.
- **Procedure:** D.
- **Example that proves it:** Missed sales weeks on chunks; Bluetooth 5; SQL top-3; vector cheaper-wrong-order.
- **Why it works:** You pull only what the question needs, so tokens and lies shrink together.
- **Conditions / exceptions:** Counts UNVERIFIED. No new vendor.
- **Operate-never payload:** Default-to-Pinecone/Supabase because tape; Plus JSON; new ICP.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `wiki-ingest`
- **Source:** `kOKavHnlPik` @ UNKNOWN

**Operate-never**
- Stand up a new vector DB because this tape. Quote tokens/$ as FACT. New `icp_id`. Send / pay / deploy.

## THINK / BEHAVE / TRICKS / USE
**Added:** 2026-08-14 last-mile. Caption-only. Visual/click UNKNOWN unless `watch.json`. Do not flatten this speaker into a hive personality.

### THINK
Decision order, what they ask before they build, what they ignore, how they choose tools, when they kill vs continue — see §C Mental Models and §F Decision Rules above. Desk that must think this way: see TAPE-WIRE-NOTES.

### BEHAVE
What they repeatedly check, skip, retry, and speech≠behavior — see §A / §E / speech≠behavior rows. Sequence-from-speech only. `multimodal-youtube-learning`: no invented clicks.

### TRICKS
Do / don’t and implicit shortcuts — see §D Procedures and Stolen machines. Shown system (files, loops, UI, offer, CTA) mapped to Cursor+Grok primitives on the named workflow. Caption-only = transcript-implied / unobserved.

### USE
Each trick lands as a desk **action** on Cursor + Grok Bot (not a quote). Operate-never on their vendors. Reproduce card: `job-cards/takes/_knowledge-use/{{slug}}.md`.
