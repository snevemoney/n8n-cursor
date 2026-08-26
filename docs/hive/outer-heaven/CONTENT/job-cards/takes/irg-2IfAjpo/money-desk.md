# Money Desk — irg-2IfAjpo
Status: filled
Protocol: deep-video-learning
**Source:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/full.txt`
**Packet LEARNED:** `docs/hive/outer-heaven/CONTENT/watch-later/packets/irg-2IfAjpo/LEARNED.md`
**ICP:** parked unless Evens named one.

## A. Source Map
~4696 words. Nate: Gemini File Search as managed RAG in n8n — drop a file, skip the chunk/embed/store pipeline. Caption-only; timestamp UNKNOWN. Beats in order: pitch — upload → Gemini chunks+embeds → n8n agent queries the store; vs Pinecone/Supabase you skip file-type/metadata/split/embed/write. Pricing card: index $0.15 / 1M tokens; 121-page PDF ≈ 95k tokens (‘not a tenth of 15¢’); storage free ‘as of right now’; query ≈ chat-model $ plus a high-volume base. His table (100GB + 1M queries/mo): Gemini store $0, index ~$12 once, first-month query ~$35 UNVERIFIED. Supabase cheaper-ish but you own setup. Pinecone Assistant / OpenAI Vector Store charge storage+index+query; Pinecone Assistant also $0.05/hr running (not in his table). Four HTTP hops: (1) create store (‘folder’), (2) upload file to Google (temp, has expiry), (3) import/move into the store, (4) generateContent query. Docs are ‘not my favorite’; Mark Kashef tip: view-as-markdown → paste to an LLM. Create: POST, `?key=` is a query param → generic query auth named ‘Google demo 1119’ so you don’t paste the key every node; body displayName `YouTube-test`; pin the returned store name. Upload: form trigger drops ‘rules of golf’ ~22p PDF as n8n binary; POST …/files; body = binary field name `file`; success = name/mime/size/URI/state + expiration. Import: store name lives in the URL path (not after `?`); JSON body = uploaded file name. Query tool: Gemini 2.5 Flash generateContent; store name in body; `$fromAI` query = user’s question; system: helpful RAG, cite, **query text only — no punctuation/newlines** so JSON doesn’t break. Demo: ‘club breaks during the round’ → continue/repair/replace if normal play, else sit it; source rule 4. Second file: Nvidia PR via same form; Q1 FY25 summary $26B / DC $22B — he checks the April 28 2024 release. Tool out: candidates[].text + groundingMetadata chunks + which folder + groundingSupports spans. Eval: three PDFs (golf 22p, Nvidia 9p, Apple 10-K 121p) ~200 pages, 10 Qs, almost no prompt. First run 8 errors (wrong API key). Second: **4.2/5** (5/5/4/5 and one 2). Considerations: not magic — re-upload = **duplicates** (Google doesn’t dedupe/update/delete for you) → quality dies; GIGO / OCR on messy scans, preprocess; chunk retrieve ≠ whole-doc (community: ‘how many total rules?’ → **5**, because it never saw the book; last rule 28 it can hit); **PII/HIPAA/GDPR/CCPA** — files live on Google. Close: School JSON; Plus 200, Agent Zero, 10h/10s, One-person agency, Subs to sales, weekly Q&A — UNVERIFIED.

## B. Atomic Knowledge
### Managed-RAG-is-four-hops-not-a-pipeline
- **Claim:** Create store → upload (temp, expires) → import into store → generateContent. You skip split/embed/write. You do not skip store-name-in-the-path, binary field name, or query-without-punctuation.
- **Reasoning:** Kashef markdown-the-docs because Google’s File Search docs are confusing. Query auth once, reuse.
- **Mechanism:** Pin the store name. Move before expiry. Agent writes the query. Cite + no punctuation in the JSON query.
- **Evidence:** On-tape golf rule 4; Nvidia $26B/$22B; 4.2/5 after a wrong-key 8-error run.
- **Conditions:** A drop-file RAG.
- **Exceptions:** Gemini / n8n / School / Plus are not ours. $0.15/1M, $12, $35, $0.05/hr UNVERIFIED. Auto-send the answer HITL.
- **Action:** Steal four-hops + cite. Do not stand up Gemini File Search as ours.
- **Confidence:** high as a procedure
- **Source:** irg-2IfAjpo @ UNKNOWN
- **Epistemic:** SOURCE
### Chunk-RAG-cannot-count-the-book
- **Claim:** ‘How many total rules?’ → 5. Last-rule-28 it can hit. Needle ≠ whole-doc. Same thesis as `kOKavHnlPik`.
- **Reasoning:** Three uncorrelated PDFs in one store still scored 4.2 on 10 hard Qs — and one 2. Duplicates on re-upload will make that worse.
- **Mechanism:** If the question needs the whole tape, don’t File Search it. Dedup/update yourself. Preprocess garbage.
- **Evidence:** On-tape 5-vs-28; 4.2/5; ~200 pages no special prompt.
- **Conditions:** A book-level question.
- **Exceptions:** Does not authorize Gemini as ours. 4.2 is a 10-row toy.
- **Action:** Steal book-vs-needle. HOLD the store.
- **Confidence:** high
- **Source:** irg-2IfAjpo @ UNKNOWN
- **Epistemic:** SOURCE
### Google-holds-the-PDF
- **Claim:** Upload = Google processes and indexes. PII/HIPAA/GDPR/CCPA are his stop. Storage ‘free for now’ is a vendor line.
- **Reasoning:** Pinecone Assistant $0.05/hr and OpenAI store $ are the compare, not a reason to send PHI.
- **Mechanism:** Don’t drop client/PII docs. Tape $ UNVERIFIED.
- **Evidence:** On-tape golf + Nvidia + Apple 10-K (public).
- **Conditions:** Any file that isn’t already public.
- **Exceptions:** HIPAA/health ICP parked. Gemini not ours.
- **Action:** Steal don’t-upload-PII. Do not analog $35.
- **Confidence:** high as a never
- **Source:** irg-2IfAjpo @ UNKNOWN
- **Epistemic:** SOURCE


## C. Mental Models
Belief: cheap managed RAG is justified by speed, not magic. Priority: four hops, cite, no-dup, no-PII, book-vs-needle. Experience: golf+Nvidia+10-K eval 4.2. Contrarian: ‘how many rules’ fails. Uncertainty: storage stays free; 10-row 4.2; 200 members.

## D. Procedures
His order: query-auth → create+pin store → binary upload → import by path name → fromAI query (no punct) → cite → eval. Our order: do not stand up. Steal four-hops, book-vs-needle, no-PII. Caption-only: clicks UNKNOWN.

## E. Examples
**Situation:** Club breaks. **Action:** query File Search. **Reasoning:** one 22p PDF. **Outcome:** rule 4, usable/repair/replace if normal play. **Lesson:** Needle works.

**Situation:** How many rules? **Action:** same store. **Reasoning:** book question. **Outcome:** 5 (wrong). **Lesson:** Chunks can’t count the book.

**Situation:** 10 Qs, wrong key then right. **Action:** eval. **Reasoning:** three uncorrelated PDFs. **Outcome:** 8 errors then 4.2/5. **Lesson:** Key first; 10 rows aren’t a crown.

## F. Decision Rules
IF book/summary/count → not File Search. IF re-upload → you must delete the old. IF PII/HIPAA → don’t. IF $0.15 / $12 / $35 / 4.2 / 200 → UNVERIFIED. Refuse: Gemini/n8n/Plus as ours; auto-send; health ICP.

## G. Contrarian
Rejects ‘drop file = magic RAG.’ Rejects whole-doc questions on chunks. Rejects treating free storage as forever.

## H. Assumptions
10-row eval. Public PDFs. $ table is a slide. Survivorship: he already knew include-highlights from `QojPKL96Dx4`. Falsifier: Google starts charging store or dedupes. Speech≠behavior: free JSON then Plus.

## I. Questions
What’s live File Search $ now? Did anyone verify the 5-vs-28 fail independently? Any checkout we can open from this RAG?

## J. Connections
SYSTEM SYNTHESIS: managed vs DIY = `QojPKL96Dx4`. Book-vs-needle = `kOKavHnlPik`. No-PII = `oWdJMJp2HgM` sanitize. fromAI query = same. Gemini/n8n/Plus operate-never.

## K. Future-Use
Unassigned: temp-upload-expires-if-not-imported. Query-no-punctuation as a JSON-body law.

## Steal / Operate-never

### Machine: Four-hops-cite-the-span-dont-ask-the-book
- **Epistemic:** SOURCE
- **Workflow / loop:** trigger: a PDF question → action: if needle, managed store + cite; if book/count, other retrieve → checkable stop: a span you can open, not a count the chunks invented
- **Questions / signals:** Needle or book? Did we import before expiry? Is this PII? Did we dedupe?
- **Qualify / frame / objections:** Frame: cheap managed RAG, not magic. Objection: ‘how many rules’ — it said 5.
- **Procedure:** Do not stand up Gemini. Do not upload PII. HITL send. Tape $ UNVERIFIED.
- **Example that proves it:** Rule 4 hit; total-rules=5 miss; 4.2/5 after wrong key. UNVERIFIED $.
- **Why it works:** Chunks find a needle. They cannot see the book. Google keeps the file.
- **Conditions / exceptions:** Works as a filter. Exception: Gemini / n8n / Plus / $0.15 / 4.2 as FACT / PII upload operate-never.
- **Operate-never payload:** Gemini File Search as ours · n8n template · Plus · PII upload · $35 as analog
- **Hive run (existing skills only):** `golden-test-loop` · `playbook-before-send` · `ask-principal` · `pricing-margin-roi-guardrails`
- **Source:** irg-2IfAjpo @ UNKNOWN


### Operate-never (this desk will not operate)
- Quote $0.15/1M / $12 / $35 / $0.05/hr / 4.2 / 200 members as FACT or as our analog.
- Gemini File Search / n8n as ours. Upload PII. Auto-send the RAG answer.

- Move money, approve a charge, refund, or fee. Live Stripe. Auto-send / auto-pay / auto-book / auto-deploy / auto-publish.
- Quote any tape $ / student count / job-loss % / prize / 10x as FACT or as our price analog.
- Nate Skool / Plus / AIS Plus / Hostinger NATEHERK / Uppit / Glaido / sold templates as a SKU. Do not map through `usecase-to-sku`. Do not join / install / import.
- Install Claude Code / Codex / Claude / ChatGPT / Gemini / Coda / Vapi / ElevenLabs / n8n-cloud / Trigger.dev / Hermes / Base44 / Sora / NanoBanana / Poppy / Lovable as ours. Cursor + Grok only. Vendor on tape is a mention, not a Bot dispatch.
- New hunt ICP. Unpark a client. Live hunt stays `local-pro` / Normand. Clients parked. No new `icp_id`.
- Grok Bot / `sendPrompt`. Send / pay / deploy / book / publish.
- Merge `LESSONS-FROM-TAPE.md`. Overwrite `takes/money-desk.md`.

## L. Role-Specific Applications
HOLD Gemini File Search and the n8n template. Steal four-hops, book-vs-needle, no-PII. Send stays HITL. Early rung $500–1K/mo CAD.

**Lens only (after A–K + Steal).** This desk votes PASS/HOLD on margin. It does not move money.

- `pricing-margin-roi-guardrails`: tape $ stays **UNVERIFIED**. Our early rung stays **$500–1K/mo CAD** after a 30–60d win. Delivery ≤40% of fee. Vendor / educator $ does not move Normand Path A.
- `outcome-offer-funnel` + `checkout-proof`: count checkout + warm conversions we can open. Quarantine YouTube receipts.
- `paid-slice-funnel`: thin V1; Stripe HITL; preview ≠ domain.
- `ask-principal` + `input-required-gate`: confirm ≠ execute. Pay / refund / fee stay HITL.
- `website-offer-funnel`: Path A/B/C spine still exists; this tape does not open a client unless Evens names one.
- Proposed, not written: `unit-econ-card` (price, COGS, contribution, aha-gate — tape $ never fills the line) · `token-receipt` (session cost versus artifact; leftover quota is not a KPI).

**Business parked:** no new `icp_id`. No `business-lanes.json` row. Hunt stays `local-pro` / Normand.
