# LEARNED — irg-2IfAjpo
Protocol: deep-video-learning
Status: filled
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Desks merged:** Researcher 2026-08-14. Librarian not yet. Keep later dissent as labeled rows. Do not flatten.
**ICP:** parked. Tape $ UNVERIFIED. No new `icp_id`.
**Note:** Derived from Researcher A–K + Steal after a full `full.txt` walk. Other desks add labeled rows; do not overwrite dissent.

## A. Source Map
Caption-only (`full.txt`, ~4696 words). Title: Gemini's New File Search Just Leveled Up RAG Agents (10x Cheaper). Visual/click **UNKNOWN**. Timestamp **UNKNOWN**. Beats: (1) Upload → Gemini chunks/embeds → chat. Cuts the Pinecone/Supabase pipeline (type/metadata/split/embed/store). Not magic. Price: **$0.15 / 1M tokens** to index; 121-page PDF ~**95k tokens** (“not a tenth of 15¢”). Storage **free** as of tape. Query ≈ chat-model $ ; high-query “base fee” he waves at. Table (100GB + 1M queries/mo): Gemini index ~**$12** once + ~**$35** first-month query fudge vs Supabase (more ops) vs Pinecone Assistant / OpenAI Vector Store (storage + index + query; Assistant **$0.05/h** not even in the table). Ease justifies Gemini even if DIY can be cheaper. (2) Four HTTP: **create store** (“folder”) → **upload** to Google (temp, **expires** if not moved) → **import** into store → **generateContent** query. Docs: confusing; Kashef tip = view-as-markdown → LLM. Create: POST, `?key=` is a query param → generic query auth named once (don’t paste key every node). Body: display name (`YouTube-test`). Pin the returned store `name`. Form drop PDF (rules of golf ~22p). Upload: resumable `/files`, n8n binary field name must match. Import: store name **in the path** (not after `?`); body = uploaded file `name`. Query tool: Gemini **2.5 Flash** generateContent; store name in body; `$fromAI` query = user’s question; system: helpful RAG, cite, **query text only — no punctuation/newlines** (JSON break). Demo: broken club → rule 4, continue/repair/replace if normal play. Second file Nvidia PR; Q1 FY25 ~$26B / DC $22B — he checks the PDF. Tool out: `candidates[].text` + `groundingMetadata` chunks + `groundingSupports` sentence spans. (3) Eval: golf 22p + Nvidia 9p + Apple 10-K 121p, 10 Qs, mixed store. First run **wrong API key**, 8 errors; second **4.2/5** (one “2”). ~200 pages, almost no prompt. (4) Not magic: **no dedupe/update/delete** → duplicates rot quality. GIGO / OCR / preprocess messy scans. Chunk retrieval **cannot** answer “how many rules?” (said **5**, real last rule **28**) — use full-context (`kOKavHnlPik`) unless heavy metadata. **PII/GDPR/HIPAA/CCPA**: files live on Google. Skool JSON + Plus. **Do not flatten** vs `KVFfApQZhE4` (Gemini file search other take) · `QojPKL96Dx4` (Pinecone Assistant) · `kOKavHnlPik` (chooser) · `Fu6vOfzFmcw` · `QrJhdTbK3TU`. All $ / 4.2 / 10× UNVERIFIED.

## B. Atomic Knowledge

### Four HTTP is the whole “no pipeline”
- **Claim:** Create store → upload (expires) → import (store name in URL path) → generateContent with `$fromAI` query. Query-auth once. Strip punctuation from the query string or the JSON dies.
- **Reasoning:** Google ate chunk/embed; you still have to move a temp file into a named store before chat.
- **Mechanism:** Docs → markdown → LLM assist; pin store name; binary field match.
- **Evidence:** Golf rule 4 answer; Nvidia Q1 numbers he PDF-checks; grounding chunks in the tool payload.
- **Conditions:** Gemini 2.5 Flash in the generate call as taped. Docs “not favorite.”
- **Exceptions:** “Direct upload to store” exists in docs; he followed import-files order.
- **Action:** Steal four-step + expire-window + no-punct query. No Gemini spend. `info-gain-cite`.
- **Confidence:** high as the recipe.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** wrong API key ×8
- **Speech ≠ behavior:** “just drop a file” vs four requests + auth + path-name.

### Cheap index is not a whole-document brain
- **Claim:** $0.15/1M index + free storage is the feed reason. It still chunks. “How many rules?” → 5. Last-rule-by-name works. Mixed unrelated PDFs in one store still scored 4.2/5 on 10 hard Qs — n tiny.
- **Reasoning:** Needle ≠ count-the-whole. Same chooser as `kOKavHnlPik`.
- **Mechanism:** n8n evals; 3 PDFs ~200 pages.
- **Evidence:** Rule-count miss; 4.2 after key fix.
- **Conditions:** $ / 4.2 UNVERIFIED. One-time index vs Assistant hourly is his table (Assistant $0.05/h from `QojPKL96Dx4` family).
- **Exceptions:** Metadata-heavy chunking might fake “whole” — he says usually don’t.
- **Action:** Steal “file search ≠ full context.” Keep five+ RAG rows open.
- **Confidence:** high as the scar; score UNVERIFIED.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** count-the-rules; bad key
- **Speech ≠ behavior:** “10× cheaper” is a title, not a measured invoice vs all four stores.

### No lifecycle + Google-holds-the-bytes
- **Claim:** Re-upload = duplicate. Messy scan = messy answers. Anything you index is on Google (PII/HIPAA talk).
- **Reasoning:** Managed RAG outsources the pipeline *and* the residency.
- **Mechanism:** He names the gap; does not build delete/update.
- **Evidence:** Spoken considerations, not a failed update demo.
- **Conditions:** “as of right now” free storage.
- **Exceptions:** none that make hive upload client PII.
- **Action:** Steal lifecycle warning. Operate-never: prod PII to Gemini; Skool JSON.
- **Confidence:** high as policy.
- **Source:** `irg-2IfAjpo` @ UNKNOWN
- **Epistemic:** SOURCE
- **Knowledge type:** declared
- **Modality:** speech
- **Evidence status:** transcript-implied
- **Shown / clicked / sequenced:** UNKNOWN
- **Failed / retried:** none shown
- **Speech ≠ behavior:** none.

## C. Mental Models
Managed RAG is four HTTP and a temp file. Query-auth > paste-key. Grounding metadata is there — make the agent speak it. Cheap ≠ whole-doc. Dedupe is your job. Residency is Google’s.

## D. Procedures
1. Create store; pin `name`; query-auth the key.
2. Upload binary; note expiry.
3. Import: store name in path; file name in body.
4. Agent tool = generateContent + `$fromAI` + cite + no-punct query.
5. Ctrl+F / read grounding chunks before you trust.
6. Don’t ask whole-doc counts; use full-context instead (`kOKavHnlPik`).
7. Don’t re-upload blindly; don’t send PII.
8. Hive: no Gemini/Pinecone; no Skool.

## E. Examples
- **Situation:** Broken club. **Action:** query store. **Outcome:** rule 4 + source. **Lesson:** one-doc needle works.
- **Situation:** Nvidia Q1. **Action:** second import. **Outcome:** $26B / $22B matches PDF. **Lesson:** check the doc.
- **Situation:** How many rules? **Action:** chunk search. **Outcome:** 5 vs 28. **Lesson:** not a whole-doc tool.
- **Situation:** Eval. **Action:** wrong key then 10 Qs. **Outcome:** 8 fails then 4.2/5. **Lesson:** auth first; n=10.

## F. Decision Rules
- IF you need a count/summary of the *whole* file → not this API.
- IF you re-upload → you are probably duplicating.
- IF the file has PII → don’t.
- IF `?` is in the URL → query param / query-auth.
- IF the store name is *before* `?` → it’s in the path.
- Refuse: $0.15/10×/4.2 as FACT; Gemini spend; flatten other RAG rows; new ICP.

## G. Contrarian
“Leveled up / 10×” is a price-card story plus a 4.2 on n=10. He still tells you to join Plus for the real build. Pinecone hourly omitted from the table then used as a scare. Google docs are bad so you need *his* JSON.

## H. Assumptions
$0.15, 95k tokens, $12/$35, 4.2/5, $26B Nvidia = **UNVERIFIED**.
**Desk dissent:** Gemini file-search row. Keep Assistant/Drive/Responses/chooser unflattened.

## I. Questions
- Same recording family as `KVFfApQZhE4`?
- Delete/update API — exists and unused?
- Generate model locked to 2.5 Flash?

## J. Connections
- **SYSTEM SYNTHESIS:** `KVFfApQZhE4` · `QojPKL96Dx4` · `kOKavHnlPik` · `lcNN3X9gXls` · `X80ljdCPM_U`. Skills: `info-gain-cite` · `golden-test-loop` · `wiki-ingest`.

## K. Future-Use
Four-HTTP file search. Expire-before-import. Path vs query-param. No-punct `$fromAI`. Grounding metadata. Chunk≠count. No-dedupe. Google residency.

## Stolen machines

### Machine: managed-filesearch-four-http
- **Epistemic:** SOURCE
- **Workflow / loop:** create store → upload (watch expiry) → import by path-name → query via generateContent + `$fromAI` (no punct) → read grounding → never use for whole-doc counts → never re-upload as “update”
- **Questions / signals:** Is the file still temp? Is the name in the path? Did I ask a count? Is this PII?
- **Qualify / frame / objections:** Cheap ≠ best. Other RAG rows stay. n=10.
- **Procedure:** D.
- **Example that proves it:** Golf rule 4; rules-count 5; key-fail then 4.2.
- **Why it works:** They hide embed; you still own lifecycle, residency, and the chooser.
- **Conditions / exceptions:** $ UNVERIFIED. Hive: no Gemini.
- **Operate-never payload:** Gemini/PII upload; quote 10× as FACT; Skool JSON; new ICP.
- **Hive run (existing skills only):** `info-gain-cite` · `golden-test-loop` · `wiki-ingest`
- **Source:** `irg-2IfAjpo` @ UNKNOWN

**Operate-never**
- Upload hive/client files to Gemini. Quote tape $ as FACT. New `icp_id`. Send / pay / deploy.

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
